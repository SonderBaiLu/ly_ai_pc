<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<template>
  <section class="stats-section">
    <div class="stats-container container">
      <h2 class="stats-title">{{ t('statsSection.title') }}</h2>
      <p class="stats-desc">{{ t('statsSection.description') }}</p>
      <div class="stats-grid">
        <div class="stat-item">
          <div class="stat-number">{{ t('statsSection.stat1') }}</div>
          <div class="stat-label">{{ t('statsSection.stat1Label') }}</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">{{ t('statsSection.stat2') }}</div>
          <div class="stat-label">{{ t('statsSection.stat2Label') }}</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">{{ t('statsSection.stat3') }}</div>
          <div class="stat-label">{{ t('statsSection.stat3Label') }}</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">{{ t('statsSection.stat4') }}</div>
          <div class="stat-label">{{ t('statsSection.stat4Label') }}</div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
.stats-section {
  padding: $spacing-5xl 0 138px;
  background: $color-bg-white;
  color: $color-text-dark;

  .stats-title {
    font-size: $font-size-4xl;
    font-weight: $font-weight-bold;
    text-align: center;
    margin-bottom: $spacing-md;
  }

  .stats-desc {
    font-size: $font-size-md;
    color: $color-text-gray;
    text-align: center;
    margin-bottom: $spacing-3xl;
    max-width: 860px;
    margin-left: auto;
    margin-right: auto;
    line-height: 23px;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: $spacing-2xl;

    .stat-item {
      text-align: center;
    }

    .stat-number {
      font-size: $font-size-4xl;
      font-weight: $font-weight-bold;
      color: $color-text-black;
    }

    .stat-label {
      font-size: $font-size-md;
      color: $color-text-placeholder;
    }
  }
}

@media (max-width: 1024px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .stats-container {
    padding: 0 $spacing-md;
  }

  .stats-title {
    font-size: $font-size-3xl;
  }

  .stats-grid {
    grid-template-columns: 1fr;
    gap: $spacing-xl;
  }

  .stat-number {
    font-size: $font-size-4xl;
  }
}
</style>
