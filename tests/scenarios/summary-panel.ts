import type { Page } from "playwright-core";
import { FIRST_ROOM_ID } from "../fixtures/data";
import { domBarrier } from "../harness/browser-barriers";
import type { Scenario, ScenarioContext } from "../harness/runner";

const DESKTOP = { width: 1440, height: 900 };
const MOBILE = { width: 390, height: 844 };
const SUMMARY = {
  decisions: ["가상 관측 일정을 금요일로 옮길지", "망원경 예약 시간"],
  todos: ["관측 장비 목록 공유"],
  draft: "금요일 저녁 괜찮아요. 장비 목록은 제가 정리해서 올릴게요.",
};

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

/**
 * Without SAYA_SUMMARY_URL in the environment the route is stubbed here, failing
 * the way the server fails (502 with a code) before it answers. With it, the
 * preview's real /summary handler answers from whatever model that names.
 */
async function stubSummary(page: Page) {
  let posts = 0;
  await page.route("**/summary", async (route) => {
    if (route.request().method() === "GET")
      return route.fulfill({ json: { enabled: true } });
    posts += 1;
    if (posts === 1)
      return route.fulfill({
        status: 502,
        json: { error: { code: "UPSTREAM_MALFORMED" } },
      });
    return route.fulfill({ json: SUMMARY });
  });
}

async function openRoom(page: Page, url: string) {
  const rooms = page.waitForResponse(
    (response) => new URL(response.url()).pathname === "/api/rooms",
    { timeout: 10_000 },
  );
  await page.goto(`${url}/#/rooms`);
  await rooms;
  // Barriers live in the document, so they are armed after the load, before the hash moves.
  const context = page.waitForResponse(
    (response) => new URL(response.url()).pathname === "/api/context",
    { timeout: 10_000 },
  );
  const entry = await domBarrier(page, '[data-ui="summary-open"]');
  const input = await domBarrier(page, '[data-ui="composer-input"]');
  await page.evaluate((roomId) => {
    window.location.hash = `#/room/${roomId}`;
  }, FIRST_ROOM_ID);
  await Promise.all([context, entry.wait(), input.wait()]);
}

async function summarise(
  { page, screenshot, log }: ScenarioContext,
  width: string,
) {
  const answered = page.waitForResponse(
    (response) =>
      new URL(response.url()).pathname === "/summary" &&
      response.request().method() === "POST",
    { timeout: 30_000 },
  );
  await page.locator('[data-ui="summary-open"]').click();
  const status = (await answered).status();
  log("summary-answer", { width, status });
  if (status !== 200) {
    await page.locator('[data-ui="summary-error"]').waitFor({ timeout: 5_000 });
    await screenshot(`summary-error-${width}`);
    const retried = page.waitForResponse(
      (response) =>
        new URL(response.url()).pathname === "/summary" &&
        response.request().method() === "POST",
      { timeout: 30_000 },
    );
    await page.locator('[data-ui="summary-retry"]').click();
    assert((await retried).status() === 200, "Retry did not succeed");
  }
  const draft = page.locator('[data-ui="summary-draft-text"]');
  await draft.waitFor({ timeout: 5_000 });
  const text = (await draft.textContent()) ?? "";
  assert(text.length > 0, "Draft is empty");
  await screenshot(`summary-panel-${width}`);
  return text;
}

async function insertDraft(
  { page, bridge, screenshot }: ScenarioContext,
  width: string,
  draft: string,
) {
  const sendsBefore = bridge.requests.filter((r) => r.path === "/send").length;
  await page.locator('[data-ui="summary-insert"]').click();
  await page.locator('[data-ui="summary"]').waitFor({ state: "detached" });
  const input = page.locator('[data-ui="composer-input"]');
  assert((await input.inputValue()) === draft, "Draft not in the composer");
  assert(
    await input.evaluate((node) => node === document.activeElement),
    "Composer is not focused after insert",
  );
  const sendsAfter = bridge.requests.filter((r) => r.path === "/send").length;
  assert(sendsAfter === sendsBefore, "Inserting the draft sent something");
  await screenshot(`summary-inserted-${width}`);
}

/** 오모냥 요약: header control → panel → 입력창에 넣기 fills the composer and sends nothing. */
export const scenario: Scenario = {
  id: "summary-panel",
  async run(context) {
    const { page, url } = context;
    if (!process.env.SAYA_SUMMARY_URL) await stubSummary(page);

    await page.setViewportSize(DESKTOP);
    await openRoom(page, url);
    const desktopDraft = await summarise(context, "1440");
    await insertDraft(context, "1440", desktopDraft);

    // Same room, one pane wide: the composer is emptied so the second insert is checked alone.
    await page.setViewportSize(MOBILE);
    await page.locator('[data-ui="composer-input"]').fill("");
    const mobileDraft = await summarise(context, "390");
    await insertDraft(context, "390", mobileDraft);
  },
};
