import { describe, expect, test } from "bun:test";
import { drawSeed, minuteStamp, normalizeQuestion } from "../src/core/draw-seed";

const at = new Date(2026, 9, 11, 16, 32, 5);
const q = "我要不要接受需要搬家的新工作？";
const order = (s: ReturnType<typeof drawSeed>) => s.deck.map((c) => `${c.num}${c.reversed ? "r" : ""}`).join(",");

describe("tarot draw seed", () => {
  test("the deck is a permutation of the 22 major arcana", () => {
    const s = drawSeed(q, "事业", at);
    expect(s.deck.map((c) => c.num).sort((a, b) => a - b)).toEqual(Array.from({ length: 22 }, (_, i) => i));
    expect(s.stamp).toBe("2026-10-11 16:32");
    expect([...s.sigil]).toHaveLength(4);
  });

  test("same question, topic and minute give the same deck", () => {
    expect(order(drawSeed(q, "事业", at))).toBe(order(drawSeed(q, "事业", new Date(2026, 9, 11, 16, 32, 59))));
  });

  test("spaces and full-width forms do not change the seed", () => {
    expect(normalizeQuestion("  我要不要\n接受？ ")).toBe("我要不要 接受?");
    expect(order(drawSeed(` ${q}  `, "事业", at))).toBe(order(drawSeed(q, "事业", at)));
  });

  test("a different question, topic or minute gives a different deck", () => {
    const base = order(drawSeed(q, "事业", at));
    expect(order(drawSeed("我该不该表白？", "事业", at))).not.toBe(base);
    expect(order(drawSeed(q, "感情", at))).not.toBe(base);
    expect(order(drawSeed(q, "事业", new Date(2026, 9, 11, 16, 33)))).not.toBe(base);
    expect(order(drawSeed("", "事业", at))).not.toBe(base);
  });

  test("the minute stamp uses local time", () => {
    expect(minuteStamp(new Date(2026, 0, 2, 3, 4))).toBe("2026-01-02 03:04");
  });

  test("over many seeds, top cards and reversals are spread evenly", () => {
    const top = new Array(22).fill(0);
    let reversed = 0;
    const N = 4400;
    for (let i = 0; i < N; i++) {
      const s = drawSeed(`问题 ${i}`, "综合", at);
      top[s.deck[0]!.num]++;
      reversed += s.deck.filter((c) => c.reversed).length;
    }
    // Expected 200 per card. A wide band keeps the test stable and still catches a broken shuffle.
    for (const n of top) {
      expect(n).toBeGreaterThan(120);
      expect(n).toBeLessThan(290);
    }
    expect(reversed / (N * 22)).toBeGreaterThan(0.47);
    expect(reversed / (N * 22)).toBeLessThan(0.53);
  });
});
