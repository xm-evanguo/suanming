import { DAY_SIGNS, TONES } from "../data/maya";
import { PLAIN_TONES } from "../data/plain-maya";
import { plainProfileSections, profileLucky, profileSections } from "./profile";
import { type MethodFn, plainTitles, shiftScores } from "./types";
import { isEn, lcFirst, listJoin } from "../i18n";
import { methodName } from "./names";

/** GMT correlation constant: JDN of the Long Count origin 0.0.0.0.0 (4 Ajaw 8 Kumk'u). */
export const GMT = 584283;

/** Julian Day Number of a Gregorian calendar date. */
export function jdn(y: number, m: number, d: number): number {
  const a = Math.floor((14 - m) / 12);
  const yy = y + 4800 - a;
  const mm = m + 12 * a - 3;
  return d + Math.floor((153 * mm + 2) / 5) + 365 * yy + Math.floor(yy / 4) - Math.floor(yy / 100) + Math.floor(yy / 400) - 32045;
}

export function tzolkin(y: number, m: number, d: number) {
  const days = jdn(y, m, d) - GMT;
  const tone = (((days + 3) % 13) + 13) % 13 + 1;
  const sign = (((days + 19) % 20) + 20) % 20;
  let kin = 0;
  for (let k = 1; k <= 260; k++) if ((k - 1) % 13 === tone - 1 && (k - 1) % 20 === sign) kin = k;
  const longCount = [144000, 7200, 360, 20, 1].reduce<{ parts: number[]; rest: number }>(
    (acc, unit) => ({ parts: [...acc.parts, Math.floor(acc.rest / unit)], rest: acc.rest % unit }),
    { parts: [], rest: days },
  ).parts;
  return { days, tone, sign, kin, longCount };
}

export interface MayaVisual {
  tone: number;
  sign: number;
  kin: number;
  longCount: number[];
}

