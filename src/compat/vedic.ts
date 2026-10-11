import { norm360 } from "../core/chart";
import { Acc } from "../data/compat-util";
import {
  FRIENDSHIP,
  GANA_NAME,
  GANA_POINTS,
  LORD_NAME,
  NAK_GANA,
  NAK_YONI,
  nadiOf,
  RASHI_LORD,
  TARA_BAD,
  VARNA_RANK,
  VASHYA_POINTS,
  vashyaGroup,
  YONI_ANIMALS,
  YONI_POINTS,
  NADI_NAME,
} from "../data/compat-vedic";
import { NAKSHATRAS } from "../data/nakshatra";
import { lahiri } from "../methods/vedic";
import type { CompatFn } from "./types";

const NAK_SPAN = 360 / 27;

/** The Moon data one partner contributes. `deg` is the Moon's degree inside its rashi (only Vashya needs it). */
export interface MoonPoint {
  nak: number;
  rashi: number;
  deg?: number;
}

export interface Ashtakoota {
  varna: number;
  vashya: number;
  tara: number;
  yoni: number;
  maitri: number;
  gana: number;
  bhakoot: number;
  nadi: number;
  total: number;
  /** Detail used by the text. */
  detail: { bhakootPair: string; nadiDosha: boolean; bhakootDosha: boolean; taraFromGirl: number; taraFromBoy: number };
}

export function moonPoint(utc: Date, moonLon: number): MoonPoint {
  const sid = norm360(moonLon - lahiri(utc));
  const rashi = Math.floor(sid / 30);
  return { nak: Math.floor(sid / NAK_SPAN), rashi, deg: sid - rashi * 30 };
}

const taraRemainder = (from: number, to: number) => (((to - from + 27) % 27) + 1) % 9 || 9;

function maitriPoints(a: number, b: number): number {
  const la = RASHI_LORD[a]!;
  const lb = RASHI_LORD[b]!;
  if (la === lb) return 5;
  const x = FRIENDSHIP[la]![lb]!;
  const y = FRIENDSHIP[lb]![la]!;
  const key = [x, y].sort().join("");
  // sorted pairs: EE, EF, EN, FF, FN, NN
  return ({ FF: 5, FN: 4, NN: 3, EF: 1, EN: 0.5, EE: 0 } as Record<string, number>)[key] ?? 0;
}

/** Ashtakoota Guna Milan, max 36. `boy` is the groom side, `girl` the bride side. */
export function ashtakoota(boy: MoonPoint, girl: MoonPoint): Ashtakoota {
  const varna = VARNA_RANK[boy.rashi]! >= VARNA_RANK[girl.rashi]! ? 1 : 0;
  const vashya = VASHYA_POINTS[vashyaGroup(boy.rashi, boy.deg ?? 0)]![vashyaGroup(girl.rashi, girl.deg ?? 0)]!;
  const tg = taraRemainder(girl.nak, boy.nak);
  const tb = taraRemainder(boy.nak, girl.nak);
  const taraGood = (r: number) => !TARA_BAD.includes(r);
  const tara = (taraGood(tg) ? 1.5 : 0) + (taraGood(tb) ? 1.5 : 0);
  const yoni = YONI_POINTS[NAK_YONI[boy.nak]!]![NAK_YONI[girl.nak]!]!;
  const maitri = maitriPoints(boy.rashi, girl.rashi);
  const gana = GANA_POINTS[NAK_GANA[boy.nak]!]![NAK_GANA[girl.nak]!]!;
  // Bhakoot: positions of each rashi counted from the other. 2/12, 5/9 and 6/8 are doshas.
  const p = ((girl.rashi - boy.rashi + 12) % 12) + 1;
  const q = ((boy.rashi - girl.rashi + 12) % 12) + 1;
  const pair = [p, q].sort((x, y) => x - y).join("/");
  const bhakootDosha = ["2/12", "5/9", "6/8"].includes(pair);
  const bhakoot = bhakootDosha ? 0 : 7;
  const nadiDosha = nadiOf(boy.nak) === nadiOf(girl.nak);
  const nadi = nadiDosha ? 0 : 8;
  const total = varna + vashya + tara + yoni + maitri + gana + bhakoot + nadi;
  return { varna, vashya, tara, yoni, maitri, gana, bhakoot, nadi, total, detail: { bhakootPair: pair, nadiDosha, bhakootDosha, taraFromGirl: tg, taraFromBoy: tb } };
}

/** Traditional reading of the 36-point total. */
export const gunaBand = (total: number) => (total >= 33 ? "极佳" : total >= 25 ? "良好" : total >= 18 ? "可接受" : "偏低");

