import { afterAll, describe, expect, test } from "bun:test";
import {
  handleSummary,
  parseSummary,
  type SummaryConfig,
  summaryConfig,
} from "../../server/summary";
import { probeSummary } from "../../src/features/summary/requests";

/** A synthetic OpenAI-compatible model: answers what the test queues, records what it was sent. */
const replies: Response[] = [];
const received: { authorization: string | null; body: unknown }[] = [];
const model = Bun.serve({
  hostname: "127.0.0.1",
  port: 0,
  async fetch(request) {
    received.push({
      authorization: request.headers.get("authorization"),
      body: await request.json(),
    });
    return replies.shift() ?? new Response(null, { status: 500 });
  },
});
afterAll(() => model.stop(true));

const config: SummaryConfig = {
  url: `http://127.0.0.1:${model.port}/v1`,
  model: "synthetic-model",
  key: "synthetic-key",
};

function completion(content: string) {
  return Response.json({ choices: [{ message: { content } }] });
}

function post(body: unknown, headers: Record<string, string> = {}) {
  return new Request("http://127.0.0.1/summary", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "sec-fetch-site": "same-origin",
      ...headers,
    },
    body: JSON.stringify(body),
  });
}

const input = {
  room: "가상 방",
  messages: [
    {
      sender: "가상참여자-1",
      text: "금요일 몇 시?",
      sentAt: null,
      fromMe: false,
    },
    { sender: "나", text: "확인해 볼게", sentAt: null, fromMe: true },
  ],
};

describe("summary JSON", () => {
  test("reads the object out of a fenced, chatty reply and drops non-strings", () => {
    const parsed = parseSummary(
      'Sure:\n```json\n{"decisions":["A", 3, " "],"todos":["B"],"draft":" C "}\n```',
    );
    expect(parsed).toEqual({ decisions: ["A"], todos: ["B"], draft: "C" });
  });

  test("anything that is not the summary object is null, never a guess", () => {
    expect(parseSummary("no json here")).toBeNull();
    expect(parseSummary("{not json}")).toBeNull();
    expect(parseSummary('{"answer":"x"}')).toBeNull();
    expect(parseSummary("[1,2]")).toBeNull();
  });
});

describe("summary off", () => {
  test("unconfigured, the route is absent for every method and the client draws nothing", async () => {
    expect(summaryConfig({})).toBeNull();
    expect(
      summaryConfig({ SAYA_SUMMARY_URL: "http://127.0.0.1:1/v1" }),
    ).toBeNull();
    const get = await handleSummary(
      new Request("http://127.0.0.1/summary"),
      null,
    );
    expect(get?.status).toBe(404);
    expect((await handleSummary(post(input), null))?.status).toBe(404);

    const answer = (response: Response) => async () => response;
    expect(
      await probeSummary(answer(new Response(null, { status: 404 }))),
    ).toBe(false);
    // A proxy without the route falls back to the SPA's index.html.
    expect(
      await probeSummary(
        answer(
          new Response("<!doctype html>", {
            headers: { "content-type": "text/html" },
          }),
        ),
      ),
    ).toBe(false);
    expect(await probeSummary(answer(Response.json({ enabled: true })))).toBe(
      true,
    );
  });
});

describe("summary on", () => {
  test("forwards the transcript with the server's key and answers the parsed summary", async () => {
    replies.push(
      completion(
        '{"decisions":["금요일 시간"],"todos":["장소 확인"],"draft":"7시 어때요?"}',
      ),
    );
    const answer = await handleSummary(post(input), config);
    expect(answer?.status).toBe(200);
    expect(await answer?.json()).toEqual({
      decisions: ["금요일 시간"],
      todos: ["장소 확인"],
      draft: "7시 어때요?",
    });
    const sent = received.at(-1);
    expect(sent?.authorization).toBe("Bearer synthetic-key");
    expect(JSON.stringify(sent?.body)).toContain("금요일 몇 시?");
    expect((sent?.body as { model?: string } | undefined)?.model).toBe(
      "synthetic-model",
    );
  });

  test("a failing or rambling model is an error code, and cross-site or malformed requests are refused", async () => {
    replies.push(new Response("overloaded", { status: 503 }));
    const failed = await handleSummary(post(input), config);
    expect(failed?.status).toBe(502);
    expect(await failed?.json()).toEqual({
      error: { code: "UPSTREAM_FAILED" },
    });

    replies.push(completion("I could not decide."));
    const malformed = await handleSummary(post(input), config);
    expect(malformed?.status).toBe(502);
    expect(await malformed?.json()).toEqual({
      error: { code: "UPSTREAM_MALFORMED" },
    });

    const before = received.length;
    expect(
      (
        await handleSummary(
          post(input, { "sec-fetch-site": "cross-site" }),
          config,
        )
      )?.status,
    ).toBe(403);
    expect(
      (await handleSummary(post({ room: "x", messages: [] }), config))?.status,
    ).toBe(400);
    expect(
      (
        await handleSummary(
          post({ room: "x", messages: [{ text: 1 }] }),
          config,
        )
      )?.status,
    ).toBe(400);
    // Refused requests never reached the model.
    expect(received.length).toBe(before);
  });
});
