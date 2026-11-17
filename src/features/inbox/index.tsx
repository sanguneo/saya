import { type ReactNode, useMemo, useState } from "react";
import type { AdapterTab } from "../../app/adapterTabs";
import { adapterRoomHash, roomHash } from "../../app/routes";
import type { ClientStores } from "../../core/stores";
import { iconUrl, mediaUrl, roomFeature } from "../../transport/adapters";
import { adapterMark, cx, unreadName } from "../../ui";
import { KAKAO_ICON } from "../../ui/ProviderMark";
import { problemSentence } from "../adapters/copy";
import { useAdapterRooms, useKakaoSnapshots } from "./catalog";
import { DiscordTree } from "./DiscordTree";
import { discordPlace, discordTree } from "./discordPlaces";
import styles from "./Inbox.module.css";
import { COPY, InboxRow, type Row, sortRows } from "./rows";

export type InboxMode =
  | { kind: "all" }
  | { kind: "adapter"; adapterId: string };

export interface InboxProps {
  stores: ClientStores;
  mode: InboxMode;
  adapters: AdapterTab[];
  /** The KakaoTalk catalog as the app holds it; only the all list shows it. */
  kakao: { state: "loading" | "ready" | "unavailable"; onRetry: () => void };
  /** The room the route names, keyed by provider, or null. */
  active: { provider: string; roomId: string } | null;
  heading: string;
  className?: string | undefined;
  /** The app's own controls beside the heading: theme, agent tools. */
  actions?: ReactNode | undefined;
}

/**
 * One list over several messengers, newest activity first: KakaoTalk rooms
 * from the catalog this tab holds, and each adapter's rooms as it declares
 * them. In 전체, disconnected sources quietly contribute no rooms.
 */
