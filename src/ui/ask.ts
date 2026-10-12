import type { Dim } from "../data/types";
import { ASK_CONTEXT_LIMIT, ASK_QUESTION_LIMIT, type AskEvidence, type AskInput, type AskTurn, askDeepSeek, askEvidence, askPreviewText, MAX_FOLLOW_UPS, QUESTION_TEMPLATES, SITUATIONS, TOPIC_LABEL } from "../llm/ask";
import { DIMS } from "../methods/fusion";
import { METHOD_ORDER } from "../methods";
import type { MethodId } from "../methods/types";
import { h } from "./dom";
import { keyField } from "./llm-key";
import { getForecasts, getState } from "./state";

/** "2027-04" to "2027 年 4 月". */
const monthName = (key: string) => `${key.slice(0, 4)} 年 ${Number(key.slice(5))} 月`;

function monthsLine(e: AskEvidence): string {
  if (e.months.length === 0) return "这个话题没有逐月数据，只能看整体倾向。";
  const best = e.bestMonths[0];
  const worst = e.worstMonths[0];
  const parts = [best ? `较顺：${monthName(best.month)}` : "", worst ? `需留意：${monthName(worst.month)}` : ""].filter(Boolean);
  return parts.length > 0 ? parts.join(" · ") : "未来 12 个月没有明显偏顺或偏紧的月份。";
}

/**
 * `#/ask`, `#/ask/t/<dim>` (preselect a topic) and `#/ask/m/<methodId>` (focus one system).
 * The conversation lives in this closure only. Returns a cleanup that cancels a running request.
 */
export function renderAsk(view: HTMLElement, arg: string[] = []): () => void {
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
  const evidence = () => {
    let e = cache.get(topic);
    if (!e) cache.set(topic, (e = askEvidence(results, getForecasts(), topic, focusId)));
    return e;
  };

  const status = h("p", { class: "v-caption", role: "status", "aria-live": "polite" });
  const preview = h("section", { class: "glass ask-preview" }, h("p", { class: "v-caption" }, "正在整理推算摘要……"));
  const topicChips = h("div", { class: "dim-filter", role: "group", "aria-label": "方向" });
  const templateChips = h("div", { class: "rel-chips" });
  const situationChips = h("div", { class: "rel-chips" });
  const question = h("textarea", { class: "field", rows: "3", maxlength: String(ASK_QUESTION_LIMIT), "aria-label": "你的问题", placeholder: "写下一个具体的问题，或点上面的例子。" });
  const context = h("textarea", { class: "field", rows: "3", maxlength: String(ASK_CONTEXT_LIMIT), "aria-label": "补充情况（可选）", placeholder: "补充情况（可选）：现在的处境、正在比较的选择、时间上的限制。请不要写姓名、证件号等身份信息。" });
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
    const e = evidence();
    preview.replaceChildren(
      h("p", { class: "eyebrow" }, "本地摘要 · 不联网"),
      h("div", { class: "tp-head" }, h("h3", null, TOPIC_LABEL[topic]), h("span", { class: "tp-avg" }, h("b", null, String(e.score)), " 分")),
      h("p", { class: "tp-consensus" }, e.consensus),
      h("p", { class: "tp-months" }, monthsLine(e)),
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
      status.textContent = "回答完成。问题与回答只在这个页面里，不会保存在本站。";
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
    h("p", { class: "v-caption" }, "服务商：DeepSeek · 模型：deepseek-flash。点击后才会发送请求，由你的 DeepSeek 账户按 API 用量付费。"),
    key.element,
    h("details", { class: "ask-details" }, h("summary", null, "将发送给 DeepSeek 的内容"), sent),
    h("p", { class: "v-caption ask-privacy" }, "点击后，会把所选话题的推算摘要、你的问题和补充情况直接发送给 DeepSeek；不发送出生日期、地点和姓名。费用由你的 DeepSeek 账户承担。"),
    h("div", { class: "draw-actions" }, submit, cancel),
    status,
  );

  const root = h("section", { class: "llm-reading glass ask-card" }, form, thread, follow);
  question.addEventListener("input", updateSent);
  context.addEventListener("input", updateSent);

  view.append(
    h("nav", { class: "topbar" }, h("a", { href: "#/hub", class: "btn btn-ghost" }, "← 星盘总览"), h("span", { class: "topbar-count" }, "QUAESTIO"), h("a", { href: "#/summary", class: "btn btn-ghost" }, "融合总结 ✦")),
    h("header", { class: "page-head" }, h("p", { class: "eyebrow" }, "QUAESTIO · 问事"), h("h1", { class: "title-glow small" }, "问事"), h("p", { class: "hub-guide" }, "选一个方向，写下具体的问题和你的处境。回答只用各体系已经算出的内容，不另外编造。")),
    focusName ? h("p", { class: "ask-focus" }, "重点体系：", h("b", null, focusName), "。它的结论会和其他体系的摘要一起提供。", h("a", { href: "#/ask" }, "取消重点")) : "",
    root,
  );

  renderChips();
  updateFollow();
  setTimeout(() => {
    renderPreview();
    updateSent();
  }, 0);
  return () => controller?.abort();
}
