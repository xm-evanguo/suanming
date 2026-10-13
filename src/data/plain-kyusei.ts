import { PLAIN_KYUSEI_YEAR_EN, PLAIN_KYUSEI_THEME_EN } from "./en/kyusei";
import { live } from "../i18n";
/** Plain-language yearly themes for 九星気学, keyed by the palace direction used in `kyusei.ts`. */
const PLAIN_KYUSEI_YEAR_ZH: Record<string, string> = {
  中宫: "今年像站在十字路口，万事处在转折点。适合整理、沉淀、做减法，不适合冲动做大决定。",
  北: "今年偏安静，是蓄力的一年。适合学习、规划、存钱，为下一轮上升打好基础。",
  西南: "今年是耕耘的一年。脚踏实地做事，现在的努力会在明年变成成果。",
  东: "今年是发芽的一年。新想法和新计划会冒出来，大胆试一试，会有回响。",
  东南: "今年人脉和信用最重要。远方的消息、合作和缘分都容易成形，说到做到会加分。",
  西北: "今年责任和位置会上升，适合展现领导力。承担多一点，别忘了留时间给家人。",
  西: "今年是收获和社交的一年，钱和人缘都比较活跃。小心玩得太开心而超支。",
  东北: "今年变化多，工作、住处或心态可能要重新安排。把它当作一次整理，而不是打乱。",
  南: "今年你比较显眼，才华容易被看见，名声上扬。说话要留余地，避免无谓的口舌。",
};

/** One-phrase theme per palace, for the summary. */
const PLAIN_KYUSEI_THEME_ZH: Record<string, string> = {
  中宫: "整理和沉淀",
  北: "蓄力和学习",
  西南: "耕耘",
  东: "发芽和尝试",
  东南: "人脉和信用",
  西北: "责任和领导",
  西: "收获和社交",
  东北: "变化和重整",
  南: "被看见",
};

export const PLAIN_KYUSEI_YEAR = live(PLAIN_KYUSEI_YEAR_ZH, PLAIN_KYUSEI_YEAR_EN);
export const PLAIN_KYUSEI_THEME = live(PLAIN_KYUSEI_THEME_ZH, PLAIN_KYUSEI_THEME_EN);
