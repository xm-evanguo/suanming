import type { WuXing } from "./types";

/** Everyday energy and rest habits by element. Used by the archetype-based plain readings. Lifestyle tips only, not medical advice. */
export const PLAIN_BODY: Record<WuXing, string> = {
  木: "你的精力像春天的植物，需要伸展。每天活动一下肩颈和四肢，周末去户外走走。久坐不动时，你会明显没精神。",
  火: "你的精力来得快，耗得也快。别连续熬夜，晚上留一段不看屏幕的时间，用安静的方式收尾。",
  土: "你的精力偏稳，但容易因为操心而吃不好、睡不好。三餐尽量定时，饭后走一走。",
  金: "你容易把自己绷得很紧。每天做几次深呼吸，工作间隙起来活动，换季时注意保暖和保湿。",
  水: "你的精力有起伏，累了需要真正的休息。睡前少刷手机，睡觉时间尽量固定，注意保暖。",
};

export const PLAIN_BODY_DEFAULT = "精力有高有低很正常。睡眠、饮食、运动三件事先固定一件，从最容易做到的开始。";
