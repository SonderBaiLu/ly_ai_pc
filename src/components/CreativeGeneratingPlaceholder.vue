<template>
  <div v-if="statusNum === 1 || statusNum === 2" class="media-status-placeholder generating">
    <LoadingSpinner :size="72" :thickness="8" />
    <div class="status-text">正在生成中...</div>
    <div class="generating-progress">
      <GradientProgress :percentage="Number(progress ?? 0)" />
    </div>
  </div>
  <div v-else-if="statusNum === 4" class="media-status-placeholder failed">
    <img :src="images.fail" class="placeholder-icon" alt="生成失败" />
    <div class="status-text">生成失败</div>
  </div>
</template>

<script setup lang="ts">
import { images } from '@/assets'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import GradientProgress from '@/components/GradientProgress.vue'

interface Props {
  status?: number | string
  progress?: number | string
}

const props = withDefaults(defineProps<Props>(), {
  status: 2,
  progress: 0,
})

const statusNum = computed(() => Number(props.status ?? 2))
</script>

<style lang="scss" scoped>
.media-status-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: $color-primary;
  background: $color-bg-dark-secondary;
  border-radius: $border-radius-md;
  box-sizing: border-box;
  padding: 24px;

  &.generating {
    background: url('@/assets/images/generating.gif') no-repeat center center;
    background-size: 100% 100%;

    .status-text {
      margin: $spacing-md 0;
    }
  }

  &.failed {
    color: $color-text-white;

    .placeholder-icon {
      width: 130px;
      height: 130px;
      margin-bottom: $spacing-md;
      object-fit: contain;
    }
  }

  .status-text {
    font-size: $font-size-xl;
    text-align: center;
  }

  .generating-progress {
    width: 70%;
    transform: scale(0.85);
    transform-origin: center;
  }
}
</style>
