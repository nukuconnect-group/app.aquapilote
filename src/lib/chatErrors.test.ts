import { describe, expect, it } from 'vitest';
import {
  CHAT_MAX_PER_WINDOW,
  CHAT_MIN_INTERVAL_MS,
  MAX_CHAT_ATTEMPTS,
  chatRetryDelayMs,
  createChatRateLimiter,
} from './chatErrors';

describe('backoff progressif du réessai', () => {
  it('augmente exponentiellement puis se plafonne', () => {
    expect(chatRetryDelayMs(1)).toBe(2000);
    expect(chatRetryDelayMs(2)).toBe(4000);
    expect(chatRetryDelayMs(3)).toBe(8000);
    expect(chatRetryDelayMs(10)).toBe(15000);
  });

  it('limite le nombre de tentatives', () => {
    expect(MAX_CHAT_ATTEMPTS).toBe(4);
  });
});

describe('limite de débit client', () => {
  it('bloque deux envois trop rapprochés', () => {
    const limiter = createChatRateLimiter();
    const t0 = 1_000_000;
    expect(limiter.check(t0).allowed).toBe(true);
    limiter.record(t0);
    const verdict = limiter.check(t0 + 500);
    expect(verdict.allowed).toBe(false);
    expect(verdict.reason).toBe('cooldown');
    expect(verdict.retryAfterMs).toBe(CHAT_MIN_INTERVAL_MS - 500);
  });

  it('bloque au-delà du quota par minute', () => {
    const limiter = createChatRateLimiter();
    let t = 1_000_000;
    for (let i = 0; i < CHAT_MAX_PER_WINDOW; i++) {
      expect(limiter.check(t).allowed).toBe(true);
      limiter.record(t);
      t += CHAT_MIN_INTERVAL_MS;
    }
    const verdict = limiter.check(t);
    expect(verdict.allowed).toBe(false);
    expect(verdict.reason).toBe('quota');
  });
});
