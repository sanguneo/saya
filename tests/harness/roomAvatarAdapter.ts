import type { Page } from "playwright-core";
import { CONTRACT_VERSION } from "../../src/contract/tsuba/version";

export const GOOD_ROOM_AVATAR = "room:a&b=c#d";

/** Only invented data and an existing synthetic raster; no messenger account. */
export async function roomAvatarAdapter(page: Page, files = true) {
  const png = await Bun.file(
    new URL("../fixtures/synthetic-media.png", import.meta.url),
  ).arrayBuffer();
  const media: string[] = [];
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
          ...(files ? { "attachments.read": {} } : {}),
        },
      });
    if (request.pathname.endsWith("/rooms"))
      return json({
        ok: true,
        complete: false,
        rooms: [
          {
            id: "good",
            title: "가상 관측 모임",
            kind: "group",
            unread: 2,
            avatar: GOOD_ROOM_AVATAR,
          },
          {
            id: "broken",
            title: "가상 사진 없음",
            kind: "direct",
            unread: 0,
            avatar: "broken",
          },
          { id: "absent", title: "가상 기본 표시", kind: "direct", unread: 0 },
          {
            id: "disabled",
            title: "가상 미디어 제한",
            kind: "group",
            unread: 0,
            avatar: "disabled",
            features: { "attachments.read": false },
          },
        ],
      });
    if (request.pathname.endsWith("/media")) {
      const id = request.searchParams.get("id") ?? "";
      media.push(id);
      return id === GOOD_ROOM_AVATAR
        ? route.fulfill({ contentType: "image/png", body: Buffer.from(png) })
        : route.fulfill({
            status: 404,
            json: {
              ok: false,
              error: { code: "NOT_FOUND", message: "Synthetic missing photo" },
            },
          });
    }
    if (request.pathname.endsWith("/stream"))
      return route.fulfill({
        status: 503,
        json: {
          ok: false,
          error: { code: "BUSY", message: "Synthetic stream unavailable" },
        },
      });
    throw new Error(`Unexpected synthetic adapter route: ${request.pathname}`);
  });
  return media;
}
