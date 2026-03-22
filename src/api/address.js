import request from '../utils/request'

// 获取我的地址列表
export const getMyAddressesAPI = (userId) => request.get(`/address?userId=${userId}`)

// 新增地址
export const addAddressAPI = (data) => request.post('/address', data)

// 修改地址
export const updateAddressAPI = (data) => request.put('/address', data)

// 删除地址
export const deleteAddressAPI = (id) => request.delete(`/address/${id}`)

// 设为默认地址
export const setDefaultAddressAPI = (addressId, userId) => request.patch(`/address/${addressId}/default?userId=${userId}`)