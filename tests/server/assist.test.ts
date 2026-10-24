import { afterAll, describe, expect, test } from "bun:test";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  type AssistConfig,
  assistConfig,
  handleAssist,
  parseDraft,
  rank,
} from "../../server/assist";

type Seen = { path: string; auth: string | null; body: unknown };
const seen: Seen[] = [];
let writer: (body: unknown) => Response = () => new Response(null);
let checker: (body: unknown) => Response = () => new Response(null);

const upstream = Bun.serve({
  port: 0,
  hostname: "127.0.0.1",
  async fetch(request) {
    const path = new URL(request.url).pathname;
    const body = await request.json();
    seen.push({ path, auth: request.headers.get("authorization"), body });
    return path === "/v1/chat/completions" ? writer(body) : checker(body);
  },
});
afterAll(() => upstream.stop(true));

const base = `http://127.0.0.1:${upstream.port}`;
const config: AssistConfig = {
  user: { name: "현지님", toneExamples: ["안녕하세요, 확인해 볼게요 :)"] },
  send: { prefix: "", prefixOn: false },
  kakaoCore: null,
  llm: { url: `${base}/v1`, model: "fake-writer", key: "writer-key" },
  agent: null,
  jev: { url: base, model: "jev-latest", key: "checker-key" },
};

const messages = [
  {
    sender: "가상손님",
    text: "예약 시간 바꿀 수 있나요?",
    sentAt: null,
    fromMe: false,
  },
];

function completion(content: string) {
  return Response.json({ choices: [{ message: { content } }] });
}

function post(body: unknown, site = "same-origin") {
  return new Request("http://saya.test/assist", {
    method: "POST",
    headers: { "content-type": "application/json", "sec-fetch-site": site },
    body: JSON.stringify(body),
  });
}

const DRAFT = JSON.stringify({
  want: "예약 시간 변경",
  open: ["바꿀 수 있는지"],
  candidates: ["좋은 답", "엉뚱한 답", "노출 답"],
});

