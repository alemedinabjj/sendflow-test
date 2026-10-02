import { Controller, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSnackbar } from 'notistack';
import { Button, Paper, TextField, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import ScheduleSendRoundedIcon from '@mui/icons-material/ScheduleSendRounded';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import type { Contact } from '../../contacts/schema';
import { firestoreErrorMessage } from '../../../shared/firestoreErrors';
import { scheduleMessage, sendNow } from '../api';
import {
  composeSchema,
  earliestSchedule,
  toRecipients,
  toScheduledDate,
  type ComposeInput,
  type ComposeValues,
} from '../schema';
import { ContactPicker } from './ContactPicker';

type Props = { tenantId: string; connectionId: string; contacts: Contact[] };

const emptyForm: ComposeValues = { contactIds: [], body: '', mode: 'now', scheduledAt: null };

export const BroadcastComposer = ({ tenantId, connectionId, contacts }: Props) => {
  const { enqueueSnackbar } = useSnackbar();
  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ComposeValues, unknown, ComposeInput>({
    resolver: zodResolver(composeSchema),
    defaultValues: emptyForm,
  });
  const mode = useWatch({ control, name: 'mode' });
  const bodyLength = useWatch({ control, name: 'body' }).length;

  const submit = handleSubmit(async ({ contactIds, body, mode, scheduledAt }) => {
    const message = { tenantId, connectionId, body, recipients: toRecipients(contacts, contactIds) };
    if (message.recipients.length === 0) {
      enqueueSnackbar('Os contatos selecionados não existem mais.', { variant: 'warning' });
      return;
    }
    try {
      if (mode === 'schedule' && scheduledAt) {
        await scheduleMessage(message, toScheduledDate(scheduledAt));
        enqueueSnackbar(`Mensagem agendada para ${scheduledAt.format('DD/MM [às] HH:mm')}.`, { variant: 'success' });
      } else {
        await sendNow(message);
        enqueueSnackbar(`Mensagem enviada para ${contactIds.length} contato(s).`, { variant: 'success' });
      }
      reset(emptyForm);
    } catch (e) {
      enqueueSnackbar(firestoreErrorMessage(e), { variant: 'error' });
    }
  });

  return (
    <Paper className="p-4">
      <Typography variant="subtitle1" sx={{ fontWeight: 700 }} className="mb-4!">
        Nova mensagem
      </Typography>
      <form onSubmit={submit} noValidate className="flex flex-col gap-4">
        <Controller
          name="contactIds"
          control={control}
          render={({ field }) => (
            <ContactPicker
              contacts={contacts}
              value={field.value}
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
          helperText={errors.body?.message ?? `${bodyLength}/1000`}
        />
        <Controller
          name="mode"
          control={control}
          render={({ field }) => (
            <ToggleButtonGroup
              exclusive
              fullWidth
              size="small"
              color="primary"
              value={field.value}
              onChange={(_, value) => value && field.onChange(value)}
            >
              <ToggleButton value="now">
                <SendRoundedIcon fontSize="small" className="mr-2" /> Enviar agora
              </ToggleButton>
              <ToggleButton value="schedule">
                <ScheduleSendRoundedIcon fontSize="small" className="mr-2" /> Agendar
              </ToggleButton>
            </ToggleButtonGroup>
          )}
        />
        {mode === 'schedule' && (
          <Controller
            name="scheduledAt"
            control={control}
            render={({ field }) => (
              <DateTimePicker
                label="Data e hora do envio"
                value={field.value}
                onChange={field.onChange}
                minDateTime={earliestSchedule()}
                ampm={false}
                slotProps={{
                  textField: { error: !!errors.scheduledAt, helperText: errors.scheduledAt?.message },
                }}
              />
            )}
          />
        )}
        <Button
          type="submit"
          variant="contained"
          size="large"
          loading={isSubmitting}
          startIcon={mode === 'schedule' ? <ScheduleSendRoundedIcon /> : <SendRoundedIcon />}
        >
          {mode === 'schedule' ? 'Agendar envio' : 'Enviar agora'}
        </Button>
      </form>
    </Paper>
  );
};
