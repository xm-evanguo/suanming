import { describe, expect, test } from "bun:test";
import { computeChart } from "../src/core/chart";
import { CITIES } from "../src/core/cities";
import { FORECASTS, runForecasts } from "../src/forecast";
import { personalMonth, personalYear } from "../src/forecast/numerology";
import { forecastPeriods } from "../src/forecast/types";

const base = { year: 1990, month: 5, day: 15, hour: 14, minute: 30, city: CITIES.find((c) => c.name === "北京")!, gender: "male", trueSolar: true } as const;
const chart = computeChart({ ...base, timeKnown: true });
const now = new Date(2026, 9, 11);
const DIMS = ["career", "wealth", "love", "health", "wisdom"];
const TONES = ["good", "bad", "mixed"];

/** Systems that read only by year, or have no period rule at all. */
const NO_MONTHS = ["tarot", "sukuyo", "firdaria"];
const NO_YEARS = ["sukuyo"];

describe("period forecasts", () => {
  const all = runForecasts(chart, now);
  const periods = forecastPeriods(now);

  test("registry covers the intended systems and not the natal-only ones", () => {
    expect(Object.keys(FORECASTS).sort()).toEqual(["astrology", "bazi", "firdaria", "hellenistic", "kyusei", "numerology", "sukuyo", "tarot", "vedic", "ziwei"]);
    for (const id of ["chenggu", "meihua", "chaldean", "maya"]) expect(Object.keys(all)).not.toContain(id);
  });

  for (const [id, f] of Object.entries(all)) {
    test(`${id}: periods match and every signal is well formed`, () => {
      f!.years.length ? expect(f!.years.map((r) => r.period)).toEqual(periods.years) : expect(NO_YEARS).toContain(id);
      f!.months.length ? expect(f!.months.map((r) => r.period)).toEqual(periods.months) : expect(NO_MONTHS).toContain(id);
      if (id === "tarot" || id === "sukuyo") expect(f!.note).toBeTruthy();
      for (const r of [...f!.years, ...f!.months]) {
        expect(r.label.length).toBeGreaterThan(0);
        expect(r.signals.length).toBeGreaterThanOrEqual(2);
        expect(r.signals.length).toBeLessThanOrEqual(6);
        for (const s of r.signals) {
          expect(DIMS).toContain(s.dim);
          expect(TONES).toContain(s.tone);
          expect([1, 2, 3]).toContain(s.weight);
          expect(s.pro.length).toBeGreaterThan(0);
          expect(s.plain.length).toBeGreaterThan(0);
          expect(s.plain).not.toContain("{");
          expect(s.plain).not.toContain("undefined");
        }
      }
    });
  }

  test("bazi: 2026 is 丙午 and 2027 is 丁未", () => {
    const years = all.bazi!.years;
    expect(years).toHaveLength(3);
    expect(years[0]!.label).toContain("流年丙午");
    expect(years[1]!.label).toContain("流年丁未");
  });

  test("bazi: months whose branch is a 天乙贵人 branch of the day stem 庚 (丑 or 未) give a 贵人 signal", () => {
    expect(chart.eightChar.getDayGan()).toBe("庚");
    const months = all.bazi!.months;
    const hit = months.filter((r) => ["丑", "未"].includes(r.label.charAt(3)));
    expect(hit.length).toBeGreaterThanOrEqual(2);
    for (const r of hit) {
      const s = r.signals.find((x) => x.pro.includes("天乙贵人"));
      expect(s).toBeDefined();
      expect(s!.plain).toContain("贵人");
    }
    // Other months must not claim 天乙贵人.
    for (const r of months.filter((m) => !["丑", "未"].includes(m.label.charAt(3)))) expect(r.signals.some((x) => x.pro.includes("天乙贵人"))).toBe(false);
  });

  test("bazi: 太岁 relation appears in the yearly forecast (2026 is 午 year, the birth year is 午)", () => {
    expect(all.bazi!.years[0]!.signals.some((s) => s.pro.includes("值太岁"))).toBe(true);
  });

  test("numerology: personal year 2026 = 3, 2027 = 4 (hand calculation)", () => {
    // 5 + 15 + 2026: 5 + (1+5=6) + (2+0+2+6=10 -> 1) = 12 -> 3
    expect(personalYear(5, 15, 2026)).toBe(3);
    expect(personalYear(5, 15, 2027)).toBe(4);
    expect(personalMonth(3, 10)).toBe(4);
    expect(all.numerology!.years[0]!.label).toContain("个人年 3");
    expect(all.numerology!.months[0]!.label).toBe("个人年 3 · 个人月 4");
  });

  test("tarot: the 2026 year card is The Hanged Man (5 + 15 + 2026 = 2046 -> 12)", () => {
    expect(all.tarot!.years[0]!.label).toContain("12");
  });

  test("plain text does not repeat across the 12 months of a system", () => {
    for (const id of ["bazi", "ziwei", "astrology", "vedic", "numerology"] as const) {
      const heads = all[id]!.months.map((r) => r.signals.map((s) => s.plain).join("|"));
      expect(new Set(heads).size).toBeGreaterThanOrEqual(10);
    }
  });
});

describe("unknown birth time", () => {
  const unknown = computeChart({ ...base, timeKnown: false });
  test("does not throw and still returns forecasts", () => {
    const f = runForecasts(unknown, now);
    expect(Object.keys(f)).toEqual(Object.keys(FORECASTS));
    expect(f.astrology!.years).toHaveLength(3);
    expect(f.astrology!.months).toHaveLength(12);
  });
  test("astrology makes no house claims and says so", () => {
    const f = runForecasts(unknown, now).astrology!;
    expect(f.note).toBeTruthy();
    for (const r of [...f.years, ...f.months]) for (const s of r.signals) expect(s.pro).not.toMatch(/第 \d+ 宫/);
  });
  test("ziwei and vedic carry a note about the missing time", () => {
    const f = runForecasts(unknown, now);
    expect(f.ziwei!.note).toBeTruthy();
    expect(f.vedic!.note).toBeTruthy();
  });
});
