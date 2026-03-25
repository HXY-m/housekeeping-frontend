<template>
  <section class="orders-page">
    <div class="page-header">
      <div>
        <p class="eyebrow">Orders</p>
        <h2>我的订单</h2>
        <p>在这里继续支付、查看进度、和服务人员沟通，并在完成后发起验收。</p>
      </div>
      <el-button type="primary" plain @click="fetchOrders">刷新订单</el-button>
    </div>

    <div class="order-grid" v-loading="loading">
      <el-card v-for="order in orderList" :key="order.id" class="order-card" shadow="hover">
        <div class="order-top">
          <div>
            <strong>{{ order.orderNo }}</strong>
            <p>{{ order.serviceAddress }}</p>
          </div>
          <div class="order-tags">
            <el-tag :type="paymentTagType(order.paymentStatus)">{{ paymentText(order.paymentStatus) }}</el-tag>
            <el-tag :type="statusType(order.orderStatus)">{{ statusText(order.orderStatus) }}</el-tag>
          </div>
        </div>

        <div class="order-meta">
          <span>联系人：{{ order.contactName }} / {{ order.contactPhone }}</span>
          <span>金额：¥ {{ order.totalAmount }}</span>
          <span>支付方式：{{ order.paymentMethod || '未支付' }}</span>
          <span>下单时间：{{ formatTime(order.createTime) }}</span>
        </div>

        <el-timeline v-if="progressMap[order.id]?.length" class="timeline">
          <el-timeline-item v-for="item in progressMap[order.id]" :key="item.id" :timestamp="formatTime(item.createTime)">
            <strong>{{ progressText(item.orderStatus) }}</strong>
            <p>{{ item.progressNote || '暂无补充说明' }}</p>
            <a v-if="item.progressImageUrl" :href="item.progressImageUrl" target="_blank" rel="noreferrer">查看现场图片</a>
          </el-timeline-item>
        </el-timeline>

        <OrderChatPanel :order-id="order.id" />

        <div class="actions">
          <el-button v-if="order.paymentStatus !== 1 && order.orderStatus === 10" type="primary" @click="payOrder(order.id)">
            继续支付
          </el-button>
          <el-button v-if="order.orderStatus === 10" type="danger" plain @click="handleCancelOrder(order.id)">
            取消订单
          </el-button>
          <el-button v-if="order.orderStatus === 35" type="success" @click="openCompleteDialog(order)">
            验收并评价
          </el-button>
        </div>
      </el-card>
      <el-empty v-if="orderList.length === 0 && !loading" description="暂无订单数据" />
    </div>

    <el-dialog v-model="completeDialogVisible" title="完成验收" width="520px">
      <el-form :model="completeForm" label-width="92px">
        <el-form-item label="满意度评分">
          <el-rate v-model="completeForm.ratingScore" show-score />
        </el-form-item>
        <el-form-item label="评价说明">
          <el-input v-model="completeForm.customerRemarks" type="textarea" rows="4" placeholder="填写本次服务体验和改进意见" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="completeDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitCompleteOrder">提交验收</el-button>
      </template>
    </el-dialog>
  </section>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import OrderChatPanel from '@/components/order/OrderChatPanel.vue'
import { cancelOrderAPI, completeOrderAPI, getMyOrdersAPI, getOrderProgressAPI, payOrderAPI } from '@/api/order'

const orderList = ref([])
const progressMap = ref({})
const loading = ref(false)
const completeDialogVisible = ref(false)
const currentOrder = ref(null)
const completeForm = ref({
  ratingScore: 5,
  customerRemarks: ''
})

const fetchOrders = async () => {
  loading.value = true
  try {
    const res = await getMyOrdersAPI()
    if (res.code === 200) {
      orderList.value = res.data
      const entries = await Promise.all(
        res.data.map(async (order) => {
          const progressRes = await getOrderProgressAPI(order.id)
          return [order.id, progressRes.code === 200 ? progressRes.data : []]
        })
      )
      progressMap.value = Object.fromEntries(entries)
    }
  } finally {
    loading.value = false
  }
}

const payOrder = async (orderId) => {
  const paymentMethod = await ElMessageBox.prompt('输入支付方式代码：WECHAT / ALIPAY / BALANCE', '继续支付', {
    inputValue: 'WECHAT'
  }).catch(() => null)
  if (!paymentMethod?.value) {
    return
  }
  const res = await payOrderAPI(orderId, { paymentMethod: paymentMethod.value })
  if (res.code === 200) {
    ElMessage.success('支付成功')
    fetchOrders()
  } else {
    ElMessage.error(res.message)
  }
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
    ElMessage.success('验收完成')
    completeDialogVisible.value = false
    fetchOrders()
  } else {
    ElMessage.error(res.message)
  }
}

const formatTime = (value) => (value ? value.replace('T', ' ').slice(0, 16) : '-')
const paymentText = (status) => (status === 1 ? '已支付' : '待支付')
const paymentTagType = (status) => (status === 1 ? 'success' : 'warning')
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
  10: 'warning',
  20: 'primary',
  25: 'primary',
  30: 'danger',
  35: 'success',
  40: 'success',
  50: 'info'
}[status] || 'info')
const progressText = (status) => ({
  25: '服务开始',
  35: '服务完成，等待验收'
}[status] || '进度更新')

onMounted(fetchOrders)
</script>

<style scoped>
.orders-page {
  display: grid;
  gap: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 18px;
}

.eyebrow {
  margin: 0;
  color: #0f766e;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  font-size: 12px;
}

h2 {
  margin: 8px 0;
  font-size: 32px;
}

.page-header p:last-child {
  margin: 0;
  color: #64748b;
}

.order-grid {
  display: grid;
  gap: 18px;
}

.order-card {
  border-radius: 28px;
}

.order-top {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-start;
}

.order-top p {
  margin: 8px 0 0;
  color: #64748b;
}

.order-meta {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 12px;
  margin: 18px 0;
  color: #475569;
}

.timeline {
  margin-bottom: 20px;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 16px;
}

.order-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
</style>
