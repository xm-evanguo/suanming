import { wxRelation } from "../core/ganzhi";
import { Acc, REL_PHRASE, bareWord, groupOf, pickText, REL_WORD, type ByGroup, withCareer, withWord } from "../data/compat-util";
import { RELATION, SHUKU } from "../data/sukuyo";
import { relationOf, shukuIndex } from "../methods/sukuyo";
import type { CompatFn, CompatTag } from "./types";
import { capFirst, isEn, listJoin, t } from "../i18n";
import { wxName } from "../data/en/terms";

type Rel = keyof typeof RELATION;

/** Position names in the nine-step cycle counted from my mansion: 命 榮 衰 安 危 成 壊 友 親. */
const STEP = ["命", "荣", "衰", "安", "危", "成", "坏", "友", "亲"];

/** Distance ring of the other mansion seen from mine: 0-8 = 近 (命の曼荼羅), 9-17 = 中 (業), 18-26 = 远 (胎). */
export const ringOf = (self: number, other: number): "近" | "中" | "远" => {
  const d = (other - self + 27) % 27;
  return d < 9 ? "近" : d < 18 ? "中" : "远";
};

const RING_EN: Record<"近" | "中" | "远", string> = { 近: "near", 中: "middle", 远: "far" };
const RING_NOTE_EN: Record<"近" | "中" | "远", string> = {
  近: "near: the most direct influence",
  中: "middle distance: a moderate influence",
  远: "far: a lighter influence that shows more as you spend time together",
};
const ringNote = (r: "近" | "中" | "远") => (isEn() ? RING_NOTE_EN : RING_NOTE)[r];
const RING_NOTE: Record<"近" | "中" | "远", string> = {
  近: "近距离，影响最直接",
  中: "中距离，影响适中",
  远: "远距离，影响较淡，随接触增多才显现",
};

