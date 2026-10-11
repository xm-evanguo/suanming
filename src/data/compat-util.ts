import type { CompatItem, CompatTag, RelationKind } from "../compat/types";

/**
 * How the UI groups relations when it answers questions:
 * romance (partner, crush, spouse), elder (father, mother, boss), peer (friend, colleague, sibling), child.
 */
export type RelGroup = "romance" | "elder" | "peer" | "child";

export const groupOf = (r: RelationKind): RelGroup =>
  r === "partner" || r === "crush" || r === "spouse"
    ? "romance"
    : r === "father" || r === "mother" || r === "boss"
      ? "elder"
      : r === "child"
        ? "child"
        : "peer";

/** A short noun phrase for the other person, used inside plain text. */
export const REL_WORD: Record<RelationKind, string> = {
  partner: "你的恋人",
  crush: "你心仪的 TA",
  spouse: "你的配偶",
  father: "你父亲",
  mother: "你母亲",
  child: "你的孩子",
  sibling: "你的兄弟姐妹",
  friend: "这位朋友",
  colleague: "这位同事",
  boss: "这位上司",
};

/** The relation word without the leading 你 / 你的, for use after a verb or preposition ("对父亲"). */
export const bareWord = (r: RelationKind) => REL_WORD[r].replace(/^你的?/, "");
/** "你和父亲", "你和恋人". */
export const withWord = (r: RelationKind) => `你和${bareWord(r)}`;

/** How the other element reads in plain Chinese, from the other person's side. */
export const REL_PHRASE = { 同: "与你同五行", 生我: "生你", 我生: "受你所生", 我克: "受你所克", 克我: "克你" } as const;

/** Pick the text for a relation group. */
export type ByGroup = Record<RelGroup, string>;
export const pickText = (t: ByGroup, r: RelationKind) => t[groupOf(r)];

/** Every valid tag. The tests use this list. */
export const ALL_TAGS: CompatTag[] = ["fate", "attraction", "harmony", "conflict", "support", "career", "growth"];

/**
 * Collects items with a score delta each. The score starts at 50 and moves by the deltas.
 * A default delta follows tone and weight, so most call sites do not set one.
 */
export class Acc {
  private rows: { item: CompatItem; delta: number; order: number }[] = [];

  /** `relation` lets the collector drop the attraction tag for non-romantic relations. */
  constructor(private relation?: RelationKind) {}

  add(item: CompatItem, delta?: number): void {
    if (this.relation && groupOf(this.relation) !== "romance" && item.tags.includes("attraction")) {
      const tags = item.tags.filter((t) => t !== "attraction");
      item = { ...item, tags: tags.length ? tags : ["harmony"] };
    }
    const d = delta ?? (item.tone === "good" ? item.weight * 5 : item.tone === "bad" ? -item.weight * 6 : 0);
    this.rows.push({ item, delta: d, order: this.rows.length });
  }

  score(base = 50): number {
    const total = this.rows.reduce((s, r) => s + r.delta, base);
    return Math.max(0, Math.min(100, Math.round(total)));
  }

  /** Items sorted by weight (strong first); equal weights keep insertion order. Capped at `max`. */
  list(max = 8): CompatItem[] {
    return [...this.rows]
      .sort((a, b) => b.item.weight - a.item.weight || a.order - b.order)
      .slice(0, max)
      .map((r) => r.item);
  }
}

/** For elders, a support item that concerns work also carries the career tag. */
export const withCareer = (r: RelationKind, tags: CompatTag[]): CompatTag[] =>
  groupOf(r) === "elder" && tags.includes("support") && !tags.includes("career") ? [...tags, "career"] : tags;
