<template>
  <div class="image-item" :class="{ selected: isSelected, disabled }" @click="handleItemClick">
    <!-- 图片容器 -->
    <div class="image-container">
      <!-- 生成中状态 -->
      <div v-if="imageData.status === 1 || imageData.status === 2" class="status-overlay is-generating">
        <LoadingSpinner :size="42" :thickness="5" class="status-spinner" />
        <span class="status-text">
          {{
            imageData.status === 1
              ? t('myCreations.status.queueing')
              : t('myCreations.status.generating')
          }}
        </span>
      </div>

      <!-- 生成失败状态 -->
      <div v-else-if="imageData.status === 4" class="status-overlay">
        <img class="status-fail-img" :src="images.fail" alt="生成失败" />
        <span class="status-text">{{ t('myCreations.status.failed') }}</span>
      </div>

      <!-- 正常状态：显示图片 -->
      <LazyImage v-else :src="imageData.thumbUrl || imageData.url || ''" object-fit="cover" width="100%" height="100%"
        :border-radius="0" class="item-image" />

      <!-- 左上角选择标记 -->
      <div v-if="showSelect && isNormalStatus" class="select-button" @click.stop="handleSelect">
        <img :src="isSelected ? images.checkedActive : images.checkedNo" alt="选择" class="select-icon" />
      </div>

      <!-- 左上角VIP图标 -->
      <div v-if="showVip && !showSelect && isNormalStatus" class="vip-icon">
        <img :src="images.vip" alt="VIP" />
      </div>

      <!-- 右上角收藏按钮 -->
      <div v-if="
        showCollect &&
        isNormalStatus &&
        (collectMode === 'both' ||
          (collectMode === 'collected-only' &&
            (Number(imageData.collectStatus ?? 0) === 1)))
      " class="favorite-button" :class="{ 'no-click': collectMode === 'collected-only' }"
        @click.stop="collectMode === 'both' ? handleCollect() : null">
        <img v-if="Number(imageData.collectStatus ?? 0) === 1" :src="images.collectActive" alt="已收藏"
          class="favorite-icon" />
        <img v-else :src="images.collect" alt="收藏" class="favorite-icon" />
      </div>

      <!-- 预览按钮（支持左下角/右下角） -->
      <!-- <img v-if="showZoom && isNormalStatus" class="zoom-button" :src="images.zoom" alt="预览" @click.stop="handleZoom" /> -->

      <!-- 左下角：文件类型标签 -->
      <div v-if="showFileType && fileTypeText && isNormalStatus" class="file-type-badge">
        {{ fileTypeText }}
      </div>

      <!-- 选中蒙层 -->
      <div v-if="isSelected" class="selection-mask"></div>

      <!-- 禁止选择蒙层（达到最大数量或被外部禁用） -->
      <div v-if="(!isSelected && showSelect && isMaxSelected) || (!isSelected && disabled)" class="disabled-mask"></div>
    </div>

    <!-- 底部标题 -->
    <div v-if="showTitle && itemTitle" class="image-title">
      <span class="title-text">{{ itemTitle }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ElMessage } from 'element-plus'
import { COLLECT_TYPE, type CollectTypeValue } from '@/constants/collectType'
import { algoApi } from '@/api/algo'
import { useUserStore } from '@/stores/user'
import images from '@/assets'
import { useI18n } from 'vue-i18n'
import LoadingSpinner from './LoadingSpinner.vue'

// 图片数据接口
interface ImageData {
  id: string | number
  url?: string | null
  thumbUrl?: string | null
  originalUrl?: string | null
  name?: string
  title?: string
  imgDesc?: string
  collectStatus?: number
  fileType?: number // 文件类型：1-图片 2-视频
  status?: number // 状态：1未开始 2进行中 3完成 4失败
  [key: string]: any
}

// i18n
const { t } = useI18n()

