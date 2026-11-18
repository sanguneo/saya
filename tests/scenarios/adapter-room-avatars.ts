import assert from "node:assert/strict";
import { adapterListHash } from "../../src/app/routes";
import { bounded } from "../harness/barriers";
import {
  GOOD_ROOM_AVATAR,
  roomAvatarAdapter,
} from "../harness/roomAvatarAdapter";
import type { Scenario } from "../harness/runner";

export const scenario: Scenario = {
  id: "adapter-room-avatars",
  async run({ context, page: primary, url, log, evidence }) {
    const results: {
      fixture: string;
      picture: boolean;
      fallbacks: number;
      requests: string[];
      overflow: boolean;
    }[] = [];
    for (const width of [1440, 390]) {
      for (const theme of ["light", "dark"] as const) {
        const page = results.length ? await context.newPage() : primary;
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
        const media = await roomAvatarAdapter(page);
        await page.goto(`${url}/${adapterListHash("synthetic")}`, {
          waitUntil: "load",
        });
        const rows = page.locator(
          '[data-ui="inbox-row"][data-provider="synthetic"]',
        );
        await rows.last().waitFor();
        assert.equal(await rows.count(), 4);
        await bounded(
          page.evaluate(async () => {
            await Promise.all(
              [
                ...document.querySelectorAll<HTMLImageElement>(
                  '[data-ui="inbox-row"][data-provider="synthetic"] img',
                ),
              ].map(
                (image) =>
                  new Promise<void>((resolve) => {
                    if (image.complete) return resolve();
                    image.addEventListener("load", () => resolve(), {
                      once: true,
                    });
                    image.addEventListener("error", () => resolve(), {
                      once: true,
                    });
                  }),
              ),
            );
          }),
          "room avatar images settled",
        );
        const fixture = `${width}-${theme}`;
        await page.screenshot({
          path: `${evidence}/${fixture}.png`,
          fullPage: true,
        });
        const picture = await page
          .locator('a[href="#/adapters/synthetic/good"] [data-ui="avatar"] img')
          .evaluateAll((images) =>
            images.some(
              (image) =>
                image instanceof HTMLImageElement && image.naturalWidth > 0,
            ),
          );
        const fallbacks = await page
          .locator(
            'a:not([href$="/good"]) [data-ui="avatar"]:not([data-picture])',
          )
          .count();
        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth > innerWidth,
        );
        results.push({
          fixture,
          picture,
          fallbacks,
          requests: [...media].sort(),
          overflow,
        });
        log("room-avatar-case", results.at(-1));
        for (const [id, title] of [
          ["good", "가상 관측 모임"],
          ["broken", "가상 사진 없음"],
          ["absent", "가상 기본 표시"],
          ["disabled", "가상 미디어 제한"],
        ] as const) {
          await page.goto(`${url}/#/adapters/synthetic/${id}`, {
            waitUntil: "load",
          });
          await page
            .getByRole("heading", { name: title, exact: true })
            .waitFor();
          const avatar = page.locator('header [data-ui="avatar"]');
          if (id === "good") {
            const image = avatar.locator("img");
            assert.equal(await image.count(), 1);
            await image.evaluate(async (element) => {
              if (element instanceof HTMLImageElement) await element.decode();
            });
            assert.equal(
              await image.evaluate(
                (element) =>
                  element instanceof HTMLImageElement &&
                  element.naturalWidth > 0,
              ),
              true,
            );
          } else {
            assert.equal(await avatar.locator("img").count(), 0);
            assert.equal(await avatar.textContent(), "가");
          }
          assert.equal(
            await page.evaluate(
              () => document.documentElement.scrollWidth > innerWidth,
            ),
            false,
          );
          await page.screenshot({
            path: `${evidence}/header-${fixture}-${id}.png`,
            fullPage: true,
          });
          log("room-header-avatar-case", {
            fixture,
            id,
            picture: id === "good",
          });
        }
        if (page !== primary) await page.close();
      }
    }
    const disabled = await context.newPage();
    const media = await roomAvatarAdapter(disabled, false);
    await disabled.goto(`${url}/${adapterListHash("synthetic")}`, {
      waitUntil: "load",
    });
    await disabled.locator('[data-ui="inbox-row"]').last().waitFor();
    assert.equal(
      await disabled.locator('[data-ui="inbox-row"] img').count(),
      0,
    );
    assert.deepEqual(media, []);
    await disabled.goto(`${url}/#/adapters/synthetic/good`, {
      waitUntil: "load",
    });
    await disabled
      .getByRole("heading", { name: "가상 관측 모임", exact: true })
      .waitFor();
    assert.equal(
      await disabled.locator('header [data-ui="avatar"] img').count(),
      0,
    );
    assert.deepEqual(media, []);
    await disabled.close();
    assert.deepEqual(
      results,
      [1440, 390].flatMap((width) =>
        ["light", "dark"].map((theme) => ({
          fixture: `${width}-${theme}`,
          picture: true,
          fallbacks: 3,
          requests: [GOOD_ROOM_AVATAR, "broken"].sort(),
          overflow: false,
        })),
      ),
    );
  },
};
