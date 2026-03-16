<template>
  <div class="main-image-display">
    <!-- 内容标签 -->
    <div class="content-tabs">
      <el-tabs v-model="activeContentTab" @tab-change="handleTabChange">
        <el-tab-pane v-for="tab in contentTabs" :key="tab.key" :label="tab.label" :name="tab.key" />
      </el-tabs>
      <!-- 刷新按钮 -->
      <el-button :loading="loading" :disabled="loading" @click="handleRefresh">
        <el-icon>
          <Refresh />
        </el-icon>
        <span>刷新</span>
      </el-button>
    </div>

    <!-- 主内容显示区域 -->
    <div ref="mainContentRef" v-loading="loading && assets.length === 0" v-infinite-scroll="handleLoadMore"
      class="main-content-area" :infinite-scroll-disabled="loading || loadingMore || !hasMoreData"
      :infinite-scroll-distance="200">
      <!-- 资产列表 -->
      <div class="assets-list">
        <!-- 资产项 -->
        <div v-for="(asset, index) in assets" :key="asset.id || asset.taskId || asset.taskUuid || `asset-${index}`"
          class="asset-item" :class="[
            { active: index === currentIndex },
            asset.status === 2 ? 'generating' : asset.status === 4 ? 'failed' : '',
          ]" @click="selectAsset(index)">
          <!-- 提示词 -->
          <!-- <div class="asset-prompt">{{ asset.prompt }}</div> -->

          <!-- 生成中状态（卡片内仅保留骨架和文案，不再重复进度条） -->
          <div v-if="asset.status === 2" class="asset-placeholder generating">
            <div class="skeleton-box">
              <div class="skeleton-shimmer"></div>
              <div class="generating-status">
                <el-icon class="is-loading status-icon">
                  <Loading />
                </el-icon>
                <span class="status-text">AI正在生成中...</span>
                <div class="card-progress">
                  <GradientProgress :percentage="getProgressValue(asset)" />
                </div>
              </div>
            </div>
          </div>

          <!-- 生成失败状态 -->
          <div v-else-if="asset.status === 4" class="asset-placeholder failed">
            <img :src="asset.fileType === 2 ? images.failVideoPrimary : images.failImgPrimary" class="placeholder-icon"
              alt="生成失败" />
            <p class="placeholder-text">生成失败</p>
          </div>

          <!-- 正常显示：当前选中资产的主要显示区域 -->
          <div v-else class="current-asset-display">
            <!-- 媒体展示区域 - 点击跳转详情 -->
            <div class="media-frame" :data-asset-index="index" :draggable="asset.fileType !== 2"
              @click="handleViewDetail(index)" @dragstart.stop="handleAssetDragStart(asset, $event)">
              <MediaPlayer :ref="(el) => setMediaPlayerRef(el, index)"
                :src="asset.fileType === 2 ? asset.fileUrl || '' : ''" :poster="asset.imageUrl" width="100%"
                height="100%" :autoplay="false" :muted="false" :loop="false" :controls="true" object-fit="contain"
                poster-fit="contain" class="media-player" :minimal-controls="true" :image-only="asset.fileType !== 2"
                @play="() => handleVideoPlay(index)" @pause="() => handleVideoPause(index)" />
            </div>

            <!-- 操作按钮栏 -->
            <div class="action-buttons">
              <el-button class="action-btn" :class="{ 'is-collected': asset.collectId }"
                @click.stop="handleCollect(index)">
                <img :src="asset.collectId ? images.collected : images.collect" alt="收藏" class="collect-icon" />
                <span>{{ asset.collectId ? '已收藏' : '收藏' }}</span>
              </el-button>
              <el-dropdown trigger="click" placement="bottom-end" :hide-on-click="false"
                popper-class="main-image-download-popper" @command="(cmd: string) => handleDownloadCommand(cmd, index)"
                @visible-change="handleDownloadMenuVisible">
                <el-button class="action-btn" :loading="isDownloading(asset, index)"
                  :disabled="isDownloading(asset, index)" @click.stop>
                  <img :src="images.download" alt="下载" class="action-icon" />
                  <span>{{ isDownloading(asset, index) ? '下载中...' : '下载' }}</span>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu class="download-menu">
                    <el-dropdown-item command="download" :disabled="isDownloading(asset, index)">
                      <div class="menu-item-content">
                        <img :src="images.download" alt="下载" class="menu-icon" />
                        <span>下载</span>
                      </div>
                    </el-dropdown-item>
                    <el-dropdown-item command="toggle-watermark" :disabled="isDownloading(asset, index)"
                      class="watermark-toggle-item">
                      <div class="menu-item-content" @click.stop="handleWatermarkToggleChange(!removeWatermarkEnabled)">
                        <el-switch v-model="removeWatermarkEnabled" active-color="#8f50ea" inactive-color="#201B26"
                          :disabled="isDownloading(asset, index)" @click.stop @change="handleWatermarkToggleChange" />
                        <span>去除水印</span>
                        <img :src="images.vip" alt="VIP" class="vip-icon" />
                      </div>
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
              <el-button class="action-btn delete-btn" @click.stop="handleDelete(index)">
                <img :src="images.del" alt="删除" class="action-icon" />
                <span>删除</span>
              </el-button>
            </div>
          </div>
        </div>

        <!-- 统一加载状态：加载更多/END/空状态/返回顶部 -->
        <InfiniteScrollLoader :loading="loading" :has-more="hasMoreData" :data-length="assets.length"
          :empty-text="emptyDescription" image-size="280px" :show-loading-state="false" />
      </div>

      <!-- 固定在底部的状态和回到顶部按钮 -->
      <div v-if="generatingCount > 0 || showBackTop" class="fixed-bottom-overlay">
        <div class="status-content">
          <!-- 生成状态（仅在有生成中任务时显示） -->
          <div v-if="generatingCount > 0" class="generating-status-section">
            <el-icon class="is-loading status-icon">
              <Loading />
            </el-icon>
            <span class="status-text">{{ completedCount }}/{{ generatingCount }} 生成中</span>
          </div>

          <!-- 竖线分隔符（当两个元素都存在时显示） -->
          <div v-if="generatingCount > 0 && showBackTop" class="divider"></div>

          <!-- 回到顶部按钮（仅在有滚动时显示） -->
          <div v-if="showBackTop" class="back-to-top-section" @click="scrollToTop">
            <el-icon class="back-to-top-icon">
              <ArrowUp />
            </el-icon>
            <span class="back-to-top-text">回到顶部</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 自动导入：Vue API, Element Plus 图标
