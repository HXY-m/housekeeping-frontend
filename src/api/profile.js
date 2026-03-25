import request from '../utils/request'

export const uploadFileAPI = (formData) => request.post('/common/upload', formData, {
    headers: {
        'Content-Type': 'multipart/form-data'
    }
})

export const getCustomerProfileAPI = () => request.get('/customer')

export const saveCustomerProfileAPI = (data) => request.post('/customer', data)

export const getProfessionalProfileAPI = () => request.get('/professional')

export const saveProfessionalProfileAPI = (data) => request.post('/professional', data)

export const getProfessionalsByServiceAPI = (serviceId) => request.get(`/professional/listByService?serviceId=${serviceId}`)

export const updatePasswordAPI = (userId, oldPassword, newPassword) => {
    return request.put(`/users/${userId}/password?oldPassword=${oldPassword}&newPassword=${newPassword}`)
}

export const getProfessionalsAdminAPI = () => request.get('/professional/admin/list')

export const auditProfessionalAPI = (id, status) => request.patch(`/professional/admin/audit/${id}?status=${status}`)
