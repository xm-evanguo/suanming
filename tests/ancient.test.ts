import { describe, expect, test } from "bun:test";
import { computeChart } from "../src/core/chart";
import { CITIES } from "../src/core/cities";
import { FIR_CYCLE, FIR_DAY, FIR_NIGHT } from "../src/data/firdaria";
import { CHALDEAN_ORDER, dignityOf, WEEKDAY_RULER } from "../src/data/hellenistic";
import { firdariaForecast } from "../src/forecast/firdaria";
import { hellenisticForecast } from "../src/forecast/hellenistic";
import type { Forecast } from "../src/forecast/types";
import { chaldean, faceRuler, localWeekday, planetaryHours } from "../src/methods/chaldean";
import { addYears, firdaria, firdariaAt, firdariaTimeline, meanNodeLon, subOrder } from "../src/methods/firdaria";
import { hellenistic, lots, profection } from "../src/methods/hellenistic";
import type { MethodResult } from "../src/methods/types";

const beijing = CITIES.find((c) => c.name === "北京")!;
const known = { year: 1990, month: 5, day: 15, hour: 14, minute: 30, timeKnown: true, city: beijing, gender: "male" as const, trueSolar: true };
const unknown = { ...known, hour: 12, minute: 0, timeKnown: false };
const NOW = new Date(Date.UTC(2026, 9, 11, 4, 0, 0));
// Words that the plain text must not use without explanation.
const JARGON = ["宫", "相位", "小限", "大限", "宗派", "入庙", "落陷"];

function expectPlain(r: MethodResult) {
  expect(r.plain).toBeDefined();
  expect(r.plain!.summary.length).toBeGreaterThan(20);
  expect(r.plain!.sections.length).toBeGreaterThanOrEqual(3);
  expect(r.plain!.sections.length).toBeLessThanOrEqual(6);
  for (const text of [r.plain!.summary, ...r.plain!.sections.map((s) => s.body)]) for (const w of JARGON) expect(text.includes(w)).toBe(false);
}

describe("希腊化占星", () => {
  test("Lot of Fortune and Spirit: day and night formulas", () => {
    const day = lots(100, 50, 200, true);
    expect(day.fortune).toBeCloseTo(250); // ASC + Moon - Sun
    expect(day.spirit).toBeCloseTo(310); // ASC + Sun - Moon = -50, wrapped
    const night = lots(100, 50, 200, false);
    expect(night.fortune).toBeCloseTo(310); // ASC + Sun - Moon
    expect(night.spirit).toBeCloseTo(250);
  });

  test("annual profection houses", () => {
    expect(profection(5, 0).house).toBe(1);
    expect(profection(5, 11).house).toBe(12);
    expect(profection(5, 12).house).toBe(1);
    expect(profection(5, 29).house).toBe(6);
    // Virgo ASC (5): age 1 -> Libra, ruled by Venus.
    expect(profection(5, 1)).toEqual({ house: 2, sign: 6, lord: "venus" });
  });

  test("essential dignities", () => {
    expect(dignityOf("sun", 4)).toBe("domicile");
    expect(dignityOf("sun", 0)).toBe("exaltation");
    expect(dignityOf("mars", 9)).toBe("exaltation");
    expect(dignityOf("saturn", 3)).toBe("detriment");
    expect(dignityOf("saturn", 0)).toBe("fall");
    expect(dignityOf("venus", 2)).toBe("peregrine");
  });

  test("afternoon birth is a day chart and late night is a night chart", () => {
    expect(hellenistic(computeChart(known)).visual.day).toBe(true);
    const night = hellenistic(computeChart({ ...known, hour: 23, minute: 30 }));
    expect(night.visual.day).toBe(false);
    expect(night.visual.benefic).toBe("venus");
    expect(night.visual.malefic).toBe("saturn");
  });

  test("runs with a known and an unknown time", () => {
    for (const input of [known, unknown]) {
      const r = hellenistic(computeChart(input));
      expect(r.id).toBe("hellenistic");
      expect(r.origin).toBe("古希腊");
      expect(r.sections.length).toBeGreaterThanOrEqual(5);
      expect(r.visual.planets).toHaveLength(7);
      expect(r.visual.lots.fortune.house).toBeGreaterThanOrEqual(1);
      for (const v of Object.values(r.scores)) expect(v).toBeGreaterThanOrEqual(10);
      expect(r.caveats.some((c) => c.includes("12:00"))).toBe(!input.timeKnown);
      expectPlain(r);
    }
  });
});

