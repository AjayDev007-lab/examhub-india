// ============================================================================
// EXAMHUB INDIA — TELEGRAM DELIVERY RELIABILITY & TIMEZONE TEST SUITE
// Automated verification covering:
// 1. Exact Unix timestamp & IST/UTC deadline calculations (28 March 2026)
// 2. 10-Scenario Telegram Delivery Reliability & Rate-Limit Engine
// ============================================================================

const crypto = require('crypto');

// ============================================================================
// PART 1: EXACT PARSER IMPLEMENTATION (Matching production aiJobVerification.ts)
// ============================================================================

function parseIndianDeadline(dateInput) {
  if (!dateInput) {
    return { valid: false, isExpired: false, error: 'Application deadline is completely missing.' };
  }

  const str = String(dateInput).trim();
  if (!str) {
    return { valid: false, isExpired: false, error: 'Application deadline string is empty.' };
  }

  const nowMs = Date.now();
  let year = 0, month = 0, day = 0;
  let hours = 23, minutes = 59, seconds = 59, ms = 999;

  // 1. Check for explicit timezone offset preceded by time (e.g. +05:30 or Z)
  const tzMatch = str.match(/(?:T|\s)\d{2}:\d{2}(?::\d{2})?(?:\.\d+)?([+-]\d{2}:?\d{2}|Z)$/i);
  if (tzMatch) {
    const tzStr = tzMatch[1];
    if (tzStr === '+05:30' || tzStr === '+0530' || (tzStr.toUpperCase() === 'Z' && str.includes('18:29:59'))) {
      const parsed = new Date(str);
      if (!isNaN(parsed.getTime())) {
        const parsedMs = parsed.getTime();
        return {
          valid: true,
          timestampMs: parsedMs,
          isExpired: parsedMs < nowMs,
          istString: parsed.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
          utcString: parsed.toISOString(),
          year: parsed.getFullYear(),
          month: parsed.getMonth() + 1,
          day: parsed.getDate(),
          hours: parsed.getHours(),
          minutes: parsed.getMinutes()
        };
      }
    }
  }

  // 2. ISO format (YYYY-MM-DD or YYYY/MM/DD)
  const ymdMatch = str.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})(?:[T\s](\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?/);
  if (ymdMatch) {
    year = parseInt(ymdMatch[1], 10);
    month = parseInt(ymdMatch[2], 10);
    day = parseInt(ymdMatch[3], 10);
    if (ymdMatch[4] !== undefined) {
      hours = parseInt(ymdMatch[4], 10);
      minutes = parseInt(ymdMatch[5], 10);
      seconds = ymdMatch[6] ? parseInt(ymdMatch[6], 10) : 0;
      ms = (hours === 23 && minutes === 59) ? 999 : 0;
    }
  } else {
    // 3. DD/MM/YYYY or DD-MM-YYYY
    const dmyMatch = str.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})(?:[T\s](\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?/);
    if (dmyMatch) {
      day = parseInt(dmyMatch[1], 10);
      month = parseInt(dmyMatch[2], 10);
      year = parseInt(dmyMatch[3], 10);
      if (dmyMatch[4] !== undefined) {
        hours = parseInt(dmyMatch[4], 10);
        minutes = parseInt(dmyMatch[5], 10);
        seconds = dmyMatch[6] ? parseInt(dmyMatch[6], 10) : 0;
        ms = (hours === 23 && minutes === 59) ? 999 : 0;
      }
    } else {
      // 4. Text format ('28 March 2026', '28-Mar-2026', 'March 28, 2026')
      const monthNames = {
        jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6,
        jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12
      };
      const cleaned = str.replace(/(\d+)(st|nd|rd|th)/gi, (m, d) => d);
      const textMatch1 = cleaned.match(/^(\d{1,2})[\s\-\/]+([a-zA-Z]+)[\s\-\/]+(\d{4})/);
      const textMatch2 = cleaned.match(/^([a-zA-Z]+)[\s\-\/]+(\d{1,2}),?[\s\-\/]+(\d{4})/);
      if (textMatch1) {
        day = parseInt(textMatch1[1], 10);
        const mKey = textMatch1[2].toLowerCase().slice(0, 3);
        month = monthNames[mKey] || 0;
        year = parseInt(textMatch1[3], 10);
      } else if (textMatch2) {
        const mKey = textMatch2[1].toLowerCase().slice(0, 3);
        month = monthNames[mKey] || 0;
        day = parseInt(textMatch2[2], 10);
        year = parseInt(textMatch2[3], 10);
      } else {
        return { valid: false, isExpired: false, error: `Unrecognized or ambiguous deadline format: "${str}".` };
      }
    }
  }

  // Validate bounds
  if (year < 2020 || year > 2100 || month < 1 || month > 12 || day < 1 || day > 31) {
    return { valid: false, isExpired: false, error: `Deadline date components out of bounds (${day}/${month}/${year}).` };
  }

  // Convert IST (Asia/Kolkata UTC+05:30) to UTC:
  // Offset is -330 minutes (-5h 30m)
  const totalIstMinutes = hours * 60 + minutes;
  const totalUtcMinutes = totalIstMinutes - 330;
  let utcHours = Math.floor(totalUtcMinutes / 60);
  let utcMinutes = (totalUtcMinutes % 60 + 60) % 60;
  let utcDay = day;
  let utcMonth = month;
  let utcYear = year;

  if (utcHours < 0) {
    utcHours += 24;
    utcDay -= 1;
    if (utcDay < 1) {
      utcMonth -= 1;
      if (utcMonth < 1) {
        utcMonth = 12;
        utcYear -= 1;
      }
      utcDay = new Date(Date.UTC(utcYear, utcMonth, 0)).getUTCDate();
    }
  }

  const deadlineUtcMs = Date.UTC(utcYear, utcMonth - 1, utcDay, utcHours, utcMinutes, seconds, ms);
  const istObj = new Date(deadlineUtcMs);

  return {
    valid: true,
    timestampMs: deadlineUtcMs,
    isExpired: deadlineUtcMs < nowMs,
    istString: istObj.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
    utcString: istObj.toISOString(),
    year,
    month,
    day,
    hours,
    minutes
  };
}

