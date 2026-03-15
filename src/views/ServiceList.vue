<template>
    <div class="service-view">
        <h2>可预约的家政服务</h2>
        <div class="service-grid">
            <div class="service-card" v-for="item in serviceList" :key="item.id">
                <h3>{{ item.serviceName }}</h3>
                <p class="desc">{{ item.description || '暂无描述' }}</p>
                <div class="price-action">
                    <span class="price">¥ {{ item.basePrice }} /次</span>
                    <button class="book-btn" @click="handleBook(item.id)">立即预约</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import request from '../utils/request'

const serviceList = ref([])

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

const handleBook = async (serviceId) => {
    if (!confirm('确定要预约该服务吗？')) return
    try {
        const res = await request.post('/orders', { serviceId: serviceId })
        if (res.code === 200) {
            alert(`预约成功！您的订单号为：${res.data.orderNo}`)
        } else {
            alert(res.message || '预约失败')
        }
    } catch (error) {
        console.error('下单异常', error)
    }
}
</script>

<style scoped>
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