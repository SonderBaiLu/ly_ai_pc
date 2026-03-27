<template>
  <section class="hero-section">
    <div class="hero-container container">
      <h1 class="hero-title">{{ t('hero.title') }}</h1>
      <p class="hero-desc">{{ t('hero.description') }}</p>
      <el-button class="start-btn" type="primary" @click="showComingSoon">
        {{ t('hero.button') }}
        <img src="@/assets/images/star.png" alt="Arrow Right" class="btn-icon" />
      </el-button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

const { t } = useI18n()
const router = useRouter()

const showComingSoon = () => {
  // 首页「开始使用」：统一进入 AI 设计工作台
  router.push('/ai-design')
}
</script>

<style scoped lang="scss">
.hero-section {
  padding: 74px 0 84px;
}

.hero-container {
  text-align: center;
}

.hero-title {
  font-size: $font-size-6xl;
  font-weight: $font-weight-bold;
  margin-bottom: $spacing-2xl;
  color: $color-text-white;
}

.hero-desc {
  font-size: $font-size-lg;
  font-family: NotoSans-regular;
  line-height: 28px;
  color: $color-text-secondary;
  max-width: 920px;
  margin: 0 auto $spacing-2xl;
}

.start-btn {
  min-width: 195px;
  height: 60px;
  border-radius: 30px;
  font-size: $font-size-lg;

  .btn-icon {
    width: 20px;
    height: 20px;
    margin-left: 6px;
  }
}
</style>
