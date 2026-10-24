import { adapterMark, cx } from "../ui";
import { KAKAO_ICON, ProviderMark } from "../ui/ProviderMark";
import type { AdapterTab } from "./adapterTabs";
import styles from "./ListTabs.module.css";
import {
  ALL_HASH,
  ASSIST_HASH,
  adapterListHash,
  type ListMode,
  ROOMS_HASH,
  SETTINGS_HASH,
} from "./routes";

const COPY = {
  group: "메신저",
  all: "전체",
  kakao: "카카오",
  assist: "문의 모아보기",
  settings: "설정",
} as const;

/** The rail's sections as a row of pills, for the width where the rail is not drawn. */
export function ListTabs({
  mode,
  adapters,
  kakaoVisible = true,
}: {
  mode: ListMode;
  adapters: AdapterTab[];
  kakaoVisible?: boolean;
}) {
  const items = [
    {
      key: "all",
      icon: undefined,
      mark: undefined,
      label: COPY.all,
      href: ALL_HASH,
      current: mode.kind === "all",
    },
    ...(kakaoVisible
      ? [
          {
            key: "kakao",
            icon: KAKAO_ICON,
            mark: "K",
            label: COPY.kakao,
            href: ROOMS_HASH,
            current: mode.kind === "kakao",
          },
          {
            key: "assist",
            icon: undefined,
            mark: undefined,
            label: COPY.assist,
            href: ASSIST_HASH,
            current: false,
          },
        ]
      : []),
    ...adapters
      .filter((tab) => tab.connection.kind === "connected")
      .map((tab) => ({
        key: `adapter:${tab.id}`,
        icon: tab.icon === undefined ? undefined : tab.iconSrc,
        mark: adapterMark(tab.name),
        label: tab.name,
        href: adapterListHash(tab.id),
        current: mode.kind === "adapter" && mode.adapterId === tab.id,
      })),
  ];
  return (
    <nav className={styles.tabs} aria-label={COPY.group} data-ui="list-tabs">
      {items.map((item) => (
        <a
          key={item.key}
          className={cx(styles.tab, item.current && styles.current)}
          href={item.href}
          aria-current={item.current || undefined}
        >
          {item.mark ? (
            <ProviderMark
              className={styles.mark}
              src={item.icon}
              mark={item.mark}
            />
          ) : null}
          {item.label}
        </a>
      ))}
      <a
        className={cx(styles.tab, styles.settings)}
        href={SETTINGS_HASH}
        data-ui="list-tabs-settings"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
        {COPY.settings}
      </a>
    </nav>
  );
}
