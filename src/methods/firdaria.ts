import type { Chart } from "../core/chart";
import { norm360 } from "../core/chart";
import {
  FIR_CYCLE,
  FIR_DAY,
  FIR_NIGHT,
  type FirPlanet,
  NODE_INFO,
  type NodeKey,
  SUB_SCENE,
  TASK,
} from "../data/firdaria";
import { CHALDEAN_ORDER, DIGNITY_NAME, HOUSES, TRAD_INFO, type Dignity, type Trad } from "../data/hellenistic";
import { ZODIAC } from "../data/zodiac";
import { degInSign, signOf } from "./astrology";
import {
  conditionLine,
  type Natal,
  natalOf,
  pick,
  placeScore,
  type StrengthTone,
  stateText,
  toneOfScore,
  weightOfScore,
  wholeSignHouse,
} from "./hellenistic";
import { type MethodFn, mixScores, shiftScores, UNKNOWN_TIME_NOTE } from "./types";

const YEAR_MS = 365.2425 * 86400000;

/** Mean lunar ascending node, tropical longitude in degrees (Meeus), from a Julian day. */
export function meanNodeLon(jd: number): number {
  const T = (jd - 2451545) / 36525;
  return norm360(125.0445479 - 1934.1362891 * T + 0.0020754 * T * T + (T * T * T) / 467441);
}

export const isNode = (p: FirPlanet): p is NodeKey => p === "northNode" || p === "southNode";

/** Display info for a major or sub ruler. */
export function firInfo(p: FirPlanet) {
  if (isNode(p)) {
    const n = NODE_INFO[p];
    return { zh: n.zh, glyph: n.glyph, plainKw: n.plainKw, stage: n.stage, title: n.title, colors: n.colors, numbers: n.numbers, dir: n.dir, scores: n.scores, kw: n.kw };
  }
  const t = TRAD_INFO[p];
  return { zh: t.zh, glyph: t.glyph, plainKw: t.plainKw, stage: t.stage, title: t.title, colors: t.colors, numbers: t.numbers, dir: t.dir, scores: t.scores, kw: t.kw };
}

/** Sub-period order: the major ruler first, then Chaldean order (descending from the ruler). */
export function subOrder(p: Trad): Trad[] {
  const i = CHALDEAN_ORDER.indexOf(p);
  return Array.from({ length: 7 }, (_, k) => CHALDEAN_ORDER[(i + k) % 7]!);
}

/** Add a possibly fractional number of years: whole years by calendar, the rest by mean year length. */
export function addYears(d: Date, years: number): Date {
  const whole = Math.floor(years);
  const out = new Date(d.getTime());
  out.setUTCFullYear(out.getUTCFullYear() + whole);
  return new Date(out.getTime() + (years - whole) * YEAR_MS);
}

export interface FirSub {
  planet: Trad;
  start: Date;
  end: Date;
  startAge: number;
  endAge: number;
}

export interface FirPeriod {
  planet: FirPlanet;
  years: number;
  start: Date;
  end: Date;
  startAge: number;
  endAge: number;
  cycle: number;
  subs: FirSub[];
}

/** All major and sub-periods for `cycles` repeats of the 75-year sequence. */
export function firdariaTimeline(birth: Date, day: boolean, cycles = 2): FirPeriod[] {
  const seq = day ? FIR_DAY : FIR_NIGHT;
  const out: FirPeriod[] = [];
  let age = 0;
  for (let c = 0; c < cycles; c++)
    for (const [planet, years] of seq) {
      const sub = years / 7;
      const subs: FirSub[] = isNode(planet)
        ? []
        : subOrder(planet).map((p, k) => ({
            planet: p,
            startAge: age + k * sub,
            endAge: age + (k + 1) * sub,
            start: addYears(birth, age + k * sub),
            end: addYears(birth, age + (k + 1) * sub),
          }));
      out.push({ planet, years, startAge: age, endAge: age + years, start: addYears(birth, age), end: addYears(birth, age + years), cycle: c, subs });
      age += years;
    }
  return out;
}

export function firdariaAt(tl: FirPeriod[], date: Date): { major: FirPeriod; majorIndex: number; sub: FirSub | null; subIndex: number } {
  const t = date.getTime();
  let majorIndex = tl.findIndex((m) => t >= m.start.getTime() && t < m.end.getTime());
  if (majorIndex < 0) majorIndex = t < tl[0]!.start.getTime() ? 0 : tl.length - 1;
  const major = tl[majorIndex]!;
  const subIndex = major.subs.findIndex((s) => t >= s.start.getTime() && t < s.end.getTime());
  const sub = major.subs.length ? major.subs[subIndex >= 0 ? subIndex : t < major.start.getTime() ? 0 : major.subs.length - 1]! : null;
  return { major, majorIndex, sub, subIndex };
}

