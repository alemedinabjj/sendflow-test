import { useState } from 'react';
import { useSnackbar } from 'notistack';
import {
  Alert,
  Avatar,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Paper,
  Tooltip,
} from '@mui/material';
import ContactsRoundedIcon from '@mui/icons-material/ContactsRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import PersonAddAlt1RoundedIcon from '@mui/icons-material/PersonAddAlt1Rounded';
import { useTenantId } from '../../auth/useAuth';
import { ConfirmDialog } from '../../../shared/components/ConfirmDialog';
import { EmptyState } from '../../../shared/components/EmptyState';
import { LoadingBlock } from '../../../shared/components/LoadingBlock';
import { firestoreErrorMessage } from '../../../shared/firestoreErrors';
import { createContact, deleteContact, updateContact } from '../api';
import { useContacts } from '../hooks';
import { formatPhone } from '../phone';
import type { Contact, ContactInput } from '../schema';
import { ContactFormDialog } from './ContactFormDialog';

type FormState = { contact?: Contact } | null;

export const ContactsTab = ({ connectionId }: { connectionId: string }) => {
  const tenantId = useTenantId();
  const { data: contacts, loading, error } = useContacts(tenantId, connectionId);
  const { enqueueSnackbar } = useSnackbar();
  const [form, setForm] = useState<FormState>(null);
  const [toDelete, setToDelete] = useState<Contact | null>(null);

  const withFeedback = (action: () => Promise<unknown>, success: string) => async () => {
    try {
      await action();
      enqueueSnackbar(success, { variant: 'success' });
    } catch (e) {
      enqueueSnackbar(firestoreErrorMessage(e), { variant: 'error' });
      throw e;
    }
  };

  const submitForm = (input: ContactInput) => {
    const editing = form?.contact;
    return editing
      ? withFeedback(() => updateContact(editing.id, input), 'Contato atualizado.')()
      : withFeedback(() => createContact(tenantId, connectionId, input), 'Contato adicionado.')();
  };

  const addButton = (
    <Button variant="contained" startIcon={<PersonAddAlt1RoundedIcon />} onClick={() => setForm({})}>
      Novo contato
    </Button>
  );

  if (loading) return <LoadingBlock />;

  return (
    <>
      {error && <Alert severity="error">{firestoreErrorMessage(error)}</Alert>}

      {contacts.length === 0 ? (
        <EmptyState
          icon={<ContactsRoundedIcon />}
          title="Nenhum contato"
          description="Adicione os contatos que vão receber as mensagens desta conexão."
          action={addButton}
        />
      ) : (
        <>
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm text-slate-600">{contacts.length} contato(s)</span>
            {addButton}
          </div>
          <Paper>
            <List disablePadding>
              {contacts.map((contact, index) => (
                <ListItem
                  key={contact.id}
                  divider={index < contacts.length - 1}
                  secondaryAction={
                    <div className="flex gap-1">
                      <Tooltip title="Editar">
                        <IconButton onClick={() => setForm({ contact })} aria-label={`Editar ${contact.name}`}>
                          <EditRoundedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Excluir">
                        <IconButton onClick={() => setToDelete(contact)} aria-label={`Excluir ${contact.name}`}>
                          <DeleteOutlineRoundedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </div>
                  }
                >
                  <ListItemAvatar>
                    <Avatar className="bg-teal-100! text-teal-700!">{contact.name.charAt(0).toUpperCase()}</Avatar>
                  </ListItemAvatar>
                  <ListItemText primary={contact.name} secondary={formatPhone(contact.phone)} />
                </ListItem>
              ))}
            </List>
          </Paper>
        </>
      )}

      <ContactFormDialog
        open={form !== null}
        contact={form?.contact}
        onSubmit={submitForm}
        onClose={() => setForm(null)}
      />

      <ConfirmDialog
        open={toDelete !== null}
        title="Excluir contato?"
        description={
          <>
            <strong>{toDelete?.name}</strong> será removido desta conexão. Mensagens já criadas continuam com o
            registro do destinatário.
          </>
        }
        onConfirm={withFeedback(() => deleteContact(toDelete!.id), 'Contato excluído.')}
        onClose={() => setToDelete(null)}
      />
    </>
  );
};
