import * as Astro from "astronomy-engine";
import type { Chart } from "../core/chart";
import { norm360 } from "../core/chart";
import {
  BAD_PLACES,
  type Dignity,
  DIGNITY_NAME,
  DIGNITY_PLAIN,
  dignityOf,
  FORTUNE_IN_HOUSE,
  FORTUNE_PLAIN,
  houseKind,
  HOUSES,
  LOT_TEXT,
  SECT,
  type SectInfo,
  SIGN_RULER,
  SPIRIT_IN_HOUSE,
  SPIRIT_PLAIN,
  TRAD_INFO,
  type Trad,
} from "../data/hellenistic";
import { signName as signEn } from "../data/en/terms";
import { ZODIAC } from "../data/zodiac";
import { isEn, lcFirst, listJoin, sep } from "../i18n";
import { degInSign, signOf } from "./astrology";
import { methodName } from "./names";
import { type MethodFn, mixScores, plainTitles, shiftScores, UNKNOWN_TIME_NOTE } from "./types";

export const TRAD_KEYS: Trad[] = ["sun", "moon", "mercury", "venus", "mars", "jupiter", "saturn"];

/** Deterministic choice from a pool, so that the text is stable but varies by seed. */
export function pick<T>(pool: readonly T[], seed: number): T {
  return pool[Math.abs(Math.floor(seed)) % pool.length]!;
}

export interface TradPos {
  key: Trad;
  lon: number;
  sign: number;
  house: number;
  retro: boolean;
  dignity: Dignity;
}

export interface LotPos {
  lon: number;
  sign: number;
  house: number;
  ruler: Trad;
}

export interface Natal {
  asc: number;
  ascSign: number;
  day: boolean;
  /** Geometric altitude of the Sun's centre, degrees. */
  sunAlt: number;
  sect: SectInfo;
  planets: Record<Trad, TradPos>;
  lots: { fortune: LotPos; spirit: LotPos };
  chartRuler: Trad;
}

export const wholeSignHouse = (lon: number, ascSign: number) => ((signOf(lon) - ascSign + 12) % 12) + 1;

/** Sun altitude at the birth place and instant. Positive means a day chart. */
export function sunAltitude(chart: Chart): number {
  const obs = new Astro.Observer(chart.input.city.lat, chart.input.city.lon, 0);
  const eq = Astro.Equator(Astro.Body.Sun, chart.utc, obs, true, true);
  return Astro.Horizon(chart.utc, obs, eq.ra, eq.dec).altitude;
}

/** Lot of Fortune and Lot of Spirit. Day: Fortune = ASC + Moon - Sun. Night: reversed. Spirit is the reverse of Fortune. */
export function lots(asc: number, sun: number, moon: number, day: boolean): { fortune: number; spirit: number } {
  const a = norm360(asc + moon - sun);
  const b = norm360(asc + sun - moon);
  return day ? { fortune: a, spirit: b } : { fortune: b, spirit: a };
}

/** Annual (steps = age) or monthly profection. The profected sign is counted from the ASC sign. */
export function profection(ascSign: number, steps: number): { house: number; sign: number; lord: Trad } {
  const sign = (ascSign + steps) % 12;
  return { house: (steps % 12) + 1, sign, lord: SIGN_RULER[sign]! };
}

/** Completed months from a birth date to a calendar date (y, m = 1-12, d). */
export function monthsElapsed(birth: { year: number; month: number; day: number }, y: number, m: number, d: number): number {
  return (y - birth.year) * 12 + (m - birth.month) - (d < birth.day ? 1 : 0);
}

export function natalOf(chart: Chart): Natal {
  const asc = chart.asc;
  const ascSign = signOf(asc);
  const day = sunAltitude(chart) > 0;
  const planets = {} as Record<Trad, TradPos>;
  for (const key of TRAD_KEYS) {
    const p = chart.planets[key];
    const sign = signOf(p.lon);
    planets[key] = { key, lon: p.lon, sign, house: wholeSignHouse(p.lon, ascSign), retro: p.retro, dignity: dignityOf(key, sign) };
  }
  const l = lots(asc, chart.planets.sun.lon, chart.planets.moon.lon, day);
  const lotPos = (lon: number): LotPos => ({ lon, sign: signOf(lon), house: wholeSignHouse(lon, ascSign), ruler: SIGN_RULER[signOf(lon)]! });
  return {
    asc,
    ascSign,
    day,
    sunAlt: sunAltitude(chart),
    sect: day ? SECT.day : SECT.night,
    planets,
    lots: { fortune: lotPos(l.fortune), spirit: lotPos(l.spirit) },
    chartRuler: SIGN_RULER[ascSign]!,
  };
}

