import type { Dim } from "../data/types";
import { type FirPlanet, NODE_INFO, TASK } from "../data/firdaria";
import { HOUSES, TRAD_INFO, type Trad } from "../data/hellenistic";
import {
  firCond,
  firdariaAt,
  firdariaTimeline,
  type FirCond,
  firInfo,
  firNatal,
  isNode,
  subPlain,
  weightOf,
} from "../methods/firdaria";
import { pick, type StrengthTone, stateText } from "../methods/hellenistic";
import { type Forecast, type ForecastFn, forecastPeriods, periodInstant, type Signal, type Tone } from "./types";

/** The life area each period ruler speaks about first. */
const PRIMARY_DIM: Record<FirPlanet, Dim> = {
  sun: "career", moon: "health", mercury: "wisdom", venus: "love", mars: "career", jupiter: "wealth", saturn: "career", northNode: "career", southNode: "wisdom",
};

const houseOf = (h: number) => HOUSES[h - 1]!;
const toneOf = (t: StrengthTone): Tone => t;

function houseAction(house: number, tone: StrengthTone, seed: number): string {
  const H = houseOf(house);
  if (tone === "good") return pick(H.good, seed);
  if (tone === "bad") return pick(H.care, seed);
  return `${pick(H.good, seed)}同时，${pick(H.care, seed + 1)}`;
}

const NATURE_GROUP = (p: Trad): "soft" | "hard" | "mid" => (p === "jupiter" || p === "venus" ? "soft" : p === "saturn" || p === "mars" ? "hard" : "mid");

