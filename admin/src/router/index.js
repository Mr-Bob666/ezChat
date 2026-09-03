import { createRouter, createWebHistory } from 'vue-router';
import AdminLayout from '../layout/AdminLayout.vue';
import LoginView from '../views/LoginView.vue';
import DashboardView from '../views/DashboardView.vue';
import UsersView from '../views/UsersView.vue';
import RoomsView from '../views/RoomsView.vue';
import MessagesView from '../views/MessagesView.vue';
import RecommendView from '../views/RecommendView.vue';

const routes = [
  { path: '/login', name: 'login', component: LoginView },
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

router.beforeEach((to) => {
  const token = localStorage.getItem('adminToken');
  if (!token && to.path !== '/login') {
    return '/login';
  }
  if (token && to.path === '/login') {
    return '/dashboard';
  }
});

export default router;
