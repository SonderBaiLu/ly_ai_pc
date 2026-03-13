import request from '@/utils/request'
import type { ApiResponse } from '@/types'

/**
 * 创作相关接口（最小可用封装）
 * 说明：当前项目部分页面依赖这些方法；具体路径请按后端实际再调整。
 */
export const creativeApi = {
  getCreativeTemplateDetail(params: any) {
    return request.post('/creative/getCreativeTemplateDetail', params) as unknown as Promise<ApiResponse<any>>
  },
  getCreativeTemplateList(params: any) {
    return request.post('/creative/getCreativeTemplateList', params) as unknown as Promise<ApiResponse<any>>
  },
  imageEdit(params: any) {
    return request.post('/creative/imageEdit', params) as unknown as Promise<ApiResponse<any>>
  },
  findAlgorithmResult(params: any) {
    return request.post('/creative/findAlgorithmResult', params) as unknown as Promise<ApiResponse<any>>
  },
  findAlgorithmResulList(params: any) {
    return request.post('/creative/findAlgorithmResulList', params) as unknown as Promise<ApiResponse<any>>
  },
  /**
   * 保存用户上传资源记录（用于“我的资产/我的上传”等）
   */
  saveUserResource(params: any) {
    return request.post('/creative/saveUserResource', params) as unknown as Promise<ApiResponse<any>>
  },
}

export default creativeApi

