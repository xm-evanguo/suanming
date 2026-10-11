import { CHONG, controlledBy, ganWuXing, generatedBy, GAN, LIU_HE, SAN_HE, WUXING, XIANG_HAI, zhiIndex, wxRelation } from "../core/ganzhi";
import { Acc, REL_PHRASE, bareWord, groupOf, pickText, REL_WORD, type ByGroup, withCareer, withWord } from "../data/compat-util";
import type { WuXing } from "../data/types";
import { bazi } from "../methods/bazi";
import type { CompatFn, CompatTag, RelationKind } from "./types";

/** 天干五合: 甲己 乙庚 丙辛 丁壬 戊癸, with the element each pair transforms into. */
const GAN_HE_WX: WuXing[] = ["土", "金", "水", "木", "火"];
export const ganHe = (a: string, b: string): WuXing | null => {
  const i = GAN.indexOf(a as (typeof GAN)[number]);
  const j = GAN.indexOf(b as (typeof GAN)[number]);
  return i >= 0 && j >= 0 && (i + 5) % 10 === j % 10 && i !== j ? GAN_HE_WX[Math.min(i, j) % 5]! : null;
};

/** 天干相冲 (四冲): 甲庚 乙辛 丙壬 丁癸. */
export const ganChong = (a: string, b: string): boolean => {
  const i = GAN.indexOf(a as (typeof GAN)[number]);
  const j = GAN.indexOf(b as (typeof GAN)[number]);
  return i >= 0 && j >= 0 && Math.abs(i - j) === 6 && Math.min(i, j) < 4;
};

export type BranchRel = "同支" | "六合" | "三合" | "冲" | "害" | "刑";

const XING_PAIRS = [
  [0, 3], // 子卯
  [2, 5],
  [5, 8],
  [2, 8], // 寅巳申
  [1, 10],
  [10, 7],
  [1, 7], // 丑戌未
];
const SELF_XING = [4, 6, 9, 11]; // 辰 午 酉 亥

/** All traditional relations between two earthly branches (indexes 0-11). */
export function branchRelations(i: number, j: number): BranchRel[] {
  const out: BranchRel[] = [];
  if (i === j) {
    out.push("同支");
    if (SELF_XING.includes(i)) out.push("刑");
    return out;
  }
  if (LIU_HE[i] === j) out.push("六合");
  if (CHONG(i) === j) out.push("冲");
  if (XIANG_HAI[i] === j) out.push("害");
  if (SAN_HE(i).includes(j)) out.push("三合");
  if (XING_PAIRS.some(([a, b]) => (a === i && b === j) || (a === j && b === i))) out.push("刑");
  return out;
}

/** Plain-language traits of each element, used in scenes. */
const EL_TRAIT: Record<WuXing, { has: string; scene: string; learn: string }> = {
  木: { has: "肯成长、愿意学", scene: "你犹豫要不要尝试新东西时，听听 TA 怎么看", learn: "遇到新机会先动手试，再慢慢修正" },
  火: { has: "热情、行动快", scene: "你拖着不想动的事，让 TA 拉你一把", learn: "把想法大声说出来，并且马上迈出第一步" },
  土: { has: "稳、靠得住", scene: "你急着做决定时，先听听 TA 的意见", learn: "做事留余地，答应了就守信用" },
  金: { has: "果断、讲规则", scene: "你在细节上犹豫不决时，请 TA 帮你定个标准", learn: "把标准和底线说清楚，不拖泥带水" },
  水: { has: "灵活、会变通", scene: "你钻牛角尖时，让 TA 帮你换个角度", learn: "遇到阻碍不硬碰，先绕一绕再前进" },
};

const topElement = (wx: Record<WuXing, number>): WuXing => WUXING.reduce((a, b) => (wx[a] >= wx[b] ? a : b));
const tagFor = (r: RelationKind, base: CompatTag[]) => withCareer(r, base);

