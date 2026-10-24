import { describe, expect, test } from "bun:test";
import { BoundedCache } from "../../src/core/cache";
import { rankRooms, togglePick } from "../../src/features/assist/picks";
import { awaitingReply } from "../../src/features/assist/requests";
import { generateData } from "../fixtures/data";

describe("rooms on screen together", () => {
  test("eight rooms shown at once stay resident; without showRooms the fifth inactive room is evicted", () => {
    const data = generateData("baseline");
    const ids = data.rooms.slice(0, 9).map((room) => room.id);
    const load = (cache: BoundedCache) => {
      cache.setCatalog(data.rooms);
      for (const id of ids) {
        cache.putMessages(id, data.messages.get(id) ?? []);
      }
    };

    const plain = new BoundedCache();
    load(plain);
    expect(plain.getSnapshot().retainedRoomIds.length).toBeLessThan(8);

    const shown = new BoundedCache();
    shown.showRooms(ids.slice(0, 8));
    load(shown);
    const retained = shown.getSnapshot().retainedRoomIds;
    for (const id of ids.slice(0, 8)) expect(retained).toContain(id);
    expect(() => shown.showRooms(ids)).toThrow();
  });

  test("the chooser ranks by unread, then recent activity, and stops at eight", () => {
    const data = generateData("baseline");
    const cache = new BoundedCache();
    cache.setCatalog(data.rooms);
    const ranked = rankRooms(cache.stores);
    const unread = ranked.map(
      (id) => cache.stores.getSnapshot(`room.${id}`)?.room.unread ?? -1,
    );
    expect(unread).toEqual([...unread].sort((a, b) => b - a));
    expect(
      ranked.every(
        (id) => cache.stores.getSnapshot(`room.${id}`)?.room.readable,
      ),
    ).toBe(true);
    let picks: string[] = [];
    for (const id of ranked.slice(0, 10)) picks = togglePick(picks, id);
    expect(picks).toEqual(ranked.slice(0, 8));
    expect(togglePick(picks, picks[0] ?? "")).toHaveLength(7);
  });

  test("help is awaited only when the newest text is from the other side", () => {
    const data = generateData("baseline");
    const cache = new BoundedCache();
    cache.setCatalog(data.rooms);
    const room = data.rooms[0];
    if (!room) throw new Error("no room");
    const rows = data.messages.get(room.id) ?? [];
    const last = rows.at(-1);
    if (!last) throw new Error("no rows");
    cache.putMessages(room.id, [
      ...rows.slice(0, -1),
      {
        ...last,
        fromMe: false,
      },
    ]);
    expect(awaitingReply(cache.stores, room.id)).toBe(last.id);
    cache.putMessages(room.id, [
      ...rows.slice(0, -1),
      {
        ...last,
        fromMe: true,
      },
    ]);
    expect(awaitingReply(cache.stores, room.id)).toBeNull();
  });
});
