import {
  memo,
  type ReactNode,
  type RefObject,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import type { ContextWindows } from "../../core/context";
import type { ClientStores } from "../../core/stores";
import type { HttpClient } from "../../transport/http";
import { cx, RoomAvatar, UnreadBadge } from "../../ui";
import { Composer } from "../composer";
import { offerDraft } from "../composer/offer";
import { useSlice } from "../rooms";
import { ThreadPane } from "../thread";
import styles from "./Assist.module.css";
import { ASSIST_COPY } from "./copy";
import {
  type AssistAnswer,
  type AssistSettings,
  assistInput,
  awaitingReply,
  reasonOf,
  requestAssist,
  type Writer,
} from "./requests";

type Help =
  | Readonly<{ kind: "idle" }>
  | Readonly<{ kind: "loading" }>
  | Readonly<{ kind: "ok"; answer: AssistAnswer }>
  | Readonly<{ kind: "failed"; code: string }>
  | Readonly<{ kind: "network" }>;

function useSettled(windows: ContextWindows, roomId: string): boolean {
  const subscribe = useCallback(
    (listener: () => void) => windows.subscribe(roomId, listener),
    [windows, roomId],
  );
  // A window being widened still holds its rows, but is not the answer yet.
  const read = useCallback(() => {
    const window = windows.getSnapshot(roomId);
    return window.settled && window.loading === null;
  }, [windows, roomId]);
  return useSyncExternalStore(subscribe, read, read);
}

/**
 * Asks for help once per message from the other side: when the room opens and
 * its newest text is theirs, and again when a newer one of theirs arrives. A
 * request in flight is never doubled or abandoned for a newer message; its
 * answer lands, and the newer message is asked about after it. When the
 * agent asks for older history, the wall is widened once and asked again with
 * it; that second answer stands, whatever it is.
 */
function useHelp(
  stores: ClientStores,
  windows: ContextWindows,
  roomId: string,
  enabled: boolean,
) {
  useSlice(stores, `thread.${roomId}`);
  const settled = useSettled(windows, roomId);
  const waiting = awaitingReply(stores, roomId);
  const [help, setHelp] = useState<Help>({ kind: "idle" });
  // The last summary stays on screen while a newer one is being made.
  const [summary, setSummary] = useState<AssistAnswer["summary"] | null>(null);
  const [askedFor, setAskedFor] = useState<string | null>(null);
  const [again, setAgain] = useState(0);
  const busy = useRef(false);
  const more = useRef(false);
  const [reading, setReading] = useState(false);
  const abort = useRef<AbortController | null>(null);

  useEffect(() => () => abort.current?.abort(), []);

  useEffect(() => {
    if (!enabled || !settled || busy.current) return;
    const manual = again > 0;
    if (!manual && (waiting === null || waiting === askedFor)) return;
    const input = assistInput(
      stores,
      roomId,
      ASSIST_COPY.untitled,
      more.current,
    );
    if (!input) return;
    busy.current = true;
    const controller = new AbortController();
    abort.current = controller;
    setHelp({ kind: "loading" });
    void requestAssist(input, controller.signal).then((outcome) => {
      if (controller.signal.aborted) return;
      busy.current = false;
      if (outcome.kind === "more" && !more.current) {
        more.current = true;
        setReading(true);
        windows.widen(roomId);
        setAgain((value) => value + 1);
        return;
      }
      more.current = false;
      setReading(false);
      setAgain(0);
      setAskedFor(waiting);
      if (outcome.kind === "ok") setSummary(outcome.answer.summary);
      setHelp(
        outcome.kind === "ok"
          ? { kind: "ok", answer: outcome.answer }
          : outcome.kind === "failed"
            ? { kind: "failed", code: outcome.code }
            : outcome.kind === "more"
              ? { kind: "failed", code: "NEED_MORE" }
              : { kind: "network" },
      );
    });
  }, [enabled, settled, waiting, askedFor, again, stores, windows, roomId]);

  return {
    help,
    summary,
    waiting,
    reading,
    retry: () => setAgain((value) => value + 1),
  };
}

/** Whether the conversation wall inside `box` has rows scrolled out above and below it. */
function useEdges(box: RefObject<HTMLElement | null>) {
  const [edges, setEdges] = useState({ above: false, below: false });
  useEffect(() => {
    const wall = box.current?.querySelector<HTMLElement>(
      '[data-ui="thread-wall"]',
    );
    if (!wall) return;
    const measure = () => {
      const above = wall.scrollTop > 2;
      const below = wall.scrollHeight - wall.clientHeight - wall.scrollTop > 2;
      setEdges((current) =>
        current.above === above && current.below === below
          ? current
          : { above, below },
      );
    };
    measure();
    wall.addEventListener("scroll", measure, { passive: true });
    const resize = new ResizeObserver(measure);
    resize.observe(wall);
    return () => {
      wall.removeEventListener("scroll", measure);
      resize.disconnect();
    };
  }, [box]);
  return edges;
}

/** One candidate: picking it fills the input; a clipped one can be read whole first. */
function CandidateItem({
  roomId,
  prefix,
  candidate,
}: {
  roomId: string;
  prefix: string;
  candidate: AssistAnswer["candidates"][number];
}) {
  const item = useRef<HTMLLIElement>(null);
  const text = useRef<HTMLSpanElement>(null);
  const [clipped, setClipped] = useState(false);
  const [open, setOpen] = useState(false);
  // The opened text grows downward; bring its start back under the box's sticky heading.
  useEffect(() => {
    const element = item.current;
    const box = element?.closest<HTMLElement>('[data-ui="assist-help"]');
    if (!open || !element || !box) return;
    const head = box.firstElementChild?.getBoundingClientRect().height ?? 0;
    const offset =
      element.getBoundingClientRect().top - box.getBoundingClientRect().top;
    if (offset < head || offset > box.clientHeight / 2)
      box.scrollTop += offset - head;
  }, [open]);
  useLayoutEffect(() => {
    const element = text.current;
    if (!element) return;
    const measure = () =>
      setClipped(element.scrollHeight > element.clientHeight + 1);
    measure();
    const resize = new ResizeObserver(measure);
    resize.observe(element);
    return () => resize.disconnect();
  }, []);
  return (
    <li ref={item} data-open={open || undefined}>
      <button
        type="button"
        className={styles.candidate}
        data-ui="assist-candidate"
        data-score={candidate.score}
        title={ASSIST_COPY.pickHint}
        onClick={() => offerDraft(roomId, `${prefix}${candidate.text}`)}
      >
        <span className={styles.score}>
          <span className="sr-only">{ASSIST_COPY.scoreLabel}</span>
          {candidate.score}
        </span>
        <span ref={text} className={styles.candidateText}>
          {candidate.text}
        </span>
        <span className={styles.reason}>{reasonOf(candidate)}</span>
      </button>
      {clipped || open ? (
        <button
          type="button"
          className={styles.more}
          data-ui="assist-more"
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? ASSIST_COPY.less : ASSIST_COPY.more}
        </button>
      ) : null}
    </li>
  );
}