import { type Asset } from '@/composables/useTaskPolling'
import { ElMessage } from 'element-plus'
import { Loading, ArrowUp, Refresh } from '@element-plus/icons-vue'
import { images } from '@/assets'
import GradientProgress from './GradientProgress.vue'

// 定义组件属性
interface Props {
  assets: Asset[]
  currentIndex: number
  // 分页相关属性
  hasMoreData?: boolean
  loading?: boolean // 加载中（自动判断是首次加载还是加载更多）
  loadingMore?: boolean // 加载更多标志，防止重复请求
  // 下载中状态（用于按钮展示 loading/禁用）
  downloadingAssetKeys?: Array<string | number>
  // 会员状态
  isVip?: boolean
  // 去除水印开关状态
  removeWatermarkEnabled?: boolean
}

// 定义组件事件
interface Emits {
  (e: 'asset-click', index: number): void
  (e: 'tab-change', tabKey: string, fileType?: number): void
  (e: 'scroll-change', scrollPercentage: number): void
  (e: 'load-more'): void
  (e: 'view-detail', index: number): void
  (e: 'collect', index: number): void
  (e: 'download', index: number, removeWatermark?: boolean): void
  (e: 'delete', index: number): void
  (e: 'watermark-toggle-change', enabled: boolean): void
  (e: 'open-membership-modal'): void
  (e: 'open-watermark-disclaimer'): void
  (e: 'refresh'): void
}

const props = withDefaults(defineProps<Props>(), {
  hasMoreData: false,
  loading: false,
  loadingMore: false,
  downloadingAssetKeys: () => [],
  isVip: false,
  removeWatermarkEnabled: false,
})

const emit = defineEmits<Emits>()

// 去除水印开关状态（本地状态，从 props 同步）
const removeWatermarkEnabled = ref(props.removeWatermarkEnabled)

// 监听 props 变化
watch(
  () => props.removeWatermarkEnabled,
  (newVal) => {
    removeWatermarkEnabled.value = newVal
  }
)

// 响应式数据
const mainContentRef = ref()
const activeContentTab = ref('all')

