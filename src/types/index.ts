/**
 * 项目通用类型定义
 * - 供各模块直接 `import type { ... } from '@/types'` 使用
 */

/**
 * 通用接口返回结构（按后端规范：code/success/msg/data/extend）
 */
export type ApiResponse<T = unknown> = {
  code: string
  success?: boolean
  msg?: string
  data?: T
  extend?: unknown
}

/**
 * 创意模板/资产的宽松类型（按实际字段逐步收敛）
 * - 目前 `TemplateDetail.vue` 里仅做类型标注与索引访问，先用可选字段兜底
 */
export type CreativeTemplate = Record<string, any> & {
  id?: string | number
  title?: string
  type?: number
  typeName?: string
  fileType?: number
  fileUrl?: string
  imageUrl?: string
  imgUrl?: string
  lessenImg?: string
  noWatermarkUrl?: string
  collectId?: string | number
}

