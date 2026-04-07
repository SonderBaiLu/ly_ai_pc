<template>
  <div class="thumbnail-gallery">
    <!-- 缩略图列表 -->
    <div ref="thumbnailListRef" class="thumbnail-list">
      <div v-for="(asset, index) in assets"
        :key="asset.id || asset.algoOrderId || asset.algoUuId || `thumbnail-${index}`" class="thumbnail-item" :class="[
          { active: index === currentIndex },
          { generating: asset.status === 0 || asset.status === 1 || asset.status === 2 },
          { failed: asset.status === 4 },
        ]" :draggable="!isVideo(asset)" @click="selectThumbnail(index)" @dragstart="handleDragStart(asset, $event)">
        <!-- 生成中状态 -->
        <div v-if="asset.status === 0 || asset.status === 1 || asset.status === 2" class="thumbnail-generating">
          <LoadingSpinner :size="16" :thickness="2" :arc-ratio="0.24" />
          <span class="generating-text">生成中...</span>
        </div>

        <!-- 生成失败状态 -->
        <div v-else-if="asset.status === 4" class="thumbnail-failed">
          <img class="failed-img" :src="images.fail1" alt="生成失败" />
        </div>

        <!-- 正常状态 -->
        <template v-else>
          <LazyImage :src="getImagePoster(asset)" :alt="asset.prompt" width="100%" height="100%" object-fit="cover"
            :border-radius="0" />
          <div v-if="fileTypeBadgeText(asset)" class="file-type-badge">{{ fileTypeBadgeText(asset) }}</div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 自动导入：Vue API, Element Plus 图标
import { type CreationResult } from '@/composables/useTaskPolling'
import { images } from '@/assets'
import LoadingSpinner from './LoadingSpinner.vue'

// 定义组件属性
interface Props {
  assets: CreationResult[]
  currentIndex: number
  hasMoreData?: boolean // 是否还有更多数据
  loading?: boolean // 是否正在加载
}

// 定义组件事件
interface Emits {
  (e: 'thumbnail-click', index: number): void
  (e: 'scroll-sync', scrollTop: number): void
  (e: 'load-more'): void // 加载更多事件
}

const props = withDefaults(defineProps<Props>(), {
  hasMoreData: false,
  loading: false,
})

const emit = defineEmits<Emits>()

// 响应式数据
const thumbnailListRef = ref()

// 后端 status（0初始化 1待请求 2处理中 3完成 4失败） -> 前端 ui status（1/2/3/4）
const isVideo = (asset: CreationResult) => {
  const ft = Number((asset as any).fileType ?? asset.fileType)
  return ft === 2 || ft === 4
}

/** 与 ImageItem / 我的创作卡片一致：左下角「图片」「视频」 */
const fileTypeBadgeText = (asset: CreationResult) => {
  const ft = Number((asset as any).fileType ?? asset.fileType ?? 0)
  if (!Number.isFinite(ft) || ft <= 0) return ''
  if (ft === 2 || ft === 4) return '视频'
  return '图片'
}

const getImagePoster = (asset: CreationResult) => {
  return (asset as any).thumbUrl || ''
}

// 标志位：防止循环滚动
let isSyncing = false
let syncTimer: ReturnType<typeof setTimeout> | null = null

// 方法
const selectThumbnail = (index: number) => {
  // 只触发点击事件，不再自动滚动
  emit('thumbnail-click', index)
}

// 处理拖拽开始：把创作信息写入 dataTransfer
const handleDragStart = (asset: CreationResult, event: DragEvent) => {
  try {
    const data = {
      type: 'asset',
      imageUrl: getImagePoster(asset),
      fileUrl: (asset as any).url || '',
      id: asset.id,
      fileType: asset.fileType, // 添加文件类型，用于在拖拽目标处判断是否是视频
    }
    event.dataTransfer?.setData('application/json', JSON.stringify(data))
    // 兼容简单实现：也塞一份纯文本 URL（优先图片地址，但视频不设置）
    if (getImagePoster(asset) && !isVideo(asset)) {
      event.dataTransfer?.setData('text/plain', getImagePoster(asset))
    }

    // 使用自定义拖拽预览：只显示图片，不显示覆盖层
    if (getImagePoster(asset) && !isVideo(asset)) {
      // 使用 currentTarget 获取拖拽的容器元素（thumbnail-item）
      const container = event.currentTarget as HTMLElement
      // 查找 LazyImage 内部的 img 元素（el-image 会渲染为 .el-image__inner）
      const imgElement = container.querySelector(
        '.lazy-image img, .lazy-image .el-image__inner'
      ) as HTMLImageElement
      if (imgElement && imgElement.complete && imgElement.naturalWidth > 0) {
        // 如果图片已加载，直接使用它作为预览（只显示图片，不显示覆盖层）
        event.dataTransfer?.setDragImage(imgElement, imgElement.width / 2, imgElement.height / 2)
      }
    }
  } catch (e) {
    console.error('[ThumbnailGallery] 拖拽初始化失败:', e)
  }
}

