<template>
  <div class="gradient-progress">
    <div class="progress-outer">
      <div class="progress-inner" :style="{ width: `${displayProgress}%` }"></div>
    </div>
    <div class="progress-text">{{ displayProgress }}%</div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  percentage: number // 进度百分比 (0-100)
}

const props = defineProps<Props>()

// 确保进度值在 0-100 范围内，向下取整
const displayProgress = computed(() => {
  const raw = Number(props.percentage ?? 0)
  if (Number.isNaN(raw)) return 0
  return Math.min(100, Math.max(0, Math.floor(raw)))
})
</script>

<style lang="scss" scoped>
.gradient-progress {
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
}

.progress-outer {
  flex: 1;
  height: 14px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.35);
  overflow: hidden;
  position: relative;
}

.progress-inner {
  height: 100%;
  background: linear-gradient(90deg, var(--primary-color) 0%, var(--primary-light) 100%);
  border-radius: 999px;
  box-shadow: 0 0 12px rgba(130, 87, 255, 0.6);
  transition: width 0.3s ease-out;
}

.progress-text {
  color: var(--text-primary);
  font-weight: 600;
  font-size: 14px;
  letter-spacing: 0.5px;
  min-width: 40px;
  text-align: right;
}
</style>
