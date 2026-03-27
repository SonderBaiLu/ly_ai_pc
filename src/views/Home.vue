<template>
  <div class="home" :style="{ backgroundImage: `url(${images.homeBg})` }">
    <Header />

    <main class="main-content">
      <HeroSection />
      <GallerySection />
      <FeaturesSection />
      <FabricSection />
      <ModelSection />
      <StatsSection />
      <DesignMatrixSection />

    </main>

    <Footer />
  </div>
</template>

<script setup lang="ts">
import { images } from '@/assets'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

const refreshUserInfoIfLoggedIn = async () => {
  if (!userStore.isLoggedIn) return
  try {
    await userStore.getUserInfo()
  } catch (e) {
    console.warn('[Home] refreshUserInfoIfLoggedIn failed:', e)
  }
}

onMounted(async () => {
  await refreshUserInfoIfLoggedIn()
})

// 如果路由被 keep-alive 缓存，切回来时也刷新一次
onActivated(() => {
  refreshUserInfoIfLoggedIn()
})

// 兜底：页面已打开但登录态刚刷新完（token 改变）时刷新
watch(
  () => userStore.isLoggedIn,
  (loggedIn) => {
    if (loggedIn) refreshUserInfoIfLoggedIn()
  },
)
</script>

<style scoped lang="scss"></style>
