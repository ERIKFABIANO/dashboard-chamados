// assets
import { ChromeOutlined, QuestionOutlined } from '@ant-design/icons';

// icons
const icons = {
  ChromeOutlined,
  QuestionOutlined
};

// ==============================|| MENU ITEMS - SUPPORT DASHBOARD ||============================== //

const support = {
  id: 'support',
  title: 'Painel de Suporte',
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
    }
  ]
};

export default support;
