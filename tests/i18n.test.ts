import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { getLang, setLang } from "../src/i18n";
import { computeChart } from "../src/core/chart";
import { CITIES } from "../src/core/cities";
import { COMPATS } from "../src/compat";
import type { RelationKind } from "../src/compat/types";
import { FORECASTS } from "../src/forecast";
import { askEvidence, askPreviewText } from "../src/llm/ask";
import { METHOD_ORDER, METHODS } from "../src/methods";
import { fuse } from "../src/methods/fusion";
import { topicViews } from "../src/methods/topics";
import { jiaoVerdict } from "../src/core/jiao";
import { qimenChart, qimenReading } from "../src/core/qimen";

/** Fields that hold internal Chinese keys, named at display time (五行, 方位, origin) or chart payloads. */
const KEY_FIELDS = new Set(["origin", "element", "dominantElement", "weakElement", "directions", "methodId", "visual"]);
const HAN = /[一-鿿]/;

/** Every string under `v` that still contains a Chinese character, with its path. */
function chinese(v: unknown, path = ""): string[] {
  if (typeof v === "string") return HAN.test(v) ? [`${path}: ${v.slice(0, 80)}`] : [];
  if (Array.isArray(v)) return v.flatMap((x, i) => chinese(x, `${path}[${i}]`));
  if (v && typeof v === "object") return Object.entries(v).flatMap(([k, x]) => (KEY_FIELDS.has(k) ? [] : chinese(x, path ? `${path}.${k}` : k)));
  return [];
}

const beijing = CITIES.find((c) => c.name === "北京")!;
const inputs = [
  { year: 1990, month: 5, day: 15, hour: 14, minute: 30, timeKnown: true, city: beijing, gender: "male" as const, trueSolar: true },
  { year: 1985, month: 11, day: 3, hour: 2, minute: 10, timeKnown: false, city: beijing, gender: "female" as const, trueSolar: false },
  { year: 2001, month: 2, day: 4, hour: 22, minute: 50, timeKnown: true, city: CITIES.find((c) => c.name === "伦敦")!, gender: "female" as const, trueSolar: true },
];
const now = new Date(2026, 9, 13);
const RELATIONS: RelationKind[] = ["partner", "father", "boss", "child", "friend", "colleague", "sibling"];

const before = getLang();
beforeAll(() => setLang("en"));
afterAll(() => setLang(before));

describe("English output has no Chinese text", () => {
  for (const [n, input] of inputs.entries()) {
    test(`methods, forecasts and fusion · chart ${n + 1}`, () => {
      const chart = computeChart(input);
      const results = METHOD_ORDER.map((id) => METHODS[id](chart));
      for (const r of results) expect(chinese(r)).toEqual([]);
      const forecasts = Object.fromEntries(METHOD_ORDER.map((id) => [id, FORECASTS[id]?.(chart, now)]));
      for (const f of Object.values(forecasts)) expect(chinese(f)).toEqual([]);
      expect(chinese(fuse(results))).toEqual([]);
      const views = topicViews(results, forecasts);
      expect(chinese(views.map((v) => ({ name: v.name, statements: v.statements })))).toEqual([]);
      for (const dim of ["career", "love"] as const) {
        const e = askEvidence(results, forecasts, dim, "bazi", input, now);
        expect(chinese(askPreviewText(e, { topic: dim, question: "Should I?", situation: [], context: "" }))).toEqual([]);
      }
    });
  }

  test("relationship matching for every relation", () => {
    const [a, b, c] = inputs.map(computeChart);
    for (const rel of RELATIONS)
      for (const fn of COMPATS) {
        expect(chinese(fn(a!, b!, rel))).toEqual([]);
        expect(chinese(fn(c!, a!, rel))).toEqual([]);
      }
  });

  test("moon blocks and Qimen", () => {
    expect(chinese([jiaoVerdict([]), jiaoVerdict(["圣杯"]), jiaoVerdict(["圣杯", "笑杯"]), jiaoVerdict(["阴杯"]), jiaoVerdict(["圣杯", "圣杯", "圣杯"])])).toEqual([]);
    const chart = qimenChart(new Date(Date.UTC(2026, 2, 18, 7, 20)));
    expect(chinese(qimenReading(chart))).toEqual([]);
  });
});
