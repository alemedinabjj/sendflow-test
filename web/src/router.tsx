import { createBrowserRouter, Navigate } from 'react-router';
import { LoginPage } from './features/auth/LoginPage';
import { SignupPage } from './features/auth/SignupPage';
import { ProtectedRoute, PublicOnlyRoute } from './features/auth/routeGuards';
import { AppLayout } from './layout/AppLayout';
import { RouteError } from './shared/components/RouteError';

export const router = createBrowserRouter([
  {
    errorElement: <RouteError />,
    children: [
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
              {
                path: '/connections',
                lazy: async () => ({
                  Component: (await import('./features/connections/components/ConnectionsPage')).ConnectionsPage,
                }),
              },
              {
                path: '/connections/:connectionId',
                lazy: async () => ({
                  Component: (await import('./features/connections/components/ConnectionPage')).ConnectionPage,
                }),
              },
            ],
          },
        ],
      },
      { path: '*', element: <Navigate to="/connections" replace /> },
    ],
  },
]);
