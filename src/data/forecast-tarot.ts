/**
 * Plain-language year reading for each Major Arcana card (Greer year card).
 * Each card gives a main reading and a second reading in another life area.
 */
import type { Tone } from "../forecast/types";
import type { Dim } from "./types";

export interface YearCardReading {
  main: { dim: Dim; tone: Tone; plain: string };
  second: { dim: Dim; tone: Tone; plain: string };
}

export const YEAR_CARD_READINGS: YearCardReading[] = [
  // 0 愚者
  {
    main: { dim: "career", tone: "good", plain: "这一年适合开新局：换赛道、开始一个副项目、去一个没去过的城市，都值得认真考虑。先迈出小小的一步，比想三个月更有用。" },
    second: { dim: "wealth", tone: "mixed", plain: "冲动消费的念头会变多，大额付款前先放一晚，再检查一遍细节。" },
  },
  // 1 魔术师
  {
    main: { dim: "career", tone: "good", plain: "你手里的资源和技能刚好够用，这一年适合把想法变成作品：做个方案、开个账号、谈一次合作。主动出手，成果会比预期好。" },
    second: { dim: "wisdom", tone: "good", plain: "学以致用的一年，之前学的东西能派上用场，可以考虑做一次分享或教别人。" },
  },
  // 2 女祭司
  {
    main: { dim: "wisdom", tone: "mixed", plain: "这一年直觉比分析更准，适合观察、读书、独处。不用急着表态，先把信息收集够。" },
    second: { dim: "love", tone: "mixed", plain: "感情上有些话藏在心里，找一个安静的时间和对方认真聊聊，别靠猜。" },
  },
  // 3 皇后
  {
    main: { dim: "love", tone: "good", plain: "这一年生活变得丰盈：感情升温，人缘变好，也适合布置家、照顾自己。多花时间和在意的人相处。" },
    second: { dim: "health", tone: "good", plain: "身心状态比较滋润，适合培养一个让自己舒服的习惯，比如做饭、园艺或散步。" },
  },
  // 4 皇帝
  {
    main: { dim: "career", tone: "good", plain: "这一年适合建立秩序：定目标、订规则、扛起责任。有机会带团队或负责一块业务，别推。" },
    second: { dim: "wealth", tone: "good", plain: "财务适合做长期安排，比如固定储蓄、整理账务、给自己定预算。" },
  },
  // 5 教皇
  {
    main: { dim: "wisdom", tone: "good", plain: "这一年适合跟着靠谱的前辈或老师学习，进修、考证、拜师都合适。按规矩一步步来，会越走越稳。" },
    second: { dim: "career", tone: "mixed", plain: "职场上遵守流程会更顺，想走捷径反而容易绕路。" },
  },
  // 6 恋人
  {
    main: { dim: "love", tone: "good", plain: "这一年感情和重要的选择是主题：遇到心动的人，或要在两条路中选一条。选之前问问自己真正在意什么。" },
    second: { dim: "career", tone: "mixed", plain: "合作与取舍的机会来了，选择搭档时看价值观是否合拍，而不只是能力。" },
  },
  // 7 战车
  {
    main: { dim: "career", tone: "good", plain: "这一年冲劲十足，适合冲刺一个明确的目标：晋升、比赛、考试、项目上线。把力气集中在一个方向上。" },
    second: { dim: "health", tone: "mixed", plain: "节奏很快，别忘了睡够，也要留意出行时的安全。" },
  },
  // 8 力量
  {
    main: { dim: "wisdom", tone: "good", plain: "这一年靠耐心和温柔解决难题。面对难相处的人或棘手的事，稳住情绪、慢慢来，比硬碰硬更有效。" },
    second: { dim: "health", tone: "good", plain: "体力和意志力都在线，适合坚持一项运动或戒掉一个旧习惯。" },
  },
  // 9 隐士
  {
    main: { dim: "wisdom", tone: "mixed", plain: "这一年适合慢下来，一个人想清楚下一阶段要什么。少些应酬，多些阅读、独处和整理。" },
    second: { dim: "love", tone: "mixed", plain: "社交会变少，但留下来的关系更真。允许自己独处，也别把亲近的人推远。" },
  },
  // 10 命运之轮
  {
    main: { dim: "career", tone: "mixed", plain: "这一年转机很多，风向会变：工作、环境、人脉都可能换挡。保持弹性，机会来时能立刻接住。" },
    second: { dim: "wealth", tone: "mixed", plain: "收入和开销有起伏，手里留一笔缓冲的钱，心里更踏实。" },
  },
  // 11 正义
  {
    main: { dim: "career", tone: "mixed", plain: "这一年讲求公平和因果：合同、协议、评估、考核会变多。把事情做得清楚、透明，对你最有利。" },
    second: { dim: "wisdom", tone: "good", plain: "适合做重要的判断：把事实和感受分开写下来，再做决定。" },
  },
  // 12 吊人
  {
    main: { dim: "wisdom", tone: "mixed", plain: "这一年事情推进偏慢，像是被按下了暂停键。别硬冲，换个角度看问题，答案会自己浮现。" },
    second: { dim: "career", tone: "mixed", plain: "等待比行动更重要的阶段，别急着跳槽或下大决定，先观察。" },
  },
  // 13 死神 (rebirth)
  {
    main: { dim: "career", tone: "mixed", plain: "这一年是结束旧阶段、开启新阶段的一年：换工作、结束一段关系、清掉旧习惯都有可能。放下不需要的，空出位置给新东西。" },
    second: { dim: "health", tone: "mixed", plain: "适合做断舍离，整理房间、清理手机、调整作息，让生活更轻。" },
  },
  // 14 节制
  {
    main: { dim: "health", tone: "good", plain: "这一年适合调整节奏：工作和生活保持平衡，饮食、运动、睡眠都有规律。慢慢调，效果会稳定下来。" },
    second: { dim: "love", tone: "good", plain: "关系中重视磨合与耐心，彼此调整，感情会越来越顺。" },
  },
  // 15 恶魔
  {
    main: { dim: "wealth", tone: "mixed", plain: "这一年容易被欲望和习惯牵着走：过度消费、熬夜、放不下的关系。留意哪些是真正需要的，哪些只是习惯。" },
    second: { dim: "love", tone: "mixed", plain: "感情里要分清是吸引还是依赖，被对方牵着走时，给自己一点冷静的时间。" },
  },
  // 16 高塔
  {
    main: { dim: "career", tone: "mixed", plain: "这一年可能有突如其来的变动：计划被打乱、原有的安排需要推倒重来。提前备好应急方案，变动之后反而更清爽。" },
    second: { dim: "health", tone: "mixed", plain: "情绪起伏较大，遇到突发的事先稳住，睡好吃好，再想对策。" },
  },
  // 17 星星
  {
    main: { dim: "wisdom", tone: "good", plain: "这一年带来希望和疗愈：之前的低谷会过去，适合重新规划长期的梦想，也适合学一门让你心里发亮的东西。" },
    second: { dim: "health", tone: "good", plain: "身心逐渐恢复，规律作息、多接触自然，状态会越来越好。" },
  },
  // 18 月亮
  {
    main: { dim: "wisdom", tone: "mixed", plain: "这一年情绪与直觉都很敏感，容易想多、看不清。没有证据的事先别下结论，重要的信息多核实几次。" },
    second: { dim: "health", tone: "mixed", plain: "睡眠容易受影响，睡前少看手机，给自己安静的夜晚。" },
  },
  // 19 太阳
  {
    main: { dim: "career", tone: "good", plain: "这一年明亮顺畅，努力容易被看见：适合公开成果、争取奖励、迈上更大的舞台。" },
    second: { dim: "love", tone: "good", plain: "心情开朗，关系温暖，适合和家人、伴侣、朋友多相聚，创造快乐的回忆。" },
  },
  // 20 审判
  {
    main: { dim: "career", tone: "good", plain: "这一年有召唤：重新评估自己，也可能迎来一个回应你努力的机会，或旧人旧事的回归。听从内心的呼唤，勇敢做决定。" },
    second: { dim: "wisdom", tone: "mixed", plain: "适合复盘过去几年，总结哪些路走对了，哪些需要告别。" },
  },
  // 21 世界
  {
    main: { dim: "career", tone: "good", plain: "这一年是一个阶段的圆满：项目完成、学业结业、目标达成。收获成果的同时，开始想下一个更大的目标。" },
    second: { dim: "wealth", tone: "good", plain: "努力有了回报，适合庆祝，也适合把收获整理成长期的安排。" },
  },
];
