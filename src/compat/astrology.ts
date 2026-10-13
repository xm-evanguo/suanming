import { type Chart, norm360 } from "../core/chart";
import { Acc, bareWord, groupOf, pickText, REL_WORD, type ByGroup, withCareer, withWord } from "../data/compat-util";
import { ASPECTS, type AspectKey } from "../data/planets";
import { capFirst, isEn, lcFirst, t } from "../i18n";
import type { CompatFn, CompatTag } from "./types";

type Body = "sun" | "moon" | "mercury" | "venus" | "mars" | "jupiter" | "saturn" | "asc" | "mc" | "nnode" | "snode";

const ZH: Record<Body, string> = {
  sun: "太阳",
  moon: "月亮",
  mercury: "水星",
  venus: "金星",
  mars: "火星",
  jupiter: "木星",
  saturn: "土星",
  asc: "上升点",
  mc: "天顶",
  nnode: "北交点",
  snode: "南交点",
};

const EN: Record<Body, string> = {
  sun: "Sun",
  moon: "Moon",
  mercury: "Mercury",
  venus: "Venus",
  mars: "Mars",
  jupiter: "Jupiter",
  saturn: "Saturn",
  asc: "Ascendant",
  mc: "Midheaven",
  nnode: "North Node",
  snode: "South Node",
};
const bodyName = (b: Body) => (isEn() ? EN[b] : ZH[b]);

const ASPECT_ORDER: AspectKey[] = ["conjunction", "sextile", "square", "trine", "opposition"];

/** Mean ascending (north) lunar node, tropical longitude in degrees (Meeus, Astronomical Algorithms ch. 47). */
export function meanNorthNode(julianDay: number): number {
  const t = (julianDay - 2451545.0) / 36525;
  return norm360(125.0445479 - 1934.1362891 * t + 0.0020754 * t * t + (t * t * t) / 467441 - (t * t * t * t) / 60616000);
}

export function lonOf(c: Chart, b: Body): number {
  switch (b) {
    case "asc":
      return c.asc;
    case "mc":
      return c.mc;
    case "nnode":
      return meanNorthNode(c.julianDay);
    case "snode":
      return norm360(meanNorthNode(c.julianDay) + 180);
    default:
      return c.planets[b].lon;
  }
}

export interface Contact {
  /** Body of my chart, body of TA's chart. */
  a: Body;
  b: Body;
  type: AspectKey;
  orb: number;
}

/** The aspect between two longitudes, with 6 degrees of orb when a luminary is involved and 4 otherwise; nodes use 5. */
export function aspectBetween(a: Body, la: number, b: Body, lb: number): { type: AspectKey; orb: number } | null {
  let sep = Math.abs(la - lb) % 360;
  if (sep > 180) sep = 360 - sep;
  const node = a === "nnode" || a === "snode" || b === "nnode" || b === "snode";
  const lum = a === "sun" || a === "moon" || b === "sun" || b === "moon";
  const allow = node ? 5 : lum ? 6 : 4;
  let best: { type: AspectKey; orb: number } | null = null;
  for (const type of ASPECT_ORDER) {
    const orb = Math.abs(sep - ASPECTS[type].angle);
    if (orb <= allow && (!best || orb < best.orb)) best = { type, orb };
  }
  return best;
}

const isSoft = (t: AspectKey) => t === "conjunction" || t === "sextile" || t === "trine";
const fmtOrb = (c: Contact) => t(`${ASPECTS[c.type].name}，容许度 ${c.orb.toFixed(1)}°`, `${lcFirst(ASPECTS[c.type].name)}, orb ${c.orb.toFixed(1)}°`);
const proOf = (c: Contact) => t(`你的${ZH[c.a]}与TA的${ZH[c.b]}${fmtOrb(c)}`, `Your ${bodyName(c.a)} and their ${bodyName(c.b)} (${fmtOrb(c)})`);

const T = (romance: string, elder: string, peer: string, child: string): ByGroup => ({ romance, elder, peer, child });

