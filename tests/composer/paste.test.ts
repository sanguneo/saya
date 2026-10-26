import { describe, expect, test } from "bun:test";
import { pasteImage } from "../../src/features/attach";

function clipboard(
  items: Array<{ type: string; getAsFile: () => File | null }>,
) {
  let prevented = false;
  const picked: File[] = [];
  const event = {
    clipboardData: { items } as unknown as DataTransfer,
    preventDefault: () => {
      prevented = true;
    },
  };
  pasteImage(event, (file) => picked.push(file));
  return { prevented, picked };
}

describe("composer image paste", () => {
  test("stages the first image through the picker callback and consumes the paste", () => {
    const image = new File(["synthetic"], "clipboard.png", {
      type: "image/png",
    });
    const next = new File(["second"], "second.png", { type: "image/png" });
    const result = clipboard([
      { type: "text/plain", getAsFile: () => null },
      { type: image.type, getAsFile: () => image },
      { type: next.type, getAsFile: () => next },
    ]);
    expect(result.prevented).toBe(true);
    expect(result.picked).toEqual([image]);
  });

  test("leaves text, HTML, non-image files and empty clipboards to the browser", () => {
    for (const items of [
      [],
      [{ type: "text/plain", getAsFile: () => null }],
      [{ type: "text/html", getAsFile: () => null }],
      [
        {
          type: "application/pdf",
          getAsFile: () => new File(["synthetic"], "file.pdf"),
        },
      ],
    ]) {
      expect(clipboard(items)).toEqual({ prevented: false, picked: [] });
    }
  });

  test("skips unavailable images without consuming a paste that has no file", () => {
    expect(clipboard([{ type: "image/png", getAsFile: () => null }])).toEqual({
      prevented: false,
      picked: [],
    });
    const image = new File(["synthetic"], "clipboard.webp", {
      type: "image/webp",
    });
    expect(
      clipboard([
        { type: "image/png", getAsFile: () => null },
        { type: image.type, getAsFile: () => image },
      ]),
    ).toEqual({ prevented: true, picked: [image] });
  });

  test("passes oversized and empty images to existing staged-file validation", () => {
    for (const image of [
      new File([], "empty.png", { type: "image/png" }),
      new File([new Uint8Array(1025)], "large.png", { type: "image/png" }),
    ]) {
      expect(clipboard([{ type: image.type, getAsFile: () => image }])).toEqual(
        { prevented: true, picked: [image] },
      );
    }
  });
});
