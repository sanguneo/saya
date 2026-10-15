type Taker = (text: string) => void;

const takers = new Map<string, Set<Taker>>();

/**
 * Text another surface (the summary panel) hands to a room's composer. It only
 * fills the input box: nothing is sent, and the person still presses 보내기.
 * Returns whether a composer for that room took it.
 */
export function offerDraft(roomId: string, text: string): boolean {
  const room = takers.get(roomId);
  if (!room || room.size === 0 || text === "") return false;
  for (const take of room) take(text);
  return true;
}

export function hasDraftTaker(roomId: string): boolean {
  return (takers.get(roomId)?.size ?? 0) > 0;
}

export function takeDraftOffers(roomId: string, take: Taker): () => void {
  let room = takers.get(roomId);
  if (!room) {
    room = new Set();
    takers.set(roomId, room);
  }
  room.add(take);
  return () => {
    room.delete(take);
    if (room.size === 0) takers.delete(roomId);
  };
}

/** What is already typed is kept; the offer goes below it. */
export function withOffer(current: string, offer: string): string {
  return current.trim() === ""
    ? offer
    : `${current.replace(/\s+$/, "")}\n${offer}`;
}
