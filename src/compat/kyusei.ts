import { wxRelation, type WxRelation } from "../core/ganzhi";
import { Acc, bareWord, groupOf, pickText, REL_WORD, type ByGroup, withCareer, withWord } from "../data/compat-util";
import { NINE_STARS } from "../data/kyusei";
import { natalStars } from "../methods/kyusei";
import type { CompatFn, CompatTag } from "./types";
import { capFirst, isEn, t } from "../i18n";
import { wxName } from "../data/en/terms";

const REL_LABEL_ZH: Record<WxRelation, string> = { 同: "比和", 生我: "TA 生你（相生）", 我生: "你生 TA（相生）", 我克: "你克 TA（相克）", 克我: "TA 克你（相克）" };
const REL_LABEL_EN: Record<WxRelation, string> = { 同: "same element", 生我: "theirs feeds yours", 我生: "yours feeds theirs", 我克: "yours controls theirs", 克我: "theirs controls yours" };
const relLabel = (r: WxRelation) => (isEn() ? REL_LABEL_EN : REL_LABEL_ZH)[r];

const MAIN: Record<WxRelation, { tone: "good" | "mixed"; weight: 3 | 2; tags: CompatTag[]; delta: number; text: (w: string, wb: string, wd: string) => ByGroup; en: (w: string, wb: string, wd: string) => ByGroup }> = {
  生我: {
    tone: "good",
    weight: 3,
    tags: ["support", "harmony"],
    delta: 18,
    text: (w, wb, wd) => ({
      romance: "和 TA 在一起，你更容易放松做自己。你累的时候，TA 的一句话、一顿饭就能让你恢复力气。",
      elder: `${w}像你的后盾，在你需要的时候会出力。遇到决定，先听 TA 怎么看，通常能少走弯路。`,
      peer: "TA 是会帮你托底的人：你需要信息、人手或一句鼓励时，TA 往往愿意帮。请别把这份善意当作理所当然。",
      child: `${w}会让你更有精神，陪 TA 的时间也在给你充电。多一起做点简单的事，比如散步，效果最好。`,
    }),
    en: (w) => ({
      romance: "With them, it is easier to relax and be yourself. When you are tired, a word from them or a meal together restores your strength.",
      elder: `${capFirst(w)} is like your backstop and steps in when you need it. When facing a decision, hear their view first; it usually saves you a detour.`,
      peer: "They are someone who has your back: when you need information, a hand or a word of encouragement, they are usually willing. Do not take that kindness for granted.",
      child: `${capFirst(w)} lifts your spirits, and time with them recharges you. Doing simple things together, such as a walk, works best.`,
    }),
  },
  我生: {
    tone: "good",
    weight: 2,
    tags: ["harmony", "growth"],
    delta: 10,
    text: (w, wb, wd) => ({
      romance: "你在这段关系里付出更自然，TA 也乐于接受你的照顾。保持一个平衡：偶尔让 TA 也为你做点什么。",
      elder: `你对${wb}有很多关心，TA 也被你带得更有活力。别忘了让 TA 知道你的需求。`,
      peer: "你习惯在这段关系里多出力，TA 也因为有你而顺。划清哪些事你承担，哪些事 TA 要自己来。",
      child: `你会很自然地照顾${wb}，TA 因此成长得更好。慢慢放手，让 TA 练习自己决定。`,
    }),
    en: (w, wb) => ({
      romance: "Giving comes naturally to you in this relationship, and they are glad to be looked after. Keep a balance: let them do something for you now and then.",
      elder: `You care a lot about ${wb}, and your energy lifts them too. Do not forget to let them know what you need.`,
      peer: "You tend to put in more here, and things go better for them because of you. Draw clear lines between what you take on and what they handle themselves.",
      child: `You naturally look after ${wb}, and they grow better for it. Let go gradually and let them practise deciding for themselves.`,
    }),
  },
  同: {
    tone: "good",
    weight: 2,
    tags: ["harmony", "fate"],
    delta: 12,
    text: (w, wb, wd) => ({
      romance: "你们的气质是同一类，容易懂对方；也因为太像，吵起来像在跟自己吵。给彼此一点不同的体验，会让关系更有新意。",
      elder: `${wd}性格底色相近，彼此很容易理解。遇到分歧，各自让一步就能过去。`,
      peer: "你们是同类人，价值观和节奏相近，合作省力。缺点也是同一种，所以重要事项找人复核。",
      child: `${wd}性格接近，容易互相理解。注意不要把自己的期待放到 TA 身上。`,
    }),
    en: (w, wb, wd) => ({
      romance: "You are the same kind of person, so you understand each other easily; because you are so alike, a fight can feel like arguing with yourself. Try different experiences together to keep the relationship fresh.",
      elder: `${capFirst(wd)} are alike at heart and understand each other easily. When you disagree, each giving a little gets you through.`,
      peer: "You are the same kind of person, with similar values and pace, so working together is easy. Your flaws are the same too, so have someone double-check important things.",
      child: `${capFirst(wd)} have similar natures and understand each other easily. Take care not to load your own hopes onto them.`,
    }),
  },
  我克: {
    tone: "mixed",
    weight: 2,
    tags: ["conflict", "growth"],
    delta: -6,
    text: (w, wb, wd) => ({
      romance: "你在这段关系里更强势，习惯拿主意；TA 有时会因为不想起冲突而不说真话。主动问一句“你怎么想”，听 TA 把话说完。",
      elder: `你在${wb}面前容易说了算。TA 不一定同意，只是不想争。多问问 TA 的真实想法。`,
      peer: "你在这里更像领头人，TA 容易跟着你走，但不一定心服。合作时让 TA 有机会提方案。",
      child: `你对${wb}的影响很强。给 TA 足够的选择权，别让 TA 变成只会听话的孩子。`,
    }),
    en: (w, wb) => ({
      romance: "You are the stronger one here and used to deciding; they sometimes keep the truth to themselves to avoid conflict. Ask \"What do you think?\" and hear them out.",
      elder: `You tend to have the final say with ${wb}. They may not agree; they just do not want to argue. Ask more about what they really think.`,
      peer: "You are more the leader here; they follow easily, but may not be fully convinced. When you work together, give them a chance to propose plans.",
      child: `Your influence on ${wb} is strong. Give them enough choice, so they do not become a child who only obeys.`,
    }),
  },
  克我: {
    tone: "mixed",
    weight: 2,
    tags: ["conflict", "growth", "support"],
    delta: -4,
    text: (w, wb, wd) => ({
      romance: "TA 的存在感比较强，会让你不由自主想表现得更好；有时你也会觉得被压着。想要空间的时候，直接说，别憋着。",
      elder: `${w}对你要求较高，说话也直。当下听着不舒服的话，往往能帮你避免走弯路。`,
      peer: "TA 做事有标准，对你会提要求。合作前把分工和期限说清楚，压力就会变成推动力。",
      child: `${w}会在你没注意时“顶”你一下，其实是在找自己的位置。先听 TA 说完，再讲你的想法。`,
    }),
    en: (w) => ({
      romance: "They have a strong presence that makes you want to do better without thinking; sometimes you also feel weighed down. When you want space, say so directly rather than bottling it up.",
      elder: `${capFirst(w)} expects a lot of you and speaks plainly. Words that sting in the moment often save you a detour.`,
      peer: "They have standards and will make demands of you. Settle who does what and by when before you work together, and the pressure becomes a push forward.",
      child: `${capFirst(w)} pushes back at you now and then without warning; they are really finding their own place. Hear them out before giving your view.`,
    }),
  },
};