const MAIN: Record<Rel, { tone: "good" | "mixed" | "bad"; weight: 2 | 3; tags: CompatTag[]; delta: number; text: (w: string, wb: string, wd: string) => ByGroup; en: (w: string, wb: string, wd: string) => ByGroup }> = {
  命: {
    tone: "mixed",
    weight: 2,
    tags: ["fate", "harmony"],
    delta: 5,
    text: (w, wb, wd) => ({
      romance: "你们的性格像镜子里外：TA 的优点你一眼就懂，TA 的坏习惯你也一眼看穿。吵架时容易互相放大情绪，先停三分钟，再说话。",
      elder: `${wd}像一个模子刻出来：脾气、口头禅都有点像。你能理解 TA 的出发点，也容易和 TA 在同一件事上同时着急。`,
      peer: "你们是同一类人，一见面就知道对方在想什么。缺点是缺的东西也一样，重要的事最好找第三个人把关。",
      child: `${w}有不少地方像你年轻时的样子。看到 TA 的缺点，先想想“我是不是也这样”，批评会更温和。`,
    }),
    en: (w, wb, wd) => ({
      romance: "Your natures are like the two sides of a mirror: you see their strengths at a glance, and their bad habits too. In arguments you tend to magnify each other's feelings; pause for three minutes before you speak.",
      elder: `${capFirst(wd)} are cut from the same cloth, down to temper and turns of phrase. You understand where they are coming from, and you may both worry about the same thing at once.`,
      peer: "You are the same kind of person and know what the other is thinking as soon as you meet. The catch is that you lack the same things, so have a third person check important matters.",
      child: `${capFirst(w)} is a lot like you were when young. When you see their flaws, ask yourself whether you are the same, and your criticism will be gentler.`,
    }),
  },
  业胎: {
    tone: "mixed",
    weight: 3,
    tags: ["fate", "attraction"],
    delta: 12,
    text: (w, wb, wd) => ({
      romance: "你们的缘分带着“好像早就认识”的牵引感：容易想念，也不容易真正放下。这种关系深，但不轻松，需要彼此多一点耐心，把情绪说出来而不是等对方猜。",
      elder: `${wd}之间的羁绊很深，彼此牵挂的程度超过一般亲情。遇到事情，你们会不自觉地为对方多想一步，也因此更容易为对方的选择焦虑。`,
      peer: "你们之间有一种说不清的牵引，分开一阵后还会想联系。这样的缘分适合做长久的朋友或搭档，只要别把对方当成自己的责任。",
      child: `${wd}的缘分很深，对 TA 的牵挂也特别重。放手让 TA 试一试，往往比盯着更能守住这份缘分。`,
    }),
    en: (w, wb, wd) => ({
      romance: "Your bond has a pull that feels like you have known each other before: you miss each other easily and find it hard to let go. A bond like this is deep but not easy; it needs patience on both sides, and saying how you feel rather than waiting to be guessed.",
      elder: `The tie between ${wd} runs very deep, beyond ordinary family feeling. When something happens, you think one step further for each other without meaning to, and so you also worry more about each other's choices.`,
      peer: "There is a pull between you that is hard to name; after time apart you still want to get in touch. A bond like this suits a lifelong friendship or partnership, as long as you do not treat the other as your responsibility.",
      child: `The bond between ${wd} is deep, and you worry about them a lot. Letting them try things often protects this bond better than watching them closely.`,
    }),
  },
  荣亲: {
    tone: "good",
    weight: 3,
    tags: ["support", "harmony", "fate"],
    delta: 20,
    text: (w, wb, wd) => ({
      romance: "这是很舒服的一类组合：见面容易放松，彼此都想对对方好。遇到困难时，你们倾向于一起想办法，而不是互相指责。",
      elder: `${wd}互相成就：你做得好，TA 为你高兴；TA 需要帮忙，你也自然想出手。有重要的决定，可以放心先和 TA 商量。`,
      peer: "你们在一起时运气会更好：一个人做不成的事，两个人常常能做成。适合合伙做事、一起学习或长期互相推荐机会。",
      child: `${wd}彼此都愿意为对方多想一点。多一起做点小事，比如做饭、散步，这份亲近会很稳。`,
    }),
    en: (w, wb, wd) => ({
      romance: "This is a very comfortable kind of match: you relax easily together and both want to be good to each other. When trouble comes, you tend to work it out together rather than blame each other.",
      elder: `${capFirst(wd)} lift each other up: when you do well, they are glad for you; when they need help, you naturally want to step in. With important decisions, you can safely talk them over with them first.`,
      peer: "Luck is better when you are together: what one cannot do alone, two often can. Good for going into business together, studying together or passing chances to each other over the long run.",
      child: `${capFirst(wd)} both want to think a little more of the other. Doing small things together, such as cooking or walking, keeps this closeness steady.`,
    }),
  },
  友衰: {
    tone: "mixed",
    weight: 2,
    tags: ["harmony", "support"],
    delta: 2,
    text: (w, wb, wd) => ({
      romance: "你们最初很投缘，聊得来，也很愿意为对方做事。时间久了，一方可能越付出越累。感情里要有来有往，各自留一点自己的时间。",
      elder: `${wd}一开始就聊得来，也愿意帮对方。长期下来，容易有一方付出比较多。定期问一句“你最近累不累”，比等到抱怨要好。`,
      peer: "你们很容易成为朋友，一起玩、一起吃饭都轻松。但帮忙和金钱来往最好说清楚，让友情不被消耗。",
      child: `${wd}很亲近，你也容易为 TA 做很多。别替 TA 把所有事都包下来，该让 TA 自己承担的，要放手。`,
    }),
    en: (w, wb, wd) => ({
      romance: "You clicked at first, talk easily and are happy to do things for each other. Over time, one of you may grow tired from giving more. Love needs give and take; each keep some time for yourself.",
      elder: `${capFirst(wd)} got along from the start and are willing to help each other. Over the years one side tends to give more. Asking \"Have you been tired lately?\" now and then beats waiting for complaints.`,
      peer: "You easily become friends; going out and eating together is easy. But be clear about favours and money, so the friendship is not worn down.",
      child: `${capFirst(wd)} are close, and you tend to do a lot for them. Do not take everything on for them; let go of what they should carry themselves.`,
    }),
  },
  安坏: {
    tone: "mixed",
    weight: 2,
    tags: ["attraction", "conflict"],
    delta: -4,
    text: (w, wb, wd) => ({
      romance: "你们互相吸引的力量很强，但关系里有明显的强弱落差：总有一方觉得自己在迁就。吸引力要靠尊重来保鲜，重要决定轮流让对方来定。",
      elder: `${wd}之间有一定的“上下感”，一方习惯说了算，另一方容易觉得被压住。把“我想要什么”说出来，比事后忍着更有效。`,
      peer: "你们在一起时容易有谁主导的问题。合作前把角色讲明白，轮流当负责人，能避免暗暗较劲。",
      child: `${wd}之间的强弱差距明显，一方容易觉得被管着。多用商量的口气，少用命令。`,
    }),
    en: (w, wb, wd) => ({
      romance: "The pull between you is strong, but there is a clear imbalance: one of you always feels they are the one giving way. Attraction stays fresh through respect; take turns making important decisions.",
      elder: `There is a sense of rank between ${wd}: one is used to having the last word, and the other easily feels held down. Saying \"this is what I want\" works better than putting up with it afterwards.`,
      peer: "When you are together, who leads tends to become an issue. Make the roles clear before working together and take turns being in charge, to avoid quiet tugs of war.",
      child: `The gap in strength between ${wd} is clear, and one side easily feels managed. Use the tone of discussion more and orders less.`,
    }),
  },
  危成: {
    tone: "mixed",
    weight: 2,
    tags: ["conflict", "growth"],
    delta: -6,
    text: (w, wb, wd) => ({
      romance: "刚开始相处时摩擦比较多，一件小事就可能引起火花。但你们若愿意把话说开，反而会在磨合中变得更成熟、更有默契。",
      elder: `${wd}一开始常有磨擦，甚至让人觉得难沟通。熬过磨合期后，你们会发现对方其实是最了解自己的人。`,
      peer: "你们初期容易争论，意见不合时分歧很直接。把争论限定在事情上，之后往往能成为互相打磨的搭档。",
      child: `${wd}初期容易有碰撞。每次冲突后，找一个轻松的方式和解，比如一起吃顿饭，关系会越磨越顺。`,
    }),
    en: (w, wb, wd) => ({
      romance: "At first there is quite a lot of friction, and a small thing can strike sparks. But if you are willing to talk things through, you will grow more mature and more in tune through the adjusting.",
      elder: `${capFirst(wd)} often clash at first, and talking may even feel hard. Once you are through the adjusting stage, you will find the other is the one who understands you best.`,
      peer: "You argue easily at first, and disagreements are blunt. Keep arguments to the work, and you can become partners who sharpen each other.",
      child: `${capFirst(wd)} tend to collide early on. After each conflict, make up in a relaxed way, such as a meal together, and things will get smoother.`,
    }),
  },
};

