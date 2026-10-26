import {
  Fragment,
  type KeyboardEvent,
  Suspense,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import {
  type AdapterMessage,
  type AdapterOutcome,
  type AdapterProblem,
  type AdapterReaction,
  type AdapterRoom,
  type Capabilities,
  deleteMessage,
  editMessage,
  fetchCapabilities,
  fetchMessages,
  fetchRooms,
  markRead,
  roomFeature,
  sendMessage,
  setReactions,
  streamAdapter,
  type UploadFeature,
  uploadFile,
} from "../../transport/adapters";
import {
  ATTACH_COPY,
  AttachButton,
  pasteImage,
  pickable,
  StagedFile,
} from "../attach";
import { ImeEnterGuard } from "../composer/state";
import { discordPlace } from "../inbox/discordPlaces";
import { DAY_FORMAT, dayOf } from "../thread/grouping";
import { problemSentence } from "./copy";
import { actionMember, groupMessages } from "./group";
import { adapterConnections, subscribeAdapterRooms } from "./liveRooms";
import { noteRead, rememberedRoom, rememberRooms } from "./rooms";
import styles from "./Thread.module.css";
import {
  gist,
  type MessageAbilities,
  type ToolAction,
  Turn,
  toggledReactions,
} from "./turn";

const COPY = {
  checking: "어댑터를 확인하는 중입니다.",
  loading: "메시지를 불러오는 중입니다.",
  empty: "이 방에서 읽을 수 있는 메시지가 없습니다.",
  noRead: "이 어댑터는 아직 메시지 읽기를 제공하지 않습니다.",
  earlier: "이전 메시지 더 보기",
  loadingEarlier: "불러오는 중",
  placeholder: "메시지 입력",
  send: "보내기",
  sending: "보내는 중",
  input: "보낼 메시지",
  save: "수정",
  saving: "수정하는 중",
  editInput: "고칠 메시지",
  tooLong: (max: number) =>
    `${max.toLocaleString("ko-KR")}자를 넘어 보낼 수 없습니다.`,
  uncertain:
    "보냈는지 알 수 없습니다. 대화에 나타나는지 확인한 뒤 필요하면 다시 보내세요.",
  uncertainEdit:
    "수정됐는지 알 수 없습니다. 대화에서 확인한 뒤 필요하면 다시 수정하세요.",
  uncertainDelete: "삭제됐는지 알 수 없습니다. 대화에서 확인하세요.",
  uncertainFile:
    "파일을 보냈는지 알 수 없습니다. 대화에 나타나는지 확인한 뒤 필요하면 다시 보내세요.",
  withCaption: "입력한 글을 설명으로 함께 보냅니다.",
  captionTooLong: (max: number) =>
    `설명으로 보낼 글은 ${max.toLocaleString("ko-KR")}자까지입니다. 글을 줄이거나 따로 보내세요.`,
  uncertainReact: "반응이 남았는지 알 수 없습니다. 대화에서 확인하세요.",
  replyingTo: (name: string) => `${name}에게 답장`,
  editing: "메시지 수정",
  cancelMode: "취소",
  noSend: "이 어댑터는 메시지 보내기를 제공하지 않습니다.",
  noSendHere: "이 방에는 이 계정으로 보낼 수 없습니다.",
  reconnecting: "실시간 연결이 끊겨 다시 잇는 중입니다.",
} as const;

type Features = Capabilities["features"];

type Mode =
  | { kind: "send" }
  | { kind: "reply"; message: AdapterMessage }
  | { kind: "edit"; message: AdapterMessage };

function withNewer(
  current: AdapterMessage[],
  newer: AdapterMessage[],
): AdapterMessage[] {
  const known = new Set(current.map((message) => message.id));
  const fresh = newer.filter((message) => !known.has(message.id));
  return fresh.length ? [...current, ...fresh] : current;
}

function withOlder(
  older: AdapterMessage[],
  current: AdapterMessage[],
): AdapterMessage[] {
  const known = new Set(current.map((message) => message.id));
  return [...older.filter((message) => !known.has(message.id)), ...current];
}

function withEdited(
  current: AdapterMessage[],
  message: AdapterMessage,
): AdapterMessage[] {
  return current.map((held) => (held.id === message.id ? message : held));
}

function without(current: AdapterMessage[], ids: string[]): AdapterMessage[] {
  const gone = new Set(ids);
  return current.filter((message) => !gone.has(message.id));
}

function withReactions(
  current: AdapterMessage[],
  id: string,
  reactions: AdapterReaction[],
): AdapterMessage[] {
  return current.map((message) => {
    if (message.id !== id) return message;
    const { reactions: _held, ...rest } = message;
    return reactions.length ? { ...rest, reactions } : rest;
  });
}

/** The reconnect backoff: waits `ms`, or less when the view goes away. */
function pause(ms: number, signal: AbortSignal) {
  return new Promise<void>((resolve) => {
    const timer = setTimeout(resolve, ms);
    signal.addEventListener(
      "abort",
      () => {
        clearTimeout(timer);
        resolve();
      },
      { once: true },
    );
  });
}

function Composer({
  adapterId,
  roomId,
  sendLimit,
  editLimit,
  upload,
  mode,
  onCancelMode,
  onStored,
  onEdited,
}: {
  adapterId: string;
  roomId: string;
  sendLimit: number;
  editLimit: number | undefined;
  /** `attachments.send` as this room allows it; absent, no file control is drawn. */
  upload: UploadFeature | undefined;
  mode: Mode;
  onCancelMode: () => void;
  onStored: (message: AdapterMessage) => void;
  onEdited: (message: AdapterMessage) => void;
}) {
  // The unsent draft survives an edit: editing works on its own copy.
  const [draft, setDraft] = useState("");
  const [revision, setRevision] = useState("");
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [staged, setStaged] = useState<File | null>(null);
  const [fileBusy, setFileBusy] = useState(false);
  const field = useRef<HTMLTextAreaElement>(null);
  const ime = useRef(new ImeEnterGuard()).current;
  const editing = mode.kind === "edit";
  // Where the adapter takes a caption, the words in the box go with the file.
  const caption =
    upload?.caption && !editing && draft.trim() ? draft : undefined;
  const captionLimit = upload?.captionMaxLength ?? 0;
  const captionOver =
    caption !== undefined && [...caption].length > captionLimit;
  // Only the media types the adapter sends: a picker, and a guard that keeps a
  // file it would refuse out of the box in the first place.
  const picks = pickable(upload?.types);
  const onPick = (file: File) => {
    if (!picks.accepts(file)) {
      setNote(ATTACH_COPY.wrongType);
      return;
    }
    setStaged(file);
    setNote(null);
  };

  useEffect(() => {
    if (mode.kind === "edit") setRevision(mode.message.text);
    setNote(null);
    if (mode.kind !== "send") field.current?.focus();
  }, [mode]);

  const text = editing ? revision : draft;
  const limit = editing ? (editLimit ?? sendLimit) : sendLimit;
  const over = [...text].length > limit;
  const unchanged = mode.kind === "edit" && text === mode.message.text;
  const blocked = busy || over || !text.trim() || unchanged;

  async function submit() {
    if (blocked) return;
    setBusy(true);
    setNote(null);
    const signal = new AbortController().signal;
    if (mode.kind === "edit") {
      let result: Awaited<ReturnType<typeof editMessage>>;
      try {
        result = await editMessage(
          adapterId,
          { roomId, messageId: mode.message.id, text },
          signal,
        );
      } catch {
        result = { kind: "unreachable" };
      }
      setBusy(false);
      if (result.kind === "ok") {
        onEdited(result.data.message);
        onCancelMode();
        return;
      }
      setNote(
        result.kind === "refused"
          ? problemSentence(result, "message")
          : COPY.uncertainEdit,
      );
      return;
    }
    const replyTo = mode.kind === "reply" ? mode.message.id : undefined;
    let result: Awaited<ReturnType<typeof sendMessage>>;
    try {
      result = await sendMessage(
        adapterId,
        { roomId, text, ...(replyTo === undefined ? {} : { replyTo }) },
        signal,
      );
    } catch {
      result = { kind: "unreachable" };
    }
    setBusy(false);
    if (result.kind === "ok") {
      setDraft("");
      onStored(result.data.message);
      if (replyTo !== undefined) onCancelMode();
      return;
    }
    // Refused means nothing was sent; anything else leaves the outcome unknown.
    setNote(
      result.kind === "refused" ? problemSentence(result) : COPY.uncertain,
    );
  }

  // One file, one attempt: a refusal keeps it to try again by hand, anything
  // else puts it down and says the outcome is unknown.
  async function sendFile() {
    const file = staged;
    if (
      !file ||
      !upload ||
      fileBusy ||
      file.size === 0 ||
      file.size > upload.maxBytes ||
      captionOver
    )
      return;
    setFileBusy(true);
    setNote(null);
    const replyTo = mode.kind === "reply" ? mode.message.id : undefined;
    let result: Awaited<ReturnType<typeof uploadFile>>;
    try {
      result = await uploadFile(
        adapterId,
        {
          roomId,
          file,
          ...(caption === undefined ? {} : { caption }),
          ...(replyTo === undefined ? {} : { replyTo }),
        },
        new AbortController().signal,
      );
    } catch {
      result = { kind: "unreachable" };
    }
    setFileBusy(false);
    if (result.kind === "ok") {
      setStaged(null);
      if (caption !== undefined) setDraft("");
      onStored(result.data.message);
      if (replyTo !== undefined) onCancelMode();
      return;
    }
    if (result.kind === "refused") {
      setNote(problemSentence(result));
      return;
    }
    setStaged(null);
    setNote(COPY.uncertainFile);
  }

  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Escape" && mode.kind !== "send") {
      event.preventDefault();
      onCancelMode();
    } else if (ime.decide(event.nativeEvent) === "send") {
      event.preventDefault();
      void submit();
    }
  }

  return (
    <div
      className={styles.composer}
      data-ui="adapter-composer"
      data-mode={mode.kind}
    >
      {mode.kind !== "send" ? (
        <div className={styles.mode} data-ui="adapter-composer-mode">
          <span className={styles.modeLabel}>
            {mode.kind === "edit"
              ? COPY.editing
              : COPY.replyingTo(mode.message.sender)}
          </span>
          {mode.kind === "reply" ? (
            <span className={styles.modeText}>{gist(mode.message)}</span>
          ) : null}
          <button
            type="button"
            className={styles.modeCancel}
            onClick={onCancelMode}
            data-ui="adapter-composer-cancel"
          >
            {COPY.cancelMode}
          </button>
        </div>
      ) : null}
      {staged && upload && !editing ? (
        <Suspense fallback={null}>
          <StagedFile
            file={staged}
            maxBytes={upload.maxBytes}
            busy={fileBusy}
            blocked={captionOver}
            onSend={() => void sendFile()}
            onCancel={() => {
              setStaged(null);
              setNote(null);
            }}
          >
            {caption === undefined
              ? null
              : captionOver
                ? COPY.captionTooLong(captionLimit)
                : COPY.withCaption}
          </StagedFile>
        </Suspense>
      ) : null}
      <div className={styles.box}>
        {upload && !editing ? (
          <>
            {picks.imagesOnly || picks.accept === undefined ? (
              <AttachButton
                photo
                disabled={fileBusy}
                accept={picks.accept}
                onPick={onPick}
              />
            ) : null}
            {picks.imagesOnly ? null : (
              <AttachButton
                disabled={fileBusy}
                accept={picks.accept}
                onPick={onPick}
              />
            )}
          </>
        ) : null}
        <textarea
          ref={field}
          className={styles.field}
          aria-label={editing ? COPY.editInput : COPY.input}
          placeholder={COPY.placeholder}
          rows={1}
          value={text}
          onChange={(event) =>
            editing
              ? setRevision(event.currentTarget.value)
              : setDraft(event.currentTarget.value)
          }
          onKeyDown={onKeyDown}
          onPaste={
            upload && !editing && !fileBusy
              ? (event) => pasteImage(event, onPick)
              : undefined
          }
          onCompositionStart={() => ime.start()}
          onCompositionEnd={() => ime.end()}
        />
        <button
          type="button"
          className={styles.send}
          disabled={blocked}
          onClick={() => void submit()}
          data-ui="adapter-send"
        >
          {busy
            ? editing
              ? COPY.saving
              : COPY.sending
            : editing
              ? COPY.save
              : COPY.send}
        </button>
      </div>
      {over ? (
        <p className={styles.note} role="status">
          {COPY.tooLong(limit)}
        </p>
      ) : note ? (
        <p className={styles.note} role="status">
          {note}
        </p>
      ) : null}
    </div>
  );
}

