<template>
    <div class="home-container" :class="themeClass">
        <aside class="sidebar">
            <div class="logo">
                <span class="logo-text">{{ platformTitle }}</span>
            </div>

            <ul class="menu">
                <li @click="router.push('/home/welcome')" :class="{ active: currentPath === '/home/welcome' }">
                    <el-icon><Monitor /></el-icon> 欢迎页
                </li>

                <template v-if="role === '2'">
                    <li @click="router.push('/home/services')" :class="{ active: currentPath === '/home/services' }">
                        <el-icon><ShoppingTrolley /></el-icon> 预约服务
                    </li>
                    <li @click="router.push('/home/customer-orders')" :class="{ active: currentPath === '/home/customer-orders' }">
                        <el-icon><Tickets /></el-icon> 我的订单
                    </li>
                    <li @click="router.push('/home/after-sale')" :class="{ active: currentPath === '/home/after-sale' }">
                        <el-icon><List /></el-icon> 售后反馈
                    </li>
                    <li @click="router.push('/home/address')" :class="{ active: currentPath === '/home/address' }">
                        <el-icon><Location /></el-icon> 我的地址
                    </li>
                </template>

                <template v-if="role === '3'">
                    <li @click="router.push('/home/professional-orders')" :class="{ active: currentPath === '/home/professional-orders' }">
                        <el-icon><Briefcase /></el-icon> 师傅工作台
                    </li>
                </template>

                <template v-if="role === '1'">
                    <li @click="router.push('/home/dashboard')" :class="{ active: currentPath === '/home/dashboard' }">
                        <el-icon><DataLine /></el-icon> 数据控制台
                    </li>
                    <li @click="router.push('/home/services-manage')" :class="{ active: currentPath === '/home/services-manage' }">
                        <el-icon><SetUp /></el-icon> 服务管理
                    </li>
                    <li @click="router.push('/home/users-manage')" :class="{ active: currentPath === '/home/users-manage' }">
                        <el-icon><User /></el-icon> 用户管理
                    </li>
                    <li @click="router.push('/home/orders-manage')" :class="{ active: currentPath === '/home/orders-manage' }">
                        <el-icon><Tickets /></el-icon> 订单管理
                    </li>
                    <li @click="router.push('/home/audit-manage')" :class="{ active: currentPath === '/home/audit-manage' }">
                        <el-icon><Stamp /></el-icon> 资质审核
                    </li>
                    <li @click="router.push('/home/after-sale-manage')" :class="{ active: currentPath === '/home/after-sale-manage' }">
                        <el-icon><List /></el-icon> 售后处理
                    </li>
                </template>
            </ul>
        </aside>

        <div class="main-wrapper">
            <header class="top-header">
                <div class="header-left"></div>
                <div class="header-right">
                    <el-tag :type="roleTagType" effect="dark" round size="small" style="margin-right: 15px;">
                        {{ roleName }}
                    </el-tag>

                    <el-dropdown trigger="click">
                        <span class="user-dropdown-link" style="cursor: pointer; display: flex; align-items: center; gap: 8px; font-weight: bold; color: var(--header-text-color, #303133);">
                            <el-avatar :size="32" style="background: #409EFF;">
                                {{ username ? username.charAt(0).toUpperCase() : 'U' }}
                            </el-avatar>
                            {{ username }}
                            <el-icon><CaretBottom /></el-icon>
                        </span>
                        <template #dropdown>
                            <el-dropdown-menu>
                                <el-dropdown-item @click="router.push('/home/profile')">
                                    <el-icon><User /></el-icon> 个人中心
                                </el-dropdown-item>
                                <el-dropdown-item divided style="color: #F56C6C;" @click="handleLogout">
                                    <el-icon><SwitchButton /></el-icon> 退出系统
                                </el-dropdown-item>
                            </el-dropdown-menu>
                        </template>
                    </el-dropdown>
                </div>
            </header>

            <main class="content">
                <router-view></router-view>
            </main>
        </div>
    </div>