describe("迦勒底七曜", () => {
  test("planetary hours follow the Chaldean order and start with the day ruler", () => {
    const sunrise = new Date(Date.UTC(2024, 0, 7, 6));
    const sunset = new Date(Date.UTC(2024, 0, 7, 20));
    const next = new Date(Date.UTC(2024, 0, 8, 6));
    const hours = planetaryHours(sunrise, sunset, next, "sun");
    expect(hours).toHaveLength(24);
    expect(hours[0]!.ruler).toBe("sun");
    expect(hours.slice(0, 7).map((x) => x.ruler)).toEqual(["sun", "venus", "mercury", "moon", "saturn", "jupiter", "mars"]);
    // The 25th hour (first of the next day) belongs to the Moon: Sunday -> Monday.
    expect(CHALDEAN_ORDER[(CHALDEAN_ORDER.indexOf("sun") + 24) % 7]).toBe("moon");
    expect(hours[0]!.start.getTime()).toBe(sunrise.getTime());
    expect(hours[11]!.end.getTime()).toBe(sunset.getTime());
    expect(hours[12]!.isDay).toBe(false);
    expect(hours[23]!.end.getTime()).toBe(next.getTime());
    // Unequal hours: 14 h day -> 70 min, 10 h night -> 50 min.
    expect(hours[0]!.end.getTime() - hours[0]!.start.getTime()).toBe(70 * 60000);
    expect(hours[12]!.end.getTime() - hours[12]!.start.getTime()).toBe(50 * 60000);
  });

  test("day rulers follow the week: each day is 3 steps after the previous one in Chaldean order", () => {
    expect(WEEKDAY_RULER).toEqual(["sun", "moon", "mars", "mercury", "jupiter", "venus", "saturn"]);
    for (let d = 0; d < 7; d++) expect(WEEKDAY_RULER[(d + 1) % 7]).toBe(CHALDEAN_ORDER[(CHALDEAN_ORDER.indexOf(WEEKDAY_RULER[d]!) + 3) % 7]!);
  });

  test("Chaldean face rulers", () => {
    expect(faceRuler(0)).toBe("mars"); // Aries 1st
    expect(faceRuler(10)).toBe("sun");
    expect(faceRuler(30)).toBe("mercury"); // Taurus 1st
    expect(faceRuler(359)).toBe("mars"); // Pisces 3rd
  });

  test("a birth before local sunrise belongs to the previous planetary day", () => {
    // 2024-03-05 is a Tuesday. Sunrise in Beijing is about 06:40, so 03:00 is still Monday's night.
    const early = chaldean(computeChart({ ...known, year: 2024, month: 3, day: 5, hour: 3, minute: 0 }));
    const noon = chaldean(computeChart({ ...known, year: 2024, month: 3, day: 5, hour: 12, minute: 0 }));
    expect(early.visual.dayRuler).toBe("moon");
    expect(early.visual.birthHour).toBeGreaterThanOrEqual(12);
    expect(noon.visual.dayRuler).toBe("mars");
    expect(noon.visual.hours[noon.visual.birthHour]!.isDay).toBe(true);
    expect(localWeekday(Date.UTC(2024, 2, 5, 4), "Asia/Shanghai")).toBe(2);
  });

  test("runs with a known and an unknown time", () => {
    const k = chaldean(computeChart(known));
    expect(k.visual.hours).toHaveLength(24);
    expect(k.visual.dayRuler).toBe("mars"); // 15 May 1990 was a Tuesday
    expectPlain(k);
    const u = chaldean(computeChart(unknown));
    expect(u.visual.unknownTime).toBe(true);
    expect(u.caveats.some((c) => c.includes("12:00"))).toBe(true);
    expectPlain(u);
  });
});

