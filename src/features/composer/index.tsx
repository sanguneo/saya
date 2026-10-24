import {
  type FormEvent,
  type KeyboardEvent,
  memo,
  Suspense,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import type { components } from "../../contract/decoded";
import { type HttpClient, HttpProtocolError } from "../../transport/http";
import { AttachButton, StagedFile } from "../attach";
import { useCoreUploadLimit } from "../attach/core";
import styles from "./Composer.module.css";
import { takeDraftOffers, withOffer } from "./offer";
import { ComposerState, type ConsentFingerprint, ImeEnterGuard } from "./state";

type SendResult = components["schemas"]["SendResult"];
type Confirmation = Readonly<{
  fingerprint: ConsentFingerprint;
  room: string;
  wouldClearDraft: boolean;
}>;
type Status =
  | Readonly<{ kind: "idle" }>
  | Readonly<{ kind: "previewing" }>
  | Readonly<{ kind: "posting" }>
  | Readonly<{ kind: "error"; message: string }>
  | Readonly<{ kind: "submitted" }>
  | Readonly<{ kind: "fileSubmitted" }>;

const OPEN_ROOM = true;
const COPY = {
  input: "메시지 작성",
  placeholder: "메시지를 입력하세요",
  /** Enter first asks the bridge (dryRun); nothing is sent before the confirmation. */
  hint: "Enter 보내기 · Shift+Enter 줄바꿈",
  send: "보내기",
  empty: "빈 메시지는 보낼 수 없습니다.",
  previewing: "전송 내용을 확인하고 있습니다.",
  confirming: "전송 전 확인",
  resolvedRoom: "보낼 대화",
  conservative:
    "미리보기 결과는 초안을 잠그지 않습니다. 보내기 전에 내용을 다시 확인하세요.",
  clearWarning: "보내면 데스크톱 앱에 쓰고 있던 초안이 지워질 수 있습니다.",
  cancel: "취소",
  confirm: "확인 후 보내기",
  posting: "전송을 요청하고 있습니다.",
  submitted: "입력됨 · 전달 미확인",
  network: "브리지에 연결할 수 없습니다. 전송 여부를 확인하세요.",
  protocol: "브리지 응답을 해석할 수 없습니다. 전송 여부를 확인하세요.",
  refused: (code: string) => `브리지가 전송을 거절했습니다: ${code}`,
  /** The desktop client's file confirmation closed: it took the file, nothing more is known. */
  fileSubmitted: "파일 입력됨 · 전달 미확인",
  fileRefused: (code: string) =>
    `브리지가 파일 전송을 거절했습니다: ${code}. 보낸 것은 없습니다.`,
  fileUncertain:
    "파일을 보냈는지 알 수 없습니다. 대화에 나타나는지 확인한 뒤 필요하면 다시 보내세요.",
} as const;

/**
 * `SEND_FAILED` is the one code a file send answers both before the client's
 * confirmation (nothing sent) and after it (outcome unknown), so it is read as
 * unknown; every other refusal changed nothing.
 */
const UNCERTAIN_UPLOAD = new Set(["SEND_FAILED"]);

function requestFingerprint(
  roomId: string,
  state: ComposerState,
): ConsentFingerprint {
  const draft = state.getDraft(roomId);
  return {
    roomId,
    text: draft.text,
    openRoom: OPEN_ROOM,
    draftRevision: draft.revision,
  };
}

function sendBody(fingerprint: ConsentFingerprint, dryRun: boolean) {
  return {
    room: fingerprint.roomId,
    text: fingerprint.text,
    dryRun,
    openRoom: fingerprint.openRoom,
  };
}

/**
 * A tab-local textarea with a dry-run confirmation. It owns neither pending
 * delivery state nor stream state, so incoming updates cannot clear or remount
 * its draft, composition, or selection.
 */
export const Composer = memo(function Composer({
  http,
  roomId,
  confirmEvery = false,
}: {
  http: HttpClient;
  roomId: string;
  /** Ask before every send, not only one that would clear a desktop draft (문의 모아보기's trial). */
  confirmEvery?: boolean;
}) {
  const state = useRef(new ComposerState()).current;
  const ime = useRef(new ImeEnterGuard()).current;
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const activeRoomId = useRef(roomId);
  const previewAbort = useRef<AbortController | null>(null);
  const postAbort = useRef<AbortController | null>(null);
  const activeOperation = useRef<AbortController | null>(null);
  const [_revision, setRevision] = useState(0);
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);
  const [staged, setStaged] = useState<File | null>(null);
  const uploadLimit = useCoreUploadLimit(http);
  const draft = state.getDraft(roomId);
  const visibleConfirmation =
    confirmation?.fingerprint.roomId === roomId ? confirmation : null;

  activeRoomId.current = roomId;
  const previousRoomId = useRef(roomId);

  useLayoutEffect(() => {
    if (previousRoomId.current === roomId) return;
    // A consent belongs to the active composition, never a room left behind.
    previousRoomId.current = roomId;
    activeOperation.current = null;
    state.revokeConsent();
    setConfirmation(null);
    setStaged(null);
    setStatus({ kind: "idle" });
  }, [roomId, state]);

  useEffect(
    () => () => {
      activeOperation.current = null;
      previewAbort.current?.abort();
      postAbort.current?.abort();
    },
    [],
  );

  useLayoutEffect(() => {
    const input = inputRef.current;
    if (!input || document.activeElement !== input) return;
    input.setSelectionRange(draft.selectionStart, draft.selectionEnd);
  }, [draft.selectionEnd, draft.selectionStart]);

  const changed = (
    text: string,
    selectionStart: number,
    selectionEnd: number,
  ) => {
    activeOperation.current = null;
    state.setText(roomId, text);
    state.setSelection(roomId, selectionStart, selectionEnd);
    setConfirmation(null);
    // A write already on its way is not called off by typing: it still holds
    // the composer until its outcome is drawn, so no second send overlaps it.
    setStatus((current) =>
      current.kind === "posting" ? current : { kind: "idle" },
    );
    setRevision((value) => value + 1);
  };

  // Text offered by another surface fills the box only; sending stays the person's press.
  // A second offer replaces an untouched first one rather than piling up under it.
  const lastOffer = useRef<string | null>(null);
  const takeOffer = useRef((_text: string) => {});
  takeOffer.current = (text: string) => {
    const current = state.getDraft(roomId).text;
    const next =
      current === lastOffer.current ? text : withOffer(current, text);
    lastOffer.current = next;
    changed(next, next.length, next.length);
    inputRef.current?.focus();
  };
  useEffect(
    () => takeDraftOffers(roomId, (text) => takeOffer.current(text)),
    [roomId],
  );

  const preview = async () => {
    const fingerprint = requestFingerprint(roomId, state);
    if (fingerprint.text === "") {
      setStatus({ kind: "error", message: COPY.empty });
      return;
    }
    previewAbort.current?.abort();
    const controller = new AbortController();
    previewAbort.current = controller;
    activeOperation.current = controller;
    setConfirmation(null);
    setStatus({ kind: "previewing" });
    try {
      const outcome = await http.request({
        path: "/send",
        signal: controller.signal,
        generationKey: `composer-preview:${roomId}`,
        body: sendBody(fingerprint, true),
      });
      if (
        activeRoomId.current !== roomId ||
        activeOperation.current !== controller ||
        outcome.kind === "discarded"
      )
        return;
      if (outcome.kind === "failure") {
        setStatus({ kind: "error", message: COPY.refused(outcome.error.code) });
        return;
      }
      const result: SendResult = outcome.data;
      if (!result.dryRun || result.roomId !== roomId) {
        state.revokeConsent();
        setStatus({ kind: "error", message: COPY.protocol });
        return;
      }
      if (!state.grantConsent(fingerprint)) return;
      // Owner's call, 2026-09-30: no confirmation for an ordinary send. The
      // dry run still runs, silently, so a send that would erase what the
      // desktop client is holding as a draft is asked about before it does.
      if (result.wouldClearDraft !== true && !confirmEvery) {
        await post(fingerprint);
        return;
      }
      setConfirmation({
        fingerprint,
        room: result.room,
        wouldClearDraft: result.wouldClearDraft === true,
      });
      setStatus({ kind: "idle" });
    } catch (error) {
      if (
        controller.signal.aborted ||
        activeRoomId.current !== roomId ||
        activeOperation.current !== controller
      )
        return;
      setStatus({
        kind: "error",
        message:
          error instanceof HttpProtocolError ? COPY.protocol : COPY.network,
      });
    }
  };

  const confirm = async () => {
    if (
      !visibleConfirmation ||
      !state.hasConsent(visibleConfirmation.fingerprint)
    ) {
      setConfirmation(null);
      setStatus({ kind: "idle" });
      return;
    }
    await post(visibleConfirmation.fingerprint);
  };

  /** Another operation started after this one; an edit alone supersedes nothing. */
  const superseded = (controller: AbortController) =>
    activeOperation.current !== null && activeOperation.current !== controller;

  /** The real send, for a fingerprint the dry run just granted consent to. */
  async function post(fingerprint: ConsentFingerprint) {
    if (!state.hasConsent(fingerprint)) {
      setConfirmation(null);
      setStatus({ kind: "idle" });
      return;
    }
    const controller = new AbortController();
    postAbort.current = controller;
    activeOperation.current = controller;
    setStatus({ kind: "posting" });
    try {
      const outcome = await http.request({
        path: "/send",
        signal: controller.signal,
        generationKey: `composer-post:${roomId}`,
        body: sendBody(fingerprint, false),
      });
      const draftStillMatches = state.hasConsent(fingerprint);
      if (activeRoomId.current !== roomId || outcome.kind === "discarded")
        return;
      // A write's outcome is always drawn in its room; only a newer
      // composition's consent is left alone.
      if (!superseded(controller)) {
        state.revokeConsent();
        setConfirmation(null);
      }
      if (outcome.kind === "failure") {
        setStatus({ kind: "error", message: COPY.refused(outcome.error.code) });
        return;
      }
      if (!outcome.data.submitted || outcome.data.dryRun) {
        setStatus({ kind: "error", message: COPY.protocol });
        return;
      }
      if (draftStillMatches) state.clear(roomId);
      setRevision((value) => value + 1);
      setStatus({ kind: "submitted" });
    } catch (error) {
      if (controller.signal.aborted || activeRoomId.current !== roomId) return;
      if (!superseded(controller)) {
        state.revokeConsent();
        setConfirmation(null);
      }
      setStatus({
        kind: "error",
        message:
          error instanceof HttpProtocolError ? COPY.protocol : COPY.network,
      });
    }
  }

  /** One file, one attempt; the confirmation the client shows is pressed by the core. */
  async function sendFile() {
    const file = staged;
    if (
      !file ||
      uploadLimit === null ||
      file.size === 0 ||
      file.size > uploadLimit ||
      status.kind === "previewing" ||
      status.kind === "posting"
    )
      return;
    const controller = new AbortController();
    postAbort.current = controller;
    activeOperation.current = controller;
    setStatus({ kind: "posting" });
    try {
      const outcome = await http.upload({
        room: roomId,
        file,
        signal: controller.signal,
      });
      if (activeRoomId.current !== roomId || outcome.kind === "discarded")
        return;
      if (outcome.kind === "failure") {
        if (UNCERTAIN_UPLOAD.has(outcome.error.code)) {
          setStaged(null);
          setStatus({ kind: "error", message: COPY.fileUncertain });
        } else
          setStatus({
            kind: "error",
            message: COPY.fileRefused(outcome.error.code),
          });
        return;
      }
      setStaged(null);
      setStatus(
        outcome.data.submitted
          ? { kind: "fileSubmitted" }
          : { kind: "error", message: COPY.protocol },
      );
    } catch {
      if (controller.signal.aborted || activeRoomId.current !== roomId) return;
      // A broken or missing answer leaves the outcome unknown: the file is
      // put down so a second press is the person's decision, not a reflex.
      setStaged(null);
      setStatus({ kind: "error", message: COPY.fileUncertain });
    }
  }

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status.kind === "previewing" || status.kind === "posting") return;
    if (visibleConfirmation) void confirm();
    else void preview();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    const decision = ime.decide(event.nativeEvent);
    if (decision === "ignore") {
      event.preventDefault();
      return;
    }
    if (decision === "send") {
      event.preventDefault();
      if (status.kind === "idle" || status.kind === "error") void preview();
    }
  };

  return (
    <form className={styles.composer} data-ui="composer" onSubmit={submit}>
      {visibleConfirmation ? (
        <section
          className={styles.confirmation}
          data-ui="composer-confirmation"
          aria-live="polite"
          aria-label={COPY.confirming}
        >
          <p className={styles.confirming}>{COPY.confirming}</p>
          <p>
            <span className={styles.label}>{COPY.resolvedRoom}</span>{" "}
            {visibleConfirmation.room}
          </p>
          <p className={styles.warning}>{COPY.conservative}</p>
          {visibleConfirmation.wouldClearDraft ? (
            <p className={styles.warning} data-ui="composer-clear-warning">
              {COPY.clearWarning}
            </p>
          ) : null}
          <div className={styles.actions}>
            <button
              type="button"
              className={styles.quiet}
              data-ui="composer-cancel"
              // A write already on its way cannot be called back.
              disabled={status.kind === "posting"}
              onClick={() => {
                state.revokeConsent();
                setConfirmation(null);
                setStatus({ kind: "idle" });
                inputRef.current?.focus();
              }}
            >
              {COPY.cancel}
            </button>
            <button
              type="button"
              className={styles.confirm}
              data-ui="composer-confirm"
              disabled={status.kind === "posting"}
              onClick={() => void confirm()}
            >
              {COPY.confirm}
            </button>
          </div>
        </section>
      ) : null}
      {status.kind === "previewing" || status.kind === "posting" ? (
        <p className={styles.status} role="status" data-ui="composer-status">
          {status.kind === "previewing" ? COPY.previewing : COPY.posting}
        </p>
      ) : null}
      {status.kind === "error" ? (
        <p className={styles.status} role="alert" data-ui="composer-error">
          {status.message}
        </p>
      ) : null}
      {status.kind === "submitted" || status.kind === "fileSubmitted" ? (
        <p className={styles.status} role="status" data-ui="composer-submitted">
          {status.kind === "submitted" ? COPY.submitted : COPY.fileSubmitted}
        </p>
      ) : null}
      {staged && uploadLimit !== null ? (
        <Suspense fallback={null}>
          <StagedFile
            file={staged}
            maxBytes={uploadLimit}
            busy={status.kind === "posting"}
            onSend={() => void sendFile()}
            onCancel={() => {
              setStaged(null);
              setStatus({ kind: "idle" });
            }}
          />
        </Suspense>
      ) : null}
      <div className={styles.entry}>
        <textarea
          ref={inputRef}
          className={styles.input}
          data-ui="composer-input"
          aria-label={COPY.input}
          placeholder={COPY.placeholder}
          value={draft.text}
          rows={1}
          onChange={(event) =>
            changed(
              event.currentTarget.value,
              event.currentTarget.selectionStart,
              event.currentTarget.selectionEnd,
            )
          }
          onSelect={(event) =>
            state.setSelection(
              roomId,
              event.currentTarget.selectionStart,
              event.currentTarget.selectionEnd,
            )
          }
          onCompositionStart={() => ime.start()}
          onCompositionEnd={() => ime.end()}
          onKeyDown={onKeyDown}
        />
        <div className={styles.tools}>
          {uploadLimit !== null ? (
            <>
              <AttachButton
                photo
                disabled={
                  status.kind === "previewing" || status.kind === "posting"
                }
                onPick={(file) => {
                  setStaged(file);
                  setStatus({ kind: "idle" });
                }}
              />
              <AttachButton
                disabled={
                  status.kind === "previewing" || status.kind === "posting"
                }
                onPick={(file) => {
                  setStaged(file);
                  setStatus({ kind: "idle" });
                }}
              />
            </>
          ) : null}
          <span className={styles.hint} aria-hidden="true">
            {COPY.hint}
          </span>
          <button
            className={styles.door}
            data-ui="composer-send"
            type="submit"
            disabled={status.kind === "previewing" || status.kind === "posting"}
          >
            <span className="sr-only">{COPY.send}</span>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M12 18.5V6M6.5 11.5 12 6l5.5 5.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </form>
  );
});
