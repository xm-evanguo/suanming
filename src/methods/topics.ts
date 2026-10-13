import type { Dim } from "../data/types";
import type { Forecast, Period, PeriodReading, Signal } from "../forecast/types";
import { dimName, DIMS } from "./fusion";
import { isEn } from "../i18n";
import type { MethodId, MethodResult } from "./types";

/**
 * The "by topic" digest: for each of the five life areas, what the systems agree and disagree on,
 * a few short statements, and what the period forecasts say about now.
 * Pure and deterministic, so other pages can use it as an evidence source.
 */

/** 0-100 from weighted good/bad signals; 50 means no lean either way. */
export function periodScore(signals: Signal[]): number {
  let good = 0;
  let bad = 0;
  for (const s of signals) {
    if (s.tone === "good") good += s.weight;
    else if (s.tone === "bad") bad += s.weight;
    else {
      good += s.weight / 2;
      bad += s.weight / 2;
    }
  }
  return Math.round(50 + (50 * (good - bad)) / (good + bad + 4));
}

export interface TopicStatement {
  id: MethodId;
  name: string;
  /** This system's own score for the topic. */
  score: number;
  /** Plain wording, 1-2 sentences. */
  text: string;
  /** Technical wording, or "" when the system has none that differs from `text`. */
  pro: string;
}

export interface TopicSignal {
  id: MethodId;
  name: string;
  /** The period label of the system, e.g. "流年丁未 · 伤官". */
  label: string;
  signal: Signal;
}

export interface TopicPeriod {
  period: Period;
  /** Same formula as the timeline page. 50 when no system has a signal for the topic. */
  score: number;
  /** Strongest first. */
  signals: TopicSignal[];
}

export interface TopicRank {
  id: MethodId;
  name: string;
  score: number;
}

export interface TopicView {
  dim: Dim;
  name: string;
  /** Mean score across systems (not rounded). */
  avg: number;
  /** At least `SPREAD` above the mean, highest first. */
  high: TopicRank[];
  /** At least `SPREAD` below the mean, lowest first. */
  low: TopicRank[];
  /** At most one per system, most distinctive (farthest from the mean) first. No sentence appears twice. */
  statements: TopicStatement[];
  /** Signals of the current year from all systems. Undefined when no forecast has a yearly reading. */
  thisYear: TopicPeriod | undefined;
  /** The next 12 months. Empty when no forecast has a monthly reading. */
  months: TopicPeriod[];
}

/** A system counts as clearly above or below the mean when it differs by this many points. */
export const SPREAD = 8;

// ───────── sentence classification

const RE = {
  wealth: /(?<!本)钱|财|收入|储蓄|存款|攒|赚|花销|开销|理财|债务|薪|资产|投资|生意/,
  // Used inside a career or love section, where "投资" or "生意" is usually part of a job list.
  wealthStrong: /(?<!本)钱|财|收入|储蓄|存款|攒|赚|花销|开销|理财|债务|薪/,
  love: /感情|恋|爱情|伴侣|亲密关系|对方|婚|桃花|爱人|相爱|夫妻|姻缘|合拍|情侣|另一半|异性/,
  health: /身体|精力|睡|熬夜|饮食|三餐|吃不好|运动|锻炼|呼吸|皮肤|关节|休息|健康|失眠|保暖|体质|疲|活动一下|绷|肩颈|养生|体力|肠胃|久坐|没精神/,
  career: /工作|事业|职场|职业|同事|团队|领导|上司|创业|行业|项目|岗位|换岗|公司|职/,
  wisdom: /学习|读书|思考|思维|洞察|直觉|智慧|进修|好奇|领悟|心智|头脑|脑子|聪明|研究|反思|专注|求知|悟性/,
} as const;

/** Plain sections that are about when (this year, now, next stage) or how the method works, not about the topics. */
const SKIP_TITLE = /怎么算|\d{4}|下一站|^现在|^眼下|人生阶段|合得来|什么意思/;
/** Pro sections whose numbers are units, not topics: 称骨 weights are in 钱. */
const SKIP_PRO_TITLE = /称量/;

/** Plain section titles that fix the topic of the whole section. */
function plainDefault(title: string): Dim | null {
  if (isEn()) return /suits you/i.test(title) ? "career" : /love/i.test(title) ? "love" : null;
  if (/适合/.test(title)) return "career";
  if (/感情/.test(title)) return "love";
  return null;
}

