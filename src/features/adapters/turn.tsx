import { useEffect, useState } from "react";
import {
  type AdapterAttachment,
  type AdapterMessage,
  type AdapterReaction,
  mediaUrl,
} from "../../transport/adapters";
import { Avatar, clockTime, cx } from "../../ui";
import { firstUrl, linkify } from "../../ui/linkify";
import { Photo } from "../../ui/Photo";
import { Video } from "../../ui/Video";
import { formatSize } from "../attachments/pages";
import { LinkCard } from "../linkcard";
import { sameDiscordRun, sameRun } from "../thread/grouping";
import { Stamp } from "./stamp";
import styles from "./Thread.module.css";

export const COPY = {
  media: "사진·파일 등",
  service: "알림",
  edited: "수정됨",
  unshown: "불러오지 못했습니다",
  kinds: {
    file: "파일",
    image: "사진",
    video: "동영상",
    audio: "오디오",
    voice: "음성 메시지",
    sticker: "스티커",
    animation: "움직이는 이미지",
  } as Record<string, string>,
  more: "메시지 동작",
  tools: "이 메시지에 할 수 있는 일",
  reply: "답장",
  edit: "수정",
  delete: "삭제",
  confirmDelete: (forEveryone: boolean) =>
    forEveryone ? "모두에게서 삭제할까요?" : "이 계정에서만 삭제할까요?",
  cancel: "취소",
  deleting: "삭제하는 중",
  react: (emoji: string) => `${emoji} 반응 남기기`,
  reactions: "반응",
  reaction: (emoji: string, count: number, mine: boolean) =>
    `${emoji} ${count.toLocaleString("ko-KR")}명${mine ? ", 내 반응 포함" : ""}`,
  quoteMissing: "불러온 범위 밖의 메시지에 대한 답장",
} as const;

/** A short, messenger-neutral set; a room that allows fewer refuses the rest. */
export const QUICK_REACTIONS = [
  "\u{1F44D}",
  "\u2764",
  "\u{1F525}",
  "\u{1F601}",
  "\u{1F622}",
  "\u{1F64F}",
] as const;

/** What this room lets the account do to a message, already narrowed by the room. */
export interface MessageAbilities {
  reply: boolean;
  edit: { maxAgeSeconds?: number } | undefined;
  delete: { forEveryone: boolean } | undefined;
  react: boolean;
}

export function canEdit(
  message: AdapterMessage,
  edit: MessageAbilities["edit"],
  now: number,
): boolean {
  if (!edit || !message.fromMe || message.kind !== "text" || !message.text)
    return false;
  if (edit.maxAgeSeconds === undefined) return true;
  return now - Date.parse(message.sentAt) < edit.maxAgeSeconds * 1000;
}

/**
 * The whole set of this account's reactions after a tap on `emoji`: off if it
 * was on, otherwise on, dropping the oldest when the messenger allows fewer.
 */
export function toggledReactions(
  current: AdapterReaction[] | undefined,
  emoji: string,
  maxPerMessage: number | undefined,
): string[] {
  const mine = (current ?? [])
    .filter((reaction) => reaction.mine)
    .map((reaction) => reaction.emoji);
  if (mine.includes(emoji)) return mine.filter((own) => own !== emoji);
  const next = [...mine, emoji];
  return maxPerMessage !== undefined && next.length > maxPerMessage
    ? next.slice(next.length - maxPerMessage)
    : next;
}

/** Types `/media` serves inline, so an `<img>` can draw them; anything else is a download. */
const DRAWABLE = /^image\/(?:jpeg|png|gif|webp|avif)$/;

const PLAYABLE = /^video\/(?:mp4|webm|ogg)$/;

export function drawableImage(attachment: AdapterAttachment): boolean {
  return (
    attachment.kind === "image" && DRAWABLE.test(attachment.mimeType ?? "")
  );
}

export function photoData(adapterId: string, attachments: AdapterAttachment[]) {
  const images = attachments.filter(drawableImage).map((attachment) => ({
    url: mediaUrl(adapterId, attachment.id),
    width: attachment.width ?? 0,
    height: attachment.height ?? 0,
  }));
  return {
    url: images[0]?.url ?? "",
    width: images[0]?.width ?? 0,
    height: images[0]?.height ?? 0,
    count: images.length,
    images,
  };
}

