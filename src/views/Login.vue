<template>
  <section class="login-page">
    <div class="promo-panel">
      <p class="eyebrow">HomeService</p>
      <h1>把家政预约、支付、履约、售后和运营分析串成一套完整系统。</h1>
      <ul>
        <li>客户端支持预约、模拟支付、进度追踪与售后反馈。</li>
        <li>服务人员端支持接单、沟通留言、服务进度上报。</li>
        <li>管理端支持数据分析、导出报表与操作日志审计。</li>
      </ul>
    </div>

    <el-card class="form-panel" shadow="never">
      <div class="form-head">
        <p>{{ isLogin ? 'Welcome back' : 'Create account' }}</p>
        <h2>{{ isLogin ? '登录平台' : '注册账号' }}</h2>
      </div>

      <el-form :model="formData" label-position="top">
        <el-form-item label="用户名">
          <el-input v-model="formData.username" placeholder="请输入用户名" clearable />
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="formData.password" type="password" placeholder="请输入密码" show-password />
        </el-form-item>
        <el-form-item v-if="!isLogin" label="注册角色">
          <el-radio-group v-model="formData.role">
            <el-radio :label="2">客户</el-radio>
            <el-radio :label="3">服务人员</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-button class="submit-btn" type="primary" @click="handleSubmit">
          {{ isLogin ? '登录并进入工作台' : '完成注册' }}
        </el-button>
        <el-button text class="switch-btn" @click="toggleMode">
          {{ isLogin ? '没有账号，去注册' : '已有账号，返回登录' }}
        </el-button>
      </el-form>
    </el-card>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { loginAPI, registerAPI } from '@/api/auth'
import { useUserStore } from '@/store/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const isLogin = ref(true)
const formData = ref({
  username: '',
  password: '',
  role: 2
})

const toggleMode = () => {
  isLogin.value = !isLogin.value
  formData.value = { username: '', password: '', role: 2 }
}

const handleSubmit = async () => {
  if (!formData.value.username || !formData.value.password) {
    ElMessage.warning('请填写完整账号和密码')
    return
  }

  if (isLogin.value) {
    const res = await loginAPI({
      username: formData.value.username,
      password: formData.value.password
    })
    if (res.code === 200) {
      userStore.setUserInfo(res.data)
      ElMessage.success('登录成功')
      router.push(route.query.redirect || '/home')
    } else {
      ElMessage.error(res.message)
    }
    return
  }

  const res = await registerAPI(formData.value)
  if (res.code === 200) {
    ElMessage.success('注册成功，请登录')
    isLogin.value = true
  } else {
    ElMessage.error(res.message)
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 1.2fr 0.88fr;
  background:
    radial-gradient(circle at top right, rgba(251, 191, 36, 0.22), transparent 28%),
    linear-gradient(135deg, #09203f 0%, #537895 100%);
}

.promo-panel,
.form-panel {
  padding: 48px;
}

.promo-panel {
  color: #fff;
  display: grid;
  align-content: center;
  gap: 20px;
}

.promo-panel h1 {
  margin: 0;
  font-size: clamp(38px, 6vw, 62px);
  line-height: 1.08;
  max-width: 760px;
}

.promo-panel ul {
  margin: 0;
  padding-left: 20px;
  line-height: 1.9;
  color: rgba(255, 255, 255, 0.86);
}

.eyebrow {
  margin: 0;
  color: #fcd34d;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  font-size: 12px;
}

.form-panel {
  margin: auto 32px auto 0;
  border-radius: 32px;
  max-width: 520px;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(16px);
}

.form-head p {
  margin: 0 0 6px;
  color: #0f766e;
}

.form-head h2 {
  margin: 0 0 24px;
  font-size: 32px;
}

.submit-btn,
.switch-btn {
  width: 100%;
}

.submit-btn {
  margin-top: 12px;
  height: 46px;
}

.switch-btn {
  margin-top: 10px;
}

@media (max-width: 960px) {
  .login-page {
    grid-template-columns: 1fr;
  }

  .form-panel {
    margin: 0 20px 20px;
    max-width: none;
  }
}
</style>
