<template>
  <div ref="rootRef" class="scroll-text-container">
    <!-- 文案未超出容器：只显示一行，避免短文案出现两份并排 -->
    <div v-if="!useMarquee" class="scroll-static">
      <span class="scroll-static-inner">{{ text }}</span>
    </div>
    <!-- 超出宽度：双份无缝滚动 -->
    <div v-else class="scroll-wrapper">
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

const rootRef = ref<HTMLElement | null>(null)
const useMarquee = ref(false)

let resizeObserver: ResizeObserver | null = null

const duration = computed(() => {
  const textWidth = props.text.length * 16
  const containerWidth = Number.parseInt(props.width) || 300
  return props.speed + (textWidth / containerWidth) * 5
})

const measureNeedMarquee = () => {
  const root = rootRef.value
  const t = String(props.text ?? '').trim()
  if (!root || !t) {
    useMarquee.value = false
    return
  }

  const cw = root.clientWidth
  if (cw < 8) {
    useMarquee.value = false
    return
  }

  const measureEl = document.createElement('span')
  measureEl.style.cssText =
    'position:absolute;left:0;top:0;visibility:hidden;white-space:nowrap;font-size:12px;pointer-events:none;'
  measureEl.textContent = t
  root.appendChild(measureEl)
  const tw = measureEl.offsetWidth
  root.removeChild(measureEl)

  useMarquee.value = tw > cw + 2
}

const scheduleMeasure = () => {
  nextTick(() => {
    requestAnimationFrame(() => {
      measureNeedMarquee()
    })
  })
}

watch(() => [props.text, props.width], scheduleMeasure)

onMounted(() => {
  scheduleMeasure()
  resizeObserver = new ResizeObserver(() => scheduleMeasure())
  if (rootRef.value) {
    resizeObserver.observe(rootRef.value)
  }
})

onUnmounted(() => {
  resizeObserver?.disconnect()
  resizeObserver = null
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

.scroll-static {
  width: 100%;
  overflow: hidden;
}

.scroll-static-inner {
  display: block;
  font-size: 12px;
  color: v-bind(color);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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
