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

export type SysPlatformMenuItem = {
  /** 模型 id */
  id?: string
  /** 模块 code */
  menuCode?: string
  /** 模型名称 */
  menuName?: string
  /** 配置类型：class 分类 / options 选项 */
  configType?: 'class' | 'options' | string
  /** 父级资源 id，0 表示一级分类 */
  parentId?: string
  /** 功能描述 */
  functionDesc?: string
  /** 平台类型：iOS / Android / HarmonyOS / Web / WeChatMini */
  platformType?: string
  /** 首页图标 URL */
  homeIcon?: string | null
  /** 功能图标 URL */
  functionIcon?: string | null
  /** 前端跳转路径 */
  path?: string | null
  /** 示例 demo 类型：0 视频 / 1 图片 */
  urlType?: boolean
  /** 创意模板链接 */
  fileUrl?: string
  /** 创意模板图片链接 */
  imgUrl?: string
  /** 是否展示在首页：0 不展示，1 展示 */
  homeStatus?: number
  /** 下一级功能列表 */
  children?: SysPlatformMenuItem[]
}

export type InspirationWordItem = {
  id?: string | number
  wordsId?: string | number
  name?: string
  wordsName?: string
  wordsDesc?: string
}

export type InspirationWordsCategory = {
  code?: string
  typeCode?: string
  title?: string
  typeName?: string
  wordsList?: InspirationWordItem[]
  children?: InspirationWordItem[]
}

export type AlgoConfigTempRelationItem = {
  id?: string | number
  code?: string
  name?: string
  algorithmDesc?: string
  imageUrl?: string
  vipStatus?: number
  waveCoin?: number
  defaultStatus?: number
  paramGroups?: Array<{
    type?: number
    params?: Array<{
      templateName?: string
      templateDesc?: string
      imageUrl?: string
      vipStatus?: number
      waveCoin?: number
    }>
  }>
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

  /**
   * 获取功能列表
   * - GET /api/v1/app/getSysPlatformMenu
   */
  getSysPlatformMenu(params?: Record<string, unknown>) {
    return request.get('/v1/app/getSysPlatformMenu', { params }) as unknown as Promise<ApiResponse<SysPlatformMenuItem[]>>
  },

  /**
   * 获取灵感词词典
   * - GET /api/v1/app/getInspirationWords
   */
  getInspirationWords(params: { functionCode: string; typeCode: string }) {
    return request.get('/v1/app/getInspirationWords', { params }) as unknown as Promise<ApiResponse<InspirationWordsCategory[]>>
  },

  /**
   * 获取功能关联模型模板列表
   * - GET /api/v1/app/getAlgoConfigTempRelation
   */
  getAlgoConfigTempRelation(params: { menuCode: string }) {
    return request.get('/v1/app/getAlgoConfigTempRelation', { params }) as unknown as Promise<ApiResponse<AlgoConfigTempRelationItem[]>>
  },
}

export default appApi

