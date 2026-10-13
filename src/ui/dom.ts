type Child = Node | string | number | null | undefined | false;
type Attrs = Record<string, unknown> | null;

/** Small hyperscript helper. Keys starting with "on" become listeners; `class`, `style` and `html` are special. */
export function h<K extends keyof HTMLElementTagNameMap>(tag: K, attrs?: Attrs, ...children: Child[]): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs ?? {})) {
    if (v === undefined || v === null || v === false) continue;
    if (k === "class") el.className = String(v);
    // setProperty, because Object.assign on CSSStyleDeclaration drops custom properties ("--i").
    else if (k === "style" && typeof v === "object") for (const [p, val] of Object.entries(v)) el.style.setProperty(p.startsWith("--") ? p : p.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`), String(val));
    else if (k === "html") el.innerHTML = String(v);
    else if (k.startsWith("on") && typeof v === "function") el.addEventListener(k.slice(2).toLowerCase(), v as EventListener);
    else el.setAttribute(k, v === true ? "" : String(v));
  }
  append(el, children);
  return el;
}

export function append(el: Element, children: Child[]) {
  for (const c of children) if (c !== null && c !== undefined && c !== false) el.append(c instanceof Node ? c : String(c));
}

/** Escape text for use inside SVG/HTML template strings. */
export const esc = (s: string | number) =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export function svg(viewBox: string, inner: string, cls = ""): HTMLElement {
  const wrap = document.createElement("div");
  wrap.className = `svg-wrap ${cls}`;
  wrap.innerHTML = `<svg viewBox="${viewBox}" xmlns="http://www.w3.org/2000/svg" role="img">${inner}</svg>`;
  return wrap;
}

export const reducedMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

export const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, reducedMotion() ? Math.min(ms, 60) : ms));

/** Type text into an element one character at a time. Resolves when done. */
export async function typewrite(el: HTMLElement, text: string, speed = 38): Promise<void> {
  el.classList.add("typing");
  el.textContent = "";
  if (reducedMotion()) {
    el.textContent = text;
  } else {
    for (const ch of text) {
      if (!el.isConnected) break;
      el.textContent += ch;
      await new Promise((r) => setTimeout(r, "，。；：！？.;:!?".includes(ch) ? speed * 6 : speed));
    }
    el.textContent = text;
  }
  el.classList.remove("typing");
}

/** Count a number up inside an element. */
export function countUp(el: HTMLElement, to: number, ms = 1200, decimals = 0, suffix = "") {
  const start = performance.now();
  const step = (now: number) => {
    const t = Math.min(1, (now - start) / (reducedMotion() ? 1 : ms));
    const eased = 1 - (1 - t) ** 3;
    el.textContent = (to * eased).toFixed(decimals) + suffix;
    if (t < 1 && el.isConnected) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

let observer: IntersectionObserver | undefined;
/** Add class `in` when the element scrolls into view (once). */
export function reveal<T extends Element>(el: T, delay = 0): T {
  el.classList.add("reveal");
  (el as unknown as HTMLElement).style.setProperty("--d", `${delay}ms`);
  observer ??= new IntersectionObserver(
    (entries) => {
      for (const e of entries)
        if (e.isIntersecting) {
          e.target.classList.add("in");
          observer!.unobserve(e.target);
        }
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
  );
  observer.observe(el);
  return el;
}

/** Mouse-follow 3D tilt for cards. */
export function tilt(el: HTMLElement, max = 10) {
  if (reducedMotion() || matchMedia("(hover: none)").matches) return;
  el.addEventListener("pointermove", (e) => {
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty("--rx", `${-y * max}deg`);
    el.style.setProperty("--ry", `${x * max}deg`);
    el.style.setProperty("--mx", `${(x + 0.5) * 100}%`);
    el.style.setProperty("--my", `${(y + 0.5) * 100}%`);
  });
  el.addEventListener("pointerleave", () => {
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
  });
}

export const WX_COLOR: Record<string, string> = { 木: "#4fc27a", 火: "#ff6b4a", 土: "#d9a54a", 金: "#e8d7a0", 水: "#4a9bff" };

/** Best-effort swatch for a Chinese colour name (lucky colours are free text). */
export function colorHex(name: string): string {
  if (name.includes("彩虹")) return "linear-gradient(90deg,#ff5e5e,#ffc65e,#6ee07a,#5eb6ff,#b07bff)";
  const base: [string, string][] = [
    ["酒红", "#7b1e35"], ["玫瑰", "#e2728f"], ["粉", "#f3a1bf"], ["朱", "#e3452c"], ["绯", "#e0394a"], ["绛", "#9e2b3a"],
    ["赭", "#a5512f"], ["橙", "#f28a2e"], ["香槟", "#e6cf9a"], ["金", "#e0b44c"], ["土黄", "#c9973e"], ["黄", "#f2cc4c"],
    ["咖啡", "#6f4a2f"], ["棕", "#8b5a2b"], ["褐", "#7a4b2a"], ["杏", "#f0c9a0"], ["米", "#eadcbc"], ["象牙", "#f4ecd8"],
    ["乳", "#f6f0e1"], ["珍珠", "#efeae2"], ["橄榄", "#7f8b3a"], ["翠", "#1fa36b"], ["草绿", "#6cbf3c"], ["青绿", "#22a596"],
    ["绿", "#3fae63"], ["靛", "#3c46a5"], ["湖蓝", "#2a9bc4"], ["天蓝", "#6ab7ef"], ["海蓝", "#1f6fb6"], ["宝蓝", "#2847c9"],
    ["电光", "#3d7bff"], ["青", "#2aa5a0"], ["蓝", "#3b6fd8"], ["紫", "#8e5bd1"], ["银", "#c4ccd6"], ["灰", "#8a8f98"],
    ["炭", "#3a3c42"], ["白", "#f3f1ea"], ["黑", "#1c1c22"], ["红", "#e0453a"],
  ];
  const lower = name.toLowerCase();
  if (lower.includes("rainbow")) return "linear-gradient(90deg,#ff5e5e,#ffc65e,#6ee07a,#5eb6ff,#b07bff)";
  let hex = base.find(([k]) => name.includes(k))?.[1] ?? BASE_EN.find(([k]) => lower.includes(k))?.[1] ?? "#b9a6ff";
  if (/[深墨暗夜]/.test(name) || /\b(deep|dark|ink|navy|midnight)\b/.test(lower)) hex = shade(hex, -0.35);
  if (/[浅淡嫩月]/.test(name) || /\b(light|pale|fresh|soft|moon)\b/.test(lower)) hex = shade(hex, 0.35);
  return hex;
}

/** English colour words, most specific first, for the English data tables. */
const BASE_EN: [string, string][] = [
  ["wine", "#7b1e35"], ["burgundy", "#7b1e35"], ["rose", "#e2728f"], ["pink", "#f3a1bf"], ["vermilion", "#e3452c"], ["scarlet", "#e0394a"], ["crimson", "#9e2b3a"],
  ["ochre", "#a5512f"], ["orange", "#f28a2e"], ["champagne", "#e6cf9a"], ["gold", "#e0b44c"], ["earth yellow", "#c9973e"], ["mustard", "#c9973e"], ["yellow", "#f2cc4c"],
  ["coffee", "#6f4a2f"], ["tan", "#8b5a2b"], ["brown", "#8b5a2b"], ["apricot", "#f0c9a0"], ["beige", "#eadcbc"], ["cream", "#eadcbc"], ["ivory", "#f4ecd8"],
  ["milk", "#f6f0e1"], ["pearl", "#efeae2"], ["olive", "#7f8b3a"], ["emerald", "#1fa36b"], ["jade", "#1fa36b"], ["grass", "#6cbf3c"], ["teal", "#22a596"], ["turquoise", "#22a596"],
  ["cyan green", "#22a596"], ["green", "#3fae63"], ["indigo", "#3c46a5"], ["lake blue", "#2a9bc4"], ["sky blue", "#6ab7ef"], ["sea blue", "#1f6fb6"], ["royal blue", "#2847c9"],
  ["electric", "#3d7bff"], ["cyan", "#2aa5a0"], ["azure", "#2a9bc4"], ["blue", "#3b6fd8"], ["violet", "#8e5bd1"], ["purple", "#8e5bd1"], ["lavender", "#b9a6ff"],
  ["silver", "#c4ccd6"], ["grey", "#8a8f98"], ["gray", "#8a8f98"], ["charcoal", "#3a3c42"], ["white", "#f3f1ea"], ["black", "#1c1c22"], ["red", "#e0453a"],
];

function shade(hex: string, amt: number): string {
  const n = Number.parseInt(hex.slice(1), 16);
  const ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) =>
    Math.round(amt < 0 ? c * (1 + amt) : c + (255 - c) * amt),
  );
  return `#${ch.map((c) => c.toString(16).padStart(2, "0")).join("")}`;
}
