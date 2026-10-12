import { Solar } from "lunar-javascript";
import type { BirthInput, Gender } from "../core/chart";
import { CITIES, type City, TIMEZONES } from "../core/cities";
import { cnNum } from "./components";
import { h, typewrite } from "./dom";
import { compute, getState } from "./state";

const METHOD_LABELS = ["生辰八字", "紫微斗数", "袁天罡称骨", "梅花易数", "九星気学", "宿曜占星", "西洋占星", "希腊化占星", "迦勒底七曜", "波斯法达", "塔罗牌", "生命灵数", "吠陀占星", "玛雅历"];
const SHICHEN = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];
const pad = (n: number) => String(n).padStart(2, "0");

interface Draft {
  date: string;
  time: string;
  timeKnown: boolean;
  city: City;
  gender: Gender | "";
  trueSolar: boolean;
}

export function renderWizard(view: HTMLElement, saved?: BirthInput) {
  const draft: Draft = saved
    ? {
        date: `${saved.year}-${pad(saved.month)}-${pad(saved.day)}`,
        time: `${pad(saved.hour)}:${pad(saved.minute)}`,
        timeKnown: saved.timeKnown,
        city: saved.city,
        gender: saved.gender,
        trueSolar: saved.trueSolar,
      }
    : { date: "", time: "", timeKnown: true, city: CITIES[0]!, gender: "", trueSolar: true };

  const hasResults = Boolean(getState().results);
  const guide = h("p", { class: "hero-guide" });
  const start = h("button", { class: "btn btn-primary btn-xl", onclick: () => openWizard() }, h("span", null, "开启命盘"), h("i", null, "✦"));
  const hero = h(
    "section",
    { class: "hero" },
    h("div", { class: "orbit-deco", "aria-hidden": "true" }, h("i"), h("i"), h("i"), h("b")),
    h("p", { class: "eyebrow" }, "ASTRA · FATUM · 天机"),
    h("h1", { class: "title-glow" }, ...[..."天机星图"].map((c, i) => h("span", { style: { "--i": i } as never }, c))),
    h("p", { class: "hero-sub" }, `${cnNum(METHOD_LABELS.length)}种古老体系 · 流年流月 · 关系合盘`),
    guide,
    h(
      "div",
      { class: "hero-actions" },
      start,
      hasResults && h("a", { class: "btn btn-ghost", href: "#/hub" }, "继续查看上次的命盘 →"),
    ),
    h(
      "div",
      { class: "marquee", "aria-label": "包含的体系" },
      h("div", { class: "marquee-track" }, ...[...METHOD_LABELS, ...METHOD_LABELS].map((m) => h("span", null, m, h("i", null, "✦")))),
    ),
    h("p", { class: "privacy" }, "🔒 所有推演都在你的浏览器内完成。只有你点击 AI 解读（塔罗解读、问事）时，相关内容才会直接发送给 DeepSeek。"),
  );
  view.append(hero);
  typewrite(guide, "在你出生的那一刻，日月五星排成了只属于你的图案。东方的干支、西方的星座、东瀛的宿曜、玛雅的神圣历——今夜，它们将同时为你一人而转动。");

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
    { star: "日", guide: "第一颗星：你降临人间的日子。", hint: "公历（阳历）日期。若只知道农历生日，请先换算为公历。", body: stepDate },
    { star: "时", guide: "第二颗星：那一刻的时辰。", hint: "时间越准确，命宫、上升星座与时柱越清晰。精确到分钟最佳。", body: stepTime },
    { star: "地", guide: "第三颗星：你出生的地方。", hint: "经度用来校正真太阳时，纬度决定上升星座与宫位。", body: stepPlace },
    { star: "人", guide: "第四颗星：乾造，还是坤造？", hint: "传统八字大运的顺逆与紫微斗数的排盘依此而定。", body: stepGender },
    { star: "✦", guide: "四颗星已经就位。", hint: "确认无误后，星盘将开始转动。", body: stepConfirm },
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
      i === STEPS.length - 1 ? "启动推演 ✦" : "下一颗星 →",
    );
    const card = h(
      "div",
      { class: "wizard-card glass" },
      h(
        "ol",
        { class: "constellation", "aria-label": "进度" },
        ...STEPS.map((st, j) => h("li", { class: j < i ? "done" : j === i ? "now" : "" }, h("span", null, st.star))),
      ),
      title,
      h("p", { class: "step-hint" }, s.hint),
      content.el,
      err,
      h(
        "div",
        { class: "wizard-nav" },
        i > 0 ? h("button", { class: "btn btn-ghost", onclick: () => showStep(i - 1) }, "← 上一步") : h("span"),
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
    const input = h("input", { type: "date", class: "field big", min: "1901-01-01", max: new Date().toISOString().slice(0, 10), value: draft.date, "aria-label": "出生日期" });
    const preview = h("p", { class: "preview" });
    const update = () => {
      draft.date = input.value;
      const [y, m, d] = input.value.split("-").map(Number);
      if (!y || !m || !d || y < 1901) return void (preview.textContent = "");
      const solar = Solar.fromYmd(y, m, d);
      const lunar = solar.getLunar();
      preview.replaceChildren(
        h("span", null, `${solar.getXingZuo()}座`),
        h("span", null, `农历${lunar.getYearInGanZhiByLiChun()}年 ${lunar.getMonthInChinese()}月${lunar.getDayInChinese()}`),
        h("span", null, `属${lunar.getYearShengXiaoByLiChun()}（以立春为界）`),
      );
      preview.classList.remove("pop");
      void preview.offsetWidth;
      preview.classList.add("pop");
    };
    input.addEventListener("input", update);
    update();
    return { el: h("div", { class: "step-body" }, input, preview), validate: () => (draft.date ? null : "请选择出生日期。") };
  }

  function stepTime(): Step {
    const input = h("input", { type: "time", class: "field big", value: draft.time, disabled: !draft.timeKnown, "aria-label": "出生时间" });
    const preview = h("p", { class: "preview" });
    const unknown = h("input", { type: "checkbox", checked: !draft.timeKnown });
    const update = () => {
      draft.time = input.value;
      draft.timeKnown = !unknown.checked;
      input.disabled = unknown.checked;
      if (unknown.checked) {
        preview.textContent = "将按正午 12:00 推算。时柱、命宫、上升星座等时辰相关结果仅供参考。";
        return;
      }
      const [hh, mm] = input.value.split(":").map(Number);
      if (hh === undefined || Number.isNaN(hh)) return void (preview.textContent = "");
      const zhi = SHICHEN[Math.floor(((hh + 1) % 24) / 2)]!;
      preview.replaceChildren(h("span", null, `${zhi}时`), h("span", null, `钟表时间 ${pad(hh)}:${pad(mm ?? 0)}`), h("span", null, "下一步将按出生地校正为真太阳时"));
    };
    input.addEventListener("input", update);
    unknown.addEventListener("change", update);
    update();
    return {
      el: h("div", { class: "step-body" }, input, h("label", { class: "check" }, unknown, h("span", null, "我不知道准确的出生时间")), preview),
      validate: () => (draft.timeKnown && !draft.time ? "请填写出生时间，或勾选“不知道”。" : null),
    };
  }

  function stepPlace(err: HTMLElement): Step {
    const search = h("input", { type: "search", class: "field", placeholder: "搜索城市：北京、上海、香港、东京、London…", "aria-label": "搜索出生城市" });
    const list = h("ul", { class: "city-list", role: "listbox" });
    const chosen = h("p", { class: "preview" });
    const showChosen = () => {
      const c = draft.city;
      chosen.replaceChildren(
        h("span", null, `📍 ${c.name}`),
        h("span", null, `${Math.abs(c.lat).toFixed(2)}°${c.lat >= 0 ? "N" : "S"} ${Math.abs(c.lon).toFixed(2)}°${c.lon >= 0 ? "E" : "W"}`),
        h("span", null, c.tz),
      );
    };
    const fill = () => {
      const q = search.value.trim().toLowerCase();
      const hits = CITIES.filter((c) => !q || `${c.name}${c.region}${c.tz}`.toLowerCase().includes(q)).slice(0, q ? 40 : 18);
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
            h("b", null, c.name),
            h("small", null, c.region),
          ),
        ),
        ...(hits.length ? [] : [h("li", { class: "empty" }, "没有找到。可以展开下方“自定义坐标”。")]),
      );
    };
    search.addEventListener("input", fill);

    const name = h("input", { class: "field", placeholder: "地名（可选）" });
    const lat = h("input", { class: "field", type: "number", step: "0.01", min: "-90", max: "90", placeholder: "纬度，北纬为正" });
    const lon = h("input", { class: "field", type: "number", step: "0.01", min: "-180", max: "180", placeholder: "经度，东经为正" });
    const tz = h("select", { class: "field" }, ...TIMEZONES.map((z) => h("option", { value: z }, z)));
    const apply = h(
      "button",
      {
        class: "btn btn-ghost",
        onclick: () => {
          const la = Number(lat.value);
          const lo = Number(lon.value);
          if (!lat.value || !lon.value || Math.abs(la) > 90 || Math.abs(lo) > 180) {
            err.textContent = "请输入有效的经纬度（纬度 −90~90，经度 −180~180）。";
            return;
          }
          err.textContent = "";
          draft.city = { name: name.value.trim() || `${la.toFixed(2)}, ${lo.toFixed(2)}`, region: "自定义", lat: la, lon: lo, tz: tz.value };
          showChosen();
          fill();
        },
      },
      "使用此坐标",
    );
    const custom = h(
      "details",
      { class: "custom-loc" },
      h("summary", null, "自定义坐标（列表中没有我的出生地）"),
      h("div", { class: "custom-grid" }, name, lat, lon, tz, apply),
      h("p", { class: "step-hint" }, "提示：可在地图应用中长按出生地获取经纬度。时区请选与出生地相同规则的城市。"),
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
            for (const b of (e.currentTarget as HTMLElement).parentElement!.children) {
              b.classList.toggle("on", b === e.currentTarget);
              b.setAttribute("aria-pressed", String(b === e.currentTarget));
            }
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
        h("div", { class: "choices" }, mk("male", "乾造", "男命 · 阳", "☰"), mk("female", "坤造", "女命 · 阴", "☷")),
        h(
          "label",
          { class: "check" },
          solar,
          h("span", null, "中式命理使用真太阳时（推荐）", h("small", null, "按出生地经度与均时差校正钟表时间。传统排盘以太阳实际位置定时辰。")),
        ),
      ),
      validate: () => (draft.gender ? null : "请选择乾造或坤造。"),
    };
  }

  function stepConfirm(): Step {
    const row = (k: string, v: string, go: number) =>
      h("li", null, h("span", null, k), h("b", null, v), h("button", { class: "link", onclick: () => showStep(go) }, "修改"));
    return {
      el: h(
        "div",
        { class: "step-body" },
        h(
          "ul",
          { class: "confirm" },
          row("出生日期", draft.date, 0),
          row("出生时间", draft.timeKnown ? draft.time : "不详（按 12:00）", 1),
          row("出生地点", `${draft.city.name} · ${draft.city.tz}`, 2),
          row("命造", draft.gender === "male" ? "乾造（男）" : "坤造（女）", 3),
          row("时间校正", draft.trueSolar ? "真太阳时" : "钟表时间", 3),
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