// ───────────────────────── Natal condition

export interface FirNatal {
  natal: Natal;
  nodes: Record<NodeKey, { lon: number; sign: number; house: number }>;
}

export function firNatal(chart: Chart): FirNatal {
  const natal = natalOf(chart);
  const north = meanNodeLon(chart.julianDay);
  const mk = (lon: number) => ({ lon, sign: signOf(lon), house: wholeSignHouse(lon, natal.ascSign) });
  return { natal, nodes: { northNode: mk(north), southNode: mk(norm360(north + 180)) } };
}

export interface FirCond {
  planet: FirPlanet;
  sign: number;
  house: number;
  /** Null for the nodes: they have no dignity. */
  dignity: Dignity | null;
  tone: StrengthTone;
  score: number;
  retro: boolean;
  line: string;
}

export function firCond(p: FirPlanet, fn: FirNatal): FirCond {
  if (isNode(p)) {
    const pos = fn.nodes[p];
    return {
      planet: p,
      sign: pos.sign,
      house: pos.house,
      dignity: null,
      tone: p === "northNode" ? "good" : "mixed",
      score: p === "northNode" ? 1.5 : 0,
      retro: true,
      line: `${NODE_INFO[p].zh}落${ZODIAC[pos.sign]!.name}${degInSign(pos.lon)}，位于第${pos.house}宫「${HOUSES[pos.house - 1]!.topic.replace(/，.*$/, "")}」（平均交点，无庙旺陷弱）`,
    };
  }
  const pos = fn.natal.planets[p];
  const score = placeScore(p, fn.natal);
  return { planet: p, sign: pos.sign, house: pos.house, dignity: pos.dignity, tone: toneOfScore(score), score, retro: pos.retro, line: conditionLine(p, fn.natal) };
}

export const weightOf = (c: FirCond): 1 | 2 | 3 => (isNode(c.planet) ? 2 : weightOfScore(c.score));

// ───────────────────────── Plain text

const houseOf = (h: number) => HOUSES[h - 1]!;

/** Plain reading of a major period. */
export function majorPlain(c: FirCond, seed: number): string {
  const info = firInfo(c.planet);
  const H = houseOf(c.house);
  if (isNode(c.planet)) {
    const N = NODE_INFO[c.planet];
    return `这是一个${info.stage}。它在你出生时落在「${H.plainTopic}」这个领域，所以这方面的变化会特别明显。${pick(N.actions, seed)}${pick(N.care, seed + 1)}`;
  }
  const T = TRAD_INFO[c.planet as Trad];
  const act = c.tone === "bad" ? pick(H.care, seed) : pick(H.good, seed);
  const tail = c.tone === "mixed" ? `不过${pick(H.care, seed + 1)}` : "";
  return `这是一个${info.stage}。${T.zh}（管${T.plainKw}）。它${stateText(c.planet as Trad, c.tone)}。它在你出生时落在「${H.plainTopic}」这个领域，所以这方面的事会特别突出。${act}${tail}`;
}

/** Plain reading of a sub-period. Nodes have none. */
export function subPlain(c: FirCond): string {
  const T = TRAD_INFO[c.planet as Trad];
  return `这一小段由${T.zh}（管${T.plainKw}）值班。${SUB_SCENE[c.planet]}它${stateText(c.planet as Trad, c.tone)}。`;
}

// ───────────────────────── Method

const ymd = (d: Date) => `${d.getUTCFullYear()}年${d.getUTCMonth() + 1}月`;
const fmtAge = (a: number) => (Number.isInteger(a) ? String(a) : a.toFixed(1));

export interface FirdariaVisual {
  day: boolean;
  cycle: number;
  ageNow: number;
  birthYear: number;
  periods: {
    planet: FirPlanet;
    years: number;
    startAge: number;
    endAge: number;
    startYear: number;
    endYear: number;
    subs: { planet: Trad; startAge: number; endAge: number }[];
  }[];
  majorIndex: number;
  subIndex: number;
}

