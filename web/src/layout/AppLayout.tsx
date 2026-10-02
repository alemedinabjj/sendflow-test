import { Link as RouterLink, Outlet } from 'react-router';
import { AppBar, Button, Toolbar, Typography } from '@mui/material';
import CampaignRoundedIcon from '@mui/icons-material/CampaignRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import { signOut } from '../features/auth/api';
import { useAuth } from '../features/auth/useAuth';

export const AppLayout = () => {
  const { user } = useAuth();

  return (
    <div className="flex min-h-full flex-col">
      <AppBar position="sticky" color="inherit" elevation={0} className="border-b border-slate-200">
        <Toolbar className="mx-auto w-full max-w-5xl gap-3">
          <RouterLink to="/connections" className="flex items-center gap-2 text-indigo-600 no-underline">
            <CampaignRoundedIcon />
            <span className="font-bold tracking-tight">Sendflow Broadcast</span>
          </RouterLink>
          <span className="flex-1" />
          <Typography variant="body2" color="text.secondary" className="hidden! sm:block!">
            {user?.displayName || user?.email}
          </Typography>
          <Button color="inherit" startIcon={<LogoutRoundedIcon />} onClick={() => signOut()}>
            Sair
          </Button>
        </Toolbar>
      </AppBar>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
};