// 回到顶部相关
const showBackTop = ref(false)

// 已完成数量（所有生成中资产的已完成数量总和）
const completedCount = computed(() => {
  const generatingAssets = props.assets.filter((asset) => asset.status === 2)
  // 计算所有生成中资产的已完成数量（成功数量 + 失败数量）
  return generatingAssets.reduce((total, asset) => {
    const successfulCount = asset.successfulCount || 0
    const failedCount = asset.failedCount || 0
    // 已完成数量 = 成功数量 + 失败数量
    return total + successfulCount + failedCount
  }, 0)
})

// 正在生成中数量（所有生成中资产的正在生成中数量总和）
const generatingCount = computed(() => {
  const generatingAssets = props.assets.filter((asset) => asset.status === 2)
  // 计算所有生成中资产的正在生成中数量
  return generatingAssets.reduce((total, asset) => {
    const successfulCount = asset.successfulCount || 0
    const failedCount = asset.failedCount || 0
    const count = asset.count || 1
    // 已完成数量 = 成功数量 + 失败数量
    const completedCount = successfulCount + failedCount
    // 正在生成中数量 = 总数 - 已完成数量
    const generatingCount = Math.max(0, count - completedCount)
    return total + generatingCount
  }, 0)
})

// 下载中的 key 集合（来自父级）
const downloadingKeySet = computed(() => new Set(props.downloadingAssetKeys))

const getAssetKey = (asset: Asset, index: number) => {
  // 尽量使用稳定且唯一的 key（与 v-for key 口径保持一致）
  return (asset as any).id || (asset as any).taskId || (asset as any).taskUuid || `asset-${index}`
}

const isDownloading = (asset: Asset, index: number) => {
  return downloadingKeySet.value.has(getAssetKey(asset, index))
}

// MediaPlayer 引用映射
const mediaPlayerRefs = new Map<number, any>()

// 设置 MediaPlayer ref
const setMediaPlayerRef = (el: any, index: number) => {
  if (el) {
    mediaPlayerRefs.set(index, el)
  } else {
    mediaPlayerRefs.delete(index)
  }
}

// Intersection Observer 实例
let intersectionObserver: IntersectionObserver | null = null

// 当前正在播放的视频索引
const currentPlayingIndex = ref<number | null>(null)

// 计算属性：获取当前选中的资产（预留扩展，当前未直接使用）
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const currentAsset = computed(() => {
  // 只有当用户主动选择了资产（currentIndex >= 0）且索引有效时才返回
  if (props.currentIndex >= 0 && props.currentIndex < props.assets.length) {
    return props.assets[props.currentIndex]
  }
  // 没有选择时返回 null，不显示任何资产
  return null
})
void currentAsset

// 计算属性：根据图片尺寸判断媒体框架的样式类（预留扩展，当前未使用）
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const mediaFrameClass = computed(() => '')
void mediaFrameClass

// 内容标签
const contentTabs = ref<Array<{ key: string; label: string; fileType?: number }>>([
  { key: 'all', label: '全部' },
  { key: 'images', label: '图片', fileType: 1 },
  { key: 'videos', label: '视频', fileType: 2 },
  { key: 'fashion', label: '服装设计', fileType: 3 },
  { key: 'fabric', label: 'AI面料', fileType: 4 },
  { key: 'favorites', label: '收藏' },
])

// 计算属性：空状态提示文字
const emptyDescription = computed(() => {
  switch (activeContentTab.value) {
    case 'favorites':
      return '暂无收藏的作品'
    case 'images':
      return '暂无图片作品'
    case 'videos':
      return '暂无视频作品'
    default:
      return '还没有生成任何作品'
  }
})

// 进度显示：只使用接口返回的 progress 字段，向下取整并限制在 0-100
const getProgressValue = (asset: Asset) => {
  const raw = Number(asset.progress ?? 0)
  if (Number.isNaN(raw)) return 0
  return Math.min(100, Math.max(0, Math.floor(raw)))
}

