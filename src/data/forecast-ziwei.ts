import { AREAS_EN, FOCUS_TEMPLATES_EN, MUTAGEN_TEMPLATES_EN, HELPER_PHRASES_EN } from "./en/forecast-ziwei";
import { live } from "../i18n";
/** Plain-language texts for the 紫微斗数 period forecast. */
import type { Phrase } from "./forecast-common";
import type { Dim } from "./types";

/** What each natal palace stands for in daily life. `topic` and `scenes` fill the templates below. */
const AREAS_ZH: Record<string, { dim: Dim; topic: string; scenes: string[] }> = {
  命宫: { dim: "wisdom", topic: "你自己的状态和想法", scenes: ["个人形象和自我感觉", "你对自己的新规划"] },
  兄弟: { dim: "career", topic: "同辈和合作伙伴", scenes: ["和同事、同行的合作", "和兄弟姐妹的往来"] },
  夫妻: { dim: "love", topic: "感情和伴侣关系", scenes: ["和伴侣的相处", "新认识的人", "你对一段关系的期待"] },
  子女: { dim: "love", topic: "孩子、晚辈和创作", scenes: ["和孩子或晚辈的相处", "自己的作品和创意", "轻松的约会往来"] },
  财帛: { dim: "wealth", topic: "赚钱和花钱", scenes: ["工资和奖金", "日常开销", "副业或额外的进账"] },
  疾厄: { dim: "health", topic: "身体和压力", scenes: ["作息和睡眠", "情绪压力", "旧的小毛病"] },
  迁移: { dim: "career", topic: "出门和外面的机会", scenes: ["出差和旅行", "在外面认识的人", "想换个环境的念头"] },
  仆役: { dim: "career", topic: "朋友、同事和下属", scenes: ["同事和朋友的帮忙", "带团队、带新人", "社交圈里的人脉"] },
  官禄: { dim: "career", topic: "工作和事业", scenes: ["手上的项目和职位", "上司和客户", "跳槽或升职的机会"] },
  田宅: { dim: "wealth", topic: "家和居住环境", scenes: ["住处、搬家或装修", "家里的氛围", "家庭的开销"] },
  福德: { dim: "wisdom", topic: "内心感受和享受生活", scenes: ["休息和兴趣爱好", "心情和睡眠", "一个人独处的时间"] },
  父母: { dim: "wisdom", topic: "长辈、上司和文书", scenes: ["和父母、长辈的沟通", "证件、文件和考试", "上司对你的态度"] },
};

/** Templates by transformation. `{topic}` and `{scene}` come from AREAS. */
const MUTAGEN_TEMPLATES_ZH: Record<"禄" | "权" | "科" | "忌", string[]> = {
  禄: [
    "{T}{topic}上比较顺，{scene}容易有好消息。",
    "{T}在{scene}上，容易遇到顺心的事和帮得上忙的人。",
    "{T}{topic}这块运气偏好，{scene}不妨主动一点。",
  ],
  权: [
    "{T}你在{topic}上更有主见，{scene}可以主动拿主意。",
    "{T}{scene}上你更敢做决定，说话也更有分量。",
  ],
  科: [
    "{T}{topic}上容易得到好口碑，{scene}会有人愿意帮你。",
    "{T}关于{scene}，容易有懂行的人给你指路。",
  ],
  忌: [
    "{T}{topic}方面容易想太多，{scene}要多确认几遍。",
    "{T}{scene}上容易遇到小阻碍，节奏慢一点反而稳。",
    "{T}{topic}上心里有牵挂，{scene}会让你多想几遍。",
  ],
};

/** Palace-focus sentence: the period's life palace sits on this natal palace. */
const FOCUS_TEMPLATES_ZH: string[] = [
  "{T}你的注意力会集中在{topic}上，尤其是{scene}。",
  "{T}{topic}成了生活的重点，{scene}会占掉你不少心思。",
  "{T}围绕{topic}的事会变多，比如{scene}。",
];

const HELPER_PHRASES_ZH: Record<string, Phrase> = {
  贵人命: {
    what: [
      "{T}容易遇到愿意拉你一把的人，比如老同事、前辈或上司。想推进的事，主动约他们聊一聊。",
      "{T}身边有人愿意帮你说话、替你牵线。有想办的事，开口请教比自己闷头想快得多。",
    ],
    act: [],
  },
  贵人官: {
    what: [
      "{T}工作上有人托一把：上司或前辈愿意给你机会。手上的成果主动汇报一下，别等别人发现。",
      "{T}遇到卡住的项目，会有懂行的人出来指点。把难题带去请教，别自己扛。",
    ],
    act: [],
  },
  贵人财: {
    what: [
      "{T}钱的事上有人给你提醒或介绍机会，比如好的报价、靠谱的兼职。有线索先多问几个人再决定。",
      "{T}谈钱、谈报酬的场合有人帮腔，想争取的待遇可以认真提一次。",
    ],
    act: [],
  },
  禄财: {
    what: [
      "{T}进账的路子比较稳，工资、奖金、应得的款项容易按时到手。",
      "{T}赚钱的机会靠努力就能抓住，付出多少基本有回报。",
    ],
  },
  禄官: {
    what: [
      "{T}工作上顺风顺水，做出的成绩容易被看到。",
      "{T}手上的事推进得顺，同事和上司比较配合。",
    ],
  },
  喜夫妻: {
    what: [
      "{T}感情上有喜气：单身的人容易遇到心动的人，有伴侣的人适合聊聊未来的安排。",
      "{T}亲密关系里好事靠近，约会、见家人、讨论计划都容易顺利。",
    ],
  },
  喜命: {
    what: [
      "{T}人缘好，心情明亮，社交场合你会很受欢迎。",
      "{T}容易遇到让你开心的人和事，多出门走动。",
    ],
  },
  马迁移: {
    what: [
      "{T}出门、出差或换环境的机会变多，人也比较坐不住。",
      "{T}外出的安排增多，可能要跑动，也可能是你自己想换个地方看看。",
    ],
    act: [
      "行程提前订好，证件和充电器装进包里，路上留出缓冲时间。",
      "外出多的时候，把重要的事集中安排，避免来回奔波。",
    ],
  },
  羊陀: {
    what: [
      "{T}节奏时而太急时而太拖，容易磕磕碰碰，或者精神紧绷、上火。",
      "{T}做事容易急躁，身体上也容易有些小状况，比如落枕、扭伤或睡不好。",
    ],
    act: [
      "做事慢半拍，出门和运动多留意安全，累了就休息。",
      "每天留出十分钟放松，拉伸或散步，别让紧绷的状态积着。",
    ],
  },
};

export const AREAS = live(AREAS_ZH, AREAS_EN);
export const MUTAGEN_TEMPLATES = live(MUTAGEN_TEMPLATES_ZH, MUTAGEN_TEMPLATES_EN);
export const HELPER_PHRASES = live(HELPER_PHRASES_ZH, HELPER_PHRASES_EN);
export const FOCUS_TEMPLATES = live(FOCUS_TEMPLATES_ZH, FOCUS_TEMPLATES_EN);
