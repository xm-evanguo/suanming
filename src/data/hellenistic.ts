import type { Dim, Scores, WuXing } from "./types";
import { PLANETS } from "./planets";

/** The seven traditional planets (the only ones the ancient systems use). */
export type Trad = "sun" | "moon" | "mercury" | "venus" | "mars" | "jupiter" | "saturn";

/** Chaldean order, slowest to fastest. Planetary hours and firdaria sub-periods run through it. */
export const CHALDEAN_ORDER: Trad[] = ["saturn", "jupiter", "mars", "sun", "venus", "mercury", "moon"];

/** Weekday (0 = Sunday) to ruling planet. */
export const WEEKDAY_RULER: Trad[] = ["sun", "moon", "mars", "mercury", "jupiter", "venus", "saturn"];
export const WEEKDAY_ZH = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];

/** Traditional domicile rulers of the 12 signs, Aries first. */
export const SIGN_RULER: Trad[] = ["mars", "venus", "mercury", "moon", "sun", "mercury", "venus", "mars", "jupiter", "saturn", "saturn", "jupiter"];

/** Exaltation sign index of each planet. */
export const EXALTATION: Record<Trad, number> = { sun: 0, moon: 1, mercury: 5, venus: 11, mars: 9, jupiter: 3, saturn: 6 };

export type Dignity = "domicile" | "exaltation" | "detriment" | "fall" | "peregrine";

export const DIGNITY_NAME: Record<Dignity, string> = {
  domicile: "入庙",
  exaltation: "擢升",
  detriment: "落陷",
  fall: "入弱",
  peregrine: "无特殊尊贵",
};

/** Plain-language description of a dignity. */
export const DIGNITY_PLAIN: Record<Dignity, string> = {
  domicile: "在自己家里，发挥得很自在",
  exaltation: "被抬举的位置，容易得到尊重",
  detriment: "在不对盘的环境里，需要多花力气",
  fall: "有点失去底气，要靠准备来补",
  peregrine: "没有特别的助力，也没有特别的阻力",
};

export function dignityOf(p: Trad, sign: number): Dignity {
  if (SIGN_RULER[sign] === p) return "domicile";
  if (EXALTATION[p] === sign) return "exaltation";
  if (SIGN_RULER[(sign + 6) % 12] === p) return "detriment";
  if (EXALTATION[p] === (sign + 6) % 12) return "fall";
  return "peregrine";
}

export type Nature = "luminary" | "benefic" | "malefic" | "neutral";

export interface TradInfo {
  zh: string;
  glyph: string;
  /** Weekday character, e.g. "日". */
  weekday: string;
  nature: Nature;
  wx: WuXing;
  /** Technical keywords. */
  kw: string[];
  /** What the planet manages, in everyday words. Fits the slot "（管…）". */
  plainKw: string;
  /** How the planet behaves when well placed / badly placed / mixed. Plain, fits after "它". */
  strong: string;
  weak: string;
  mixed: string;
  /** The kind of life stage it brings as a firdaria period. */
  stage: string;
  /** What a day or an hour ruled by this planet suits. */
  dayText: string;
  hourText: string;
  /** Short epithet for sections. */
  title: string;
  colors: string[];
  numbers: number[];
  dir: string;
  scores: Scores;
}

const g = (k: keyof typeof PLANETS) => PLANETS[k].glyph;

