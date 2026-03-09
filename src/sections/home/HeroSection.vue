<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'

const { t, locale } = useI18n()

const showComingSoon = () => {
  ElMessage.info(
    locale.value === 'zh'
      ? '功能暂未开放，敬请期待'
      : 'This feature is not available yet. Stay tuned.'
  )
}
</script>

<template>
  <section class="hero-section">
    <div class="hero-container container">
      <h1 class="hero-title">{{ t('hero.title') }}</h1>
      <p class="hero-desc">{{ t('hero.description') }}</p>
      <button class="start-btn" @click="showComingSoon">
        {{ t('hero.button') }}
        <img src="@/assets/images/star.png" alt="Arrow Right" class="btn-icon" />
      </button>
    </div>
  </section>
</template>

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
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: $font-size-lg;
  padding: 16px 40px;
  border-radius: 9999px;
  background: radial-gradient(0.5% 0.5% at 50% 50%, rgba(23, 160, 225, 1) 0%, rgba(112, 197, 237, 1) 100%);
  border: none;
  color: $color-text-white;
  cursor: pointer;
  margin: 0 auto;
}

.btn-icon {
  width: 20px;
  height: 20px;
}
</style>
