import type { Chart } from "../core/chart";
import { wxRelation, type WxRelation, zhiIndex } from "../core/ganzhi";
import { Acc, bareWord, groupOf, pickText, REL_WORD, type ByGroup, withCareer, withWord } from "../data/compat-util";
import { NINE_STARS } from "../data/kyusei";
import type { WuXing } from "../data/types";
import { liChunYear, monthStar, yearStar } from "../methods/kyusei";
import type { CompatFn, CompatTag } from "./types";

/** Element of each of the nine stars (index = star number - 1): 一白水 二黒土 三碧木 四緑木 五黄土 六白金 七赤金 八白土 九紫火. */
export const STAR_ELEMENT: WuXing[] = ["水", "土", "木", "木", "土", "金", "金", "土", "火"];

export function stars(c: Chart): { star: number; month: number } {
  const t = c.cnTime;
  const monthZhi: string = c.eightChar.getMonthZhi();
  const star = yearStar(liChunYear(t.y, t.m, monthZhi));
  const month = monthStar(star, (zhiIndex(monthZhi) - 2 + 12) % 12);
  return { star, month };
}

const REL_LABEL: Record<WxRelation, string> = { 同: "比和", 生我: "TA 生你（相生）", 我生: "你生 TA（相生）", 我克: "你克 TA（相克）", 克我: "TA 克你（相克）" };

const MAIN: Record<WxRelation, { tone: "good" | "mixed"; weight: 3 | 2; tags: CompatTag[]; delta: number; text: (w: string, wb: string, wd: string) => ByGroup }> = {
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
  },
};

export const kyuseiCompat: CompatFn = (me, other, relation) => {
  const g = groupOf(relation);
  const w = REL_WORD[relation];
  const wb = bareWord(relation);
  const wd = withWord(relation);
  const romance = g === "romance";
  const acc = new Acc(relation);
  const a = stars(me);
  const b = stars(other);
  const na = NINE_STARS[a.star - 1]!;
  const nb = NINE_STARS[b.star - 1]!;
  const ea = STAR_ELEMENT[a.star - 1]!;
  const eb = STAR_ELEMENT[b.star - 1]!;
  const rel = wxRelation(ea, eb);
  const m = MAIN[rel];

  acc.add(
    {
      tone: m.tone,
      weight: m.weight,
      tags: withCareer(relation, romance && m.tone === "good" ? [...m.tags, "attraction"] : m.tags),
      dim: romance ? "love" : undefined,
      pro: `本命星：你${na.name}（${ea}），TA ${nb.name}（${eb}），${REL_LABEL[rel]}。`,
      plain: pickText(m.text(w, wb, wd), relation),
    },
    m.delta,
  );

  // 月命星: the inner, emotional side.
  const ma = NINE_STARS[a.month - 1]!;
  const mb = NINE_STARS[b.month - 1]!;
  const mea = STAR_ELEMENT[a.month - 1]!;
  const meb = STAR_ELEMENT[b.month - 1]!;
  const mrel = wxRelation(mea, meb);
  const mgood = mrel === "生我" || mrel === "我生" || mrel === "同";
  acc.add(
    {
      tone: mgood ? "good" : "mixed",
      weight: 2,
      tags: mgood ? (mrel === "生我" ? withCareer(relation, ["harmony", "support"]) : ["harmony"]) : ["conflict", "growth"],
      pro: `月命星：你${ma.name}（${mea}），TA ${mb.name}（${meb}），${REL_LABEL[mrel]}。月命星主内在性格与情绪。`,
      plain: mgood
        ? pickText(
            {
              romance: "往深一层看，你们的内心节奏也合得上：不开心的时候，对方一个小动作你就明白。",
              elder: `${wd}在内心深处比较相通，哪怕不常说话，也能感觉到对方的状态。`,
              peer: "你们在情绪层面也合拍，吵完架也容易和好。",
              child: `${wd}的内心节奏相近，TA 很容易向你敞开心扉。`,
            },
            relation,
          )
        : pickText(
            {
              romance: "表面相处顺利，但内心的反应方式有差异：你在意的小事，TA 可能没注意到。把感受直接说出来，别指望对方猜。",
              elder: `${wd}平时相处可以，但遇到压力时反应方式不同。别在对方情绪激动时讲道理，等平静后再谈。`,
              peer: "平常合作没问题，遇到压力时你们的反应不同，一个想行动，一个想先缓一缓。提前约好各自的节奏。",
              child: `${w}内心的反应方式和你不一样。观察 TA 的小动作，比问“怎么了”更能读懂 TA。`,
            },
            relation,
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
      pro: `交叉：你的本命星（${ea}）对 TA 的月命星（${meb}）为${REL_LABEL[c1]}；TA 的本命星（${eb}）对你的月命星（${mea}）为${REL_LABEL[c2]}。`,
      plain:
        crossGood === 2
          ? "你们表面的样子和对方内心的需要都能对上，TA 看到的你，正是 TA 喜欢的样子。"
          : crossGood === 1
            ? "你们有一半的地方互相合得上：表面和内心不总是同步，但磨合起来不难。"
            : "你们给对方的第一印象和对方内心的期待不太一致，所以容易误会。多看看对方真实的反应，少凭印象下判断。",
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
        pro: `${you ? "你" : "TA"}的本命星为五黄土星：位居中宫，存在感强，一动则牵动全局。`,
        plain: you
          ? "你的气场比较强，身边的人常会不自觉围着你转。多问问对方的想法，能让 TA 更自在。"
          : "TA 的气场很强，有时候会在你不知不觉中主导气氛。想要平等，就在小事上先表达你的偏好。",
      },
      0,
    );
  }

  const headline = `${na.name} × ${nb.name} · ${rel === "同" ? "比和" : rel === "生我" || rel === "我生" ? "相生" : "相克"}`;
  return { methodId: "kyusei", name: "九星相性", score: acc.score(), headline, items: acc.list() };
};
