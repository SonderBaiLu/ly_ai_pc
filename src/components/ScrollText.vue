<template>
  <div class="scroll-text-container">
    <div class="scroll-wrapper">
      <div class="scroll-content" :style="{ animationDuration: `${duration}s` }">
        <span>{{ text }}</span>
      </div>
      <div class="scroll-content copy" :style="{ animationDuration: `${duration}s` }">
        <span>{{ text }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  /** 需要滚动的文字内容 */
  text: string
  /** 滚动基础速度（秒），值越小速度越快，默认 10 秒 */
  speed?: number
  /** 容器宽度，默认 100% */
  width?: string
  /** 文字颜色 */
  color?: string
  /** 背景颜色 */
  bgColor?: string
}

const props = withDefaults(defineProps<Props>(), {
  speed: 10,
  width: '100%',
  color: '#6F7884',
  bgColor: 'transparent',
})

const duration = computed(() => {
  const textWidth = props.text.length * 16
  const containerWidth = Number.parseInt(props.width) || 300
  return props.speed + (textWidth / containerWidth) * 5
})
</script>

<style scoped>
.scroll-text-container {
  width: v-bind(width);
  height: 20px;
  line-height: 20px;
  overflow: hidden;
  position: relative;
  background-color: v-bind(bgColor);
}

.scroll-wrapper {
  display: flex;
  position: absolute;
  top: 0;
  left: 0;
  white-space: nowrap;
}

.scroll-content {
  font-size: 12px;
  color: v-bind(color);
  animation: scroll linear infinite;
}

.copy {
  margin-left: 32px;
}

@keyframes scroll {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-100%);
  }
}
</style>

