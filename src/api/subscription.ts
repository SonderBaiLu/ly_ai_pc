import request from '@/utils/request'
import type { ApiResponse } from '@/types'

/**
 * 订阅/会员相关接口封装
 * 说明：后端接口路径需与实际服务一致；此处仅保证页面编译可用。
 */
export const subscriptionApi = {
  /**
   * 获取订阅记录
   * - POST /api/v1/payment/getOrderSubscribe
   *
   * 参数：
   * - productKind: 商品种类【vip 会员, Points 积分】
   * - currentPage: 当前页码
   * - offset: 每页数量
   */
  getOrderSubscribe(params: { productKind: 'vip' | 'Points'; currentPage: number; offset: number }) {
    return request.post('/v1/payment/getOrderSubscribe', params) as unknown as Promise<ApiResponse<any>>
  },
}

export default subscriptionApi

