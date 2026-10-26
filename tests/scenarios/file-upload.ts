import assert from "node:assert/strict";
import type { Locator } from "playwright-core";
import { CONTRACT_VERSION } from "../../src/contract/tsuba/version";
import type { AdapterMessage } from "../../src/transport/adapters";
import { FIRST_ROOM_ID } from "../fixtures/data";
import { bounded, deferred } from "../harness/barriers";
import type { Scenario } from "../harness/runner";

// Every name and byte is invented; the picture is the repository's synthetic PNG.
const CORE_LIMIT = 1024 * 1024;
const CAPTION = "가상 설명 한 줄";
const listed: AdapterMessage = {
  id: "1",
  roomId: "room",
  senderId: "synthetic",
  sender: "가상참여자-1",
  fromMe: false,
  sentAt: "2037-04-07T09:00:00Z",
  kind: "text",
  text: "가상 대화 첫 줄입니다.",
};

function multipart(body: Buffer | null): Record<string, string> {
  const text = body?.toString("utf8") ?? "";
  const fields: Record<string, string> = {};
  for (const match of text.matchAll(
    /name="([^"]+)"(?:; filename="([^"]+)")?\r\n(?:[^\r\n]+\r\n)*\r\n([\s\S]*?)\r\n--/g,
  ))
    fields[match[1] ?? ""] = match[2] ?? match[3] ?? "";
  return fields;
}

async function paste(
  input: Locator,
  image?: { bytes: number[]; name: string; type: string },
) {
  return input.evaluate((element, image) => {
    const clipboardData = new DataTransfer();
    clipboardData.setData("text/plain", "붙여 넣을 글");
    if (image)
      clipboardData.items.add(
        new File([new Uint8Array(image.bytes)], image.name, {
          type: image.type,
        }),
      );
    const event = new ClipboardEvent("paste", {
      clipboardData,
      bubbles: true,
      cancelable: true,
    });
    element.dispatchEvent(event);
    return event.defaultPrevented;
  }, image);
}