function Animation({
  attachment,
  href,
}: {
  attachment: AdapterAttachment;
  href: string;
}) {
  const [reduced, setReduced] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  if (reduced)
    return (
      <a className={styles.file} href={href} download={attachment.name ?? ""}>
        {attachment.name ?? attachmentLabel(attachment.kind)}
      </a>
    );
  return attachment.mimeType === "image/gif" ? (
    <img
      className={styles.animation}
      src={href}
      alt={attachment.name ?? ""}
      width={attachment.width}
      height={attachment.height}
      data-ui="adapter-animation"
    />
  ) : (
    <video
      className={styles.animation}
      src={href}
      width={attachment.width}
      height={attachment.height}
      loop
      muted
      autoPlay
      playsInline
      data-ui="adapter-animation"
    />
  );
}

export function attachmentLabel(kind: string): string {
  return COPY.kinds[kind] ?? COPY.kinds.file ?? "";
}

function Attachment({
  adapterId,
  attachment,
  now,
}: {
  adapterId: string;
  attachment: AdapterAttachment;
  now: Date;
}) {
  const [broken, setBroken] = useState(false);
  const href = mediaUrl(adapterId, attachment.id);
  const label = attachmentLabel(attachment.kind);
  if (attachment.kind === "video" && PLAYABLE.test(attachment.mimeType ?? ""))
    return (
      <Video
        now={now}
        loading="lazy"
        video={{
          url: href,
          width: attachment.width ?? 0,
          height: attachment.height ?? 0,
          duration: attachment.durationSeconds ?? 0,
          size: attachment.size ?? 0,
        }}
      />
    );
  if (
    attachment.kind === "animation" &&
    (PLAYABLE.test(attachment.mimeType ?? "") ||
      attachment.mimeType === "image/gif")
  )
    return <Animation attachment={attachment} href={href} />;
  const drawable =
    (attachment.kind === "image" || attachment.kind === "sticker") &&
    DRAWABLE.test(attachment.mimeType ?? "");
  if (drawable && !broken)
    return (
      <a
        className={cx(
          styles.picture,
          attachment.kind === "sticker" && styles.sticker,
        )}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        data-ui="adapter-picture"
      >
        <img
          src={href}
          alt={attachment.name ?? label}
          width={attachment.width}
          height={attachment.height}
          loading="lazy"
          decoding="async"
          onError={() => setBroken(true)}
        />
      </a>
    );
  const seconds = attachment.durationSeconds;
  const meta = [
    attachment.name ? label : null,
    seconds === undefined
      ? null
      : `${Math.floor(seconds / 60)}:${String(Math.round(seconds % 60)).padStart(2, "0")}`,
    broken ? COPY.unshown : formatSize(attachment.size),
  ].filter(Boolean);
  return (
    <a
      className={styles.file}
      href={href}
      download={attachment.name ?? ""}
      data-ui="adapter-file"
    >
      <span className={styles.fileName}>{attachment.name ?? label}</span>
      <span className={styles.fileMeta}>{meta.join(" · ")}</span>
    </a>
  );
}

export function gist(message: AdapterMessage): string {
  if (message.text) return message.text;
  const first = message.attachments?.[0];
  return first ? attachmentLabel(first.kind) : COPY.media;
}

function Quote({ quoted }: { quoted: AdapterMessage | undefined }) {
  return (
    <blockquote className={styles.quote} data-ui="adapter-quote">
      {quoted ? (
        <>
          <span className={styles.quoteSender}>{quoted.sender}</span>
          <span className={styles.quoteText}>{gist(quoted)}</span>
        </>
      ) : (
        <span className={styles.quoteText}>{COPY.quoteMissing}</span>
      )}
    </blockquote>
  );
}

