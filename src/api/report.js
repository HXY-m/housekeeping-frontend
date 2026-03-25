import request from '../utils/request'

const download = async (url, filename) => {
  const response = await request.get(url, { responseType: 'blob' })
  const blob = new Blob([response], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const href = URL.createObjectURL(blob)
  link.href = href
  link.setAttribute('download', filename)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(href)
}

export const exportOrdersReportAPI = () => download('/statistics/export/orders', 'orders-report.csv')

export const exportAfterSaleReportAPI = () => download('/statistics/export/after-sale', 'after-sale-report.csv')
