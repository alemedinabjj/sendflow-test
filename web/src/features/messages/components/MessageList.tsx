import { useMemo, useState } from 'react';
import { useSnackbar } from 'notistack';
import { Alert, List, Paper, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import ForumRoundedIcon from '@mui/icons-material/ForumRounded';
import type { Contact } from '../../contacts/schema';
import { ConfirmDialog } from '../../../shared/components/ConfirmDialog';
import { LoadingBlock } from '../../../shared/components/LoadingBlock';
import { firestoreErrorMessage } from '../../../shared/firestoreErrors';
import { deleteMessage, updateScheduledMessage } from '../api';
import { filterMessages, type MessageFilter } from '../filter';
import { useMessages } from '../hooks';
import type { Message } from '../schema';
import { MessageEditDialog } from './MessageEditDialog';
import { MessageItem } from './MessageItem';

type Props = { tenantId: string; connectionId: string; contacts: Contact[] };

const editDenied = 'Não foi possível salvar. A mensagem pode já ter sido enviada ou o horário escolhido já passou.';

const emptyText: Record<MessageFilter, string> = {
  all: 'Nenhuma mensagem criada ainda.',
  scheduled: 'Nenhuma mensagem agendada.',
  sent: 'Nenhuma mensagem enviada.',
};

export const MessageList = ({ tenantId, connectionId, contacts }: Props) => {
  const { data: messages, loading, error } = useMessages(tenantId, connectionId);
  const { enqueueSnackbar } = useSnackbar();
  const [filter, setFilter] = useState<MessageFilter>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<Message | null>(null);

  const visible = useMemo(() => filterMessages(messages, filter), [messages, filter]);
  const counts = useMemo(
    () => ({
      all: messages.length,
      scheduled: messages.filter((m) => m.status === 'scheduled').length,
      sent: messages.filter((m) => m.status === 'sent').length,
    }),
    [messages],
  );
  const editing = messages.find((m) => m.id === editingId) ?? null;

  const saveEdit = async (id: string, patch: Parameters<typeof updateScheduledMessage>[1]) => {
    try {
      await updateScheduledMessage(id, patch);
      enqueueSnackbar('Mensagem atualizada.', { variant: 'success' });
    } catch (e) {
      enqueueSnackbar(firestoreErrorMessage(e, { permissionDenied: editDenied }), { variant: 'error' });
      throw e;
    }
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    try {
      await deleteMessage(toDelete.id);
      enqueueSnackbar('Mensagem excluída.', { variant: 'success' });
    } catch (e) {
      enqueueSnackbar(firestoreErrorMessage(e), { variant: 'error' });
      throw e;
    }
  };

  return (
    <Paper className="overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 p-4">
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
          Mensagens
        </Typography>
        <ToggleButtonGroup
          exclusive
          size="small"
          value={filter}
          onChange={(_, value: MessageFilter | null) => value && setFilter(value)}
        >
          <ToggleButton value="all">Todas ({counts.all})</ToggleButton>
          <ToggleButton value="scheduled">Agendadas ({counts.scheduled})</ToggleButton>
          <ToggleButton value="sent">Enviadas ({counts.sent})</ToggleButton>
        </ToggleButtonGroup>
      </div>

      {error && <Alert severity="error">{firestoreErrorMessage(error)}</Alert>}
      {loading && <LoadingBlock />}
      {!loading && visible.length === 0 && (
        <div className="flex flex-col items-center gap-2 px-6 py-12 text-center text-slate-500">
          <ForumRoundedIcon className="text-4xl! text-slate-300" />
          <span className="text-sm">{emptyText[filter]}</span>
        </div>
      )}

      <List disablePadding>
        {visible.map((message, index) => (
          <MessageItem
            key={message.id}
            message={message}
            divider={index < visible.length - 1}
            onEdit={() => setEditingId(message.id)}
            onDelete={() => setToDelete(message)}
          />
        ))}
      </List>

      <MessageEditDialog
        key={editingId ?? 'closed'}
        message={editing}
        contacts={contacts}
        onSubmit={saveEdit}
        onClose={() => setEditingId(null)}
      />

      <ConfirmDialog
        open={toDelete !== null}
        title="Excluir mensagem?"
        description={
          toDelete?.status === 'scheduled'
            ? 'O agendamento será cancelado e a mensagem não será enviada.'
            : 'A mensagem será removida do histórico.'
        }
        onConfirm={confirmDelete}
        onClose={() => setToDelete(null)}
      />
    </Paper>
  );
};
