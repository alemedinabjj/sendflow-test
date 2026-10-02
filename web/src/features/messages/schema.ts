import { z } from 'zod';
import dayjs, { type Dayjs } from 'dayjs';
import type { Contact } from '../contacts/schema';

export const MIN_SCHEDULE_LEAD_MINUTES = 1;

export type MessageStatus = 'scheduled' | 'sent';

export type Recipient = { contactId: string; name: string; phone: string };

export type Message = {
  id: string;
  tenantId: string;
  connectionId: string;
  body: string;
  recipients: Recipient[];
  status: MessageStatus;
  scheduledAt: Date | null;
  sentAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export const earliestSchedule = (): Dayjs => dayjs().add(MIN_SCHEDULE_LEAD_MINUTES, 'minute');

const scheduleError = `Escolha um horário com pelo menos ${MIN_SCHEDULE_LEAD_MINUTES} minuto de antecedência.`;

export const composeSchema = z
  .object({
    contactIds: z.array(z.string()).min(1, 'Selecione ao menos um contato.'),
    body: z.string().trim().min(1, 'Escreva a mensagem.').max(1000, 'Máximo de 1000 caracteres.'),
    mode: z.enum(['now', 'schedule']),
    scheduledAt: z.custom<Dayjs>((value) => dayjs.isDayjs(value)).nullable(),
  })
  .superRefine(({ mode, scheduledAt }, ctx) => {
    if (mode !== 'schedule') return;
    if (!scheduledAt?.isValid() || scheduledAt.isBefore(earliestSchedule().subtract(5, 'second'))) {
      ctx.addIssue({ code: 'custom', path: ['scheduledAt'], message: scheduleError });
    }
  });

export type ComposeValues = z.input<typeof composeSchema>;
export type ComposeInput = z.output<typeof composeSchema>;

export const toRecipients = (contacts: Contact[], ids: string[]): Recipient[] => {
  const byId = new Map(contacts.map((contact) => [contact.id, contact]));
  return ids.flatMap((id) => {
    const contact = byId.get(id);
    return contact ? [{ contactId: contact.id, name: contact.name, phone: contact.phone }] : [];
  });
};

export const toScheduledDate = (value: Dayjs): Date => value.toDate();
