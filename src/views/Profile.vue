<template>
    <div class="profile-container">
        <el-row :gutter="20">
            <el-col :span="8">
                <el-card class="box-card user-card" shadow="hover">
                    <div class="avatar-wrapper">
                        <el-avatar :size="100" class="user-avatar">
                            {{ username.charAt(0).toUpperCase() }}
                        </el-avatar>
                    </div>
                    <div class="user-info">
                        <h3>{{ username }}</h3>
                        <el-tag :type="roleTagType" effect="dark" round>
                            {{ roleName }}
                        </el-tag>
                    </div>
                    <el-divider />
                    <div class="user-details">
                        <p><strong>账号 ID：</strong> No. {{ userId }}</p>
                        <p><strong>注册时间：</strong> 刚刚</p>
                        <p><strong>账号状态：</strong> <el-tag type="success" size="small">正常</el-tag></p>
                    </div>
                </el-card>
            </el-col>

            <el-col :span="16">
                <el-card class="box-card" shadow="hover">
                    <el-tabs v-model="activeTab">

                        <el-tab-pane label="基本资料" name="info">
                            <el-empty description="暂无可编辑的扩展信息，功能开发中..." :image-size="120" />
                        </el-tab-pane>

                        <el-tab-pane label="安全设置 (修改密码)" name="security">
                            <el-form ref="pwdFormRef" :model="pwdForm" :rules="pwdRules" label-width="100px"
                                style="max-width: 400px; margin-top: 20px;">
                                <el-form-item label="原密码" prop="oldPassword">
                                    <el-input v-model="pwdForm.oldPassword" type="password" show-password
                                        placeholder="请输入当前密码" />
                                </el-form-item>

                                <el-form-item label="新密码" prop="newPassword">
                                    <el-input v-model="pwdForm.newPassword" type="password" show-password
                                        placeholder="请输入新密码 (不少于6位)" />
                                </el-form-item>

                                <el-form-item label="确认密码" prop="confirmPassword">
                                    <el-input v-model="pwdForm.confirmPassword" type="password" show-password
                                        placeholder="请再次输入新密码" />
                                </el-form-item>

                                <el-form-item>
                                    <el-button type="primary" @click="submitPasswordChange">确认修改密码</el-button>
                                    <el-button @click="resetForm">重置</el-button>
                                </el-form-item>
                            </el-form>
                        </el-tab-pane>

                    </el-tabs>
                </el-card>
            </el-col>
        </el-row>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '../utils/request'

const router = useRouter()

// 从本地存储拿取用户信息
const username = ref(localStorage.getItem('username') || '未知用户')
const role = ref(localStorage.getItem('role'))
const userId = ref(localStorage.getItem('userId'))

const activeTab = ref('security')
const pwdFormRef = ref(null)

// 动态角色和标签颜色 (复用 Home.vue 的逻辑)
const roleName = computed(() => {
    if (role.value === '1') return '管理员'
    if (role.value === '2') return '尊贵客户'
    if (role.value === '3') return '金牌师傅'
    return '未知角色'
})
const roleTagType = computed(() => {
    if (role.value === '1') return 'danger'
    if (role.value === '2') return 'primary'
    if (role.value === '3') return 'success'
    return 'info'
})

// 密码表单数据
const pwdForm = ref({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
})

// 密码校验规则 (核心业务逻辑)
const validateConfirmPwd = (rule, value, callback) => {
    if (value !== pwdForm.value.newPassword) {
        callback(new Error('两次输入的新密码不一致!'))
    } else {
        callback()
    }
}

const pwdRules = ref({
    oldPassword: [{ required: true, message: '请输入原密码', trigger: 'blur' }],
    newPassword: [
        { required: true, message: '请输入新密码', trigger: 'blur' },
        { min: 6, message: '密码长度不能小于 6 位', trigger: 'blur' }
    ],
    confirmPassword: [
        { required: true, message: '请确认新密码', trigger: 'blur' },
        { validator: validateConfirmPwd, trigger: 'blur' }
    ]
})

// 提交密码修改
const submitPasswordChange = () => {
    pwdFormRef.value.validate(async (valid) => {
        if (valid) {
            try {
                const res = await request.put(`/users/${userId.value}/password?oldPassword=${pwdForm.value.oldPassword}&newPassword=${pwdForm.value.newPassword}`)
                if (res.code === 200) {
                    ElMessageBox.alert('密码修改成功，请使用新密码重新登录！', '系统提示', {
                        confirmButtonText: '去登录',
                        type: 'success',
                        callback: () => {
                            localStorage.clear() // 清空失效的 token
                            router.push('/login') // 强制踢回登录页
                        }
                    })
                } else {
                    ElMessage.error(res.message) // 比如：原密码错误
                }
            } catch (error) {
                console.error('修改异常', error)
            }
        }
    })
}

const resetForm = () => {
    pwdFormRef.value.resetFields()
}
</script>

<style scoped>
.profile-container {
    padding: 10px;
}

.box-card {
    border-radius: 8px;
    border: none;
}

.user-card {
    text-align: center;
    padding-bottom: 20px;
}

.avatar-wrapper {
    margin: 20px 0;
}

.user-avatar {
    background: linear-gradient(135deg, #409EFF, #79bbff);
    font-size: 40px;
    color: white;
    font-weight: bold;
}

.user-info h3 {
    margin: 10px 0;
    color: #303133;
}

.user-details {
    text-align: left;
    padding: 0 20px;
    color: #606266;
    font-size: 14px;
    line-height: 1.8;
}
</style>