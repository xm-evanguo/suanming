import { Solar } from "lunar-javascript";
import { type BirthInput, type Gender, inputDate, inputTime, pad } from "../core/chart";
import { CITIES, type City, cityName, cityRegion, citySearchText, TIMEZONES } from "../core/cities";
import { isEn, t } from "../i18n";
import { animalName, ganName, lunarDate, zhiName } from "../data/en/terms";
import { signName } from "../data/en/terms";
import { methodName } from "../methods";
import { cnNum, pressOnly } from "./components";
import { h, typewrite } from "./dom";
import { compute, getEnabledMethods, getState } from "./state";

const SHICHEN = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];

interface Draft {
  date: string;
  time: string;
  timeKnown: boolean;
  city: City;
  gender: Gender | "";
  trueSolar: boolean;
}

export function renderWizard(view: HTMLElement, saved?: BirthInput) {
  const methodLabels = getEnabledMethods().map(methodName);
  const draft: Draft = saved
    ? {
        date: inputDate(saved),
        time: inputTime(saved),
        timeKnown: saved.timeKnown,
        city: saved.city,
        gender: saved.gender,
        trueSolar: saved.trueSolar,
      }
    : { date: "", time: "", timeKnown: true, city: CITIES[0]!, gender: "", trueSolar: true };

  const hasResults = Boolean(getState().results);
  const guide = h("p", { class: "hero-guide" });
  const start = h("button", { class: "btn btn-primary btn-xl", onclick: () => openWizard() }, h("span", null, t("开启命盘", "Cast my chart")), h("i", null, "✦"));
  const hero = h(
    "section",
    { class: "hero" },
    h("div", { class: "orbit-deco", "aria-hidden": "true" }, h("i"), h("i"), h("i"), h("b")),
    h("p", { class: "eyebrow" }, t("ASTRA · FATUM · 天机", "ASTRA · FATUM · TIANJI")),
    h("h1", { class: `title-glow${isEn() ? " title-en" : ""}` }, ...(isEn() ? ["Tianji", " ", "Star", " ", "Map"] : [..."天机星图"]).map((c, i) => h("span", { style: { "--i": i } as never }, c))),
    h("p", { class: "hero-sub" }, t(`${cnNum(methodLabels.length)}种已启用体系 · 流年流月 · 关系合盘`, `${methodLabels.length} enabled ${methodLabels.length === 1 ? "system" : "systems"} · years and months · relationships`)),
    guide,
    h(
      "div",
      { class: "hero-actions" },
      start,
      hasResults && h("a", { class: "btn btn-ghost", href: "#/hub" }, t("继续查看上次的命盘 →", "Back to my last chart →")),
    ),
    h(
      "div",
      { class: "marquee", "aria-label": t("包含的体系", "Systems included") },
      h("div", { class: "marquee-track" }, ...[...methodLabels, ...methodLabels].map((m) => h("span", null, m, h("i", null, "✦")))),
    ),
  );
  view.append(hero);
  typewrite(guide, t("从你出生的那一刻开始，用你选中的体系汇集画像。你可以在 Profile 中随时修改出生信息和体系选择。", "Start from the moment you were born and build a portrait from the systems you choose. You can change your birth data and systems in Profile at any time."));

  const wizard = h("section", { class: "wizard", hidden: true });
  view.append(wizard);

  function openWizard() {
    hero.classList.add("hero-away");
    setTimeout(() => {
      hero.hidden = true;
      wizard.hidden = false;
      showStep(0);
    }, 550);
  }

  const STEPS = [
    { star: t("日", "D"), guide: t("第一颗星：你降临人间的日子。", "First star: the day you were born."), hint: t("公历（阳历）日期。若只知道农历生日，请先换算为公历。", "Use the Gregorian date. If you only know your lunar birthday, convert it first."), body: stepDate },
    { star: t("时", "T"), guide: t("第二颗星：那一刻的时辰。", "Second star: the time of that moment."), hint: t("时间越准确，命宫、上升星座与时柱越清晰。精确到分钟最佳。", "The more exact the time, the clearer your rising sign, life palace and hour pillar. To the minute is best."), body: stepTime },
    { star: t("地", "P"), guide: t("第三颗星：你出生的地方。", "Third star: where you were born."), hint: t("经度用来校正真太阳时，纬度决定上升星座与宫位。", "Longitude corrects for true solar time; latitude sets your rising sign and houses."), body: stepPlace },
    { star: t("人", "S"), guide: t("第四颗星：乾造，还是坤造？", "Fourth star: male or female chart?"), hint: t("部分传统体系的排盘与运程规则依此而定。", "Some traditional systems set up the chart and its periods by this."), body: stepGender },
    { star: "✦", guide: t("四颗星已经就位。", "All four stars are in place."), hint: t("确认无误后，星盘将开始转动。", "Check the details, then the chart starts to turn."), body: stepConfirm },
  ];

  function showStep(i: number) {
    const s = STEPS[i]!;
    const title = h("h2", { class: "step-title" });
    const err = h("p", { class: "step-error", role: "alert" });
    const content = s.body(err);
    const next = h(
      "button",
      {
        class: "btn btn-primary",
        onclick: () => {
          const msg = content.validate();
          if (msg) {
            err.textContent = msg;
            err.classList.remove("shake");
            void err.offsetWidth;
            err.classList.add("shake");
            return;
          }
          if (i < STEPS.length - 1) showStep(i + 1);
          else launch();
        },
      },
      i === STEPS.length - 1 ? t("启动推演 ✦", "Begin ✦") : t("下一颗星 →", "Next star →"),
    );
    const card = h(
      "div",
      { class: "wizard-card glass" },
      h(
        "ol",
        { class: "constellation", "aria-label": t("进度", "Progress") },
        ...STEPS.map((st, j) => h("li", { class: j < i ? "done" : j === i ? "now" : "" }, h("span", null, st.star))),
      ),
      title,
      h("p", { class: "step-hint" }, s.hint),
      content.el,
      err,
      h(
        "div",
        { class: "wizard-nav" },
        i > 0 ? h("button", { class: "btn btn-ghost", onclick: () => showStep(i - 1) }, t("← 上一步", "← Back")) : h("span"),
        next,
      ),
    );
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && (e.target as HTMLElement).tagName !== "BUTTON") next.click();
    });
    wizard.replaceChildren(card);
    typewrite(title, s.guide, 45);
    setTimeout(() => card.querySelector<HTMLElement>("input,button.choice")?.focus({ preventScroll: true }), 300);
  }

  type Step = { el: HTMLElement; validate: () => string | null };

  function stepDate(): Step {
    const input = h("input", { type: "date", class: "field big", min: "1901-01-01", max: new Date().toISOString().slice(0, 10), value: draft.date, "aria-label": t("出生日期", "Birth date") });
    const preview = h("p", { class: "preview" });
    const update = () => {
      draft.date = input.value;
      const [y, m, d] = input.value.split("-").map(Number);
      if (!y || !m || !d || y < 1901) return void (preview.textContent = "");
      const solar = Solar.fromYmd(y, m, d);
      const lunar = solar.getLunar();
      const gz: string = lunar.getYearInGanZhiByLiChun();
      preview.replaceChildren(
        h("span", null, isEn() ? signName(`${solar.getXingZuo()}座`) : `${solar.getXingZuo()}座`),
        h("span", null, isEn() ? `Lunar ${ganName(gz[0]!)}-${zhiName(gz[1]!)} year, ${lunarDate(lunar.getMonthInChinese(), lunar.getDayInChinese())}` : `农历${gz}年 ${lunar.getMonthInChinese()}月${lunar.getDayInChinese()}`),
        h("span", null, t(`属${lunar.getYearShengXiaoByLiChun()}（以立春为界）`, `Year of the ${animalName(lunar.getYearShengXiaoByLiChun())} (from Start of Spring)`)),
      );
      preview.classList.remove("pop");
      void preview.offsetWidth;
      preview.classList.add("pop");
    };
    input.addEventListener("input", update);
    update();
    return { el: h("div", { class: "step-body" }, input, preview), validate: () => (draft.date ? null : t("请选择出生日期。", "Choose your birth date.")) };
  }

  function stepTime(): Step {
    const input = h("input", { type: "time", class: "field big", value: draft.time, disabled: !draft.timeKnown, "aria-label": t("出生时间", "Birth time") });
    const preview = h("p", { class: "preview" });
    const unknown = h("input", { type: "checkbox", checked: !draft.timeKnown });
    const update = () => {
      draft.time = input.value;
      draft.timeKnown = !unknown.checked;
      input.disabled = unknown.checked;
      if (unknown.checked) {
        preview.textContent = t("将按正午 12:00 推算。时柱、命宫、上升星座等时辰相关结果仅供参考。", "Noon (12:00) will be used. Results that depend on the hour, such as the hour pillar, life palace and rising sign, are rough.");
        return;
      }
      const [hh, mm] = input.value.split(":").map(Number);
      if (hh === undefined || Number.isNaN(hh)) return void (preview.textContent = "");
      const zhi = SHICHEN[Math.floor(((hh + 1) % 24) / 2)]!;
      preview.replaceChildren(h("span", null, t(`${zhi}时`, `${zhiName(zhi)} hour`)), h("span", null, t(`钟表时间 ${pad(hh)}:${pad(mm ?? 0)}`, `Clock time ${pad(hh)}:${pad(mm ?? 0)}`)), h("span", null, t("下一步将按出生地校正为真太阳时", "Next, it is corrected to true solar time for your birthplace")));
    };
    input.addEventListener("input", update);
    unknown.addEventListener("change", update);
    update();
    return {
      el: h("div", { class: "step-body" }, input, h("label", { class: "check" }, unknown, h("span", null, t("我不知道准确的出生时间", "I don't know my exact birth time"))), preview),
      validate: () => (draft.timeKnown && !draft.time ? t("请填写出生时间，或勾选“不知道”。", "Enter your birth time, or tick \"I don't know\".") : null),
    };
  }

  function stepPlace(err: HTMLElement): Step {
    const search = h("input", { type: "search", class: "field", placeholder: t("搜索城市：北京、上海、香港、东京、London…", "Search cities: London, New York, Tokyo, 北京…"), "aria-label": t("搜索出生城市", "Search birth city") });
    const list = h("ul", { class: "city-list", role: "listbox" });
    const chosen = h("p", { class: "preview" });
    const showChosen = () => {
      const c = draft.city;
      chosen.replaceChildren(
        h("span", null, `📍 ${cityName(c)}`),
        h("span", null, `${Math.abs(c.lat).toFixed(2)}°${c.lat >= 0 ? "N" : "S"} ${Math.abs(c.lon).toFixed(2)}°${c.lon >= 0 ? "E" : "W"}`),
        h("span", null, c.tz),
      );
    };
    const fill = () => {
      const q = search.value.trim().toLowerCase();
      const hits = CITIES.filter((c) => !q || citySearchText(c).includes(q)).slice(0, q ? 40 : 18);
      list.replaceChildren(
        ...hits.map((c) =>
          h(
            "li",
            {
              role: "option",
              class: c.name === draft.city.name && c.lat === draft.city.lat ? "on" : "",
              tabindex: 0,
              onclick: () => {
                draft.city = c;
                showChosen();
                fill();
              },
              onkeydown: (e: KeyboardEvent) => e.key === "Enter" && (e.currentTarget as HTMLElement).click(),
            },
            h("b", null, cityName(c)),
            h("small", null, cityRegion(c)),
          ),
        ),
        ...(hits.length ? [] : [h("li", { class: "empty" }, t("没有找到。可以展开下方“自定义坐标”。", "Not found. Open \"Custom coordinates\" below."))]),
      );
    };
    search.addEventListener("input", fill);

    const name = h("input", { class: "field", placeholder: t("地名（可选）", "Place name (optional)") });
    const lat = h("input", { class: "field", type: "number", step: "0.01", min: "-90", max: "90", placeholder: t("纬度，北纬为正", "Latitude, north positive") });
    const lon = h("input", { class: "field", type: "number", step: "0.01", min: "-180", max: "180", placeholder: t("经度，东经为正", "Longitude, east positive") });
    const tz = h("select", { class: "field" }, ...TIMEZONES.map((z) => h("option", { value: z }, z)));
    const apply = h(
      "button",
      {
        class: "btn btn-ghost",
        onclick: () => {
          const la = Number(lat.value);
          const lo = Number(lon.value);
          if (!lat.value || !lon.value || Math.abs(la) > 90 || Math.abs(lo) > 180) {
            err.textContent = t("请输入有效的经纬度（纬度 −90~90，经度 −180~180）。", "Enter a valid latitude (−90 to 90) and longitude (−180 to 180).");
            return;
          }
          err.textContent = "";
          draft.city = { name: name.value.trim() || `${la.toFixed(2)}, ${lo.toFixed(2)}`, region: "自定义", lat: la, lon: lo, tz: tz.value };
          showChosen();
          fill();
        },
      },
      t("使用此坐标", "Use these coordinates"),
    );
    const custom = h(
      "details",
      { class: "custom-loc" },
      h("summary", null, t("自定义坐标（列表中没有我的出生地）", "Custom coordinates (my birthplace is not listed)")),
      h("div", { class: "custom-grid" }, name, lat, lon, tz, apply),
      h("p", { class: "step-hint" }, t("提示：可在地图应用中长按出生地获取经纬度。时区请选与出生地相同规则的城市。", "Tip: long-press your birthplace in a map app to get its coordinates. Pick a time zone that follows the same rules as your birthplace.")),
    );
    fill();
    showChosen();
    return { el: h("div", { class: "step-body" }, search, list, chosen, custom), validate: () => null };
  }

  function stepGender(): Step {
    const mk = (g: Gender, label: string, sub: string, glyph: string) =>
      h(
        "button",
        {
          class: `choice${draft.gender === g ? " on" : ""}`,
          "aria-pressed": String(draft.gender === g),
          onclick: (e: Event) => {
            draft.gender = g;
            pressOnly(e.currentTarget as Element);
          },
        },
        h("i", { "aria-hidden": "true" }, glyph),
        h("b", null, label),
        h("small", null, sub),
      );
    const solar = h("input", { type: "checkbox", checked: draft.trueSolar });
    solar.addEventListener("change", () => (draft.trueSolar = solar.checked));
    return {
      el: h(
        "div",
        { class: "step-body" },
        h("div", { class: "choices" }, mk("male", t("乾造", "Male"), t("男命 · 阳", "Qian chart · yang"), "☰"), mk("female", t("坤造", "Female"), t("女命 · 阴", "Kun chart · yin"), "☷")),
        h(
          "label",
          { class: "check" },
          solar,
          h("span", null, t("中式命理使用真太阳时（推荐）", "Use true solar time for the Chinese systems (recommended)"), h("small", null, t("按出生地经度与均时差校正钟表时间。传统排盘以太阳实际位置定时辰。", "Corrects clock time by your birthplace's longitude and the equation of time. Traditional charts set the hour by where the Sun really is."))),
        ),
      ),
      validate: () => (draft.gender ? null : t("请选择乾造或坤造。", "Choose male or female.")),
    };
  }

  function stepConfirm(): Step {
    const row = (k: string, v: string, go: number) =>
      h("li", null, h("span", null, k), h("b", null, v), h("button", { class: "link", onclick: () => showStep(go) }, t("修改", "Edit")));
    return {
      el: h(
        "div",
        { class: "step-body" },
        h(
          "ul",
          { class: "confirm" },
          row(t("出生日期", "Date"), draft.date, 0),
          row(t("出生时间", "Time"), draft.timeKnown ? draft.time : t("不详（按 12:00）", "Unknown (12:00 used)"), 1),
          row(t("出生地点", "Place"), `${cityName(draft.city)} · ${draft.city.tz}`, 2),
          row(t("命造", "Chart"), draft.gender === "male" ? t("乾造（男）", "Male") : t("坤造（女）", "Female"), 3),
          row(t("时间校正", "Time basis"), draft.trueSolar ? t("真太阳时", "True solar time") : t("钟表时间", "Clock time"), 3),
        ),
      ),
      validate: () => null,
    };
  }

  function launch() {
    const [year, month, day] = draft.date.split("-").map(Number) as [number, number, number];
    const [hour, minute] = draft.timeKnown ? (draft.time.split(":").map(Number) as [number, number]) : [12, 0];
    compute({ year, month, day, hour, minute, timeKnown: draft.timeKnown, city: draft.city, gender: draft.gender as Gender, trueSolar: draft.trueSolar });
    location.hash = "#/ritual";
  }

}
