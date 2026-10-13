import { topbar } from "./components";
import { type BirthInput, type Gender, inputDate, inputTime } from "../core/chart";
import { CITIES, type City, cityName, cityRegion, TIMEZONES } from "../core/cities";
import { methodName, METHOD_ORDER } from "../methods";
import { h } from "./dom";
import { apiSettings, currentKey } from "./llm-key";
import { compute, getEnabledMethods, getState, setEnabledMethods } from "./state";
import { t } from "../i18n";

/** Validate profile edits before replacing the saved chart. */
export function profileBirthInput(date: string, time: string, timeKnown: boolean, city: City, gender: Gender, trueSolar: boolean, today = new Date()): BirthInput {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error(t("请选择有效的出生日期。", "Choose a valid birth date."));
  const [year, month, day] = date.split("-").map(Number) as [number, number, number];
  const check = new Date(Date.UTC(year, month - 1, day));
  if (year < 1901 || check.getUTCFullYear() !== year || check.getUTCMonth() + 1 !== month || check.getUTCDate() !== day || date > today.toISOString().slice(0, 10)) throw new Error(t("出生日期须在 1901 年至今天之间，且须为有效日期。", "The birth date must be a real date between 1901 and today."));
  if (timeKnown && !/^\d{2}:\d{2}$/.test(time)) throw new Error(t("请填写出生时间，或勾选“不知道”。", "Enter your birth time, or tick \"I don't know\"."));
  const [hour, minute] = timeKnown ? time.split(":").map(Number) as [number, number] : [12, 0];
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) throw new Error(t("请选择有效的出生时间。", "Choose a valid birth time."));
  if (!Number.isFinite(city.lat) || !Number.isFinite(city.lon) || Math.abs(city.lat) > 90 || Math.abs(city.lon) > 180) throw new Error(t("请输入有效的经纬度。", "Enter a valid latitude and longitude."));
  try { new Intl.DateTimeFormat("zh-CN", { timeZone: city.tz }); }
  catch { throw new Error(t("请选择有效的出生地时区。", "Choose a valid time zone for your birthplace.")); }
  if (gender !== "male" && gender !== "female") throw new Error(t("请选择命造。", "Choose male or female."));
  return { year, month, day, hour, minute, timeKnown, city, gender, trueSolar };
}

