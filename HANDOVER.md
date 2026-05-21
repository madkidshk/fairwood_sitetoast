# SITE 多士大對決 — Handover Notes

> 俾下個 Claude session 用嘅 state notes。每次重大 change 都要 update 呢個檔。

## 最後 push commit (live in production)
- `131d9c8` — 5 production fixes + V8 keywords (portrait overlay / iframe overflow / rules fetch / loading skeleton / OG tags)
- **WIP next commit**: manifesto layout + share modal + remove standalone vote UI + fix carousel JS

## 已鎖死嘅 design decisions（唔好再反覆）
1. **核心 framing**：「一SITE一票 · 起SITE表態」— 起 site = 投票
2. **冇獨立投票 mechanic** — 冇 like / 冇 vote button / 冇 reaction
3. **Vet 係 hard gate** — submit 後要 24h 內 vet 通過先計票 + 上 gallery
4. **唔做即時 reward** — reward 派發喺 vet 通過之後（券 / 結算）
5. **公眾投票方案最後 rejected** — 因為「submission = vote」框架已經足夠
6. **唔做 Fairwood 會員 SSO / OAuth** — 太重，21 日 campaign 唔等得 IT integration
7. **大快活官方推介 = Phase 2 picks**（每派 5 個 spotlight，明確標非投票結果）

## Battle 區 architecture（重要）
- **Phase 1**（每派 < 5 vet'd sites）：50/50 兩派宣言對峙，swap-btn 隱藏
- **Phase 2**（每派 ≥ 5）：宣言精簡版 + 5 個 picks card grid
- JS auto-switch in `(function(){const THRESHOLD = 5; ...})()` near end of `<body>`

## Submit flow
1. Submit form 2 fields（URL + 暱稱/會員 no.）
2. 撳 submit → 跳 share modal（`#shareOverlay`）
3. 出 ref no. + 24h SLA 訊息
4. 4 個 share button：FB / Threads / WhatsApp / IG-copy
5. Pre-made OG card 分傳統派 / 花生派 styling

## 仲未做嘅嘢
- [ ] GitHub Pages 啟用（用戶撳 1 次 button，3 分鐘有 live URL）
- [ ] Vet 後台（GAS endpoint + 通過/退稿 email 通知 + 24h SLA tracker）
- [ ] 「30 秒簡易模式」in-site builder（template + Haiku polish；估 < $10 / 10K sites）
- [ ] `previews/*.html` sample sites 仍然有舊 VOTE 字眼 — 真實 submission 替換時自然 phase out
- [ ] $10 大快活 App 西多券發券 flow（vet 通過後 trigger）

## File 地圖
- `index.html` — master site（NOT master-site.html / master-site-v2.html，呢兩個係 legacy）
- `team-duck.html` / `team-peanut.html` — 樣本 sites（曾經 iframed 入 battle，依家用 manifesto 取代）
- `previews/duck-*.html` / `previews/peanut-*.html` — gallery 用嘅樣本 submissions
- `rules.txt` — 比賽規則（用 fetch() 拉入 modal 因為 GitHub block iframe）
- `assets/` — logo / 西多 hero / mascot
- `CHANGELOG.md` — 改動記錄
- `HANDOVER.md` — 呢個檔

## Push 流程
1. Edit files locally (此 repo path: `~/Documents/Claude/fairwood_sitetoast`)
2. 用戶喺 terminal 行 `fpush "msg"`（用戶 alias，可能等於 `git add -A && git commit -m "$1" && git push`）
3. 如果 `Nothing to push`：先 `git status` 確認 modified，再手動 `git add . && git commit -m "..." && git push`
4. 如果 `.git/index.lock` exists：`rm .git/index.lock`

## 用戶 preference
- 廣東話對話
- 短 + 直接，唔好太多 emoji
- 唔鍾意過度顯擺嘅 framing（"deck 變晒升級"果類話）
- 撳板要明確，傾完 idea 即刻落手做
