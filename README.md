# 天机星图 · suanming

A single-page fortune-telling website. The user enters a birth date, time and place. The site then plays an animated "calculation ritual" and shows the results of 12 fortune-telling systems from China, Japan, India, the West and Mesoamerica. Each system has its own page. A fusion page combines all of the results.

All calculations run in the browser. There is no server and no network request for user data.

## Run

```bash
bun install
```

```bash
bun run dev
```

The dev server prints its URL (the default is http://localhost:3000).

## Scripts

| Script | Purpose |
| --- | --- |
| `bun run dev` | Start the Bun HTML dev server with hot reload. |
| `bun run build` | Build a static site into `dist/`. |
| `bun test` | Run the engine tests in `tests/`. |
| `bun run typecheck` | Run `tsc --noEmit`. |

## The 12 systems

| Page | System | Origin | Main input |
| --- | --- | --- | --- |
| `bazi` | 八字 (Four Pillars) | China | Solar terms, true solar time |
| `ziwei` | 紫微斗数 | China | Lunar date, hour branch, gender (iztro) |
| `chenggu` | 袁天罡称骨 | China | Lunar year, month, day, hour |
| `meihua` | 梅花易数 | China | Lunar numbers to a King Wen hexagram |
| `shengxiao` | 生肖 | China | 立春-based year branch |
| `kyusei` | 九星気学 | Japan | 立春-based year and month star |
| `sukuyo` | 宿曜占星術 | Japan | Lunar month and day to one of 27 mansions |
| `astrology` | Western astrology | West | Planet longitudes, ASC and MC (astronomy-engine) |
| `tarot` | Tarot birth cards | West | Mary K. Greer reduction, daily seeded spread |
| `numerology` | Numerology | West | Life path number, Lo Shu grid |
| `vedic` | Vedic nakshatra | India | Sidereal Moon (Lahiri), Vimshottari dasha |
| `maya` | Maya Tzolk'in | Mesoamerica | GMT correlation 584283 |

## Structure

- `src/core/` — the chart engine: time zone and DST to UTC, true solar time, planets, ASC/MC, 干支 helpers, and the city list.
- `src/methods/` — one file per system. Each returns a `MethodResult` with text, five scores (0–100) and visual data. `fusion.ts` combines the results.
- `src/data/` — static interpretation tables.
- `src/ui/` — views (hero and wizard, ritual, hub, method page, summary), SVG visuals and the `h()` DOM helper.
- `tests/engine.test.ts` — checks for tables, calendar maths and the full pipeline.

## Known limits

- Fortune-telling has no scientific basis. The site shows a disclaimer on the summary page.
- Schools differ. This site uses 立春 for the year boundary, the lunar-javascript default 子时 rule, true solar time when the user enables it, the GMT correlation for Maya (not Dreamspell), and Lahiri ayanamsa. Other schools can give different results.
- The fusion score is an equal-weight mean of the 12 systems. It is a heuristic, not a measurement.
- The last input is kept in `localStorage` in the user's browser only.