// Props
interface Props {
  // 图片数据
  imageData: ImageData
  // 是否显示选择按钮
  showSelect?: boolean
  // 是否显示VIP标记
  showVip?: boolean
  // 是否显示收藏按钮
  showCollect?: boolean
  // 是否显示预览按钮
  showZoom?: boolean
  // 是否显示标题
  showTitle?: boolean
  // 是否已选中
  isSelected?: boolean
  // 是否禁用选择
  disabled?: boolean
  // 最大选择数量
  maxSelect?: number
  // 当前已选择数量
  selectedCount?: number
  // 收藏类型
  collectType?: CollectTypeValue | string | number
  // 是否显示文件类型标签
  showFileType?: boolean
  // 收藏按钮显示模式：'both' 显示收藏和已收藏（可点击），'collected-only' 只显示已收藏且不可点击
  collectMode?: 'both' | 'collected-only'
}

const props = withDefaults(defineProps<Props>(), {
  showSelect: false,
  showVip: false,
  showCollect: true,
  showZoom: true,
  showTitle: false,
  isSelected: false,
  disabled: false,
  maxSelect: 4,
  showFileType: false,
  selectedCount: 0,
  collectType: COLLECT_TYPE.MODEL_POSE,
  collectMode: 'both',
})

// Emits
const emit = defineEmits<{
  (e: 'select', data: { imageData: ImageData; isSelected: boolean }): void
  (e: 'collect', data: { imageData: ImageData; isCollect: boolean }): void
  (e: 'zoom', data: { imageData: ImageData }): void
  (e: 'click', data: { imageData: ImageData }): void
}>()

useUserStore()

// 计算标题
const itemTitle = computed(() => {
  return props.imageData.name || props.imageData.title || props.imageData.imgDesc || ''
})

// 计算文件类型文本
const fileTypeText = computed(() => {
  if (!props.imageData.fileType) return ''
  return props.imageData.fileType === 2 ? '视频' : '图片'
})

// 计算是否为正常状态（非生成中、非失败）
const isNormalStatus = computed(() => {
  const status = props.imageData.status
  // status: 1未开始 2进行中 3完成 4失败
  // 只有当 status 为 3（完成）或 undefined/null 时，才认为是正常状态
  return status === undefined || status === null || status === 3
})

// 计算属性：是否已达到最大选择数量
const isMaxSelected = computed(() => {
  // 如果 maxSelect 是 Infinity 或负数，则不限制
  if (props.maxSelect === Infinity || props.maxSelect < 0) {
    return false
  }
  return props.selectedCount >= props.maxSelect
})

// 处理选择
const handleSelect = () => {
  // 如果未选中且已达到最大选择数量（排除 Infinity 和负数）
  if (
    !props.isSelected &&
    props.maxSelect !== Infinity &&
    props.maxSelect > 0 &&
    props.selectedCount >= props.maxSelect
  ) {
    ElMessage.warning(`最多只能选择${props.maxSelect}张图片`)
    return
  }

  emit('select', {
    imageData: props.imageData,
    isSelected: !props.isSelected,
  })
}

// 处理收藏 - 封装收藏逻辑
const handleCollect = async () => {
  if (props.disabled) {
    ElMessage.warning('当前图片不可收藏，请先取消已选内容')
    return
  }

  try {
    const wasCollected = Number(props.imageData.collectStatus ?? 0) === 1
    const res = await algoApi.collect({ algoOrderResultId: String(props.imageData.id) })
    if (res.code === '0000') {
      const nextCollectStatus =
        (res.data as any)?.collectStatus !== undefined ? Number((res.data as any).collectStatus) : (wasCollected ? 0 : 1)
      emit('collect', {
        imageData: { ...props.imageData, collectStatus: nextCollectStatus },
        isCollect: nextCollectStatus === 1,
      })
      ElMessage.success(wasCollected ? '取消收藏' : '收藏成功')
    } else {
      ElMessage.error(res.msg || '网络开小差了~，请稍后再试')
    }
  } catch (error) {
    console.error('收藏操作失败:', error)
    ElMessage.error('网络开小差了~，请稍后再试')
  }
}

// 处理放大
// const handleZoom = () => {
//   emit('zoom', {
//     imageData: props.imageData,
//   })
// }

