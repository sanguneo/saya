import { compareDecimalIds } from "./ids";
import {
  ClientStores,
  type Coverage,
  type GapReason,
  type Immutable,
  type Message,
  type PendingSend,
  type Room,
} from "./stores";
import { immutable } from "./stores/slices";

/** The plan's client resource policy. A caller may only tighten these. */
export type CacheLimits = {
  activeMessages: number;
  inactiveMessages: number;
  inactiveRooms: number;
  messageBytes: number;
  catalogBytes: number;
  previewCharacters: number;
  pendingCount: number;
  pendingBytes: number;
};
export const CACHE_LIMITS: Readonly<CacheLimits> = Object.freeze({
  activeMessages: 1000,
  inactiveMessages: 200,
  inactiveRooms: 4,
  messageBytes: 16 * 1024 * 1024,
  catalogBytes: 8 * 1024 * 1024,
  previewCharacters: 200,
  pendingCount: 32,
  pendingBytes: 1024 * 1024,
});
type Limits = Readonly<CacheLimits>;
/** 문의 모아보기 draws at most this many rooms at once. */
export const MAX_ON_SCREEN = 8;
type CapacityReason =
  | GapReason
  | "catalog-bytes"
  | "pending-count"
  | "pending-bytes";
export type CacheStatus = {
  kind: "ok" | "gap" | "over-capacity";
  reason: CapacityReason | null;
  roomId: string | null;
};
export type CacheSnapshot = {
  activeRoomId: string | null;
  retainedRoomIds: readonly string[];
  messageBytes: number;
  catalogBytes: number;
  pendingBytes: number;
  pendingCount: number;
  status: CacheStatus;
};
type Entry = { value: Immutable<Message>; bytes: number };
type CachedRoom = {
  messages: Map<string, Entry>;
  coverage: Immutable<Coverage> | null;
  cursor: string | null;
  gaps: Set<GapReason>;
};
const encoder = new TextEncoder();
/** Count complete serialized payloads (including metadata), not UTF-16 text length. */
export function payloadBytes(value: unknown): number {
  return encoder.encode(JSON.stringify(value)).byteLength;
}

/** Memory only. All evictions publish gaps; pending attempts require explicit removal. */
export class BoundedCache {
  readonly stores: ClientStores;
  readonly limits: Limits;
  private readonly rooms = new Map<string, CachedRoom>();
  private readonly pending = new Map<string, Immutable<PendingSend>>();
  private readonly anchors = new Map<string, string>();
  private activeRoomId: string | null = null;
  /** Rooms drawn side by side (문의 모아보기): never evicted for room count, like the active room. */
  private readonly onScreen = new Set<string>();
  private messageBytes = 0;
  private catalogBytes = 0;
  private pendingBytes = 0;
  private status: CacheStatus = { kind: "ok", reason: null, roomId: null };
  private snapshot: Immutable<CacheSnapshot>;
  private readonly listeners = new Set<() => void>();

  constructor(limits: Partial<Limits> = {}, stores = new ClientStores()) {
    this.limits = Object.freeze({ ...CACHE_LIMITS, ...limits });
    for (const key of Object.keys(CACHE_LIMITS) as (keyof Limits)[]) {
      const value = this.limits[key];
      if (
        !(
          value > 0 &&
          value <= CACHE_LIMITS[key] &&
          Math.floor(value) === value
        )
      )
        throw new RangeError(`Invalid cache bound: ${key}`);
    }
    this.stores = stores;
    this.snapshot = immutable(this.state());
  }

  readonly getSnapshot = (): Immutable<CacheSnapshot> => this.snapshot;
  readonly subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  selectRoom(roomId: string | null): void {
    this.change(() => {
      this.activeRoomId = roomId;
      if (roomId !== null) this.ensureRoom(roomId);
      this.enforce();
    });
  }

  /**
   * Keep these rooms resident while they are on screen together. They keep
   * the inactive message bound; only the room count stops evicting them.
   */
  showRooms(roomIds: readonly string[]): void {
    if (roomIds.length > MAX_ON_SCREEN)
      throw new RangeError("Too many rooms on screen");
    this.change(() => {
      this.onScreen.clear();
      for (const id of roomIds) {
        this.onScreen.add(id);
        this.ensureRoom(id);
      }
      this.enforce();
    });
  }

  /** Clear the surfaced banner only. Per-room gaps stay until that room is refetched. */
  acknowledgeStatus(): void {
    this.change(() => {
      this.status = { kind: "ok", reason: null, roomId: null };
    });
  }

  touchRoom(roomId: string): void {
    this.change(() => {
      const room = this.rooms.get(roomId);
      if (room) {
        this.rooms.delete(roomId);
        this.rooms.set(roomId, room);
      }
    });
  }

