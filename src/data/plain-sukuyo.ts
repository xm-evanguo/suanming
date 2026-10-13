import { PLAIN_SUKUYO_REL_EN } from "./en/sukuyo";
import { live } from "../i18n";
/** Plain-language partner types for 宿曜, keyed by relation name in `data/sukuyo.ts`. */
const PLAIN_SUKUYO_REL_ZH: Record<"命" | "业胎" | "荣亲" | "友衰" | "安坏" | "危成", { label: string; text: string }> = {
  命: { label: "和你同类型的人", text: "像照镜子，容易懂你，也容易放大彼此的缺点。" },
  业胎: { label: "缘分很深的人", text: "牵绊重，关系深但不轻松，需要互相体谅。" },
  荣亲: { label: "最合拍的搭档", text: "在一起容易互相成就，适合合作，也适合长久相伴。" },
  友衰: { label: "容易成为朋友的人", text: "一见投缘，但相处久了容易有一方被消耗，要注意保持界限。" },
  安坏: { label: "吸引力强但不对等的人", text: "容易一方强势、一方迁就，需要多尊重和让步。" },
  危成: { label: "起初会磨合的人", text: "开头容易有摩擦，磨合好以后可以一起成长，关键是好好沟通。" },
};

export const PLAIN_SUKUYO_REL = live(PLAIN_SUKUYO_REL_ZH, PLAIN_SUKUYO_REL_EN);
