# CHANGELOG

## 2026-05-22 · go-to-market readiness + audit pass

### Live site (index.html)
- Tagline 「一SITE一票 · 起SITE表態」 applied across master site
- 6-dot side-nav (首頁 / PROMPT 生成器 / 立即交 SITE / 全部作品 / 獎品 / 查詢) + click hit-zone fix
- Submit ↔ Gallery section swap; submit heading「交SITE投票。」
- WhatsApp inquiry CTA in footer (placeholder number)
- Battle: 86/14 dominance + clip-path diagonal swap; swap pill on seam; toast pop-in 跟 .toast-break 模式
- Manifesto ribbon band scroll directional (R-to-L duck, L-to-R peanut)
- Gallery faction filter (全部 / 傳統 / 花生)
- Post-submit share modal (FB / IG-copy / Threads / WhatsApp)
- 大快活精選 showcase section
- Prompt generator overhaul: 6-group REASONS / STYLES with balanced random, groupSelected() + personaFromReasons() helpers, new 6-section prompt template with persona infer
- Chip cleanup: drop 11 generic / dark (金黃 / 熱辣 / 軟糯 / 公廁綠磚 / 紙紥鋪 / 裝裱鋪 / 五金鋪 / 對家盲撐 / 對家頑固 / 落單一齊 / 唔需要花樣), add 6 new (脆卜卜 / 一咬流心 / 咖啡香 / 流心先係靈魂 / 加咗就唔係西多 / 餡料先誠意), rename 4 (茶記坐 → 茶記坐低嘆, 舊街坊 → 老街坊, 水箱招牌 → 直立招牌, BB 機 → BB call)
- Toast pop-in z-index sorted: gallery cards opaque z-index 3, sections transparent, footer bg transparent
- Page min-width / max-width bounds; responsive
- VOTE buttons stripped from 9 sample preview sites → 起 site 表態 copy
- 食得夠STEM spacing unified (no space, canonical)

### Pitch deck (大快活 Site多士 Proposal.html)
- Chapter 4 · Go-to-Market (initially labelled Chapter 4 due to numbering bug, fixed to Chapter 6) — 6 new slides:
  - 25 Section header: 點打呢場仗
  - 26 21-Day Battle Plan: Gantt + 5 inflection moments (D0 / D3 / D7 / D14 / D18)
  - 27 學界戰術: 108 schools tiered (T1 24 / T2 50 / T3 30) + follow-up cadence + 110-word WhatsApp blurb
  - 28 Own Channels: IG/FB 6 pillar posts + 3 app push burst + 5 in-store touchpoints
  - 29 Paid Channels: Meta Ads 3 audience sets + 5 KOL staged drop with budgets
  - 30 KPI Matrix: Conservative / Target / Stretch + Day 5/11/14 kill criteria
- All 31 deck slides renumbered sequentially (was inconsistent /19/22/23/24, had duplicates)
- Cover crt-bar: 22 SLIDES → 31 SLIDES
- Old KPI slide (21) reframed as Conservative baseline (15K sites / 2M reach / 30% redemption / 80+ schools) handing off to new KPI Matrix slide 30

### New supporting docs
- `VET_BACKEND.md` — deployable GAS spec (vet pipeline, 24h SLA, voucher distribution, kill switches) — est 2-day build
- `CAMPAIGN_OUTREACH.md` — 3-tier school emails + 110-word WhatsApp blurb + follow-up cadence + 5 KOL outreach scripts (小薯茄 / Mira / 點 Cook Guide / 老 Z / 試當真) + 信報 op-ed pitch + thank-you template + contact ownership matrix
- `AI_PROMPT_PROXY.md` — option C GAS proxy spec (OpenAI gpt-4o-mini with rate limit + cache + kill switch + cost monitoring) — est 3-hour build
- `teacher-brief.html` — 1-page A4 brief referenced in school emails (5-min classroom flow, starter prompt, prizes, FAQ)
- `schools-tracker-template.csv` — 25-row Google Sheets starter (10 T1 + 10 T2 + 5 T3)
- `DAY0_LAUNCH_CHECKLIST.md` — 4-phase runbook (T-7 / T-3 / T-1 / D0) + hourly D0 checkpoints + kill criteria + post-launch cadence
- `SOCIAL_POSTS.md` — 6 pre-drafted IG/FB pillar posts (Day 0 / 1 / 3 / 7 / 14 / 21)

### Workflow
- Self-push via GitHub PAT established
- Heartbeat protocol in HANDOVER.md
- Orchestrator agent pass — 14-item punch-list integrated
- Deck audit pass — H1/H2/M1/M5 fixed, M2/M3/M4 deferred with rationale

## 2026-05-19 · v1
- 派系 rename, hero KV, PROMPT generator, deploy setup
