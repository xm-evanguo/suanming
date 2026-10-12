/** Plain-language texts for the 西洋占星 transit forecast. */
import type { Tone } from "../forecast/types";
import type { Phrase } from "./forecast-common";
import type { Dim } from "./types";

/** Whole-sign houses 1-12 (index 0 is house 1): the life area and everyday scenes. */
export const HOUSES: { dim: Dim; topic: string; scenes: string[] }[] = [
  { dim: "health", topic: "自己的状态和形象", scenes: ["发型、穿着和第一印象", "你想开始的新尝试", "精气神和体力"] },
  { dim: "wealth", topic: "收入和花销", scenes: ["工资、奖金和副业", "购物和存钱的习惯", "你对自己价值的判断"] },
  { dim: "wisdom", topic: "沟通和学习", scenes: ["日常的交流和消息", "短途出行", "学一门小技能", "和兄弟姐妹、邻居的往来"] },
  { dim: "love", topic: "家和家人", scenes: ["住处、搬家或装修", "和家人的相处", "让你有安全感的小事"] },
  { dim: "love", topic: "恋爱和创造力", scenes: ["约会和暧昧", "兴趣、创作和娱乐", "和孩子的相处"] },
  { dim: "career", topic: "日常工作和作息", scenes: ["手头的任务和同事", "作息、饮食和运动", "身体小毛病的调理"] },
  { dim: "love", topic: "伴侣和合作关系", scenes: ["恋爱对象或配偶", "重要的合作伙伴", "和客户的谈判"] },
  { dim: "wealth", topic: "共同的钱和深层的信任", scenes: ["共同账户、分摊费用", "亲密关系里的信任", "要放下的旧习惯"] },
  { dim: "wisdom", topic: "远行和进修", scenes: ["出国或长途旅行", "进修和考试", "你的价值观和信念"] },
  { dim: "career", topic: "事业和公众形象", scenes: ["职位和晋升", "在公司或行业里的名声", "上司对你的评价"] },
  { dim: "career", topic: "朋友和圈子", scenes: ["朋友聚会和社群", "长期的愿望", "通过朋友认识的机会"] },
  { dim: "health", topic: "独处和休息", scenes: ["睡眠和恢复", "藏在心里的事", "幕后的准备工作"] },
];

export type TransitPlanet = "jupiter" | "saturn" | "mars" | "venus" | "sun";

/** Templates by transiting planet. `{topic}` and `{scene}` come from HOUSES. */
export const PLANET_TEMPLATES: Record<TransitPlanet, { tone: Tone; direct: string[]; retro?: string[] }> = {
  jupiter: {
    tone: "good",
    direct: [
      "{T}木星走进{topic}这块领域，{scene}更容易出现顺利的机会，也容易遇到愿意帮忙的人。",
      "{T}木星照在{topic}上，{scene}运气偏好，放开手脚会有回报。",
      "{T}{topic}是木星眷顾的地方，尤其是{scene}，容易有好消息。",
    ],
    retro: [
      "{T}木星在{topic}这块领域逆行，好机会的脚步放慢，{scene}适合回头检查、补完旧计划，不急着扩张。",
      "{T}{topic}上的扩张暂时放缓，{scene}更适合复盘和打磨。",
    ],
  },
  saturn: {
    tone: "mixed",
    direct: [
      "{T}土星停在{topic}这块领域，{scene}要求更高、节奏更慢，但做扎实的事能管很久。",
      "{T}{topic}上你需要更有耐心，尤其是{scene}，别指望一步到位。",
      "{T}责任感压在{topic}上，{scene}会让你觉得累，同时也是练内功的好时候。",
    ],
    retro: [
      "{T}土星在{topic}这块领域逆行，旧问题被翻出来，{scene}适合重新梳理，慢慢来。",
      "{T}{topic}上的老课题回头找你，{scene}把基础补牢，后面会轻松很多。",
    ],
  },
  mars: {
    tone: "mixed",
    direct: [
      "{T}火星走过{topic}这块领域，{scene}的行动力很强，也容易急躁、火气上来。",
      "{T}{topic}上你容易心急，精力很足，{scene}要多留余地。",
    ],
  },
  venus: {
    tone: "good",
    direct: [
      "{T}金星来到{topic}这块领域，{scene}气氛融洽，容易有让人开心的小事。",
      "{T}{topic}上心情轻松，{scene}更容易得到别人的配合。",
    ],
  },
  sun: {
    tone: "mixed",
    direct: [
      "{T}太阳照亮{topic}这块领域，{scene}成为重点，值得你多花心思。",
      "{T}你的注意力会放在{topic}上，尤其是{scene}。",
    ],
  },
};

