import { lazy } from 'react';

// project imports
import Loadable from 'components/Loadable';
import DashboardLayout from 'layout/Dashboard';

// support - overview and tickets
const Overview = Loadable(lazy(() => import('pages/dashboard/Overview')));
const Tickets = Loadable(lazy(() => import('pages/support/Tickets')));

// ==============================|| MAIN ROUTING ||============================== //

const MainRoutes = {
  path: '/',
  element: <DashboardLayout />,
  children: [
    {
      path: '/',
      element: <Overview />
    },
    {
      path: 'overview',
      element: <Overview />
    },
    {
      path: 'tickets',
      element: <Tickets />
    }
  ]
};

export default MainRoutes;
