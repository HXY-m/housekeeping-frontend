<template>
    <div class="customer-orders-container">
        <el-card shadow="never" class="box-card">
            <template #header>
                <div class="card-header">
                    <span class="title">我的订单历史</span>
                    <el-button type="primary" plain @click="fetchOrders" icon="Refresh">刷新</el-button>
                </div>
            </template>

            <div v-loading="loading">
                <el-row :gutter="20">
                    <el-col :span="12" v-for="order in orderList" :key="order.id" style="margin-bottom: 20px;">
                        <el-card shadow="hover" class="order-card">
                            <div class="card-header-inner">
                                <span class="order-no">订单号：{{ order.orderNo }}</span>
                                <el-tag :type="statusType(order.orderStatus)" effect="dark">{{ statusText(order.orderStatus) }}</el-tag>
                            </div>

                            <div class="card-body">
                                <p class="price">总金额：<span>¥ {{ order.totalAmount }}</span></p>
                                <p><strong>服务地址：</strong>{{ order.serviceAddress }}</p>
                                <p><strong>联系人：</strong>{{ order.contactName }} ({{ order.contactPhone }})</p>
                                <p><strong>预约时间：</strong>{{ formatTime(order.createTime) }}</p>
                                <p v-if="order.professionalId"><strong>接单师傅：</strong>{{ order.professionalId }}</p>

                                <el-timeline v-if="progressMap[order.id]?.length" class="progress-timeline">
                                    <el-timeline-item
                                        v-for="item in progressMap[order.id]"
                                        :key="item.id"
                                        :timestamp="formatTime(item.createTime)"
                                        placement="top">
                                        <div>{{ progressStatusText(item.orderStatus) }}</div>
                                        <div v-if="item.progressNote" class="progress-note">{{ item.progressNote }}</div>
                                        <a v-if="item.progressImageUrl" :href="item.progressImageUrl" target="_blank">查看进度图片</a>
                                    </el-timeline-item>
                                </el-timeline>

                                <div v-if="order.orderStatus === 40 && order.ratingScore" class="rating-box">
                                    <p>我的评分：<el-rate v-model="order.ratingScore" disabled text-color="#ff9900" /></p>
                                    <p>我的评价：{{ order.customerRemarks || '默认好评' }}</p>
                                </div>
                            </div>

                            <div class="card-footer" v-if="order.orderStatus === 10">
                                <el-popconfirm title="确定要取消这个预约吗？" @confirm="handleCancelOrder(order.id)">
                                    <template #reference>
                                        <el-button type="danger" plain size="small">取消订单</el-button>
                                    </template>
                                </el-popconfirm>
                            </div>

                            <div class="card-footer" v-else-if="order.orderStatus === 35">
                                <el-button type="success" @click="openCompleteDialog(order)">验收并评价</el-button>
                            </div>
                        </el-card>
                    </el-col>
                </el-row>

                <el-empty v-if="orderList.length === 0 && !loading" description="您还没有预约过服务">
                    <el-button type="primary" @click="$router.push('/home/services')">去预约</el-button>
                </el-empty>
            </div>
        </el-card>

        <el-dialog title="服务验收与评价" v-model="completeDialogVisible" width="500px">
            <div v-if="currentOrder" style="margin-bottom: 20px;">
                <p>订单号：{{ currentOrder.orderNo }}</p>
                <p>金额：<span style="color: #F56C6C; font-weight: bold;">¥ {{ currentOrder.totalAmount }}</span></p>
            </div>
            <el-form :model="completeForm" label-width="80px">
                <el-form-item label="综合评分">
                    <el-rate v-model="completeForm.ratingScore" show-score text-color="#ff9900" score-template="{value} 分" />
                </el-form-item>
                <el-form-item label="服务评语">
                    <el-input v-model="completeForm.customerRemarks" type="textarea" rows="3" placeholder="写点服务反馈..." />
                </el-form-item>
            </el-form>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="completeDialogVisible = false">取消</el-button>
                    <el-button type="primary" @click="submitCompleteOrder">确认验收</el-button>
                </span>
            </template>
        </el-dialog>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getMyOrdersAPI, cancelOrderAPI, completeOrderAPI, getOrderProgressAPI } from '../api/order'

const orderList = ref([])
const progressMap = ref({})
const loading = ref(false)
const completeDialogVisible = ref(false)
const currentOrder = ref(null)
const completeForm = ref({ ratingScore: 5, customerRemarks: '' })

onMounted(() => {
    fetchOrders()
})

const fetchOrders = async () => {
    loading.value = true
    try {
        const res = await getMyOrdersAPI()
        if (res.code === 200) {
            orderList.value = res.data
            await loadProgress(res.data)
        }
    } finally {
        loading.value = false
    }
}

const loadProgress = async (orders) => {
    const entries = await Promise.all(
        orders.map(async (order) => {
            const res = await getOrderProgressAPI(order.id)
            return [order.id, res.code === 200 ? res.data : []]
        })
    )
    progressMap.value = Object.fromEntries(entries)
}

const handleCancelOrder = async (orderId) => {
    const res = await cancelOrderAPI(orderId)
    if (res.code === 200) {
        ElMessage.success('订单已取消')
        fetchOrders()
    } else {
        ElMessage.error(res.message)
    }
}

const openCompleteDialog = (order) => {
    currentOrder.value = order
    completeForm.value = { ratingScore: 5, customerRemarks: '' }
    completeDialogVisible.value = true
}

const submitCompleteOrder = async () => {
    const res = await completeOrderAPI(currentOrder.value.id, completeForm.value)
    if (res.code === 200) {
        ElMessage.success('验收成功，感谢您的评价')
        completeDialogVisible.value = false
        fetchOrders()
    } else {
        ElMessage.error(res.message)
    }
}

const statusText = (status) => ({
    10: '等待接单',
    20: '已接单',
    25: '服务中',
    30: '已拒单',
    35: '待验收',
    40: '已完成',
    50: '已取消'
}[status] || '未知状态')

const statusType = (status) => ({
    10: 'warning',
    20: 'primary',
    25: 'primary',
    30: 'danger',
    35: 'success',
    40: 'success',
    50: 'info'
}[status] || 'info')

const progressStatusText = (status) => ({
    25: '师傅已开始服务',
    35: '师傅已提交完成，待客户验收'
}[status] || '进度更新')

const formatTime = (timeStr) => {
    if (!timeStr) return '-'
    return timeStr.replace('T', ' ').substring(0, 16)
}
</script>

<style scoped>
.customer-orders-container { padding: 10px; }
.card-header { display: flex; justify-content: space-between; align-items: center; }
.title { font-weight: bold; font-size: 18px; }
.order-card { border-radius: 8px; position: relative; }
.card-header-inner { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #ebeef5; padding-bottom: 10px; margin-bottom: 10px; }
.order-no { font-size: 14px; color: #909399; font-family: monospace; }
.card-body p { margin: 8px 0; font-size: 14px; color: #303133; }
.card-body .price { font-size: 16px; font-weight: bold; color: #606266; }
.card-body .price span { color: #F56C6C; font-size: 20px; }
.card-footer { margin-top: 15px; padding-top: 15px; border-top: 1px dashed #ebeef5; display: flex; justify-content: flex-end; }
.rating-box { margin-top: 10px; padding: 10px; background-color: #fafafa; border-radius: 4px; border-left: 4px solid #409eff; }
.progress-timeline { margin-top: 12px; }
.progress-note { color: #606266; margin: 4px 0; }
</style>