/** A picked file is shown, held to the declared limit, and sent once by its own button. */
export const scenario: Scenario = {
  id: "file-upload",
  async run({ context, url, evidence, log }) {
    const png = Buffer.from(
      await Bun.file(
        new URL("../fixtures/synthetic-media.png", import.meta.url),
      ).arrayBuffer(),
    );
    for (const width of [1440, 390]) {
      const page = await context.newPage();
      await page.setViewportSize({ width, height: width === 1440 ? 900 : 844 });
      const coreUploads: Record<string, string>[] = [];
      const adapterUploads: Record<string, string>[] = [];
      const coreUploadGate = deferred<void>();
      const image = {
        bytes: [...png],
        name: "synthetic.png",
        type: "image/png",
      };
      await page.route("**/api/health", (route) =>
        route.fulfill({
          json: { ok: true, features: { upload: { maxBytes: CORE_LIMIT } } },
        }),
      );
      await page.route("**/api/upload", async (route) => {
        coreUploads.push(multipart(route.request().postDataBuffer()));
        await bounded(coreUploadGate.promise, "release core upload");
        return route.fulfill({
          json: {
            ok: true,
            submitted: true,
            room: "가상 관측소 1",
            roomId: FIRST_ROOM_ID,
            name: "synthetic.png",
            size: png.byteLength,
          },
        });
      });
      await page.route("**/adapters{,/**}", (route) => {
        const request = new URL(route.request().url());
        const photos = request.pathname.includes("/photos/");
        if (request.pathname === "/adapters")
          return route.fulfill({
            json: { adapters: [{ id: "synthetic" }, { id: "photos" }] },
          });
        if (request.pathname.endsWith("/capabilities"))
          return route.fulfill({
            json: {
              ok: true,
              contract: { version: CONTRACT_VERSION },
              adapter: {
                name: photos ? "photos" : "synthetic",
                version: "0.0.0",
              },
              provider: photos
                ? { id: "photos", name: "Pictures only" }
                : { id: "invented", name: "Synthetic messenger" },
              account: { kind: "user" },
              revision: photos ? "fedcba9876543210" : "0123456789abcdef",
              features: {
                "rooms.list": {},
                "messages.read": { paging: "none", maxLimit: 50 },
                "attachments.read": {},
                "messages.send": { maxLength: 4096, receipt: "stored" },
                "attachments.send": photos
                  ? {
                      maxBytes: 10 * 1024 * 1024,
                      caption: false,
                      types: ["image/jpeg", "image/png", "image/gif"],
                      receipt: "stored",
                    }
                  : {
                      maxBytes: 10 * 1024 * 1024,
                      caption: true,
                      captionMaxLength: 1024,
                      receipt: "stored",
                    },
              },
            },
          });
        if (request.pathname.endsWith("/rooms"))
          return route.fulfill({
            json: {
              ok: true,
              complete: true,
              rooms: [
                {
                  id: "room",
                  title: photos ? "사진 전용 방" : "가상 업로드 방",
                  kind: "group",
                  unread: 0,
                },
                {
                  id: "no-upload",
                  title: "첨부 없는 가상 방",
                  kind: "group",
                  unread: 0,
                  features: { "attachments.send": false },
                },
              ],
            },
          });
        if (request.pathname.endsWith("/messages"))
          return route.fulfill({
            json: { ok: true, messages: [listed], hasEarlier: false },
          });
        if (request.pathname.endsWith("/stream"))
          return route.fulfill({
            status: 503,
            json: { ok: false, error: { code: "BUSY", message: "Synthetic" } },
          });
        if (request.pathname.endsWith("/media"))
          return route.fulfill({ contentType: "image/png", body: png });
        if (request.pathname.endsWith("/upload")) {
          const fields = multipart(route.request().postDataBuffer());
          adapterUploads.push(fields);
          return route.fulfill({
            json: {
              ok: true,
              message: {
                ...listed,
                id: "2",
                fromMe: true,
                kind: "media",
                sender: "나",
                text: fields.caption ?? "",
                attachments: [
                  {
                    id: "sent",
                    kind: "image",
                    mimeType: "image/png",
                    width: 640,
                    height: 480,
                  },
                ],
              },
            },
          });
        }
        throw new Error(`Unexpected synthetic route ${request.pathname}`);
      });

      // KakaoTalk: the core declares uploads, so the clip is drawn.
      await page.goto(`${url}/#/room/${FIRST_ROOM_ID}`, { waitUntil: "load" });
      const composer = page.locator('[data-ui="composer"]');
      await composer.locator('[data-ui="attach"]').waitFor({ timeout: 10_000 });
      const coreInput = composer.locator("textarea");
      await coreInput.fill(CAPTION);
      assert.equal(await paste(coreInput), false);
      assert.equal(await coreInput.inputValue(), CAPTION);
      assert.equal(await paste(coreInput, { ...image, bytes: [] }), true);
      await composer.locator('[data-ui="attach-note"]').waitFor();
      assert.ok(await composer.locator('[data-ui="attach-send"]').isDisabled());
      await composer.locator('[data-ui="attach-cancel"]').click();
      assert.equal(
        await composer
          .locator('[data-ui="attach-photo-input"]')
          .getAttribute("accept"),
        "image/*",
      );
      await composer.locator('[data-ui="attach-input"]').setInputFiles({
        name: "too-large.bin",
        mimeType: "application/octet-stream",
        buffer: Buffer.alloc(CORE_LIMIT + 1),
      });
      await composer
        .locator('[data-ui="attach-note"]')
        .waitFor({ timeout: 10_000 });
      assert.ok(await composer.locator('[data-ui="attach-send"]').isDisabled());
      await page.screenshot({
        path: `${evidence}/core-too-large-${width}.png`,
      });
      await composer.locator('[data-ui="attach-cancel"]').click();
      assert.equal(await paste(coreInput, image), true);
      await composer
        .locator('[data-ui="attach-staged"] img')
        .waitFor({ timeout: 10_000 });
      await page.screenshot({ path: `${evidence}/core-staged-${width}.png` });
      assert.equal(coreUploads.length, 0);
      const uploading = page.waitForRequest("**/api/upload");
      await composer.locator('[data-ui="attach-send"]').click();
      await uploading;
      assert.ok(await composer.locator('[data-ui="attach"]').isDisabled());
      assert.equal(
        await paste(coreInput, { ...image, name: "replacement.png" }),
        false,
      );
      coreUploadGate.resolve();
      await composer
        .locator('[data-ui="composer-submitted"]')
        .waitFor({ timeout: 10_000 });
      assert.equal(coreUploads.length, 1);
      assert.equal(coreUploads[0]?.room, FIRST_ROOM_ID);
      assert.equal(coreUploads[0]?.openRoom, "true");
      assert.equal(coreUploads[0]?.file, "synthetic.png");
      assert.equal(await coreInput.inputValue(), CAPTION);
      assert.equal(
        await composer.locator('[data-ui="attach-staged"]').count(),
        0,
      );
      await page.screenshot({ path: `${evidence}/core-sent-${width}.png` });

      // An adapter that takes captions sends the box's words with the file.
      await page.goto(`${url}/#/adapters/synthetic/room`, {
        waitUntil: "load",
      });
      const adapter = page.locator('[data-ui="adapter-composer"]');
      await adapter.locator('[data-ui="attach"]').waitFor({ timeout: 10_000 });
      await adapter.locator("textarea").fill(CAPTION);
      assert.equal(await paste(adapter.locator("textarea")), false);
      assert.equal(await paste(adapter.locator("textarea"), image), true);
      await adapter
        .locator('[data-ui="attach-note"]')
        .waitFor({ timeout: 10_000 });
      await page.screenshot({
        path: `${evidence}/adapter-staged-${width}.png`,
      });
      assert.equal(adapterUploads.length, 0);
      await adapter.locator('[data-ui="attach-send"]').click();
      await page
        .locator('[data-ui="adapter-turn"][data-message-id="2"]')
        .waitFor({ timeout: 10_000 });
      assert.equal(adapterUploads.length, 1);
      assert.equal(adapterUploads[0]?.roomId, "room");
      assert.equal(adapterUploads[0]?.caption, CAPTION);
      assert.equal(await adapter.locator("textarea").inputValue(), "");
      await page.screenshot({ path: `${evidence}/adapter-sent-${width}.png` });
      // An adapter that declares attachments.send types for pictures only draws
      // just the photo button, with the picker offering exactly those types.
      await page.goto(`${url}/#/adapters/photos/room`, { waitUntil: "load" });
      const pictures = page.locator('[data-ui="adapter-composer"]');
      await pictures
        .locator('[data-ui="attach-photo"]')
        .waitFor({ timeout: 10_000 });
      assert.equal(await pictures.locator('[data-ui="attach"]').count(), 0);
      assert.equal(
        await pictures
          .locator('[data-ui="attach-photo-input"]')
          .getAttribute("accept"),
        "image/jpeg,image/png,image/gif",
      );
      assert.equal(
        await paste(pictures.locator("textarea"), {
          ...image,
          type: "image/svg+xml",
          name: "unsupported.svg",
        }),
        true,
      );
      await pictures.locator('[role="status"]').waitFor();
      assert.equal(
        await pictures.locator('[data-ui="attach-staged"]').count(),
        0,
      );
      assert.equal(await paste(pictures.locator("textarea"), image), true);
      await pictures.locator('[data-ui="attach-staged"] img').waitFor();
      await page.screenshot({
        path: `${evidence}/adapter-images-only-${width}.png`,
      });

      // Room capabilities remove paste support along with the picker.
      await page.goto(`${url}/#/adapters/synthetic/no-upload`, {
        waitUntil: "load",
      });
      const unsupported = page.locator('[data-ui="adapter-composer"]');
      await unsupported.waitFor();
      assert.equal(await unsupported.locator('[data-ui="attach"]').count(), 0);
      assert.equal(
        await unsupported.locator('[data-ui="attach-photo"]').count(),
        0,
      );
      assert.equal(await paste(unsupported.locator("textarea"), image), false);
      assert.equal(
        await unsupported.locator('[data-ui="attach-staged"]').count(),
        0,
      );
      assert.equal(adapterUploads.length, 1);

      log(`file upload checked at ${width}px`);
      await page.close();
    }
  },
};
