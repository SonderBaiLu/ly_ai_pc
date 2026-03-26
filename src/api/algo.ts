import request from '@/utils/request'
import type { ApiResponse } from '@/types'

export type DoCalculationPointTemplateParam = {
  /** 模版入参主键（后端：modelConfigTemplateId） */
  modelConfigTemplateId: number
  /** 模版入参 code（后端：modelConfigTemplateCode） */
  modelConfigTemplateCode: string
  /** 模版入参名称（后端：modelConfigTemplateName） */
  modelConfigTemplateName: string
  /** 模版入参类型（后端：modelConfigTemplateType） */
  modelConfigTemplateType: string
}

export type DoCalculationPointPayload = {
  /** 算法模型 id（后端：modelConfigId） */
  modelConfigId: number
  /** 算法模型 code（后端：modelConfigCode） */
  modelConfigCode: string
  /** 算法模型名称（后端：modelConfigName） */
  modelConfigName: string
  /** 功能模块 code（后端：menuCode） */
  menuCode: string
  /** 模版入参（后端：templateParams） */
  templateParams: DoCalculationPointTemplateParam[]
}

/**
 * 从前端 ImageParamPopup 返回的 paramList 映射到后端 doCalculationPoint 所需结构。
 * - ImageParamPopup 返回字段（前端）：templateId/templateCode/templateName/type
 * - 后端字段：modelConfigTemplateId/modelConfigTemplateCode/modelConfigTemplateName/modelConfigTemplateType
 */
export const buildTemplateParamsFromPopup = (paramList: any[] = []): DoCalculationPointTemplateParam[] => {
  return (Array.isArray(paramList) ? paramList : [])
    .map((p) => {
      const id = Number(p?.templateId ?? p?.templateID ?? p?.id ?? 0)
      return {
        modelConfigTemplateId: Number.isFinite(id) ? id : 0,
        modelConfigTemplateCode: String(p?.templateCode ?? p?.templateCode ?? p?.code ?? ''),
        modelConfigTemplateName: String(p?.templateName ?? p?.name ?? ''),
        modelConfigTemplateType: String(p?.type ?? ''),
      }
    })
    .filter((p) => p.modelConfigTemplateId > 0 && p.modelConfigTemplateCode && p.modelConfigTemplateName)
}

export const algoApi = {
  /**
   * 灵衍值计算接口
   * - POST /api/v1/algo/doCalculationPoint
   */
  doCalculationPoint(payload: DoCalculationPointPayload) {
    return request.post('/v1/algo/doCalculationPoint', payload) as unknown as Promise<ApiResponse<any>>
  },

  /**
   * 查询算法生成（状态轮询）
   * - GET /api/v1/algo/query
   * - algoOrderId[string] 生成订单ID
   */
  query(params: { algoOrderId: string; userId?: string }) {
    return request.get('/v1/algo/query', { params }) as unknown as Promise<ApiResponse<any>>
  },

  /**
   * 收藏/取消收藏算法生成结果
   * - GET /api/v1/algo/collect
   *
   * 接口参数：
   * - algoOrderResultId: 算法生成结果ID
   */
  collect(params: { algoOrderResultId: string }) {
    return request.get('/v1/algo/collect', { params }) as unknown as Promise<ApiResponse<any>>
  },

  /**
   * 删除算法生成结果
   * - GET /api/v1/algo/del
   *
   * 接口参数：
   * - algoOrderResultId: 算法生成结果ID
   */
  del(params: { algoOrderResultId: string }) {
    return request.get('/v1/algo/del', { params }) as unknown as Promise<ApiResponse<any>>
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
   * - menuCode: 功能菜单code
   * - fileType: 生成类型 1图片 2视频 3音频 4音视频
   * - collectStatus: 收藏状态 0未收藏 1已收藏
   * - currentPage: 当前页码
   * - offset: 每页数量
   */
  queryAlgoResultPage(params: {
    menuCode: string
    fileType: string
    collectStatus: string
    currentPage: number
    offset: number
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

