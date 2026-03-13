<template>
  <section class="cta-section">
    <h3 class="cta-title">{{ t('designMatrix.ctaTitle') }}</h3>
    <p class="cta-subtitle">{{ t('designMatrix.ctaSubtitle') }}</p>
    <button class="cta-btn" type="button" @click="onClick">
      {{ t('designMatrix.ctaButton') }}
    </button>
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
  width: 168px;
  height: 60px;
  background: radial-gradient(0.5% 0.5% at 50% 50%, rgba(23, 160, 225, 1) 0%, rgba(112, 197, 237, 1) 100%);
  border: none;
  color: $color-text-white;
  border-radius: 9999px;
  font-size: $font-size-lg;
  font-weight: $font-weight-semibold;
  cursor: pointer;
}

@media (max-width: 640px) {
  .cta-title {
    font-size: $font-size-2xl;
  }
}
</style>
