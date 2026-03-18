<template>
  <el-config-provider :z-index="zIndex" :size="size">
    <div class="app" :class="{ dark: isDark }">
      <router-view />

      <!-- 登录 -->
      <UserLogin v-if="modalStore.showLoginModal" @close="modalStore.closeLoginModal()" />

      <!-- 联系我们 -->
      <ContactModal v-model="modalStore.showContactUsModal" />

      <!-- 全局个人设置弹窗 -->
      <PersonalSettingsModal v-model="modalStore.showPersonalSettingsModal" @saved="handleSettingsSaved" />

      <!-- 灵衍AI 生成内容标识规则及责任声明 -->
      <WatermarkDisclaimerModal v-model="modalStore.showWatermarkDisclaimerModal" />

      <!-- 全局注销弹窗 -->
      <WriteOffModal v-model="modalStore.showWriteOffModal" />
    </div>
  </el-config-provider>
</template>

<script setup lang="ts">
import { ElConfigProvider } from 'element-plus'
import { useModalStore } from '@/stores/modal'

// 配置 Element Plus 暗黑主题
const isDark = ref(true)
const zIndex = 3000
const size = 'default'

// 全局弹窗状态
const modalStore = useModalStore()

// 个人设置保存后的回调
const handleSettingsSaved = () => {
  modalStore.closePersonalSettingsModal()
}

onMounted(() => {
  // 先自动打开一次个人设置弹窗，方便调试样式
  // modalStore.openPersonalSettingsModal()
  // 自动打开一下注销弹窗
  // modalStore.openWriteOffModal()
  // 自动打开一下联系我们弹窗
  // modalStore.openContactUsModal()
  // 自动打开一下登录弹窗
  // modalStore.openLoginModal()

  // 自动打开一下灵衍AI 生成内容标识规则及责任声明弹窗
  // modalStore.openWatermarkDisclaimerModal()
})
</script>

<style lang="scss"></style>
