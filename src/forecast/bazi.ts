import { Solar } from "lunar-javascript";
import { CHONG, GAN, ganWuXing, LIU_HE, SAN_HE, wxRelation, XIANG_HAI, zhiIndex, zhiWuXing } from "../core/ganzhi";
import { buildSignal, limitSignals, type Scope, shiftTone } from "../data/forecast-common";
import { GOD_RULES, PARTNER_PHRASE, RHYTHM_PHRASE, SHENSHA_RULES, SPOUSE_RULES, TAISUI_RULES } from "../data/forecast-bazi";
import type { WuXing } from "../data/types";
import { bazi } from "../methods/bazi";
import { taiSuiRelation } from "../methods/shengxiao";
import { isEn, listJoin, t } from "../i18n";
import { ganWx, ganName, gzName, shishenName, wxName, zhiName } from "../data/en/terms";
import { taiSuiName } from "../methods/shengxiao";
import { type Forecast, type ForecastFn, forecastPeriods, type Period, type PeriodReading, type Signal, type Tone } from "./types";

/** Ten god of `other` relative to the day master `self` (both are stems). */
export function tenGod(self: string, other: string): string {
  const si = GAN.indexOf(self as (typeof GAN)[number]);
  const oi = GAN.indexOf(other as (typeof GAN)[number]);
  const samePolarity = si % 2 === oi % 2;
  switch (wxRelation(ganWuXing(self), ganWuXing(other))) {
    case "同":
      return samePolarity ? "比肩" : "劫财";
    case "我生":
      return samePolarity ? "食神" : "伤官";
    case "我克":
      return samePolarity ? "偏财" : "正财";
    case "克我":
      return samePolarity ? "七杀" : "正官";
    default:
      return samePolarity ? "偏印" : "正印";
  }
}

/** Main hidden stem (本气) of each branch. */
const MAIN_QI = ["癸", "己", "甲", "乙", "戊", "丙", "丁", "己", "庚", "辛", "戊", "壬"];

/** 天乙贵人 branches by day stem. */
const TIAN_YI: Record<string, string[]> = {
  甲: ["丑", "未"],
  戊: ["丑", "未"],
  庚: ["丑", "未"],
  乙: ["子", "申"],
  己: ["子", "申"],
  丙: ["亥", "酉"],
  丁: ["亥", "酉"],
  辛: ["寅", "午"],
  壬: ["卯", "巳"],
  癸: ["卯", "巳"],
};
/** 文昌 branch by day stem. */
const WEN_CHANG: Record<string, string> = { 甲: "巳", 乙: "午", 丙: "申", 丁: "酉", 戊: "申", 己: "酉", 庚: "亥", 辛: "子", 壬: "寅", 癸: "卯" };

/** Branch trio (三合 group) lookup: returns the target for 驿马 / 桃花 from a base branch. */
function trioTarget(base: number, targets: [number, number, number, number]): number {
  // Groups: 申子辰 (8,0,4), 寅午戌 (2,6,10), 巳酉丑 (5,9,1), 亥卯未 (11,3,7)
  const groups = [[8, 0, 4], [2, 6, 10], [5, 9, 1], [11, 3, 7]];
  return targets[groups.findIndex((g) => g.includes(base))]!;
}
const yiMa = (base: number) => trioTarget(base, [2, 8, 11, 5]);
const taoHua = (base: number) => trioTarget(base, [9, 3, 6, 0]);

const PARTNER_GODS: Record<"male" | "female", string[]> = { male: ["正财", "偏财"], female: ["正官", "七杀"] };
const SPOUSE_EN: Record<string, string> = { 伏吟: "a repeat (Fu Yin)", 六合: "Six Harmony", 冲: "a clash", 害: "a harm", 三合: "Three Harmony" };

interface Ctx {
  dayGan: string;
  dayZhi: string;
  yearZhi: string;
  gender: "male" | "female";
  strong: boolean;
  favorable: WuXing[];
  dayun: { ganzhi: string; startYear: number; endYear: number }[];
}

function favorOf(c: Ctx, wx: WuXing): number {
  if (c.favorable.includes(wx)) return 1;
  const rel = wxRelation(ganWuXing(c.dayGan), wx);
  const bad = c.strong ? rel === "同" || rel === "生我" : rel === "我生" || rel === "我克" || rel === "克我";
  return bad ? -1 : 0;
}

