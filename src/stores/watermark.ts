import { defineStore } from 'pinia'

export const useWatermarkStore = defineStore('watermark', {
  state: () => ({
    removeWatermarkEnabled: false,
  }),
  actions: {
    setRemoveWatermarkEnabled(enabled: boolean) {
      this.removeWatermarkEnabled = !!enabled
    },
  },
})

