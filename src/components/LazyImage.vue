<template>
  <div ref="wrapperRef" class="lazy-image-wrapper" :style="wrapperStyle">
    <!-- Loading状态 - 显示shimmer动画 -->
    <div v-if="isLoading" class="lazy-image-loading" :style="loadingStyle"></div>

    <!-- 实际图片 - 使用 el-image，只有 src 有值时才渲染 -->
    <el-image v-if="currentSrc" :src="currentSrc" :alt="alt" :class="['lazy-image', { 'is-loaded': !isLoading }]"
      :fit="objectFit" @load="handleLoad" @error="handleError">
      <template #placeholder>
        <!-- 占位符期间使用外层的 shimmer 动画，这里留空 -->
        <div class="el-image-placeholder"></div>
      </template>
      <template #error>
        <div class="lazy-image-error" :style="errorStyle">
          <el-icon :size="errorIconSize" :color="errorIconColor">
            <Picture />
          </el-icon>
        </div>
      </template>
    </el-image>
  </div>
</template>

<script setup lang="ts">
import { Picture } from '@element-plus/icons-vue'

/**
 * LazyImage 懒加载图片组件
 * 使用 Intersection Observer API 实现真正的懒加载
 * 只有滚动到视口内才加载图片
 * 加载时显示 shimmer 动画
 */

const props = defineProps({
  src: {
    type: String,
    required: true,
    default: '',
  },
  alt: {
    type: String,
    default: '',
  },
  width: {
    type: [String, Number],
    default: '100%',
  },
  height: {
    type: [String, Number],
    default: 'auto',
  },
  objectFit: {
    type: String as () => 'fill' | 'contain' | 'cover' | 'none' | 'scale-down',
    default: 'cover',
  },
  borderRadius: {
    type: [String, Number],
    default: 8,
  },
  errorIconColor: {
    type: String,
    default: '#909399',
  },
  errorIconSize: {
    type: Number,
    default: 40,
  },
  loadingBg: {
    type: String,
    default: '',
  },
  errorBg: {
    type: String,
    default: '',
  },
  lazy: {
    type: Boolean,
    default: true,
  },
  rootMargin: {
    type: String,
    default: '50px',
  },
})

const emit = defineEmits(['error', 'load'])

const wrapperRef = ref<HTMLDivElement | null>(null)
const isLoading = ref(true)
const loadStartTime = ref(0)
const minLoadingTime = 400
const currentSrc = ref('')

let observer: IntersectionObserver | null = null

const formatSize = (size: string | number) => {
  if (typeof size === 'number') return `${size}px`
  return size
}

const wrapperStyle = computed(() => ({
  width: formatSize(props.width),
  height: formatSize(props.height),
}))

const loadingStyle = computed(() => {
  const style: any = {
    borderRadius: formatSize(props.borderRadius),
  }
  if (props.loadingBg) {
    style.background = props.loadingBg
  }
  return style
})

const errorStyle = computed(() => {
  const style: any = {
    borderRadius: formatSize(props.borderRadius),
  }
  if (props.errorBg) {
    style.backgroundColor = props.errorBg
  }
  return style
})

const handleError = (e: Event) => {
  isLoading.value = false
  emit('error', e)
}

const handleLoad = (e: Event) => {
  const loadTime = Date.now() - loadStartTime.value

  const finishLoading = () => {
    isLoading.value = false
    emit('load', e)
  }

  // 如果加载时间小于最小展示时间，延迟隐藏loading
  if (loadTime < minLoadingTime) {
    setTimeout(finishLoading, minLoadingTime - loadTime)
  } else {
    finishLoading()
  }
}

// 初始化懒加载
const initLazyLoad = () => {
  if (!props.lazy) {
    // 不启用懒加载，直接加载图片
    currentSrc.value = props.src
    return
  }

  // 延迟执行，等待 DOM 渲染
  setTimeout(() => {
    if (!wrapperRef.value) return

    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // 元素进入视口，开始加载图片
            currentSrc.value = props.src
            observer?.disconnect()
          }
        })
      },
      {
        rootMargin: props.rootMargin,
      }
    )

    // 观察 wrapper 元素
    observer.observe(wrapperRef.value)
  }, 50)
}

// 监听src变化，重置loading状态
watch(
  () => props.src,
  () => {
    isLoading.value = true
    loadStartTime.value = Date.now()
    currentSrc.value = ''
    observer?.disconnect()
    initLazyLoad()
  },
  { immediate: true }
)

// 组件卸载时清理
onBeforeUnmount(() => {
  observer?.disconnect()
})
</script>

<style lang="scss" scoped>
.lazy-image-wrapper {
  position: relative;
  display: inline-block;
  overflow: hidden;
  background: rgba(120, 120, 120, 0.18);
  border: 1px solid rgba(150, 150, 150, 0.14);
}

.lazy-image-loading {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: linear-gradient(135deg,
      rgba(140, 140, 140, 0.22) 0%,
      rgba(120, 120, 120, 0.16) 40%,
      rgba(135, 135, 135, 0.20) 100%);
  z-index: 10;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    /* 高光更明显，但依然克制 */
    background: linear-gradient(90deg,
        transparent 0%,
        rgba(235, 235, 235, 0.10) 18%,
        rgba(245, 245, 245, 0.22) 50%,
        rgba(235, 235, 235, 0.10) 82%,
        transparent 100%);
    animation: shimmer 1.25s infinite;
    transform: translateX(-100%);
  }
}

.lazy-image-error {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(120, 120, 120, 0.18);
  border-radius: $border-radius-md;
}

.lazy-image {
  width: 100%;
  height: 100%;
  opacity: 0;
  transition: opacity 0.35s ease;

  // 加载完成后显示
  &.is-loaded {
    opacity: 1;
  }

  // el-image 内部样式调整
  :deep(.el-image) {
    width: 100%;
    height: 100%;
    display: block;
  }

  :deep(.el-image__inner) {
    width: 100%;
    height: 100%;
    display: block;
  }

  :deep(.el-image__error) {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  // placeholder 占位符（透明，让外层 shimmer 显示）
  :deep(.el-image-placeholder) {
    width: 100%;
    height: 100%;
    background: transparent;
  }
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }

  100% {
    transform: translateX(100%);
  }
}
</style>
