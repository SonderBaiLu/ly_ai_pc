import { defineStore } from 'pinia'

export const useModalStore = defineStore('modal', {
  state: () => ({
    // 统一管理一些全局弹窗开关（按需扩展）
    showMembershipModal: false,
    showPersonalSettingsModal: false,
    showWriteOffModal: false,
  }),
  actions: {
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
  },
})

