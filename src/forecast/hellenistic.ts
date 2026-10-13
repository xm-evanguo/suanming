import type { Chart } from "../core/chart";
import { DIGNITY_NAME, TRAD_INFO, type Trad } from "../data/hellenistic";
import { isEn, sep, t } from "../i18n";
import {
  houseAction,
  houseInfo,
  monthsElapsed,
  type Natal,
  natalOf,
  pick,
  placeScore,
  profection,
  type StrengthTone,
  stateText,
  TRAD_KEYS,
  toneOfScore,
  weightOfScore,
} from "../methods/hellenistic";
import { type Forecast, type ForecastFn, forecastPeriods, type PeriodReading, periodInstant, type Signal } from "./types";

type Scope = "year" | "month";

const LEAD: Record<Scope, ((topic: string, zh: string, kw: string) => string)[]> = {
  year: [
    (t, z, k) => `今年的重心落在「${t}」上，带头的是${z}（管${k}）。`,
    (t, z, k) => `这一年你会常碰到和「${t}」有关的事，由${z}（管${k}）来带节奏。`,
    (t, z, k) => `今年最容易被点亮的是「${t}」，负责推动的是${z}（管${k}）。`,
  ],
  month: [
    (t, z, k) => `这个月的重心是「${t}」，由${z}（管${k}）带头。`,
    (t, z, k) => `这个月和「${t}」有关的事会比较多，带头的是${z}（管${k}）。`,
    (t, z, k) => `这个月的焦点在「${t}」，${z}（管${k}）是本月的主角。`,
  ],
};

const LEAD_EN: Record<Scope, ((topic: string, name: string, kw: string) => string)[]> = {
  year: [
    (t, z, k) => `This year's focus falls on "${t}", led by ${z} (governs ${k}).`,
    (t, z, k) => `This year you will keep running into matters to do with "${t}", with ${z} (governs ${k}) setting the pace.`,
    (t, z, k) => `What lights up most easily this year is "${t}", and ${z} (governs ${k}) drives it.`,
  ],
  month: [
    (t, z, k) => `This month's focus is "${t}", led by ${z} (governs ${k}).`,
    (t, z, k) => `Matters to do with "${t}" come up more often this month, led by ${z} (governs ${k}).`,
    (t, z, k) => `This month's spotlight is on "${t}", and ${z} (governs ${k}) is the lead.`,
  ],
};

const STATE_LINE: Record<StrengthTone, (p: Trad) => string> = {
  good: (p) => (isEn() ? `It is in good shape: it ${stateText(p, "good")}.` : `它状态不错：${stateText(p, "good")}。`),
  bad: (p) => (isEn() ? `It is weaker this time: it ${stateText(p, "bad")}.` : `它这次状态偏弱：${stateText(p, "bad")}。`),
  mixed: (p) => (isEn() ? `It is a mixed picture: it ${stateText(p, "mixed")}.` : `它的状态有好有坏：${stateText(p, "mixed")}。`),
};

const dignityNote = (p: Trad, n: Natal) => DIGNITY_NAME[n.planets[p].dignity];

export interface ProfectionReading {
  label: string;
  signals: Signal[];
}

