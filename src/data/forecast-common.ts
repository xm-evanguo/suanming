/**
 * Shared text pools and builders for the period forecasts in `src/forecast/`.
 *
 * A `Signal.plain` is built from two parts: a "what" sentence (the meaning of one rule, specific to a life scene)
 * and an "act" sentence (a small concrete action for the life area and the tone). Both are picked from pools with a
 * seed that depends on the system, the period and the rule, so 12 months do not read the same.
 */
import type { Signal, Tone } from "../forecast/types";
import type { Dim } from "./types";

export type Scope = "year" | "month";

/** FNV-1a hash of a string, unsigned 32 bit. */
export function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function pick<T>(pool: readonly T[], seed: number): T {
  return pool[seed % pool.length]!;
}

const TONE_ORDER: Tone[] = ["bad", "mixed", "good"];

/** Move a tone one step up (+1) or down (-1), clamped. */
export function shiftTone(t: Tone, delta: number): Tone {
  return TONE_ORDER[Math.max(0, Math.min(2, TONE_ORDER.indexOf(t) + delta))]!;
}

/** Replace the `{T}` time word: "这个月" for a month, "这一年" for a year. */
export function fillTime(text: string, scope: Scope): string {
  return text.replaceAll("{T}", scope === "month" ? "这个月" : "这一年");
}

/** Generic small actions by life area and tone. Each sentence stands alone after a "what" sentence. */
export const ACT: Record<Dim, Record<Tone, string[]>> = {
  career: {
    good: [
      "想争取的项目或岗位，先把近期的成绩整理成一页纸，再去找负责人聊。",
      "手头有拖着的提案，趁现在发出去，回应会比平时快。",
      "有想投的岗位，可以先更新简历，再约一两位同行聊聊。",
      "遇到能露脸的汇报或会议，主动接下来，别往后躲。",
      "想谈加薪或调岗，提前列好三条理由，挑上司心情好的时候说。",
      "手上的事分出轻重，先把最能出成绩的那一件做漂亮。",
    ],
    mixed: [
      "重要的决定先放两三天，再和信得过的同事讨论一遍。",
      "会议结束后用一句话文字总结结论，能少很多误会。",
      "新机会可以先了解清楚，不急着当场答应。",
      "手头事多的时候，先和上司对齐优先级，再动手。",
      "和同事的分工写清楚：谁负责哪一块，谁来收尾。",
      "一次只主攻一个目标，按自己的节奏推进。",
    ],
    bad: [
      "少在会上硬碰硬，有不同意见，会后一对一去说。",
      "不急着跳槽或换岗，先把现在的事稳住，再看下一步。",
      "交付前多检查一遍，请同事帮你看一眼，比赶进度更重要。",
      "压力大时别一个人扛，早点向上司说明进度和困难。",
      "把大目标拆成每周能完成的小任务，一项一项勾掉。",
      "先守住手头的核心工作，别同时开太多新线。",
    ],
  },
  wealth: {
    good: [
      "想添置的大件，先货比三家、列好预算，再下手。",
      "有额外收入时，先拿出一部分放进应急存款。",
      "可以和上司或客户谈一谈报酬，把你的贡献用数字说清楚。",
      "把每月的固定开销过一遍，砍掉用不上的订阅，攒钱会更有感。",
      "有做副业或兼职的念头，可以先小范围试一试，看看反馈。",
      "适合整理账目，把收入和开销记下来，心里更有底。",
    ],
    mixed: [
      "大额消费先放一晚，第二天还想要再买。",
      "和朋友合伙垫付的钱，先说清楚怎么算。",
      "先留出一笔应急的钱，再安排想买的东西。",
      "收入有起伏，月初定好预算，月底对一次账。",
      "看到“限时优惠”先冷静一下，只买清单上的东西。",
      "钱的事多和家人或伴侣商量，不要自己闷头决定。",
    ],
    bad: [
      "这段时间少冲动消费，付款前多问自己一句：真的需要吗。",
      "和别人有钱的往来，写下金额和日期，免得日后说不清。",
      "先守住现有的积蓄，把不必要的开支压一压。",
      "报价、账单这类数字多核对一遍，小错容易在这时候出现。",
      "朋友邀你合伙或借钱，先说“我想想”，别当场答应。",
      "旅行、聚会这类花销，提前定好上限。",
    ],
  },
  love: {
    good: [
      "单身的话，多参加朋友的聚会或兴趣活动，认识人的机会就在那里。",
      "有伴侣的话，安排一次只属于两个人的约会，哪怕只是散步吃饭。",
      "想说的心里话，找个安静的时间直接说出来，对方会听进去。",
      "主动给在意的人发一条问候，不用长，真诚就行。",
      "和家人约一顿饭，聊聊最近的事，关系会更近一点。",
      "对喜欢的人，别再等对方先开口，轻轻问一句“周末有空吗”。",
    ],
    mixed: [
      "有分歧时，先听对方把话说完，再说自己的想法。",
      "把对感情的期待说得具体一些，比让对方猜省力得多。",
      "别急着下结论，多相处几次，看看日常里的对方。",
      "给自己和对方留一点独处的时间，关系反而更舒服。",
      "和伴侣商量事情，用“我希望”开头，少用“你总是”。",
      "和家人的小摩擦别拖，当天说开最好。",
    ],
    bad: [
      "吵起来时先停一停，等情绪降下来再谈，别在气头上做决定。",
      "对方的话先别往坏处想，不确定的事直接问清楚。",
      "少翻旧账，只谈眼前这一件事。",
      "不顺心时，找朋友聊聊或出门走走，别把情绪都压给身边的人。",
      "分手、同居这类大决定先放一放，过些日子再看。",
      "多留意对方的辛苦，一句“谢谢”能化掉不少火气。",
    ],
  },
  health: {
    good: [
      "状态不错，趁机把想养成的习惯定下来，比如每周运动三次。",
      "可以试一项新运动，比如游泳、快走或瑜伽，坚持两周看效果。",
      "睡眠和饮食规律后精神会更好，先固定一个睡觉时间吧。",
      "精力好的时候，把拖着的体检、牙齿检查之类的预约排上。",
      "多晒太阳、多喝水，小习惯就能让你更轻松。",
      "约朋友一起运动，更容易坚持下来。",
    ],
    mixed: [
      "作息别太乱，睡前一小时少看手机，早点关灯。",
      "工作忙时每隔一小时起来走几分钟，肩颈会轻松很多。",
      "每天留十分钟安静的时间，深呼吸或散步，让头脑松一松。",
      "三餐尽量按时，少喝冰饮和浓咖啡。",
      "压力来的时候，找一种自己喜欢的方式放松，比如听歌、泡脚。",
      "感觉累就早点休息，不要硬撑到很晚。",
    ],
    bad: [
      "身体的小信号别忽略，累了就休息，不舒服持续的话去看医生。",
      "这段时间少熬夜、少应酬，把睡眠放在第一位。",
      "运动从轻量开始，快走、拉伸就够了，别突然加大强度。",
      "情绪低的时候别一个人闷着，找朋友聊聊。",
      "出行和运动时多留意安全，慢一点，稳一点。",
      "把行程排松一点，给自己留出缓冲的半天。",
    ],
  },
  wisdom: {
    good: [
      "适合学新东西：报个课程、读完一本拖着的书，都会有收获。",
      "有想考的证书或考试，现在开始排复习计划，效率比较高。",
      "把最近的想法写下来，三个月后回看，会有意想不到的发现。",
      "遇到有经验的人，多请教一两个问题，比自己琢磨快。",
      "思路清晰的时候，处理最需要动脑的事，比如方案、写作和规划。",
      "找个安静的下午整理思绪，列出接下来三个月最想做的三件事。",
    ],
    mixed: [
      "想法多的时候，先写下来，再挑一两个真正去做。",
      "遇事别急着下结论，多找一个人的看法对照一下。",
      "学东西别贪多，一次只专注一门，学透了再换。",
      "留出发呆的时间，灵感常常在放松时冒出来。",
      "做重要决定前，列一张“好处和代价”的清单。",
      "给自己定个小目标，比如这周读完一章，慢慢来。",
    ],
    bad: [
      "脑子转不动的时候不勉强，先睡一觉再处理难题。",
      "情绪起伏时先不做决定，等心静下来再看。",
      "别被别人的看法带着走，先问问自己真正想要什么。",
      "思绪乱时，把烦心事写在纸上，一件一件拆开看。",
      "重要的考试或面试前多留一天余量，别压线准备。",
      "不顺的时候少刷信息流，多散步，让脑子清空一点。",
    ],
  },
};

