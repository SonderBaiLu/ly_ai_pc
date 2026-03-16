import request from '@/utils/request'
import type { ApiResponse } from '@/types'

export const subscriptionApi = {
  getSubscriptionInfo(params: any) {
    return request.post('/subscription/getSubscriptionInfo', params) as unknown as Promise<ApiResponse<any>>
  },
  createSubscriptionOrder(params: any) {
    return request.post('/subscription/createSubscriptionOrder', params) as unknown as Promise<ApiResponse<any>>
  },
  getSubscriptionRecords(params: any) {
    return request.post('/subscription/getSubscriptionRecords', params) as unknown as Promise<ApiResponse<any>>
  },
}

export default subscriptionApi

