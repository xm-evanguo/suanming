import { describe, expect, test } from "bun:test";
import { Solar } from "lunar-javascript";
import { type BirthInput, type Chart, computeChart } from "../src/core/chart";
import { CITIES } from "../src/core/cities";
import { COMPATS, runCompat } from "../src/compat";
import { meanNorthNode } from "../src/compat/astrology";
import { baziCompat, branchRelations, ganHe } from "../src/compat/bazi";
import { sukuyoCompat } from "../src/compat/sukuyo";
import { type MoonPoint, ashtakoota } from "../src/compat/vedic";
import { vedicCompat } from "../src/compat/vedic";
import type { CompatTag, RelationKind } from "../src/compat/types";
import { ALL_TAGS } from "../src/data/compat-util";
import { YONI_POINTS } from "../src/data/compat-vedic";
import { pairKind } from "../src/data/compat-numerology";
import { shukuIndex } from "../src/methods/sukuyo";

const beijing = CITIES.find((c) => c.name === "北京")!;

const input = (year: number, month: number, day: number, hour: number, minute: number, gender: "male" | "female", timeKnown = true): BirthInput => ({
  year,
  month,
  day,
  hour,
  minute,
  timeKnown,
  city: beijing,
  gender,
  trueSolar: false,
});
const chart = (...a: Parameters<typeof input>): Chart => computeChart(input(...a));

const RELATIONS: RelationKind[] = ["partner", "crush", "spouse", "father", "mother", "child", "sibling", "friend", "colleague", "boss"];
const me = chart(1990, 5, 12, 9, 30, "male");
const her = chart(1992, 10, 3, 18, 20, "female");

/** Words that belong in `pro` only. */
const JARGON = ["日支", "日干", "六合", "三合", "相位", "合相", "宫", "宿", "四化", "化禄", "化忌", "土星", "木星", "金星", "火星", "水星", "交点", "喜用", "官杀"];

describe("runCompat structure", () => {
  for (const relation of RELATIONS) {
    test(`valid output for ${relation}`, () => {
      const out = runCompat(me, her, relation);
      expect(out.length).toBeGreaterThanOrEqual(6);
      expect(new Set(out.map((c) => c.methodId)).size).toBe(out.length);
      for (const c of out) {
        expect(Number.isInteger(c.score) && c.score >= 0 && c.score <= 100).toBe(true);
        expect(c.headline.length).toBeGreaterThan(0);
        expect(c.items.length).toBeGreaterThanOrEqual(3);
        expect(c.items.length).toBeLessThanOrEqual(8);
        for (const it of c.items) {
          expect(["good", "bad", "mixed"]).toContain(it.tone);
          expect([1, 2, 3]).toContain(it.weight);
          expect(it.tags.length).toBeGreaterThan(0);
          for (const t of it.tags) expect(ALL_TAGS).toContain(t as CompatTag);
          expect(it.pro.length).toBeGreaterThan(0);
          expect(it.plain.length).toBeGreaterThan(0);
          for (const word of JARGON) expect(`${c.methodId}:${it.plain}`.includes(word) ? `${c.methodId}:${word}:${it.plain}` : "").toBe("");
        }
      }
    });
  }

  test("registry has seven systems", () => {
    expect(COMPATS).toHaveLength(7);
  });

  test("vedic is only for partner, crush and spouse", () => {
    expect(vedicCompat(me, her, "friend")).toBeNull();
    expect(vedicCompat(me, her, "father")).toBeNull();
    expect(runCompat(me, her, "friend").some((c) => c.methodId === "vedic")).toBe(false);
    for (const r of ["partner", "crush", "spouse"] as const) expect(vedicCompat(me, her, r)).not.toBeNull();
  });

  test("the attraction tag is only used for romantic relations", () => {
    for (const r of ["father", "friend", "child", "boss"] as const)
      for (const c of runCompat(me, her, r)) for (const i of c.items) expect(i.tags).not.toContain("attraction");
    const romantic = runCompat(me, her, "partner").flatMap((c) => c.items.flatMap((i) => i.tags));
    expect(romantic).toContain("attraction");
  });

  test("tags cover the questions of each relation group", () => {
    const tagsOf = (r: RelationKind) => new Set(runCompat(me, her, r).flatMap((c) => c.items.flatMap((i) => i.tags)));
    expect(tagsOf("partner").has("support")).toBe(true);
    expect(tagsOf("partner").has("harmony")).toBe(true);
    expect(tagsOf("father").has("career")).toBe(true);
    expect(tagsOf("father").has("growth")).toBe(true);
    expect(tagsOf("friend").has("support")).toBe(true);
  });
});

