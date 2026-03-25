<template>
    <div class="pro-orders-container">
        <el-card shadow="never" class="box-card">
            <el-tabs v-model="activeTab" @tab-change="handleTabChange">
                <el-tab-pane label="抢单大厅" name="hall">
                    <div v-loading="loadingHall">
                        <el-row :gutter="20">
                            <el-col :span="12" v-for="order in hallOrders" :key="order.id" style="margin-bottom: 20px;">
                                <el-card shadow="hover" class="order-card">
                                    <div class="card-header">
                                        <span class="order-no">订单号：{{ order.orderNo }}</span>
                                        <el-tag type="warning" effect="dark">待抢单</el-tag>
                                    </div>
                                    <div class="card-body">
                                        <p class="price">订单金额：<span>¥ {{ order.totalAmount }}</span></p>
                                        <p><strong>服务地址：</strong>{{ order.serviceAddress }}</p>
                                        <p><strong>联系人：</strong>{{ order.contactName }} ({{ order.contactPhone }})</p>
                                        <p><strong>发起时间：</strong>{{ formatTime(order.createTime) }}</p>
                                    </div>
                                    <div class="card-footer">
                                        <el-button type="primary" size="large" @click="handleAcceptOrder(order.id)">立即抢单</el-button>
                                    </div>
                                </el-card>
                            </el-col>
                        </el-row>
                        <el-empty v-if="hallOrders.length === 0 && !loadingHall" description="大厅暂无新订单" />
                    </div>
                </el-tab-pane>

                <el-tab-pane label="我的任务" name="my">
                    <div v-loading="loadingMy">
                        <el-row :gutter="20">
                            <el-col :span="12" v-for="order in myOrders" :key="order.id" style="margin-bottom: 20px;">
                                <el-card shadow="hover" class="order-card">
                                    <div class="card-header">
                                        <span class="order-no">订单号：{{ order.orderNo }}</span>
                                        <el-tag :type="statusType(order.orderStatus)" effect="dark">{{ statusText(order.orderStatus) }}</el-tag>
                                    </div>
                                    <div class="card-body">
                                        <p class="price">订单金额：<span>¥ {{ order.totalAmount }}</span></p>
                                        <p><strong>服务地址：</strong>{{ order.serviceAddress }}</p>
                                        <p><strong>联系人：</strong>{{ order.contactName }} ({{ order.contactPhone }})</p>
                                        <p><strong>发起时间：</strong>{{ formatTime(order.createTime) }}</p>

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
                                            <p><strong>客户评分：</strong>{{ order.ratingScore }} 分</p>
                                            <p><strong>客户留言：</strong>{{ order.customerRemarks || '无' }}</p>
                                        </div>
                                    </div>

                                    <div class="card-footer" v-if="order.orderStatus === 10">
                                        <el-button type="success" @click="handleAcceptOrder(order.id)">接受指定</el-button>
                                        <el-popconfirm title="确定拒绝该订单吗？" @confirm="handleRejectOrder(order.id)">
                                            <template #reference>
                                                <el-button type="danger" plain>拒绝</el-button>
                                            </template>
                                        </el-popconfirm>
                                    </div>
                                    <div class="card-footer" v-else-if="order.orderStatus === 20 || order.orderStatus === 25">
                                        <el-button type="primary" @click="openProgressDialog(order, 25)" v-if="order.orderStatus === 20">开始服务</el-button>
                                        <el-button type="success" @click="openProgressDialog(order, 35)" v-if="order.orderStatus === 25">提交完成</el-button>
                                    </div>
                                </el-card>
                            </el-col>
                        </el-row>
                        <el-empty v-if="myOrders.length === 0 && !loadingMy" description="当前没有任务" />
                    </div>
                </el-tab-pane>
            </el-tabs>
        </el-card>

        <el-dialog v-model="progressDialogVisible" title="更新订单进度" width="520px">
            <el-form :model="progressForm" label-width="90px">
                <el-form-item label="进度说明">
                    <el-input v-model="progressForm.progressNote" type="textarea" rows="4" placeholder="补充本次服务进度说明" />
                </el-form-item>
                <el-form-item label="过程图片">
                    <el-upload :show-file-list="false" :http-request="customUpload">
                        <el-button>上传图片</el-button>
                    </el-upload>
                    <a v-if="progressForm.progressImageUrl" :href="progressForm.progressImageUrl" target="_blank" style="margin-left: 12px;">已上传图片</a>
                </el-form-item>
            </el-form>
            <template #footer>
                <el-button @click="progressDialogVisible = false">取消</el-button>
                <el-button type="primary" @click="submitProgress">确认提交</el-button>
            </template>
        </el-dialog>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getAvailableOrdersAPI, getMyOrdersAPI, acceptOrderAPI, rejectOrderAPI, getOrderProgressAPI, updateOrderProgressAPI } from '../api/order'
