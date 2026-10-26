import { type ClipboardEvent, lazy, useRef } from "react";
import { formatSize } from "../attachments/pages";
import styles from "./Attach.module.css";

export const ATTACH_COPY = {
  pick: "파일 첨부",
  pickPhoto: "사진 첨부",
  send: "파일 보내기",
  sending: "보내는 중",
  cancel: "빼기",
  tooLarge: (max: number) =>
    `파일이 너무 큽니다. ${formatSize(max)}까지 보낼 수 있습니다.`,
  empty: "빈 파일은 보낼 수 없습니다.",
  wrongType: "이 대화가 받지 않는 종류의 파일입니다.",
} as const;

/**
 * The media types an adapter declares it sends, if it narrows them: a file
 * control is drawn for pictures only when every type is an image, and the
 * picker is told to offer exactly those. No list means any file.
 */
export function pickable(types: readonly string[] | undefined) {
  const list = types && types.length > 0 ? types : undefined;
  const accept = list?.join(",");
  const imagesOnly =
    list !== undefined && list.every((type) => type.startsWith("image/"));
  const accepts = (file: File) =>
    list === undefined ||
    list.includes((file.type.split(";")[0] ?? "").trim().toLowerCase());
  return { accept, imagesOnly, accepts };
}

/** The picker stages one file at a time; text-only paste stays with the browser. */
export function pasteImage(
  event: Pick<
    ClipboardEvent<HTMLTextAreaElement>,
    "clipboardData" | "preventDefault"
  >,
  onPick: (file: File) => void,
) {
  for (const item of Array.from(event.clipboardData.items)) {
    if (!item.type.startsWith("image/")) continue;
    const file = item.getAsFile();
    if (!file) continue;
    event.preventDefault();
    onPick(file);
    return;
  }
}

const CLIP =
  "M20 11.5 12.2 19.3a5 5 0 0 1-7.1-7.1l8.3-8.3a3.3 3.3 0 0 1 4.7 4.7l-8.3 8.3a1.6 1.6 0 0 1-2.3-2.3l7.6-7.6";
const PICTURE =
  "M5 5h14a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Zm-1 11 4.5-4.5 3.5 3.5 2.5-2.5L20 17M15.5 9.5h.01";

/**
 * The browser's own picker, behind a button in the composer's row. `photo`
 * asks for pictures only, which a phone answers with its photo library; the
 * plain clip takes any file.
 */
export function AttachButton({
  disabled,
  photo = false,
  accept,
  onPick,
}: {
  disabled?: boolean;
  photo?: boolean;
  accept?: string | undefined;
  onPick: (file: File) => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  const label = photo ? ATTACH_COPY.pickPhoto : ATTACH_COPY.pick;
  const filter = accept ?? (photo ? "image/*" : undefined);
  return (
    <>
      <button
        type="button"
        className={styles.clip}
        data-ui={photo ? "attach-photo" : "attach"}
        aria-label={label}
        title={label}
        disabled={disabled}
        onClick={() => input.current?.click()}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path
            d={photo ? PICTURE : CLIP}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      <input
        ref={input}
        type="file"
        hidden
        tabIndex={-1}
        {...(filter ? { accept: filter } : {})}
        data-ui={photo ? "attach-photo-input" : "attach-input"}
        onChange={(event) => {
          const file = event.currentTarget.files?.[0];
          event.currentTarget.value = "";
          if (file) onPick(file);
        }}
      />
    </>
  );
}

/** The picked-file row, loaded when a file is first picked: its styles stay out of the first paint. */
export const StagedFile = lazy(() =>
  import("./Staged").then((module) => ({ default: module.StagedFile })),
);
