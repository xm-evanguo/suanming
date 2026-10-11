import type { AspectKey } from "./planets";

/** Plain-language tables for the 西洋占星 page. Key names match `PlanetKey` in `core/chart.ts`. */
export const PLAIN_PLANET: Record<string, string> = {
  sun: "核心的自己",
  moon: "情绪和安全感",
  mercury: "思考和说话方式",
  venus: "爱与审美",
  mars: "行动力和脾气",
  jupiter: "运气和乐观",
  saturn: "责任和自律",
  uranus: "求变和独立",
  neptune: "想象力和敏感",
  pluto: "深层的转变",
};

/** How two planets in an aspect act on each other, in everyday words. */
export const PLAIN_ASPECT: Record<AspectKey, string> = {
  conjunction: "叠在一起，会互相放大，这两块在你身上特别明显",
  sextile: "互相帮忙，只要你主动用，就会变成实在的机会",
  square: "有点互相拉扯，会让你焦虑，也会逼你行动、变强",
  trine: "配合得很顺手，是你的天赋，别因为太顺而不去练",
  opposition: "像天平两端，你会在两种需要之间摇摆，学会兼顾就是强项",
};

/** Advice for the weakest of the four western elements. */
export const PLAIN_WEST_LACK: Record<string, string> = {
  火: "你身上“行动和热情”的部分相对少一点，想做的事可以先迈出最小的一步，别等到完全准备好。",
  土: "你身上“务实和耐心”的部分相对少一点，可以用清单、预算和固定习惯，帮自己把想法落到地上。",
  风: "你身上“思考和沟通”的部分相对少一点，重要的事多说出口、多问几句，别让对方猜。",
  水: "你身上“感受和共情”的部分相对少一点，可以多留意身边人的情绪，偶尔停下来问问自己“我现在感觉怎么样”。",
};
