import { useEffect } from 'react';
import { Navigate, Link as RouterLink, useParams, useSearchParams } from 'react-router';
import { useSnackbar } from 'notistack';
import { IconButton, Tab, Tabs } from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import CampaignRoundedIcon from '@mui/icons-material/CampaignRounded';
import ContactsRoundedIcon from '@mui/icons-material/ContactsRounded';
import { ContactsTab } from '../../contacts/components/ContactsTab';
import { LoadingBlock } from '../../../shared/components/LoadingBlock';
import { PageHeader } from '../../../shared/components/PageHeader';
import { useConnection } from '../hooks';

type TabKey = 'contacts' | 'broadcast';

export const ConnectionPage = () => {
  const { connectionId = '' } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: connection, loading, error } = useConnection(connectionId);
  const { enqueueSnackbar } = useSnackbar();
  const tab: TabKey = searchParams.get('tab') === 'broadcast' ? 'broadcast' : 'contacts';
  const missing = !loading && (error !== null || connection === null);

  useEffect(() => {
    if (missing) enqueueSnackbar('Conexão não encontrada.', { variant: 'warning' });
  }, [missing, enqueueSnackbar]);

  if (missing) return <Navigate to="/connections" replace />;
  if (loading || !connection) return <LoadingBlock />;

  return (
    <>
      <PageHeader
        title={connection.name}
        subtitle="Gerencie contatos e dispare mensagens desta conexão."
        back={
          <IconButton component={RouterLink} to="/connections" aria-label="Voltar para conexões">
            <ArrowBackRoundedIcon />
          </IconButton>
        }
      />
      <Tabs
        value={tab}
        onChange={(_, value: TabKey) => setSearchParams(value === 'contacts' ? {} : { tab: value }, { replace: true })}
        className="mb-4 border-b border-slate-200"
      >
        <Tab value="contacts" label="Contatos" icon={<ContactsRoundedIcon />} iconPosition="start" />
        <Tab value="broadcast" label="Broadcast" icon={<CampaignRoundedIcon />} iconPosition="start" />
      </Tabs>
      {tab === 'contacts' ? <ContactsTab connectionId={connection.id} /> : <div>Broadcast</div>}
    </>
  );
};
