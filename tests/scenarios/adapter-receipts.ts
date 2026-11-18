import assert from "node:assert/strict";
import type { Page } from "playwright-core";
import { bounded, deferred } from "../harness/barriers";
import {
  answer,
  DIRECT,
  frame,
  GROUP,
  READY,
  receiptAdapter,
  WALLS,
} from "../harness/receiptAdapter";
import type { Scenario } from "../harness/runner";

/**
 * What the messenger confirmed about my own messages on an adapter wall: a
 * small word over the clock, for a state this client knows on a message that
 * is mine, and nothing otherwise. It moves when the stream says the message
 * changed and when a reread after reconnecting has moved further, never back.
 *
 * This is also the fixture to look at: `bun run qa -- --scenario
 * adapter-receipts --evidence <dir>` writes the one-to-one and the group wall
 * at 1440 and 390, light and dark. Every name and word is invented.
 */
const SHOWN: Record<string, (string | null)[]> = {
  [DIRECT]: [
    null,
    "sent",
    "delivered",
    "read",
    "read",
    null,
    null,
    null,
    "delivered",
  ],
  [GROUP]: [null, "sent", "delivered", "read"],
};

const directAfter = (moved: Record<number, string>) =>
  (SHOWN[DIRECT] ?? []).map((shown, index) => moved[index] ?? shown);

async function open(page: Page, url: string, roomId: string) {
  page.setDefaultTimeout(10_000);
  await page.goto(`${url}/#/adapters/synthetic/${roomId}`, {
    waitUntil: "load",
  });
  await page
    .locator('[data-ui="adapter-turn"]')
    .nth((WALLS[roomId]?.length ?? 1) - 1)
    .waitFor();
  await page.evaluate(() => document.fonts.ready.then(() => undefined));
}

const receipts = (page: Page) =>
  page
    .locator('[data-ui="adapter-turn"]')
    .evaluateAll((turns) =>
      turns.map(
        (turn) =>
          turn
            .querySelector('[data-ui="adapter-receipt"]')
            ?.getAttribute("data-receipt") ?? null,
      ),
    );

export const scenario: Scenario = {
  id: "adapter-receipts",
  async run({ context, url, log, evidence }) {
    for (const width of [1440, 390]) {
      for (const theme of ["light", "dark"] as const) {
        const words: Record<string, string | null> = {};
        for (const roomId of [DIRECT, GROUP]) {
          const page = await context.newPage();
          await page.setViewportSize({
            width,
            height: width === 390 ? 844 : 900,
          });
          await page.emulateMedia({
            colorScheme: theme,
            reducedMotion: "reduce",
          });
          await page.addInitScript((choice) => {
            localStorage.setItem("saya.theme", JSON.stringify({ choice }));
          }, theme);
          const synthetic = await receiptAdapter(page);
          await open(page, url, roomId);
          // Held unanswered, so the wall is drawn from what was read and nothing else.
          await synthetic.unansweredStream();
          await page.screenshot({
            path: `${evidence}/${width}-${theme}-${roomId}.png`,
            fullPage: true,
          });

          assert.deepEqual(await receipts(page), SHOWN[roomId]);
          const turn = (id: number) =>
            page.locator(`[data-message-id="${id}"]`);
          const height = async (id: number) =>
            (await turn(id).boundingBox())?.height;
          if (roomId === DIRECT) {
            assert.equal(
              await turn(1).locator("time:not(.sr-only)").count(),
              0,
              "inside a run the receipt stands in the clock's place",
            );
            assert.equal(
              await turn(2).locator("time:not(.sr-only)").count(),
              1,
              "the run's last turn shows the receipt over the clock",
            );
            assert.equal(
              await height(1),
              await height(2),
              "a receipt alone and one over the clock keep the same bubble height",
            );
            assert.equal(
              await height(3),
              await height(5),
              "a receipt never makes a turn taller than the same bubble without one",
            );
          }
          words[roomId] = await turn(3).evaluate(
            (element) =>
              element.querySelector('[data-ui="adapter-receipt"]')
                ?.textContent ?? null,
          );
          const overflow = await page.evaluate(
            () =>
              document.documentElement.scrollWidth >
              document.documentElement.clientWidth,
          );
          assert.equal(overflow, false);
          log("receipt-frame", { width, theme, roomId, overflow });
          await page.unrouteAll({ behavior: "ignoreErrors" });
          await page.close();
        }
        assert.ok(words[DIRECT]);
        assert.notEqual(
          words[GROUP],
          words[DIRECT],
          "a room with several readers words the same state differently",
        );
      }
    }

    const page = await context.newPage();
    const synthetic = await receiptAdapter(page);
    await open(page, url, DIRECT);
    await answer(
      await synthetic.unansweredStream(),
      READY,
      frame("message.edited", {
        ok: true,
        message: { ...WALLS[DIRECT]?.[2], deliveryStatus: "read" },
      }),
    );
    await page.locator('[data-message-id="2"] [data-receipt="read"]').waitFor();
    assert.deepEqual(
      await receipts(page),
      directAfter({ 2: "read" }),
      "the row changed in place and no row was added",
    );

    // That stream has ended. The messenger now says 1 was delivered, and still
    // answers the older state for 2 that the stream has already moved past.
    synthetic.served[DIRECT] = (WALLS[DIRECT] ?? []).map((message) =>
      message.id === "1"
        ? { ...message, deliveryStatus: "delivered" }
        : message,
    );
    await answer(await synthetic.unansweredStream(), READY);
    await page
      .locator('[data-message-id="1"] [data-receipt="delivered"]')
      .waitFor();
    assert.deepEqual(
      await receipts(page),
      directAfter({ 1: "delivered", 2: "read" }),
      "the reread moved 1 forward and did not move 2 back",
    );
    const source = WALLS[DIRECT]?.[1];
    assert.ok(source);
    const sent = {
      ...source,
      id: "sent-during-stream",
      text: "가상 발송",
      sentAt: "2037-04-07T12:20:00Z",
      deliveryStatus: "sent",
    };
    const streaming = await synthetic.unansweredStream();
    const sending = deferred<void>();
    const release = deferred<void>();
    await page.route("**/send", async (route) => {
      sending.resolve();
      await bounded(release.promise, "release the synthetic send answer");
      await route.fulfill({ json: { ok: true, message: sent } });
    });
    await page.getByPlaceholder("메시지 입력").fill(sent.text);
    await page.getByRole("button", { name: "보내기", exact: true }).click();
    await bounded(sending.promise, "request in flight");
    try {
      await answer(
        streaming,
        READY,
        frame("message.edited", {
          ok: true,
          message: { ...sent, deliveryStatus: "read" },
        }),
        frame("message.edited", {
          ok: true,
          message: { ...source, deliveryStatus: "read" },
        }),
      );
      await page
        .locator('[data-message-id="1"] [data-receipt="read"]')
        .waitFor();
      assert.equal(
        await page.locator('[data-message-id="sent-during-stream"]').count(),
        0,
      );
    } finally {
      release.resolve();
    }
    await page
      .locator('[data-message-id="sent-during-stream"] [data-receipt="read"]')
      .waitFor();
    log("receipt-live", { patched: "2", reread: "1", earlyReceipt: true });
    await page.unrouteAll({ behavior: "ignoreErrors" });
    await page.close();
  },
};