export default function Inbox({
  stores,
  mode,
  adapters,
  kakao,
  active,
  heading,
  className,
  actions,
}: InboxProps) {
  const [query, setQuery] = useState("");
  const all = mode.kind === "all";
  const kakaoRooms = useKakaoSnapshots(stores, all && kakao.state === "ready");
  const shown = useMemo(
    () =>
      all
        ? adapters.filter((tab) => tab.connection.kind === "connected")
        : adapters.filter(
            (tab) => mode.kind === "adapter" && tab.id === mode.adapterId,
          ),
    [all, adapters, mode],
  );
  const adapterIds = useMemo(
    () =>
      mode.kind === "adapter" ? [mode.adapterId] : shown.map((tab) => tab.id),
    [mode, shown],
  );
  const adapterRooms = useAdapterRooms(adapterIds);
  const nameOf = (id: string) =>
    adapters.find((tab) => tab.id === id)?.name ?? id;
  const words = query.trim().toLocaleLowerCase("ko-KR");
  // One adapter whose rooms say where its own sidebar draws them is drawn as that sidebar.
  const treeEntry =
    mode.kind === "adapter" ? adapterRooms.get(mode.adapterId) : undefined;
  const tree = useMemo(() => {
    if (treeEntry?.state !== "ready") return null;
    if (!treeEntry.rooms.some((room) => discordPlace(room))) return null;
    return discordTree(
      words
        ? treeEntry.rooms.filter((room) =>
            room.title.toLocaleLowerCase("ko-KR").includes(words),
          )
        : treeEntry.rooms,
    );
  }, [treeEntry, words]);

  const rows = useMemo(() => {
    const list: Row[] = kakaoRooms.map(({ room, preview }) => ({
      key: `kakao:${room.id}`,
      provider: "kakao",
      providerName: COPY.kakao,
      mark: "K",
      icon: KAKAO_ICON,
      title: room.title,
      at: room.lastActivityAt,
      preview,
      unread: room.unread,
      unreadLabel: unreadName(room.unread),
      href: roomHash(room.id),
      images: room.images,
    }));
    for (const id of adapterIds) {
      const entry = adapterRooms.get(id);
      if (entry?.state !== "ready") continue;
      const tab = adapters.find((tab) => tab.id === id);
      const providerName = tab?.name ?? id;
      const icon =
        tab?.connection.kind === "connected"
          ? iconUrl(id, tab.icon)
          : undefined;
      for (const room of entry.rooms) {
        if (tree && discordPlace(room)) continue;
        list.push({
          key: `${id}:${room.id}`,
          provider: id,
          providerName,
          mark: adapterMark(providerName),
          icon,
          title: room.title,
          at: room.lastActivityAt ?? null,
          preview: room.lastMessage
            ? (room.lastMessage.fromMe ? COPY.me : "") +
              (room.lastMessage.text || COPY.noText)
            : null,
          unread: room.unread,
          unreadLabel: COPY.adapterUnread(room.unread),
          href: adapterRoomHash(id, room.id),
          images:
            tab?.connection.kind === "connected" &&
            roomFeature(
              tab.connection.capabilities.features,
              room,
              "attachments.read",
            ) &&
            room.avatar
              ? [mediaUrl(id, room.avatar)]
              : undefined,
        });
      }
    }
    return sortRows(list);
  }, [kakaoRooms, adapterIds, adapterRooms, adapters, tree]);

  const visible = words
    ? rows.filter((row) => row.title.toLocaleLowerCase("ko-KR").includes(words))
    : rows;
  const now = new Date();
  const lines: ReactNode[] = [];
  if (all && kakao.state === "loading")
    lines.push(
      <p key="kakao">
        <span data-ui="theme-loader" aria-hidden="true" />
        {COPY.kakaoLoading}
      </p>,
    );
  if (all)
    for (const tab of adapters)
      if (tab.connection.kind === "checking")
        lines.push(
          <p key={tab.id}>
            <span data-ui="theme-loader" aria-hidden="true" />
            {COPY.adapterLoading(tab.name)}
          </p>,
        );
  for (const id of adapterIds) {
    const entry = adapterRooms.get(id);
    if (!entry || entry.state === "loading")
      lines.push(
        <p key={id}>
          <span data-ui="theme-loader" aria-hidden="true" />
          {COPY.adapterLoading(nameOf(id))}
        </p>,
      );
    else if (!all && entry.state === "problem")
      lines.push(
        <p key={id}>
          {COPY.adapterProblem(nameOf(id), problemSentence(entry.problem))}
        </p>,
      );
  }

  return (
    <nav
      className={cx(styles.pane, className)}
      aria-label={COPY.nav}
      data-ui="inbox"
      data-mode={mode.kind}
    >
      <div className={styles.head}>
        <div className={styles.headTop}>
          <h1 className={styles.heading}>{heading}</h1>
          <button
            type="button"
            data-ui="theme-badge"
            aria-label="캐릭터 춤추기"
            title="캐릭터 춤추기"
            onClick={(event) => {
              if (!matchMedia("(prefers-reduced-motion: reduce)").matches)
                event.currentTarget.dataset.dancing = "";
            }}
            onAnimationEnd={(event) => {
              delete event.currentTarget.dataset.dancing;
            }}
          />
          {actions}
        </div>
        <div className={styles.search}>
          <svg viewBox="0 0 16 16" aria-hidden="true">
            <circle cx="6.75" cy="6.75" r="4.75" />
            <path d="M10.25 10.25 13.5 13.5" />
          </svg>
          <input
            aria-label={COPY.search}
            type="search"
            placeholder={COPY.searchPlaceholder}
            value={query}
            onChange={(event) => setQuery(event.currentTarget.value)}
          />
        </div>
      </div>
      <div className={styles.scroller} data-ui="inbox-scroller">
        {lines.length ? <div className={styles.lines}>{lines}</div> : null}
        {tree && mode.kind === "adapter" && tree.guilds.length ? (
          <DiscordTree
            adapterId={mode.adapterId}
            guilds={tree.guilds}
            activeId={
              active?.provider === mode.adapterId ? active.roomId : null
            }
          />
        ) : null}
        {visible.length ? (
          <ul className={styles.list}>
            {visible.map((row) => (
              <InboxRow
                key={row.key}
                row={row}
                now={now}
                active={
                  active !== null &&
                  active.provider === row.provider &&
                  row.key === `${active.provider}:${active.roomId}`
                }
              />
            ))}
          </ul>
        ) : lines.length || tree?.guilds.length ? null : (
          <p className={styles.empty}>
            {words ? COPY.emptySearch : COPY.empty}
          </p>
        )}
        {/* Where a theme's mascot rests below the last row; empty otherwise. */}
        <div data-ui="inbox-end" aria-hidden="true" />
      </div>
    </nav>
  );
}
