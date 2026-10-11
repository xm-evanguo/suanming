import type { Brief } from "./types";

export type PlanetKey =
  | "sun"
  | "moon"
  | "mercury"
  | "venus"
  | "mars"
  | "jupiter"
  | "saturn"
  | "uranus"
  | "neptune"
  | "pluto";

export type AspectKey = "conjunction" | "sextile" | "square" | "trine" | "opposition";

/** The ten classical and modern planets of a natal chart. */
export const PLANETS: Record<PlanetKey, Brief & { glyph: string; zh: string }> = {
  sun: {
    glyph: "☉\uFE0E",
    zh: "太阳",
    name: "太阳",
    keywords: ["自我", "生命力", "核心"],
    text: "太阳代表你的核心自我、意志与生命力，也是你想成为什么样的人。它所在的星座，决定了你最本真的光芒。",
  },
  moon: {
    glyph: "☽\uFE0E",
    zh: "月亮",
    name: "月亮",
    keywords: ["情绪", "安全感", "本能"],
    text: "月亮掌管你的情绪、习惯与内在需求，是你感到安心的方式。它描绘了你在放松时最真实的模样。",
  },
  mercury: {
    glyph: "☿\uFE0E",
    zh: "水星",
    name: "水星",
    keywords: ["思维", "沟通", "学习"],
    text: "水星掌管思考、说话与学习的方式，也影响你如何处理信息。它让你的想法有了形状和声音。",
  },
  venus: {
    glyph: "♀\uFE0E",
    zh: "金星",
    name: "金星",
    keywords: ["爱情", "审美", "价值"],
    text: "金星主管爱与审美，也反映你重视什么与如何享受。它揭示你被什么吸引，又如何去爱人。",
  },
  mars: {
    glyph: "♂\uFE0E",
    zh: "火星",
    name: "火星",
    keywords: ["行动", "欲望", "勇气"],
    text: "火星象征行动力、欲望与竞争心，是你追求目标的方式。它决定了你怎样出击，也怎样面对冲突。",
  },
  jupiter: {
    glyph: "♃\uFE0E",
    zh: "木星",
    name: "木星",
    keywords: ["幸运", "成长", "信念"],
    text: "木星代表扩张、机遇与信念，是命盘里的幸运之星。它指出你在哪些领域容易得到祝福与成长。",
  },
  saturn: {
    glyph: "♄\uFE0E",
    zh: "土星",
    name: "土星",
    keywords: ["责任", "界限", "考验"],
    text: "土星象征责任、秩序与时间的考验，带来限制也带来成熟。它指出你需要付出努力、也最终能收获稳固成就的地方。",
  },
  uranus: {
    glyph: "♅\uFE0E",
    zh: "天王星",
    name: "天王星",
    keywords: ["变革", "独特", "觉醒"],
    text: "天王星主管突变、创新与自由，打破旧有的框架。它在命盘中标出你与众不同、不愿随波逐流的部分。",
  },
  neptune: {
    glyph: "♆\uFE0E",
    zh: "海王星",
    name: "海王星",
    keywords: ["梦想", "灵性", "迷雾"],
    text: "海王星象征梦想、灵感与直觉，也带来模糊与幻象。它让你对美和神秘事物特别敏感。",
  },
  pluto: {
    glyph: "♇\uFE0E",
    zh: "冥王星",
    name: "冥王星",
    keywords: ["蜕变", "深层", "重生"],
    text: "冥王星代表深层的转化与权力议题，推动你经历毁灭与重生。它在命盘里指出你最强烈也最深刻的变化力量。",
  },
};

/** The five major aspects between planets. harmony: -1 tense, 0 neutral, 1 harmonious. */
export const ASPECTS: Record<AspectKey, Brief & { angle: number; glyph: string; harmony: number }> = {
  conjunction: {
    angle: 0,
    glyph: "☌\uFE0E",
    harmony: 0,
    name: "合相",
    keywords: ["融合", "放大", "聚焦"],
    text: "两颗行星紧紧靠在一起，能量彼此融合并被放大。它的效果取决于涉及的行星，既可能是强大的天赋，也可能是难以分开的牵绊。",
  },
  sextile: {
    angle: 60,
    glyph: "⚹\uFE0E",
    harmony: 1,
    name: "六分相",
    keywords: ["机会", "合作", "顺畅"],
    text: "两颗行星之间形成温和的助力，带来机会与互补。需要你主动伸手，才能把这份潜力变成成果。",
  },
  square: {
    angle: 90,
    glyph: "□",
    harmony: -1,
    name: "四分相",
    keywords: ["冲突", "挑战", "动力"],
    text: "两颗行星互相拉扯，带来摩擦与紧张。这种压力会逼你行动，克服之后常会成为你最大的成长动力。",
  },
  trine: {
    angle: 120,
    glyph: "△",
    harmony: 1,
    name: "三分相",
    keywords: ["和谐", "天赋", "顺势"],
    text: "两颗行星以最舒服的角度相互支持，能量自然流动，常表现为天赋与好运。别因为太顺手而忽略培养它。",
  },
  opposition: {
    angle: 180,
    glyph: "☍\uFE0E",
    harmony: -1,
    name: "对分相",
    keywords: ["对立", "平衡", "觉察"],
    text: "两颗行星遥遥相对，像天平的两端互相牵引。学会在两者之间找到平衡，你就能同时拥有两种力量。",
  },
};

/** Sentence prefix per planet. The UI appends a sign name and "的色彩。". */
export const PLANET_IN_SIGN_HINT: Record<"mercury" | "venus" | "mars", string> = {
  mercury: "你的思考与表达带着",
  venus: "你的爱与审美带着",
  mars: "你的行动与冲劲带着",
};
