import { minuteStamp } from "../core/draw-seed";
import { type Face, type JiaoResult, type JiaoThrow, jiaoVerdict, MAX_THROWS, RESULT_MEANING, resultName, throwJiao } from "../core/jiao";
import { h, reducedMotion, sleep } from "./dom";
import { t } from "../i18n";

const TONE: Record<JiaoResult, string> = { 圣杯: "holy", 笑杯: "laugh", 阴杯: "yin" };
const facesText = (f: Face) => (f === "flat" ? t("平面", "flat side") : t("圆面", "round side"));

/** A crescent block seen from above. */
const CRESCENT = "M8 46 C 14 8, 106 8, 112 46 C 113 53, 104 55, 96 50 C 78 39, 42 39, 24 50 C 16 55, 7 53, 8 46 Z";
const GRADIENTS = `<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><defs>
  <linearGradient id="jiao-flat" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f58a6c"/><stop offset="0.55" stop-color="#e0553a"/><stop offset="1" stop-color="#bd3a24"/></linearGradient>
  <linearGradient id="jiao-round" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b9302a"/><stop offset="0.5" stop-color="#7f1713"/><stop offset="1" stop-color="#4b0b0b"/></linearGradient>
  <radialGradient id="jiao-shine" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#fff" stop-opacity="0.7"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
</defs></svg>`;
/** Static markup only: no user text goes into it. */
const SVG_FACE: Record<Face, string> = {
  flat: `<svg viewBox="0 0 120 64" aria-hidden="true"><path d="${CRESCENT}" fill="#3b0a07" transform="translate(0 4)"/><path d="${CRESCENT}" fill="url(#jiao-flat)" stroke="#6a170b" stroke-width="2"/><path d="${CRESCENT}" fill="none" stroke="rgba(255,235,210,0.5)" stroke-width="1.2" transform="translate(60 31) scale(0.88 0.74) translate(-60 -31)"/><path d="M26 24 C 44 17, 76 17, 94 24" fill="none" stroke="rgba(255,235,210,0.4)" stroke-width="1.4" stroke-linecap="round"/></svg>`,
  round: `<svg viewBox="0 0 120 64" aria-hidden="true"><path d="${CRESCENT}" fill="#2a0504" transform="translate(0 4)"/><path d="${CRESCENT}" fill="url(#jiao-round)" stroke="#2f0705" stroke-width="2"/><ellipse cx="50" cy="21" rx="30" ry="6.5" fill="url(#jiao-shine)" transform="rotate(-5 50 21)"/><path d="M14 44 C 30 52, 90 52, 106 44" fill="none" stroke="rgba(0,0,0,0.35)" stroke-width="3" stroke-linecap="round"/></svg>`,
};

function markup(html: string): HTMLElement {
  const tpl = document.createElement("template");
  tpl.innerHTML = html;
  return tpl.content.firstElementChild as HTMLElement;
}

const miniFace = (f: Face) => h("span", { class: "jiao-mini-face", title: facesText(f) }, markup(SVG_FACE[f]));

type Cup = { cup: HTMLElement; fly: HTMLElement; block: HTMLElement; shadow: HTMLElement; face: Face; angle: number; tilt: number };

/** The blocks grow a little at the top of the toss, as if they come toward the viewer. */
const TOSS_SCALE = 1.25;
const spin = (deg: number) => `perspective(520px) rotateX(${deg}deg)`;

function makeCup(face: Face, mirror: boolean): Cup {
  const block = h("div", { class: "jiao-block" }, h("div", { class: "jiao-face flat" }, markup(SVG_FACE.flat)), h("div", { class: "jiao-face round" }, markup(SVG_FACE.round)));
  const fly = h("div", { class: "jiao-fly" }, block);
  const shadow = h("div", { class: "jiao-shadow" });
  const cup = h("div", { class: `jiao-cup${mirror ? " mirror" : ""}` }, shadow, fly);
  const angle = face === "flat" ? 0 : 180;
  const tilt = mirror ? 8 : -6;
  block.style.transform = spin(angle);
  fly.style.transform = `rotate(${tilt}deg)`;
  return { cup, fly, block, shadow, face, angle, tilt };
}

/**
 * Toss one block: up, spin, fall, a small bounce, and land on `face`.
 * Resolves when the animation has ended (a cancelled animation also counts as ended).
 */
