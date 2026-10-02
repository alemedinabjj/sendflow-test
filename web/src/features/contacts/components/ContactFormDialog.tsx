import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material';
import { formatPhone } from '../phone';
import { contactSchema, type Contact, type ContactFormValues, type ContactInput } from '../schema';

type Props = {
  open: boolean;
  contact?: Contact;
  onSubmit: (input: ContactInput) => Promise<void>;
  onClose: () => void;
};

export const ContactFormDialog = ({ open, contact, onSubmit, onClose }: Props) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues, unknown, ContactInput>({ resolver: zodResolver(contactSchema) });

  useEffect(() => {
    if (open) reset(contact ? { name: contact.name, phone: formatPhone(contact.phone) } : { name: '', phone: '' });
  }, [open, contact, reset]);

  const submit = handleSubmit(async (input) => {
    await onSubmit(input);
    onClose();
  });

  return (
    <Dialog open={open} onClose={isSubmitting ? undefined : onClose} maxWidth="xs" fullWidth>
      <form onSubmit={submit} noValidate>
        <DialogTitle>{contact ? 'Editar contato' : 'Novo contato'}</DialogTitle>
        <DialogContent className="flex flex-col gap-2">
          <TextField
            label="Nome"
            fullWidth
            autoFocus
            margin="dense"
            {...register('name')}
            error={!!errors.name}
            helperText={errors.name?.message}
          />
          <TextField
            label="Telefone"
            placeholder="(11) 98888-7777"
            fullWidth
            margin="dense"
            type="tel"
            {...register('phone')}
            error={!!errors.phone}
            helperText={errors.phone?.message ?? 'DDD + número. O código do Brasil (+55) é adicionado automaticamente.'}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" variant="contained" loading={isSubmitting}>
            Salvar
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
