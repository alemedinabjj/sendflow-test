import { Button } from '@mui/material';
import ContactsRoundedIcon from '@mui/icons-material/ContactsRounded';
import { Link as RouterLink } from 'react-router';
import { useTenantId } from '../../auth/useAuth';
import { useContacts } from '../../contacts/hooks';
import { EmptyState } from '../../../shared/components/EmptyState';
import { LoadingBlock } from '../../../shared/components/LoadingBlock';
import { BroadcastComposer } from './BroadcastComposer';

export const BroadcastTab = ({ connectionId }: { connectionId: string }) => {
  const tenantId = useTenantId();
  const { data: contacts, loading } = useContacts(tenantId, connectionId);

  if (loading) return <LoadingBlock />;

  if (contacts.length === 0) {
    return (
      <EmptyState
        icon={<ContactsRoundedIcon />}
        title="Cadastre contatos primeiro"
        description="Para disparar mensagens, esta conexão precisa de pelo menos um contato."
        action={
          <Button component={RouterLink} to="?" variant="contained">
            Ir para Contatos
          </Button>
        }
      />
    );
  }

  return (
    <div className="grid items-start gap-4 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
      <BroadcastComposer tenantId={tenantId} connectionId={connectionId} contacts={contacts} />
      <div />
    </div>
  );
};