async function toss(c: Cup, face: Face, rise: number, delay: number, duration: number, live: Animation[]) {
  const target = face === "flat" ? 0 : 180;
  const delta = (((target - c.angle) % 360) + 360) % 360;
  const to = c.angle + 720 + delta + (Math.random() < 0.5 ? 0 : 360);
  const land = (Math.random() - 0.5) * 44;
  const mid = c.tilt + (Math.random() < 0.5 ? -1 : 1) * (25 + Math.random() * 30);
  const timing = { duration, delay, fill: "both" as const };
  const anims = [
    c.fly.animate(
      [
        { transform: `translateY(0) rotate(${c.tilt}deg) scale(1)`, easing: "cubic-bezier(0.2, 0.7, 0.35, 1)" },
        { transform: `translateY(${-rise}px) rotate(${mid}deg) scale(${TOSS_SCALE})`, offset: 0.4, easing: "cubic-bezier(0.55, 0, 0.9, 0.6)" },
        { transform: `translateY(0) rotate(${land}deg) scale(1)`, offset: 0.78, easing: "cubic-bezier(0.2, 0.6, 0.4, 1)" },
        { transform: `translateY(-14px) rotate(${land + 4}deg) scale(1.04)`, offset: 0.9, easing: "cubic-bezier(0.5, 0, 0.9, 0.6)" },
        { transform: `translateY(0) rotate(${land}deg) scale(1)` },
      ],
      timing,
    ),
    c.block.animate([{ transform: spin(c.angle), easing: "cubic-bezier(0.25, 0.5, 0.4, 1)" }, { transform: spin(to), offset: 0.78 }, { transform: spin(to) }], timing),
    c.shadow.animate(
      [
        { transform: "scale(1)", opacity: 0.85, easing: "cubic-bezier(0.2, 0.7, 0.35, 1)" },
        { transform: "scale(0.5)", opacity: 0.3, offset: 0.4, easing: "cubic-bezier(0.55, 0, 0.9, 0.6)" },
        { transform: "scale(1)", opacity: 0.85, offset: 0.78 },
        { transform: "scale(0.82)", opacity: 0.6, offset: 0.9 },
        { transform: "scale(1)", opacity: 0.85 },
      ],
      timing,
    ),
  ];
  live.push(...anims);
  await Promise.all(anims.map((a) => a.finished.catch(() => undefined)));
  c.face = face;
  c.angle = target;
  c.tilt = land;
  c.block.style.transform = spin(target);
  c.fly.style.transform = `rotate(${land}deg)`;
  for (const a of anims) {
    a.cancel();
    live.splice(live.indexOf(a), 1);
  }
}

/** Set the blocks to their faces at once (reduced motion, or after a reset). */
function place(c: Cup, face: Face) {
  c.face = face;
  c.angle = face === "flat" ? 0 : 180;
  c.block.style.transform = spin(c.angle);
}

/**
 * Up to three throws for a question held in mind. Each run uses a fresh random seed.
 * This panel uses no birth data and makes no API request.
 */
