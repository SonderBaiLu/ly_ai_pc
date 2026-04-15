<template>
  <div class="home" :style="{ backgroundImage: `url(${images.homeBg})` }">
    <Header />

    <main class="main-content">
      <HeroSection />
      <!-- 非首屏统一交给一个异步聚合组件，Home 保持简洁 -->
      <Suspense>
        <template #default>
          <HomeSections />
        </template>
        <template #fallback>
          <div class="section-skeleton section-skeleton--all" />
        </template>
      </Suspense>

    </main>

    <Footer />
  </div>
</template>

<script setup lang="ts">
import { defineAsyncComponent } from 'vue'
import { images } from '@/assets'
import { useUserStore } from '@/stores/user'

// 首页首屏只保留 Hero 同步渲染，其余模块异步加载
const HomeSections = defineAsyncComponent(() => import('@/sections/home/HomeSections.vue'))

const userStore = useUserStore()

const refreshUserInfoIfLoggedIn = async () => {
  if (!userStore.isLoggedIn) return
  try {
    await userStore.getUserInfo()
  } catch (e) {
    console.warn('[Home] refreshUserInfoIfLoggedIn failed:', e)
  }
}

// const USER_INFO_REFRESH_INTERVAL_MS = 30 * 60 * 1000 // 30 分钟
// let userInfoRefreshTimer: ReturnType<typeof setInterval> | null = null
// let isRefreshingUserInfo = false

// const startUserInfoRefreshTimer = () => {
//   if (userInfoRefreshTimer) return
//   userInfoRefreshTimer = setInterval(async () => {
//     // 防止网络抖动时并发拉取
//     if (isRefreshingUserInfo) return
//     isRefreshingUserInfo = true
//     try {
//       await refreshUserInfoIfLoggedIn()
//     } finally {
//       isRefreshingUserInfo = false
//     }
//   }, USER_INFO_REFRESH_INTERVAL_MS)
// }

// const stopUserInfoRefreshTimer = () => {
//   if (!userInfoRefreshTimer) return
//   clearInterval(userInfoRefreshTimer)
//   userInfoRefreshTimer = null
// }

onMounted(async () => {
  await refreshUserInfoIfLoggedIn()
  // if (userStore.isLoggedIn) startUserInfoRefreshTimer()
})

// 如果路由被 keep-alive 缓存，切回来时也刷新一次
onActivated(() => {
  refreshUserInfoIfLoggedIn()
  // if (userStore.isLoggedIn) startUserInfoRefreshTimer()
})

// 兜底：页面已打开但登录态刚刷新完（token 改变）时刷新
watch(
  () => userStore.isLoggedIn,
  (loggedIn) => {
    if (loggedIn) {
      void refreshUserInfoIfLoggedIn()
      // startUserInfoRefreshTimer()
    } else {
      // stopUserInfoRefreshTimer()
    }
  },
)

onBeforeUnmount(() => {
  // stopUserInfoRefreshTimer()
})
</script>

<style scoped lang="scss">
.section-skeleton {
  width: 100%;
  border-radius: 24px;
  margin: 0 auto;
  background: rgba(255, 255, 255, 0.04);
}

.section-skeleton--all {
  height: 3640px;
}
</style>