function writerLabel(writer: Writer): string {
  if (writer.kind === "agent") return ASSIST_COPY.byAgent(writer.name);
  return writer.fallback ? ASSIST_COPY.byFallback : ASSIST_COPY.byModel;
}

function Candidates({
  roomId,
  help,
  waiting,
  reading,
  agent,
  prefix,
  onRetry,
}: {
  roomId: string;
  help: Help;
  waiting: string | null;
  reading: boolean;
  agent: string | null;
  prefix: string;
  onRetry: () => void;
}) {
  const busy = help.kind === "loading";
  const writer = help.kind === "ok" ? help.answer.writer : null;
  let body: ReactNode;
  if (help.kind === "loading") {
    body = (
      <p className={styles.quiet}>
        {reading
          ? ASSIST_COPY.reading
          : agent
            ? ASSIST_COPY.asking(agent)
            : ASSIST_COPY.loading}
      </p>
    );
  } else if (help.kind === "idle") {
    body = (
      <p className={styles.quiet}>
        {waiting === null ? ASSIST_COPY.nothing : ASSIST_COPY.waiting}
      </p>
    );
  } else if (help.kind === "network") {
    body = (
      <p className={styles.problem} role="alert">
        {ASSIST_COPY.network}
      </p>
    );
  } else if (help.kind === "failed") {
    body = (
      <p className={styles.problem} role="alert" data-code={help.code}>
        {ASSIST_COPY.writerFailed}
      </p>
    );
  } else if (help.answer.check !== "ok") {
    body = (
      <p className={styles.problem} role="alert" data-code={help.answer.check}>
        {ASSIST_COPY.checkFailed}
      </p>
    );
  } else {
    const { candidates, hidden } = help.answer;
    body = (
      <>
        {candidates.length === 0 ? (
          <p className={styles.quiet}>{ASSIST_COPY.noneLeft}</p>
        ) : (
          <ol className={styles.candidates}>
            {candidates.map((candidate) => (
              <CandidateItem
                key={candidate.text}
                roomId={roomId}
                prefix={prefix}
                candidate={candidate}
              />
            ))}
          </ol>
        )}
        {hidden && hidden.risky + hidden.offTopic > 0 ? (
          <p className={styles.quiet} data-ui="assist-hidden">
            {ASSIST_COPY.hidden(hidden.risky, hidden.offTopic)}
          </p>
        ) : null}
      </>
    );
  }
  return (
    <div className={styles.help} data-ui="assist-help" data-state={help.kind}>
      <div className={styles.helpHead}>
        <h3 className={styles.helpTitle}>
          {ASSIST_COPY.candidates}
          {writer ? (
            <span
              className={styles.writer}
              data-ui="assist-writer"
              data-kind={
                writer.kind === "agent"
                  ? "agent"
                  : writer.fallback
                    ? "fallback"
                    : "model"
              }
              title={
                writer.kind === "model" && writer.fallback
                  ? ASSIST_COPY.fallbackHint
                  : undefined
              }
            >
              {writerLabel(writer)}
            </span>
          ) : null}
        </h3>
        <button
          type="button"
          className={styles.small}
          data-ui="assist-retry"
          disabled={busy}
          onClick={onRetry}
        >
          {ASSIST_COPY.again}
        </button>
      </div>
      {body}
    </div>
  );
}