export function jiaoPanel(): { element: HTMLElement; cancel: () => void } {
  let thrown: JiaoThrow[] = [];
  let at: Date | undefined;
  let seed: string | undefined;
  let busy = false;
  let disposed = false;
  const live: Animation[] = [];

  const status = h("p", { class: "v-caption", role: "status", "aria-live": "polite" });
  const seedLine = h("p", { class: "seed-line", hidden: true });
  const cups = [makeCup("flat", false), makeCup("round", true)] as const;
  const throwNo = (i: number) => t(`第 ${i + 1} 掷`, `Throw ${i + 1}`);
  const stage = h("div", { class: "jiao-stage", role: "img", "aria-label": t("两个筊杯", "Two moon blocks") }, cups[0].cup, cups[1].cup);
  const slots = Array.from({ length: MAX_THROWS }, (_, i) => h("figure", { class: "jiao-slot" }, h("div", { class: "jiao-slot-body" }, "？"), h("figcaption", null, throwNo(i))));
  const verdict = h("section", { class: "jiao-verdict", hidden: true, "aria-live": "polite" });
  const throwBtn = h("button", { type: "submit", class: "btn btn-primary" }, t("掷筊 ✦", "Throw ✦"));
  const resetBtn = h("button", { type: "button", class: "btn btn-ghost", hidden: true, onclick: reset }, t("重新问", "Ask again"));

  function sync() {
    const v = jiaoVerdict(thrown.map((x) => x.result));
    const started = thrown.length > 0;
    throwBtn.disabled = busy || (started && v.done);
    throwBtn.hidden = started && v.done;
    throwBtn.textContent = started ? t(`再掷一次（第 ${thrown.length + 1}/${MAX_THROWS} 掷）`, `Throw again (${thrown.length + 1}/${MAX_THROWS})`) : t("掷筊 ✦", "Throw ✦");
    resetBtn.hidden = !started;
    resetBtn.disabled = busy;
    seedLine.hidden = !at;
    if (at) seedLine.textContent = t(`起卦 ${minuteStamp(at)}`, `Cast ${minuteStamp(at)}`);
    verdict.hidden = !started;
    if (started) {
      verdict.dataset.tone = v.tone;
      verdict.replaceChildren(h("h4", null, v.title), h("p", null, v.text));
    }
  }

  function fill(i: number, th: JiaoThrow) {
    slots[i]!.classList.add("filled", TONE[th.result]);
    slots[i]!.querySelector(".jiao-slot-body")!.replaceChildren(h("span", { class: "jiao-mini" }, miniFace(th.a), miniFace(th.b)), h("b", { class: "jiao-res" }, resultName(th.result)));
    slots[i]!.querySelector("figcaption")!.textContent = `${throwNo(i)} · ${RESULT_MEANING[th.result].faces}`;
  }

  async function run() {
    if (busy || disposed) return;
    const v = jiaoVerdict(thrown.map((x) => x.result));
    if (thrown.length >= MAX_THROWS || (thrown.length > 0 && v.done)) return;
    busy = true;
    at ??= new Date();
    seed ??= crypto.randomUUID();
    const th = throwJiao(seed, at, thrown.length);
    sync();
    stage.dataset.result = "";
    status.textContent = t("掷出……", "Throwing…");
    if (reducedMotion()) {
      place(cups[0], th.a);
      place(cups[1], th.b);
      await sleep(200);
    } else {
      // The highest point must stay inside the stage: centre height plus the half extent of the tilted, scaled block.
      const cupW = cups[0].cup.offsetWidth, cupH = cups[0].cup.offsetHeight;
      const half = 0.5 * (cupW * 0.82 + cupH * 0.58) * TOSS_SCALE;
      const rise = Math.max(40, Math.min(170, stage.clientHeight - 46 - cupH / 2 - half - 6));
      await Promise.all([toss(cups[0], th.a, rise, 0, 1500, live), toss(cups[1], th.b, rise * 0.92, 90, 1640, live)]);
    }
    if (disposed) return;
    thrown.push(th);
    fill(thrown.length - 1, th);
    stage.dataset.result = TONE[th.result];
    stage.setAttribute("aria-label", t(`筊杯：${th.result}`, `Moon blocks: ${resultName(th.result)}`));
    busy = false;
    sync();
    const v2 = jiaoVerdict(thrown.map((x) => x.result));
    status.textContent = t(
      `第 ${thrown.length} 掷：${th.result}（${RESULT_MEANING[th.result].faces}）。${v2.done ? v2.title : "继续掷。"}`,
      `Throw ${thrown.length}: ${resultName(th.result)} (${RESULT_MEANING[th.result].faces}). ${v2.done ? v2.title : "Keep throwing."}`,
    );
    if (!v2.done) throwBtn.focus({ preventScroll: true });
  }

  function reset() {
    if (busy) return;
    thrown = [];
    at = undefined;
    seed = undefined;
    stage.dataset.result = "";
    stage.setAttribute("aria-label", t("两个筊杯", "Two moon blocks"));
    slots.forEach((s, i) => {
      s.className = "jiao-slot";
      s.querySelector(".jiao-slot-body")!.replaceChildren("？");
      s.querySelector("figcaption")!.textContent = throwNo(i);
    });
    status.textContent = t("已清空，可以再问。", "Cleared. You can ask again.");
    sync();
    throwBtn.focus();
  }

  const legend = h(
    "dl",
    { class: "jiao-legend" },
    ...(["圣杯", "笑杯", "阴杯"] as const).flatMap((r) => {
      const faces: [Face, Face] = r === "圣杯" ? ["flat", "round"] : r === "笑杯" ? ["flat", "flat"] : ["round", "round"];
      return [h("div", { class: `jiao-legend-item ${TONE[r]}` }, h("dt", null, h("span", { class: "jiao-mini" }, miniFace(faces[0]), miniFace(faces[1])), resultName(r)), h("dd", null, h("small", null, RESULT_MEANING[r].faces), RESULT_MEANING[r].text))];
    }),
  );

  const root = h(
    "section",
    { class: "jiao glass" },
    markup(GRADIENTS),
    h("h3", null, t("掷圣杯", "Moon blocks")),
    h("p", { class: "v-caption" }, t("请在心中默念一件是非题，再掷出两块月牙形的筊杯。", "Hold a yes-or-no question in mind, then throw the two crescent-shaped blocks (jiaobei).")),
    h(
      "form",
      { class: "jiao-form", onsubmit: (event: Event) => {
        event.preventDefault();
        void run();
      } },
      stage,
      h("div", { class: "tarot-row jiao-slots" }, ...slots),
      seedLine,
      h("div", { class: "draw-actions" }, throwBtn, resetBtn),
      status,
    ),
    verdict,
    h("h4", { class: "jiao-sub" }, t("三种结果怎么看", "Reading the three results")),
    legend,
    h("p", { class: "v-caption" }, t("连续三次圣杯才算同意；出笑杯或阴杯就停。", "Only three Holy Cups in a row mean yes; stop at a Laughing Cup or a Yin Cup.")),
  );
  sync();
  return {
    element: root,
    cancel: () => {
      disposed = true;
      for (const a of [...live]) a.cancel();
    },
  };
}
