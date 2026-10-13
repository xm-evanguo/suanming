import { PLAIN_CHENGGU_TIERS_EN, PLAIN_CHENGGU_PARTS_EN } from "./en/chenggu";
import { live } from "../i18n";
/** Plain-language tables for the 称骨 page. Index matches the tier order in `chenggu.ts` (light to heavy). */

export interface PlainChengguTier {
  /** One-sentence core message. */
  core: string;
  rhythm: string;
  work: string;
  advice: string;
}

const PLAIN_CHENGGU_TIERS_ZH: PlainChengguTier[] = [
  {
    core: "按老办法算，你属于“靠自己一步步挣来”的类型，起点不一定高，但韧劲足。",
    rhythm: "年轻时可能要多靠自己，现成的依靠少一点，也因此你比同龄人更早学会扛事。越往后越稳，三四十岁以后会更从容。",
    work: "适合先学一门手艺或专业，再慢慢扩大。技能是你最可靠的底气，比一时的机会更重要。",
    advice: "早点存下第一笔应急钱，早点学会一项能养活自己的本事。别和起点高的人比，只和一年前的自己比。",
  },
  {
    core: "按老办法算，你是“中规中矩又有韧性”的类型，靠勤快和积累一点点往上走。",
    rhythm: "前些年可能平平稳稳，中年是一个关键的转折点。抓住一两次换岗或进修的机会，路会宽很多。",
    work: "适合在一个行业里持续深耕，做出口碑。稳定的工作加一项副技能，是适合你的组合。",
    advice: "每年给自己定一个学习目标。遇到转折点时，先问问前辈的意见，再做决定。",
  },
  {
    core: "按老办法算，你属于“平稳、人缘不错”的类型，机会和支持都不缺，守住节奏就好。",
    rhythm: "人生起伏不大，不会太苦也不会突然暴富。你身边通常有愿意帮你的人，水到渠成的事比较多。",
    work: "适合和人打交道、需要信任的工作，比如服务、销售、教育、行政。长期做下去，口碑就是你的资产。",
    advice: "别因为太顺而不练新技能。每年尝试一件有点难度的新事，让自己保持成长。",
  },
  {
    core: "按老办法算，你属于“福气厚、身边常有帮手”的类型，适合承担责任、带人做事。",
    rhythm: "一生里容易遇到愿意提携你的人。做事机会比较多，关键是想清楚自己要什么，别被各种选项分散。",
    work: "适合管理、带团队、做项目负责人，或自己创业。你的口碑和人脉会帮上忙。",
    advice: "你有资源，也要有边界。遇到人情请托，学会礼貌地说不；有了成绩，记得分享给团队。",
  },
  {
    core: "按老办法算，这是传统里“最重”的一档，意思是福气和机会都不少，但责任也随之而来。",
    rhythm: "早早就容易被看见，做事有大格局。重一些的福气，需要更稳的心态去承接，不要被一时的顺利冲昏头。",
    work: "适合担任需要责任和视野的位置，比如管理、创办事业、公共服务。你的影响力会比较大。",
    advice: "越顺越要谦虚。定期复盘，听听不同的声音，也别忘了把所得回馈身边的人。",
  },
];

/** The four folk stages a 称骨 weight stands for (年 / 月 / 日 / 时). */
const PLAIN_CHENGGU_PARTS_ZH: Record<string, string> = {
  年: "小时候和成长环境",
  月: "青年时期",
  日: "中年时期",
  时: "晚年和晚辈的缘分",
};

export const PLAIN_CHENGGU_TIERS = live(PLAIN_CHENGGU_TIERS_ZH, PLAIN_CHENGGU_TIERS_EN);
export const PLAIN_CHENGGU_PARTS = live(PLAIN_CHENGGU_PARTS_ZH, PLAIN_CHENGGU_PARTS_EN);
