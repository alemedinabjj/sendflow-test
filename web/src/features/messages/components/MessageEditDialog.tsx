import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import dayjs from 'dayjs';
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import type { Contact } from '../../contacts/schema';
import {
  composeSchema,
  earliestSchedule,
  pickableContacts,
  toRecipients,
  toScheduledDate,
  type ComposeInput,
  type ComposeValues,
  type Message,
  type Recipient,
} from '../schema';
import { ContactPicker } from './ContactPicker';

type Props = {
  message: Message | null;
  contacts: Contact[];
  onSubmit: (id: string, patch: { body: string; recipients: Recipient[]; scheduledAt: Date }) => Promise<void>;
  onClose: () => void;
};

export const MessageEditDialog = ({ message, contacts, onSubmit, onClose }: Props) => {
  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ComposeValues, unknown, ComposeInput>({
    resolver: zodResolver(composeSchema),
    defaultValues: message
      ? {
          contactIds: message.recipients.map((r) => r.contactId),
          body: message.body,
          mode: 'schedule',
          scheduledAt: dayjs(message.scheduledAt),
        }
      : undefined,
  });
  const alreadySent = message?.status === 'sent';
  const options = message ? pickableContacts(contacts, message.recipients) : contacts;

  const submit = handleSubmit(async ({ contactIds, body, scheduledAt }) => {
    if (!message || !scheduledAt) return;
    await onSubmit(message.id, {
      body,
      recipients: toRecipients(options, contactIds),
      scheduledAt: toScheduledDate(scheduledAt),
    });
    onClose();
  });

  return (
    <Dialog open={message !== null} onClose={isSubmitting ? undefined : onClose} maxWidth="sm" fullWidth>
      <form onSubmit={submit} noValidate>
        <DialogTitle>Editar mensagem agendada</DialogTitle>
        <DialogContent className="flex flex-col gap-4">
          {alreadySent && <Alert severity="info">Esta mensagem acabou de ser enviada e não pode mais ser editada.</Alert>}
          <Controller
            name="contactIds"
            control={control}
            render={({ field }) => (
              <ContactPicker
                contacts={options}
                value={field.value ?? []}
                onChange={field.onChange}
                error={errors.contactIds?.message}
              />
            )}
          />
          <TextField
            label="Mensagem"
            multiline
            minRows={4}
            {...register('body')}
            error={!!errors.body}
            helperText={errors.body?.message}
          />
          <Controller
            name="scheduledAt"
            control={control}
            render={({ field }) => (
              <DateTimePicker
                label="Data e hora do envio"
                value={field.value ?? null}
                onChange={field.onChange}
                minDateTime={earliestSchedule()}
                ampm={false}
                slotProps={{ textField: { error: !!errors.scheduledAt, helperText: errors.scheduledAt?.message } }}
              />
            )}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" variant="contained" loading={isSubmitting} disabled={alreadySent}>
            Salvar alterações
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
