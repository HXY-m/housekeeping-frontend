import request from '../utils/request'

export const createAfterSaleAPI = (data) => request.post('/after-sale', data)

export const getMyAfterSalesAPI = () => request.get('/after-sale')

export const getAllAfterSalesAPI = () => request.get('/after-sale/admin/all')

export const handleAfterSaleAPI = (id, data) => request.patch(`/after-sale/admin/${id}`, data)
