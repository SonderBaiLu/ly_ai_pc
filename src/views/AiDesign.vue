<script setup lang="ts">
import { ref } from 'vue'
import homeBg from '@/assets/images/home_bg.png'

const activeTab = ref<'design' | 'fabric'>('design')

const banners = [
  {
    title: '灵衍 AI，让设计回归创造本质',
    desc: '一键生成灵感海报、模特大片和服装效果图',
  },
  {
    title: 'AI 服装设计工作台',
    desc: '从灵感、面料到成衣，完整 AI 设计流程',
  },
]
</script>

<template>
  <div class="ai-design" :style="{ backgroundImage: `url(${homeBg})` }">
    <Header />

    <main class="ai-main">
      <!-- 头部大图轮播 -->
      <section class="ai-banner">
        <el-carousel height="320px" indicator-position="outside">
          <el-carousel-item v-for="(item, index) in banners" :key="index">
            <div class="banner-inner">
              <h1 class="banner-title">{{ item.title }}</h1>
              <p class="banner-desc">{{ item.desc }}</p>
            </div>
          </el-carousel-item>
        </el-carousel>
      </section>

      <!-- 服装设计 / AI 面料 切换 -->
      <section class="ai-switch">
        <div class="switch-toggle">
          <button type="button" class="switch-btn" :class="{ active: activeTab === 'design' }"
            @click="activeTab = 'design'">
            服装设计
          </button>
          <button type="button" class="switch-btn" :class="{ active: activeTab === 'fabric' }"
            @click="activeTab = 'fabric'">
            AI 面料
          </button>
        </div>

        <!-- 服装设计卡片 -->
        <div v-if="activeTab === 'design'" class="card-row">
          <div class="feature-card">
            <h3 class="card-title">AI 服装设计</h3>
            <p class="card-desc">灵感不枯竭，文案直接变造型</p>
          </div>
          <div class="feature-card">
            <h3 class="card-title">线稿转实物</h3>
            <p class="card-desc">线稿变实物，设计不搁浅</p>
          </div>
          <div class="feature-card">
            <h3 class="card-title">实物转线稿</h3>
            <p class="card-desc">AI 智能生成服装线稿</p>
          </div>
        </div>

        <!-- AI 面料卡片 -->
        <div v-else class="card-row">
          <div class="feature-card">
            <h3 class="card-title">AI 面料花型</h3>
            <p class="card-desc">一句话生成高质感面料花型</p>
          </div>
          <div class="feature-card">
            <h3 class="card-title">面料风格迁移</h3>
            <p class="card-desc">将灵感图片迁移到面料纹理</p>
          </div>
          <div class="feature-card">
            <h3 class="card-title">成衣上身预览</h3>
            <p class="card-desc">一键预览面料在模特上的效果</p>
          </div>
        </div>
      </section>
    </main>

    <Footer />
  </div>
</template>

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
}

.ai-banner {
  width: 100%;
  max-width: 1440px;
  margin-top: $spacing-xl;

  :deep(.el-carousel__container) {
    border-radius: $border-radius-xl;
    overflow: hidden;
  }
}

.banner-inner {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  padding: 0 $spacing-3xl;
  background: linear-gradient(135deg,
      rgba(0, 0, 0, 0.75) 0%,
      rgba(15, 23, 42, 0.9) 40%,
      rgba(15, 23, 42, 0.2) 100%);
  color: $color-text-white;
}

.banner-title {
  font-size: $font-size-3xl;
  font-weight: $font-weight-bold;
  margin-bottom: $spacing-sm;
}

.banner-desc {
  font-size: $font-size-lg;
  color: $color-text-secondary;
}

.ai-switch {
  margin-top: $spacing-3xl;
  width: 100%;
  max-width: 1200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $spacing-2xl;
}

.switch-toggle {
  display: inline-flex;
  padding: 4px;
  border-radius: 9999px;
  background: rgba(15, 23, 42, 0.9);
}

.switch-btn {
  min-width: 140px;
  padding: 10px 32px;
  border-radius: 9999px;
  border: none;
  background: transparent;
  color: $color-text-gray;
  font-size: $font-size-md;
  cursor: pointer;
  transition: all $transition-base;
}

.switch-btn.active {
  background: linear-gradient(135deg, #17a0e1 0%, #70c5ed 50%, #96ddff 100%);
  color: $color-text-white;
}

.card-row {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: $spacing-xl;
  width: 100%;
}

.feature-card {
  padding: $spacing-xl-sm;
  border-radius: $border-radius-xl;
  background: radial-gradient(120% 120% at 0% 0%,
      rgba(23, 160, 225, 0.4) 0%,
      rgba(15, 23, 42, 0.9) 60%,
      rgba(15, 23, 42, 1) 100%);
  color: $color-text-white;
}

.card-title {
  font-size: $font-size-xl;
  font-weight: $font-weight-semibold;
  margin-bottom: $spacing-sm;
}

.card-desc {
  font-size: $font-size-sm;
  color: $color-text-secondary;
}

@media (max-width: 1024px) {
  .card-row {
    grid-template-columns: repeat(1, minmax(0, 1fr));
  }
}
</style>
