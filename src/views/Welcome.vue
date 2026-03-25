<template>
  <section class="welcome-page">
    <div class="hero">
      <div>
        <p class="eyebrow">Daily Overview</p>
        <h2>{{ greeting }}，{{ username || '用户' }}</h2>
        <p>{{ introText }}</p>
      </div>
      <div class="hero-card">
        <span>{{ roleName }}</span>
        <strong>{{ actionHint }}</strong>
      </div>
    </div>

    <div class="shortcut-grid">
      <el-card v-for="item in shortcuts" :key="item.title" shadow="hover" class="shortcut-card" @click="router.push(item.path)">
        <p>{{ item.tag }}</p>
        <h3>{{ item.title }}</h3>
        <span>{{ item.desc }}</span>
      </el-card>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/user'

const router = useRouter()
const userStore = useUserStore()

const username = computed(() => userStore.username)
const role = computed(() => userStore.userRole)

const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 12) return '上午好'
  if (hour < 18) return '下午好'
  return '晚上好'
})

const roleName = computed(() => ({
  '1': '平台管理员',
  '2': '客户',
  '3': '服务人员'
}[role.value] || '成员'))

const introText = computed(() => ({
  '1': '这里集中承接订单、售后、日志和数据分析能力，适合作为论文中的系统总控台。',
  '2': '你可以从这里继续预约、支付未完成订单、查看进度并发起售后。',
  '3': '这里是你的接单与履约工作台，可以查看待接单、同步进度并与客户沟通。'
}[role.value] || '欢迎回到平台。'))

const actionHint = computed(() => ({
  '1': '重点关注待处理售后与支付转化',
  '2': '优先完成待支付和待验收订单',
  '3': '及时更新上门进度，减少沟通成本'
}[role.value] || '开始今天的工作'))

const shortcuts = computed(() => ({
  '1': [
    { tag: 'Orders', title: '订单管理', desc: '查看支付、履约、售后联动全链路', path: '/home/orders-manage' },
    { tag: 'Analytics', title: '数据分析', desc: '监控收入、满意度和售后情况', path: '/home/dashboard' },
    { tag: 'Audit', title: '操作日志', desc: '验证系统可追溯性与关键操作记录', path: '/home/operation-logs' }
  ],
  '2': [
    { tag: 'Book', title: '立即预约', desc: '选择服务、地址和支付方式完成下单', path: '/home/services' },
    { tag: 'Orders', title: '我的订单', desc: '继续支付、查看进度、发送沟通消息', path: '/home/customer-orders' },
    { tag: 'After-sale', title: '售后反馈', desc: '问题留痕并跟踪管理员处理结果', path: '/home/after-sale' }
  ],
  '3': [
    { tag: 'Work', title: '订单工作台', desc: '抢单、接单、更新进度并完成服务', path: '/home/professional-orders' },
    { tag: 'Profile', title: '资料档案', desc: '保持认证信息完整，提升接单效率', path: '/home/profile' }
  ]
}[role.value] || []))
</script>

<style scoped>
.welcome-page {
  display: grid;
  gap: 22px;
}

.hero {
  display: grid;
  grid-template-columns: 1.5fr 0.8fr;
  gap: 18px;
}

.hero,
.shortcut-card {
  border-radius: 28px;
}

.hero > div {
  background: linear-gradient(135deg, #0f766e, #164e63);
  color: #fff;
  padding: 28px;
}

.hero-card {
  display: grid;
  align-content: space-between;
}

.hero h2 {
  margin: 8px 0 12px;
  font-size: 34px;
}

.hero p:last-child {
  margin: 0;
  line-height: 1.7;
  max-width: 720px;
}

.eyebrow {
  margin: 0;
  color: rgba(255, 255, 255, 0.72);
  letter-spacing: 0.16em;
  text-transform: uppercase;
  font-size: 12px;
}

.hero-card span {
  color: rgba(255, 255, 255, 0.72);
}

.hero-card strong {
  font-size: 24px;
  line-height: 1.4;
}

.shortcut-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 18px;
}

.shortcut-card {
  cursor: pointer;
  border: 0;
}

.shortcut-card p {
  margin: 0 0 10px;
  color: #0f766e;
  font-size: 12px;
  letter-spacing: 0.15em;
  text-transform: uppercase;
}

.shortcut-card h3 {
  margin: 0 0 8px;
}

.shortcut-card span {
  color: #64748b;
  line-height: 1.6;
}

@media (max-width: 900px) {
  .hero {
    grid-template-columns: 1fr;
  }
}
</style>