describe("unknown birth time", () => {
  test("does not throw and says so", () => {
    const a = chart(1988, 2, 29, 12, 0, "female", false);
    const b = chart(1991, 8, 17, 12, 0, "male", false);
    for (const r of RELATIONS) {
      const out = runCompat(a, b, r);
      expect(out.length).toBeGreaterThanOrEqual(6);
      const astro = out.find((c) => c.methodId === "astrology")!;
      expect(astro.items.some((i) => i.pro.includes("出生时间未知"))).toBe(true);
      // No aspect line may involve the Moon, ascendant or midheaven.
      expect(astro.items.some((i) => /月亮|上升点|天顶/.test(i.pro.replace("月亮、上升点、天顶", "")))).toBe(false);
    }
  });

  test("one known and one unknown time", () => {
    const a = chart(1988, 2, 29, 12, 0, "female", false);
    expect(() => runCompat(me, a, "partner")).not.toThrow();
  });
});

describe("八字", () => {
  test("stem combination and branch tables", () => {
    expect(ganHe("甲", "己")).toBe("土");
    expect(ganHe("乙", "庚")).toBe("金");
    expect(ganHe("丙", "辛")).toBe("水");
    expect(ganHe("丁", "壬")).toBe("木");
    expect(ganHe("戊", "癸")).toBe("火");
    expect(ganHe("甲", "庚")).toBeNull();
    expect(branchRelations(0, 1)).toContain("六合");
    expect(branchRelations(0, 6)).toContain("冲");
    expect(branchRelations(0, 3)).toContain("刑");
    expect(branchRelations(2, 5)).toEqual(expect.arrayContaining(["害", "刑"]));
    expect(branchRelations(0, 4)).toContain("三合");
  });

  /** First date from `from` whose day pillar is `pillar` (noon, Beijing). */
  const findDay = (pillar: string, from: [number, number, number]): [number, number, number] => {
    const d = new Date(Date.UTC(from[0], from[1] - 1, from[2]));
    for (let i = 0; i < 70; i++, d.setUTCDate(d.getUTCDate() + 1)) {
      const s = Solar.fromYmd(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate());
      if (s.getLunar().getDayInGanZhi() === pillar) return [d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate()];
    }
    throw new Error(`no ${pillar} day found`);
  };

  test("甲子 and 己丑 form 天合地合 and give a fate item", () => {
    const [y1, m1, d1] = findDay("甲子", [1990, 1, 1]);
    const [y2, m2, d2] = findDay("己丑", [1992, 3, 1]);
    const a = chart(y1, m1, d1, 12, 0, "male");
    const b = chart(y2, m2, d2, 12, 0, "female");
    expect(a.eightChar.getDayGan() + a.eightChar.getDayZhi()).toBe("甲子");
    expect(b.eightChar.getDayGan() + b.eightChar.getDayZhi()).toBe("己丑");
    const out = baziCompat(a, b, "partner")!;
    const hit = out.items.find((i) => i.pro.includes("天合地合"));
    expect(hit).toBeDefined();
    expect(hit!.tags).toContain("fate");
    expect(hit!.weight).toBe(3);
    expect(out.headline).toContain("天合地合");
    // The same pair scores higher than a pair whose day pillars have no relation.
    const plain = baziCompat(a, her, "partner")!;
    expect(out.score).toBeGreaterThan(plain.score);
  });
});

describe("宿曜三九", () => {
  test("the same mansion gives 命", () => {
    // Search another year for a day whose mansion index equals mine.
    const mi = shukuIndex(me.lunar.getMonth(), me.lunar.getDay());
    const d = new Date(Date.UTC(1995, 0, 1));
    let found: Chart | null = null;
    for (let i = 0; i < 400 && !found; i++, d.setUTCDate(d.getUTCDate() + 1)) {
      const l = Solar.fromYmd(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate()).getLunar();
      if (shukuIndex(l.getMonth(), l.getDay()) === mi) found = chart(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate(), 12, 0, "female");
    }
    expect(found).not.toBeNull();
    const out = sukuyoCompat(me, found!, "friend")!;
    expect(out.headline).toContain("命之缘");
    expect(out.items.some((i) => i.pro.includes("「命」"))).toBe(true);
  });

  test("a mansion at distance 9 gives 业胎 with the fate tag", () => {
    const mi = shukuIndex(me.lunar.getMonth(), me.lunar.getDay());
    const d = new Date(Date.UTC(1995, 0, 1));
    let found: Chart | null = null;
    for (let i = 0; i < 400 && !found; i++, d.setUTCDate(d.getUTCDate() + 1)) {
      const l = Solar.fromYmd(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate()).getLunar();
      if (shukuIndex(l.getMonth(), l.getDay()) === (mi + 9) % 27) found = chart(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate(), 12, 0, "female");
    }
    const out = sukuyoCompat(me, found!, "partner")!;
    expect(out.items[0]!.pro).toContain("「业胎」");
    expect(out.items[0]!.tags).toContain("fate");
  });
});

