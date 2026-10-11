/** Plain-language texts for the 吠陀占星 (Jyotish) period forecast. Lord names match `DASHA` in methods/vedic.ts. */
import type { Tone } from "../forecast/types";
import type { Phrase } from "./forecast-common";
import type { Dim } from "./types";

export interface GrahaText {
  dim: Dim;
  tone: Tone;
  /** Theme of the multi-year 大运 (mahadasha). */
  maha: string[];
  /** Theme of the months-long 小运 (antardasha) and the finer 细运 (pratyantardasha). */
  antar: string[];
  /** Short flavor for the finest level. */
  praty: string[];
}

export const GRAHA: Record<string, GrahaText> = {
  计都: {
    dim: "wisdom",
    tone: "mixed",
    maha: [
      "这几年你会想断舍离，对热闹和虚名兴趣下降，更想弄明白自己真正在意什么。",
      "这几年适合放下不再需要的东西，往内心和专业的深处走，少一点比较，多一点专注。",
    ],
    antar: [
      "这段时间容易觉得有些事失去了意义，适合清理旧物、结束拖了很久的关系或项目。",
      "这段时间更想一个人安静待着，对应酬提不起兴趣，给自己留出独处的空间。",
    ],
    praty: ["这几周心思偏内收，适合整理东西、处理搁置的事。"],
  },
  金星: {
    dim: "love",
    tone: "good",
    maha: [
      "这几年感情、审美和享受生活的部分被放大，人缘和钱缘也比较顺，适合经营关系、把生活过得精致。",
      "这几年重视舒适与关系，遇到合拍的人、喜欢的事物的机会变多，也要留意别过度享乐。",
    ],
    antar: [
      "这段时间适合约会、买喜欢的东西、美化居住环境，人缘好。",
      "这段时间感情和合作容易有好消息，适合谈合作、见朋友、参加活动。",
    ],
    praty: ["这几周心情轻松，人际愉快，适合社交和约会。"],
  },
  太阳: {
    dim: "career",
    tone: "good",
    maha: [
      "这几年你想被看见、想当主角，事业和名声的主题明显，适合争取职位和影响力。",
      "这几年和权威、上司、父亲这类人物的关系变得重要，责任和荣誉一起增加。",
    ],
    antar: [
      "这段时间适合主动站出来负责、向上司表达想法，也要留心别太强势。",
      "这段时间自信心提升，容易得到认可，适合做公开展示。",
    ],
    praty: ["这几周底气足，适合表态、做决定、争取机会。"],
  },
  月亮: {
    dim: "love",
    tone: "mixed",
    maha: [
      "这几年情绪和家庭生活是主题，你更需要安全感，也更会照顾人，居住和家人的变化会比较多。",
      "这几年重视内心感受，直觉敏锐，容易受人和环境影响，规律的生活能让你稳下来。",
    ],
    antar: [
      "这段时间心情起伏偏大，多陪陪家人，睡眠规律最重要。",
      "这段时间会更在意身边人的感受，适合照顾家庭、整理居所。",
    ],
    praty: ["这几周情绪比较敏感，给自己多一点安静和休息。"],
  },
  火星: {
    dim: "career",
    tone: "mixed",
    maha: [
      "这几年行动力和竞争心很强，适合开拓、攻坚、运动，但脾气和冲动要管住。",
      "这几年精力旺盛、爱挑战，适合做需要冲劲的事，同时要留意安全和人际摩擦。",
    ],
    antar: [
      "这段时间精力足、想冲，运动和项目攻坚都合适，说话要留余地。",
      "这段时间做事果断，容易与人起争执，先冷静一下再回应。",
    ],
    praty: ["这几周干劲大，适合推进难啃的任务。"],
  },
  罗睺: {
    dim: "career",
    tone: "mixed",
    maha: [
      "这几年欲望和野心被放大，容易追求新奇、跨界、远方或网络上的机会，起伏也比较大。",
      "这几年变化快，容易遇到不寻常的人和事，适合尝试新领域，但要多核实信息。",
    ],
    antar: [
      "这段时间容易被新事物吸引，也容易想太多，大决定先放一放，多核实信息。",
      "这段时间机会和诱惑一起来，看清真正想要的，别被一时的热度带跑。",
    ],
    praty: ["这几周想法活跃、变化多，重要承诺先缓一缓。"],
  },
  木星: {
    dim: "wisdom",
    tone: "good",
    maha: [
      "这几年学习、贵人和机会都偏多，适合进修、扩大视野、建立长期关系，也容易得到指引。",
      "这几年运势比较宽厚，适合读书、教学、带人、做长线规划，人生观也会更开阔。",
    ],
    antar: [
      "这段时间容易遇到指路的人，适合学习、教别人或谈合作。",
      "这段时间贵人运偏好，有想请教的人，主动开口会有收获。",
    ],
    praty: ["这几周心态开阔，适合学习和与人交流。"],
  },
  土星: {
    dim: "career",
    tone: "mixed",
    maha: [
      "这几年节奏偏慢、责任偏重，但脚踏实地积累的东西很耐用，适合打基础、做长期事业。",
      "这几年现实的考验变多，收获来得慢却扎实，纪律和耐心是关键。",
    ],
    antar: [
      "这段时间事情进展慢、要求高，把手头的事做扎实，别急着求快。",
      "这段时间责任变重，容易觉得累，把任务拆小，一步一步推进。",
    ],
    praty: ["这几周节奏偏慢，适合做需要耐心的整理工作。"],
  },
  水星: {
    dim: "wealth",
    tone: "good",
    maha: [
      "这几年适合学习、做生意、写作、沟通，脑子转得快，信息和人脉带来机会。",
      "这几年头脑灵活，适合做买卖、考试、处理文书与数据，多读多写会有收获。",
    ],
    antar: [
      "这段时间沟通、谈判、考试、写方案都顺手，注意别想太多。",
      "这段时间信息多、联系多，适合洽谈和学习，重要内容记得写下来。",
    ],
    praty: ["这几周思维敏捷，适合处理文书和沟通。"],
  },
};

