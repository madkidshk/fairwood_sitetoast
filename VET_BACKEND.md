# Vet Backend Spec · SITE 多士大對決

Deployable spec for a developer (Apps Script + Google Sheet) to wire the submit form to a moderated gallery with 24-hour SLA.

Owner of this doc: ops lead. Hand to developer. Spec assumes Google Workspace; can swap for Cloudflare Workers + D1 if preferred.

---

## 1 · Architecture

```
[index.html submit form]
        │ POST JSON
        ▼
[Apps Script Web App]  ─────────► [Google Sheet · submissions tab]
        │                                │
        │ (cache vet status)             │ (vet team reviews here)
        ▼                                ▼
[index.html gallery]  ◄───── [Apps Script doGet?status=approved]
                                          │
                                          ▼
                                  [Gmail · approve/reject email]
```

Cost: $0 (Workspace quota). Latency: 1-3 sec POST. Quota: 20K script runs/day (well above expected 30K total submissions / 21 days).

---

## 2 · Submission schema (single sheet row)

| Column | Type | Notes |
|---|---|---|
| `id` | string | UUID generated server-side |
| `created_at` | ISO timestamp | UTC |
| `nickname` | string | 1-20 chars, sanitized |
| `side` | enum | `"duck"` or `"peanut"` |
| `url` | string | https URL, validated |
| `manifesto` | string | optional, 200 chars max |
| `ip_hash` | sha256 | rate-limiting |
| `vet_status` | enum | `"pending"` / `"approved"` / `"rejected"` |
| `vet_reason` | string | filled on reject only |
| `vet_at` | ISO timestamp | when vetted |
| `vet_by` | string | moderator email |
| `featured` | bool | manual flag for 大快活精選 carousel |
| `email` | string | optional user email for voucher redemption |
| `voucher_code` | string | filled when redemption sent |
| `voucher_sent_at` | ISO timestamp | |

---

## 3 · Endpoints

### `POST /` — submit

Body (JSON):
```json
{
  "nickname": "茶記阿仔",
  "side": "duck",
  "url": "https://my-toast-site.vercel.app",
  "manifesto": "西多就係咁。",
  "email": "user@example.com"
}
```

Returns:
```json
{ "ok": true, "id": "abc123", "status": "pending", "sla_hours": 24 }
```

Validations:
- URL must be https, must respond 200 within 5s (do HEAD request)
- nickname ≤ 20 chars, strip HTML
- side ∈ {duck, peanut}
- IP hash rate-limit: 3 submissions per IP per 24h
- Spam check: reject if URL domain in blocklist

### `GET /?status=approved&side=duck&limit=20` — list gallery

Returns array of approved entries for the gallery iframe carousel. Cache headers: `max-age=60`.

### `GET /?id=abc123` — submission status

User can check their submission status. Returns `{ status, vet_reason?, public_url? }`.

### `POST /admin/vet` — approve/reject (auth required)

Body:
```json
{ "id": "abc123", "decision": "approved", "reason": "" }
```

Trigger: sends email to user, marks `vet_status`, fills `voucher_code` if approved.

---

## 4 · 24-hour SLA tracker

A separate Apps Script time-trigger runs every hour. It:

1. Counts rows where `vet_status = "pending"` AND `created_at < now - 24h`
2. If count > 0, sends Slack/email alert to ops lead
3. Auto-tags those rows `vet_flag = "SLA_BREACH"` in column N for moderator dashboard

Pseudo-code:
```javascript
function checkSLA() {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('submissions');
  const rows = sheet.getDataRange().getValues();
  const now = Date.now();
  let breached = [];
  for (let i = 1; i < rows.length; i++) {
    const [id, created_at, , , , , , vet_status] = rows[i];
    if (vet_status === 'pending' && (now - new Date(created_at).getTime()) > 24*3600*1000) {
      breached.push(id);
    }
  }
  if (breached.length) {
    MailApp.sendEmail({
      to: 'ops-lead@fairwood.com.hk',
      subject: `[SITE 多士] ${breached.length} pending submissions > 24h`,
      body: 'IDs: ' + breached.join(', ')
    });
  }
}
```