export function renderProfile(view: HTMLElement, section?: string) {
  const saved = getState().input;
  const date = h("input", { type: "date", class: "field", required: true, min: "1901-01-01", max: new Date().toISOString().slice(0, 10), "aria-label": t("出生日期", "Birth date"), value: saved ? inputDate(saved) : "" });
  const time = h("input", { type: "time", class: "field", "aria-label": t("出生时间", "Birth time"), value: saved ? inputTime(saved) : "" });
  const unknown = h("input", { type: "checkbox", checked: saved ? !saved.timeKnown : false });
  const syncTime = () => { time.disabled = unknown.checked; time.required = !unknown.checked; };
  unknown.addEventListener("change", syncTime);
  syncTime();
  const gender = h("select", { class: "field", "aria-label": t("命造", "Chart") }, h("option", { value: "male" }, t("乾造（男）", "Male")), h("option", { value: "female" }, t("坤造（女）", "Female")));
  gender.value = saved?.gender ?? "male";
  const trueSolar = h("input", { type: "checkbox", checked: saved?.trueSolar ?? true });
  const savedCity = saved?.city ?? CITIES[0]!;
  const cityIndex = CITIES.findIndex((c) => c.name === savedCity.name && c.lat === savedCity.lat && c.lon === savedCity.lon && c.tz === savedCity.tz);
  const city = h("select", { class: "field", "aria-label": t("出生城市", "Birth city") }, ...CITIES.map((c, i) => h("option", { value: String(i) }, `${cityName(c)} · ${cityRegion(c)}`)), h("option", { value: "custom" }, t("自定义出生地", "Custom birthplace")));
  city.value = cityIndex < 0 ? "custom" : String(cityIndex);
  const name = h("input", { class: "field", value: savedCity.name, "aria-label": t("自定义地名", "Custom place name") });
  const lat = h("input", { type: "number", class: "field", min: "-90", max: "90", step: "any", value: savedCity.lat, "aria-label": t("出生地纬度", "Birthplace latitude") });
  const lon = h("input", { type: "number", class: "field", min: "-180", max: "180", step: "any", value: savedCity.lon, "aria-label": t("出生地经度", "Birthplace longitude") });
  const tz = h("select", { class: "field", "aria-label": t("出生地时区", "Birthplace time zone") }, ...[...new Set([...TIMEZONES, savedCity.tz])].map((z) => h("option", { value: z }, z)));
  tz.value = savedCity.tz;
  const custom = h("div", { class: "profile-fields" }, h("label", null, t("地名", "Place name"), name), h("label", null, t("纬度（北纬为正）", "Latitude (north positive)"), lat), h("label", null, t("经度（东经为正）", "Longitude (east positive)"), lon), h("label", null, t("时区", "Time zone"), tz));
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
      const place: City = city.value === "custom" ? { name: name.value.trim() || t("自定义出生地", "Custom birthplace"), region: "自定义", lat: lat.value ? Number(lat.value) : NaN, lon: lon.value ? Number(lon.value) : NaN, tz: tz.value } : CITIES[Number(city.value)]!;
      compute(profileBirthInput(date.value, time.value, !unknown.checked, place, gender.value as Gender, trueSolar.checked));
      birthStatus.textContent = t("出生信息已保存，命盘、运程和关系合盘已按新资料更新。", "Birth data saved. Your chart, outlook and relationship readings now use it.");
    } catch (error) { birthStatus.textContent = error instanceof Error ? error.message : t("保存失败，请检查资料。", "Could not save. Check your details."); }
  } },
    h("div", { class: "profile-fields" }, h("label", null, t("出生日期（公历）", "Birth date (Gregorian)"), date), h("label", null, t("出生时间", "Birth time"), time), h("label", null, t("出生城市", "Birth city"), city), h("label", null, t("命造", "Chart"), gender)),
    h("label", { class: "check" }, unknown, t("我不知道准确的出生时间（按 12:00 推算）", "I don't know my exact birth time (12:00 is used)")),
    custom,
    h("label", { class: "check" }, trueSolar, t("使用真太阳时校正", "Correct to true solar time")),
    h("div", { class: "draw-actions" }, h("button", { type: "submit", class: "btn btn-primary" }, t("保存出生信息", "Save birth data")), h("a", { href: "#/hub", class: "btn btn-ghost" }, t("查看命盘", "View my chart"))), birthStatus,
  );

  const api = apiSettings();
  api.append(h("a", { href: "#/ask", class: "btn btn-ghost" }, t("前往问事 →", "Go to Ask →")));

  const selected = new Set(getEnabledMethods());
  const filterStatus = h("p", { class: "v-caption", role: "status", "aria-live": "polite" });
  const enabledCount = () => t(`已启用 ${selected.size} / ${METHOD_ORDER.length} 个体系。`, `${selected.size} of ${METHOD_ORDER.length} systems on. `);
  const boxes = METHOD_ORDER.map((id) => {
    const box = h("input", { type: "checkbox", checked: selected.has(id), "data-method": id });
    box.addEventListener("change", () => { if (box.checked) selected.add(id); else selected.delete(id); saveSelection(); });
    return h("label", { class: "check profile-method" }, box, methodName(id));
  });
  function saveSelection() {
    setEnabledMethods([...selected]);
    filterStatus.textContent = selected.size ? `${enabledCount()}${t("页面和 AI 问事只使用这些体系。", "Pages and AI questions use only these systems.")}` : t("已取消全部体系。出生画像和运程暂无结果；奇门、抽塔罗和掷圣杯仍可使用。", "All systems are off. The birth profile and outlook have no results; Qimen, the tarot draw and the moon blocks still work.");
  }
  const selectAll = (on: boolean) => {
    selected.clear();
    if (on) METHOD_ORDER.forEach((id) => selected.add(id));
    boxes.forEach((label) => { label.querySelector("input")!.checked = on; });
    saveSelection();
  };
  view.append(
    topbar([getState().results ? "#/hub" : "#/", t("← 返回", "← Back")], "PROFILE"),
    h("header", { class: "page-head" }, h("h1", { class: "title-glow small" }, t("个人资料与设置", "Profile and settings")), h("p", { class: "hub-guide" }, t("管理出生信息、AI 配置和你想使用的体系。设置保存在当前浏览器。", "Manage your birth data, AI settings and the systems you want to use. Settings are saved in this browser."))),
    h("section", { class: "glass profile-card" }, h("h2", null, t("出生信息", "Birth data")), form), api,
    h("section", { class: "glass profile-card" }, h("h2", null, t("体系过滤", "Systems")), h("p", { class: "v-caption" }, t("默认全部启用。取消勾选后，该体系不再参与页面展示、综合评价、运程、关系合盘或发送给 DeepSeek 的问事资料。", "All are on by default. An unticked system is left out of the pages, the summary, the outlook, relationships and the data sent to DeepSeek for AI questions.")),
      h("div", { class: "draw-actions" }, h("button", { type: "button", class: "btn btn-ghost", onclick: () => selectAll(true) }, t("全部勾选", "Select all")), h("button", { type: "button", class: "btn btn-ghost", onclick: () => selectAll(false) }, t("全部取消", "Clear all"))),
      h("div", { class: "profile-methods" }, ...boxes), filterStatus),
  );
  filterStatus.textContent = `${enabledCount()}${t("修改立即生效。", "Changes apply at once.")}`;
  if (section === "api") requestAnimationFrame(() => { api.scrollIntoView({ block: "start" }); if (!currentKey()) api.querySelector<HTMLInputElement>("input")?.focus({ preventScroll: true }); });
}
