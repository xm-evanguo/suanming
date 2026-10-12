import * as Astro from "astronomy-engine";
import { type Chart, DAY_MS, norm360, tzOffsetMinutes } from "../core/chart";
import { DECAN_FLAVOR, FACE_START, FACE_TECH, TRIO_TEXT, WEEK_HISTORY } from "../data/chaldean";
import { CHALDEAN_ORDER, TRAD_INFO, type Trad, WEEKDAY_RULER, WEEKDAY_ZH } from "../data/hellenistic";
import { ZODIAC } from "../data/zodiac";
import { pick } from "./hellenistic";
import { type MethodFn, mixScores, UNKNOWN_TIME_NOTE } from "./types";

/** Ruler of a Chaldean face (decan) for an ecliptic longitude. Aries 0-10 is Mars. */
export function faceRuler(lon: number): Trad {
  const d = Math.floor(norm360(lon) / 10) % 36;
  return CHALDEAN_ORDER[(CHALDEAN_ORDER.indexOf(FACE_START) + d) % 7]!;
}

export interface PlanetHour {
  /** 0-11 are day hours, 12-23 are night hours. */
  index: number;
  isDay: boolean;
  ruler: Trad;
  start: Date;
  end: Date;
}

/** 12 unequal day hours (sunrise to sunset) and 12 unequal night hours (sunset to next sunrise). The first hour belongs to the day ruler. */
export function planetaryHours(sunrise: Date, sunset: Date, nextSunrise: Date, dayRuler: Trad): PlanetHour[] {
  const base = CHALDEAN_ORDER.indexOf(dayRuler);
  const dayLen = (sunset.getTime() - sunrise.getTime()) / 12;
  const nightLen = (nextSunrise.getTime() - sunset.getTime()) / 12;
  return Array.from({ length: 24 }, (_, i) => {
    const isDay = i < 12;
    const t0 = isDay ? sunrise.getTime() + i * dayLen : sunset.getTime() + (i - 12) * nightLen;
    const len = isDay ? dayLen : nightLen;
    return { index: i, isDay, ruler: CHALDEAN_ORDER[(base + i) % 7]!, start: new Date(t0), end: new Date(t0 + len) };
  });
}

export interface SunTimes {
  sunrise: Date;
  sunset: Date;
  nextSunrise: Date;
  /** True when the Sun does not rise and set (polar): we fall back to 06:00 / 18:00 local mean time. */
  estimated: boolean;
}

const MIN = 60000;

/** The planetary day containing the birth instant: last sunrise at or before birth, the following sunset and sunrise. */
export function sunTimes(chart: Chart): SunTimes {
  const obs = new Astro.Observer(chart.input.city.lat, chart.input.city.lon, 0);
  const t = chart.utc.getTime();
  const search = (dir: number, from: number, days: number): Date | undefined => Astro.SearchRiseSet(Astro.Body.Sun, obs, dir, new Date(from), days)?.date;
  let rise: Date | undefined = search(+1, t - 36 * 3600000, 3);
  if (rise) {
    for (let i = 0; i < 4; i++) {
      const next: Date | undefined = search(+1, rise.getTime() + MIN, 3);
      if (!next || next.getTime() > t) break;
      rise = next;
    }
    if (rise.getTime() <= t) {
      const set = search(-1, rise.getTime(), 2);
      const nextRise = search(+1, rise.getTime() + MIN, 3);
      if (set && nextRise && set.getTime() < nextRise.getTime() && nextRise.getTime() > t) return { sunrise: rise, sunset: set, nextSunrise: nextRise, estimated: false };
    }
  }
  // Fallback: 06:00 local mean time.
  const lmtShift = chart.input.city.lon * 4 * MIN;
  const day0 = Date.UTC(chart.utc.getUTCFullYear(), chart.utc.getUTCMonth(), chart.utc.getUTCDate(), 6) - lmtShift;
  let r = day0;
  while (r > t) r -= DAY_MS;
  while (r + DAY_MS <= t) r += DAY_MS;
  return { sunrise: new Date(r), sunset: new Date(r + 12 * 3600000), nextSunrise: new Date(r + DAY_MS), estimated: true };
}

/** Local clock label HH:MM in an IANA zone. */
export function localHM(ms: number, tz: string): string {
  const d = new Date(ms + tzOffsetMinutes(ms, tz) * MIN);
  return `${String(d.getUTCHours()).padStart(2, "0")}:${String(d.getUTCMinutes()).padStart(2, "0")}`;
}

