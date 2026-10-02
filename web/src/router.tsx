import { createBrowserRouter, Navigate } from 'react-router';

const Placeholder = ({ name }: { name: string }) => <div className="p-8">{name}</div>;

export const router = createBrowserRouter([
  { path: '/login', element: <Placeholder name="login" /> },
  { path: '/signup', element: <Placeholder name="signup" /> },
  { path: '/connections', element: <Placeholder name="connections" /> },
  { path: '/connections/:connectionId', element: <Placeholder name="connection" /> },
  { path: '*', element: <Navigate to="/connections" replace /> },
]);
