<template>
    <div class="welcome-container">
        <el-card shadow="never" class="welcome-banner">
            <div class="greeting-box">
                <el-avatar :size="64" class="user-avatar">
                    {{ username.charAt(0).toUpperCase() }}
                </el-avatar>
                <div class="greeting-text">
                    <h2>{{ timeGreeting }}，{{ username }}！</h2>
                    <p v-if="role === '1'">欢迎回到系统控制台，今天也是守护平台平稳运行的一天。</p>
                    <p v-if="role === '2'">为您提供最优质的家政服务，让生活更轻松。</p>
                    <p v-if="role === '3'">辛苦了！平台因您的专业服务而更加美好。</p>
                </div>
            </div>
        </el-card>

        <div class="quick-workspace" style="margin-top: 20px;">

            <el-row :gutter="20" v-if="role === '1'">
                <el-col :span="8">
                    <el-card shadow="hover" class="data-card" @click="$router.push('/home/audit-manage')">
                        <el-icon class="card-icon" color="#E6A23C">
                            <Stamp />
                        </el-icon>
                        <div class="card-info">
                            <div class="title">资质审核</div>
                            <div class="desc">处理师傅入驻申请</div>
                        </div>
                    </el-card>
                </el-col>
                <el-col :span="8">
                    <el-card shadow="hover" class="data-card" @click="$router.push('/home/orders-manage')">
                        <el-icon class="card-icon" color="#409EFF">
                            <List />
                        </el-icon>
                        <div class="card-info">
                            <div class="title">全局订单</div>
                            <div class="desc">监控全平台交易流水</div>
                        </div>
                    </el-card>
                </el-col>
                <el-col :span="8">
                    <el-card shadow="hover" class="data-card" @click="$router.push('/home/services-manage')">
                        <el-icon class="card-icon" color="#67C23A">
                            <Grid />
                        </el-icon>
                        <div class="card-info">
                            <div class="title">服务管理</div>
                            <div class="desc">上架或调整服务类目</div>
                        </div>
                    </el-card>
                </el-col>
            </el-row>

            <el-row :gutter="20" v-if="role === '2'">
                <el-col :span="12">
                    <el-card shadow="hover" class="action-card bg-blue" @click="$router.push('/home/services')">
                        <h3>⚡ 一键预约服务</h3>
                        <p>保洁、维修、搬家，随叫随到</p>
                    </el-card>
                </el-col>
                <el-col :span="12">
                    <el-card shadow="hover" class="action-card bg-green" @click="$router.push('/home/customer-orders')">
                        <h3>📋 查看我的订单</h3>
                        <p>追踪服务进度，评价师傅</p>
                    </el-card>
                </el-col>
            </el-row>

            <el-row :gutter="20" v-if="role === '3'">
                <el-col :span="12">
                    <el-card shadow="hover" class="action-card bg-orange"
                        @click="$router.push('/home/professional-orders')">
                        <h3>🔥 前往接单大厅</h3>
                        <p>海量订单，等您来抢</p>
                    </el-card>
                </el-col>
                <el-col :span="12">
                    <el-card shadow="hover" class="action-card bg-purple" @click="$router.push('/home/profile')">
                        <h3>🛡️ 更新资质档案</h3>
                        <p>完善资料，获取更多客户信任</p>
                    </el-card>
                </el-col>
            </el-row>

        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../store/user'
import { Stamp, List, Grid } from '@element-plus/icons-vue'

const router = useRouter()
const userStore = useUserStore()

const username = ref(userStore.username || '用户')
const role = ref(userStore.userRole)

// 智能时间问候语
const timeGreeting = computed(() => {
    const hour = new Date().getHours()
    if (hour < 6) return '凌晨好'
    if (hour < 9) return '早上好'
    if (hour < 12) return '上午好'
    if (hour < 14) return '中午好'
    if (hour < 18) return '下午好'
    if (hour < 22) return '晚上好'
    return '夜深了，注意休息'
})
</script>

<style scoped>
.welcome-container {
    padding: 10px;
}

.welcome-banner {
    border-radius: 12px;
    border: none;
    background: linear-gradient(120deg, #fdfbfb 0%, #ebedee 100%);
}

.greeting-box {
    display: flex;
    align-items: center;
    gap: 20px;
}

.user-avatar {
    background: #409EFF;
    font-size: 24px;
    font-weight: bold;
}

.greeting-text h2 {
    margin: 0 0 5px 0;
    color: #303133;
}

.greeting-text p {
    margin: 0;
    color: #909399;
    font-size: 14px;
}

/* 管理员数据卡片 */
.data-card {
    display: flex;
    align-items: center;
    border-radius: 10px;
    cursor: pointer;
    transition: transform 0.2s;
    border: none;
}

.data-card:hover {
    transform: translateY(-5px);
}

.card-icon {
    font-size: 40px;
    margin-right: 15px;
}

.card-info .title {
    font-size: 18px;
    font-weight: bold;
    color: #303133;
}

.card-info .desc {
    font-size: 12px;
    color: #909399;
    margin-top: 5px;
}

/* 客户/师傅快捷卡片 */
.action-card {
    border-radius: 10px;
    color: white;
    cursor: pointer;
    border: none;
    transition: transform 0.2s;
    height: 120px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding-left: 20px;
}

.action-card:hover {
    transform: scale(1.02);
}

.action-card h3 {
    margin: 0 0 10px 0;
    font-size: 20px;
}

.action-card p {
    margin: 0;
    font-size: 14px;
    opacity: 0.9;
}

/* 炫彩渐变背景 */
.bg-blue {
    background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.bg-green {
    background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.bg-orange {
    background: linear-gradient(135deg, #f6d365 0%, #fda085 100%);
}

.bg-purple {
    background: linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%);
}
</style>