import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

// 【新增 1】：引入 Pinia 和 持久化插件
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

const app = createApp(App)

// 【新增 2】：创建 Pinia 实例并使用持久化插件
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}

// 【新增 3】：让 Vue 使用 pinia
app.use(pinia)
app.use(router)
app.use(ElementPlus)

app.mount('#app')