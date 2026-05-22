# Day 0 Launch Checklist · SITE 多士大對決

**Launch date:** 2026-06-02 (Tuesday) 09:00 HKT
**Reveal date:** 2026-06-23 (Tuesday)

Read top-to-bottom the day before launch. Anything unchecked = blocker.

---

## T-7 (May 26) — one week out

### Infrastructure
- [ ] GitHub Pages enabled on `madkidshk/fairwood_sitetoast` → confirm live at `madkidshk.github.io/fairwood_sitetoast/`
- [ ] DNS for `sitedosi.fairwood.hk` pointed at GitHub Pages (CNAME) — if vanity domain is in scope
- [ ] OG image renders correctly in Facebook Sharing Debugger + WhatsApp link preview
- [ ] Real WhatsApp inquiry number replaces `85299999999` placeholder in `index.html` L3249
- [ ] Canonical email address picked + applied across `index.html`, `VET_BACKEND.md`, `CAMPAIGN_OUTREACH.md` (currently 3 different domains)

### Backend (per VET_BACKEND.md)
- [ ] Apps Script web app deployed → URL recorded in HANDOVER.md
- [ ] Google Sheet `submissions` created + shared with vet team (3 people)
- [ ] Voucher CSV uploaded to `vouchers` tab, count ≥ 30,000
- [ ] 24h SLA hourly cron installed
- [ ] Approve / reject email templates Gmail-tested
- [ ] Moderator dashboard demo run with 10 fake submissions

### Content
- [ ] All 10 sample preview sites (`previews/*.html`) reviewed for typos + faction copy
- [ ] `team-duck.html` + `team-peanut.html` open in battle iframe correctly
- [ ] `how-to.html` + `rules.txt` final-version

### Outreach
- [ ] T1 (24 schools) emails sent 22 May per cadence — confirm reply rate ≥ 30%
- [ ] T2 (50 schools) emails queued for 25 May
- [ ] T3 (30 schools) emails queued for 27 May
- [ ] Schools tracker sheet imported from `schools-tracker-template.csv`
- [ ] KOL contracts signed: 小薯茄 / Mira / 點 Cook Guide / 老 Z / 試當真

---

## T-3 (May 30) — three days out

### Reach + paid
- [ ] Meta Ads campaign drafts loaded: Audience A (懷舊大人) + B (學生) + C (LAL placeholder for D7 activation)
- [ ] Creative review: 6 ad variants (3 traditional / 3 peanut) approved
- [ ] HK$80K (Conservative tier) budget pre-loaded; release plan for Target / Stretch tied to KPI hits per slide 30
- [ ] 信報 op-ed pitch sent; date confirmed (target D7-D14)

### Stores
- [ ] 130+ stores receive in-store kit by Friday 29 May:
  - Receipt back-print plates updated
  - Table cards printed + distributed
  - Drinks station QR posters
  - Cashier briefing card laminated
- [ ] fairwood.com.hk hero banner staged in CMS (not live yet, scheduled 09:00 D0)
- [ ] Fairwood App push notification 1 drafted + scheduled D0 09:30

---

## T-1 (June 1) — night before

### Final smoke test
- [ ] Open live site in Chrome / Safari / mobile Safari / Chrome Android — 4 environments
- [ ] Submit a test entry → verify GAS receives → moderator can approve → email arrives → voucher code issued
- [ ] Gallery filter (全部 / 傳統 / 花生) returns correct entries
- [ ] Side-dots navigation (6 dots) jumps correctly
- [ ] WhatsApp inquiry CTA opens real number with prefilled text
- [ ] Share modal posts to FB / IG-copy / Threads / WhatsApp correctly

### War room
- [ ] WhatsApp group: ops lead + 2 moderators + marketing lead + tech on-call
- [ ] Slack channel #site-多士-launch created if applicable
- [ ] On-call rota: D0 (Tue) 08:00-22:00 covered

### Kill-switch test
- [ ] Set `SUBMISSIONS_PAUSED = true` for 30 sec → verify friendly 503 message → set back to false
- [ ] Set GAS `KILLED = true` for AI prompt proxy → verify fallback to local compose works

---

## D0 (June 2 Tuesday) — launch day

### 09:00
- [ ] CMS scheduled banner goes live on fairwood.com.hk
- [ ] First Instagram post drops (Day 0 launch reveal · two-toast split-screen)
- [ ] Facebook post drops
- [ ] Threads post drops
- [ ] App push notification 1 fires
- [ ] WhatsApp blurb sent to school WhatsApp groups

### 12:00
- [ ] First metrics check: 200+ pageviews on master site, ≥ 10 submissions
- [ ] If submissions < 10 by 14:00 → activate paid retarget burst

### 18:00
- [ ] First daily metrics post (internal Slack) — sites submitted today
- [ ] Sample of 3 best student submissions identified for tomorrow's IG carousel

### 22:00
- [ ] Vet queue zeroed (< 24h SLA on every entry)
- [ ] Tomorrow's IG carousel scheduled
- [ ] Day 0 wrap-up email to ops lead with: total submissions, T1 school reply rate, top 3 sites

---

## Kill criteria (per slide 30)

If any of these hit, ops lead calls emergency review meeting within 4 hours:

- **Day 5** · submissions < 2,000 → add retarget budget + revise hook copy
- **Day 11** · school sign-up < 60 → personal phone calls + ICT lead visits
- **Day 14** · 西多券 redemption < 30% → push + in-store reminders

---

## Post-launch (D1-D21)

Daily 9am stand-up (15 min) covering:
- New submissions yesterday
- Vet SLA status (any > 24h breach)
- School outreach progress
- Paid spend pacing (Conservative / Target / Stretch tier on track?)
- Anything that needs escalation

Weekly Mon 10am 30-min review covering:
- KPI matrix update (slide 30 numbers)
- Kill-criteria status
- KOL drop performance vs expectation
- Next-week paid + content plan

---

## Files referenced

- `index.html` — master site, live
- `team-duck.html` / `team-peanut.html` — battle iframe content
- `previews/*.html` — 10 sample sites
- `how-to.html` / `rules.txt` — public-facing rules
- `teacher-brief.html` — 1-page A4 for school emails
- `schools-tracker-template.csv` — import to Google Sheets
- `VET_BACKEND.md` — vet pipeline spec
- `CAMPAIGN_OUTREACH.md` — email + KOL scripts
- `AI_PROMPT_PROXY.md` — AI prompt option C spec
- `大快活 Site多士 Proposal.html` — 31-slide pitch deck
- `HANDOVER.md` — single source of truth

---

## Contacts (fill before launch)

| Role | Name | Email | WhatsApp |
|---|---|---|---|
| Ops lead | | | |
| Moderator 1 | | | |
| Moderator 2 | | | |
| Marketing lead | | | |
| Tech on-call | | | |
| PR / 信報 contact | | | |
| Fairwood App team | | | |
