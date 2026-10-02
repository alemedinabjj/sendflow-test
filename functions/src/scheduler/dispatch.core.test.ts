import { describe, expect, it } from 'vitest';
import { Timestamp } from 'firebase-admin/firestore';
import { isDue, sentPatch } from './dispatch.core';

const now = Timestamp.fromMillis(1_000_000);
const at = (millis: number) => Timestamp.fromMillis(millis);

describe('isDue', () => {
  it('is due when scheduledAt equals now', () => {
    expect(isDue({ status: 'scheduled', scheduledAt: now }, now)).toBe(true);
  });

  it('is due when scheduledAt is in the past', () => {
    expect(isDue({ status: 'scheduled', scheduledAt: at(999_999) }, now)).toBe(true);
  });

  it('is not due when scheduledAt is in the future', () => {
    expect(isDue({ status: 'scheduled', scheduledAt: at(1_000_001) }, now)).toBe(false);
  });

  it('is not due when already sent', () => {
    expect(isDue({ status: 'sent', scheduledAt: at(0) }, now)).toBe(false);
  });

  it('is not due without scheduledAt', () => {
    expect(isDue({ status: 'scheduled', scheduledAt: null }, now)).toBe(false);
  });
});

describe('sentPatch', () => {
  it('marks the message as sent', () => {
    expect(sentPatch().status).toBe('sent');
  });
});
