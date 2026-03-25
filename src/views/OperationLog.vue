<template>
  <section class="logs-page">
    <div class="page-header">
      <div>
        <p class="eyebrow">Audit Trail</p>
        <h2>操作日志</h2>
        <p>集中查看登录、订单、售后和用户管理操作，便于论文展示系统可追溯性。</p>
      </div>
      <div class="filters">
        <el-select v-model="moduleName" placeholder="筛选模块" clearable style="width: 180px" @change="fetchLogs">
          <el-option label="全部模块" value="" />
          <el-option label="AUTH" value="AUTH" />
          <el-option label="ORDER" value="ORDER" />
          <el-option label="ORDER_MESSAGE" value="ORDER_MESSAGE" />
          <el-option label="AFTER_SALE" value="AFTER_SALE" />
          <el-option label="USER" value="USER" />
        </el-select>
        <el-button type="primary" plain @click="fetchLogs">刷新</el-button>
      </div>
    </div>

    <el-card class="table-card" shadow="never">
      <el-table :data="logs" v-loading="loading" stripe>
        <el-table-column prop="moduleName" label="模块" width="160" />
        <el-table-column prop="actionName" label="动作" width="160" />
        <el-table-column prop="operatorId" label="操作人 ID" width="120" />
        <el-table-column prop="operatorRole" label="角色" width="100" />
        <el-table-column prop="targetId" label="目标 ID" width="120" />
        <el-table-column prop="description" label="说明" min-width="300" />
        <el-table-column label="时间" width="180">
          <template #default="{ row }">{{ formatTime(row.createTime) }}</template>
        </el-table-column>
      </el-table>
    </el-card>
  </section>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { getOperationLogsAPI } from '@/api/log'

const logs = ref([])
const loading = ref(false)
const moduleName = ref('')

const fetchLogs = async () => {
  loading.value = true
  try {
    const res = await getOperationLogsAPI(moduleName.value || undefined)
    if (res.code === 200) {
      logs.value = res.data
    }
  } finally {
    loading.value = false
  }
}

const formatTime = (value) => (value ? value.replace('T', ' ').slice(0, 19) : '-')

onMounted(fetchLogs)
</script>

<style scoped>
.logs-page {
  display: grid;
  gap: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  align-items: flex-end;
  flex-wrap: wrap;
}

.eyebrow {
  margin: 0 0 8px;
  font-size: 12px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: #0f766e;
}

h2 {
  margin: 0 0 8px;
  font-size: 30px;
}

.page-header p:last-child {
  margin: 0;
  color: #64748b;
}

.filters {
  display: flex;
  gap: 12px;
  align-items: center;
}

.table-card {
  border-radius: 24px;
}
</style>
