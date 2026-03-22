import request from '../utils/request'

// ================= 客户 & 通用 API =================
// 客户提交订单 (包含指定师傅的信息)
export const createOrderAPI = (data) => request.post('/orders', data)

// 客户/师傅：获取自己的订单列表 (后端通过 Token 自动识别身份)
export const getMyOrdersAPI = () => request.get('/orders')

// 客户：取消订单
export const cancelOrderAPI = (orderId) => request.patch(`/orders/${orderId}/cancel`)

// 客户：验收完单
export const completeOrderAPI = (orderId, data) => request.patch(`/orders/${orderId}/completion`, data)


// ================= 师傅专属 API =================
// 师傅：获取抢单大厅可用订单 (无主的单子)
export const getAvailableOrdersAPI = () => request.get('/orders/available')

// 师傅：抢单 或 接受指定的单子 (不再需要传 proId！)
export const acceptOrderAPI = (orderId) => request.patch(`/orders/${orderId}/accept`)

// 师傅：拒绝被指定的单子
export const rejectOrderAPI = (orderId) => request.patch(`/orders/${orderId}/reject`)


// ================= 管理员专属 API =================
export const getAllOrdersAdminAPI = () => request.get('/orders/admin/all')
export const deleteOrderAdminAPI = (orderId) => request.delete(`/orders/admin/${orderId}`)