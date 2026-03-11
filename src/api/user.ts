import request from '@/utils/request'

/**
 * 用户相关接口（最小可用封装）
 * 说明：原文件为空导致 “is not a module”，这里补齐最小导出。
 */
export const userApi = {
  getUserLikesPage(params: any) {
    return request.post('/user/getUserLikesPage', params)
  },
  userLikes(params: any) {
    return request.post('/user/userLikes', params)
  },
  writeOff(params: any) {
    return request.post('/user/writeOff', params)
  },
  updateUserInfo(params: any) {
    return request.post('/user/updateUserInfo', params)
  },
}

export default userApi

