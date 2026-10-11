import { describe, expect, test } from "bun:test";
import { ascMc, computeChart, zonedToUtc } from "../src/core/chart";
import { CITIES } from "../src/core/cities";
import { HEXAGRAMS } from "../src/data/hexagrams";
import { SHUKU } from "../src/data/sukuyo";
import { DAY_SIGNS } from "../src/data/maya";
import { METHOD_ORDER, runAll } from "../src/methods";
import { CHENGGU_TABLES } from "../src/methods/chenggu";
import { DIMS, fuse } from "../src/methods/fusion";
import { monthStar, yearStar } from "../src/methods/kyusei";
import { tzolkin } from "../src/methods/maya";
import { KING_WEN_TABLE } from "../src/methods/meihua";
import { lifePath } from "../src/methods/numerology";
import { relationOf, shukuIndex } from "../src/methods/sukuyo";
import { greerCards } from "../src/methods/tarot";

const beijing = CITIES.find((c) => c.name === "北京")!;

describe("data tables", () => {
  test("King Wen table matches the trigrams stored on each hexagram", () => {
    expect(HEXAGRAMS).toHaveLength(64);
    for (const hx of HEXAGRAMS) expect(KING_WEN_TABLE[hx.num - 1]).toEqual([hx.upper, hx.lower]);
    expect(new Set(KING_WEN_TABLE.map((p) => p.join())).size).toBe(64);
  });

  test("称骨 totals stay inside 2两1 .. 7两1", () => {
    const { YEAR, MONTH, DAY, HOUR } = CHENGGU_TABLES;
    const min = Math.min(...Object.values(YEAR)) + Math.min(...MONTH) + Math.min(...DAY) + Math.min(...Object.values(HOUR));
    const max = Math.max(...Object.values(YEAR)) + Math.max(...MONTH) + Math.max(...DAY) + Math.max(...Object.values(HOUR));
    expect(Object.keys(YEAR)).toHaveLength(60);
    expect(DAY).toHaveLength(30);
    expect(min).toBe(21);
    expect(max).toBe(71);
  });
});

describe("九星气学", () => {
  test("year star", () => {
    expect(yearStar(2024)).toBe(3);
    expect(yearStar(1990)).toBe(1);
    expect(yearStar(2000)).toBe(9);
    expect(yearStar(1984)).toBe(7);
  });
  test("month star of the 寅 month", () => {
    expect(monthStar(1, 0)).toBe(8);
    expect(monthStar(3, 0)).toBe(2);
    expect(monthStar(2, 0)).toBe(5);
    expect(monthStar(1, 1)).toBe(7);
  });
});

describe("宿曜", () => {
  test("first day of each lunar month starts at the right mansion", () => {
    expect(SHUKU[shukuIndex(1, 1)]!.name).toBe("室宿");
    expect(SHUKU[shukuIndex(4, 1)]!.name).toBe("畢宿");
    expect(SHUKU[shukuIndex(12, 1)]!.name).toBe("虚宿");
    expect(shukuIndex(-6, 1)).toBe(shukuIndex(6, 1));
  });
  test("relations are symmetric and 业胎 sits at 9 and 18", () => {
    for (let a = 0; a < 27; a++) for (let b = 0; b < 27; b++) expect(relationOf(a, b)).toBe(relationOf(b, a));
    expect(relationOf(0, 0)).toBe("命");
    expect(relationOf(0, 9)).toBe("业胎");
    expect(relationOf(0, 1)).toBe("荣亲");
    expect(relationOf(0, 4)).toBe("危成");
  });
});

describe("Western numbers", () => {
  test("Greer birth cards", () => {
    expect(greerCards(2010)).toEqual({ personality: 3, soul: 3 });
    expect(greerCards(19)).toEqual({ personality: 19, soul: 1 });
    expect(greerCards(22)).toEqual({ personality: 0, soul: 4 });
  });
  test("life path", () => {
    expect(lifePath(1990, 5, 15).value).toBe(3);
    expect(lifePath(1985, 11, 29).value).toBe(9);
  });
});

describe("Maya", () => {
  test("2012-12-21 is 4 Ajaw, 13.0.0.0.0", () => {
    const t = tzolkin(2012, 12, 21);
    expect(t.tone).toBe(4);
    expect(DAY_SIGNS[t.sign]!.maya).toBe("Ajaw");
    expect(t.kin).toBe(160);
    expect(t.longCount).toEqual([13, 0, 0, 0, 0]);
  });
});

describe("astronomy", () => {
  test("ASC is 90° and MC is 0° at the equator when LST = 0", () => {
    const { asc, mc } = ascMc(0, 0, 23.44);
    expect(asc).toBeCloseTo(90, 6);
    expect(mc).toBeCloseTo(0, 6);
  });
  test("zonedToUtc follows historical DST", () => {
    expect(zonedToUtc({ y: 1990, m: 5, d: 15, h: 14, mi: 30 }, "Asia/Shanghai").offset).toBe(540);
    expect(zonedToUtc({ y: 1990, m: 1, d: 15, h: 14, mi: 30 }, "Asia/Shanghai").offset).toBe(480);
    expect(zonedToUtc({ y: 2021, m: 7, d: 1, h: 12, mi: 0 }, "America/New_York").offset).toBe(-240);
  });
});

describe("full pipeline", () => {
  const chart = computeChart({ year: 1990, month: 5, day: 15, hour: 14, minute: 30, timeKnown: true, city: beijing, gender: "male", trueSolar: true });

  test("chart basics", () => {
    expect(chart.isDst).toBe(true);
    expect(chart.planets.sun.lon).toBeGreaterThan(53);
    expect(chart.planets.sun.lon).toBeLessThan(55);
    expect(chart.eightChar.getYear()).toBe("庚午");
  });

  test("all methods run and fuse", () => {
    const results = runAll(chart);
    expect(results.map((r) => r.id)).toEqual(METHOD_ORDER);
    expect(results.length).toBeGreaterThanOrEqual(10);
    for (const r of results) {
      for (const d of DIMS) {
        expect(r.scores[d]).toBeGreaterThanOrEqual(0);
        expect(r.scores[d]).toBeLessThanOrEqual(100);
      }
      expect(r.sections.length).toBeGreaterThan(0);
    }
    const f = fuse(results);
    expect(f.overall).toBeGreaterThan(0);
    expect(f.overall).toBeLessThanOrEqual(100);
    expect(f.oracle.length).toBeGreaterThan(0);
  });

  test("unknown birth time still works", () => {
    const c = computeChart({ year: 2001, month: 2, day: 3, hour: 12, minute: 0, timeKnown: false, city: beijing, gender: "female", trueSolar: false });
    expect(() => fuse(runAll(c))).not.toThrow();
  });
});