/** One room's messages, the way back in time, live changes, the tools and the composer. */
export function AdapterThread({
  adapterId,
  roomId,
  room,
  features,
}: {
  adapterId: string;
  roomId: string;
  /** The room as the list described it, once known; it may narrow `features`. */
  room: AdapterRoom | undefined;
  features: Features;
}) {
  const read = features["messages.read"];
  const live = features["messages.stream"];
  const send = roomFeature(features, room, "messages.send");
  const files = roomFeature(features, room, "attachments.read") !== undefined;
  const avatars = roomFeature(features, room, "avatars.read") !== undefined;
  const edit = send ? roomFeature(features, room, "messages.edit") : undefined;
  const react = roomFeature(features, room, "reactions.send");
  const abilities: MessageAbilities = {
    reply:
      send !== undefined &&
      roomFeature(features, room, "messages.reply") !== undefined,
    edit,
    delete: roomFeature(features, room, "messages.delete"),
    react:
      react !== undefined &&
      roomFeature(features, room, "reactions.read") !== undefined,
  };
  const readMark = roomFeature(features, room, "read.mark") !== undefined;
  // A room with a place in a Discord server reads the way Discord draws it.
  const layout = room && discordPlace(room) ? "lines" : "bubbles";
  const openedRead = room?.unread === 0;
  const limit = Math.min(50, read?.maxLimit ?? 50);
  const canPage = read?.paging === "before-id";

  const [messages, setMessages] = useState<AdapterMessage[]>([]);
  const [phase, setPhase] = useState<
    { kind: "loading" } | { kind: "ready" } | AdapterProblem
  >({ kind: "loading" });
  const [hasEarlier, setHasEarlier] = useState(false);
  const [earlier, setEarlier] = useState<"idle" | "busy" | string>("idle");
  const [reconnecting, setReconnecting] = useState(false);
  const [menu, setMenu] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>({ kind: "send" });
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [busyId, setBusyId] = useState<string | null>(null);
  const wall = useRef<HTMLDivElement>(null);
  const stick = useRef(true);
  const fromBottom = useRef<number | null>(null);
  const newest = useRef<string | null>(null);
  const marked = useRef<string | null>(null);
  const markNewest = useRef<() => void>(() => {});

  useEffect(() => {
    newest.current = messages.at(-1)?.id ?? newest.current;
  }, [messages]);

  useEffect(() => {
    const controller = new AbortController();
    fetchMessages(adapterId, { roomId, limit }, controller.signal).then(
      (result) => {
        if (result.kind !== "ok") {
          setPhase(result);
          return;
        }
        setMessages(result.data.messages);
        setHasEarlier(result.data.hasEarlier);
        setPhase({ kind: "ready" });
      },
      () => {
        // Only an abort rejects.
      },
    );
    return () => controller.abort();
  }, [adapterId, roomId, limit]);

  const ready = phase.kind === "ready";
  const resumable = live?.resume === "cursor";
  const streaming = live !== undefined;
  useEffect(() => {
    if (!ready || !streaming) return;
    const controller = new AbortController();
    const { signal } = controller;
    const forget = (ids: string[]) => {
      setMenu((open) => (open !== null && ids.includes(open) ? null : open));
      setMode((current) =>
        current.kind !== "send" && ids.includes(current.message.id)
          ? { kind: "send" }
          : current,
      );
    };
    void (async () => {
      let failures = 0;
      while (!signal.aborted) {
        const since =
          resumable && newest.current ? { [roomId]: newest.current } : {};
        const end = await streamAdapter(adapterId, {
          since,
          signal,
          onEvent(event) {
            if (event.type === "ready") {
              failures = 0;
              setReconnecting(false);
            } else if (
              event.type === "message" &&
              event.data.message.roomId === roomId
            ) {
              setMessages((current) =>
                withNewer(current, [event.data.message]),
              );
            } else if (
              event.type === "message.edited" &&
              event.data.message.roomId === roomId
            ) {
              setMessages((current) => withEdited(current, event.data.message));
            } else if (
              event.type === "message.deleted" &&
              event.data.roomId === roomId
            ) {
              setMessages((current) => without(current, event.data.messageIds));
              forget(event.data.messageIds);
            } else if (
              event.type === "reactions.updated" &&
              event.data.roomId === roomId
            ) {
              setMessages((current) =>
                withReactions(
                  current,
                  event.data.messageId,
                  event.data.reactions,
                ),
              );
            }
          },
        });
        if (end.kind === "aborted" || signal.aborted) return;
        if (
          (end.kind === "error" || end.kind === "refused") &&
          end.code === "NOT_FOUND" &&
          newest.current
        ) {
          // The cursor's message is gone, so the adapter refuses to resume from
          // it. Refill the newest window and resume from a message that exists.
          const refill = await fetchMessages(
            adapterId,
            { roomId, limit },
            signal,
          ).catch(() => null);
          if (signal.aborted) return;
          if (refill?.kind === "ok") {
            newest.current = refill.data.messages.at(-1)?.id ?? null;
            setMessages((current) => withNewer(current, refill.data.messages));
          } else newest.current = null;
        }
        failures += 1;
        setReconnecting(true);
        await pause(
          Math.min(30_000, 1000 * 2 ** Math.min(failures, 5)),
          signal,
        );
      }
    })();
    return () => controller.abort();
  }, [ready, streaming, resumable, adapterId, roomId, limit]);

  // Read marks follow what a person can see: the newest message, from someone
  // else, with the wall at its foot and the page in front.
  useEffect(() => {
    if (!readMark || !ready) {
      markNewest.current = () => {};
      return;
    }
    const last = messages.at(-1);
    // A room the list already showed as read needs no mark until something new arrives.
    if (openedRead && marked.current === null && last) marked.current = last.id;
    markNewest.current = () => {
      if (
        !last ||
        last.fromMe ||
        last.id === marked.current ||
        !stick.current ||
        document.visibilityState !== "visible"
      )
        return;
      marked.current = last.id;
      markRead(
        adapterId,
        { roomId, messageId: last.id },
        new AbortController().signal,
      ).then(
        (result) => {
          if (result.kind === "ok") noteRead(adapterId, roomId);
        },
        () => {
          // Only an abort rejects.
        },
      );
    };
    markNewest.current();
    const onVisible = () => markNewest.current();
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [readMark, ready, messages, adapterId, roomId, openedRead]);

  useLayoutEffect(() => {
    const element = wall.current;
    if (!element || messages.length === 0) return;
    if (fromBottom.current !== null) {
      element.scrollTop = element.scrollHeight - fromBottom.current;
      fromBottom.current = null;
    } else if (stick.current) {
      element.scrollTop = element.scrollHeight;
    }
  }, [messages]);

  async function loadEarlier() {
    const first = messages[0];
    if (!first || earlier === "busy") return;
    setEarlier("busy");
    let result: Awaited<ReturnType<typeof fetchMessages>>;
    try {
      result = await fetchMessages(
        adapterId,
        { roomId, limit, before: first.id },
        new AbortController().signal,
      );
    } catch {
      result = { kind: "unreachable" };
    }
    if (result.kind !== "ok") {
      setEarlier(problemSentence(result));
      return;
    }
    const older = result.data.messages;
    const element = wall.current;
    if (element) fromBottom.current = element.scrollHeight - element.scrollTop;
    setMessages((current) => withOlder(older, current));
    setHasEarlier(result.data.hasEarlier);
    setEarlier("idle");
  }

  function say(id: string, text: string | null) {
    setNotes((current) => {
      const next = { ...current };
      if (text === null) delete next[id];
      else next[id] = text;
      return next;
    });
  }

  // Each write is one attempt: a refusal says why, anything else says the
  // outcome is unknown, and nothing is retried on the person's behalf.
  async function act(message: AdapterMessage, action: ToolAction) {
    say(message.id, null);
    if (action.kind === "reply" || action.kind === "edit") {
      setMode({ kind: action.kind, message });
      setMenu(null);
      return;
    }
    setBusyId(message.id);
    const signal = new AbortController().signal;
    if (action.kind === "delete") {
      let result: Awaited<ReturnType<typeof deleteMessage>>;
      try {
        result = await deleteMessage(
          adapterId,
          { roomId, messageId: message.id },
          signal,
        );
      } catch {
        result = { kind: "unreachable" };
      }
      setBusyId(null);
      if (result.kind === "ok") {
        setMessages((current) => without(current, [message.id]));
        setMenu(null);
        setMode((current) =>
          current.kind !== "send" && current.message.id === message.id
            ? { kind: "send" }
            : current,
        );
        return;
      }
      say(
        message.id,
        result.kind === "refused"
          ? problemSentence(result, "message")
          : COPY.uncertainDelete,
      );
      return;
    }
    const emojis = toggledReactions(
      message.reactions,
      action.emoji,
      react?.maxPerMessage,
    );
    let result: Awaited<ReturnType<typeof setReactions>>;
    try {
      result = await setReactions(
        adapterId,
        { roomId, messageId: message.id, emojis },
        signal,
      );
    } catch {
      result = { kind: "unreachable" };
    }
    setBusyId(null);
    if (result.kind === "ok") {
      const { reactions } = result.data;
      setMessages((current) => withReactions(current, message.id, reactions));
      setMenu(null);
      return;
    }
    say(
      message.id,
      result.kind === "refused"
        ? problemSentence(result, "message")
        : COPY.uncertainReact,
    );
  }

  const byId = new Map(messages.map((message) => [message.id, message]));
  const groups = groupMessages(messages);
  const now = new Date();
  return (
    <div className={styles.thread} data-ui="adapter-thread">
      <div
        className={styles.wall}
        ref={wall}
        onScroll={(event) => {
          const element = event.currentTarget;
          stick.current =
            element.scrollHeight - element.scrollTop - element.clientHeight <
            80;
          if (stick.current) markNewest.current();
        }}
      >
        {phase.kind === "loading" ? (
          <p className={styles.status}>
            <span data-ui="theme-loader" aria-hidden="true" />
            {COPY.loading}
          </p>
        ) : phase.kind !== "ready" ? (
          <p className={styles.status}>{problemSentence(phase)}</p>
        ) : (
          <>
            {canPage && hasEarlier ? (
              <button
                type="button"
                className={styles.earlier}
                onClick={() => void loadEarlier()}
                disabled={earlier === "busy"}
              >
                {earlier === "busy" ? (
                  <>
                    <span data-ui="theme-loader" aria-hidden="true" />
                    {COPY.loadingEarlier}
                  </>
                ) : (
                  COPY.earlier
                )}
              </button>
            ) : null}
            {earlier !== "idle" && earlier !== "busy" ? (
              <p className={styles.status}>{earlier}</p>
            ) : null}
            {messages.length ? (
              <ol className={styles.list}>
                {groups.map((members, index) => {
                  const message = actionMember(members);
                  const first = members[0] ?? message;
                  const day = dayOf(first.sentAt);
                  // A day is announced when it differs from the turn above, as on a KakaoTalk wall.
                  const newDay =
                    day !== null &&
                    day !== dayOf(groups[index - 1]?.at(-1)?.sentAt);
                  return (
                    <Fragment key={message.id}>
                      {newDay ? (
                        <li className={styles.day} data-ui="adapter-day">
                          <span>
                            <time dateTime={first.sentAt}>
                              {DAY_FORMAT.format(new Date(first.sentAt))}
                            </time>
                          </span>
                        </li>
                      ) : null}
                      <Turn
                        adapterId={adapterId}
                        files={files}
                        avatars={avatars}
                        message={message}
                        previous={
                          newDay ? undefined : groups[index - 1]?.at(-1)
                        }
                        next={
                          dayOf(groups[index + 1]?.[0]?.sentAt) ===
                          dayOf(members.at(-1)?.sentAt)
                            ? groups[index + 1]?.[0]
                            : undefined
                        }
                        members={members}
                        layout={layout}
                        controlsFor={(member) => ({
                          open: menu === member.id,
                          note: notes[member.id] ?? null,
                          busy: busyId === member.id,
                          onOpen: (open) => setMenu(open ? member.id : null),
                          onAction: (action) => void act(member, action),
                        })}
                        quoted={
                          message.replyTo === undefined
                            ? undefined
                            : byId.get(message.replyTo)
                        }
                        now={now}
                        abilities={abilities}
                        open={menu === message.id}
                        note={notes[message.id] ?? null}
                        busy={busyId === message.id}
                        onOpen={(open) => setMenu(open ? message.id : null)}
                        onAction={(action) => void act(message, action)}
                      />
                    </Fragment>
                  );
                })}
              </ol>
            ) : (
              <p className={styles.status}>{COPY.empty}</p>
            )}
          </>
        )}
      </div>
      {reconnecting ? (
        <p className={styles.reconnecting} role="status">
          {COPY.reconnecting}
        </p>
      ) : null}
      {send ? (
        <Composer
          adapterId={adapterId}
          roomId={roomId}
          sendLimit={send.maxLength}
          editLimit={edit?.maxLength}
          upload={roomFeature(features, room, "attachments.send")}
          mode={mode}
          onCancelMode={() => setMode({ kind: "send" })}
          onStored={(message) => {
            stick.current = true;
            setMessages((current) => withNewer(current, [message]));
          }}
          onEdited={(message) =>
            setMessages((current) => withEdited(current, message))
          }
        />
      ) : (
        <p className={styles.reconnecting} data-ui="adapter-no-send">
          {features["messages.send"] ? COPY.noSendHere : COPY.noSend}
        </p>
      )}
    </div>
  );
}

/**
 * The room's title (from the list when this tab has it) and the adapter's
 * declaration, read again whenever the adapter's shared stream (re)connects,
 * so a room opened while the adapter was down comes back with it.
 */
export function useAdapterRoom(adapterId: string, roomId: string) {
  const connection = useSyncExternalStore(subscribeAdapterRooms, () =>
    adapterConnections(adapterId),
  );
  const [room, setRoom] = useState<AdapterRoom | undefined>(() =>
    rememberedRoom(adapterId, roomId),
  );
  const [capabilities, setCapabilities] = useState<
    { kind: "checking" } | AdapterOutcome
  >({ kind: "checking" });
  useEffect(() => {
    void connection;
    const controller = new AbortController();
    fetchCapabilities(adapterId, controller.signal).then(
      setCapabilities,
      () => {
        // Only an abort rejects.
      },
    );
    return () => controller.abort();
  }, [adapterId, connection]);
  useEffect(() => {
    void connection;
    const controller = new AbortController();
    const known = rememberedRoom(adapterId, roomId);
    if (known) setRoom(known);
    else
      fetchRooms(adapterId, controller.signal).then(
        (result) => {
          if (result.kind !== "ok") return;
          rememberRooms(adapterId, result.data.rooms);
          setRoom(rememberedRoom(adapterId, roomId));
        },
        () => {
          // Only an abort rejects.
        },
      );
    return () => controller.abort();
  }, [adapterId, roomId, connection]);
  return { room, capabilities };
}

export function AdapterRoomBody({
  adapterId,
  roomId,
  room,
  capabilities,
}: {
  adapterId: string;
  roomId: string;
  room: AdapterRoom | undefined;
  capabilities: { kind: "checking" } | AdapterOutcome;
}) {
  if (capabilities.kind === "checking")
    return <p className={styles.status}>{COPY.checking}</p>;
  if (capabilities.kind !== "connected")
    return <p className={styles.status}>{problemSentence(capabilities)}</p>;
  const { features } = capabilities.capabilities;
  if (!features["messages.read"])
    return <p className={styles.status}>{COPY.noRead}</p>;
  return (
    <AdapterThread
      key={`${adapterId}/${roomId}`}
      adapterId={adapterId}
      roomId={roomId}
      room={room}
      features={features}
    />
  );
}
