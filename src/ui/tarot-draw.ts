import { drawSeed, type SeededCard } from "../core/draw-seed";
import { MAJOR_ARCANA, type TarotCard } from "../data/tarot";
import { QUESTION_LIMIT } from "../llm/tarot";
import { h, reducedMotion, reveal, sleep } from "./dom";
import { tarotLlm } from "./tarot-llm";

const ROMAN = ["0", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII", "XIII", "XIV", "XV", "XVI", "XVII", "XVIII", "XIX", "XX", "XXI"];
type Topic = "all" | "career" | "wealth" | "love" | "health" | "study";
const TOPICS: [Topic, string][] = [["all", "综合"], ["career", "事业"], ["wealth", "财运"], ["love", "感情"], ["health", "身心"], ["study", "学业"]];
const POSITIONS = [
  { name: "现状", hint: "你现在所处的局面" },
  { name: "挑战", hint: "需要跨过的那道坎" },
  { name: "建议", hint: "接下来可以怎么做" },
];

function topicText(c: TarotCard, t: Topic): string {
  if (t === "career" || t === "wealth") return c.career;
  if (t === "love") return c.love;
  if (t === "health") return c.health;
  return c.summary;
}

/** Card face. A reversed card turns as a whole (`.tcard.rev`), so the face itself is never rotated. */
function face(c: TarotCard): HTMLElement {
  return h(
    "div",
    { class: "tcard-inner" },
    h("div", { class: "tcard-back" }, h("i", null, "✦")),
    h("div", { class: "tcard-front" }, h("small", null, ROMAN[c.num]), h("span", { class: "tsym" }, c.symbol), h("b", null, c.name), h("small", null, c.en)),
  );
}

/** Wait for Web Animations to end. A cancelled animation also counts as ended. */
const settle = (anims: Animation[]) => Promise.all(anims.map((a) => a.finished.catch(() => undefined)));

/** The characters of the question drift into the deck: the question becomes part of the shuffle. */
async function absorb(stage: HTMLElement, fanEl: HTMLElement, glyphs: string[], rand: () => number) {
  const layer = h("div", { class: "glyphs", "aria-hidden": "true" }, ...glyphs.map((g) => h("span", null, g)));
  stage.append(layer);
  const w = stage.clientWidth, top = stage.clientHeight;
  const anims = [...layer.children].map((el, i) => {
    const dx = (rand() - 0.5) * w * 0.86, dy = -(30 + rand() * (top - 70));
    return el.animate(
      [
        { opacity: 0, transform: `translate(calc(-50% + ${dx}px), calc(50% + ${dy}px)) scale(1.6)`, filter: "blur(6px)" },
        { opacity: 1, transform: `translate(calc(-50% + ${dx}px), calc(50% + ${dy}px)) scale(1)`, filter: "blur(0)", offset: 0.3, easing: "linear" },
        { opacity: 1, transform: `translate(calc(-50% + ${dx * 0.92}px), calc(50% + ${dy * 0.92}px)) scale(1)`, filter: "blur(0)", offset: 0.55, easing: "cubic-bezier(0.5, 0, 0.75, 0)" },
        { opacity: 0, transform: "translate(-50%, 50%) scale(0.2)", filter: "blur(0)" },
      ],
      { duration: 1200, delay: i * 22, fill: "both" },
    );
  });
  const glow = fanEl.animate(
    [{ filter: "drop-shadow(0 0 0 rgba(245, 200, 107, 0))" }, { filter: "drop-shadow(0 0 22px rgba(245, 200, 107, 0.95))" }, { filter: "drop-shadow(0 0 0 rgba(245, 200, 107, 0))" }],
    { duration: 700 + glyphs.length * 22, delay: 700, easing: "ease-in-out" },
  );
  await settle([...anims, glow]);
  layer.remove();
}

/** Riffle shuffle: the stack splits in two halves and interleaves, three times. */
async function riffle(fanEl: HTMLElement) {
  const cards = [...fanEl.children] as HTMLElement[];
  const spread = (cards[0]?.offsetWidth ?? 60) * 0.8;
  for (let round = 0; round < 3; round++) {
    await settle(
      cards.map((c, i) => {
        const side = (i + round) % 2 ? 1 : -1;
        const rest = `translateX(0) translateY(${-i * 0.6}px) rotate(0deg)`;
        return c.animate(
          [{ transform: rest }, { transform: `translateX(${side * spread}px) translateY(${-i * 0.5 - 14}px) rotate(${side * 9}deg)`, offset: 0.45 }, { transform: rest }],
          { duration: 480, delay: (side > 0 ? i : cards.length - i) * 7, easing: "cubic-bezier(0.45, 0, 0.2, 1)" },
        );
      }),
    );
  }
}

/** A copy of the picked card flies from the fan into its slot. */
async function fly(root: HTMLElement, from: HTMLElement, to: HTMLElement) {
  if (reducedMotion()) return;
  const r0 = from.getBoundingClientRect(), r1 = to.getBoundingClientRect(), base = root.getBoundingClientRect();
  const m = new DOMMatrixReadOnly(getComputedStyle(from).transform);
  const angle = (Math.atan2(m.b, m.a) * 180) / Math.PI;
  const w = from.offsetWidth, ht = from.offsetHeight;
  const x0 = r0.left + r0.width / 2 - base.left, y0 = r0.top + r0.height / 2 - base.top;
  const dx = r1.left + r1.width / 2 - base.left - x0, dy = r1.top + r1.height / 2 - base.top - y0;
  const s = r1.width / w;
  const ghost = h("div", { class: "fly-card", "aria-hidden": "true", style: { left: `${x0 - w / 2}px`, top: `${y0 - ht / 2}px`, width: `${w}px`, height: `${ht}px` } }, h("i", null, "✦"));
  root.append(ghost);
  await settle([
    ghost.animate(
      [
        { transform: `rotate(${angle}deg)` },
        { transform: `translate(${dx * 0.45}px, ${dy * 0.45 - 70}px) rotate(${angle / 2 - 8}deg) scale(${(1 + s) / 2 + 0.15})`, offset: 0.5 },
        { transform: `translate(${dx}px, ${dy}px) rotate(0deg) scale(${s})` },
      ],
      { duration: 720, easing: "cubic-bezier(0.3, 0.7, 0.2, 1)", fill: "forwards" },
    ),
  ]);
  ghost.remove();
}

/**
 * Three-card draw that the user does by hand. The deck order and the reversals come from a seed made of
 * the question, the topic and the local minute (src/core/draw-seed.ts). The user's clicks choose the cards.
 * The draw does not use the birth data and does not change any score.
 */
export function tarotDraw(): HTMLElement {
  let topic: Topic = "all";
  let cancelReading: (() => void) | undefined;
  const root = h("section", { class: "draw glass" });
  const topicLabel = () => TOPICS.find(([t]) => t === topic)![1];

  function start() {
    cancelReading?.();
    const question = h("textarea", { class: "field", rows: "3", maxlength: String(QUESTION_LIMIT), "aria-label": "抽牌问题（可选）", placeholder: "想问的具体问题（可不填），例如：我想换工作，但新岗位要搬家，应该先确认哪些条件？" });
    const chips = h(
      "div",
      { class: "rel-chips" },
      ...TOPICS.map(([t, label]) =>
        h(
          "button",
          {
            type: "button",
            class: `dim-chip${t === topic ? " on" : ""}`,
            "aria-pressed": String(t === topic),
            onclick: (e: Event) => {
              topic = t;
              for (const b of chips.children) {
                b.classList.toggle("on", b === e.currentTarget);
                b.setAttribute("aria-pressed", String(b === e.currentTarget));
              }
            },
          },
          label,
        ),
      ),
    );
    root.replaceChildren(
      h("h3", null, "亲手抽三张牌"),
      h("p", { class: "v-caption" }, "塔罗的传统用法是先有问题、再由你自己抽牌。先在心里想好一件具体的事，选一个方向，然后洗牌。你写下的问题、选的方向和此刻的时间会一起决定牌序。"),
      chips,
      question,
      h("p", { class: "v-caption" }, "写清处境、选择和顾虑，能让问题更具体。抽牌后可填写 DeepSeek API Key，结合问题获得 AI 解读；只有点击解读时才会发送数据。"),
      h("div", { class: "draw-actions" }, h("button", { type: "button", class: "btn btn-primary", onclick: () => fan(question.value.trim()) }, "洗牌 ✦")),
    );
  }

  async function fan(q: string) {
    const seed = drawSeed(q, topicLabel(), new Date());
    const picks: SeededCard[] = [];
    const flights: Promise<void>[] = [];
    const slots = POSITIONS.map((p) => h("figure", { class: "tslot draw-slot" }, h("div", { class: "slot-empty" }, "？"), h("figcaption", null, p.name, h("small", null, p.hint))));
    const status = h("p", { class: "draw-status", "aria-live": "polite" }, "正在把你的问题和此刻写进牌里……");
    const fanEl = h(
      "div",
      { class: "fan shuffling", style: { "--n": seed.deck.length } as never },
      ...seed.deck.map((card, i) =>
        h(
          "button",
          {
            type: "button",
            class: "fan-card",
            disabled: true,
            style: { "--i": i } as never,
            "aria-label": `第 ${i + 1} 张牌`,
            onclick: (e: Event) => pick(e.currentTarget as HTMLButtonElement, card),
          },
          h("i", null, "✦"),
        ),
      ),
    );
    const stage = h("div", { class: "deck-stage" }, fanEl);
    const seedLine = h("p", { class: "seed-line" }, `起卦 ${seed.stamp}`, h("b", { title: "问卦印记：由问题、方向和时间算出" }, seed.sigil));
    root.replaceChildren(h("h3", null, q ? `「${q}」` : `${topicLabel()}运势`), seedLine, status, stage, h("div", { class: "tarot-row" }, ...slots));
    if (reducedMotion()) await sleep(300);
    else {
      await absorb(stage, fanEl, [...[...q].filter((c) => c.trim()).slice(0, 28), ...seed.sigil], seed.rand);
      status.textContent = "洗牌中……";
      await riffle(fanEl);
    }
    if (!root.isConnected) return;
    fanEl.classList.remove("shuffling");
    for (const b of fanEl.children) (b as HTMLButtonElement).disabled = false;
    status.textContent = "牌已洗好。凭直觉点三张。";

    function pick(btn: HTMLButtonElement, card: SeededCard) {
      if (picks.length >= 3 || btn.disabled) return;
      btn.disabled = true;
      picks.push(card);
      const slot = slots[picks.length - 1]!;
      const empty = slot.firstElementChild as HTMLElement;
      flights.push(
        fly(root, btn, empty).then(() => {
          empty.replaceWith(h("div", { class: `tcard drawn${card.reversed ? " rev" : ""}` }, face(MAJOR_ARCANA[card.num]!)));
        }),
      );
      btn.classList.add("taken");
      status.textContent = picks.length < 3 ? `还差 ${3 - picks.length} 张。` : "三张牌已就位，正在翻开……";
      if (picks.length === 3) void Promise.all(flights).then(() => reveal3(fanEl, slots, picks, q)).then(() => (status.textContent = "牌已翻开，解读在下方。"));
    }
  }

  async function reveal3(fanEl: HTMLElement, slots: HTMLElement[], picks: SeededCard[], q: string) {
    fanEl.classList.add("gone");
    for (const [i, s] of slots.entries()) {
      await sleep(i ? 700 : 450);
      s.classList.add("lit");
      s.querySelector(".tcard")!.classList.add("open");
      s.querySelector("figcaption")!.append(h("em", null, picks[i]!.reversed ? " 逆位" : " 正位"));
    }
    await sleep(picks[2]!.reversed ? 1500 : 900);
    if (!root.isConnected) return;
    const llm = tarotLlm({ question: q, context: "", topic: topicLabel(), cards: picks });
    cancelReading = llm.cancel;
    const reading = h(
      "div",
      { class: "draw-reading" },
      ...picks.map(({ num, reversed }, i) => {
        const c = MAJOR_ARCANA[num]!;
        const pos = POSITIONS[i]!;
        const body = i === 2 ? `${reversed ? c.reversed : c.upright}${c.advice}` : `${reversed ? c.reversed : c.upright}${topicText(c, topic)}`;
        return reveal(h("article", { class: "reading glass" }, h("span", { class: "reading-no" }, String(i + 1).padStart(2, "0")), h("h3", null, `${pos.name} · ${c.name}${reversed ? "（逆位）" : ""}`), h("p", null, body)), i * 120);
      }),
      h("p", { class: "v-caption" }, "以上是通用牌义，尚未结合具体问题。牌序由你的问题、方向和起卦时刻（精确到分钟）算出，你点的位置决定抽到哪三张：同一分钟问同一件事，牌序不变；换个问法或换个时刻，牌序就会变。这只是仪式，不会让结果更准；它与你的生辰无关，也不计入任何评分。问题不会保存在本站。"),
      llm.element,
      h("div", { class: "draw-actions" }, h("button", { type: "button", class: "btn btn-ghost", onclick: start }, "↺ 换个问题再抽")),
    );
    root.append(reading);
  }

  start();
  return root;
}
