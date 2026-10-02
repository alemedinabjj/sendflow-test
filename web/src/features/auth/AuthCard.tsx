import type { ReactNode } from 'react';
import { Paper, Typography } from '@mui/material';
import CampaignRoundedIcon from '@mui/icons-material/CampaignRounded';

type Props = { title: string; subtitle: string; children: ReactNode; footer: ReactNode };

export const AuthCard = ({ title, subtitle, children, footer }: Props) => (
  <div className="flex min-h-full items-center justify-center bg-gradient-to-br from-indigo-50 to-teal-50 px-4 py-10">
    <Paper className="w-full max-w-md p-8">
      <div className="mb-6 flex items-center gap-2 text-indigo-600">
        <CampaignRoundedIcon />
        <span className="font-bold tracking-tight">Sendflow Broadcast</span>
      </div>
      <Typography variant="h5" sx={{ fontWeight: 700 }}>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary" className="mb-6! mt-1!">
        {subtitle}
      </Typography>
      {children}
      <div className="mt-6 text-center text-sm text-slate-600">{footer}</div>
    </Paper>
  </div>
);
