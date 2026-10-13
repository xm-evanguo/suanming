# AGENTS.md

Static single-page site (vanilla TypeScript, no framework). See README.md for the feature list and structure.

## Toolchain

Use Bun for everything.

- `bun run dev` — dev server (`bun index.html`). `.claude/launch.json` starts it on port 5173.
- `bun test` — engine tests in `tests/`.
- `bunx tsc --noEmit -p .` — type check.
- `bun run build` — clears `dist/`, then builds the static site into it. The `dist` entry in `.claude/launch.json` serves it on port 5180.
- Deploy: `bunx wrangler@4 pages deploy dist --project-name suanming --branch main` (Cloudflare Pages). Get user approval before each deploy.

Run all three checks (types, tests, build) before a commit.

## Conventions

- DOM: use `h()` from `src/ui/dom.ts`. Pass CSS custom properties in `style` as `{ "--name": value }`. `h()` uses `setProperty`, because `Object.assign` on a style object drops custom properties.
- `h()` skips attributes whose value is `false`. For ARIA states, pass a string: `"aria-pressed": String(flag)`.
- Each method in `src/methods/` returns a `MethodResult` with five scores in 0–100 and a required `plain` reading (no jargon). Register new methods in `src/methods/index.ts` and add a visual in `src/ui/visuals.ts`.
- A method with a traditional period rule also registers a forecast in `src/forecast/index.ts`. Do not invent period forecasts for natal-only systems. A method that can compare two charts registers a `CompatFn` in `src/compat/index.ts`.
- Mode toggle: wrap professional-only content in `onlyPro()` and plain-only content in `onlyPlain()` (`src/ui/components.ts`). The switch is CSS only (`body[data-mode]`), so views do not re-render.
- Before you add a class name, search `src/styles.css` for it. Global rules such as `.flash { opacity: 0 }` exist there.
- Animations: an element with base `opacity: 0` must use a keyframe that has a `to` frame, or it stays invisible.
- Do not put `filter` on a `transform-style: preserve-3d` element (for example `.tcard-inner`). The filter flattens it, and the back face shows. Put the filter on the faces.
- Registered `@property --p` is a `<number>`. Do not put a percent value in it. Use a different property name.
- Astrology glyphs carry `︎`, so they show as text, not as emoji.
- Code comments and docs are in English. The site has Chinese (source) and English UI and readings.

## Languages

- `src/i18n.ts` holds the language. It comes from the saved choice (`tianji.lang.v1`) or the browser language; the switch next to Profile saves it and reloads, so every text is built once in one language. Outside a browser the default is Chinese, so tests see Chinese unless they call `setLang("en")`.
- Inline text: `t("中文", "English")`. Data tables: keep the Chinese table and add an English one in `src/data/en/`, then export `live(TABLE_ZH, TABLE_EN)`; existing `TABLE[key]` lookups then read the current language. English entries override text fields only; scores, numbers and internal keys stay in the Chinese table.
- Chinese strings that the code compares or looks up (五行 `木`, directions `东南`, stems and branches, palace names, `Origin`, relation keys) are internal keys. Do not translate them in place; name them at display time with the helpers in `src/data/en/terms.ts` (`wxName`, `dirName`, `gzName`…) or the method's own name map.
- A method returns an English `MethodResult` from an `if (isEn())` branch. Shared plain titles come from `plainTitles()`. Fusion finds some facts by label, so keep the English labels "Tai Sui", "Year chart", "Year card", "Personal year" and "Current dasha".
- Forecast phrases start with `{T}` ("This year" / "this month"). Compatibility texts pass the English variant as the third argument of `pickText`.
- The AI prompts have an English version and ask the model to answer in English.
- `tests/i18n.test.ts` runs every method, forecast and comparison in English and fails on any Chinese character outside internal keys. Run it after adding text.

## Browser checks

- In the Claude browser pane, a hidden pane pauses `requestAnimationFrame`. Views can look blank until a later frame. Wait before a screenshot.
- A hash change does not reload code. Use `location.reload()` after an edit.

## AI features and security

- Keep API keys out of Git, logs, URLs and site-server requests. Send DeepSeek keys directly to DeepSeek. Browser storage is not encrypted; say so in the UI.
- Render AI output as text nodes. Never insert it as HTML.
- AI 问事 sends personal data (birth data, chart facts) and what each system says, but not the site's scores: the scores are a display aid, not part of the systems. Show everything that is sent in the 「将发送给 AI 的内容」 preview.
- Tests mock API calls. Do not use real keys or paid calls in tests.
