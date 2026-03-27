import { defineStore } from 'pinia'
// 引入API接口
import { loginBySmsCodeApi, loginByPwd, teamLogin, getUserDetailsApi, logout } from '@/api/userLogin'
import { userApi } from '@/api/user'

export interface UserInfo {
  userId?: string | number
  phone?: string
  isVip?: number
  token?: string
  [key: string]: any
}

const getVipDisplayText = (vipType?: number, vipLevel?: number, emptyText = '未开通会员') => {
  const tVipType = Number(vipType ?? 0)
  const tVipLevel = Number(vipLevel ?? 0)

  if (tVipType === 0 && tVipLevel === 0) return emptyText

  const tierTextMap: Record<number, string> = {
    1: '基础版',
    2: '标准版',
    3: '高级版',
  }
  const periodTextMap: Record<number, string> = {
    1: '月度会员',
    2: '季度会员',
    3: '年度会员',
  }

  const tierText = tierTextMap[tVipLevel] || ''
  const periodText = periodTextMap[tVipType] || ''

  return tierText && periodText ? `${tierText}-${periodText}` : '会员版'
}

export const useUserStore = defineStore('user', {
  state: () => ({
    // 初始化时尝试从 localStorage 读取，防止刷新页面后丢失登录状态
    token: localStorage.getItem('token') || '',
    userInfo: JSON.parse(localStorage.getItem('userInfo') || 'null'),
  }),
  getters: {
    isLoggedIn: (state) => !!state.token,
    // 统一 VIP 展示文案（用于 Header/Membership 等回显）
    // vipType: 0 普通用户；1 月度会员；2 季度会员；3 年度会员
    // vipLevel: 0 普通用户；1 基础；2 标准；3 高级
    vipDisplayText: (state) => {
      const info: any = state.userInfo || {}
      return getVipDisplayText(info.vipType, info.vipLevel, '未开通会员')
    },
    // Membership 页面使用“免费版”作为空状态文案（与 Header 不同）
    vipMembershipDisplayText: (state) => {
      const info: any = state.userInfo || {}
      return getVipDisplayText(info.vipType, info.vipLevel, '免费版')
    },
  },

  actions: {
    // 单独保存Token
    setToken(token: string) {
      this.token = token
      if (token) {
        localStorage.setItem('token', token);
      } else {
        localStorage.removeItem('token')
      }
    },

    setUserInfo(info: UserInfo | null) {
      this.userInfo = info
      if (info) {
        localStorage.setItem('userInfo', JSON.stringify(info))
      } else {
        localStorage.removeItem('userInfo')
      }
    },

    async getUserInfo() {
      try {
        const res = await getUserDetailsApi()
        const detailInfo = res.data
        this.setUserInfo(detailInfo) // 存储数据
        return detailInfo
      } catch (error) {
        console.error('获取用户详细信息失败', error)
      }
    },

    // 统一更新用户信息：调用后端接口并刷新 userInfo，避免各页面分散维护刷新逻辑
    async updateUserInfo(params: any, successMessage: string = '保存成功') {
      console.log('[userStore] updateUserInfo', params, successMessage)
      try {
        const res = await userApi.updateUserInfo({ ...params })
        if (String((res as any)?.code) === '0000') {
          ElMessage.success(successMessage)
          await this.getUserInfo()
        }
        return res
      } catch (error) {
        console.error('更新用户信息失败:', error)
        throw error
      }
    },

    // 短信验证码登录
    async loginWithSms(mobile: string, verifyCode: string, confirmedInviteCode: string) {
      const res = await loginBySmsCodeApi({ mobile, verifyCode, confirmedInviteCode })
      const tokenStr = res.data?.accessToken
      this.setToken(tokenStr)
      await this.getUserInfo()
    },

    // 密码登录
    async loginWithPassword(mobile: string, pwd: string) {
      const res = await loginByPwd({ mobile, pwd })
      if (String((res as any).code) === '0000') {
        const tokenStr = res.data?.accessToken
        this.setToken(tokenStr)
        await this.getUserInfo()
        return
      }
    },

    // 团队密码登录
    async teamLogin(userName: string, pwd: string) {
      const res = await teamLogin({ userName, pwd })
      if (String((res as any).code) === '0000') {
        const tokenStr = res.data?.accessToken
        this.setToken(tokenStr)
        await this.getUserInfo()
      }
    },

    async logout() {
      try {
        await logout()
      } catch (error) {
        console.error('退出登录接口失败', error)
      } finally {
        // 无论接口是否成功，都先清理本地登录态，保证 UI 立即切回未登录
        this.setToken('')
        this.setUserInfo(null)
      }
    }
  }
})
