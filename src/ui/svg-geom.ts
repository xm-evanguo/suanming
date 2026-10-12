import { h } from "./dom";

// Shared geometry for the SVG chart renderers.
export const rad = (d: number) => (d * Math.PI) / 180;
export const polar = (cx: number, cy: number, r: number, deg: number) => ({ x: cx + r * Math.cos(rad(deg)), y: cy + r * Math.sin(rad(deg)) });
export const f = (n: number) => n.toFixed(1);
export const caption = (text: string) => h("p", { class: "v-caption" }, text);
export const EL_COLOR: Record<string, string> = { 火: "#ff6b4a", 土: "#d9a54a", 风: "#7fd4ff", 水: "#4a7bff" };

/** An annular sector path (angles in screen degrees, clockwise from +x, a0 < a1). */
export function sector(cx: number, cy: number, r0: number, r1: number, a0: number, a1: number): string {
  const p = [polar(cx, cy, r1, a0), polar(cx, cy, r1, a1), polar(cx, cy, r0, a1), polar(cx, cy, r0, a0)];
  const large = a1 - a0 > 180 ? 1 : 0;
  return `M${f(p[0]!.x)},${f(p[0]!.y)}A${r1},${r1} 0 ${large} 1 ${f(p[1]!.x)},${f(p[1]!.y)}L${f(p[2]!.x)},${f(p[2]!.y)}A${r0},${r0} 0 ${large} 0 ${f(p[3]!.x)},${f(p[3]!.y)}Z`;
}
