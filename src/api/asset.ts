import request from '@/utils/request'
import type { ApiResponse } from '@/types'

/**
 * 资产相关接口（最小可用封装）
 * 说明：接口路径为占位，需按后端实际对齐。
 */
export const assetApi = {
  getTaskDetail(params: any) {
    return request.post('/asset/getTaskDetail', params) as unknown as Promise<ApiResponse<any>>
  },
  getMyAssetsPage(params: any) {
    return request.post('/asset/getMyAssetsPage', params) as unknown as Promise<ApiResponse<any>>
  },
  batchCollect(params: any) {
    return request.post('/asset/batchCollect', params) as unknown as Promise<ApiResponse<any>>
  },
  batchDelete(params: any) {
    return request.post('/asset/batchDelete', params) as unknown as Promise<ApiResponse<any>>
  },
}

export default assetApi

