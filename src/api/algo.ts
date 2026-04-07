import request from '@/utils/request'
import type { ApiResponse } from '@/types'
// 模型入参
export type DoCalculationPointModelParam = {
  /** 算法模型 id（后端：modelConfigId） */
  modelConfigId: number
  /** 算法模型 code（后端：modelConfigCode） */
  modelConfigCode: string
  /** 算法模型名称（后端：modelConfigName） */
  modelConfigName: string
  /** 功能模块code（后端：menuCode） */
  menuCode: string
}

// 模型参数入参
export type DoCalculationPointTemplateParam = {
  /** 模版入参主键（后端：modelConfigTemplateId） */
  modelConfigTemplateId: string
  /** 模版入参 code（后端：modelConfigTemplateCode） */
  modelConfigTemplateCode: string
  /** 模版入参名称（后端：modelConfigTemplateName） */
  modelConfigTemplateName: string
  /** 模版入参类型（后端：modelConfigTemplateType） */
  modelConfigTemplateType: string
}

// 灵衍值试算：请求参数
export type DoCalculationPointTestParams = {
  /** 算法模型配置ID（示例：1） */
  modelConfigId: number
  /** 算法模型编码（示例：LingImage_1.0） */
  modelConfigCode: string
  /** 算法模型名称（示例：LingImage 1.0） */
  modelConfigName: string
  /** 功能模块code（示例：fabric_design_concept） */
  menuCode: string
  templateParams: DoCalculationPointTemplateParam[]
}

export type DoCalculationPointPayload = {
  /** 算法模型 id（后端：modelConfigId） */
  modelConfigId: number
  /** 灵衍值试算：算法模型编码（示例：LingImage_1.0） */
  /** 算法模型 code（后端：modelConfigCode） */
  modelConfigCode: string
  /** 灵衍值试算：算法模型名称（示例：LingImage 1.0） */
  /** 算法模型名称（后端：modelConfigName） */
  modelConfigName: string
  /** 灵衍值试算：功能菜单编码 */
  /** 功能模块 code（后端：menuCode） */
  menuCode: string
  /** 需要操作的图片路径集合 */
  image: string[]
  /** 面料创款：原图（未拼接/缩放前的输入图片） */
  originalImage?: string[]
  /** 面料创款：缩放比例（用于复现前端缩放/平铺逻辑） */
  zoomRatio?: number
  /** 模版入参（后端：templateParams） */
  templateParams: DoCalculationPointTemplateParam[]

  /** 灵感词参数集合 */
  inspirationWordsParams?: Array<{ id: string; configType: string; prentId: string; content: string }>
  /** 描述词 */
  creativeDescription?: string
  /** 历史参数 */
  historyParams?: Array<{ taskResultId: string; type: string }>

  /** 线稿转实物-图片类型 / 面料创款-图片类型 */
  imageTypeParams?: Array<{ id: number; configType: string; prentId: number; content: string }>
  /** AI服装设计-创作款型 */
  creationStyleParams?: Array<{ id: string; configType: string; prentId: string; content: string }>
  /** AI服装设计-设计特性 */
  designFeaturesParams?: Array<{ id: string; configType: string; prentId: string; content: string }>
  /** 线稿转实物-线稿类型 */
  sketchTypeParams?: Array<{ id: string; configType: string; prentId: string; content: string }>
  /** 线稿转实物-线稿风格 */
  sketchStyleParams?: Array<{ id: string; configType: string; prentId: string; content: string }>
  /** 实物转线稿-款型 */
  garmentStyleParams?: Array<{ id: string; configType: string; prentId: string; content: string }>
  /** 实物转线稿-线稿生成类型 */
  sketchGenerationTypeParams?: Array<{ id: string; configType: string; prentId: string; content: string }>
  /** 实物转线稿-线稿生成风格 */
  sketchGenerationStyleParams?: Array<{ id: string; configType: string; prentId: string; content: string }>
}

/**
 * 从前端 ImageParamPopup 返回的 paramList 映射到后端 doCalculationPoint 所需结构。
 * - ImageParamPopup 返回字段（前端）：templateId/templateCode/templateName/type
 * - 后端字段：modelConfigTemplateId/modelConfigTemplateCode/modelConfigTemplateName/modelConfigTemplateType
 */
