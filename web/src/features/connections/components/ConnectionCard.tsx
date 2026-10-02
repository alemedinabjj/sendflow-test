import { Link as RouterLink } from 'react-router';
import { CardActionArea, IconButton, Paper, Tooltip, Typography } from '@mui/material';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import HubRoundedIcon from '@mui/icons-material/HubRounded';
import dayjs from 'dayjs';
import type { Connection } from '../schema';

type Props = { connection: Connection; onRename: () => void; onDelete: () => void };

export const ConnectionCard = ({ connection, onRename, onDelete }: Props) => (
  <Paper className="flex items-center overflow-hidden">
    <CardActionArea component={RouterLink} to={`/connections/${connection.id}`} className="flex! min-w-0 flex-1 items-center gap-3 p-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
        <HubRoundedIcon />
      </div>
      <div className="min-w-0">
        <Typography sx={{ fontWeight: 600 }} noWrap>
          {connection.name}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Criada em {dayjs(connection.createdAt).format('DD/MM/YYYY')}
        </Typography>
      </div>
    </CardActionArea>
    <div className="flex shrink-0 gap-1 pr-2">
      <Tooltip title="Renomear">
        <IconButton onClick={onRename} aria-label={`Renomear ${connection.name}`}>
          <EditRoundedIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Excluir">
        <IconButton onClick={onDelete} aria-label={`Excluir ${connection.name}`}>
          <DeleteOutlineRoundedIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </div>
  </Paper>
);
