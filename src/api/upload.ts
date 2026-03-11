import request from '@/utils/request'

export const uploadApi = {
  uploadFile(params: any) {
    return request.post('/upload/file', params, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  // 兼容旧调用
  uploadImage(params: any) {
    return request.post('/upload/image', params, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
}

export default uploadApi