// 监听外部滚动同步
const syncScroll = (scrollPercentage: number) => {
  if (!thumbnailListRef.value) return

  // 清除之前的定时器
  if (syncTimer) {
    clearTimeout(syncTimer)
  }

  // 根据主图滚动百分比计算缩略图应该滚动到的位置
  const maxScroll = thumbnailListRef.value.scrollHeight - thumbnailListRef.value.clientHeight
  if (maxScroll > 0) {
    const targetScrollTop = maxScroll * scrollPercentage
    // 直接设置，不使用smooth，以保持同步
    thumbnailListRef.value.scrollTop = targetScrollTop
  }

  // 设置同步标志，防止触发 watch
  isSyncing = true

  // 短暂延迟后重置标志位
  syncTimer = setTimeout(() => {
    isSyncing = false
    syncTimer = null
  }, 50)
}

// 处理缩略图滚动，检测是否滚动到底部
const handleThumbnailScroll = () => {
  if (!thumbnailListRef.value || isSyncing || props.loading || !props.hasMoreData) {
    return
  }

  const { scrollTop, scrollHeight, clientHeight } = thumbnailListRef.value
  // 距离底部少于 50px 时触发加载更多
  if (scrollHeight - scrollTop - clientHeight < 50) {
    emit('load-more')
  }
}

// 组件挂载时添加滚动监听
onMounted(() => {
  nextTick(() => {
    if (thumbnailListRef.value) {
      thumbnailListRef.value.addEventListener('scroll', handleThumbnailScroll, { passive: true })
    }
  })
})

// 组件卸载时移除滚动监听并清理定时器
onBeforeUnmount(() => {
  if (thumbnailListRef.value) {
    thumbnailListRef.value.removeEventListener('scroll', handleThumbnailScroll)
  }
  if (syncTimer) {
    clearTimeout(syncTimer)
    syncTimer = null
  }
})

// 暴露方法给父组件
defineExpose({
  syncScroll,
})
</script>

<style lang="scss" scoped>
.thumbnail-gallery {
  width: 98px;
  margin-top: 17px;
  background: $color-bg-dark-secondary;
  border-radius: $border-radius-md;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 8px 0px 0px 0px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.thumbnail-list {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 33px 9px;
  display: flex;
  flex-direction: column;
  gap: 5px;
  -webkit-overflow-scrolling: touch; // iOS 流畅滚动

  // 完全隐藏滚动条
  &::-webkit-scrollbar {
    display: none; // Chrome, Safari, Edge
  }

  scrollbar-width: none; // Firefox
  -ms-overflow-style: none; // IE 10+
}

.thumbnail-item {
  width: 80px;
  height: 80px;
  flex-shrink: 0; // 不允许收缩
  border-radius: $border-radius-md;
  overflow: hidden;
  cursor: pointer;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.2s ease;
  border: 2px solid transparent;
  position: relative;
  will-change: transform; // GPU加速
  transform: translateZ(0); // 启用硬件加速

  &:hover {
    border-color: $color-primary-dark;
    transform: scale(1.02) translateZ(0);
  }

  &.active {
    border-color: $color-primary-dark;
    transform: scale(1.02) translateZ(0);
  }

  :deep(.lazy-image-wrapper) {
    width: 100%;
    height: 100%;

    img {
      transition: transform 0.2s ease;
      will-change: transform;
      transform: translateZ(0);
    }
  }

  &:hover :deep(.lazy-image-wrapper img) {
    transform: scale(1.05) translateZ(0);
  }

  // 生成中状态样式
  &.generating,
  &.active,
  &.failed {
    border-color: $color-primary-dark;
  }
}

.file-type-badge {
  position: absolute;
  bottom: 4px;
  left: 4px;
  height: 18px;
  padding: 0 6px;
  background: rgba(7, 7, 7, 0.6);
  backdrop-filter: blur(4px);
  color: white;
  font-size: 10px;
  font-weight: 400;
  border-radius: 3px;
  z-index: 3;
  display: flex;
  align-items: center;
  line-height: 1;
  pointer-events: none;
}

// 生成中缩略图
.thumbnail-generating {
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 5px;
  overflow: hidden;
  border-radius: 8px;
  background: url('@/assets/images/generating_80.gif') no-repeat center center;
  background-size: 100% 100%;

  .generating-text {
    font-size: 10px;
    line-height: 1;
    color: #96ddff;
    white-space: nowrap;
  }
}

// 失败缩略图
.thumbnail-failed {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;

  .failed-img {
    width: 50%;
    height: 50%;
    object-fit: contain;
  }
}
</style>
