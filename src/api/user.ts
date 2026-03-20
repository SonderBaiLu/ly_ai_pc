import request from '@/utils/request'
import type { ApiResponse } from '@/types'

/**
 * 用户相关接口（最小可用封装）
 * 说明：原文件为空导致 “is not a module”，这里补齐最小导出。
 */
export const userApi = {
  getUserLikesPage(params: any) {
    return request.post('/user/getUserLikesPage', params) as unknown as Promise<ApiResponse<any>>
  },
  userLikes(params: any) {
    return request.post('/user/userLikes', params) as unknown as Promise<ApiResponse<any>>
  },
  /**
   * 收藏/取消收藏（假的占位接口）
   * 说明：统一使用新返回结构：{ code, success, msg, data, extend }
   */
  userCollect(params: any) {
    return request.post('/user/userCollect', params) as unknown as Promise<ApiResponse<{ collectId?: string | number }>>
  },
  // 用户注销 
  usercancellation() {
    return request.get('/v1/login/userCancellation')
  },
  updateUserInfo(params: any) {
    return request.post('/user/updateUserInfo', params) as unknown as Promise<ApiResponse<any>>
  },
  // 获取用户是否设置了密码 返回 true or false
  getUserSetPwd() {
    return request.get('/v1/pwd/isSetPwd')
  },
  // 修改密码 - 有旧密码的情况下
  changePwdByOldPwd(params: any) {
    return request.post("/v1/pwd/changePwdByOldPwd", params) as unknown as Promise<ApiResponse<any>>
  },
  // 验证邀请码
  checkInvitationsCode(params:{ invitationsCode: any }){
    const res = request.get('/v1/user/checkInvitationsCode',{ params })
    console.log("接口获取的参数为:",params)
    return res
  }
}

export default userApi

