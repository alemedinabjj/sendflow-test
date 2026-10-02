import { describe, expect, it } from 'vitest';
import { filterMessages } from './filter';
import type { Message } from './schema';

const at = (iso: string) => new Date(iso);

const message = (id: string, status: Message['status'], when: string): Message => ({
  id,
  tenantId: 'A',
  connectionId: 'c1',
  body: id,
  recipients: [],
  status,
  scheduledAt: status === 'scheduled' ? at(when) : null,
  sentAt: status === 'sent' ? at(when) : null,
  createdAt: at('2026-10-01T00:00'),
  updatedAt: at('2026-10-01T00:00'),
});

const messages = [
  message('sentOld', 'sent', '2026-10-01T10:00'),
  message('schedLate', 'scheduled', '2026-10-10T10:00'),
  message('sentNew', 'sent', '2026-10-02T10:00'),
  message('schedSoon', 'scheduled', '2026-10-03T10:00'),
];

const ids = (list: Message[]) => list.map((m) => m.id);

describe('filterMessages', () => {
  it('lists scheduled messages soonest first', () => {
    expect(ids(filterMessages(messages, 'scheduled'))).toEqual(['schedSoon', 'schedLate']);
  });

  it('lists sent messages newest first', () => {
    expect(ids(filterMessages(messages, 'sent'))).toEqual(['sentNew', 'sentOld']);
  });

  it('lists scheduled before sent when showing all', () => {
    expect(ids(filterMessages(messages, 'all'))).toEqual(['schedSoon', 'schedLate', 'sentNew', 'sentOld']);
  });

  it('does not mutate the input', () => {
    const copy = [...messages];
    filterMessages(messages, 'all');
    expect(messages).toEqual(copy);
  });
});
