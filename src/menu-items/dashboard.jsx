// assets
import { DashboardOutlined, RobotOutlined } from '@ant-design/icons';

// icons
const icons = {
  DashboardOutlined,
  RobotOutlined
};

// ==============================|| MENU ITEMS - DASHBOARD ||============================== //

const dashboard = {
  id: 'group-dashboard',
  title: 'Navigation',
  type: 'group',
  children: [
    {
      id: 'dashboard',
      title: 'Dashboard',
      type: 'item',
      url: '/dashboard/default',
      icon: icons.DashboardOutlined,
      breadcrumbs: false
    },
    {
      id: 'analise-ai',
      title: 'AnaliseAI',
      type: 'item',
      url: '/dashboard/analise-ai',
      icon: icons.RobotOutlined,
      breadcrumbs: false
    }
  ]
};

export default dashboard;
