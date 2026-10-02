import { useMemo, useState } from 'react';
import {
  Checkbox,
  FormHelperText,
  InputAdornment,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  TextField,
} from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import { formatPhone } from '../../contacts/phone';
import type { PickableContact } from '../schema';

type Props = {
  contacts: PickableContact[];
  value: string[];
  onChange: (ids: string[]) => void;
  error?: string;
};

const matches = (contact: PickableContact, term: string) => {
  const digits = term.replace(/\D/g, '');
  return contact.name.toLowerCase().includes(term) || (digits !== '' && contact.phone.includes(digits));
};

export const ContactPicker = ({ contacts, value, onChange, error }: Props) => {
  const [search, setSearch] = useState('');
  const term = search.trim().toLowerCase();
  const visible = useMemo(() => (term ? contacts.filter((c) => matches(c, term)) : contacts), [contacts, term]);
  const selected = new Set(value);
  const allVisibleSelected = visible.length > 0 && visible.every((c) => selected.has(c.id));

  const toggle = (id: string) =>
    onChange(selected.has(id) ? value.filter((v) => v !== id) : [...value, id]);

  const toggleAllVisible = () => {
    const visibleIds = new Set(visible.map((c) => c.id));
    onChange(
      allVisibleSelected
        ? value.filter((id) => !visibleIds.has(id))
        : [...value, ...visible.filter((c) => !selected.has(c.id)).map((c) => c.id)],
    );
  };

  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="font-medium text-slate-700">Destinatários</span>
        <span className="text-slate-500">
          {contacts.filter((c) => selected.has(c.id)).length} de {contacts.length} selecionado(s)
        </span>
      </div>
      <Paper className={error ? 'border-red-500!' : ''}>
        <div className="border-b border-slate-200 p-2">
          <TextField
            size="small"
            fullWidth
            placeholder="Buscar por nome ou telefone"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRoundedIcon fontSize="small" />
                  </InputAdornment>
                ),
              },
            }}
          />
        </div>
        <List dense disablePadding className="max-h-64 overflow-y-auto">
          <ListItemButton onClick={toggleAllVisible} disabled={visible.length === 0} divider>
            <ListItemIcon className="min-w-0! pr-2">
              <Checkbox
                edge="start"
                size="small"
                disableRipple
                checked={allVisibleSelected}
                indeterminate={!allVisibleSelected && visible.some((c) => selected.has(c.id))}
              />
            </ListItemIcon>
            <ListItemText primary={term ? 'Selecionar resultados' : 'Selecionar todos'} />
          </ListItemButton>
          {visible.map((contact) => (
            <ListItemButton key={contact.id} onClick={() => toggle(contact.id)}>
              <ListItemIcon className="min-w-0! pr-2">
                <Checkbox edge="start" size="small" disableRipple checked={selected.has(contact.id)} />
              </ListItemIcon>
              <ListItemText
                primary={contact.name}
                secondary={contact.removed ? `${formatPhone(contact.phone)} · contato excluído` : formatPhone(contact.phone)}
              />
            </ListItemButton>
          ))}
          {visible.length === 0 && (
            <div className="px-4 py-6 text-center text-sm text-slate-500">Nenhum contato encontrado.</div>
          )}
        </List>
      </Paper>
      {error && <FormHelperText error>{error}</FormHelperText>}
    </div>
  );
};
