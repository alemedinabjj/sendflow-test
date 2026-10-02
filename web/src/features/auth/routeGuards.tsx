import { Navigate, Outlet, useLocation } from 'react-router';
import { CircularProgress } from '@mui/material';
import { useAuth } from './useAuth';

const FullScreenLoader = () => (
  <div className="flex h-full items-center justify-center">
    <CircularProgress />
  </div>
);

export const ProtectedRoute = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <FullScreenLoader />;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return <Outlet />;
};

export const PublicOnlyRoute = () => {
  const { user, loading } = useAuth();

  if (loading) return <FullScreenLoader />;
  if (user) return <Navigate to="/connections" replace />;
  return <Outlet />;
};
