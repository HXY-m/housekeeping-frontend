<template>
    <div class="manage-container">
        <div class="header-action">
            <h2 style="margin: 0; color: #303133;">用户账号管理</h2>
            <el-radio-group v-model="roleFilter" @change="fetchUsers">
                <el-radio-button label="">全部用户</el-radio-button>
                <el-radio-button label="2">客户</el-radio-button>
                <el-radio-button label="3">服务师傅</el-radio-button>
            </el-radio-group>
        </div>

        <el-table :data="userList" border stripe style="width: 100%; margin-top: 20px;">
            <el-table-column prop="id" label="用户ID" width="80" align="center" />
            <el-table-column prop="username" label="登录账号" />

            <el-table-column label="角色身份" width="120" align="center">
                <template #default="scope">
                    <el-tag v-if="scope.row.role === 1" type="danger">管理员</el-tag>
                    <el-tag v-else-if="scope.row.role === 2" type="success">客户</el-tag>
                    <el-tag v-else-if="scope.row.role === 3" type="warning">服务师傅</el-tag>
                </template>
            </el-table-column>

            <el-table-column label="注册时间" width="180" align="center">
                <template #default="scope">
                    {{ formatTime(scope.row.createTime) }}
                </template>
            </el-table-column>

            <el-table-column label="账号状态" width="150" align="center">
                <template #default="scope">
                    <el-switch v-if="scope.row.role !== 1" v-model="scope.row.status" :active-value="1"
                        :inactive-value="0" active-text="正常" inactive-text="封禁" inline-prompt
                        style="--el-switch-on-color: #13ce66; --el-switch-off-color: #ff4949"
                        @change="(val) => handleStatusChange(scope.row.id, val)" />
                    <span v-else style="color: #999; font-size: 12px;">系统保护</span>
                </template>
            </el-table-column>

            <el-table-column label="危险操作" width="120" align="center">
                <template #default="scope">
                    <el-button v-if="scope.row.role !== 1" size="small" type="danger" plain
                        @click="handleDelete(scope.row.id)">
                        注销账号
                    </el-button>
                </template>
            </el-table-column>
        </el-table>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '../utils/request'

const userList = ref([])
const roleFilter = ref('') // 绑定的单选框值

onMounted(() => {
    fetchUsers()
})

// 1. 获取用户列表 (带角色过滤参数)
const fetchUsers = async () => {
    try {
        // 如果 roleFilter 有值，就拼在 URL 后面发给后端
        const url = roleFilter.value ? `/users?role=${roleFilter.value}` : '/users'
        const res = await request.get(url)
        if (res.code === 200) {
            userList.value = res.data
        }
    } catch (error) {
        ElMessage.error('获取用户列表失败')
    }
}

// 2. 切换封禁状态
const handleStatusChange = async (userId, newStatus) => {
    try {
        // 调用后端的 PATCH 接口更新状态
        const res = await request.patch(`/users/${userId}/status?status=${newStatus}`)
        if (res.code === 200) {
            ElMessage.success(newStatus === 1 ? '账号已解封' : '账号已封禁')
        } else {
            // 如果后端报错，为了严谨，我们要把页面的开关再弹回去
            ElMessage.error(res.message)
            fetchUsers()
        }
    } catch (error) {
        fetchUsers()
    }
}

// 3. 注销删除账号
const handleDelete = (id) => {
    ElMessageBox.confirm(
        '此操作将永久注销该账号且不可恢复，是否继续？',
        '极度危险警告',
        { confirmButtonText: '狠心注销', cancelButtonText: '手下留情', type: 'error' }
    ).then(async () => {
        try {
            const res = await request.delete(`/users/${id}`)
            if (res.code === 200) {
                ElMessage.success('账号已从地球上抹除')
                fetchUsers() // 刷新列表
            }
        } catch (error) {
            console.error(error)
        }
    }).catch(() => { })
}

// 时间格式化小工具
const formatTime = (timeStr) => {
    if (!timeStr) return '-'
    return timeStr.replace('T', ' ').substring(0, 19)
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