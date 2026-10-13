import * as Astro from "astronomy-engine";
import { norm360 } from "../core/chart";
import { NAKSHATRAS, RASHI } from "../data/nakshatra";
import { PLAIN_DASHA } from "../data/plain-vedic";
import { plainProfileSections, profileLucky, profileSections } from "./profile";
import { type MethodFn, plainTitles, UNKNOWN_TIME_NOTE } from "./types";
import { isEn, lcFirst } from "../i18n";
import { LORD_EN } from "../data/en/nakshatra";
import { methodName } from "./names";

/** A dasha lord's name for display: the Chinese key as it is, or the English planet name. */
export const lordName = (lord: string) => (isEn() ? (LORD_EN[lord] ?? lord) : lord);

/** Lahiri (Chitrapaksha) ayanamsa, degrees. Linear model: 23.853° at J2000, 50.2788″ per year. */
export function lahiri(date: Date): number {
  const years = Astro.MakeTime(date).tt / 365.25;
  return 23.853 + (years * 50.2788) / 3600;
}

const NAK_SPAN = 360 / 27;
/** Vimshottari lords in order from Ashwini, with their dasha length in years. */
export const DASHA: { lord: string; years: number }[] = [
  { lord: "计都", years: 7 },
  { lord: "金星", years: 20 },
  { lord: "太阳", years: 6 },
  { lord: "月亮", years: 10 },
  { lord: "火星", years: 7 },
  { lord: "罗睺", years: 18 },
  { lord: "木星", years: 16 },
  { lord: "土星", years: 19 },
  { lord: "水星", years: 17 },
];

export interface VedicVisual {
  nakshatra: number;
  pada: number;
  moonSid: number;
  sunSid: number;
  lagnaSid: number;
  ayanamsa: number;
  dashas: { lord: string; start: number; end: number }[];
}

