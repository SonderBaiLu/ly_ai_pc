import { defineStore } from 'pinia'
// 引入API接口
import { loginBySmsCodeApi, loginByPwd, teamLogin, getUserDetailsApi, logout } from '@/api/userLogin'

export interface UserInfo {
  userId?: string | number
  phone?: string
  isVip?: number
  token?: string
  [key: string]: any
}

export const useUserStore = defineStore('user', {
  state: () => ({
    // 初始化时尝试从 localStorage 读取，防止刷新页面后丢失登录状态
    token: localStorage.getItem('token') || '',
    userInfo: JSON.parse(localStorage.getItem('userInfo') || 'null'),
  }),
  getters: {
    isLoggedIn: (state) => !!state.token,
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
        throw error
      }
    },

    // 短信验证码登录
    async loginWithSms(mobile: string, verifyCode: string, confirmedInviteCode:string) {
      const res = await loginBySmsCodeApi({ mobile, verifyCode, confirmedInviteCode})
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
      const tokenStr = res.data?.accessToken
      this.setToken(tokenStr)
      await this.getUserInfo()
    },

    logout() {
      const res = logout();
      if (String((res as any).code) === '0000') {
        this.setToken('')
        this.setUserInfo(null)
      }
    }
  }
})
