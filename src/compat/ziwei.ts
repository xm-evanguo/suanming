import { wxRelation, ZHI } from "../core/ganzhi";
import { Acc, REL_PHRASE, bareWord, groupOf, pickText, REL_WORD, type ByGroup, withCareer } from "../data/compat-util";
import type { WuXing } from "../data/types";
import { MAJOR_STARS } from "../data/ziwei";
import { ziwei, type ZiweiPalace } from "../methods/ziwei";
import type { CompatFn, CompatTag, RelationKind } from "./types";
import { capFirst, isEn, listJoin, live, t } from "../i18n";
import { huaName, palaceName as zwPalace, starName } from "../data/en/ziwei-terms";
import { wxName } from "../data/en/terms";

/** The palace of my chart that stands for each kind of person. 仆役 may be named 交友 in other libraries. */
export const RELATION_PALACE: Record<RelationKind, string[]> = {
  partner: ["夫妻"],
  crush: ["夫妻"],
  spouse: ["夫妻"],
  father: ["父母"],
  mother: ["父母"],
  boss: ["父母"],
  child: ["子女"],
  sibling: ["兄弟"],
  friend: ["仆役", "交友"],
  colleague: ["仆役", "交友"],
};

const SOMEONE_ZH: Record<RelationKind, string> = {
  partner: "伴侣",
  crush: "伴侣",
  spouse: "伴侣",
  father: "长辈",
  mother: "长辈",
  boss: "长辈和上司",
  child: "孩子",
  sibling: "同辈亲人",
  friend: "朋友",
  colleague: "同事和伙伴",
};
const SOMEONE = live(SOMEONE_ZH, {
  partner: "partner",
  crush: "partner",
  spouse: "partner",
  father: "elder",
  mother: "elder",
  boss: "elder or boss",
  child: "child",
  sibling: "family member your age",
  friend: "friend",
  colleague: "colleague or partner",
});
/** "官禄" → "Career palace" in English, "官禄宫" in Chinese. */
const pal = (n: string) => (isEn() ? `${zwPalace(n)} palace` : `${n}宫`);
/** Star names for display. */
const stars = (names: string[]) => (isEn() ? listJoin(names.map(starName)) || "none" : names.join("、") || "无");
const HEAD_EN: Record<string, string> = { 同星相映: "Same stars mirror", 对星互补: "Paired stars complement" };

/** 对星: pairs of major stars that sit as partners in the star system. */
const STAR_PAIRS: [string, string][] = [
  ["紫微", "天府"],
  ["太阳", "太阴"],
];

const find = (palaces: ZiweiPalace[], names: string[]) => palaces.find((p) => names.includes(p.name));

/** Major stars of a palace; an empty palace borrows the stars of the opposite palace (same index + 6 branches). */
export function palaceStars(palaces: ZiweiPalace[], p: ZiweiPalace): { names: string[]; borrowed: boolean } {
  if (p.major.length) return { names: p.major.map((s) => s.name), borrowed: false };
  const opp = palaces.find((q) => ZHI.indexOf(q.branch as (typeof ZHI)[number]) === (ZHI.indexOf(p.branch as (typeof ZHI)[number]) + 6) % 12);
  return { names: opp ? opp.major.map((s) => s.name) : [], borrowed: true };
}

const kw = (names: string[], n = 2) =>
  (isEn() ? listJoin([...new Set(names.flatMap((s) => MAJOR_STARS[s]?.keywords ?? []))].slice(0, n)) : [...new Set(names.flatMap((s) => MAJOR_STARS[s]?.keywords ?? []))].slice(0, n).join("、")) ||
  t("平和", "calm");
const elOf = (names: string[]): WuXing | null => {
  const s = names.find((n) => MAJOR_STARS[n]);
  return s ? MAJOR_STARS[s]!.element : null;
};

const MUTAGEN_NAME = { 禄: "化禄", 权: "化权", 科: "化科", 忌: "化忌" } as const;