export const vedicCompat: CompatFn = (me, other, relation) => {
  if (relation !== "partner" && relation !== "crush" && relation !== "spouse") return null;
  // The tables are directional: boy = male partner, girl = female partner. If the genders are equal, `me` is the first party (boy).
  const sameGender = me.input.gender === other.input.gender;
  const meIsBoy = sameGender || me.input.gender === "male";
  const mp = moonPoint(me.utc, me.planets.moon.lon);
  const op = moonPoint(other.utc, other.planets.moon.lon);
  const boy = meIsBoy ? mp : op;
  const girl = meIsBoy ? op : mp;
  const r = ashtakoota(boy, girl);
  const acc = new Acc();
  const dirNote = sameGender ? "两人性别相同，按“你”为第一方（男方位）计算。" : meIsBoy ? "你为男方位，TA 为女方位。" : "你为女方位，TA 为男方位。";
  const nak = (p: MoonPoint) => NAKSHATRAS[p.nak]!.sanskrit;

  if (!me.input.timeKnown || !other.input.timeKnown) {
    acc.add(
      {
        tone: "mixed",
        weight: 1,
        tags: ["growth"],
        pro: "月亮每天行走约 13°，出生时间未知时按 12:00 计算，月宿与月亮星座可能偏差一格，Guna 得分仅供参考。",
        plain: "你们中有人不知道出生时间，结果可能有一点偏差，所以这个分数只能当大致参考。",
      },
      0,
    );
  }

  const band = gunaBand(r.total);
  acc.add(
    {
      tone: r.total >= 25 ? "good" : r.total >= 18 ? "mixed" : "bad",
      weight: 3,
      tags: ["fate", "harmony"],
      dim: "love",
      pro: `阿斯塔库塔（Ashtakoota）总分 ${r.total}/36（${band}）。你的月宿 ${nak(mp)}，TA 的月宿 ${nak(op)}。${dirNote}传统分档：<18 偏低，18–24 可接受，25–32 良好，≥33 极佳。`,
      plain:
        r.total >= 25
          ? "按印度传统合婚的 8 项打分，你们的整体契合度不错。在情绪节奏、性格和日常习惯上有不少重叠，磨合起来比较省力。"
          : r.total >= 18
            ? "按印度传统合婚的 8 项打分，你们属于“能走得下去，需要一些磨合”的类型。哪几项得分低，就在那几方面多沟通。"
            : "按印度传统合婚的 8 项打分，你们的整体契合度偏低，说明性格和习惯上差异比较明显。这不是否定，而是提醒你们要比别人多花些心思了解对方。",
    },
    (r.total / 36 - 0.5) * 60,
  );

  acc.add(
    {
      tone: r.nadi ? "good" : "bad",
      weight: r.nadi ? 1 : 3,
      tags: r.nadi ? ["harmony"] : ["conflict", "fate"],
      pro: `Nadi（脉）${r.nadi}/8：你为 ${NADI_NAME[nadiOf(boy.nak)]}，TA 为 ${NADI_NAME[nadiOf(girl.nak)]}。${r.nadi ? "脉不同，得满分。" : "两人同脉，称为 Nadi dosha（脉相同的不吉），传统上视为最需留意的一项；若月宿相同但分属不同足（pada），多数流派认为可减轻。"}`,
      plain: r.nadi
        ? "你们的作息和生活节奏有互补的一面，不会总是同时累、同时烦。"
        : "你们的作息和生活节奏太像：一起熬夜，一起懒，一起上火。有意识地错开一些习惯，比如一个早睡、一个晨跑，会让你们更有活力。",
    },
    r.nadi ? 0 : -8,
  );

  acc.add(
    {
      tone: r.bhakoot ? "good" : "bad",
      weight: r.bhakoot ? 1 : 2,
      tags: r.bhakoot ? ["harmony"] : ["conflict"],
      pro: `Bhakoot ${r.bhakoot}/7：两人月亮星座相互位置为 ${r.detail.bhakootPair}。${r.bhakoot ? "不在 2/12、5/9、6/8 之列。" : "落入 Bhakoot dosha（2/12、5/9、6/8 之一）；传统认为月亮星座主星互为友或相同，可减轻。"}`,
      plain: r.bhakoot
        ? "你们在情感表达和对未来的想象上有基本的共鸣，重大选择上不会总是方向相反。"
        : "你们在情感节奏和家庭、金钱观上，容易出现“想法对不上”的时刻。提前聊好未来的大方向，比遇到问题再吵更好。",
    },
    r.bhakoot ? 3 : -5,
  );

  acc.add(
    {
      tone: r.gana >= 5 ? "good" : r.gana >= 1 ? "mixed" : "bad",
      weight: 2,
      tags: r.gana >= 5 ? ["harmony"] : ["conflict", "growth"],
      pro: `Gana（性情）${r.gana}/6：你们的月宿分别属 ${GANA_NAME[NAK_GANA[mp.nak]!]} 与 ${GANA_NAME[NAK_GANA[op.nak]!]}。`,
      plain: r.gana >= 5
        ? "你们对生活的态度接近：什么叫重要、什么叫体面，想法差不多，日常相处很少为价值观起冲突。"
        : "你们的性情底色不一样：一个重感受，一个重效率；一个爱热闹，一个爱安静。接受差异，别指望对方变成另一个你。",
    },
    r.gana >= 5 ? 4 : r.gana >= 1 ? 0 : -5,
  );

  acc.add(
    {
      tone: r.maitri >= 4 ? "good" : r.maitri >= 3 ? "mixed" : "bad",
      weight: 2,
      tags: r.maitri >= 4 ? ["harmony", "support"] : ["conflict"],
      pro: `Graha Maitri（星主友谊）${r.maitri}/5：你们月亮星座的主星为 ${LORD_NAME[RASHI_LORD[mp.rashi]!]} 与 ${LORD_NAME[RASHI_LORD[op.rashi]!]}。`,
      plain: r.maitri >= 4
        ? "你们在想法上互相欣赏，能聊得深、聊得久。遇到烦心事，对方的看法常常会让你觉得“被理解了”。"
        : r.maitri >= 3
          ? "你们的想法既不特别投机，也不水火不容。多聊聊各自的兴趣，找到共同话题。"
          : "你们看待事情的角度差别较大，聊着聊着容易各说各的。试着先复述对方的意思，再说自己的想法。",
    },
    (r.maitri - 2.5) * 2.5,
  );

  acc.add(
    {
      tone: r.yoni >= 3 ? "good" : r.yoni >= 2 ? "mixed" : "bad",
      weight: 2,
      tags: r.yoni >= 3 ? ["attraction", "harmony"] : ["attraction", "conflict"],
      dim: "love",
      pro: `Yoni（本能契合）${r.yoni}/4：你的月宿属 ${YONI_ANIMALS[NAK_YONI[mp.nak]!]}，TA 属 ${YONI_ANIMALS[NAK_YONI[op.nak]!]}。`,
      plain: r.yoni >= 3
        ? "你们在身体和直觉上的默契不错：靠近时觉得舒服，沉默时也不尴尬。"
        : r.yoni >= 2
          ? "你们的亲密节奏大致可以对上，偶尔需要说出来：我喜欢什么，你喜欢什么。"
          : "你们在亲密节奏和直觉上有差异：一个想靠近，另一个想独处。坦率谈谈需求，比各自猜测更好。",
    },
    (r.yoni - 2) * 2,
  );

  const tg = r.detail.taraFromGirl;
  const tb = r.detail.taraFromBoy;
  acc.add(
    {
      tone: r.tara === 3 ? "good" : r.tara === 1.5 ? "mixed" : "bad",
      weight: 1,
      tags: r.tara === 3 ? ["fate", "support"] : ["fate"],
      pro: `Tara（星运）${r.tara}/3：女方月宿到男方的 Tara 余数 ${tg}，男方到女方为 ${tb}（3、5、7 为不吉）。`,
      plain: r.tara === 3
        ? "你们互相带来好运的程度较高：遇到关键决定，两个人合起来的运气会比单独时更好。"
        : r.tara === 1.5
          ? "你们的运势是一边顺、一边稍弱。你们中较顺的一方，可以多主动拉对方一把。"
          : "你们的运势节奏不同步，容易在同一段时间里一个顺、一个不顺。遇到低谷时多互相体谅，别把压力都怪在对方身上。",
    },
    (r.tara - 1.5) * 2,
  );

  const vv = r.varna + r.vashya;
  acc.add(
    {
      tone: vv >= 2.5 ? "good" : vv >= 1 ? "mixed" : "bad",
      weight: 1,
      tags: ["harmony"],
      pro: `Varna ${r.varna}/1 与 Vashya ${r.vashya}/2：自我与相互影响力，共 ${vv}/3。`,
      plain: vv >= 2.5
        ? "你们在相处中谁也不会把谁压下去，互相的影响力比较均衡。"
        : vv >= 1
          ? "你们之间有时一方更有话语权。重要决定轮流让对方定，可以让平衡更稳。"
          : "你们在“谁说了算”这件事上容易互相较劲。提前约定哪些事归谁决定，会省掉很多争论。",
    },
    (vv - 1.5) * 1.5,
  );

  const headline = `吠陀合婚 ${r.total}/36 · ${band}${r.detail.nadiDosha ? " · 同脉" : ""}${r.detail.bhakootDosha ? " · Bhakoot 冲" : ""}`;
  return { methodId: "vedic", name: "吠陀合婚", score: Math.round((r.total / 36) * 100), headline, items: acc.list() };
};