// ───────────────────────── Strength

const DIGNITY_PTS: Record<Dignity, number> = { domicile: 2, exaltation: 1.5, peregrine: 0, fall: -1, detriment: -1.5 };

/** Essential dignity + sect + house + motion. About -3 .. +4. */
export function placeScore(p: Trad, n: Natal): number {
  const pos = n.planets[p];
  let s = DIGNITY_PTS[pos.dignity];
  const sect = n.sect;
  if (p === sect.benefic) s += 1;
  else if (p === sect.beneficContrary) s += 0.5;
  else if (p === sect.maleficOfSect) s -= 0.5;
  else if (p === sect.maleficContrary) s -= 1;
  else if (p === sect.light) s += 0.5;
  if (BAD_PLACES.includes(pos.house)) s -= 1;
  else s += { angular: 1, succeedent: 0.5, cadent: 0 }[houseKind(pos.house)];
  if (pos.retro && p !== "sun" && p !== "moon") s -= 0.5;
  return s;
}

export type StrengthTone = "good" | "bad" | "mixed";
export const toneOfScore = (s: number): StrengthTone => (s >= 1.5 ? "good" : s <= -0.5 ? "bad" : "mixed");
export const weightOfScore = (s: number): 1 | 2 | 3 => (Math.abs(s) >= 3 ? 3 : Math.abs(s) >= 1.5 ? 2 : 1);

/** Plain description of how a planet behaves in a given tone. Fits after "它". */
export const stateText = (p: Trad, tone: StrengthTone) => TRAD_INFO[p][tone === "good" ? "strong" : tone === "bad" ? "weak" : "mixed"];

export const houseInfo = (h: number) => HOUSES[h - 1]!;

/** A fitting action for a house, chosen by tone. Mixed tone gives one of each. */
export function houseAction(house: number, tone: StrengthTone, seed: number): string {
  const H = houseInfo(house);
  if (tone === "good") return pick(H.good, seed);
  if (tone === "bad") return pick(H.care, seed);
  return isEn() ? `${pick(H.good, seed)} At the same time, ${lcFirst(pick(H.care, seed + 1))}` : `${pick(H.good, seed)}同时，${pick(H.care, seed + 1)}`;
}

const signName = (i: number) => signEn(ZODIAC[i]!.name);

/** A house topic without its traditional-name part ("..., the place of Good Fortune"). */
export const shortTopic = (topic: string) => topic.replace(/[，;].*$/, "");

/** One-line technical description of a planet's natal condition. */
export function conditionLine(p: Trad, n: Natal): string {
  const pos = n.planets[p];
  if (isEn()) return `${TRAD_INFO[p].zh} in ${signName(pos.sign)} ${degInSign(pos.lon)} (${DIGNITY_NAME[pos.dignity]}), in house ${pos.house} "${shortTopic(HOUSES[pos.house - 1]!.topic)}"${pos.retro ? ", retrograde" : ""}`;
  return `${TRAD_INFO[p].zh}落${signName(pos.sign)}${degInSign(pos.lon)}（${DIGNITY_NAME[pos.dignity]}），位于第${pos.house}宫「${HOUSES[pos.house - 1]!.topic.replace(/，.*$/, "")}」${pos.retro ? "，逆行" : ""}`;
}

/** Whole years lived on a calendar date. */
export const ageOn = (birth: { year: number; month: number; day: number }, y: number, m: number, d: number) => Math.floor(monthsElapsed(birth, y, m, d) / 12);

// ───────────────────────── Method

export interface HellenisticVisual {
  asc: number;
  ascSign: number;
  day: boolean;
  sunAlt: number;
  planets: TradPos[];
  lots: { fortune: LotPos; spirit: LotPos };
  profection: { age: number; house: number; sign: number; lord: Trad };
  chartRuler: Trad;
  sectLight: Trad;
  benefic: Trad;
  malefic: Trad;
  unknownTime: boolean;
}