describe("assist", () => {
  test("drafts, scores every candidate in one checker call, and shows the safe ones best first", async () => {
    seen.length = 0;
    writer = () => completion(`여기요 \`\`\`json\n${DRAFT}\n\`\`\``);
    checker = () =>
      Response.json({
        answers: {
          c1_fit: { noul: 0.9 },
          c1_tone: { noul: 0.8 },
          c1_risk: { noul: 0.02 },
          c2_fit: { noul: 0.05 },
          c2_tone: { noul: 0.5 },
          c2_risk: { noul: 0.01 },
          c3_fit: { noul: 0.9 },
          c3_tone: { noul: 0.9 },
          c3_risk: { noul: 0.95 },
        },
      });
    const answer = await handleAssist(
      post({ room: "가상 문의방", messages }),
      config,
    );
    expect(answer?.status).toBe(200);
    const body = (await answer?.json()) as {
      summary: { want: string };
      candidates: { text: string; score: number }[];
      hidden: { risky: number; offTopic: number };
      check: string;
    };
    expect(body.check).toBe("ok");
    expect(body.summary.want).toBe("예약 시간 변경");
    expect(body.candidates.map((item) => item.text)).toEqual(["좋은 답"]);
    expect(body.hidden).toEqual({ risky: 1, offTopic: 1 });
    expect(seen.map((item) => item.path)).toEqual([
      "/v1/chat/completions",
      "/v1/systemone",
    ]);
    expect(seen[0]?.auth).toBe("Bearer writer-key");
    expect(seen[1]?.auth).toBe("Bearer checker-key");
    const check = seen[1]?.body as {
      state: Record<string, string>;
      questions: object;
    };
    expect(check.state.c1).toBe("좋은 답");
    expect(Object.keys(check.questions)).toHaveLength(9);
  });

  test("a checker failure keeps the summary and shows no unchecked candidate", async () => {
    writer = () => completion(DRAFT);
    checker = () => new Response("payment required", { status: 402 });
    const answer = await handleAssist(post({ room: "가상", messages }), config);
    const body = (await answer?.json()) as {
      candidates: unknown[];
      check: string;
      summary: { want: string };
    };
    expect(answer?.status).toBe(200);
    expect(body.check).toBe("CHECK_FAILED");
    expect(body.candidates).toEqual([]);
    expect(body.summary.want).toBe("예약 시간 변경");
  });

  test("a writer failure or a reply without candidates is an error answer", async () => {
    writer = () => new Response(null, { status: 503 });
    const failed = await handleAssist(post({ room: "가상", messages }), config);
    expect(failed?.status).toBe(502);
    expect(await failed?.json()).toEqual({
      error: { code: "WRITER_FAILED" },
    });
    writer = () => completion("죄송하지만 못 하겠어요");
    const odd = await handleAssist(post({ room: "가상", messages }), config);
    expect(await odd?.json()).toEqual({
      error: { code: "WRITER_MALFORMED" },
    });
  });

  test("off without a configuration; refuses cross-site and malformed bodies", async () => {
    expect((await handleAssist(post({}), null))?.status).toBe(404);
    expect(
      (await handleAssist(post({ room: "x", messages }, "cross-site"), config))
        ?.status,
    ).toBe(403);
    expect(
      (await handleAssist(post({ room: "x", messages: [] }), config))?.status,
    ).toBe(400);
    expect(
      await handleAssist(new Request("http://saya.test/other"), config),
    ).toBeNull();
  });

  test("GET tells the screen whose tone and which prefix, never an address or a key", async () => {
    const answer = await handleAssist(
      new Request("http://saya.test/assist"),
      config,
    );
    const text = await answer?.text();
    expect(JSON.parse(text ?? "{}")).toEqual({
      enabled: true,
      user: "현지님",
      prefix: "",
      prefixOn: false,
      agent: null,
    });
    expect(text).not.toContain("key");
    expect(text).not.toContain(base);
  });

  test("the configuration file names keys, never holds them; a prefix-less file cannot turn the prefix on", () => {
    const files: Record<string, string> = {
      "/cfg.json": JSON.stringify({
        user: { name: "현지님", toneExamples: ["네, 확인해 드릴게요"] },
        send: { prefix: "", prefixOn: true },
        kakaoCore: "http://100.64.0.9:8765",
        llm: {
          url: "http://127.0.0.1:10200/v1/",
          model: "m",
          keyEnv: "WRITER_KEY",
        },
        jev: { url: "https://jev.example", keyFile: "/jev.key" },
      }),
      "/jev.key": "secret\n",
    };
    const read = (path: string) => {
      const value = files[path];
      if (value === undefined) throw new Error(`no ${path}`);
      return value;
    };
    const loaded = assistConfig(
      {
        SAYA_ASSIST_CONFIG: "/cfg.json",
        WRITER_KEY: "w",
      },
      read,
    );
    expect(loaded?.send).toEqual({ prefix: "", prefixOn: false });
    expect(loaded?.llm).toEqual({
      url: "http://127.0.0.1:10200/v1",
      model: "m",
      key: "w",
    });
    expect(loaded?.jev.key).toBe("secret");
    expect(loaded?.kakaoCore).toBe("http://100.64.0.9:8765");
    expect(assistConfig({}, read)).toBeNull();
  });

  test("parseDraft and rank refuse what is not there", () => {
    expect(parseDraft('{"want":"x","candidates":[]}')).toBeNull();
    expect(
      parseDraft('{"candidates":["a","a","b","c","d"]}')?.candidates,
    ).toEqual(["a", "b", "c"]);
    expect(() => rank(["a"], { c1_fit: 1 })).toThrow();
  });
});

/** A stand-in agent: records what it was given, then answers the way it is told (or never). */
const agentDir = mkdtempSync(join(tmpdir(), "saya-agent-"));
afterAll(() => rmSync(agentDir, { recursive: true, force: true }));
const agentScript = join(agentDir, "agent.ts");
writeFileSync(
  agentScript,
  `const [mode, record] = process.argv.slice(2);
const input = await Bun.stdin.text();
await Bun.write(record, JSON.stringify({ input, env: Object.keys(process.env) }));
if (mode === "hang") await new Promise(() => {});
if (mode === "fail") process.exit(1);
if (mode === "more") console.log('{"need_more": true}');
else console.log('생각해 보니 {"want":"예약 변경","open":[],"candidates":["에이전트 답"]}');
`,
);

