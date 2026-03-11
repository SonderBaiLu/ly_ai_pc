import type { ApiResponse } from '@/types'
import request from '@/utils/request'

// 支付相关类型定义（根据后端支付中心接口）
export interface PaymentOrderData {
  // 用户ID
  userId: string | number
  // 支付方式：0-支付宝 等
  paymentType: number
  // 订单类型：0-开通会员 1-购买潮币 等
  orderType: number
  // 商品编码
  itemCode: string
  // 商品ID
  itemId: string | number
  // 货币类型：0-人民币 2-美元（可选）
  currencyType?: number
  // 平台类型：0-PC 1-安卓 2-鸿蒙 3-iOS（可选）
  platformType?: number
  // 预留扩展字段
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

// 支付API接口
export const paymentApi = {
  /**
   * 创建支付订单（统一下单）
   */
  createPaymentOrder: (data: PaymentOrderData): Promise<ApiResponse<PaymentOrderResponse>> =>
    request.post('/api-order-payment/payment/create', data),

  /**
   * 查询支付宝订单详情
   * @param orderNo 支付订单号
   */
  queryAlipayOrder: (orderNo: string): Promise<ApiResponse<AlipayQueryResult>> =>
    request.get('/api-order-payment/payment/order/query', { params: { orderNo } }),
}

export default paymentApi
