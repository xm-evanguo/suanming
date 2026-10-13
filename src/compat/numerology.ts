import { Acc, bareWord, groupOf, REL_WORD, withCareer, withWord } from "../data/compat-util";
import { baseNumber, HELP_BRINGS, PAIR_SCORE, pairKind, RELATIONSHIP_NUMBER } from "../data/compat-numerology";
import { LIFE_PATH } from "../data/numerology";
import { lifePath, reduce } from "../methods/numerology";
import type { CompatFn, CompatTag } from "./types";
import { capFirst, isEn, listJoin, t } from "../i18n";


const MASTER_TEXT: Record<number, string> = {
  11: "11 号感受力极强，直觉敏锐，容易被情绪气氛影响",
  22: "22 号对自己和身边人期待很高，想做出实实在在的大事",
  33: "33 号把照顾别人当作使命，容易过度付出",
};

export const numerologyCompat: CompatFn = (me, other, relation) => {
  const g = groupOf(relation);
  const w = REL_WORD[relation];
  const wb = bareWord(relation);
  const wd = withWord(relation);
  const romance = g === "romance";
  const acc = new Acc(relation);
  const a = lifePath(me.input.year, me.input.month, me.input.day).value;
  const b = lifePath(other.input.year, other.input.month, other.input.day).value;
  const kind = pairKind(a, b);
  const pa = LIFE_PATH[a]!;
  const pb = LIFE_PATH[b]!;
  const label = (n: number) => `${n}${n !== baseNumber(n) ? t(`（按 ${baseNumber(n)} 合参）`, ` (read as ${baseNumber(n)} for matching)`) : ""}`;
  const base = t(`你的生命灵数 ${label(a)}，TA 的生命灵数 ${label(b)}`, `Your life path number is ${label(a)} and theirs is ${label(b)}`);

  const main: Record<typeof kind, { tone: "good" | "mixed"; weight: 3 | 2; tags: CompatTag[]; pro: string; plain: Record<typeof g, string>; en: Record<typeof g, string> }> = {
    same: {
      tone: "mixed",
      weight: 2,
      tags: ["fate", "harmony"],
      pro: t(`${base}：数字相同，镜像关系。`, `${base}: the same number, a mirror relationship.`),
      plain: {
        romance: "你们是同一类人，一点就通，也容易看见彼此的毛病。当 TA 做了让你烦的事，想一想：我是不是也这样？",
        elder: `${wd}性格路线相同，容易理解对方的想法。小心你们在同一件事上都不肯让步。`,
        peer: "你们走的是同一种人生路线，沟通成本很低，聊起来像在照镜子。重要决定找第三个人看看，补上你们共同的盲点。",
        child: `${w}和你的人生功课很像。你的经验对 TA 最有参考价值，但别要求 TA 重走你的路。`,
      },
      en: {
        romance: "You are the same kind of person: one hint is enough, and you easily see each other's flaws. When they do something that annoys you, ask yourself: do I do this too?",
        elder: `${capFirst(wd)} follow the same path in character, so it is easy to understand each other's thinking. Watch out for neither of you giving way on the same issue.`,
        peer: "You walk the same kind of life path, so talking costs little effort and feels like looking in a mirror. For big decisions, ask a third person to look, to cover the blind spots you share.",
        child: `${capFirst(w)} has life lessons very like yours. Your experience is most useful to them, but do not ask them to walk your road again.`,
      },
    },
    family: {
      tone: "good",
      weight: 3,
      tags: ["harmony", "fate"],
      pro: t(`${base}：同属一个自然族群（1-5-7、2-4-8 或 3-6-9），性格底色相近。`, `${base}: both belong to one natural family (1-5-7, 2-4-8 or 3-6-9), so the basic colour of character is close.`),
      plain: {
        romance: "你们的底色相通：对生活的追求和相处的节奏比较接近。很多事不用解释太多，就能懂对方在意什么。",
        elder: `${wd}对人生的看法有共通处，聊天时容易互相理解，也愿意给对方空间。`,
        peer: "你们是同一类气质的人，目标和做事方式接近。合作起来默契，聊天不累。",
        child: `${wd}的性格底色相通，养育起来相对顺手。TA 会愿意向你敞开心扉。`,
      },
      en: {
        romance: "Your basic colours match: what you want from life and the pace you like to live at are close. Often you do not need to explain much to understand what the other cares about.",
        elder: `${capFirst(wd)} share some views on life, so it is easy to understand each other when you talk, and you are happy to give each other room.`,
        peer: "You are the same kind of person, with similar goals and ways of working. You work together in step, and talking is never tiring.",
        child: `${capFirst(wd)} share a basic nature, so bringing them up is relatively easy. They will be willing to open up to you.`,
      },
    },
    complement: {
      tone: "good",
      weight: 2,
      tags: ["harmony", "support"],
      pro: t(`${base}：跨族群的互补组合。`, `${base}: a complementary pairing across families.`),
      plain: {
        romance: "你们的性格各有长处，凑在一起正好互补：一个擅长开头，一个擅长收尾；一个负责想，一个负责做。",
        elder: `${wd}的长处不一样，但能补上对方缺的那一块。遇到难题，听听 TA 的另一种角度。`,
        peer: "你们的长处互不重复，适合分工：谁擅长什么就负责什么，配合起来很顺。",
        child: `${w}的特点正好补上你容易忽略的一面。观察 TA 擅长什么，对你也是一种学习。`,
      },
      en: {
        romance: "Each of you has strengths, and together they complement each other: one is good at starting and the other at finishing; one does the thinking and the other the doing.",
        elder: `${capFirst(wd)} have different strengths, but each can fill in what the other lacks. When you meet a hard problem, hear their different angle.`,
        peer: "Your strengths do not overlap, so you are well suited to dividing the work: each takes what they are good at, and you fit together smoothly.",
        child: `${capFirst(w)}'s traits fill in a side you tend to overlook. Watching what they are good at is a way of learning for you too.`,
      },
    },
    neutral: {
      tone: "mixed",
      weight: 2,
      tags: ["growth"],
      pro: t(`${base}：无特别的合冲，属中性组合。`, `${base}: no particular match or clash, a neutral pairing.`),
      plain: {
        romance: "你们没有特别强的“天生一对”或“天生不合”，关系质量主要看日常经营。共同的爱好和固定的相处时间会很加分。",
        elder: `${wd}之间不算特别投缘，也没有明显的冲突。多聊聊近况，关系就会越来越暖。`,
        peer: "你们不算天然默契，也不会天然冲突。做事多沟通、多确认，就能合作得很好。",
        child: `${wd}的性格没有明显的对冲，关系好坏主要看相处质量。固定的陪伴时间最有用。`,
      },
      en: {
        romance: "You have no especially strong sense of being \"made for each other\" or \"not meant to be\"; the quality of the relationship depends mostly on day-to-day care. Shared hobbies and fixed time together help a lot.",
        elder: `${capFirst(wd)} are not an especially close match, but there is no clear conflict either. Talk more about how things are going and the relationship will grow warmer.`,
        peer: "You are not a natural fit, and you are not natural opponents either. Talk and check more when you work, and you will cooperate very well.",
        child: `${capFirst(wd)} have no obvious clash of natures, so how the relationship goes depends mainly on the quality of your time together. Regular time spent with them is the most useful thing.`,
      },
    },
    friction: {
      tone: "mixed",
      weight: 2,
      tags: ["conflict", "growth"],
      pro: t(`${base}：关注点容易相左的组合（如自由与稳定、掌控与随性）。`, `${base}: a pairing whose concerns easily diverge (for example freedom and stability, or control and ease).`),
      plain: {
        romance: "你们看重的东西不太一样：一个想自由，另一个想安稳；一个想掌控，另一个想放松。有话说在前面，别用沉默代替沟通，差异会变成互相学习。",
        elder: `${wd}在追求上常有分歧，比如你想尝试、TA 希望稳当。先听 TA 的顾虑，再说你的计划，对方更容易接受。`,
        peer: "你们追求的东西不太一样，合作时容易为节奏吵起来。先商量好目标和边界，再动手。",
        child: `${w}的想法常和你的安排相左。把规矩说清楚，同时留一块 TA 自己做主的空间。`,
      },
      en: {
        romance: "What you value is not quite the same: one of you wants freedom and the other wants security; one wants control and the other wants to relax. Say things up front and do not let silence replace talk, and the differences turn into learning from each other.",
        elder: `${capFirst(wd)} often differ in what you pursue, for example you want to try things and they want stability. Hear their worries first, then explain your plan, and they will accept it more easily.`,
        peer: "What you each go after is different, and you can easily end up arguing over pace when you work together. Agree on the goal and the boundaries first, then get to work.",
        child: `${capFirst(w)}'s ideas often run against your arrangements. Make the rules clear, and leave a space where they decide for themselves.`,
      },
    },
  };
  const m = main[kind];
  acc.add(
    {
      tone: m.tone,
      weight: m.weight,
      tags: withCareer(relation, romance && (kind === "family" || kind === "same") ? [...m.tags, "attraction"] : m.tags),
      dim: romance ? "love" : undefined,
      pro: m.pro,
      plain: (isEn() ? m.en : m.plain)[g],
    },
    PAIR_SCORE[kind] - 50,
  );

  // What TA brings.
  const kws = listJoin(pb.keywords.slice(0, 3));
  acc.add(
    {
      tone: "good",
      weight: 2,
      tags: g === "elder" ? ["growth", "support"] : ["growth"],
      pro: t(`TA 的生命灵数 ${b}：${pb.title}，关键词 ${kws}。`, `Their life path number ${b}: ${pb.title}; keywords ${kws}.`),
      plain:
        g === "elder"
          ? t(
              `你能从${wb}身上学到「${pb.keywords.slice(0, 2).join("、")}」这一类的做法。想一想 TA 做对过的那几次选择，里面有你可以借鉴的方法。`,
              `You can learn from ${wb} a way of doing things that is ${listJoin(pb.keywords.slice(0, 2))}. Think of the times they made the right choice; there are methods in them you can borrow.`,
            )
          : t(
              `TA 的人生底色是「${pb.keywords.slice(0, 2).join("、")}」。你偏向「${pa.keywords.slice(0, 2).join("、")}」，所以你们遇事的第一反应不一样。把差别当成补充。`,
              `Their basic colour is ${listJoin(pb.keywords.slice(0, 2))}. You lean towards ${listJoin(pa.keywords.slice(0, 2))}, so your first reactions to things differ. Treat the difference as a complement.`,
            ),
    },
    0,
  );

  // Help.
  const help = HELP_BRINGS[baseNumber(b)]!;
  const elder = g === "elder";
  acc.add(
    {
      tone: "good",
      weight: elder ? 2 : 1,
      tags: elder ? ["support", "career"] : ["support"],
      dim: elder ? "career" : undefined,
      pro: t(`TA 的生命灵数 ${b} 在互助上的特点：${help.career}。`, `How their life path number ${b} helps: they can ${help.career}.`),
      plain: elder
        ? t(`在事业上，${w}${help.career}。`, `In your career, ${w} can ${help.career}.`)
        : romance
          ? t(`TA 能为你做的事是：${help.general}。你需要这样的支持时，直接告诉 TA。`, `What they can do for you: ${help.general}. When you need that kind of support, tell them straight.`)
          : g === "child"
            ? t(`${w}会${help.general}。`, `${capFirst(w)} can ${help.general}.`)
            : t(`TA 在合作中的作用是${help.general}。分工时把这一块交给 TA，会比你自己撑着更轻松。`, `When you work together, they can ${help.general}. Hand this part to them when you divide the work and it will be lighter than carrying it yourself.`),
    },
    0,
  );

  // Relationship number.
  const rn = reduce(baseNumber(a) + baseNumber(b), false);
  acc.add(
    {
      tone: "good",
      weight: 1,
      tags: ["harmony"],
      pro: t(`两人灵数相加 ${baseNumber(a)}+${baseNumber(b)} 得关系数 ${rn}。`, `Adding the two numbers, ${baseNumber(a)}+${baseNumber(b)}, gives the relationship number ${rn}.`),
      plain: t(`你们在一起，最适合的主题是：${RELATIONSHIP_NUMBER[rn]}。围绕它安排共同的事，关系会更顺。`, `The theme that suits you best together is ${RELATIONSHIP_NUMBER[rn]}. Plan what you do together around it and the relationship will go more smoothly.`),
    },
    0,
  );

  // Master numbers.
  for (const [who, n] of [["你", a], ["TA", b]] as const) {
    if (MASTER_TEXT[n]) {
      acc.add(
        {
          tone: "mixed",
          weight: 1,
          tags: ["growth"],
          pro: t(`${who === "你" ? "你" : "TA"}的生命灵数为大师数 ${n}。`, `${who === "你" ? "Your" : "Their"} life path number is the master number ${n}.`),
          plain:
            who === "你"
              ? t(`你自己带着较高的期待和敏感度。别要求对方跟上你的节奏，让 TA 用自己的方式回应你。`, `You carry high expectations and sensitivity yourself. Do not ask them to keep up with your pace; let them answer you in their own way.`)
              : t(`TA 带着较高的期待和敏感度。多一点耐心和肯定，会让 TA 更放松地靠近你。`, `They carry high expectations and sensitivity. A little more patience and affirmation will help them relax and come closer to you.`),
        },
        0,
      );
    }
  }

  const label2 = (
    isEn()
      ? { same: "mirror numbers", family: "same family", complement: "complementary", friction: "quite different", neutral: "neutral" }
      : { same: "同数镜像", family: "同族共鸣", complement: "互补相成", friction: "差异较大", neutral: "中性平和" }
  )[kind];
  return { methodId: "numerology", name: t("灵数合参", "Numerology matching"), score: acc.score(), headline: `${a} × ${b} · ${label2}`, items: acc.list() };
};
