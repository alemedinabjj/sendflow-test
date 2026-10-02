import { Button, Paper, Typography } from '@mui/material';
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';

export const RouteError = () => (
  <div className="flex min-h-full items-center justify-center px-4">
    <Paper className="flex max-w-sm flex-col items-center gap-3 p-8 text-center">
      <ErrorOutlineRoundedIcon className="text-5xl! text-slate-400" />
      <Typography variant="h6">Algo deu errado</Typography>
      <Typography variant="body2" color="text.secondary">
        Pode ser uma nova versão do app. Recarregue a página para continuar.
      </Typography>
      <Button variant="contained" onClick={() => window.location.reload()}>
        Recarregar
      </Button>
    </Paper>
  </div>
);