export const maya: MethodFn<MayaVisual> = (chart) => {
  const { year, month, day } = chart.input;
  const t = tzolkin(year, month, day);
  const s = DAY_SIGNS[t.sign]!;
  const tone = TONES[t.tone - 1]!;
  const guide = DAY_SIGNS[(t.sign + 10) % 20]!;

  const base = plainProfileSections(s, `玛雅历把每一天配上20种“印记”（20种类型）和13种“音调”（13种做事节奏）。你出生那天的印记是「${s.name}」，也就是「${s.title}」这一类人。`);

  if (isEn()) {
    const base = plainProfileSections(s, `The Maya calendar gives every day one of 20 \"signs\" (20 types) and one of 13 \"tones\" (13 rhythms of working). The sign of the day you were born is \"${s.name}\", known as ${lcFirst(s.title)}.`);
    return {
      id: "maya",
      name: methodName("maya"),
      intro: "The sacred Tzolk'in calendar of the ancient Maya: 13 galactic tones × 20 solar day signs make a cosmic cycle of 260 days.",
      origin: "玛雅",
      icon: s.glyph,
      headline: `Kin ${t.kin} · ${t.tone} ${s.maya}`,
      tagline: `${s.name} · ${tone.name}`,
      keywords: [...s.keywords.slice(0, 4), ...tone.keywords.slice(0, 1)],
      scores: shiftScores(s.scores, { wisdom: t.tone === 13 || t.tone === 1 ? 3 : 0 }),
      element: s.element,
      lucky: profileLucky(s),
      facts: [
        { label: "Days since the Long Count origin", value: `${t.days.toLocaleString()} days` },
        { label: "Long Count", value: t.longCount.join(".") },
        { label: "Tzolk'in", value: `${t.tone} ${s.maya} (Kin ${t.kin}/260)` },
        { label: "Galactic tone", value: tone.name },
      ],
      sections: [
        ...profileSections(s, `${s.name} · `),
        { title: `Tone · ${tone.name}`, body: tone.text },
        { title: "The mirror opposite", body: `On the ring of 20 signs, the one facing you across the circle is \"${guide.name}\". It stands for the strength you are most likely to overlook, yet the one that makes you whole. ${guide.summary}` },
      ],
      plain: {
        summary: `Your sign is \"${s.name}\": ${lcFirst(s.title)}. ${s.summary} The key words for your working rhythm are ${listJoin(tone.keywords.slice(0, 2).map((k) => `\"${k}\"`))}.`,
        sections: [
          base[0]!,
          base[1]!,
          base[2]!,
          base[3]!,
          {
            title: "Your working rhythm and blind spot",
            body: `${PLAIN_TONES[t.tone - 1]} The type opposite you is \"${guide.name}\". It stands for the side of you that you are most likely to overlook, yet that makes you more whole. ${guide.summary}`,
          },
          {
            title: plainTitles().how,
            body: "The Maya had a sacred calendar that runs in a 260-day round: 20 signs and 13 tones, combined in turn. Your birth date gives this day's place in the round, and so your sign and tone. This uses the calculation most scholars agree on.",
          },
        ],
      },
      caveats: ["This uses the GMT correlation constant (584283) that most scholars accept, to work out the traditional Tzolk'in. The popular \"13 Moon / Dreamspell\" count is different, and its Kin numbers will differ."],
      visual: { tone: t.tone, sign: t.sign, kin: t.kin, longCount: t.longCount },
    };
  }

  return {
    id: "maya",
    name: "玛雅历",
    intro: "古玛雅的卓尔金神圣历：13 个银河音调 × 20 个太阳印记，组成 260 天的宇宙循环。",
    origin: "玛雅",
    icon: s.glyph,
    headline: `Kin ${t.kin} · ${t.tone} ${s.maya}`,
    tagline: `${s.name} · ${tone.name}`,
    keywords: [...s.keywords.slice(0, 4), ...tone.keywords.slice(0, 1)],
    scores: shiftScores(s.scores, { wisdom: t.tone === 13 || t.tone === 1 ? 3 : 0 }),
    element: s.element,
    lucky: profileLucky(s),
    facts: [
      { label: "距长历法原点", value: `${t.days.toLocaleString()} 天` },
      { label: "长历法", value: t.longCount.join(".") },
      { label: "卓尔金", value: `${t.tone} ${s.maya}（Kin ${t.kin}/260）` },
      { label: "银河音调", value: tone.name },
    ],
    sections: [
      ...profileSections(s, `${s.name} · `),
      { title: `音调 · ${tone.name}`, body: tone.text },
      { title: "对面的镜子", body: `在 20 印记之环上，与你遥遥相对的是「${guide.name}」。它代表你最容易忽略、却最能让你完整的力量：${guide.summary}` },
    ],
    plain: {
      summary: `你是「${s.title}」型的人：${s.summary.replace(/^如/, "像")}你做事节奏的关键词是「${tone.keywords.slice(0, 2).join("」「")}」。`,
      sections: [
        base[0]!,
        base[1]!,
        base[2]!,
        base[3]!,
        {
          title: "你的做事节奏和盲点",
          body: `${PLAIN_TONES[t.tone - 1]}和你遥遥相对的类型是「${guide.name}」，它代表你最容易忽略、却能让你更完整的一面：${guide.summary}`,
        },
        {
          title: "这套方法怎么算的",
          body: "玛雅人有一种260天一轮的神圣历法：20种印记和13种音调，轮流组合。用你出生的日期算出这一天在这一轮中的位置，就得到你的印记和音调。这里用的是学界通用的算法。",
        },
      ],
    },
    caveats: ["采用学界通用的 GMT 关联常数（584283）推算传统卓尔金历；流行的“13 月亮历/Dreamspell”算法不同，Kin 编号会有差异。"],
    visual: { tone: t.tone, sign: t.sign, kin: t.kin, longCount: t.longCount },
  };
};
