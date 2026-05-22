# AI Prompt Proxy Spec · Option C

GAS proxy spec that lets the prompt generator make a real LLM call to produce site-specific copy without exposing the OpenAI key client-side. Optional v2 enhancement — current generator (Option A · chip-based local compose) already works without this.

---

## 1 · Why a proxy

- Hide OpenAI API key from `index.html` (otherwise scraped instantly)
- Enforce daily $ cap to avoid abuse
- Cache identical (TOAST × chips) inputs to dedupe cost
- Provide kill switch

---

## 2 · Architecture

```
[index.html · "AI 升級" button]
        │ POST JSON: { toast, side, reasons, styles, persona }
        ▼
[GAS web app · /generate]
        │ rate-limit check (IP + global daily $)
        │ cache lookup (hash of inputs)
        ▼
[OpenAI /v1/chat/completions · gpt-4o-mini]
        │
        ▼
[Sheet · ai_log tab] ─────► (txid, ip, hash, tokens, $$$, ts)
        │
        ▼
[response JSON to index.html]
```

Estimated cost (gpt-4o-mini): $0.15 input + $0.6 output per 1M tokens. Average call: 600 input + 800 output tokens = $0.0005. Daily 1,000 calls = $0.50.

Set `MAX_DAILY_USD = 5` → ~10,000 calls/day ceiling.

---

## 3 · GAS endpoint

```javascript
// Code.gs
const OPENAI_KEY = PropertiesService.getScriptProperties().getProperty('OPENAI_KEY');
const MAX_DAILY_USD = 5;
const MAX_PER_IP_PER_HOUR = 6;
const CACHE_TTL_SEC = 86400; // 1 day

function doPost(e) {
  const body = JSON.parse(e.postData.contents);
  const { toast, side, reasons, styles, persona } = body;

  // 1. global kill switch
  if (PropertiesService.getScriptProperties().getProperty('KILLED') === 'true') {
    return _json({ ok: false, reason: 'paused' });
  }

  // 2. daily $ check
  const todayUsd = parseFloat(CacheService.getScriptCache().get('today_usd') || '0');
  if (todayUsd > MAX_DAILY_USD) {
    return _json({ ok: false, reason: 'daily_cap' });
  }

  // 3. per-IP rate limit
  const ip = e.parameter.ip || 'unknown';
  const ipKey = `ip_${ip}_${Math.floor(Date.now() / 3600000)}`;
  const ipCount = parseInt(CacheService.getScriptCache().get(ipKey) || '0');
  if (ipCount >= MAX_PER_IP_PER_HOUR) {
    return _json({ ok: false, reason: 'ip_limit' });
  }
  CacheService.getScriptCache().put(ipKey, String(ipCount + 1), 3600);

  // 4. cache lookup
  const cacheKey = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    JSON.stringify({ toast, side, reasons: reasons.sort(), styles: styles.sort() })
  ).map(b => (b < 0 ? b + 256 : b).toString(16).padStart(2, '0')).join('');

  const cached = CacheService.getScriptCache().get(`gen_${cacheKey}`);
  if (cached) return _json({ ok: true, output: cached, cached: true });

  // 5. OpenAI call
  const systemPrompt = SYSTEM_PROMPT;
  const userPrompt = buildUserPrompt({ toast, side, reasons, styles, persona });

  const resp = UrlFetchApp.fetch('https://api.openai.com/v1/chat/completions', {
    method: 'post',
    headers: { 'Authorization': `Bearer ${OPENAI_KEY}` },
    contentType: 'application/json',
    payload: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 1200
    }),
    muteHttpExceptions: true
  });

  if (resp.getResponseCode() !== 200) {
    return _json({ ok: false, reason: 'openai_error', detail: resp.getContentText() });
  }

  const data = JSON.parse(resp.getContentText());
  const output = data.choices[0].message.content;
  const tokensIn = data.usage.prompt_tokens;
  const tokensOut = data.usage.completion_tokens;
  const cost = (tokensIn * 0.15 + tokensOut * 0.6) / 1e6;

  // 6. cache + log
  CacheService.getScriptCache().put(`gen_${cacheKey}`, output, CACHE_TTL_SEC);
  const newTodayUsd = todayUsd + cost;
  CacheService.getScriptCache().put('today_usd', String(newTodayUsd), 86400);

  const sheet = SpreadsheetApp.openById(AI_LOG_SHEET_ID).getSheetByName('ai_log');
  sheet.appendRow([new Date(), ip, cacheKey, tokensIn, tokensOut, cost, toast, side]);

  return _json({ ok: true, output, cached: false });
}

function _json(o) {
  return ContentService.createTextOutput(JSON.stringify(o))
    .setMimeType(ContentService.MimeType.JSON);
}
```

---

## 4 · SYSTEM_PROMPT

```
你係一個熟悉 Hong Kong culture 嘅 senior product designer。用戶會 send 一份 spec 畀你，包括：

- 一隻特定西多（傳統 / 花生派）
- 揀咗嘅論點 keyword（分 category 嘅）
- 揀咗嘅風格 keyword（分 category 嘅）
- 一個 persona 提示

你嘅工作：output 一個完整 prompt 畀 user paste 入 Lovable / Claude / GPT 建立一個 single-page Hong Kong-flavoured website。

Rules：
1. 全部用 Cantonese 繁體中文（香港用法）。可以混合少量英文（OG / vibes / aesthetic 等技術詞 OK）。
2. Output 必須包括：hero manifesto（punchy 一句 + 視覺指示）、5 條論點 grid、1 個 testimonial（用提供嘅 persona 口吻）、1 個對家 callout、CTA、footer。
3. Tone 要 sound natural HK insider 寫，禁忌 mainland 字眼（質量、視頻 → 用 quality、video）。
4. 整個 output 1,000–1,400 字。
5. 唔好回覆「以下係 prompt」之類嘅 framing，直接 output prompt body。
```

