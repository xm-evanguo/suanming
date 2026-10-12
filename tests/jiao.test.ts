import { describe, expect, test } from "bun:test";
import { SEED_VERSION } from "../src/core/draw-seed";
import { JIAO_SEED_VERSION, type JiaoResult, jiaoResult, jiaoVerdict, throwJiao } from "../src/core/jiao";

const at = new Date(2026, 9, 11, 16, 32, 5);
const q = "这个月适合提离职吗？";
const key = (t: ReturnType<typeof throwJiao>) => `${t.a}/${t.b}`;

describe("jiao result mapping", () => {
  test("one flat and one round is 圣杯, two flat is 笑杯, two round is 阴杯", () => {
    expect(jiaoResult("flat", "round")).toBe("圣杯");
    expect(jiaoResult("round", "flat")).toBe("圣杯");
    expect(jiaoResult("flat", "flat")).toBe("笑杯");
    expect(jiaoResult("round", "round")).toBe("阴杯");
  });

  test("a throw has consistent faces and result", () => {
    const t = throwJiao(q, at, 0);
    expect(t.result).toBe(jiaoResult(t.a, t.b));
  });

  test("the jiao seed version differs from the tarot one", () => {
    expect(JIAO_SEED_VERSION).not.toBe(SEED_VERSION);
  });
});

describe("jiao seeding", () => {
  test("same question, minute and index give the same throw", () => {
    expect(throwJiao(q, at, 1)).toEqual(throwJiao(q, new Date(2026, 9, 11, 16, 32, 59), 1));
    expect(throwJiao(` ${q}  `, at, 2)).toEqual(throwJiao(q, at, 2));
  });

  test("a different index, question or minute changes some outcomes", () => {
    const outcomes = (f: (i: number) => ReturnType<typeof throwJiao>) => Array.from({ length: 40 }, (_, i) => key(f(i))).join();
    const base = outcomes((i) => throwJiao(`${q}${i}`, at, 0));
    expect(outcomes((i) => throwJiao(`${q}${i}`, at, 1))).not.toBe(base);
    expect(outcomes((i) => throwJiao(`别的问题${i}`, at, 0))).not.toBe(base);
    expect(outcomes((i) => throwJiao(`${q}${i}`, new Date(2026, 9, 11, 16, 33), 0))).not.toBe(base);
  });

  test("over many seeds, 圣杯 is about 50% and 笑杯 and 阴杯 about 25% each", () => {
    const N = 8000;
    const count: Record<JiaoResult, number> = { 圣杯: 0, 笑杯: 0, 阴杯: 0 };
    for (let i = 0; i < N; i++) count[throwJiao(`问题 ${i}`, at, i % 3).result]++;
    expect(count.圣杯 / N).toBeGreaterThan(0.45);
    expect(count.圣杯 / N).toBeLessThan(0.55);
    expect(count.笑杯 / N).toBeGreaterThan(0.22);
    expect(count.笑杯 / N).toBeLessThan(0.28);
    expect(count.阴杯 / N).toBeGreaterThan(0.22);
    expect(count.阴杯 / N).toBeLessThan(0.28);
  });
});

describe("jiao verdict", () => {
  test("three 圣杯 in a row is a firm yes", () => {
    const v = jiaoVerdict(["圣杯", "圣杯", "圣杯"]);
    expect(v.tone).toBe("yes");
    expect(v.title).toBe("三次圣杯：可以去做");
    expect(v.done).toBe(true);
  });

  test("one or two 圣杯 means keep throwing", () => {
    expect(jiaoVerdict(["圣杯"])).toMatchObject({ tone: "going", done: false });
    expect(jiaoVerdict(["圣杯", "圣杯"])).toMatchObject({ tone: "going", done: false });
    expect(jiaoVerdict([])).toMatchObject({ tone: "going", done: false });
  });

  test("any 阴杯 means wait", () => {
    expect(jiaoVerdict(["阴杯"])).toMatchObject({ tone: "no", title: "暂缓", done: true });
    expect(jiaoVerdict(["圣杯", "阴杯"]).text).toContain("前面有 1 次圣杯");
  });

  test("a 笑杯 means the question is unclear", () => {
    expect(jiaoVerdict(["笑杯"])).toMatchObject({ tone: "unclear", title: "问题不清楚，换个问法", done: true });
    expect(jiaoVerdict(["圣杯", "圣杯", "笑杯"]).tone).toBe("unclear");
  });

  test("mixed runs: 阴杯 outranks 笑杯", () => {
    expect(jiaoVerdict(["笑杯", "阴杯"]).tone).toBe("no");
    expect(jiaoVerdict(["圣杯", "笑杯", "圣杯"]).tone).toBe("unclear");
  });
});
