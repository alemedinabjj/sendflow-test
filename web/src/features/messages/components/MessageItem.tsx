import dayjs from 'dayjs';
import { Chip, IconButton, ListItem, Tooltip, Typography } from '@mui/material';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import DoneAllRoundedIcon from '@mui/icons-material/DoneAllRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import ScheduleRoundedIcon from '@mui/icons-material/ScheduleRounded';
import type { Message } from '../schema';

type Props = { message: Message; divider: boolean; onEdit: () => void; onDelete: () => void };

const recipientsSummary = (message: Message) => {
  const names = message.recipients.map((r) => r.name);
  return names.length <= 3 ? names.join(', ') : `${names.slice(0, 3).join(', ')} +${names.length - 3}`;
};

const formatDate = (date: Date | null) => (date ? dayjs(date).format('DD/MM/YYYY [às] HH:mm') : '');

export const MessageItem = ({ message, divider, onEdit, onDelete }: Props) => {
  const scheduled = message.status === 'scheduled';

  return (
    <ListItem divider={divider} className="flex-col items-stretch! gap-2 py-3!">
      <div className="flex items-center gap-2">
        <Chip
          size="small"
          color={scheduled ? 'warning' : 'success'}
          variant="outlined"
          icon={scheduled ? <ScheduleRoundedIcon /> : <DoneAllRoundedIcon />}
          label={scheduled ? 'Agendada' : 'Enviada'}
        />
        <Typography variant="caption" color="text.secondary" className="flex-1">
          {scheduled ? `Envio em ${formatDate(message.scheduledAt)}` : `Enviada em ${formatDate(message.sentAt)}`}
        </Typography>
        {scheduled && (
          <Tooltip title="Editar">
            <IconButton size="small" onClick={onEdit} aria-label="Editar mensagem">
              <EditRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
        <Tooltip title="Excluir">
          <IconButton size="small" onClick={onDelete} aria-label="Excluir mensagem">
            <DeleteOutlineRoundedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </div>
      <Typography variant="body2" className="line-clamp-3 whitespace-pre-line">
        {message.body}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        Para: {recipientsSummary(message)}
      </Typography>
    </ListItem>
  );
};
