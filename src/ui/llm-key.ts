import { KEY_STORAGE } from "../llm/client";
import { h } from "./dom";
import { t } from "../i18n";

const PROFILE_API_HREF = "#/profile/api";

let sessionKey: string | undefined;
export function currentKey(): string {
  if (sessionKey !== undefined) return sessionKey;
  try { return localStorage.getItem(KEY_STORAGE)?.trim() ?? ""; }
  catch { return ""; }
}

/** Send no key in the event. Update only elements that are still mounted. */
function updateKeys() {
  for (const el of document.querySelectorAll("[data-keysync]")) el.dispatchEvent(new Event("keychange"));
}

/** AI panels start closed without a key. Entering a key opens the panel. */
export function deepseekPanel(title: string, ...children: HTMLElement[]): HTMLDetailsElement {
  const panel = h("details", { class: "deepseek-panel glass", open: Boolean(currentKey()), "data-keysync": true }, h("summary", null, title), !currentKey() ? profileApiLink() : "", ...children);
  panel.addEventListener("keychange", () => { panel.open = Boolean(currentKey()); });
  return panel;
}

/** AI features read the shared key but never show an input outside Profile. The link opens the API settings in a dialog, so the page stays mounted. */
export function profileApiLink(): HTMLAnchorElement {
  const link = h("a", { href: PROFILE_API_HREF, class: "btn btn-ghost api-profile-link", "data-keysync": true, onclick: (event: MouseEvent) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    openApiDialog();
  } });
  const sync = () => { link.textContent = currentKey() ? t("API 已配置 · 到 Profile 修改", "API key set · change it in Profile") : t("请到 Profile 里填写你的 API", "Add your API key in Profile"); };
  link.addEventListener("keychange", sync);
  sync();
  return link;
}

/** The password field closes after entry. Enter or the save button stores the key in this browser. */
function keyField(say: (message: string) => void): HTMLElement {
  const input = h("input", { type: "password", class: "field", autocomplete: "off", spellcheck: "false", "aria-label": "DeepSeek API Key", placeholder: t("输入你的 DeepSeek API Key", "Enter your DeepSeek API key") });
  const summary = h("summary");
  const editor = h("details", null, summary, h("label", null, "DeepSeek API Key", input));
  const sync = () => {
    input.value = currentKey();
    editor.open = !currentKey();
    summary.textContent = currentKey() ? t("API Key 已填写 · 点击修改", "API key entered · click to change") : t("填写 DeepSeek API Key", "Enter a DeepSeek API key");
  };
  const accept = () => {
    const value = input.value.trim();
    if (!value) { say(t("请先输入 API Key。", "Enter an API key first.")); return false; }
    if (/\s/.test(value)) { say(t("API Key 不能含空格或换行。", "The API key cannot contain spaces or line breaks.")); return false; }
    sessionKey = value;
    updateKeys();
    return true;
  };
  const saveKey = () => {
    if (!accept()) return;
    try { localStorage.setItem(KEY_STORAGE, currentKey()); say(t("Key 已保存在当前浏览器，可随时清除。", "Key saved in this browser. You can clear it at any time.")); }
    catch { say(t("浏览器无法保存 Key，本次仍可使用，刷新后需要重填。", "This browser cannot save the key. It works for now, but you will need to enter it again after a reload.")); }
  };
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") { event.preventDefault(); saveKey(); }
  });
  const save = h("button", { type: "button", class: "btn btn-ghost", onclick: saveKey }, t("保存 Key 到此浏览器", "Save key in this browser"));
  const clear = h("button", { type: "button", class: "btn btn-ghost", onclick: () => {
    sessionKey = "";
    try { localStorage.removeItem(KEY_STORAGE); say(t("已清除当前浏览器保存的 Key。", "The key saved in this browser was cleared.")); }
    catch { say(t("无法清除本地存储，请在浏览器的网站设置中清除本站数据。", "Could not clear local storage. Clear this site's data in your browser settings.")); }
    updateKeys();
  } }, t("清除 Key", "Clear key"));
  const element = h("div", { class: "llm-key", "data-keysync": true }, editor,
    h("div", { class: "draw-actions" }, save, clear),
    h("p", { class: "v-caption" }, t("保存后，Key 留在此浏览器的 localStorage，未加密；请勿在共用设备保存。Key 只会直接发送给 DeepSeek，不经过本站服务器。", "A saved key stays in this browser's localStorage, unencrypted; do not save it on a shared device. The key goes only to DeepSeek, never through this site's servers.")),
  );
  element.addEventListener("keychange", sync);
  sync();
  return element;
}

/** The Profile API settings card. Profile shows it in the page; the AI panels show it in a dialog. */
export function apiSettings(): HTMLElement {
  const status = h("p", { class: "v-caption", role: "status", "aria-live": "polite" });
  return h("section", { class: "glass profile-card", id: "profile-api" }, h("h2", null, t("DeepSeek API 配置", "DeepSeek API settings")), h("p", { class: "v-caption" }, t("AI 问事和塔罗 AI 解读使用这里的 Key。", "AI questions and the AI tarot reading use this key.")), keyField((message) => { status.textContent = message; }), status);
}

/** Keep the question page mounted while the user changes Profile API settings. */
function openApiDialog() {
  const close = () => dialog.close();
  const dialog = h("dialog", { class: "profile-api-dialog", "aria-labelledby": "profile-api-title" },
    h("h1", { id: "profile-api-title" }, t("Profile · AI 配置", "Profile · AI settings")),
    apiSettings(),
    h("button", { type: "button", class: "btn btn-primary", onclick: close }, t("返回问事", "Back to Ask")),
  );
  dialog.addEventListener("close", () => {
    removeEventListener("hashchange", close);
    dialog.remove();
  });
  addEventListener("hashchange", close);
  document.body.append(dialog);
  dialog.showModal();
}
