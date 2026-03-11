<template>
  <div class="infinite-scroll-loader">
    <!-- 加载中 -->
    <div v-if="showLoading" class="loading-container">
      <el-icon class="is-loading"><Loading /></el-icon>
      <span>{{ loadingText }}</span>
    </div>

    <!-- 加载更多提示 -->
    <div v-if="showLoadingMore" class="loading-more">
      <el-icon class="is-loading"><Loading /></el-icon>
      <span>{{ loadingText }}</span>
    </div>

    <!-- 没有更多数据 - END -->
    <div v-if="showNoMore" class="no-more">
      <span>{{ noMoreText }}</span>
    </div>

    <!-- 空状态 -->
    <div v-if="showEmpty" class="empty-state">
      <img :src="emptyImage" fit="contain" :style="{ width: imageSize, height: imageSize }" />
      <p class="empty-text">{{ emptyText }}</p>
    </div>

    <!-- 返回顶部按钮 -->
    <el-backtop v-if="showBackTop" :right="backtopRight" :bottom="backtopBottom" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
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
  loadingText: '加载中...',
  noMoreText: 'END',
  emptyText: '暂无内容',
  emptyImage: images.noneData,
  imageSize: '280px',
  showBackTop: true,
  backtopRight: 100,
  backtopBottom: 100,
})

// 自动判断：首次加载（loading 且 dataLength === 0）
const showLoading = computed(() => {
  return props.showLoadingState && props.loading && props.dataLength === 0
})

// 自动判断：加载更多（loading 且 dataLength > 0）
const showLoadingMore = computed(() => {
  return props.showLoadingState && props.loading && props.dataLength > 0
})

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
}

// 加载中（首次）
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-xxl) 0;
  color: var(--primary-color);
  font-size: var(--font-sm);

  .el-icon {
    font-size: 16px;
    color: var(--primary-color);
  }
}

// 加载更多
.loading-more {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-xl) 0;
  color: var(--primary-color);
  font-size: var(--font-sm);

  .el-icon {
    font-size: 16px;
    color: var(--primary-color);
  }
}

// 没有更多 - END
.no-more {
  text-align: center;
  padding: var(--spacing-xl) 0;
  color: var(--text-tertiary);
  font-size: var(--font-sm);

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
      background: var(--border-color);
    }

    &::before {
      right: 100%;
      margin-right: var(--spacing-sm);
    }

    &::after {
      left: 100%;
      margin-left: var(--spacing-sm);
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
  padding: var(--spacing-xxl);

  .empty-text {
    margin-top: var(--spacing-lg);
    color: var(--text-placeholder);
    font-size: var(--font-md);
  }
}
</style>
