import { useEffect, useId, useRef, useState } from "react";
import type { ClientStores } from "../../core/stores";
import { Cat, cx } from "../../ui";
import { hasDraftTaker, offerDraft } from "../composer/offer";
import {
  requestSummary,
  type SummaryInput,
  type SummaryOutcome,
  summaryInput,
} from "./requests";
import styles from "./Summary.module.css";

export const SUMMARY_COPY = {
  title: "오모냥 요약",
  close: "닫기",
  untitled: "대화",
  lead: (count: number) =>
    `이 기기에 불러온 최근 메시지 ${count.toLocaleString("ko-KR")}개를 이 서버에 설정된 언어 모델에 보내 만든 요약입니다. 틀릴 수 있으니 원문과 함께 확인하세요.`,
  loading: "요약하는 중",
  decisions: "결정할 것",
  todos: "내 할 일",
  draft: "답장 초안",
  none: "없음",
  insert: "입력창에 넣기",
  insertHint: "보내지 않습니다. 입력창에서 고친 뒤 직접 보내세요.",
  noComposer: "이 방에는 입력창이 없어 넣지 못했습니다.",
  retry: "다시 요약",
  empty: "이 기기에 불러온 메시지가 없어 요약할 수 없습니다.",
  network: "요약 서버에 연결할 수 없습니다.",
  timeout: "언어 모델이 제시간에 답하지 않았습니다.",
  malformed: "언어 모델의 답을 요약으로 읽을 수 없습니다.",
  failed: "요약을 만들지 못했습니다.",
} as const;

function failureCopy(outcome: SummaryOutcome): string {
  switch (outcome.kind) {
    case "empty":
      return SUMMARY_COPY.empty;
    case "network":
      return SUMMARY_COPY.network;
    case "failed":
      switch (outcome.code) {
        case "UPSTREAM_TIMEOUT":
          return SUMMARY_COPY.timeout;
        case "UPSTREAM_MALFORMED":
          return SUMMARY_COPY.malformed;
        default:
          return SUMMARY_COPY.failed;
      }
    default:
      return SUMMARY_COPY.failed;
  }
}

function Items({ items }: { items: readonly string[] }) {
  if (items.length === 0)
    return <p className={styles.muted}>{SUMMARY_COPY.none}</p>;
  return (
    <ul className={styles.items}>
      {[...new Set(items)].map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

export interface SummaryPanelProps {
  stores: ClientStores;
  roomId: string;
  onClose: () => void;
}

/** A modal sheet over the room: one request when opened, one manual retry. */
export default function SummaryPanel({
  stores,
  roomId,
  onClose,
}: SummaryPanelProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const headingId = useId();
  const [attempt, setAttempt] = useState(0);
  const [room, setRoom] = useState("");

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || dialog.open) return;
    dialog.showModal();
    headingRef.current?.focus();
  }, []);

  const close = () => dialogRef.current?.close();

  return (
    <dialog
      ref={dialogRef}
      className={styles.sheet}
      aria-labelledby={headingId}
      data-ui="summary"
      onClose={onClose}
    >
      <header className={styles.head}>
        <div className={styles.heading}>
          <h2
            id={headingId}
            ref={headingRef}
            className={styles.title}
            tabIndex={-1}
          >
            {SUMMARY_COPY.title}
          </h2>
          <p className={styles.room}>{room}</p>
        </div>
        <button
          type="button"
          className={cx(styles.action, styles.close)}
          data-ui="summary-close"
          onClick={close}
        >
          {SUMMARY_COPY.close}
        </button>
      </header>
      <SummaryBody
        key={attempt}
        stores={stores}
        roomId={roomId}
        onRoom={setRoom}
        onRetry={() => setAttempt((value) => value + 1)}
        onClose={close}
      />
    </dialog>
  );
}

/** One request per mount; 다시 요약 mounts a fresh body that reads the wall as it is now. */
function SummaryBody({
  stores,
  roomId,
  onRoom,
  onRetry,
  onClose,
}: {
  stores: ClientStores;
  roomId: string;
  onRoom: (room: string) => void;
  onRetry: () => void;
  onClose: () => void;
}) {
  const [input, setInput] = useState<SummaryInput | null>(null);
  const [outcome, setOutcome] = useState<SummaryOutcome | null>(null);
  const [notTaken, setNotTaken] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const next = summaryInput(stores, roomId, SUMMARY_COPY.untitled);
    setInput(next);
    onRoom(next.room);
    void requestSummary(next, controller.signal).then((answer) => {
      if (!controller.signal.aborted) setOutcome(answer);
    });
    return () => controller.abort();
  }, [stores, roomId, onRoom]);

  const insert = (draft: string) => {
    if (!hasDraftTaker(roomId)) {
      setNotTaken(true);
      return;
    }
    // Close first: the dialog hands focus back to its opener, then the composer takes it.
    onClose();
    offerDraft(roomId, draft);
  };

  const summary = outcome?.kind === "ok" ? outcome.summary : null;

  return (
    <div
      className={styles.body}
      data-ui="summary-body"
      aria-busy={outcome === null || undefined}
    >
      {input && input.messages.length > 0 ? (
        <p className={styles.muted}>
          {SUMMARY_COPY.lead(input.messages.length)}
        </p>
      ) : null}
      {outcome === null ? (
        <div className={styles.loading} role="status">
          <Cat height={32} />
          <p>{SUMMARY_COPY.loading}</p>
        </div>
      ) : null}
      {outcome && outcome.kind !== "ok" ? (
        <div
          className={styles.notice}
          role="alert"
          data-ui="summary-error"
          data-code={outcome.kind === "failed" ? outcome.code : outcome.kind}
        >
          <p>{failureCopy(outcome)}</p>
          {outcome.kind === "failed" ? <code>{outcome.code}</code> : null}
          {outcome.kind !== "empty" ? (
            <button
              type="button"
              className={styles.action}
              data-ui="summary-retry"
              onClick={onRetry}
            >
              {SUMMARY_COPY.retry}
            </button>
          ) : null}
        </div>
      ) : null}
      {summary ? (
        <>
          <section className={styles.section} data-ui="summary-decisions">
            <h3 className={styles.label}>{SUMMARY_COPY.decisions}</h3>
            <Items items={summary.decisions} />
          </section>
          <section className={styles.section} data-ui="summary-todos">
            <h3 className={styles.label}>{SUMMARY_COPY.todos}</h3>
            <Items items={summary.todos} />
          </section>
          <section className={styles.section} data-ui="summary-draft">
            <h3 className={styles.label}>{SUMMARY_COPY.draft}</h3>
            {summary.draft === "" ? (
              <p className={styles.muted}>{SUMMARY_COPY.none}</p>
            ) : (
              <>
                <p className={styles.draft} data-ui="summary-draft-text">
                  {summary.draft}
                </p>
                <div className={styles.insertRow}>
                  <button
                    type="button"
                    className={styles.action}
                    data-ui="summary-insert"
                    onClick={() => insert(summary.draft)}
                  >
                    {SUMMARY_COPY.insert}
                  </button>
                  <span className={styles.muted}>
                    {SUMMARY_COPY.insertHint}
                  </span>
                </div>
                {notTaken ? (
                  <p className={styles.muted} role="alert">
                    {SUMMARY_COPY.noComposer}
                  </p>
                ) : null}
              </>
            )}
          </section>
        </>
      ) : null}
    </div>
  );
}