export const TRAD_INFO: Record<Trad, TradInfo> = {
  sun: {
    zh: "太阳", glyph: g("sun"), weekday: "日", nature: "luminary", wx: "火",
    kw: ["自我", "权威", "名望"], plainKw: "自信和被看见",
    strong: "底气足，别人愿意听你的，也愿意把重要的事交给你",
    weak: "容易没底气，或者太想被看见而用力过猛",
    mixed: "想被认可的心很强，表现好不好取决于你有没有提前做准备",
    stage: "站到台前、承担核心角色的阶段",
    dayText: "适合见上司、谈晋升、做需要被看见的事，比如汇报和面试",
    hourText: "适合表达立场、见长辈或上司、做要露面的事",
    title: "太阳 · 王者之光",
    colors: ["金色", "橙色"], numbers: [1, 4], dir: "东",
    scores: { career: 85, wealth: 70, love: 68, health: 80, wisdom: 70 },
  },
  moon: {
    zh: "月亮", glyph: g("moon"), weekday: "一", nature: "luminary", wx: "水",
    kw: ["情绪", "身体", "家人"], plainKw: "情绪、睡眠和家人",
    strong: "情绪稳、人缘软，家人和同事都愿意靠近你",
    weak: "情绪起伏大，容易失眠或想太多",
    mixed: "心情会跟着环境上下，需要固定的作息来托住自己",
    stage: "生活节奏、家人和情绪被放到前面的阶段",
    dayText: "适合处理家事、整理房间、照顾家人，也适合早点休息",
    hourText: "适合做家务、整理情绪、联系家人和老朋友",
    title: "月亮 · 潮汐与家",
    colors: ["银白", "乳白"], numbers: [2, 7], dir: "西北",
    scores: { career: 60, wealth: 62, love: 80, health: 68, wisdom: 72 },
  },
  mercury: {
    zh: "水星", glyph: g("mercury"), weekday: "三", nature: "neutral", wx: "水",
    kw: ["沟通", "学习", "买卖"], plainKw: "沟通、学习和文书",
    strong: "脑子清楚、嘴上利落，谈事情和写东西都顺",
    weak: "容易说错话、看漏细节，邮件和合同要多看一遍",
    mixed: "点子很多但容易分心，列清单才不会乱",
    stage: "学习、沟通、奔走和谈生意的阶段",
    dayText: "适合写、谈、学、发邮件、签文件和短途出差",
    hourText: "适合写方案、回消息、谈价格和做功课",
    title: "水星 · 信使之笔",
    colors: ["翠绿", "浅灰"], numbers: [5], dir: "北",
    scores: { career: 72, wealth: 76, love: 64, health: 66, wisdom: 88 },
  },
  venus: {
    zh: "金星", glyph: g("venus"), weekday: "五", nature: "benefic", wx: "金",
    kw: ["爱", "美", "和谐"], plainKw: "感情、审美和人缘",
    strong: "人缘好、审美在线，容易遇到让你舒服的人和事",
    weak: "容易为了讨好别人委屈自己，或者在花钱上冲动",
    mixed: "吸引力是有的，但需要你分清自己真正想要什么",
    stage: "关系、享受和人缘变得重要的阶段",
    dayText: "适合约会、聚会、买衣服、布置房间和修复关系",
    hourText: "适合见喜欢的人、约朋友、打扮自己和谈和气的事",
    title: "金星 · 爱与美",
    colors: ["玫瑰粉", "浅白"], numbers: [6], dir: "东南",
    scores: { career: 62, wealth: 78, love: 88, health: 74, wisdom: 68 },
  },
  mars: {
    zh: "火星", glyph: g("mars"), weekday: "二", nature: "malefic", wx: "火",
    kw: ["行动", "竞争", "勇气"], plainKw: "行动和勇气",
    strong: "有冲劲，敢开口也敢行动，推进事情很利落",
    weak: "脾气容易上来，做事偏急，容易和人起冲突",
    mixed: "干劲足但容易冲过头，动手前先想三秒",
    stage: "要主动出击、竞争和拼体力的阶段",
    dayText: "适合运动、开工、做需要冲劲的事，少和人争论",
    hourText: "适合锻炼、动手干活、推进拖了很久的事",
    title: "火星 · 战士之刃",
    colors: ["朱红", "赭红"], numbers: [9], dir: "南",
    scores: { career: 82, wealth: 62, love: 68, health: 82, wisdom: 56 },
  },
  jupiter: {
    zh: "木星", glyph: g("jupiter"), weekday: "四", nature: "benefic", wx: "木",
    kw: ["扩张", "贵人", "信念"], plainKw: "机会、贵人和眼界",
    strong: "贵人运好，机会多，愿意帮你的人也多",
    weak: "容易盲目乐观，答应得太多、花得太多",
    mixed: "机会是有的，但要自己筛选，别什么都接",
    stage: "机会增多、眼界打开、容易得到帮助的阶段",
    dayText: "适合请教前辈、做规划、拜访长辈和办喜事",
    hourText: "适合求助、谈合作、报名学习和做长远打算",
    title: "木星 · 天空之父",
    colors: ["明黄", "宝蓝"], numbers: [3], dir: "东北",
    scores: { career: 80, wealth: 88, love: 76, health: 78, wisdom: 84 },
  },
  saturn: {
    zh: "土星", glyph: g("saturn"), weekday: "六", nature: "malefic", wx: "土",
    kw: ["责任", "时间", "界限"], plainKw: "责任、规矩和耐心",
    strong: "耐得住性子，慢慢积累会看到扎实的成果",
    weak: "压力偏大，容易觉得事情推不动，也容易拖延",
    mixed: "进度慢但稳，需要你给自己定清楚的节奏",
    stage: "打基础、扛责任、慢慢熬出成果的阶段",
    dayText: "适合做长期规划、清理旧物、做需要耐心的苦功",
    hourText: "适合整理资料、复盘、做需要专注的单调工作",
    title: "土星 · 时间老人",
    colors: ["墨黑", "深蓝"], numbers: [8], dir: "西",
    scores: { career: 76, wealth: 68, love: 54, health: 58, wisdom: 82 },
  },
};

