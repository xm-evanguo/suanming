import { describe, expect, test } from "bun:test";
import { computeChart } from "../src/core/chart";
import { CITIES } from "../src/core/cities";
import { runForecasts } from "../src/forecast";
import type { Signal } from "../src/forecast/types";
import { runAll } from "../src/methods";
import { DIM_NAMES, DIMS } from "../src/methods/fusion";
import { consensusText, periodScore, SPREAD, strongestSignals, topicViews } from "../src/methods/topics";

const beijing = CITIES.find((c) => c.name === "北京")!;
const now = new Date(2026, 9, 11);
const build = (year: number) => {
  const chart = computeChart({ year, month: 5, day: 15, hour: 14, minute: 30, timeKnown: true, city: beijing, gender: "male", trueSolar: true });
  const results = runAll(chart);
  return { results, views: topicViews(results, runForecasts(chart, now)) };
};

const sig = (tone: Signal["tone"], weight: Signal["weight"]): Signal => ({ dim: "career", tone, weight, pro: "p", plain: "q" });

describe("periodScore", () => {
  test("no signals means 50", () => expect(periodScore([])).toBe(50));
  test("known small cases", () => {
    expect(periodScore([sig("good", 3)])).toBe(71);
    expect(periodScore([sig("good", 2), sig("bad", 1)])).toBe(57);
    expect(periodScore([sig("mixed", 2)])).toBe(50);
    expect(periodScore([sig("bad", 3), sig("mixed", 1)])).toBe(31);
  });
});

