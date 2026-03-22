<template>
    <div class="audit-manage-container">
        <el-card shadow="hover" class="box-card">
            <template #header>
                <div class="card-header">
                    <span style="font-weight: bold; font-size: 16px;">🛡️ 师傅资质审核中心</span>
                    <el-button type="primary" plain @click="fetchProfessionals" icon="Refresh">刷新列表</el-button>
                </div>
            </template>

            <el-table :data="proList" border stripe style="width: 100%" v-loading="loading">
                <el-table-column prop="id" label="档案ID" width="80" align="center" />
                <el-table-column prop="fullName" label="师傅姓名" width="120" align="center">
                    <template #default="scope">
                        <strong>{{ scope.row.fullName || '未填' }}</strong>
                    </template>
                </el-table-column>
                <el-table-column label="主营服务ID" prop="serviceId" width="100" align="center" />
                <el-table-column label="从业经验" width="100" align="center">
                    <template #default="scope">{{ scope.row.experienceYears }} 年</template>
                </el-table-column>
                <el-table-column prop="address" label="常驻地址" min-width="180" />

                <el-table-column label="资质证明 (点击放大)" width="150" align="center">
                    <template #default="scope">
                        <el-image v-if="scope.row.certFileUrl" style="width: 60px; height: 60px; border-radius: 4px;"
                            :src="scope.row.certFileUrl" :preview-src-list="[scope.row.certFileUrl]" preview-teleported
                            fit="cover" />
                        <span v-else style="color: #909399; font-size: 12px;">未上传</span>
                    </template>
                </el-table-column>

                <el-table-column label="审核状态" width="120" align="center">
                    <template #default="scope">
                        <el-tag v-if="scope.row.auditStatus === 0" type="warning" effect="dark">待审核</el-tag>
                        <el-tag v-else-if="scope.row.auditStatus === 1" type="success">已通过</el-tag>
                        <el-tag v-else-if="scope.row.auditStatus === 2" type="danger">已驳回</el-tag>
                    </template>
                </el-table-column>

                <el-table-column label="审批操作" width="180" align="center" fixed="right">
                    <template #default="scope">
                        <template v-if="scope.row.auditStatus === 0">
                            <el-button type="success" size="small" @click="handleAudit(scope.row.id, 1)">通过</el-button>
                            <el-popconfirm title="确定要驳回该师傅的入驻申请吗？" @confirm="handleAudit(scope.row.id, 2)">
                                <template #reference>
                                    <el-button type="danger" size="small">驳回</el-button>
                                </template>
                            </el-popconfirm>
                        </template>
                        <span v-else style="color: #c0c4cc; font-size: 13px;">已处理完毕</span>
                    </template>
                </el-table-column>
            </el-table>
        </el-card>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getProfessionalsAdminAPI, auditProfessionalAPI } from '../api/profile'

const proList = ref([])
const loading = ref(false)

onMounted(() => {
    fetchProfessionals()
})

// 拉取所有师傅档案
const fetchProfessionals = async () => {
    loading.value = true
    try {
        const res = await getProfessionalsAdminAPI()
        if (res.code === 200) {
            proList.value = res.data
        }
    } catch (error) {
        console.error('获取列表失败', error)
    } finally {
        loading.value = false
    }
}

// 提交审批结果 (1-通过, 2-驳回)
const handleAudit = async (id, status) => {
    try {
        const res = await auditProfessionalAPI(id, status)
        if (res.code === 200) {
            ElMessage.success(res.message)
            fetchProfessionals() // 刷新列表
        } else {
            ElMessage.error(res.message)
        }
    } catch (error) {
        console.error('审批异常', error)
    }
}
</script>

<style scoped>
.audit-manage-container {
    padding: 10px;
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}
</style>