export const SADE_SATI: Record<"rising" | "peak" | "setting", { weight: 2 | 3; label: string; phrase: Phrase }> = {
  rising: {
    weight: 2,
    label: "七年半土星期（初段）：土星行至月亮前一宫",
    phrase: {
      what: [
        "{T}进入人生一段“慢下来”的阶段，开销、睡眠和家人的事需要多留意，压力先从生活琐事开始。",
        "{T}责任感悄悄变重，容易为钱和家里的事操心，早做安排会轻松许多。",
      ],
      act: [
        "把作息和开销稳住，每月留一笔应急的钱，这段路会走得比想象中顺。",
        "遇到压力别一个人扛，和家人或朋友聊聊，按计划一步一步做。",
      ],
    },
  },
  peak: {
    weight: 3,
    label: "七年半土星期（中段）：土星正行至月亮所在星座",
    phrase: {
      what: [
        "{T}是这段慢节奏里最需要耐心的时候，情绪容易低落，做事比平时慢，但也最能练出定力。",
        "{T}生活节奏偏沉，容易觉得孤单或被责任压着，同时这也是认清自己真正需要什么的好时机。",
      ],
      act: [
        "规律睡觉、规律运动，把大目标拆成每周能完成的小事，再亲近几位信得过的人。",
        "少做冲动的决定，把重要的事排得松一点，给自己留出恢复的时间。",
      ],
    },
  },
  setting: {
    weight: 2,
    label: "七年半土星期（末段）：土星行至月亮后一宫",
    phrase: {
      what: [
        "{T}这段慢节奏逐渐走向尾声，压力一点点松开，之前积累的耐心开始见成效。",
        "{T}负担在减轻，你会发现自己比几年前更稳、更有底气。",
      ],
      act: [
        "把这几年学到的经验整理成清单，下一阶段的计划可以慢慢展开了。",
        "趁状态回升，把搁置的小目标一件件重新捡起来。",
      ],
    },
  },
};

/** Jupiter's transit house counted from the natal Moon sign. */
export const JUPITER_GOCHARA: Record<number, { dim: Dim; tone: Tone; weight: 1 | 2; phrase: Phrase }> = {
  2: { dim: "wealth", tone: "good", weight: 2, phrase: { what: ["{T}木星走到你月亮的第 2 宫，收入和家里的氛围偏好，容易有进账或家人带来的好消息。"] } },
  5: { dim: "love", tone: "good", weight: 2, phrase: { what: ["{T}木星走到你月亮的第 5 宫，学习、创作和感情都容易开花，也适合陪伴孩子或晚辈。"] } },
  7: { dim: "love", tone: "good", weight: 2, phrase: { what: ["{T}木星走到你月亮的第 7 宫，伴侣和合作关系变得融洽，单身的人容易遇到合适的人。"] } },
  9: { dim: "wisdom", tone: "good", weight: 2, phrase: { what: ["{T}木星走到你月亮的第 9 宫，贵人、进修和远行的运气偏好，适合学习和出门见世面。"] } },
  11: { dim: "wealth", tone: "good", weight: 2, phrase: { what: ["{T}木星走到你月亮的第 11 宫，人脉和收入都有好势头，想实现的愿望容易得到支持。"] } },
  8: { dim: "health", tone: "mixed", weight: 1, phrase: { what: ["{T}木星走到你月亮的第 8 宫，宜守不宜攻，把精力放在稳住现有的东西上。"] } },
  12: { dim: "health", tone: "mixed", weight: 1, phrase: { what: ["{T}木星走到你月亮的第 12 宫，开销和奔波偏多，更需要休息与独处。"] } },
};

/** The Sun's transit house counted from the natal Moon sign (good in 3, 6, 10, 11). */
export const SUN_GOCHARA: Record<number, { dim: Dim; phrase: Phrase }> = {
  3: { dim: "career", phrase: { what: ["{T}太阳走到你月亮的第 3 宫，勇气和主动性比平时强，适合主动联系、推进想拖的事。"] } },
  6: { dim: "career", phrase: { what: ["{T}太阳走到你月亮的第 6 宫，竞争和难题中你容易占上风，适合处理棘手的工作。"] } },
  10: { dim: "career", phrase: { what: ["{T}太阳走到你月亮的第 10 宫，事业上容易有成绩和曝光，适合汇报与争取机会。"] } },
  11: { dim: "wealth", phrase: { what: ["{T}太阳走到你月亮的第 11 宫，人脉与收入有好势头，适合社交和谈合作。"] } },
};