/** Read one profected sign. `steps` is the age (year) or age plus elapsed months (month). */
export function readProfection(n: Natal, steps: number, scope: Scope, seed: number, yearLord?: Trad, unknownTime = false): ProfectionReading {
  const prof = profection(n.ascSign, steps);
  const H = houseInfo(prof.house);
  const lord = prof.lord;
  const L = TRAD_INFO[lord];
  const score = placeScore(lord, n);
  const tone = toneOfScore(score);
  const w = weightOfScore(score);
  const lordPos = n.planets[lord];
  const when = scope === "year" ? t("今年", "this year") : t("这个月", "this month");
  const name = scope === "year" ? t("年主星", "Lord of the Year") : t("月主星", "Lord of the Month");
  const cap = unknownTime ? t("（出生时间未知，宫位仅供参考）", " (birth time unknown, so houses are a rough guide)") : "";
  const signals: Signal[] = [];
  const sp = sep();

  signals.push({
    dim: H.dim,
    tone,
    weight: w,
    pro: isEn()
      ? `${scope === "year" ? "Annual" : "Monthly"} profection to house ${prof.house} (${H.topic}): ${name} ${L.zh}, natal dignity: ${dignityNote(lord, n)}, in house ${lordPos.house}${lordPos.retro ? ", retrograde" : ""}${scope === "year" ? "; in effect from this year's birthday" : ""}${cap}`
      : `${scope === "year" ? "年度" : "月度"}小限第${prof.house}宫（${H.topic}）：${name}${L.zh}，本命${dignityNote(lord, n)}，位于第${lordPos.house}宫${lordPos.retro ? "且逆行" : ""}${scope === "year" ? "；自本年生日起生效" : ""}${cap}`,
    plain: `${pick((isEn() ? LEAD_EN : LEAD)[scope], seed)(H.plainTopic, L.zh, L.plainKw)}${sp}${STATE_LINE[tone](lord)}${sp}${houseAction(prof.house, tone, seed)}`,
  });

  // Natal planets sitting in the profected house are activated.
  const occupants = TRAD_KEYS.filter((p) => p !== lord && n.planets[p].house === prof.house).sort((a, b) => Math.abs(placeScore(b, n)) - Math.abs(placeScore(a, n)));
  for (const p of occupants.slice(0, scope === "year" ? 2 : 1)) {
    const s = placeScore(p, n);
    const t = toneOfScore(s);
    signals.push({
      dim: H.dim,
      tone: t,
      weight: Math.min(2, weightOfScore(s)) as 1 | 2,
      pro: isEn()
        ? `The ${scope === "year" ? "annual" : "monthly"} profection house holds natal ${TRAD_INFO[p].zh} (${dignityNote(p, n)}): a planet in the activated house, so its themes are awakened`
        : `${scope === "year" ? "小限宫内" : "月小限宫内"}有本命${TRAD_INFO[p].zh}（${dignityNote(p, n)}）：占据被激活的宫位，其议题被唤醒`,
      plain: isEn()
        ? `You were born with ${TRAD_INFO[p].zh} (governs ${TRAD_INFO[p].plainKw}) in this area, and ${when} it is awakened. It ${stateText(p, t)}. ${houseAction(prof.house, t, seed + 2)}`
        : `你出生时${TRAD_INFO[p].zh}（管${TRAD_INFO[p].plainKw}）就落在这个领域，${when}它被唤醒了。它${stateText(p, t)}。${houseAction(prof.house, t, seed + 2)}`,
    });
  }

  // Where the time lord sits in the natal chart colours a second area.
  if (lordPos.house !== prof.house) {
    const H2 = houseInfo(lordPos.house);
    signals.push({
      dim: H2.dim,
      tone,
      weight: Math.max(1, w - 1) as 1 | 2 | 3,
      pro: isEn()
        ? `${name} ${L.zh} sits in house ${lordPos.house} (${H2.topic}) natally: the time lord brings that house's themes in as well`
        : `${name}${L.zh}本命位于第${lordPos.house}宫（${H2.topic}）：时间主星把该宫议题一并带入`,
      plain: isEn()
        ? `${L.zh}, the leading planet, was in the area of "${H2.plainTopic}" when you were born, so ${when} that area is stirred too. ${houseAction(lordPos.house, tone, seed + 4)}`
        : `带头的${L.zh}在你出生时待在「${H2.plainTopic}」这个领域，所以${when}这方面也会被带动。${houseAction(lordPos.house, tone, seed + 4)}`,
    });
  }

  // Lots of Fortune and Spirit.
  if (n.lots.fortune.house === prof.house)
    signals.push({
      dim: "wealth",
      tone: "good",
      weight: scope === "year" ? 2 : 1,
      pro: t(`福点落在小限宫（第${prof.house}宫）：身体与物质运气的落脚处被激活`, `Lot of Fortune in the profection house (house ${prof.house}): where body and material luck land is activated`),
      plain: isEn()
        ? `Your natural "luck point" (where body and fortune land) is in this area, so ${when}, doing things to do with "${H.plainTopic}" is more likely to pay off. ${pick(H.good, seed + 5)}`
        : `你天生的“福气点”（身体状态和运气的落脚处）就在这个领域，${when}做跟「${H.plainTopic}」有关的事，更容易得到回报。${pick(H.good, seed + 5)}`,
    });
  if (n.lots.spirit.house === prof.house)
    signals.push({
      dim: "career",
      tone: "good",
      weight: scope === "year" ? 2 : 1,
      pro: t(`精神点落在小限宫（第${prof.house}宫）：志向与职业方向被激活`, `Lot of Spirit in the profection house (house ${prof.house}): ambition and career direction are activated`),
      plain: isEn()
        ? `Your "ambition point" (what you want to do and your career direction) is in this area too, so if you want to move up ${when}, you can start with "${H.plainTopic}". ${pick(H.good, seed + 6)}`
        : `你的“志向点”（想做的事和职业方向）也落在这个领域，${when}想往上走，可以从「${H.plainTopic}」这一块切入。${pick(H.good, seed + 6)}`,
    });

  if (scope === "year") {
    if (lord === n.chartRuler)
      signals.push({
        dim: "health",
        tone: tone === "bad" ? "mixed" : "good",
        weight: 2,
        pro: t(`年主星${L.zh}同时是命主星（上升星座守护星）：本年议题与本人状态高度重合`, `Lord of the Year ${L.zh} is also the Chart Ruler (ruler of the rising sign): this year's themes overlap strongly with your own state`),
        plain: t(
          "今年带头的这颗星，正好也是你整张命盘的“主角星”，所以今年的事和你本人的状态绑得特别紧。好事坏事都更像你自己的选择，多留点时间给自己，睡好、吃好。",
          "The planet leading this year is also the \"star of the show\" of your whole chart, so this year's events are tied closely to your own condition. Good and bad alike feel more like your own choices, so leave time for yourself, and sleep and eat well.",
        ),
      });
    else if (lord === n.sect.benefic)
      signals.push({
        dim: "wealth",
        tone: "good",
        weight: 2,
        pro: t(`年主星${L.zh}是得时吉星（${n.day ? "日间盘木星" : "夜间盘金星"}）：本年得吉星主事`, `Lord of the Year ${L.zh} is the benefic of the sect (${n.day ? "Jupiter in a day chart" : "Venus in a night chart"}): a benefic runs the year`),
        plain: t(
          `今年带头的${L.zh}正是你命盘里最护着你的那颗星。遇到卡住的事，开口向人求助，比自己硬扛更容易得到回应。`,
          `This year's lead planet, ${L.zh}, is the very one that looks after you most in your chart. When you get stuck, asking others for help gets a better response than pushing through alone.`,
        ),
      });
    else if (lord === n.sect.maleficContrary)
      signals.push({
        dim: "career",
        tone: "bad",
        weight: 2,
        pro: t(`年主星${L.zh}是逆时凶星（${n.day ? "日间盘火星" : "夜间盘土星"}）：本年需格外留意其失衡的一面`, `Lord of the Year ${L.zh} is the malefic contrary to the sect (${n.day ? "Mars in a day chart" : "Saturn in a night chart"}): watch its unbalanced side this year`),
        plain: t(
          `今年带头的${L.zh}是你命盘里需要多一分耐心的那颗星。做事宜慢一点，先把计划写下来，少在冲动的时候拍板。`,
          `This year's lead planet, ${L.zh}, is the one in your chart that needs a little more patience. Go slower, write your plan down first, and avoid deciding on impulse.`,
        ),
      });
  } else if (yearLord && lord === yearLord) {
    signals.push({
      dim: H.dim,
      tone,
      weight: 2,
      pro: t(`月主星${L.zh}与年主星相同：本年主题在本月集中显现`, `Lord of the Month ${L.zh} is the same as the Lord of the Year: this year's theme shows up in concentrated form this month`),
      plain: t(
        `这个月的带头星和今年的相同，今年的主题在这个月特别集中。趁这个月把相关的事推进一步。${houseAction(prof.house, tone, seed + 7)}`,
        `This month's lead planet is the same as this year's, so this year's theme is especially concentrated now. Use this month to take the related matters one step forward. ${houseAction(prof.house, tone, seed + 7)}`,
      ),
    });
  }

  return {
    label:
      scope === "year"
        ? t(`小限第${prof.house}宫 · 年主星${L.zh}`, `Profection to house ${prof.house} · Lord of the Year ${L.zh}`)
        : t(`月小限第${prof.house}宫 · 月主星${L.zh}`, `Monthly profection to house ${prof.house} · Lord of the Month ${L.zh}`),
    signals,
  };
}

export const hellenisticForecast: ForecastFn = (chart: Chart, now: Date): Forecast => {
  const n = natalOf(chart);
  const unknown = !chart.input.timeKnown;
  const birth = chart.input;
  const { years, months } = forecastPeriods(now);

  const yearReadings: PeriodReading[] = years.map((p) => {
    const age = Math.max(0, p.year - birth.year);
    const r = readProfection(n, age, "year", p.year + age, undefined, unknown);
    return { period: p, label: r.label, signals: r.signals };
  });

  const monthReadings: PeriodReading[] = months.map((p) => {
    const at = periodInstant(p);
    const total = Math.max(0, monthsElapsed(birth, at.getUTCFullYear(), at.getUTCMonth() + 1, at.getUTCDate()));
    const age = Math.floor(total / 12);
    const yearLord = profection(n.ascSign, age).lord;
    const r = readProfection(n, age + (total % 12), "month", p.year * 12 + (p.month ?? 0), yearLord, unknown);
    return { period: p, label: r.label, signals: r.signals };
  });

  return { years: yearReadings, months: monthReadings };
};