export const buildTemplateParamsFromPopup = (paramList: any[] = []): DoCalculationPointTemplateParam[] => {
  return (Array.isArray(paramList) ? paramList : [])
    .map((p) => {
      return {
        // 后端下发是什么类型就原样透传（目前为 string）
        modelConfigTemplateId: String(p?.templateId ?? p?.templateID ?? p?.id ?? '').trim(),
        modelConfigTemplateCode: String(p?.templateCode ?? p?.templateCode ?? p?.code ?? ''),
        modelConfigTemplateName: String(p?.templateName ?? p?.name ?? ''),
        modelConfigTemplateType: String(p?.type ?? ''),
      }
    })
    .filter((p) => p.modelConfigTemplateId && p.modelConfigTemplateCode && p.modelConfigTemplateName)
}

export const algoApi = {
  /**
   * 灵衍值计算接口（试算）
   * - POST /api/v1/algo/doCalculationPoint
   */
  doCalculationPoint(payload: DoCalculationPointTestParams) {
    return request.post('/v1/algo/doCalculationPoint', payload) as unknown as Promise<ApiResponse<any>>
  },

  /**
   * 灵衍值计算接口（提交）
   * - POST /api/v1/algo/submit
   */
  submit(payload: DoCalculationPointPayload) {
    return request.post('/v1/algo/submit', payload) as unknown as Promise<ApiResponse<any>>
  },

  /**
   * 查询算法生成（状态轮询）
   * - GET /api/v1/algo/query
   * - orderNo[string] 提交接口返回的订单号
   */
  query(params: { orderNo: string }) {
    return request.get('/v1/algo/query', { params: { orderNo: params.orderNo } }) as unknown as Promise<ApiResponse<any>>
  },

  /**
   * 收藏/取消收藏算法生成结果
   * - POST /api/v1/algo/collect
   *
   * 接口参数：
   * - algoOrderResultId: 算法生成结果ID数组（字段名保持不变）
   */
  collect(params: { algoOrderResultId: string[] }) {
    return request.post('/v1/algo/collect', {
      algoOrderResultId: params.algoOrderResultId || [],
    }) as unknown as Promise<ApiResponse<any>>
  },

  /**
   * 删除算法生成结果
   * - POST /api/v1/algo/del
   *
   * 接口参数：
   * - algoOrderResultId: 算法生成结果ID数组（字段名保持不变）
   */
  del(params: { algoOrderResultId: string[] }) {
    return request.post('/v1/algo/del', {
      algoOrderResultId: params.algoOrderResultId || [],
    }) as unknown as Promise<ApiResponse<any>>
  },

  /**
   * 获取功能模块下的创意描述推荐（“试一试”）
   * - GET /api/v1/algo/getFunctionPrompt
   *
   * 参数：
   * - menuId[string] 功能模块Id
   */
  getFunctionPrompt(params: { menuId: string }) {
    return request.get('/v1/algo/getFunctionPrompt', { params }) as unknown as Promise<ApiResponse<any>>
  },

  /**
   * 算法结果反馈内容配置信息
   * - GET /api/v1/app/findAlgorithmResultFeedback
   */
  findAlgorithmResultFeedback() {
    return request.get('/v1/app/findAlgorithmResultFeedback') as unknown as Promise<ApiResponse<any[]>>
  },

  /**
   * 提交算法结果反馈内容
   * - POST /api/v1/app/submitAlgorithmResult
   */
  submitAlgorithmResult(params: {
    algoOrderId: string
    algoOrderResultId: string
    content: string
  }) {
    return request.post('/v1/app/submitAlgorithmResult', params) as unknown as Promise<ApiResponse<any>>
  },

  /**
   * 生成结果列表
   * - GET /api/v1/algo/queryAlgoResultPage
   *
   * 参数（queryString）：
   * - menuCode: 功能菜单 code；传空字符串表示不限定模块
   * - fileType: 生成类型 1图片 2视频 3音频 4音视频；空字符串表示不限定类型
   * - collectStatus: 收藏筛选；空字符串表示不限定；'1' 表示仅已收藏
   * - currentPage: 当前页码
   * - pageSize: 每页数量
   */
  queryAlgoResultPage(params: {
    menuCode: string
    fileType: string
    collectStatus: string
    currentPage: number
    pageSize: number
  }) {
    return request.get('/v1/algo/queryAlgoResultPage', { params }) as unknown as Promise<ApiResponse<any>>
  },

  /**
   * 获取算法结果详情
   * - GET /api/v1/algo/getAlgoResultDetails
   * - algoResulId: 生成结果ID（后端字段名按文档：algoResulId）
   */
  getAlgoResultDetails(params: { algoResulId: string }) {
    return request.get('/v1/algo/getAlgoResultDetails', { params }) as unknown as Promise<ApiResponse<any>>
  },
}

export default algoApi

