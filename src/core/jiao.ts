/**
 * 掷圣杯 (擲筊): the temple practice with two crescent-shaped blocks. Each block has a flat side (阳面)
 * and a round side (阴面). One flat and one round is 圣杯, two flat is 笑杯, two round is 阴杯.
 * Each block is modelled as a fair coin. Real blocks are not exactly 50/50.
 * The faces come from the question and the local minute, like the tarot draw. It is a ritual and does
 * not make the answer more accurate.
 */
import { minuteStamp, normalizeQuestion, seededInt, seededStream } from "./draw-seed";

/** Separate from the tarot SEED_VERSION, so the two rituals never share a seed. */
export const JIAO_SEED_VERSION = "jiao-v1";
export const MAX_THROWS = 3;

export type Face = "flat" | "round";
export type JiaoResult = "圣杯" | "笑杯" | "阴杯";
export type JiaoThrow = { a: Face; b: Face; result: JiaoResult };

export function jiaoResult(a: Face, b: Face): JiaoResult {
  if (a === b) return a === "flat" ? "笑杯" : "阴杯";
  return "圣杯";
}

/** Throw number `index` (0-based) for this question in this local minute. The same inputs give the same throw. */
export function throwJiao(question: string, at: Date, index: number): JiaoThrow {
  const next = seededStream([JIAO_SEED_VERSION, normalizeQuestion(question), minuteStamp(at), String(index)].join("\n"));
  const a: Face = seededInt(next, 2) === 1 ? "flat" : "round";
  const b: Face = seededInt(next, 2) === 1 ? "flat" : "round";
  return { a, b, result: jiaoResult(a, b) };
}

export const RESULT_MEANING: Record<JiaoResult, { faces: string; text: string }> = {
  圣杯: { faces: "一平一圆", text: "神明同意，事情可行。" },
  笑杯: { faces: "两个平面向上", text: "神明笑而不答：问题不清楚，或答案其实已经很明显。" },
  阴杯: { faces: "两个圆面向上", text: "神明不同意，或时机未到。" },
};

export type JiaoVerdict = {
  /** `yes` is three 圣杯 in a row. `no` is a 阴杯. `unclear` is a 笑杯. `going` means more throws are needed. */
  tone: "yes" | "no" | "unclear" | "going";
  title: string;
  text: string;
  /** True when no more throws are needed. */
  done: boolean;
};

/**
 * The reading of a run of throws. Common practice: only three 圣杯 in a row count as a firm yes.
 * A 阴杯 means wait. A 笑杯 means the question is unclear. A 阴杯 outranks a 笑杯.
 */
export function jiaoVerdict(results: JiaoResult[]): JiaoVerdict {
  const holy = results.filter((r) => r === "圣杯").length;
  if (results.length === 0) return { tone: "going", title: "还没有掷", text: "先写下一个能用“是”或“否”回答的问题，再掷筊。", done: false };
  if (results.includes("阴杯")) {
    const early = holy > 0 ? `前面有 ${holy} 次圣杯，但` : "";
    return { tone: "no", title: "暂缓", text: `${early}出了阴杯：神明不同意，或时机未到。先不要急着做，等条件变了、想清楚了，换一个问法再问。`, done: true };
  }
  if (results.includes("笑杯")) {
    const early = holy > 0 ? `前面有 ${holy} 次圣杯，但` : "";
    return { tone: "unclear", title: "问题不清楚，换个问法", text: `${early}出了笑杯：神明笑而不答。问题可能太笼统、一次问了两件事，或答案你心里已经有数。把问题改成一个具体的“是”或“否”再问。`, done: true };
  }
  if (holy >= MAX_THROWS) return { tone: "yes", title: "三次圣杯：可以去做", text: "连续三次圣杯，在这个传统里算明确的同意。它只表示这个仪式给了你一个“可以”，实际的条件和风险仍要自己核实。", done: true };
  return { tone: "going", title: `已有 ${holy} 次圣杯`, text: `需要连续 ${MAX_THROWS} 次圣杯才算明确同意。再掷 ${MAX_THROWS - holy} 次。`, done: false };
}