// 处理主大图拖拽开始：与缩略图拖拽保持同一协议，方便左侧统一解析
const handleAssetDragStart = (asset: Asset, event: DragEvent) => {
  try {
    // 视频不参与拖拽到图片上传区
    if (asset.fileType === 2) {
      event.preventDefault()
      return
    }

    const data = {
      type: 'asset',
      imageUrl: asset.imageUrl,
      fileUrl: asset.fileUrl,
      id: (asset as any).id,
      fileType: asset.fileType,
    }
    event.dataTransfer?.setData('application/json', JSON.stringify(data))
    if (asset.imageUrl) {
      event.dataTransfer?.setData('text/plain', asset.imageUrl)
    }
  } catch (e) {
    console.error('[MainImageDisplay] 拖拽初始化失败:', e)
  }
}

// 方法
const handleTabChange = (tabKey: string | number) => {
  const key = String(tabKey)
  activeContentTab.value = key
  const tab = contentTabs.value.find((t) => t.key === key)
  emit('tab-change', key, tab?.fileType)
}

// 刷新列表
const handleRefresh = () => {
  if (props.loading) return
  emit('refresh')
}

// 点击标志
let isClickingAsset = false

const selectAsset = (index: number) => {
  // 设置点击标志，让watch处理滚动
  isClickingAsset = true
  emit('asset-click', index)

  // 短暂延迟后重置点击标志
  setTimeout(() => {
    isClickingAsset = false
  }, 300)
}

// 处理加载更多
const handleLoadMore = () => {
  emit('load-more')
}

// 处理查看详情
const handleViewDetail = (index: number) => {
  console.log('[操作] 查看详情:', index)
  emit('view-detail', index)
}

// 处理收藏
const handleCollect = (index: number) => {
  console.log('[操作] 收藏资产:', index)
  emit('collect', index)
}

// 处理下载菜单命令
const handleDownloadCommand = (command: string, index: number) => {
  if (command === 'download') {
    const currentAsset = props.assets[index]
    if (currentAsset) {
      emit('download', index, removeWatermarkEnabled.value)
    }
  } else if (command === 'toggle-watermark') {
    // 点击整个按钮区域时切换开关状态
    handleWatermarkToggleChange(!removeWatermarkEnabled.value)
  }
}

// 处理下载菜单显示/隐藏
const handleDownloadMenuVisible = (_visible: boolean) => {
  // 菜单显示时可以做一些处理
}

// 处理去除水印开关变化
const handleWatermarkToggleChange = (val: string | number | boolean) => {
  const enabled = val === true || val === 1 || val === '1' || val === 'true'
  // 如果不是会员，打开会员购买弹窗
  if (!props.isVip) {
    emit('open-membership-modal')
    // 恢复开关状态
    removeWatermarkEnabled.value = false
    return
  }

  // 如果是会员，检查是否需要显示责任声明
  const noRemind = localStorage.getItem('watermark_disclaimer_no_remind') === 'true'
  if (!noRemind && enabled) {
    // 显示责任声明弹窗
    emit('open-watermark-disclaimer')
    // 先不更新状态，等用户确认后再更新
    removeWatermarkEnabled.value = false
    return
  }

  // 更新状态
  removeWatermarkEnabled.value = enabled
  emit('watermark-toggle-change', enabled)
}

// 处理删除
const handleDelete = (index: number) => {
  console.log('[操作] 删除资产:', index)
  emit('delete', index)
}

// 组件挂载时添加滚动监听和 Intersection Observer
onMounted(() => {
  nextTick(() => {
    if (mainContentRef.value) {
      mainContentRef.value.addEventListener('scroll', handleScroll, { passive: true })
    }
    initIntersectionObserver()
  })
})

// 组件卸载时移除滚动监听和清理 Observer
onUnmounted(() => {
  if (mainContentRef.value) {
    mainContentRef.value.removeEventListener('scroll', handleScroll)
  }

  if (intersectionObserver) {
    intersectionObserver.disconnect()
    intersectionObserver = null
  }

  // 清理所有视频引用
  mediaPlayerRefs.clear()
})

// 标志位：防止 Intersection Observer 和 scrollIntoView 循环冲突
let isAutoScrolling = false
let isExternalScrolling = false // 标志位：防止外部调用 scrollToAsset 时触发 watch

