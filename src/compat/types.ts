import { pick } from "../i18n";
import type { BirthInput, Chart } from "../core/chart";
import type { Dim } from "../data/types";
import type { Tone } from "../forecast/types";
import type { MethodId } from "../methods/types";

export type RelationKind = "partner" | "crush" | "spouse" | "father" | "mother" | "child" | "sibling" | "friend" | "colleague" | "boss";

export const RELATION_NAMES: Record<RelationKind, string> = {
  partner: "恋人",
  crush: "心仪对象",
  spouse: "配偶",
  father: "父亲",
  mother: "母亲",
  child: "子女",
  sibling: "兄弟姐妹",
  friend: "朋友",
  colleague: "同事 / 合伙人",
  boss: "上司 / 老师",
};

export const RELATION_NAMES_EN: Record<RelationKind, string> = {
  partner: "Partner",
  crush: "Crush",
  spouse: "Spouse",
  father: "Father",
  mother: "Mother",
  child: "Child",
  sibling: "Sibling",
  friend: "Friend",
  colleague: "Colleague / partner",
  boss: "Boss / teacher",
};

/** The relation in the current language. */
export const relationName = (r: RelationKind) => pick(RELATION_NAMES, RELATION_NAMES_EN)[r];

/** Another person the user adds. The time and city can be unknown (timeKnown false, city defaults to the user's). */
export interface Person {
  id: string;
  name: string;
  relation: RelationKind;
  input: BirthInput;
}

/**
 * Tags let the UI answer relation-specific questions:
 * fate = 命中注定 / 宿缘, attraction = 吸引, harmony = 相处顺, conflict = 摩擦,
 * support = 对方帮你 (贵人, 资源), career = 与事业相关, growth = 互相成长.
 */
export type CompatTag = "fate" | "attraction" | "harmony" | "conflict" | "support" | "career" | "growth";

export interface CompatItem {
  tone: Tone;
  weight: 1 | 2 | 3;
  tags: CompatTag[];
  dim?: Dim;
  /** Technical statement naming the rule, e.g. "你的日支子与对方日支丑六合". */
  pro: string;
  /** Plain, specific statement in the second person ("你" = user, "TA" = the other person). */
  plain: string;
}

export interface Compat {
  methodId: MethodId;
  /** System name, e.g. "八字合婚". */
  name: string;
  /** 0-100 compatibility in this system. */
  score: number;
  /** One-line verdict, e.g. "天合地合 · 宿缘深厚". */
  headline: string;
  items: CompatItem[];
}

/** `me` is the user; `other` is the person. Return null when the system has nothing to say for this relation. */
export type CompatFn = (me: Chart, other: Chart, relation: RelationKind) => Compat | null;