// 处理图片点击
const handleItemClick = () => {
  if (props.showSelect) {
    // 如果显示选择功能，则触发选择事件
    handleSelect()
  } else {
    // 否则触发普通的点击事件
    emit('click', {
      imageData: props.imageData,
    })
  }
}
</script>

<style lang="scss" scoped>
.image-item {
  position: relative;
  border-radius: var(--radius-sm);
  transition: all 0.3s ease;
  cursor: pointer;
  width: 100%;
}

.image-container {
  position: relative;
  width: 100%;
  aspect-ratio: 3 / 4; // 保持3:4比例（常见人像比例）
  background: $color-bg-dark-secondary;
  border-radius: $border-radius-md;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;

  .item-image {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;

    :deep(.lazy-image-wrapper) {
      width: 100%;
      height: 100%;
    }

    :deep(.lazy-image) {
      width: 100%;
      height: 100%;
    }
  }
}

// 通用图标样式
%icon-base {
  width: 24px;
  height: 24px;
  object-fit: contain;
  transition:
    transform 0.2s ease,
    filter 0.2s ease;
  cursor: pointer;

  &:hover {
    transform: scale(1.1);
  }
}

// 选择按钮
.select-button {
  position: absolute;
  top: 6px;
  left: 6px;
  z-index: 5;
  cursor: pointer;

  .select-icon {
    @extend %icon-base;
  }

  // 未选中状态：添加阴影
  img[src*='checked_no'] {
    filter: drop-shadow(0 1px 3px rgba(0, 0, 0, 0.4));
  }

  // 已选中状态：不需要阴影
  img[src*='checked_active'] {
    filter: none;
  }
}

// 会员图标
.vip-icon {
  position: absolute;
  top: 6px;
  left: 6px;
  z-index: 5;

  img {
    width: 24px;
    height: 24px;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
  }
}

// 收藏按钮
.favorite-button {
  position: absolute;
  top: 6px;
  right: 6px;
  z-index: 5;
  cursor: pointer;

  .favorite-icon {
    @extend %icon-base;
  }

  // 未收藏状态：添加阴影
  img[alt='收藏'] {
    filter: drop-shadow(0 1px 3px rgba(0, 0, 0, 0.4));
  }

  // 已收藏状态：不需要阴影
  img[alt='已收藏'] {
    filter: none;
  }

  // 只显示模式：不可点击
  &.no-click {
    cursor: default;
    pointer-events: none;
  }
}

// 放大按钮
.zoom-button {
  @extend %icon-base;
  position: absolute;
  bottom: 6px;
  right: 6px;
  z-index: 3;
}

// 文件类型标签（左下角）
.file-type-badge {
  position: absolute;
  bottom: 8px;
  left: 8px;
  height: 24px;
  padding: 0 8px;
  background: rgba(7, 7, 7, 0.6);
  backdrop-filter: blur(4px);
  color: white;
  font-size: 12px;
  font-weight: 400;
  border-radius: 4px;
  z-index: 3;
  display: flex;
  align-items: center;
  line-height: 1;
  pointer-events: none;
}

// 选中蒙层
.selection-mask {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  z-index: 2;
  pointer-events: none;
}

// 禁止选择蒙层
.disabled-mask {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.7);
  z-index: 4;
  pointer-events: none;
}

// 底部标题
.image-title {
  padding: 6px 0;
  text-align: center;

  .title-text {
    font-size: 12px;
    color: $color-text-white;
    line-height: 1.2;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 1;
    line-clamp: 1;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

// 状态覆盖层
.status-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: $color-bg-dark-secondary;
  border-radius: $border-radius-md;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1;
  color: $color-primary;

  .status-spinner {
    margin-bottom: 7px;
  }

  .status-text {
    font-size: $font-size-md;
  }
}

.status-overlay.is-generating {
  background: rgba(20, 30, 45, 0.9);
}

.status-fail-img {
  width: 42px;
  height: 42px;
  margin-bottom: 7px;
  object-fit: contain;
}
</style>
