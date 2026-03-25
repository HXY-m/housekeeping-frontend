<template>
  <div class="shell" :data-role="role">
    <aside class="sidebar">
      <div class="brand">
        <span class="brand-chip">{{ roleBadge }}</span>
        <h1>{{ platformTitle }}</h1>
        <p>家政服务、订单协同、售后闭环与运营分析统一工作台。</p>
      </div>

      <nav class="nav">
        <button
          v-for="item in navItems"
          :key="item.path"
          class="nav-item"
          :class="{ active: currentPath === item.path }"
          @click="router.push(item.path)"
        >
          <el-icon><component :is="item.icon" /></el-icon>
          <span>{{ item.label }}</span>
        </button>
      </nav>
    </aside>

    <section class="main">
      <header class="topbar">
        <div>
          <p class="topbar-label">Workspace</p>
          <h2>{{ pageTitle }}</h2>
        </div>
        <div class="topbar-user">
          <div class="user-card">
            <el-avatar :size="36">{{ username?.charAt(0)?.toUpperCase() || 'U' }}</el-avatar>
            <div>
              <strong>{{ username }}</strong>
              <p>{{ roleName }}</p>
            </div>
          </div>
          <el-button text @click="router.push('/home/profile')">个人中心</el-button>
          <el-button type="danger" plain @click="handleLogout">退出登录</el-button>
        </div>
      </header>

      <main class="content">
        <router-view />
      </main>
    </section>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  Briefcase, DataLine, House, List, Location, Monitor, SetUp, ShoppingTrolley, Stamp, Tickets, User
} from '@element-plus/icons-vue'
import { useUserStore } from '@/store/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const username = computed(() => userStore.username)
const role = computed(() => userStore.userRole)
const currentPath = computed(() => route.path)

const roleBadge = computed(() => ({
  '1': 'ADMIN',
  '2': 'CUSTOMER',
  '3': 'PRO'
}[role.value] || 'USER'))

const roleName = computed(() => ({
  '1': '平台管理员',
  '2': '客户端',
  '3': '服务人员端'
}[role.value] || '未知角色'))

const platformTitle = computed(() => ({
  '1': '运营管理后台',
  '2': '客户服务中心',
  '3': '服务接单中心'
}[role.value] || '平台工作台'))

const navConfig = {
  '1': [
    { path: '/home/welcome', label: '概览', icon: Monitor },
    { path: '/home/dashboard', label: '数据分析', icon: DataLine },
    { path: '/home/orders-manage', label: '订单管理', icon: Tickets },
    { path: '/home/services-manage', label: '服务管理', icon: SetUp },
    { path: '/home/users-manage', label: '用户管理', icon: User },
    { path: '/home/audit-manage', label: '资质审核', icon: Stamp },
    { path: '/home/after-sale-manage', label: '售后处理', icon: List },
    { path: '/home/operation-logs', label: '操作日志', icon: House }
  ],
  '2': [
    { path: '/home/welcome', label: '概览', icon: Monitor },
    { path: '/home/services', label: '预约服务', icon: ShoppingTrolley },
    { path: '/home/customer-orders', label: '我的订单', icon: Tickets },
    { path: '/home/after-sale', label: '售后反馈', icon: List },
    { path: '/home/address', label: '地址管理', icon: Location }
  ],
  '3': [
    { path: '/home/welcome', label: '概览', icon: Monitor },
    { path: '/home/professional-orders', label: '订单工作台', icon: Briefcase },
    { path: '/home/profile', label: '资料档案', icon: User }
  ]
}

const navItems = computed(() => navConfig[role.value] || [])
const pageTitle = computed(() => navItems.value.find((item) => item.path === route.path)?.label || '工作台')

const handleLogout = () => {
  userStore.clearUserInfo()
  router.push('/login')
}
</script>

<style scoped>
.shell {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 300px 1fr;
  background:
    radial-gradient(circle at top left, rgba(13, 148, 136, 0.14), transparent 28%),
    linear-gradient(180deg, #f4f8f6 0%, #eff6ff 100%);
}

.sidebar {
  padding: 28px 22px;
  background: #0f172a;
  color: #e2e8f0;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.brand-chip {
  display: inline-flex;
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(45, 212, 191, 0.14);
  color: #99f6e4;
  font-size: 12px;
  letter-spacing: 0.16em;
}

.brand h1 {
  margin: 14px 0 10px;
  font-size: 30px;
}

.brand p {
  margin: 0;
  color: #94a3b8;
  line-height: 1.6;
}

.nav {
  display: grid;
  gap: 10px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  border: 0;
  border-radius: 16px;
  padding: 14px 16px;
  background: transparent;
  color: inherit;
  cursor: pointer;
  text-align: left;
  transition: 0.2s ease;
}

.nav-item:hover,
.nav-item.active {
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
}

.main {
  display: grid;
  grid-template-rows: auto 1fr;
  min-width: 0;
}

.topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding: 26px 32px 18px;
}

.topbar-label {
  margin: 0 0 8px;
  color: #0f766e;
  letter-spacing: 0.18em;
  font-size: 12px;
  text-transform: uppercase;
}

.topbar h2 {
  margin: 0;
  font-size: 28px;
  color: #0f172a;
}

.topbar-user {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.72);
  backdrop-filter: blur(16px);
}

.user-card p {
  margin: 4px 0 0;
  color: #64748b;
  font-size: 12px;
}

.content {
  padding: 0 32px 32px;
  overflow: auto;
}

@media (max-width: 1024px) {
  .shell {
    grid-template-columns: 1fr;
  }

  .sidebar {
    padding-bottom: 12px;
  }
}
</style>
