<template>
    <div class="dashboard-container">
        <h2 style="margin-bottom: 20px; color: #303133;">平台数据运营中心</h2>

        <el-row :gutter="20" class="data-cards">
            <el-col :span="6">
                <el-card shadow="hover" class="data-card bg-blue">
                    <div class="title">总订单量</div>
                    <div class="number">{{ dashboardData.totalOrders }}</div>
                </el-card>
            </el-col>
            <el-col :span="6">
                <el-card shadow="hover" class="data-card bg-green">
                    <div class="title">平台注册客户</div>
                    <div class="number">{{ dashboardData.customerCount }}</div>
                </el-card>
            </el-col>
            <el-col :span="6">
                <el-card shadow="hover" class="data-card bg-orange">
                    <div class="title">入驻服务师傅</div>
                    <div class="number">{{ dashboardData.proCount }}</div>
                </el-card>
            </el-col>
            <el-col :span="6">
                <el-card shadow="hover" class="data-card bg-purple">
                    <div class="title">累计流水 (元)</div>
                    <div class="number">¥ {{ dashboardData.totalRevenue }}</div>
                </el-card>
            </el-col>
        </el-row>

        <el-row :gutter="20" style="margin-top: 20px;">
            <el-col :span="12">
                <el-card shadow="hover">
                    <template #header>
                        <div class="card-header">近七日订单趋势</div>
                    </template>
                    <div ref="lineChartRef" style="height: 300px; width: 100%;"></div>
                </el-card>
            </el-col>
            <el-col :span="12">
                <el-card shadow="hover">
                    <template #header>
                        <div class="card-header">服务类目预约占比</div>
                    </template>
                    <div ref="pieChartRef" style="height: 300px; width: 100%;"></div>
                </el-card>
            </el-col>
        </el-row>
    </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import * as echarts from 'echarts'
import request from '../utils/request'

// 图表 DOM 引用
const lineChartRef = ref(null)
const pieChartRef = ref(null)

// 大盘响应式数据，初始值为 0
const dashboardData = ref({
    totalOrders: 0,
    customerCount: 0,
    proCount: 0,
    totalRevenue: 0
})

onMounted(() => {
    fetchDashboardData()
})

// 核心：获取数据并安全渲染
const fetchDashboardData = async () => {
    try {
        const res = await request.get('/statistics/dashboard')
        if (res.code === 200) {
            // 1. 赋值数据渲染上方卡片
            dashboardData.value = res.data

            // 2. 极其关键：等待 Vue 将新数据完全更新到真实的 DOM 上
            await nextTick()

            // 3. 安全初始化图表
            if (lineChartRef.value && pieChartRef.value) {
                initLineChart(res.data.trendDates, res.data.trendData)
                initPieChart(res.data.pieData)
            } else {
                console.warn('ECharts DOM 尚未就绪，跳过渲染')
            }
        }
    } catch (error) {
        console.error('获取大盘数据失败', error)
    }
}

// 初始化折线图
const initLineChart = (dates, data) => {
    const dom = lineChartRef.value
    // 防弹衣 1：确保 DOM 存在，且必须是纯正的 HTML 元素 (nodeType === 1)
    if (!dom || dom.nodeType !== 1) return

    // 防弹衣 2：如果图表已经存在，先销毁它，防止重复渲染报错
    let chart = echarts.getInstanceByDom(dom)
    if (chart) {
        chart.dispose()
    }

    // 正式渲染
    chart = echarts.init(dom)
    chart.setOption({
        tooltip: { trigger: 'axis' },
        xAxis: { type: 'category', data: dates || [] },
        yAxis: { type: 'value' },
        series: [{
            data: data || [],
            type: 'line',
            smooth: true,
            itemStyle: { color: '#409EFF' },
            areaStyle: { color: 'rgba(64,158,255,0.2)' }
        }]
    })
}

// 初始化饼图
const initPieChart = (pieData) => {
    const dom = pieChartRef.value
    // 防弹衣 1
    if (!dom || dom.nodeType !== 1) return

    // 防弹衣 2
    let chart = echarts.getInstanceByDom(dom)
    if (chart) {
        chart.dispose()
    }

    // 正式渲染
    chart = echarts.init(dom)
    chart.setOption({
        tooltip: { trigger: 'item' },
        legend: { bottom: '0%', left: 'center' },
        series: [{
            name: '订单量',
            type: 'pie',
            radius: ['40%', '70%'],
            itemStyle: { borderRadius: 10, borderColor: '#fff', borderWidth: 2 },
            data: pieData || []
        }]
    })
}
</script>

<style scoped>
.dashboard-container {
    background: #fff;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.data-cards .el-card {
    border: none;
    color: white;
    border-radius: 8px;
}

.data-card {
    display: flex;
    flex-direction: column;
    justify-content: center;
    height: 100px;
    padding-left: 10px;
}

.title {
    font-size: 14px;
    opacity: 0.9;
    margin-bottom: 10px;
}

.number {
    font-size: 28px;
    font-weight: bold;
}

/* 渐变色卡片背景 */
.bg-blue {
    background: linear-gradient(135deg, #409EFF, #79bbff);
}

.bg-green {
    background: linear-gradient(135deg, #67C23A, #95d475);
}

.bg-orange {
    background: linear-gradient(135deg, #E6A23C, #eebe77);
}

.bg-purple {
    background: linear-gradient(135deg, #9c27b0, #ba68c8);
}

.card-header {
    font-weight: bold;
    color: #303133;
}
</style>