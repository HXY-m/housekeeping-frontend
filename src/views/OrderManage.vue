<template>
  <section class="manage-page">
    <div class="page-header">
      <div>
        <p class="eyebrow">Admin Orders</p>
        <h2>订单管理</h2>
        <p>支持按状态查看订单全链路，并联动查看支付、进度和沟通记录。</p>
      </div>
      <div class="toolbar">
        <el-select v-model="statusFilter" placeholder="筛选状态" clearable style="width: 180px">
          <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
        <el-button type="primary" plain @click="fetchOrders">刷新</el-button>
      </div>
    </div>

    <el-card class="table-card" shadow="never">
      <el-table :data="filteredOrders" v-loading="loading" stripe>
        <el-table-column prop="orderNo" label="订单号" min-width="220" />
        <el-table-column prop="customerId" label="客户 ID" width="110" />
        <el-table-column prop="professionalId" label="服务人员 ID" width="120" />
        <el-table-column label="金额" width="120">
          <template #default="{ row }">¥ {{ row.totalAmount }}</template>
        </el-table-column>
        <el-table-column label="支付" width="120">
          <template #default="{ row }">
            <el-tag :type="row.paymentStatus === 1 ? 'success' : 'warning'">
              {{ row.paymentStatus === 1 ? '已支付' : '待支付' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="120">
          <template #default="{ row }">
            <el-tag :type="statusType(row.orderStatus)">{{ statusText(row.orderStatus) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" width="170">
          <template #default="{ row }">{{ formatTime(row.createTime) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button text type="primary" @click="openDetail(row)">查看链路</el-button>
            <el-button text type="danger" @click="handleDelete(row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-drawer v-model="drawerVisible" title="订单链路详情" size="46%">
      <div v-if="currentOrder" class="drawer-body">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="订单号">{{ currentOrder.orderNo }}</el-descriptions-item>
          <el-descriptions-item label="地址">{{ currentOrder.serviceAddress }}</el-descriptions-item>
          <el-descriptions-item label="支付方式">{{ currentOrder.paymentMethod || '未支付' }}</el-descriptions-item>
          <el-descriptions-item label="状态">{{ statusText(currentOrder.orderStatus) }}</el-descriptions-item>
        </el-descriptions>

        <div class="drawer-section">
          <h4>进度轨迹</h4>
          <el-timeline>
            <el-timeline-item v-for="item in currentProgress" :key="item.id" :timestamp="formatTime(item.createTime)">
              <strong>{{ progressText(item.orderStatus) }}</strong>
              <p>{{ item.progressNote || '暂无补充说明' }}</p>
            </el-timeline-item>
          </el-timeline>
        </div>

        <div class="drawer-section">
          <h4>沟通记录</h4>
          <div v-if="currentMessages.length === 0" class="empty-text">暂无沟通记录</div>
          <div v-for="message in currentMessages" :key="message.id" class="message-item">
            <strong>{{ roleText(message.senderRole) }}</strong>
            <span>{{ formatTime(message.createTime) }}</span>
            <p>{{ message.messageContent }}</p>
          </div>
        </div>
      </div>
    </el-drawer>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue'
import { ElMessage } from 'element-plus'
import {
  deleteOrderAdminAPI,
  getAllOrdersAdminAPI,
  getOrderMessagesAPI,
  getOrderProgressAPI
} from '@/api/order'

const orderList = ref([])
const loading = ref(false)
const statusFilter = ref('')
const drawerVisible = ref(false)
const currentOrder = ref(null)
const currentProgress = ref([])
const currentMessages = ref([])

const statusOptions = [
  { label: '待支付/待接单', value: 10 },
  { label: '已接单', value: 20 },
  { label: '服务中', value: 25 },
  { label: '待验收', value: 35 },
  { label: '已完成', value: 40 },
  { label: '已取消', value: 50 }
]

const filteredOrders = computed(() => {
  if (!statusFilter.value) return orderList.value
  return orderList.value.filter((item) => item.orderStatus === statusFilter.value)
})

const fetchOrders = async () => {
  loading.value = true
  try {
    const res = await getAllOrdersAdminAPI()
    if (res.code === 200) {
      orderList.value = res.data
    }
  } finally {
    loading.value = false
  }
}

const openDetail = async (order) => {
  currentOrder.value = order
  drawerVisible.value = true
  const [progressRes, messageRes] = await Promise.all([
    getOrderProgressAPI(order.id),
    getOrderMessagesAPI(order.id)
  ])
  currentProgress.value = progressRes.code === 200 ? progressRes.data : []
  currentMessages.value = messageRes.code === 200 ? messageRes.data : []
}

const handleDelete = async (id) => {
  const res = await deleteOrderAdminAPI(id)
  if (res.code === 200) {
    ElMessage.success('订单已删除')
    fetchOrders()
  } else {
    ElMessage.error(res.message)
  }
}

const formatTime = (value) => (value ? value.replace('T', ' ').slice(0, 16) : '-')
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
  25: '开始服务',
  35: '服务完成，等待客户验收'
}[status] || '进度更新')
const roleText = (role) => ({
  1: '管理员',
  2: '客户',
  3: '服务人员'
}[role] || '成员')

fetchOrders()
</script>

<style scoped>
.manage-page {
  display: grid;
  gap: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 16px;
  flex-wrap: wrap;
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

.toolbar {
  display: flex;
  gap: 12px;
}

.table-card {
  border-radius: 24px;
}

.drawer-body {
  display: grid;
  gap: 22px;
}

.drawer-section h4 {
  margin: 0 0 12px;
}

.message-item {
  padding: 12px 14px;
  border-radius: 16px;
  background: #f8fafc;
  margin-bottom: 10px;
}

.message-item span {
  margin-left: 10px;
  color: #64748b;
  font-size: 12px;
}

.message-item p,
.empty-text {
  margin: 8px 0 0;
  color: #475569;
}
</style>
