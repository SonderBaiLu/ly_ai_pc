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

      <!-- 服装设计 / AI 面料 切换 -->
      <section class="ai-switch">
        <div class="switch-toggle">
          <button class="switch-btn" type="button" :class="{ active: activeTab === 'design' }"
            @click="activeTab = 'design'">
            {{ t('aiDesign.tabs.design') }}
          </button>
          <button class="switch-btn" type="button" :class="{ active: activeTab === 'fabric' }"
            @click="activeTab = 'fabric'">
            {{ t('aiDesign.tabs.fabric') }}
          </button>
        </div>

        <!-- 服装设计卡片：点击跳转到工作台对应模块 -->
        <div v-if="activeTab === 'design'" class="card-row">
          <div v-for="card in designCards" :key="card.titleKey" class="feature-card" role="button" tabindex="0"
            @click="() => goToStudio(card.mode)">
            <div class="card-image">
              <img :src="card.img" alt="" />
            </div>
            <div class="card-content">
              <h3 class="card-title">
                {{ t(card.titleKey) }}
              </h3>
              <p class="card-desc">
                {{ t(card.descKey) }}
              </p>
            </div>
          </div>
        </div>

        <!-- AI 面料卡片：点击跳转到面料创拍模块 -->
        <div v-else class="card-row card-row--single">
          <div class="feature-card" role="button" tabindex="0" @click="() => goToStudio('fabricCreative')">
            <div class="card-image">
              <img src="@/assets/images/ai_design4.png" alt="" />
            </div>
            <div class="card-content">
              <h3 class="card-title">
                {{ t('aiDesign.fabric.title') }}
              </h3>
              <p class="card-desc">
                {{ t('aiDesign.fabric.desc') }}
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
import { useI18n } from 'vue-i18n'
import { images } from '@/assets'

type StudioMode = 'aiFashion' | 'sketchToReal' | 'realToSketch' | 'fabricCreative'

const activeTab = ref<'design' | 'fabric'>('design')
const { t } = useI18n()
const router = useRouter()

const designCards: Array<{
  img: string
  titleKey: string
  descKey: string
  mode: StudioMode
}> = [
    {
      img: images.aiDesign1,
      titleKey: 'aiDesign.cards.design.title',
      descKey: 'aiDesign.cards.design.desc',
      mode: 'aiFashion',
    },
    {
      img: images.aiDesign2,
      titleKey: 'aiDesign.cards.sketchToReal.title',
      descKey: 'aiDesign.cards.sketchToReal.desc',
      mode: 'sketchToReal',
    },
    {
      img: images.aiDesign3,
      titleKey: 'aiDesign.cards.realToSketch.title',
      descKey: 'aiDesign.cards.realToSketch.desc',
      mode: 'realToSketch',
    },
  ]

const goToStudio = (mode: StudioMode) => {
  router.push({ name: 'AiFashionStudio', query: { mode } })
}
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