// ───────────────────────── Houses (whole sign)

export interface HouseInfo {
  /** Hellenistic place name. */
  name: string;
  /** 2-character label for the wheel. */
  short: string;
  /** Technical topic line. */
  topic: string;
  /** Everyday topic, usable as the subject of a sentence ("今年的重心是…"). */
  plainTopic: string;
  dim: Dim;
  /** Actions that fit when the house is supported / when care is needed. Each is one full sentence. */
  good: string[];
  care: string[];
}

export const HOUSES: HouseInfo[] = [
  {
    name: "命宫", short: "自我", topic: "生命、身体与自我形象", plainTopic: "你自己的状态和形象", dim: "health",
    good: ["适合给自己换个新形象，或者开始一个坚持得住的运动习惯。", "想做的个人计划，现在就启动，比等“准备好”更有效。"],
    care: ["别把所有事都扛在自己身上，先睡够再做决定。", "少和人较劲，先把自己的节奏理顺。"],
  },
  {
    name: "财帛宫", short: "财产", topic: "财产、收入与谋生", plainTopic: "收入和花钱的习惯", dim: "wealth",
    good: ["适合谈加薪、接兼职、整理账目，每月先把要存的钱转出去。", "手上有技能可以变现的话，现在报价会比平时更站得住。"],
    care: ["大件消费先放三天再决定。", "记一个月的账，找出最容易漏掉的小额支出。"],
  },
  {
    name: "兄弟宫", short: "兄弟", topic: "兄弟姐妹、邻里与短途", plainTopic: "身边的沟通：兄弟姐妹、邻居、同事和日常出行", dim: "wisdom",
    good: ["适合报个短期课程、多写多说，也适合和兄弟姐妹或老同事联络。", "要写的方案、要发的邮件，现在表达会比较清楚。"],
    care: ["重要的话当面说或打电话说清楚，别只靠文字消息。", "出远门前检查好证件和车况，路上别赶时间。"],
  },
  {
    name: "田宅宫", short: "家宅", topic: "父母、家宅与根基", plainTopic: "家、家人和住的地方", dim: "love",
    good: ["适合整理房间、看房子，或者和家人好好吃几顿饭。", "把家里的一个角落收拾成能安心休息的地方。"],
    care: ["和家人有分歧时先听完再说，别在饭桌上翻旧账。", "搬家或装修的事，先问清费用再定。"],
  },
  {
    name: "子女宫", short: "子女", topic: "子女、恋爱与快乐，善运之位", plainTopic: "恋爱、兴趣和让你开心的事", dim: "love",
    good: ["适合约会、发展一个爱好，或者和孩子、年轻朋友一起玩。", "主动邀请有好感的人看电影、吃饭，比一直猜心思有用。"],
    care: ["开心的事别过量，熬夜聚会少一点。", "对感情先别急着要答案，相处几次再看。"],
  },
  {
    name: "疾厄宫", short: "疾劳", topic: "疾病与劳役，恶运之位", plainTopic: "日常工作的负担和身体的小毛病", dim: "health",
    good: ["适合把工作流程理顺，养成固定的运动和睡眠时间。", "把拖着的杂事一口气清掉，会轻松很多。"],
    care: ["睡眠和饮食先照顾好，累了就停一停。", "同事交代的事先问清楚范围，别什么都揽。"],
  },
  {
    name: "夫妻宫", short: "婚姻", topic: "婚姻、伴侣与公开的对手", plainTopic: "伴侣、合作对象和合同", dim: "love",
    good: ["适合谈合作、见对象的家人，或者把一段关系说清楚。", "和重要的人坐下来，直接说说你们各自想要什么。"],
    care: ["签合同前逐条读完，不确定的条款先问清楚。", "吵架时先停十分钟，再回头谈。"],
  },
  {
    name: "共有宫", short: "共有", topic: "他人之财、遗产与转变", plainTopic: "和别人共同拥有的钱、债务和人生的转折", dim: "wealth",
    good: ["适合理清共同账户、贷款或保险这类长期安排。", "放下一个已经耗着你的旧习惯或旧关系，反而轻松。"],
    care: ["借钱或合伙出资之前，先写清楚各自负责多少。", "情绪低的时候，先不要做大的决定。"],
  },
  {
    name: "迁移宫", short: "远行", topic: "远行、信仰与高等学问，神之位", plainTopic: "远行、进修和你所相信的道理", dim: "wisdom",
    good: ["适合出远门、报进修课程，或者读一本拓宽视野的书。", "有出国、考试或写论文的计划，现在推进比较顺。"],
    care: ["行程订得宽松一点，别把每天排满。", "别被一句“大道理”带着走，自己多查一查。"],
  },
  {
    name: "官禄宫", short: "事业", topic: "事业、声望与社会地位", plainTopic: "事业、职位和你在上司眼里的样子", dim: "career",
    good: ["适合把成果拿给上司看，或者主动接一个能被看见的项目。", "面试、晋升谈话可以放心去，提前准备好三个具体的成绩。"],
    care: ["别在公开场合抱怨，工作上的分歧私下谈。", "手头的项目先收尾，再接新的。"],
  },
  {
    name: "福德宫", short: "友人", topic: "朋友、盟友与期望，善灵之位", plainTopic: "朋友、人脉和团队", dim: "wealth",
    good: ["适合参加聚会和行业活动，让朋友把资源介绍给你。", "把想做的事说给信得过的朋友听，常会得到意外的帮助。"],
    care: ["交朋友看对方做了什么，不只看说了什么。", "朋友的请求要量力而行，不必勉强答应。"],
  },
  {
    name: "玄秘宫", short: "暗处", topic: "隐藏之事、独处与阻碍，恶灵之位", plainTopic: "独处、幕后的事和暗中的压力", dim: "wisdom",
    good: ["适合安静地整理思绪、做幕后准备，或者帮助有需要的人。", "一个人散步、写日记，能帮你想清一件拖了很久的事。"],
    care: ["有心事别憋着，找信得过的人聊聊。", "少在背后议论人，也别轻信没来源的消息。"],
  },
];

