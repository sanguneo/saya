import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { BoundedCache } from "../../core/cache";
import type { ContextWindows } from "../../core/context";
import type { ClientStores } from "../../core/stores";
import type { HttpClient } from "../../transport/http";
import { cx, RoomAvatar, UnreadBadge } from "../../ui";
import { useSlice } from "../rooms";
import styles from "./Assist.module.css";
import { AssistCell } from "./AssistCell";
import { ASSIST_COPY } from "./copy";
import {
  loadPicks,
  MAX_PICKS,
  rankRooms,
  savePicks,
  togglePick,
} from "./picks";
import { type AssistSettings, probeAssist } from "./requests";

function storage(): Storage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function ChooserRow({
  stores,
  roomId,
  checked,
  disabled,
  onToggle,
}: {
  stores: ClientStores;
  roomId: string;
  checked: boolean;
  disabled: boolean;
  onToggle: (roomId: string) => void;
}) {
  const snapshot = useSlice(stores, `room.${roomId}`);
  const title = snapshot?.room.title ?? ASSIST_COPY.untitled;
  return (
    <li>
      <label className={styles.row} data-ui="assist-choice">
        <input
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={() => onToggle(roomId)}
        />
        <RoomAvatar name={title} size={32} images={snapshot?.room.images} />
        <span className={styles.rowTitle}>{title}</span>
        {snapshot && snapshot.room.unread > 0 ? (
          <UnreadBadge count={snapshot.room.unread} />
        ) : null}
      </label>
    </li>
  );
}