---

## 5 · Email templates

### Approve

```
Subject: 你嘅 site 已經上架啦！🎉

[nickname] 你好，

多謝你撐 [side==duck ? "傳統" : "花生"] 派！你嘅 site 已經上咗大快活「SITE 多士大對決」嘅 gallery：

▸ 睇你嘅作品：https://madkidshk.github.io/fairwood_sitetoast/#gallery
▸ 你嘅 site URL：[url]

獎品：HK$10 大快活 App 西多券已 send 入你個 App。Code：[voucher_code]
* 7 日內任何分店可用
* 一個 user 一張

share 出去拉多啲人嚟：[share_url]

#SITE多士大對決 #一SITE一票 #起SITE表態
```

### Reject

```
Subject: 你嘅 site 暫時未過審

[nickname] 你好，

多謝你 submit。不過你嘅 site 暫時未過審：
原因：[vet_reason]

你可以執返再 submit 一次（無 limit）。
有問題 WhatsApp [number] 問我哋。

#SITE多士大對決
```

---

## 6 · Moderator workflow

1. Moderator opens Google Sheet (filter `vet_status = pending`)
2. Click URL column → reviews live site
3. Use spreadsheet sidebar (custom menu: SITE 多士 → Approve / Reject)
4. Approve: voucher_code auto-fills, email auto-sends, gallery cache invalidates
5. Reject: type reason, email auto-sends

Custom menu code:
```javascript
function onOpen() {
  SpreadsheetApp.getUi().createMenu('SITE 多士')
    .addItem('Approve selected', 'approveRow')
    .addItem('Reject selected', 'rejectRow')
    .addToUi();
}
```

Target throughput: 1 moderator handles ~300 submissions/hour (scan + click).

For Target KPI (30K submissions over 21 days = ~1,400/day), need 5 hours of moderator time daily — sustainable for 1 part-time.

---

## 7 · Gallery integration (index.html side)

The existing gallery code expects a JSON array. Change the `fetch()` call to point at the GAS endpoint:

```javascript
// in index.html, replace hard-coded preview list:
fetch('https://script.google.com/macros/s/AKfycb.../exec?status=approved')
  .then(r => r.json())
  .then(items => renderGallery(items));
```

Side filter dropdown already exists — just pass `&side=duck` or `&side=peanut`.

Cache strategy: `Cache-Control: max-age=60` on GET prevents quota burn. Vet status changes propagate within 60s.

---

## 8 · Voucher distribution

Approach: pre-generate 30,000 unique codes (CSV upload to Sheet `vouchers` tab, columns: `code`, `assigned_to`, `redeemed_at`). On approve, script grabs first unassigned, fills user's row.

Coordinate with Fairwood App team to import the CSV into their promo code system before Day 0 launch.

---

## 9 · Kill switches

- **Spam burst**: env var `SUBMISSIONS_PAUSED = true` returns 503 with friendly message
- **URL HEAD failures spike**: if >30% in last hour, disable URL validation temporarily
- **Vet queue > 5,000**: auto-pause new submissions, show "暫時排緊隊，等等" banner

---

## 10 · Day-0 launch checklist

- [ ] Apps Script web app deployed, URL recorded in HANDOVER.md
- [ ] Sheet sharing: edit access to vet team (3 people), view-only to ops lead
- [ ] CSP allowlist on index.html: `script-src script.google.com`
- [ ] CORS: GAS doPost returns `Access-Control-Allow-Origin: *` (or restrict to live domain)
- [ ] Voucher CSV uploaded, count ≥ 30,000
- [ ] SLA trigger installed (hourly)
- [ ] Approve / reject email templates Gmail-tested
- [ ] Moderator dashboard demo run with 10 fake submissions
- [ ] Kill switch tested

---

## 11 · Estimated build time

Solo developer familiar with Apps Script: **2 days** (1 day coding, 1 day testing + integration).

If team prefers Cloudflare Workers + D1: **3 days** (more code, but better long-term ops).
