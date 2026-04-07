import request from '@/utils/request'
import type { ApiResponse } from '@/types'

export interface UserInvitationsData {
  invitationCode: string
  invitationCount: number
  invitationWaveCoin: number
  invitationMaxWaveCoin: number
}

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
   * 查询上传记录（我的上传）
   * POST /v1/user/getStorageLogList
   *
   * - currentPage：当前页（从 1 开始）
   * - pageSize：每页数量（若后端也支持 offset，请传 offset=pageSize）
   */
  getStorageLogList(params: { currentPage: number; pageSize: number }) {
    return request.post('/v1/user/getStorageLogList', params) as unknown as Promise<ApiResponse<any>>
  },
  /**
   * 删除上传记录（我的上传）
   * POST /v1/user/delStorageLog
   *
   * - logId：上传记录 id 数组（字段名仍为 logId）
   */
  delStorageLog(params: { logId: Array<string | number> }) {
    return request.post('/v1/user/delStorageLog', params) as unknown as Promise<ApiResponse<any>>
  },
  /**
   * 收藏/取消收藏（假的占位接口）
   * 说明：统一使用新返回结构：{ code, success, msg, data, extend }
   */
  userCollect(params: any) {
    return request.post('/user/userCollect', params) as unknown as Promise<ApiResponse<{ collectId?: string | number }>>
  },

  /**
   * 用户消息列表
   * - POST /v1/user/getUserMsgPage
   *
   * 规则：
   * - readStatus 不传 或为 '-'：不带该字段，让后端走默认“全部”
   */
  getUserMsgPage(params: { currentPage: number; offset: number; readStatus?: string }) {
    const { currentPage, offset, readStatus } = params

    const payload: any = {
      currentPage,
      // swagger 文案：offset=每页数量
      offset,
    }

    const rs = readStatus == null ? '' : String(readStatus).trim()
    if (rs && rs !== '-') {
      payload.readStatus = rs
    }

    return request.post('/v1/user/getUserMsgPage', payload) as unknown as Promise<ApiResponse<any>>
  },
  // 用户注销
  usercancellation() {
    return request.get('/v1/login/userCancellation')
  },
  // 更新用户信息
  updateUserInfo(params: any) {
    return request.post('/v1/user/updateUserInfo', params) as unknown as Promise<ApiResponse<any>>
  },
  // 获取用户是否设置了密码 返回 true or false
  getUserSetPwd() {
    return request.get('/v1/pwd/isSetPwd')
  },
  // 修改密码 - 有旧密码的情况下
  changePwdByOldPwd(params: any) {
    console.log(params)
    return request.post("/v1/pwd/changePwdByOldPwd", params) as unknown as Promise<ApiResponse<any>>
  },
  // 验证邀请码
  checkInvitationsCode(params:{ invitationsCode: any }){
    return request.get('/v1/user/checkInvitationsCode',{ params })
  },
  // 邀请有礼数据
  getUserInvitations() {
    return request.get('/v1/user/getUserInvitations') as unknown as Promise<ApiResponse<UserInvitationsData>>
  },
}

export default userApi