/** Pro section titles that fix the topic of the section. 财帛 comes first so that "事业与财帛" stays career, as 官禄 leads it. */
function proDefault(title: string): Dim | null {
  if (isEn()) {
    if (/career|profession/i.test(title)) return "career";
    if (/wealth|money/i.test(title)) return "wealth";
    if (/love|spouse|marriage/i.test(title)) return "love";
    if (/health/i.test(title)) return "health";
    return null;
  }
  if (/事业|官禄|职业/.test(title)) return "career";
  if (/财帛/.test(title)) return "wealth";
  if (/感情|夫妻|姻缘|婚/.test(title)) return "love";
  if (/健康|疾厄|调养/.test(title)) return "health";
  return null;
}

/** 紫微 pro sections list one palace per sentence; the palace name gives the topic. */
const PALACE: [RegExp, Dim | "none"][] = [
  [/^官禄/, "career"],
  [/^财帛/, "wealth"],
  [/^夫妻/, "love"],
  [/^疾厄/, "health"],
  [/^福德/, "wisdom"],
  [/^迁移/, "none"],
];

// English text uses the same approach with English keywords. Chinese stays the source of truth for tests.
const RE_EN = {
  wealth: /\b(money|income|earn|savings?|saving|spend|spending|budget|debt|salary|pay|wealth|finances?|financial|invest|investment|business|assets?)\b/i,
  wealthStrong: /\b(money|income|earn|savings?|saving|spend|spending|budget|debt|salary|pay|finances?|financial)\b/i,
  love: /\b(love|romance|romantic|partner|marriage|married|spouse|dating|date|relationship|crush|lover|couple|other half)\b/i,
  health: /\b(body|health|healthy|energy|sleep|late nights?|diet|meals?|exercise|workout|breathing|skin|joints?|rest|insomnia|tired|tiredness|fatigue|stomach|neck|shoulders|sitting)\b/i,
  career: /\b(work|career|job|jobs|colleagues?|team|boss|bosses|manager|start-up|industry|projects?|role|company|profession)\b/i,
  wisdom: /\b(learn|learning|study|studying|read|reading|think|thinking|insight|intuition|wisdom|mind|curious|curiosity|research|reflect|focus|knowledge)\b/i,
} as const;
const SKIP_TITLE_EN = /how this method works|\d{4}|next stop|^now\b|^right now|stage of (your )?life|get along|what .* means/i;
const SKIP_PRO_TITLE_EN = /weighing/i;
const PALACE_EN: [RegExp, Dim | "none"][] = [
  [/^Career palace/, "career"],
  [/^Wealth palace/, "wealth"],
  [/^Spouse palace/, "love"],
  [/^Health palace/, "health"],
  [/^Fortune palace/, "wisdom"],
  [/^Travel palace/, "none"],
];
const DANGLING_EN = /^(it|this|that|and|also|so|therefore|but|however|that is|which)\b/i;

