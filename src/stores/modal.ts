import { defineStore } from 'pinia'

export const useModalStore = defineStore('modal', {
  state: () => ({
    // 统一管理一些全局弹窗开关（按需扩展）
    showLoginModal: false,
    showMembershipModal: false,
    showPersonalSettingsModal: false,
    showWriteOffModal: false,
    showContactUsModal: false,
    showWatermarkDisclaimerModal: false,
    watermarkDisclaimerVariant: 'more' as 'more' | 'page',
    // 责任声明弹窗确认/取消的全局 token（用于不同页面在 App.vue 中渲染弹窗时联动逻辑）
    watermarkDisclaimerConfirmToken: 0,
    watermarkDisclaimerCancelToken: 0,
  }),
  actions: {
    openLoginModal() {
      this.showLoginModal = true
    },
    closeLoginModal() {
      this.showLoginModal = false
    },
    openMembershipModal() {
      this.showMembershipModal = true
    },
    closeMembershipModal() {
      this.showMembershipModal = false
    },
    openPersonalSettingsModal() {
      this.showPersonalSettingsModal = true
    },
    closePersonalSettingsModal() {
      this.showPersonalSettingsModal = false
    },
    openWriteOffModal() {
      this.showWriteOffModal = true
    },
    closeWriteOffModal() {
      this.showWriteOffModal = false
    },
    openContactUsModal() {
      this.showContactUsModal = true
    },
    closeContactUsModal() {
      this.showContactUsModal = false
    },
    openWatermarkDisclaimerModal() {
      this.watermarkDisclaimerVariant = 'more'
      this.showWatermarkDisclaimerModal = true
    },
    openWatermarkDisclaimerModalPage() {
      this.watermarkDisclaimerVariant = 'page'
      this.showWatermarkDisclaimerModal = true
    },
    closeWatermarkDisclaimerModal() {
      this.showWatermarkDisclaimerModal = false
    },
    notifyWatermarkDisclaimerConfirmed() {
      this.watermarkDisclaimerConfirmToken += 1
    },
    notifyWatermarkDisclaimerCancelled() {
      this.watermarkDisclaimerCancelToken += 1
    },
  },
})