describe("topic digest", () => {
  for (const year of [1990, 1985, 2001]) {
    const { results, views } = build(year);

    test(`${year}: five topics in DIMS order`, () => {
      expect(views.map((v) => v.dim)).toEqual(DIMS);
      expect(views.map((v) => v.name)).toEqual(DIMS.map((d) => DIM_NAMES[d]));
    });

    test(`${year}: every topic has statements, each from a different system`, () => {
      for (const v of views) {
        expect(v.statements.length).toBeGreaterThan(0);
        expect(new Set(v.statements.map((s) => s.id)).size).toBe(v.statements.length);
        for (const s of v.statements) {
          expect(s.text.length).toBeGreaterThan(5);
          expect(s.score).toBe(results.find((r) => r.id === s.id)!.scores[v.dim]);
          expect(s.text).not.toContain("这套方法怎么算的");
        }
      }
    });

    test(`${year}: no statement text repeats within or across topics`, () => {
      const texts = views.flatMap((v) => v.statements.map((s) => s.text));
      expect(new Set(texts).size).toBe(texts.length);
      const sentences = texts.flatMap((t) => t.match(/[^。！？]+[。！？]?/g) ?? []);
      expect(new Set(sentences).size).toBe(sentences.length);
      const pros = views.flatMap((v) => v.statements.map((s) => s.pro).filter(Boolean));
      expect(new Set(pros).size).toBe(pros.length);
    });

    test(`${year}: statements are ordered by distance from the mean`, () => {
      for (const v of views) {
        const d = v.statements.map((s) => Math.abs(s.score - v.avg));
        expect(d).toEqual([...d].sort((a, b) => b - a));
      }
    });

    test(`${year}: high and low are disjoint and consistent with the mean`, () => {
      for (const v of views) {
        const mean = results.reduce((s, r) => s + r.scores[v.dim], 0) / results.length;
        expect(v.avg).toBeCloseTo(mean, 9);
        for (const x of v.high) expect(x.score).toBeGreaterThanOrEqual(v.avg + SPREAD);
        for (const x of v.low) expect(x.score).toBeLessThanOrEqual(v.avg - SPREAD);
        const ids = [...v.high, ...v.low].map((x) => x.id);
        expect(new Set(ids).size).toBe(ids.length);
        expect(v.high.map((x) => x.score)).toEqual(v.high.map((x) => x.score).sort((a, b) => b - a));
        expect(v.low.map((x) => x.score)).toEqual(v.low.map((x) => x.score).sort((a, b) => a - b));
      }
    });

    test(`${year}: 12 months with scores in 0-100, in order`, () => {
      for (const v of views) {
        expect(v.months).toHaveLength(12);
        const keys = v.months.map((m) => m.period.year * 100 + m.period.month!);
        expect(keys).toEqual([...keys].sort((a, b) => a - b));
        expect(keys[0]).toBe(2026 * 100 + 10);
        for (const m of v.months) {
          expect(m.score).toBeGreaterThanOrEqual(0);
          expect(m.score).toBeLessThanOrEqual(100);
          expect(m.score).toBe(periodScore(m.signals.map((x) => x.signal)));
          for (const x of m.signals) expect(x.signal.dim).toBe(v.dim);
        }
      }
    });

    test(`${year}: this year's signals all have the right dim and are strongest first`, () => {
      for (const v of views) {
        expect(v.thisYear?.period).toEqual({ year: 2026 });
        expect(v.thisYear!.signals.length).toBeGreaterThan(0);
        for (const x of v.thisYear!.signals) expect(x.signal.dim).toBe(v.dim);
        const w = v.thisYear!.signals.map((x) => x.signal.weight);
        expect(w).toEqual([...w].sort((a, b) => b - a));
      }
    });
  }

  test("strongestSignals prefers different systems", () => {
    const { views } = build(1990);
    for (const v of views) {
      const two = strongestSignals(v.thisYear!, 2);
      expect(two.length).toBeLessThanOrEqual(2);
      if (v.thisYear!.signals.some((x) => x.id !== v.thisYear!.signals[0]!.id)) expect(two[0]!.id).not.toBe(two[1]!.id);
    }
  });

  test("without forecasts there is no this-year or month data", () => {
    const { results } = build(1990);
    for (const v of topicViews(results, {})) {
      expect(v.thisYear).toBeUndefined();
      expect(v.months).toEqual([]);
      expect(v.statements.length).toBeGreaterThan(0);
    }
  });

  test("birth scores change the profile but do not change year or month forecasts", () => {
    const chart = computeChart({ year: 1990, month: 5, day: 15, hour: 14, minute: 30, timeKnown: true, city: beijing, gender: "male", trueSolar: true });
    const results = runAll(chart);
    const forecasts = runForecasts(chart, now);
    const before = topicViews(results, forecasts);
    const after = topicViews(results.map((r) => ({ ...r, scores: { career: 0, wealth: 0, love: 0, health: 0, wisdom: 0 } })), forecasts);
    for (const [i, v] of after.entries()) {
      expect(v.avg).toBe(0);
      expect(before[i]!.avg).toBeGreaterThan(0);
      expect(v.thisYear).toEqual(before[i]!.thisYear);
      expect(v.months).toEqual(before[i]!.months);
      const fixed = ["chenggu", "meihua", "sukuyo", "chaldean", "maya"];
      for (const s of v.thisYear!.signals) expect(fixed).not.toContain(s.id);
      for (const m of v.months)
        for (const s of m.signals) expect([...fixed, "firdaria", "tarot"]).not.toContain(s.id);
    }
  });

  test("year signals change the year forecast but do not change month forecasts", () => {
    const chart = computeChart({ year: 1990, month: 5, day: 15, hour: 14, minute: 30, timeKnown: true, city: beijing, gender: "male", trueSolar: true });
    const results = runAll(chart);
    const forecasts = runForecasts(chart, now);
    const before = topicViews(results, forecasts);
    const changed = { ...forecasts, tarot: { ...forecasts.tarot!, years: forecasts.tarot!.years.map((r) => ({ ...r, signals: [sig("bad", 3)] })) } };
    const after = topicViews(results, changed);
    expect(after[0]!.thisYear).not.toEqual(before[0]!.thisYear);
    for (const [i, v] of after.entries()) expect(v.months).toEqual(before[i]!.months);
  });

  test("consensus line", () => {
    const { views, results } = build(1990);
    const v = views[0]!;
    const line = consensusText(v, results.length);
    expect(line).toContain(`${results.length} 个体系`);
    expect(consensusText({ ...v, high: [], low: [] }, 14)).toContain("比较接近");
    const rank = (name: string) => ({ id: "bazi" as const, name, score: 90 });
    expect(consensusText({ ...v, high: [rank("甲")], low: [rank("乙"), rank("丙")] }, 14)).toBe("14 个体系里，1 个评价偏高（甲），2 个明显偏低（乙、丙）。");
  });
});
