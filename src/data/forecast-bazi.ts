import { GOD_RULES_EN, PARTNER_PHRASE_EN, SPOUSE_RULES_EN, TAISUI_RULES_EN, SHENSHA_RULES_EN, RHYTHM_PHRASE_EN } from "./en/forecast-bazi";
import { live } from "../i18n";
/** Plain-language texts for the 八字 period forecast. Jargon stays in `pro`; these are for `plain`. */
import type { Tone } from "../forecast/types";
import type { Phrase } from "./forecast-common";
import type { Dim } from "./types";

export interface GodRule {
  dim: Dim;
  /** Tone before the favorable-element adjustment. */
  tone: Tone;
  /** Short name of what this star stands for, used in `pro`. */
  meaning: string;
  phrase: Phrase;
  /** A second signal in another life area. */
  extra?: { dim: Dim; tone: Tone; phrase: Phrase };
}

const GOD_RULES_ZH: Record<string, GodRule> = {
  正官: {
    dim: "career",
    tone: "good",
    meaning: "官星：名位、规则、认可",
    phrase: {
      what: [
        "{T}你的踏实被看在眼里，上司或客户对你的印象偏好。",
        "{T}规则和流程比平时更重要，守规矩、按时交付的人会被信任。",
        "{T}容易听到升职、转正或被委以责任的消息。",
      ],
    },
  },
  七杀: {
    dim: "career",
    tone: "mixed",
    meaning: "七杀：压力、竞争、硬仗",
    phrase: {
      what: [
        "{T}工作上压力和竞争都变大，但也是被逼出实力的时候。",
        "{T}会遇到要求高的上司或难缠的客户，同时也有硬仗可以打出名声。",
        "{T}节奏偏快，临时的任务和突发的事会变多。",
      ],
    },
  },
  正财: {
    dim: "wealth",
    tone: "good",
    meaning: "正财：正当收入、稳定的钱",
    phrase: {
      what: [
        "{T}收入比较稳，靠本职工作和踏实付出就能进账。",
        "{T}钱的事上有章法，适合定期存一点、把账理清楚。",
        "{T}薪水、奖金或应得的款项容易按时到手。",
      ],
    },
  },
  偏财: {
    dim: "wealth",
    tone: "good",
    meaning: "偏财：计划外的钱、人脉带来的财路",
    phrase: {
      what: [
        "{T}有机会得到计划外的收入，比如兼职、奖金或朋友介绍的活。",
        "{T}人脉带来的财路变多，和人打交道的场合容易冒出赚钱的线索。",
        "{T}进账的路子变多，但花钱也变得大方。",
      ],
    },
  },
  食神: {
    dim: "wisdom",
    tone: "good",
    meaning: "食神：才艺、表达、福气",
    phrase: {
      what: [
        "{T}点子多，表达顺畅，适合写东西、做展示、拍视频或带人讲解。",
        "{T}心态放松，做喜欢的事容易出成果，手艺和创意都能发挥。",
        "{T}想法容易落地，说出口的话也有人愿意听。",
      ],
    },
    extra: {
      dim: "health",
      tone: "good",
      phrase: {
        what: [
          "{T}胃口和心情都不错，适合好好吃饭、做点喜欢的事。",
          "{T}整个人比较松弛，吃得香睡得稳。",
        ],
      },
    },
  },
  伤官: {
    dim: "wisdom",
    tone: "good",
    meaning: "伤官：才华外露、创新、不愿受约束",
    phrase: {
      what: [
        "{T}想法特别多，表达欲强，适合做作品、做设计、提出新方案。",
        "{T}不想循规蹈矩，爱挑战老办法，创意十足。",
        "{T}口才和才气都在线，说话有锋芒，容易让人印象深刻。",
      ],
    },
    extra: {
      dim: "career",
      tone: "mixed",
      phrase: {
        what: [
          "{T}容易觉得上司的安排不合理，话说得直会让气氛变僵。",
          "{T}看不惯的事变多，和上司、前辈之间容易有意见不合。",
          "{T}想按自己的方式做事，规矩和流程会让你有点烦躁。",
        ],
        act: [
          "有想法先私下和上司沟通，用“我建议”代替“你们错了”。",
          "不满的话先写在备忘录里，冷静一天再决定要不要说。",
          "把意见包装成方案，带上数据，更容易被接受。",
        ],
      },
    },
  },
  正印: {
    dim: "wisdom",
    tone: "good",
    meaning: "正印：学习、长辈、庇护",
    phrase: {
      what: [
        "{T}学习运好，容易得到长辈、老师或前辈的指点。",
        "{T}考试、进修、拿证书的事推进顺利。",
        "{T}身边有人愿意托底，家里的支持比较多。",
      ],
    },
  },
  偏印: {
    dim: "wisdom",
    tone: "mixed",
    meaning: "偏印：偏门技能、直觉、孤独",
    phrase: {
      what: [
        "{T}对冷门的东西特别着迷，比如新技能、手艺或研究。",
        "{T}直觉很灵，容易有独特的想法，也更想一个人待着。",
        "{T}会钻进一个小众爱好里，越钻越深。",
      ],
    },
    extra: {
      dim: "health",
      tone: "mixed",
      phrase: {
        what: [
          "{T}想得多，晚上容易睡不踏实。",
          "{T}心思重，容易为小事反复琢磨。",
        ],
      },
    },
  },
  比肩: {
    dim: "career",
    tone: "mixed",
    meaning: "比肩：同辈、朋友、自我",
    phrase: {
      what: [
        "{T}身边同辈的存在感变强，同事、朋友会来找你合作。",
        "{T}自主意识强，想按自己的方式做事，不爱被指挥。",
        "{T}同行之间有竞争，也有互相扶持的机会。",
      ],
    },
    extra: {
      dim: "wealth",
      tone: "mixed",
      phrase: {
        what: [
          "{T}和朋友一起花钱的场合变多，聚餐、AA 和代付要算清。",
          "{T}钱上容易和身边人搅在一起，共同开销最好分账。",
        ],
      },
    },
  },
  劫财: {
    dim: "wealth",
    tone: "mixed",
    meaning: "劫财：竞争、破耗、分财",
    phrase: {
      what: [
        "{T}钱容易被分走，朋友借钱、合伙分账、请客都会变多。",
        "{T}同行竞争激烈，抢同一份资源的人多。",
        "{T}花钱大方，容易为面子多买单。",
      ],
    },
  },
};

