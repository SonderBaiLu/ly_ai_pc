<template>
  <div class="loading-spinner" :style="spinnerStyle" aria-hidden="true">
    <svg class="spinner-svg" viewBox="0 0 100 100" role="presentation" focusable="false">
      <circle class="spinner-track" cx="50" cy="50" :r="r" :stroke-width="strokeWidth" />
      <circle
        class="spinner-active"
        cx="50"
        cy="50"
        :r="r"
        :stroke-width="strokeWidth"
        :stroke-dasharray="dashArray"
      />
    </svg>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  size?: number
  thickness?: number
  trackColor?: string
  activeColor?: string
  duration?: number
  /** 0-1，激活弧长比例（越小弧越短） */
  arcRatio?: number
}>(), {
  size: 72,
  thickness: 8,
  trackColor: '#334e62',
  activeColor: '#96ddff',
  duration: 1.5,
  arcRatio: 0.28,
})

const spinnerStyle = computed(() => ({
  '--spinner-size': `${props.size}px`,
  '--spinner-track-color': props.trackColor,
  '--spinner-active-color': props.activeColor,
  '--spinner-duration': `${props.duration}s`,
}))

/**
 * SVG 的 stroke-width 使用 viewBox(100x100) 单位。
 * 这里把外部传入的 thickness(px) 换算成 viewBox 单位，
 * 以保证不同 size 下“看起来”厚度一致。
 */
const strokeWidth = computed(() => {
  const size = Math.max(1, Number(props.size) || 72)
  const thicknessPx = Math.max(1, Number(props.thickness) || 8)
  return (thicknessPx * 100) / size
})

const r = computed(() => {
  // 预留 1 单位边距避免 stroke 裁切
  const margin = 1
  return 50 - strokeWidth.value / 2 - margin
})

const circumference = computed(() => 2 * Math.PI * r.value)

const dashArray = computed(() => {
  const ratio = Math.max(0.05, Math.min(0.95, Number(props.arcRatio) || 0.28))
  const c = circumference.value
  return `${c * ratio} ${c}`
})
</script>

<style scoped lang="scss">
.loading-spinner {
  width: var(--spinner-size);
  height: var(--spinner-size);
  position: relative;
  animation: spinner-rotate var(--spinner-duration) linear infinite;
  transform-origin: center;
}

.spinner-svg {
  width: 100%;
  height: 100%;
  display: block;
  transform: rotate(-90deg);
}

.spinner-track,
.spinner-active {
  fill: none;
}

.spinner-track {
  stroke: var(--spinner-track-color);
}

.spinner-active {
  stroke: var(--spinner-active-color);
  stroke-linecap: round;
  stroke-dashoffset: 0;
}

@keyframes spinner-rotate {
  to {
    transform: rotate(360deg);
  }
}
</style>
