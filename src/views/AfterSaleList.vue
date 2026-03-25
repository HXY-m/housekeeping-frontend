<template>
    <div class="page">
        <el-row :gutter="20">
            <el-col :span="10">
                <el-card>
                    <template #header>提交售后反馈</template>
                    <el-form :model="form" label-width="90px">
                        <el-form-item label="关联订单">
                            <el-select v-model="form.orderId" placeholder="选择已完成订单" style="width: 100%">
                                <el-option v-for="order in completedOrders" :key="order.id" :label="order.orderNo" :value="order.id" />
                            </el-select>
                        </el-form-item>
                        <el-form-item label="反馈类型">
                            <el-select v-model="form.feedbackType" style="width: 100%">
                                <el-option label="服务不满意" value="服务不满意" />
                                <el-option label="服务违规" value="服务违规" />
                                <el-option label="需求变更" value="需求变更" />
                            </el-select>
                        </el-form-item>
                        <el-form-item label="反馈内容">
                            <el-input v-model="form.feedbackContent" type="textarea" rows="4" />
                        </el-form-item>
                        <el-form-item label="佐证材料">
                            <el-upload :show-file-list="false" :http-request="customUpload">
                                <el-button>上传图片</el-button>
                            </el-upload>
                            <a v-if="form.evidenceUrl" :href="form.evidenceUrl" target="_blank" style="margin-left: 12px;">已上传</a>
                        </el-form-item>
                        <el-form-item>
                            <el-button type="primary" @click="submitAfterSale">提交售后</el-button>
                        </el-form-item>
                    </el-form>
                </el-card>
            </el-col>
            <el-col :span="14">
                <el-card>
                    <template #header>我的售后记录</template>
                    <el-table :data="list" stripe>
                        <el-table-column prop="orderId" label="订单ID" width="90" />
                        <el-table-column prop="feedbackType" label="类型" width="120" />
                        <el-table-column prop="feedbackContent" label="内容" />
                        <el-table-column label="状态" width="110">
                            <template #default="{ row }">
                                <el-tag>{{ statusText(row.status) }}</el-tag>
                            </template>
                        </el-table-column>
                        <el-table-column prop="handleRemark" label="处理说明" />
                    </el-table>
                </el-card>
            </el-col>
        </el-row>
    </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { createAfterSaleAPI, getMyAfterSalesAPI } from '../api/afterSale'
import { getMyOrdersAPI } from '../api/order'
import { uploadFileAPI } from '../api/profile'

const list = ref([])
const completedOrders = ref([])
const form = ref({
    orderId: null,
    feedbackType: '服务不满意',
    feedbackContent: '',
    evidenceUrl: ''
})

onMounted(() => {
    fetchData()
})

const fetchData = async () => {
    const [afterSaleRes, orderRes] = await Promise.all([getMyAfterSalesAPI(), getMyOrdersAPI()])
    if (afterSaleRes.code === 200) list.value = afterSaleRes.data
    if (orderRes.code === 200) completedOrders.value = orderRes.data.filter(item => item.orderStatus >= 35)
}

const customUpload = async (options) => {
    const formData = new FormData()
    formData.append('file', options.file)
    const res = await uploadFileAPI(formData)
    if (res.code === 200) {
        form.value.evidenceUrl = res.data
        ElMessage.success('上传成功')
        options.onSuccess(res, options.file)
    } else {
        options.onError(new Error(res.message))
    }
}

const submitAfterSale = async () => {
    const res = await createAfterSaleAPI(form.value)
    if (res.code === 200) {
        ElMessage.success('售后反馈已提交')
        form.value = { orderId: null, feedbackType: '服务不满意', feedbackContent: '', evidenceUrl: '' }
        fetchData()
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