/** Partner-star text (men: 财星; women: 官杀). */
const PARTNER_PHRASE_ZH: Record<"steady" | "passion", Phrase> = {
  steady: {
    what: [
      "{T}感情上的缘分比较实在，容易遇到愿意认真相处的人。",
      "{T}和伴侣或心仪的对象沟通顺畅，关系往稳定的方向走。",
      "{T}异性缘不错，朋友介绍的人值得见一见。",
    ],
  },
  passion: {
    what: [
      "{T}感情热烈，心动来得快，起伏也可能大。",
      "{T}容易被有魅力的人吸引，相处中火花多，也容易有摩擦。",
      "{T}异性缘旺，但要分清是一时的新鲜感还是真的合适。",
    ],
  },
};

/** Day-branch (spouse palace) relations. */
const SPOUSE_RULES_ZH: Record<string, { tone: Tone; weight: 1 | 2; phrase: Phrase }> = {
  六合: {
    tone: "good",
    weight: 2,
    phrase: {
      what: [
        "{T}和伴侣或亲近的人特别合拍，容易有默契的好时光。",
        "{T}单身的人容易遇到聊得来的对象，有伴的人适合谈谈未来的安排。",
        "{T}亲密关系里温度上升，彼此愿意为对方多想一步。",
      ],
    },
  },
  三合: {
    tone: "good",
    weight: 1,
    phrase: {
      what: [
        "{T}身边的人愿意配合你，亲密关系里气氛融洽。",
        "{T}和另一半或家人的相处比较轻松，容易一起做成一件小事。",
      ],
    },
  },
  冲: {
    tone: "mixed",
    weight: 2,
    phrase: {
      what: [
        "{T}亲密关系里容易有变化：可能是搬家、换作息，也可能是为小事争执。",
        "{T}和伴侣或家人的节奏对不上，容易吵一两次嘴，也可能因此把话说开。",
        "{T}感情和居住上有变动的念头，单身的人则容易遇到不同类型的人。",
      ],
    },
  },
  害: {
    tone: "mixed",
    weight: 1,
    phrase: {
      what: [
        "{T}亲近的人之间容易有小误会，话传来传去会走样。",
        "{T}对方一句无心的话，你可能会想很久。",
      ],
    },
  },
  伏吟: {
    tone: "mixed",
    weight: 1,
    phrase: {
      what: [
        "{T}同样的事容易反复出现，比如老话题、旧吵架、重复的安排。",
        "{T}家里或感情中的老问题再被提起，适合认真解决一次。",
      ],
    },
  },
};