export const vedic: MethodFn<VedicVisual> = (chart) => {
  const ayanamsa = lahiri(chart.utc);
  const moonSid = norm360(chart.planets.moon.lon - ayanamsa);
  const sunSid = norm360(chart.planets.sun.lon - ayanamsa);
  const lagnaSid = norm360(chart.asc - ayanamsa);
  const nakshatra = Math.floor(moonSid / NAK_SPAN);
  const within = moonSid - nakshatra * NAK_SPAN;
  const pada = Math.floor(within / (NAK_SPAN / 4)) + 1;
  const n = NAKSHATRAS[nakshatra]!;

  // Vimshottari: the first dasha is the nakshatra lord's, with only the unelapsed fraction remaining.
  const first = nakshatra % 9;
  const birthYear = chart.utc.getUTCFullYear() + chart.utc.getUTCMonth() / 12 + chart.utc.getUTCDate() / 365;
  let cursor = birthYear;
  const dashas: VedicVisual["dashas"] = [];
  for (let i = 0; i < 9; i++) {
    const d = DASHA[(first + i) % 9]!;
    const len = i === 0 ? d.years * (1 - within / NAK_SPAN) : d.years;
    dashas.push({ lord: d.lord, start: cursor, end: cursor + len });
    cursor += len;
  }
  const now = new Date().getFullYear() + new Date().getMonth() / 12;
  const current = dashas.find((d) => now >= d.start && now < d.end);
  const rashi = (lon: number) => RASHI[Math.floor(lon / 30)]!;
  const known = chart.input.timeKnown;

  const next = current ? dashas[dashas.indexOf(current) + 1] : undefined;
  const base = plainProfileSections(n, `印度占星看的是出生时月亮在天上的位置。月亮走过的天区被分成二十七段，叫“月宿”，你出生时月亮在「${n.name}」这一段，它代表你的内在气质。`);
  const stageLine = current
    ? `你现在大约处在${current.lord}主管的人生阶段（到 ${Math.floor(current.end)} 年左右）。这个阶段的主题是${PLAIN_DASHA[current.lord] ?? ""}${next ? `之后会进入${next.lord}主管的阶段，主题是${PLAIN_DASHA[next.lord] ?? ""}` : ""}`
    : "";

  if (isEn()) {
    const stageEn = current
      ? `You are now roughly in the life stage ruled by ${lordName(current.lord)} (until about ${Math.floor(current.end)}). The theme of this stage is ${lcFirst(PLAIN_DASHA[current.lord] ?? "")}${next ? ` After that you enter the stage ruled by ${lordName(next.lord)}, whose theme is ${lcFirst(PLAIN_DASHA[next.lord] ?? "")}` : ""}`
      : "";
    const baseEn = plainProfileSections(n, `Indian astrology looks at where the Moon stood in the sky when you were born. The Moon's path is split into 27 segments called \"nakshatras\" (lunar mansions). At your birth the Moon was in ${n.name}, which stands for your inner nature.`);
    return {
      id: "vedic",
      name: methodName("vedic"),
      intro: "India's Jyotish, the \"science of light\": it uses the sidereal zodiac and takes the Moon's position among the 27 lunar mansions (nakshatras) as the imprint of the soul.",
      origin: "印度",
      icon: "ॐ",
      headline: `Nakshatra · ${n.name}`,
      tagline: `Pada ${pada} · ruled by ${n.ruler}`,
      keywords: n.keywords,
      scores: n.scores,
      element: n.element,
      lucky: profileLucky(n),
      facts: [
        { label: "Ayanamsa", value: `${ayanamsa.toFixed(2)}° (Lahiri)` },
        { label: "Moon (sidereal)", value: `${moonSid.toFixed(2)}° · ${rashi(moonSid)}` },
        { label: "Sun (sidereal)", value: rashi(sunSid) },
        { label: "Ascendant (Lagna)", value: known ? rashi(lagnaSid) : "Needs birth time" },
        { label: "Current dasha", value: current ? `${lordName(current.lord)} dasha (until ${Math.floor(current.end)})` : "—" },
      ],
      sections: [
        { title: `${n.sanskrit} · ${n.symbol}`, body: `Ruling deity: ${n.deity}. Ruling planet: ${n.ruler}. Your Moon is in pada ${pada} of this nakshatra.` },
        ...profileSections(n),
        {
          title: "Moon sign (Chandra Rashi)",
          body: `In the sidereal zodiac your Moon is in ${rashi(moonSid)} and your Sun is in ${rashi(sunSid)}. Vedic astrology sits about ${Math.round(ayanamsa)}° behind Western astrology, so your Sun sign is often one sign \"back\".`,
        },
        {
          title: "Vimshottari dasha",
          body:
            dashas
              .slice(0, 6)
              .map((d) => `${lordName(d.lord)} ${Math.floor(d.start)}–${Math.floor(d.end)}`)
              .join(", ") + (current ? `. You are now in the ${lordName(current.lord)} dasha.` : "."),
        },
      ],
      plain: {
        summary: `Your nakshatra is ${n.name}, known as \"${n.title}\". Your traits in a few words: ${n.keywords.slice(0, 3).join(", ")}.${stageEn ? ` You have now reached the life stage ruled by ${lordName(current!.lord)}.` : ""}`,
        sections: [
          baseEn[0]!,
          baseEn[1]!,
          baseEn[2]!,
          baseEn[3]!,
          ...(stageEn ? [{ title: "Your life stage now", body: stageEn }] : []),
          {
            title: plainTitles().how,
            body: "Indian astrology uses a slightly different map of the sky from the Western one, so your sign may come out one sign off from the Western answer. It first finds which of the 27 segments the Moon was in at your birth, then follows a fixed order to work out which planet rules each stage of your life.",
          },
        ],
      },
      caveats: [...(known ? [] : [UNKNOWN_TIME_NOTE()]), "The ayanamsa is a linear Lahiri approximation, off by a few arc-minutes; near a nakshatra boundary you may fall into the neighbouring one."],
      visual: { nakshatra, pada, moonSid, sunSid, lagnaSid, ayanamsa, dashas },
    };
  }

  return {
    id: "vedic",
    name: "吠陀占星",
    intro: "印度的 Jyotish（光之学问）：使用恒星黄道，以月亮所在的二十七“月宿”（Nakshatra）为灵魂印记。",
    origin: "印度",
    icon: "ॐ",
    headline: `月宿 · ${n.name}`,
    tagline: `第 ${pada} 足 · 守护星${n.ruler}`,
    keywords: n.keywords,
    scores: n.scores,
    element: n.element,
    lucky: profileLucky(n),
    facts: [
      { label: "岁差 Ayanamsa", value: `${ayanamsa.toFixed(2)}°（Lahiri）` },
      { label: "月亮（恒星黄道）", value: `${moonSid.toFixed(2)}° · ${rashi(moonSid)}` },
      { label: "太阳（恒星黄道）", value: rashi(sunSid) },
      { label: "上升 Lagna", value: known ? rashi(lagnaSid) : "需出生时间" },
      { label: "当前大运", value: current ? `${current.lord}大运（至 ${Math.floor(current.end)} 年）` : "—" },
    ],
    sections: [
      { title: `${n.sanskrit} · ${n.symbol}`, body: `守护神：${n.deity}；守护星：${n.ruler}；你的月亮位于此宿第 ${pada} 足。` },
      ...profileSections(n),
      {
        title: "月亮星座（Chandra Rashi）",
        body: `在恒星黄道中，你的月亮落在 ${rashi(moonSid)}，太阳落在 ${rashi(sunSid)}。吠陀占星比西洋占星少约 ${Math.round(ayanamsa)}°，因此太阳星座常会“退后”一个。`,
      },
      {
        title: "Vimshottari 大运",
        body: dashas
          .slice(0, 6)
          .map((d) => `${d.lord} ${Math.floor(d.start)}–${Math.floor(d.end)}`)
          .join("，") + (current ? `。你正行${current.lord}大运。` : "。"),
      },
    ],
    plain: {
      summary: `你的月宿是「${n.name}」，属于「${n.title}」这一类。你的特点可以用几个词概括：${n.keywords.slice(0, 3).join("、")}。${stageLine ? `你现在走到了${current!.lord}主管的人生阶段。` : ""}`,
      sections: [
        base[0]!,
        base[1]!,
        base[2]!,
        base[3]!,
        ...(stageLine ? [{ title: "你现在的人生阶段", body: stageLine }] : []),
        {
          title: "这套方法怎么算的",
          body: "印度占星用的是和西方略有不同的天空坐标，所以同一个人的星座可能和西方说法差一个。它先找出你出生时月亮落在二十七段中的哪一段，再按一套固定的顺序，推算人生每个阶段由哪颗星主管。",
        },
      ],
    },
    caveats: [...(known ? [] : [UNKNOWN_TIME_NOTE()]), "岁差采用 Lahiri 线性近似，误差约数角分，接近月宿边界时可能落入相邻月宿。"],
    visual: { nakshatra, pada, moonSid, sunSid, lagnaSid, ayanamsa, dashas },
  };
};
