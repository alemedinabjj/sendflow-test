import { describe, expect, it } from 'vitest';
import dayjs from 'dayjs';
import type { Contact } from '../contacts/schema';
import { composeSchema, pickableContacts, toRecipients, toScheduledDate } from './schema';

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

  it('rejects more than 500 recipients', () => {
    const contactIds = Array.from({ length: 501 }, (_, i) => `k${i}`);
    expect(composeSchema.safeParse({ ...base, mode: 'now', contactIds, scheduledAt: null }).success).toBe(false);
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

describe('pickableContacts', () => {
  const current = [{ id: 'k1', name: 'Ana Silva', phone: '5511988887777' }];
  const recipients = [
    { contactId: 'k1', name: 'Ana', phone: '5511988887777' },
    { contactId: 'gone', name: 'João', phone: '551133334444' },
  ];

  it('keeps recipients whose contact was deleted, flagged as removed', () => {
    expect(pickableContacts(current, recipients)).toEqual([
      { id: 'k1', name: 'Ana Silva', phone: '5511988887777' },
      { id: 'gone', name: 'João', phone: '551133334444', removed: true },
    ]);
  });

  it('lets an edit keep a deleted recipient', () => {
    const recipientsAfterEdit = toRecipients(pickableContacts(current, recipients), ['k1', 'gone']);
    expect(recipientsAfterEdit.map((r) => r.contactId)).toEqual(['k1', 'gone']);
  });
});
