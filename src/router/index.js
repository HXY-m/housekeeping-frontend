import { createRouter, createWebHistory } from 'vue-router'
import Login from '@/views/Login.vue'
import Home from '@/views/Home.vue'
import ServiceList from '@/views/ServiceList.vue'
import CustomerOrders from '@/views/CustomerOrders.vue';
import ProfessionalOrders from '@/views/ProfessionalOrders.vue';
import AdminDashboard from '@/views/AdminDashboard.vue';
import ServiceManage from '@/views/ServiceManage.vue';
import UserManage from '@/views/UserManage.vue';
import Profile from '@/views/Profile.vue';
import OrderManage from '@/views/OrderManage.vue';
import AddressManage from '@/views/AddressManage.vue';
import AuditManage from '@/views/AuditManage.vue'
import Welcome from '@/views/Welcome.vue';
import Landing from '@/views/Landing.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Landing',
      component: Landing // 【修改】：让根路径直接展示官网首页
    },
    // 配置登录页路由
    {
      path: '/login',
      name: 'Login',
      component: Login
    },
    {
      path: '/home',
      name: 'Home',
      component: Home,
      redirect: '/home/welcome',
      children: [
        {
          path: 'welcome', // 3. 【核心新增】：配置欢迎页的子路由
          name: 'Welcome',
          component: Welcome
        },
        {
          path: 'services',
          name: 'ServiceList',
          component: ServiceList
        },
        {
          path: 'customer-orders',
          name: 'CustomerOrders',
          component: CustomerOrders
        },
        {
          path: 'professional-orders',
          name: 'ProfessionalOrders',
          component: ProfessionalOrders
        },
        {
          path: 'dashboard',
          name: 'AdminDashboard',
          component: AdminDashboard
        },
        {
          path: 'services-manage',
          name: 'ServiceManage',
          component: ServiceManage
        },
        {
          path: 'users-manage',
          name: 'UserManage',
          component: UserManage
        },
        {
          path: 'profile',
          name: 'Profile',
          component: Profile
        },
        {
          path: 'orders-manage',
          name: 'OrderManage',
          component: OrderManage
        },
        {
          path: 'address',
          name: 'AddressManage',
          component: AddressManage
        },
        {
          path: 'audit-manage',
          name: 'AuditManage',
          component: AuditManage
        }
      ]
    }
  ]
})

export default router