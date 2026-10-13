import { drawSeed, type SeededCard } from "../core/draw-seed";
import { MAJOR_ARCANA, type TarotCard } from "../data/tarot";
import { QUESTION_LIMIT } from "../llm/tarot";
import { pressOnly } from "./components";
import { h, reducedMotion, reveal, sleep } from "./dom";
import { tarotLlm } from "./tarot-llm";
import { isEn, sep, t } from "../i18n";

const ROMAN = ["0", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII", "XIII", "XIV", "XV", "XVI", "XVII", "XVIII", "XIX", "XX", "XXI"];
type Topic = "all" | "career" | "wealth" | "love" | "health" | "study";
/** The Chinese label is also part of the draw seed, so it stays the same in every language. */
const TOPICS: [Topic, string][] = [["all", "综合"], ["career", "事业"], ["wealth", "财运"], ["love", "感情"], ["health", "身心"], ["study", "学业"]];
const TOPICS_EN: Record<Topic, string> = { all: "General", career: "Career", wealth: "Money", love: "Love", health: "Body and mind", study: "Study" };
const positions = () => [
  { name: t("现状", "Now"), hint: t("你现在所处的局面", "Where you stand") },
  { name: t("挑战", "Challenge"), hint: t("需要跨过的那道坎", "The hurdle to clear") },
  { name: t("建议", "Advice"), hint: t("接下来可以怎么做", "What to do next") },
];

function topicText(c: TarotCard, topic: Topic): string {
  if (topic === "career" || topic === "wealth") return c.career;
  if (topic === "love") return c.love;
  if (topic === "health") return c.health;
  return c.summary;
}

/** Card face. A reversed card turns as a whole (`.tcard.rev`), so the face itself is never rotated. */
function face(c: TarotCard): HTMLElement {
  return h(
    "div",
    { class: "tcard-inner" },
    h("div", { class: "tcard-back" }, h("i", null, "✦")),
    h("div", { class: "tcard-front" }, h("small", null, ROMAN[c.num]), h("span", { class: "tsym" }, c.symbol), h("b", null, c.name), !isEn() && h("small", null, c.en)),
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
export function tarotDraw(): { element: HTMLElement; cancel: () => void } {
  let topic: Topic = "all";
  let cancelReading: (() => void) | undefined;
  const root = h("section", { class: "draw glass" });
  /** Seed input (Chinese in every language) and display label. */
  const topicSeed = () => TOPICS.find(([k]) => k === topic)![1];
  const topicLabel = () => (isEn() ? TOPICS_EN[topic] : topicSeed());

  function start() {
    cancelReading?.();
    const question = h("textarea", { class: "field", rows: "3", maxlength: String(QUESTION_LIMIT), "aria-label": t("抽牌问题（可选）", "Question for the draw (optional)"), placeholder: t("想问的具体问题（可不填），例如：我想换工作，但新岗位要搬家，应该先确认哪些条件？", "Your question (optional), e.g. I want to change jobs but the new one means moving. What should I check first?") });
    const chips = h(
      "div",
      { class: "rel-chips" },
      ...TOPICS.map(([k, label]) =>
        h(
          "button",
          {
            type: "button",
            class: `dim-chip${k === topic ? " on" : ""}`,
            "aria-pressed": String(k === topic),
            onclick: (e: Event) => {
              topic = k;
              pressOnly(e.currentTarget as Element);
            },
          },
          isEn() ? TOPICS_EN[k] : label,
        ),
      ),
    );
    root.replaceChildren(
      h("h3", null, t("亲手抽三张牌", "Draw three cards by hand")),
      h("p", { class: "v-caption" }, t("想好一件具体的事，选一个方向，然后洗牌。", "Think of one real matter, pick a topic, then shuffle.")),
      chips,
      question,
      h("div", { class: "draw-actions" }, h("button", { type: "button", class: "btn btn-primary", onclick: () => fan(question.value.trim()) }, t("洗牌 ✦", "Shuffle ✦"))),
    );
  }

  async function fan(q: string) {
    const seed = drawSeed(q, topicSeed(), new Date());
    const picks: SeededCard[] = [];
    const flights: Promise<void>[] = [];
    const slots = positions().map((p) => h("figure", { class: "tslot draw-slot" }, h("div", { class: "slot-empty" }, "？"), h("figcaption", null, p.name, h("small", null, p.hint))));
    const status = h("p", { class: "draw-status", "aria-live": "polite" }, t("正在把你的问题和此刻写进牌里……", "Writing your question and this moment into the cards…"));
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
            "aria-label": t(`第 ${i + 1} 张牌`, `Card ${i + 1}`),
            onclick: (e: Event) => pick(e.currentTarget as HTMLButtonElement, card),
          },
          h("i", null, "✦"),
        ),
      ),
    );
    const stage = h("div", { class: "deck-stage" }, fanEl);
    const seedLine = h("p", { class: "seed-line" }, t(`起卦 ${seed.stamp}`, `Cast ${seed.stamp}`), h("b", { title: t("问卦印记：由问题、方向和时间算出", "Draw sigil: computed from the question, topic and time") }, seed.sigil));
    root.replaceChildren(h("h3", null, q ? t(`「${q}」`, `“${q}”`) : t(`${topicLabel()}运势`, `${topicLabel()} reading`)), seedLine, status, stage, h("div", { class: "tarot-row" }, ...slots));
    if (reducedMotion()) await sleep(300);
    else {
      await absorb(stage, fanEl, [...[...q].filter((c) => c.trim()).slice(0, 28), ...seed.sigil], seed.rand);
      status.textContent = t("洗牌中……", "Shuffling…");
      await riffle(fanEl);
    }
    if (!root.isConnected) return;
    fanEl.classList.remove("shuffling");
    for (const b of fanEl.children) (b as HTMLButtonElement).disabled = false;
    status.textContent = t("牌已洗好。凭直觉点三张。", "The deck is shuffled. Tap three cards by feel.");

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
      status.textContent = picks.length < 3 ? t(`还差 ${3 - picks.length} 张。`, `${3 - picks.length} more to go.`) : t("三张牌已就位，正在翻开……", "All three cards are in place. Turning them over…");
      if (picks.length === 3) void Promise.all(flights).then(() => reveal3(fanEl, slots, picks, q)).then(() => (status.textContent = t("牌已翻开，解读在下方。", "The cards are open. The reading is below.")));
    }
  }

  async function reveal3(fanEl: HTMLElement, slots: HTMLElement[], picks: SeededCard[], q: string) {
    fanEl.classList.add("gone");
    for (const [i, s] of slots.entries()) {
      await sleep(i ? 700 : 450);
      s.classList.add("lit");
      s.querySelector(".tcard")!.classList.add("open");
      s.querySelector("figcaption")!.append(h("em", null, picks[i]!.reversed ? t(" 逆位", " reversed") : t(" 正位", " upright")));
    }
    await sleep(picks[2]!.reversed ? 1500 : 900);
    if (!root.isConnected) return;
    const llm = tarotLlm({ question: q, context: "", topic: topicLabel(), cards: picks });
    const POSITIONS = positions();
    cancelReading = llm.cancel;
    const reading = h(
      "div",
      { class: "draw-reading" },
      ...picks.map(({ num, reversed }, i) => {
        const c = MAJOR_ARCANA[num]!;
        const pos = POSITIONS[i]!;
        const body = [reversed ? c.reversed : c.upright, i === 2 ? c.advice : topicText(c, topic)].join(sep());
        return reveal(h("article", { class: "reading glass" }, h("span", { class: "reading-no" }, String(i + 1).padStart(2, "0")), h("h3", null, `${pos.name} · ${c.name}${reversed ? t("（逆位）", " (reversed)") : ""}`), h("p", null, body)), i * 120);
      }),
      llm.element,
      h("div", { class: "draw-actions" }, h("button", { type: "button", class: "btn btn-ghost", onclick: start }, t("↺ 换个问题再抽", "↺ Draw again with a new question"))),
    );
    root.append(reading);
  }

  start();
  return { element: root, cancel: () => cancelReading?.() };
}
