<template>
  <section class="service-page">
    <div class="page-header">
      <div>
        <p class="eyebrow">Booking</p>
        <h2>预约服务</h2>
        <p>选择服务、地址和服务人员后先创建订单，再完成模拟支付。</p>
      </div>
    </div>

    <div class="service-grid">
      <el-card v-for="service in serviceList" :key="service.id" shadow="hover" class="service-card">
        <p>STANDARD SERVICE</p>
        <h3>{{ service.serviceName }}</h3>
        <span>{{ service.description || '标准化上门服务，支持预约、支付、进度追踪和售后处理。' }}</span>
        <strong>¥ {{ service.basePrice }}</strong>
        <el-button type="primary" @click="handleBook(service)">选择并预约</el-button>
      </el-card>
    </div>

    <el-dialog v-model="checkoutDialogVisible" title="确认订单信息" width="680px">
      <div v-if="currentCheckoutService" class="checkout-header">
        <div>
          <h3>{{ currentCheckoutService.serviceName }}</h3>
          <p>{{ currentCheckoutService.description || '请确认服务对象、地址和支付方式。' }}</p>
        </div>
        <strong>¥ {{ currentCheckoutService.basePrice }}</strong>
      </div>

      <div class="checkout-section">
        <h4>服务地址</h4>
        <div v-loading="loadingAddresses" class="address-list">
          <el-radio-group v-model="selectedAddressId" class="radio-column">
            <el-card
              v-for="addr in myAddresses"
              :key="addr.id"
              shadow="hover"
              class="select-card"
              :class="{ active: selectedAddressId === addr.id }"
              @click="selectedAddressId = addr.id"
            >
              <el-radio :label="addr.id">
                <div>
                  <strong>{{ addr.contactName }}</strong>
                  <span>{{ addr.contactPhone }}</span>
                  <p>{{ addr.addressDetail }}</p>
                </div>
              </el-radio>
            </el-card>
          </el-radio-group>
          <el-empty v-if="myAddresses.length === 0 && !loadingAddresses" description="请先维护服务地址">
            <el-button type="primary" @click="router.push('/home/address')">去维护地址</el-button>
          </el-empty>
        </div>
      </div>

      <div class="checkout-section">
        <h4>服务人员</h4>
        <div v-loading="loadingProfs" class="radio-column">
          <el-card class="select-card" :class="{ active: selectedProfessionalId === null }" @click="selectedProfessionalId = null">
            <el-radio :label="null">平台自动匹配</el-radio>
          </el-card>
          <el-card
            v-for="prof in availableProfessionals"
            :key="prof.userId"
            class="select-card"
            :class="{ active: selectedProfessionalId === prof.userId }"
            @click="selectedProfessionalId = prof.userId"
          >
            <el-radio :label="prof.userId">
              <div>
                <strong>{{ prof.fullName }}</strong>
                <span>{{ prof.experienceYears }} 年经验</span>
                <p>评分 {{ prof.rating || 5 }}</p>
              </div>
            </el-radio>
          </el-card>
        </div>
      </div>

      <div class="checkout-section">
        <h4>支付方式</h4>
        <el-radio-group v-model="paymentMethod" class="payment-group">
          <el-radio-button label="BALANCE">余额支付</el-radio-button>
          <el-radio-button label="WECHAT">微信模拟支付</el-radio-button>
          <el-radio-button label="ALIPAY">支付宝模拟支付</el-radio-button>
        </el-radio-group>
      </div>

      <template #footer>
        <el-button @click="checkoutDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitOrder">创建订单并支付</el-button>
      </template>
    </el-dialog>
  </section>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import request from '@/utils/request'
import { getMyAddressesAPI } from '@/api/address'
import { getProfessionalsByServiceAPI } from '@/api/profile'
import { createOrderAPI, payOrderAPI } from '@/api/order'

const router = useRouter()

