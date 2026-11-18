import type {
  AdapterMessage,
  AdapterReaction,
  AdapterStreamEvent,
} from "../../transport/adapters";
import { receiptOf, receiptRank } from "./receipt";

type Change = (current: AdapterMessage[]) => AdapterMessage[];

export function withNewer(
  current: AdapterMessage[],
  newer: AdapterMessage[],
): AdapterMessage[] {
  const known = new Set(current.map((message) => message.id));
  const fresh = newer.filter((message) => !known.has(message.id));
  return fresh.length ? [...current, ...fresh] : current;
}

export function withOlder(
  older: AdapterMessage[],
  current: AdapterMessage[],
): AdapterMessage[] {
  const known = new Set(current.map((message) => message.id));
  return [...older.filter((message) => !known.has(message.id)), ...current];
}

export function withEdited(
  current: AdapterMessage[],
  message: AdapterMessage,
): AdapterMessage[] {
  return current.map((held) => (held.id === message.id ? message : held));
}

export function without(
  current: AdapterMessage[],
  ids: string[],
): AdapterMessage[] {
  const gone = new Set(ids);
  return current.filter((message) => !gone.has(message.id));
}

export function withReactions(
  current: AdapterMessage[],
  id: string,
  reactions: AdapterReaction[],
): AdapterMessage[] {
  return current.map((message) => {
    if (message.id !== id) return message;
    const { reactions: _held, ...rest } = message;
    return reactions.length ? { ...rest, reactions } : rest;
  });
}

/**
 * A reread of the newest window once the stream is back: resume replays new
 * messages only, so a receipt that moved meanwhile is taken from here. Only
 * forward, because this answer may be older than what the stream said since.
 */
export function withReceipts(
  current: AdapterMessage[],
  reread: readonly AdapterMessage[],
): AdapterMessage[] {
  const confirmed = new Map(
    reread.map((message) => [message.id, receiptOf(message)]),
  );
  const next = current.map((held) => {
    const receipt = confirmed.get(held.id);
    return receipt !== undefined &&
      receiptRank(receipt) > receiptRank(receiptOf(held))
      ? { ...held, deliveryStatus: receipt }
      : held;
  });
  return next.some((message, index) => message !== current[index])
    ? next
    : current;
}

/**
 * What a stream event does to this room's messages; null when it concerns
 * another room or no message. `message.edited` is every change to a message
 * the stream already sent, a receipt included, so it never adds a row.
 */
export function streamChange(
  event: AdapterStreamEvent,
  roomId: string,
): Change | null {
  switch (event.type) {
    case "message": {
      const { message } = event.data;
      return message.roomId === roomId
        ? (current) => withNewer(current, [message])
        : null;
    }
    case "message.edited": {
      const { message } = event.data;
      return message.roomId === roomId
        ? (current) => withEdited(current, message)
        : null;
    }
    case "message.deleted": {
      const { messageIds } = event.data;
      return event.data.roomId === roomId
        ? (current) => without(current, messageIds)
        : null;
    }
    case "reactions.updated": {
      const { messageId, reactions } = event.data;
      return event.data.roomId === roomId
        ? (current) => withReactions(current, messageId, reactions)
        : null;
    }
    case "ready":
    case "cursor":
      return null;
  }
}