const stepPro = (self: number, other: number, rel: Rel): string => {
  const d = (other - self + 27) % 27;
  const step = d === 0 ? "命" : d === 9 ? "业" : d === 18 ? "胎" : STEP[d % 9];
  if (isEn()) return `Your natal mansion ${SHUKU[self]!.name} and theirs ${SHUKU[other]!.name}: theirs is ${d} places after yours, the ${RELATION[rel].name} relation in the Three-Nine method, ${ringNote(ringOf(self, other))}.`;
  return `你的本命宿${SHUKU[self]!.name}与TA的本命宿${SHUKU[other]!.name}：TA 的宿位在你之后第 ${d} 位（${step}位），属三九秘法「${rel}」，${RING_NOTE[ringOf(self, other)]}。`;
};

export const sukuyoCompat: CompatFn = (me, other, relation) => {
  const g = groupOf(relation);
  const w = REL_WORD[relation];
  const wb = bareWord(relation);
  const wd = withWord(relation);
  const romance = g === "romance";
  const acc = new Acc(relation);
  const lm = me.lunar;
  const lo = other.lunar;
  const mi = shukuIndex(lm.getMonth(), lm.getDay());
  const oi = shukuIndex(lo.getMonth(), lo.getDay());
  const rel = relationOf(mi, oi);
  const ring = ringOf(mi, oi);
  const main = MAIN[rel];
  const mainTags: CompatTag[] = withCareer(relation, romance ? main.tags : main.tags.filter((tag) => tag !== "attraction"));

  acc.add(
    {
      tone: main.tone,
      weight: main.weight,
      tags: mainTags,
      dim: romance ? "love" : undefined,
      pro: stepPro(mi, oi, rel),
      plain: pickText(main.text(w, wb, wd), relation, main.en(w, wb, wd)),
    },
    main.delta,
  );

  // Distance: a near relation shows its nature more strongly.
  const pos = rel === "荣亲" || rel === "业胎";
  const hard = rel === "安坏" || rel === "危成";
  const ringDelta = ring === "近" ? 1 : ring === "中" ? 0 : -1;
  acc.add(
    {
      tone: pos ? "good" : "mixed",
      weight: 1,
      tags: ["fate"],
      pro: t(
        `两宿距离属「${ring}」：${RING_NOTE[ring]}（三九秘法以 9 宿为一环：近 = 命之环，中 = 业之环，远 = 胎之环）。`,
        `The two mansions are at ${RING_EN[ring]} distance: ${ringNote(ring)} (the Three-Nine method groups mansions in rings of 9: near = life ring, middle = karma ring, far = womb ring).`,
      ),
      plain:
        ring === "近"
          ? pickText(
              {
                romance: hard ? "这种牵引来得快也来得直接，感觉明显，但也别太快下结论。相处几个月后，再看你们是否同路。" : "你们的缘分会很快让彼此有感觉，相处几次就能知道合不合。",
                elder: `${wd}的性格特点会很直接地显现出来：好的更好，碍眼的也更碍眼。多花时间相处，对彼此的了解会更深。`,
                peer: "你们很快就能判断对方是不是对味的人，相处起来的感觉很直接。",
                child: `${wd}之间的互动直接而明显，情绪来得快也去得快。`,
              },
              relation,
              {
                romance: hard ? "This pull comes fast and direct; the feeling is strong, but do not decide too quickly. After a few months together, see whether you are on the same road." : "This bond lets you feel each other quickly; after a few meetings you will know whether you fit.",
                elder: `The traits of ${wd} show up very directly: the good gets better, and the irritating gets more irritating. More time together deepens your understanding.`,
                peer: "You can tell quickly whether the other is your kind of person; the feeling between you is direct.",
                child: `Things between ${wd} are direct and obvious; feelings come fast and go fast.`,
              },
            )
          : ring === "中"
            ? t("这份缘分不算很浓，也不算很淡。需要一些共同的经历，慢慢把关系做深。", "This bond is neither very strong nor very faint. It needs shared experiences to deepen slowly.")
            : t("你们的缘分偏淡，不会一见面就天雷勾地火。多一起做事、多见面，关系会比第一印象好很多。", "Your bond is on the faint side; there will be no fireworks at first meeting. Do more together and meet more often, and the relationship will turn out far better than the first impression."),
    },
    ringDelta * (hard ? -1 : 1) * 2,
  );

  // Element relation of the two mansions (七曜).
  const me2 = SHUKU[mi]!.element;
  const ot2 = SHUKU[oi]!.element;
  if (me2 && ot2) {
    const r = wxRelation(me2, ot2);
    const goodEl = r === "生我" || r === "同";
    acc.add(
      {
        tone: goodEl ? "good" : "mixed",
        weight: 1,
        tags: goodEl ? withCareer(relation, ["harmony", "support"]) : ["growth"],
        pro: t(`两宿的五行：你的${SHUKU[mi]!.name}属${me2}，TA 的${SHUKU[oi]!.name}属${ot2}，TA ${REL_PHRASE[r]}。`, `Mansion elements: your ${SHUKU[mi]!.name} is ${wxName(me2)}, their ${SHUKU[oi]!.name} is ${wxName(ot2)}; they ${REL_PHRASE[r]}.`),
        plain: goodEl
          ? t("TA 的节奏和你的相处起来比较顺：你累的时候 TA 不会添乱，你有想法的时候 TA 也愿意听。", "Their rhythm fits well with yours: when you are tired they do not add to the load, and when you have ideas they are willing to listen.")
          : r === "我生"
            ? t("你们之间，你付出得更自然。可以多问问 TA 需要什么，而不是凭感觉去帮忙。", "Between you, giving comes more naturally to you. Ask what they need rather than helping by guesswork.")
            : t("你们的节奏有些错位，一方快一方慢。约好“多久碰一次头”，比等到出问题再沟通更好。", "Your rhythms are a little out of step: one fast, one slow. Agreeing how often to check in beats waiting for problems before talking."),
      },
      goodEl ? 4 : -1,
    );
  }

  // What TA shows: the character of TA's mansion, as something to learn from.
  const os = SHUKU[oi]!;
  acc.add(
    {
      tone: "good",
      weight: 1,
      tags: g === "elder" ? ["growth", "support"] : ["growth"],
      pro: t(`TA 的本命宿为${os.name}（${os.title}），关键词：${os.keywords.slice(0, 3).join("、")}。`, `Their natal mansion is ${os.name} (${os.title.toLowerCase()}); keywords: ${listJoin(os.keywords.slice(0, 3))}.`),
      plain:
        g === "elder"
          ? t(`你可以向${wb}学「${os.keywords.slice(0, 2).join("、")}」这一类的做法。留意 TA 在难关面前怎么做，比听 TA 讲道理更能学到东西。`, `You can learn from ${wb} how to be ${listJoin(os.keywords.slice(0, 2))}. Watching how they face hard times teaches more than listening to their advice.`)
          : t(`TA 最鲜明的底色是「${os.keywords.slice(0, 2).join("、")}」。把它当成你身边的一面镜子：遇到需要这类特质的场合，可以请 TA 带你一起。`, `Their most vivid traits are \"${listJoin(os.keywords.slice(0, 2))}\". Treat them as a mirror beside you: when a situation calls for those traits, ask them to bring you along.`),
    },
    1,
  );

  const relName = RELATION[rel].name;
  const headline = isEn()
    ? `${relName} bond · ${RING_EN[ring]} distance${rel === "荣亲" ? " · mutual benefit" : rel === "业胎" ? " · deep destined bond" : rel === "命" ? " · same mansion" : ""}`
    : `${relName}之缘 · ${ring}距离${rel === "荣亲" ? " · 互利吉缘" : rel === "业胎" ? " · 宿缘深厚" : rel === "命" ? " · 同宿相映" : ""}`;
  return { methodId: "sukuyo", name: t("宿曜三九", "Sukuyō matching"), score: acc.score(), headline, items: acc.list() };
};