/** Jupiter house weights in years: houses where Jupiter is especially strong. */
export const JUPITER_STRONG_HOUSES = [1, 10];
/** Saturn on the Ascendant or Midheaven is most visible. */
export const SATURN_STRONG_HOUSES = [1, 10];

/** Without a birth time we only know signs. Index 0 = Aries. */
export const SIGN_THEMES: { dim: Dim; theme: string; scene: string }[] = [
  { dim: "career", theme: "主动开始新事物", scene: "想尝试的新项目或新方向" },
  { dim: "wealth", theme: "稳定的收入和享受生活", scene: "存钱、消费和生活品质" },
  { dim: "wisdom", theme: "学习和交流", scene: "读书、课程和日常沟通" },
  { dim: "love", theme: "家庭和情感", scene: "家里的事和亲近的人" },
  { dim: "love", theme: "展现自己和创造", scene: "兴趣、创作和约会" },
  { dim: "health", theme: "工作细节和身体调理", scene: "作息、饮食和手边的工作" },
  { dim: "love", theme: "伴侣和合作", scene: "感情和合作关系" },
  { dim: "wealth", theme: "共同资源和深层的信任", scene: "共同开销和亲密关系里的信任" },
  { dim: "wisdom", theme: "远行和视野", scene: "旅行、进修和长远的想法" },
  { dim: "career", theme: "事业和长期目标", scene: "职位、责任和长期规划" },
  { dim: "career", theme: "朋友圈和新想法", scene: "社群、朋友和新点子" },
  { dim: "health", theme: "想象力、休息和疗愈", scene: "睡眠、独处和内心的整理" },
];

export const SIGN_TEMPLATES: Record<"jupiter" | "saturn" | "sun", string[]> = {
  sun: [
    "{T}太阳走在{sign}，{theme}成为大家共同的话题，你也容易把心思放在{scene}上。",
    "{T}太阳走进{sign}，整体氛围偏向{theme}，{scene}值得多花点时间。",
  ],
  jupiter: [
    "{T}木星在{sign}，{theme}方面运气偏好，{scene}可以多一点尝试。",
    "{T}木星走在{sign}，{scene}容易遇到帮手，{theme}值得投入。",
  ],
  saturn: [
    "{T}土星在{sign}，{theme}方面要求更高、节奏偏慢，{scene}需要多一点耐心。",
    "{T}土星走在{sign}，{scene}要踏实积累，{theme}不能求快。",
  ],
};

