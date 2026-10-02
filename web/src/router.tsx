import { createBrowserRouter, Navigate } from 'react-router';
import { LoginPage } from './features/auth/LoginPage';
import { SignupPage } from './features/auth/SignupPage';
import { ProtectedRoute, PublicOnlyRoute } from './features/auth/routeGuards';
import { AppLayout } from './layout/AppLayout';

export const router = createBrowserRouter([
  {
    element: <PublicOnlyRoute />,
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/signup', element: <SignupPage /> },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: '/connections', element: <div>Conexões</div> },
          { path: '/connections/:connectionId', element: <div>Conexão</div> },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to="/connections" replace /> },
]);
