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
                        <el-tag :type="roleTagType" effect="dark" round>{{ roleName }}</el-tag>
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

                            <el-form v-if="role === '2'" :model="profileForm" label-width="100px"
                                style="max-width: 500px; margin-top: 20px;" v-loading="loading">
                                <el-form-item label="真实姓名">
                                    <el-input v-model="profileForm.fullName" placeholder="请输入您的真实姓名" />
                                </el-form-item>
                                <el-form-item label="联系电话">
                                    <el-input v-model="profileForm.phone" placeholder="请输入您的手机号码" maxlength="11" />
                                </el-form-item>
                                <el-form-item>
                                    <el-button type="primary" @click="saveProfileInfo" icon="Check">保存资料</el-button>
                                </el-form-item>
                            </el-form>

                            <el-form v-if="role === '3'" :model="profileForm" label-width="120px"
                                style="max-width: 500px; margin-top: 20px;" v-loading="loading">
                                <el-form-item label="审核状态">
                                    <el-tag v-if="profileForm.auditStatus === 1" type="success">已通过认证</el-tag>
                                    <el-tag v-else-if="profileForm.auditStatus === 2" type="danger">审核被拒</el-tag>
                                    <el-tag v-else type="warning">待平台审核</el-tag>
                                </el-form-item>
                                <el-form-item label="综合评分">
                                    <el-rate v-model="profileRating" disabled show-score text-color="#ff9900"
                                        score-template="{value} 分" />
                                </el-form-item>

                                <el-divider border-style="dashed" />

                                <el-form-item label="师傅姓名">
                                    <el-input v-model="profileForm.fullName" placeholder="请输入您的真实姓名" />
                                </el-form-item>
                                <el-form-item label="核心服务ID">
                                    <el-input-number v-model="profileForm.serviceId" :min="1"
                                        placeholder="请填写您主营的服务项目ID" style="width: 100%;" />
                                </el-form-item>
                                <el-form-item label="从业经验(年)">
                                    <el-input-number v-model="profileForm.experienceYears" :min="0" :max="50"
                                        style="width: 100%;" />
                                </el-form-item>
                                <el-form-item label="常驻地址">
                                    <el-input v-model="profileForm.address" placeholder="如：北京市朝阳区xx街道" />
                                </el-form-item>
                                <el-form-item label="服务辐射邮编">
                                    <el-input v-model="profileForm.pinCode" placeholder="如：100000" maxlength="6" />
                                </el-form-item>
                                <el-form-item>
                                    <el-button type="primary" @click="saveProfileInfo" icon="Check">提交资质申请</el-button>
                                </el-form-item>
                            </el-form>

                            <el-empty v-if="role === '1'" description="超级管理员无需填写业务资料，您拥有最高权限。" />

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
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '../store/user'
// 【改动点 1】：引入刚刚封装好的 API 接口
import {
    getCustomerProfileAPI,
    saveCustomerProfileAPI,
    getProfessionalProfileAPI,
    saveProfessionalProfileAPI,
    updatePasswordAPI
} from '../api/profile'

const router = useRouter()
const userStore = useUserStore()

const username = ref(userStore.username || '未知用户')
const role = ref(userStore.userRole)
const userId = ref(userStore.userId)

const activeTab = ref('info') // 默认打开基本资料页
const loading = ref(false)

// 角色展示逻辑
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

// ===================== 基本资料业务逻辑 =====================
const profileForm = ref({
    userId: userId.value,
    serviceId: 1,
    experienceYears: 0,
    auditStatus: 0,
    rating: 5.0
})

const profileRating = computed(() => Number(profileForm.value.rating) || 5.0)

// 页面加载时拉取资料
onMounted(async () => {
    if (role.value === '1') return // 管理员没有业务资料卡

    loading.value = true
    try {
        // 【改动点 2】：使用封装的 API 根据角色获取资料
        const res = role.value === '2'
            ? await getCustomerProfileAPI(userId.value)
            : await getProfessionalProfileAPI(userId.value)

        if (res.code === 200 && res.data) {
            profileForm.value = res.data
        }
    } catch (error) {
        console.error('获取资料失败', error)
    } finally {
        loading.value = false
    }
})

// 保存资料
const saveProfileInfo = async () => {
    try {
        // 【改动点 3】：使用封装的 API 根据角色保存资料
        const res = role.value === '2'
            ? await saveCustomerProfileAPI(profileForm.value)
            : await saveProfessionalProfileAPI(profileForm.value)

        if (res.code === 200) {
            ElMessage.success(res.message)
        } else {
            ElMessage.error(res.message)
        }
    } catch (error) {
        console.error('保存资料异常', error)
    }
}

// ===================== 密码修改业务逻辑 =====================
const pwdFormRef = ref(null)
const pwdForm = ref({ oldPassword: '', newPassword: '', confirmPassword: '' })

const validateConfirmPwd = (rule, value, callback) => {
    if (value !== pwdForm.value.newPassword) callback(new Error('两次输入的新密码不一致!'))
    else callback()
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

const submitPasswordChange = () => {
    pwdFormRef.value.validate(async (valid) => {
        if (valid) {
            try {
                // 【改动点 4】：使用封装的 API 修改密码
                const res = await updatePasswordAPI(
                    userId.value,
                    pwdForm.value.oldPassword,
                    pwdForm.value.newPassword
                )

                if (res.code === 200) {
                    ElMessageBox.alert('密码修改成功，请使用新密码重新登录！', '系统提示', {
                        confirmButtonText: '去登录',
                        type: 'success',
                        callback: () => {
                            userStore.clearUserInfo()
                            router.push('/login')
                        }
                    })
                } else {
                    ElMessage.error(res.message)
                }
            } catch (error) {
                console.error('修改异常', error)
            }
        }
    })
}

const resetForm = () => pwdFormRef.value.resetFields()
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