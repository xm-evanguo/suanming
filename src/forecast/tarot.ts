import { YEAR_CARD_READINGS } from "../data/forecast-tarot";
import { MAJOR_ARCANA } from "../data/tarot";
import { greerCards } from "../methods/tarot";
import { type Forecast, type ForecastFn, forecastPeriods, type PeriodReading } from "./types";

export const tarotForecast: ForecastFn = (chart, now): Forecast => {
  const { month, day } = chart.input;
  const years: PeriodReading[] = forecastPeriods(now).years.map((p) => {
    const sum = month + day + p.year;
    const card = greerCards(sum).personality;
    const c = MAJOR_ARCANA[card]!;
    const r = YEAR_CARD_READINGS[card]!;
    const pro = `${p.year} 年度牌（Greer 法：生日月 ${month} + 日 ${day} + 年 ${p.year} = ${sum}，化约得 ${card}）：${c.name}，正位：${c.upright}`;
    return {
      period: p,
      label: `年度牌 ${card} · ${c.name}`,
      signals: [
        { ...r.main, weight: 2, pro },
        { ...r.second, weight: 1, pro: `${p.year} 年度牌 ${c.name}（${c.keywords.join("、")}）的另一面` },
      ],
    };
  });
  return { years, months: [], note: "塔罗年度牌（Greer 法）只按年计算，没有可靠的月度推算规则，所以不给出每月预测。" };
};
