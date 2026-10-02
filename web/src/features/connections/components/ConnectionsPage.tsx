import { useState } from 'react';
import { useSnackbar } from 'notistack';
import { Alert, Button } from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import HubRoundedIcon from '@mui/icons-material/HubRounded';
import { useTenantId } from '../../auth/useAuth';
import { ConfirmDialog } from '../../../shared/components/ConfirmDialog';
import { EmptyState } from '../../../shared/components/EmptyState';
import { LoadingBlock } from '../../../shared/components/LoadingBlock';
import { PageHeader } from '../../../shared/components/PageHeader';
import { firestoreErrorMessage } from '../../../shared/firestoreErrors';
import { createConnection, deleteConnection, renameConnection } from '../api';
import { useConnections } from '../hooks';
import type { Connection, ConnectionInput } from '../schema';
import { ConnectionCard } from './ConnectionCard';
import { ConnectionFormDialog } from './ConnectionFormDialog';

type FormState = { mode: 'create' } | { mode: 'rename'; connection: Connection } | null;

export const ConnectionsPage = () => {
  const tenantId = useTenantId();
  const { data: connections, loading, error } = useConnections(tenantId);
  const { enqueueSnackbar } = useSnackbar();
  const [form, setForm] = useState<FormState>(null);
  const [toDelete, setToDelete] = useState<Connection | null>(null);

  const withFeedback = (action: () => Promise<unknown>, success: string) => async () => {
    try {
      await action();
      enqueueSnackbar(success, { variant: 'success' });
    } catch (e) {
      enqueueSnackbar(firestoreErrorMessage(e), { variant: 'error' });
      throw e;
    }
  };

  const submitForm = (input: ConnectionInput) =>
    form?.mode === 'rename'
      ? withFeedback(() => renameConnection(form.connection.id, input), 'Conexão renomeada.')()
      : withFeedback(() => createConnection(tenantId, input), 'Conexão criada.')();

  const newButton = (
    <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => setForm({ mode: 'create' })}>
      Nova conexão
    </Button>
  );

  return (
    <>
      <PageHeader title="Conexões" subtitle="Cada conexão tem seus próprios contatos e mensagens." action={newButton} />

      {error && <Alert severity="error">{firestoreErrorMessage(error)}</Alert>}
      {loading && <LoadingBlock />}
      {!loading && !error && connections.length === 0 && (
        <EmptyState
          icon={<HubRoundedIcon />}
          title="Nenhuma conexão ainda"
          description="Crie sua primeira conexão para cadastrar contatos e disparar mensagens."
          action={newButton}
        />
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {connections.map((connection) => (
          <ConnectionCard
            key={connection.id}
            connection={connection}
            onRename={() => setForm({ mode: 'rename', connection })}
            onDelete={() => setToDelete(connection)}
          />
        ))}
      </div>

      <ConnectionFormDialog
        open={form !== null}
        initial={form?.mode === 'rename' ? { name: form.connection.name } : undefined}
        onSubmit={submitForm}
        onClose={() => setForm(null)}
      />

      <ConfirmDialog
        open={toDelete !== null}
        title="Excluir conexão?"
        description={
          <>
            <strong>{toDelete?.name}</strong> será excluída junto com todos os seus contatos e mensagens.
          </>
        }
        onConfirm={withFeedback(() => deleteConnection(toDelete!.id), 'Conexão excluída.')}
        onClose={() => setToDelete(null)}
      />
    </>
  );
};
