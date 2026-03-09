import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', {
  state: () => ({
    language: 'zh',
    isLoading: false,
  }),
  actions: {
    setLanguage(lang: string) {
      this.language = lang
    },
    setLoading(loading: boolean) {
      this.isLoading = loading
    },
  },
})
