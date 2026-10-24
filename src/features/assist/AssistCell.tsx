import {
  memo,
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import type { ContextWindows } from "../../core/context";
import type { ClientStores } from "../../core/stores";
import type { HttpClient } from "../../transport/http";
import { RoomAvatar, UnreadBadge } from "../../ui";
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
  const read = useCallback(
    () => windows.getSnapshot(roomId).settled,
    [windows, roomId],
  );
  return useSyncExternalStore(subscribe, read, read);
}

/**
 * Asks for help once per message from the other side: when the room opens and
 * its newest text is theirs, and again when a newer one of theirs arrives. A
 * request in flight is never doubled or abandoned for a newer message; its
 * answer lands, and the newer message is asked about after it.
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
  const abort = useRef<AbortController | null>(null);

  useEffect(() => () => abort.current?.abort(), []);

  useEffect(() => {
    if (!enabled || !settled || busy.current) return;
    const manual = again > 0;
    if (!manual && (waiting === null || waiting === askedFor)) return;
    const input = assistInput(stores, roomId, ASSIST_COPY.untitled);
    if (!input) return;
    busy.current = true;
    const controller = new AbortController();
    abort.current = controller;
    setHelp({ kind: "loading" });
    void requestAssist(input, controller.signal).then((outcome) => {
      if (controller.signal.aborted) return;
      busy.current = false;
      setAgain(0);
      setAskedFor(waiting);
      if (outcome.kind === "ok") setSummary(outcome.answer.summary);
      setHelp(
        outcome.kind === "ok"
          ? { kind: "ok", answer: outcome.answer }
          : outcome.kind === "failed"
            ? { kind: "failed", code: outcome.code }
            : { kind: "network" },
      );
    });
  }, [enabled, settled, waiting, askedFor, again, stores, roomId]);

  return {
    help,
    summary,
    waiting,
    retry: () => setAgain((value) => value + 1),
  };
}

function Candidates({
  roomId,
  help,
  waiting,
  prefix,
  onRetry,
}: {
  roomId: string;
  help: Help;
  waiting: string | null;
  prefix: string;
  onRetry: () => void;
}) {
  const busy = help.kind === "loading";
  let body: ReactNode;
  if (help.kind === "loading") {
    body = <p className={styles.quiet}>{ASSIST_COPY.loading}</p>;
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
              <li key={candidate.text}>
                <button
                  type="button"
                  className={styles.candidate}
                  data-ui="assist-candidate"
                  data-score={candidate.score}
                  title={ASSIST_COPY.pickHint}
                  onClick={() =>
                    offerDraft(roomId, `${prefix}${candidate.text}`)
                  }
                >
                  <span className={styles.score}>
                    <span className="sr-only">{ASSIST_COPY.scoreLabel}</span>
                    {candidate.score}
                  </span>
                  <span className={styles.candidateText}>{candidate.text}</span>
                  <span className={styles.reason}>{reasonOf(candidate)}</span>
                </button>
              </li>
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
        <h3 className={styles.helpTitle}>{ASSIST_COPY.candidates}</h3>
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
  onRemove: (roomId: string) => void;
}) {
  const snapshot = useSlice(stores, `room.${roomId}`);
  const enabled = settings !== null && settings !== "checking";
  const { help, summary, waiting, retry } = useHelp(
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
      aria-label={title}
    >
      <header className={styles.cellHead}>
        <RoomAvatar name={title} size={28} images={snapshot?.room.images} />
        <h2 className={styles.cellTitle}>{title}</h2>
        {unread > 0 ? <UnreadBadge count={unread} /> : null}
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
      <div className={styles.wall}>
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
