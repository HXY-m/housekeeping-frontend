import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/store/user'

const Login = () => import('@/views/Login.vue')
const Home = () => import('@/views/Home.vue')
const ServiceList = () => import('@/views/ServiceList.vue')
const CustomerOrders = () => import('@/views/CustomerOrders.vue')
const ProfessionalOrders = () => import('@/views/ProfessionalOrders.vue')
const AdminDashboard = () => import('@/views/AdminDashboard.vue')
const ServiceManage = () => import('@/views/ServiceManage.vue')
const UserManage = () => import('@/views/UserManage.vue')
const Profile = () => import('@/views/Profile.vue')
const OrderManage = () => import('@/views/OrderManage.vue')
const AddressManage = () => import('@/views/AddressManage.vue')
const AuditManage = () => import('@/views/AuditManage.vue')
const AfterSaleList = () => import('@/views/AfterSaleList.vue')
const AfterSaleManage = () => import('@/views/AfterSaleManage.vue')
const OperationLog = () => import('@/views/OperationLog.vue')
const Welcome = () => import('@/views/Welcome.vue')
const Landing = () => import('@/views/Landing.vue')

const roleHomeMap = {
  '1': '/home/dashboard',
  '2': '/home/services',
  '3': '/home/professional-orders'
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Landing',
      component: Landing,
      meta: { public: true }
    },
    {
      path: '/login',
      name: 'Login',
      component: Login,
      meta: { public: true }
    },
    {
      path: '/home',
      name: 'Home',
      component: Home,
      meta: { requiresAuth: true },
      redirect: '/home/welcome',
      children: [
        { path: 'welcome', name: 'Welcome', component: Welcome },
        { path: 'services', name: 'ServiceList', component: ServiceList, meta: { roles: ['2'] } },
        { path: 'customer-orders', name: 'CustomerOrders', component: CustomerOrders, meta: { roles: ['2'] } },
        { path: 'after-sale', name: 'AfterSaleList', component: AfterSaleList, meta: { roles: ['2'] } },
        { path: 'professional-orders', name: 'ProfessionalOrders', component: ProfessionalOrders, meta: { roles: ['3'] } },
        { path: 'dashboard', name: 'AdminDashboard', component: AdminDashboard, meta: { roles: ['1'] } },
        { path: 'services-manage', name: 'ServiceManage', component: ServiceManage, meta: { roles: ['1'] } },
        { path: 'users-manage', name: 'UserManage', component: UserManage, meta: { roles: ['1'] } },
        { path: 'profile', name: 'Profile', component: Profile },
        { path: 'orders-manage', name: 'OrderManage', component: OrderManage, meta: { roles: ['1'] } },
        { path: 'address', name: 'AddressManage', component: AddressManage, meta: { roles: ['2'] } },
        { path: 'audit-manage', name: 'AuditManage', component: AuditManage, meta: { roles: ['1'] } },
        { path: 'after-sale-manage', name: 'AfterSaleManage', component: AfterSaleManage, meta: { roles: ['1'] } },
        { path: 'operation-logs', name: 'OperationLog', component: OperationLog, meta: { roles: ['1'] } }
      ]
    }
  ]
})

router.beforeEach((to) => {
  const userStore = useUserStore()
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)
  const isPublicRoute = to.matched.some((record) => record.meta.public)
  const allowedRoles = to.matched.map((record) => record.meta.roles).find((roles) => Array.isArray(roles))

  if (requiresAuth && !userStore.token) {
    return { path: '/login', query: { redirect: to.fullPath } }
  }

  if (to.path === '/login' && userStore.token) {
    return roleHomeMap[userStore.userRole] || '/home/welcome'
  }

  if (!isPublicRoute && allowedRoles && !allowedRoles.includes(userStore.userRole)) {
    return roleHomeMap[userStore.userRole] || '/home/welcome'
  }
})

export default router