// 监听当前索引变化，自动滚动到对应位置
watch(
  () => props.currentIndex,
  (newIndex, oldIndex) => {
    // 如果是 Intersection Observer 触发的，不要再次滚动
    if (isAutoScrolling) {
      isAutoScrolling = false
      return
    }

    // 如果是外部调用 scrollToAsset 触发的，不要再次滚动
    if (isExternalScrolling) {
      isExternalScrolling = false
      return
    }

    nextTick(() => {
      if (mainContentRef.value && newIndex >= 0 && newIndex !== oldIndex) {
        const assetItem = mainContentRef.value.querySelectorAll('.asset-item')[newIndex]
        if (assetItem) {
          // 点击时使用auto快速响应，其他情况使用smooth
          assetItem.scrollIntoView({
            behavior: isClickingAsset ? 'auto' : 'smooth',
            block: 'start',
          })
        }
      }
    })
  }
)

// 监听资产列表变化，重新观察元素
watch(
  () => props.assets,
  () => {
    nextTick(() => {
      observeMediaElements()
    })
  },
  { deep: true }
)

// 记录已提示过的失败数量，避免重复提示
const failedCountNotified = new Map<string, number>()

// 监听失败数量变化，显示提示
watch(
  () => props.assets,
  (newAssets) => {
    newAssets.forEach((asset) => {
      // 只处理生成中状态且有失败数量的资产
      if (asset.status === 2 && asset.failedCount && asset.failedCount > 0) {
        const previousFailedCount = failedCountNotified.get(asset.id) || 0
        // 如果失败数量增加了，显示提示
        if (asset.failedCount > previousFailedCount) {
          const successfulCount = asset.successfulCount || 0
          ElMessage.warning(
            `成功${successfulCount}个，失败${asset.failedCount}个${successfulCount > 0 ? '（失败已返还潮币）' : ''}`
          )
          failedCountNotified.set(asset.id, asset.failedCount)
        }
      }
    })
  },
  { deep: true }
)

// 初始化 Intersection Observer
const initIntersectionObserver = () => {
  if (!mainContentRef.value) {
    console.log('[智能播放] mainContentRef 未准备好，稍后重试')
    return
  }

  try {
    // 创建 Intersection Observer
    // threshold: 多个阈值便于精确控制选中和播放
    // rootMargin: 视口中间60%区域（上下各-20%）
    intersectionObserver = new IntersectionObserver(
      (entries) => {
        handleIntersection(entries)
      },
      {
        root: mainContentRef.value,
        rootMargin: '-20% 0px -20% 0px', // 视口中间60%的区域
        threshold: [0, 0.3, 0.5, 0.6, 0.8, 1], // 多个阈值，更精确地控制
      }
    )

    console.log('[智能播放] Intersection Observer 初始化成功')

    // 观察所有媒体元素
    observeMediaElements()
  } catch (error) {
    console.error('[智能播放] 初始化 Intersection Observer 失败:', error)
  }
}

// 观察所有媒体元素
const observeMediaElements = () => {
  if (!intersectionObserver || !mainContentRef.value) return

  try {
    // 先断开所有旧观察
    intersectionObserver.disconnect()

    // 观察所有 asset-item
    const assetItems = mainContentRef.value.querySelectorAll('.asset-item')
    assetItems.forEach((item: Element) => {
      intersectionObserver!.observe(item)
    })

    console.log(`[智能播放] 正在观察 ${assetItems.length} 个资产元素`)
  } catch (error) {
    console.error('[智能播放] 观察媒体元素时出错:', error)
  }
}

