import { defineStore } from 'pinia'

export const useTemplateStore = defineStore('template', {
  state: () => ({
    // 缓存列表页跳转详情页时的列表数据（用于详情页“上一张/下一张”）
    templateListData: null as any,
  }),
  actions: {
    setTemplateListData(data: any) {
      this.templateListData = data
    },
    getTemplateListData() {
      return this.templateListData
    },
    clearTemplateListData() {
      this.templateListData = null
    },
  },
})

