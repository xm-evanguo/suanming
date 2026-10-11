import { type Chart, norm360 } from "../core/chart";
import { Acc, bareWord, groupOf, pickText, REL_WORD, type ByGroup, withCareer, withWord } from "../data/compat-util";
import { ASPECTS, type AspectKey } from "../data/planets";
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
const fmtOrb = (c: Contact) => `${ASPECTS[c.type].name}，容许度 ${c.orb.toFixed(1)}°`;
const proOf = (c: Contact) => `你的${ZH[c.a]}与TA的${ZH[c.b]}${fmtOrb(c)}`;

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
  const t = (tags: CompatTag[]) => withCareer(relation, tags);

  if (!timeOk) {
    acc.add(
      {
        tone: "mixed",
        weight: 1,
        tags: ["growth"],
        pro: "至少一方出生时间未知：月亮、上升点、天顶的合盘相位已略去，只用日月以外的行星与交点。",
        plain: "你们中有人不知道出生时间，所以我们没有看情绪和第一印象这两类，只看了更稳定的部分。补上准确的出生时间，结果会更完整。",
      },
      -3,
    );
  }

  // Sun and Moon: the classic harmony contact.
  const sm = find(["sun"], ["moon"]);
  if (sm) {
    const soft = isSoft(sm.type);
    if (soft) labels.push("日月和谐");
    acc.add(
      {
        tone: soft ? "good" : "mixed",
        weight: soft ? 3 : 2,
        tags: soft ? t(romance ? ["harmony", "fate", "attraction"] : ["harmony", "support"]) : romance ? ["attraction", "conflict", "growth"] : ["conflict", "growth"],
        dim: romance ? "love" : undefined,
        pro: `${proOf(sm)}：太阳与月亮的互动，是合盘中衡量“这个人让我舒不舒服”的核心。`,
        plain: soft
          ? pickText(
              T(
                "一方的“想成为什么样的人”，正好被另一方的“需要什么感觉”接住。你们在一起时，容易觉得被理解、被接纳，不必花力气证明自己。",
                `你的做法和${wb}的情绪需求很合拍：你做了什么，TA 通常能感受到善意。晚饭时的几句闲聊，就足以修复很多小别扭。`,
                "你们对彼此的行事风格都有一种自然的接纳。合作时，一个负责拿主意，另一个负责稳住情绪，分工自然。",
                `你的行事方式能安抚${wb}的情绪，TA 也很愿意接受你的引导。多保持固定的相处时间，这份稳定感会很宝贵。`,
              ),
              relation,
            )
          : pickText(
              T(
                "你们互相有吸引，但也有“你要的和 TA 需要的不太一样”的拉扯。一个想行动，另一个想先被理解。先说感受，再谈办法，会好很多。",
                `你想做的事，和${wb}的情绪需求不总是同一件事。你觉得是为 TA 好，TA 可能先感到的是不被理解。先听 TA 说完。`,
                "你的行事方式和 TA 的心情节奏有点错位：你觉得没问题的事，TA 可能觉得被忽略。合作前先问一句“你怎么想”。",
                `${wd}的步调不太同步。孩子的情绪需要你先回应，再讲道理。`,
              ),
              relation,
            ),
      },
      soft ? 14 : 2,
    );
  }

  // Venus and Mars: attraction and drive.
  const vm = find(["venus"], ["mars"]);
  if (vm) {
    const soft = isSoft(vm.type);
    if (soft) labels.push("金火相吸");
    acc.add(
      {
        tone: soft ? "good" : "mixed",
        weight: romance ? 3 : 2,
        tags: romance ? (soft ? ["attraction", "harmony"] : ["attraction", "conflict"]) : soft ? ["harmony"] : ["conflict"],
        dim: romance ? "love" : undefined,
        pro: `${proOf(vm)}：金星（喜好、亲密）与火星（行动、欲望）的接触，是合盘里的吸引力指标。`,
        plain: romance
          ? soft
            ? "你们之间有很直接的吸引力：TA 的行动容易让你心动，你的好感也容易让 TA 想主动靠近。约会时不用太多铺垫，感觉自然就来了。"
            : "你们之间有火花，也有火药味：吸引强烈，但意见不合时也会很冲。吵架后给彼此一点缓冲时间，别在气头上定重要的事。"
          : soft
            ? pickText(
                T("", `${wd}一起做事时，气氛热络，行动力也强。适合安排一起去做的事，比如旅行或家务分工。`, "你们一起做事时精力充沛，容易互相带动。一起运动或做项目都是好选择。", `${wd}一起活动时最放松。运动、玩游戏、做手工，都能拉近关系。`),
                relation,
              )
            : pickText(
                T("", `${wd}遇到意见不同时，火气容易上来。先约定“吵到一半就暂停”，各自冷静后再谈。`, "你们遇到不同意见时，容易变成互相较劲。把“谁负责什么”先讲清楚，比事后争论有效。", `${wd}在规则上容易硬碰硬。先让 TA 说出想法，再商量规矩。`),
                relation,
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
        pro: `${proOf(mm)}：月亮与月亮代表彼此的情绪节奏与安全感需求。`,
        plain: soft
          ? pickText(
              T(
                "你们的情绪节奏很接近：高兴时一起高兴，沉默时对方也懂。回家后不用解释太多，就能在同一个频道里放松。",
                `${wd}的情绪反应很接近，容易感同身受。家里的气氛因此比较稳。`,
                "你们对“什么算安心、什么算打扰”的标准很接近，相处时不用小心翼翼。",
                `${wd}的情绪频率相近，TA 不开心时你很快就能察觉。陪伴比说教管用。`,
              ),
              relation,
            )
          : pickText(
              T(
                "你们对安全感的需要不同：一个想靠近，一个想有空间。把“我需要什么”说出来，比让对方猜更容易。",
                `${wd}表达关心的方式不同：你觉得是照顾，TA 可能觉得是干涉。问一句“你想要我怎么做”，会少很多误会。`,
                "你们的情绪节奏不同步：你想聊的时候 TA 想静一静。约好“什么时候谈”，比硬谈更有效。",
                `${w}的情绪反应和你不太一样。先接住情绪，再谈对错。`,
              ),
              relation,
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
        pro: `${proOf(ss)}：两个太阳的相位反映基本性格是否同向。`,
        plain: soft
          ? "你们的做事方向大体一致，不用花太多时间说服彼此。遇到选择，常常想到一块儿去。"
          : "你们的基本想法常常不同。你觉得对的，TA 可能觉得还差一点。把对方当成另一种思路的参考，会更有收获。",
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
        pro: `${proOf(me2)}：水星关系沟通与理解。`,
        plain: soft
          ? "你们聊天很顺：一个话头抛出去，另一个很快接得住。有重要的事，可以放心直接聊。"
          : "你们想的和说的有时对不上，容易“我以为你懂了”。重要的事，用一句话复述确认，免得误会。",
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
        tags: soft ? t(["harmony", "support"]) : ["conflict"],
        pro: `${proOf(ma)}：火星关系行动、竞争与冲突。`,
        plain: soft
          ? "你们一起做事时劲头足，容易互相带动。遇到难题，一起上比一个人冲更有效。"
          : "你们比较容易在小事上较劲或抢着做主。出现争执时，各自先说“我最在意的是什么”，再谈办法。",
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
    if (soft) labels.push("土星稳固");
    acc.add(
      {
        tone: soft ? "good" : "mixed",
        weight: romance || sat.type === "conjunction" ? 3 : 2,
        tags: soft ? t(["fate", "support", "harmony"]) : ["fate", "conflict", "growth"],
        pro: `${proOf(sat)}：土星主责任、承诺与考验，合盘中常表示长久而有分量的联结。`,
        plain: soft
          ? pickText(
              T(
                `${youAre}在${otherIs}的${area}上是一个让人踏实的存在。这种感觉不浪漫，但很结实，适合想认真走下去的关系。承诺不用说得多，做到就够了。`,
                `${youAre}会稳稳地托住${otherIs}的${area}，不张扬，但很可靠。遇到需要稳妥判断的事，这份稳定会派上用场。`,
                `${youAre}对${otherIs}的${area}是个靠得住的参照。合作时，彼此承诺过的事基本都会做到。`,
                `${youAre}给${otherIs}的${area}提供了稳定的支撑，这份规矩感会慢慢变成安全感。`,
              ),
              relation,
            )
          : pickText(
              T(
                `${youAre}会让${otherIs}在${area}上感到压力或被约束。这种压力既带来成长，也会带来不自在。当有一方说“我有点喘不过气”，请先停下来，听完再回应。`,
                `${youAre}对${otherIs}的${area}要求比较高，让对方有时觉得被评判。把“要求”换成“期待”，说的方式一变，对方更愿意听。`,
                `${youAre}会让${otherIs}在${area}上有压力，像一位严格的老师。合作中，规则写清楚，期限商量好，压力就会变成推动。`,
                `${youAre}对${otherIs}的${area}管得比较紧。多鼓励一句，少批评一句，关系会轻松很多。`,
              ),
              relation,
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
    if (toMe) labels.push("木星助力");
    acc.add(
      {
        tone: "good",
        weight: toMe ? 3 : 1,
        tags: toMe ? withCareer(relation, careerLike ? ["support", "career", "growth"] : ["support", "growth"]) : ["harmony"],
        dim: touchesMc ? "career" : undefined,
        pro: `${proOf(jup)}：木星主扩张与福佑；${toMe ? "TA 的木星落在你的敏感点上，通常表示 TA 对你有助益。" : "你的木星落在 TA 的敏感点上，通常表示你对 TA 有助益。"}`,
        plain: toMe
          ? touchesMc
            ? `在事业上，${w}更像能“推你一把”的人：一句肯定、一个介绍，往往比你想的更有用。有需要时，开口去问。`
            : `${w}对你的态度是鼓励型的。和 TA 聊完，你通常会多一点信心，觉得事情有办法。`
          : `你对${wb}是有帮助的人，你的鼓励会让 TA 更有信心。多说一句“你可以的”，对 TA 是很大的支持。`,
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
    labels.push("交点合相");
    acc.add(
      {
        tone: "good",
        weight: 3,
        tags: ["fate", ...(romance ? (["attraction"] as CompatTag[]) : (["growth"] as CompatTag[]))],
        pro: `${proOf(nh)}：月亮交点与对方个人行星或上升点合相，是合盘里常用的“宿缘”标记；${south ? "南交点偏向旧识、熟悉感" : "北交点偏向成长方向与相遇的意义"}。`,
        plain: south
          ? pickText(
              T(
                "你们初见时有一种“好像在哪儿见过”的熟悉感。这份熟悉会让你很快放松，也别忘了认真了解现在的 TA，不要只靠感觉。",
                `${wd}之间有很熟悉的感觉，很多事不用说就懂。把这份熟悉用在好好沟通上。`,
                "你们见面的头几分钟就觉得很熟。这样的熟悉适合做长期的朋友或搭档。",
                `${wd}之间有一种不用解释的亲近，把它当作礼物好好珍惜。`,
              ),
              relation,
            )
          : pickText(
              T(
                "你们的相遇像是被安排好的：TA 会推动你走向更好的自己。这个过程未必舒服，但回头看会觉得值得。",
                `${w}会把你推向一个新的方向。这种影响不总是顺的，但往往是你需要的。`,
                "你们的相遇像是在彼此的人生里放了一个新方向。一起做事时，你们会激发出彼此没想到的潜力。",
                `${wd}相遇，对你们都是一次成长的机会。多看看 TA 教给你的东西。`,
              ),
              relation,
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
      pro: `太阳星座元素：你的第 ${si + 1} 个星座，TA 的第 ${sj + 1} 个星座，${same ? "火风互补或同类元素" : "元素阴阳不同"}。`,
      plain: same
        ? "你们对世界的反应方式相近：要么都偏行动和交流，要么都偏稳当和感受。沟通起来比较顺。"
        : "你们对世界的反应方式相反：一个偏外放，一个偏内收。这是差异，也是互补，把对方的节奏当成另一种参考。",
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
      pro: `金星星座：你的第 ${vi + 1} 个星座，TA 的第 ${vj + 1} 个星座，${vSame ? "元素同为阳性或阴性，表达好感的方式相近" : "元素阴阳不同，表达好感的方式有别"}。`,
      plain: vSame
        ? "你们表达喜欢的方式很像：用相近的方式关心对方，对方一下就能读懂。"
        : "你们表达喜欢的方式不同：一个爱说出口，一个爱默默做。别因为对方方式不同，就觉得 TA 不在乎。",
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
      pro: `水星星座：你的第 ${ci + 1} 个星座，TA 的第 ${cj + 1} 个星座，${cSame ? "思维方式同向" : "思维方式阴阳互补"}。`,
      plain: cSame
        ? "你们说话、想问题的节奏接近，沟通成本低，一句话就能对上。"
        : "你们想问题的角度不同：一个先谈结论，一个先讲过程。说重要的事时先说“我想表达的重点是…”，会少绕弯。",
    },
    cSame ? 2 : 0,
  );

  const headline = labels.length ? labels.slice(0, 2).join(" · ") : "合盘平和 · 重在相处";
  return { methodId: "astrology", name: "西洋合盘", score: acc.score(), headline, items: acc.list() };
};
