<template>
  <div class="chat-panel">
    <div class="chat-header">
      <div>
        <strong>沟通记录</strong>
        <p>客户与服务人员可以在这里同步上门、进度和验收信息。</p>
      </div>
      <el-button text @click="loadMessages">刷新</el-button>
    </div>

    <div v-loading="loading" class="chat-list">
      <el-empty v-if="messages.length === 0 && !loading" description="暂无沟通记录" :image-size="64" />
      <div v-for="message in messages" :key="message.id" class="chat-item" :class="{ self: String(message.senderId) === String(userStore.userId) }">
        <div class="chat-meta">
          <span>{{ roleText(message.senderRole) }}</span>
          <span>{{ formatTime(message.createTime) }}</span>
        </div>
        <div class="chat-bubble">
          <p>{{ message.messageContent }}</p>
          <a v-if="message.attachmentUrl" :href="message.attachmentUrl" target="_blank" rel="noreferrer">查看附件</a>
        </div>
      </div>
    </div>

    <div class="chat-form">
      <el-input
        v-model="form.messageContent"
        type="textarea"
        :rows="3"
        placeholder="输入本次沟通内容，例如上门时间、材料准备、验收说明。"
      />
      <div class="chat-actions">
        <el-upload :show-file-list="false" :http-request="customUpload">
          <el-button plain>上传附件</el-button>
        </el-upload>
        <a v-if="form.attachmentUrl" :href="form.attachmentUrl" target="_blank" rel="noreferrer">已上传附件</a>
        <el-button type="primary" @click="submitMessage">发送</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { getOrderMessagesAPI, sendOrderMessageAPI } from '@/api/order'
import { uploadFileAPI } from '@/api/profile'
import { useUserStore } from '@/store/user'

const props = defineProps({
  orderId: {
    type: Number,
    required: true
  }
})

const userStore = useUserStore()
const loading = ref(false)
const messages = ref([])
const form = ref({
  messageContent: '',
  attachmentUrl: ''
})

const loadMessages = async () => {
  loading.value = true
  try {
    const res = await getOrderMessagesAPI(props.orderId)
    if (res.code === 200) {
      messages.value = res.data
    }
  } finally {
    loading.value = false
  }
}

const customUpload = async (options) => {
  const formData = new FormData()
  formData.append('file', options.file)
  const res = await uploadFileAPI(formData)
  if (res.code === 200) {
    form.value.attachmentUrl = res.data
    ElMessage.success('附件上传成功')
    options.onSuccess(res, options.file)
    return
  }
  options.onError(new Error(res.message))
}

const submitMessage = async () => {
  if (!form.value.messageContent.trim()) {
    ElMessage.warning('请输入沟通内容')
    return
  }
  const res = await sendOrderMessageAPI(props.orderId, form.value)
  if (res.code === 200) {
    ElMessage.success('消息已发送')
    form.value = { messageContent: '', attachmentUrl: '' }
    loadMessages()
  } else {
    ElMessage.error(res.message)
  }
}

const formatTime = (value) => (value ? value.replace('T', ' ').slice(0, 16) : '-')

const roleText = (role) => ({
  1: '管理员',
  2: '客户',
  3: '服务人员'
}[role] || '成员')

watch(() => props.orderId, () => {
  loadMessages()
}, { immediate: true })

onMounted(loadMessages)
</script>

<style scoped>
.chat-panel {
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 20px;
  padding: 18px;
  background: #fcfdfd;
}

.chat-header {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}

.chat-header p {
  margin: 6px 0 0;
  color: #64748b;
  font-size: 13px;
}

.chat-list {
  max-height: 260px;
  overflow: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 14px;
  padding-right: 4px;
}

.chat-item {
  max-width: 88%;
}

.chat-item.self {
  align-self: flex-end;
}

.chat-meta {
  display: flex;
  gap: 10px;
  font-size: 12px;
  color: #64748b;
  margin-bottom: 6px;
}

.chat-bubble {
  padding: 12px 14px;
  border-radius: 16px;
  background: #eef6ff;
  color: #0f172a;
}

.chat-item.self .chat-bubble {
  background: #0f766e;
  color: #fff;
}

.chat-bubble p {
  margin: 0 0 6px;
  line-height: 1.5;
}

.chat-bubble a {
  color: inherit;
  opacity: 0.88;
}

.chat-form {
  display: grid;
  gap: 12px;
}

.chat-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}
</style>
