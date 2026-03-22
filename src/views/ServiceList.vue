<template>
    <div class="service-view">
        <h2>可预约的家政服务</h2>
        <div class="service-grid">
            <div class="service-card" v-for="item in serviceList" :key="item.id">
                <h3>{{ item.serviceName }}</h3>
                <p class="desc">{{ item.description || '暂无描述' }}</p>
                <div class="price-action">
                    <span class="price">¥ {{ item.basePrice }} /次</span>
                    <button class="book-btn" @click="handleBook(item)">立即预约</button>
                </div>
            </div>
        </div>

        <el-dialog title="确认订单信息" v-model="checkoutDialogVisible" width="600px">
            <div v-if="currentCheckoutService">
                <h3 style="margin-top: 0; color: #303133;">{{ currentCheckoutService.serviceName }}</h3>
                <p style="color: #F56C6C; font-size: 18px; font-weight: bold;">
                    订单金额：¥ {{ currentCheckoutService.basePrice }}
                </p>
            </div>
            
            <el-divider />
            
            <h4>📍 请选择服务地址</h4>
            <div v-loading="loadingAddresses">
                <el-radio-group v-model="selectedAddressId" style="width: 100%; display: flex; flex-direction: column; gap: 10px;">
                    <el-card 
                        v-for="addr in myAddresses" 
                        :key="addr.id" 
                        shadow="hover" 
                        style="cursor: pointer;"
                        :style="selectedAddressId === addr.id ? 'border: 1px solid #409EFF;' : ''"
                        @click="selectedAddressId = addr.id"
                    >
                        <el-radio :label="addr.id" size="large">
                            <span style="font-weight: bold;">{{ addr.contactName }}</span> 
                            <span style="color: #909399; margin-left: 10px;">{{ addr.contactPhone }}</span>
                            <el-tag v-if="addr.isDefault === 1" type="success" size="small" style="margin-left: 10px;">默认</el-tag>
                            <p style="margin: 5px 0 0 0; color: #606266; font-size: 14px; white-space: normal;">
                                {{ addr.addressDetail }}
                            </p>
                        </el-radio>
                    </el-card>
                </el-radio-group>
                
                <div v-if="myAddresses.length === 0 && !loadingAddresses" style="text-align: center; padding: 20px;">
                    <el-empty description="您还没有添加过地址" :image-size="80" />
                    <el-button type="primary" link @click="router.push('/home/address')">去添加地址</el-button>
                </div>
            </div>

            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="checkoutDialogVisible = false">取 消</el-button>
                    <el-button type="primary" @click="submitOrder" :disabled="!selectedAddressId">提交订单</el-button>
                </span>
            </template>
        </el-dialog>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import request from '../utils/request'
import { useUserStore } from '../store/user'
import { getMyAddressesAPI } from '../api/address'

const router = useRouter()
const userStore = useUserStore()

const serviceList = ref([])

// 弹窗相关状态
const checkoutDialogVisible = ref(false)
const currentCheckoutService = ref(null)
const myAddresses = ref([])
const selectedAddressId = ref(null)
const loadingAddresses = ref(false)

onMounted(() => {
    fetchServiceList()
})

const fetchServiceList = async () => {
    try {
        const res = await request.get('/services')
        if (res.code === 200) {
            serviceList.value = res.data
        }
    } catch (error) {
        console.error('获取服务列表失败', error)
    }
}

// 点击"立即预约"：打开弹窗并拉取地址
const handleBook = async (service) => {
    currentCheckoutService.value = service
    checkoutDialogVisible.value = true
    selectedAddressId.value = null
    
    // 拉取客户的地址簿
    loadingAddresses.value = true
    try {
        const res = await getMyAddressesAPI(userStore.userId)
        if (res.code === 200) {
            myAddresses.value = res.data
            // 智能体验：如果列表里有地址，自动选中默认地址，或者选中第一个
            if (myAddresses.value.length > 0) {
                const defaultAddr = myAddresses.value.find(a => a.isDefault === 1)
                selectedAddressId.value = defaultAddr ? defaultAddr.id : myAddresses.value[0].id
            }
        }
    } catch (error) {
        console.error('获取地址失败', error)
    } finally {
        loadingAddresses.value = false
    }
}

// 点击弹窗里的"提交订单"：组装快照数据并下单
const submitOrder = async () => {
    if (!selectedAddressId.value) {
        ElMessage.warning('请先选择一个服务地址！')
        return
    }

    // 从列表中揪出客户选中的那个地址的完整信息
    const targetAddress = myAddresses.value.find(a => a.id === selectedAddressId.value)

    try {
        // 组装提交给后端的数据，包含【金额】和【地址快照】
        const orderData = {
            serviceId: currentCheckoutService.value.id,
            customerId: userStore.userId,
            totalAmount: currentCheckoutService.value.basePrice,
            contactName: targetAddress.contactName,
            contactPhone: targetAddress.contactPhone,
            serviceAddress: targetAddress.addressDetail
        }

        const res = await request.post('/orders', orderData)
        if (res.code === 200) {
            ElMessage.success('🎉 订单提交成功！师傅将尽快为您服务！')
            checkoutDialogVisible.value = false
            // 订单生成后，自动跳转到我的订单页面查看
            router.push('/home/customer-orders')
        } else {
            ElMessage.error(res.message || '预约失败')
        }
    } catch (error) {
        console.error('下单异常', error)
    }
}
</script>

<style scoped>
/* 保持你原有的精美样式完全不变 */
.service-view h2 {
    margin-top: 0;
    color: #333;
}

.service-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    margin-top: 20px;
}

.service-card {
    background: white;
    width: 280px;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}

.service-card h3 {
    margin-top: 0;
    color: #333;
}

.desc {
    color: #666;
    font-size: 14px;
    min-height: 40px;
}

.price-action {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 15px;
    border-top: 1px solid #eee;
    padding-top: 15px;
}

.price {
    color: #f56c6c;
    font-weight: bold;
    font-size: 18px;
}

.book-btn {
    background-color: #67c23a;
    color: white;
    border: none;
    padding: 8px 15px;
    border-radius: 4px;
    cursor: pointer;
}

.book-btn:hover {
    background-color: #85ce61;
}
</style>