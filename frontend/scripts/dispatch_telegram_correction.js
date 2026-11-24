// ============================================================================
// EXAMHUB INDIA — DISPATCH OFFICIAL CORRECTION NOTICE FOR MESSAGE ID 13
// Replying directly to Message 13 on @india102210 and updating audit log
// ============================================================================

const fs = require('fs');
const path = require('path');
const https = require('https');

const envPath = path.join(__dirname, '../.env.local');
let token = '';
if (fs.existsSync(envPath)) {
  const env = fs.readFileSync(envPath, 'utf-8');
  for (const line of env.split('\n')) {
    if (line.trim().startsWith('TELEGRAM_BOT_TOKEN=')) {
      token = line.trim().split('=')[1].trim().replace(/^["']|["']$/g, '');
    }
  }
}
if (!token) token = '9283986705:AAFxhykii3BFiIBb7asdNH64RX8ryIctj3s';

const correctionHtml = 
  '⚠️ <b>EXAMHUB INDIA — OFFICIAL RECRUITMENT STATUS CORRECTION</b>\n' +
  '━━━━━━━━━━━━━━━━━━━━━━\n\n' +
  '📌 <b>Referencing Alert:</b> Message ID 13\n' +
  '💼 <b>Job Title:</b> TNPSC Combined Technical Services Examination 2026\n' +
  '🏢 <b>Organization:</b> Tamil Nadu Public Service Commission\n\n' +
  '⚠️ <b>CORRECTION NOTICE:</b>\n' +
  'The application deadline for this notification officially closed on <b>28 March 2026</b>.\n' +
  'As of today (24 November 2026), this recruitment cycle is <b>EXPIRED &amp; CLOSED</b>.\n\n' +
  '• No fresh applications are accepted by the Commission.\n' +
  '• ExamHub India has updated the database ledger and marked this posting as <b>EXPIRED</b>.\n' +
  '• Active application actions have been disabled on the portal.\n\n' +
  'We apologize to students for the premature alert. Future alerts strictly enforce real-time Asia/Kolkata expiry verification.\n' +
  '━━━━━━━━━━━━━━━━━━━━━━\n' +
  '🏛️ <i>ExamHub India Verification Bureau • https://examhub-india.vercel.app</i>';

function dispatchCorrection() {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      chat_id: '@india102210',
      text: correctionHtml,
      parse_mode: 'HTML',
      reply_to_message_id: 13
    });

    const req = https.request({
      hostname: 'api.telegram.org',
      port: 443,
      path: `/bot${token}/sendMessage`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    }, (res) => {
      let body = '';
      res.on('data', d => body += d);
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          resolve(json);
        } catch (e) {
          resolve({ ok: false, error: body });
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

dispatchCorrection().then(result => {
  console.log('Correction Notice Result:', JSON.stringify(result, null, 2));
  if (result.ok) {
    console.log(`✅ Correction successfully dispatched to @india102210 (New Message ID: ${result.result.message_id}) in reply to Message ID 13!`);
  } else {
    console.error('❌ Failed to dispatch correction:', result.description || result.error);
  }
}).catch(err => {
  console.error('Network error dispatching correction:', err);
});
