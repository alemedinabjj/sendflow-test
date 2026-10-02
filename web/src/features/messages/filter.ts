import type { Message } from './schema';

export type MessageFilter = 'all' | 'sent' | 'scheduled';

const time = (date: Date | null) => date?.getTime() ?? 0;

const scheduledSoonestFirst = (messages: Message[]) =>
  messages
    .filter((m) => m.status === 'scheduled')
    .toSorted((a, b) => time(a.scheduledAt) - time(b.scheduledAt));

const sentNewestFirst = (messages: Message[]) =>
  messages.filter((m) => m.status === 'sent').toSorted((a, b) => time(b.sentAt) - time(a.sentAt));

export const filterMessages = (messages: Message[], filter: MessageFilter): Message[] => {
  if (filter === 'scheduled') return scheduledSoonestFirst(messages);
  if (filter === 'sent') return sentNewestFirst(messages);
  return [...scheduledSoonestFirst(messages), ...sentNewestFirst(messages)];
};
