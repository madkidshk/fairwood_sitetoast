/**
 * SITE 多士大對決 · 學校 Email 自動收集
 * ════════════════════════════════════════════
 *
 * 用法：
 *  1. 開新 Google Sheet
 *  2. 由 EDB 下載學校 directory（https://www.edb.gov.hk → School Lists）
 *     將 column A=學校名、column B=網址 入 Sheet
 *  3. 開 Extensions → Apps Script，貼入呢段 code
 *  4. 喺 Script properties 入面 set CLAUDE_API_KEY
 *  5. Run scrapeAllSchools()。每間學校 trying 5-10 秒。
 *  6. 結果寫回 Sheet column C-F：general email / IT email / 校長 email / notes
 *
 * 預計：
 *  · 1,065 間學校 × 8 秒 ≈ 2.4 小時 跑完
 *  · ~70% 學校有可 extract 嘅 email
 *  · Claude API cost：~HK$50 一次過跑完
 *
 *  喺 7 分鐘到 1 小時 review + Mailchimp / Brevo bulk send，3 日內 reach 850+ 學校。
 */

const CLAUDE_API_KEY = PropertiesService.getScriptProperties().getProperty('CLAUDE_API_KEY');
const CLAUDE_MODEL = 'claude-haiku-4-5';

/* ════════════════════════════ MAIN ════════════════════════════ */

function scrapeAllSchools(){
  const sheet = SpreadsheetApp.getActiveSheet();
  const data = sheet.getDataRange().getValues();

  // Header
  if (data[0][2] !== 'general_email') {
    sheet.getRange(1, 3, 1, 4).setValues([
      ['general_email', 'it_teacher_email', 'principal_email', 'notes']
    ]);
  }

  // Loop rows (skip header)
  for (let i = 1; i < data.length; i++){
    const [schoolName, url] = data[i];
    if (!url) continue;
    if (sheet.getRange(i + 1, 3).getValue()) continue;  // already done, skip

    Logger.log(`[${i}/${data.length}] ${schoolName}`);

    try {
      const result = scrapeOneSchool(schoolName, url);
      sheet.getRange(i + 1, 3, 1, 4).setValues([[
        result.general || '',
        result.it_teacher || '',
        result.principal || '',
        result.notes || ''
      ]]);
    } catch(e) {
      sheet.getRange(i + 1, 6).setValue('ERROR: ' + e.message);
    }

    SpreadsheetApp.flush();
    Utilities.sleep(1500);  // be nice to school servers
  }
}

/* ════════════════════════ SCRAPE ONE SCHOOL ════════════════════════ */

function scrapeOneSchool(schoolName, url) {
  // 1. Fetch homepage HTML
  const html = fetchAndStrip(url);

  // 2. Try direct regex first (cheap path)
  const emails = extractEmails(html);

  // 3. Also try "Contact Us" sub-page if homepage has few emails
  let contactHtml = '';
  if (emails.length < 2) {
    const contactUrl = findContactUrl(html, url);
    if (contactUrl) contactHtml = fetchAndStrip(contactUrl);
  }

  const allEmails = [...new Set([...emails, ...extractEmails(contactHtml)])];

  // 4. Ask Claude to classify which is which
  if (allEmails.length === 0) {
    return { notes: 'No email found' };
  }

  return classifyEmailsWithClaude(schoolName, allEmails, html + contactHtml);
}

/* ════════════════════════ HELPERS ════════════════════════ */

function fetchAndStrip(url) {
  try {
    const res = UrlFetchApp.fetch(url, {
      muteHttpExceptions: true,
      followRedirects: true,
      validateHttpsCertificates: false,
    });
    if (res.getResponseCode() >= 400) return '';
    return res.getContentText()
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')   // strip tags
      .replace(/\s+/g, ' ')
      .substring(0, 15000);
  } catch (e) {
    return '';
  }
}

function extractEmails(text) {
  const re = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(edu\.hk|edu|com\.hk|org\.hk|hk)/g;
  return text.match(re) || [];
}

function findContactUrl(html, baseUrl) {
  // Find link with 聯絡 / contact / about
  const linkRe = /<a[^>]+href="([^"]+)"[^>]*>([^<]+)<\/a>/gi;
  let m;
  while ((m = linkRe.exec(html)) !== null) {
    if (/聯絡|聯絡我們|contact|聯繫/i.test(m[2])) {
      try {
        return new URL(m[1], baseUrl).href;
      } catch {}
    }
  }
  return null;
}

function classifyEmailsWithClaude(schoolName, emails, context) {
  const prompt = `學校：${schoolName}
搵到嘅 email 地址：${emails.join(', ')}

網頁內容 (節錄)：
${context.substring(0, 4000)}

請從以上 email 入面，分類：
1. general_email: 學校 general info inbox（通常 info@、enquiry@）
2. it_teacher_email: 電腦科 / 資訊及通訊科技科主任 / STEM 統籌 email（如果有）
3. principal_email: 校長 / 副校長 email（如果有）
4. notes: 任何相關 observation

回答只用呢個 JSON format（唔好其他文字）：
{"general_email":"...","it_teacher_email":"...","principal_email":"...","notes":"..."}`;

  const res = UrlFetchApp.fetch('https://api.anthropic.com/v1/messages', {
    method: 'post',
    contentType: 'application/json',
    headers: {
      'x-api-key': CLAUDE_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    payload: JSON.stringify({
      model: CLAUDE_MODEL,
      max_tokens: 300,
      messages: [{ role: 'user', content: prompt }],
    }),
    muteHttpExceptions: true,
  });

  try {
    const reply = JSON.parse(res.getContentText());
    const text = reply.content[0].text.trim();
    return JSON.parse(text);
  } catch (e) {
    return { general: emails[0] || '', notes: 'Parse error: ' + e.message };
  }
}

/* ═══════════════════════════════════════════════════════════════
 *  TEST RUN (single school) — call呢個 function 試一試先
 * ═══════════════════════════════════════════════════════════════ */

function testOneSchool(){
  const result = scrapeOneSchool('皇仁書院', 'https://www.qc.edu.hk/');
  Logger.log(JSON.stringify(result, null, 2));
}
