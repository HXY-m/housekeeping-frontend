<template>
    <div class="landing-container">
        <header class="navbar">
            <div class="logo">
                <el-icon class="logo-icon">
                    <House />
                </el-icon>
                <span>Euler 家政服务平台</span>
            </div>
            <div class="nav-actions">
                <el-button type="primary" plain round @click="$router.push('/login')">登录 / 注册</el-button>
                <el-button type="primary" round @click="$router.push('/login')">师傅入驻</el-button>
            </div>
        </header>

        <section class="hero-section">
            <div class="hero-content">
                <h1 class="title">专业、便捷、放心的到家服务</h1>
                <p class="subtitle">严格甄选金牌师傅，全方位保障服务质量，让您的生活更轻松、更美好。</p>
                <el-button type="primary" size="large" round class="action-btn" @click="$router.push('/login')">
                    立即预约体验
                </el-button>
            </div>
        </section>

        <section class="services-section">
            <h2 class="section-title">我们的服务</h2>
            <p class="section-desc">涵盖您生活中的方方面面</p>

            <div v-loading="loadingServices">
                <el-row :gutter="30" class="service-grid">
                    <el-col :span="6" v-for="service in serviceList" :key="service.id" class="service-col">
                        <el-card shadow="hover" class="service-card" @click="handleActionClick">
                            <div class="service-icon-wrapper">
                                <el-icon class="service-icon">
                                    <Service />
                                </el-icon>
                            </div>
                            <h3 class="service-name">{{ service.serviceName }}</h3>
                            <p class="service-desc">{{ service.description || '提供优质的专业服务，解决您的烦恼。' }}</p>
                            <div class="service-price">
                                指导价 <span>¥ {{ service.basePrice }}</span> 起
                            </div>
                        </el-card>
                    </el-col>
                </el-row>
                <el-empty v-if="serviceList.length === 0 && !loadingServices" description="平台服务正在上架中..." />
            </div>
        </section>

        <section class="professionals-section">
            <h2 class="section-title">严选金牌师傅</h2>
            <p class="section-desc">实名认证 · 技能考核 · 真实评价</p>

            <div v-loading="loadingPros">
                <el-row :gutter="30" class="pro-grid">
                    <el-col :span="6" v-for="pro in professionalList" :key="pro.id" class="pro-col">
                        <el-card shadow="hover" class="pro-card" @click="handleActionClick">
                            <div class="pro-avatar-wrapper">
                                <el-avatar :size="80" :src="pro.certFileUrl" class="pro-avatar">
                                    {{ pro.fullName?.charAt(0) }}
                                </el-avatar>
                            </div>
                            <h3 class="pro-name">{{ pro.fullName }} 师傅</h3>

                            <div class="pro-tags">
                                <el-tag size="small" type="success" effect="plain" round>{{ pro.experienceYears }}
                                    年经验</el-tag>
                                <el-tag size="small" type="warning" effect="dark" round
                                    style="margin-left: 8px;">平台认证</el-tag>
                            </div>

                            <div class="pro-rating">
                                <el-rate v-model="pro.rating" disabled show-score text-color="#ff9900"
                                    score-template="{value} 分" />
                            </div>
                            <p class="pro-address"><el-icon>
                                    <Location />
                                </el-icon> 常驻：{{ pro.address }}</p>
                        </el-card>
                    </el-col>
                </el-row>
                <el-empty v-if="professionalList.length === 0 && !loadingPros" description="优质师傅正在招募中..." />
            </div>
        </section>

        <footer class="footer">
            <p>© 2026 Euler Housekeeping Service. All rights reserved.</p>
        </footer>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { House, Service, Location } from '@element-plus/icons-vue' // 新增了 Location 图标
import request from '../utils/request'
import { ElMessage } from 'element-plus'

const router = useRouter()
const serviceList = ref([])
const professionalList = ref([]) // 师傅列表
const loadingServices = ref(false)
const loadingPros = ref(false)   // 师傅加载状态

// 获取公开的服务列表
const fetchPublicServices = async () => {
    loadingServices.value = true
    try {
        const res = await request.get('/services')
        if (res.code === 200) serviceList.value = res.data
    } catch (error) {
        console.error('获取服务失败', error)
    } finally {
        loadingServices.value = false
    }
}

