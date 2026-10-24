import { useMemo, useSyncExternalStore } from "react";
import type { ClientStores } from "../core/stores";
import { adapterMark, cx, UnreadBadge } from "../ui";
import { KAKAO_ICON, ProviderMark } from "../ui/ProviderMark";
import type { AdapterTab } from "./adapterTabs";
import styles from "./Rail.module.css";
import {
  ALL_HASH,
  ASSIST_HASH,
  adapterListHash,
  type ListMode,
  ROOMS_HASH,
  SETTINGS_HASH,
} from "./routes";

const RAIL_COPY = {
  nav: "메뉴",
  brand: "さや (saya)",
  all: "전체",
  kakao: "카카오",
  assist: "문의",
  settings: "설정",
  unread: (count: number) =>
    `데스크톱 기준 안 읽음 ${count.toLocaleString("ko-KR")}개`,
  adapterUnread: (name: string, count: number) =>
    `${name} 기준 안 읽음 ${count.toLocaleString("ko-KR")}개`,
} as const;

/**
 * The sum of the desktop's unread counts over the catalog. It is the desktop's
 * number, never one this client lowers (G2), so it moves only with `/rooms`.
 */
function createTotalUnread(stores: ClientStores) {
  const compute = () =>
    stores
      .getSnapshot("rooms.order")
      .reduce(
        (sum, id) => sum + (stores.getSnapshot(`room.${id}`)?.room.unread ?? 0),
        0,
      );
  const subscribe = (listener: () => void) => {
    let rooms: (() => void)[] = [];
    const watch = () => {
      for (const unsubscribe of rooms) unsubscribe();
      rooms = stores
        .getSnapshot("rooms.order")
        .map((id) => stores.subscribe(`room.${id}`, listener));
    };
    const order = stores.subscribe("rooms.order", () => {
      watch();
      listener();
    });
    watch();
    return () => {
      order();
      for (const unsubscribe of rooms) unsubscribe();
    };
  };
  return { subscribe, compute };
}

function useTotalUnread(stores: ClientStores): number {
  const source = useMemo(() => createTotalUnread(stores), [stores]);
  return useSyncExternalStore(source.subscribe, source.compute, source.compute);
}

/**
 * The left rail of the messenger arrangement: the mark, then 전체 (every
 * messenger, newest first), 카카오 (the KakaoTalk core), one item per adapter
 * connected to the proxy, and 설정 (which holds 연결) apart at the foot. Unusable
 * sources have no navigation item.
 */
export function Rail({
  stores,
  mode,
  page,
  adapters,
  className,
  kakaoVisible = true,
}: {
  stores: ClientStores;
  /** The list on screen, or null on 설정. */
  mode: ListMode | null;
  /** Which wide view is on screen, when no list is. */
  page?: "settings" | "assist" | undefined;
  adapters: AdapterTab[];
  className?: string | undefined;
  kakaoVisible?: boolean;
}) {
  const unread = useTotalUnread(stores);
  return (
    <nav
      className={cx(styles.rail, className)}
      aria-label={RAIL_COPY.nav}
      data-ui="rail"
    >
      <span className={styles.brand} role="img" aria-label={RAIL_COPY.brand}>
        <span lang="ja" aria-hidden="true">
          さ
        </span>
      </span>
      <a
        className={styles.item}
        href={ALL_HASH}
        aria-current={mode?.kind === "all" || undefined}
        data-ui="rail-all"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 6.5A1.5 1.5 0 0 1 5.5 5h9A1.5 1.5 0 0 1 16 6.5v6a1.5 1.5 0 0 1-1.5 1.5H9l-3.5 3v-3h0A1.5 1.5 0 0 1 4 12.5z" />
          <path d="M19 9.5h.5A1.5 1.5 0 0 1 21 11v6a1.5 1.5 0 0 1-1.5 1.5H19v2.5l-3-2.5h-4.5A1.5 1.5 0 0 1 10 17v-1" />
        </svg>
        <span className={styles.label}>{RAIL_COPY.all}</span>
      </a>
      {kakaoVisible ? (
        <a
          className={styles.item}
          href={ROOMS_HASH}
          aria-current={mode?.kind === "kakao" || undefined}
          data-ui="rail-kakao"
        >
          <ProviderMark className={styles.mark} src={KAKAO_ICON} mark="K" />
          <span className={styles.label}>{RAIL_COPY.kakao}</span>
          {unread > 0 ? (
            <span className={styles.badge}>
              <UnreadBadge count={unread} />
              <span className="sr-only">{RAIL_COPY.unread(unread)}</span>
            </span>
          ) : null}
        </a>
      ) : null}
      {kakaoVisible ? (
        <a
          className={styles.item}
          href={ASSIST_HASH}
          aria-current={page === "assist" || undefined}
          data-ui="rail-assist"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <rect x="3.5" y="4" width="7" height="7" rx="1.5" />
            <rect x="13.5" y="4" width="7" height="7" rx="1.5" />
            <rect x="3.5" y="13" width="7" height="7" rx="1.5" />
            <rect x="13.5" y="13" width="7" height="7" rx="1.5" />
          </svg>
          <span className={styles.label}>{RAIL_COPY.assist}</span>
        </a>
      ) : null}
      {adapters
        .filter((tab) => tab.connection.kind === "connected")
        .map((tab) => (
          <a
            key={tab.id}
            className={styles.item}
            href={adapterListHash(tab.id)}
            aria-current={
              (mode?.kind === "adapter" && mode.adapterId === tab.id) ||
              undefined
            }
            data-ui="rail-adapter"
          >
            <ProviderMark
              className={styles.mark}
              src={tab.icon === undefined ? undefined : tab.iconSrc}
              mark={adapterMark(tab.name)}
            />
            <span className={styles.label}>{tab.name}</span>
            {tab.unread ? (
              <span className={styles.badge}>
                <UnreadBadge count={tab.unread} />
                <span className="sr-only">
                  {RAIL_COPY.adapterUnread(tab.name, tab.unread)}
                </span>
              </span>
            ) : null}
          </a>
        ))}
      <a
        className={cx(styles.item, styles.foot)}
        href={SETTINGS_HASH}
        aria-current={page === "settings" || undefined}
        data-ui="rail-settings"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
        <span className={styles.label}>{RAIL_COPY.settings}</span>
      </a>
    </nav>
  );
}
