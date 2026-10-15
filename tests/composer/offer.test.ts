import { describe, expect, test } from "bun:test";
import {
  hasDraftTaker,
  offerDraft,
  takeDraftOffers,
  withOffer,
} from "../../src/features/composer/offer";

describe("draft offers", () => {
  test("an offer fills only its own room's composer, keeps what was typed, and is refused with no composer", () => {
    const takenA: string[] = [];
    const takenB: string[] = [];
    const stopA = takeDraftOffers("room-a", (text) => takenA.push(text));
    const stopB = takeDraftOffers("room-b", (text) => takenB.push(text));

    expect(offerDraft("room-a", "초안")).toBe(true);
    expect(takenA).toEqual(["초안"]);
    expect(takenB).toEqual([]);

    expect(withOffer("", "초안")).toBe("초안");
    expect(withOffer("쓰던 말  ", "초안")).toBe("쓰던 말\n초안");

    stopA();
    expect(hasDraftTaker("room-a")).toBe(false);
    expect(offerDraft("room-a", "초안")).toBe(false);
    expect(takenA).toEqual(["초안"]);
    stopB();
  });
});
