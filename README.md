# 天机星图 · suanming

A single-page fortune-telling website. The user enters a birth date, time and place. The site plays an animated "calculation ritual" and then shows the results of 14 fortune-telling systems from China, Japan, ancient Greece, Rome, Persia, India, the modern West and Mesoamerica. Each system has its own page. A fusion page combines all of the results.

Other features:

- **专业版 / 通俗版 toggle.** Every result has a professional reading and a plain-language reading. The professional view is the default.
- **Timeline (`#/timeline`).** It shows forecasts for this year plus two more years, and for the next 12 months. The user can filter by area (career, wealth, love, health, wisdom).
- **Relationships (`#/people`).** The user can add a partner, parents, friends or colleagues. The site compares the two charts and answers questions such as "is this person my fate" or "can my parents help my career".
- **Hand-drawn tarot.** On the tarot page, the user shuffles and draws three cards.
- **AI tarot reading.** After the draw, the user can enter a specific question, add context, and use a personal DeepSeek API key. The model uses the three card positions and orientations to give actions and explain missing information.

All chart calculations run in the browser. The site has no backend. Google Fonts loads from an external service. The optional AI reading sends the question, context, topic and drawn cards directly from the browser to DeepSeek only when the user requests it. It does not send birth data. The API key goes only to DeepSeek for authentication. DeepSeek charges the user's API account for each request.

The user can save or clear the API key in this browser's `localStorage`. The key is not encrypted. Do not save it on a shared device. Questions and AI answers stay in page memory and are not saved by this site. DeepSeek's own data policy applies to data sent to its API. AI output is shown as text, so it cannot add HTML or run scripts. Requests can be cancelled and have a 90-second timeout. A cancellation cannot undo data already sent or charges already incurred.

This release supports only DeepSeek (`deepseek-flash`). ChatGPT website sign-in needs an approved OAuth client and a backend. The open-source ChatGPT plan flow uses a local callback. See the [official website sign-in guide](https://developers.openai.com/siwc/website) and the [ChatGPT plan guide](https://developers.openai.com/siwc/token-sharing-open-source). Neither flow is enabled in this static site.

## Run

```bash
bun install
```

```bash
bun run dev
```

The dev server prints its URL. `.claude/launch.json` starts it on port 5173.

## Scripts

| Script | Purpose |
| --- | --- |
| `bun run dev` | Start the Bun HTML dev server with hot reload. |
| `bun run build` | Clear `dist/` and build the static site into it. |
| `bun test` | Run the tests in `tests/`. |
| `bun run typecheck` | Run `tsc --noEmit`. |

## Deploy

The site is static and uses hash routes, so it needs no redirect rules. It is deployed to the Cloudflare Pages project `suanming` (https://suanming-7pj.pages.dev). The project was created with `wrangler pages project create --force`, because wrangler 4.149 otherwise sends new Pages projects to Workers. Later deploys do not need `--force`:

```bash
bun run build
```

```bash
bunx wrangler@4 pages deploy dist --project-name suanming --branch main
```

## The 14 systems

| Page | System | Origin | Main input | Period forecast |
| --- | --- | --- | --- | --- |
| `bazi` | 八字 (Four Pillars, includes 生肖) | China | Solar terms, true solar time | Years and months |
| `ziwei` | 紫微斗数 | China | Lunar date, hour branch, gender (iztro) | Years and months |
| `chenggu` | 袁天罡称骨 | China | Lunar year, month, day, hour | None |
| `meihua` | 梅花易数 | China | Lunar numbers to a King Wen hexagram | None |
| `kyusei` | 九星気学 | Japan | 立春-based year and month star | Years and months |
| `sukuyo` | 宿曜占星術 | Japan | Lunar month and day to one of 27 mansions | None (note only) |
| `astrology` | Western astrology | West | Planet longitudes, ASC and MC (astronomy-engine) | Years and months (transits) |
| `hellenistic` | Hellenistic astrology | Ancient Greece | Whole-sign houses, sect, lots | Years and months (profections) |
| `chaldean` | Chaldean planetary days and hours | Ancient Rome | Weekday and unequal hour at birth, decan | None |
| `firdaria` | Persian firdaria | Persia | Day or night chart, 75-year sequence | Years only |
| `tarot` | Tarot birth cards + hand draw | West | Mary K. Greer reduction | Years only |
| `numerology` | Numerology | West | Life path number, Lo Shu grid | Years and months |
| `vedic` | Vedic nakshatra | India | Sidereal Moon (Lahiri), Vimshottari dasha | Years and months |
| `maya` | Maya Tzolk'in | Mesoamerica | GMT correlation 584283 | None |

## Structure

- `src/core/` — the chart engine: time zone and DST to UTC, true solar time, planets, ASC/MC, 干支 helpers, and the city list.
- `src/methods/` — one file per system. Each returns a `MethodResult` with professional text, plain text (`plain`), five scores (0–100) and visual data. `fusion.ts` combines the results.
- `src/forecast/` — period forecasts. Each system gives `Signal`s (area, tone, weight, professional and plain text) for 3 years and 12 months. `index.ts` holds the registry and `runForecasts`.
- `src/compat/` — relationship comparison. Each system gives tagged `CompatItem`s for a pair of charts. `index.ts` holds `runCompat`.
- `src/data/` — static interpretation tables and text pools (`plain-*`, `forecast-*`, `compat-*`).
- `src/ui/` — views (wizard, ritual, hub, method page, summary, timeline, people), the mode toggle, the tarot draw, SVG visuals and the `h()` DOM helper.
- `src/css/` — styles for the newer features (`features.css`) and the ancient-system visuals (`ancient.css`).
- `tests/` — engine, plain-text, ancient-system, forecast and compatibility tests.

## Known limits

- Fortune-telling has no scientific basis. The site shows disclaimers on the summary, timeline and relationship pages.
- A specific statement is not an accurate statement. The forecasts use traditional rules, and the systems often disagree.
- Schools differ. This site uses 立春 for the year boundary, the lunar-javascript default 子时 rule, true solar time when the user enables it, the GMT correlation for Maya (not Dreamspell), Lahiri ayanamsa, mean lunar nodes, and the Abu Ma'shar firdaria order. Other schools can give different results.
- The fusion score and the timeline index add the signals of all systems with equal weight. They are heuristics, not probabilities.
- The last input, the mode and the added people are kept in `localStorage` in the user's browser only.