/**
 * Raise or lower a rule's tone by the favorable-element score `fv`. A good rule can fall to mixed only;
 * a mixed rule stays mixed unless `bad` allows it to fall to bad. The plain text never contradicts its tone.
 */
function adjust(base: Tone, fv: number, bad = false): Tone {
  const t = fv >= 2 ? shiftTone(base, 1) : fv <= -2 ? shiftTone(base, -1) : base;
  if (base === "good") return t === "bad" ? "mixed" : t;
  if (t === "good") return "mixed";
  return t === "bad" && !bad ? "mixed" : t;
}

/** Gods whose text may rise to good when the element is favorable. */
const CAN_RISE = new Set(["七杀"]);
/** Gods whose text may fall to bad when the element is unfavorable. */
const CAN_FALL = new Set(["七杀", "劫财"]);

function readPeriod(c: Ctx, p: Period, gz: string, scope: Scope): PeriodReading {
  const stem = gz.charAt(0);
  const branch = gz.charAt(1);
  const bi = zhiIndex(branch);
  const di = zhiIndex(c.dayZhi);
  const stemWx = ganWuXing(stem);
  const branchWx = zhiWuXing(branch);
  const fv = favorOf(c, stemWx) * 2 + favorOf(c, branchWx);
  const tag = scope === "year" ? t("流年", "Year") : t("流月", "Month");
  const key = (rule: string) => `bazi:${scope}:${p.year}-${p.month ?? 0}:${rule}`;
  const head = isEn() ? `${tag} ${gzName(gz)}` : `${tag}${gz}`;
  const dm = isEn() ? `the ${ganWx(c.dayGan, ganWuXing(c.dayGan))} Day Master` : `${c.dayGan}${ganWuXing(c.dayGan)}日主`;
  const favNote = fv >= 2 ? t("，干支五行为喜用，助力", "; both elements are useful, a boost") : fv <= -2 ? t("，干支五行不利日主，偏弱", "; both elements work against the Day Master, weaker") : "";
  const z = zhiName;
  const out: Signal[] = [];

  const stemGod = tenGod(c.dayGan, stem);
  const branchGod = tenGod(c.dayGan, MAIN_QI[bi]!);

  // 1. 太岁 relation (years only).
  if (scope === "year") {
    const rel = taiSuiRelation(zhiIndex(c.yearZhi), bi);
    const rule = TAISUI_RULES[rel.name];
    if (rule) {
      out.push(
        buildSignal({
          key: key(rel.name),
          scope,
          dim: rule.dim,
          tone: adjust(rule.tone, fv, rel.name === "冲太岁"),
          weight: rule.weight,
          pro: t(`${head}：流年支${branch}与年支${c.yearZhi}（生肖）成「${rel.name}」`, `${head}: year branch ${z(branch)} with your year branch ${z(c.yearZhi)} (zodiac animal) forms ${taiSuiName(rel.name)}`),
          phrase: rule.phrase,
        }),
      );
    }
  }

  // 2. 天乙贵人.
  if (TIAN_YI[c.dayGan]!.includes(branch)) {
    const rule = SHENSHA_RULES["天乙贵人"]!;
    out.push(
      buildSignal({
        key: key("天乙贵人"),
        scope,
        dim: rule.dim,
        tone: rule.tone,
        weight: fv >= 2 ? 3 : 2,
        pro: t(`${head}：${branch}为${c.dayGan}日主的天乙贵人${fv >= 2 ? "，且干支喜用，贵人得力" : ""}`, `${head}: ${z(branch)} is the Heavenly Noble of the ${ganName(c.dayGan)} Day Master${fv >= 2 ? ", and the elements are useful, so the helper is strong" : ""}`),
        phrase: rule.phrase,
      }),
    );
  }

  // 3. Ten god of the period stem.
  const god = GOD_RULES[stemGod]!;
  const godTone = CAN_RISE.has(stemGod) && fv >= 2 ? "good" : adjust(god.tone, fv, CAN_FALL.has(stemGod));
  out.push(
    buildSignal({
      key: key(stemGod),
      scope,
      dim: god.dim,
      tone: godTone,
      weight: godTone === "good" && fv === 3 ? 3 : 2,
      pro: t(`${head}：天干${stem}对${dm}为${stemGod}（${god.meaning}）${favNote}`, `${head}: stem ${ganName(stem)} is ${shishenName(stemGod)} to ${dm} (${god.meaning})${favNote}`),
      phrase: god.phrase,
    }),
  );
  if (god.extra) {
    out.push(
      buildSignal({
        key: key(`${stemGod}:extra`),
        scope,
        dim: god.extra.dim,
        tone: adjust(god.extra.tone, fv),
        weight: 1,
        pro: t(`${head}：${stemGod}的另一面（${god.meaning}）`, `${head}: the other side of ${shishenName(stemGod)} (${god.meaning})`),
        phrase: god.extra.phrase,
      }),
    );
  }

  // 4. Ten god of the branch's main hidden stem, when it speaks of another life area.
  const bg = GOD_RULES[branchGod]!;
  if (bg.dim !== god.dim && branchGod !== stemGod) {
    out.push(
      buildSignal({
        key: key(`${branchGod}:zhi`),
        scope,
        dim: bg.dim,
        tone: adjust(bg.tone, fv >= 1 ? 2 : fv <= -1 ? -2 : 0, CAN_FALL.has(branchGod)),
        weight: 1,
        pro: t(`${head}：地支${branch}本气${MAIN_QI[bi]}对${dm}为${branchGod}（${bg.meaning}）`, `${head}: the main qi ${ganName(MAIN_QI[bi]!)} of branch ${z(branch)} is ${shishenName(branchGod)} to ${dm} (${bg.meaning})`),
        phrase: bg.phrase,
      }),
    );
  }

  // 5. Partner star.
  const partners = PARTNER_GODS[c.gender];
  const partnerGod = partners.includes(stemGod) ? stemGod : partners.includes(branchGod) ? branchGod : undefined;
  if (partnerGod) {
    const steady = partnerGod === "正财" || partnerGod === "正官";
    out.push(
      buildSignal({
        key: key(`partner:${partnerGod}`),
        scope,
        dim: "love",
        tone: adjust(steady ? "good" : "mixed", fv),
        weight: partnerGod === stemGod ? 2 : 1,
        pro: t(
          `${head}：${c.gender === "male" ? "男命以财为妻星" : "女命以官杀为夫星"}，${partnerGod}${partnerGod === stemGod ? "透干" : "藏于地支"}`,
          `${head}: ${c.gender === "male" ? "in a man's chart Wealth is the wife star" : "in a woman's chart Officer and Seven Killings are the husband star"}; ${shishenName(partnerGod)} ${partnerGod === stemGod ? "shows in the stem" : "is hidden in the branch"}`,
        ),
        phrase: PARTNER_PHRASE[steady ? "steady" : "passion"],
      }),
    );
  }

  // 6. Day branch (spouse palace) relation.
  let spouse: string | undefined;
  if (bi === di) spouse = "伏吟";
  else if (LIU_HE[di] === bi) spouse = "六合";
  else if (CHONG(di) === bi) spouse = "冲";
  else if (XIANG_HAI[di] === bi) spouse = "害";
  else if (SAN_HE(di).includes(bi)) spouse = "三合";
  if (spouse) {
    const rule = SPOUSE_RULES[spouse]!;
    out.push(
      buildSignal({
        key: key(`spouse:${spouse}`),
        scope,
        dim: "love",
        tone: adjust(rule.tone, spouse === "冲" ? fv : 0, spouse === "冲"),
        weight: spouse === "六合" && fv >= 2 ? 2 : rule.weight,
        pro: t(`${head}：${branch}与日支${c.dayZhi}（配偶宫）成${spouse === "伏吟" ? "伏吟" : `「${spouse}」`}`, `${head}: ${z(branch)} with your day branch ${z(c.dayZhi)} (spouse palace) forms ${SPOUSE_EN[spouse]}`),
        phrase: rule.phrase,
      }),
    );
  }

  // 7. Other 神煞.
  if (WEN_CHANG[c.dayGan] === branch) {
    const rule = SHENSHA_RULES["文昌"]!;
    out.push(
      buildSignal({ key: key("文昌"), scope, dim: rule.dim, tone: rule.tone, weight: fv >= 2 ? 2 : 1, pro: t(`${head}：${branch}为${c.dayGan}日主的文昌`, `${head}: ${z(branch)} is the Literary Star of the ${ganName(c.dayGan)} Day Master`), phrase: rule.phrase }),
    );
  }
  const bases = [[t("日支", "day branch "), c.dayZhi], [t("年支", "year branch "), c.yearZhi]];
  const yiBases = bases.filter(([, zz]) => yiMa(zhiIndex(zz!)) === bi).map(([n, zz]) => `${n}${z(zz!)}`);
  if (yiBases.length) {
    const rule = SHENSHA_RULES["驿马"]!;
    out.push(
      buildSignal({ key: key("驿马"), scope, dim: rule.dim, tone: rule.tone, weight: yiBases.length > 1 ? 2 : 1, pro: t(`${head}：${branch}为${yiBases.join("、")}的驿马`, `${head}: ${z(branch)} is the Travelling Horse of your ${listJoin(yiBases)}`), phrase: rule.phrase }),
    );
  }
  const taoBases = bases.filter(([, zz]) => taoHua(zhiIndex(zz!)) === bi).map(([n, zz]) => `${n}${z(zz!)}`);
  if (taoBases.length) {
    const rule = SHENSHA_RULES["桃花"]!;
    out.push(
      buildSignal({ key: key("桃花"), scope, dim: rule.dim, tone: rule.tone, weight: taoBases.length > 1 ? 2 : 1, pro: t(`${head}：${branch}为${taoBases.join("、")}的桃花（咸池）`, `${head}: ${z(branch)} is the Peach Blossom of your ${listJoin(taoBases)}`), phrase: rule.phrase }),
    );
  }

  // 8. Overall rhythm from favorable elements.
  // Always at least two signals: a plain rhythm line when the element score is neutral.
  if (Math.abs(fv) >= 2 || out.length < 2) {
    const kind = fv >= 2 ? "fit" : fv <= -2 ? "off" : "flat";
    const proNote = isEn()
      ? kind === "fit" ? "both useful" : kind === "off" ? "neither useful" : "useful and not useful cancel out"
      : kind === "fit" ? "皆合喜用" : kind === "off" ? "皆不合喜用" : "与喜用相互抵消，不偏不倚";
    out.push(
      buildSignal({
        key: key("rhythm"),
        scope,
        dim: "health",
        tone: kind === "fit" ? "good" : "mixed",
        weight: 1,
        pro: t(
          `${head}：干${stem}${stemWx}、支${branch}${branchWx}${proNote}（喜用 ${c.favorable.join("、")}）`,
          `${head}: stem ${ganName(stem)} ${wxName(stemWx)} and branch ${z(branch)} ${wxName(branchWx)}, ${proNote} (useful: ${listJoin(c.favorable.map(wxName))})`,
        ),
        phrase: RHYTHM_PHRASE[kind],
      }),
    );
  }

  let label = `${head} · ${shishenName(stemGod)}`;
  if (scope === "year") {
    const dy = c.dayun.find((d) => p.year >= d.startYear && p.year <= d.endYear);
    if (dy) label += t(` · 大运${dy.ganzhi}`, ` · luck period ${gzName(dy.ganzhi)}`);
  }
  return { period: p, label, signals: limitSignals(out) };
}

export const baziForecast: ForecastFn = (chart, now): Forecast => {
  const v = bazi(chart).visual;
  const ec = chart.eightChar;
  const ctx: Ctx = {
    dayGan: ec.getDayGan(),
    dayZhi: ec.getDayZhi(),
    yearZhi: ec.getYearZhi(),
    gender: chart.input.gender,
    strong: v.strong,
    favorable: v.favorable,
    dayun: v.dayun,
  };
  const { years, months } = forecastPeriods(now);
  return {
    years: years.map((p) => readPeriod(ctx, p, Solar.fromYmd(p.year, 7, 1).getLunar().getYearInGanZhiByLiChun(), "year")),
    months: months.map((p) => readPeriod(ctx, p, Solar.fromYmd(p.year, p.month!, 15).getLunar().getMonthInGanZhiExact(), "month")),
  };
};