export const baziCompat: CompatFn = (me, other, relation) => {
  const g = groupOf(relation);
  const w = REL_WORD[relation];
  const wb = bareWord(relation);
  const wd = withWord(relation);
  const romance = g === "romance";
  const acc = new Acc(relation);
  const mEc = me.eightChar;
  const oEc = other.eightChar;
  const mGan: string = mEc.getDayGan();
  const oGan: string = oEc.getDayGan();
  const mZhi: string = mEc.getDayZhi();
  const oZhi: string = oEc.getDayZhi();
  const mYear: string = mEc.getYearZhi();
  const oYear: string = oEc.getYearZhi();

  const he = ganHe(mGan, oGan);
  const dayRels = branchRelations(zhiIndex(mZhi), zhiIndex(oZhi));
  const dayLiuHe = dayRels.includes("六合");
  const headlineBits: string[] = [];
  const posW = romance ? 3 : 2;

  // 1. Day stem and day branch.
  if (he && dayLiuHe) {
    headlineBits.push("天合地合");
    acc.add(
      {
        tone: "good",
        weight: 3,
        tags: ["fate", "attraction", "harmony"],
        dim: romance ? "love" : undefined,
        pro: `你的日柱${mGan}${mZhi}与TA的日柱${oGan}${oZhi}：日干${mGan}${oGan}五合（合化${he}），日支${mZhi}${oZhi}六合，为「天合地合」。`,
        plain: pickText(
          {
            romance: "这是少见的好组合：性情相投，过日子的节奏也容易合拍。你们常常是“说不上为什么，就是舒服”。遇到分歧，也容易有人先给台阶。",
            elder: `${wd}既聊得来，生活习惯也容易对上。这样的缘分不多：有话直说，对方多半听得进去，家里的事也容易商量出办法。`,
            peer: "你们既谈得来，做事的节奏也接近。合作时不用磨太久就能分好工，这样的搭档不容易遇到。",
            child: `${wd}天生亲近，读得懂对方的情绪，日常相处也顺。多陪伴、多聊聊日常小事，这份默契会越来越深。`,
          },
          relation,
        ),
      },
      20,
    );
  } else {
    if (he) {
      headlineBits.push("日干相合");
      acc.add(
        {
          tone: "good",
          weight: posW,
          tags: romance ? ["fate", "attraction"] : ["fate", "harmony"],
          dim: romance ? "love" : undefined,
          pro: `你的日干${mGan}与TA的日干${oGan}五合（合化${he}）。日干代表自己，日干相合是八字合参里最直接的“人与人互相吸引”。`,
          plain: pickText(
            {
              romance: "TA 身上有种天然的吸引力：说话、做事的方式，很容易让你想靠近。熟起来不用刻意讨好，也能聊得下去。",
              elder: `${wd}之间有一种说不清的亲近感，彼此容易明白对方的意思。想表达什么，不用绕太多圈子。`,
              peer: "你们认识不久就容易熟起来，聊天不费劲。需要配合的时候，谁先开口都不尴尬。",
              child: `${wd}天然亲近，容易读懂对方的小情绪。你不用说太多，TA 也能感觉到你的心意。`,
            },
            relation,
          ),
        },
        romance ? 12 : 8,
      );
    } else if (ganChong(mGan, oGan)) {
      acc.add(
        {
          tone: "mixed",
          weight: 1,
          tags: ["conflict", "growth"],
          pro: `你的日干${mGan}与TA的日干${oGan}相冲（天干四冲）。`,
          plain: pickText(
            {
              romance: "你们性格上有些“顶牛”的地方：一个想快，一个想稳。吵起来多半是方式不同，不是谁不爱谁。",
              elder: `${wd}看事情的角度常常相反。先听完再回应，比当场争对错更有用。`,
              peer: "你们做事风格差得比较远，一个直接，一个讲究。把规则提前说清楚，磨合会轻松很多。",
              child: `${w}有自己的主意，和你的想法常常不一样。给 TA 说完整句话的机会，再说你的看法。`,
            },
            relation,
          ),
        },
        -3,
      );
    }

    for (const rel of dayRels) {
      const pro = `你的日支${mZhi}与TA的日支${oZhi}${rel === "同支" ? "相同（伏吟）" : rel}。${romance ? "日支为配偶宫，婚恋看重这一层。" : "日支代表日常相处的底层习惯。"}`;
      if (rel === "六合") {
        headlineBits.push("日支六合");
        acc.add(
          {
            tone: "good",
            weight: posW,
            tags: romance ? ["harmony", "fate", "attraction"] : ["harmony", "fate"],
            dim: romance ? "love" : undefined,
            pro,
            plain: pickText(
              {
                romance: "过日子的节奏很容易对上：吃什么、几点睡、周末怎么过，聊一两次就能定下来。这是长期相处里很宝贵的默契。",
                elder: `${wd}在家里的相处习惯比较一致，不用太多解释就能互相配合。逢年过节和日常联系都不费力。`,
                peer: "日常配合很顺手：约时间、分任务、交付东西，你们很少需要反复确认。",
                child: `${wd}的作息、脾气能对得上，日常相处很自然。固定的亲子时间会让这份默契更稳。`,
              },
              relation,
            ),
          },
          romance ? 12 : 7,
        );
      } else if (rel === "三合") {
        acc.add(
          {
            tone: "good",
            weight: romance ? 2 : 1,
            tags: ["harmony", "support"],
            pro,
            plain: pickText(
              {
                romance: "你们看重的东西接近，对未来的方向容易说到一起。遇到选择时，往同一个目标使劲并不难。",
                elder: `${wd}看重的事比较接近，聊到长远打算时容易达成一致。`,
                peer: "你们朝同一个方向使劲时，效率比一个人高很多。定一个共同目标，再各自分头做。",
                child: `${wd}在做人做事的态度上有共鸣，容易把你的经验自然地传给 TA。`,
              },
              relation,
            ),
          },
          romance ? 8 : 4,
        );
      } else if (rel === "冲") {
        headlineBits.push("日支相冲");
        acc.add(
          {
            tone: "bad",
            weight: posW,
            tags: ["conflict"],
            dim: romance ? "love" : undefined,
            pro,
            plain: pickText(
              {
                romance: "日常习惯上容易碰撞：一个想出门，一个想待着；一个爱规划，一个爱随性。这不是谁对谁错，把重要的约定提前说清楚，会少吵很多次。",
                elder: `${wd}生活习惯差别大，谈事情时容易一句话就顶起来。先约好“只谈这一件事”，不翻旧账，沟通会顺很多。`,
                peer: "你们的做事节奏不同步，一方赶进度，另一方想打磨。在开始前把时间点和标准写下来，可以避免多数摩擦。",
                child: `${wd}在作息和习惯上常有拉扯。与其硬压，不如定几条双方都认的规矩。`,
              },
              relation,
            ),
          },
          romance ? -12 : -7,
        );
      } else if (rel === "害") {
        acc.add(
          {
            tone: "bad",
            weight: 1,
            tags: ["conflict"],
            pro,
            plain: pickText(
              {
                romance: "表面客气，心里容易留下小疙瘩：TA 一句无心的话，你可能记很久。有不舒服当天就说，别攒着。",
                elder: `和${wb}相处时，一句无心的话容易被听成别的意思。重要的话说完后，多问一句“你听明白了吗”。`,
                peer: "你们之间容易产生小误会，多半出在没说清楚。口头约好的事，用文字再确认一遍。",
                child: `${w}有时会把你的话理解成批评。多用“我担心”开头，少用“你总是”。`,
              },
              relation,
            ),
          },
          -4,
        );
      } else if (rel === "刑") {
        acc.add(
          {
            tone: "mixed",
            weight: 1,
            tags: ["conflict", "growth"],
            pro,
            plain: pickText(
              {
                romance: "你们都爱较真，有时会在小事上互相挑刺。说话前想一想：我是在帮 TA，还是想证明自己对。",
                elder: `${wd}都有自己的原则，谈到“该怎么做”时容易较劲。先问对方的理由，再讲自己的。`,
                peer: "你们之间有互相挑刺的倾向，也因此会让彼此做得更细。把批评限定在事上，不扯到人。",
                child: `你对${wb}的要求容易越说越多。每次只提一件事，效果比一次说一串好。`,
              },
              relation,
            ),
          },
          -3,
        );
      } else if (rel === "同支") {
        acc.add(
          {
            tone: "mixed",
            weight: 1,
            tags: ["harmony"],
            pro,
            plain: pickText(
              {
                romance: "你们的生活习惯很像，像照镜子：优点会一起放大，毛病也一样。刻意给彼此留一点不同的空间，关系会更有新鲜感。",
                elder: `${wd}的脾气和习惯很像，容易理解对方，也容易为同一件事一起着急。`,
                peer: "你们做事方式相近，一点就通；缺点也是一样的，所以重要的事最好找第三个人检查一遍。",
                child: `${wd}的性格相近，容易互相理解，也容易在同一个点上较劲。`,
              },
              relation,
            ),
          },
          2,
        );
      }
    }
    if (!he && !dayRels.length) {
      acc.add(
        {
          tone: "mixed",
          weight: 1,
          tags: ["harmony"],
          pro: `你的日柱${mGan}${mZhi}与TA的日柱${oGan}${oZhi}：日干无合冲，日支${mZhi}${oZhi}无合冲刑害。`,
          plain: pickText(
            {
              romance: "你们之间没有特别强的牵引，也没有明显的碰撞。感情要靠日常经营：多约会、多聊心里话，缘分会一点点积起来。",
              elder: `${wd}之间没有明显的磨擦，也谈不上特别默契。多花一点时间聊聊近况，关系会更暖。`,
              peer: "你们不算一见如故，也很少起冲突。做事靠分工清楚，处久了会变成靠谱的搭档。",
              child: `${wd}的相处平稳，没有明显的对冲。固定的相处时间比说道理更能拉近关系。`,
            },
            relation,
          ),
        },
        0,
      );
    }
  }

  // 2. Year branch (生肖) relation.
  const yRels = branchRelations(zhiIndex(mYear), zhiIndex(oYear));
  const yearW = g === "peer" ? 1 : 2;
  const yPro = (rel: string) => `你的年支${mYear}与TA的年支${oYear}${rel}（生肖${rel === "同支" ? "相同" : rel}）。`;
  if (yRels.includes("六合") || yRels.includes("三合")) {
    const rel = yRels.includes("六合") ? "六合" : "三合";
    acc.add(
      {
        tone: "good",
        weight: yearW,
        tags: ["harmony"],
        pro: yPro(rel),
        plain: pickText(
          {
            romance: "两人的家庭背景和成长气质比较接近，见家人、谈未来这类话题不容易起大波澜。",
            elder: `${wd}在家里能把气氛带得比较缓和。有分歧的时候，对方通常愿意退半步。`,
            peer: "你们的出身气质比较合，聚在一起很少冷场，朋友圈也容易重叠。",
            child: `${wd}之间家庭气氛比较和气。孩子容易愿意跟你说心里话。`,
          },
          relation,
        ),
      },
      yearW * 3,
    );
  } else if (yRels.includes("冲") || yRels.includes("害")) {
    const rel = yRels.includes("冲") ? "冲" : "害";
    acc.add(
      {
        tone: "bad",
        weight: yearW,
        tags: ["conflict"],
        pro: yPro(rel),
        plain: pickText(
          {
            romance: "两人的成长环境和处事习惯差得比较大，面对家人、金钱这类大话题，各自会有立场。提前一起聊清楚，比临时碰撞好。",
            elder: `${wd}在家庭大事上容易各执一词。做重大决定前，各自先讲理由，再商量，会比直接争论顺利。`,
            peer: "你们的出身背景和做事习惯差得比较大，合作前先对齐期望，避免后面互相“没想到”。",
            child: `${wd}对家里规矩的看法容易不同。定规矩时让 TA 参与，TA 会更愿意遵守。`,
          },
          relation,
        ),
      },
      -yearW * 2,
    );
  } else if (yRels.includes("同支")) {
    acc.add(
      {
        tone: "good",
        weight: 1,
        tags: ["harmony"],
        pro: yPro("同支"),
        plain: pickText(
          {
            romance: "你们同属相，经历和想法常有相似的地方，聊起成长话题会有共鸣。",
            elder: `${wd}属相相同，性格里有不少共同点，容易互相理解。`,
            peer: "你们同属相，爱好和反应方式常常很像，容易有共同话题。",
            child: `${wd}属相相同，脾气里有相似的部分，教育时从“我小时候也这样”开始，TA 更愿意听。`,
          },
          relation,
        ),
      },
      2,
    );
  }

  // 3. The other's elements against my favorable elements.
  const mv = bazi(me).visual;
  const ov = bazi(other).visual;
  const favShare = mv.favorable.reduce((s, f) => s + ov.wuxing[f], 0);
  const oTop = topElement(ov.wuxing);
  const favTop = mv.favorable.includes(oTop) ? oTop : mv.favorable.reduce((a, b) => (ov.wuxing[a] >= ov.wuxing[b] ? a : b));
  const trait = EL_TRAIT[favTop];
  const favPro = `你的喜用神为${mv.favorable.join("、")}；TA八字五行中${mv.favorable.map((f) => `${f}${ov.wuxing[f]}%`).join("、")}，合计${favShare}%（TA最旺为${oTop}${ov.wuxing[oTop]}%）。`;
  if (favShare >= 40 || (mv.favorable.includes(oTop) && ov.wuxing[oTop] >= 28)) {
    headlineBits.push("五行补益");
    acc.add(
      {
        tone: "good",
        weight: 3,
        tags: tagFor(relation, ["support", "harmony"]),
        pro: `${favPro}TA 补你所缺。`,
        plain: `TA 的性格里有你缺的那份“${trait.has}”。${trait.scene}。长期相处，你会比一个人时更从容。`,
      },
      14,
    );
  } else if (favShare >= 28) {
    acc.add(
      {
        tone: "good",
        weight: 2,
        tags: tagFor(relation, ["support"]),
        pro: `${favPro}有一定补益。`,
        plain: `TA 身上有一部分你需要的“${trait.has}”的气质。不用刻意求助，在日常聊天里就能受到影响。`,
      },
      8,
    );
  } else {
    acc.add(
      {
        tone: "mixed",
        weight: 1,
        tags: ["growth"],
        pro: `${favPro}TA 的五行与你的喜用关系不大。`,
        plain: "TA 的气质和你所缺的关系不大，不会自然“补到你”。帮助要靠沟通：想要什么支持，直接开口说清楚。",
      },
      0,
    );
  }
  const reverseShare = ov.favorable.reduce((s, f) => s + mv.wuxing[f], 0);
  if (reverseShare >= 35) {
    acc.add(
      {
        tone: "good",
        weight: 1,
        tags: ["harmony", "support"],
        pro: `TA 的喜用神为${ov.favorable.join("、")}，你的八字中这些五行合计${reverseShare}%：你也能补益 TA。`,
        plain: "你身上恰好有 TA 需要的那种特质，被 TA 需要的感觉会让这段关系更稳。你也不必总觉得自己是在被帮助。",
      },
      4,
    );
  }

  // 4. Career support for father, mother and boss.
  if (g === "elder") {
    const self = ganWuXing(mGan);
    const officer = controlledBy(self); // 官杀
    const resource = generatedBy(self); // 印
    const os = ov.wuxing[officer];
    const rs = ov.wuxing[resource];
    const pro = `你的日主五行为${self}，官杀为${officer}、印为${resource}；TA八字中${officer}${os}%、${resource}${rs}%。`;
    if (rs >= 25) {
      headlineBits.push("印星护身");
      acc.add(
        {
          tone: "good",
          weight: 3,
          tags: ["support", "career", "growth"],
          dim: "career",
          pro: `${pro}TA 的五行里印（生我）旺，为事业上的资源与庇护。`,
          plain: `在事业上，${w}更像你的后盾：愿意给你经验、人脉或兜底。遇到拿不准的选择，别先自己扛，找 TA 聊一聊，常会得到实用的建议。`,
        },
        12,
      );
    } else if (rs >= 15) {
      acc.add(
        {
          tone: "good",
          weight: 2,
          tags: ["support", "career"],
          dim: "career",
          pro: `${pro}TA 的印（生我）有一定分量。`,
          plain: `在事业上，${w}能给你一些方向上的提点，但不一定会直接出手。想要具体帮助，把你的计划讲清楚再请 TA 看。`,
        },
        6,
      );
    }
    if (os >= 25) {
      acc.add(
        {
          tone: "mixed",
          weight: 2,
          tags: ["support", "career", "growth"],
          dim: "career",
          pro: `${pro}TA 的官杀（克我）旺，主规矩、责任与压力。`,
          plain: `在事业上，${w}更像一位提醒你守规矩的人，而不是直接给资源的人。遇到合同、制度、流程类的问题，可以多问问 TA。`,
        },
        4,
      );
    }
    if (rs < 15 && os < 25) {
      acc.add(
        {
          tone: "mixed",
          weight: 1,
          tags: ["career"],
          dim: "career",
          pro: `${pro}TA 的官杀、印均不突出。`,
          plain: `在事业上，${w}不太会直接给你资源，更多是情感上的支持。真正的机会要靠你自己和圈子去打开，把近况跟 TA 说说，就够了。`,
        },
        -2,
      );
    }
    acc.add(
      {
        tone: "good",
        weight: 1,
        tags: ["growth"],
        pro: `TA 八字最旺五行为${oTop}（${ov.wuxing[oTop]}%）。`,
        plain: `你可以向${wb}学一件事：${EL_TRAIT[oTop].learn}。留意 TA 遇到难事时的做法，比听 TA 讲道理更有用。`,
      },
      2,
    );
  }

  // 5. Day-master element relation.
  const mEl = ganWuXing(mGan);
  const oEl = ganWuXing(oGan);
  const rel = wxRelation(mEl, oEl);
  const rpro = `你的日主${mGan}（${mEl}）与TA的日主${oGan}（${oEl}）：TA ${REL_PHRASE[rel]}。`;
  const dm: Record<typeof rel, { tone: "good" | "mixed"; weight: 1 | 2; tags: CompatTag[]; text: ByGroup; delta: number }> = {
    生我: {
      tone: "good",
      weight: 2,
      tags: ["support", "harmony"],
      delta: 9,
      text: {
        romance: "TA 像你的“充电站”：你累的时候，在 TA 身边更容易缓过来。你不必在 TA 面前硬撑。",
        elder: `${w}是托着你的人。你做决定时，TA 往往能给你底气，哪怕只是一句“你放心去做”。`,
        peer: "TA 是会帮你托底的人：你卡住时，TA 常常能递上一句真正有用的话。",
        child: `${w}会让你放松、被需要。工作上遇到压力，和 TA 待一会儿，心情通常会好些。`,
      },
    },
    克我: {
      tone: "mixed",
      weight: 2,
      tags: ["conflict", "growth", "support"],
      delta: 0,
      text: {
        romance: "TA 比较有主见，会让你不自觉想把事情做得更好；有时你也会觉得被管着。想要自由的时候，直接说，不要闷着。",
        elder: `${w}对你要求偏高，话也比较直。听着不舒服的那几句，常常是在帮你少走弯路。`,
        peer: "TA 做事有自己的标准，合作时会对你提要求。开工前把分工和期限讲明白，可以省掉很多不愉快。",
        child: `${w}会在你没注意时“挑战”你的权威。与其压住，不如先听 TA 把话说完。`,
      },
    },
    我生: {
      tone: "mixed",
      weight: 1,
      tags: ["harmony", "growth"],
      delta: 1,
      text: {
        romance: "你在这段关系里习惯多付出一点。适度很好，但别替 TA 把该 TA 做的事也做了，否则两个人都会累。",
        elder: `你对${wb}很上心，常想多为 TA 做点什么。心意很好，也请记得让 TA 知道你需要什么。`,
        peer: "你容易在这段关系里多出力。帮忙可以，但把“谁负责什么”说清楚，免得好心被当成理所当然。",
        child: `你对${wb}有很多付出，这是长辈的本能。给 TA 留一点自己试错的空间，TA 才长得出自己的力量。`,
      },
    },
    我克: {
      tone: "mixed",
      weight: 1,
      tags: ["harmony", "growth"],
      delta: 1,
      text: {
        romance: "你在这段关系里更有主导权，习惯拿主意。给 TA 留一些决定的空间，TA 才愿意跟你说真话。",
        elder: `你在${wb}面前容易说了算。多问一句“你怎么看”，会让 TA 更愿意给你真实的意见。`,
        peer: "你在这里更像领头的那个人。让 TA 有机会提方案，合作才不会变成你一个人在做。",
        child: `${w}通常会听你的安排。多给 TA 选择权，TA 会慢慢长出自己的主见。`,
      },
    },
    同: {
      tone: "good",
      weight: 1,
      tags: ["harmony"],
      delta: 3,
      text: {
        romance: "你们的底色相近，很多事一点就通；也因此容易在同一个点上较劲。吵起来时，试着先换个角色想一想。",
        elder: `${wd}性格底色很像，容易理解 TA 的出发点。小心你们在同一件事上都不肯让步。`,
        peer: "你们是“同类人”，沟通成本低，默契来得快。缺的东西也一样，所以要找别人来补。",
        child: `${wd}性格接近，容易看懂彼此。也要小心把自己的遗憾投射到 TA 身上。`,
      },
    },
  };
  const d = dm[rel];
  acc.add(
    {
      tone: d.tone,
      weight: d.weight,
      tags: tagFor(relation, d.tags),
      pro: rpro,
      plain: pickText(d.text, relation),
    },
    d.delta,
  );

  // Traditional gender reading in a romance: 官星 for a woman, 财星 for a man.
  if (romance && me.input.gender !== other.input.gender) {
    if (me.input.gender === "female" && rel === "克我") {
      acc.add(
        {
          tone: "good",
          weight: 2,
          tags: ["attraction", "fate"],
          dim: "love",
          pro: "女命以克我者为官星（夫星）：TA 的日主五行克你的日主，合于传统的“官星入局”。",
          plain: "TA 给你的是“靠得住、有担当”的感觉，这类人常常是你愿意托付的对象。你也会不自觉地想在 TA 面前更优秀。",
        },
        5,
      );
    } else if (me.input.gender === "male" && rel === "我克") {
      acc.add(
        {
          tone: "good",
          weight: 2,
          tags: ["attraction", "fate"],
          dim: "love",
          pro: "男命以我克者为财星（妻星）：TA 的日主五行为你所克，合于传统的“财星入局”。",
          plain: "你会很自然地想照顾 TA、替 TA 安排好。TA 也容易感受到你的用心，这种“被惦记”的感觉是你们之间的吸引力。",
        },
        5,
      );
    }
  }

  const headline = headlineBits.length ? headlineBits.slice(0, 2).join(" · ") : "平稳相处 · 靠经营";
  return { methodId: "bazi", name: "八字合参", score: acc.score(), headline, items: acc.list() };
};
