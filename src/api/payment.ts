import type { ApiResponse } from '@/types'
import request from '@/utils/request'

// 支付相关类型定义（根据后端支付中心接口）
export interface PaymentOrderData {
  // 支付渠道ID
  channelId: string | number
  // 购买商品ID
  productId: number | string
  // 预留扩展字段（后端如果未来增加字段，不需要再改类型）
  [key: string]: any
}

export interface PaymentOrderResponse {
  // 支付订单号（用于后续查询支付结果）
  orderNo?: string
  orderId?: string
  // 金额
  amount?: number
  // 支付二维码或跳转地址
  paymentUrl?: string
  qrCode?: string
  // 支付宝订单信息（URL编码的表单参数字符串）
  alipayOrderInfo?: string
  // 微信支付订单信息
  wechatPayOrderInfo?: string
  // 消息提示
  message?: string
  // 其它字段按需扩展
  [key: string]: any
}

// 支付宝订单查询响应（根据文档结构做宽松定义）
export interface AlipayQueryResult {
  code?: string
  msg?: string
  subCode?: string
  subMsg?: string
  body?: {
    tradeStatus?: string
    [key: string]: any
  }
  [key: string]: any
}

export type PaymentMethod = {
  id: string | number
  channelCode: 'wechat_pay' | 'alipay' | 'apple_pay' | string
  channelName: string
  iconUrl?: string
  description?: number | string
  [key: string]: any
}

// 支付API接口
export const paymentApi = {
  /**
   * 获取支付方式
   * - GET /api/v1/payment/getPaymentMethod
   */
  getPaymentMethod: (): Promise<ApiResponse<PaymentMethod[]>> =>
    request.get('/v1/payment/getPaymentMethod'),

  /**
   * 创建支付订单
   * - POST /api/v1/payment/submit
   */
  createPaymentOrder: (data: PaymentOrderData): Promise<ApiResponse<PaymentOrderResponse>> =>
    request.post('/v1/payment/submit', data),

  /**
   * 查询支付结果
   * - GET /api/v1/payment/query
   * @param orderNo 支付订单号
   */
  queryPayment: (orderNo: string): Promise<ApiResponse<any>> =>
    request.get('/v1/payment/query', { params: { orderNo } }),
}

export default paymentApi