export const astrologyCompat: CompatFn = (me, other, relation) => {
  const g = groupOf(relation);
  const w = REL_WORD[relation];
  const wb = bareWord(relation);
  const wd = withWord(relation);
  const romance = g === "romance";
  const elder = g === "elder";
  const acc = new Acc(relation);
  const timeOk = me.input.timeKnown && other.input.timeKnown;
  const usable = (b: Body) => timeOk || (b !== "moon" && b !== "asc" && b !== "mc");

  /** Tightest aspect among my `xs` bodies against TA's `ys` bodies, and also my `ys` against TA's `xs`. */
  const find = (xs: Body[], ys: Body[]): Contact | null => {
    let best: Contact | null = null;
    const test = (a: Body, b: Body) => {
      if (!usable(a) || !usable(b)) return;
      const hit = aspectBetween(a, lonOf(me, a), b, lonOf(other, b));
      if (hit && (!best || hit.orb < best.orb)) best = { a, b, ...hit };
    };
    for (const x of xs) for (const y of ys) test(x, y);
    if (xs !== ys) for (const y of ys) for (const x of xs) test(y, x);
    return best;
  };
  const labels: string[] = [];
  const tg = (tags: CompatTag[]) => withCareer(relation, tags);

  if (!timeOk) {
    acc.add(
      {
        tone: "mixed",
        weight: 1,
        tags: ["growth"],
        pro: t("至少一方出生时间未知：月亮、上升点、天顶的合盘相位已略去，只用日月以外的行星与交点。", "At least one birth time is unknown, so aspects involving the Moon, Ascendant and Midheaven have been left out; only the Sun, the planets and the lunar nodes are used."),
        plain: t("你们中有人不知道出生时间，所以我们没有看情绪和第一印象这两类，只看了更稳定的部分。补上准确的出生时间，结果会更完整。", "One of you does not know the birth time, so we left out the two parts about feelings and first impressions and looked only at the steadier parts. Add the exact birth time and the result will be more complete."),
      },
      -3,
    );
  }

  // Sun and Moon: the classic harmony contact.
  const sm = find(["sun"], ["moon"]);
  if (sm) {
    const soft = isSoft(sm.type);
    if (soft) labels.push(t("日月和谐", "Sun–Moon harmony"));
    acc.add(
      {
        tone: soft ? "good" : "mixed",
        weight: soft ? 3 : 2,
        tags: soft ? tg(romance ? ["harmony", "fate", "attraction"] : ["harmony", "support"]) : romance ? ["attraction", "conflict", "growth"] : ["conflict", "growth"],
        dim: romance ? "love" : undefined,
        pro: t(`${proOf(sm)}：太阳与月亮的互动，是合盘中衡量“这个人让我舒不舒服”的核心。`, `${proOf(sm)}: the Sun–Moon link is the core measure in synastry of \"does this person make me feel comfortable?\"`),
        plain: soft
          ? pickText(
              T(
                "一方的“想成为什么样的人”，正好被另一方的“需要什么感觉”接住。你们在一起时，容易觉得被理解、被接纳，不必花力气证明自己。",
                `你的做法和${wb}的情绪需求很合拍：你做了什么，TA 通常能感受到善意。晚饭时的几句闲聊，就足以修复很多小别扭。`,
                "你们对彼此的行事风格都有一种自然的接纳。合作时，一个负责拿主意，另一个负责稳住情绪，分工自然。",
                `你的行事方式能安抚${wb}的情绪，TA 也很愿意接受你的引导。多保持固定的相处时间，这份稳定感会很宝贵。`,
              ),
              relation,
              {
                romance: "One person's \"who I want to be\" is caught by the other's \"what I need to feel\". Together you easily feel understood and accepted, with no need to work at proving yourself.",
                elder: `What you do suits ${wb}'s emotional needs well: they can usually feel the kindness in it. A few words over dinner are enough to mend many small frictions.`,
                peer: "You each accept the other's way of doing things quite naturally. When you work together, one makes the call and the other keeps things steady, and the split comes naturally.",
                child: `The way you do things soothes ${wb}, and they are happy to be guided by you. Keeping regular time together will make this steadiness very valuable.`,
              },
            )
          : pickText(
              T(
                "你们互相有吸引，但也有“你要的和 TA 需要的不太一样”的拉扯。一个想行动，另一个想先被理解。先说感受，再谈办法，会好很多。",
                `你想做的事，和${wb}的情绪需求不总是同一件事。你觉得是为 TA 好，TA 可能先感到的是不被理解。先听 TA 说完。`,
                "你的行事方式和 TA 的心情节奏有点错位：你觉得没问题的事，TA 可能觉得被忽略。合作前先问一句“你怎么想”。",
                `${wd}的步调不太同步。孩子的情绪需要你先回应，再讲道理。`,
              ),
              relation,
              {
                romance: "You attract each other, but there is also a pull between \"what you want\" and \"what they need\". One wants to act and the other wants to be understood first. Talking about feelings first and solutions after works much better.",
                elder: `What you want to do and ${wb}'s emotional needs are not always the same thing. You think it is for their good, but they may first feel misunderstood. Hear them out first.`,
                peer: "Your way of doing things and their mood rhythm are a little out of step: what seems fine to you may feel like being ignored to them. Before working together, ask, \"What do you think?\"",
                child: `${capFirst(wd)} are not quite in step. Respond to their feelings first, then reason with them.`,
              },
            ),
      },
      soft ? 14 : 2,
    );
  }

  // Venus and Mars: attraction and drive.
  const vm = find(["venus"], ["mars"]);
  if (vm) {
    const soft = isSoft(vm.type);
    if (soft) labels.push(t("金火相吸", "Venus–Mars attraction"));
    acc.add(
      {
        tone: soft ? "good" : "mixed",
        weight: romance ? 3 : 2,
        tags: romance ? (soft ? ["attraction", "harmony"] : ["attraction", "conflict"]) : soft ? ["harmony"] : ["conflict"],
        dim: romance ? "love" : undefined,
        pro: t(`${proOf(vm)}：金星（喜好、亲密）与火星（行动、欲望）的接触，是合盘里的吸引力指标。`, `${proOf(vm)}: Venus (taste, intimacy) meeting Mars (action, desire) is the attraction indicator in synastry.`),
        plain: romance
          ? soft
            ? t("你们之间有很直接的吸引力：TA 的行动容易让你心动，你的好感也容易让 TA 想主动靠近。约会时不用太多铺垫，感觉自然就来了。", "There is a very direct attraction between you: their actions easily make your heart beat faster, and your warmth easily makes them want to come closer. On a date you need little build-up, because the feeling comes naturally.")
            : t("你们之间有火花，也有火药味：吸引强烈，但意见不合时也会很冲。吵架后给彼此一点缓冲时间，别在气头上定重要的事。", "There are sparks between you, and also a whiff of gunpowder: the attraction is strong, but a disagreement can get fierce. After an argument give each other a little cooling-off time, and do not settle anything important in the heat of the moment.")
          : soft
            ? pickText(
                T("", `${wd}一起做事时，气氛热络，行动力也强。适合安排一起去做的事，比如旅行或家务分工。`, "你们一起做事时精力充沛，容易互相带动。一起运动或做项目都是好选择。", `${wd}一起活动时最放松。运动、玩游戏、做手工，都能拉近关系。`),
                relation,
                {
                  romance: "",
                  elder: `${capFirst(wd)} get along warmly when doing things together, and your drive is strong. Plan things to do together, such as a trip or splitting the chores.`,
                  peer: "You have lots of energy when you do things together and easily pick each other up. Exercising together or doing a project are both good choices.",
                  child: `${capFirst(wd)} are most relaxed when active together. Sport, games and crafts all bring you closer.`,
                },
              )
            : pickText(
                T("", `${wd}遇到意见不同时，火气容易上来。先约定“吵到一半就暂停”，各自冷静后再谈。`, "你们遇到不同意见时，容易变成互相较劲。把“谁负责什么”先讲清楚，比事后争论有效。", `${wd}在规则上容易硬碰硬。先让 TA 说出想法，再商量规矩。`),
                relation,
                {
                  romance: "",
                  elder: `${capFirst(wd)} can flare up when you disagree. Agree beforehand to \"pause halfway through a quarrel\", and talk again once you have both cooled down.`,
                  peer: "When you disagree, it easily turns into a contest. Making clear who is responsible for what works better than arguing afterwards.",
                  child: `${capFirst(wd)} tend to clash head-on over rules. Let them say what they think first, then work out the rules together.`,
                },
              ),
      },
      soft ? 12 : -2,
    );
  }

  // Moon and Moon: shared emotional rhythm.
  const mm = find(["moon"], ["moon"]);
  if (mm) {
    const soft = isSoft(mm.type);
    acc.add(
      {
        tone: soft ? "good" : "mixed",
        weight: 2,
        tags: soft ? ["harmony"] : ["conflict", "growth"],
        pro: t(`${proOf(mm)}：月亮与月亮代表彼此的情绪节奏与安全感需求。`, `${proOf(mm)}: Moon to Moon shows each other's emotional rhythm and need for security.`),
        plain: soft
          ? pickText(
              T(
                "你们的情绪节奏很接近：高兴时一起高兴，沉默时对方也懂。回家后不用解释太多，就能在同一个频道里放松。",
                `${wd}的情绪反应很接近，容易感同身受。家里的气氛因此比较稳。`,
                "你们对“什么算安心、什么算打扰”的标准很接近，相处时不用小心翼翼。",
                `${wd}的情绪频率相近，TA 不开心时你很快就能察觉。陪伴比说教管用。`,
              ),
              relation,
              {
                romance: "Your emotional rhythms are close: you are glad together, and when one of you goes quiet the other understands. You can relax on the same wavelength when you get home, without much explaining.",
                elder: `${capFirst(wd)} react emotionally in similar ways and easily feel what the other feels, which keeps the atmosphere at home fairly steady.`,
                peer: "Your standards for what feels comforting and what feels intrusive are very close, so you need not tread carefully around each other.",
                child: `${capFirst(wd)} share a similar emotional frequency, and when they are unhappy you notice quickly. Company works better than lecturing.`,
              },
            )
          : pickText(
              T(
                "你们对安全感的需要不同：一个想靠近，一个想有空间。把“我需要什么”说出来，比让对方猜更容易。",
                `${wd}表达关心的方式不同：你觉得是照顾，TA 可能觉得是干涉。问一句“你想要我怎么做”，会少很多误会。`,
                "你们的情绪节奏不同步：你想聊的时候 TA 想静一静。约好“什么时候谈”，比硬谈更有效。",
                `${w}的情绪反应和你不太一样。先接住情绪，再谈对错。`,
              ),
              relation,
              {
                romance: "Your needs for security differ: one wants to come closer and the other wants space. Saying \"what I need\" out loud is easier than making them guess.",
                elder: `${capFirst(wd)} show care in different ways: you mean it as looking after them, but they may feel it as interference. Ask, \"What would you like me to do?\" and there will be far fewer misunderstandings.`,
                peer: "Your emotional rhythms are out of step: when you want to talk, they want quiet. Agreeing when to talk works better than forcing it.",
                child: `${capFirst(w)} reacts emotionally in a way that differs from you. Catch the feeling first, then talk about right and wrong.`,
              },
            ),
      },
      soft ? 8 : -3,
    );
  }

  // Sun and Sun.
  const ss = find(["sun"], ["sun"]);
  if (ss) {
    const soft = isSoft(ss.type);
    acc.add(
      {
        tone: soft ? "good" : "mixed",
        weight: 1,
        tags: soft ? ["harmony"] : ["conflict", "growth"],
        pro: t(`${proOf(ss)}：两个太阳的相位反映基本性格是否同向。`, `${proOf(ss)}: the aspect between two Suns shows whether your basic characters point the same way.`),
        plain: soft
          ? t("你们的做事方向大体一致，不用花太多时间说服彼此。遇到选择，常常想到一块儿去。", "You head in much the same direction, so you do not need to spend much time persuading each other. When you face a choice, you often think of the same thing.")
          : t("你们的基本想法常常不同。你觉得对的，TA 可能觉得还差一点。把对方当成另一种思路的参考，会更有收获。", "Your basic ideas often differ. What seems right to you may seem not quite there to them. Treat the other as a reference for a different line of thought and you will gain more."),
      },
      soft ? 5 : -2,
    );
  }

  // Mercury: how you talk.
  const me2 = find(["mercury"], ["mercury", "sun", "moon"]);
  if (me2) {
    const soft = isSoft(me2.type);
    acc.add(
      {
        tone: soft ? "good" : "mixed",
        weight: 1,
        tags: soft ? ["harmony"] : ["conflict", "growth"],
        pro: t(`${proOf(me2)}：水星关系沟通与理解。`, `${proOf(me2)}: Mercury relates to communication and understanding.`),
        plain: soft
          ? t("你们聊天很顺：一个话头抛出去，另一个很快接得住。有重要的事，可以放心直接聊。", "Talking comes easily: when one of you throws out a topic, the other picks it up quickly. When something important comes up, you can speak about it directly.")
          : t("你们想的和说的有时对不上，容易“我以为你懂了”。重要的事，用一句话复述确认，免得误会。", "What you think and what you say do not always match, and it is easy to end up with \"I thought you understood.\" For important things, repeat them back in one sentence to confirm, so nothing is misunderstood."),
      },
      soft ? 4 : -2,
    );
  }

  // Mars: drive and friction.
  const ma = find(["mars"], ["sun", "mars", "moon"]);
  if (ma && !vm) {
    const soft = isSoft(ma.type) && ma.type !== "conjunction";
    acc.add(
      {
        tone: soft ? "good" : "mixed",
        weight: 1,
        tags: soft ? tg(["harmony", "support"]) : ["conflict"],
        pro: t(`${proOf(ma)}：火星关系行动、竞争与冲突。`, `${proOf(ma)}: Mars relates to action, competition and conflict.`),
        plain: soft
          ? t("你们一起做事时劲头足，容易互相带动。遇到难题，一起上比一个人冲更有效。", "You have plenty of drive when you do things together and easily spur each other on. When a problem is hard, tackling it together works better than charging alone.")
          : t("你们比较容易在小事上较劲或抢着做主。出现争执时，各自先说“我最在意的是什么”，再谈办法。", "You tend to lock horns over small things or both try to take charge. When an argument comes up, take turns saying what matters most to you first, then talk about solutions."),
      },
      soft ? 4 : -3,
    );
  }

  // Saturn: commitment, fate, pressure.
  const sat = find(["saturn"], ["sun", "moon", "venus", "asc"]);
  if (sat) {
    const soft = isSoft(sat.type) && sat.type !== "conjunction";
    const onTA = sat.a === "saturn"; // my Saturn touches TA's point
    const planet = onTA ? sat.b : sat.a;
    const area = planet === "sun" ? "自信和干劲" : planet === "moon" ? "情绪和安全感" : planet === "venus" ? "感情与喜好" : "展现自己的方式";
    const youAre = onTA ? "你" : "TA ";
    const otherIs = onTA ? " TA " : "你";
    const areaEn = planet === "sun" ? "confidence and drive" : planet === "moon" ? "feelings and sense of security" : planet === "venus" ? "love and taste" : "outward image";
    const sbj = onTA ? "You" : "They";
    const poss = onTA ? "their" : "your";
    const objP = onTA ? "them" : "you";
    const otherS = onTA ? "they" : "you";
    if (soft) labels.push(t("土星稳固", "Saturn steadiness"));
    acc.add(
      {
        tone: soft ? "good" : "mixed",
        weight: romance || sat.type === "conjunction" ? 3 : 2,
        tags: soft ? tg(["fate", "support", "harmony"]) : ["fate", "conflict", "growth"],
        pro: t(`${proOf(sat)}：土星主责任、承诺与考验，合盘中常表示长久而有分量的联结。`, `${proOf(sat)}: Saturn rules duty, commitment and tests, and in synastry often marks a lasting bond with weight.`),
        plain: soft
          ? pickText(
              T(
                `${youAre}在${otherIs}的${area}上是一个让人踏实的存在。这种感觉不浪漫，但很结实，适合想认真走下去的关系。承诺不用说得多，做到就够了。`,
                `${youAre}会稳稳地托住${otherIs}的${area}，不张扬，但很可靠。遇到需要稳妥判断的事，这份稳定会派上用场。`,
                `${youAre}对${otherIs}的${area}是个靠得住的参照。合作时，彼此承诺过的事基本都会做到。`,
                `${youAre}给${otherIs}的${area}提供了稳定的支撑，这份规矩感会慢慢变成安全感。`,
              ),
              relation,
              {
                romance: `${sbj} are a steadying presence for ${poss} ${areaEn}. It is not romantic, but it is solid, and suits a relationship you both want to take seriously. Promises do not need many words; keeping them is enough.`,
                elder: `${sbj} will hold up ${poss} ${areaEn} steadily, without showing off but very reliably. When something calls for a safe judgement, this steadiness will come in useful.`,
                peer: `${sbj} are a dependable point of reference for ${poss} ${areaEn}. When you work together, what each of you has promised mostly gets done.`,
                child: `${sbj} give ${poss} ${areaEn} a stable support, and this sense of rules slowly turns into a sense of security.`,
              },
            )
          : pickText(
              T(
                `${youAre}会让${otherIs}在${area}上感到压力或被约束。这种压力既带来成长，也会带来不自在。当有一方说“我有点喘不过气”，请先停下来，听完再回应。`,
                `${youAre}对${otherIs}的${area}要求比较高，让对方有时觉得被评判。把“要求”换成“期待”，说的方式一变，对方更愿意听。`,
                `${youAre}会让${otherIs}在${area}上有压力，像一位严格的老师。合作中，规则写清楚，期限商量好，压力就会变成推动。`,
                `${youAre}对${otherIs}的${area}管得比较紧。多鼓励一句，少批评一句，关系会轻松很多。`,
              ),
              relation,
              {
                romance: `${sbj} can make ${objP} feel pressured or held back in ${poss} ${areaEn}. That pressure brings growth, and also discomfort. When one of you says, \"I can't breathe,\" stop first and listen before you reply.`,
                elder: `${sbj} ask a lot of ${poss} ${areaEn}, so ${otherS} sometimes feel judged. Swap \"demands\" for \"hopes\"; when the way you say it changes, ${otherS} are more willing to listen.`,
                peer: `${sbj} can be like a strict teacher for ${poss} ${areaEn}, putting it under pressure. At work, write the rules down and agree deadlines, and the pressure turns into momentum.`,
                child: `${sbj} keep a tight grip on ${poss} ${areaEn}. A little more encouragement and a little less criticism will make the relationship much easier.`,
              },
            ),
      },
      soft ? 10 : -2,
    );
  }

  // Jupiter: support and growth.
  const jup = find(["jupiter"], ["sun", "moon", "mc"]);
  if (jup && (isSoft(jup.type))) {
    const toMe = jup.a === "sun" || jup.a === "moon" || jup.a === "mc"; // my point receives TA's Jupiter
    const touchesMc = jup.a === "mc" || jup.b === "mc";
    const careerLike = touchesMc || elder;
    if (toMe) labels.push(t("木星助力", "Jupiter's help"));
    acc.add(
      {
        tone: "good",
        weight: toMe ? 3 : 1,
        tags: toMe ? withCareer(relation, careerLike ? ["support", "career", "growth"] : ["support", "growth"]) : ["harmony"],
        dim: touchesMc ? "career" : undefined,
        pro: t(
          `${proOf(jup)}：木星主扩张与福佑；${toMe ? "TA 的木星落在你的敏感点上，通常表示 TA 对你有助益。" : "你的木星落在 TA 的敏感点上，通常表示你对 TA 有助益。"}`,
          `${proOf(jup)}: Jupiter rules expansion and blessing; ${toMe ? "their Jupiter falls on a sensitive point of yours, which usually means they are good for you." : "your Jupiter falls on a sensitive point of theirs, which usually means you are good for them."}`,
        ),
        plain: toMe
          ? touchesMc
            ? t(
                `在事业上，${w}更像能“推你一把”的人：一句肯定、一个介绍，往往比你想的更有用。有需要时，开口去问。`,
                `In your career, ${w} is more like someone who can give you a push: a word of approval or an introduction is often more useful than you think. Ask when you need it.`,
              )
            : t(`${w}对你的态度是鼓励型的。和 TA 聊完，你通常会多一点信心，觉得事情有办法。`, `${capFirst(w)} is encouraging toward you. After talking with them you usually feel a little more confident, and feel there is a way through.`)
          : t(
              `你对${wb}是有帮助的人，你的鼓励会让 TA 更有信心。多说一句“你可以的”，对 TA 是很大的支持。`,
              `You are a help to ${wb}, and your encouragement gives them more confidence. Saying \"You can do it\" once more is a great support to them.`,
            ),
      },
      toMe ? 10 : 3,
    );
  }

  // Lunar nodes: karmic contact.
  const nodeTargets: Body[] = ["sun", "venus", "moon", "asc"];
  let nodeHit: Contact | null = null;
  for (const n of ["nnode", "snode"] as Body[])
    for (const x of nodeTargets) {
      if (!usable(x)) continue;
      const hits = [
        { a: n, b: x, ha: aspectBetween(n, lonOf(me, n), x, lonOf(other, x)) },
        { a: x, b: n, ha: aspectBetween(x, lonOf(me, x), n, lonOf(other, n)) },
      ];
      for (const h of hits)
        if (h.ha && h.ha.type === "conjunction" && (!nodeHit || h.ha.orb < nodeHit.orb)) nodeHit = { a: h.a, b: h.b, ...h.ha };
    }
  if (nodeHit) {
    const nh: Contact = nodeHit;
    const south = nh.a === "snode" || nh.b === "snode";
    labels.push(t("交点合相", "Node conjunction"));
    acc.add(
      {
        tone: "good",
        weight: 3,
        tags: ["fate", ...(romance ? (["attraction"] as CompatTag[]) : (["growth"] as CompatTag[]))],
        pro: t(
          `${proOf(nh)}：月亮交点与对方个人行星或上升点合相，是合盘里常用的“宿缘”标记；${south ? "南交点偏向旧识、熟悉感" : "北交点偏向成长方向与相遇的意义"}。`,
          `${proOf(nh)}: a lunar node conjunct the other person's personal planet or Ascendant is a common \"destined tie\" marker in synastry; ${south ? "the South Node leans toward old acquaintance and familiarity" : "the North Node leans toward a direction of growth and the meaning of the meeting"}.`,
        ),
        plain: south
          ? pickText(
              T(
                "你们初见时有一种“好像在哪儿见过”的熟悉感。这份熟悉会让你很快放松，也别忘了认真了解现在的 TA，不要只靠感觉。",
                `${wd}之间有很熟悉的感觉，很多事不用说就懂。把这份熟悉用在好好沟通上。`,
                "你们见面的头几分钟就觉得很熟。这样的熟悉适合做长期的朋友或搭档。",
                `${wd}之间有一种不用解释的亲近，把它当作礼物好好珍惜。`,
              ),
              relation,
              {
                romance: "When you first met, it felt as if you had met before. That familiarity helps you relax quickly, but remember to get to know who they are now rather than going by feeling alone.",
                elder: `${capFirst(wd)} feel very familiar to each other, and much is understood without saying. Use that familiarity for good communication.`,
                peer: "From the first few minutes you felt you knew each other well. That kind of familiarity suits a long friendship or partnership.",
                child: `There is a closeness between ${wd} that needs no explaining; treasure it as a gift.`,
              },
            )
          : pickText(
              T(
                "你们的相遇像是被安排好的：TA 会推动你走向更好的自己。这个过程未必舒服，但回头看会觉得值得。",
                `${w}会把你推向一个新的方向。这种影响不总是顺的，但往往是你需要的。`,
                "你们的相遇像是在彼此的人生里放了一个新方向。一起做事时，你们会激发出彼此没想到的潜力。",
                `${wd}相遇，对你们都是一次成长的机会。多看看 TA 教给你的东西。`,
              ),
              relation,
              {
                romance: "Your meeting feels arranged: they will push you toward a better version of yourself. The process may not be comfortable, but it will feel worth it when you look back.",
                elder: `${capFirst(w)} will push you in a new direction. The influence is not always smooth, but it is often what you need.`,
                peer: "Your meeting is like putting a new direction into each other's lives. When you work together, you bring out potential neither of you expected.",
                child: `${capFirst(wd)} met for a reason: it is a chance for both of you to grow. Look at what they teach you.`,
              },
            ),
      },
      12,
    );
  }

  // Element of the two Sun signs (always available).
  const si = Math.floor(me.planets.sun.lon / 30);
  const sj = Math.floor(other.planets.sun.lon / 30);
  const same = si % 2 === sj % 2;
  acc.add(
    {
      tone: same ? "good" : "mixed",
      weight: 1,
      tags: same ? ["harmony"] : ["growth"],
      pro: t(
        `太阳星座元素：你的第 ${si + 1} 个星座，TA 的第 ${sj + 1} 个星座，${same ? "火风互补或同类元素" : "元素阴阳不同"}。`,
        `Sun-sign elements: your sign is number ${si + 1} and theirs number ${sj + 1} counting from Aries; ${same ? "both are active (fire, air) or both receptive (earth, water)" : "one is active and the other receptive"}.`,
      ),
      plain: same
        ? t("你们对世界的反应方式相近：要么都偏行动和交流，要么都偏稳当和感受。沟通起来比较顺。", "You respond to the world in similar ways: either both lean toward action and talk, or both toward steadiness and feeling. Communication goes fairly smoothly.")
        : t("你们对世界的反应方式相反：一个偏外放，一个偏内收。这是差异，也是互补，把对方的节奏当成另一种参考。", "You respond to the world in opposite ways: one is outgoing and the other inward. That is a difference and also a balance, so treat the other's rhythm as another point of reference."),
    },
    same ? 3 : 0,
  );

  // Venus and Mercury signs (always available): style of affection and of talking.
  const vi = Math.floor(me.planets.venus.lon / 30);
  const vj = Math.floor(other.planets.venus.lon / 30);
  const vSame = vi % 2 === vj % 2;
  acc.add(
    {
      tone: vSame ? "good" : "mixed",
      weight: 1,
      tags: vSame ? (romance ? ["harmony", "attraction"] : ["harmony"]) : ["growth"],
      pro: t(
        `金星星座：你的第 ${vi + 1} 个星座，TA 的第 ${vj + 1} 个星座，${vSame ? "元素同为阳性或阴性，表达好感的方式相近" : "元素阴阳不同，表达好感的方式有别"}。`,
        `Venus signs: your sign is number ${vi + 1} and theirs number ${vj + 1} counting from Aries; ${vSame ? "both are active or both receptive, so you show affection in similar ways" : "one is active and the other receptive, so you show affection in different ways"}.`,
      ),
      plain: vSame
        ? t("你们表达喜欢的方式很像：用相近的方式关心对方，对方一下就能读懂。", "You show liking in very similar ways: you care for each other in much the same style, so each reads the other at once.")
        : t("你们表达喜欢的方式不同：一个爱说出口，一个爱默默做。别因为对方方式不同，就觉得 TA 不在乎。", "You show liking in different ways: one likes to say it and the other likes to quietly do it. Do not assume they do not care just because they show it differently."),
    },
    vSame ? 3 : 0,
  );
  const ci = Math.floor(me.planets.mercury.lon / 30);
  const cj = Math.floor(other.planets.mercury.lon / 30);
  const cSame = ci % 2 === cj % 2;
  acc.add(
    {
      tone: cSame ? "good" : "mixed",
      weight: 1,
      tags: cSame ? ["harmony"] : ["growth"],
      pro: t(
        `水星星座：你的第 ${ci + 1} 个星座，TA 的第 ${cj + 1} 个星座，${cSame ? "思维方式同向" : "思维方式阴阳互补"}。`,
        `Mercury signs: your sign is number ${ci + 1} and theirs number ${cj + 1} counting from Aries; ${cSame ? "you think in the same direction" : "your ways of thinking balance each other"}.`,
      ),
      plain: cSame
        ? t("你们说话、想问题的节奏接近，沟通成本低，一句话就能对上。", "Your pace of speaking and thinking is close, so communication costs little and one sentence is enough to line up.")
        : t("你们想问题的角度不同：一个先谈结论，一个先讲过程。说重要的事时先说“我想表达的重点是…”，会少绕弯。", "You look at problems from different angles: one starts with the conclusion and the other with the process. When you say something important, begin with \"The main point I want to make is...\" and you will go round in fewer circles."),
    },
    cSame ? 2 : 0,
  );

  const headline = labels.length ? labels.slice(0, 2).join(" · ") : t("合盘平和 · 重在相处", "A calm match · it is about how you live it");
  return { methodId: "astrology", name: t("西洋合盘", "Western synastry"), score: acc.score(), headline, items: acc.list() };
};
