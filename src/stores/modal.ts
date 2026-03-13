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
      this.showWatermarkDisclaimerModal = true
    },
    closeWatermarkDisclaimerModal() {
      this.showWatermarkDisclaimerModal = false
    },
  },
})

