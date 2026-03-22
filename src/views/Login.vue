<template>
    <div class="login-container">
        <el-card class="login-card" shadow="always">
            <h2 class="title">{{ isLogin ? '家政服务平台登录' : '注册新账号' }}</h2>

            <el-form :model="formData" label-position="top">
                <el-form-item label="账号">
                    <el-input v-model="formData.username" placeholder="请输入用户名" clearable />
                </el-form-item>

                <el-form-item label="密码">
                    <el-input v-model="formData.password" type="password" placeholder="请输入密码" show-password />
                </el-form-item>

                <el-form-item label="您的身份" v-if="!isLogin">
                    <el-radio-group v-model="formData.role">
                        <el-radio :label="2">我要找服务 (客户)</el-radio>
                        <el-radio :label="3">我要接单赚收益 (师傅)</el-radio>
                    </el-radio-group>
                </el-form-item>

                <el-button type="primary" class="submit-btn" @click="handleSubmit">
                    {{ isLogin ? '立 即 登 录' : '立 即 注 册' }}
                </el-button>

                <div class="toggle-text">
                    <span v-if="isLogin">还没有账号？ <a href="#" @click.prevent="toggleMode">去注册</a></span>
                    <span v-else>已有账号？ <a href="#" @click.prevent="toggleMode">返回登录</a></span>
                </div>
            </el-form>
        </el-card>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import request from '../utils/request'
import { loginAPI, registerAPI } from '../api/auth'
// 【新增】：引入刚才建好的 Store
import { useUserStore } from '../store/user'
const userStore = useUserStore()

const router = useRouter()
const isLogin = ref(true) // 控制当前是登录表单还是注册表单

// 表单数据绑定
const formData = ref({
    username: '',
    password: '',
    role: 2 // 默认选中客户角色
})

// 切换登录/注册模式
const toggleMode = () => {
    isLogin.value = !isLogin.value
    formData.value = { username: '', password: '', role: 2 } // 切换时清空表单
}

// 统一的提交处理逻辑
const handleSubmit = async () => {
    // 1. 前端基础非空校验
    if (!formData.value.username || !formData.value.password) {
        ElMessage.warning('请填写完整的账号和密码')
        return
    }

    try {
        if (isLogin.value) {
            // ==========================================
            // 【登录分支】
            // ==========================================
            const res = await loginAPI({
                username: formData.value.username,
                password: formData.value.password
            })

            if (res.code === 200) {
                ElMessage.success('登录成功')

                // 保存 Token 和用户信息到本地缓存
                userStore.setUserInfo(res.data)

                // 【防坑核心】：强制转换为数字，防止后端传来的字符串 "1" 导致 === 匹配失败！
                const userRole = Number(userStore.userRole)

                // 根据不同角色跳转到专属的首页
                // 登录成功后，无论是什么角色，统一跳到基座路由
                router.push('/home')

            } else {
                ElMessage.error(res.message)
            }

        } else {
            // ==========================================
            // 【注册分支】
            // ==========================================
            const res = await registerAPI(formData.value)

            if (res.code === 200) {
                ElMessage.success('注册成功，请使用新账号登录！')
                isLogin.value = true // 注册成功后，自动丝滑切回登录界面
            } else {
                ElMessage.error(res.message) // 显示用户名重复等报错信息
            }
        }
    } catch (error) {
        console.error('网络或服务器异常', error)
    }
}
</script>

<style scoped>
.login-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    /* 科技感渐变背景 */
    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.login-card {
    width: 400px;
    padding: 20px;
    border-radius: 12px;
}

.title {
    text-align: center;
    margin-bottom: 30px;
    color: #303133;
}

.submit-btn {
    width: 100%;
    margin-top: 10px;
    font-size: 16px;
    height: 40px;
}

.toggle-text {
    text-align: center;
    margin-top: 20px;
    font-size: 14px;
    color: #606266;
}

.toggle-text a {
    color: #409EFF;
    text-decoration: none;
}

.toggle-text a:hover {
    text-decoration: underline;
}
</style>