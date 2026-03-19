import request from '@/utils/request'
import type { ApiResponse } from '@/types'
import type { AgreementType } from '@/constants/agreement'

export type AppAgreementContent = {
  /** 主键（后端返回 appContentId） */
  appContentId?: string | number
  /** 协议类型 code（后端返回 code） */
  code?: AgreementType
  /** 协议名称（后端返回 codeName） */
  codeName?: string
  /** 协议内容（后端返回 content，通常是 html / text） */
  content?: string
  /** 协议简介（后端返回 contentDescribe） */
  contentDescribe?: string
  /** 可能存在的图片字段（后端返回 imageUrl） */
  imageUrl?: string
}

export const appApi = {
  /**
   * APP 协议内容
   * - GET /api/v1/app/getContent
   *
   * 注意：request 的 baseURL 已包含 `/api`，这里只写 `/v1/...` 即可
   */
  getContent(params: { code: AgreementType }) {
    return request.get('/v1/app/getContent', { params }) as unknown as Promise<ApiResponse<AppAgreementContent>>
  },
}

export default appApi