export const ziweiCompat: CompatFn = (me, other, relation) => {
  const g = groupOf(relation);
  const w = REL_WORD[relation];
  const wb = bareWord(relation);
  const romance = g === "romance";
  const acc = new Acc(relation);
  const mp = ziwei(me).visual.palaces;
  const op = ziwei(other).visual.palaces;

  const relPalace = find(mp, RELATION_PALACE[relation]);
  const oSoul = find(op, ["命宫"]);
  if (!relPalace || !oSoul) return null;
  const mine = palaceStars(mp, relPalace);
  const theirs = palaceStars(op, oSoul);
  const same = mine.names.filter((n) => theirs.names.includes(n));
  const headBits: string[] = [];

  if (!me.input.timeKnown || !other.input.timeKnown) {
    acc.add(
      {
        tone: "mixed",
        weight: 1,
        tags: ["growth"],
        pro: t("紫微斗数依赖出生时辰；至少一方未提供准确时间，按 12:00 排盘，宫位与星曜可能整体偏移。", "Zi Wei Dou Shu depends on the birth hour; at least one of you has no exact time, so the chart is cast for 12:00 and the palaces and stars may all be shifted."),
        plain: t("你们中有人不知道出生时间，所以这一项只能当参考。想看准一点，可以问问家里人，补上准确的出生时辰。", "One of you does not know the birth time, so treat this part as rough. For a closer reading, ask your family and add the exact hour."),
      },
      -4,
    );
  }

  // 1. Relation palace stars against the other person's 命宫.
  if (same.length) {
    headBits.push("同星相映");
    acc.add(
      {
        tone: "good",
        weight: 3,
        tags: ["fate", ...(romance ? (["attraction"] as CompatTag[]) : (["harmony"] as CompatTag[]))],
        dim: romance ? "love" : undefined,
        pro: t(
          `你的${relPalace.name}宫${mine.borrowed ? "（借对宫）" : ""}主星${same.join("、")}，与TA命宫主星相同：你心里对这类人的预期，恰好就是 TA 本人。`,
          `The main stars of your ${pal(relPalace.name)}${mine.borrowed ? " (borrowed from the opposite palace)" : ""}, ${stars(same)}, match the main stars of their Life palace: what you expect of such a person is exactly who they are.`,
        ),
        plain: pickText(
          {
            romance: `TA 的气质，几乎就是你心里“对的人”的样子。第一次聊深一点的话题时，你会有一种“终于遇到了”的感觉。别急着下判断，多相处几次，让感觉落到具体的小事上。`,
            elder: `${w}的性格，正是你心里对长辈的期待。你不用把话讲全，TA 就懂你要什么，向 TA 请教也不太会有压力。`,
            peer: "TA 就是你心里想要的那种伙伴：做事风格、说话方式让你觉得对味。遇到事情第一个想到的人，很可能就是 TA。",
            child: `${w}的性格，和你心里理想的亲子关系很贴近。你们之间有一种天然的信任，多一点陪伴就够了。`,
          },
          relation,
          {
            romance: "Their nature is almost exactly what you picture as \"the right one\". The first time you talk about something deeper, you will feel \"at last\". Do not rush to judge; spend more time together and let the feeling settle into small, concrete things.",
            elder: `${capFirst(w)} has just the character you hope for in an elder. You do not have to spell everything out; they understand what you need, and asking them for advice feels easy.`,
            peer: "They are exactly the kind of partner you want: their way of working and talking feels right to you. When something comes up, they may well be the first person you think of.",
            child: `${capFirst(w)} has a character very close to your ideal of parent and child. There is a natural trust between you; a little more time together is all it takes.`,
          },
        ),
      },
      18,
    );
  } else {
    const pair = STAR_PAIRS.find(([a, b]) => (mine.names.includes(a) && theirs.names.includes(b)) || (mine.names.includes(b) && theirs.names.includes(a)));
    if (pair) {
      headBits.push("对星互补");
      acc.add(
        {
          tone: "good",
          weight: 2,
          tags: ["fate", "harmony"],
          pro: t(`你的${relPalace.name}宫主星与TA命宫主星为对星（${pair.join("—")}），在星系中互为补位。`, `The main star of your ${pal(relPalace.name)} and that of their Life palace are a paired set (${pair.map(starName).join("–")}) that complete each other.`),
          plain: pickText(
            {
              romance: "你们像一对互补的拼图：一个负责拿主意，一个负责体贴照顾。各自站好位置，分工自然就顺了。",
              elder: `${w}的性格正好补上你的另一面：你偏冲，TA 偏稳；你偏想，TA 偏做。多听 TA 的另一种角度。`,
              peer: "你们的特点正好互补，一个擅长开局，一个擅长收尾。合作时按长处分工，效果最好。",
              child: `${w}的个性与你互补，TA 会补上你平时忽略的那部分。多留心 TA 擅长什么。`,
            },
            relation,
            {
              romance: "You are like two matching puzzle pieces: one decides, the other looks after. When each takes their place, the division of roles falls into place.",
              elder: `${capFirst(w)} fills in your other side: you rush, they steady; you think, they do. Listen to their different angle more.`,
              peer: "Your strengths complement each other: one is good at starting, the other at finishing. Split the work by strengths for the best results.",
              child: `${capFirst(w)} complements you and fills in what you usually overlook. Notice what they are good at.`,
            },
          ),
        },
        10,
      );
    }
    const me2 = elOf(mine.names);
    const ot2 = elOf(theirs.names);
    const rel = me2 && ot2 ? wxRelation(me2, ot2) : null;
    const base = t(
      `你的${relPalace.name}宫${mine.borrowed ? "（借对宫）" : ""}主星${mine.names.join("、") || "无"}，TA命宫主星${theirs.names.join("、") || "无"}${rel ? `；星曜五行${me2}与${ot2}，TA ${REL_PHRASE[rel]}` : ""}。`,
      `Main stars of your ${pal(relPalace.name)}${mine.borrowed ? " (borrowed)" : ""}: ${stars(mine.names)}; of their Life palace: ${stars(theirs.names)}${rel ? `; star elements ${wxName(me2!)} and ${wxName(ot2!)}: they ${REL_PHRASE[rel]}` : ""}.`,
    );
    const mk = kw(mine.names);
    const ok = kw(theirs.names);
    const mood = rel === "生我" || rel === "同" || rel === "我生" ? "good" : rel ? "mixed" : "mixed";
    const tags: CompatTag[] = mood === "good" ? ["harmony", "support"] : ["growth", "conflict"];
    acc.add(
      {
        tone: mood,
        weight: 2,
        tags: withCareer(relation, tags),
        pro: base,
        plain: isEn()
          ? `The ${SOMEONE[relation]} you hope for leans toward \"${mk}\". At heart they are closer to \"${ok}\". ` +
            (mood === "good"
              ? "The two are not the same, but they fit together: your differences complement each other rather than pull apart."
              : "The two are not the same, so they may seem a little different from what you imagined. Look at what they actually do before deciding whether to adjust your expectations.")
          : `你心里期待的${SOMEONE[relation]}，偏向「${mk}」这一类。TA 的底色更接近「${ok}」。` +
            (mood === "good"
              ? "两边不完全一样，但能放在一起：你们的差别是互相补充，不是互相拉扯。"
              : "两边不完全一样，所以你可能会觉得 TA 和想象中有些差距。先看 TA 实际做了什么，再决定是否需要调整期待。"),
      },
      mood === "good" ? 6 : 0,
    );
  }

  // 1b. TA's side: TA's own relation palace against my 命宫.
  const oRel = find(op, RELATION_PALACE[relation]);
  const mSoul = find(mp, ["命宫"]);
  if (oRel && mSoul) {
    const ot = palaceStars(op, oRel);
    const ms = palaceStars(mp, mSoul);
    const back = ot.names.filter((n) => ms.names.includes(n));
    if (back.length) {
      acc.add(
        {
          tone: "good",
          weight: 2,
          tags: ["fate", "harmony"],
          pro: t(`TA 的${oRel.name}宫主星${back.join("、")}，与你的命宫主星相同：你也是 TA 心里所期待的那类人。`, `The main stars of their ${pal(oRel.name)}, ${stars(back)}, match the main stars of your Life palace: you are also the kind of person they hope for.`),
          plain: pickText(
            {
              romance: "这份好感是双向的：你身上的气质，也正好是 TA 心里想要的。不必猜 TA 是否在意你，可以更直接地表达。",
              elder: `你的性格，正好是${wb}期待的样子。TA 对你的认可往往比嘴上说的多。`,
              peer: "你也是 TA 心里想要的那种伙伴。有需要时可以直接找 TA，TA 多半乐意。",
              child: `你的性格和${wb}心里期待的相近，TA 会很自然地愿意靠近你。`,
            },
            relation,
            {
              romance: "The attraction runs both ways: your nature is just what they want too. No need to guess whether they care; you can be more direct.",
              elder: `Your character is just what ${wb} hopes for. They think more highly of you than they say.`,
              peer: "You are also the kind of partner they want. When you need something, just ask them; they will usually be glad to help.",
              child: `Your character is close to what ${wb} hopes for, so they naturally want to be near you.`,
            },
          ),
        },
        8,
      );
    } else {
      const e1 = elOf(ot.names);
      const e2 = elOf(ms.names);
      const r2 = e1 && e2 ? wxRelation(e2, e1) : null;
      const ok = r2 === "生我" || r2 === "同" || r2 === "我生";
      acc.add(
        {
          tone: ok ? "good" : "mixed",
          weight: 1,
          tags: ok ? ["harmony"] : ["growth", "conflict"],
          pro: t(
            `TA 的${oRel.name}宫主星${ot.names.join("、") || "无"}，你的命宫主星${ms.names.join("、") || "无"}${r2 ? `；星曜五行${e1}与${e2}，TA ${REL_PHRASE[r2]}` : ""}。`,
            `Main stars of their ${pal(oRel.name)}: ${stars(ot.names)}; of your Life palace: ${stars(ms.names)}${r2 ? `; star elements ${wxName(e1!)} and ${wxName(e2!)}: they ${REL_PHRASE[r2]}` : ""}.`,
          ),
          plain: isEn()
            ? `The ${romance ? "partner" : "person"} they hope for leans toward \"${kw(ot.names)}\", while you come across as closer to \"${kw(ms.names)}\". ${
                ok ? "The two fit together well, and they are usually glad to be close to you." : "There is some distance between the two, so their hopes may not quite match you. Let them see who you really are, not who they expect."
              }`
            : `TA 心里期待的${SOMEONE[relation] === "伴侣" ? "伴侣" : "相处对象"}偏向「${kw(ot.names)}」，你给人的感觉更接近「${kw(ms.names)}」。${
                ok ? "这两种气质放在一起是顺的，TA 通常愿意靠近你。" : "两者有点距离，TA 对你的期待未必完全对得上。多让 TA 看见你实际的样子，而不是期待中的样子。"
              }`,
        },
        ok ? 3 : 0,
      );
    }
  }

  // 1c. Both 命宫 stars: the basic temperaments.
  if (oSoul && mSoul) {
    const ms = palaceStars(mp, mSoul);
    const e1 = elOf(ms.names);
    const e2 = elOf(theirs.names);
    const r3 = e1 && e2 ? wxRelation(e1, e2) : null;
    const ok = r3 === "生我" || r3 === "同" || r3 === "我生";
    acc.add(
      {
        tone: ok ? "good" : "mixed",
        weight: 1,
        tags: ok ? withCareer(relation, ["harmony", "support"]) : ["growth"],
        pro: t(
          `两人命宫主星：你 ${ms.names.join("、") || "无"}，TA ${theirs.names.join("、") || "无"}${r3 ? `；星曜五行${e1}与${e2}，TA ${REL_PHRASE[r3]}` : ""}。`,
          `Life palace main stars: yours ${stars(ms.names)}, theirs ${stars(theirs.names)}${r3 ? `; star elements ${wxName(e1!)} and ${wxName(e2!)}: they ${REL_PHRASE[r3]}` : ""}.`,
        ),
        plain: ok
          ? t(`你们的根本气质是顺的：你偏「${kw(ms.names)}」，TA 偏「${kw(theirs.names)}」，放在一起不会互相消耗。`, `Your basic temperaments fit: you lean \"${kw(ms.names)}\", they lean \"${kw(theirs.names)}\", and together you do not wear each other down.`)
          : t(`你们的根本气质不同：你偏「${kw(ms.names)}」，TA 偏「${kw(theirs.names)}」。节奏不一致时，先问“你需要我怎么做”，而不是直接判断对方不对。`, `Your basic temperaments differ: you lean \"${kw(ms.names)}\", they lean \"${kw(theirs.names)}\". When your rhythms clash, ask \"What do you need from me?\" before deciding they are wrong.`),
      },
      ok ? 4 : -1,
    );
  }

  // 2. My birth-year 四化 in the relation palace.
  const MUT: Record<string, { tone: "good" | "mixed" | "bad"; weight: 1 | 2; tags: CompatTag[]; delta: number; text: ByGroup; en: ByGroup }> = {
    禄: {
      tone: "good",
      weight: 2,
      tags: ["support", "fate"],
      delta: 10,
      text: {
        romance: "TA 是会给你带来好处的人：陪你、帮你、让你的生活更丰富。和 TA 在一起，你更容易觉得日子过得有滋味。",
        elder: `${w}是“给予型”的人，愿意在关键时刻帮你。遇到需要资源或引荐的事，开口问问 TA，成功的可能比你想的大。`,
        peer: "TA 会为你带来机会或好运：一次介绍、一个信息，都可能让你少走一段路。别忘了回馈，缘分才能长久。",
        child: `${w}会给你带来很多快乐，也让你更愿意努力。和 TA 一起过的日子，会成为你最珍惜的部分。`,
      },
      en: {
        romance: "They are someone who brings good things into your life: company, help and a richer daily life. With them, life feels more flavourful.",
        elder: `${capFirst(w)} is a giver, willing to help at key moments. When you need resources or an introduction, ask them; the odds are better than you think.`,
        peer: "They bring you chances or luck: one introduction or one piece of news can save you a long detour. Remember to give back, so the bond lasts.",
        child: `${capFirst(w)} brings you a lot of joy and makes you want to try harder. The days you spend with them will be among those you treasure most.`,
      },
    },
    权: {
      tone: "mixed",
      weight: 2,
      tags: ["growth", "harmony"],
      delta: 2,
      text: {
        romance: "TA 在这段关系里比较有主张，会推着你做决定。你可以学到果断，但也要说出自己的想法，别总是默默跟随。",
        elder: `${w}有明确的主张，常会告诉你“该怎么做”。听 TA 的经验，同时留下自己的判断。`,
        peer: "TA 是个有主见的人，合作时常会成为拿主意的那个。提前讲清谁负责哪块，免得互相抢方向盘。",
        child: `${w}有很强的主见，需要你用引导代替命令。给 TA 选择的机会，往往比直接要求更有效。`,
      },
      en: {
        romance: "They have firm views in this relationship and push you to decide. You can learn decisiveness from them, but say what you think too, rather than always quietly following.",
        elder: `${capFirst(w)} has clear views and often tells you \"how it should be done\". Take their experience and keep your own judgement.`,
        peer: "They know their own mind and often end up making the calls when you work together. Agree early on who owns what, so you do not fight over the wheel.",
        child: `${capFirst(w)} has strong views and needs guidance rather than orders. Giving them choices usually works better than direct demands.`,
      },
    },
    科: {
      tone: "good",
      weight: 1,
      tags: ["harmony", "growth"],
      delta: 5,
      text: {
        romance: "和 TA 在一起，你会显得更有品位、更体面。TA 会在细节上提醒你，让你的形象和口碑越来越好。",
        elder: `${w}会在名声、学习或礼数上给你很多提点。听 TA 说话，常能学到一些书上没有的做人道理。`,
        peer: "TA 带来的是好名声和斯文的氛围，和 TA 一起做事，别人对你们的印象也会变好。",
        child: `${w}在学习和礼貌上通常让你省心。多肯定 TA 的努力，TA 会越做越好。`,
      },
      en: {
        romance: "With them you come across as more refined and dignified. They remind you of the details, and your image and reputation keep improving.",
        elder: `${capFirst(w)} gives you many pointers on reputation, learning and manners. Listening to them, you often learn lessons about life that no book teaches.`,
        peer: "They bring a good name and a civil atmosphere; working with them improves how others see both of you.",
        child: `${capFirst(w)} usually gives you little to worry about in study and manners. Praise their effort more, and they will keep getting better.`,
      },
    },
    忌: {
      tone: "mixed",
      weight: 2,
      tags: ["conflict", "fate", "growth"],
      delta: -8,
      text: {
        romance: "你对 TA 会有较多牵挂，容易想得多、放不下。TA 并不是故意让你烦恼，只是你在这段关系里付出的心思更多。给自己留一点独处和朋友的时间，别把全部重心放在 TA 身上。",
        elder: `你对${wb}有放不下的心结，也可能觉得自己亏欠 TA，或是觉得 TA 不理解你。找一次安静的时间，把话说开，比各自猜测更有用。`,
        peer: "你对 TA 比较在意，付出也容易比对方多。合作中的帐、承诺和分工，写下来更省心。",
        child: `你对${wb}的牵挂比较重，容易操心过度。试着把“担心”换成“我在这里，你需要时找我”。`,
      },
      en: {
        romance: "You worry about them a lot and find it hard to let go. They are not trying to trouble you; you simply put more of yourself into this relationship. Keep some time for yourself and your friends, and do not put all your weight on them.",
        elder: `You have a knot about ${wb} that will not loosen: perhaps you feel you owe them, or that they do not understand you. Find a quiet time to talk it through; it helps more than each of you guessing.`,
        peer: "You care a lot about them and tend to give more than you get. Write down the money, promises and division of work in your partnership; it saves worry.",
        child: `You worry a great deal about ${wb} and can fuss too much. Try turning \"I'm worried\" into \"I'm here when you need me\".`,
      },
    },
  };
  for (const s of relPalace.major) {
    if (!s.mutagen || !MUT[s.mutagen]) continue;
    const m = MUT[s.mutagen]!;
    if (s.mutagen === "禄") headBits.push(huaName(s.name, "禄"));
    acc.add(
      {
        tone: m.tone,
        weight: m.weight,
        tags: withCareer(relation, m.tags),
        dim: romance ? "love" : undefined,
        pro: t(`你的出生年四化：${s.name}${MUTAGEN_NAME[s.mutagen as keyof typeof MUTAGEN_NAME]}入你的${relPalace.name}宫，主 TA 这类人对你的作用。`, `Your birth-year transformation ${huaName(s.name, s.mutagen)} enters your ${pal(relPalace.name)}, showing what people like them do for you.`),
        plain: pickText(m.text, relation, m.en),
      },
      m.delta,
    );
  }

  // 3. My 四化 stars that sit in TA's 命宫 (outside the relation palace).
  const mutStars = mp.flatMap((p) => p.major.filter((s) => s.mutagen && p.name !== relPalace.name).map((s) => ({ star: s.name, mutagen: s.mutagen, palace: p.name })));
  for (const ms of mutStars) {
    if (!theirs.names.includes(ms.star) || !MUT[ms.mutagen]) continue;
    const m = MUT[ms.mutagen]!;
    if (m.tone === "good" || ms.mutagen === "忌") {
      acc.add(
        {
          tone: m.tone,
          weight: 2,
          tags: withCareer(relation, m.tags),
          pro: t(`你的${ms.star}${MUTAGEN_NAME[ms.mutagen as keyof typeof MUTAGEN_NAME]}（入${ms.palace}宫），而 TA 的命宫主星正有${ms.star}：TA 的气质触动了你的四化。`, `Your ${huaName(ms.star, ms.mutagen)} (in your ${pal(ms.palace)}), and ${starName(ms.star)} is a main star of their Life palace: their nature touches your transformation.`),
          plain:
            ms.mutagen === "禄"
              ? t("TA 的性格正好是你命里的“福气来源”那一类。和 TA 同行时，你更容易遇到好机会，也更容易开心。", "Their character is just the kind that brings blessings into your life. Alongside them, good chances and happiness come more easily.")
              : t("TA 的某些特质，会触到你心里比较敏感的地方。遇到不舒服时，先想想“是不是我的老问题被碰到了”，再决定要不要跟 TA 谈。", "Some of their traits touch a sensitive spot in you. When you feel uneasy, first ask yourself whether an old issue of yours has been touched, then decide whether to talk to them."),
        },
        ms.mutagen === "禄" ? 8 : -5,
      );
    }
  }

  // 4. Career help from elders: my 官禄 palace against TA's 命宫.
  if (g === "elder") {
    const career = find(mp, ["官禄"]);
    if (career) {
      const cs = palaceStars(mp, career);
      const hit = cs.names.filter((n) => theirs.names.includes(n));
      if (hit.length) {
        acc.add(
          {
            tone: "good",
            weight: 3,
            tags: ["support", "career", "fate"],
            dim: "career",
            pro: t(`你的官禄宫${cs.borrowed ? "（借对宫）" : ""}主星${hit.join("、")}，与TA命宫主星相同：TA 的特质正对应你的事业路线。`, `The main stars of your Career palace${cs.borrowed ? " (borrowed)" : ""}, ${stars(hit)}, match the main stars of their Life palace: their traits fit your career path.`),
            plain: t(`在事业上，${w}的思路和你要走的路线很接近。TA 的经验、人脉对你更容易“对症”。遇到职业选择，先听 TA 的看法，再对照自己的想法。`, `In your career, ${w} thinks along lines very close to the path you are taking, so their experience and contacts fit your needs well. When facing a career choice, hear their view first, then weigh it against your own.`),
          },
          14,
        );
      } else {
        const ce = elOf(cs.names);
        const te = elOf(theirs.names);
        const r = ce && te ? wxRelation(ce, te) : null;
        const good = r === "生我" || r === "同";
        acc.add(
          {
            tone: good ? "good" : "mixed",
            weight: 2,
            tags: ["support", "career"],
            dim: "career",
            pro: t(
              `你的官禄宫${cs.borrowed ? "（借对宫）" : ""}主星${cs.names.join("、") || "无"}，TA命宫主星${theirs.names.join("、") || "无"}${r ? `；星曜五行${ce}与${te}，TA ${REL_PHRASE[r]}` : ""}。`,
              `Main stars of your Career palace${cs.borrowed ? " (borrowed)" : ""}: ${stars(cs.names)}; of their Life palace: ${stars(theirs.names)}${r ? `; star elements ${wxName(ce!)} and ${wxName(te!)}: they ${REL_PHRASE[r]}` : ""}.`,
            ),
            plain: good
              ? t(`在事业上，${w}的风格能托住你的路线。TA 不一定直接帮你做事，但会在方向上给你信心。`, `In your career, ${w}'s style supports your path. They may not do things for you directly, but they give you confidence in your direction.`)
              : t(`你的事业路线偏「${kw(cs.names)}」，而${wb}更偏「${kw(theirs.names)}」。TA 的建议未必贴着你的行业，更适合拿来参考做人做事的原则，具体业务的问题最好另找内行。`, `Your career path leans \"${kw(cs.names)}\", while ${wb} leans \"${kw(theirs.names)}\". Their advice may not fit your field; use it for principles of conduct, and take specific business questions to an expert.`),
          },
          good ? 7 : 1,
        );
      }
    }
  }

  const headline = headBits.length
    ? headBits.slice(0, 2).map((b) => (isEn() ? (HEAD_EN[b] ?? b) : b)).join(" · ")
    : t(`${relPalace.name}宫与命宫星曜平和相处`, `${pal(relPalace.name)} and Life palace stars sit calmly together`);
  return { methodId: "ziwei", name: t("紫微合盘", "Zi Wei matching"), score: acc.score(), headline, items: acc.list() };
};
