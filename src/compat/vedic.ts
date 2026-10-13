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
import { t } from "../i18n";

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
export const gunaBand = (total: number) =>
  total >= 33 ? t("极佳", "excellent") : total >= 25 ? t("良好", "good") : total >= 18 ? t("可接受", "acceptable") : t("偏低", "low");

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
  const dirNote = sameGender
    ? t("两人性别相同，按“你”为第一方（男方位）计算。", "You are the same gender, so you are counted as the first party (the groom's side).")
    : meIsBoy
      ? t("你为男方位，TA 为女方位。", "You are on the groom's side and they are on the bride's side.")
      : t("你为女方位，TA 为男方位。", "You are on the bride's side and they are on the groom's side.");
  const nak = (p: MoonPoint) => NAKSHATRAS[p.nak]!.sanskrit;

  if (!me.input.timeKnown || !other.input.timeKnown) {
    acc.add(
      {
        tone: "mixed",
        weight: 1,
        tags: ["growth"],
        pro: t("月亮每天行走约 13°，出生时间未知时按 12:00 计算，月宿与月亮星座可能偏差一格，Guna 得分仅供参考。", "The Moon moves about 13° a day. With an unknown birth time, noon is used, so the nakshatra and Moon sign may be one step off and the Guna score is only a rough guide."),
        plain: t("你们中有人不知道出生时间，结果可能有一点偏差，所以这个分数只能当大致参考。", "One of you does not know the birth time, so the result may be slightly off. Treat this score as a rough guide."),
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
      pro: t(
        `阿斯塔库塔（Ashtakoota）总分 ${r.total}/36（${band}）。你的月宿 ${nak(mp)}，TA 的月宿 ${nak(op)}。${dirNote}传统分档：<18 偏低，18–24 可接受，25–32 良好，≥33 极佳。`,
        `Ashtakoota total ${r.total}/36 (${band}). Your nakshatra is ${nak(mp)} and theirs is ${nak(op)}. ${dirNote} Traditional bands: under 18 low, 18–24 acceptable, 25–32 good, 33 and above excellent.`,
      ),
      plain:
        r.total >= 25
          ? t("按印度传统合婚的 8 项打分，你们的整体契合度不错。在情绪节奏、性格和日常习惯上有不少重叠，磨合起来比较省力。", "By the eight-part scoring of traditional Indian matching, you fit well overall. You overlap a lot in emotional rhythm, character and daily habits, so settling in together takes less effort.")
          : r.total >= 18
            ? t("按印度传统合婚的 8 项打分，你们属于“能走得下去，需要一些磨合”的类型。哪几项得分低，就在那几方面多沟通。", "By the eight-part scoring of traditional Indian matching, you are the \"it can work, with some adjusting\" kind. Wherever a part scores low, talk more about that.")
            : t("按印度传统合婚的 8 项打分，你们的整体契合度偏低，说明性格和习惯上差异比较明显。这不是否定，而是提醒你们要比别人多花些心思了解对方。", "By the eight-part scoring of traditional Indian matching, your overall fit is low, which means your characters and habits differ quite a lot. That is no verdict against you, only a reminder to put more thought than most into understanding each other."),
    },
    (r.total / 36 - 0.5) * 60,
  );

  acc.add(
    {
      tone: r.nadi ? "good" : "bad",
      weight: r.nadi ? 1 : 3,
      tags: r.nadi ? ["harmony"] : ["conflict", "fate"],
      pro: t(
        `Nadi（脉）${r.nadi}/8：你为 ${NADI_NAME[nadiOf(boy.nak)]}，TA 为 ${NADI_NAME[nadiOf(girl.nak)]}。${r.nadi ? "脉不同，得满分。" : "两人同脉，称为 Nadi dosha（脉相同的不吉），传统上视为最需留意的一项；若月宿相同但分属不同足（pada），多数流派认为可减轻。"}`,
        `Nadi ${r.nadi}/8: you are ${NADI_NAME[nadiOf(boy.nak)]} and they are ${NADI_NAME[nadiOf(girl.nak)]}. ${r.nadi ? "The nadis differ, so it scores in full." : "You share the same nadi, called Nadi dosha. Tradition treats it as the point needing most care; most schools say it is eased if the nakshatra is the same but the padas differ."}`,
      ),
      plain: r.nadi
        ? t("你们的作息和生活节奏有互补的一面，不会总是同时累、同时烦。", "Your routines and the rhythm of your lives complement each other, so you will not always be tired or irritated at the same time.")
        : t("你们的作息和生活节奏太像：一起熬夜，一起懒，一起上火。有意识地错开一些习惯，比如一个早睡、一个晨跑，会让你们更有活力。", "Your routines and rhythms are too alike: you stay up late together, laze together and run hot together. Deliberately offsetting some habits, for example one of you sleeping early and the other jogging in the morning, will give you more energy."),
    },
    r.nadi ? 0 : -8,
  );

  acc.add(
    {
      tone: r.bhakoot ? "good" : "bad",
      weight: r.bhakoot ? 1 : 2,
      tags: r.bhakoot ? ["harmony"] : ["conflict"],
      pro: t(
        `Bhakoot ${r.bhakoot}/7：两人月亮星座相互位置为 ${r.detail.bhakootPair}。${r.bhakoot ? "不在 2/12、5/9、6/8 之列。" : "落入 Bhakoot dosha（2/12、5/9、6/8 之一）；传统认为月亮星座主星互为友或相同，可减轻。"}`,
        `Bhakoot ${r.bhakoot}/7: your Moon signs stand ${r.detail.bhakootPair} from each other. ${r.bhakoot ? "This is not one of 2/12, 5/9 or 6/8." : "This falls into Bhakoot dosha (one of 2/12, 5/9, 6/8); tradition holds it is eased if the lords of the two Moon signs are friends or the same planet."}`,
      ),
      plain: r.bhakoot
        ? t("你们在情感表达和对未来的想象上有基本的共鸣，重大选择上不会总是方向相反。", "You share a basic resonance in how you express feeling and how you picture the future, so on big choices you will not always pull in opposite directions.")
        : t("你们在情感节奏和家庭、金钱观上，容易出现“想法对不上”的时刻。提前聊好未来的大方向，比遇到问题再吵更好。", "On emotional rhythm, family and attitudes to money, you may often have moments of \"we are not on the same page\". Agreeing the big direction of the future beforehand is better than arguing once a problem comes."),
    },
    r.bhakoot ? 3 : -5,
  );

  acc.add(
    {
      tone: r.gana >= 5 ? "good" : r.gana >= 1 ? "mixed" : "bad",
      weight: 2,
      tags: r.gana >= 5 ? ["harmony"] : ["conflict", "growth"],
      pro: t(`Gana（性情）${r.gana}/6：你们的月宿分别属 ${GANA_NAME[NAK_GANA[mp.nak]!]} 与 ${GANA_NAME[NAK_GANA[op.nak]!]}。`, `Gana (temperament) ${r.gana}/6: your nakshatras belong to ${GANA_NAME[NAK_GANA[mp.nak]!]} and ${GANA_NAME[NAK_GANA[op.nak]!]} respectively.`),
      plain: r.gana >= 5
        ? t("你们对生活的态度接近：什么叫重要、什么叫体面，想法差不多，日常相处很少为价值观起冲突。", "Your attitudes to life are close: you think much the same about what matters and what is decent, so you seldom clash over values in daily life.")
        : t("你们的性情底色不一样：一个重感受，一个重效率；一个爱热闹，一个爱安静。接受差异，别指望对方变成另一个你。", "Your basic temperaments differ: one of you values feeling and the other efficiency; one likes company and the other quiet. Accept the difference and do not expect the other to become another you."),
    },
    r.gana >= 5 ? 4 : r.gana >= 1 ? 0 : -5,
  );

  acc.add(
    {
      tone: r.maitri >= 4 ? "good" : r.maitri >= 3 ? "mixed" : "bad",
      weight: 2,
      tags: r.maitri >= 4 ? ["harmony", "support"] : ["conflict"],
      pro: t(`Graha Maitri（星主友谊）${r.maitri}/5：你们月亮星座的主星为 ${LORD_NAME[RASHI_LORD[mp.rashi]!]} 与 ${LORD_NAME[RASHI_LORD[op.rashi]!]}。`, `Graha Maitri (friendship of the lords) ${r.maitri}/5: the lords of your Moon signs are ${LORD_NAME[RASHI_LORD[mp.rashi]!]} and ${LORD_NAME[RASHI_LORD[op.rashi]!]}.`),
      plain: r.maitri >= 4
        ? t("你们在想法上互相欣赏，能聊得深、聊得久。遇到烦心事，对方的看法常常会让你觉得“被理解了”。", "You appreciate each other's thinking and can talk deeply and for a long time. When something troubles you, their view often makes you feel \"understood\".")
        : r.maitri >= 3
          ? t("你们的想法既不特别投机，也不水火不容。多聊聊各自的兴趣，找到共同话题。", "Your thinking is neither especially in tune nor at odds. Talk more about your own interests and find common ground.")
          : t("你们看待事情的角度差别较大，聊着聊着容易各说各的。试着先复述对方的意思，再说自己的想法。", "You look at things from quite different angles, and a talk can easily turn into each speaking past the other. Try restating what they meant first, then give your own view."),
    },
    (r.maitri - 2.5) * 2.5,
  );

  acc.add(
    {
      tone: r.yoni >= 3 ? "good" : r.yoni >= 2 ? "mixed" : "bad",
      weight: 2,
      tags: r.yoni >= 3 ? ["attraction", "harmony"] : ["attraction", "conflict"],
      dim: "love",
      pro: t(`Yoni（本能契合）${r.yoni}/4：你的月宿属 ${YONI_ANIMALS[NAK_YONI[mp.nak]!]}，TA 属 ${YONI_ANIMALS[NAK_YONI[op.nak]!]}。`, `Yoni (instinctive fit) ${r.yoni}/4: your nakshatra is a ${YONI_ANIMALS[NAK_YONI[mp.nak]!]} and theirs is a ${YONI_ANIMALS[NAK_YONI[op.nak]!]}.`),
      plain: r.yoni >= 3
        ? t("你们在身体和直觉上的默契不错：靠近时觉得舒服，沉默时也不尴尬。", "You are well in tune physically and by instinct: being close feels comfortable, and silence is not awkward.")
        : r.yoni >= 2
          ? t("你们的亲密节奏大致可以对上，偶尔需要说出来：我喜欢什么，你喜欢什么。", "Your rhythm of closeness mostly matches, though now and then you need to say it out loud: what I like, what you like.")
          : t("你们在亲密节奏和直觉上有差异：一个想靠近，另一个想独处。坦率谈谈需求，比各自猜测更好。", "You differ in the rhythm of closeness and in instinct: one wants to be near and the other wants to be alone. Talking frankly about your needs is better than each guessing."),
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
      pro: t(`Tara（星运）${r.tara}/3：女方月宿到男方的 Tara 余数 ${tg}，男方到女方为 ${tb}（3、5、7 为不吉）。`, `Tara (star luck) ${r.tara}/3: the Tara remainder from the bride's nakshatra to the groom's is ${tg}, and from the groom's to the bride's is ${tb} (3, 5 and 7 are unfavourable).`),
      plain: r.tara === 3
        ? t("你们互相带来好运的程度较高：遇到关键决定，两个人合起来的运气会比单独时更好。", "You bring each other a good deal of luck: at a key decision, your luck together is better than either alone.")
        : r.tara === 1.5
          ? t("你们的运势是一边顺、一边稍弱。你们中较顺的一方，可以多主动拉对方一把。", "Your fortunes run smooth on one side and a little weaker on the other. Whichever of you is doing better can take the lead in giving the other a hand.")
          : t("你们的运势节奏不同步，容易在同一段时间里一个顺、一个不顺。遇到低谷时多互相体谅，别把压力都怪在对方身上。", "Your fortunes are out of step, so in the same stretch one of you may be doing well and the other not. In a low period, be considerate of each other and do not blame the pressure on the other person."),
    },
    (r.tara - 1.5) * 2,
  );

  const vv = r.varna + r.vashya;
  acc.add(
    {
      tone: vv >= 2.5 ? "good" : vv >= 1 ? "mixed" : "bad",
      weight: 1,
      tags: ["harmony"],
      pro: t(`Varna ${r.varna}/1 与 Vashya ${r.vashya}/2：自我与相互影响力，共 ${vv}/3。`, `Varna ${r.varna}/1 and Vashya ${r.vashya}/2: self-regard and mutual influence, ${vv}/3 together.`),
      plain: vv >= 2.5
        ? t("你们在相处中谁也不会把谁压下去，互相的影响力比较均衡。", "Neither of you tends to press the other down, and your influence on each other is fairly balanced.")
        : vv >= 1
          ? t("你们之间有时一方更有话语权。重要决定轮流让对方定，可以让平衡更稳。", "Sometimes one of you has more of a say. Letting each other decide the important matters in turn keeps the balance steadier.")
          : t("你们在“谁说了算”这件事上容易互相较劲。提前约定哪些事归谁决定，会省掉很多争论。", "You may easily lock horns over who has the final say. Agreeing beforehand who decides what will save a lot of arguing."),
    },
    (vv - 1.5) * 1.5,
  );

  const headline = t(
    `吠陀合婚 ${r.total}/36 · ${band}${r.detail.nadiDosha ? " · 同脉" : ""}${r.detail.bhakootDosha ? " · Bhakoot 冲" : ""}`,
    `Vedic matching ${r.total}/36 · ${band}${r.detail.nadiDosha ? " · same nadi" : ""}${r.detail.bhakootDosha ? " · Bhakoot dosha" : ""}`,
  );
  return { methodId: "vedic", name: t("吠陀合婚", "Vedic matching"), score: Math.round((r.total / 36) * 100), headline, items: acc.list() };
};
