import { MAJOR_ARCANA, type TarotCard } from "../data/tarot";
import { h, reveal, sleep } from "./dom";

const ROMAN = ["0", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII", "XIII", "XIV", "XV", "XVI", "XVII", "XVIII", "XIX", "XX", "XXI"];
type Topic = "all" | "career" | "wealth" | "love" | "health" | "study";
const TOPICS: [Topic, string][] = [["all", "综合"], ["career", "事业"], ["wealth", "财运"], ["love", "感情"], ["health", "身心"], ["study", "学业"]];
const POSITIONS = [
  { name: "现状", hint: "你现在所处的局面" },
  { name: "挑战", hint: "需要跨过的那道坎" },
  { name: "建议", hint: "接下来可以怎么做" },
];

/** Uniform random integer in [0, n) from the browser's cryptographic RNG. */
function randInt(n: number): number {
  const buf = new Uint32Array(1);
  const limit = Math.floor(0x1_0000_0000 / n) * n;
  do crypto.getRandomValues(buf);
  while (buf[0]! >= limit);
  return buf[0]! % n;
}

function shuffled(): number[] {
  const deck = MAJOR_ARCANA.map((c) => c.num);
  for (let i = deck.length - 1; i > 0; i--) {
    const j = randInt(i + 1);
    [deck[i], deck[j]] = [deck[j]!, deck[i]!];
  }
  return deck;
}

function topicText(c: TarotCard, t: Topic): string {
  if (t === "career" || t === "wealth") return c.career;
  if (t === "love") return c.love;
  if (t === "health") return c.health;
  return c.summary;
}

function face(c: TarotCard, reversed: boolean): HTMLElement {
  return h(
    "div",
    { class: "tcard-inner" },
    h("div", { class: "tcard-back" }, h("i", null, "✦")),
    h("div", { class: `tcard-front${reversed ? " reversed" : ""}` }, h("small", null, ROMAN[c.num]), h("span", { class: "tsym" }, c.symbol), h("b", null, c.name), h("small", null, c.en)),
  );
}

/**
 * Three-card draw that the user does by hand. The order and the reversals come from crypto.getRandomValues,
 * not from the birth data, and the result does not change any score.
 */
export function tarotDraw(): HTMLElement {
  let topic: Topic = "all";
  const root = h("section", { class: "draw glass" });

  function start() {
    const question = h("input", { class: "field", maxlength: "40", placeholder: "想问的事（可不填），例如：这份新工作适合我吗？" });
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
      h("p", { class: "v-caption" }, "塔罗的传统用法是先有问题、再由你自己抽牌。先在心里想好一件具体的事，选一个方向，然后洗牌。"),
      chips,
      question,
      h("div", { class: "draw-actions" }, h("button", { type: "button", class: "btn btn-primary", onclick: () => fan(question.value.trim()) }, "洗牌 ✦")),
    );
  }

  async function fan(q: string) {
    const deck = shuffled();
    const picks: { num: number; reversed: boolean }[] = [];
    const slots = POSITIONS.map((p) => h("figure", { class: "tslot draw-slot" }, h("div", { class: "slot-empty" }, "？"), h("figcaption", null, p.name, h("small", null, p.hint))));
    const status = h("p", { class: "draw-status", "aria-live": "polite" }, "牌已洗好。凭直觉点三张。");
    const fanEl = h(
      "div",
      { class: "fan shuffling", style: { "--n": deck.length } as never },
      ...deck.map((num, i) =>
        h(
          "button",
          {
            type: "button",
            class: "fan-card",
            style: { "--i": i } as never,
            "aria-label": `第 ${i + 1} 张牌`,
            onclick: (e: Event) => pick(e.currentTarget as HTMLButtonElement, num),
          },
          h("i", null, "✦"),
        ),
      ),
    );
    root.replaceChildren(h("h3", null, q ? `「${q}」` : `${TOPICS.find(([t]) => t === topic)![1]}运势`), status, fanEl, h("div", { class: "tarot-row" }, ...slots));
    await sleep(900);
    fanEl.classList.remove("shuffling");

    function pick(btn: HTMLButtonElement, num: number) {
      if (picks.length >= 3 || btn.disabled) return;
      btn.disabled = true;
      btn.classList.add("taken");
      const reversed = randInt(2) === 1;
      picks.push({ num, reversed });
      const slot = slots[picks.length - 1]!;
      const card = h("div", { class: "tcard drawn" }, face(MAJOR_ARCANA[num]!, reversed));
      slot.firstElementChild!.replaceWith(card);
      status.textContent = picks.length < 3 ? `还差 ${3 - picks.length} 张。` : "三张牌已就位，正在翻开……";
      if (picks.length === 3) void reveal3(fanEl, slots, picks, q).then(() => (status.textContent = "牌已翻开，解读在下方。"));
    }
  }

  async function reveal3(fanEl: HTMLElement, slots: HTMLElement[], picks: { num: number; reversed: boolean }[], q: string) {
    fanEl.classList.add("gone");
    for (const s of slots) {
      await sleep(450);
      s.querySelector(".tcard")!.classList.add("open");
      s.querySelector("figcaption")!.append(h("em", null, picks[slots.indexOf(s)]!.reversed ? " 逆位" : " 正位"));
    }
    await sleep(600);
    const reading = h(
      "div",
      { class: "draw-reading" },
      ...picks.map(({ num, reversed }, i) => {
        const c = MAJOR_ARCANA[num]!;
        const pos = POSITIONS[i]!;
        const body = i === 2 ? `${reversed ? c.reversed : c.upright}${c.advice}` : `${reversed ? c.reversed : c.upright}${topicText(c, topic)}`;
        return reveal(h("article", { class: "reading glass" }, h("span", { class: "reading-no" }, String(i + 1).padStart(2, "0")), h("h3", null, `${pos.name} · ${c.name}${reversed ? "（逆位）" : ""}`), h("p", null, body)), i * 120);
      }),
      h("p", { class: "v-caption" }, `${q ? "这次的问题会被忘记，不会保存。" : ""}这三张牌由浏览器的随机数决定，与你的生辰无关，也不计入任何评分。同一个问题反复抽，答案会不同——把它当作换个角度想问题的提示。`),
      h("div", { class: "draw-actions" }, h("button", { type: "button", class: "btn btn-ghost", onclick: start }, "↺ 换个问题再抽")),
    );
    root.append(reading);
  }

  start();
  return root;
}
