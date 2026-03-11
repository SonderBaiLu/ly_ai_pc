import request from '@/utils/request'

/**
 * 资产相关接口（最小可用封装）
 * 说明：接口路径为占位，需按后端实际对齐。
 */
export const assetApi = {
  getTaskDetail(params: any) {
    return request.post('/asset/getTaskDetail', params)
  },
  getMyAssetsPage(params: any) {
    return request.post('/asset/getMyAssetsPage', params)
  },
  batchCollect(params: any) {
    return request.post('/asset/batchCollect', params)
  },
  batchDelete(params: any) {
    return request.post('/asset/batchDelete', params)
  },
}

export default assetApi

