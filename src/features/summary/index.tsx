import { lazy, Suspense, useEffect, useState } from "react";
import type { ClientStores } from "../../core/stores";
import { cx } from "../../ui";
import styles from "../digest/DigestEntry.module.css";
import { summaryAvailable } from "./requests";

const ENTRY_COPY = { open: "오모냥 요약" } as const;

/** The panel and its styles load on the first press, never with the shell. */
const Panel = lazy(() => import("./SummaryPanel"));

export interface SummaryEntryProps {
  stores: ClientStores;
  roomId: string;
  className?: string | undefined;
}

/**
 * The room header's way into the summary panel. Drawn only when this
 * deployment's server says summaries are on; otherwise nothing at all.
 */
export function SummaryEntry({ stores, roomId, className }: SummaryEntryProps) {
  const [available, setAvailable] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let live = true;
    void summaryAvailable().then((on) => {
      if (live) setAvailable(on);
    });
    return () => {
      live = false;
    };
  }, []);

  if (!available) return null;
  return (
    <>
      <button
        type="button"
        className={cx(styles.open, className)}
        data-ui="summary-open"
        aria-haspopup="dialog"
        aria-expanded={open}
        title={ENTRY_COPY.open}
        onClick={() => setOpen(true)}
      >
        <span className="sr-only">{ENTRY_COPY.open}</span>
        <svg viewBox="0 0 18 18" aria-hidden="true">
          <path d="M3.5 4.5h7M3.5 8.5h5M3.5 12.5h4M13 9.5l.9 2 2 .9-2 .9-.9 2-.9-2-2-.9 2-.9z" />
        </svg>
      </button>
      {open ? (
        <Suspense fallback={null}>
          <Panel
            key={roomId}
            stores={stores}
            roomId={roomId}
            onClose={() => setOpen(false)}
          />
        </Suspense>
      ) : null}
    </>
  );
}
