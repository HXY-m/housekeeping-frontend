import request from '../utils/request' // 注意相对路径，如果你配置了 @ 别名也可以用 '@/utils/request'

// 登录接口
export const loginAPI = (data) => {
    return request.post('/auth/login', data)
}

// 注册接口
export const registerAPI = (data) => {
    return request.post('/auth/register', data)
}