export const kyuseiCompat: CompatFn = (me, other, relation) => {
  const g = groupOf(relation);
  const w = REL_WORD[relation];
  const wb = bareWord(relation);
  const wd = withWord(relation);
  const romance = g === "romance";
  const acc = new Acc(relation);
  const a = natalStars(me);
  const b = natalStars(other);
  const na = NINE_STARS[a.star - 1]!;
  const nb = NINE_STARS[b.star - 1]!;
  const ea = na.element!;
  const eb = nb.element!;
  const rel = wxRelation(ea, eb);
  const m = MAIN[rel];

  acc.add(
    {
      tone: m.tone,
      weight: m.weight,
      tags: withCareer(relation, romance && m.tone === "good" ? [...m.tags, "attraction"] : m.tags),
      dim: romance ? "love" : undefined,
      pro: t(`本命星：你${na.name}（${ea}），TA ${nb.name}（${eb}），${relLabel(rel)}。`, `Natal stars: yours ${na.name} (${wxName(ea)}), theirs ${nb.name} (${wxName(eb)}): ${relLabel(rel)}.`),
      plain: pickText(m.text(w, wb, wd), relation, m.en(w, wb, wd)),
    },
    m.delta,
  );

  // 月命星: the inner, emotional side.
  const ma = NINE_STARS[a.month - 1]!;
  const mb = NINE_STARS[b.month - 1]!;
  const mea = ma.element!;
  const meb = mb.element!;
  const mrel = wxRelation(mea, meb);
  const mgood = mrel === "生我" || mrel === "我生" || mrel === "同";
  acc.add(
    {
      tone: mgood ? "good" : "mixed",
      weight: 2,
      tags: mgood ? (mrel === "生我" ? withCareer(relation, ["harmony", "support"]) : ["harmony"]) : ["conflict", "growth"],
      pro: t(`月命星：你${ma.name}（${mea}），TA ${mb.name}（${meb}），${relLabel(mrel)}。月命星主内在性格与情绪。`, `Month stars: yours ${ma.name} (${wxName(mea)}), theirs ${mb.name} (${wxName(meb)}): ${relLabel(mrel)}. The month star shows inner character and feelings.`),
      plain: mgood
        ? pickText(
            {
              romance: "往深一层看，你们的内心节奏也合得上：不开心的时候，对方一个小动作你就明白。",
              elder: `${wd}在内心深处比较相通，哪怕不常说话，也能感觉到对方的状态。`,
              peer: "你们在情绪层面也合拍，吵完架也容易和好。",
              child: `${wd}的内心节奏相近，TA 很容易向你敞开心扉。`,
            },
            relation,
            {
              romance: "Deeper down, your inner rhythms fit too: when one of you is unhappy, the other understands from a small gesture.",
              elder: `${capFirst(wd)} are close at heart; even without talking much, you sense how the other is doing.`,
              peer: "You are in tune emotionally as well, and you make up easily after a quarrel.",
              child: `${capFirst(wd)} have similar inner rhythms, and your child opens up to you easily.`,
            },
          )
        : pickText(
            {
              romance: "表面相处顺利，但内心的反应方式有差异：你在意的小事，TA 可能没注意到。把感受直接说出来，别指望对方猜。",
              elder: `${wd}平时相处可以，但遇到压力时反应方式不同。别在对方情绪激动时讲道理，等平静后再谈。`,
              peer: "平常合作没问题，遇到压力时你们的反应不同，一个想行动，一个想先缓一缓。提前约好各自的节奏。",
              child: `${w}内心的反应方式和你不一样。观察 TA 的小动作，比问“怎么了”更能读懂 TA。`,
            },
            relation,
            {
              romance: "Things go smoothly on the surface, but inside you react differently: small things you care about may pass them by. Say how you feel directly instead of expecting them to guess.",
              elder: `${capFirst(wd)} get along day to day, but react differently under stress. Do not argue the point while the other is upset; talk once things are calm.`,
              peer: "Working together is fine normally, but under stress you react differently: one wants to act, the other wants to pause. Agree on each other's pace in advance.",
              child: `${capFirst(w)} reacts inside differently from you. Watching their small gestures tells you more than asking \"What's wrong?\"`,
            },
          ),
    },
    mgood ? 8 : -2,
  );

  // Cross reading: outer star against the other's inner star.
  const c1 = wxRelation(ea, meb);
  const c2 = wxRelation(eb, mea);
  const crossGood = [c1, c2].filter((r) => r === "生我" || r === "我生" || r === "同").length;
  acc.add(
    {
      tone: crossGood === 2 ? "good" : "mixed",
      weight: 1,
      tags: crossGood >= 1 ? ["harmony"] : ["growth"],
      pro: t(
        `交叉：你的本命星（${ea}）对 TA 的月命星（${meb}）为${relLabel(c1)}；TA 的本命星（${eb}）对你的月命星（${mea}）为${relLabel(c2)}。`,
        `Cross reading: your natal star (${wxName(ea)}) to their month star (${wxName(meb)}): ${relLabel(c1)}; their natal star (${wxName(eb)}) to your month star (${wxName(mea)}): ${relLabel(c2)}.`,
      ),
      plain:
        crossGood === 2
          ? t("你们表面的样子和对方内心的需要都能对上，TA 看到的你，正是 TA 喜欢的样子。", "How each of you comes across matches what the other needs inside: the you they see is just the you they like.")
          : crossGood === 1
            ? t("你们有一半的地方互相合得上：表面和内心不总是同步，但磨合起来不难。", "Half of it fits: the outside and the inside are not always in step, but adjusting is not hard.")
            : t("你们给对方的第一印象和对方内心的期待不太一致，所以容易误会。多看看对方真实的反应，少凭印象下判断。", "The first impression each of you gives does not quite match what the other hopes for inside, so misunderstandings come easily. Watch how the other really reacts, and judge less by impressions."),
    },
    crossGood === 2 ? 5 : crossGood === 1 ? 1 : -2,
  );

  // 五黄土星: a strong presence.
  if (a.star === 5 || b.star === 5) {
    const you = a.star === 5;
    acc.add(
      {
        tone: "mixed",
        weight: 1,
        tags: ["growth"],
        pro: t(`${you ? "你" : "TA"}的本命星为五黄土星：位居中宫，存在感强，一动则牵动全局。`, `${you ? "Your" : "Their"} natal star is 5 Yellow Earth: it sits at the centre with a strong presence, and its every move affects the whole.`),
        plain: you
          ? t("你的气场比较强，身边的人常会不自觉围着你转。多问问对方的想法，能让 TA 更自在。", "Your presence is strong, and people often end up revolving around you without noticing. Asking for their views more puts them at ease.")
          : t("TA 的气场很强，有时候会在你不知不觉中主导气氛。想要平等，就在小事上先表达你的偏好。", "Their presence is strong and can set the mood before you notice. If you want things equal, state your preferences on small things first."),
      },
      0,
    );
  }

  const headline = `${na.name} × ${nb.name} · ${rel === "同" ? t("比和", "same element") : rel === "生我" || rel === "我生" ? t("相生", "feeding") : t("相克", "controlling")}`;
  return { methodId: "kyusei", name: t("九星相性", "Nine Star matching"), score: acc.score(), headline, items: acc.list() };
};
