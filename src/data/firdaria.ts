import type { Trad } from "./hellenistic";
import type { Scores } from "./types";

export type NodeKey = "northNode" | "southNode";
export type FirPlanet = Trad | NodeKey;

/** Firdaria sequences (Abu Ma'shar / Persian main tradition): major rulers and their years. Both total 75. */
export const FIR_DAY: [FirPlanet, number][] = [
  ["sun", 10], ["venus", 8], ["mercury", 13], ["moon", 9], ["saturn", 11], ["jupiter", 12], ["mars", 7], ["northNode", 3], ["southNode", 2],
];
export const FIR_NIGHT: [FirPlanet, number][] = [
  ["moon", 9], ["saturn", 11], ["jupiter", 12], ["mars", 7], ["sun", 10], ["venus", 8], ["mercury", 13], ["northNode", 3], ["southNode", 2],
];
export const FIR_CYCLE = 75;

export interface NodeInfo {
  zh: string;
  glyph: string;
  kw: string[];
  plainKw: string;
  stage: string;
  title: string;
  colors: string[];
  numbers: number[];
  dir: string;
  scores: Scores;
  /** Actions that fit the period. Whole sentences. */
  actions: string[];
  /** Gentle cautions. Whole sentences. */
  care: string[];
}

export const NODE_INFO: Record<NodeKey, NodeInfo> = {
  northNode: {
    zh: "北交点", glyph: "☊︎", kw: ["成长", "机缘", "陌生领域"], plainKw: "新机会和成长",
    stage: "走出舒适圈、遇到新人新机会的阶段",
    title: "北交点 · 龙首", colors: ["靛蓝", "墨紫"], numbers: [4], dir: "西南",
    scores: { career: 75, wealth: 70, love: 68, health: 66, wisdom: 80 },
    actions: ["主动认识几位和你平时圈子不同的人，一杯咖啡的时间就够。", "做一件你一直想试、却觉得陌生的事，比如换个岗位或学个新技能。", "有人邀请你去没去过的地方或场合，先答应下来再说。"],
    care: ["新机会来得快，答应之前先问清楚要你做什么。", "别因为“新鲜”就一下子推翻全部旧安排，一步一步换。"],
  },
  southNode: {
    zh: "南交点", glyph: "☋︎", kw: ["放下", "清理", "回顾"], plainKw: "放下和清理",
    stage: "放下旧包袱、清理不再需要的东西的阶段",
    title: "南交点 · 龙尾", colors: ["灰蓝", "炭灰"], numbers: [7], dir: "东北",
    scores: { career: 55, wealth: 55, love: 58, health: 56, wisdom: 78 },
    actions: ["整理一次手机、衣柜和账号，把不再用的东西清掉。", "和一段拖了很久的关系或工作做个了断，说清楚比耗着轻松。", "回头看看自己这些年学会了什么，写下三件值得保留的。"],
    care: ["别太快否定自己过去的努力，放下不等于白费。", "感到空落落时，先照顾睡眠和吃饭，再做大决定。"],
  },
};

/** Scene hints for the sub-period line, keyed by planet. Fits after "这一小段里，". */
export const SUB_SCENE: Record<FirPlanet, string> = {
  sun: "你会更想被看见，适合主动汇报成果、争取更重要的角色。",
  moon: "家人和情绪的事会占掉不少心思，适合陪伴家人、调整作息。",
  mercury: "沟通、学习和文书事务变多，适合考试、写方案、谈细节。",
  venus: "感情和人缘有升温的空间，适合约会、聚会、修复关系。",
  mars: "做事想快、想赢，适合推进拖延的任务，也要注意控制脾气。",
  jupiter: "容易遇到愿意帮你的人，适合请教前辈、报课程、做长远打算。",
  saturn: "责任和规矩变重，适合把基础打牢，一件一件做完。",
  northNode: "",
  southNode: "",
};

/** Short phrase for each period's "main task". Fits "这段时间的功课是…". */
export const TASK: Record<FirPlanet, string> = {
  sun: "把自己的价值亮出来，并为此负责",
  moon: "照顾好身体、情绪和身边最亲的人",
  mercury: "多学、多问、把话说清楚",
  venus: "经营关系，也学会享受生活",
  mars: "鼓起勇气行动，同时管住脾气",
  jupiter: "打开眼界，接住别人伸来的手",
  saturn: "耐心打基础，把责任一件件扛稳",
  northNode: "走向陌生处，接受新的可能",
  southNode: "放下过多的旧东西，轻装前行",
};