function withAgent(mode: string, timeoutMs = 20_000) {
  const record = join(agentDir, `${mode}-${Math.random()}.json`);
  return {
    record,
    config: {
      ...config,
      agent: {
        name: "오모냥",
        command: [process.execPath, agentScript, mode, record],
        timeoutMs,
        concurrency: 2,
      },
    } satisfies AssistConfig,
  };
}

const GOOD_CHECK = () =>
  Response.json({
    answers: {
      c1_fit: { noul: 0.9 },
      c1_tone: { noul: 0.8 },
      c1_risk: { noul: 0.02 },
      c2_fit: { noul: 0.9 },
      c2_tone: { noul: 0.8 },
      c2_risk: { noul: 0.02 },
      c3_fit: { noul: 0.9 },
      c3_tone: { noul: 0.8 },
      c3_risk: { noul: 0.02 },
    },
  });

describe("assist with an agent", () => {
  test("the agent writes from the transcript on stdin, sees none of this server's keys, and JEV still checks it", async () => {
    seen.length = 0;
    checker = GOOD_CHECK;
    process.env.SAYA_TEST_SECRET = "s";
    const { record, config: agentConfig } = withAgent("ok");
    const answer = await handleAssist(
      post({ room: "가상 문의방", messages }),
      agentConfig,
    );
    delete process.env.SAYA_TEST_SECRET;
    const body = (await answer?.json()) as {
      candidates: { text: string }[];
      writer: unknown;
    };
    expect(body.writer).toEqual({ kind: "agent", name: "오모냥" });
    expect(body.candidates.map((item) => item.text)).toEqual(["에이전트 답"]);
    expect(seen.map((item) => item.path)).toEqual(["/v1/systemone"]);
    expect(answer?.headers.get("server-timing")).toMatch(/^writer;dur=\d+$/);
    const given = JSON.parse(readFileSync(record, "utf8")) as {
      input: string;
      env: string[];
    };
    expect(given.input).toContain("예약 시간 바꿀 수 있나요?");
    expect(given.env).not.toContain("SAYA_TEST_SECRET");
  });

  test("a failing or silent agent falls back to the model, and says so", async () => {
    writer = () => completion(DRAFT);
    checker = GOOD_CHECK;
    for (const agent of [withAgent("fail"), withAgent("hang", 300)]) {
      seen.length = 0;
      const answer = await handleAssist(
        post({ room: "가상", messages }),
        agent.config,
      );
      const body = (await answer?.json()) as { writer: unknown; check: string };
      expect(body.writer).toEqual({ kind: "model", fallback: true });
      expect(body.check).toBe("ok");
      expect(seen[0]?.path).toBe("/v1/chat/completions");
    }
  });

  test("need_more goes back to the screen unchecked; asked again with more, the agent must answer or the model does", async () => {
    seen.length = 0;
    writer = () => completion(DRAFT);
    checker = GOOD_CHECK;
    const { config: agentConfig } = withAgent("more");
    const first = await handleAssist(
      post({ room: "가상", messages }),
      agentConfig,
    );
    expect(await first?.json()).toEqual({
      needMore: true,
      writer: { kind: "agent", name: "오모냥" },
    });
    expect(seen).toHaveLength(0);
    const many = Array.from({ length: 100 }, () => messages[0]);
    const again = await handleAssist(
      post({ room: "가상", messages: many, more: true }),
      agentConfig,
    );
    const body = (await again?.json()) as { writer: unknown };
    expect(body.writer).toEqual({ kind: "model", fallback: true });
    expect(
      (await handleAssist(post({ room: "가상", messages: many }), agentConfig))
        ?.status,
    ).toBe(400);
  });
});