const fmtPos = (lon: number) => `${signName(signOf(lon))} ${degInSign(lon)}`;

export function buildHellenistic(chart: Chart, now: Date): ReturnType<MethodFn<HellenisticVisual>> {
  const n = natalOf(chart);
  const known = chart.input.timeKnown;
  const sect = n.sect;
  const age = Math.max(0, ageOn(chart.input, now.getFullYear(), now.getMonth() + 1, now.getDate()));
  const prof = profection(n.ascSign, age);
  const ruler = n.chartRuler;
  const rulerPos = n.planets[ruler];
  const rulerScore = placeScore(ruler, n);
  const rulerTone = toneOfScore(rulerScore);
  const benefic = sect.benefic;
  const malefic = sect.maleficContrary;
  const beneficTone = toneOfScore(placeScore(benefic, n));
  const maleficTone = toneOfScore(placeScore(malefic, n));
  const asc = ZODIAC[n.ascSign]!;
  const sun = ZODIAC[n.planets.sun.sign]!;
  const moon = ZODIAC[n.planets.moon.sign]!;
  const F = n.lots.fortune;
  const S = n.lots.spirit;
  const lordPos = n.planets[prof.lord];
  const lordTone = toneOfScore(placeScore(prof.lord, n));
  const R = TRAD_INFO[ruler];
  const B = TRAD_INFO[benefic];
  const M = TRAD_INFO[malefic];
  const L = TRAD_INFO[prof.lord];
  const lightPos = n.planets[sect.light];

  const base = known
    ? mixScores([[TRAD_INFO[ruler].scores, 2], [asc.scores, 1], [TRAD_INFO[sect.light].scores, 1], [sun.scores, 1]])
    : mixScores([[TRAD_INFO[sect.light].scores, 2], [sun.scores, 2], [moon.scores, 1]]);
  const d = (x: number, k: number) => Math.max(-8, Math.min(8, Math.round(x * k)));
  const bs = placeScore(benefic, n);
  const ms = placeScore(malefic, n);
  const scores = shiftScores(base, {
    career: d(rulerScore, 2) + d(ms, 1),
    health: d(rulerScore, 1.5) + d(ms, 1.5),
    wealth: d(bs, 2),
    love: d(bs, 2),
    wisdom: d(placeScore("mercury", n), 1.5),
  });

  const timeHint = known ? "" : "（你没有填出生时间，涉及“领域”的部分只能当参考）";
  const houseOf = (h: number) => HOUSES[h - 1]!;

  const sections = [
    {
      title: `盘主与宗派 · ${sect.name}`,
      body: `${sect.text}上升在${asc.name}${degInSign(n.asc)}，整宫制下该星座整个就是第 1 宫。上升星座的守护星${R.zh}是命主星（Chart Ruler），落${fmtPos(rulerPos.lon)}，处于第 ${rulerPos.house} 宫（${houseOf(rulerPos.house).topic}），${DIGNITY_NAME[rulerPos.dignity]}。命主星的状态是整张盘的发动机：${R.zh}${stateText(ruler, rulerTone)}。主光${TRAD_INFO[sect.light].zh}落在第 ${lightPos.house} 宫（${houseOf(lightPos.house).topic}），${DIGNITY_NAME[lightPos.dignity]}。`,
    },
    {
      title: `福点 · 身体、健康与运气 · ${fmtPos(F.lon)}`,
      body: `${LOT_TEXT.fortune.meaning}${n.day ? "日间盘" : "夜间盘"}公式：${n.day ? "上升 + 月亮 − 太阳" : "上升 + 太阳 − 月亮"}。你的福点落在${fmtPos(F.lon)}，第 ${F.house} 宫（${houseOf(F.house).topic}）。${FORTUNE_IN_HOUSE[F.house - 1]}福点的守护星${TRAD_INFO[F.ruler].zh}落第 ${n.planets[F.ruler].house} 宫，${DIGNITY_NAME[n.planets[F.ruler].dignity]}，它的状态决定福气能否顺利“落地”。`,
    },
    {
      title: `精神点 · 心智、志向与职业 · ${fmtPos(S.lon)}`,
      body: `${LOT_TEXT.spirit.meaning}公式与福点相反：${n.day ? "上升 + 太阳 − 月亮" : "上升 + 月亮 − 太阳"}。你的精神点落在${fmtPos(S.lon)}，第 ${S.house} 宫（${houseOf(S.house).topic}）。${SPIRIT_IN_HOUSE[S.house - 1]}精神点的守护星${TRAD_INFO[S.ruler].zh}落第 ${n.planets[S.ruler].house} 宫，${DIGNITY_NAME[n.planets[S.ruler].dignity]}。`,
    },
    {
      title: "吉星与凶星",
      body: `得时吉星（Benefic of Sect）：${conditionLine(benefic, n)}，${B.zh}${stateText(benefic, beneficTone)}。逆时凶星（Malefic Contrary to Sect）：${conditionLine(malefic, n)}，${M.zh}${stateText(malefic, maleficTone)}。传统上，得时的吉星是你最大的助力，逆时的凶星则是需要多一分耐心去对待的地方；它们落在好位置、有尊贵，困难就会被缓和。`,
    },
    {
      title: `本年小限 · 第 ${prof.house} 宫`,
      body: `你现在 ${age} 岁。小限（Annual Profection）每年把上升点向前推进一个星座：${age} 岁时落在${signName(prof.sign)}，即你的第 ${prof.house} 宫（${houseOf(prof.house).topic}）。该星座的守护星${L.zh}就是本年度的年主星（Lord of the Year）。${conditionLine(prof.lord, n)}，${L.zh}${stateText(prof.lord, lordTone)}。小限每到生日换一次，12 年一个循环。`,
    },
  ];

  const plainState = (p: Trad) => stateText(p, toneOfScore(placeScore(p, n)));
  const venusPos = n.planets.venus;
  const plain = {
    summary: `${known ? "" : "你没有填出生时间，所以下面关于“人生领域”的部分只能当参考。"}你出生时${n.day ? "太阳在地平线上方，属于“白天出生”" : "太阳在地平线下方，属于“夜里出生”"}。古希腊人认为，推着你往前走的是${R.zh}（管${R.plainKw}），它${stateText(ruler, rulerTone)}。最护着你的星是${B.zh}，需要多一分耐心的是${M.zh}。`,
    sections: [
      {
        title: "你是怎样的人",
        body: `别人第一次见你，多半会觉得你有“${asc.title}”的味道，也就是${asc.keywords.slice(0, 3).join("、")}。真正在背后使劲的是${R.zh}（管${R.plainKw}），它${stateText(ruler, rulerTone)}。它的位置偏向「${houseOf(rulerPos.house).plainTopic}」，所以你的精力常常花在这上面。`,
      },
      {
        title: "适合的方向",
        body: `${SPIRIT_PLAIN[S.house - 1]}${pick(["想试的话，先拿一个小项目练手，做出成果再加码。", "不必一下子转行，可以先在业余时间做出一个小作品。", "先找一位在这个方向的前辈聊聊，听听他走过的路。"], S.house + n.ascSign)}`,
      },
      {
        title: "感情里的你",
        body: `你的爱与审美由金星带领，它${plainState("venus")}。它落在「${houseOf(venusPos.house).plainTopic}」这个领域，所以你在这方面最容易动心、也最愿意投入。${toneOfScore(placeScore("venus", n)) === "bad" ? pick(houseOf(venusPos.house).care, venusPos.sign) : pick(houseOf(venusPos.house).good, venusPos.sign)}`,
      },
      {
        title: "身体和运气",
        body: `${FORTUNE_PLAIN[F.house - 1]}月亮管你的情绪和睡眠，它${plainState("moon")}。${toneOfScore(placeScore("moon", n)) === "good" ? "保持现在的作息就很好。" : "每天固定一个睡觉的时间，比任何补品都管用。"}`,
      },
      {
        title: "需要留意",
        body: `${M.zh}（管${M.plainKw}）是你需要多一分耐心的那颗星，它${stateText(malefic, maleficTone)}。落在「${houseOf(n.planets[malefic].house).plainTopic}」这个领域，遇到这方面的事，${pick(houseOf(n.planets[malefic].house).care, n.planets[malefic].house + 3)}`,
      },
    ],
  };

  if (isEn()) {
    const dg = (p: Trad) => DIGNITY_NAME[n.planets[p].dignity];
    const topicOf = (h: number) => houseOf(h).topic;
    const ascN = signName(n.ascSign);
    const plainStateEn = (p: Trad) => stateText(p, toneOfScore(placeScore(p, n)));
    const venusTone = toneOfScore(placeScore("venus", n));
    const moonTone = toneOfScore(placeScore("moon", n));
    const mPos = n.planets[malefic];
    return {
      id: "hellenistic",
      name: methodName("hellenistic"),
      intro: "Astrology as it took shape in Alexandria around the turn of the era: whole-sign houses, day and night charts (sect), the Lots of Fortune and Spirit, the seven traditional planets and annual profections, used to read a whole life and each year of it.",
      origin: "古希腊",
      icon: "⚹︎",
      headline: `${sect.name} · ${ascN} rising · chart ruler ${R.zh}${known ? "" : " (time unknown)"}`,
      tagline: `${R.title}, watched over by ${B.zh}`,
      keywords: [sect.name, `Chart ruler ${R.zh}`, ...R.kw.slice(0, 2), `Lot of Fortune in house ${F.house}`],
      scores,
      element: R.wx,
      lucky: {
        colors: [...R.colors, ...B.colors.slice(0, 1)],
        numbers: [...new Set([...R.numbers, ...B.numbers])],
        directions: [...new Set([R.dir, B.dir])],
      },
      facts: [
        { label: "Day or night chart", value: `${sect.name} (Sun altitude ${n.sunAlt.toFixed(1)}°)` },
        { label: "Ascendant (ASC)", value: known ? `${ascN} ${degInSign(n.asc)}` : "Needs a birth time" },
        { label: "Chart ruler", value: `${R.glyph} ${R.zh} · house ${rulerPos.house} · ${dg(ruler)}` },
        { label: "Lot of Fortune", value: `${fmtPos(F.lon)} · house ${F.house}` },
        { label: "Lot of Spirit", value: `${fmtPos(S.lon)} · house ${S.house}` },
        { label: "Benefic of the sect", value: `${B.glyph} ${B.zh} · ${signName(n.planets[benefic].sign)} · house ${n.planets[benefic].house}` },
        { label: "Malefic contrary to the sect", value: `${M.glyph} ${M.zh} · ${signName(mPos.sign)} · house ${mPos.house}` },
        { label: `This year's profection (age ${age})`, value: `House ${prof.house} · Lord of the Year ${L.zh}` },
      ],
      sections: [
        {
          title: `Chart ruler and sect · ${sect.name}`,
          body: `${sect.text} The Ascendant is in ${ascN} ${degInSign(n.asc)}, and in whole-sign houses that entire sign is house 1. The ruler of the rising sign, ${R.zh}, is your Chart Ruler. It sits in ${fmtPos(rulerPos.lon)}, in house ${rulerPos.house} (${topicOf(rulerPos.house)}), dignity: ${dg(ruler)}. The chart ruler's condition is the engine of the whole chart: ${R.zh} ${stateText(ruler, rulerTone)}. The main light, ${TRAD_INFO[sect.light].zh}, sits in house ${lightPos.house} (${topicOf(lightPos.house)}), dignity: ${dg(sect.light)}.`,
        },
        {
          title: `Lot of Fortune · body, health and luck · ${fmtPos(F.lon)}`,
          body: `${LOT_TEXT.fortune.meaning} Formula for a ${n.day ? "day" : "night"} chart: ${n.day ? "Ascendant + Moon − Sun" : "Ascendant + Sun − Moon"}. Your Lot of Fortune falls in ${fmtPos(F.lon)}, house ${F.house} (${topicOf(F.house)}). ${FORTUNE_IN_HOUSE[F.house - 1]} The Lot's ruler, ${TRAD_INFO[F.ruler].zh}, is in house ${n.planets[F.ruler].house}, dignity: ${dg(F.ruler)}, and its condition decides whether the good fortune lands smoothly.`,
        },
        {
          title: `Lot of Spirit · mind, ambition and work · ${fmtPos(S.lon)}`,
          body: `${LOT_TEXT.spirit.meaning} Its formula is the reverse of the Lot of Fortune: ${n.day ? "Ascendant + Sun − Moon" : "Ascendant + Moon − Sun"}. Your Lot of Spirit falls in ${fmtPos(S.lon)}, house ${S.house} (${topicOf(S.house)}). ${SPIRIT_IN_HOUSE[S.house - 1]} The Lot's ruler, ${TRAD_INFO[S.ruler].zh}, is in house ${n.planets[S.ruler].house}, dignity: ${dg(S.ruler)}.`,
        },
        {
          title: "Benefic and malefic",
          body: `Benefic of the sect: ${conditionLine(benefic, n)}. ${B.zh} ${stateText(benefic, beneficTone)}. Malefic contrary to the sect: ${conditionLine(malefic, n)}. ${M.zh} ${stateText(malefic, maleficTone)}. Traditionally the benefic of the sect is your greatest help, while the contrary malefic is where you need a little more patience; when they sit in good places and hold dignity, the difficulty is softened.`,
        },
        {
          title: `This year's profection · house ${prof.house}`,
          body: `You are ${age} now. In an annual profection the Ascendant moves forward one sign every year: at ${age} it lands on ${signName(prof.sign)}, your house ${prof.house} (${topicOf(prof.house)}). The ruler of that sign, ${L.zh}, is the Lord of the Year. ${conditionLine(prof.lord, n)}. ${L.zh} ${stateText(prof.lord, lordTone)}. The profection changes at each birthday and repeats in a 12-year cycle.`,
        },
      ],
      plain: {
        summary: `${known ? "" : "You did not enter a birth time, so the parts below about areas of life are a rough guide only. "}You were born ${n.day ? "with the Sun above the horizon, a \"day birth\"" : "with the Sun below the horizon, a \"night birth\""}. The ancient Greeks held that what drives you forward is ${R.zh} (governs ${R.plainKw}), which ${stateText(ruler, rulerTone)}. The planet that looks after you most is ${B.zh}, and the one that needs a little more patience is ${M.zh}.`,
        sections: [
          {
            title: plainTitles().who,
            body: `When people first meet you, they tend to feel something of "${asc.title}" in you: ${listJoin(asc.keywords.slice(0, 3))}. What really pushes from behind is ${R.zh} (governs ${R.plainKw}), which ${stateText(ruler, rulerTone)}. It leans toward the area of "${houseOf(rulerPos.house).plainTopic}", so that is where your energy often goes.`,
          },
          {
            title: "Directions that suit you",
            body: `${SPIRIT_PLAIN[S.house - 1]} ${pick(["If you want to try, practise on a small project first and add more once you have results.", "You do not have to switch careers all at once; start by making a small piece of work in your spare time.", "Find a senior in this field and listen to the road they have walked."], S.house + n.ascSign)}`,
          },
          {
            title: plainTitles().love,
            body: `Your love life and your taste are led by Venus, which ${plainStateEn("venus")}. It sits in the area of "${houseOf(venusPos.house).plainTopic}", so that is where you fall for things most easily and put in the most. ${venusTone === "bad" ? pick(houseOf(venusPos.house).care, venusPos.sign) : pick(houseOf(venusPos.house).good, venusPos.sign)}`,
          },
          {
            title: "Your body and luck",
            body: `${FORTUNE_PLAIN[F.house - 1]} The Moon governs your mood and sleep, and it ${plainStateEn("moon")}. ${moonTone === "good" ? "Keeping your current routine is just right." : "Going to bed at the same time every night does more for you than any supplement."}`,
          },
          {
            title: "Worth watching",
            body: `${M.zh} (governs ${M.plainKw}) is the planet that needs a little more patience from you, and it ${stateText(malefic, maleficTone)}. It sits in the area of "${houseOf(mPos.house).plainTopic}", so if something comes up there, ${lcFirst(pick(houseOf(mPos.house).care, mPos.house + 3))}`,
          },
        ],
      },
      caveats: [
        ...(known ? [] : [UNKNOWN_TIME_NOTE(), "The Ascendant, houses and both Lots depend on the birth time, so treat them as a rough guide if it is unknown."]),
        "Houses are whole-sign: the entire sign of the Ascendant is house 1. Dignity counts only domicile, exaltation, detriment and fall (\"peregrine\" means none of these); triplicity, terms and decans are not counted.",
        "A day or night chart is decided by the geometric altitude of the Sun's centre (above the horizon is a day chart). The Lord of the Year is worked out from the age you have reached, and changes at each birthday.",
        "This page uses only the seven classical planets; Uranus, Neptune and Pluto are not part of Hellenistic astrology.",
      ],
      visual: {
        asc: n.asc,
        ascSign: n.ascSign,
        day: n.day,
        sunAlt: n.sunAlt,
        planets: TRAD_KEYS.map((k) => n.planets[k]),
        lots: n.lots,
        profection: { age, ...prof },
        chartRuler: ruler,
        sectLight: sect.light,
        benefic,
        malefic,
        unknownTime: !known,
      },
    };
  }

  return {
    id: "hellenistic",
    name: "希腊化占星",
    intro: "公元前后在亚历山大城成形的占星术：用整宫制、昼夜盘（宗派）、福点与精神点、传统七星和年度小限，读出一个人的一生与每一年。",
    origin: "古希腊",
    icon: "⚹︎",
    headline: `${sect.name} · 上升${asc.name} · 命主${R.zh}${known ? "" : "（时间未知）"}`,
    tagline: `${R.title}，${B.zh}护佑`,
    keywords: [sect.name, `命主${R.zh}`, ...R.kw.slice(0, 2), `福点${F.house}宫`],
    scores,
    element: R.wx,
    lucky: {
      colors: [...R.colors, ...B.colors.slice(0, 1)],
      numbers: [...new Set([...R.numbers, ...B.numbers])],
      directions: [...new Set([R.dir, B.dir])],
    },
    facts: [
      { label: "昼夜盘", value: `${sect.name}（太阳高度 ${n.sunAlt.toFixed(1)}°）` },
      { label: "上升 ASC", value: known ? `${asc.name} ${degInSign(n.asc)}` : "需出生时间" },
      { label: "命主星", value: `${R.glyph} ${R.zh} · 第 ${rulerPos.house} 宫 · ${DIGNITY_NAME[rulerPos.dignity]}` },
      { label: "福点", value: `${fmtPos(F.lon)} · 第 ${F.house} 宫` },
      { label: "精神点", value: `${fmtPos(S.lon)} · 第 ${S.house} 宫` },
      { label: "得时吉星", value: `${B.glyph} ${B.zh} · ${signName(n.planets[benefic].sign)} · 第 ${n.planets[benefic].house} 宫` },
      { label: "逆时凶星", value: `${M.glyph} ${M.zh} · ${signName(n.planets[malefic].sign)} · 第 ${n.planets[malefic].house} 宫` },
      { label: `本年小限（${age} 岁）`, value: `第 ${prof.house} 宫 · 年主星${L.zh}` },
    ],
    sections,
    plain,
    caveats: [
      ...(known ? [] : [UNKNOWN_TIME_NOTE(), "上升、宫位、福点和精神点都依赖出生时间，未知时间时仅供参考。"]),
      "宫位采用整宫制：上升所在的整个星座为第 1 宫。尊贵只计入庙、旺、陷、弱；不计三分性、界与十度区。",
      "昼夜盘以太阳中心的几何高度判断（高于地平线为日间盘）。年主星按“到达的岁数”换算，每到生日换一次。",
      "本页只使用七颗古典行星，天王星、海王星、冥王星不在希腊化占星的体系里。",
    ],
    visual: {
      asc: n.asc,
      ascSign: n.ascSign,
      day: n.day,
      sunAlt: n.sunAlt,
      planets: TRAD_KEYS.map((k) => n.planets[k]),
      lots: n.lots,
      profection: { age, ...prof },
      chartRuler: ruler,
      sectLight: sect.light,
      benefic,
      malefic,
      unknownTime: !known,
    },
  };
}

export const hellenistic: MethodFn<HellenisticVisual> = (chart) => buildHellenistic(chart, new Date());
