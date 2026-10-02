import { useState, type ReactNode } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';

type Props = {
  open: boolean;
  title: string;
  description: ReactNode;
  confirmLabel?: string;
  onConfirm: () => Promise<void>;
  onClose: () => void;
};

export const ConfirmDialog = ({ open, title, description, confirmLabel = 'Excluir', onConfirm, onClose }: Props) => {
  const [busy, setBusy] = useState(false);

  const confirm = async () => {
    setBusy(true);
    try {
      await onConfirm();
      onClose();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onClose={busy ? undefined : onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText component="div">{description}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={busy}>
          Cancelar
        </Button>
        <Button color="error" variant="contained" onClick={confirm} loading={busy}>
          {confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
