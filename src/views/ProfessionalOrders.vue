<template>
    <div class="pro-orders-container">
        <el-card shadow="never" class="box-card">
            <el-tabs v-model="activeTab" @tab-change="handleTabChange">

                <el-tab-pane label="🔥 抢单大厅" name="hall">
                    <div v-loading="loadingHall">
                        <el-row :gutter="20">
                            <el-col :span="12" v-for="order in hallOrders" :key="order.id" style="margin-bottom: 20px;">
                                <el-card shadow="hover" class="order-card">
                                    <div class="card-header">
                                        <span class="order-no">订单号：{{ order.orderNo }}</span>
                                        <el-tag type="warning" effect="dark">待抢单</el-tag>
                                    </div>
                                    <div class="card-body">
                                        <p class="price">💰 订单金额：<span>¥ {{ order.totalAmount }}</span></p>
                                        <p><strong>📍 服务地址：</strong>{{ order.serviceAddress }}</p>
                                        <p><strong>👤 联系人：</strong>{{ order.contactName }} ({{ order.contactPhone }})
                                        </p>
                                        <p><strong>🕒 发起时间：</strong>{{ formatTime(order.createTime) }}</p>
                                    </div>
                                    <div class="card-footer">
                                        <el-button type="primary" size="large" @click="handleAcceptOrder(order.id)">
                                            ⚡ 立即抢单
                                        </el-button>
                                    </div>
                                </el-card>
                            </el-col>
                        </el-row>
                        <el-empty v-if="hallOrders.length === 0 && !loadingHall" description="大厅暂无新订单，稍后再来看看吧~" />
                    </div>
                </el-tab-pane>

                <el-tab-pane label="📋 我的任务" name="my">
                    <div v-loading="loadingMy">
                        <el-row :gutter="20">
                            <el-col :span="12" v-for="order in myOrders" :key="order.id" style="margin-bottom: 20px;">
                                <el-card shadow="hover" class="order-card">
                                    <div class="card-header">
                                        <span class="order-no">订单号：{{ order.orderNo }}</span>
                                        <el-tag v-if="order.orderStatus === 10" type="danger"
                                            effect="dark">客户指定待接</el-tag>
                                        <el-tag v-else-if="order.orderStatus === 20" type="primary"
                                            effect="dark">服务中</el-tag>
                                        <el-tag v-else-if="order.orderStatus === 40" type="success"
                                            effect="dark">已完成</el-tag>
                                        <el-tag v-else-if="order.orderStatus === 30" type="info"
                                            effect="dark">已拒单</el-tag>
                                        <el-tag v-else type="info">已取消</el-tag>
                                    </div>
                                    <div class="card-body">
                                        <p class="price">💰 订单金额：<span>¥ {{ order.totalAmount }}</span></p>
                                        <p><strong>📍 服务地址：</strong>{{ order.serviceAddress }}</p>
                                        <p><strong>👤 联系人：</strong>{{ order.contactName }} ({{ order.contactPhone }})
                                        </p>
                                        <p><strong>🕒 发起时间：</strong>{{ formatTime(order.createTime) }}</p>

                                        <div v-if="order.orderStatus === 40 && order.ratingScore" class="rating-box">
                                            <p><strong>⭐ 客户打分：</strong>{{ order.ratingScore }} 分</p>
                                            <p><strong>📝 客户留言：</strong>{{ order.customerRemarks || '无' }}</p>
                                        </div>
                                    </div>

                                    <div class="card-footer" v-if="order.orderStatus === 10">
                                        <el-button type="success" @click="handleAcceptOrder(order.id)">✅
                                            接受指定</el-button>
                                        <el-popconfirm title="确定要拒绝这位客户的指定吗？" @confirm="handleRejectOrder(order.id)">
                                            <template #reference>
                                                <el-button type="danger" plain>❌ 残忍拒绝</el-button>
                                            </template>
                                        </el-popconfirm>
                                    </div>
                                    <div class="card-footer" v-else-if="order.orderStatus === 20">
                                        <span style="color: #909399; font-size: 14px;">请上门完成服务，等待客户验收完毕</span>
                                    </div>
                                </el-card>
                            </el-col>
                        </el-row>
                        <el-empty v-if="myOrders.length === 0 && !loadingMy" description="您目前没有任务，快去大厅抢一单吧！" />
                    </div>
                </el-tab-pane>

            </el-tabs>
        </el-card>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getAvailableOrdersAPI, getMyOrdersAPI, acceptOrderAPI, rejectOrderAPI } from '../api/order'

const activeTab = ref('hall')
const hallOrders = ref([])
const myOrders = ref([])
const loadingHall = ref(false)
const loadingMy = ref(false)

// 页面加载默认获取大厅数据
onMounted(() => {
    fetchHallOrders()
})

// 切换 Tab 时加载对应数据
const handleTabChange = (tabName) => {
    if (tabName === 'hall') fetchHallOrders()
    if (tabName === 'my') fetchMyOrders()
}

// 获取抢单大厅订单 (无主单)
const fetchHallOrders = async () => {
    loadingHall.value = true
    try {
        const res = await getAvailableOrdersAPI()
        if (res.code === 200) hallOrders.value = res.data
    } finally {
        loadingHall.value = false
    }
}

// 获取我的任务 (包含客户指定给我的、我已接的、已完成的)
const fetchMyOrders = async () => {
    loadingMy.value = true
    try {
        const res = await getMyOrdersAPI()
        if (res.code === 200) myOrders.value = res.data
    } finally {
        loadingMy.value = false
    }
}

// 抢单 / 接单
const handleAcceptOrder = async (orderId) => {
    try {
        const res = await acceptOrderAPI(orderId)
        if (res.code === 200) {
            ElMessage.success('🎉 接单成功！请尽快联系客户。')
            if (activeTab.value === 'hall') fetchHallOrders()
            if (activeTab.value === 'my') fetchMyOrders()
        } else {
            ElMessage.error(res.message)
        }
    } catch (error) {
        console.error('接单异常', error)
    }
}

// 拒单 (针对客户指定的订单)
const handleRejectOrder = async (orderId) => {
    try {
        const res = await rejectOrderAPI(orderId)
        if (res.code === 200) {
            ElMessage.success('已拒绝该订单')
            fetchMyOrders()
        }
    } catch (error) {
        console.error('拒单异常', error)
    }
}

// 时间格式化工具
const formatTime = (timeStr) => {
    if (!timeStr) return '-'
    return timeStr.replace('T', ' ').substring(0, 16)
}
</script>

<style scoped>
.pro-orders-container {
    padding: 10px;
}

.order-card {
    border-radius: 8px;
    position: relative;
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #ebeef5;
    padding-bottom: 10px;
    margin-bottom: 10px;
}

.order-no {
    font-size: 14px;
    color: #909399;
    font-family: monospace;
}

.card-body p {
    margin: 8px 0;
    font-size: 14px;
    color: #303133;
}

.card-body .price {
    font-size: 16px;
    font-weight: bold;
    color: #606266;
}

.card-body .price span {
    color: #F56C6C;
    font-size: 20px;
}

.card-footer {
    margin-top: 15px;
    padding-top: 15px;
    border-top: 1px dashed #ebeef5;
    display: flex;
    justify-content: flex-end;
    gap: 10px;
}

.rating-box {
    margin-top: 10px;
    padding: 10px;
    background-color: #f8f9fa;
    border-radius: 4px;
    border-left: 4px solid #67c23a;
}
</style>