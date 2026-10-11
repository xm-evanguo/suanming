import { DAY_SIGNS, TONES } from "../data/maya";
import { profileLucky, profileSections } from "./profile";
import { type MethodFn, shiftScores } from "./types";

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
    caveats: ["采用学界通用的 GMT 关联常数（584283）推算传统卓尔金历；流行的“13 月亮历/Dreamspell”算法不同，Kin 编号会有差异。"],
    visual: { tone: t.tone, sign: t.sign, kin: t.kin, longCount: t.longCount },
  };
};
