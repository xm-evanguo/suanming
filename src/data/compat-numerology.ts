/**
 * Life path compatibility. Master numbers 11, 22, 33 are paired by their base number (2, 4, 6).
 * Pythagorean-style writers group the numbers into three natural families; the cross-family lists below
 * follow the commonly cited "complement" and "friction" pairs. Schools differ, so the result is a guide only.
 */
export type PairKind = "same" | "family" | "complement" | "friction" | "neutral";

/** Natural families: independent thinkers, builders, expressive carers. */
export const NUM_FAMILIES: number[][] = [
  [1, 5, 7],
  [2, 4, 8],
  [3, 6, 9],
];

const COMPLEMENT: [number, number][] = [
  [1, 3],
  [2, 6],
  [3, 5],
  [4, 6],
  [6, 8],
  [1, 9],
  [7, 9],
];
const FRICTION: [number, number][] = [
  [1, 8],
  [4, 5],
  [5, 6],
  [2, 5],
  [3, 4],
  [4, 9],
  [3, 8],
];

export const baseNumber = (n: number) => (n === 11 ? 2 : n === 22 ? 4 : n === 33 ? 6 : n);

const has = (list: [number, number][], a: number, b: number) => list.some(([x, y]) => (x === a && y === b) || (x === b && y === a));

export function pairKind(a: number, b: number): PairKind {
  const x = baseNumber(a);
  const y = baseNumber(b);
  if (a === b) return "same";
  if (NUM_FAMILIES.some((f) => f.includes(x) && f.includes(y))) return "family";
  if (has(COMPLEMENT, x, y)) return "complement";
  if (has(FRICTION, x, y)) return "friction";
  return "neutral";
}

export const PAIR_SCORE: Record<PairKind, number> = { same: 72, family: 82, complement: 68, friction: 40, neutral: 55 };

/** What the sum of the two life paths (the relationship number) points to. */
export const RELATIONSHIP_NUMBER: Record<number, string> = {
  1: "共同开创一件事",
  2: "彼此配合、互相倾听",
  3: "一起表达、一起玩",
  4: "把日子过得稳当有序",
  5: "常有变化，需要灵活",
  6: "照顾彼此和家庭",
  7: "互相给空间，一起思考",
  8: "一起做事业、管资源",
  9: "超越自己，一起完成大事",
};

/** What a person with this life path typically brings as help. */
export const HELP_BRINGS: Record<number, { career: string; general: string }> = {
  1: { career: "敢带你往前冲，帮你把犹豫的事变成行动", general: "推你开始行动" },
  2: { career: "擅长牵线协调，能把你引进合适的圈子", general: "耐心倾听、从中调解" },
  3: { career: "擅长表达和人脉，能帮你把想法说出去", general: "带来轻松的气氛和灵感" },
  4: { career: "能给你清晰的流程和扎实的方法，让事情落地", general: "把事情安排得稳妥" },
  5: { career: "能带来新信息和新机会，帮你打开视野", general: "带来变化和新鲜体验" },
  6: { career: "会在你需要时托底，给你关怀和实在的支持", general: "照顾你、给你家的感觉" },
  7: { career: "善于分析判断，能帮你看清行业和风险", general: "给你冷静的见解" },
  8: { career: "有管理和资源方面的经验，能为你指路", general: "帮你把目标变成成果" },
  9: { career: "格局大、人脉广，能让你看到更长远的方向", general: "宽厚包容、带你看大局" },
};
