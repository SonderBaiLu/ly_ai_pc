import request from '@/utils/request'

/**
 * 创作相关接口（最小可用封装）
 * 说明：当前项目部分页面依赖这些方法；具体路径请按后端实际再调整。
 */
export const creativeApi = {
  getCreativeTemplateDetail(params: any) {
    return request.post('/creative/getCreativeTemplateDetail', params)
  },
  getCreativeTemplateList(params: any) {
    return request.post('/creative/getCreativeTemplateList', params)
  },
  imageEdit(params: any) {
    return request.post('/creative/imageEdit', params)
  },
  findAlgorithmResult(params: any) {
    return request.post('/creative/findAlgorithmResult', params)
  },
  findAlgorithmResulList(params: any) {
    return request.post('/creative/findAlgorithmResulList', params)
  },
}

export default creativeApi