const serviceList = ref([])
const checkoutDialogVisible = ref(false)
const currentCheckoutService = ref(null)
const myAddresses = ref([])
const selectedAddressId = ref(null)
const loadingAddresses = ref(false)
const availableProfessionals = ref([])
const selectedProfessionalId = ref(null)
const loadingProfs = ref(false)
const paymentMethod = ref('WECHAT')

const fetchServiceList = async () => {
  const res = await request.get('/services')
  if (res.code === 200) {
    serviceList.value = res.data
  }
}

const handleBook = async (service) => {
  currentCheckoutService.value = service
  checkoutDialogVisible.value = true
  selectedAddressId.value = null
  selectedProfessionalId.value = null
  paymentMethod.value = 'WECHAT'

  loadingAddresses.value = true
  try {
    const res = await getMyAddressesAPI()
    if (res.code === 200) {
      myAddresses.value = res.data
      if (myAddresses.value.length) {
        selectedAddressId.value = myAddresses.value.find((item) => item.isDefault === 1)?.id || myAddresses.value[0].id
      }
    }
  } finally {
    loadingAddresses.value = false
  }

  loadingProfs.value = true
  try {
    const resProf = await getProfessionalsByServiceAPI(service.id)
    if (resProf.code === 200) {
      availableProfessionals.value = resProf.data
    }
  } finally {
    loadingProfs.value = false
  }
}

const submitOrder = async () => {
  if (!selectedAddressId.value) {
    ElMessage.warning('请先选择服务地址')
    return
  }
  const targetAddress = myAddresses.value.find((item) => item.id === selectedAddressId.value)
  const orderData = {
    serviceId: currentCheckoutService.value.id,
    totalAmount: currentCheckoutService.value.basePrice,
    contactName: targetAddress.contactName,
    contactPhone: targetAddress.contactPhone,
    serviceAddress: targetAddress.addressDetail,
    professionalId: selectedProfessionalId.value
  }
  const orderRes = await createOrderAPI(orderData)
  if (orderRes.code !== 200) {
    ElMessage.error(orderRes.message || '订单创建失败')
    return
  }
  const payRes = await payOrderAPI(orderRes.data.id, { paymentMethod: paymentMethod.value })
  if (payRes.code === 200) {
    ElMessage.success('订单创建并支付成功')
    checkoutDialogVisible.value = false
    router.push('/home/customer-orders')
  } else {
    ElMessage.error(payRes.message)
  }
}

onMounted(fetchServiceList)
</script>

<style scoped>
.service-page {
  display: grid;
  gap: 22px;
}

.page-header h2 {
  margin: 8px 0;
  font-size: 32px;
}

.page-header p:last-child,
.checkout-header p {
  margin: 0;
  color: #64748b;
}

.eyebrow {
  margin: 0;
  color: #0f766e;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.16em;
}

.service-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 18px;
}

.service-card {
  border-radius: 26px;
  display: grid;
  gap: 12px;
}

.service-card p {
  margin: 0;
  color: #0f766e;
  font-size: 12px;
  letter-spacing: 0.16em;
}

.service-card h3 {
  margin: 0;
}

.service-card span {
  color: #64748b;
  line-height: 1.6;
}

.service-card strong {
  font-size: 28px;
}

.checkout-header {
  display: flex;
  justify-content: space-between;
  gap: 18px;
  align-items: flex-start;
  margin-bottom: 18px;
}

.checkout-header h3 {
  margin: 0 0 8px;
}

.checkout-header strong {
  font-size: 30px;
}

.checkout-section {
  margin-top: 20px;
}

.address-list,
.radio-column {
  display: grid;
  gap: 12px;
}

.select-card {
  border-radius: 18px;
  cursor: pointer;
}

.select-card.active {
  border-color: #0f766e;
}

.select-card strong,
.select-card span,
.select-card p {
  display: block;
}

.select-card span,
.select-card p {
  color: #64748b;
  margin-top: 4px;
}

.payment-group {
  display: flex;
  flex-wrap: wrap;
}
</style>