</template>

<script setup>
import { onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
    ShoppingTrolley, Tickets, Briefcase, DataLine,
    SetUp, User, CaretBottom, SwitchButton, Monitor, List, Location, Stamp
} from '@element-plus/icons-vue'
import { useUserStore } from '../store/user'

const userStore = useUserStore()
const router = useRouter()
const route = useRoute()

const username = computed(() => userStore.username)
const role = computed(() => userStore.userRole)
const currentPath = computed(() => route.path)

const themeClass = computed(() => {
    if (role.value === '1') return 'theme-admin'
    if (role.value === '2') return 'theme-customer'
    if (role.value === '3') return 'theme-pro'
    return ''
})

const platformTitle = computed(() => {
    if (role.value === '1') return '家政运营管理后台'
    if (role.value === '2') return '家政服务预约平台'
    if (role.value === '3') return '师傅接单中心'
    return '家政服务平台'
})

const roleName = computed(() => {
    if (role.value === '1') return '管理员'
    if (role.value === '2') return '客户'
    if (role.value === '3') return '服务人员'
    return '未知角色'
})

const roleTagType = computed(() => {
    if (role.value === '1') return 'danger'
    if (role.value === '2') return 'primary'
    if (role.value === '3') return 'success'
    return 'info'
})

onMounted(() => {
    if (!userStore.username || !userStore.userRole) {
        router.push('/login')
    }
})

const handleLogout = () => {
    userStore.clearUserInfo()
    router.push('/login')
}
</script>

<style scoped>
.home-container {
    display: flex;
    height: 100vh;
    width: 100vw;
    overflow: hidden;
    background-color: #f0f2f5;
}

.sidebar {
    width: 220px;
    display: flex;
    flex-direction: column;
    transition: all 0.3s ease;
    z-index: 10;
}

.logo {
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    font-weight: bold;
    letter-spacing: 1px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.menu {
    list-style: none;
    padding: 0;
    margin: 0;
    flex: 1;
}

.menu li {
    padding: 15px 20px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 15px;
    transition: all 0.2s;
}

.main-wrapper {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.top-header {
    height: 60px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 20px;
    box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
    z-index: 9;
}

.header-right {
    display: flex;
    align-items: center;
}

.user-dropdown-link:focus-visible {
    outline: none;
}

.content {
    flex: 1;
    padding: 20px;
    overflow-y: auto;
}

.theme-admin .sidebar {
    background-color: #2b333e;
    color: #fff;
}

.theme-admin .top-header {
    background-color: #ffffff;
    --header-text-color: #303133;
}

.theme-admin .menu li:hover {
    background-color: #3a4555;
}

.theme-admin .menu li.active {
    background-color: #409EFF;
    color: #fff;
}

.theme-customer .sidebar {
    background-color: #ffffff;
    color: #303133;
    box-shadow: 2px 0 8px rgba(0, 0, 0, 0.05);
}

.theme-customer .logo {
    border-bottom: 1px solid #ebeef5;
    color: #409EFF;
}

.theme-customer .top-header {
    background-color: #409EFF;
    --header-text-color: #ffffff;
}

.theme-customer .menu li {
    color: #606266;
}

.theme-customer .menu li:hover {
    background-color: #f0f7ff;
    color: #409EFF;
}

.theme-customer .menu li.active {
    background-color: #ecf5ff;
    color: #409EFF;
    border-right: 4px solid #409EFF;
    font-weight: bold;
}

.theme-pro .sidebar {
    background-color: #34495e;
    color: #ecf0f1;
}

.theme-pro .top-header {
    background-color: #ffffff;
    border-bottom: 2px solid #1abc9c;
    --header-text-color: #303133;
}

.theme-pro .logo {
    background-color: #2c3e50;
    border-bottom: none;
}

.theme-pro .menu li:hover {
    background-color: #2c3e50;
}

.theme-pro .menu li.active {
    background-color: #1abc9c;
    color: #fff;
}
</style>
