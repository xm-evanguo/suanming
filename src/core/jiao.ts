/**
 * 掷圣杯 (擲筊): the temple practice with two crescent-shaped blocks. Each block has a flat side (阳面)
 * and a round side (阴面). One flat and one round is 圣杯, two flat is 笑杯, two round is 阴杯.
 * Each block is modelled as a fair coin. Real blocks are not exactly 50/50.
 * The faces come from the question and the local minute, like the tarot draw. It is a ritual and does
 * not make the answer more accurate.
 */
import { minuteStamp, normalizeQuestion, seededInt, seededStream } from "./draw-seed";
import { live, t } from "../i18n";

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

export const RESULT_MEANING: Record<JiaoResult, { faces: string; text: string }> = live(
  {
    圣杯: { faces: "一平一圆", text: "神明同意，事情可行。" },
    笑杯: { faces: "两个平面向上", text: "神明笑而不答：问题不清楚，或答案其实已经很明显。" },
    阴杯: { faces: "两个圆面向上", text: "神明不同意，或时机未到。" },
  },
  {
    圣杯: { faces: "one flat, one round", text: "The gods agree; it can be done." },
    笑杯: { faces: "both flat sides up", text: "The gods laugh and do not answer: the question is unclear, or the answer is already plain." },
    阴杯: { faces: "both round sides up", text: "The gods do not agree, or the time is not right." },
  },
);

const RESULT_NAME_EN: Record<JiaoResult, string> = { 圣杯: "Holy Cup", 笑杯: "Laughing Cup", 阴杯: "Yin Cup" };
/** The result name in the current language. `JiaoResult` stays the internal key. */
export const resultName = (r: JiaoResult) => t(r, RESULT_NAME_EN[r]);

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
  if (results.length === 0) return { tone: "going", title: t("还没有掷", "No throws yet"), text: t("心里想好一件事，就可以掷筊。", "Hold one matter in mind, then throw."), done: false };
  const cups = (n: number) => `${n} Holy Cup${n === 1 ? "" : "s"}`;
  if (results.includes("阴杯")) {
    const early = holy > 0 ? t(`前面有 ${holy} 次圣杯，但`, `After ${cups(holy)}, `) : "";
    return { tone: "no", title: t("暂缓", "Wait"), text: t(`${early}出了阴杯：神明不同意，或时机未到，先缓一缓。`, `${early}${holy ? "a" : "A"} Yin Cup came up: the gods do not agree, or the time is not right. Hold off for now.`), done: true };
  }
  if (results.includes("笑杯")) {
    const early = holy > 0 ? t(`前面有 ${holy} 次圣杯，但`, `After ${cups(holy)}, `) : "";
    return { tone: "unclear", title: t("问题不清楚，换个问法", "Unclear; ask another way"), text: t(`${early}出了笑杯：神明笑而不答，换个问法再问。`, `${early}${holy ? "a" : "A"} Laughing Cup came up: the gods laugh and do not answer. Ask the question another way.`), done: true };
  }
  if (holy >= MAX_THROWS) return { tone: "yes", title: t("三次圣杯：可以去做", "Three Holy Cups: go ahead"), text: t("连续三次圣杯，神明点头了。", "Three Holy Cups in a row: the gods nod yes."), done: true };
  return { tone: "going", title: t(`已有 ${holy} 次圣杯`, `${cups(holy)} so far`), text: t(`需要连续 ${MAX_THROWS} 次圣杯才算明确同意。再掷 ${MAX_THROWS - holy} 次。`, `A clear yes needs ${MAX_THROWS} Holy Cups in a row. Throw ${MAX_THROWS - holy} more.`), done: false };
}
