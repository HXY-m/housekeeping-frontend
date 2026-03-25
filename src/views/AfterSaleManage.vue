<template>
    <div class="page">
        <el-card>
            <template #header>售后处理中心</template>
            <el-table :data="list" stripe>
                <el-table-column prop="id" label="编号" width="80" />
                <el-table-column prop="orderId" label="订单ID" width="90" />
                <el-table-column prop="feedbackType" label="类型" width="120" />
                <el-table-column prop="feedbackContent" label="反馈内容" />
                <el-table-column label="佐证" width="90">
                    <template #default="{ row }">
                        <a v-if="row.evidenceUrl" :href="row.evidenceUrl" target="_blank">查看</a>
                        <span v-else>-</span>
                    </template>
                </el-table-column>
                <el-table-column label="状态" width="100">
                    <template #default="{ row }">
                        <el-tag>{{ statusText(row.status) }}</el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="handleRemark" label="处理说明" />
                <el-table-column label="操作" width="220">
                    <template #default="{ row }">
                        <el-button size="small" @click="openDialog(row, 1)">处理中</el-button>
                        <el-button size="small" type="success" @click="openDialog(row, 2)">已解决</el-button>
                        <el-button size="small" type="danger" @click="openDialog(row, 3)">驳回</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-card>

        <el-dialog v-model="dialogVisible" title="处理售后" width="480px">
            <el-form :model="handleForm" label-width="90px">
                <el-form-item label="处理说明">
                    <el-input v-model="handleForm.handleRemark" type="textarea" rows="4" />
                </el-form-item>
            </el-form>
            <template #footer>
                <el-button @click="dialogVisible = false">取消</el-button>
                <el-button type="primary" @click="submitHandle">提交</el-button>
            </template>
        </el-dialog>
    </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { getAllAfterSalesAPI, handleAfterSaleAPI } from '../api/afterSale'

const list = ref([])
const dialogVisible = ref(false)
const currentId = ref(null)
const handleForm = ref({ status: 1, handleRemark: '' })

onMounted(() => {
    fetchList()
})

const fetchList = async () => {
    const res = await getAllAfterSalesAPI()
    if (res.code === 200) list.value = res.data
}

const openDialog = (row, status) => {
    currentId.value = row.id
    handleForm.value = { status, handleRemark: row.handleRemark || '' }
    dialogVisible.value = true
}

const submitHandle = async () => {
    const res = await handleAfterSaleAPI(currentId.value, handleForm.value)
    if (res.code === 200) {
        ElMessage.success('处理成功')
        dialogVisible.value = false
        fetchList()
    } else {
        ElMessage.error(res.message)
    }
}

const statusText = (status) => ({
    0: '待处理',
    1: '处理中',
    2: '已解决',
    3: '已驳回'
}[status] || '未知')
</script>

<style scoped>
.page { padding: 10px; }
</style>
