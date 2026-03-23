import request from '@/utils/request'
import type { ApiResponse } from '@/types'

 export type AppProductPrivilege = {
  id?: string | number
  productType?: number
  privilegesCode?: string
  privilegesName?: string
  privilegesUrl?: string
  privilegesValue?: number
  privilegesDesc?: string
  [key: string]: any
}

/**
 * 应用商品（/api/v1/app/getAppProductList 返回 data[]）
 */
export type AppProduct = {
  id?: string | number | null
  productCode?: string
  productName?: string
  productKind?: 'vip' | 'Points' | string
  productType?: number
  productUnit?: number
  productPrice?: number
  waveCoin?: number
  productDesc?: string
  privilegesListVOS?: AppProductPrivilege[]
  [key: string]: any
}

/**
 * 将应用商品映射为页面通用 plan 结构（兼容现有字段名）
 */
export const normalizeAppProductToPlan = (p: AppProduct) => {
  const id = (p.id ?? p.productCode ?? '') as any
  const itemCode = String(p.productCode ?? '')
  const itemName = String(p.productName ?? '')
  const itemPrice = p.productPrice ?? 0
  const itemUnit = p.productUnit as any

  return {
    // 原字段（页面大量使用）
    id,
    itemCode,
    itemName,
    itemPrice,
    itemUnit,
    itemDesc: p.productDesc,
    vipRightsList: (p.privilegesListVOS || []).map((x) => ({
      rightName: x.privilegesName || x.privilegesCode || '',
      imgUrl: x.privilegesUrl,
      ...x,
    })),

    // 新字段（保留，便于后续直接用）
    productCode: p.productCode,
    productName: p.productName,
    productKind: p.productKind,
    productType: p.productType,
    productUnit: p.productUnit,
    productPrice: p.productPrice,
    waveCoin: p.waveCoin,
    productDesc: p.productDesc,
    privilegesListVOS: p.privilegesListVOS,
  }
}

export const membershipApi = {
  /**
   * 获取商品列表（会员 / 积分）
   * - GET /api/v1/app/getAppProductList
   * - productKind: vip | Points
   */
  getAppProductList(params: { productKind: 'vip' | 'Points' }) {
    return request.get('/v1/app/getAppProductList', { params }) as unknown as Promise<ApiResponse<AppProduct[]>>
  },

  /**
   * 会员升级弹窗：统一由支付中心接口返回
   * - GET /v1/payment/vipTip
   */
  vipTip(params: { productId: string | number }) {
    return request.get('/v1/payment/vipTip', { params }) as unknown as Promise<ApiResponse<any>>
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

