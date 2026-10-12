import { topbar } from "./components";
import { type BirthInput, type Gender, inputDate, inputTime } from "../core/chart";
import { CITIES, type City, TIMEZONES } from "../core/cities";
import { METHOD_NAMES, METHOD_ORDER } from "../methods";
import { h } from "./dom";
import { apiSettings, currentKey } from "./llm-key";
import { compute, getEnabledMethods, getState, setEnabledMethods } from "./state";

/** Validate profile edits before replacing the saved chart. */
export function profileBirthInput(date: string, time: string, timeKnown: boolean, city: City, gender: Gender, trueSolar: boolean, today = new Date()): BirthInput {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error("请选择有效的出生日期。");
  const [year, month, day] = date.split("-").map(Number) as [number, number, number];
  const check = new Date(Date.UTC(year, month - 1, day));
  if (year < 1901 || check.getUTCFullYear() !== year || check.getUTCMonth() + 1 !== month || check.getUTCDate() !== day || date > today.toISOString().slice(0, 10)) throw new Error("出生日期须在 1901 年至今天之间，且须为有效日期。");
  if (timeKnown && !/^\d{2}:\d{2}$/.test(time)) throw new Error("请填写出生时间，或勾选“不知道”。");
  const [hour, minute] = timeKnown ? time.split(":").map(Number) as [number, number] : [12, 0];
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) throw new Error("请选择有效的出生时间。");
  if (!Number.isFinite(city.lat) || !Number.isFinite(city.lon) || Math.abs(city.lat) > 90 || Math.abs(city.lon) > 180) throw new Error("请输入有效的经纬度。");
  try { new Intl.DateTimeFormat("zh-CN", { timeZone: city.tz }); }
  catch { throw new Error("请选择有效的出生地时区。"); }
  if (gender !== "male" && gender !== "female") throw new Error("请选择命造。");
  return { year, month, day, hour, minute, timeKnown, city, gender, trueSolar };
}