/** Long-cycle events in a year. `key` combines planet, target and aspect. */
export const YEAR_EVENTS: Record<string, { dim: Dim; tone: Tone; weight: 1 | 2 | 3; phrase: Phrase; label: string }> = {
  "jupiter-return": {
    dim: "wisdom",
    tone: "good",
    weight: 3,
    label: "木星回归",
    phrase: {
      what: [
        "{T}是十二年一次的新循环起点：运势的“大周期”重新开始。适合定一个未来十年的方向，比如转行、进修、搬去想去的城市。",
        "{T}新一轮成长周期启动，你会更想扩大视野、尝试没做过的事。把想了很久的计划，这一年正式迈出去。",
      ],
    },
  },
  "saturn-return": {
    dim: "career",
    tone: "mixed",
    weight: 3,
    label: "土星回归",
    phrase: {
      what: [
        "{T}是约三十年一次的“成熟关口”：你会重新审视事业、关系和人生方向，有些东西要定型，有些要放下。",
        "{T}责任与现实感很强，适合做长远打算：定职业方向、整理关系、给人生重新立规矩。过程有点累，但很值得。",
      ],
      act: [
        "把未来三年想要的和不想要的各写五条，再挑一条本季度就开始做。",
        "别硬撑，找信得过的人聊聊你的压力，一步一步把基础打牢。",
      ],
    },
  },
  "saturn-sun-0": {
    dim: "health",
    tone: "mixed",
    weight: 3,
    label: "土星合本命太阳",
    phrase: {
      what: [
        "{T}土星回到你的太阳位置，自信和精力会被现实“压一压”，也是重新确定目标的时候。",
        "{T}责任和压力集中在你身上，容易觉得累，但这一年定下的方向会很稳固。",
      ],
    },
  },
  "saturn-sun-90": {
    dim: "career",
    tone: "mixed",
    weight: 2,
    label: "土星刑本命太阳",
    phrase: {
      what: [
        "{T}要求你对自己更严格，工作或目标上遇到限制，需要调整方法。",
        "{T}外界的规则和压力变多，自我表达容易被泼冷水，但坚持下去会有成果。",
      ],
    },
  },
  "saturn-sun-180": {
    dim: "career",
    tone: "mixed",
    weight: 2,
    label: "土星冲本命太阳",
    phrase: {
      what: [
        "{T}别人给你的期望和限制变大，容易与上司、长辈或伴侣对立，需要沟通出一个双方都能接受的做法。",
        "{T}你会感到来自外界的压力，要在个人目标与责任之间找平衡。",
      ],
    },
  },
  "saturn-moon-0": {
    dim: "health",
    tone: "mixed",
    weight: 3,
    label: "土星合本命月亮",
    phrase: {
      what: [
        "{T}情绪上更容易觉得孤单或压力大，家里的责任也变多。",
        "{T}内心有一种“要扛起来”的感觉，生活节奏变沉，需要更多睡眠和亲近的陪伴。",
      ],
    },
  },
  "saturn-moon-90": {
    dim: "health",
    tone: "mixed",
    weight: 2,
    label: "土星刑本命月亮",
    phrase: {
      what: [
        "{T}情绪容易低落或紧绷，生活上被责任拖住，需要主动安排放松的时间。",
        "{T}对安全感的需求变强，家人或居住的事需要你多花心思。",
      ],
    },
  },
  "saturn-moon-180": {
    dim: "love",
    tone: "mixed",
    weight: 2,
    label: "土星冲本命月亮",
    phrase: {
      what: [
        "{T}情绪与现实拉扯，亲近的人可能让你觉得被要求太多，也容易觉得不被理解。",
        "{T}需要在照顾别人与照顾自己之间划清界线，把需要说清楚。",
      ],
    },
  },
  "jupiter-sun-0": {
    dim: "career",
    tone: "good",
    weight: 3,
    label: "木星合本命太阳",
    phrase: {
      what: [
        "{T}木星回到你的太阳位置，自信、机会和好运一起到来，是被看见、被认可的一年。",
        "{T}想做的事容易得到支持，有机会得到晋升、荣誉或更大的舞台。",
      ],
    },
  },
  "jupiter-moon-0": {
    dim: "love",
    tone: "good",
    weight: 2,
    label: "木星合本命月亮",
    phrase: {
      what: [
        "{T}情绪比较饱满，家庭和亲近的关系带来温暖，容易有喜事或搬家、添丁之类的好消息。",
        "{T}内心有安全感，愿意向身边的人敞开，关系变得更近。",
      ],
    },
  },
};

