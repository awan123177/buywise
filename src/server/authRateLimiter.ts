/**
 * BuyWise Authentication Rate Limiter & Registration Concurrency Manager
 * Prevents duplicate registration requests, double-clicks, and handles upstream email rate limits gracefully.
 */

interface RateLimitRecord {
  lastAttempt: number;
  attemptsCount: number;
  cooldownUntil: number;
  consecutiveRateLimits: number;
}

const emailAttempts = new Map<string, RateLimitRecord>();
const ipAttempts = new Map<string, { count: number; resetAt: number }>();
const inFlightRegistrations = new Set<string>();

const IP_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const IP_MAX_ATTEMPTS = 8; // Max 8 registrations per IP per 10 mins
const EMAIL_MIN_INTERVAL_MS = 60 * 1000; // 60 seconds between attempts for the same email
const LOCK_TIMEOUT_MS = 15 * 1000; // 15 seconds max lock time

// Clean up stale memory entries every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [email, record] of emailAttempts.entries()) {
    if (now - record.lastAttempt > 30 * 60 * 1000 && record.cooldownUntil < now) {
      emailAttempts.delete(email);
    }
  }
  for (const [ip, record] of ipAttempts.entries()) {
    if (record.resetAt < now) {
      ipAttempts.delete(ip);
    }
  }
}, 10 * 60 * 1000);

export function acquireRegistrationLock(email: string): { acquired: boolean; reason?: string } {
  const normalizedEmail = email.trim().toLowerCase();
  if (inFlightRegistrations.has(normalizedEmail)) {
    return {
      acquired: false,
      reason: "A registration request is already in progress for this email. Please wait a moment."
    };
  }
  inFlightRegistrations.add(normalizedEmail);
  // Auto-release after timeout in case of unexpected exceptions
  setTimeout(() => {
    inFlightRegistrations.delete(normalizedEmail);
  }, LOCK_TIMEOUT_MS);
  return { acquired: true };
}

export function releaseRegistrationLock(email: string): void {
  const normalizedEmail = email.trim().toLowerCase();
  inFlightRegistrations.delete(normalizedEmail);
}

export function checkRegistrationRateLimit(
  ip: string,
  email: string
): { allowed: boolean; error?: string; retryAfter?: number; code?: string } {
  const now = Date.now();
  const normalizedEmail = email.trim().toLowerCase();

  // 1. Check IP rate limit
  const ipRecord = ipAttempts.get(ip);
  if (ipRecord) {
    if (now < ipRecord.resetAt) {
      if (ipRecord.count >= IP_MAX_ATTEMPTS) {
        const retryAfter = Math.max(1, Math.ceil((ipRecord.resetAt - now) / 1000));
        return {
          allowed: false,
          error: "Too many email requests. Please wait a few minutes and try again.",
          code: "IP_RATE_LIMIT_EXCEEDED",
          retryAfter
        };
      }
    } else {
      // Reset IP window
      ipAttempts.set(ip, { count: 0, resetAt: now + IP_WINDOW_MS });
    }
  } else {
    ipAttempts.set(ip, { count: 0, resetAt: now + IP_WINDOW_MS });
  }

  // 2. Check Email rate limit and cooldown
  const emailRecord = emailAttempts.get(normalizedEmail);
  if (emailRecord) {
    if (now < emailRecord.cooldownUntil) {
      const retryAfter = Math.max(1, Math.ceil((emailRecord.cooldownUntil - now) / 1000));
      return {
        allowed: false,
        error: "Too many email requests. Please wait a few minutes and try again.",
        code: "EMAIL_COOLDOWN_ACTIVE",
        retryAfter
      };
    }

    if (now - emailRecord.lastAttempt < EMAIL_MIN_INTERVAL_MS) {
      const retryAfter = Math.max(1, Math.ceil((EMAIL_MIN_INTERVAL_MS - (now - emailRecord.lastAttempt)) / 1000));
      return {
        allowed: false,
        error: "Too many email requests. Please wait a few minutes and try again.",
        code: "EMAIL_THROTTLED",
        retryAfter
      };
    }
  }

  return { allowed: true };
}

export function recordRegistrationAttempt(
  ip: string,
  email: string,
  result: { success: boolean; wasRateLimited?: boolean }
): void {
  const now = Date.now();
  const normalizedEmail = email.trim().toLowerCase();

  // Increment IP counter
  const ipRecord = ipAttempts.get(ip) || { count: 0, resetAt: now + IP_WINDOW_MS };
  ipRecord.count += 1;
  ipAttempts.set(ip, ipRecord);

  // Update Email record
  const prevRecord = emailAttempts.get(normalizedEmail) || {
    lastAttempt: 0,
    attemptsCount: 0,
    cooldownUntil: 0,
    consecutiveRateLimits: 0
  };

  const consecutiveRateLimits = result.wasRateLimited ? prevRecord.consecutiveRateLimits + 1 : 0;
  
  // Calculate exponential backoff for cooldown if upstream rate limit (429) hit: 60s, 120s, 180s (cap at 300s)
  let cooldownDuration = EMAIL_MIN_INTERVAL_MS;
  if (result.wasRateLimited) {
    cooldownDuration = Math.min(300 * 1000, Math.max(60 * 1000, consecutiveRateLimits * 60 * 1000));
  }

  emailAttempts.set(normalizedEmail, {
    lastAttempt: now,
    attemptsCount: prevRecord.attemptsCount + 1,
    cooldownUntil: result.wasRateLimited ? now + cooldownDuration : now + EMAIL_MIN_INTERVAL_MS,
    consecutiveRateLimits
  });
}

export function getEmailRateLimitStatus(email: string): { isRateLimited: boolean; retryAfter: number } {
  const now = Date.now();
  const normalizedEmail = email.trim().toLowerCase();
  const emailRecord = emailAttempts.get(normalizedEmail);
  if (!emailRecord) return { isRateLimited: false, retryAfter: 0 };
  
  if (now < emailRecord.cooldownUntil) {
    return {
      isRateLimited: true,
      retryAfter: Math.max(1, Math.ceil((emailRecord.cooldownUntil - now) / 1000))
    };
  }
  return { isRateLimited: false, retryAfter: 0 };
}
