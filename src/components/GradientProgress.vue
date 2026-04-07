<template>
  <div class="gradient-progress">
    <div class="progress-outer">
      <div class="progress-inner" :style="{ width: `${displayProgress}%` }"></div>
    </div>
    <div class="progress-text">{{ displayProgress }}<span class="progress-text-percentage">%</span></div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  percentage: number // 进度百分比 (0-100)
}

const props = defineProps<Props>()

// 接口/上层可能传入字符串或非有限值，这里统一成 0–100 的展示用整数
const displayProgress = computed(() => {
  const raw = Number(props.percentage ?? 0)
  if (!Number.isFinite(raw)) return 0
  return Math.min(100, Math.max(0, Math.floor(raw)))
})
</script>

<style lang="scss" scoped>
.gradient-progress {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.progress-outer {
  width: 50%;
  height: 11px;
  background-color: rgba(18, 18, 18, 1);
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  overflow: hidden;
  position: relative;
}

.progress-inner {
  height: 100%;
  border-radius: 999px;
  background: radial-gradient(0.5% 0.5% at 50% 50%, rgba(23, 160, 225, 1) 0%, rgba(112, 197, 237, 1) 100%);
  border: 1px solid rgba(255, 255, 255, 0.15);
  transition: width 0.3s ease-out;
}

.progress-text {
  margin-left: 24px;
  color: #F8FAFC;
  font-weight: bold;
  font-size: 36px;

  .progress-text-percentage {
    margin-left: 7px;
    font-size: 24px;
    font-weight: normal;
    color: $color-primary;
    font-family: NotoSans-regular;
  }
}
</style>