/** One room of 문의 모아보기: its header, what they want, the live wall, reply help and the room's own composer. */
export const AssistCell = memo(function AssistCell({
  stores,
  windows,
  http,
  roomId,
  settings,
  prefixOn,
  active,
  expanded,
  compact,
  onExpand,
  onRemove,
}: {
  stores: ClientStores;
  windows: ContextWindows;
  http: HttpClient;
  roomId: string;
  /** null: this deployment has reply help off; "checking": not known yet. */
  settings: AssistSettings | null | "checking";
  prefixOn: boolean;
  /** The one cell shown on a phone. */
  active: boolean;
  /** This room is opened large; the others sit compact beside it. */
  expanded: boolean;
  compact: boolean;
  onExpand: (roomId: string | null) => void;
  onRemove: (roomId: string) => void;
}) {
  const wallBox = useRef<HTMLDivElement>(null);
  const edges = useEdges(wallBox);
  const snapshot = useSlice(stores, `room.${roomId}`);
  const enabled = settings !== null && settings !== "checking";
  const { help, summary, waiting, reading, retry } = useHelp(
    stores,
    windows,
    roomId,
    enabled,
  );
  const title = snapshot?.room.title ?? ASSIST_COPY.untitled;
  const unread = snapshot?.room.unread ?? 0;
  const prefix = enabled && prefixOn ? settings.prefix : "";
  return (
    <section
      className={styles.cell}
      data-ui="assist-cell"
      data-room-id={roomId}
      data-active={active || undefined}
      data-expanded={expanded || undefined}
      data-compact={compact || undefined}
      aria-label={title}
    >
      <header className={styles.cellHead}>
        <RoomAvatar name={title} size={28} images={snapshot?.room.images} />
        <h2 className={styles.cellTitle}>{title}</h2>
        {unread > 0 ? <UnreadBadge count={unread} /> : null}
        <button
          type="button"
          className={cx(styles.remove, styles.expand)}
          data-ui="assist-expand"
          aria-pressed={expanded}
          title={expanded ? ASSIST_COPY.collapse : ASSIST_COPY.expand}
          onClick={() => onExpand(expanded ? null : roomId)}
        >
          <span className="sr-only">
            {expanded ? ASSIST_COPY.collapse : ASSIST_COPY.expand}
          </span>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            {expanded ? (
              <path d="M10 4v6H4M14 20v-6h6M10 10L4 4M14 14l6 6" />
            ) : (
              <path d="M4 10V4h6M20 14v6h-6M4 4l6 6M20 20l-6-6" />
            )}
          </svg>
        </button>
        <button
          type="button"
          className={styles.remove}
          data-ui="assist-remove"
          onClick={() => onRemove(roomId)}
        >
          <span className="sr-only">{ASSIST_COPY.remove(title)}</span>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </header>
      {summary && (summary.want !== "" || summary.open.length > 0) ? (
        <div className={styles.summary} data-ui="assist-summary">
          {summary.want !== "" ? (
            <p>
              <b>{ASSIST_COPY.want}</b> {summary.want}
            </p>
          ) : null}
          {summary.open.length > 0 ? (
            <p>
              <b>{ASSIST_COPY.open}</b> {summary.open.join(" / ")}
            </p>
          ) : null}
        </div>
      ) : null}
      <div
        ref={wallBox}
        className={styles.wall}
        data-ui="assist-wall"
        data-above={edges.above || undefined}
        data-below={edges.below || undefined}
      >
        <ThreadPane
          stores={stores}
          windows={windows}
          roomId={roomId}
          http={http}
        />
      </div>
      {settings === "checking" ? null : settings === null ? (
        <p className={styles.off} data-ui="assist-off">
          {ASSIST_COPY.off}
        </p>
      ) : (
        <Candidates
          roomId={roomId}
          help={help}
          waiting={waiting}
          reading={reading}
          agent={enabled ? settings.agent : null}
          prefix={prefix}
          onRetry={retry}
        />
      )}
      <div className={styles.composer}>
        <Composer http={http} roomId={roomId} confirmEvery />
      </div>
    </section>
  );
});
