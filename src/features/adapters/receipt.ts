import type { AdapterMessage } from "../../transport/adapters";

/** What `deliveryStatus` can say, in the order a message moves through it. */
const ORDER = ["sent", "delivered", "read"] as const;

export type Receipt = (typeof ORDER)[number];

/**
 * What the messenger confirmed about my own message. Someone else's message,
 * no value, or a value this client does not know all mean unknown: the
 * contract's absent, never a guess.
 */
export function receiptOf(message: AdapterMessage): Receipt | undefined {
  if (!message.fromMe) return undefined;
  return ORDER.find((known) => known === message.deliveryStatus);
}

/** How far along a receipt is; unknown is behind every confirmed state. */
export function receiptRank(receipt: Receipt | undefined): number {
  return receipt === undefined ? -1 : ORDER.indexOf(receipt);
}

/**
 * One bubble makes one claim: an album says only what every message in it has
 * confirmed, and nothing while one of them is unknown.
 */
export function sharedReceipt(
  members: readonly AdapterMessage[],
): Receipt | undefined {
  const receipts = members.map(receiptOf);
  return receipts.includes(undefined)
    ? undefined
    : ORDER.find((known) => receipts.includes(known));
}
