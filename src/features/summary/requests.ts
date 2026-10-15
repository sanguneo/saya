import type { ClientStores } from "../../core/stores";

/** Mirrors server/summary.ts; the server never sends more than this. */
export const SUMMARY_PATH = "/summary";
export const SUMMARY_MAX_MESSAGES = 60;

export type Summary = Readonly<{
  decisions: readonly string[];
  todos: readonly string[];
  draft: string;
}>;

export type SummaryMessage = Readonly<{
  sender: string;
  text: string;
  sentAt: string | null;
  fromMe: boolean;
}>;

export type SummaryInput = Readonly<{
  room: string;
  messages: readonly SummaryMessage[];
}>;

export type SummaryOutcome =
  | Readonly<{ kind: "ok"; summary: Summary }>
  /** Nothing to send: the wall holds no text messages yet. */
  | Readonly<{ kind: "empty" }>
  /** The server answered with an error; only its code is ever shown. */
  | Readonly<{ kind: "failed"; code: string }>
  | Readonly<{ kind: "network" }>;

type Fetch = (input: string, init?: RequestInit) => Promise<Response>;

/**
 * Whether this deployment offers summaries. Only a JSON `{ enabled: true }`
 * counts: a 404 means off, and an HTML fallback page from a proxy without the
 * route must not draw the control either.
 */
export async function probeSummary(fetcher: Fetch = fetch): Promise<boolean> {
  try {
    const answer = await fetcher(SUMMARY_PATH, {
      headers: { accept: "application/json" },
    });
    if (!answer.ok) return false;
    if (!answer.headers.get("content-type")?.includes("application/json"))
      return false;
    const body = (await answer.json()) as { enabled?: unknown };
    return body.enabled === true;
  } catch {
    return false;
  }
}

let availability: Promise<boolean> | null = null;

/** One probe per page load; every room header reads the same answer. */
export function summaryAvailable(): Promise<boolean> {
  availability ??= probeSummary();
  return availability;
}

/** The newest text messages the room's wall holds, oldest first. */
export function summaryInput(
  stores: ClientStores,
  roomId: string,
  untitled: string,
): SummaryInput {
  const room = stores.getSnapshot(`room.${roomId}`)?.room;
  const thread = stores.getSnapshot(`thread.${roomId}`);
  const messages: SummaryMessage[] = [];
  for (const id of thread.order) {
    const message = thread.messages[id];
    if (!message || message.text.trim() === "") continue;
    messages.push({
      sender: message.sender,
      text: message.text,
      sentAt: message.sentAt,
      fromMe: message.fromMe,
    });
  }
  return {
    room: room?.title ?? untitled,
    messages: messages.slice(-SUMMARY_MAX_MESSAGES),
  };
}

function isStrings(value: unknown): value is string[] {
  return (
    Array.isArray(value) && value.every((item) => typeof item === "string")
  );
}

export async function requestSummary(
  input: SummaryInput,
  signal: AbortSignal,
  fetcher: Fetch = fetch,
): Promise<SummaryOutcome> {
  if (input.messages.length === 0) return { kind: "empty" };
  let answer: Response;
  try {
    answer = await fetcher(SUMMARY_PATH, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(input),
      signal,
    });
  } catch {
    return { kind: "network" };
  }
  let body: unknown;
  try {
    body = await answer.json();
  } catch {
    return { kind: "failed", code: `HTTP_${answer.status}` };
  }
  if (!answer.ok) {
    const code = (body as { error?: { code?: unknown } } | null)?.error?.code;
    return {
      kind: "failed",
      code: typeof code === "string" ? code : `HTTP_${answer.status}`,
    };
  }
  const { decisions, todos, draft } = (body ?? {}) as Record<string, unknown>;
  if (!isStrings(decisions) || !isStrings(todos) || typeof draft !== "string")
    return { kind: "failed", code: "UPSTREAM_MALFORMED" };
  return { kind: "ok", summary: { decisions, todos, draft } };
}
