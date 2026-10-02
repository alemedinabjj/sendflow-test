import type { ReactNode } from 'react';
import { Typography } from '@mui/material';

type Props = { title: string; subtitle?: string; action?: ReactNode; back?: ReactNode };

export const PageHeader = ({ title, subtitle, action, back }: Props) => (
  <div className="mb-6 flex flex-wrap items-center gap-3">
    {back}
    <div className="min-w-0 flex-1">
      <Typography variant="h5" component="h1" sx={{ fontWeight: 700 }} noWrap>
        {title}
      </Typography>
      {subtitle && (
        <Typography variant="body2" color="text.secondary">
          {subtitle}
        </Typography>
      )}
    </div>
    {action}
  </div>
);
