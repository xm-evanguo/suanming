import { describe, expect, test } from "bun:test";
import { Solar } from "lunar-javascript";
import { qimenChart, qimenReading } from "../src/core/qimen";

const at = (text: string) => new Date(`${text}+08:00`);

describe("Qimen charts", () => {
  // Published full chart: https://www.guyujian.cn/learn/qimen/07
  test("matches all outer palaces of the published 2026-03-18 chart", () => {
    const c = qimenChart(at("2026-03-18T15:20:00"));
    expect(c.pillars).toEqual(["丙午", "辛卯", "辛卯", "丙申"]);
    expect([c.term, c.yuan, c.yang, c.ju, c.xun, c.hiddenStem]).toEqual(["惊蛰", "下元", true, 4, "甲午", "辛"]);
    expect([c.chiefStar, c.starPalace, c.chiefDoor, c.doorPalace]).toEqual(["天柱", 2, "惊门", 9]);
    expect(c.palaces.filter((p) => p.number !== 5).map((p) => [p.number, p.earth, p.heaven, p.star, p.door, p.god])).toEqual([
      [1, "丁", "壬", "天任", "伤门", "六合"], [2, "丙", "辛", "天柱", "开门", "值符"],
      [3, "乙", "戊", "天辅", "景门", "玄武"], [4, "戊", "癸", "天英", "死门", "九地"],
      [6, "庚", "丁", "天蓬", "生门", "太阴"], [7, "辛", "庚", "天心", "休门", "螣蛇"],
      [8, "壬", "乙", "天冲", "杜门", "白虎"], [9, "癸", "丙", "天芮", "惊门", "九天"],
    ]);
    expect(c.palaces[8]!.guest).toBe("己");
    expect([c.selfPalace, c.matterPalace]).toEqual([2, 9]);
  });

  test("changes dun at the exact solstice, not at midnight", () => {
    const l = Solar.fromYmdHms(2026, 6, 21, 12, 0, 0).getLunar();
    const summer = at(l.getJieQiTable()["夏至"].toYmdHms().replace(" ", "T"));
    expect(qimenChart(new Date(summer.getTime() - 1000)).yang).toBe(true);
    expect(qimenChart(summer).yang).toBe(false);
    const winter = at(l.getJieQiTable()["冬至"].toYmdHms().replace(" ", "T"));
    expect(qimenChart(new Date(winter.getTime() - 1000)).yang).toBe(false);
    expect(qimenChart(winter).yang).toBe(true);
  });

  test("the day changes at 23:00 and stays the same at midnight", () => {
    const before = qimenChart(at("2026-03-18T22:59:00"));
    const zi = qimenChart(at("2026-03-18T23:00:00"));
    const next = qimenChart(at("2026-03-19T00:00:00"));
    expect(before.pillars[2]).not.toBe(zi.pillars[2]);
    expect(zi.pillars).toEqual(next.pillars);
    expect(zi.palaces).toEqual(next.palaces);
  });

  test("plates keep all stars, doors, gods and stems across both dun and centre cases", () => {
    let centreChief = false;
    let centreHour = false;
    for (const month of [1, 3, 7, 10]) for (let day = 1; day <= 15; day++) for (let hour = 0; hour < 24; hour += 2) {
      const c = qimenChart(new Date(Date.UTC(2026, month - 1, day, hour - 8)));
      const outer = c.palaces.filter((p) => p.number !== 5);
      expect(new Set(outer.map((p) => p.star)).size).toBe(8);
      expect(new Set(outer.map((p) => p.door)).size).toBe(8);
      expect(new Set(outer.map((p) => p.god)).size).toBe(8);
      expect(new Set([...outer.map((p) => p.heaven), ...outer.flatMap((p) => p.guest ? [p.guest] : [])]).size).toBe(9);
      expect(outer.find((p) => p.number === c.starPalace)!.god).toBe("值符");
      expect(outer.find((p) => p.number === c.doorPalace)!.door).toBe(c.chiefDoor);
      expect(c.palaces.find((p) => p.guest)?.star).toBe("天芮");
      expect(qimenReading(c).every((r) => Boolean(r.text && r.rule))).toBe(true);
      centreChief ||= c.chiefStar === "天禽";
      centreHour ||= c.palaces[4]!.earth === (c.pillars[3]![0] === "甲" ? c.hiddenStem : c.pillars[3]![0]);
    }
    expect(centreChief).toBe(true);
    expect(centreHour).toBe(true);
  });

  test("rejects dates outside the supported range", () => {
    expect(() => qimenChart(new Date(NaN))).toThrow();
    expect(() => qimenChart(at("1899-12-31T23:59:00"))).toThrow();
    expect(() => qimenChart(at("2101-01-01T00:00:00"))).toThrow();
  });
});
