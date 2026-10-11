import { type MethodFn, UNKNOWN_TIME_NOTE } from "./types";

/** Bone weights in 钱 (1 两 = 10 钱). Source: the traditional 称骨 tables (e.g. 华易网 k366.com). */
const YEAR: Record<string, number> = {
  甲子: 12, 丙子: 16, 戊子: 15, 庚子: 7, 壬子: 5,
  乙丑: 9, 丁丑: 8, 己丑: 7, 辛丑: 7, 癸丑: 7,
  丙寅: 6, 戊寅: 8, 庚寅: 9, 壬寅: 9, 甲寅: 12,
  丁卯: 7, 己卯: 19, 辛卯: 12, 癸卯: 12, 乙卯: 8,
  戊辰: 12, 庚辰: 12, 壬辰: 10, 甲辰: 8, 丙辰: 8,
  己巳: 5, 辛巳: 6, 癸巳: 7, 乙巳: 7, 丁巳: 6,
  庚午: 9, 壬午: 8, 甲午: 15, 丙午: 13, 戊午: 19,
  辛未: 8, 癸未: 7, 乙未: 6, 丁未: 5, 己未: 6,
  壬申: 7, 甲申: 5, 丙申: 5, 戊申: 14, 庚申: 8,
  癸酉: 8, 乙酉: 15, 丁酉: 14, 己酉: 5, 辛酉: 16,
  甲戌: 15, 丙戌: 6, 戊戌: 14, 庚戌: 9, 壬戌: 10,
  乙亥: 9, 丁亥: 16, 己亥: 9, 辛亥: 17, 癸亥: 6,
};
const MONTH = [6, 7, 18, 9, 5, 16, 9, 15, 18, 8, 9, 5];
const DAY = [5, 10, 8, 15, 16, 15, 8, 16, 8, 16, 9, 17, 8, 17, 10, 8, 9, 18, 5, 15, 10, 9, 8, 9, 15, 18, 7, 8, 16, 6];
const HOUR: Record<string, number> = { 子: 16, 丑: 6, 寅: 7, 卯: 10, 辰: 9, 巳: 16, 午: 10, 未: 8, 申: 8, 酉: 9, 戌: 6, 亥: 6 };

export const CHENGGU_TABLES = { YEAR, MONTH, DAY, HOUR };

/** Original modern readings, one per total weight from 2两1 to 7两1. */
const READINGS: string[] = [
  "早年风霜最重，却也最能磨出一身硬骨，越往后越见天光。",
  "少年多受奔波，宜早学一技傍身，中年后渐有依靠。",
  "身似浮萍，常需自立，贵人多在远方，出外可见转机。",
  "根基清浅，凡事亲力亲为，踏实积累方能后来居上。",
  "前路多弯，心性却韧，四十岁后可得安稳一隅。",
  "早岁辛劳，晚景渐丰，勤俭者终得田园之乐。",
  "命如晨露，需借朝阳；多结善缘，自有扶持之手。",
  "骨轻而志不轻，离乡发展或有意外收获。",
  "早年多变动，中年得一份稳定之业便可安身立命。",
  "一生衣食靠双手，手艺越精，日子越宽。",
  "平地起楼，靠的是一砖一瓦；耐心是你最大的财富。",
  "六亲缘分稍薄，朋友缘却厚，广结人脉可补先天不足。",
  "前半生劳碌，后半生有福，晚年儿女可为依靠。",
  "心思灵巧，宜以技艺立身，切忌好高骛远。",
  "年少颠簸，中运转顺，四十前后迎来人生拐点。",
  "为人忠厚，虽无大富，却能平安顺遂。",
  "勤勉自立，一生可得小康，家庭和睦即是福报。",
  "早年操心多，中年事业渐起，宜守不宜冒进。",
  "性情刚直，凭本事吃饭，晚年衣禄无忧。",
  "命中有贵人暗助，凡事先难后易，终有所成。",
  "聪慧伶俐，适合靠头脑与口才谋生，中年后渐丰。",
  "福禄平稳，不大起大落，细水长流最为长久。",
  "早年平淡，中年发达，善于把握时机者可得厚积薄发。",
  "衣食丰足，为人慷慨，易得众人信赖。",
  "命带文星，宜读书深造，学问即是你的田产。",
  "一生多得长辈提携，脚踏实地便能步步高升。",
  "手中有财亦能守财，家业可由你而兴。",
  "心宽福厚，晚运尤佳，可享清闲之乐。",
  "才华外露，名声渐起，宜在人群中发光。",
  "福气深藏，不显山露水，却稳如磐石。",
  "早年即见才干，中年掌事，可为一方栋梁。",
  "财源多路，善于经营，宜从商或自立门户。",
  "有领袖之风，众人愿随，需防刚愎自用。",
  "名利两得之相，但须修心，方能长保。",
  "衣禄丰厚，一生少有大忧，福泽可及家人。",
  "贵人遍地，处处逢源，事业可登高处。",
  "文武兼备，进退有度，中年即可功成名就。",
  "福禄绵长，晚年荣华，子孙亦受荫庇。",
  "天生贵气，做事有大格局，宜担当重任。",
  "财官双美之相，处事圆融，可掌权柄。",
  "气度恢弘，能聚人心，名望可传一方。",
  "一生福厚，屡逢良机，善用者可成大业。",
  "命格清贵，学识与地位并进。",
  "富贵可期，但须谨记谦逊，福气方能常驻。",
  "得天独厚，早年即受瞩目，一生声名不坠。",
  "家业兴旺，能光耀门庭，福泽深远。",
  "贵不可言之相，然越高处越需慎独。",
  "福星高照，一生顺风顺水，宜多行善以积德。",
  "命格极贵，可成一方之主，责任亦随之而来。",
  "天赐大福，名利俱全，宜以所得回馈世人。",
  "称骨至重，传说中帝王将相之格，福禄寿三全。",
];