/** Split text into sentences; closing quotes and brackets stay with their sentence. */
function sentences(text: string): string[] {
  if (isEn()) return (text.match(/[^.!?]*[.!?]+["')\]]*(?=\s|$)|[^.!?]+$/g) ?? []).map((s) => s.trim()).filter((s) => s.length > 0);
  return (text.match(/[^。！？]*[。！？]+[”’」』）)]*|[^。！？]+$/g) ?? []).map((s) => s.trim()).filter((s) => s.length > 0);
}

/**
 * The topic of one sentence, or null when it is not about a topic (generic personality text).
 * In a section with a default topic, wealth, love and health keywords override the default, and a sentence
 * without a keyword continues the topic of the sentence before it, unless it starts a new "在…上" point.
 */
function classify(s: string, def: Dim | null, prev: Dim | null): Dim | null {
  if (isEn()) {
    const palace = PALACE_EN.find(([re]) => re.test(s));
    if (palace) return palace[1] === "none" ? null : palace[1];
    if ((def ? RE_EN.wealthStrong : RE_EN.wealth).test(s)) return "wealth";
    if (RE_EN.love.test(s)) return "love";
    if (RE_EN.health.test(s)) return "health";
    if (def) return /^(in|with|on) [^,]{1,30},/i.test(s) ? def : (prev ?? def);
    if (RE_EN.career.test(s)) return "career";
    if (RE_EN.wisdom.test(s)) return "wisdom";
    return null;
  }
  const palace = PALACE.find(([re]) => re.test(s));
  if (palace) return palace[1] === "none" ? null : palace[1];
  if ((def ? RE.wealthStrong : RE.wealth).test(s)) return "wealth";
  if (RE.love.test(s)) return "love";
  if (RE.health.test(s) || /^(你的)?精力/.test(s)) return "health";
  if (def) return /^在.{1,12}上/.test(s) ? def : (prev ?? def);
  if (RE.career.test(s)) return "career";
  if (RE.wisdom.test(s)) return "wisdom";
  return null;
}

const normalize = (s: string) => s.replace(/[\s，。！？；：、“”‘’「」『』（）()]/g, "").replace(/[.,!?;:"']/g, "").toLowerCase();

/** A sentence that leans on the one before it cannot start a statement. */
const DANGLING = /^(它|落在|而且|另外|所以|因此|并且|同时|不过|但|也就是)/;
const MAX_SENTENCE = 160;
const MAX_TEXT = 110;

/** Sentences per topic from one list of sections. Sentences already in `used` are dropped. */
function bucket(sections: { title: string; body: string }[], defaultOf: (title: string) => Dim | null, used: Set<string>): Record<Dim, string[]> {
  const out: Record<Dim, string[]> = { career: [], wealth: [], love: [], health: [], wisdom: [] };
  for (const sec of sections) {
    const def = defaultOf(sec.title);
    let prev: Dim | null = null;
    for (const s of sentences(sec.body)) {
      const dim = classify(s, def, prev);
      prev = dim && dim !== def ? dim : null;
      if (!dim || s.length < (isEn() ? 15 : 6) || s.length > (isEn() ? MAX_SENTENCE * 2.6 : MAX_SENTENCE)) continue;
      const key = normalize(s);
      if (used.has(key)) continue;
      used.add(key);
      out[dim].push(s);
    }
  }
  return out;
}

/** Join the first one or two usable sentences into a short statement. */
function pickText(list: string[], skip: Set<string> = new Set()): string {
  const usable = list.filter((s) => !skip.has(normalize(s)));
  const dangling = isEn() ? DANGLING_EN : DANGLING;
  while (usable.length > 0 && dangling.test(usable[0]!)) usable.shift();
  if (usable.length === 0) return "";
  const first = usable[0]!;
  const second = usable[1];
  if (isEn()) return second && first.length + second.length <= MAX_TEXT * 2.6 ? `${first} ${second}` : first;
  return second && first.length + second.length <= MAX_TEXT ? first + second : first;
}

type Buckets = Record<Dim, string[]>;

/** Sentences of every system by topic. Each sentence is kept once across all systems, the first system wins. */
function allBuckets(results: MethodResult[]): Map<MethodId, { plain: Buckets; pro: Buckets }> {
  const plainUsed = new Set<string>();
  const proUsed = new Set<string>();
  return new Map(
    results.map((r) => [
      r.id,
      {
        plain: bucket(r.plain.sections.filter((s) => !(isEn() ? SKIP_TITLE_EN : SKIP_TITLE).test(s.title)), plainDefault, plainUsed),
        pro: bucket(r.sections.filter((s) => !(isEn() ? SKIP_PRO_TITLE_EN : SKIP_PRO_TITLE).test(s.title)), proDefault, proUsed),
      },
    ]),
  );
}

function statementsFor(dim: Dim, results: MethodResult[], avg: number, buckets: Map<MethodId, { plain: Buckets; pro: Buckets }>): TopicStatement[] {
  const out: TopicStatement[] = [];
  for (const r of results) {
    const b = buckets.get(r.id)!;
    const text = pickText(b.plain[dim]);
    if (!text) continue;
    const pro = pickText(b.pro[dim], new Set(sentences(text).map(normalize)));
    out.push({ id: r.id, name: r.name, score: r.scores[dim], text, pro });
  }
  const order = new Map(results.map((r, i) => [r.id, i]));
  return out.sort((a, b) => Math.abs(b.score - avg) - Math.abs(a.score - avg) || order.get(a.id)! - order.get(b.id)!);
}

// ───────── forecasts

const byWeight = (a: TopicSignal, b: TopicSignal) => b.signal.weight - a.signal.weight;

function topicPeriod(period: Period, rows: { r: MethodResult; reading: PeriodReading }[], dim: Dim): TopicPeriod {
  const signals: TopicSignal[] = rows
    .flatMap(({ r, reading }) => reading.signals.filter((s) => s.dim === dim).map((signal) => ({ id: r.id, name: r.name, label: reading.label, signal })))
    .sort(byWeight);
  return { period, score: periodScore(signals.map((x) => x.signal)), signals };
}

/** The `n` strongest signals, from different systems when possible. */
export function strongestSignals(p: TopicPeriod, n: number): TopicSignal[] {
  const picked: TopicSignal[] = [];
  for (const s of p.signals) if (picked.length < n && !picked.some((x) => x.id === s.id)) picked.push(s);
  for (const s of p.signals) if (picked.length < n && !picked.includes(s)) picked.push(s);
  return picked;
}

const periodKey = (p: Period) => p.year * 100 + (p.month ?? 0);

/** One line on how far the systems agree, e.g. "14 个体系里，9 个评价偏高，2 个明显偏低（紫微斗数、吠陀占星）". */
export function consensusText(v: TopicView, total: number): string {
  if (isEn()) {
    const namesEn = (list: TopicRank[]) => (list.length > 0 && list.length <= 3 ? ` (${list.map((x) => x.name).join(", ")})` : "");
    if (v.high.length === 0 && v.low.length === 0) return `The ${total} systems see this much the same way; none rates it clearly higher or lower.`;
    const partsEn: string[] = [];
    if (v.high.length > 0) partsEn.push(`${v.high.length} ${v.high.length === 1 ? "rates" : "rate"} it higher${namesEn(v.high)}`);
    if (v.low.length > 0) partsEn.push(`${v.low.length} ${v.low.length === 1 ? "rates" : "rate"} it clearly lower${namesEn(v.low)}`);
    return `Of ${total} systems, ${partsEn.join(" and ")}.`;
  }
  const names = (list: TopicRank[]) => (list.length > 0 && list.length <= 3 ? `（${list.map((x) => x.name).join("、")}）` : "");
  if (v.high.length === 0 && v.low.length === 0) return `${total} 个体系的看法比较接近，没有谁明显偏高或偏低。`;
  const parts: string[] = [];
  if (v.high.length > 0) parts.push(`${v.high.length} 个评价偏高${names(v.high)}`);
  if (v.low.length > 0) parts.push(`${v.low.length} 个明显偏低${names(v.low)}`);
  return `${total} 个体系里，${parts.join("，")}。`;
}

/** Build the five topic views in `DIMS` order. */
export function topicViews(results: MethodResult[], forecasts: Partial<Record<MethodId, Forecast>>): TopicView[] {
  const buckets = allBuckets(results);
  const withForecast = results.flatMap((r) => (forecasts[r.id] ? [{ r, f: forecasts[r.id]! }] : []));
  const yearRows = withForecast.flatMap(({ r, f }) => (f.years[0] ? [{ r, reading: f.years[0] }] : []));
  const thisYear = yearRows.length > 0 ? Math.min(...yearRows.map((x) => x.reading.period.year)) : undefined;
  const thisYearRows = yearRows.filter((x) => x.reading.period.year === thisYear);

  const monthRows = new Map<number, { period: Period; rows: { r: MethodResult; reading: PeriodReading }[] }>();
  for (const { r, f } of withForecast)
    for (const reading of f.months) {
      const k = periodKey(reading.period);
      const slot = monthRows.get(k) ?? { period: reading.period, rows: [] };
      slot.rows.push({ r, reading });
      monthRows.set(k, slot);
    }
  const monthSlots = [...monthRows.entries()].sort((a, b) => a[0] - b[0]).map(([, v]) => v);

  return DIMS.map((dim) => {
    const avg = results.reduce((s, r) => s + r.scores[dim], 0) / (results.length || 1);
    const rank = (r: MethodResult): TopicRank => ({ id: r.id, name: r.name, score: r.scores[dim] });
    return {
      dim,
      name: dimName(dim),
      avg,
      high: results.filter((r) => r.scores[dim] >= avg + SPREAD).map(rank).sort((a, b) => b.score - a.score),
      low: results.filter((r) => r.scores[dim] <= avg - SPREAD).map(rank).sort((a, b) => a.score - b.score),
      statements: statementsFor(dim, results, avg, buckets),
      thisYear: thisYearRows.length > 0 ? topicPeriod(thisYearRows[0]!.reading.period, thisYearRows, dim) : undefined,
      months: monthSlots.map((m) => topicPeriod(m.period, m.rows, dim)),
    };
  });
}