/** 太岁 relations (years only). */
const TAISUI_RULES_ZH: Record<string, { dim: Dim; tone: Tone; weight: 1 | 2 | 3; phrase: Phrase }> = {
  "值太岁（本命年）": {
    dim: "health",
    tone: "mixed",
    weight: 2,
    phrase: {
      what: [
        "{T}是你的本命年，事情起伏比平时明显，心里容易有“想重新来过”的念头。",
        "{T}环境和心态都在换挡，容易觉得忙乱，也是整理人生方向的好时机。",
      ],
      act: [
        "大决定多想一想，日常作息放规律，穿件红色的小物件讨个安心也不错。",
        "稳中求进就好，先把睡眠和运动排好，再去处理新计划。",
      ],
    },
  },
  冲太岁: {
    dim: "career",
    tone: "mixed",
    weight: 3,
    phrase: {
      what: [
        "{T}变动特别多：换岗位、换公司、搬家或出远门的机会都可能冒出来。",
        "{T}原来的节奏会被打乱，旧的安排有可能要重来。",
        "{T}外部环境推着你动，想不动也难，主动选择比被动接受要好。",
      ],
      act: [
        "有变动先想清楚自己要什么，提前存好一笔缓冲的钱，再决定走不走。",
        "遇到变化别抗拒，把它当成换个活法的机会，每一步都留好退路。",
        "出行和搬家前多确认细节，路上多留时间，安全第一。",
      ],
    },
  },
  害太岁: {
    dim: "career",
    tone: "mixed",
    weight: 1,
    phrase: {
      what: [
        "{T}人际上容易有误会，背后的闲话和小摩擦会变多。",
        "{T}合作中容易为一点小事心生隔阂，沟通要更清楚。",
      ],
      act: [
        "重要的事白纸黑字写下来，少说多做，别参与是非。",
        "有误会当面问清楚，别靠猜。",
      ],
    },
  },
  六合太岁: {
    dim: "love",
    tone: "good",
    weight: 2,
    phrase: {
      what: [
        "{T}人缘大开，合作和感情都容易有好消息。",
        "{T}有人愿意牵线搭桥，朋友介绍的人和事值得一试。",
        "{T}贵人和机会常从熟人圈里冒出来。",
      ],
    },
  },
  三合太岁: {
    dim: "career",
    tone: "good",
    weight: 2,
    phrase: {
      what: [
        "{T}得到大环境的助力，想启动的计划容易顺势推进。",
        "{T}适合开拓新局面，团队里愿意跟你一起干的人变多。",
      ],
    },
  },
};

/** 神煞. */
const SHENSHA_RULES_ZH: Record<string, { dim: Dim; tone: Tone; phrase: Phrase }> = {
  天乙贵人: {
    dim: "career",
    tone: "good",
    phrase: {
      what: [
        "{T}有贵人相助的迹象，容易遇到愿意拉你一把的人，比如老同事、前辈或上司。想推进的事，主动约他们聊一聊。",
        "{T}贵人会在关键时刻出手：有人帮腔、有人指路。遇到卡住的事，别硬撑，向懂行的人开口问一句。",
        "{T}有贵人出现的迹象，可能是朋友引荐，也可能是前辈随口一句提醒。留心身边人的建议。",
      ],
      act: [],
    },
  },
  文昌: {
    dim: "wisdom",
    tone: "good",
    phrase: {
      what: [
        "{T}读书、考试、写作的状态好，脑子清楚，适合备考或做需要文字功夫的事。",
        "{T}学东西特别快，之前学不进去的内容这时候容易开窍。",
      ],
    },
  },
  驿马: {
    dim: "career",
    tone: "mixed",
    phrase: {
      what: [
        "{T}出差、出行、搬家或换环境的机会变多，人也比较坐不住。",
        "{T}外出的事多，工作可能要跑动，或者你自己想换个地方看看。",
      ],
      act: [
        "行程提前订好，证件和充电器装进包里，路上留出缓冲时间。",
        "外出多的时候，把重要的事集中安排，避免来回奔波。",
      ],
    },
  },
  桃花: {
    dim: "love",
    tone: "good",
    phrase: {
      what: [
        "{T}人缘和异性缘变旺，单身的人容易遇到心动的人。",
        "{T}社交场合变多，笑容和魅力都加分。有伴侣的人，多留点时间给对方。",
      ],
    },
  },
};

/** Overall rhythm from favorable elements (not an element name in plain text). */
const RHYTHM_PHRASE_ZH: Record<"fit" | "off" | "flat", Phrase> = {
  flat: {
    what: [
      "{T}整体节奏平稳，没有特别顺也没有特别拧，按部就班做事就好。",
      "{T}大环境不松不紧，适合把日常的事做细做稳。",
    ],
  },
  fit: {
    what: [
      "{T}整体节奏和你比较合拍，做事顺手，精神也比较好。",
      "{T}大环境对你比较友好，该做的事顺势推进就好。",
    ],
  },
  off: {
    what: [
      "{T}整体节奏和你有点拧着，容易觉得累，事情推进偏慢。",
      "{T}大环境不太顺手，做事要多花点力气。",
    ],
  },
};

export const GOD_RULES = live(GOD_RULES_ZH, GOD_RULES_EN);
export const PARTNER_PHRASE = live(PARTNER_PHRASE_ZH, PARTNER_PHRASE_EN);
export const SPOUSE_RULES = live(SPOUSE_RULES_ZH, SPOUSE_RULES_EN);
export const TAISUI_RULES = live(TAISUI_RULES_ZH, TAISUI_RULES_EN);
export const SHENSHA_RULES = live(SHENSHA_RULES_ZH, SHENSHA_RULES_EN);
export const RHYTHM_PHRASE = live(RHYTHM_PHRASE_ZH, RHYTHM_PHRASE_EN);