import { uploadFileAPI } from '../api/profile'

const activeTab = ref('hall')
const hallOrders = ref([])
const myOrders = ref([])
const progressMap = ref({})
const loadingHall = ref(false)
const loadingMy = ref(false)
const progressDialogVisible = ref(false)
const currentOrderId = ref(null)
const progressForm = ref({ orderStatus: 25, progressNote: '', progressImageUrl: '' })

onMounted(() => {
    fetchHallOrders()
})

const handleTabChange = (tabName) => {
    if (tabName === 'hall') fetchHallOrders()
    if (tabName === 'my') fetchMyOrders()
}

const fetchHallOrders = async () => {
    loadingHall.value = true
    try {
        const res = await getAvailableOrdersAPI()
        if (res.code === 200) hallOrders.value = res.data
    } finally {
        loadingHall.value = false
    }
}

const fetchMyOrders = async () => {
    loadingMy.value = true
    try {
        const res = await getMyOrdersAPI()
        if (res.code === 200) {
            myOrders.value = res.data
            await loadProgress(res.data)
        }
    } finally {
        loadingMy.value = false
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

const handleAcceptOrder = async (orderId) => {
    const res = await acceptOrderAPI(orderId)
    if (res.code === 200) {
        ElMessage.success('接单成功')
        if (activeTab.value === 'hall') fetchHallOrders()
        fetchMyOrders()
    } else {
        ElMessage.error(res.message)
    }
}

const handleRejectOrder = async (orderId) => {
    const res = await rejectOrderAPI(orderId)
    if (res.code === 200) {
        ElMessage.success('已拒绝该订单')
        fetchMyOrders()
    } else {
        ElMessage.error(res.message)
    }
}

const openProgressDialog = (order, status) => {
    currentOrderId.value = order.id
    progressForm.value = { orderStatus: status, progressNote: '', progressImageUrl: '' }
    progressDialogVisible.value = true
}

const customUpload = async (options) => {
    const formData = new FormData()
    formData.append('file', options.file)
    const res = await uploadFileAPI(formData)
    if (res.code === 200) {
        progressForm.value.progressImageUrl = res.data
        ElMessage.success('图片上传成功')
        options.onSuccess(res, options.file)
    } else {
        options.onError(new Error(res.message))
    }
}

const submitProgress = async () => {
    const res = await updateOrderProgressAPI(currentOrderId.value, progressForm.value)
    if (res.code === 200) {
        ElMessage.success('订单进度已更新')
        progressDialogVisible.value = false
        fetchMyOrders()
    } else {
        ElMessage.error(res.message)
    }
}

const statusText = (status) => ({
    10: '待接单',
    20: '已接单',
    25: '服务中',
    30: '已拒单',
    35: '待验收',
    40: '已完成',
    50: '已取消'
}[status] || '未知状态')

const statusType = (status) => ({
    10: 'danger',
    20: 'primary',
    25: 'warning',
    30: 'info',
    35: 'success',
    40: 'success',
    50: 'info'
}[status] || 'info')

const progressStatusText = (status) => ({
    25: '开始上门服务',
    35: '服务已完成，待客户验收'
}[status] || '进度更新')

const formatTime = (timeStr) => {
    if (!timeStr) return '-'
    return timeStr.replace('T', ' ').substring(0, 16)
}
</script>

<style scoped>
.pro-orders-container { padding: 10px; }
.order-card { border-radius: 8px; position: relative; }
.card-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #ebeef5; padding-bottom: 10px; margin-bottom: 10px; }
.order-no { font-size: 14px; color: #909399; font-family: monospace; }
.card-body p { margin: 8px 0; font-size: 14px; color: #303133; }
.card-body .price { font-size: 16px; font-weight: bold; color: #606266; }
.card-body .price span { color: #F56C6C; font-size: 20px; }
.card-footer { margin-top: 15px; padding-top: 15px; border-top: 1px dashed #ebeef5; display: flex; justify-content: flex-end; gap: 10px; }
.rating-box { margin-top: 10px; padding: 10px; background-color: #f8f9fa; border-radius: 4px; border-left: 4px solid #67c23a; }
.progress-timeline { margin-top: 12px; }
.progress-note { color: #606266; margin: 4px 0; }
</style>
