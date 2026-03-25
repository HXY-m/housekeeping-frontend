<template>
  <div class="landing-page">
    <header class="navbar">
      <div>
        <p class="eyebrow">HomeService</p>
        <h1>家政服务预约与运营管理平台</h1>
      </div>
      <div class="nav-actions">
        <el-button plain @click="$router.push('/login')">登录 / 注册</el-button>
        <el-button type="primary" @click="$router.push('/login')">开始体验</el-button>
      </div>
    </header>

    <section class="hero">
      <div>
        <p class="eyebrow">Full Workflow</p>
        <h2>从预约、支付、接单、沟通到售后与报表，一套系统完整闭环。</h2>
        <p>
          面向毕业设计与课程项目场景，系统同时覆盖客户、服务人员与管理员三类角色，
          强调订单协同、服务透明化和运营分析。
        </p>
        <div class="hero-actions">
          <el-button size="large" type="primary" @click="$router.push('/login')">立即预约</el-button>
          <el-button size="large" plain @click="$router.push('/login')">服务人员入驻</el-button>
        </div>
      </div>
      <div class="hero-card">
        <div>
          <span>3 角色协同</span>
          <strong>客户 / 服务人员 / 管理员</strong>
        </div>
        <div>
          <span>4 条核心链路</span>
          <strong>预约、履约、售后、分析</strong>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="section-title">
        <p class="eyebrow">Services</p>
        <h3>服务目录</h3>
      </div>
      <div class="service-grid" v-loading="loadingServices">
        <el-card v-for="service in serviceList" :key="service.id" shadow="hover" class="service-card">
          <p>服务项目</p>
          <h4>{{ service.serviceName }}</h4>
          <span>{{ service.description || '标准化上门服务，支持预约与进度追踪。' }}</span>
          <strong>¥ {{ service.basePrice }}</strong>
        </el-card>
      </div>
    </section>

    <section class="section soft">
      <div class="section-title">
        <p class="eyebrow">Professionals</p>
        <h3>优选服务人员</h3>
      </div>
      <div class="pro-grid" v-loading="loadingPros">
        <el-card v-for="pro in professionalList" :key="pro.id" shadow="hover" class="pro-card">
          <el-avatar :size="72">{{ pro.fullName?.charAt(0) || 'P' }}</el-avatar>
          <h4>{{ pro.fullName }}</h4>
          <p>{{ pro.address || '服务范围待完善' }}</p>
          <div class="pro-tags">
            <el-tag round>{{ pro.experienceYears }} 年经验</el-tag>
            <el-tag round type="success">评分 {{ pro.rating || 5 }}</el-tag>
          </div>
        </el-card>
      </div>
    </section>

    <section class="section trust">
      <el-card shadow="never">
        <div class="trust-grid">
          <div>
            <p class="eyebrow">Trust</p>
            <h3>为什么适合论文展示</h3>
          </div>
          <ul>
            <li>支持 JWT 鉴权与角色隔离。</li>
            <li>支持订单进度、沟通留言和售后闭环。</li>
            <li>支持统计看板、导出报表与操作日志。</li>
          </ul>
        </div>
      </el-card>
    </section>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import request from '@/utils/request'

const serviceList = ref([])
const professionalList = ref([])
const loadingServices = ref(false)
const loadingPros = ref(false)

const fetchPublicServices = async () => {
  loadingServices.value = true
  try {
    const res = await request.get('/services')
    if (res.code === 200) {
      serviceList.value = res.data
    }
  } finally {
    loadingServices.value = false
  }
}

const fetchPublicProfessionals = async () => {
  loadingPros.value = true
  try {
    const res = await request.get('/professional/public/recommend')
    if (res.code === 200) {
      professionalList.value = res.data
    }
  } finally {
    loadingPros.value = false
  }
}

onMounted(() => {
  fetchPublicServices()
  fetchPublicProfessionals()
})
</script>

<style scoped>
.landing-page {
  min-height: 100vh;
  padding: 28px;
  background:
    radial-gradient(circle at top left, rgba(16, 185, 129, 0.16), transparent 22%),
    linear-gradient(180deg, #fffdf7 0%, #eef8ff 100%);
}

.navbar,
.hero,
.section {
  max-width: 1240px;
  margin: 0 auto 28px;
}

.navbar {
  display: flex;
  justify-content: space-between;
  gap: 18px;
  align-items: center;
}

.navbar h1 {
  margin: 8px 0 0;
  font-size: 24px;
}

.nav-actions {
  display: flex;
  gap: 12px;
}

.eyebrow {
  margin: 0;
  color: #0f766e;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  font-size: 12px;
}

.hero {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 18px;
}

.hero > div {
  padding: 34px;
  border-radius: 32px;
}

.hero > div:first-child {
  background: linear-gradient(135deg, #0f766e, #134e4a);
  color: #fff;
}

.hero h2 {
  margin: 10px 0 18px;
  font-size: clamp(38px, 5vw, 60px);
  line-height: 1.06;
}

.hero p:last-of-type {
  margin: 0;
  line-height: 1.8;
}

.hero-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
}

.hero-card {
  display: grid;
  gap: 16px;
  background: linear-gradient(180deg, #fff 0%, #f8fafc 100%);
  border: 1px solid rgba(15, 23, 42, 0.08);
}

.hero-card div {
  padding: 18px;
  border-radius: 20px;
  background: #f8fafc;
}

.hero-card span {
  color: #64748b;
  font-size: 14px;
}

.hero-card strong {
  display: block;
  margin-top: 8px;
  font-size: 22px;
}

.section-title {
  margin-bottom: 18px;
}

.section-title h3 {
  margin: 8px 0 0;
  font-size: 28px;
}

.service-grid,
.pro-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 18px;
}

.service-card,
.pro-card {
  border-radius: 24px;
}

.service-card p,
.pro-card p {
  margin: 0 0 10px;
  color: #0f766e;
}

.service-card h4,
.pro-card h4 {
  margin: 0 0 8px;
}

.service-card span,
.pro-card span {
  color: #64748b;
  line-height: 1.6;
}

.service-card strong {
  display: block;
  margin-top: 18px;
  font-size: 24px;
}

.soft .pro-card {
  text-align: center;
}

.pro-tags {
  display: flex;
  gap: 8px;
  justify-content: center;
  margin-top: 14px;
  flex-wrap: wrap;
}

.trust-grid {
  display: grid;
  grid-template-columns: 0.7fr 1fr;
  gap: 18px;
  align-items: center;
}

.trust ul {
  margin: 0;
  padding-left: 20px;
  line-height: 2;
}

@media (max-width: 900px) {
  .hero,
  .trust-grid,
  .navbar {
    grid-template-columns: 1fr;
    display: grid;
  }

  .nav-actions,
  .hero-actions {
    flex-wrap: wrap;
  }
}
</style>