// 【新增】：获取推荐师傅列表
const fetchPublicProfessionals = async () => {
    loadingPros.value = true
    try {
        const res = await request.get('/professional/public/recommend')
        if (res.code === 200) professionalList.value = res.data
    } catch (error) {
        console.error('获取推荐师傅失败', error)
    } finally {
        loadingPros.value = false
    }
}

onMounted(() => {
    fetchPublicServices()
    fetchPublicProfessionals() // 页面加载时同时获取
})

// 统一的未登录拦截点击事件
const handleActionClick = () => {
    ElMessage.warning('请先登录后体验更多专属功能哦~')
    router.push('/login')
}
</script>

<style scoped>
.landing-container {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background-color: #f8f9fa;
}

/* 导航与横幅 */
.navbar {
    height: 70px;
    background-color: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 10%;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
    position: sticky;
    top: 0;
    z-index: 100;
}

.logo {
    display: flex;
    align-items: center;
    font-size: 22px;
    font-weight: bold;
    color: #409EFF;
}

.logo-icon {
    font-size: 28px;
    margin-right: 10px;
}

.hero-section {
    height: 500px;
    background: linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%);
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;
    color: white;
    padding: 0 20px;
}

.hero-content {
    max-width: 800px;
}

.hero-content .title {
    font-size: 48px;
    margin-bottom: 20px;
    font-weight: 800;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.hero-content .subtitle {
    font-size: 18px;
    margin-bottom: 40px;
    opacity: 0.9;
    line-height: 1.6;
}

.action-btn {
    font-size: 18px;
    padding: 12px 30px;
    height: auto;
    box-shadow: 0 4px 15px rgba(64, 158, 255, 0.4);
}

/* 公共区块标题 */
.section-title {
    text-align: center;
    font-size: 32px;
    color: #303133;
    margin-bottom: 10px;
}

.section-desc {
    text-align: center;
    color: #909399;
    margin-bottom: 50px;
    font-size: 16px;
}

/* 服务区 */
.services-section {
    padding: 60px 10%;
    background-color: #fff;
}

.service-col {
    margin-bottom: 30px;
}

.service-card {
    text-align: center;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.3s;
    height: 100%;
    border: none;
    background: #fdfdfd;
}

.service-card:hover {
    transform: translateY(-10px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.08) !important;
}

.service-icon-wrapper {
    width: 60px;
    height: 60px;
    background-color: #ecf5ff;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 0 auto 20px;
}

.service-icon {
    font-size: 30px;
    color: #409EFF;
}

.service-name {
    font-size: 18px;
    margin: 0 0 10px;
    color: #303133;
}

.service-desc {
    font-size: 13px;
    color: #909399;
    margin-bottom: 20px;
    line-height: 1.5;
}

.service-price {
    font-size: 14px;
    color: #606266;
}

.service-price span {
    color: #F56C6C;
    font-size: 20px;
    font-weight: bold;
}

/* 师傅展示区 (新增) */
.professionals-section {
    padding: 60px 10%;
    background-color: #f8f9fa;
}

.pro-col {
    margin-bottom: 30px;
}

.pro-card {
    text-align: center;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.3s;
    border: none;
    height: 100%;
}

.pro-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1) !important;
}

.pro-avatar-wrapper {
    margin-bottom: 15px;
    display: flex;
    justify-content: center;
}

.pro-avatar {
    border: 2px solid #fff;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    font-size: 30px;
    background: #a0cfff;
}

.pro-name {
    font-size: 18px;
    font-weight: bold;
    color: #303133;
    margin: 0 0 10px;
}

.pro-tags {
    margin-bottom: 15px;
}

.pro-rating {
    margin-bottom: 15px;
    display: flex;
    justify-content: center;
}

.pro-address {
    font-size: 13px;
    color: #909399;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
    margin: 0;
}

/* 页脚 */
.footer {
    text-align: center;
    padding: 30px 0;
    background-color: #2c3e50;
    color: #95a5a6;
    font-size: 14px;
}
</style>