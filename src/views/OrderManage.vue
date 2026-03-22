<template>
    <div class="order-manage-container">
        <el-card shadow="hover" class="box-card">
            <template #header>
                <div class="card-header">
                    <span style="font-weight: bold; font-size: 16px;">全局订单管理</span>
                    <el-button type="primary" plain @click="fetchOrders">刷新列表</el-button>
                </div>
            </template>

            <el-table :data="orderList" border stripe style="width: 100%" v-loading="loading">
                <el-table-column prop="id" label="ID" width="60" align="center" />
                <el-table-column prop="orderNo" label="订单流水号" width="220" />
                <el-table-column label="服务 ID" width="90" align="center">
                    <template #default="scope">{{ scope.row.serviceId }}</template>
                </el-table-column>
                <el-table-column label="买家 ID" width="90" align="center">
                    <template #default="scope">{{ scope.row.customerId }}</template>
                </el-table-column>
                <el-table-column label="接单师傅 ID" width="100" align="center">
                    <template #default="scope">
                        <span v-if="scope.row.professionalId">{{ scope.row.professionalId }}</span>
                        <span v-else style="color: #909399;">暂无接单</span>
                    </template>
                </el-table-column>
                <el-table-column label="订单金额" width="100" align="center">
                    <template #default="scope">
                        <span style="color: #F56C6C; font-weight: bold;">¥ {{ scope.row.totalAmount }}</span>
                    </template>
                </el-table-column>

                <el-table-column label="当前状态" width="120" align="center">
                    <template #default="scope">
                        <el-tag v-if="scope.row.orderStatus === 10" type="warning">待接单</el-tag>
                        <el-tag v-else-if="scope.row.orderStatus === 20" type="primary">服务中</el-tag>
                        <el-tag v-else-if="scope.row.orderStatus === 40" type="success">已完成</el-tag>
                        <el-tag v-else-if="scope.row.orderStatus === 90" type="info">已取消</el-tag>
                        <el-tag v-else type="danger">异常状态</el-tag>
                    </template>
                </el-table-column>

                <el-table-column label="创建时间" min-width="160">
                    <template #default="scope">{{ formatTime(scope.row.createTime) }}</template>
                </el-table-column>

                <el-table-column label="危险操作" width="120" align="center" fixed="right">
                    <template #default="scope">
                        <el-popconfirm title="此操作不可逆，确定强制删除该订单吗？" confirm-button-text="删除" cancel-button-text="取消"
                            confirm-button-type="danger" @confirm="handleDelete(scope.row.id)">
                            <template #reference>
                                <el-button type="danger" size="small" icon="Delete">强制删除</el-button>
                            </template>
                        </el-popconfirm>
                    </template>
                </el-table-column>
            </el-table>
        </el-card>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getAllOrdersAdminAPI, deleteOrderAdminAPI } from '../api/order'
import { Delete } from '@element-plus/icons-vue'

const orderList = ref([])
const loading = ref(false)

onMounted(() => {
    fetchOrders()
})

// 获取所有订单
const fetchOrders = async () => {
    loading.value = true
    try {
        const res = await getAllOrdersAdminAPI()
        if (res.code === 200) {
            orderList.value = res.data
        } else {
            ElMessage.error(res.message)
        }
    } catch (error) {
        console.error('获取全量订单失败', error)
    } finally {
        loading.value = false
    }
}

// 强制删除订单
const handleDelete = async (id) => {
    try {
        const res = await deleteOrderAdminAPI(id)
        if (res.code === 200) {
            ElMessage.success('删除成功')
            fetchOrders() // 刷新表格
        } else {
            ElMessage.error(res.message)
        }
    } catch (error) {
        console.error('删除订单异常', error)
    }
}

// 格式化时间工具
const formatTime = (timeStr) => {
    if (!timeStr) return '-'
    return timeStr.replace('T', ' ').substring(0, 19)
}
</script>

<style scoped>
.order-manage-container {
    padding: 10px;
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.box-card {
    border-radius: 8px;
    border: none;
}
</style>