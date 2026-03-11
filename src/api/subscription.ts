import request from '@/utils/request'

export const subscriptionApi = {
  getSubscriptionInfo(params: any) {
    return request.post('/subscription/getSubscriptionInfo', params)
  },
  createSubscriptionOrder(params: any) {
    return request.post('/subscription/createSubscriptionOrder', params)
  },
  getSubscriptionRecords(params: any) {
    return request.post('/subscription/getSubscriptionRecords', params)
  },
}

export default subscriptionApi

