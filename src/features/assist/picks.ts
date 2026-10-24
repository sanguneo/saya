import type { ClientStores } from "../../core/stores";

export const MAX_PICKS = 8;
const KEY = "saya.assist.rooms";

/** The rooms chosen for 문의 모아보기, kept in this browser only. */
export function loadPicks(storage: Pick<Storage, "getItem"> | null): string[] {
  try {
    const raw = storage?.getItem(KEY);
    const value: unknown = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(value)) return [];
    return [
      ...new Set(value.filter((id): id is string => typeof id === "string")),
    ].slice(0, MAX_PICKS);
  } catch {
    return [];
  }
}

export function savePicks(
  storage: Pick<Storage, "setItem"> | null,
  ids: readonly string[],
): void {
  try {
    storage?.setItem(KEY, JSON.stringify(ids.slice(0, MAX_PICKS)));
  } catch {
    // A full or blocked storage only means the choice is not remembered.
  }
}

/** Adds or removes one room; adding past MAX_PICKS changes nothing. */
export function togglePick(ids: readonly string[], id: string): string[] {
  if (ids.includes(id)) return ids.filter((item) => item !== id);
  if (ids.length >= MAX_PICKS) return [...ids];
  return [...ids, id];
}

/**
 * Readable rooms for the chooser: the most unread first, then the most
 * recently active. Both numbers are the desktop's own; nothing is inferred.
 */
export function rankRooms(stores: ClientStores): string[] {
  const rooms = [];
  for (const id of stores.getSnapshot("rooms.order")) {
    const room = stores.getSnapshot(`room.${id}`)?.room;
    if (room?.readable) rooms.push(room);
  }
  return rooms
    .sort((a, b) =>
      a.unread !== b.unread
        ? b.unread - a.unread
        : (b.lastActivityAt ?? "").localeCompare(a.lastActivityAt ?? ""),
    )
    .map((room) => room.id);
}
