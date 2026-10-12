import type { Dim } from "../data/types";
import { ASK_CONTEXT_LIMIT, ASK_QUESTION_LIMIT, type AskEvidence, type AskInput, type AskTurn, askDeepSeek, askEvidence, askPreviewText, MAX_FOLLOW_UPS, QUESTION_TEMPLATES, SITUATIONS, TOPIC_LABEL } from "../llm/ask";
import { DIMS } from "../methods/fusion";
import { consensusText, type TopicView, topicViews } from "../methods/topics";
import { METHOD_ORDER } from "../methods";
import type { MethodId } from "../methods/types";
import { h } from "./dom";
import { jiaoPanel } from "./jiao";
import { keyField } from "./llm-key";
import { getForecasts, getState } from "./state";
import { monthsLine } from "./summary";
import { tarotDraw } from "./tarot-draw";

/**
 * The AI ask flow. `arg` is `t/<dim>` (preselect a topic) or `m/<methodId>` (focus one system).
 * The conversation lives in this closure only. `dispose` cancels a running request.
 */
function askFlow(arg: string[]): { element: HTMLElement; dispose: () => void } {
  const results = getState().results!;
  const focusId = arg[0] === "m" && METHOD_ORDER.includes(arg[1] as MethodId) ? (arg[1] as MethodId) : undefined;
  const focusName = focusId ? results.find((r) => r.id === focusId)?.name : undefined;
  let topic: Dim = arg[0] === "t" && DIMS.includes(arg[1] as Dim) ? (arg[1] as Dim) : "career";

  let controller: AbortController | undefined;
  let busy = false;
  /** The first question and its evidence, kept so that follow-ups use the same data. */
  let session: { ask: AskInput; evidence: AskEvidence } | undefined;
  let history: AskTurn[] = [];
  const situation = new Set<string>();
  const cache = new Map<Dim, AskEvidence>();
  let views: TopicView[] | undefined;
  const view = () => (views ??= topicViews(results, getForecasts())).find((v) => v.dim === topic)!;
  const evidence = () => {
    let e = cache.get(topic);
    if (!e) cache.set(topic, (e = askEvidence(results, getForecasts(), topic, focusId, getState().input)));
    return e;
  };

  const status = h("p", { class: "v-caption", role: "status", "aria-live": "polite" });
  const preview = h("section", { class: "glass ask-preview" }, h("p", { class: "v-caption" }, "正在整理推算摘要……"));
  const topicChips = h("div", { class: "dim-filter", role: "group", "aria-label": "方向" });
  const templateChips = h("div", { class: "rel-chips" });
  const situationChips = h("div", { class: "rel-chips" });
  const question = h("textarea", { class: "field", rows: "3", maxlength: String(ASK_QUESTION_LIMIT), "aria-label": "你的问题", placeholder: "写下一个具体的问题，或点上面的例子。" });
  const context = h("textarea", { class: "field", rows: "3", maxlength: String(ASK_CONTEXT_LIMIT), "aria-label": "补充情况（可选）", placeholder: "补充情况（可选）：现在的处境、正在比较的选择、时间上的限制。" });
  const key = keyField((message) => { status.textContent = message; });
  const sent = h("pre", { class: "ask-sent" });
  const thread = h("div", { class: "llm-output ask-thread", hidden: true });
  const followInput = h("textarea", { class: "field", rows: "2", maxlength: String(ASK_QUESTION_LIMIT), "aria-label": "接着问", placeholder: "接着问一句，例如：如果我选择等到明年呢？" });
  const counter = h("p", { class: "v-caption" });
  const followBtn = h("button", { type: "submit", class: "btn btn-primary" }, "接着问");
  const resetBtn = h("button", { type: "button", class: "btn btn-ghost" }, "重新开始");
  const cancel = h("button", { type: "button", class: "btn btn-ghost ask-cancel", hidden: true, onclick: () => controller?.abort() }, "取消");
  const submit = h("button", { type: "submit", class: "btn btn-primary" }, "问一问 ✦");

  const currentAsk = (): AskInput => ({ topic, question: question.value, situation: [...situation], context: context.value });

  const followUpsUsed = () => history.filter((t) => t.role === "user").length;

  function updateFollow() {
    follow.hidden = history.length === 0;
    const left = MAX_FOLLOW_UPS - followUpsUsed();
    counter.textContent = left > 0 ? `还可以追问 ${left} 次（最多 ${MAX_FOLLOW_UPS} 次）。追问沿用上面的推算摘要和你最初的提问；改动上方内容后点“问一问”会重新开始。` : `已达追问上限（${MAX_FOLLOW_UPS} 次）。可以点“重新开始”换一个问题。`;
    followInput.disabled = followBtn.disabled = busy || left <= 0;
    resetBtn.disabled = busy;
  }

  function updateSent() {
    sent.textContent = askPreviewText(evidence(), currentAsk());
  }

  function renderPreview() {
    const v = view();
    preview.replaceChildren(
      h("p", { class: "eyebrow" }, "本地摘要"),
      h("div", { class: "tp-head" }, h("h3", null, TOPIC_LABEL[topic]), h("span", { class: "tp-avg" }, h("b", null, String(Math.round(v.avg))), " 分")),
      h("p", { class: "tp-consensus" }, consensusText(v, results.length)),
      h("p", { class: "tp-months" }, monthsLine(v) || "这个话题没有明显偏顺或偏紧的月份。"),
    );
  }

  function renderChips() {
    topicChips.replaceChildren(...DIMS.map((d) => h("button", { type: "button", class: `dim-chip${d === topic ? " on" : ""}`, "aria-pressed": String(d === topic), onclick: () => selectTopic(d) }, TOPIC_LABEL[d])));
    templateChips.replaceChildren(...QUESTION_TEMPLATES[topic].map((t) => h("button", { type: "button", class: "dim-chip", onclick: () => { question.value = t; updateSent(); question.focus(); } }, t)));
    situationChips.replaceChildren(
      ...SITUATIONS[topic].map((s) =>
        h("button", { type: "button", class: `dim-chip${situation.has(s) ? " on" : ""}`, "aria-pressed": String(situation.has(s)), onclick: (event: Event) => {
          if (situation.has(s)) situation.delete(s); else situation.add(s);
          const on = situation.has(s);
          const el = event.currentTarget as HTMLElement;
          el.classList.toggle("on", on);
          el.setAttribute("aria-pressed", String(on));
          updateSent();
        } }, s),
      ),
    );
  }

  function resetConversation() {
    history = [];
    session = undefined;
    thread.replaceChildren();
    thread.hidden = true;
    followInput.value = "";
    updateFollow();
  }

  function selectTopic(next: Dim) {
    if (busy || next === topic) return;
    if (QUESTION_TEMPLATES[topic].includes(question.value)) question.value = "";
    topic = next;
    situation.clear();
    resetConversation();
    status.textContent = "";
    renderChips();
    renderPreview();
    updateSent();
  }

  function setBusy(value: boolean) {
    busy = value;
    for (const el of root.querySelectorAll<HTMLButtonElement | HTMLTextAreaElement | HTMLInputElement>("button:not(.ask-cancel), textarea, input")) el.disabled = value;
    cancel.hidden = !value;
    updateFollow();
  }

  const bubble = (role: "q" | "a", text: string) => h("div", { class: `ask-msg ask-${role}` }, h("small", null, role === "q" ? "你问" : "回答"), h("p", null, text));

  /** One request: the first question (`followUp` undefined) or a follow-up. The result replaces the state only on success. */
  async function run(followUp?: string) {
    if (controller) return;
    controller = new AbortController();
    const signal = AbortSignal.any([controller.signal, AbortSignal.timeout(90_000)]);
    const leave = () => controller?.abort();
    addEventListener("hashchange", leave, { once: true });
    setBusy(true);
    status.textContent = followUp === undefined ? "正在结合你的问题和推算摘要回答……" : "正在回答追问……";
    try {
      if (followUp === undefined) {
        const next = { ask: currentAsk(), evidence: evidence() };
        const answer = await askDeepSeek(key.value(), next.evidence, next.ask, [], signal);
        if (signal.aborted || !root.isConnected) return;
        session = next;
        history = [{ role: "assistant", content: answer }];
        thread.replaceChildren(bubble("q", next.ask.question.trim()), bubble("a", answer));
      } else {
        const turn: AskTurn = { role: "user", content: followUp };
        const answer = await askDeepSeek(key.value(), session!.evidence, session!.ask, [...history, turn], signal);
        if (signal.aborted || !root.isConnected) return;
        history = [...history, turn, { role: "assistant", content: answer }];
        thread.append(bubble("q", followUp), bubble("a", answer));
        followInput.value = "";
      }
      thread.hidden = false;
      status.textContent = "回答完成。";
      thread.lastElementChild?.scrollIntoView({ block: "nearest" });
    } catch (error) {
      status.textContent = error instanceof Error ? error.message : "请求失败，请重试。";
    } finally {
      removeEventListener("hashchange", leave);
      controller = undefined;
      setBusy(false);
    }
  }

  const follow = h("form", { class: "llm-form ask-follow", hidden: true, onsubmit: (event: Event) => {
    event.preventDefault();
    const text = followInput.value.trim();
    if (!text) { status.textContent = "请先写下想追问的内容。"; return; }
    void run(text);
  } },
    h("label", null, "接着问", followInput),
    counter,
    h("div", { class: "draw-actions" }, followBtn, resetBtn),
  );
  resetBtn.onclick = () => { resetConversation(); status.textContent = "已清空这次对话。"; };

  const form = h("form", { class: "llm-form ask-form", onsubmit: (event: Event) => {
    event.preventDefault();
    void run();
  } },
    h("div", { class: "ask-block" }, h("h3", null, "1 · 选一个方向"), topicChips),
    preview,
    h("div", { class: "ask-block" }, h("h3", null, "2 · 你想问什么"), templateChips, question),
    h("div", { class: "ask-block" }, h("h3", null, "3 · 你现在的处境（可多选）"), situationChips, h("label", null, "补充情况（可选）", context)),
    h("p", { class: "v-caption" }, "DeepSeek · deepseek-flash，按你的 API 用量计费。"),
    key.element,
    h("details", { class: "ask-details" }, h("summary", null, "将发送给 AI 的内容"), sent),
    h("div", { class: "draw-actions" }, submit, cancel),
    status,
  );

  const root = h("section", { class: "llm-reading glass ask-card" }, form, thread, follow);
  question.addEventListener("input", updateSent);
  context.addEventListener("input", updateSent);

  const element = h(
    "div",
    null,
    focusName ? h("p", { class: "ask-focus" }, "重点体系：", h("b", null, focusName), "。它的结论会和其他体系的摘要一起提供。", h("a", { href: "#/ask" }, "取消重点")) : "",
    root,
  );

  renderChips();
  updateFollow();
  setTimeout(() => {
    renderPreview();
    updateSent();
  }, 0);
  return { element, dispose: () => controller?.abort() };
}

