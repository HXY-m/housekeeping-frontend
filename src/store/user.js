// src/store/user.js
import { defineStore } from 'pinia'

// 定义一个名为 'user' 的全局仓库
export const useUserStore = defineStore('user', {
    // 1. State: 存放数据的地方 (相当于组件里的 ref)
    state: () => ({
        token: '',
        username: '',
        userRole: '',
        userId: ''
    }),

    // 2. Actions: 修改数据的方法 (相当于组件里的 function)
    actions: {
        // 登录成功时调用，一键存入所有信息
        setUserInfo(data) {
            this.token = data.token
            this.username = data.username
            this.userRole = String(data.role) // 统一转成字符串防坑
            this.userId = data.userId
        },
        // 退出登录时调用，一键清空
        clearUserInfo() {
            this.token = ''
            this.username = ''
            this.userRole = ''
            this.userId = ''
        }
    },

    // 3. 【见证奇迹的时刻】：开启持久化！
    // 开启后，Pinia 会自动把上面的 state 实时同步到 localStorage 中，你再也不用手动 setItem/getItem 了！
    persist: true
})