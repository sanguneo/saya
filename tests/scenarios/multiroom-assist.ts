import { resolve } from "node:path";
import type { Locator, Page, Request, Route } from "playwright-core";
import type { components } from "../../src/contract/decoded";
import { responseBarrier } from "../harness/browser-barriers";
import type { Scenario } from "../harness/runner";

type Message = components["schemas"]["Message"];

/** Invented inquiries; every name and line here is made up for the harness. */
const INQUIRIES: { title: string; lines: [boolean, string][] }[] = [
  {
    title: "가상 문의 1 · 예약 변경",
    lines: [
      [false, "안녕하세요, 이번 주 목요일 상담 예약했는데요"],
      [true, "안녕하세요 :) 네, 확인해 볼게요!"],
      [false, "혹시 금요일 오후로 바꿀 수 있을까요?"],
    ],
  },
  {
    title: "가상 문의 2 · 광고 견적",
    lines: [
      [false, "치과 블로그 광고 견적 받아볼 수 있을까요?"],
      [false, "개원한 지 3개월 됐어요"],
    ],
  },
  {
    title: "가상 문의 3 · 원고 수정",
    lines: [
      [true, "원고 초안 보내드렸어요. 편하실 때 봐 주세요!"],
      [false, "봤어요~ 두 번째 문단만 조금 부드럽게 바꿔 주실 수 있나요?"],
    ],
  },
  {
    title: "가상 문의 4 · 촬영 일정",
    lines: [
      [false, "병원 내부 사진 촬영은 언제 오시나요?"],
      [false, "진료 없는 점심시간이면 좋겠어요"],
    ],
  },
  {
    title: "가상 문의 5 · 리뷰 답글",
    lines: [[false, "환자 리뷰에 답글 다는 것도 해 주시나요?"]],
  },
  {
    title: "가상 문의 6 · 계약 기간",
    lines: [
      [false, "지금 계약 언제까지였죠?"],
      [false, "연장하면 조건이 바뀌는지도 궁금해요"],
    ],
  },
  {
    title: "가상 문의 7 · 보고서",
    lines: [
      [true, "이번 달 보고서 정리 중이에요 :)"],
      [false, "감사합니다! 문의 수 늘었는지 궁금했어요"],
    ],
  },
  {
    title: "가상 문의 8 · 이벤트 문구",
    lines: [
      [false, "임플란트 이벤트 문구 같이 봐 주실 수 있을까요?"],
      [false, "의료광고 심의 걸리는 표현은 빼고 싶어요"],
    ],
  },
];

const DESKTOP = { width: 1440, height: 900 };
const MIDDLE = { width: 1024, height: 900 };
const MOBILE = { width: 390, height: 844 };
const LIVE = process.env.SAYA_ASSIST_LIVE === "1";
const ANSWER_TIMEOUT = LIVE ? 120_000 : 10_000;

/** Each candidate's text: how many lines it shows and whether any are cut. */
function textBoxes(candidates: Locator) {
  return candidates.evaluateAll((nodes) =>
    nodes.map((node) => {
      const text = node.children[1] as HTMLElement;
      const line = Number.parseFloat(getComputedStyle(text).lineHeight);
      return {
        lines: Math.round(text.clientHeight / line),
        clipped: text.scrollHeight > text.clientHeight + 1,
      };
    }),
  );
}

function assert(value: unknown, message: string): asserts value {
  if (!value) throw new Error(message);
}

/** A stand-in for /assist that fails the way the server does: a writer error, a checker error. */
async function stubAssist(page: Page) {
  await page.route("**/assist", async (route: Route, request: Request) => {
    if (request.method() === "GET") {
      return route.fulfill({
        json: {
          enabled: true,
          user: "현지님",
          prefix: "",
          prefixOn: false,
          agent: "오모냥",
        },
      });
    }
    const { room, more } = request.postDataJSON() as {
      room: string;
      more?: boolean;
    };
    const writer = room.includes("문의 7")
      ? { kind: "model", fallback: true }
      : { kind: "agent", name: "오모냥" };
    if (room.includes("문의 6") && more !== true) {
      return route.fulfill({ json: { needMore: true, writer } });
    }
    if (room.includes("문의 3")) {
      return route.fulfill({
        status: 502,
        json: { error: { code: "WRITER_FAILED" } },
      });
    }
    const summary = {
      want: `${room.split("·")[1]?.trim() ?? "문의"} 관련 답을 원하세요.`,
      open: ["가능한지 여부"],
    };
    if (room.includes("문의 4")) {
      return route.fulfill({
        json: {
          summary,
          candidates: [],
          hidden: null,
          check: "CHECK_FAILED",
          writer,
        },
      });
    }
    return route.fulfill({
      json: {
        summary,
        candidates: [
          {
            text: "안녕하세요 :) 네, 가능해요! 확인하고 바로 말씀드릴게요.",
            score: 88,
            fit: 0.92,
            tone: 0.8,
            risk: 0.02,
          },
          {
            text: "문의 감사해요. 조금만 기다려 주시면 정리해서 알려 드릴게요.",
            score: 71,
            fit: 0.6,
            tone: 0.75,
            risk: 0.03,
          },
          {
            text: "안녕하세요 :) 문의 주셔서 감사해요. 말씀하신 내용은 담당자와 일정을 먼저 맞춰 본 뒤, 가능한 시간과 준비할 것을 정리해서 오늘 안으로 다시 자세히 안내해 드릴게요.",
            score: 65,
            fit: 0.55,
            tone: 0.7,
            risk: 0.03,
          },
        ],
        hidden: { risky: 1, offTopic: 0 },
        check: "ok",
        writer,
      },
    });
  });
}

