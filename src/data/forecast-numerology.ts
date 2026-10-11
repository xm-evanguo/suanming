/** Plain-language readings of the numerology personal year and personal month (1-9). */
import type { Tone } from "../forecast/types";
import type { Dim } from "./types";

export interface NumReading {
  dim: Dim;
  tone: Tone;
  /** Alternative wordings; one is picked per period. */
  plain: string[];
}

/** Personal year 1-9. Index = number. Each number has a main reading and two more. */
export const PERSONAL_YEAR_READINGS: Record<number, NumReading[]> = {
  1: [
    { dim: "career", tone: "good", plain: ["新的九年循环从这一年开始，适合开新项目、换赛道、主动提出自己的想法。想做的事，今年就开个头。"] },
    { dim: "love", tone: "mixed", plain: ["感情上适合主动一点：单身的人敢于表达，有伴侣的人可以一起定一个新目标。"] },
    { dim: "health", tone: "good", plain: ["精力充沛，适合开始一个新的运动或作息计划，从小目标做起。"] },
  ],
  2: [
    { dim: "love", tone: "good", plain: ["这一年重在合作和关系：和伴侣、搭档、同事的默契变得重要。多倾听，少抢话，进展会比你想的顺。"] },
    { dim: "career", tone: "mixed", plain: ["事业上适合慢慢养成果，别急着出结果，把每一步做稳、把关系维护好。"] },
    { dim: "health", tone: "mixed", plain: ["情绪比较敏感，睡眠和压力要多留意，每天留一点安静时间。"] },
  ],
  3: [
    { dim: "wisdom", tone: "good", plain: ["表达和创意的一年，适合写作、做内容、展示作品。想到的点子，写下来或讲出来，会有人喜欢。"] },
    { dim: "love", tone: "good", plain: ["社交活跃，容易认识新朋友，单身的人缘分也不错，多参加聚会和兴趣活动。"] },
    { dim: "wealth", tone: "mixed", plain: ["花在娱乐和社交上的钱会变多，给自己定一个月度上限。"] },
  ],
  4: [
    { dim: "career", tone: "good", plain: ["打地基的一年：把流程、技能、计划做扎实。踏实的积累今年看起来慢，却是后面几年的根基。"] },
    { dim: "wealth", tone: "good", plain: ["适合整理账务、做预算、存下第一笔应急的钱。稳扎稳打比追求快钱更有效。"] },
    { dim: "health", tone: "mixed", plain: ["工作量偏大，注意腰背和久坐，定时起身活动。"] },
  ],
  5: [
    { dim: "career", tone: "mixed", plain: ["变化最多的一年：换环境、换节奏、认识新的人。保持弹性，机会来时能快速反应。"] },
    { dim: "love", tone: "mixed", plain: ["感情里容易有新鲜感和变动，看清是一时的兴奋还是长久的需要，再做决定。"] },
    { dim: "wisdom", tone: "good", plain: ["适合旅行、尝试新事物、学习新技能，开阔视野比守着舒适圈更有收获。"] },
  ],
  6: [
    { dim: "love", tone: "good", plain: ["家庭和亲密关系是重点：家里的事、伴侣、孩子、父母都需要你多一点时间。这些投入会让你更安心。"] },
    { dim: "health", tone: "good", plain: ["适合把生活环境整理得舒服，规律吃饭、好好休息，照顾别人也别忘了照顾自己。"] },
    { dim: "career", tone: "mixed", plain: ["责任变多，别把别人的事全揽在身上，学会说“这件我帮不了”。"] },
  ],
  7: [
    { dim: "wisdom", tone: "good", plain: ["内省和学习的一年：适合读书、研究、考证，也适合独处整理人生方向。少些应酬，多些沉淀。"] },
    { dim: "career", tone: "mixed", plain: ["事业上不宜硬冲，把重心放在提高专业深度上，成果在后面两年体现。"] },
    { dim: "health", tone: "mixed", plain: ["需要更多休息和安静的时间，多亲近自然，睡眠要保证。"] },
  ],
  8: [
    { dim: "career", tone: "good", plain: ["成果和权力的一年：前几年的付出开始变现，适合争取晋升、加薪、扩大业务。带着明确的目标去谈。"] },
    { dim: "wealth", tone: "good", plain: ["财务是重点，收入有机会明显增加，同时开销也容易变大，做好规划，收获才能留得住。"] },
    { dim: "love", tone: "mixed", plain: ["忙于事业时别冷落身边人，约好的陪伴时间要守住。"] },
  ],
  9: [
    { dim: "wisdom", tone: "mixed", plain: ["收尾和放下的一年：整理过去九年，结束不再适合的关系、工作或习惯，为下一轮新的开始腾出空间。"] },
    { dim: "love", tone: "mixed", plain: ["感情上适合谅解与告别并存，对该放下的人好好说再见，对重要的人表达感谢。"] },
    { dim: "wealth", tone: "mixed", plain: ["不适合开启大的新投入，把手头的事做完、清掉旧债，轻装迎接下一年。"] },
  ],
};

