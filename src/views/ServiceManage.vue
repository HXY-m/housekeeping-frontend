<template>
    <div class="manage-container">
        <div class="header-action">
            <h2 style="margin: 0; color: #303133;">服务项目管理</h2>
            <el-button type="primary" @click="openAddDialog"> + 新增服务</el-button>
        </div>

        <el-table :data="serviceList" border stripe style="width: 100%; margin-top: 20px;">
            <el-table-column prop="id" label="服务ID" width="80" align="center" />
            <el-table-column prop="serviceName" label="服务名称" width="200" />
            <el-table-column prop="description" label="服务描述" show-overflow-tooltip />
            <el-table-column prop="basePrice" label="基础价格 (元)" width="150" align="center">
                <template #default="scope">
                    <span style="color: #f56c6c; font-weight: bold;">¥ {{ scope.row.basePrice }}</span>
                </template>
            </el-table-column>
            <el-table-column label="操作" width="200" align="center">
                <template #default="scope">
                    <el-button size="small" type="primary" plain @click="openEditDialog(scope.row)">编辑</el-button>
                    <el-button size="small" type="danger" plain @click="handleDelete(scope.row.id)">下架</el-button>
                </template>
            </el-table-column>
        </el-table>

        <el-dialog :title="isEdit ? '编辑服务项目' : '新增服务项目'" v-model="dialogVisible" width="500px">
            <el-form :model="formData" label-width="100px">
                <el-form-item label="服务类型">
                    <el-select v-model="formData.serviceType" filterable allow-create default-first-option
                        placeholder="请选择现有类型，或直接键入新类型按回车" style="width: 100%;">
                        <el-option v-for="type in uniqueServiceTypes" :key="type" :label="type" :value="type" />
                    </el-select>
                </el-form-item>
                <el-form-item label="服务名称">
                    <el-input v-model="formData.serviceName" placeholder="例如：高级开荒保洁" />
                </el-form-item>
                <el-form-item label="服务描述">
                    <el-input type="textarea" v-model="formData.description" placeholder="请输入服务的内容和标准..." />
                </el-form-item>
                <el-form-item label="基础价格">
                    <el-input-number v-model="formData.basePrice" :min="1" :precision="2" :step="10" />
                </el-form-item>
            </el-form>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="dialogVisible = false">取 消</el-button>
                    <el-button type="primary" @click="submitForm">确 定</el-button>
                </span>
            </template>
        </el-dialog>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '../utils/request'

// 响应式状态
const serviceList = ref([])
const dialogVisible = ref(false)
const isEdit = ref(false) // 标记当前是新增还是编辑
const formData = ref({
    id: null,
    serviceName: '',
    serviceType: '',
    description: '',
    basePrice: 0
})

// 页面加载时获取列表
onMounted(() => {
    fetchServices()
})
const uniqueServiceTypes = computed(() => {
    // 从 serviceList 中抽出所有的 serviceType
    const types = serviceList.value.map(item => item.serviceType).filter(Boolean)
    // 使用 Set 去重，然后再转回数组
    return [...new Set(types)]
})

// 1. 查：获取服务列表
const fetchServices = async () => {
    try {
        const res = await request.get('/services')
        if (res.code === 200) {
            serviceList.value = res.data
        }
    } catch (error) {
        ElMessage.error('获取列表失败')
    }
}

// 打开新增弹窗
const openAddDialog = () => {
    isEdit.value = false
    formData.value = { id: null, serviceName: '', serviceType: '', description: '', basePrice: 0 }
    dialogVisible.value = true
}

// 打开编辑弹窗
const openEditDialog = (row) => {
    isEdit.value = true
    // 将当前行的数据回显到表单里 (使用浅拷贝防止修改表单时直接影响表格)
    formData.value = { ...row }
    dialogVisible.value = true
}

// 2 & 3. 增/改：提交表单
const submitForm = async () => {
    if (!formData.value.serviceName) {
        ElMessage.warning('服务名称不能为空！')
        return
    }
    try {
        let res
        if (isEdit.value) {
            // 编辑：调用 PUT 接口
            res = await request.put(`/services/${formData.value.id}`, formData.value)
        } else {
            // 新增：调用 POST 接口
            res = await request.post('/services', formData.value)
        }

        if (res.code === 200) {
            ElMessage.success(res.message || '操作成功')
            dialogVisible.value = false // 关闭弹窗
            fetchServices() // 刷新表格数据
        } else {
            ElMessage.error(res.message || '操作失败')
        }
    } catch (error) {
        console.error(error)
    }
}

// 4. 删：点击下架按钮
const handleDelete = (id) => {
    // 优雅的 Element-Plus 确认框
    ElMessageBox.confirm(
        '确定要下架并删除该服务吗？',
        '危险操作提示',
        { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }
    ).then(async () => {
        try {
            const res = await request.delete(`/services/${id}`)
            if (res.code === 200) {
                ElMessage.success('服务已成功下架')
                fetchServices() // 刷新列表
            }
        } catch (error) {
            console.error(error)
        }
    }).catch(() => {
        // 用户点击了取消，不做任何处理
    })
}

</script>

<style scoped>
.manage-container {
    background: #fff;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.header-action {
    display: flex;
    justify-content: space-between;
    align-items: center;
}
</style>