import { Solar } from "lunar-javascript";
import { zhiIndex } from "../core/ganzhi";
import { buildSignal, limitSignals, type Scope } from "../data/forecast-common";
import { CENTER_RULE, DIRECTION_RULES, HAZARD_RULES } from "../data/forecast-kyusei";
import { NINE_STARS } from "../data/kyusei";
import { boardFor, liChunYear, LOSHU_DIRS, monthStar, yearStar } from "../methods/kyusei";
import { type Forecast, type ForecastFn, forecastPeriods, type Period, type PeriodReading, type Signal } from "./types";

/** Direction of each earthly branch (子 北, 丑寅 东北, ...), in the names used by LOSHU_DIRS. */
const DIR_OF_ZHI = ["北", "东北", "东北", "东", "东南", "东南", "南", "西南", "西南", "西", "西北", "西北"];

function readBoard(star: number, innerStar: number, center: number, zhi: string, p: Period, scope: Scope): PeriodReading {
  const board = boardFor(center);
  const pos = board.indexOf(star);
  const dir = LOSHU_DIRS[pos]!;
  const five = board.indexOf(5);
  const centerName = NINE_STARS[center - 1]!.name;
  const tag = scope === "year" ? "年盘" : "月盘";
  const head = `${p.year}${p.month ? `-${p.month}` : ""}${tag}`;
  const key = (rule: string) => `kyusei:${scope}:${p.year}-${p.month ?? 0}:${rule}`;
  const out: Signal[] = [];

  if (pos === 4) {
    out.push(
      buildSignal({
        key: key("center"),
        scope,
        dim: "career",
        tone: "bad",
        weight: scope === "year" ? 3 : 2,
        pro: `${head}：${centerName}入中宫，本命星${NINE_STARS[star - 1]!.name}回到中宫，称八方塞`,
        phrase: CENTER_RULE,
      }),
    );
  } else {
    const rule = DIRECTION_RULES[dir]!;
    out.push(
      buildSignal({
        key: key(`dir:${dir}`),
        scope,
        dim: rule.dim,
        tone: rule.tone,
        weight: scope === "year" ? rule.weight : 1,
        pro: `${head}：${centerName}入中宫，本命星落${dir}（${rule.trigram}宫）`,
        phrase: rule.phrase,
      }),
    );
  }

  // The month star (月命星) shows the inner mood: where it sits on the board is a second, lighter reading.
  const innerPos = board.indexOf(innerStar);
  const innerName = NINE_STARS[innerStar - 1]!.name;
  const innerRule = innerPos === 4 ? undefined : DIRECTION_RULES[LOSHU_DIRS[innerPos]!]!;
  const innerPhrase = innerRule?.phrase ?? CENTER_RULE;
  out.push(
    buildSignal({
      key: key("inner"),
      scope,
      dim: innerRule?.dim ?? "wisdom",
      tone: innerRule && innerRule.tone !== "good" ? "mixed" : innerRule ? "good" : "mixed",
      weight: 1,
      pro: `${head}：月命星${innerName}落${innerPos === 4 ? "中宫" : LOSHU_DIRS[innerPos]}（内在情绪层面）`,
      phrase: { ...innerPhrase, what: innerPhrase.what.map((w) => w.replace("{T}", "{T}在内心层面，")) },
    }),
  );

  const hazard = (name: string, why: string) => {
    const h = HAZARD_RULES[name]!;
    out.push(
      buildSignal({
        key: key(name),
        scope,
        dim: "career",
        tone: "bad",
        weight: scope === "month" && h.weight === 3 ? 2 : h.weight,
        pro: `${head}：本命星落${dir}，${why}（${h.label}）`,
        phrase: h.phrase,
      }),
    );
  };
  if (five !== 4 && pos === 8 - five) hazard("暗剣殺", `与五黄所在的${LOSHU_DIRS[five]}相对`);
  if (five !== 4 && pos === five) hazard("五黄殺", "本命星本身是五黄土星");
  const breakDir = DIR_OF_ZHI[(zhiIndex(zhi) + 6) % 12]!;
  if (pos !== 4 && dir === breakDir) hazard(scope === "year" ? "歳破" : "月破", `${zhi}${scope === "year" ? "年" : "月"}的对冲方位为${breakDir}`);

  return { period: p, label: `${centerName}中宫 · 本命星落${pos === 4 ? "中宫" : dir}`, signals: limitSignals(out) };
}

export const kyuseiForecast: ForecastFn = (chart, now): Forecast => {
  const t = chart.cnTime;
  const natalZhi: string = chart.eightChar.getMonthZhi();
  const star = yearStar(liChunYear(t.y, t.m, natalZhi));
  const innerStar = monthStar(star, (zhiIndex(natalZhi) - 2 + 12) % 12);
  const { years, months } = forecastPeriods(now);
  return {
    years: years.map((p) => {
      const center = yearStar(p.year);
      const zhi = Solar.fromYmd(p.year, 7, 1).getLunar().getYearInGanZhiByLiChun().charAt(1);
      return readBoard(star, innerStar, center, zhi, p, "year");
    }),
    months: months.map((p) => {
      const lunar = Solar.fromYmd(p.year, p.month!, 15).getLunar();
      const monthZhi: string = lunar.getMonthZhiExact();
      const lc = liChunYear(p.year, p.month!, monthZhi);
      const center = monthStar(yearStar(lc), (zhiIndex(monthZhi) - 2 + 12) % 12);
      return readBoard(star, innerStar, center, monthZhi, p, "month");
    }),
  };
};
