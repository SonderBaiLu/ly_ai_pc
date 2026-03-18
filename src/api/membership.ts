import request from '@/utils/request'
import type { ApiResponse } from '@/types'

export const membershipApi = {
  /**
   * 获取商品列表（会员 / 积分）
   * - GET /api/v1/app/getAppProductList
   * - productKind: vip | Points
   */
  getAppProductList(params: { productKind: 'vip' | 'Points' }) {
    return request.get('/v1/app/getAppProductList', { params }) as unknown as Promise<ApiResponse<any>>
  },
  getMembershipPlans(params: any) {
    return request.post('/membership/getMembershipPlans', params) as unknown as Promise<ApiResponse<any>>
  },
  createPayOrder(params: any) {
    return request.post('/membership/createPayOrder', params) as unknown as Promise<ApiResponse<any>>
  },
  // 兼容旧调用（页面里还在用这些方法名）
  vipTip(params: any) {
    return request.post('/membership/vipTip', params) as unknown as Promise<ApiResponse<any>>
  },
  vipInfoList(params: any) {
    return request.post('/membership/vipInfoList', params) as unknown as Promise<ApiResponse<any>>
  },
  vipPrivilege(params: any) {
    return request.post('/membership/vipPrivilege', params) as unknown as Promise<ApiResponse<any>>
  },
  waveCoinList(params: any) {
    return request.post('/membership/waveCoinList', params) as unknown as Promise<ApiResponse<any>>
  },
  getCoinRecordList(params: any) {
    return request.post('/membership/getCoinRecordList', params) as unknown as Promise<ApiResponse<any>>
  },
}

export default membershipApi

