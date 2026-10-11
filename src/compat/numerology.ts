import { Acc, bareWord, groupOf, REL_WORD, withCareer, withWord } from "../data/compat-util";
import { baseNumber, HELP_BRINGS, PAIR_SCORE, pairKind, RELATIONSHIP_NUMBER } from "../data/compat-numerology";
import { LIFE_PATH } from "../data/numerology";
import { lifePath, reduce } from "../methods/numerology";
import type { CompatFn, CompatTag } from "./types";

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
  const label = (n: number) => `${n}${n !== baseNumber(n) ? `（按 ${baseNumber(n)} 合参）` : ""}`;
  const base = `你的生命灵数 ${label(a)}，TA 的生命灵数 ${label(b)}`;

  const main: Record<typeof kind, { tone: "good" | "mixed"; weight: 3 | 2; tags: CompatTag[]; pro: string; plain: Record<typeof g, string> }> = {
    same: {
      tone: "mixed",
      weight: 2,
      tags: ["fate", "harmony"],
      pro: `${base}：数字相同，镜像关系。`,
      plain: {
        romance: "你们是同一类人，一点就通，也容易看见彼此的毛病。当 TA 做了让你烦的事，想一想：我是不是也这样？",
        elder: `${wd}性格路线相同，容易理解对方的想法。小心你们在同一件事上都不肯让步。`,
        peer: "你们走的是同一种人生路线，沟通成本很低，聊起来像在照镜子。重要决定找第三个人看看，补上你们共同的盲点。",
        child: `${w}和你的人生功课很像。你的经验对 TA 最有参考价值，但别要求 TA 重走你的路。`,
      },
    },
    family: {
      tone: "good",
      weight: 3,
      tags: ["harmony", "fate"],
      pro: `${base}：同属一个自然族群（1-5-7、2-4-8 或 3-6-9），性格底色相近。`,
      plain: {
        romance: "你们的底色相通：对生活的追求和相处的节奏比较接近。很多事不用解释太多，就能懂对方在意什么。",
        elder: `${wd}对人生的看法有共通处，聊天时容易互相理解，也愿意给对方空间。`,
        peer: "你们是同一类气质的人，目标和做事方式接近。合作起来默契，聊天不累。",
        child: `${wd}的性格底色相通，养育起来相对顺手。TA 会愿意向你敞开心扉。`,
      },
    },
    complement: {
      tone: "good",
      weight: 2,
      tags: ["harmony", "support"],
      pro: `${base}：跨族群的互补组合。`,
      plain: {
        romance: "你们的性格各有长处，凑在一起正好互补：一个擅长开头，一个擅长收尾；一个负责想，一个负责做。",
        elder: `${wd}的长处不一样，但能补上对方缺的那一块。遇到难题，听听 TA 的另一种角度。`,
        peer: "你们的长处互不重复，适合分工：谁擅长什么就负责什么，配合起来很顺。",
        child: `${w}的特点正好补上你容易忽略的一面。观察 TA 擅长什么，对你也是一种学习。`,
      },
    },
    neutral: {
      tone: "mixed",
      weight: 2,
      tags: ["growth"],
      pro: `${base}：无特别的合冲，属中性组合。`,
      plain: {
        romance: "你们没有特别强的“天生一对”或“天生不合”，关系质量主要看日常经营。共同的爱好和固定的相处时间会很加分。",
        elder: `${wd}之间不算特别投缘，也没有明显的冲突。多聊聊近况，关系就会越来越暖。`,
        peer: "你们不算天然默契，也不会天然冲突。做事多沟通、多确认，就能合作得很好。",
        child: `${wd}的性格没有明显的对冲，关系好坏主要看相处质量。固定的陪伴时间最有用。`,
      },
    },
    friction: {
      tone: "mixed",
      weight: 2,
      tags: ["conflict", "growth"],
      pro: `${base}：关注点容易相左的组合（如自由与稳定、掌控与随性）。`,
      plain: {
        romance: "你们看重的东西不太一样：一个想自由，另一个想安稳；一个想掌控，另一个想放松。有话说在前面，别用沉默代替沟通，差异会变成互相学习。",
        elder: `${wd}在追求上常有分歧，比如你想尝试、TA 希望稳当。先听 TA 的顾虑，再说你的计划，对方更容易接受。`,
        peer: "你们追求的东西不太一样，合作时容易为节奏吵起来。先商量好目标和边界，再动手。",
        child: `${w}的想法常和你的安排相左。把规矩说清楚，同时留一块 TA 自己做主的空间。`,
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
      plain: m.plain[g],
    },
    PAIR_SCORE[kind] - 50,
  );

  // What TA brings.
  const kws = pb.keywords.slice(0, 3).join("、");
  acc.add(
    {
      tone: "good",
      weight: 2,
      tags: g === "elder" ? ["growth", "support"] : ["growth"],
      pro: `TA 的生命灵数 ${b}：${pb.title}，关键词 ${kws}。`,
      plain:
        g === "elder"
          ? `你能从${wb}身上学到「${pb.keywords.slice(0, 2).join("、")}」这一类的做法。想一想 TA 做对过的那几次选择，里面有你可以借鉴的方法。`
          : `TA 的人生底色是「${pb.keywords.slice(0, 2).join("、")}」。你偏向「${pa.keywords.slice(0, 2).join("、")}」，所以你们遇事的第一反应不一样。把差别当成补充。`,
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
      pro: `TA 的生命灵数 ${b} 在互助上的特点：${help.career}。`,
      plain: elder
        ? `在事业上，${w}${help.career}。`
        : romance
          ? `TA 能为你做的事是：${help.general}。你需要这样的支持时，直接告诉 TA。`
          : g === "child"
            ? `${w}会${help.general}。`
            : `TA 在合作中的作用是${help.general}。分工时把这一块交给 TA，会比你自己撑着更轻松。`,
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
      pro: `两人灵数相加 ${baseNumber(a)}+${baseNumber(b)} 得关系数 ${rn}。`,
      plain: `你们在一起，最适合的主题是：${RELATIONSHIP_NUMBER[rn]}。围绕它安排共同的事，关系会更顺。`,
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
          pro: `${who === "你" ? "你" : "TA"}的生命灵数为大师数 ${n}。`,
          plain:
            who === "你"
              ? `你自己带着较高的期待和敏感度。别要求对方跟上你的节奏，让 TA 用自己的方式回应你。`
              : `TA 带着较高的期待和敏感度。多一点耐心和肯定，会让 TA 更放松地靠近你。`,
        },
        0,
      );
    }
  }

  const label2 = { same: "同数镜像", family: "同族共鸣", complement: "互补相成", friction: "差异较大", neutral: "中性平和" }[kind];
  return { methodId: "numerology", name: "灵数合参", score: acc.score(), headline: `${a} × ${b} · ${label2}`, items: acc.list() };
};
