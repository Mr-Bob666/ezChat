import { createRouter, createWebHistory } from 'vue-router';
import AdminLayout from '../layout/AdminLayout.vue';
import DashboardView from '../views/DashboardView.vue';
import UsersView from '../views/UsersView.vue';
import RoomsView from '../views/RoomsView.vue';
import MessagesView from '../views/MessagesView.vue';
import RecommendView from '../views/RecommendView.vue';

const CLIENT_URL = import.meta.env.VITE_CLIENT_URL || 'https://localhost:5173';

const routes = [
  {
    path: '/',
    component: AdminLayout,
    redirect: '/dashboard',
    children: [
      { path: 'dashboard', name: 'dashboard', component: DashboardView, meta: { title: '数据概览' } },
      { path: 'users', name: 'users', component: UsersView, meta: { title: '用户管理' } },
      { path: 'rooms', name: 'rooms', component: RoomsView, meta: { title: '房间管理' } },
      { path: 'messages', name: 'messages', component: MessagesView, meta: { title: '消息管理' } },
      { path: 'recommend', name: 'recommend', component: RecommendView, meta: { title: '房间推荐' } },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// 后台不再提供登录页：由主页面管理员登录后带 ?token= 跳转过来，
// 这里接收并写入 localStorage；没有登录态则跳回主页面。
router.beforeEach((to) => {
  const { token, username, adminId } = to.query;
  if (typeof token === 'string' && token) {
    localStorage.setItem('adminToken', token);
    localStorage.setItem('adminInfo', JSON.stringify({
      id: Number(adminId) || 0,
      username: typeof username === 'string' ? username : '',
    }));
    const query = { ...to.query };
    delete query.token;
    delete query.username;
    delete query.adminId;
    return { path: to.path, query, hash: to.hash, replace: true };
  }
  if (!localStorage.getItem('adminToken')) {
    window.location.href = CLIENT_URL;
    return false;
  }
});

export default router;
