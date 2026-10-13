import type { CompatItem, CompatTag, RelationKind } from "../compat/types";
import { isEn, live } from "../i18n";

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
const REL_WORD_ZH: Record<RelationKind, string> = {
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

export const REL_WORD = live(REL_WORD_ZH, {
  partner: "your partner",
  crush: "the person you like",
  spouse: "your spouse",
  father: "your father",
  mother: "your mother",
  child: "your child",
  sibling: "your sibling",
  friend: "this friend",
  colleague: "this colleague",
  boss: "this boss",
});

/** The relation word without the leading 你 / 你的, for use after a verb or preposition ("对父亲"). English keeps "your". */
export const bareWord = (r: RelationKind) => (isEn() ? REL_WORD[r] : REL_WORD[r].replace(/^你的?/, ""));
/** "你和父亲", "你和恋人"; "you and your father" in English. */
export const withWord = (r: RelationKind) => (isEn() ? `you and ${REL_WORD[r]}` : `你和${bareWord(r)}`);

/** How the other element reads in plain Chinese, from the other person's side. */
export const REL_PHRASE = live({ 同: "与你同五行", 生我: "生你", 我生: "受你所生", 我克: "受你所克", 克我: "克你" }, {
  同: "share your element",
  生我: "feed your element",
  我生: "are fed by your element",
  我克: "are controlled by your element",
  克我: "control your element",
});

/** Pick the text for a relation group, in English when `en` is given and the page is English. */
export type ByGroup = Record<RelGroup, string>;
export const pickText = (zh: ByGroup, r: RelationKind, en?: ByGroup) => (isEn() && en ? en : zh)[groupOf(r)];

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