/** Houses 1, 4, 7, 10 are angular; 2, 5, 8, 11 succeedent; the rest cadent. */
export const houseKind = (house: number): "angular" | "succeedent" | "cadent" =>
  [1, 4, 7, 10].includes(house) ? "angular" : [2, 5, 8, 11].includes(house) ? "succeedent" : "cadent";

/** Places the tradition treats as difficult. */
export const BAD_PLACES = [6, 8, 12];

// ───────────────────────── Sect

export interface SectInfo {
  name: string;
  light: Trad;
  benefic: Trad;
  maleficContrary: Trad;
  maleficOfSect: Trad;
  beneficContrary: Trad;
  text: string;
}

export const SECT: Record<"day" | "night", SectInfo> = {
  day: {
    name: "日间盘", light: "sun", benefic: "jupiter", maleficOfSect: "saturn", maleficContrary: "mars", beneficContrary: "venus",
    text: "出生时太阳在地平线之上。日间盘以太阳为主光，木星是顺应日间的吉星，最能帮到你；土星顺应日间，凶性较收敛；火星与日间“逆向”，是需要多留意的一颗。",
  },
  night: {
    name: "夜间盘", light: "moon", benefic: "venus", maleficOfSect: "mars", maleficContrary: "saturn", beneficContrary: "jupiter",
    text: "出生时太阳在地平线之下。夜间盘以月亮为主光，金星是顺应夜间的吉星，最能帮到你；火星顺应夜间，凶性较收敛；土星与夜间“逆向”，是需要多留意的一颗。",
  },
};