export const scenario: Scenario = {
  id: "multiroom-assist",
  async run({ page, bridge, url, log, screenshot, evidence }) {
    const rooms = bridge.data.rooms.slice(2, 2 + INQUIRIES.length);
    rooms.forEach((room, index) => {
      const inquiry = INQUIRIES[index];
      const rows = bridge.data.messages.get(room.id);
      assert(inquiry && rows, "Fixture lacks a room");
      const tail = rows.slice(-inquiry.lines.length);
      const rewritten = tail.map((row, line): Message => {
        const [mine, text] = inquiry.lines[line] ?? [false, ""];
        const { replyTo, mentions, mentionsMe, reactions, ...rest } = row;
        return {
          ...rest,
          kind: "text",
          text,
          fromMe: mine,
          sender: mine ? "현지(가상)" : `가상손님${index + 1}`,
          senderId: mine ? "38000000000000000" : `3900000000000000${index}`,
        };
      });
      bridge.data.messages.set(room.id, rewritten);
      room.title = inquiry.title;
      room.unread = 400 - index;
    });

    const assistPosts: string[] = [];
    const assistBodies: { room: string; more?: boolean }[] = [];
    const answers: unknown[] = [];
    const sends: { dryRun: boolean; text: string }[] = [];
    const sent = () => sends.length;
    page.on("request", (request) => {
      const path = new URL(request.url()).pathname;
      if (path === "/assist" && request.method() === "POST") {
        const body = request.postDataJSON() as { room: string; more?: boolean };
        assistPosts.push(body.room);
        assistBodies.push(body);
      }
      if (path === "/api/send") {
        sends.push(request.postDataJSON() as { dryRun: boolean; text: string });
      }
    });
    page.on("response", async (response) => {
      if (
        new URL(response.url()).pathname === "/assist" &&
        response.request().method() === "POST"
      ) {
        answers.push({
          status: response.status(),
          body: await response.json().catch(() => null),
        });
      }
    });
    if (!LIVE) await stubAssist(page);

    await page.setViewportSize(DESKTOP);
    const catalog = responseBarrier(page, "/api/rooms");
    const opened = bridge.events.expect(
      (event) => event.type === "stream-open",
      "stream open",
    );
    await page.goto(`${url}/#/assist`, { waitUntil: "load" });
    await Promise.all([catalog, opened]);
    await page.locator('[data-ui="assist-empty"]').waitFor();
    await page.locator('[data-ui="assist-choose"]').click();
    await page.locator('[data-ui="assist-fill"]').click();
    await page.locator('[data-ui="assist-chooser-done"]').click();
    const cells = page.locator('[data-ui="assist-cell"]');
    await cells.nth(7).waitFor();
    assert((await cells.count()) === 8, "Eight rooms are not drawn");
    const order = await cells.evaluateAll((nodes) =>
      nodes.map((node) => node.getAttribute("data-room-id")),
    );
    assert(
      order.join() === rooms.map((room) => room.id).join(),
      `Chooser order is not by unread: ${order.join()}`,
    );
    log("grid", { cells: 8 });

    // Every room ends with a customer's message, so all eight ask once; the
    // one whose agent wants older history asks a second time, with more.
    await page.waitForFunction(
      () =>
        [...document.querySelectorAll('[data-ui="assist-help"]')].filter(
          (node) => node.getAttribute("data-state") !== "loading",
        ).length === 8 &&
        [...document.querySelectorAll('[data-ui="assist-help"]')].every(
          (node) => node.getAttribute("data-state") !== "idle",
        ),
      undefined,
      { timeout: ANSWER_TIMEOUT },
    );
    log("assist-posts", { count: assistPosts.length });
    const expectedAsks = LIVE ? 8 : 9;
    assert(
      assistPosts.length >= 8 && (LIVE || assistPosts.length === expectedAsks),
      `Expected ${expectedAsks} asks, saw ${assistPosts.length}`,
    );

    // Cell geometry: four columns, two rows, inside the viewport.
    const boxes = await cells.evaluateAll((nodes) =>
      nodes.map((node) => {
        const box = node.getBoundingClientRect();
        return {
          x: Math.round(box.x),
          y: Math.round(box.y),
          b: box.bottom,
        };
      }),
    );
    assert(new Set(boxes.map((box) => box.x)).size === 4, "Not four columns");
    assert(new Set(boxes.map((box) => box.y)).size === 2, "Not two rows");
    assert(
      boxes.every((box) => box.b <= DESKTOP.height + 1),
      "Grid overflows the screen",
    );

    if (!LIVE) {
      const failed = cells.nth(
        rooms.findIndex((room) => room.title.includes("문의 3")),
      );
      assert(
        (await failed
          .locator('[data-ui="assist-help"]')
          .getAttribute("data-state")) === "failed",
        "Writer failure is not shown in its cell",
      );
      assert(
        (await failed
          .locator('[data-ui="thread-wall"] [data-ui="message"]')
          .count()) > 0,
        "A failed cell lost its wall",
      );
      const wanting = assistBodies.filter((body) =>
        body.room.includes("문의 6"),
      );
      assert(
        wanting.length === 2 &&
          wanting[0]?.more !== true &&
          wanting[1]?.more === true,
        "need_more did not ask again once, with more",
      );
      const writerOf = async (index: number) =>
        cells
          .nth(index)
          .locator('[data-ui="assist-writer"]')
          .getAttribute("data-kind");
      assert(
        (await writerOf(0)) === "agent" &&
          (await writerOf(
            rooms.findIndex((room) => room.title.includes("문의 7")),
          )) === "fallback",
        "Cards do not say who wrote the candidates",
      );
      const unchecked = cells.nth(
        rooms.findIndex((room) => room.title.includes("문의 4")),
      );
      assert(
        (await unchecked.locator('[data-ui="assist-candidate"]').count()) === 0,
        "Unchecked candidates are shown",
      );
      assert(
        (await unchecked.locator('[data-ui="assist-summary"]').count()) === 1,
        "Checker failure hid the summary",
      );
    }
    const prefix = page.locator('[data-ui="assist-prefix"] input');
    assert(await prefix.isDisabled(), "An empty prefix can be turned on");
    await screenshot(LIVE ? "live-1440" : "assist-1440");

    // A candidate only fills the input; 보내기 asks (dryRun) and waits for 확인.
    const first = cells.first();
    const candidate = first.locator('[data-ui="assist-candidate"]').first();
    await candidate.waitFor();
    const candidateText = await candidate.locator("span").nth(2).textContent();
    await candidate.click();
    const input = first.locator('[data-ui="composer-input"]');
    assert(
      (await input.inputValue()) === candidateText,
      "Candidate did not fill the input",
    );
    assert(sent() === 0, "Picking a candidate sent something");
    const edited = `${candidateText} 감사합니다!`;
    await input.fill(edited);
    const dry = responseBarrier(page, "/api/send");
    await first.locator('[data-ui="composer-send"]').click();
    await dry;
    await first.locator('[data-ui="composer-confirmation"]').waitFor();
    assert(
      sent() === 1 && sends[0]?.dryRun === true,
      "보내기 did more than a dry run before confirmation",
    );
    await screenshot(LIVE ? "live-confirm-1440" : "assist-confirm-1440");
    const real = responseBarrier(page, "/api/send");
    await first.locator('[data-ui="composer-confirm"]').click();
    await real;
    assert(
      sent() === 2 && sends[1]?.dryRun === false && sends[1]?.text === edited,
      "Confirmed send is not exactly the edited text, once",
    );
    log("mock-send", { dryRuns: 1, sends: 1, bridge: "synthetic" });

    // A new customer message streams into one room: the wall shows it and help is asked again.
    const target = rooms[1];
    const rows = target ? bridge.data.messages.get(target.id) : undefined;
    const last = rows?.at(-1);
    assert(target && rows && last, "Fixture lacks a stream target");
    const newer: Message = {
      ...last,
      id: (BigInt(last.id) + 1n).toString(),
      text: "아 그리고 견적은 메일로도 받을 수 있나요?",
      fromMe: false,
      sentAt: new Date(Date.parse(last.sentAt ?? "") + 60_000).toISOString(),
    };
    const before = assistPosts.length;
    const asked = page.waitForRequest(
      (request) =>
        new URL(request.url()).pathname === "/assist" &&
        request.method() === "POST",
      { timeout: ANSWER_TIMEOUT },
    );
    bridge.emit("message", { ok: true, message: newer });
    rows.push(newer);
    await cells.nth(1).locator(`[data-message-id="${newer.id}"]`).waitFor();
    await asked;
    assert(assistPosts.length === before + 1, "A new message did not ask once");
    log("live-update", { asked: assistPosts.length - before });

    // The wall marks rows scrolled out above it, so a cut-off bubble reads as scroll.
    assert(
      (await first
        .locator('[data-ui="assist-wall"]')
        .getAttribute("data-above")) !== null,
      "A scrolled wall has no top fade",
    );
    // Candidates keep at least two lines in the grid; a clipped one opens whole.
    const gridTexts = await textBoxes(
      page.locator('[data-ui="assist-cell"] [data-ui="assist-candidate"]'),
    );
    if (!LIVE) {
      assert(
        gridTexts.every((box) => !box.clipped || box.lines >= 2),
        `A clipped candidate shows under two lines: ${JSON.stringify(gridTexts)}`,
      );
      const more = first.locator('[data-ui="assist-more"]');
      assert(
        (await more.count()) === 1,
        "A clipped candidate has no 전체 보기",
      );
      await more.click();
      const [opened] = await textBoxes(
        first.locator("li[data-open] [data-ui='assist-candidate']"),
      );
      assert(opened && !opened.clipped, "전체 보기 left the candidate clipped");
      await screenshot("assist-1440-more");
    }

    // 펼치기: one room large, the rest compact beside it, nothing remounted or asked again.
    const asksBeforeExpand = assistPosts.length;
    const big = cells.nth(4);
    await big.locator('[data-ui="assist-expand"]').click();
    await page.locator('[data-ui="assist-cell"][data-expanded]').waitFor();
    const widths = await cells.evaluateAll((nodes) =>
      nodes.map((node) => node.getBoundingClientRect().width),
    );
    const bigWidth = widths[4] ?? 0;
    assert(
      widths.every((width, index) => index === 4 || width * 2 < bigWidth),
      `Expanded room is not the large one: ${widths.join()}`,
    );
    const expandedTexts = await textBoxes(
      big.locator('[data-ui="assist-candidate"]'),
    );
    assert(
      expandedTexts.every((box) => !box.clipped),
      "An expanded room clips a candidate",
    );
    const bigWall = await big
      .locator('[data-ui="thread-wall"]')
      .evaluate((node) => ({
        scroll: node.scrollHeight - node.clientHeight,
        rows: node.querySelectorAll('[data-ui="message"]').length,
      }));
    assert(
      bigWall.rows > 0 && bigWall.scroll <= 1,
      `Expanded wall still cuts its conversation: ${JSON.stringify(bigWall)}`,
    );
    assert(
      assistPosts.length === asksBeforeExpand,
      "Expanding remounted a room and asked again",
    );
    log("expand", { widths, expandedTexts, bigWall });
    await screenshot(LIVE ? "live-expanded-1440" : "assist-expanded-1440");
    await page.setViewportSize(MIDDLE);
    await screenshot(LIVE ? "live-expanded-1024" : "assist-expanded-1024");
    await big.locator('[data-ui="assist-expand"]').click();
    assert(
      (await page.locator('[data-ui="assist-cell"][data-expanded]').count()) ===
        0,
      "접기 did not return to the grid",
    );

    await screenshot(LIVE ? "live-1024" : "assist-1024");
    await page.setViewportSize(MOBILE);
    const visible = await cells.evaluateAll(
      (nodes) =>
        nodes.filter((node) => node.getBoundingClientRect().height > 0).length,
    );
    assert(visible === 1, `Phone shows ${visible} cells`);
    await page.locator('[data-ui="assist-tab"]').nth(1).click();
    assert(
      (await cells.nth(1).boundingBox())?.width === MOBILE.width,
      "Second tab did not show its room full width",
    );
    await screenshot(LIVE ? "live-390" : "assist-390");
    await Bun.write(
      resolve(evidence, LIVE ? "live-answers.json" : "answers.json"),
      `${JSON.stringify({ asks: assistPosts, answers }, null, 2)}\n`,
    );
  },
};
