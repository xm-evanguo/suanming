import { type Gender, inputDate, inputTime } from "../core/chart";
import { CITIES, type City } from "../core/cities";
import { type Compat, type CompatItem, type CompatTag, type Person, RELATION_NAMES, type RelationKind } from "../compat/types";
import { groupOf } from "../data/compat-util";
import { onlyPro, pressOnly, sectionTitle, statement, topbar } from "./components";
import { countUp, h, reveal, typewrite } from "./dom";
import { compatWith, getPerson, getState, listPeople, removePerson, savePerson } from "./state";

const RELATIONS = Object.keys(RELATION_NAMES) as RelationKind[];
const REL_ICON: Record<RelationKind, string> = {
  partner: "❦",
  crush: "✧",
  spouse: "⚭",
  father: "☰",
  mother: "☷",
  child: "✿",
  sibling: "☯",
  friend: "✦",
  colleague: "⚙",
  boss: "♔",
};

interface Question {
  q: string;
  tags: CompatTag[];
  /** Verdict words from weak to strong: [needs work, mixed, leans yes, clear yes]. */
  scale: [string, string, string, string];
}

/** The questions a user typically asks about this kind of relation, answered from tagged items. */
function questionsFor(rel: RelationKind, who: string): Question[] {
  const group = groupOf(rel);
  if (group === "romance")
    return [
      { q: `${who}是不是你命中注定的人？`, tags: ["fate"], scale: ["缘分要靠经营", "缘分一般", "有缘", "宿缘深厚"] },
      { q: "你们之间有多来电？", tags: ["attraction"], scale: ["吸引力偏弱", "时冷时热", "互相吸引", "强烈吸引"] },
      { q: "日常相处顺不顺？", tags: ["harmony", "conflict"], scale: ["摩擦较多", "有好有坏", "大体顺利", "非常合拍"] },
      { q: `${who}能不能帮到你？`, tags: ["support"], scale: ["各自独立", "偶有助力", "能帮到你", "是你的贵人"] },
    ];
  if (group === "elder")
    return [
      { q: `${who}能不能在事业上帮你？`, tags: ["career", "support"], scale: ["帮助有限", "间接帮助", "能帮上忙", "事业贵人"] },
      { q: `你和${who}相处顺不顺？`, tags: ["harmony", "conflict"], scale: ["摩擦较多", "有好有坏", "大体顺利", "非常合拍"] },
      { q: `你能从${who}身上学到什么？`, tags: ["growth"], scale: ["各走各路", "有所启发", "收获不少", "影响深远"] },
      { q: "你们的缘分有多深？", tags: ["fate"], scale: ["缘分平常", "缘分一般", "有缘", "宿缘深厚"] },
    ];
  return [
    { q: `和${who}合作、相处顺不顺？`, tags: ["harmony", "conflict"], scale: ["摩擦较多", "有好有坏", "大体顺利", "非常合拍"] },
    { q: "你们能不能互相帮忙？", tags: ["support", "career"], scale: ["各自独立", "偶有助力", "互相成就", "彼此贵人"] },
    { q: "你们一起能成长吗？", tags: ["growth"], scale: ["各走各路", "有所启发", "共同成长", "互为良师"] },
    { q: "你们的缘分有多深？", tags: ["fate"], scale: ["缘分平常", "缘分一般", "有缘", "宿缘深厚"] },
  ];
}

/** Net lean of the matching items in -1..1. */
function lean(items: CompatItem[]): number {
  let net = 0;
  let total = 0;
  for (const it of items) {
    total += it.weight;
    if (it.tone === "good") net += it.weight;
    else if (it.tone === "bad") net -= it.weight;
  }
  return total ? net / (total + 2) : 0;
}

const scaleIdx = (x: number) => (x < -0.15 ? 0 : x < 0.15 ? 1 : x < 0.45 ? 2 : 3);

// ───────────────────────── list page

