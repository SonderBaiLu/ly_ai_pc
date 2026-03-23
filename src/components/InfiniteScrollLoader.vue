<template>
  <div class="infinite-scroll-loader">
    <!-- 加载中（首次/加载更多同一套样式） -->
    <div v-if="showLoadingUI" class="loading-container">
      <el-icon class="is-loading">
        <Loading />
      </el-icon>
      <span class="loading-text">{{ loadingText }}</span>
    </div>

    <!-- 没有更多数据 - END -->
    <div v-if="showNoMore" class="no-more">
      <span>{{ noMoreText }}</span>
    </div>

    <!-- 空状态 -->
    <div v-if="showEmpty" class="empty-state">
      <img :src="emptyImage" fit="contain" :style="{ width: imageSize, height: 'auto' }" />
      <p class="empty-text" :style="{ color: emptyTextColor, fontSize: emptyTextFontSize }">{{ emptyText }}</p>
    </div>

    <!-- 返回顶部按钮 -->
    <el-backtop v-if="showBackTop" :right="backtopRight" :bottom="backtopBottom" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Loading } from '@element-plus/icons-vue'
import { images } from '@/assets'

interface Props {
  // 数据状态
  loading?: boolean // 加载中（自动判断是首次加载还是加载更多）
  hasMore?: boolean // 是否还有更多数据
  dataLength?: number // 数据长度
  minDataForEnd?: number // 显示END的最小数据量（默认1，即有数据就显示END）

  // 显示控制
  showLoadingState?: boolean // 是否显示加载状态（默认true）
  showEmptyState?: boolean // 是否显示空状态（默认true）

  // 文本配置
  loadingText?: string
  noMoreText?: string
  emptyText?: string
  emptyTextColor?: string
  emptyTextFontSize?: string
  emptyImage?: string
  imageSize?: string

  // 返回顶部配置
  showBackTop?: boolean
  backtopRight?: number
  backtopBottom?: number
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  hasMore: true,
  dataLength: 0,
  minDataForEnd: 1,
  showLoadingState: true,
  showEmptyState: true,
  loadingText: '',
  noMoreText: '',
  emptyText: '',
  emptyTextColor: 'rgba(150,221,255,0.8)',
  emptyTextFontSize: '16px',
  emptyImage: images.noneData,
  imageSize: '200px',
  showBackTop: true,
  backtopRight: 100,
  backtopBottom: 100,
})

const { t } = useI18n()

// 文案展示：优先用外部传入，其次用组件内的 i18n 默认
const loadingText = computed(
  () => props.loadingText || t('components.infiniteScrollLoader.loading'),
)
const noMoreText = computed(
  () => props.noMoreText || t('components.infiniteScrollLoader.noMore'),
)
const emptyText = computed(
  () => props.emptyText || t('components.infiniteScrollLoader.empty'),
)

// 加载中（首次加载/加载更多展示同一套UI）
const showLoadingUI = computed(() => props.showLoadingState && props.loading)

// 显示没有更多（END）
const showNoMore = computed(() => {
  return !props.loading && !props.hasMore && props.dataLength >= props.minDataForEnd
})

// 显示空状态
const showEmpty = computed(() => {
  return props.showEmptyState && !props.loading && props.dataLength === 0
})
</script>

<style lang="scss" scoped>
.infinite-scroll-loader {
  width: 100%;
  padding: $spacing-xl 0;
  background: transparent;
  font-size: $font-size-base;
  color: $color-text-tabs;

  // 加载中（首次）
  .loading-container {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: $spacing-sm;

    .loading-text {
      color: $color-primary;
    }

    .el-icon {
      color: $color-primary;
      font-size: 22px;
    }
  }

  // 没有更多 - END
  .no-more {
    text-align: center;

    span {
      position: relative;

      // 左右两条线
      &::before,
      &::after {
        content: '';
        position: absolute;
        top: 50%;
        width: 60px;
        height: 1px;
        background: $color-border-light;
      }

      &::before {
        right: 100%;
        margin-right: $spacing-sm;
      }

      &::after {
        left: 100%;
        margin-left: $spacing-sm;
      }
    }
  }

  // 空状态
  .empty-state {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    min-height: 400px;

    .empty-text {
      margin-top: 23px;
      color: $color-primary;
    }
  }
}
</style>
