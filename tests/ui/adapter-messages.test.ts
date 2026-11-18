import { describe, expect, test } from "bun:test";
import {
  streamChange,
  withReceipts,
} from "../../src/features/adapters/messages";
import {
  type AdapterMessage,
  AdapterSseParser,
} from "../../src/transport/adapters";

const ROOM = "-100123";

const row = (
  id: string,
  overrides: Partial<AdapterMessage> = {},
): AdapterMessage => ({
  id,
  roomId: ROOM,
  senderId: "me",
  sender: "나",
  text: `가상 문장 ${id}`,
  kind: "text",
  sentAt: `2037-04-07T09:0${id}:00Z`,
  fromMe: true,
  ...overrides,
});

const someoneElse = { fromMe: false, senderId: "a", sender: "가상참여자-1" };

function afterFrame(
  held: AdapterMessage[],
  event: string,
  data: unknown,
): AdapterMessage[] {
  let next = held;
  const parser = new AdapterSseParser((parsed) => {
    next = streamChange(parsed, ROOM)?.(next) ?? next;
  });
  parser.push(
    new TextEncoder().encode(
      `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`,
    ),
  );
  // A frame outside the contract is dropped, which would make "nothing changed" pass by accident.
  expect(parser.outcome).toBeUndefined();
  return next;
}

describe("what the stream says about a room's messages", () => {
  test("a receipt that moves replaces the row it belongs to, in place", () => {
    const theirs = row("1", someoneElse);
    const delivered = row("2", { deliveryStatus: "delivered" });
    const sent = row("3", { deliveryStatus: "sent" });
    const read = row("2", { deliveryStatus: "read" });

    const next = afterFrame([theirs, delivered, sent], "message.edited", {
      ok: true,
      message: read,
    });

    expect(next).toEqual([theirs, read, sent]);
  });

  test("a receipt for a message this view has not loaded adds no row", () => {
    const held = [row("2"), row("3")];

    const next = afterFrame(held, "message.edited", {
      ok: true,
      message: row("1", { deliveryStatus: "read" }),
    });

    expect(next).toEqual(held);
  });

  test("a receipt in another room leaves this room's message of the same id alone", () => {
    const held = [row("2", { deliveryStatus: "delivered" })];

    const next = afterFrame(held, "message.edited", {
      ok: true,
      message: { ...row("2", { deliveryStatus: "read" }), roomId: "-100999" },
    });

    expect(next).toEqual(held);
  });

  test("a new message is added once, however often the stream repeats it", () => {
    const mine = row("2");
    const arrival = row("3", someoneElse);
    const frame = { ok: true, message: arrival };

    const next = afterFrame(
      afterFrame([mine], "message", frame),
      "message",
      frame,
    );

    expect(next).toEqual([mine, arrival]);
  });

  test("a deleted message leaves the room", () => {
    const gone = row("2");
    const kept = row("3");

    const next = afterFrame([gone, kept], "message.deleted", {
      ok: true,
      roomId: ROOM,
      messageIds: [gone.id],
    });

    expect(next).toEqual([kept]);
  });

  test("new reactions replace the old ones on their message", () => {
    const reacted = row("2", {
      reactions: [{ emoji: "A", count: 1, mine: false }],
    });
    const other = row("3");
    const reactions = [{ emoji: "B", count: 2, mine: true }];

    const next = afterFrame([reacted, other], "reactions.updated", {
      ok: true,
      roomId: ROOM,
      messageId: reacted.id,
      reactions,
    });

    expect(next).toEqual([{ ...reacted, reactions }, other]);
  });
});

describe("a reread after the stream comes back", () => {
  test("moves receipts forward on rows already held, and changes nothing else", () => {
    const theirs = row("1", someoneElse);
    const edited = row("2", {
      deliveryStatus: "delivered",
      text: "가상 수정본",
      editedAt: "2037-04-07T09:05:00Z",
    });
    const read = row("3", { deliveryStatus: "read" });
    const unknown = row("4");
    const reread = [
      row("1", { ...someoneElse, deliveryStatus: "read" }),
      row("2", { deliveryStatus: "read", text: "가상 원문" }),
      row("3", { deliveryStatus: "delivered" }),
      row("4", { deliveryStatus: "sent" }),
      row("5", { deliveryStatus: "read" }),
    ];

    const next = withReceipts([theirs, edited, read, unknown], reread);

    expect(next).toEqual([
      theirs,
      { ...edited, deliveryStatus: "read" },
      read,
      { ...unknown, deliveryStatus: "sent" },
    ]);
  });
});