// 处理 Intersection 事件
const handleIntersection = (entries: IntersectionObserverEntry[]) => {
  entries.forEach((entry) => {
    try {
      const target = entry.target as HTMLElement
      const mediaFrame = target.querySelector('.media-frame') as HTMLElement
      if (!mediaFrame) {
        console.log('[智能播放] 未找到 media-frame 元素')
        return
      }

      const indexStr = mediaFrame.getAttribute('data-asset-index')
      if (!indexStr) {
        console.log('[智能播放] 未找到 data-asset-index 属性')
        return
      }

      const index = parseInt(indexStr, 10)
      const asset = props.assets[index]
      if (!asset) {
        console.log('[智能播放] 未找到资产数据:', index)
        return
      }

      console.log(`[智能播放] 检测资产 ${index}:`, {
        isIntersecting: entry.isIntersecting,
        intersectionRatio: Math.round(entry.intersectionRatio * 100) / 100, // 保持数字类型，保留2位小数
        fileType: asset.fileType,
        status: asset.status,
      })

      // 当资产进入视口（可见度超过30%时更新选中状态）
      if (entry.isIntersecting && entry.intersectionRatio > 0.3) {
        // 更新选中状态（同步缩略图）
        if (props.currentIndex !== index) {
          isAutoScrolling = true // 标记为自动滚动触发，避免 watch 再次滚动
          emit('asset-click', index)
          console.log(
            `[智能播放] 更新选中索引: ${index}，可见度: ${Math.round(entry.intersectionRatio * 100)}%`
          )
        }
      }

      // 当资产滚动到视口中心区域（intersectionRatio >= 0.6，即可见60%以上）才自动播放视频
      if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
        // 如果是视频，自动播放
        if (asset.fileType === 2) {
          const mediaPlayer = mediaPlayerRefs.get(index)
          console.log(`[智能播放] 获取到的 mediaPlayer ref:`, mediaPlayer)

          if (!mediaPlayer) {
            console.warn(`[智能播放] 未找到索引 ${index} 的 MediaPlayer ref`)
            return
          }

          // 如果当前有其他视频在播放，先暂停
          if (currentPlayingIndex.value !== null && currentPlayingIndex.value !== index) {
            const currentPlayer = mediaPlayerRefs.get(currentPlayingIndex.value)
            if (currentPlayer && typeof currentPlayer.pause === 'function') {
              currentPlayer.pause()
              console.log(`[智能播放] 暂停其他视频 ${currentPlayingIndex.value}`)
            }
          }

          // 自动播放当前视频
          // 尝试多种方式调用播放
          try {
            if (typeof mediaPlayer.play === 'function') {
              const playPromise = mediaPlayer.play()
              if (playPromise !== undefined) {
                playPromise
                  .then(() => {
                    currentPlayingIndex.value = index
                    console.log(`[智能播放] ✅ 自动播放视频 ${index} 成功`)
                  })
                  .catch((error: any) => {
                    console.error(`[智能播放] ❌ 播放视频 ${index} 失败:`, error)
                  })
              }
            } else if (mediaPlayer.$el?.play) {
              // 尝试通过 $el 访问原生video元素
              const playPromise = mediaPlayer.$el.play()
              if (playPromise !== undefined) {
                playPromise
                  .then(() => {
                    currentPlayingIndex.value = index
                    console.log(`[智能播放] ✅ 通过$el自动播放视频 ${index} 成功`)
                  })
                  .catch((error: any) => {
                    console.error(`[智能播放] ❌ 通过$el播放视频 ${index} 失败:`, error)
                  })
              }
            } else {
              console.error(`[智能播放] MediaPlayer 没有 play 方法`, mediaPlayer)
            }
          } catch (error) {
            console.error(`[智能播放] 播放视频时发生异常:`, error)
          }
        }
      } else {
        // 离开中心区域，如果是视频则暂停播放
        if (asset.fileType === 2 && currentPlayingIndex.value === index) {
          const mediaPlayer = mediaPlayerRefs.get(index)
          if (mediaPlayer && typeof mediaPlayer.pause === 'function') {
            mediaPlayer.pause()
            currentPlayingIndex.value = null
            console.log(`[智能播放] 自动暂停视频 ${index}`)
          }
        }
      }
    } catch (error) {
      console.error('[智能播放] 处理资产时出错:', error)
    }
  })
}

// 处理用户点击播放视频
const handleVideoPlay = (index: number) => {
  console.log(`[用户点击] 播放视频 ${index}`)

  // 如果有其他视频正在播放，先暂停
  if (currentPlayingIndex.value !== null && currentPlayingIndex.value !== index) {
    const currentPlayer = mediaPlayerRefs.get(currentPlayingIndex.value)
    if (currentPlayer && typeof currentPlayer.pause === 'function') {
      currentPlayer.pause()
      console.log(`[用户点击] 暂停其他视频 ${currentPlayingIndex.value}`)
    }
  }

  // 更新当前播放索引
  currentPlayingIndex.value = index
}

// 处理用户点击暂停视频
const handleVideoPause = (index: number) => {
  console.log(`[用户点击] 暂停视频 ${index}`)

  // 如果暂停的是当前播放的视频，清除播放索引
  if (currentPlayingIndex.value === index) {
    currentPlayingIndex.value = null
  }
}

