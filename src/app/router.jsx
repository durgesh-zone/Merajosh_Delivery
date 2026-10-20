import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate, Outlet, useLocation } from 'react-router-dom';
import { RiderLayout } from '@/components/layout/RiderLayout';
import { PageLoader } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { RouteError } from './RouteError';

const LoginPage = lazy(() => import('@/pages/LoginPage'));
const DeliveriesPage = lazy(() => import('@/pages/DeliveriesPage'));
const DeliveryDetailPage = lazy(() => import('@/pages/DeliveryDetailPage'));
const SummaryPage = lazy(() => import('@/pages/SummaryPage'));
const AccountPage = lazy(() => import('@/pages/AccountPage'));

function RequireRider() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  if (isLoading) return <PageLoader />;
  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: location }} />;
  return <Outlet />;
}

export const router = createBrowserRouter([
  { path: '/login', element: <Suspense fallback={<PageLoader />}><LoginPage /></Suspense> },
  {
    element: <RequireRider />,
    children: [
      {
        element: <RiderLayout />,
        errorElement: <RouteError />,
        children: [
          { index: true, element: <DeliveriesPage /> },
          { path: 'orders/:orderId', element: <DeliveryDetailPage /> },
          { path: 'summary', element: <SummaryPage /> },
          { path: 'account', element: <AccountPage /> },
          { path: '*', element: <Navigate to="/" replace /> },
        ],
      },
    ],
  },
]);
