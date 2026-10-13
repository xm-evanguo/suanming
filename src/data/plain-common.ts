import { live, t } from "../i18n";
import type { WuXing } from "./types";

/** Everyday energy and rest habits by element. Used by the archetype-based plain readings. Lifestyle tips only, not medical advice. */
const PLAIN_BODY_ZH: Record<WuXing, string> = {
  木: "你的精力像春天的植物，需要伸展。每天活动一下肩颈和四肢，周末去户外走走。久坐不动时，你会明显没精神。",
  火: "你的精力来得快，耗得也快。别连续熬夜，晚上留一段不看屏幕的时间，用安静的方式收尾。",
  土: "你的精力偏稳，但容易因为操心而吃不好、睡不好。三餐尽量定时，饭后走一走。",
  金: "你容易把自己绷得很紧。每天做几次深呼吸，工作间隙起来活动，换季时注意保暖和保湿。",
  水: "你的精力有起伏，累了需要真正的休息。睡前少刷手机，睡觉时间尽量固定，注意保暖。",
};

export const PLAIN_BODY = live(PLAIN_BODY_ZH, {
  木: "Your energy is like a spring plant that needs to stretch. Move your neck, shoulders and limbs every day, and get outdoors at weekends. When you sit still too long, you lose your spark.",
  火: "Your energy comes fast and burns fast. Do not stay up several nights in a row; keep some screen-free time in the evening and wind down quietly.",
  土: "Your energy is steady, but worry can make you eat and sleep badly. Try to keep regular meals and take a walk after eating.",
  金: "You tend to keep yourself wound tight. Take a few deep breaths each day, get up and move between tasks, and keep warm and moisturised when the seasons change.",
  水: "Your energy rises and falls, and when you are tired you need real rest. Scroll less before bed, keep a regular bedtime, and keep warm.",
});

export const plainBodyDefault = () =>
  t("精力有高有低很正常。睡眠、饮食、运动三件事先固定一件，从最容易做到的开始。", "It is normal for energy to rise and fall. Fix one of the three basics first, sleep, food or exercise, starting with the easiest.");
