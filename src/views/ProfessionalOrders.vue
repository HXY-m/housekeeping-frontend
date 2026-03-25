<template>
  <section class="pro-page">
    <div class="page-header">
      <div>
        <p class="eyebrow">Fulfillment</p>
        <h2>订单工作台</h2>
        <p>抢单、更新进度并与客户沟通，形成完整的履约轨迹。</p>
      </div>
    </div>

    <el-tabs v-model="activeTab" @tab-change="handleTabChange">
      <el-tab-pane label="待接订单" name="hall">
        <div class="card-grid" v-loading="loadingHall">
          <el-card v-for="order in hallOrders" :key="order.id" class="order-card" shadow="hover">
            <strong>{{ order.orderNo }}</strong>
            <p>{{ order.serviceAddress }}</p>
            <div class="meta">
              <span>金额：¥ {{ order.totalAmount }}</span>
              <span>联系人：{{ order.contactName }}</span>
              <span>创建时间：{{ formatTime(order.createTime) }}</span>
            </div>
            <div class="actions">
              <el-button type="primary" @click="handleAcceptOrder(order.id)">立即接单</el-button>
            </div>
          </el-card>
          <el-empty v-if="hallOrders.length === 0 && !loadingHall" description="暂无待接订单" />
        </div>
      </el-tab-pane>

      <el-tab-pane label="我的任务" name="my">
        <div class="card-grid" v-loading="loadingMy">
          <el-card v-for="order in myOrders" :key="order.id" class="order-card" shadow="hover">
            <div class="top-row">
              <div>
                <strong>{{ order.orderNo }}</strong>
                <p>{{ order.serviceAddress }}</p>
              </div>
              <el-tag :type="statusType(order.orderStatus)">{{ statusText(order.orderStatus) }}</el-tag>
            </div>

            <div class="meta">
              <span>金额：¥ {{ order.totalAmount }}</span>
              <span>联系人：{{ order.contactName }} / {{ order.contactPhone }}</span>
              <span>支付状态：{{ order.paymentStatus === 1 ? '已支付' : '待支付' }}</span>
            </div>

            <el-timeline v-if="progressMap[order.id]?.length" class="timeline">
              <el-timeline-item v-for="item in progressMap[order.id]" :key="item.id" :timestamp="formatTime(item.createTime)">
                <strong>{{ progressText(item.orderStatus) }}</strong>
                <p>{{ item.progressNote || '暂无补充说明' }}</p>
              </el-timeline-item>
            </el-timeline>

            <OrderChatPanel :order-id="order.id" />

            <div class="actions">
              <el-button v-if="order.orderStatus === 10" type="primary" @click="handleAcceptOrder(order.id)">接受指派</el-button>
              <el-button v-if="order.orderStatus === 20" type="primary" @click="openProgressDialog(order.id, 25)">开始服务</el-button>
              <el-button v-if="order.orderStatus === 25" type="success" @click="openProgressDialog(order.id, 35)">提交完成</el-button>
            </div>
          </el-card>
          <el-empty v-if="myOrders.length === 0 && !loadingMy" description="暂无任务" />
        </div>
      </el-tab-pane>
    </el-tabs>

    <el-dialog v-model="progressDialogVisible" title="更新订单进度" width="520px">
      <el-form :model="progressForm" label-width="100px">
        <el-form-item label="进度说明">
          <el-input v-model="progressForm.progressNote" type="textarea" rows="4" placeholder="补充上门时间、服务阶段或验收说明" />
        </el-form-item>
        <el-form-item label="现场图片">
          <el-upload :show-file-list="false" :http-request="customUpload">
            <el-button plain>上传图片</el-button>
          </el-upload>
          <a v-if="progressForm.progressImageUrl" :href="progressForm.progressImageUrl" target="_blank" rel="noreferrer">查看已上传图片</a>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="progressDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitProgress">提交</el-button>
      </template>
    </el-dialog>
  </section>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import OrderChatPanel from '@/components/order/OrderChatPanel.vue'
import { uploadFileAPI } from '@/api/profile'
import { acceptOrderAPI, getAvailableOrdersAPI, getMyOrdersAPI, getOrderProgressAPI, updateOrderProgressAPI } from '@/api/order'

const activeTab = ref('hall')
const hallOrders = ref([])
const myOrders = ref([])
const progressMap = ref({})
const loadingHall = ref(false)
const loadingMy = ref(false)
const progressDialogVisible = ref(false)
const currentOrderId = ref(null)
const progressForm = ref({
  orderStatus: 25,
  progressNote: '',
  progressImageUrl: ''
})

const fetchHallOrders = async () => {
  loadingHall.value = true
  try {
    const res = await getAvailableOrdersAPI()
    if (res.code === 200) {
      hallOrders.value = res.data
    }
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
      const entries = await Promise.all(
        res.data.map(async (order) => {
          const progressRes = await getOrderProgressAPI(order.id)
          return [order.id, progressRes.code === 200 ? progressRes.data : []]
        })
      )
      progressMap.value = Object.fromEntries(entries)
    }
  } finally {
    loadingMy.value = false
  }
}

const handleTabChange = (name) => {
  if (name === 'hall') fetchHallOrders()
  if (name === 'my') fetchMyOrders()
}

const handleAcceptOrder = async (orderId) => {
  const res = await acceptOrderAPI(orderId)
  if (res.code === 200) {
    ElMessage.success('接单成功')
    fetchHallOrders()
    fetchMyOrders()
    activeTab.value = 'my'
  } else {
    ElMessage.error(res.message)
  }
}

const openProgressDialog = (orderId, status) => {
  currentOrderId.value = orderId
  progressForm.value = {
    orderStatus: status,
    progressNote: '',
    progressImageUrl: ''
  }
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
    ElMessage.success('进度已更新')
    progressDialogVisible.value = false
    fetchMyOrders()
  } else {
    ElMessage.error(res.message)
  }
}

const formatTime = (value) => (value ? value.replace('T', ' ').slice(0, 16) : '-')
const statusText = (status) => ({
  20: '已接单',
  25: '服务中',
  35: '待验收',
  40: '已完成'
}[status] || '处理中')
const statusType = (status) => ({
  20: 'primary',
  25: 'warning',
  35: 'success',
  40: 'success'
}[status] || 'info')
const progressText = (status) => ({
  25: '开始服务',
  35: '服务完成，等待客户验收'
}[status] || '进度更新')

onMounted(fetchHallOrders)
</script>

<style scoped>
.pro-page {
  display: grid;
  gap: 20px;
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

.card-grid {
  display: grid;
  gap: 18px;
  margin-top: 14px;
}

.order-card {
  border-radius: 28px;
}

.top-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.order-card p {
  color: #64748b;
}

.meta {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 12px;
  color: #475569;
  margin: 16px 0;
}

.timeline {
  margin-bottom: 18px;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 18px;
}
</style>