describe("波斯法达", () => {
  test("both sequences total 75 years", () => {
    expect(FIR_DAY.reduce((s, [, y]) => s + y, 0)).toBe(FIR_CYCLE);
    expect(FIR_NIGHT.reduce((s, [, y]) => s + y, 0)).toBe(FIR_CYCLE);
    expect(FIR_DAY.map(([p]) => p).slice(0, 3)).toEqual(["sun", "venus", "mercury"]);
    expect(FIR_NIGHT[0]![0]).toBe("moon");
  });

  test("sub-periods: the ruler first, then Chaldean order", () => {
    expect(subOrder("sun")).toEqual(["sun", "venus", "mercury", "moon", "saturn", "jupiter", "mars"]);
    expect(subOrder("venus")).toEqual(["venus", "mercury", "moon", "saturn", "jupiter", "mars", "sun"]);
    const birth = new Date(Date.UTC(1990, 4, 15, 6));
    const tl = firdariaTimeline(birth, true, 2);
    expect(tl).toHaveLength(18);
    expect(tl[0]!.subs.map((s) => s.planet)).toEqual(subOrder("sun"));
    expect(tl[0]!.subs[0]!.endAge).toBeCloseTo(10 / 7);
    expect(tl[7]!.planet).toBe("northNode");
    expect(tl[7]!.subs).toHaveLength(0);
    expect(tl[9]!.planet).toBe("sun");
    expect(tl[9]!.startAge).toBe(75);
    expect(tl[8]!.endAge).toBe(75);
    for (let i = 1; i < tl.length; i++) expect(tl[i]!.start.getTime()).toBe(tl[i - 1]!.end.getTime());
    expect(addYears(birth, 10).getUTCFullYear()).toBe(2000);
  });

  test("finds the current major and sub period", () => {
    const birth = new Date(Date.UTC(1990, 4, 15, 6));
    const tl = firdariaTimeline(birth, true, 2);
    const at = firdariaAt(tl, NOW); // age 36: Moon period (31-40)
    expect(at.major.planet).toBe("moon");
    expect(at.sub).not.toBeNull();
    const nodeAt = firdariaAt(tl, new Date(Date.UTC(2061, 0, 1))); // age 70.6: North Node
    expect(nodeAt.major.planet).toBe("northNode");
    expect(nodeAt.sub).toBeNull();
  });

  test("mean node at J2000", () => {
    expect(meanNodeLon(2451545)).toBeCloseTo(125.04, 1);
  });

  test("runs with a known and an unknown time", () => {
    for (const input of [known, unknown]) {
      const r = firdaria(computeChart(input));
      expect(r.id).toBe("firdaria");
      expect(r.visual.periods.length).toBe(9);
      expect(r.visual.periods.reduce((s, p) => s + p.years, 0)).toBe(75);
      expect(r.caveats.some((c) => c.includes("Abu Ma'shar"))).toBe(true);
      expectPlain(r);
    }
  });
});

function expectForecast(f: Forecast, months: boolean) {
  expect(f.years).toHaveLength(3);
  expect(f.months).toHaveLength(months ? 12 : 0);
  for (const reading of [...f.years, ...f.months]) {
    expect(reading.label.length).toBeGreaterThan(0);
    expect(reading.signals.length).toBeGreaterThan(0);
    for (const s of reading.signals) {
      expect(s.pro.length).toBeGreaterThan(0);
      expect(s.plain.length).toBeGreaterThan(10);
      expect([1, 2, 3]).toContain(s.weight);
      for (const w of JARGON) expect(s.plain.includes(w)).toBe(false);
    }
  }
}

describe("forecasts", () => {
  test("hellenistic: 3 years and 12 months", () => {
    const f = hellenisticForecast(computeChart(known), NOW);
    expectForecast(f, true);
    // Born 1990: age 36 in 2026 -> house 1, 37 -> house 2, 38 -> house 3.
    expect(f.years.map((y) => y.label.slice(0, 5))).toEqual(["小限第1宫", "小限第2宫", "小限第3宫"]);
    expect(f.years[0]!.period).toEqual({ year: 2026 });
    expect(f.months[0]!.period).toEqual({ year: 2026, month: 10 });
    expect(f.months[11]!.period).toEqual({ year: 2027, month: 9 });
    // Monthly profections advance one sign per month after the birthday (15 May).
    const houses = f.months.map((m) => Number(/第(\d+)宫/.exec(m.label)![1]));
    expect(houses[0]).toBe(6); // 15 Oct 2026: age 36 (house 1) + 5 months
    expect(houses[1]).toBe(7);
    expect(houses[6]).toBe(12); // 15 Apr 2027: age 36 + 11 months
    expect(houses[7]).toBe(2); // 15 May 2027: the birthday has passed, age 37 starts at house 2
  });

  test("hellenistic: works with an unknown time", () => {
    expectForecast(hellenisticForecast(computeChart(unknown), NOW), true);
  });

  test("firdaria: 3 years, no months, with a note", () => {
    const f = firdariaForecast(computeChart(known), NOW);
    expectForecast(f, false);
    expect(f.note).toBeTruthy();
    expect(f.years[0]!.label).toContain("月亮大限");
  });
});
