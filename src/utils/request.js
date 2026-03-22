import axios from 'axios'
import { useUserStore } from '../store/user'
// 1. 创建 Axios 实例
const request = axios.create({
    baseURL: 'http://localhost:8080/api', // 指向你的后端接口基地址
    timeout: 5000 // 超时时间
})

// 2. 请求拦截器 (发请求前执行)
request.interceptors.request.use(
    config => {
        // ✅ 核心修复：在这里面调用，保证此时 Pinia 已经激活
        const userStore = useUserStore()
        if (userStore.token) {
            config.headers['Authorization'] = `Bearer ${userStore.token}`
        }
        return config
    },
    error => Promise.reject(error)
)

// 3. 响应拦截器 (后端返回数据后执行)
request.interceptors.response.use(
    response => {
        // 直接返回后端 Result 对象里的 data
        return response.data
    },
    error => {
        // 统一处理后端的报错，比如 401 没登录、403 没权限、500 服务器错误等
        if (error.response && error.response.status === 401) {
            alert('登录已过期或未登录，请重新登录！')
            // TODO: 可以在这里加个代码，让页面自动跳转到登录页
        } else {
            alert(error.response?.data?.message || '请求后端失败')
        }
        return Promise.reject(error)
    }
)

export default request