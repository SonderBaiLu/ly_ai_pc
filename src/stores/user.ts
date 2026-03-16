import { defineStore } from 'pinia'
// 引入AIP接口
import { loginBySmsCodeApi, loginByPwd } from '@/api/userLogin.ts'
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
    // 专门用来保存 token 和用户信息
    setAuthData(token: string, userInfo: any){
      this.token = token
      this.userInfo = userInfo
      // 同步到本地存储
      if (token) localStorage.setItem('token', token)
      if (userInfo) localStorage.setItem('userInfo', JSON.stringify(userInfo))
    },
    //短信验证码登录
    async loginWithSms(mobile: string, verifyCode: string) {
      const res = await loginBySmsCodeApi({mobile, verifyCode})
      // 提取后端返回的数据
      const {token, userInfo} = (res.data as any) || {}
      // 调用 setAuthData 保存状态
      this.setAuthData(token, userInfo)
    },
    // 密码登录
    async loginWithPassword(mobile: string, pwd: string) {
      const res = await loginByPwd({mobile,pwd})
      const {token, userInfo} = (res.data as any)
      this.setAuthData(token, userInfo)
    },
    async getUserInfo(_phone: string) {
      // TODO: 对接真实接口后替换
      return this.userInfo
    },
    setUserInfo(info: UserInfo | null) {
      this.userInfo = info
      if(info){
        localStorage.setItem('userInfo', JSON.stringify(info))
      }else {
        localStorage.removeItem('userInfo')
      }
    },
    logout() {
      this.token = ''
      this.userInfo = null
      localStorage.removeItem('token')
      localStorage.removeItem('userInfo')
    },
  },
})

