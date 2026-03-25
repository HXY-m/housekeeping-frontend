import axios from 'axios'
import { useUserStore } from '../store/user'

const request = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
    timeout: 5000
})

request.interceptors.request.use(
    config => {
        const userStore = useUserStore()
        if (userStore.token) {
            config.headers.Authorization = `Bearer ${userStore.token}`
        }
        return config
    },
    error => Promise.reject(error)
)

request.interceptors.response.use(
    response => response.data,
    error => {
        if (error.response && error.response.status === 401) {
            alert('鐧诲綍宸茶繃鏈熸垨鏈櫥褰曪紝璇烽噸鏂扮櫥褰曪紒')
        } else {
            alert(error.response?.data?.message || '璇锋眰鍚庣澶辫触')
        }
        return Promise.reject(error)
    }
)

export default request
