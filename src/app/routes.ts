import { useMemo, useSyncExternalStore } from "react";

/**
 * Hash routes. Room ids are opaque wire strings: they are percent-encoded into
 * the hash and decoded back, never parsed, compared numerically or shortened.
 */
export type Route =
  | { kind: "rooms" }
  | { kind: "room"; roomId: string }
  | { kind: "all" }
  | { kind: "adapter-list"; adapterId: string }
  | { kind: "settings"; tab: SettingsTab }
  | { kind: "assist" }
  | { kind: "adapter-room"; adapterId: string; roomId: string };

/** Which list the list column shows: everything, KakaoTalk, or one adapter. */
export type ListMode =
  | { kind: "all" }
  | { kind: "kakao" }
  | { kind: "adapter"; adapterId: string };

/** 설정's tabs, in the order they are drawn; 연결 is one of them. */
export const SETTINGS_TABS = ["theme", "agent", "connection", "about"] as const;
export type SettingsTab = (typeof SETTINGS_TABS)[number];

export const ROOMS_HASH = "#/rooms";
export const ALL_HASH = "#/all";
export const SETTINGS_HASH = "#/settings";
export const ADAPTERS_HASH = "#/settings/connection";
/** 문의 모아보기: several KakaoTalk rooms on one screen. */
export const ASSIST_HASH = "#/assist";

export function settingsHash(tab: SettingsTab): string {
  return tab === "theme" ? SETTINGS_HASH : `${SETTINGS_HASH}/${tab}`;
}

export function roomHash(roomId: string): string {
  return `#/room/${encodeURIComponent(roomId)}`;
}

export function adapterListHash(adapterId: string): string {
  return `#/list/${encodeURIComponent(adapterId)}`;
}

export function adapterRoomHash(adapterId: string, roomId: string): string {
  return `#/adapters/${encodeURIComponent(adapterId)}/${encodeURIComponent(roomId)}`;
}

export function listHash(mode: ListMode): string {
  if (mode.kind === "all") return ALL_HASH;
  if (mode.kind === "kakao") return ROOMS_HASH;
  return adapterListHash(mode.adapterId);
}

/** The list a route names, or null for a room or 설정. */
export function listModeOf(route: Route): ListMode | null {
  if (route.kind === "all") return { kind: "all" };
  if (route.kind === "rooms") return { kind: "kakao" };
  if (route.kind === "adapter-list")
    return { kind: "adapter", adapterId: route.adapterId };
  return null;
}

export function sameMode(a: ListMode, b: ListMode): boolean {
  return (
    a.kind === b.kind &&
    (a.kind !== "adapter" ||
      (b.kind === "adapter" && a.adapterId === b.adapterId))
  );
}

const INDEX: Route = { kind: "all" };
// `#/room/<id>` is the route this app writes; `#/rooms/<id>` is what
// core/ids.ts#roomHash spells, accepted so neither helper yields a dead link.
const ROOM = /^\/rooms?\/([^/]+)$/;
const ADAPTER_ROOM = /^\/adapters\/([^/]+)\/([^/]+)$/;
const ADAPTER_LIST = /^\/list\/([^/]+)$/;

export function parseHash(hash: string): Route {
  const path = hash.replace(/^#/, "").replace(/\?.*$/, "");
  // `#/adapters` was 연결 before it moved into 설정; old links still land there.
  if (path === "/adapters") return { kind: "settings", tab: "connection" };
  if (path === "/settings") return { kind: "settings", tab: "theme" };
  const tab = SETTINGS_TABS.find((name) => path === `/settings/${name}`);
  if (tab) return { kind: "settings", tab };
  if (path === "/all") return { kind: "all" };
  if (path === "/rooms") return { kind: "rooms" };
  if (path === "/assist") return { kind: "assist" };
  try {
    const adapterRoom = ADAPTER_ROOM.exec(path);
    if (adapterRoom?.[1] && adapterRoom[2])
      return {
        kind: "adapter-room",
        adapterId: decodeURIComponent(adapterRoom[1]),
        roomId: decodeURIComponent(adapterRoom[2]),
      };
    const adapterList = ADAPTER_LIST.exec(path);
    if (adapterList?.[1])
      return {
        kind: "adapter-list",
        adapterId: decodeURIComponent(adapterList[1]),
      };
    const match = ROOM.exec(path);
    if (!match?.[1]) return INDEX;
    const roomId = decodeURIComponent(match[1]);
    return roomId ? { kind: "room", roomId } : INDEX;
  } catch {
    // A malformed escape is not a room; the index is the honest fallback.
    return INDEX;
  }
}

function subscribeHash(listener: () => void) {
  window.addEventListener("hashchange", listener);
  return () => window.removeEventListener("hashchange", listener);
}

function readHash() {
  return window.location.hash;
}

/** The current route; the snapshot is the hash string so an unchanged hash never rerenders. */
export function useRoute(): Route {
  const hash = useSyncExternalStore(subscribeHash, readHash, readHash);
  return useMemo(() => parseHash(hash), [hash]);
}