export function renderPeople(view: HTMLElement) {
  const people = listPeople();
  const guide = h("p", { class: "hub-guide" });
  const formSlot = h("div");
  view.append(
    topbar(["#/hub", "← 星盘总览"], "SYNASTRY", ["#/timeline", "未来运程 ☽"]),
    h("header", { class: "page-head" }, h("p", { class: "eyebrow" }, "CONIUNCTIO · 关系合盘"), h("h1", { class: "title-glow small" }, "你与身边的人"), guide),
  );
  typewrite(guide, "加入伴侣、父母、朋友或同事的出生信息，看各个体系怎样解读你们的缘分、相处，以及谁能在哪些事上帮到你。", 28);

  const grid = h(
    "div",
    { class: "people-grid" },
    ...people.map((p, i) => {
      const { compats } = compatWith(p);
      const avg = compats.length ? Math.round(compats.reduce((s, c) => s + c.score, 0) / compats.length) : 0;
      return reveal(
        h(
          "a",
          { class: "person-card glass", href: `#/people/${p.id}` },
          h("span", { class: "pc-icon" }, REL_ICON[p.relation]),
          h("div", null, h("b", null, p.name), h("small", null, `${RELATION_NAMES[p.relation]} · ${inputDate(p.input)}`)),
          h("span", { class: "pc-score" }, compats.length ? String(avg) : "—", h("small", null, compats.length ? "契合" : "暂无体系")),
        ),
        (i % 3) * 80,
      );
    }),
    h("button", { type: "button", class: "person-card add glass", onclick: () => openForm() }, h("span", { class: "pc-icon" }, "＋"), h("b", null, "添加一个人")),
  );
  view.append(reveal(grid), formSlot);
  if (!people.length) openForm();

  function openForm() {
    formSlot.replaceChildren(personForm());
    formSlot.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

/** Add or edit a person. Time and place are optional: unknown time uses 12:00, the place defaults to the user's. */
function personForm(existing?: Person): HTMLElement {
  const me = getState().input!;
  const src = existing?.input;
  let relation: RelationKind = existing?.relation ?? "partner";
  let gender: Gender | "" = src?.gender ?? "";
  let city: City = src?.city ?? me.city;

  const name = h("input", { class: "field", placeholder: "称呼，例如：小林、妈妈", maxlength: "16", value: existing?.name ?? "" });
  const date = h("input", { class: "field", type: "date", min: "1901-01-01", max: new Date().toISOString().slice(0, 10), value: src ? inputDate(src) : "" });
  const time = h("input", { class: "field", type: "time", value: src?.timeKnown ? inputTime(src) : "" });
  const unknown = h("input", { type: "checkbox", checked: src ? !src.timeKnown : false });
  unknown.addEventListener("change", () => (time.disabled = unknown.checked));
  time.disabled = unknown.checked;
  const listId = "city-options";
  const place = h("input", { class: "field", list: listId, value: city.name, placeholder: "出生城市" });
  const options = h("datalist", { id: listId }, ...CITIES.map((c) => h("option", { value: c.name }, c.region)));
  const err = h("p", { class: "step-error", role: "alert" });

  const relChips = h(
    "div",
    { class: "rel-chips" },
    ...RELATIONS.map((r) =>
      h(
        "button",
        {
          type: "button",
          class: `dim-chip${r === relation ? " on" : ""}`,
          "aria-pressed": String(r === relation),
          onclick: (e: Event) => {
            relation = r;
            pressOnly(e.currentTarget as Element);
          },
        },
        `${REL_ICON[r]} ${RELATION_NAMES[r]}`,
      ),
    ),
  );
  const genderBtn = (g: Gender, label: string) =>
    h(
      "button",
      {
        type: "button",
        class: `dim-chip${gender === g ? " on" : ""}`,
        "aria-pressed": String(gender === g),
        onclick: (e: Event) => {
          gender = g;
          pressOnly(e.currentTarget as Element);
        },
      },
      label,
    );

  const submit = () => {
    const [y, m, d] = date.value.split("-").map(Number);
    if (!name.value.trim()) return void (err.textContent = "请填写一个称呼。");
    if (!y || !m || !d) return void (err.textContent = "请选择出生日期。");
    if (!gender) return void (err.textContent = "请选择性别。部分体系（八字、紫微、吠陀合婚）需要它。");
    if (!unknown.checked && !time.value) return void (err.textContent = "请填写出生时间，或勾选“不知道”。");
    const hit = CITIES.find((c) => c.name === place.value.trim());
    if (place.value.trim() && !hit && place.value.trim() !== city.name) return void (err.textContent = "没有找到这个城市。请从下拉列表中选择，或留空使用你的出生地。");
    if (hit) city = hit;
    const [hour, minute] = unknown.checked ? [12, 0] : (time.value.split(":").map(Number) as [number, number]);
    const p: Person = {
      id: existing?.id ?? (crypto.randomUUID?.() ?? `${Date.now()}${Math.random()}`).replace(/-/g, "").slice(0, 10),
      name: name.value.trim(),
      relation,
      input: { year: y, month: m, day: d, hour, minute, timeKnown: !unknown.checked, city, gender, trueSolar: me.trueSolar },
    };
    savePerson(p);
    location.hash = `#/people/${p.id}`;
  };

  const row = (label: string, ...content: (Node | string)[]) => h("label", { class: "pf-row" }, h("span", null, label), h("div", null, ...content));
  return reveal(
    h(
      "form",
      { class: "person-form glass", onsubmit: (e: Event) => (e.preventDefault(), submit()) },
      h("h2", null, existing ? `修改 ${existing.name}` : "添加一个人"),
      row("称呼", name),
      h("div", { class: "pf-row" }, h("span", null, "TA 是你的"), relChips),
      row("出生日期", date),
      row("出生时间", time, h("label", { class: "check" }, unknown, h("span", null, "不知道"))),
      row("出生城市", place, options),
      h("div", { class: "pf-row" }, h("span", null, "性别"), h("div", { class: "rel-chips" }, genderBtn("male", "男"), genderBtn("female", "女"))),
      h("p", { class: "step-hint" }, "只知道日期也可以。时间不详时，与时辰有关的体系会自动降低权重或说明。"),
      err,
      h("div", { class: "wizard-nav" }, h("span"), h("button", { type: "submit", class: "btn btn-primary" }, existing ? "保存并重新合盘 ✦" : "开始合盘 ✦")),
    ),
  );
}

// ───────────────────────── one person

export function renderPerson(view: HTMLElement, id: string) {
  const p = getPerson(id);
  if (!p) return void location.replace("#/people");
  const { compats } = compatWith(p);
  const avg = compats.length ? Math.round(compats.reduce((s, c) => s + c.score, 0) / compats.length) : 0;
  const all = compats.flatMap((c) => c.items.map((it) => ({ it, c })));

  const score = h("b", null, compats.length ? "0" : "—");
  view.append(
    topbar(["#/people", "← 全部关系"], RELATION_NAMES[p.relation], ["#/hub", "星盘总览"]),
    h(
      "header",
      { class: "page-head" },
      h("p", { class: "eyebrow" }, `YOU & ${REL_ICON[p.relation]}`),
      h("h1", { class: "title-glow small" }, `你与${p.name}`),
      h("p", { class: "birth-line" }, `${RELATION_NAMES[p.relation]} · ${inputDate(p.input)} ${p.input.timeKnown ? inputTime(p.input) : "时间不详"} · ${p.input.city.name}`),
      h("div", { class: "ring big", style: { "--p": avg } as never }, score, h("small", null, `${compats.length} 个体系平均`)),
    ),
  );
  if (compats.length) setTimeout(() => countUp(score, avg, 1500), 300);

  view.append(sectionTitle("你最关心的问题", "把各体系的结论按问题归类，信号越一致，判断越明确"));
  const qs = questionsFor(p.relation, p.name);
  // Items already quoted under an earlier question go last, so each question shows its own evidence.
  const used = new Set<CompatItem>();
  view.append(
    h(
      "div",
      { class: "qa-grid" },
      ...qs.map((q, i) => {
        const hits = all.filter(({ it }) => it.tags.some((t) => q.tags.includes(t))).sort((a, b) => b.it.weight - a.it.weight || (a.it.tone === "good" ? -1 : 1));
        const x = lean(hits.map((x) => x.it));
        const verdict = hits.length ? q.scale[scaleIdx(x)] : "暂无信号";
        const pos = Math.round(((x + 1) / 2) * 100);
        const rank = ({ it }: (typeof hits)[number]) => (used.has(it) ? 2 : 0) + (q.tags.includes(it.tags[0]!) ? 0 : 1);
        const ranked = [...hits].sort((a, b) => rank(a) - rank(b));
        const shown = [...ranked.filter((x) => x.it.tone === "good").slice(0, 2), ...ranked.filter((x) => x.it.tone !== "good").slice(0, 2)];
        for (const { it } of shown) used.add(it);
        return reveal(
          h(
            "article",
            { class: "qa glass", style: { "--pos": `${pos}%` } as never },
            h("h3", null, q.q),
            h("p", { class: `qa-verdict v${hits.length ? scaleIdx(x) : 1}` }, verdict),
            h("div", { class: "qa-meter", "aria-hidden": "true" }, h("i")),
            h("p", { class: "qa-count" }, `${new Set(hits.map((x) => x.c.methodId)).size} 个体系 · ${hits.length} 条依据`),
            h("ul", { class: "stmts" }, ...shown.map(({ it, c }, j) => statement(it, c.name, j))),
          ),
          (i % 2) * 90,
        );
      }),
    ),
  );

  view.append(sectionTitle("各体系怎么看", "每个体系独立判断，结论可能互相矛盾"));
  view.append(...compats.map((c, i) => systemCard(c, i)));
  if (!p.input.timeKnown || !getState().input!.timeKnown)
    view.append(reveal(h("aside", { class: "caveats" }, h("b", null, "ⓘ 出生时间不详"), h("p", null, "有一方的出生时间不详，按 12:00 推算。与时辰有关的部分（时柱、上升点、月亮精确位置）只作参考。"))));

  const editSlot = h("div");
  view.append(
    h(
      "div",
      { class: "end-actions" },
      h("button", { type: "button", class: "btn btn-ghost", onclick: () => (editSlot.replaceChildren(personForm(p)), editSlot.scrollIntoView({ behavior: "smooth" })) }, "✎ 修改信息"),
      h(
        "button",
        {
          type: "button",
          class: "btn btn-ghost",
          onclick: () => {
            if (!confirm(`从这台设备上删除「${p.name}」的信息？`)) return;
            removePerson(p.id);
            location.hash = "#/people";
          },
        },
        "删除",
      ),
    ),
    editSlot,
  );
}

function systemCard(c: Compat, i: number): HTMLElement {
  return reveal(
    h(
      "article",
      { class: "compat-card glass", style: { "--v": `${c.score}%` } as never },
      h("header", null, h("b", null, c.name), h("span", { class: "cc-score" }, String(c.score))),
      h("div", { class: "track" }, h("i")),
      h("p", { class: "cc-head" }, c.headline),
      h("ul", { class: "stmts" }, ...c.items.map((it, j) => statement(it, onlyPro(it.tags.map((t) => TAG_NAME[t]).join(" · ")), j))),
    ),
    (i % 2) * 80,
  );
}

const TAG_NAME: Record<CompatTag, string> = { fate: "缘分", attraction: "吸引", harmony: "相处顺", conflict: "摩擦", support: "助力", career: "事业", growth: "成长" };
