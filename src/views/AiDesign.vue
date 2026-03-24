<template>
  <div class="ai-design" :style="{ backgroundImage: `url(${images.homeBg})` }">
    <Header />

    <main class="ai-main">
      <!-- 头部大图轮播 -->
      <section class="ai-banner">
        <el-carousel height="350px" indicator-position="outside">
          <el-carousel-item v-for="index in 3" :key="index">
            <img src="@/assets/images/home/banner.png" alt="AI Design Banner" class="banner-img" />
          </el-carousel-item>
        </el-carousel>
      </section>

      <!-- 一级菜单切换（接口） -->
      <section class="ai-switch">
        <div v-if="firstLevelMenus.length" class="switch-toggle">
          <button v-for="menu in firstLevelMenus" :key="menu.id || menu.menuCode" class="switch-btn" type="button"
            :class="{ active: activeTabCode === menu.menuCode }" @click="activeTabCode = menu.menuCode || ''">
            {{ menu.menuName }}
          </button>
        </div>

        <!-- 二级菜单卡片（接口） -->
        <div class="card-row" :class="{ 'card-row--single': secondLevelCards.length === 1 }">
          <div v-for="(card, index) in secondLevelCards" :key="card.id || card.menuCode" class="feature-card"
            role="button" tabindex="0" @click="() => goToStudio(getModeByMenuCode(card.menuCode))">
            <div class="card-image">
              <img :src="card.imgUrl || images[`aiDesign${index + 1}` as keyof typeof images]" alt="" />
            </div>
            <div class="card-content">
              <h3 class="card-title">
                {{ card.menuName || '' }}
              </h3>
              <p class="card-desc">
                {{ card.functionDesc || '' }}
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { images } from '@/assets'
import { computed, onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useAuthGate } from '@/composables/useAuthGate'
import { appApi, type SysPlatformMenuItem } from '@/api/app'
import { APP_MENU_CODES } from '@/constants/appMenuCode'

type StudioMode = 'aiFashion' | 'sketchToReal' | 'realToSketch' | 'fabricCreative'

const activeTabCode = ref('')
const router = useRouter()
const { requireAuth } = useAuthGate()
const menuList = ref<SysPlatformMenuItem[]>([])

const goToStudio = (mode: StudioMode) => {
  // 点击模块入口时再做登录引导：未登录弹窗，已登录跳转
  requireAuth(() => {
    router.push({ name: 'AiFashionStudio', query: { mode } })
  })
}

const firstLevelMenus = computed(() => {
  return menuList.value.filter((item) => item.parentId === '0')
})

const activeFirstLevelMenu = computed(() => {
  if (!firstLevelMenus.value.length) return null
  if (!activeTabCode.value) return firstLevelMenus.value[0]
  return firstLevelMenus.value.find((item) => item.menuCode === activeTabCode.value) || firstLevelMenus.value[0]
})

const menuCodeModeMap: Record<string, StudioMode> = {
  [APP_MENU_CODES.AI_FASHION_DESIGN]: 'aiFashion',
  [APP_MENU_CODES.LINE_DRAW_TO_PHYS_OBJ]: 'sketchToReal',
  [APP_MENU_CODES.PHYS_OBJ_TO_LINE_DRAW]: 'realToSketch',
  [APP_MENU_CODES.FABRIC_DESIGN_CONCEPT]: 'fabricCreative',
}

const getModeByMenuCode = (menuCode?: string): StudioMode => {
  if (!menuCode) return 'fabricCreative'
  return menuCodeModeMap[menuCode] || 'fabricCreative'
}

const secondLevelCards = computed<SysPlatformMenuItem[]>(() => {
  const children = activeFirstLevelMenu.value?.children || []
  return children
})

const fetchSysPlatformMenu = async () => {
  try {
    const res = await appApi.getSysPlatformMenu()
    menuList.value = Array.isArray(res.data) ? res.data : []
    activeTabCode.value = firstLevelMenus.value[0]?.menuCode || ''
  } catch (error: any) {
    menuList.value = []
    ElMessage.error(error?.message || '获取功能列表失败')
  }
}

onMounted(() => {
  fetchSysPlatformMenu()
})
</script>

<style scoped lang="scss">
.ai-design {
  min-height: 100vh;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  display: flex;
  flex-direction: column;
}

.ai-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-bottom: $spacing-4xl;
  position: relative;
}

.ai-banner {
  width: 90vw;
  margin-top: 52px;

  :deep(.el-carousel__container) {
    border-radius: $border-radius-xl;
    overflow: hidden;
  }
}

.ai-switch {
  margin-top: 89px;
  width: 100%;
  max-width: 1200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $spacing-2xl;
}

.switch-toggle {
  display: inline-flex;
  padding: 7px 8px;
  border-radius: 9999px;
  background: $color-bg-dark-tertiary;

  .switch-btn {
    min-width: 118px;
    padding: 10px 23px;
    border-radius: 9999px;
    border: none;
    background: transparent;
    color: $color-text-gray;
    font-size: $font-size-md;
    font-weight: $font-weight-medium;
    cursor: pointer;
    transition: all $transition-base;
  }

  .switch-btn.active {
    background: radial-gradient(0.5% 0.5% at 50% 50%, rgba(23, 160, 225, 1) 0%, rgba(112, 197, 237, 1) 100%);
    color: $color-text-white;
  }
}

.card-row {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: $spacing-xl;
  width: 100%;
}

.card-row--single {
  grid-template-columns: minmax(0, 378px);
  justify-content: center;
}

.feature-card {
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.45);
  display: flex;
  flex-direction: column;
  background: url('@/assets/images/ai_design_bg.png') no-repeat center bottom;
}

.card-image {
  width: 100%;
  height: auto;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
}

.card-content {
  padding: 10px;
  color: $color-text-white;


  .card-title {
    font-size: $font-size-lg;
    font-weight: $font-weight-bold;
    margin-bottom: $spacing-xs;
  }

  .card-desc {
    font-size: $font-size-sm;
  }
}

@media (max-width: 1024px) {
  .card-row {
    grid-template-columns: repeat(1, minmax(0, 1fr));
  }
}
</style>