type Tab = "ask" | "tarot" | "jiao";
const TABS: { id: Tab; label: string }[] = [
  { id: "ask", label: "AI 问事" },
  { id: "tarot", label: "抽塔罗" },
  { id: "jiao", label: "掷圣杯" },
];

/**
 * `#/ask` with three sections: AI 问事, 抽塔罗 and 掷圣杯.
 * Deep links: `#/ask/t/<dim>`, `#/ask/m/<methodId>`, `#/ask/tarot` and `#/ask/jiao`.
 * A section is built the first time it is shown and then kept, so a drawn spread survives a tab switch.
 * Switching tabs rewrites the hash with `replaceState`, which fires no hashchange, so the view is not rendered again.
 * Returns a cleanup that cancels every running request and animation.
 */
export function renderAsk(view: HTMLElement, arg: string[] = []): () => void {
  const start: Tab = arg[0] === "tarot" ? "tarot" : arg[0] === "jiao" ? "jiao" : "ask";
  // The hash of the ask section keeps its own arguments (topic or focus system).
  const askHash = start === "ask" && arg.length > 0 ? `#/ask/${arg.join("/")}` : "#/ask";
  const hashOf = (tab: Tab) => (tab === "ask" ? askHash : `#/ask/${tab}`);

  const cleanups: (() => void)[] = [];
  const builders: Record<Tab, () => HTMLElement> = {
    ask: () => {
      const flow = askFlow(start === "ask" ? arg : []);
      cleanups.push(flow.dispose);
      return flow.element;
    },
    tarot: () => {
      const draw = tarotDraw();
      cleanups.push(draw.cancel);
      return draw.element;
    },
    jiao: () => {
      const panel = jiaoPanel();
      cleanups.push(panel.cancel);
      return panel.element;
    },
  };

  const tabs = new Map<Tab, HTMLButtonElement>();
  const panels = new Map<Tab, HTMLElement>();
  const mounted = new Set<Tab>();

  function show(tab: Tab, focus = false) {
    for (const t of TABS) {
      const on = t.id === tab;
      const btn = tabs.get(t.id)!;
      btn.setAttribute("aria-selected", String(on));
      btn.tabIndex = on ? 0 : -1;
      panels.get(t.id)!.hidden = !on;
    }
    if (!mounted.has(tab)) {
      mounted.add(tab);
      panels.get(tab)!.append(builders[tab]());
    }
    history.replaceState(null, "", hashOf(tab));
    if (focus) tabs.get(tab)!.focus();
  }

  for (const t of TABS) {
    tabs.set(t.id, h("button", {
      type: "button", role: "tab", class: "ask-tab", id: `ask-tab-${t.id}`, "aria-controls": `ask-panel-${t.id}`, "aria-selected": "false", tabindex: "-1",
      onclick: () => show(t.id),
      onkeydown: (event: KeyboardEvent) => {
        const at = TABS.findIndex((x) => x.id === t.id);
        const to = event.key === "ArrowRight" ? at + 1 : event.key === "ArrowLeft" ? at - 1 : event.key === "Home" ? 0 : event.key === "End" ? TABS.length - 1 : -1;
        if (to < 0) return;
        event.preventDefault();
        show(TABS[(to + TABS.length) % TABS.length]!.id, true);
      },
    }, t.label));
    panels.set(t.id, h("div", { class: "ask-panel", role: "tabpanel", id: `ask-panel-${t.id}`, "aria-labelledby": `ask-tab-${t.id}`, hidden: true }));
  }

  view.append(
    h("nav", { class: "topbar" }, h("a", { href: "#/hub", class: "btn btn-ghost" }, "← 星盘总览"), h("span", { class: "topbar-count" }, "QUAESTIO"), h("a", { href: "#/summary", class: "btn btn-ghost" }, "融合总结 ✦")),
    h("header", { class: "page-head" }, h("p", { class: "eyebrow" }, "QUAESTIO · 问事"), h("h1", { class: "title-glow small" }, "问事"), h("p", { class: "hub-guide" }, "带着一个具体的问题来：让 AI 结合各体系回答，或亲手抽三张塔罗、掷一次圣杯。")),
    h("div", { class: "ask-tabs", role: "tablist", "aria-label": "问事方式" }, ...tabs.values()),
    ...panels.values(),
  );
  show(start);
  return () => {
    for (const c of cleanups) c();
  };
}