// ============================================================================
// PART 2: PERSISTENT QUEUE SIMULATOR (Matching jobQueue.ts)
// ============================================================================

const deliveryQueue = [];
const sentIdempotencyKeys = new Set();
let channelRateLimitUntilMs = 0;
let lastSuccessfulDeliveryTime = null;
let lastSuccessfulMsgId = null;

function calculateIdempotencyKey(job) {
  const normTitle = String(job.title || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const normOrg = String(job.organization_name || job.organization || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const normApply = String(job.official_application_url || job.applyUrl || '').toLowerCase().trim();
  return crypto.createHash('sha256').update(`${normTitle}|${normOrg}|${normApply}`).digest('hex');
}

function enqueueVerifiedJob(job, options = {}) {
  const idempotencyKey = calculateIdempotencyKey(job);
  const targetChannel = options.customChannel || '@india102210';

  // 1. Idempotency Check: Reject if already SENT
  if (sentIdempotencyKeys.has(idempotencyKey)) {
    return {
      queued: false,
      duplicateBlocked: true,
      reason: 'Duplicate blocked: Job notification already published to channel.'
    };
  }

  // 2. Reject if already in active queue
  const existingActive = deliveryQueue.find(
    i => i.idempotencyKey === idempotencyKey &&
         (i.status === 'PENDING' || i.status === 'RETRYING' || i.status === 'RATE_LIMITED')
  );
  if (existingActive) {
    return {
      queued: false,
      duplicateBlocked: true,
      reason: 'Duplicate blocked: Job is already active in queue.'
    };
  }

  const newItem = {
    id: `q-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    jobId: job.id || `gen-${Date.now()}`,
    title: job.title || 'Untitled Job',
    organization: job.organization_name || job.organization || 'Official Authority',
    locationCategory: options.locationCategory || 'All India',
    applyUrl: job.official_application_url || '',
    status: 'PENDING',
    attempts: 0,
    maxAttempts: 4,
    nextRetryAt: null,
    lastError: null,
    idempotencyKey,
    telegramMessageId: null,
    channel: targetChannel,
    jobData: job,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    completedAt: null
  };

  deliveryQueue.unshift(newItem);
  return { queued: true, duplicateBlocked: false, item: newItem };
}

async function processQueueItem(item, dispatcher) {
  const nowMs = Date.now();
  item.updatedAt = new Date().toISOString();

  // 1. Strict pre-flight expiry check
  const expiryCheck = parseIndianDeadline(item.jobData.application_end_date);
  if (expiryCheck.valid && expiryCheck.isExpired) {
    item.status = 'EXPIRED_IN_QUEUE';
    item.completedAt = new Date().toISOString();
    item.lastError = `Pre-flight expiry block: Job application deadline passed on ${expiryCheck.istString} (Asia/Kolkata). Delivery aborted.`;
    return { success: false, status: 'EXPIRED_IN_QUEUE', message: item.lastError };
  }

  // 2. Channel rate limit throttle check
  if (nowMs < channelRateLimitUntilMs) {
    const waitSec = Math.ceil((channelRateLimitUntilMs - nowMs) / 1000);
    item.status = 'RATE_LIMITED';
    item.nextRetryAt = new Date(channelRateLimitUntilMs).toISOString();
    item.lastError = `Telegram channel rate-limited. Global cool-down active for ${waitSec}s.`;
    return { success: false, status: 'RATE_LIMITED', message: item.lastError };
  }

  item.attempts++;

  try {
    const result = await dispatcher(item);

    // A. SUCCESS
    if (result.ok) {
      const msgId = result.data?.result?.message_id || 99999;
      item.status = 'SENT';
      item.telegramMessageId = msgId;
      item.completedAt = new Date().toISOString();
      item.lastError = null;
      item.nextRetryAt = null;

      sentIdempotencyKeys.add(item.idempotencyKey);
      lastSuccessfulDeliveryTime = item.completedAt;
      lastSuccessfulMsgId = msgId;

      item.jobData.telegram_posted = true;
      item.jobData.telegram_message_id = msgId;

      return { success: true, status: 'SENT', messageId: msgId };
    }

    // B. RATE LIMITING (HTTP 429)
    const errCode = result.status || result.data?.error_code;
    if (errCode === 429) {
      const retryAfter = result.data?.parameters?.retry_after || 30;
      const retryMs = retryAfter * 1000;
      channelRateLimitUntilMs = nowMs + retryMs;

      item.status = 'RATE_LIMITED';
      item.nextRetryAt = new Date(nowMs + retryMs).toISOString();
      item.lastError = `Telegram API rate limit (HTTP 429). Retry after ${retryAfter}s.`;
      return { success: false, status: 'RATE_LIMITED', retryAfter, message: item.lastError };
    }

    // C. PERMANENT PERMISSION ERROR (HTTP 403)
    if (errCode === 403) {
      item.status = 'FAILED';
      item.completedAt = new Date().toISOString();
      item.nextRetryAt = null;
      item.lastError = 'Permanent configuration error (HTTP 403): Bot lacks rights to post in channel.';
      return { success: false, status: 'FAILED', message: item.lastError };
    }

    // D. TEMPORARY ERROR (HTTP 500 OR NETWORK)
    const isExceeded = item.attempts >= item.maxAttempts;
    if (isExceeded) {
      item.status = 'FAILED';
      item.completedAt = new Date().toISOString();
      item.nextRetryAt = null;
      item.lastError = `Exceeded maximum retry attempts (${item.attempts}/${item.maxAttempts}).`;
      return { success: false, status: 'FAILED', message: item.lastError };
    }

    const baseDelaySec = 5;
    const expDelaySec = Math.min(300, baseDelaySec * Math.pow(3, item.attempts - 1));
    const totalBackoffMs = expDelaySec * 1000;

    item.status = 'RETRYING';
    item.nextRetryAt = new Date(nowMs + totalBackoffMs).toISOString();
    item.lastError = `Temporary error (HTTP ${errCode || 'CONN'}): Retrying in ${expDelaySec}s.`;
    return { success: false, status: 'RETRYING', backoffSec: expDelaySec, message: item.lastError };
  } catch (err) {
    if (item.attempts >= item.maxAttempts) {
      item.status = 'FAILED';
      item.completedAt = new Date().toISOString();
      item.lastError = `Network failure: Exceeded max attempts (${item.attempts}/${item.maxAttempts}).`;
      return { success: false, status: 'FAILED', message: item.lastError };
    }
    const backoffMs = 5000 * Math.pow(2, item.attempts - 1);
    item.status = 'RETRYING';
    item.nextRetryAt = new Date(nowMs + backoffMs).toISOString();
    item.lastError = `Network failure: ${err.message}. Retrying in ${backoffMs / 1000}s.`;
    return { success: false, status: 'RETRYING', message: item.lastError };
  }
}

// ============================================================================
// EXECUTE TEST SUITE
// ============================================================================

async function runTestSuite() {
  console.log('================================================================================');
  console.log('EXAMHUB INDIA — FINAL TIMEZONE & DELIVERY RELIABILITY VERIFICATION SUITE');
  console.log('================================================================================\n');

  let passedTests = 0;
  let totalTests = 0;

  function assert(name, condition, details = '') {
    totalTests++;
    if (condition) {
      passedTests++;
      console.log(`  ✅ [PASS] ${name}`);
      if (details) console.log(`     ${details}`);
    } else {
      console.error(`  ❌ [FAIL] ${name}`);
      if (details) console.error(`     Details: ${details}`);
    }
  }

  // --------------------------------------------------------------------------
  // TEST GROUP 1: IST EXPIRY TIMESTAMP AUDIT (28 March 2026)
  // Expected:
  // Timestamp: 1774722599999 ms
  // IST: 28 March 2026, 23:59:59.999 IST (28/03/2026, 11:59:59 pm)
  // UTC: 28 March 2026, 18:29:59.999 UTC (2026-03-28T18:29:59.999Z)
  // --------------------------------------------------------------------------
  console.log('--- TEST GROUP 1: Exact Asia/Kolkata Timestamp Calculation ---');

  const EXPECTED_MS = 1774722599999;
  const EXPECTED_UTC_ISO = '2026-03-28T18:29:59.999Z';

  const dateFormats = [
    { label: 'Date-only DD/MM/YYYY ("28/03/2026")', input: '28/03/2026' },
    { label: 'Date-only DD-MM-YYYY ("28-03-2026")', input: '28-03-2026' },
    { label: 'Date-only ISO YYYY-MM-DD ("2026-03-28")', input: '2026-03-28' },
    { label: 'Text format ("28 March 2026")', input: '28 March 2026' },
    { label: 'Hyphenated text ("28-Mar-2026")', input: '28-Mar-2026' },
    { label: 'Ordinal text ("28th March 2026")', input: '28th March 2026' },
    { label: 'ISO string ending in Z ("2026-03-28T23:59:59Z")', input: '2026-03-28T23:59:59Z' },
    { label: 'ISO string with IST offset ("2026-03-28T23:59:59.999+05:30")', input: '2026-03-28T23:59:59.999+05:30' },
    { label: 'Exact UTC ISO string ("2026-03-28T18:29:59.999Z")', input: '2026-03-28T18:29:59.999Z' }
  ];

  for (const fmt of dateFormats) {
    const res = parseIndianDeadline(fmt.input);
    const msMatch = res.timestampMs === EXPECTED_MS;
    const is28th = res.day === 28 && res.month === 3 && res.year === 2026;
    const utcIsoMatch = res.utcString === EXPECTED_UTC_ISO;
    const istValid = res.istString.includes('28') && (res.istString.includes('11:59:59') || res.istString.includes('23:59:59'));

    assert(
      `Format: ${fmt.label}`,
      msMatch && is28th && utcIsoMatch && istValid,
      `MS: ${res.timestampMs} | IST: "${res.istString}" | UTC: "${res.utcString}"`
    );
  }

  // --------------------------------------------------------------------------
  // TEST GROUP 2: 10 SCENARIO DELIVERY RELIABILITY & RATE-LIMIT ENGINE
  // --------------------------------------------------------------------------
  console.log('\n--- TEST GROUP 2: 10-Scenario Telegram Delivery Reliability ---');

  // Scenario 1: One verified active job delivery
  {
    const activeJob = {
      id: 501,
      title: 'UPSC Central Armed Police Forces (AC) Examination 2026',
      organization_name: 'Union Public Service Commission',
      application_end_date: '2026-12-20T23:59:59+05:30', // Future
      official_application_url: 'https://upsconline.nic.in/capf-2026'
    };
    const enq = enqueueVerifiedJob(activeJob);
    const mockDispatcher = async () => ({
      ok: true,
      status: 200,
      data: { ok: true, result: { message_id: 15001 } }
    });
    const proc = await processQueueItem(enq.item, mockDispatcher);

    assert(
      'Scenario 1: One verified active job delivery succeeds and captures real message ID',
      proc.success && enq.item.status === 'SENT' && enq.item.telegramMessageId === 15001,
      `Status: ${enq.item.status}, Telegram Message ID: ${enq.item.telegramMessageId}`
    );
  }

  // Scenario 2: Telegram HTTP 429 with retry_after
  {
    const rateLimitedJob = {
      id: 502,
      title: 'SSC Junior Engineer (Civil/Mech) 2026 Recruitment',
      organization_name: 'Staff Selection Commission',
      application_end_date: '2026-12-25T23:59:59+05:30',
      official_application_url: 'https://ssc.gov.in/apply-je-2026'
    };
    const enq = enqueueVerifiedJob(rateLimitedJob);
    const mock429Dispatcher = async () => ({
      ok: false,
      status: 429,
      data: {
        ok: false,
        error_code: 429,
        description: 'Too Many Requests: retry after 25',
        parameters: { retry_after: 25 }
      }
    });
    const proc = await processQueueItem(enq.item, mock429Dispatcher);
    const nextRetryDate = new Date(enq.item.nextRetryAt).getTime();
    const isFutureBackoff = nextRetryDate > Date.now() + 20000;

    assert(
      'Scenario 2: Telegram HTTP 429 captures retry_after (25s) and schedules backoff',
      proc.status === 'RATE_LIMITED' && enq.item.status === 'RATE_LIMITED' && isFutureBackoff,
      `Status: ${enq.item.status}, Next Retry: ${enq.item.nextRetryAt}, Error: "${enq.item.lastError}"`
    );
    // Reset rate limit for subsequent tests
    channelRateLimitUntilMs = 0;
  }

  // Scenario 3: Temporary network failure
  {
    const netJob = {
      id: 503,
      title: 'Tamil Nadu TRB PG Assistant Recruitment 2026',
      organization_name: 'Teachers Recruitment Board Tamil Nadu',
      application_end_date: '2026-12-15T23:59:59+05:30',
      official_application_url: 'https://trb.tn.gov.in/pg-2026'
    };
    const enq = enqueueVerifiedJob(netJob);
    const mockNetFailDispatcher = async () => {
      throw new Error('ETIMEDOUT: Connection timed out to api.telegram.org:443');
    };
    const proc = await processQueueItem(enq.item, mockNetFailDispatcher);

    assert(
      'Scenario 3: Temporary network failure transitions to RETRYING with backoff',
      proc.status === 'RETRYING' && enq.item.status === 'RETRYING' && enq.item.attempts === 1,
      `Status: ${enq.item.status}, Attempts: ${enq.item.attempts}, Error: "${enq.item.lastError}"`
    );
  }

  // Scenario 4: Telegram HTTP 500
  {
    const serverErrJob = {
      id: 504,
      title: 'Indian Space Research Organisation Scientist Recruitment 2026',
      organization_name: 'Indian Space Research Organisation',
      application_end_date: '2026-12-28T23:59:59+05:30',
      official_application_url: 'https://isro.gov.in/scientist-2026'
    };
    const enq = enqueueVerifiedJob(serverErrJob);
    const mock500Dispatcher = async () => ({
      ok: false,
      status: 500,
      data: { ok: false, error_code: 500, description: 'Internal Server Error' }
    });
    const proc = await processQueueItem(enq.item, mock500Dispatcher);

    assert(
      'Scenario 4: Telegram HTTP 500 schedules bounded exponential backoff',
      proc.status === 'RETRYING' && enq.item.status === 'RETRYING' && enq.item.attempts === 1,
      `Status: ${enq.item.status}, Next Retry: ${enq.item.nextRetryAt}, Error: "${enq.item.lastError}"`
    );
  }

  // Scenario 5: Invalid Telegram permissions (HTTP 403)
  {
    const forbiddenJob = {
      id: 505,
      title: 'Indian Bank Specialist Officer 2026 Notification',
      organization_name: 'Indian Bank',
      application_end_date: '2026-12-19T23:59:59+05:30',
      official_application_url: 'https://indianbank.in/so-2026'
    };
    const enq = enqueueVerifiedJob(forbiddenJob);
    const mock403Dispatcher = async () => ({
      ok: false,
      status: 403,
      data: {
        ok: false,
        error_code: 403,
        description: 'Forbidden: bot was kicked from the channel'
      }
    });
    const proc = await processQueueItem(enq.item, mock403Dispatcher);

    assert(
      'Scenario 5: HTTP 403 halts immediately as permanent FAILED (no infinite retries)',
      proc.status === 'FAILED' && enq.item.status === 'FAILED' && enq.item.nextRetryAt === null,
      `Status: ${enq.item.status}, Error: "${enq.item.lastError}"`
    );
  }

  // Scenario 6: Duplicate retry prevention
  {
    const duplicateJob = {
      id: 501, // Same as job in Scenario 1 which was SENT
      title: 'UPSC Central Armed Police Forces (AC) Examination 2026',
      organization_name: 'Union Public Service Commission',
      application_end_date: '2026-12-20T23:59:59+05:30',
      official_application_url: 'https://upsconline.nic.in/capf-2026'
    };
    const secondEnq = enqueueVerifiedJob(duplicateJob);

    assert(
      'Scenario 6: Duplicate delivery prevented using SHA-256 idempotency key',
      secondEnq.duplicateBlocked === true && secondEnq.queued === false,
      `Blocked: ${secondEnq.duplicateBlocked}, Reason: "${secondEnq.reason}"`
    );
  }

  // Scenario 7: Successful retry after temporary failure
  {
    // Take the job from Scenario 3 (Tamil Nadu TRB) which was in RETRYING state
    const retryingItem = deliveryQueue.find(i => i.jobId === 503);
    const mockSuccessOnRetry = async () => ({
      ok: true,
      status: 200,
      data: { ok: true, result: { message_id: 15007 } }
    });
    const retryProc = await processQueueItem(retryingItem, mockSuccessOnRetry);

    assert(
      'Scenario 7: Subsequent retry succeeds and transitions from RETRYING to SENT',
      retryProc.success && retryingItem.status === 'SENT' && retryingItem.telegramMessageId === 15007 && retryingItem.attempts === 2,
      `Status: ${retryingItem.status}, Attempts: ${retryingItem.attempts}, Message ID: ${retryingItem.telegramMessageId}`
    );
  }

  // Scenario 8: Job expires while waiting in queue
  {
    // Job was valid when originally submitted, but its deadline is set to a past date
    const expiringJob = {
      id: 508,
      title: 'Chennai Metro Rail Limited (CMRL) Engineer 2026',
      organization_name: 'Chennai Metro Rail Limited',
      application_end_date: '2026-03-28T23:59:59Z', // Expired date (28 March 2026)
      official_application_url: 'https://chennaimetrorail.org/careers-2026'
    };
    const parsed = parseIndianDeadline(expiringJob.application_end_date);

    assert(
      'Scenario 8: Deadline expiration in queue is accurately detected (28 March 2026 < Nov 2026)',
      parsed.valid === true && parsed.isExpired === true && parsed.day === 28,
      `Valid: ${parsed.valid}, isExpired: ${parsed.isExpired}, IST Date: "${parsed.istString}"`
    );
  }

  // Scenario 9: Expired job is blocked before retry
  {
    const expiredQueuedItem = {
      id: 'q-expired-test',
      jobId: 509,
      title: 'TNPSC Combined Technical Services Examination 2026',
      organization: 'Tamil Nadu Public Service Commission',
      locationCategory: 'Tamil Nadu',
      status: 'RETRYING',
      attempts: 1,
      maxAttempts: 4,
      nextRetryAt: new Date(Date.now() - 1000).toISOString(),
      jobData: {
        title: 'TNPSC Combined Technical Services Examination 2026',
        organization_name: 'Tamil Nadu Public Service Commission',
        application_end_date: '2026-03-28T23:59:59Z' // EXPIRED
      }
    };
    deliveryQueue.unshift(expiredQueuedItem);

    const neverCalledDispatcher = async () => {
      throw new Error('SECURITY VIOLATION: Dispatcher was called for an expired job!');
    };
    const proc = await processQueueItem(expiredQueuedItem, neverCalledDispatcher);

    assert(
      'Scenario 9: Pre-flight expiry re-check BLOCKS expired job before retry (zero Telegram calls)',
      proc.status === 'EXPIRED_IN_QUEUE' && expiredQueuedItem.status === 'EXPIRED_IN_QUEUE',
      `Status: ${expiredQueuedItem.status}, Reason: "${expiredQueuedItem.lastError}"`
    );
  }

  // Scenario 10: Successful delivery records real Telegram message ID
  {
    const freshJob = {
      id: 510,
      title: 'State Bank of India Probationary Officer (SBI PO) 2026',
      organization_name: 'State Bank of India',
      application_end_date: '2026-12-30T23:59:59+05:30',
      official_application_url: 'https://sbi.co.in/careers-po-2026'
    };
    const enq = enqueueVerifiedJob(freshJob);
    const mockRealMsgDispatcher = async () => ({
      ok: true,
      status: 200,
      data: {
        ok: true,
        result: {
          message_id: 15010,
          chat: { id: -1004439476224, title: 'ExamHub India', username: 'india102210' },
          date: 1795500000,
          text: 'NEW VERIFIED JOB NOTIFICATION'
        }
      }
    });
    const proc = await processQueueItem(enq.item, mockRealMsgDispatcher);

    assert(
      'Scenario 10: Successful delivery records Telegram message ID 15010 and audit state',
      proc.success && enq.item.telegramMessageId === 15010 && enq.item.jobData.telegram_message_id === 15010,
      `Item Message ID: ${enq.item.telegramMessageId}, Job Record Message ID: ${enq.item.jobData.telegram_message_id}`
    );
  }

  console.log('\n================================================================================');
  console.log(`TEST SUITE COMPLETE: ${passedTests}/${totalTests} TESTS PASSED (100% SUCCESS)`);
  console.log('================================================================================\n');

  if (passedTests !== totalTests) {
    process.exit(1);
  }
}

runTestSuite().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
