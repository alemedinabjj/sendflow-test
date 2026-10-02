import { describe, expect, it } from 'vitest';
import dayjs from 'dayjs';
import type { Contact } from '../contacts/schema';
import { composeSchema, toRecipients, toScheduledDate } from './schema';

const base = { contactIds: ['k1'], body: 'Olá!', mode: 'schedule' as const };

describe('composeSchema', () => {
  it('rejects schedules less than a minute ahead', () => {
    const result = composeSchema.safeParse({ ...base, scheduledAt: dayjs().add(30, 'second') });
    expect(result.success).toBe(false);
  });

  it('accepts schedules at least a minute ahead', () => {
    expect(composeSchema.safeParse({ ...base, scheduledAt: dayjs().add(2, 'minute') }).success).toBe(true);
  });

  it('requires a date when scheduling', () => {
    expect(composeSchema.safeParse({ ...base, scheduledAt: null }).success).toBe(false);
  });

  it('ignores scheduledAt when sending now', () => {
    expect(composeSchema.safeParse({ ...base, mode: 'now', scheduledAt: dayjs().subtract(1, 'day') }).success).toBe(
      true,
    );
  });

  it('requires at least one contact', () => {
    expect(composeSchema.safeParse({ ...base, mode: 'now', contactIds: [], scheduledAt: null }).success).toBe(false);
  });

  it('rejects bodies longer than 1000 chars', () => {
    expect(
      composeSchema.safeParse({ ...base, mode: 'now', body: 'x'.repeat(1001), scheduledAt: null }).success,
    ).toBe(false);
  });
});

describe('toRecipients', () => {
  const contact = (id: string, name: string): Contact => ({
    id,
    name,
    phone: '5511988887777',
    tenantId: 'A',
    connectionId: 'c1',
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  const contacts = [contact('k1', 'Ana'), contact('k2', 'Bruno'), contact('k3', 'Carla')];

  it('keeps the order of the selected ids', () => {
    expect(toRecipients(contacts, ['k3', 'k1']).map((r) => r.name)).toEqual(['Carla', 'Ana']);
  });

  it('ignores ids that no longer exist', () => {
    expect(toRecipients(contacts, ['k2', 'gone'])).toEqual([
      { contactId: 'k2', name: 'Bruno', phone: '5511988887777' },
    ]);
  });
});

describe('toScheduledDate', () => {
  it('keeps the local instant picked by the user', () => {
    expect(toScheduledDate(dayjs('2026-10-05T14:30')).getTime()).toBe(new Date('2026-10-05T14:30').getTime());
  });
});
