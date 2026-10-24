import type { ClientStores } from "../../core/stores";

/** Mirrors server/assist.ts; the server takes no more than this. */
export const ASSIST_PATH = "/assist";
export const ASSIST_MAX_MESSAGES = 30;

export type AssistSettings = Readonly<{
  user: string;
  prefix: string;
  prefixOn: boolean;
}>;

export type Candidate = Readonly<{
  text: string;
  score: number;
  fit: number;
  tone: number;
  risk: number;
}>;

export type AssistAnswer = Readonly<{
  summary: Readonly<{ want: string; open: readonly string[] }>;
  candidates: readonly Candidate[];
  hidden: Readonly<{ risky: number; offTopic: number }> | null;
  /** "ok", or the checker's failure code: then no candidate is shown. */
  check: string;
}>;

export type AssistOutcome =
  | Readonly<{ kind: "ok"; answer: AssistAnswer }>
  | Readonly<{ kind: "failed"; code: string }>
  | Readonly<{ kind: "network" }>;

type Fetch = (input: string, init?: RequestInit) => Promise<Response>;

/**
 * Whether this deployment offers reply help, and for whom. Only a JSON
 * `{ enabled: true }` counts: a 404 means off, and an HTML fallback page from
 * a proxy without the route must not turn it on either.
 */
export async function probeAssist(
  fetcher: Fetch = fetch,
): Promise<AssistSettings | null> {
  try {
    const answer = await fetcher(ASSIST_PATH, {
      headers: { accept: "application/json" },
    });
    if (!answer.ok) return null;
    if (!answer.headers.get("content-type")?.includes("application/json")) {
      return null;
    }
    const body = (await answer.json()) as Record<string, unknown>;
    if (body.enabled !== true) return null;
    const prefix = typeof body.prefix === "string" ? body.prefix : "";
    return {
      user: typeof body.user === "string" ? body.user : "",
      prefix,
      prefixOn: prefix !== "" && body.prefixOn === true,
    };
  } catch {
    return null;
  }
}

/** The newest text messages a room's wall holds, oldest first; null when there are none. */
export function assistInput(
  stores: ClientStores,
  roomId: string,
  untitled: string,
) {
  const room = stores.getSnapshot(`room.${roomId}`)?.room;
  const thread = stores.getSnapshot(`thread.${roomId}`);
  const messages: {
    sender: string;
    text: string;
    sentAt: string | null;
    fromMe: boolean;
  }[] = [];
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
  if (messages.length === 0) return null;
  return {
    room: room?.title ?? untitled,
    messages: messages.slice(-ASSIST_MAX_MESSAGES),
  };
}

/**
 * The newest message from the other side that has text, or null when the
 * room's newest text is the account's own: then there is nothing to answer.
 */
export function awaitingReply(
  stores: ClientStores,
  roomId: string,
): string | null {
  const thread = stores.getSnapshot(`thread.${roomId}`);
  for (let index = thread.order.length - 1; index >= 0; index--) {
    const id = thread.order[index];
    const message = id === undefined ? undefined : thread.messages[id];
    if (!message || message.text.trim() === "") continue;
    return message.fromMe ? null : message.id;
  }
  return null;
}

function isCandidate(value: unknown): value is Candidate {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return (
    typeof item.text === "string" &&
    typeof item.score === "number" &&
    typeof item.fit === "number" &&
    typeof item.tone === "number" &&
    typeof item.risk === "number"
  );
}

/** Reads the server's answer; anything not in its shape is a failure, never a guess. */
export function readAnswer(body: unknown): AssistAnswer | null {
  if (!body || typeof body !== "object") return null;
  const { summary, candidates, hidden, check } = body as Record<
    string,
    unknown
  >;
  if (!summary || typeof summary !== "object") return null;
  const { want, open } = summary as Record<string, unknown>;
  if (typeof want !== "string" || !Array.isArray(open)) return null;
  if (!Array.isArray(candidates) || !candidates.every(isCandidate)) {
    return null;
  }
  if (typeof check !== "string") return null;
  const counts =
    hidden && typeof hidden === "object"
      ? (hidden as Record<string, unknown>)
      : null;
  return {
    summary: {
      want,
      open: open.filter((item): item is string => typeof item === "string"),
    },
    candidates,
    hidden: counts
      ? {
          risky: typeof counts.risky === "number" ? counts.risky : 0,
          offTopic: typeof counts.offTopic === "number" ? counts.offTopic : 0,
        }
      : null,
    check,
  };
}

export async function requestAssist(
  input: NonNullable<ReturnType<typeof assistInput>>,
  signal: AbortSignal,
  fetcher: Fetch = fetch,
): Promise<AssistOutcome> {
  let answer: Response;
  try {
    answer = await fetcher(ASSIST_PATH, {
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
  const read = readAnswer(body);
  return read
    ? { kind: "ok", answer: read }
    : { kind: "failed", code: "MALFORMED" };
}

/** One short, plain reason from the checker's three numbers. */
export function reasonOf(candidate: Candidate): string {
  const fit =
    candidate.fit >= 0.7
      ? "질문에 잘 맞아요"
      : candidate.fit >= 0.4
        ? "질문과 조금 맞아요"
        : "질문과 덜 맞아요";
  const tone =
    candidate.tone >= 0.6
      ? "말투 비슷해요"
      : candidate.tone >= 0.3
        ? "말투 조금 달라요"
        : "말투 많이 달라요";
  const risk = candidate.risk >= 0.2 ? " · 민감한 내용 확인" : "";
  return `${fit} · ${tone}${risk}`;
}
