import request from '../utils/request'

// =========== 客户订单 ===========
export const getMyOrdersAPI = () => request.get('/orders')

export const cancelOrderAPI = (orderId) => request.patch(`/orders/${orderId}/cancel`)

export const completeOrderAPI = (orderId, data) => request.patch(`/orders/${orderId}/completion`, data)

// =========== 师傅订单 ===========
export const getAvailableOrdersAPI = () => request.get('/orders/available')

export const getProOrdersAPI = (proId) => request.get(`/orders/pro/${proId}`)

export const takeOrderAPI = (orderId, proId) => request.patch(`/orders/${orderId}/take?proId=${proId}`)

// =========== 管理员专属订单 API ===========
export const getAllOrdersAdminAPI = () => request.get('/orders/admin/all')

export const deleteOrderAdminAPI = (orderId) => request.delete(`/orders/admin/${orderId}`)