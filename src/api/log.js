import request from '../utils/request'

export const getOperationLogsAPI = (moduleName) =>
  request.get('/operation-logs', {
    params: moduleName ? { moduleName } : {}
  })