/** A rule meaning: several "what" wordings, and optionally its own "act" pool (empty array = no act sentence). */
export interface Phrase {
  what: readonly string[];
  act?: readonly string[];
}

export interface BuildArgs {
  /** Stable key such as `bazi:2026-10:正官`, so the same rule in the same period always reads the same. */
  key: string;
  scope: Scope;
  dim: Dim;
  tone: Tone;
  weight: 1 | 2 | 3;
  pro: string;
  phrase: Phrase;
}

/** Build one signal: a picked "what" sentence plus a picked "act" sentence. */
export function buildSignal(a: BuildArgs): Signal {
  const what = fillTime(pick(a.phrase.what, hash(`${a.key}:w`)), a.scope);
  const acts = a.phrase.act ?? ACT[a.dim][a.tone];
  const act = acts.length ? pick(acts, hash(`${a.key}:a`)) : "";
  return { dim: a.dim, tone: a.tone, weight: a.weight, pro: a.pro, plain: what + act };
}

/**
 * Keep at most `max` signals and at most 2 per life area. Strong signals first; the original order breaks ties.
 */
export function limitSignals(signals: Signal[], max = 6): Signal[] {
  const ranked = signals.map((s, i) => ({ s, i })).sort((x, y) => y.s.weight - x.s.weight || x.i - y.i);
  const perDim: Partial<Record<Dim, number>> = {};
  const out: Signal[] = [];
  for (const { s } of ranked) {
    if (out.length >= max) break;
    if ((perDim[s.dim] ?? 0) >= 2) continue;
    perDim[s.dim] = (perDim[s.dim] ?? 0) + 1;
    out.push(s);
  }
  return out;
}
