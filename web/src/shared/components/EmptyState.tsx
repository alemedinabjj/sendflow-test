import type { ReactNode } from 'react';
import { Paper, Typography } from '@mui/material';

type Props = { icon: ReactNode; title: string; description: string; action?: ReactNode };

export const EmptyState = ({ icon, title, description, action }: Props) => (
  <Paper className="flex flex-col items-center gap-2 px-6 py-12 text-center">
    <div className="text-slate-400 [&_svg]:text-5xl!">{icon}</div>
    <Typography variant="h6">{title}</Typography>
    <Typography variant="body2" color="text.secondary" className="max-w-sm">
      {description}
    </Typography>
    {action && <div className="mt-3">{action}</div>}
  </Paper>
);
