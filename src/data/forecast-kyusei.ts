/** Plain-language texts for the 九星気学 period forecast. */
import type { Tone } from "../forecast/types";
import type { Phrase } from "./forecast-common";
import type { Dim } from "./types";

/** Meaning of the palace (direction) where the natal star sits on the year or month board. */
export const DIRECTION_RULES: Record<string, { dim: Dim; tone: Tone; weight: 1 | 2; trigram: string; phrase: Phrase }> = {
  东: {
    dim: "career",
    tone: "good",
    weight: 2,
    trigram: "震",
    phrase: {
      what: [
        "{T}新点子、新计划纷纷冒头，适合开个头、迈出第一步。",
        "{T}行动力变强，之前犹豫的事容易动起来。",
        "{T}有新的开始在等你，比如新项目、新课程或新的习惯。",
      ],
    },
  },
  东南: {
    dim: "love",
    tone: "good",
    weight: 2,
    trigram: "巽",
    phrase: {
      what: [
        "{T}人缘和信用都在加分，远方的消息、合作邀约容易出现。",
        "{T}适合出门拜访、介绍认识，姻缘和合作都容易成形。",
        "{T}别人对你的印象好，说出口的承诺会被信任。",
      ],
    },
  },
  南: {
    dim: "wisdom",
    tone: "good",
    weight: 2,
    trigram: "离",
    phrase: {
      what: [
        "{T}才华容易被看见，适合展示作品、发表想法、做一次分享。",
        "{T}你的名声和存在感上升，话也容易被传开，说话前多想一步。",
        "{T}灵感和表达欲都很足，适合写、画、讲。",
      ],
    },
  },
  西南: {
    dim: "career",
    tone: "mixed",
    weight: 1,
    trigram: "坤",
    phrase: {
      what: [
        "{T}进展不快，但脚踏实地做的事会慢慢积累成果。",
        "{T}适合做基础工作、整理资料、把手头的事做细。",
      ],
    },
  },
  西: {
    dim: "wealth",
    tone: "good",
    weight: 2,
    trigram: "兑",
    phrase: {
      what: [
        "{T}社交和享受变多，聚会、请客、小确幸不断，进账和花销都比较活跃。",
        "{T}人际愉快，和人聊天的场合容易带来好机会，也容易多花钱。",
        "{T}轻松愉快的氛围让你容易谈成事，也容易乐过头。",
      ],
    },
  },
  西北: {
    dim: "career",
    tone: "good",
    weight: 2,
    trigram: "乾",
    phrase: {
      what: [
        "{T}责任和地位上升，容易被推到负责人的位置。",
        "{T}适合站出来带头，决策和领导力得到认可。",
        "{T}身边的人愿意听你的安排，是展现担当的好时机。",
      ],
    },
  },
  北: {
    dim: "health",
    tone: "mixed",
    weight: 2,
    trigram: "坎",
    phrase: {
      what: [
        "{T}节奏偏慢，适合蓄力、学习和规划，不适合冒进。",
        "{T}精力偏内收，更想待在家里，适合休养和整理思路。",
        "{T}外面的热闹少一些，正好把睡眠和身体调整好。",
      ],
    },
  },
  东北: {
    dim: "career",
    tone: "mixed",
    weight: 2,
    trigram: "艮",
    phrase: {
      what: [
        "{T}环境有变化：工作、住处或心态都可能重新整理一次。",
        "{T}旧的安排要松动，新的格局在成形，会有一点不安稳。",
        "{T}适合清理和转换，把不再需要的事放下。",
      ],
    },
  },
};

/** 八方塞 (natal star in the center palace). */
export const CENTER_RULE: Phrase = {
  what: [
    "{T}是个停下来的节点，做什么都有点使不上劲，更适合整理而不是冲刺。",
    "{T}事情处在转折点，进退两难的感觉比较多。先把手头的事收拢，等风向明确再出发。",
    "{T}像站在路口，需要沉淀和复盘，大动作留给下一阶段。",
  ],
  act: [
    "把计划拆小，先做眼前能做的，大的改变往后排一排。",
    "多听身边人的意见，别急着一个人做决定。",
    "给自己安排固定的休息和整理时间，把心稳住。",
  ],
};

/** Direction-based hazards. */
export const HAZARD_RULES: Record<string, { weight: 1 | 2 | 3; label: string; phrase: Phrase }> = {
  暗剣殺: {
    weight: 3,
    label: "暗剣殺：与五黄殺相对的方位，主突发的变动",
    phrase: {
      what: [
        "{T}容易冒出意料之外的小状况：计划被打乱，或被不太熟的人影响。",
        "{T}突发的事比平时多，临时变动、对方改口、行程取消都可能遇到。",
      ],
      act: [
        "搬家、远行之类的大动作尽量往后排，计划多留余量，重要的约定提前再确认一次。",
        "做事留好备案，出门和开车多留意安全，不赶时间。",
        "遇到突发的事先深呼吸，不当场下结论，等情况明朗再决定。",
      ],
    },
  },
  五黄殺: {
    weight: 3,
    label: "五黄殺：本命星即五黄土星，落在盘中的五黄方位",
    phrase: {
      what: [
        "{T}事情容易拖得久、绕得远，旧问题被翻出来的概率偏高。",
        "{T}人和事都比较“重”，需要多一点耐心才能推得动。",
      ],
      act: [
        "手头的老问题趁现在一件件清掉，不再拖延；新的大项目先放一放。",
        "多休息，少接新担子，把基本盘守稳。",
      ],
    },
  },
  歳破: {
    weight: 2,
    label: "歳破：太岁对冲的方位",
    phrase: {
      what: [
        "{T}原有的安排容易被打破，节奏变得不稳，计划需要灵活调整。",
        "{T}事情不太按预想走，临时要改的地方变多。",
      ],
      act: [
        "计划写成“主方案加备用方案”，重要节点提前确认。",
        "不要把所有希望押在一件事上，分散一点更稳。",
      ],
    },
  },
  月破: {
    weight: 1,
    label: "月破：当月月支对冲的方位",
    phrase: {
      what: [
        "{T}安排容易有些小变动，约好的事可能临时调整。",
        "{T}节奏时断时续，事情推进得不太顺。",
      ],
      act: [
        "重要的约定前一天再确认一次，留出缓冲的时间。",
        "不顺的事先放一放，换个时间再试。",
      ],
    },
  },
};