/** Month events of fast planets to natal points. Key: planet-target-aspect (0 = conjunction, 180 = opposition). */
export const MONTH_EVENTS: Record<string, { dim: Dim; tone: Tone; weight: 1 | 2; what: string[] }> = {
  "venus-sun-0": { dim: "love", tone: "good", weight: 2, what: ["{T}约{day}，金星贴近你的太阳，你的魅力和人缘特别好，适合见人、约会、谈合作。"] },
  "venus-sun-180": { dim: "love", tone: "mixed", weight: 1, what: ["{T}约{day}，金星与你的太阳相对，对方的态度和你的想法容易有落差，沟通时多一点体贴。"] },
  "venus-moon-0": { dim: "love", tone: "good", weight: 2, what: ["{T}约{day}，金星贴近你的月亮，心情柔软，亲近的人带来温暖，适合约会和家庭聚会。"] },
  "venus-moon-180": { dim: "love", tone: "mixed", weight: 1, what: ["{T}约{day}，金星与你的月亮相对，情绪上想要被疼爱，也容易对小事敏感。"] },
  "venus-venus-0": { dim: "love", tone: "good", weight: 2, what: ["{T}约{day}，金星回到你出生时的位置，感情与审美被唤醒，适合重新打扮自己、约会或买点喜欢的小东西。"] },
  "venus-venus-180": { dim: "wealth", tone: "mixed", weight: 1, what: ["{T}约{day}，金星与你的金星相对，花钱和感情上的想法容易摇摆，购物前多想一想。"] },
  "venus-mc-0": { dim: "career", tone: "good", weight: 2, what: ["{T}约{day}，金星贴近你的事业点，工作中的人缘特别好，适合社交、面谈、展示。"] },
  "venus-mc-180": { dim: "career", tone: "mixed", weight: 1, what: ["{T}约{day}，金星与你的事业点相对，工作与私人生活之间要平衡，别因应酬耽误休息。"] },
  "mars-sun-0": { dim: "health", tone: "mixed", weight: 2, what: ["{T}约{day}，火星贴近你的太阳，精力非常足，适合冲刺目标，但容易冲动、上火。"] },
  "mars-sun-180": { dim: "career", tone: "bad", weight: 2, what: ["{T}约{day}，火星与你的太阳相对，容易与人产生正面冲突，脾气来了先数到十。"] },
  "mars-moon-0": { dim: "health", tone: "mixed", weight: 2, what: ["{T}约{day}，火星贴近你的月亮，情绪来得快，容易冲动，需要用运动释放能量。"] },
  "mars-moon-180": { dim: "love", tone: "bad", weight: 2, what: ["{T}约{day}，火星与你的月亮相对，亲近的人之间容易因小事起火，先让情绪降温再谈。"] },
  "mars-venus-0": { dim: "love", tone: "mixed", weight: 2, what: ["{T}约{day}，火星贴近你的金星，吸引力强，感情里火花多，也要留意急躁和占有欲。"] },
  "mars-venus-180": { dim: "love", tone: "bad", weight: 1, what: ["{T}约{day}，火星与你的金星相对，感情上容易急、容易争，话说慢一点。"] },
  "mars-mc-0": { dim: "career", tone: "mixed", weight: 2, what: ["{T}约{day}，火星贴近你的事业点，工作冲劲大，适合攻坚，也容易与上司较劲。"] },
  "mars-mc-180": { dim: "career", tone: "mixed", weight: 1, what: ["{T}约{day}，火星与你的事业点相对，工作节奏被催得很紧，先排好优先级再动手。"] },
  "sun-sun-0": { dim: "wisdom", tone: "good", weight: 2, what: ["{T}是你的生日月，太阳回到出生的位置，新一岁的起点：适合写下今年的目标，给自己安排一次小庆祝。"] },
  "sun-sun-180": { dim: "wisdom", tone: "mixed", weight: 1, what: ["{T}{day}前后是生日后的半年点，适合回顾这半年的目标完成了多少。"] },
  "sun-moon-0": { dim: "health", tone: "mixed", weight: 1, what: ["{T}约{day}，太阳贴近你的月亮，内在需求和外在行动一致，适合做让自己安心的决定。"] },
  "sun-moon-180": { dim: "health", tone: "mixed", weight: 1, what: ["{T}约{day}，太阳与你的月亮相对，理智与情绪各说各话，重大决定先睡一觉。"] },
  "sun-venus-0": { dim: "love", tone: "good", weight: 1, what: ["{T}约{day}，太阳贴近你的金星，感情与人缘被照亮，适合表达好感。"] },
  "sun-venus-180": { dim: "love", tone: "mixed", weight: 1, what: ["{T}约{day}，太阳与你的金星相对，关系里的期待与现实有落差，多沟通。"] },
  "sun-mc-0": { dim: "career", tone: "good", weight: 2, what: ["{T}约{day}，太阳贴近你的事业点，工作成绩容易被看到，适合汇报和展示。"] },
  "sun-mc-180": { dim: "career", tone: "mixed", weight: 1, what: ["{T}约{day}，太阳与你的事业点相对，工作与生活要平衡，别把时间都给了工作。"] },
};

export const MERCURY_RETRO: Phrase = {
  what: [
    "{T}水星逆行（约{range}）：沟通、行程和电子设备容易出现反复，约好的事可能改期。",
    "{T}水星逆行（约{range}）：旧人旧事容易回头找你，文件和消息也容易出现误会。",
    "{T}水星逆行（约{range}）：想法容易绕圈，发出去的消息可能被误读。",
  ],
  act: [
    "重要邮件和文件发出前多检查一遍，约好的事再确认一次时间和地点，设备记得备份。",
    "不急着签字或下新订单，先把旧事收尾，联系久未联系的人也很合适。",
    "出行多留半小时缓冲，重要的话当面说清楚，别只靠一条消息。",
  ],
};

export const MERCURY_DIRECT_SOON: Phrase = {
  what: [
    "{T}水星从逆行转为顺行（约{range}），之前卡住的沟通和计划开始松动。",
  ],
  act: ["把之前搁置的事重新拿出来推进，沟通上的结也可以趁现在解开。"],
};
