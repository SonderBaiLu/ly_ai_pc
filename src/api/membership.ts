import request from '@/utils/request'

export const membershipApi = {
  getMembershipPlans(params: any) {
    return request.post('/membership/getMembershipPlans', params)
  },
  createPayOrder(params: any) {
    return request.post('/membership/createPayOrder', params)
  },
  // 兼容旧调用（页面里还在用这些方法名）
  vipTip(params: any) {
    return request.post('/membership/vipTip', params)
  },
  vipInfoList(params: any) {
    return request.post('/membership/vipInfoList', params)
  },
  vipPrivilege(params: any) {
    return request.post('/membership/vipPrivilege', params)
  },
  waveCoinList(params: any) {
    return request.post('/membership/waveCoinList', params)
  },
  getCoinRecordList(params: any) {
    return request.post('/membership/getCoinRecordList', params)
  },
}

export default membershipApi

