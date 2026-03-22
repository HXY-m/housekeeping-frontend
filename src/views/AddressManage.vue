<template>
    <div class="address-container">
        <div class="header">
            <h2>🏡 我的地址簿</h2>
            <el-button type="primary" icon="Plus" @click="openAddDialog">新增服务地址</el-button>
        </div>

        <el-row :gutter="20" v-loading="loading">
            <el-col :span="8" v-for="item in addressList" :key="item.id" style="margin-bottom: 20px;">
                <el-card shadow="hover" class="address-card" :class="{ 'is-default': item.isDefault === 1 }">
                    <div class="card-header">
                        <span class="contact-name">{{ item.contactName }}</span>
                        <span class="contact-phone">{{ item.contactPhone }}</span>
                    </div>
                    <div class="card-body">
                        <p class="address-detail">{{ item.addressDetail }}</p>
                    </div>
                    <div class="card-footer">
                        <div>
                            <el-tag v-if="item.isDefault === 1" type="success" size="small" effect="dark">默认地址</el-tag>
                            <el-button v-else type="primary" link size="small"
                                @click="handleSetDefault(item.id)">设为默认</el-button>
                        </div>
                        <div class="actions">
                            <el-button type="primary" link icon="Edit" @click="openEditDialog(item)">编辑</el-button>
                            <el-popconfirm title="确定要删除这个地址吗？" @confirm="handleDelete(item.id)">
                                <template #reference>
                                    <el-button type="danger" link icon="Delete">删除</el-button>
                                </template>
                            </el-popconfirm>
                        </div>
                    </div>
                </el-card>
            </el-col>

            <el-empty v-if="addressList.length === 0 && !loading" description="您还没有添加过服务地址哦" style="width: 100%;" />
        </el-row>

        <el-dialog :title="dialogTitle" v-model="dialogVisible" width="500px">
            <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
                <el-form-item label="联系人姓名" prop="contactName">
                    <el-input v-model="form.contactName" placeholder="如：张先生、李女士" />
                </el-form-item>
                <el-form-item label="联系电话" prop="contactPhone">
                    <el-input v-model="form.contactPhone" placeholder="请输入手机号" maxlength="11" />
                </el-form-item>
                <el-form-item label="详细地址" prop="addressDetail">
                    <el-input v-model="form.addressDetail" type="textarea" rows="3" placeholder="如：阳光小区 5栋 2单元 304室" />
                </el-form-item>
                <el-form-item label="设为默认">
                    <el-switch v-model="form.isDefault" :active-value="1" :inactive-value="0" />
                </el-form-item>
            </el-form>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="dialogVisible = false">取消</el-button>
                    <el-button type="primary" @click="submitForm">确定保存</el-button>
                </span>
            </template>
        </el-dialog>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '../store/user'
import { Plus, Edit, Delete } from '@element-plus/icons-vue'
import { getMyAddressesAPI, addAddressAPI, updateAddressAPI, deleteAddressAPI, setDefaultAddressAPI } from '../api/address'

const userStore = useUserStore()
const addressList = ref([])
const loading = ref(false)

// 弹窗相关
const dialogVisible = ref(false)
const dialogTitle = ref('新增地址')
const formRef = ref(null)
const form = ref({
    id: null,
    customerId: userStore.userId,
    contactName: '',
    contactPhone: '',
    addressDetail: '',
    isDefault: 0
})

const rules = {
    contactName: [{ required: true, message: '请输入联系人姓名', trigger: 'blur' }],
    contactPhone: [{ required: true, message: '请输入联系电话', trigger: 'blur' }],
    addressDetail: [{ required: true, message: '请输入详细地址', trigger: 'blur' }]
}

// 获取地址列表
const fetchAddresses = async () => {
    loading.value = true
    try {
        const res = await getMyAddressesAPI(userStore.userId)
        if (res.code === 200) addressList.value = res.data
    } finally {
        loading.value = false
    }
}

// 页面加载时获取数据
onMounted(() => {
    fetchAddresses()
})

// 打开新增弹窗
const openAddDialog = () => {
    dialogTitle.value = '新增服务地址'
    form.value = { id: null, customerId: userStore.userId, contactName: '', contactPhone: '', addressDetail: '', isDefault: 0 }
    dialogVisible.value = true
    // 延迟清空校验状态
    setTimeout(() => formRef.value?.clearValidate(), 0)
}

// 打开编辑弹窗
const openEditDialog = (row) => {
    dialogTitle.value = '编辑服务地址'
    form.value = { ...row } // 浅拷贝回显数据
    dialogVisible.value = true
}

// 提交表单 (新增/修改)
const submitForm = () => {
    formRef.value.validate(async (valid) => {
        if (valid) {
            try {
                const res = form.value.id ? await updateAddressAPI(form.value) : await addAddressAPI(form.value)
                if (res.code === 200) {
                    ElMessage.success(res.message)
                    dialogVisible.value = false
                    fetchAddresses() // 刷新列表
                } else {
                    ElMessage.error(res.message)
                }
            } catch (error) {
                console.error(error)
            }
        }
    })
}

// 删除地址
const handleDelete = async (id) => {
    const res = await deleteAddressAPI(id)
    if (res.code === 200) {
        ElMessage.success('删除成功')
        fetchAddresses()
    }
}

// 设为默认地址
const handleSetDefault = async (addressId) => {
    const res = await setDefaultAddressAPI(addressId, userStore.userId)
    if (res.code === 200) {
        ElMessage.success('设置成功')
        fetchAddresses()
    }
}
</script>

<style scoped>
.address-container {
    padding: 10px;
}

.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.address-card {
    border-radius: 8px;
    position: relative;
    transition: all 0.3s;
}

.address-card:hover {
    transform: translateY(-5px);
}

.address-card.is-default {
    border: 1px solid #67C23A;
    /* 默认地址绿色高亮边框 */
}

.card-header {
    font-size: 16px;
    font-weight: bold;
    margin-bottom: 10px;
}

.contact-phone {
    margin-left: 10px;
    color: #606266;
    font-size: 14px;
}

.address-detail {
    color: #303133;
    font-size: 14px;
    line-height: 1.5;
    height: 42px;
    /* 保持卡片高度一致 */
    overflow: hidden;
}

.card-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 15px;
    padding-top: 10px;
    border-top: 1px solid #ebeef5;
}

.actions {
    display: flex;
    gap: 10px;
}
</style>