export const LOT_TEXT = {
  fortune: {
    name: "福点", glyph: "⊗︎",
    meaning: "福点（Lot of Fortune）以月亮为核心，代表身体、健康与物质际遇——命运“送到你手上的东西”。",
  },
  spirit: {
    name: "精神点", glyph: "⊕︎",
    meaning: "精神点（Lot of Spirit）以太阳为核心，代表心智、志向与职业选择——你“主动想去做的事”。",
  },
};

/** Short lines about where a lot falls, keyed by house (1-12), for the Lot of Fortune. */
export const FORTUNE_IN_HOUSE: string[] = [
  "福点落在命宫：运气与你本人的状态紧紧相连，把身体和精神养好，好运自然跟着来。",
  "福点落在财帛宫：物质运不错，靠自己的手艺和专业积累，收入有机会稳步增长。",
  "福点落在兄弟宫：好运常从身边人、同事、邻里和日常沟通里来，多交流多走动。",
  "福点落在田宅宫：家和根基给你托底，置产、居家和家人的支持是你的福气所在。",
  "福点落在子女宫：快乐、恋爱、创作和孩子，是你最容易“被好运眷顾”的地方。",
  "福点落在疾厄宫：福气藏在日常的劳作与自律里，规律的生活比大机遇更能养你。",
  "福点落在夫妻宫：好运多经由伴侣和合作者而来，一段好的搭档关系就是你的福点。",
  "福点落在共有宫：福气来自共有的资源、长辈的馈赠和一次次的转机，善于借力。",
  "福点落在迁移宫：远行、学习和更大的视野给你带来福气，走得越远机会越多。",
  "福点落在官禄宫：事业和声望是你的福气所在，被看见、被信任的机会比常人多。",
  "福点落在福德宫：朋友和社群是你的福气所在，一个好圈子会不断给你送来机会。",
  "福点落在玄秘宫：福气在幕后与独处中积累，需要你更主动地去发现，而不是等别人递给你。",
];