export function renderProfile(view: HTMLElement, section?: string) {
  const saved = getState().input;
  const date = h("input", { type: "date", class: "field", required: true, min: "1901-01-01", max: new Date().toISOString().slice(0, 10), "aria-label": "出生日期", value: saved ? inputDate(saved) : "" });
  const time = h("input", { type: "time", class: "field", "aria-label": "出生时间", value: saved ? inputTime(saved) : "" });
  const unknown = h("input", { type: "checkbox", checked: saved ? !saved.timeKnown : false });
  const syncTime = () => { time.disabled = unknown.checked; time.required = !unknown.checked; };
  unknown.addEventListener("change", syncTime);
  syncTime();
  const gender = h("select", { class: "field", "aria-label": "命造" }, h("option", { value: "male" }, "乾造（男）"), h("option", { value: "female" }, "坤造（女）"));
  gender.value = saved?.gender ?? "male";
  const trueSolar = h("input", { type: "checkbox", checked: saved?.trueSolar ?? true });
  const savedCity = saved?.city ?? CITIES[0]!;
  const cityIndex = CITIES.findIndex((c) => c.name === savedCity.name && c.lat === savedCity.lat && c.lon === savedCity.lon && c.tz === savedCity.tz);
  const city = h("select", { class: "field", "aria-label": "出生城市" }, ...CITIES.map((c, i) => h("option", { value: String(i) }, `${c.name} · ${c.region}`)), h("option", { value: "custom" }, "自定义出生地"));
  city.value = cityIndex < 0 ? "custom" : String(cityIndex);
  const name = h("input", { class: "field", value: savedCity.name, "aria-label": "自定义地名" });
  const lat = h("input", { type: "number", class: "field", min: "-90", max: "90", step: "any", value: savedCity.lat, "aria-label": "出生地纬度" });
  const lon = h("input", { type: "number", class: "field", min: "-180", max: "180", step: "any", value: savedCity.lon, "aria-label": "出生地经度" });
  const tz = h("select", { class: "field", "aria-label": "出生地时区" }, ...[...new Set([...TIMEZONES, savedCity.tz])].map((z) => h("option", { value: z }, z)));
  tz.value = savedCity.tz;
  const custom = h("div", { class: "profile-fields" }, h("label", null, "地名", name), h("label", null, "纬度（北纬为正）", lat), h("label", null, "经度（东经为正）", lon), h("label", null, "时区", tz));
  const syncCity = () => {
    custom.hidden = city.value !== "custom";
    lat.required = lon.required = !custom.hidden;
    for (const input of [name, lat, lon, tz]) input.disabled = custom.hidden;
  };
  city.addEventListener("change", syncCity);
  syncCity();
  const birthStatus = h("p", { role: "status", "aria-live": "polite", class: "v-caption" });
  const form = h("form", { class: "llm-form", onsubmit: (event: Event) => {
    event.preventDefault();
    try {
      const place: City = city.value === "custom" ? { name: name.value.trim() || "自定义出生地", region: "自定义", lat: lat.value ? Number(lat.value) : NaN, lon: lon.value ? Number(lon.value) : NaN, tz: tz.value } : CITIES[Number(city.value)]!;
      compute(profileBirthInput(date.value, time.value, !unknown.checked, place, gender.value as Gender, trueSolar.checked));
      birthStatus.textContent = "出生信息已保存，命盘、运程和关系合盘已按新资料更新。";
    } catch (error) { birthStatus.textContent = error instanceof Error ? error.message : "保存失败，请检查资料。"; }
  } },
    h("div", { class: "profile-fields" }, h("label", null, "出生日期（公历）", date), h("label", null, "出生时间", time), h("label", null, "出生城市", city), h("label", null, "命造", gender)),
    h("label", { class: "check" }, unknown, "我不知道准确的出生时间（按 12:00 推算）"),
    custom,
    h("label", { class: "check" }, trueSolar, "使用真太阳时校正"),
    h("div", { class: "draw-actions" }, h("button", { type: "submit", class: "btn btn-primary" }, "保存出生信息"), h("a", { href: "#/hub", class: "btn btn-ghost" }, "查看命盘")), birthStatus,
  );

  const api = apiSettings();
  api.append(h("a", { href: "#/ask", class: "btn btn-ghost" }, "前往问事 →"));

  const selected = new Set(getEnabledMethods());
  const filterStatus = h("p", { class: "v-caption", role: "status", "aria-live": "polite" });
  const enabledCount = () => `已启用 ${selected.size} / ${METHOD_ORDER.length} 个体系。`;
  const boxes = METHOD_ORDER.map((id) => {
    const box = h("input", { type: "checkbox", checked: selected.has(id), "data-method": id });
    box.addEventListener("change", () => { if (box.checked) selected.add(id); else selected.delete(id); saveSelection(); });
    return h("label", { class: "check profile-method" }, box, METHOD_NAMES[id]);
  });
  function saveSelection() {
    setEnabledMethods([...selected]);
    filterStatus.textContent = selected.size ? `${enabledCount()}页面和 AI 问事只使用这些体系。` : "已取消全部体系。出生画像和运程暂无结果；奇门、抽塔罗和掷圣杯仍可使用。";
  }
  const selectAll = (on: boolean) => {
    selected.clear();
    if (on) METHOD_ORDER.forEach((id) => selected.add(id));
    boxes.forEach((label) => { label.querySelector("input")!.checked = on; });
    saveSelection();
  };
  view.append(
    topbar([getState().results ? "#/hub" : "#/", "← 返回"], "PROFILE"),
    h("header", { class: "page-head" }, h("h1", { class: "title-glow small" }, "个人资料与设置"), h("p", { class: "hub-guide" }, "管理出生信息、AI 配置和你想使用的体系。设置保存在当前浏览器。")),
    h("section", { class: "glass profile-card" }, h("h2", null, "出生信息"), form), api,
    h("section", { class: "glass profile-card" }, h("h2", null, "体系过滤"), h("p", { class: "v-caption" }, "默认全部启用。取消勾选后，该体系不再参与页面展示、综合评价、运程、关系合盘或发送给 DeepSeek 的问事资料。"),
      h("div", { class: "draw-actions" }, h("button", { type: "button", class: "btn btn-ghost", onclick: () => selectAll(true) }, "全部勾选"), h("button", { type: "button", class: "btn btn-ghost", onclick: () => selectAll(false) }, "全部取消")),
      h("div", { class: "profile-methods" }, ...boxes), filterStatus),
  );
  filterStatus.textContent = `${enabledCount()}修改立即生效。`;
  if (section === "api") requestAnimationFrame(() => { api.scrollIntoView({ block: "start" }); if (!currentKey()) api.querySelector<HTMLInputElement>("input")?.focus({ preventScroll: true }); });
}
