// assets
import { ChromeOutlined, QuestionOutlined, RobotOutlined } from '@ant-design/icons';

// icons
const icons = {
  ChromeOutlined,
  QuestionOutlined,
  RobotOutlined
};

// ==============================|| MENU ITEMS - SUPPORT DASHBOARD ||============================== //

const support = {
  id: 'support',
  title: '',
  type: 'group',
  children: [
    {
      id: 'overview',
      title: 'Visão Geral',
      type: 'item',
      url: '/overview',
      icon: icons.ChromeOutlined
    },
    {
      id: 'tickets',
      title: 'Chamados',
      type: 'item',
      url: '/tickets',
      icon: icons.QuestionOutlined
    },
    {
      id: 'analise-ai',
      title: 'AnaliseAI',
      type: 'item',
      url: '/analise-ai',
      icon: icons.RobotOutlined
    }
  ]
};

export default support;
