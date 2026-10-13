import { topbar } from "./components";
import type { Dim } from "../data/types";
import { ASK_CONTEXT_LIMIT, ASK_QUESTION_LIMIT, type AskEvidence, type AskInput, type AskTurn, askDeepSeek, askEvidence, askPreviewText, MAX_FOLLOW_UPS, QUESTION_TEMPLATES, SITUATIONS, TOPIC_LABEL } from "../llm/ask";
import { DIMS } from "../methods/fusion";
import { requestSignal } from "../llm/client";
import { consensusText, type TopicView, topicViews } from "../methods/topics";
import type { MethodId } from "../methods/types";
import { h } from "./dom";
import { jiaoPanel } from "./jiao";
import { currentKey, deepseekPanel, profileApiLink } from "./llm-key";
import { qimenPanel } from "./qimen";
import { getEnabledMethods, getForecasts, getState } from "./state";
import { monthsLine } from "./summary";
import { tarotDraw } from "./tarot-draw";
import { t } from "../i18n";

/**
 * The AI ask flow. `arg` is `t/<dim>` (preselect a topic) or `m/<methodId>` (focus one system).
 * The conversation lives in this closure only. `dispose` cancels a running request.
 */
function askFlow(arg: string[]): { element: HTMLElement; dispose: () => void } {
  const results = getState().results!;
  const focusId = arg[0] === "m" && getEnabledMethods().includes(arg[1] as MethodId) ? (arg[1] as MethodId) : undefined;
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
  const preview = h("section", { class: "glass ask-preview" }, h("p", { class: "v-caption" }, t("正在整理推算摘要……", "Preparing the chart summary…")));
  const topicChips = h("div", { class: "dim-filter", role: "group", "aria-label": t("方向", "Topic") });
  const templateChips = h("div", { class: "rel-chips" });
  const situationChips = h("div", { class: "rel-chips" });
  const question = h("textarea", { class: "field", rows: "3", maxlength: String(ASK_QUESTION_LIMIT), "aria-label": t("你的问题", "Your question"), placeholder: t("写下一个具体的问题，或点上面的例子。", "Write one specific question, or tap an example above.") });
  const context = h("textarea", { class: "field", rows: "3", maxlength: String(ASK_CONTEXT_LIMIT), "aria-label": t("补充情况（可选）", "More context (optional)"), placeholder: t("补充情况（可选）：现在的处境、正在比较的选择、时间上的限制。", "More context (optional): where you are now, the options you are weighing, any time limits.") });
  const sent = h("pre", { class: "ask-sent" });
  const thread = h("div", { class: "llm-output ask-thread", hidden: true });
  const followInput = h("textarea", { class: "field", rows: "2", maxlength: String(ASK_QUESTION_LIMIT), "aria-label": t("接着问", "Follow-up"), placeholder: t("接着问一句，例如：如果我选择等到明年呢？", "Ask a follow-up, e.g. what if I wait until next year?") });
  const counter = h("p", { class: "v-caption" });
  const followBtn = h("button", { type: "submit", class: "btn btn-primary" }, t("接着问", "Ask again"));
  const resetBtn = h("button", { type: "button", class: "btn btn-ghost" }, t("重新开始", "Start over"));
  const cancel = h("button", { type: "button", class: "btn btn-ghost ask-cancel", hidden: true, onclick: () => controller?.abort() }, t("取消", "Cancel"));
  const submit = h("button", { type: "submit", class: "btn btn-primary" }, t("问一问 ✦", "Ask ✦"));

  const currentAsk = (): AskInput => ({ topic, question: question.value, situation: [...situation], context: context.value });

  const followUpsUsed = () => history.filter((turn) => turn.role === "user").length;

  function updateFollow() {
    follow.hidden = history.length === 0;
    const left = MAX_FOLLOW_UPS - followUpsUsed();
    counter.textContent =
      left > 0
        ? t(`还可以追问 ${left} 次（最多 ${MAX_FOLLOW_UPS} 次）。追问沿用上面的推算摘要和你最初的提问；改动上方内容后点“问一问”会重新开始。`, `${left} follow-up${left === 1 ? "" : "s"} left (at most ${MAX_FOLLOW_UPS}). Follow-ups reuse the summary above and your first question; edit the form and press "Ask" to start again.`)
        : t(`已达追问上限（${MAX_FOLLOW_UPS} 次）。可以点“重新开始”换一个问题。`, `You have used all ${MAX_FOLLOW_UPS} follow-ups. Press "Start over" to ask something new.`);
    followInput.disabled = followBtn.disabled = busy || left <= 0;
    resetBtn.disabled = busy;
  }

  function updateSent() {
    sent.textContent = askPreviewText(evidence(), currentAsk());
  }

  function renderPreview() {
    const v = view();
    preview.replaceChildren(
      h("p", { class: "eyebrow" }, t("本地摘要", "Local summary")),
      h("div", { class: "tp-head" }, h("h3", null, TOPIC_LABEL[topic]), h("span", { class: "tp-avg" }, results.length ? t(`出生画像 · ${Math.round(v.avg)} 分`, `Birth profile · ${Math.round(v.avg)}`) : t("尚未启用体系", "No systems on"))),
      h("p", { class: "tp-consensus" }, consensusText(v, results.length)),
      h("p", { class: "tp-months" }, monthsLine(v) || t("这个话题没有明显偏顺或偏紧的月份。", "No month leans clearly better or worse for this topic.")),
    );
  }

  function renderChips() {
    topicChips.replaceChildren(...DIMS.map((d) => h("button", { type: "button", class: `dim-chip${d === topic ? " on" : ""}`, "aria-pressed": String(d === topic), onclick: () => selectTopic(d) }, TOPIC_LABEL[d])));
    templateChips.replaceChildren(...QUESTION_TEMPLATES[topic].map((q) => h("button", { type: "button", class: "dim-chip", onclick: () => { question.value = q; updateSent(); question.focus(); } }, q)));
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

  const bubble = (role: "q" | "a", text: string) => h("div", { class: `ask-msg ask-${role}` }, h("small", null, role === "q" ? t("你问", "You asked") : t("回答", "Answer")), h("p", null, text));

  /** One request: the first question (`followUp` undefined) or a follow-up. The result replaces the state only on success. */
  async function run(followUp?: string) {
    if (controller) return;
    if (!currentKey()) { status.replaceChildren(profileApiLink()); return; }
    if (!results.length) { status.textContent = t("请先到 Profile 勾选至少一个体系，再使用 AI 问事。", "Turn on at least one system in Profile before asking the AI."); return; }
    controller = new AbortController();
    const signal = requestSignal(controller);
    setBusy(true);
    status.textContent = followUp === undefined ? t("正在结合你的问题和推算摘要回答……", "Answering from your question and the chart summary…") : t("正在回答追问……", "Answering your follow-up…");
    try {
      if (followUp === undefined) {
        const next = { ask: currentAsk(), evidence: evidence() };
        const answer = await askDeepSeek(currentKey(), next.evidence, next.ask, [], signal);
        if (signal.aborted || !root.isConnected) return;
        session = next;
        history = [{ role: "assistant", content: answer }];
        thread.replaceChildren(bubble("q", next.ask.question.trim()), bubble("a", answer));
      } else {
        const turn: AskTurn = { role: "user", content: followUp };
        const answer = await askDeepSeek(currentKey(), session!.evidence, session!.ask, [...history, turn], signal);
        if (signal.aborted || !root.isConnected) return;
        history = [...history, turn, { role: "assistant", content: answer }];
        thread.append(bubble("q", followUp), bubble("a", answer));
        followInput.value = "";
      }
      thread.hidden = false;
      status.textContent = t("回答完成。", "Done.");
      thread.lastElementChild?.scrollIntoView({ block: "nearest" });
    } catch (error) {
      status.textContent = error instanceof Error ? error.message : t("请求失败，请重试。", "The request failed. Try again.");
    } finally {
      controller = undefined;
      setBusy(false);
    }
  }

  const follow = h("form", { class: "llm-form ask-follow", hidden: true, onsubmit: (event: Event) => {
    event.preventDefault();
    const text = followInput.value.trim();
    if (!text) { status.textContent = t("请先写下想追问的内容。", "Write your follow-up first."); return; }
    void run(text);
  } },
    h("label", null, t("接着问", "Follow-up"), followInput),
    counter,
    h("div", { class: "draw-actions" }, followBtn, resetBtn),
  );
  resetBtn.onclick = () => { resetConversation(); status.textContent = t("已清空这次对话。", "Conversation cleared."); };

  const form = h("form", { class: "llm-form ask-form", onsubmit: (event: Event) => {
    event.preventDefault();
    void run();
  } },
    h("div", { class: "ask-block" }, h("h3", null, t("1 · 选一个方向", "1 · Pick a topic")), topicChips),
    preview,
    h("div", { class: "ask-block" }, h("h3", null, t("2 · 你想问什么", "2 · What do you want to ask")), templateChips, question),
    h("div", { class: "ask-block" }, h("h3", null, t("3 · 你现在的处境（可多选）", "3 · Your situation (pick any)")), situationChips, h("label", null, t("补充情况（可选）", "More context (optional)"), context)),
    h("p", { class: "v-caption" }, t("DeepSeek · deepseek-flash，按你的 API 用量计费。", "DeepSeek · deepseek-flash, billed to your API account by usage.")),
    profileApiLink(),
    h("details", { class: "ask-details" }, h("summary", null, t("将发送给 AI 的内容", "What will be sent to the AI")), sent),
    h("div", { class: "draw-actions" }, submit, cancel),
    status,
  );

  const root = deepseekPanel(t("DeepSeek · AI 问事", "DeepSeek · AI questions"), h("section", { class: "llm-reading ask-card" }, form, thread, follow));
  question.addEventListener("input", updateSent);
  context.addEventListener("input", updateSent);

  const element = h(
    "div",
    null,
    focusName ? h("p", { class: "ask-focus" }, t("重点体系：", "Focus system: "), h("b", null, focusName), t("。它的结论会和其他体系的摘要一起提供。", ". Its findings are sent along with the other systems' summaries. "), h("a", { href: "#/ask" }, t("取消重点", "Remove focus"))) : "",
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

type Tab = "ask" | "tarot" | "jiao" | "qimen";
const tabsList = (): { id: Tab; label: string }[] => [
  { id: "ask", label: t("AI 问事", "Ask AI") },
  { id: "tarot", label: t("抽塔罗", "Tarot draw") },
  { id: "jiao", label: t("掷圣杯", "Moon blocks") },
  { id: "qimen", label: t("奇门遁甲", "Qimen Dunjia") },
];

/**
 * The question page has AI, tarot, jiao and Qimen tabs.
 * Qimen has the deep link `#/ask/qimen`.
 * A section is built the first time it is shown and then kept, so a drawn spread survives a tab switch.
 * Switching tabs rewrites the hash with `replaceState`, which fires no hashchange, so the view is not rendered again.
 * Returns a cleanup that cancels every running request and animation.
 */
export function renderAsk(view: HTMLElement, arg: string[] = []): () => void {
  const TABS = tabsList();
  const start: Tab = TABS.find((tab) => tab.id === arg[0])?.id ?? "ask";
  // The hash of the ask section keeps its own arguments (topic or focus system).
  const askHash = start === "ask" && arg.length > 0 ? `#/ask/${arg.join("/")}` : "#/ask";
  const hashOf = (tab: Tab) => (tab === "ask" ? askHash : `#/ask/${tab}`);

  const cleanups: (() => void)[] = [];
  const builders: Record<Tab, () => HTMLElement> = {
    qimen: qimenPanel,
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
    for (const x of TABS) {
      const on = x.id === tab;
      const btn = tabs.get(x.id)!;
      btn.setAttribute("aria-selected", String(on));
      btn.tabIndex = on ? 0 : -1;
      panels.get(x.id)!.hidden = !on;
    }
    if (!mounted.has(tab)) {
      mounted.add(tab);
      panels.get(tab)!.append(builders[tab]());
    }
    history.replaceState(null, "", hashOf(tab));
    if (focus) tabs.get(tab)!.focus();
  }

  for (const tb of TABS) {
    tabs.set(tb.id, h("button", {
      type: "button", role: "tab", class: "ask-tab", id: `ask-tab-${tb.id}`, "aria-controls": `ask-panel-${tb.id}`, "aria-selected": "false", tabindex: "-1",
      onclick: () => show(tb.id),
      onkeydown: (event: KeyboardEvent) => {
        const at = TABS.findIndex((x) => x.id === tb.id);
        const to = event.key === "ArrowRight" ? at + 1 : event.key === "ArrowLeft" ? at - 1 : event.key === "Home" ? 0 : event.key === "End" ? TABS.length - 1 : -1;
        if (to < 0) return;
        event.preventDefault();
        show(TABS[(to + TABS.length) % TABS.length]!.id, true);
      },
    }, tb.label));
    panels.set(tb.id, h("div", { class: "ask-panel", role: "tabpanel", id: `ask-panel-${tb.id}`, "aria-labelledby": `ask-tab-${tb.id}`, hidden: true }));
  }

  view.append(
    topbar(["#/hub", t("← 星盘总览", "← Overview")], "QUAESTIO", ["#/summary", t("融合总结 ✦", "Summary ✦")]),
    h("header", { class: "page-head" }, h("p", { class: "eyebrow" }, t("QUAESTIO · 问事", "QUAESTIO · ASK")), h("h1", { class: "title-glow small" }, t("问事", "Ask")), h("p", { class: "hub-guide" }, t("带着一个具体的问题来：起一局奇门、抽三张塔罗、心中默念掷圣杯，或让 AI 结合各体系回答。", "Bring one real question: cast a Qimen chart, draw three tarot cards, throw the moon blocks with the question in mind, or let AI answer with all the systems."))),
    h("div", { class: "ask-tabs", role: "tablist", "aria-label": t("问事方式", "Ways to ask") }, ...tabs.values()),
    ...panels.values(),
  );
  show(start);
  return () => {
    for (const c of cleanups) c();
  };
}
