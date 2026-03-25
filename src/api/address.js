import request from '../utils/request'

export const getMyAddressesAPI = () => request.get('/address')

export const addAddressAPI = (data) => request.post('/address', data)

export const updateAddressAPI = (data) => request.put('/address', data)

export const deleteAddressAPI = (id) => request.delete(`/address/${id}`)

export const setDefaultAddressAPI = (addressId) => request.patch(`/address/${addressId}/default`)