export const firdariaForecast: ForecastFn = (chart, now): Forecast => {
  const fn = firNatal(chart);
  const tl = firdariaTimeline(chart.utc, fn.natal.day, 3);
  const { years } = forecastPeriods(now);

  const readings = years.map((p) => {
    const mid = periodInstant(p);
    const at = firdariaAt(tl, mid);
    const { major, sub } = at;
    const mc: FirCond = firCond(major.planet, fn);
    const sc = sub ? firCond(sub.planet, fn) : null;
    const M = firInfo(major.planet);
    const S = sub ? firInfo(sub.planet) : null;
    const seed = p.year + major.startAge;
    const yearNo = Math.min(major.years, Math.max(1, Math.floor((mid.getTime() - major.start.getTime()) / (365.2425 * 86400000)) + 1));
    const progress = yearNo === 1 ? "这一年刚进入这个阶段，" : yearNo >= major.years ? "这一年已走到这个阶段的尾声，" : `这一年是这个阶段的第 ${yearNo} 年（共 ${major.years} 年），`;
    const signals: Signal[] = [];

    // 1. The major ruler.
    const mTone = toneOf(mc.tone);
    const rulerLine = isNode(major.planet)
      ? pick(NODE_INFO[major.planet].actions, seed)
      : `${TRAD_INFO[major.planet as Trad].zh}（管${TRAD_INFO[major.planet as Trad].plainKw}）。它${stateText(major.planet as Trad, mc.tone)}。`;
    signals.push({
      dim: PRIMARY_DIM[major.planet],
      tone: mTone,
      weight: weightOf(mc),
      pro: `法达大限${M.zh}（${major.startAge}–${major.endAge} 岁，${fn.natal.day ? "日" : "夜"}间序列）：${mc.line}`,
      plain: `${progress}整体是${M.stage}。${rulerLine}这段时间的功课是${TASK[major.planet]}。`,
    });

    // 2. The area where the major ruler sits natally.
    const H = houseOf(mc.house);
    signals.push({
      dim: H.dim,
      tone: mTone,
      weight: Math.max(1, weightOf(mc) - 1) as 1 | 2 | 3,
      pro: `大限星${M.zh}本命位于第${mc.house}宫（${H.topic}）：大限把该宫议题带到台前`,
      plain: `这个阶段的主星出生时落在「${H.plainTopic}」，所以这方面是这几年绕不开的话题。${houseAction(mc.house, mc.tone, seed + 3)}`,
    });

    // 3. The sub ruler.
    if (sub && sc && S) {
      const sTone = toneOf(sc.tone);
      signals.push({
        dim: PRIMARY_DIM[sub.planet],
        tone: sTone,
        weight: Math.min(2, weightOf(sc)) as 1 | 2,
        pro: `法达小限${S.zh}（大限${M.zh}第 ${at.subIndex + 1}/7 段）：${sc.line}`,
        plain: `${subPlain(sc)}${houseAction(sc.house, sc.tone, seed + 5)}`,
      });

      // 4. How major and sub rulers get along.
      const a = NATURE_GROUP(major.planet as Trad);
      const b = NATURE_GROUP(sub.planet);
      const same = sub.planet === major.planet;
      const rel: Tone = same ? sTone : a === "soft" && b === "soft" ? "good" : a === "hard" && b === "hard" ? "bad" : a !== b && (a === "soft" || b === "soft") && (a === "hard" || b === "hard") ? "mixed" : a === "soft" || b === "soft" ? "good" : "mixed";
      const relText: Record<Tone, string[]> = {
        good: [`大阶段的${M.zh}和小阶段的${S.zh}合得来，今年做事阻力偏小，想推进的事别拖。`, `${M.zh}和${S.zh}这一对配合顺畅，今年容易有人帮一把，遇到卡点主动开口就好。`],
        bad: [`大阶段的${M.zh}和小阶段的${S.zh}都偏严厉，今年节奏会紧一些。把期限提前一点，留出缓冲的时间。`, `${M.zh}加${S.zh}，今年压力和要求都不小。宜把事情拆小，一件一件做完，少同时开几条线。`],
        mixed: [`大阶段的${M.zh}和小阶段的${S.zh}性格不同，今年有顺风也有逆风。重要的事先看清条件再答应。`, `${M.zh}和${S.zh}一软一硬，今年适合边做边调整，别一开始就把计划定死。`],
      };
      signals.push({
        dim: "wisdom",
        tone: rel,
        weight: same ? 2 : 1,
        pro: same ? `小限星与大限星同为${M.zh}：该小限主题最纯粹` : `大限星${M.zh}与小限星${S.zh}的性质关系（${a}/${b}）`,
        plain: same ? `眼下的小阶段和大阶段由同一颗星主管，今年的主题特别集中。${pick(relText[rel], seed)}` : pick(relText[rel], seed),
      });
    }

    // 5. A change of period inside the year.
    const jan = Date.UTC(p.year, 0, 1);
    const dec = Date.UTC(p.year + 1, 0, 1);
    const changes: { t: number; planet: FirPlanet; major: boolean }[] = [];
    for (const m of tl) {
      if (m.start.getTime() > jan && m.start.getTime() < dec) changes.push({ t: m.start.getTime(), planet: m.planet, major: true });
      for (const s of m.subs) if (s.start.getTime() > jan && s.start.getTime() < dec && s.startAge !== m.startAge) changes.push({ t: s.start.getTime(), planet: s.planet, major: false });
    }
    changes.sort((x, y) => x.t - y.t);
    const ch = changes[0];
    if (ch) {
      const info = firInfo(ch.planet);
      const month = new Date(ch.t).getUTCMonth() + 1;
      signals.push({
        dim: "wisdom",
        tone: "mixed",
        weight: ch.major ? 2 : 1,
        pro: `法达${ch.major ? "大限" : "小限"}在${p.year}年${month}月换主：由${info.zh}接手`,
        plain: `${ch.major ? "这一年你会换到一个新的大阶段" : "年中会换到新的小阶段"}：大约 ${month} 月起，由${info.zh}（管${info.plainKw}）接手。前后半年的节奏会不一样，重要的决定尽量避开交接前后的一两个月。`,
      });
    }

    return { period: p, label: `${M.zh}大限${S ? ` · ${S.zh}小限` : ""}`, signals };
  });

  return { years: readings, months: [], note: "法达以年为单位，没有对应的月度规则；月度请参考小限的月运。" };
};
