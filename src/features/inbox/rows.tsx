import type { RoomSnapshot } from "../../core/stores";
import { cx, formatTime, RoomAvatar, UnreadBadge } from "../../ui";
import { ProviderMark } from "../../ui/ProviderMark";
import styles from "./Inbox.module.css";

export const COPY = {
  nav: "대화 목록",
  search: "대화방 이름 검색",
  searchPlaceholder: "대화방 검색",
  kakao: "카카오",
  kakaoLoading: "카카오 대화 목록을 불러오는 중입니다.",
  adapterLoading: (name: string) => `${name} 방 목록을 불러오는 중입니다.`,
  adapterProblem: (name: string, sentence: string) =>
    `${name} 방 목록을 불러오지 못했습니다. ${sentence}`,
  empty: "표시할 방이 없습니다.",
  emptySearch: "불러온 대화방 이름 중에 맞는 것이 없습니다.",
  noText: "텍스트 없는 메시지",
  me: "나: ",
  adapterUnread: (count: number) =>
    `안 읽음 ${count.toLocaleString("ko-KR")}개`,
  from: (name: string) => `${name} 대화`,
} as const;

export type Row = {
  key: string;
  provider: string;
  providerName: string;
  /** Artwork from the connected provider declaration, with an initial fallback. */
  mark: string;
  icon?: string | undefined;
  title: string;
  at: string | null;
  preview: string | null;
  unread: number;
  unreadLabel: string;
  href: string;
  images?: RoomSnapshot["room"]["images"];
};

export function sortRows(rows: Row[]): Row[] {
  const time = (row: Row) => (row.at ? Date.parse(row.at) : Number.NaN);
  return rows.sort((a, b) => {
    const left = time(a);
    const right = time(b);
    if (Number.isNaN(left) !== Number.isNaN(right))
      return Number.isNaN(left) ? 1 : -1;
    if (!Number.isNaN(left) && left !== right) return right - left;
    return a.title.localeCompare(b.title, "ko-KR");
  });
}

export function InboxRow({
  row,
  active,
  now,
}: {
  row: Row;
  active: boolean;
  now: Date;
}) {
  const time = formatTime(row.at, now);
  return (
    <li
      className={cx(styles.row, active && styles.active)}
      data-ui="inbox-row"
      data-provider={row.provider}
    >
      <a
        className={styles.link}
        href={row.href}
        aria-current={active ? "page" : undefined}
      >
        <span className={styles.avatar}>
          <RoomAvatar name={row.title} size={48} images={row.images} />
          <span
            className={styles.provider}
            role="img"
            aria-label={COPY.from(row.providerName)}
          >
            <ProviderMark
              className={styles.mark}
              src={row.icon}
              mark={row.mark}
            />
          </span>
        </span>
        <span className={styles.body}>
          <span className={styles.top}>
            <span className={styles.title}>{row.title}</span>
            {row.at ? (
              <time className={styles.time} dateTime={time.dateTime ?? ""}>
                {time.label}
              </time>
            ) : null}
          </span>
          <span className={styles.bottom}>
            <span className={styles.preview}>{row.preview}</span>
            {row.unread > 0 ? (
              <span className={styles.badge}>
                <UnreadBadge count={row.unread} />
                <span className="sr-only">{row.unreadLabel}</span>
              </span>
            ) : null}
          </span>
        </span>
      </a>
    </li>
  );
}