/** Weekday (0 = Sunday) of the local civil date of an instant. */
export function localWeekday(ms: number, tz: string): number {
  return new Date(ms + tzOffsetMinutes(ms, tz) * MIN).getUTCDay();
}

export interface ChaldeanVisual {
  dayRuler: Trad;
  weekday: number;
  hours: { index: number; isDay: boolean; ruler: Trad; start: string; end: string; f0: number; f1: number }[];
  birthHour: number;
  /** Position of the birth instant in the planetary day, 0-1 from sunrise. */
  birthFrac: number;
  sunrise: string;
  sunset: string;
  decan: { index: number; number: number; sign: number; ruler: Trad };
  unknownTime: boolean;
  estimated: boolean;
}

const isBenefic = (p: Trad) => p === "jupiter" || p === "venus";
const isMalefic = (p: Trad) => p === "saturn" || p === "mars";

export const chaldean: MethodFn<ChaldeanVisual> = (chart) => {
  const tz = chart.input.city.tz;
  const known = chart.input.timeKnown;
  const st = sunTimes(chart);
  const weekday = localWeekday(st.sunrise.getTime(), tz);
  const dayRuler = WEEKDAY_RULER[weekday]!;
  const hours = planetaryHours(st.sunrise, st.sunset, st.nextSunrise, dayRuler);
  const t = chart.utc.getTime();
  const birthHour = Math.max(0, hours.findIndex((x) => t >= x.start.getTime() && t < x.end.getTime()));
  const hr = hours[birthHour]!;
  const total = st.nextSunrise.getTime() - st.sunrise.getTime();
  const frac = (ms: number) => (ms - st.sunrise.getTime()) / total;

  const sunLon = chart.planets.sun.lon;
  const decanIndex = Math.floor(norm360(sunLon) / 10);
  const sunSign = Math.floor(decanIndex / 3);
  const decanNo = (decanIndex % 3) + 1;
  const decanRuler = faceRuler(sunLon);

  const D = TRAD_INFO[dayRuler];
  const H = TRAD_INFO[hr.ruler];
  const F = TRAD_INFO[decanRuler];
  const sign = ZODIAC[sunSign]!;
  const wdName = WEEKDAY_ZH[weekday]!;

  const trio: Trad[] = known ? [dayRuler, hr.ruler, decanRuler] : [dayRuler, decanRuler];
  const nB = trio.filter(isBenefic).length;
  const nM = trio.filter(isMalefic).length;
  const repeated = new Set(trio).size < trio.length;
  const trioText = `${nB > nM ? TRIO_TEXT.soft : nM > nB ? TRIO_TEXT.hard : TRIO_TEXT.even}${repeated ? TRIO_TEXT.repeat : ""}`;

  const scores = mixScores([[D.scores, 2], [F.scores, 1], ...(known ? ([[H.scores, 1.5]] as [typeof D.scores, number][]) : [])]);
  const hourWord = hr.isDay ? "白天" : "夜晚";
  const hourNo = (hr.index % 12) + 1;
  const rise = localHM(st.sunrise.getTime(), tz);
  const set = localHM(st.sunset.getTime(), tz);

  const unk = known ? "" : "（你没有填出生时间，这一项只能当参考）";
  return {
    id: "chaldean",
    name: "迦勒底七曜",
    intro: "古罗马流传的七曜体系：一周七天的名字就来自这里。每一天、每一个小时、太阳所在的每 10 度，都由七颗古典行星轮流守护。",
    origin: "古罗马",
    icon: D.glyph,
    headline: `${wdName} · ${D.zh}日${known ? ` · ${H.zh}时` : ""} · 太阳${sign.name}${decanNo}旬`,
    tagline: D.title.split("·")[1]!.trim(),
    keywords: [`${D.zh}日`, ...(known ? [`${H.zh}时`] : []), `${F.zh}之面`, ...D.kw.slice(0, 2)],
    scores,
    element: D.wx,
    lucky: {
      colors: [...new Set([...D.colors, ...F.colors.slice(0, 1)])],
      numbers: [...new Set([...D.numbers, ...F.numbers])],
      directions: [...new Set([D.dir, F.dir])],
    },
    facts: [
      { label: "出生星期", value: `${wdName}（行星日从日出起算）` },
      { label: "日主星", value: `${D.glyph} ${D.zh}` },
      { label: "日出 / 日落", value: `${rise} / ${set}${st.estimated ? "（极地估算）" : ""}` },
      { label: "行星时", value: `${hourWord}第 ${hourNo} 时 · ${hr.ruler === dayRuler ? "同日主星 · " : ""}${H.glyph} ${H.zh}${known ? "" : "（时间未知，仅供参考）"}` },
      { label: "太阳十度区", value: `${sign.name} ${decanNo}/3 · ${F.glyph} ${F.zh}之面` },
    ],
    sections: [
      {
        title: `日主星 · ${D.zh}`,
        body: `七曜的一天从日出开始，不是从午夜。你出生的行星日是${wdName}，日主星是${D.zh}（${D.kw.join("、")}）。${D.zh}日适合${D.dayText}。${st.estimated ? "你所在的纬度这天没有常规的日出日落，这里按当地 06:00 起算。" : `当天日出 ${rise}、日落 ${set}。`}`,
      },
      {
        title: `行星时 · ${hourWord}第 ${hourNo} 时`,
        body: `把日出到日落平分成 12 份是白天的 12 小时，日落到次日日出平分成 12 份是夜晚的 12 小时，所以夏天白天的“小时”更长。第一个小时属于日主星，之后按土、木、火、日、金、水、月的迦勒底序依次轮换。你出生在${localHM(hr.start.getTime(), tz)}–${localHM(hr.end.getTime(), tz)} 这一时，守护星是${H.zh}（${H.kw.join("、")}）。这类时辰${H.hourText}。${unk}`,
      },
      {
        title: `太阳十度区 · ${F.zh}之面`,
        body: `黄道每 10 度为一个“面”（Face），共 36 个，从白羊座起第一面归火星，之后沿迦勒底序往下排。你的太阳在${sign.name}第 ${decanNo} 个十度，由${F.zh}守护。${FACE_TECH[decanRuler]}。`,
      },
      { title: "三星合参", body: `日主星${D.zh}${known ? `、时主星${H.zh}` : ""}、面主星${F.zh}。${trioText}` },
      { title: "一周七天的由来", body: WEEK_HISTORY },
    ],
    plain: {
      summary: `你出生在${wdName}，古罗马人认为这一天由${D.zh}（管${D.plainKw}）守护。${known ? `出生那一刻的“小时”由${H.zh}值班，` : ""}你的太阳星座里还带着${F.zh}的味道。把这几颗星放在一起，就是你最基本的气质底色。`,
      sections: [
        { title: "你出生那天的星", body: `${D.zh}管着${wdName}，所以你身上多少有点“${D.plainKw}”的影子。每周的${wdName}可以当成你的主场日：${D.dayText}。` },
        {
          title: "出生那一刻的星",
          body: known
            ? `你出生的那一个小时由${H.zh}值班（管${H.plainKw}）。${H.zh}的小时${H.hourText}，想做相关的事，可以挑这类时段试试。${hr.ruler === dayRuler ? `而且它和出生那天的守护星是同一颗，${D.zh}的气质在你身上会更明显。` : ""}`
            : `没有出生时间，我们算不出你出生那一小时由哪颗星值班。日主星${D.zh}那部分仍然有效，想看这一部分，可以向家人问问出生时间。`,
        },
        { title: "你的太阳带着谁的味道", body: DECAN_FLAVOR[decanRuler] },
        { title: "三颗星合起来", body: trioText },
        {
          title: "可以马上试的小习惯",
          body: `每周${wdName}，${pick([`把最重要的一件事放在这天做：${D.dayText.split("，")[0]}。`, `给自己留一小段时间，${D.dayText.split("，")[0]}。`, `这天适合${D.dayText.split("，")[0]}，其他日子可以放松一点。`], weekday + decanIndex)}`,
        },
      ],
    },
    caveats: [
      ...(known ? [] : [UNKNOWN_TIME_NOTE, "行星日和太阳十度区不受影响，但行星时依赖出生时间，仅供参考。"]),
      "行星日从当地日出起算：日出前出生的人属于前一天。日出日落按几何地平线及标准大气折射计算（不含海拔）。",
      "太阳十度区采用迦勒底面（Chaldean Faces）：白羊座 0–10° 为火星，之后按土、木、火、日、金、水、月循环。",
    ],
    visual: {
      dayRuler,
      weekday,
      hours: hours.map((x) => ({
        index: x.index,
        isDay: x.isDay,
        ruler: x.ruler,
        start: localHM(x.start.getTime(), tz),
        end: localHM(x.end.getTime(), tz),
        f0: frac(x.start.getTime()),
        f1: frac(x.end.getTime()),
      })),
      birthHour,
      birthFrac: Math.max(0, Math.min(1, frac(t))),
      sunrise: rise,
      sunset: set,
      decan: { index: decanIndex, number: decanNo, sign: sunSign, ruler: decanRuler },
      unknownTime: !known,
      estimated: st.estimated,
    },
  };
};