describe("吠陀合婚 Ashtakoota", () => {
  test("yoni matrix is symmetric with 4 on the diagonal", () => {
    for (let i = 0; i < 14; i++) {
      expect(YONI_POINTS[i]![i]).toBe(4);
      for (let j = 0; j < 14; j++) expect(YONI_POINTS[i]![j]).toBe(YONI_POINTS[j]![i]!);
    }
  });

  /**
   * Hand calculation. Boy: Moon in Ashwini (nak 0), Aries (rashi 0). Girl: Moon in Rohini (nak 3), Taurus (rashi 1).
   *  Varna    Aries = Kshatriya (3), Taurus = Vaishya (2): boy >= girl -> 1
   *  Vashya   Aries and Taurus are both Chatushpada -> 2
   *  Tara     girl->boy: Rohini to Ashwini = 25 stars, 25 mod 9 = 7 (Naidhana, bad); boy->girl: 4 (good) -> 1.5
   *  Yoni     Horse (Ashwini) and Serpent (Rohini) -> 3
   *  Maitri   Mars and Venus regard each other as neutral -> 3
   *  Gana     Ashwini = Deva, Rohini = Manushya; boy Deva / girl Manushya -> 6
   *  Bhakoot  Taurus is the 2nd from Aries and Aries the 12th from Taurus (2/12 dosha) -> 0
   *  Nadi     Ashwini = Adi, Rohini = Antya -> 8
   *  Total    1 + 2 + 1.5 + 3 + 3 + 6 + 0 + 8 = 24.5
   */
  test("Ashwini boy with Rohini girl scores 24.5", () => {
    const r = ashtakoota({ nak: 0, rashi: 0 }, { nak: 3, rashi: 1 });
    expect(r).toMatchObject({ varna: 1, vashya: 2, tara: 1.5, yoni: 3, maitri: 3, gana: 6, bhakoot: 0, nadi: 8, total: 24.5 });
    expect(r.detail.bhakootDosha).toBe(true);
    expect(r.detail.nadiDosha).toBe(false);
  });

  /** Same nakshatra: Tara 1/1 (both fine) 3, Yoni same animal 4, Maitri same lord 5, Gana 6, Bhakoot 1/1 7, Nadi same 0, Varna 1, Vashya 2 -> 28. */
  test("the same nakshatra gives Nadi dosha and 28 points", () => {
    const p: MoonPoint = { nak: 0, rashi: 0 };
    const r = ashtakoota(p, p);
    expect(r.nadi).toBe(0);
    expect(r.detail.nadiDosha).toBe(true);
    expect(r.total).toBe(28);
  });

  test("total stays between 0 and 36 for all nakshatra pairs", () => {
    for (let a = 0; a < 27; a++)
      for (let b = 0; b < 27; b++) {
        const r = ashtakoota({ nak: a, rashi: Math.floor((a * 4) / 9) % 12, deg: 7 }, { nak: b, rashi: Math.floor((b * 4) / 9) % 12, deg: 20 });
        expect(r.total).toBeGreaterThanOrEqual(0);
        expect(r.total).toBeLessThanOrEqual(36);
      }
  });

  test("the compat result scales guna to 0-100 and mentions the doshas", () => {
    const out = vedicCompat(me, her, "partner")!;
    const m = /(\d+(?:\.\d+)?)\/36/.exec(out.headline);
    expect(m).not.toBeNull();
    expect(out.score).toBe(Math.round((Number(m![1]) / 36) * 100));
    expect(out.items.some((i) => i.pro.includes("Nadi"))).toBe(true);
    expect(out.items.some((i) => i.pro.includes("Bhakoot"))).toBe(true);
  });

  test("same-gender pairs use me as the first party and say so", () => {
    const a = chart(1990, 5, 12, 9, 30, "male");
    const b = chart(1993, 3, 3, 9, 30, "male");
    const out = vedicCompat(a, b, "partner")!;
    expect(out.items.some((i) => i.pro.includes("性别相同"))).toBe(true);
  });
});

describe("西洋合盘", () => {
  test("mean lunar node at J2000 is 125.04 degrees", () => {
    expect(meanNorthNode(2451545.0)).toBeCloseTo(125.0445, 3);
    // The node moves backwards about 19.34 degrees a year.
    const d = meanNorthNode(2451545.0 + 365.25);
    expect(((125.0445 - d + 360) % 360)).toBeCloseTo(19.34, 1);
  });
});

describe("灵数 and 九星", () => {
  test("life path pair kinds", () => {
    expect(pairKind(1, 5)).toBe("family");
    expect(pairKind(2, 8)).toBe("family");
    expect(pairKind(3, 9)).toBe("family");
    expect(pairKind(6, 6)).toBe("same");
    expect(pairKind(11, 2)).toBe("family");
    expect(pairKind(1, 8)).toBe("friction");
    expect(pairKind(2, 6)).toBe("complement");
  });
});