// 监听滚动事件，同步到缩略图（传递滚动百分比）
const handleScroll = () => {
  if (!mainContentRef.value) return

  // 直接计算并发送，不使用节流，保持实时性
  const { scrollTop, scrollHeight, clientHeight } = mainContentRef.value
  const maxScroll = scrollHeight - clientHeight

  // 计算滚动百分比（0-1之间）
  const scrollPercentage = maxScroll > 0 ? scrollTop / maxScroll : 0

  // 控制回到顶部按钮显示
  showBackTop.value = scrollTop > 300

  emit('scroll-change', scrollPercentage)
}

// 回到顶部方法
const scrollToTop = () => {
  if (mainContentRef.value) {
    mainContentRef.value.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }
}

// 预留：检测当前可见的资产（目前未用到，后续可扩展智能播放等能力）
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const detectVisibleAsset = () => { }
void detectVisibleAsset

// 滚动到指定资产（供外部调用，如缩略图点击）
const scrollToAsset = (index: number) => {
  if (index < 0 || index >= props.assets.length) return

  // 设置标志位，防止触发 watch 中的重复滚动
  isExternalScrolling = true

  nextTick(() => {
    if (mainContentRef.value) {
      const assetItem = mainContentRef.value.querySelectorAll('.asset-item')[index]
      if (assetItem) {
        isClickingAsset = true
        assetItem.scrollIntoView({
          behavior: 'auto',
          block: 'start',
        })
        // 短暂延迟后重置标志
        setTimeout(() => {
          isClickingAsset = false
          isExternalScrolling = false
        }, 300)
      } else {
        isExternalScrolling = false
      }
    } else {
      isExternalScrolling = false
    }
  })
}

// 同步滚动（供缩略图调用，根据滚动百分比同步主图滚动）
const syncScroll = (scrollPercentage: number) => {
  if (!mainContentRef.value) return

  const { scrollHeight, clientHeight } = mainContentRef.value
  const maxScroll = scrollHeight - clientHeight
  if (maxScroll > 0) {
    const targetScrollTop = maxScroll * scrollPercentage
    mainContentRef.value.scrollTop = targetScrollTop
  }
}

// 暴露给父组件
defineExpose({
  activeContentTab,
  scrollToAsset,
  syncScroll,
})
</script>

<style lang="scss" scoped>
/* ========== 主容器 ========== */
.main-image-display {
  flex: 1;
  background-color: var(--primary-dark);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* ========== 内容标签页 ========== */
.content-tabs {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-md) var(--spacing-lg) 0;

  :deep(.el-tabs__item) {
    &:hover {
      color: var($color-primary) !important;
    }

    &.is-active {
      color: var($color-primary) !important;
    }
  }

  :deep(.el-tabs__active-bar) {
    background-color: var($color-primary) !important;
  }

  // 去掉未选中标签页的底部横线
  :deep(.el-tabs__header) {
    border-bottom: none !important;
  }

  :deep(.el-tabs__nav-wrap::after) {
    display: none !important;
  }
}

/* ========== 主内容区域 ========== */
.main-content-area {
  flex: 1;
  padding: 0 var(--spacing-lg) var(--spacing-lg);
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch; // iOS平滑滚动
  will-change: scroll-position; // 优化滚动性能

  // 隐藏滚动条，但保留滚动功能
  &::-webkit-scrollbar {
    width: 0;
    display: none;
  }

  scrollbar-width: none; // Firefox
  -ms-overflow-style: none; // IE/Edge
}

/* ========== 资产列表 ========== */
.assets-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.asset-item {
  border-radius: var(--radius-lg);
  cursor: pointer;
  will-change: transform;
  transform: translateZ(0); // GPU加速

  &.failed {
    opacity: 0.8;
  }
}

/* ========== 资产项内容 ========== */
.asset-prompt {
  color: var(--text-primary);
  font-size: var(--font-sm);
  line-height: 1.6;
  margin-bottom: var(--spacing-md);
  white-space: pre-wrap; // 保留换行符，支持多行显示
  word-break: break-word; // 长单词自动换行
}

/* ========== 资产占位符（生成中/失败） ========== */
.asset-placeholder {
  position: relative;
  width: 100%;
  border-radius: var(--radius-md);
  background-color: var(--bg-secondary);
  margin-bottom: var(--spacing-md);
  overflow: hidden;

  &.generating {
    background-color: transparent;
  }

  &.failed {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 200px;

    .placeholder-icon {
      width: 120px;
      height: 120px;
      margin-bottom: var(--spacing-sm);
      object-fit: contain;
    }

    .placeholder-text {
      font-size: var(--font-sm);
      color: var(--text-secondary);
    }
  }
}

