import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material';
import { connectionSchema, type ConnectionInput } from '../schema';

type Props = {
  open: boolean;
  initial?: ConnectionInput;
  onSubmit: (input: ConnectionInput) => Promise<void>;
  onClose: () => void;
};

export const ConnectionFormDialog = ({ open, initial, onSubmit, onClose }: Props) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ConnectionInput>({ resolver: zodResolver(connectionSchema) });

  useEffect(() => {
    if (open) reset(initial ?? { name: '' });
  }, [open, initial, reset]);

  const submit = handleSubmit(async (input) => {
    await onSubmit(input);
    onClose();
  });

  return (
    <Dialog open={open} onClose={isSubmitting ? undefined : onClose} maxWidth="xs" fullWidth>
      <form onSubmit={submit} noValidate>
        <DialogTitle>{initial ? 'Renomear conexão' : 'Nova conexão'}</DialogTitle>
        <DialogContent>
          <TextField
            label="Nome da conexão"
            placeholder="Ex.: WhatsApp Vendas"
            fullWidth
            autoFocus
            margin="dense"
            {...register('name')}
            error={!!errors.name}
            helperText={errors.name?.message}
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
