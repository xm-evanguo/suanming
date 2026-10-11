import type { Trad } from "./hellenistic";

/** Chaldean "faces": the ruler of each 10-degree decan, starting with Mars on Aries 0-10. */
export const FACE_START: Trad = "mars";

/** How the ruler of the Sun's decan colours the Sun sign. Plain Chinese. */
export const DECAN_FLAVOR: Record<Trad, string> = {
  sun: "你的太阳被自己的光加了一层，自信和领导的味道更浓，别人容易把你当成主心骨。",
  moon: "你的太阳带着月亮的柔软，感受力强，做决定时会先问自己舒不舒服，也很会照顾身边人。",
  mercury: "你的太阳带着水星的机灵，脑子转得快，爱学爱问，嘴上功夫和文字功夫都是你的帮手。",
  venus: "你的太阳带着金星的柔光，待人温和，审美好，人缘也比同星座的人更顺一点。",
  mars: "你的太阳带着火星的劲头，行动力强，遇事敢出头，只是脾气上来时要给自己留个缓冲。",
  jupiter: "你的太阳带着木星的宽厚，眼界开阔，乐观，容易遇到愿意提携你的前辈。",
  saturn: "你的太阳带着土星的沉稳，做事靠谱、肯下苦功，成熟得比同龄人早一些。",
};

/** Technical one-liners for the faces, used in sections. */
export const FACE_TECH: Record<Trad, string> = {
  sun: "太阳之面：权威、荣誉与自我实现",
  moon: "月亮之面：感受、记忆与照护",
  mercury: "水星之面：智识、言说与技艺",
  venus: "金星之面：亲和、审美与愉悦",
  mars: "火星之面：行动、竞争与勇气",
  jupiter: "木星之面：扩张、慷慨与信念",
  saturn: "土星之面：约束、耐力与责任",
};

export const WEEK_HISTORY =
  "七天一周的名字来自这套体系：古人按行星距离地球的远近排成“土星、木星、火星、太阳、金星、水星、月亮”（迦勒底序），再把一天分成 24 个小时，依次交给七颗星轮流守护。每天的第一个小时由哪颗星守，那一天就以它命名。从土星日起每天的第一小时跳过三颗星，于是依次得到日、月、火、水、木、金、土的顺序。中文的“星期日、星期一……”以及“日月火水木金土”，都是这套安排的回声。";

/** How the day ruler and the hour ruler relate, based on traditional nature. */
export const TRIO_TEXT = {
  soft: "三颗星里温和的占多数，做事阻力偏小，遇到事容易有人帮一把。",
  hard: "三颗星里严厉的占多数，你的路更像“先吃苦、后见成果”，耐心是你最大的本钱。",
  even: "三颗星软硬相济，有顺风也有逆风，靠自己调整节奏就能走得稳。",
  repeat: "有两颗以上是同一颗星，这颗星的气质在你身上特别明显，几乎成了你的标签。",
};
