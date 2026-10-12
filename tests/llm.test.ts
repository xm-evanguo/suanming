import { describe, expect, test } from "bun:test";
import { type ApiRequest, DEEPSEEK_ENDPOINT } from "../src/llm/client";
import { interpretTarot, tarotMessages, type TarotQuestion } from "../src/llm/tarot";

const input: TarotQuestion = {
  question: "我拿到了需要搬家的工作机会，该先核实哪些条件？",
  context: "目前租约还剩半年，新岗位试用期薪资较低。",
  topic: "事业",
  cards: [{ num: 0, reversed: false }, { num: 12, reversed: true }, { num: 11, reversed: false }],
};
const reply = (content = "先核实搬家成本与试用期条款。", finish_reason = "stop") => Response.json({ choices: [{ message: { content }, finish_reason }] });

describe("DeepSeek tarot reading", () => {
  test("keeps the question, context, card order and orientations", () => {
    const messages = tarotMessages(input);
    const body = JSON.parse(messages[1]!.content);
    expect(body.question).toBe(input.question);
    expect(body.context).toBe(input.context);
    expect(body.cards.map((c: { position: string; name: string; orientation: string }) => [c.position, c.name, c.orientation])).toEqual([
      ["现状", "愚者", "正位"], ["挑战", "倒吊人", "逆位"], ["建议", "正义", "正位"],
    ]);
    expect(body.cards[1].meaning).toContain("拖延");
    expect(messages[0]!.content).toContain("不能编造");
  });

  test("rejects missing questions and invalid draws before a request", async () => {
    let calls = 0;
    const request = (async () => { calls++; return reply(); }) as ApiRequest;
    await expect(interpretTarot("key", { ...input, question: " " }, undefined, request)).rejects.toThrow("具体问题");
    await expect(interpretTarot("key", { ...input, cards: [input.cards[0]!, input.cards[0]!, input.cards[2]!] }, undefined, request)).rejects.toThrow("不同牌");
    await expect(interpretTarot("key", { ...input, cards: [...input.cards.slice(0, 2), { num: 99, reversed: false }] }, undefined, request)).rejects.toThrow("牌面无效");
    await expect(interpretTarot("", input, undefined, request)).rejects.toThrow("API Key");
    await expect(interpretTarot("bad\nkey", input, undefined, request)).rejects.toThrow("API Key");
    await expect(interpretTarot("key", { ...input, context: "a".repeat(2001) }, undefined, request)).rejects.toThrow("过长");
    expect(calls).toBe(0);
  });

  test("sends the key only to the fixed DeepSeek endpoint, without browser credentials", async () => {
    const controller = new AbortController();
    const request = (async (url, options) => {
      expect(url).toBe(DEEPSEEK_ENDPOINT);
      expect(options?.credentials).toBe("omit");
      expect(options?.redirect).toBe("error");
      expect(options?.referrerPolicy).toBe("no-referrer");
      expect(options?.signal).toBe(controller.signal);
      expect(new Headers(options?.headers).get("Authorization")).toBe("Bearer private-test-key");
      const body = JSON.parse(options?.body as string);
      expect(body.model).toBe("deepseek-flash");
      expect(body.thinking.type).toBe("disabled");
      expect(JSON.stringify(body)).not.toContain("private-test-key");
      expect(Object.keys(JSON.parse(body.messages[1].content)).sort()).toEqual(["cards", "context", "question", "topic"]);
      return reply("  一个具体建议  ");
    }) as ApiRequest;
    expect(await interpretTarot(" private-test-key ", input, controller.signal, request)).toBe("一个具体建议");
  });

  test.each([[401, "Key 无效"], [402, "余额不足"], [403, "访问权限"], [429, "过于频繁"], [503, "暂时不可用"]])("handles HTTP %s without exposing provider error data", async (code, message) => {
    const request = (async () => new Response("secret provider detail", { status: code as number })) as ApiRequest;
    await expect(interpretTarot("key", input, undefined, request)).rejects.toThrow(message as string);
  });

  test("rejects empty, malformed and incomplete answers", async () => {
    for (const response of [reply(""), new Response("invalid json"), reply("partial", "length"), reply("filtered", "content_filter"), Response.json({})]) {
      const request = (async () => response) as ApiRequest;
      await expect(interpretTarot("key", input, undefined, request)).rejects.toThrow();
    }
  });

  test("reports network failures, cancellation and timeouts", async () => {
    const request = (async () => { throw new TypeError("secret error"); }) as ApiRequest;
    await expect(interpretTarot("key", input, undefined, request)).rejects.toThrow("无法连接");
    await expect(interpretTarot("key", input, AbortSignal.abort(), request)).rejects.toThrow("已取消");
    await expect(interpretTarot("key", input, AbortSignal.abort(new DOMException("timeout", "TimeoutError")), request)).rejects.toThrow("超时");
  });
});
