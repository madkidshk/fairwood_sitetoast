# SITE 多士大對決 — HANDOVER (single source of truth)

**> 每次改動之前必須 READ 一次呢個檔。** 唔係 reset 上下文 reverse-engineer。

---

## 0 · Push workflow

1. Edit files locally — repo path: `~/Documents/Claude/fairwood_sitetoast`
2. Sandbox 路徑 `/sessions/confident-clever-maxwell/mnt/fairwood_sitetoast` 同 host 路徑係同一份 file，cp / edit 兩面都見到
3. 用戶 push command（一條 line，唔用 smart dash）：
   ```
   cd ~/Documents/Claude/fairwood_sitetoast && rm -f .git/index.lock && git add index.html && git commit -m "MSG" && git push
   ```
4. 如果 `Nothing to push`：file 已 sync，reload [htmlpreview](https://htmlpreview.github.io/?https://github.com/madkidshk/fairwood_sitetoast/blob/main/index.html?v=new) 用 ⌘+Shift+R
5. 永遠唔好 paste command 用 em-dash「—」字符，zsh 會食錯字符。Use ASCII hyphen `-`

---

## 1 · 已鎖死嘅 design decisions（唔好再改、唔好再問）

| # | 決定 | Why |
|---|---|---|
| 1 | Tagline 「一SITE一票 · 起SITE表態」 | 整個 campaign 嘅核心 framing |
| 2 | 起 site = 投票（**冇** like / 冇 vote button / 冇 reaction） | 唯一行動 = submit |
| 3 | Vet 係 hard gate · submit 24h 內 vet 通過先 list | 公平 |
| 4 | 唔做即時 reward · 通過先派 | 公平 |
| 5 | 投票數**唔**喺 site 顯示 · 由大快活喺 social 公佈 | 已 remove tab 嘅 score counter |
| 6 | 唔用 🦆 / 鴨 / DUCK 字眼喺 user-facing UI（內部 code identifier `side="duck"` OK） | brand consistency |
| 7 | 「2026 食得夠STEM」（**唔係**「STEM 大行動」） | brand copy |
| 8 | 唔做 Fairwood SSO / OAuth | 太重 |
| 9 | PROMPT 生成器標題 **冇** 「04 /」前綴 | UI cleanup |

---

## 2 · Battle 區 specification（嚴格跟）

### Layout
- `.battle` section，max-width 1200×675，centered
- `.battle-split` 入面有 `.battle-tabs`（標題列）+ `.battle-bodies`（內容）
- `.battle-bodies` 86/14 dominance + clip-path diagonal cut
- 撳 tab / iframe / swap-btn → swap dominance（toggle `.active-peanut` class on `.battle-split`）

### IFRAME 內容
- Duck body: 載入 team-duck.html（傳統派 sample site）
- Peanut body: 載入 team-peanut.html（花生派 sample site）
- Iframe **fixed 1440px × 1440px**，`transform-origin: 0 0`，`transform: scale(var(--bs-scale))`
- JS ResizeObserver 計 `--bs-scale = clientWidth / 1440`，iframe 永遠 fill bs-frame
- z-index 1 within `.bs-frame`

### Tab 列
- **冇** score counter（`bs-score` block 已刪走）
- 顯示「CLASSIC · 原味」/「PEANUT · 邪惡派」+ 派系名稱

### Bs-foot 列
- 左：prev arrow（`bsPrev*`）
- 中：title + `↗ 睇全 SITE` button（modal）+ 作者/學校 meta
- 右：counter（01/06）+ next arrow
- **冇** VOTE button、**冇** 「↗ 開新窗」hover overlay（hover overlay 已刪走）

### 睇全 SITE Modal
- `#siteOverlay` — fullscreen overlay
- iframe width/height 100%
- × 閂掣 + ESC 退出 + 撳背景退出
- 底部「↗ 開新窗」option

### Swap Pill（中間切換掣，**最易做錯**）

- **得一粒 pill**，位於 battle 中央 seam 位（`left: var(--seam)`）
- **顯示 OPPOSITE 嗰邊嘅 copy** — 即係叫人撳去切換到另一邊
- 規則：
  - DUCK 出緊 (`.battle-split:not(.active-peanut)`) → pill 顯示 **PEANUT · 邪惡 / 花生醬派**（amber 色）
  - PEANUT 出緊 (`.battle-split.active-peanut`) → pill 顯示 **CLASSIC · 原味 / 傳統派**（cream 色）
- 撳 pill → swap dominance
- 文案精準：
  - DUCK：eyebrow `CLASSIC · 原味`，name `傳統派`
  - PEANUT：eyebrow `PEANUT · 邪惡`（**無 派 字**），name `花生醬派`
- 頂部 tabs row（`.battle-tabs`）已 **拎走** — 唔好加返

### Battle Toast Pop-in（左 / 右西多圖）
- **必須跟 `.toast-break` 嘅 EXACT 模式**：
  - `position: absolute` inside `.battle`，OR fixed at viewport edges
  - z-index 0 / 4（睇唔同實現）
  - `left: -120px` / `right: -120px` 嚟錨喺 viewport 邊
  - 380×380 image
  - opacity 0 → .9，transform translateX(-120 → 0) rotate(-30deg → -14deg)
  - cubic-bezier transitions
- 觸發 condition：
  - `.battle.show-duck` → 左邊傳統西多 visible
  - `.battle.show-peanut` → 右邊花生西多 visible
  - 初始 `.show-duck`
- **唔可以 overlap battle iframe content** — toast must 喺 iframe 後面 (z-index 0) OR 喺 viewport 邊 sidebar 嘅 gap

### Battle bg
- **冇** panoramic hero bg image（`.battle::after` 已刪走）

---

## 3 · Manifesto Ribbon Band（battle 下面）

- 全屏 64px 高 band，跟 active side scroll
- `mf-band[data-side="duck"]` → 傳統派 cream-gold ribbon（`#f5ecd9 → #ffe69a`），text 右→左 scroll
- `mf-band[data-side="peanut"]` → 花生派 dark-amber（`#c4661f → #ffb74d`），text 左→右 scroll
- JS hook：`setActive(side)` 同時 update `mfBand.dataset.side` + battle class
- 內容：eyebrow + quote + tag chips + CTA button
- 動畫 `keyframes mf-scroll-rtl/ltr` 36s linear infinite

---

## 4 · Gallery section

- Filter buttons: **全部作品 / 傳統派 / 花生派**（active state 用該派色）
- Pager: ‹ ›
- 每張 card 有 `.g-card-fac` pill 顯示派系（傳統 cream / 花生 amber）
- Empty state：「呢個派系仲未有作品 — 起 site 做第一個」

---

## 5 · Submit flow

- 2 個 field：URL + 暱稱（optional）
- 撳 submit → 跳 `#shareOverlay` 彈出 share modal
- Modal 4 個 share button：FB / Threads / WhatsApp / IG-copy
- Pre-made OG card 分傳統派 / 花生派 styling
- Ref no. + 24h vet SLA 訊息

---

## 6 · ⚠️ DO NOT（最常做錯嘅嘢）

- ❌ 唔好自作主張加返 iframe coverflow / 上下 split / 任何 layout 變更，**user 冇明文要求**之前
- ❌ 唔好用 em-dash「—」喺 push command（zsh 食錯字）
- ❌ 唔好做 piecemeal fixes — review ALL related code 先一齊改
- ❌ 唔好亂改 phase switch / phase1-50-50 / Phase 2 picks 等概念（呢啲已 superseded）
- ❌ 唔好用 SVG + foreignObject 包 text（Chrome bitmap-scale 會糊）
- ❌ 唔好俾 battle toast pop-in overlap iframe content
- ❌ 唔好俾 marquee / toast-break 喺 submit section 同其他圖 stack
- ❌ 唔好喺 hero / submit / gallery / footer 隨便加 🦆 / 鴨 / VOTE / 票 字眼

---

## 7 · 仲未做嘅嘢

- [ ] GitHub Pages 啟用（user 撳 1 個掣，3 分鐘有 live URL）
- [ ] Vet 後台（GAS endpoint + 通過/退稿 email 通知 + 24h SLA tracker）
- [ ] 「30 秒簡易模式」in-site builder（template + Haiku polish）
- [ ] `previews/*.html` sample sites 仍然有舊 VOTE 字眼 — 真實 submission 替換時自然 phase out
- [ ] $10 大快活 App 西多券發券 flow（vet 通過後 trigger）
- [ ] Submit section 嘅 toast / mascot stacking issue
- [ ] 確認 battle toast pop-in 唔再 overlap iframe content（依家可能仍然有）

---

## 8 · File map

- `index.html` — master site（3800+ lines · NOT master-site*.html，呢兩個係 legacy）
- `team-duck.html` / `team-peanut.html` — 兩派 sample site，battle iframe 載入
- `previews/duck-*.html` / `previews/peanut-*.html` — gallery 用嘅樣本 submission
- `rules.txt` — 比賽規則（用 fetch() 拉入 modal 因為 GitHub block iframe）
- `assets/` — fairwood-logo.svg / westoast-traditional.png / westoast-peanut.png / westoast-hero.png / ah-wood.png
- `CHANGELOG.md` — 改動記錄
- `HANDOVER.md` — 呢個檔（read first）

---

## 9 · 用戶 preferences

- 廣東話對話
- 短 + 直接，唔好太多 emoji
- 唔鍾意過度 framing（「deck 變晒升級」嗰類話）
- 撳板要明確，傾完 idea 即刻落手做，唔好咁多 question pop-up（佢可能 type 嘢但 select 唔到）
- 鍾意 user-facing 字眼簡潔（「傳統派」唔好「鴨蛋香 DUCK」之類）

---

## 10 · 重要 commits

| commit | 內容 |
|---|---|
| `ab0efc1` | Scroll ribbon + restore battle dominance + drop strap |
| `a7131c1` | Gallery faction filter |
| `b35da22` | SVG foreignObject manifesto（後撤回） |
| `af17870` | Reset counters to 0 |
| `b57c1e8` | First manifesto + share modal push |
| `131d9c8` | 5 production fixes (portrait/iframe/rules/skeleton/OG) |
---

## 🫀 HEARTBEAT PROTOCOL (User requested)

Every few turns (or natural pause): Claude reads HANDOVER + task list, lists ALL outstanding items, asks user to confirm next priority. Don't proceed without explicit confirm.

## ⚠️ OUTSTANDING ITEMS (last updated: this session)

### Pending — user confirm needed
- [ ] **WhatsApp number**: placeholder `85299999999` — replace with real Fairwood number
- [ ] **GitHub Pages**: enable (one-click on GitHub settings, gives live `madkidshk.github.io/fairwood_sitetoast/`)
- [ ] **Toast position fine-tuning**: 3 remaining toast-break positions (howto→submit / submit→gallery / gallery→bento) — confirm each looks right
- [ ] **Vet backend**: GAS endpoint + 24h SLA tracking + approve/reject email (not yet built)
- [ ] **AI prompt generator (option C from earlier)**: Haiku API integration to generate coherent prompts on-the-fly (option A — chip regrouping — done; C not yet)
- [ ] **Sample previews `previews/*.html`**: still have old VOTE buttons (will phase out as real submissions replace)
- [ ] **$10 大快活 App 西多券 redemption flow**: vet 通過後 trigger（not yet built）

### Recently completed (this session)
- 交SITE投票 heading + section swap (submit ↔ gallery)
- 6-dot side nav + click fix (z-index 80)
- WhatsApp inquiry CTA in footer 聯絡 col
- Gallery cards opaque z-index 3 (toast hidden behind cards)
- Footer bg transparent (toast bg color unified)
- Sections transparent bg (toast shows through section gaps)
- Self-push workflow via PAT established