  setScrollAnchor(roomId: string, messageId: string | null): void {
    this.change(() => {
      if (messageId === null) this.anchors.delete(roomId);
      else this.anchors.set(roomId, messageId);
      this.enforce();
    });
  }

  setCatalog(rooms: readonly Room[]): boolean {
    const bytes = payloadBytes(rooms);
    let accepted = false;
    this.change(() => {
      if (bytes > this.limits.catalogBytes) {
        this.report("over-capacity", "catalog-bytes", null);
        return;
      }
      this.catalogBytes = bytes;
      this.stores.setCatalog(rooms);
      accepted = true;
    });
    return accepted;
  }

  putMessages(
    roomId: string,
    messages: readonly Message[],
    metadata: { coverage?: Coverage; cursor?: string | null } = {},
  ): { retained: boolean; status: Immutable<CacheStatus> } {
    // Input has already passed contract validation; a mismatched routing key is a caller error.
    if (messages.some((message) => message.roomId !== roomId))
      throw new Error("Message room does not match cache key");
    let retained = true;
    this.change(() => {
      const room = this.ensureRoom(roomId);
      if (metadata.coverage !== undefined)
        room.coverage = immutable(
          metadata.coverage,
          room.coverage ?? undefined,
        );
      if (metadata.cursor !== undefined) room.cursor = metadata.cursor;
      for (const message of messages) {
        this.observePreview(message);
        const bytes = payloadBytes(message);
        if (bytes > this.limits.messageBytes) {
          this.gap(roomId, room, "message-bytes", "over-capacity");
          retained = false;
          continue;
        }
        const previous = room.messages.get(message.id);
        const value = immutable(message, previous?.value);
        if (value === previous?.value) continue;
        this.messageBytes += bytes - (previous?.bytes ?? 0);
        room.messages.set(message.id, { value, bytes });
      }
      this.enforce();
      for (const message of messages) {
        if (!this.rooms.get(roomId)?.messages.has(message.id)) retained = false;
      }
      if (
        !retained &&
        this.status.kind !== "over-capacity" &&
        this.hasPins(roomId)
      ) {
        this.gap(roomId, room, "pinned-capacity", "over-capacity");
      }
    });
    return { retained, status: this.snapshot.status };
  }

  addPending(attempt: PendingSend): boolean {
    let accepted = false;
    this.change(() => {
      const previous = this.pending.get(attempt.attemptId);
      const bytes =
        this.pendingBytes -
        (previous ? payloadBytes(previous) : 0) +
        payloadBytes(attempt);
      const count = this.pending.size + (previous ? 0 : 1);
      const reason =
        count > this.limits.pendingCount
          ? "pending-count"
          : bytes > this.limits.pendingBytes
            ? "pending-bytes"
            : null;
      if (reason) {
        this.stores.setSend({ blocked: true, reason });
        this.report("over-capacity", reason, attempt.roomId);
        return;
      }
      this.pending.set(attempt.attemptId, immutable(attempt, previous));
      this.pendingBytes = bytes;
      if (previous && previous.roomId !== attempt.roomId)
        this.publishPending(previous.roomId);
      this.publishPending(attempt.roomId);
      this.updateSendCapacity();
      accepted = true;
    });
    return accepted;
  }

  removePending(attemptId: string): void {
    this.change(() => {
      const previous = this.pending.get(attemptId);
      if (!previous) return;
      this.pending.delete(attemptId);
      this.pendingBytes -= payloadBytes(previous);
      this.publishPending(previous.roomId);
      this.updateSendCapacity();
      this.enforce();
    });
  }

  private updateSendCapacity(): void {
    const reason =
      this.pending.size >= this.limits.pendingCount
        ? "pending-count"
        : this.pendingBytes >= this.limits.pendingBytes
          ? "pending-bytes"
          : null;
    this.stores.setSend({ blocked: reason !== null, reason });
  }

  private publishPending(roomId: string): void {
    this.stores.setPending(
      roomId,
      [...this.pending.values()].filter((attempt) => attempt.roomId === roomId),
    );
  }

  private ensureRoom(roomId: string): CachedRoom {
    let room = this.rooms.get(roomId);
    if (!room) {
      const previous = this.stores.getSnapshot(`thread.${roomId}`);
      room = {
        messages: new Map(),
        coverage: null,
        cursor: null,
        gaps: new Set(previous.gaps),
      };
    }
    this.rooms.delete(roomId);
    this.rooms.set(roomId, room);
    return room;
  }

  private observePreview(message: Message): void {
    let preview = "";
    let count = 0;
    // Iterate only the bounded prefix, not Array.from(full pathological body).
    for (const character of message.text) {
      if (count === this.limits.previewCharacters) break;
      preview += character;
      count++;
    }
    this.stores.setPreview(message.roomId, message.id, preview);
  }

