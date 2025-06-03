import { lazy, Suspense } from 'react';
import { Navigate, Outlet } from 'react-router-dom';

import { AuthGuard } from 'src/auth/guard';
import DashboardLayout from 'src/layouts/dashboard';

import { LoadingScreen } from 'src/components/loading-screen';

// ----------------------------------------------------------------------

// Pipe Follow Module Pages
const SpoolFollowPage = lazy(
  () => import('src/pages/dashboard/construction/pipe-follow/spool-follow')
);
const DocumentsPage = lazy(() => import('src/pages/dashboard/design/documents/documents'));

const DocumentsNewPage = lazy(() => import('src/pages/dashboard/design/documents/documents-new'));

// ----------------------------------------------------------------------

export const dashboardRoutes = [
  {
    path: 'dashboard',
    element: (
      <AuthGuard>
        <DashboardLayout>
          <Suspense fallback={<LoadingScreen />}>
            <Outlet />
          </Suspense>
        </DashboardLayout>
      </AuthGuard>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard/construction/pipe-follow/spool-follow" replace />,
      },
      {
        path: 'construction',
        children: [
          {
            path: 'pipe-follow',
            children: [{ path: 'spool-follow', element: <SpoolFollowPage /> }],
          },
        ],
      },
      {
        path: 'design',
        children: [
          {
            path: 'documents',
            element: <DocumentsPage />,
          },
          {
            path: 'documents/:id/edit',
            element: <DocumentsNewPage />,
          },
          {
            path: 'documents/new',
            element: <DocumentsNewPage />,
          },
        ],
      },
    ],
  },
];
