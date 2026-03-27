<template>
  <section class="cta-section">
    <h3 class="cta-title">{{ t('designMatrix.ctaTitle') }}</h3>
    <p class="cta-subtitle">{{ t('designMatrix.ctaSubtitle') }}</p>
    <el-button class="cta-btn" type="primary" @click="onClick">
      {{ t('designMatrix.ctaButton') }}
    </el-button>
  </section>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const props = defineProps<{
  onClick?: () => void
}>()

const { t } = useI18n()

const onClick = () => {
  props.onClick?.()
}
</script>

<style scoped lang="scss">
.cta-section {
  background: $color-bg-dark-first;
  padding: $spacing-5xl 0;
  text-align: center;
}

.cta-title {
  font-size: $font-size-4xl;
  font-weight: $font-weight-bold;
  margin-bottom: $spacing-md;
}

.cta-subtitle {
  font-size: $font-size-lg;
  color: $color-text-gray;
  margin-bottom: $spacing-2xl;
}

.cta-btn {
  min-width: 168px;
  height: 60px;
  border-radius: 9999px;
  font-size: $font-size-lg;
  font-weight: $font-weight-semibold;
}

@media (max-width: 640px) {
  .cta-title {
    font-size: $font-size-2xl;
  }
}
</style>
