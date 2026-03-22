import request from '../utils/request'

// ================= 通用文件上传 =================
// 提交文件时必须使用 FormData 对象
export const uploadFileAPI = (formData) => request.post('/common/upload', formData, {
    headers: {
        'Content-Type': 'multipart/form-data'
    }
})

// ================= 客户 (Customer) 相关 =================
// 获取客户个人资料
export const getCustomerProfileAPI = (userId) => request.get(`/customer?userId=${userId}`)

// 保存客户个人资料
export const saveCustomerProfileAPI = (data) => request.post('/customer', data)

// ================= 师傅 (Professional) 相关 =================
// 获取师傅个人资料
export const getProfessionalProfileAPI = (userId) => request.get(`/professional?userId=${userId}`)

// 保存师傅个人资料
export const saveProfessionalProfileAPI = (data) => request.post('/professional', data)

// 获取指定服务下的可用师傅列表
export const getProfessionalsByServiceAPI = (serviceId) => request.get(`/professional/listByService?serviceId=${serviceId}`)

// ================= 通用安全设置 =================
// 修改密码
export const updatePasswordAPI = (userId, oldPassword, newPassword) => {
    return request.put(`/users/${userId}/password?oldPassword=${oldPassword}&newPassword=${newPassword}`)
}