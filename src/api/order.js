import request from '../utils/request'

export const createOrderAPI = (data) => request.post('/orders', data)

export const getMyOrdersAPI = () => request.get('/orders')

export const cancelOrderAPI = (orderId) => request.patch(`/orders/${orderId}/cancel`)

export const completeOrderAPI = (orderId, data) => request.patch(`/orders/${orderId}/completion`, data)

export const getAvailableOrdersAPI = () => request.get('/orders/available')

export const acceptOrderAPI = (orderId) => request.patch(`/orders/${orderId}/accept`)

export const rejectOrderAPI = (orderId) => request.patch(`/orders/${orderId}/reject`)

export const getOrderProgressAPI = (orderId) => request.get(`/orders/${orderId}/progress`)

export const updateOrderProgressAPI = (orderId, data) => request.post(`/orders/${orderId}/progress`, data)

export const getAllOrdersAdminAPI = () => request.get('/orders/admin/all')

export const deleteOrderAdminAPI = (orderId) => request.delete(`/orders/admin/${orderId}`)
