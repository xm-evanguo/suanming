import { describe, expect, test } from "bun:test";
import { computeChart } from "../src/core/chart";
import { CITIES } from "../src/core/cities";
import { astrology } from "../src/methods/astrology";
import { bazi } from "../src/methods/bazi";
import { chenggu } from "../src/methods/chenggu";
import { kyusei } from "../src/methods/kyusei";
import { maya } from "../src/methods/maya";
import { meihua } from "../src/methods/meihua";
import { numerology } from "../src/methods/numerology";
import { sukuyo } from "../src/methods/sukuyo";
import { tarot } from "../src/methods/tarot";
import type { MethodFn } from "../src/methods/types";
import { vedic } from "../src/methods/vedic";
import { ziwei } from "../src/methods/ziwei";

const beijing = CITIES.find((c) => c.name === "北京")!;
const base = { year: 1990, month: 5, day: 15, hour: 14, minute: 30, city: beijing, gender: "male" as const, trueSolar: true };
const charts = {
  "known time": computeChart({ ...base, timeKnown: true }),
  "unknown time": computeChart({ ...base, timeKnown: false }),
};

const METHODS: [string, MethodFn][] = [
  ["bazi", bazi],
  ["ziwei", ziwei],
  ["chenggu", chenggu],
  ["meihua", meihua],
  ["kyusei", kyusei],
  ["sukuyo", sukuyo],
  ["astrology", astrology],
  ["tarot", tarot],
  ["numerology", numerology],
  ["vedic", vedic],
  ["maya", maya],
];

// Professional terms that must not appear without an explanation in the plain reading.
const BANNED = ["日主", "身强", "身弱", "喜用", "十神", "化禄", "化忌", "动爻", "体卦", "用卦", "命宫"];

for (const [chartName, chart] of Object.entries(charts)) {
  describe(`plain reading (${chartName})`, () => {
    for (const [id, fn] of METHODS) {
      test(id, () => {
        const plain = fn(chart).plain;
        expect(plain).toBeDefined();
        expect(plain!.summary.trim().length).toBeGreaterThan(0);
        expect(plain!.sections.length).toBeGreaterThanOrEqual(3);
        expect(plain!.sections.length).toBeLessThanOrEqual(6);
        for (const s of plain!.sections) {
          expect(s.title.trim().length).toBeGreaterThan(0);
          expect(s.body.trim().length).toBeGreaterThan(0);
        }
        const text = JSON.stringify(plain);
        expect(text).not.toContain("undefined");
        expect(text).not.toContain("NaN");
        for (const term of BANNED) expect(text).not.toContain(term);
      });
    }
  });
}