export const SPIRIT_IN_HOUSE: string[] = [
  "精神点落在命宫：你的志向与自我高度重合，适合走“以人立业”的路，靠个人风格取胜。",
  "精神点落在财帛宫：你想做的事和谋生紧密相连，擅长把想法变成实实在在的收入。",
  "精神点落在兄弟宫：你的志趣在表达、教学、写作与沟通，信息就是你的工具。",
  "精神点落在田宅宫：你想守住的是根基——家业、土地、家族传承，或在家中展开的事业。",
  "精神点落在子女宫：你的志向带着创造与热情，适合艺术、娱乐、教育、与孩子相关的领域。",
  "精神点落在疾厄宫：你愿意在细致、服务与照顾他人的工作里下功夫，匠人精神明显。",
  "精神点落在夫妻宫：你的志向靠合作与客户成就，适合咨询、谈判、需要面对面的事。",
  "精神点落在共有宫：你被深入、研究、金融或他人托付的事务吸引，愿意处理复杂的局面。",
  "精神点落在迁移宫：你的志向在远方与学问，教育、出版、外贸、研究都是合适的方向。",
  "精神点落在官禄宫：你的志向与事业方向一致，天然想要站在公共的位置，有领导的格局。",
  "精神点落在福德宫：你的志向靠团队与人脉实现，适合社群、平台、需要联合众人的事。",
  "精神点落在玄秘宫：你的志向偏幕后、专注与内省，适合研究、写作、辅导和不求闻达的工作。",
];

/** Plain-language versions (second person, no jargon), keyed by house 1-12. */
export const FORTUNE_PLAIN: string[] = [
  "你的好运跟你本人的状态绑在一起：睡得好、心情稳的时候，机会就多。",
  "你的好运多来自自己的手艺和专业，踏实积累收入，比押宝更适合你。",
  "你的好运常从身边人来：同事、邻居、兄弟姐妹随口的一个消息，可能就是转机。",
  "你的好运来自家和根基：家人的支持、一个住得舒服的地方，会成为你的底气。",
  "你的好运藏在让你开心的事里：恋爱、爱好、和孩子相处，越投入越有回报。",
  "你的好运来自日复一日的自律：规律的作息和认真做事，比大机遇更养你。",
  "你的好运常经由伴侣和合作者而来：遇到一个合拍的搭档，比单打独斗强。",
  "你的好运来自“别人的资源”：长辈的帮助、共同的项目、一次次转机，要学会借力。",
  "你的好运在远方和学习里：出去走走、多学一门东西，机会就多一分。",
  "你的好运和事业绑在一起：被看见、被信任的机会比一般人多，别躲着。",
  "你的好运来自朋友和圈子：一个好圈子会不断给你送来机会和消息。",
  "你的好运藏在安静处：需要你主动去发现，而不是等别人递给你。",
];

export const SPIRIT_PLAIN: string[] = [
  "你适合靠“人”立业：个人风格鲜明的工作，比如做自己的品牌、做主讲或带队。",
  "你适合能直接变成收入的工作：手艺、专业服务、销售、理财相关的岗位。",
  "你适合靠表达吃饭：写作、教学、媒体、翻译，以及需要大量沟通的岗位。",
  "你适合守住“根基”的事：地产、家居、家族生意，或者在家里就能展开的工作。",
  "你适合带点创造和热情的领域：设计、艺术、娱乐、教育和陪伴孩子的工作。",
  "你适合细致、服务型的工作：运营、技术支持、品质管理和照顾他人的岗位。",
  "你适合面对面合作的工作：咨询、谈判、客户关系，以及需要搭档的事业。",
  "你适合处理复杂局面的工作：金融、研究、风险管理，帮人理清共同的账。",
  "你适合和远方、学问相关的工作：教育、出版、外贸、研究和跨国业务。",
  "你适合站在公开位置的工作：管理、公职，以及需要领头的岗位，你有这个格局。",
  "你适合靠团队和人脉的工作：社群运营、平台、需要联合众人的项目。",
  "你适合幕后、专注的工作：研究、写作、辅导，不求热闹，但能做得很深。",
];
