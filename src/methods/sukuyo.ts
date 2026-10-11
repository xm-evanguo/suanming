import { RELATION, SHUKU } from "../data/sukuyo";
import { profileLucky, profileSections } from "./profile";
import type { MethodFn } from "./types";

/** Index (in SHUKU order 昴…胃) of the mansion on the 1st day of each lunar month. */
const MONTH_START = [22, 24, 26, 1, 3, 5, 8, 11, 13, 15, 18, 20]; // 室 奎 胃 畢 参 鬼 張 角 氐 心 斗 虚

export const shukuIndex = (lunarMonth: number, lunarDay: number) => (MONTH_START[Math.abs(lunarMonth) - 1]! + lunarDay - 1) % 27;

/** 三九の秘法: the relation of mansion `other` to `self`, by distance mod 9. */
export function relationOf(self: number, other: number): keyof typeof RELATION {
  const d = (other - self + 27) % 27;
  if (d === 0) return "命";
  if (d === 9 || d === 18) return "业胎";
  return (["命", "荣亲", "友衰", "安坏", "危成", "危成", "安坏", "友衰", "荣亲"] as const)[d % 9]!;
}

export interface SukuyoVisual {
  index: number;
  relations: (keyof typeof RELATION)[];
}

export const sukuyo: MethodFn<SukuyoVisual> = (chart) => {
  const l = chart.lunar;
  const index = shukuIndex(l.getMonth(), l.getDay());
  const s = SHUKU[index]!;
  const relations = SHUKU.map((_, i) => relationOf(index, i));
  const names = (r: string) =>
    SHUKU.filter((_, i) => relations[i] === r)
      .map((x) => x.name)
      .join("、");

  return {
    id: "sukuyo",
    name: "宿曜占星術",
    intro: "空海自唐朝带回日本的密教占星《宿曜经》：以农历生日落入的二十七宿，定一生本命宿。",
    origin: "日本",
    icon: "☾",
    headline: `本命宿 · ${s.name}`,
    tagline: `${s.jp} · ${s.title}`,
    keywords: s.keywords,
    scores: s.scores,
    element: s.element,
    lucky: profileLucky(s),
    facts: [
      { label: "农历生日", value: `${l.getMonthInChinese()}月${l.getDayInChinese()}` },
      { label: "本月起宿", value: SHUKU[MONTH_START[Math.abs(l.getMonth()) - 1]!]!.name },
      { label: "本命宿", value: `${s.name}（${s.jp}）` },
      { label: "荣亲（最佳拍档）", value: names("荣亲") },
    ],
    sections: [
      ...profileSections(s),
      {
        title: "宿曜相性 · 三九秘法",
        body: (["荣亲", "友衰", "安坏", "危成", "业胎"] as const).map((r) => `【${RELATION[r].name}】${names(r)}——${RELATION[r].text}`).join(""),
      },
    ],
    caveats: ["宿曜按日本旧历推算；中日农历在少数年份的初一日期相差一天，可能导致本命宿相邻一位。"],
    visual: { index, relations },
  };
};