/* ========== 骨架屏盒子 ========== */
.skeleton-box {
  position: relative;
  width: 100%;
  height: 500px;
  background: linear-gradient(90deg, #2a2a3e 0%, #32324a 50%, #2a2a3e 100%);
  background-size: 200% 100%;
  border-radius: var(--radius-md);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* ========== 从左向右的光影动画 ========== */
.skeleton-shimmer {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg,
      rgba(255, 255, 255, 0) 0%,
      rgba(0, 212, 170, 0.1) 50%,
      rgba(255, 255, 255, 0) 100%);
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% {
    left: -100%;
  }

  100% {
    left: 100%;
  }
}

/* ========== 生成状态文字 ========== */
.generating-status {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-sm);

  .status-icon {
    font-size: 48px;
    color: var(--primary-color);
  }

  .status-text {
    font-size: 16px;
    color: var(--primary-color);
    font-weight: 500;
    letter-spacing: 1px;
  }
}

/* 卡片内的进度条容器 */
.card-progress {
  width: 360px;
  max-width: 90%;
  margin-top: var(--spacing-md);
}

/* ========== 当前资产展示区域 ========== */
.current-asset-display {
  overflow: hidden;
}

.media-frame {
  position: relative;
  background-color: var(--bg-card);
  border-radius: var(--radius-md);
  overflow: hidden;
  width: 100%;
  height: 500px;
  /* 固定高度确保容器有明确尺寸 */
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  /* 针对不同比例的图片优化 */
  &.portrait {
    height: 400px;
  }

  &.landscape {
    height: 250px;
  }

  &.square {
    height: 300px;
  }
}

.media-player {
  width: 100%;
  height: 100%;
  /* 填满父容器 */
  display: block;
  object-fit: contain;
  /* 使用cover确保填满容器 */

  /* 确保MediaPlayer内部容器也有正确高度 */
  :deep(.media-container) {
    width: 100%;
    height: 100%;
  }
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: var(--spacing-lg);
  margin-top: var(--spacing-md);

  .action-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: var(--font-sm);
    transition: all 0.3s ease;

    .collect-icon,
    .action-icon {
      width: 16px;
      height: 16px;
      object-fit: contain;
    }

    span {
      margin-left: var(--spacing-xs);
    }

    &.is-collected {
      color: var(--primary-color);
      border-color: var(--primary-color);
      background-color: rgba(143, 80, 234, 0.1);

      &:hover {
        background-color: rgba(143, 80, 234, 0.2);
      }
    }

    &.delete-btn {
      &:hover {
        color: var(--danger-color, #f56c6c);
        border-color: var(--danger-color, #f56c6c);
      }
    }
  }
}

/* ========== 固定在底部的状态和回到顶部按钮 ========== */
.main-content-area {
  position: relative;
}

.fixed-bottom-overlay {
  position: sticky;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-sm);
  pointer-events: none;

  .status-content {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    padding: var(--spacing-sm) var(--spacing-md);
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-2xl);
    box-shadow: var(--shadow-md);
    pointer-events: auto;

    /* 生成状态区域 */
    .generating-status-section {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);

      .status-icon {
        font-size: var(--font-md);
        color: var(--primary-color);
      }

      .status-text {
        color: var(--text-primary);
        font-size: var(--font-sm);
        font-weight: 500;
        white-space: nowrap;
      }
    }

    /* 竖线分隔符 */
    .divider {
      width: 1px;
      height: 10px;
      background: var(--border-color);
      flex-shrink: 0;
    }

    /* 回到顶部按钮 */
    .back-to-top-section {
      display: flex;
      align-items: center;
      gap: var(--spacing-xs);
      cursor: pointer;
      transition: all 0.3s ease;

      &:hover {
        .back-to-top-icon {
          color: var(--primary-color);
        }

        .back-to-top-text {
          color: var(--primary-color);
        }
      }

      .back-to-top-icon {
        font-size: var(--font-md);
        color: var(--text-secondary);
        transition: color 0.3s ease;
      }

      .back-to-top-text {
        color: var(--text-secondary);
        font-size: var(--font-sm);
        font-weight: 500;
        white-space: nowrap;
        transition: color 0.3s ease;
      }
    }
  }
}
</style>