function Reactions({
  reactions,
  onToggle,
}: {
  reactions: AdapterReaction[];
  onToggle: ((emoji: string) => void) | undefined;
}) {
  return (
    <ul
      className={styles.reactions}
      aria-label={COPY.reactions}
      data-ui="adapter-reactions"
    >
      {reactions.map((reaction) => {
        const label = COPY.reaction(
          reaction.emoji,
          reaction.count,
          reaction.mine,
        );
        const body = (
          <>
            <span className={styles.emoji} aria-hidden="true">
              {reaction.emoji}
            </span>
            <span aria-hidden="true">
              {reaction.count.toLocaleString("ko-KR")}
            </span>
          </>
        );
        return (
          <li key={reaction.emoji}>
            {onToggle ? (
              <button
                type="button"
                className={cx(styles.chip, reaction.mine && styles.chipMine)}
                aria-pressed={reaction.mine}
                aria-label={label}
                onClick={() => onToggle(reaction.emoji)}
              >
                {body}
              </button>
            ) : (
              <span
                className={cx(styles.chip, reaction.mine && styles.chipMine)}
                role="img"
                aria-label={label}
              >
                {body}
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}

export type ToolAction =
  | { kind: "reply" }
  | { kind: "edit" }
  | { kind: "delete" }
  | { kind: "react"; emoji: string };

function Tools({
  message,
  abilities,
  editable,
  note,
  busy,
  onAction,
  onClose,
}: {
  message: AdapterMessage;
  abilities: MessageAbilities;
  editable: boolean;
  note: string | null;
  busy: boolean;
  onAction: (action: ToolAction) => void;
  onClose: () => void;
}) {
  const [confirming, setConfirming] = useState(false);
  const mine = new Set(
    (message.reactions ?? [])
      .filter((reaction) => reaction.mine)
      .map((reaction) => reaction.emoji),
  );
  useEffect(() => {
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);
  return (
    <fieldset
      className={styles.tools}
      aria-label={COPY.tools}
      data-ui="adapter-tools"
    >
      {confirming && abilities.delete ? (
        <>
          <span className={styles.toolsLine}>
            {COPY.confirmDelete(abilities.delete.forEveryone)}
          </span>
          <button
            type="button"
            className={cx(styles.tool, styles.toolDanger)}
            disabled={busy}
            onClick={() => onAction({ kind: "delete" })}
            data-ui="adapter-delete-confirm"
          >
            {busy ? COPY.deleting : COPY.delete}
          </button>
          <button
            type="button"
            className={styles.tool}
            disabled={busy}
            onClick={() => setConfirming(false)}
          >
            {COPY.cancel}
          </button>
        </>
      ) : (
        <>
          {abilities.react
            ? QUICK_REACTIONS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  className={cx(
                    styles.tool,
                    styles.toolEmoji,
                    mine.has(emoji) && styles.chipMine,
                  )}
                  aria-pressed={mine.has(emoji)}
                  aria-label={COPY.react(emoji)}
                  disabled={busy}
                  onClick={() => onAction({ kind: "react", emoji })}
                >
                  <span className={styles.emoji} aria-hidden="true">
                    {emoji}
                  </span>
                </button>
              ))
            : null}
          {abilities.reply ? (
            <button
              type="button"
              className={styles.tool}
              onClick={() => onAction({ kind: "reply" })}
              data-ui="adapter-reply"
            >
              {COPY.reply}
            </button>
          ) : null}
          {editable ? (
            <button
              type="button"
              className={styles.tool}
              onClick={() => onAction({ kind: "edit" })}
              data-ui="adapter-edit"
            >
              {COPY.edit}
            </button>
          ) : null}
          {abilities.delete && message.fromMe ? (
            <button
              type="button"
              className={styles.tool}
              onClick={() => setConfirming(true)}
              data-ui="adapter-delete"
            >
              {COPY.delete}
            </button>
          ) : null}
        </>
      )}
      {note ? (
        <p className={styles.toolsNote} role="status">
          {note}
        </p>
      ) : null}
    </fieldset>
  );
}

export interface MemberControls {
  open: boolean;
  note: string | null;
  busy: boolean;
  onOpen: (open: boolean) => void;
  onAction: (action: ToolAction) => void;
}

export function Turn({
  adapterId,
  files,
  avatars,
  message,
  previous,
  quoted,
  now,
  abilities,
  open,
  note,
  busy,
  onOpen,
  onAction,
  next,
  members = [message],
  controlsFor,
  layout = "bubbles",
  direct = false,
}: {
  adapterId: string;
  /** Whether the adapter declares `attachments.read`, so `/media` answers. */
  files: boolean;
  /** Whether this room declares `avatars.read`; pictures also require `files`. */
  avatars: boolean;
  message: AdapterMessage;
  previous: AdapterMessage | undefined;
  /** The turn drawn below, which decides whether this one ends its run. */
  next?: AdapterMessage | undefined;
  /** The message this one replies to, when it is in the loaded window. */
  quoted: AdapterMessage | undefined;
  now: Date;
  abilities: MessageAbilities;
  open: boolean;
  note: string | null;
  busy: boolean;
  onOpen: (open: boolean) => void;
  onAction: (action: ToolAction) => void;
  members?: AdapterMessage[];
  controlsFor?: (member: AdapterMessage) => MemberControls;
  /**
   * `bubbles`: the KakaoTalk wall. `lines`: Discord's own reading, every
   * message left-aligned under one picture, name and time per run.
   */
  layout?: "bubbles" | "lines";
  /** Whether the room is with one other account, which words a receipt. */
  direct?: boolean;
}) {
  if (message.kind === "service")
    return (
      <li className={styles.service} data-ui="adapter-service">
        {message.text || COPY.service}
      </li>
    );
  const lines = layout === "lines";
  // KakaoTalk's run rule (../thread/grouping): one speaker, one local minute;
  // Discord's: one speaker within seven minutes, a reply opening its own.
  const joins = lines ? sameDiscordRun : sameRun;
  const continued =
    previous !== undefined &&
    previous.kind !== "service" &&
    joins(previous, message);
  const avatar =
    files && avatars && message.senderAvatar
      ? mediaUrl(adapterId, message.senderAvatar)
      : undefined;
  const last = members.at(-1) ?? message;
  const lastOfRun = next?.kind === "service" || !joins(last, next);
  // An album's other members keep their own doors, but only once this turn's
  // menu (or one of theirs) is open: a closed album reads as one picture post.
  const others = members.filter((member) => member.id !== message.id);
  const doors =
    open ||
    others.some((member) => {
      const controls = controlsFor?.(member);
      return Boolean(controls?.open || controls?.note);
    });
  const memberReactions = others.some((member) => member.reactions?.length);
  // The wall's day pills carry the date; the stamp is the clock, as on KakaoTalk.
  const time = clockTime(last.sentAt);
  const quote =
    message.replyTo !== undefined ? <Quote quoted={quoted} /> : null;
  const attachments = members.flatMap((member) => member.attachments ?? []);
  const photo = photoData(adapterId, attachments);
  const caption = members
    .map((member) => member.text)
    .filter(Boolean)
    .join("\n");
  const linked = firstUrl(caption);
  const media =
    files &&
    attachments.some(
      (attachment) =>
        drawableImage(attachment) ||
        attachment.kind === "video" ||
        attachment.kind === "animation",
    );
  const bare =
    members.length === 1 &&
    files &&
    !message.text &&
    !message.replyTo &&
    message.attachments?.length === 1 &&
    message.attachments[0]?.kind === "sticker";
  const editable = canEdit(message, abilities.edit, now.getTime());
  const actionable =
    abilities.react ||
    abilities.reply ||
    editable ||
    (abilities.delete !== undefined && message.fromMe);
  return (
    <li
      className={cx(
        styles.turn,
        lines && styles.lineTurn,
        !lines && message.fromMe && styles.mine,
        continued && styles.continued,
      )}
      data-ui="adapter-turn"
      data-layout={layout}
      data-message-id={message.id}
    >
      {lines ? quote : null}
      <div className={styles.row}>
        {lines ? (
          continued ? (
            // Discord shows a joined line's clock in the gutter, on hover.
            <span className={styles.gap}>
              <time className={styles.gutterTime} dateTime={message.sentAt}>
                {clockTime(message.sentAt).label}
              </time>
            </span>
          ) : (
            <Avatar name={message.sender || "?"} size={40} src={avatar} />
          )
        ) : message.fromMe ? null : continued ? (
          <span className={styles.gap} aria-hidden="true" />
        ) : (
          <Avatar name={message.sender || "?"} size={34} src={avatar} />
        )}
        <div className={styles.column}>
          {lines && !continued ? (
            <span className={styles.head} data-ui="adapter-head">
              <span className={styles.sender}>{message.sender}</span>
              <time dateTime={message.sentAt}>
                {clockTime(message.sentAt).label}
              </time>
            </span>
          ) : !lines && !message.fromMe && !continued ? (
            <span className={styles.sender}>{message.sender}</span>
          ) : null}
          <div className={styles.line}>
            <div
              className={cx(
                styles.bubble,
                bare && styles.bare,
                media && styles.mediaBubble,
              )}
            >
              {lines ? null : quote}
              {/* Discord writes the words first and hangs the files below them. */}
              {lines && caption ? (
                <span className={styles.text}>{linkify(caption)}</span>
              ) : null}
              {files && photo.images.length ? (
                <Photo photo={photo} now={now} />
              ) : null}
              {files && attachments.length ? (
                attachments
                  .filter((attachment) => !drawableImage(attachment))
                  .map((attachment) => (
                    <Attachment
                      key={attachment.id}
                      adapterId={adapterId}
                      attachment={attachment}
                      now={now}
                    />
                  ))
              ) : message.kind === "media" ? (
                <span className={styles.media}>{COPY.media}</span>
              ) : null}
              {!lines && caption ? (
                <span className={styles.text}>{linkify(caption)}</span>
              ) : null}
              {linked ? <LinkCard url={linked} /> : null}
            </div>
            {lines ? (
              message.editedAt ? (
                <span className={styles.time}>{COPY.edited}</span>
              ) : null
            ) : (
              // Only the bubble wall carries a receipt; Discord's own reading has none.
              <Stamp
                members={members}
                direct={direct}
                edited={message.editedAt ? COPY.edited : null}
                label={time.label}
                sentAt={last.sentAt}
                last={lastOfRun}
              />
            )}
            {actionable ? (
              <button
                type="button"
                className={styles.more}
                aria-label={COPY.more}
                aria-expanded={open}
                onClick={() => onOpen(!open)}
                data-ui="adapter-more"
              >
                <svg viewBox="0 0 20 20" aria-hidden="true">
                  <circle cx="4.5" cy="10" r="1.6" />
                  <circle cx="10" cy="10" r="1.6" />
                  <circle cx="15.5" cy="10" r="1.6" />
                </svg>
              </button>
            ) : null}
          </div>
          {members.length > 1 && (doors || memberReactions) ? (
            <div className={styles.members}>
              {members
                .filter((member) => member.id !== message.id)
                .map((member) => {
                  const controls = controlsFor?.(member);
                  const position = members.indexOf(member) + 1;
                  const kindName = attachmentLabel(
                    member.attachments?.[0]?.kind ?? "file",
                  );
                  const memberEditable = canEdit(
                    member,
                    abilities.edit,
                    now.getTime(),
                  );
                  return (
                    <div
                      key={member.id}
                      className={styles.member}
                      data-message-id={member.id}
                    >
                      {controls && actionable && doors ? (
                        <button
                          type="button"
                          className={styles.tool}
                          aria-label={`${COPY.more}: ${kindName} ${position}`}
                          aria-expanded={controls.open}
                          onClick={() => controls.onOpen(!controls.open)}
                          data-ui="adapter-member-more"
                        >
                          {kindName} · {position}
                        </button>
                      ) : null}
                      {member.reactions?.length ? (
                        <Reactions
                          reactions={member.reactions}
                          onToggle={
                            abilities.react && controls && !controls.busy
                              ? (emoji) =>
                                  controls.onAction({ kind: "react", emoji })
                              : undefined
                          }
                        />
                      ) : null}
                      {controls?.open ? (
                        <Tools
                          message={member}
                          abilities={abilities}
                          editable={memberEditable}
                          {...controls}
                          onClose={() => controls.onOpen(false)}
                        />
                      ) : controls?.note ? (
                        <p className={styles.toolsNote} role="status">
                          {controls.note}
                        </p>
                      ) : null}
                    </div>
                  );
                })}
            </div>
          ) : null}
          {message.reactions?.length ? (
            <Reactions
              reactions={message.reactions}
              onToggle={
                abilities.react && !busy
                  ? (emoji) => onAction({ kind: "react", emoji })
                  : undefined
              }
            />
          ) : null}
          {open ? (
            <Tools
              message={message}
              abilities={abilities}
              editable={editable}
              note={note}
              busy={busy}
              onAction={onAction}
              onClose={() => onOpen(false)}
            />
          ) : note ? (
            <p className={styles.toolsNote} role="status">
              {note}
            </p>
          ) : null}
        </div>
      </div>
    </li>
  );
}
