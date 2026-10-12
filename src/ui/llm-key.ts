import { KEY_STORAGE } from "../llm/client";
import { h } from "./dom";

export interface KeyField {
  element: HTMLElement;
  value: () => string;
  setDisabled: (disabled: boolean) => void;
}

let sessionKey: string | undefined;
export function currentKey(): string {
  if (sessionKey !== undefined) return sessionKey;
  try { return localStorage.getItem(KEY_STORAGE)?.trim() ?? ""; }
  catch { return ""; }
}

/** Send no key in the event. Update only panels that are still mounted. */
function updateKeys() {
  for (const el of document.querySelectorAll(".llm-key")) el.dispatchEvent(new Event("keychange"));
  for (const el of document.querySelectorAll<HTMLDetailsElement>(".deepseek-panel")) el.open = Boolean(currentKey());
}

/** AI panels start closed without a key. Entering a key opens the panel. */
export function deepseekPanel(title: string, ...children: HTMLElement[]): HTMLDetailsElement {
  return h("details", { class: "deepseek-panel glass", open: Boolean(currentKey()) }, h("summary", null, title), !currentKey() ? profileApiLink() : "", ...children);
}

export const profileApiLink = () => h("a", { href: "#/profile/api", class: "btn btn-ghost api-profile-link" }, "请到 Profile 里填写你的 API");

/** AI features read the shared key but never show an input outside Profile. */
export function keyAccess(): Pick<KeyField, "element" | "value"> {
  return { element: currentKey() ? h("a", { href: "#/profile/api", class: "v-caption" }, "API 已配置 · 到 Profile 修改") : profileApiLink(), value: currentKey };
}

/** The password field closes after entry. Saving to browser storage is optional. */
export function keyField(say: (message: string) => void, onClear?: () => void): KeyField {
  const input = h("input", { type: "password", class: "field", autocomplete: "off", spellcheck: "false", "aria-label": "DeepSeek API Key", placeholder: "输入你的 DeepSeek API Key" });
  input.value = currentKey();
  const summary = h("summary");
  const editor = h("details", { open: !Boolean(currentKey()) }, summary, h("label", null, "DeepSeek API Key", input));
  const sync = () => {
    input.value = currentKey();
    editor.open = !Boolean(currentKey());
    summary.textContent = currentKey() ? "API Key 已填写 · 点击修改" : "填写 DeepSeek API Key";
  };
  const accept = () => {
    const value = input.value.trim();
    if (!value) return;
    if (/\s/.test(value)) { say("API Key 不能含空格或换行。"); return; }
    sessionKey = value;
    sync();
    updateKeys();
  };
  input.addEventListener("change", accept);
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") { event.preventDefault(); accept(); }
  });
  const save = h("button", { type: "button", class: "btn btn-ghost", onclick: () => {
    if (!input.value.trim() || /\s/.test(input.value.trim())) { say("请填写有效的 API Key，不能含空格或换行。"); return; }
    accept();
    if (!currentKey()) { say("请先输入 API Key。"); return; }
    try { localStorage.setItem(KEY_STORAGE, currentKey()); say("Key 已保存在当前浏览器，可随时清除。"); }
    catch { say("浏览器无法保存 Key，本次仍可使用，刷新后需要重填。"); }
  } }, "保存 Key 到此浏览器");
  const clear = h("button", { type: "button", class: "btn btn-ghost", onclick: () => {
    sessionKey = "";
    try { localStorage.removeItem(KEY_STORAGE); say("已清除当前浏览器保存的 Key。"); }
    catch { say("无法清除本地存储，请在浏览器的网站设置中清除本站数据。"); }
    sync();
    onClear?.();
    updateKeys();
  } }, "清除 Key");
  const element = h("div", { class: "llm-key" }, editor,
    h("div", { class: "draw-actions" }, save, clear),
    h("p", { class: "v-caption" }, "保存后，Key 留在此浏览器的 localStorage，未加密；请勿在共用设备保存。Key 只会直接发送给 DeepSeek，不经过本站服务器。"),
  );
  element.addEventListener("keychange", () => { sync(); if (!currentKey()) onClear?.(); });
  sync();
  return { element, value: () => currentKey(), setDisabled: (disabled) => { input.disabled = save.disabled = clear.disabled = disabled; } };
}