---

## 5 · User prompt construction (in GAS)

```javascript
function buildUserPrompt({ toast, side, reasons, styles, persona }) {
  const reasonsLines = Object.entries(reasons).map(
    ([cat, items]) => `【${cat}】${items.join('、')}`
  ).join('\n');
  const stylesLines = Object.entries(styles).map(
    ([cat, items]) => `【${cat}】${items.join('、')}`
  ).join('\n');

  return `
主角西多：${toast.name}（${side}派）
描述：${toast.desc}

論述角度：
${reasonsLines}

視覺風格：
${stylesLines}

Testimonial persona：${persona}

請按 SYSTEM_PROMPT 嘅規範，整理一個完整 prompt 畀 user。
`;
}
```

---

## 6 · index.html client-side hook

Add an "AI 升級 prompt" button next to the existing 「生成 prompt」button:

```html
<button id="hgGenAI" class="hg-btn hg-btn-ai" type="button">✨ AI 升級</button>
```

JS (slot in after current `compose()`):

```javascript
const GAS_PROMPT_ENDPOINT = 'https://script.google.com/macros/s/AKfycb.../exec';

document.getElementById('hgGenAI').addEventListener('click', async () => {
  const t = TOASTS[toastIdx];
  const rs = Array.from(selReasons);
  const ss = Array.from(selStyles);

  if (rs.length === 0 || ss.length === 0) {
    alert('揀少少 keyword 先試 AI 升級。');
    return;
  }

  const btn = document.getElementById('hgGenAI');
  btn.disabled = true;
  btn.textContent = '✨ AI 諗緊...';

  const payload = {
    toast: { name: t.name, desc: t.desc },
    side: t.side === 'duck' ? '傳統' : '花生',
    reasons: groupSelected(rs, REASONS_GROUPS),
    styles: groupSelected(ss, STYLES_GROUPS),
    persona: personaFromReasons(rs)
  };

  try {
    const resp = await fetch(GAS_PROMPT_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' }, // GAS quirk for CORS
      body: JSON.stringify(payload)
    });
    const data = await resp.json();
    if (data.ok) {
      document.getElementById('hgPrompt').textContent = data.output;
      document.getElementById('hgMeta').textContent =
        '✨ AI 升級版 · ' + (data.cached ? 'cached' : 'fresh') + ' · ' +
        new Date().toLocaleTimeString('zh-HK', { hour: '2-digit', minute: '2-digit' });
      document.getElementById('hgOutput').hidden = false;
    } else if (data.reason === 'daily_cap' || data.reason === 'paused') {
      alert('AI 升級今日已滿，用返普通版本啦。');
      compose('user'); // fallback to local compose
    } else if (data.reason === 'ip_limit') {
      alert('幾分鐘後再試。');
    } else {
      compose('user'); // any other error → local compose
    }
  } catch (e) {
    compose('user'); // network error → fallback
  } finally {
    btn.disabled = false;
    btn.textContent = '✨ AI 升級';
  }
});
```

---

## 7 · Deployment steps

1. Create new Google Sheet, get ID, rename tab `ai_log`. Header row: `ts | ip | hash | tokens_in | tokens_out | usd | toast | side`
2. Apps Script project, paste `Code.gs` above
3. Properties → set `OPENAI_KEY` = (your sk-...)
4. Constants → set `AI_LOG_SHEET_ID` = (sheet ID)
5. Deploy as Web App, "Execute as: me", "Access: Anyone with link"
6. Copy URL, paste into `GAS_PROMPT_ENDPOINT` in index.html
7. Test: open prompt generator, click "AI 升級", verify response in 3-5 sec
8. Monitor `ai_log` sheet for first hour to confirm cost projections

---

## 8 · Kill switch

If quota goes wild:

```
Properties → set KILLED = true
```

Or set `MAX_DAILY_USD = 0`. Either change takes effect on next call (no cache invalidate needed).

---

## 9 · Cost monitoring

Daily Apps Script trigger at 23:50:

```javascript
function dailyCostReport() {
  const sheet = SpreadsheetApp.openById(AI_LOG_SHEET_ID).getSheetByName('ai_log');
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const rows = sheet.getDataRange().getValues();
  let count = 0, usd = 0;
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] >= today) { count++; usd += rows[i][5]; }
  }
  MailApp.sendEmail({
    to: 'ops-lead@fairwood.com.hk',
    subject: `[SITE 多士] AI proxy day ${today.toDateString()}: ${count} calls, $${usd.toFixed(2)}`,
    body: `Calls: ${count}\nCost: $${usd.toFixed(2)}\nCap: $${MAX_DAILY_USD}`
  });
}
```

---

## 10 · Estimated build + integration time

GAS endpoint: 90 min. index.html wiring: 30 min. Test + deploy: 60 min. **Total: 3 hours.**

Lower priority than VET_BACKEND.md — only enable after vet pipeline is live + Day 0 traction confirmed.