export function buildFirdaria(chart: Chart, now: Date): ReturnType<MethodFn<FirdariaVisual>> {
  const fn = firNatal(chart);
  const known = chart.input.timeKnown;
  const day = fn.natal.day;
  const tl = firdariaTimeline(chart.utc, day, 3);
  const cur = firdariaAt(tl, now);
  const { major, sub } = cur;
  const frac = Math.max(0, Math.min(1, (now.getTime() - major.start.getTime()) / (major.end.getTime() - major.start.getTime())));
  const ageNow = major.startAge + frac * major.years;
  const mc = firCond(major.planet, fn);
  const sc = sub ? firCond(sub.planet, fn) : null;
  const M = firInfo(major.planet);
  const S = sub ? firInfo(sub.planet) : null;
  const next = tl[cur.majorIndex + 1]!;
  const NX = firInfo(next.planet);
  const cycle = major.cycle;
  const cyclePeriods = tl.filter((p) => p.cycle === cycle);
  const subMonths = Math.round(((major.years / 7) * 12));
  const seq = (day ? FIR_DAY : FIR_NIGHT).map(([p, y]) => `${firInfo(p).zh}${y}`).join("、");

  const tdelta = mc.tone === "good" ? 3 : mc.tone === "bad" ? -3 : 0;
  const scores = shiftScores(mixScores([[M.scores, 2], ...(S ? ([[S.scores, 1]] as [typeof M.scores, number][]) : [])]), { career: tdelta, wealth: tdelta, health: Math.min(0, tdelta) });

  const sections = [
    {
      title: `法达序列 · ${day ? "日间盘" : "夜间盘"}`,
      body: `法达（Firdaria）是波斯与阿拉伯占星家常用的行运法：把 75 年分成 9 个大限，每个大限由一颗行星（或月交点）主管，75 岁后再循环。你的盘是${day ? "日间盘，序列从太阳开始" : "夜间盘，序列从月亮开始"}：${seq}（年）。大限里的七颗行星各分 7 个等长的小限，第一个小限由大限星自己主管，其后依迦勒底序（${CHALDEAN_ORDER.map((p) => TRAD_INFO[p].zh).join("→")}）循环；南北交点的大限太短，不再细分。`,
    },
    {
      title: `当前大限 · ${M.glyph} ${M.zh}（${fmtAge(major.startAge)}–${fmtAge(major.endAge)} 岁）`,
      body: `${ymd(major.start)}至${ymd(major.end)}，共 ${major.years} 年，主题是${M.stage}。${mc.line}。${isNode(major.planet) ? `${NODE_INFO[major.planet].zh}主关键词：${NODE_INFO[major.planet].kw.join("、")}。` : `${M.zh}${stateText(major.planet as Trad, mc.tone)}。`}这个大限的功课是：${TASK[major.planet]}。`,
    },
    sub && sc && S
      ? {
          title: `当前小限 · ${S.glyph} ${S.zh}（${ymd(sub.start)}–${ymd(sub.end)}）`,
          body: `大限 ${M.zh} 中的第 ${cur.subIndex + 1}/7 个小限，每段约 ${subMonths} 个月。${sc.line}。小限星${S.zh}${stateText(sub.planet, sc.tone)}，${sub.planet === major.planet ? "与大限星相同，主题纯粹而集中。" : `与大限星${M.zh}合参，大限定基调，小限添细节。`}`,
        }
      : { title: "当前小限", body: `${M.zh}大限仅 ${major.years} 年，传统上不再细分小限。` },
    {
      title: "全程一览",
      body: cyclePeriods.map((p) => `${firInfo(p.planet).zh} ${fmtAge(p.startAge)}–${fmtAge(p.endAge)} 岁（${p.start.getUTCFullYear()}–${p.end.getUTCFullYear()}）`).join("；") + "。",
    },
    {
      title: `下一站 · ${NX.zh}大限`,
      body: `${ymd(major.end)}（约 ${fmtAge(major.endAge)} 岁）起进入${NX.zh}大限，共 ${next.years} 年，主题是${NX.stage}。`,
    },
  ];

  const plain = {
    summary: `${known ? "" : "你没有填出生时间，白天出生还是夜里出生是按中午估的，下面的顺序只能当参考。"}波斯占星家把人生分成一段一段的“大阶段”。你现在大约 ${Math.floor(ageNow)} 岁，正走在${M.zh}（管${M.plainKw}）主管的阶段里：${M.stage}。${S ? `眼下的小阶段由${S.zh}值班。` : ""}`,
    sections: [
      {
        title: "现在的大阶段",
        body: `这个阶段大约持续 ${major.years} 年（${major.start.getUTCFullYear()}–${major.end.getUTCFullYear()} 年）。${majorPlain(mc, ageNow)}`,
      },
      {
        title: "眼下的小阶段",
        body: sub && sc ? `${subPlain(sc)}这一小段大约 ${subMonths} 个月，${ymd(sub.end)}前后会换到下一个。` : "你现在所处的大阶段比较短，不再细分小阶段，把它当作一次集中的“换挡”就好。",
      },
      {
        title: "这阶段的功课",
        body: `这段时间的功课是${TASK[major.planet]}。${sub && sc && sub.planet !== major.planet ? `放到眼下的小阶段里，就是${TASK[sub.planet]}。` : ""}`,
      },
      {
        title: "需要留意",
        body: mc.tone === "bad" || (sc && sc.tone === "bad")
          ? `当前阶段里有一颗星状态偏弱，容易在“${houseOf(mc.tone === "bad" ? mc.house : sc!.house).plainTopic}”这方面多费力。${pick(houseOf(mc.tone === "bad" ? mc.house : sc!.house).care, ageNow)}`
          : `整体没有特别需要提防的地方，只要别把节奏排得太满。${pick(houseOf(mc.house).care, ageNow + 2)}`,
      },
      {
        title: "下一站",
        body: `大约在 ${ymd(major.end)}，你会进入${NX.zh}（管${NX.plainKw}）的阶段：${NX.stage}。可以提前几个月，把手上的事收个尾。`,
      },
    ],
  };

  return {
    id: "firdaria",
    name: "波斯法达",
    intro: "波斯与阿拉伯占星的“人生分段法”：把 75 年依次交给太阳、月亮与五星（以及月交点）主管，每一段再细分为 7 个小限，告诉你此刻正处在哪一幕。",
    origin: "波斯",
    icon: "☊︎",
    headline: `${M.zh}大限${S ? ` · ${S.zh}小限` : ""}（${day ? "日" : "夜"}间序列）`,
    tagline: M.stage.replace("的阶段", ""),
    keywords: [`${M.zh}大限`, ...(S ? [`${S.zh}小限`] : []), day ? "日间序列" : "夜间序列", ...M.kw.slice(0, 2)],
    scores,
    element: isNode(major.planet) ? undefined : TRAD_INFO[major.planet].wx,
    lucky: {
      colors: [...new Set([...M.colors, ...(S ? S.colors.slice(0, 1) : [])])],
      numbers: [...new Set([...M.numbers, ...(S ? S.numbers : [])])],
      directions: [...new Set([M.dir, ...(S ? [S.dir] : [])])],
    },
    facts: [
      { label: "法达序列", value: day ? "日间盘 · 太阳起" : "夜间盘 · 月亮起" },
      { label: "当前大限", value: `${M.glyph} ${M.zh} · ${fmtAge(major.startAge)}–${fmtAge(major.endAge)} 岁（${major.start.getUTCFullYear()}–${major.end.getUTCFullYear()}）` },
      { label: "当前小限", value: sub && S ? `${S.glyph} ${S.zh} · ${ymd(sub.start)}–${ymd(sub.end)}` : "无（交点大限不分小限）" },
      { label: "大限星本命", value: `${ZODIAC[mc.sign]!.name} · 第 ${mc.house} 宫${mc.dignity ? ` · ${DIGNITY_NAME[mc.dignity]}` : ""}` },
      { label: "下一大限", value: `${NX.glyph} ${NX.zh} · ${ymd(major.end)}起` },
    ],
    sections,
    plain,
    caveats: [
      ...(known ? [] : [UNKNOWN_TIME_NOTE, "日夜盘（序列从太阳还是月亮开始）和宫位依赖出生时间，未知时间时仅供参考。"]),
      "序列采用阿布·马舍（Abu Ma'shar）的主流版本：两种序列中南北交点都排在七星之后（日间盘 70–75 岁，夜间盘同样 70–75 岁）。个别版本（如依 Bonatti 字面理解）会把夜间盘的交点插在火星之后，结果不同。",
      "月交点使用平均交点，不计真交点的摆动；交点大限不再细分小限。大限与小限的日期以 365.2425 日为一年，从出生时刻起算，与实际生日相差在数小时内。",
    ],
    visual: {
      day,
      cycle,
      ageNow,
      birthYear: chart.utc.getUTCFullYear(),
      periods: cyclePeriods.map((p) => ({
        planet: p.planet,
        years: p.years,
        startAge: p.startAge,
        endAge: p.endAge,
        startYear: p.start.getUTCFullYear(),
        endYear: p.end.getUTCFullYear(),
        subs: p.subs.map((s) => ({ planet: s.planet, startAge: s.startAge, endAge: s.endAge })),
      })),
      majorIndex: cyclePeriods.indexOf(major),
      subIndex: cur.subIndex,
    },
  };
}

export const firdaria: MethodFn<FirdariaVisual> = (chart) => buildFirdaria(chart, new Date());