/** Personal month 1-9, two wordings each so repeated numbers in a year do not read the same. */
export const PERSONAL_MONTH_READINGS: Record<number, NumReading[]> = {
  1: [
    { dim: "career", tone: "good", plain: ["这个月适合开头：提出一个新想法、启动一项计划、报名一门课。想做的事，先迈出第一步。", "这个月主动出击会有回应，想争取的机会、想联系的人，直接开口。"] },
    { dim: "health", tone: "good", plain: ["精神状态不错，可以给自己定一个新的小习惯，比如早起散步十分钟。", "身体比较有劲，适合重新开始运动。"] },
  ],
  2: [
    { dim: "love", tone: "good", plain: ["这个月适合合作和倾听，和伴侣、同事把话说开，关系更顺。", "这个月重在配合，别人需要你的支持，你也可以向别人求助。"] },
    { dim: "career", tone: "mixed", plain: ["事情推进偏慢，需要耐心等对方回复，别催得太紧。", "适合处理细节和文书，不适合大刀阔斧。"] },
  ],
  3: [
    { dim: "wisdom", tone: "good", plain: ["表达欲旺盛，适合写点东西、做分享、发一条自己满意的内容。", "灵感比较多，随手记下来，之后挑一两个去做。"] },
    { dim: "love", tone: "good", plain: ["社交活跃，和朋友聚一聚，会带来好心情和新的人脉。", "笑容和幽默让你很受欢迎，单身的人多出门走动。"] },
  ],
  4: [
    { dim: "career", tone: "good", plain: ["适合做基础工作：整理资料、建立流程、把拖着的任务清掉。", "踏实做事的一个月，手头积压的事这时候最容易推进。"] },
    { dim: "wealth", tone: "mixed", plain: ["适合做预算和对账，不适合大额新开销。", "把固定开销理一遍，攒钱更有方向。"] },
  ],
  5: [
    { dim: "career", tone: "mixed", plain: ["变化多，计划容易临时调整。行程和安排都留点弹性。", "新消息、新邀约变多，别全接，挑最有意思的两个。"] },
    { dim: "love", tone: "mixed", plain: ["新鲜感比较强，容易被新的人和事吸引，决定前多想一天。", "想出去走走的心很强，约上朋友来一次短途出行。"] },
  ],
  6: [
    { dim: "love", tone: "good", plain: ["家人和亲近的人需要你，安排一次聚餐或陪伴，会很有收获。", "这个月重情谊，帮朋友一个小忙，也别忘了向自己表示关心。"] },
    { dim: "health", tone: "good", plain: ["适合布置住处、做一顿好吃的、让生活更舒服。", "把家里整理出一个让自己放松的角落。"] },
  ],
  7: [
    { dim: "wisdom", tone: "good", plain: ["适合独处、读书、思考，在安静中找到答案。", "少应酬，多留一点属于自己的时间，灵感会在这时出现。"] },
    { dim: "health", tone: "mixed", plain: ["需要更多休息，早点睡，别把日程塞满。", "多亲近自然，散步一小时，头脑会更清楚。"] },
  ],
  8: [
    { dim: "career", tone: "good", plain: ["适合谈判和争取：想谈的报酬、职位或合作，准备好数据，这个月开口。", "做事有魄力，成果容易被看到，可以主动汇报成绩。"] },
    { dim: "wealth", tone: "good", plain: ["金钱方面比较活跃，适合认真安排收支，把钱用在刀刃上。", "账目和收入是重点，月底把本月的账对一次。"] },
  ],
  9: [
    { dim: "wisdom", tone: "mixed", plain: ["适合收尾：把拖着的事做完，清理不用的物品和旧联系人。", "这个月放下一个旧包袱，会觉得轻松很多。"] },
    { dim: "love", tone: "mixed", plain: ["情绪里有告别和感谢，对重要的人表达心意，也原谅一件旧事。", "适合和人和解，把心里的结解开。"] },
  ],
};