const TIERS = [
  { max: 29, name: "磨砺之骨", text: "此格先苦后甜，是“自己挣来的命”。早年的风雨会让你比旁人更早长出锋芒。" },
  { max: 39, name: "奋进之骨", text: "此格中规中矩又带韧性，靠勤勉与手艺逐步积累，中年是转折的关键。" },
  { max: 49, name: "安稳之骨", text: "此格福禄平稳，人缘与机会都不差，只需守住节奏便能水到渠成。" },
  { max: 59, name: "福厚之骨", text: "此格衣禄丰足、贵人常伴，适合担当责任、带领众人。" },
  { max: 99, name: "显贵之骨", text: "此格在称骨歌中位列上品，象征名望与福泽，但越重的福越需要德行承载。" },
];

export interface ChengguVisual {
  parts: { label: string; key: string; weight: number }[];
  total: number;
}

export const fmtLiang = (qian: number) => (qian >= 10 ? `${Math.floor(qian / 10)}两${qian % 10 ? `${qian % 10}钱` : ""}` : `${qian}钱`);

export const chenggu: MethodFn<ChengguVisual> = (chart) => {
  const l = chart.lunar;
  const yearGz: string = l.getYearInGanZhi();
  const month = Math.abs(l.getMonth() as number);
  const day = l.getDay() as number;
  const hourZhi: string = l.getTimeZhi();
  const parts = [
    { label: "年", key: `${yearGz}年`, weight: YEAR[yearGz]! },
    { label: "月", key: `${l.getMonthInChinese()}月`, weight: MONTH[month - 1]! },
    { label: "日", key: l.getDayInChinese(), weight: DAY[day - 1]! },
    { label: "时", key: `${hourZhi}时`, weight: HOUR[hourZhi]! },
  ];
  const total = parts.reduce((s, p) => s + p.weight, 0);
  const tier = TIERS.find((t) => total <= t.max)!;
  const reading = READINGS[Math.min(Math.max(total - 21, 0), READINGS.length - 1)]!;
  const base = 48 + (total - 21) * 0.9;
  const tierIndex = TIERS.indexOf(tier);

  return {
    id: "chenggu",
    name: "袁天罡称骨",
    intro: "相传为唐代袁天罡所创：把农历生年、月、日、时折算成“骨重”，以两钱定一生福禄。",
    origin: "中国",
    icon: "⚖",
    headline: `骨重 ${fmtLiang(total)}`,
    tagline: tier.name,
    keywords: [tier.name.slice(0, 2), ["自立", "坚韧", "安稳", "福厚", "显达"][tierIndex]!, ["晚成", "勤勉", "平顺", "贵人", "名望"][tierIndex]!],
    scores: {
      career: Math.round(base + 4),
      wealth: Math.round(base + 2),
      love: Math.round(55 + (total - 21) * 0.4),
      health: Math.round(60 + (total - 21) * 0.3),
      wisdom: Math.round(52 + (total - 21) * 0.6),
    },
    lucky: { colors: [], numbers: [Math.floor(total / 10), total % 10 || 10], directions: [] },
    facts: parts.map((p) => ({ label: `${p.label} · ${p.key}`, value: fmtLiang(p.weight) })).concat([{ label: "合计", value: fmtLiang(total) }]),
    sections: [
      { title: `骨重 ${fmtLiang(total)} · ${tier.name}`, body: `${reading}${tier.text}` },
      {
        title: "称量明细",
        body: parts.map((p) => `${p.label}（${p.key}）重 ${fmtLiang(p.weight)}`).join("，") + `，四者相加共 ${fmtLiang(total)}。`,
      },
      {
        title: "古法新解",
        body: "称骨法只以农历生辰查表相加，不论五行生克，是流传最广的民间速算。骨轻并非命苦的判决，更像在提醒你：命里少的那一分，要靠后天的努力补上。",
      },
    ],
    caveats: [...(chart.input.timeKnown ? [] : [UNKNOWN_TIME_NOTE]), "称骨以农历正月初一为年界，闰月按本月计。"],
    visual: { parts, total },
  };
};
