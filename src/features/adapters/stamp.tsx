import type { AdapterMessage } from "../../transport/adapters";
import { cx } from "../../ui";
import { type Receipt, sharedReceipt } from "./receipt";
import styles from "./Thread.module.css";

// Where more than one account reads the room, the contract's receipt is about
// any one of them, and the words say so.
const RECEIPT = {
  one: { sent: "보냄", delivered: "전달됨", read: "읽음" },
  any: { sent: "보냄", delivered: "1명 이상 전달됨", read: "1명 이상 읽음" },
} satisfies Record<"one" | "any", Record<Receipt, string>>;

/**
 * What stands outside a bubble at its foot: the clock, with 수정됨 before it,
 * and over them what the messenger confirmed about my message. Inside a run
 * only the last turn shows the clock; the others keep it for screen readers,
 * and a receipt then stands in its place.
 */
export function Stamp({
  members,
  direct,
  edited,
  label,
  sentAt,
  last,
}: {
  /** The turn's messages: an album shares one receipt. */
  members: readonly AdapterMessage[];
  /**
   * The room is with one other account (`Room.kind: direct`), so a receipt is
   * that account's. Anywhere else, and until the room is known, it is about
   * at least one reader.
   */
  direct: boolean;
  edited: string | null;
  label: string;
  sentAt: string;
  last: boolean;
}) {
  const receipt = sharedReceipt(members);
  const clock = (
    <span className={styles.time}>
      {edited ? <span>{edited}</span> : null}
      <time className={last ? undefined : "sr-only"} dateTime={sentAt}>
        {label}
      </time>
    </span>
  );
  if (!receipt) return clock;
  return (
    <span className={cx(styles.stamp, (last || edited) && styles.stacked)}>
      <span
        className={styles.time}
        data-ui="adapter-receipt"
        data-receipt={receipt}
      >
        {RECEIPT[direct ? "one" : "any"][receipt]}
      </span>
      {clock}
    </span>
  );
}