  private pinned(roomId: string, messageId: string): boolean {
    if (this.anchors.get(roomId) === messageId) return true;
    for (const attempt of this.pending.values()) {
      if (attempt.roomId === roomId && attempt.messageId === messageId)
        return true;
    }
    return false;
  }

  private hasPins(roomId: string): boolean {
    if (this.anchors.has(roomId)) return true;
    for (const attempt of this.pending.values()) {
      if (attempt.roomId === roomId && attempt.messageId !== undefined)
        return true;
    }
    return false;
  }

  private enforce(): void {
    for (const [roomId, room] of this.rooms) {
      const limit =
        roomId === this.activeRoomId
          ? this.limits.activeMessages
          : this.limits.inactiveMessages;
      for (const id of [...room.messages.keys()].sort(compareDecimalIds)) {
        if (room.messages.size <= limit) break;
        if (!this.pinned(roomId, id))
          this.removeMessage(roomId, room, id, "message-count");
      }
      if (room.messages.size > limit)
        this.gap(roomId, room, "pinned-capacity", "over-capacity");
    }
    while (this.inactiveCount() > this.limits.inactiveRooms) {
      const victim = [...this.rooms.keys()].find(
        (id) => !this.held(id) && !this.hasPins(id),
      );
      if (victim === undefined) {
        this.report("over-capacity", "pinned-capacity", this.activeRoomId);
        break;
      }
      // If only the new room is evictable, room admission failed rather than displacing a pin.
      const blocked = [...this.rooms.keys()].some(
        (id) => !this.held(id) && this.hasPins(id),
      );
      this.evictRoom(victim, "room-lru");
      if (blocked) this.report("over-capacity", "pinned-capacity", victim);
    }
    while (this.messageBytes > this.limits.messageBytes) {
      const inactive = [...this.rooms.keys()].find(
        (id) => !this.held(id) && !this.hasPins(id),
      );
      if (inactive !== undefined) {
        this.evictRoom(inactive, "message-bytes");
        continue;
      }
      let removed = false;
      for (const [roomId, room] of this.rooms) {
        const id = [...room.messages.keys()]
          .sort(compareDecimalIds)
          .find((id) => !this.pinned(roomId, id));
        if (id !== undefined) {
          this.removeMessage(roomId, room, id, "message-bytes");
          removed = true;
          break;
        }
      }
      if (!removed) {
        this.report("over-capacity", "pinned-capacity", this.activeRoomId);
        break;
      }
    }
  }

  /** The active room and the rooms on screen together are not counted against inactiveRooms. */
  private held(roomId: string): boolean {
    return roomId === this.activeRoomId || this.onScreen.has(roomId);
  }

  private inactiveCount(): number {
    let count = 0;
    for (const id of this.rooms.keys()) if (!this.held(id)) count++;
    return count;
  }

  private removeMessage(
    roomId: string,
    room: CachedRoom,
    id: string,
    reason: GapReason,
  ): void {
    const entry = room.messages.get(id);
    if (!entry) return;
    this.messageBytes -= entry.bytes;
    room.messages.delete(id);
    this.gap(roomId, room, reason);
  }

  private evictRoom(roomId: string, reason: GapReason): void {
    const room = this.rooms.get(roomId);
    if (!room) return;
    for (const entry of room.messages.values())
      this.messageBytes -= entry.bytes;
    this.rooms.delete(roomId);
    room.gaps.add(reason);
    this.stores.setThread(roomId, [], {
      gaps: [...room.gaps],
      cursor: null,
      coverage: null,
    });
    this.report("gap", reason, roomId);
  }

  private gap(
    roomId: string,
    room: CachedRoom,
    reason: GapReason,
    kind: "gap" | "over-capacity" = "gap",
  ): void {
    room.gaps.add(reason);
    this.report(kind, reason, roomId);
  }

  private report(
    kind: CacheStatus["kind"],
    reason: CapacityReason,
    roomId: string | null,
  ): void {
    if (this.status.kind === "over-capacity" && kind === "gap") return;
    this.status = { kind, reason, roomId };
  }

  private state(): CacheSnapshot {
    return {
      activeRoomId: this.activeRoomId,
      retainedRoomIds: [...this.rooms.keys()],
      messageBytes: this.messageBytes,
      catalogBytes: this.catalogBytes,
      pendingBytes: this.pendingBytes,
      pendingCount: this.pending.size,
      status: this.status,
    };
  }

  private change(action: () => void): void {
    const previous = this.snapshot;
    this.stores.batch(() => {
      action();
      for (const [roomId, room] of this.rooms) {
        this.stores.setThread(
          roomId,
          [...room.messages.values()].map((entry) => entry.value),
          {
            coverage: room.coverage,
            cursor: room.cursor,
            gaps: [...room.gaps],
          },
        );
      }
      this.snapshot = immutable(this.state(), previous);
    });
    if (this.snapshot !== previous)
      for (const listener of this.listeners) listener();
  }
}
