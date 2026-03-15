<template>
    <div class="orders-view">
        <h2 style="color: #303133; margin-bottom: 20px;">我的订单</h2>

        <div v-if="orderList.length === 0" class="empty-tips">
            暂无订单数据，快去预约服务吧！
        </div>

        <table v-else class="order-table">
            <thead>
                <tr>
                    <th>订单流水号</th>
                    <th>服务项目</th>
                    <th>当前状态</th>
                    <th>下单时间</th>
                    <th>操作区</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="order in orderList" :key="order.id">
                    <td class="font-mono">{{ order.orderNo }}</td>
                    <td>普通家政 (ID: {{ order.serviceId }})</td>
                    <td>
                        <span :class="'status-' + order.orderStatus">
                            {{ getStatusText(order.orderStatus) }}
                        </span>
                    </td>
                    <td>{{ formatTime(order.createTime) }}</td>
                    <td>
                        <el-button v-if="order.orderStatus === 10" type="danger" size="small" plain
                            @click="handleCancel(order.id)">
                            取消订单
                        </el-button>

                        <el-button v-else-if="order.orderStatus === 20" type="primary" size="small"
                            @click="openReviewDialog(order.id)">
                            验收并评价
                        </el-button>

                        <span v-else class="no-action">-</span>
                    </td>
                </tr>
            </tbody>
        </table>

        <el-dialog title="服务验收与评价" v-model="reviewDialogVisible" width="400px">
            <div style="text-align: center; margin-bottom: 20px;">
                <span style="display: block; margin-bottom: 10px; color: #606266; font-weight: bold;">请为本次服务师傅打分</span>
                <el-rate v-model="reviewForm.score" size="large" show-score text-color="#ff9900" />
            </div>

            <el-input v-model="reviewForm.remarks" type="textarea" :rows="3" placeholder="师傅服务态度好吗？打扫得干净吗？说点什么吧..." />

            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="reviewDialogVisible = false">稍后评价</el-button>
                    <el-button type="primary" @click="submitReview">提交评价并结单</el-button>
                </span>
            </template>
        </el-dialog>

    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '../utils/request'

// --- 响应式数据 ---
const orderList = ref([])

// 评价弹窗相关状态
const reviewDialogVisible = ref(false)
const currentOrderId = ref(null)
const reviewForm = ref({
    score: 5, // 默认5星好评
    remarks: ''
})

// --- 生命周期与初始化 ---
onMounted(() => {
    fetchMyOrders()
})

const fetchMyOrders = async () => {
    try {
        const res = await request.get('/orders')
        if (res.code === 200) {
            orderList.value = res.data
        }
    } catch (error) {
        ElMessage.error('获取订单列表失败')
    }
}

// --- 工具函数 ---
const getStatusText = (status) => {
    const map = {
        10: '待接单',
        20: '服务中(已接单)',
        30: '已拒单',
        40: '已完成',
        50: '已取消'
    }
    return map[status] || '未知状态'
}

const formatTime = (timeStr) => {
    if (!timeStr) return '-'
    return timeStr.replace('T', ' ').substring(0, 19)
}

// --- 核心业务逻辑 ---

// 1. 客户取消订单
const handleCancel = (orderId) => {
    ElMessageBox.confirm(
        '确定要取消这个订单吗？取消后师傅将无法接单。',
        '取消确认',
        {
            confirmButtonText: '确定取消',
            cancelButtonText: '暂不取消',
            type: 'warning'
        }
    ).then(async () => {
        try {
            const res = await request.patch(`/orders/${orderId}/cancel`)
            if (res.code === 200) {
                ElMessage.success('订单已成功取消！')
                fetchMyOrders() // 刷新列表
            } else {
                ElMessage.error(res.message)
            }
        } catch (error) {
            console.error('取消异常', error)
        }
    }).catch(() => {
        // 点击取消不做处理
    })
}

// 2. 打开评价弹窗
const openReviewDialog = (orderId) => {
    currentOrderId.value = orderId
    // 每次打开清空上次的评价内容
    reviewForm.value = { score: 5, remarks: '' }
    reviewDialogVisible.value = true
}

// 3. 提交评价并结单
const submitReview = async () => {
    if (reviewForm.value.score === 0) {
        ElMessage.warning('请至少给师傅打1颗星哦！')
        return
    }

    try {
        // 假设后端验收接口支持接收评分和评语
        const res = await request.patch(`/orders/${currentOrderId.value}/completion`, {
            ratingScore: reviewForm.value.score,
            customerRemarks: reviewForm.value.remarks
        })

        if (res.code === 200) {
            ElMessage.success('验收成功！感谢您的评价。')
            reviewDialogVisible.value = false // 关闭弹窗
            fetchMyOrders() // 刷新列表，此时状态应变为已完成(40)
        } else {
            ElMessage.error(res.message)
        }
    } catch (error) {
        console.error('验收异常', error)
    }
}
</script>

<style scoped>
.orders-view {
    background-color: #fff;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

/* 空状态提示 */
.empty-tips {
    text-align: center;
    padding: 50px 0;
    color: #909399;
    font-size: 16px;
    background-color: #f8f9fa;
    border-radius: 4px;
}

/* 表格基础样式 */
.order-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 10px;
}

.order-table th,
.order-table td {
    border: 1px solid #ebeef5;
    padding: 12px 15px;
    text-align: left;
    font-size: 14px;
    color: #606266;
}

.order-table th {
    background-color: #f5f7fa;
    color: #303133;
    font-weight: bold;
}

.order-table tr:hover {
    background-color: #f5f7fa;
}

/* 订单号等宽字体，更显专业 */
.font-mono {
    font-family: Consolas, Monaco, monospace;
    color: #909399;
}

/* 状态颜色标签 */
.status-10 {
    color: #e6a23c;
    font-weight: bold;
}

/* 待接单：橙色 */
.status-20 {
    color: #409eff;
    font-weight: bold;
}

/* 服务中：蓝色 */
.status-30 {
    color: #f56c6c;
    font-weight: bold;
    text-decoration: line-through;
}

/* 已拒单：红色 */
.status-40 {
    color: #67c23a;
    font-weight: bold;
}

/* 已完成：绿色 */
.status-50 {
    color: #909399;
    font-weight: bold;
}

/* 已取消：灰色 */

/* 占位符操作区 */
.no-action {
    color: #c0c4cc;
    font-size: 14px;
}
</style>