function Chooser({
  stores,
  picks,
  onChange,
  onClose,
}: {
  stores: ClientStores;
  picks: readonly string[];
  onChange: (ids: string[]) => void;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const heading = useId();
  const order = useSlice(stores, "rooms.order");
  // biome-ignore lint/correctness/useExhaustiveDependencies: the ranking is read again whenever the catalog changes.
  const ranked = useMemo(() => rankRooms(stores), [stores, order]);
  const full = picks.length >= MAX_PICKS;
  useEffect(() => {
    const element = dialog.current;
    if (element && !element.open) element.showModal();
    return () => element?.close();
  }, []);
  return (
    <dialog
      ref={dialog}
      className={styles.sheet}
      aria-labelledby={heading}
      data-ui="assist-chooser"
      onClose={onClose}
    >
      <div className={styles.sheetHead}>
        <h2 id={heading}>{ASSIST_COPY.sheet}</h2>
        <p className={styles.quiet}>{ASSIST_COPY.sheetHint}</p>
        <div className={styles.sheetActions}>
          <button
            type="button"
            className={styles.small}
            data-ui="assist-fill"
            onClick={() => onChange(ranked.slice(0, MAX_PICKS))}
          >
            {ASSIST_COPY.fill}
          </button>
          <button
            type="button"
            className={styles.small}
            onClick={() => onChange([])}
          >
            {ASSIST_COPY.clear}
          </button>
        </div>
        {full ? <p className={styles.quiet}>{ASSIST_COPY.full}</p> : null}
      </div>
      <ul className={styles.rows}>
        {ranked.map((id) => (
          <ChooserRow
            key={id}
            stores={stores}
            roomId={id}
            checked={picks.includes(id)}
            disabled={full && !picks.includes(id)}
            onToggle={(roomId) => onChange(togglePick(picks, roomId))}
          />
        ))}
      </ul>
      <div className={styles.sheetFoot}>
        <button
          type="button"
          className={styles.primary}
          data-ui="assist-chooser-done"
          onClick={() => dialog.current?.close()}
        >
          {ASSIST_COPY.done}
        </button>
      </div>
    </dialog>
  );
}

function TabLabel({
  stores,
  roomId,
}: {
  stores: ClientStores;
  roomId: string;
}) {
  const snapshot = useSlice(stores, `room.${roomId}`);
  return (
    <>
      <span className={styles.tabTitle}>
        {snapshot?.room.title ?? ASSIST_COPY.untitled}
      </span>
      {snapshot && snapshot.room.unread > 0 ? (
        <UnreadBadge count={snapshot.room.unread} />
      ) : null}
    </>
  );
}

/**
 * 문의 모아보기: up to eight KakaoTalk rooms side by side, each with its live
 * wall, a line on what the other person wants, checked reply candidates and
 * the room's own composer. Nothing is sent from here except through that
 * composer's confirmation; a candidate only fills the input box.
 */
export default function AssistScreen({
  stores,
  windows,
  http,
  cache,
}: {
  stores: ClientStores;
  windows: ContextWindows;
  http: HttpClient;
  cache: BoundedCache;
}) {
  const [picks, setPicks] = useState<string[]>(() => loadPicks(storage()));
  const [settings, setSettings] = useState<AssistSettings | null | "checking">(
    "checking",
  );
  const [prefixOn, setPrefixOn] = useState(false);
  const [choosing, setChoosing] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const order = useSlice(stores, "rooms.order");
  const known = useMemo(() => new Set(order), [order]);
  const shown = picks.filter((id) => known.has(id));
  const current = shown.includes(active ?? "") ? active : (shown[0] ?? null);
  const large = expanded !== null && shown.includes(expanded) ? expanded : null;

  useEffect(() => {
    let live = true;
    void probeAssist().then((found) => {
      if (!live) return;
      setSettings(found);
      setPrefixOn(found?.prefixOn ?? false);
    });
    return () => {
      live = false;
    };
  }, []);

  const shownKey = shown.join(",");
  const [resident, setResident] = useState("");
  // biome-ignore lint/correctness/useExhaustiveDependencies: keyed by the joined ids so an equal list is not re-applied.
  useEffect(() => {
    cache.showRooms(shown);
    setResident(shownKey);
  }, [cache, shownKey]);
  useEffect(() => () => cache.showRooms([]), [cache]);

  // A room is drawn only once the cache holds it, so its first window is never evicted under it.
  const residentIds = new Set(resident.split(","));
  const drawn = shown.filter((id) => residentIds.has(id));

  const change = (ids: string[]) => {
    setPicks(ids);
    savePicks(storage(), ids);
  };
  const prefix =
    settings !== null && settings !== "checking" ? settings.prefix : "";

  return (
    <div className={styles.screen} data-ui="assist">
      <header className={styles.head}>
        <h1 className={styles.title}>{ASSIST_COPY.title}</h1>
        <span className={styles.count} data-ui="assist-count">
          {ASSIST_COPY.count(shown.length, MAX_PICKS)}
        </span>
        <button
          type="button"
          className={styles.primary}
          data-ui="assist-choose"
          onClick={() => setChoosing(true)}
        >
          {ASSIST_COPY.choose}
        </button>
        {settings !== null && settings !== "checking" ? (
          <label
            className={styles.toggle}
            data-ui="assist-prefix"
            title={prefix === "" ? ASSIST_COPY.noPrefixHint : undefined}
          >
            <input
              type="checkbox"
              checked={prefix !== "" && prefixOn}
              disabled={prefix === ""}
              onChange={(event) => setPrefixOn(event.currentTarget.checked)}
            />
            {prefix === "" ? ASSIST_COPY.noPrefix : ASSIST_COPY.prefix(prefix)}
          </label>
        ) : null}
      </header>
      {shown.length > 1 ? (
        <div
          className={styles.tabs}
          role="tablist"
          aria-label={ASSIST_COPY.tabs}
        >
          {shown.map((id) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={id === current}
              className={styles.tab}
              data-ui="assist-tab"
              onClick={() => setActive(id)}
            >
              <TabLabel stores={stores} roomId={id} />
            </button>
          ))}
        </div>
      ) : null}
      {shown.length === 0 ? (
        <div className={styles.empty} data-ui="assist-empty">
          <p>{ASSIST_COPY.empty}</p>
          <button
            type="button"
            className={styles.primary}
            onClick={() => setChoosing(true)}
          >
            {ASSIST_COPY.choose}
          </button>
        </div>
      ) : (
        <div
          className={cx(
            styles.grid,
            shown.length <= 4 && styles.oneRow,
            large !== null && styles.expanded,
          )}
          data-ui="assist-grid"
          data-count={shown.length}
        >
          {drawn.map((id) => (
            <AssistCell
              key={id}
              stores={stores}
              windows={windows}
              http={http}
              roomId={id}
              settings={settings}
              prefixOn={prefixOn}
              active={id === current}
              expanded={id === large}
              compact={large !== null && id !== large}
              onExpand={(roomId) => {
                setExpanded(roomId);
                if (roomId) setActive(roomId);
              }}
              onRemove={(roomId) =>
                change(picks.filter((item) => item !== roomId))
              }
            />
          ))}
        </div>
      )}
      {choosing ? (
        <Chooser
          stores={stores}
          picks={picks}
          onChange={change}
          onClose={() => setChoosing(false)}
        />
      ) : null}
    </div>
  );
}
