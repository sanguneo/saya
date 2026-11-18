import type { Page, Route } from "playwright-core";
import { CONTRACT_VERSION } from "../../src/contract/tsuba/version";
import type { AdapterMessage } from "../../src/transport/adapters";
import { bounded } from "./barriers";

export const DIRECT = "direct";
export const GROUP = "group";
const TITLES = { [DIRECT]: "가상 일대일", [GROUP]: "가상 모임" };
const THEIRS = { fromMe: false, senderId: "a", sender: "가상참여자-1" };
const LONG =
  "긴 글도 말풍선 옆의 작은 상태 글자 때문에 화면 밖으로 밀려나지 않는지 보려고 일부러 여러 줄로 넘어가게 쓴 가상 문장입니다.";

type Row = readonly [
  clock: string,
  text: string,
  extra?: Partial<AdapterMessage>,
];

const wall = (roomId: string, rows: readonly Row[]): AdapterMessage[] =>
  rows.map(([clock, text, extra], index) => ({
    id: String(index),
    roomId,
    senderId: "me",
    sender: "나",
    fromMe: true,
    kind: "text",
    text,
    sentAt: `2037-04-07T${clock}Z`,
    ...extra,
  }));

/**
 * Invented walls, a message's id being its place: every state the contract
 * names on my own messages, one of them edited, one in a run, then no state,
 * a state this client does not know, and one on someone else's message.
 */
export const WALLS: Record<string, AdapterMessage[]> = {
  [DIRECT]: wall(DIRECT, [
    ["12:00:00", "오늘 관측 일정은 그대로인가요?", THEIRS],
    ["12:01:10", "네, 그대로입니다.", { deliveryStatus: "sent" }],
    ["12:01:40", "등불은 제가 챙길게요.", { deliveryStatus: "delivered" }],
    ["12:03:00", "지도는 받으셨나요?", { deliveryStatus: "read" }],
    [
      "12:05:00",
      "모이는 곳은 가상 정류장 3번입니다.",
      { deliveryStatus: "read", editedAt: "2037-04-07T12:06:00Z" },
    ],
    ["12:07:00", "상태 없는 가상 문장"],
    ["12:09:00", "모르는 상태값", { deliveryStatus: "queued-somewhere" }],
    [
      "12:10:00",
      "남의 메시지에 붙은 상태는 그리지 않습니다.",
      { ...THEIRS, deliveryStatus: "read" },
    ],
    ["12:12:00", LONG, { deliveryStatus: "delivered" }],
  ]),
  [GROUP]: wall(GROUP, [
    ["12:00:00", "가상 모임 공지를 올립니다.", THEIRS],
    ["12:02:00", "저는 참석합니다.", { deliveryStatus: "sent" }],
    ["12:04:00", "준비물은 제가 챙길게요.", { deliveryStatus: "delivered" }],
    ["12:06:00", LONG, { deliveryStatus: "read" }],
  ]),
};

export const frame = (event: string, data: unknown) =>
  `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
export const READY = frame("ready", { ok: true, resumed: false, cursor: {} });

export const answer = (route: Route, ...frames: string[]) =>
  route.fulfill({
    status: 200,
    contentType: "text/event-stream",
    body: frames.join(""),
  });

/**
 * A synthetic adapter whose room stream answers only when the scenario says
 * so, and whose `served` walls the scenario may replace before a reread.
 */
export async function receiptAdapter(page: Page) {
  const served = { ...WALLS };
  const streams: Route[] = [];
  let waiting: ((route: Route) => void) | undefined;
  await page.route("**/adapters{,/**}", async (route) => {
    const request = new URL(route.request().url());
    const json = (body: unknown) => route.fulfill({ json: body });
    if (request.pathname === "/adapters")
      return json({ adapters: [{ id: "synthetic" }] });
    if (request.pathname.endsWith("/capabilities"))
      return json({
        ok: true,
        contract: { version: CONTRACT_VERSION },
        adapter: { name: "synthetic", version: "0.0.0" },
        provider: { id: "invented", name: "가상 메신저" },
        account: { kind: "user" },
        revision: "0123456789abcdef",
        features: {
          "rooms.list": {},
          "messages.read": { paging: "none", maxLimit: 50 },
          "messages.stream": { resume: "cursor", events: ["message.edited"] },
          "messages.send": { maxLength: 4096, receipt: "accepted" },
        },
      });
    if (request.pathname.endsWith("/rooms"))
      return json({
        ok: true,
        complete: true,
        rooms: [
          { id: DIRECT, title: TITLES[DIRECT], kind: "direct", unread: 0 },
          { id: GROUP, title: TITLES[GROUP], kind: "group", unread: 0 },
        ],
      });
    if (request.pathname.endsWith("/messages"))
      return json({
        ok: true,
        hasEarlier: false,
        messages: served[request.searchParams.get("roomId") ?? ""] ?? [],
      });
    if (request.pathname.endsWith("/stream")) {
      // Only the room view resumes from a cursor; the lists' shared stream stays down.
      if (!request.searchParams.has("since"))
        return route.fulfill({
          status: 503,
          json: { ok: false, error: { code: "BUSY", message: "Synthetic" } },
        });
      if (waiting) waiting(route);
      else streams.push(route);
      waiting = undefined;
      return;
    }
    throw new Error(`Unexpected synthetic adapter route: ${request.pathname}`);
  });
  return {
    served,
    unansweredStream: () =>
      bounded(
        new Promise<Route>((resolve) => {
          const held = streams.shift();
          if (held) resolve(held);
          else waiting = resolve;
        }),
        "the room's stream request",
      ),
  };
}
