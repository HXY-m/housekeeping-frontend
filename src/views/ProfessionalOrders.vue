<template>
    <div class="pro-workspace">
        <h2 style="color: #303133; margin-bottom: 20px;">师傅工作台</h2>

        <el-tabs v-model="activeTab" class="custom-tabs" @tab-click="handleTabChange">
            <el-tab-pane label="🚀 抢单大厅" name="hall">
                <div v-if="availableOrders.length === 0" class="empty-tips">
                    当前大厅没有新的派单，去喝杯茶休息一下吧~
                </div>

                <el-table v-else :data="availableOrders" border stripe style="width: 100%">
                    <el-table-column prop="orderNo" label="订单流水号" width="220" />
                    <el-table-column label="服务项目" width="200">
                        <template #default="scope">普通家政 (ID: {{ scope.row.serviceId }})</template>
                    </el-table-column>
                    <el-table-column label="下单时间" width="180">
                        <template #default="scope">{{ formatTime(scope.row.createTime) }}</template>
                    </el-table-column>
                    <el-table-column label="操作" align="center">
                        <template #default="scope">
                            <el-button type="success" size="large" @click="handleTakeOrder(scope.row.id)">
                                ⚡ 立即抢单
                            </el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </el-tab-pane>

            <el-tab-pane label="📋 我的任务" name="my">
                <div v-if="myOrders.length === 0" class="empty-tips">
                    您还没有接单，快去大厅看看吧！
                </div>

                <el-table v-else :data="myOrders" border style="width: 100%">
                    <el-table-column prop="orderNo" label="订单流水号" width="220" />
                    <el-table-column label="状态" width="120" align="center">
                        <template #default="scope">
                            <el-tag v-if="scope.row.orderStatus === 20" type="primary">服务中</el-tag>
                            <el-tag v-else-if="scope.row.orderStatus === 40" type="success">已完成</el-tag>
                            <el-tag v-else type="info">未知状态</el-tag>
                        </template>
                    </el-table-column>
                    <el-table-column label="接单时间" width="180">
                        <template #default="scope">{{ formatTime(scope.row.updateTime) }}</template>
                    </el-table-column>
                    <el-table-column label="客户评价" show-overflow-tooltip>
                        <template #default="scope">
                            <span v-if="scope.row.orderStatus === 40 && scope.row.ratingScore" style="color: #e6a23c;">
                                ★ {{ scope.row.ratingScore }} 星好评
                            </span>
                            <span v-else-if="scope.row.orderStatus === 40">客户未评价</span>
                            <span v-else style="color: #909399;">等待客户验收...</span>
                        </template>
                    </el-table-column>
                </el-table>
            </el-tab-pane>
        </el-tabs>

    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '../utils/request'
import { getAvailableOrdersAPI, getProOrdersAPI, takeOrderAPI } from '../api/order'

const activeTab = ref('hall') // 默认停留在抢单大厅
const availableOrders = ref([])
const myOrders = ref([])
const proId = localStorage.getItem('userId') // 获取当前师傅的 ID

onMounted(() => {
    fetchAvailableOrders()
})

// Tab 切换时触发不同接口
const handleTabChange = (tab) => {
    if (tab.paneName === 'hall') fetchAvailableOrders()
    if (tab.paneName === 'my') fetchMyOrders()
}

// 1. 获取大厅订单
const fetchAvailableOrders = async () => {
    try {
        const res = await getAvailableOrdersAPI()
        if (res.code === 200) availableOrders.value = res.data
    } catch (error) {
        ElMessage.error('刷新大厅失败')
    }
}

// 2. 获取我的接单
const fetchMyOrders = async () => {
    try {
        const res = await request.get(`/orders/pro/${proId}`)
        if (res.code === 200) myOrders.value = res.data
    } catch (error) {
        ElMessage.error('获取我的任务失败')
    }
}

// 3. 核心功能：抢单
const handleTakeOrder = (orderId) => {
    ElMessageBox.confirm('抢单后请务必准时为客户提供服务，确定接单吗？', '抢单确认', {
        confirmButtonText: '确定接下',
        cancelButtonText: '再想想',
        type: 'warning'
    }).then(async () => {
        try {
            // 传递 proId 给后端绑定
            const res = await takeOrderAPI(orderId, proId)
            if (res.code === 200) {
                ElMessage.success('抢单成功！')
                // 抢单成功后，自动切换到“我的任务”标签页
                activeTab.value = 'my'
                fetchMyOrders()
            } else {
                ElMessage.error(res.message)
                fetchAvailableOrders() // 如果被抢了，刷新列表
            }
        } catch (error) {
            console.error(error)
        }
    }).catch(() => { })
}

// 工具函数：格式化时间
const formatTime = (timeStr) => {
    if (!timeStr) return '-'
    return timeStr.replace('T', ' ').substring(0, 19)
}
</script>

<style scoped>
.pro-workspace {
    background: #fff;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
    min-height: 500px;
}

.empty-tips {
    text-align: center;
    padding: 60px 0;
    color: #909399;
    font-size: 16px;
    background-color: #f8f9fa;
    border-radius: 8px;
    margin-top: 10px;
}
</style>