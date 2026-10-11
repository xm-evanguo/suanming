import type { Chart } from "../core/chart";
import { astrologyCompat } from "./astrology";
import { baziCompat } from "./bazi";
import { kyuseiCompat } from "./kyusei";
import { numerologyCompat } from "./numerology";
import { sukuyoCompat } from "./sukuyo";
import type { Compat, CompatFn, RelationKind } from "./types";
import { vedicCompat } from "./vedic";
import { ziweiCompat } from "./ziwei";

export const COMPATS: CompatFn[] = [baziCompat, ziweiCompat, sukuyoCompat, astrologyCompat, vedicCompat, numerologyCompat, kyuseiCompat];

/** Run every compatibility system for one person. Systems with nothing to say for this relation return null and are dropped. */
export function runCompat(me: Chart, other: Chart, relation: RelationKind): Compat[] {
  return COMPATS.map((fn) => fn(me, other, relation)).filter((c): c is Compat => c !== null);
}

export type { Compat, CompatFn, CompatItem, CompatTag, Person, RelationKind } from "./types";
