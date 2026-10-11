import { Solar } from "lunar-javascript";
import { CHONG, LIU_HE, SAN_HE, XIANG_HAI, zhiIndex } from "../core/ganzhi";
import { NA_YIN, SHENG_XIAO } from "../data/shengxiao";
import { profileLucky, profileSections } from "./profile";
import { type MethodFn, shiftScores } from "./types";

export interface ShengxiaoVisual {
  index: number;
  sanhe: number[];
  liuhe: number;
  chong: number;
  hai: number;
  thisYear: { year: number; ganzhi: string; index: number; relation: string };
}

function taiSuiRelation(self: number, year: number): { name: string; text: string; delta: number } {
  if (self === year) return { name: "值太岁（本命年）", text: "本命年能量起伏较大，宜稳中求进，红色饰物是传统的护身之法。", delta: -5 };
  if (CHONG(self) === year) return { name: "冲太岁", text: "冲太岁之年变动多，搬迁、转岗都可能出现，主动求变反而能化冲为动。", delta: -6 };
  if (XIANG_HAI[self] === year) return { name: "害太岁", text: "害太岁宜防小人与误会，重要事情白纸黑字，少说多做。", delta: -3 };
  if (LIU_HE[self] === year) return { name: "六合太岁", text: "六合之年人缘大开，合作与感情都易有好消息。", delta: 6 };
  if (SAN_HE(self).includes(year)) return { name: "三合太岁", text: "三合之年得太岁扶持，适合开拓新局、启动计划。", delta: 5 };
  return { name: "平和之年", text: "与太岁无冲无合，按部就班即可稳步前行。", delta: 0 };
}

export const shengxiao: MethodFn<ShengxiaoVisual> = (chart) => {
  // Use the 立春 boundary so the animal matches the 八字 year pillar.
  const yearZhi: string = chart.eightChar.getYearZhi();
  const index = zhiIndex(yearZhi);
  const a = SHENG_XIAO[index]!;
  const nayin: string = chart.eightChar.getYearNaYin();

  const now = new Date();
  const nowLunar = Solar.fromYmd(now.getFullYear(), now.getMonth() + 1, now.getDate()).getLunar();
  const nowGz: string = nowLunar.getYearInGanZhiByLiChun();
  const nowIndex = zhiIndex(nowGz.charAt(1));
  const rel = taiSuiRelation(index, nowIndex);
  const name = (i: number) => SHENG_XIAO[i]!.name;
  const sanhe = SAN_HE(index);

  return {
    id: "shengxiao",
    name: "生肖纳音",
    intro: "十二地支配十二生肖，再以六十甲子纳音取象，观本命与太岁的关系。",
    origin: "中国",
    icon: a.emoji,
    headline: `${chart.eightChar.getYear()}年 · 属${a.name.replace(/^属/, "")}`,
    tagline: `${nayin}命 · ${a.title}`,
    keywords: a.keywords,
    scores: shiftScores(a.scores, { career: rel.delta, wealth: rel.delta }),
    element: a.element,
    lucky: profileLucky(a),
    facts: [
      { label: "年柱", value: chart.eightChar.getYear() },
      { label: "生肖", value: a.name },
      { label: "纳音", value: nayin },
      { label: "三合", value: sanhe.map(name).join(" · ") },
      { label: `${now.getFullYear()} 流年`, value: `${nowGz} · ${rel.name}` },
    ],
    sections: [
      ...profileSections(a),
      { title: `纳音 · ${nayin}`, body: NA_YIN[nayin] ?? "" },
      {
        title: "生肖缘分",
        body: `三合贵人：${sanhe.filter((i) => i !== index).map(name).join("、")}；六合知己：${name(LIU_HE[index]!)}；相冲需磨合：${name(CHONG(index))}；相害宜包容：${name(XIANG_HAI[index]!)}。`,
      },
      { title: `${now.getFullYear()} · ${rel.name}`, body: rel.text },
    ],
    caveats: ["生肖以立春为年界（与八字一致）；民间亦有以春节为界的说法，若生日在两者之间可能出现差异。"],
    visual: { index, sanhe, liuhe: LIU_HE[index]!, chong: CHONG(index), hai: XIANG_HAI[index]!, thisYear: { year: now.getFullYear(), ganzhi: nowGz, index: nowIndex, relation: rel.name } },
  };
};
