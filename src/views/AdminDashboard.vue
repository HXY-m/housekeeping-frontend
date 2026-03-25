<template>
  <section class="dashboard-page">
    <div class="hero">
      <div>
        <p class="eyebrow">Analytics</p>
        <h2>运营数据总览</h2>
        <p>这里聚合订单、支付、满意度、售后与服务占比，是论文展示“数据分析模块”的主页面。</p>
      </div>
      <div class="hero-actions">
        <el-button type="primary" @click="fetchDashboardData">刷新数据</el-button>
        <el-button plain @click="exportOrdersReportAPI">导出订单报表</el-button>
        <el-button plain @click="exportAfterSaleReportAPI">导出售后报表</el-button>
      </div>
    </div>

    <div class="stats-grid">
      <el-card v-for="card in cards" :key="card.title" shadow="hover" class="stat-card">
        <p>{{ card.title }}</p>
        <strong>{{ card.value }}</strong>
        <span>{{ card.desc }}</span>
      </el-card>
    </div>

    <div class="chart-grid">
      <el-card shadow="never" class="panel-card">
        <template #header>订单阶段分布</template>
        <div ref="lineChartRef" class="chart-box" />
      </el-card>
      <el-card shadow="never" class="panel-card">
        <template #header>服务项目占比</template>
        <div ref="pieChartRef" class="chart-box" />
      </el-card>
    </div>
  </section>
</template>

<script setup>
import { computed, nextTick, onMounted, ref } from 'vue'
import * as echarts from 'echarts'
import request from '@/utils/request'
import { exportAfterSaleReportAPI, exportOrdersReportAPI } from '@/api/report'

const lineChartRef = ref(null)
const pieChartRef = ref(null)
const dashboardData = ref({
  totalOrders: 0,
  customerCount: 0,
  proCount: 0,
  totalRevenue: 0,
  completedOrders: 0,
  paidOrders: 0,
  afterSaleCount: 0,
  afterSalePending: 0,
  satisfaction: 0,
  paymentConversion: 0,
  trendDates: [],
  trendData: [],
  pieData: []
})

const cards = computed(() => ([
  { title: '总订单量', value: dashboardData.value.totalOrders, desc: '累计下单记录' },
  { title: '已支付订单', value: dashboardData.value.paidOrders, desc: `转化率 ${dashboardData.value.paymentConversion}%` },
  { title: '累计收入', value: `¥ ${dashboardData.value.totalRevenue}`, desc: '已完成订单统计' },
  { title: '待处理售后', value: dashboardData.value.afterSalePending, desc: `累计售后 ${dashboardData.value.afterSaleCount}` },
  { title: '客户数', value: dashboardData.value.customerCount, desc: '平台注册客户' },
  { title: '服务人员', value: dashboardData.value.proCount, desc: '已入驻服务人员' },
  { title: '已完成订单', value: dashboardData.value.completedOrders, desc: '进入验收闭环的订单' },
  { title: '平均满意度', value: dashboardData.value.satisfaction, desc: '订单评分均值' }
]))

const fetchDashboardData = async () => {
  const res = await request.get('/statistics/dashboard')
  if (res.code === 200) {
    dashboardData.value = res.data
    await nextTick()
    initLineChart()
    initPieChart()
  }
}

const initLineChart = () => {
  if (!lineChartRef.value) return
  echarts.getInstanceByDom(lineChartRef.value)?.dispose()
  const chart = echarts.init(lineChartRef.value)
  chart.setOption({
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: dashboardData.value.trendDates },
    yAxis: { type: 'value' },
    series: [{
      type: 'line',
      smooth: true,
      areaStyle: { color: 'rgba(15,118,110,0.16)' },
      itemStyle: { color: '#0f766e' },
      data: dashboardData.value.trendData
    }]
  })
}

const initPieChart = () => {
  if (!pieChartRef.value) return
  echarts.getInstanceByDom(pieChartRef.value)?.dispose()
  const chart = echarts.init(pieChartRef.value)
  chart.setOption({
    tooltip: { trigger: 'item' },
    series: [{
      type: 'pie',
      radius: ['42%', '72%'],
      data: dashboardData.value.pieData,
      itemStyle: { borderRadius: 14, borderColor: '#fff', borderWidth: 4 }
    }]
  })
}

onMounted(fetchDashboardData)
</script>

<style scoped>
.dashboard-page {
  display: grid;
  gap: 20px;
}

.hero {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-end;
  flex-wrap: wrap;
}

.eyebrow {
  margin: 0;
  color: #0f766e;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  font-size: 12px;
}

h2 {
  margin: 8px 0;
  font-size: 32px;
}

.hero p:last-child {
  margin: 0;
  color: #64748b;
}

.hero-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
}

.stat-card {
  border-radius: 24px;
}

.stat-card p {
  margin: 0 0 10px;
  color: #64748b;
}

.stat-card strong {
  display: block;
  font-size: 32px;
  margin-bottom: 10px;
}

.stat-card span {
  color: #0f766e;
}

.chart-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 16px;
}

.panel-card {
  border-radius: 24px;
}

.chart-box {
  height: 320px;
}
</style>
