import { defineStore } from 'pinia'

export interface UserInfo {
  userId?: string | number
  phone?: string
  isVip?: number
  token?: string
  [key: string]: any
}

export const useUserStore = defineStore('user', {
  state: () => ({
    userInfo: null as UserInfo | null,
  }),
  getters: {
    isLoggedIn: (state) => !!state.userInfo?.token,
  },
  actions: {
    async getUserInfo(_phone: string) {
      // TODO: 对接真实接口后替换
      return this.userInfo
    },
    setUserInfo(info: UserInfo | null) {
      this.userInfo = info
    },
    logout() {
      this.userInfo = null
    },
  },
})

