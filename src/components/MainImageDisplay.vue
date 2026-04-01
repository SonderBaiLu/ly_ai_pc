<template>
  <div class="main-image-display">
    <!-- 内容标签 -->
    <div class="content-tabs">
      <el-tabs v-model="activeContentTab" @tab-change="handleTabChange">
        <el-tab-pane v-for="tab in contentTabs" :key="tab.key" :label="tab.label" :name="tab.key" />
      </el-tabs>
      <!-- 刷新按钮 -->
      <!-- <el-button :loading="loading" :disabled="loading" @click="handleRefresh">
        <el-icon>
          <Refresh />
        </el-icon>
        <span>刷新</span>
      </el-button> -->
    </div>

    <!-- 主内容显示区域（使用 el-scrollbar 触底加载，避免 v-infinite-scroll 弃用警告） -->
    <el-scrollbar ref="scrollbarRef" class="main-content-area" @scroll="handleMainScroll">
      <div ref="mainContentRef" v-loading="loading && assets.length === 0">
        <!-- 创作列表 -->
        <div class="assets-list">
          <!-- 创作项 -->
          <div v-for="(asset, index) in assets"
            :key="asset.id || asset.algoOrderId || asset.algoUuId || `creation-${index}`" class="asset-item" :class="[
              { active: index === currentIndex },
              asset.status === 0 || asset.status === 1 || asset.status === 2 ? 'generating' : asset.status === 4 ? 'failed' : '',
            ]" @click="selectAsset(index)">

            <!-- 生成中状态（使用动态图占位；不展示进度条） -->
            <div v-if="asset.status === 0 || asset.status === 1 || asset.status === 2"
              class="asset-placeholder generating">
              <LoadingSpinner :size="72" :thickness="8" />
              <div class="status-text">正在生成中...</div>
              <GradientProgress :percentage="getProgressValue(asset)" />
            </div>

            <!-- 生成失败状态 -->
            <div v-else-if="asset.status === 4" class="asset-placeholder failed">
              <img :src="images.fail" class="placeholder-icon" alt="生成失败" />
              <div>生成失败</div>
            </div>

            <!-- 正常显示：当前选中创作的主要显示区域 -->
            <div v-else class="current-asset-display">
              <!-- 媒体展示区域 - 点击跳转详情 -->
              <div class="media-frame" :data-asset-index="index" :draggable="!isVideo(asset)"
                @click="handleViewDetail(index)" @dragstart.stop="handleAssetDragStart(asset, $event)">
                <MediaPlayer :ref="(el: any) => setMediaPlayerRef(el, index)"
                  :src="isVideo(asset) ? getVideoUrl(asset) : ''" :poster="getImagePoster(asset)" width="100%"
                  height="100%" :autoplay="false" :muted="false" :loop="false" :controls="true" object-fit="contain"
                  poster-fit="contain" class="media-player" :minimal-controls="true" :image-only="!isVideo(asset)"
                  @play="() => handleVideoPlay(index)" @pause="() => handleVideoPause(index)" />
              </div>

              <!-- 操作按钮栏 -->
              <div class="action-buttons">
                <el-button class="action-btn" :class="{ 'is-collected': isCollected(asset) }" type="primary"
                  @click.stop="handleCollect(index)">
                  <img :src="isCollected(asset) ? images.collect : images.collectNo" alt="收藏" class="action-icon" />
                  <span>{{ isCollected(asset) ? '已收藏' : '收藏' }}</span>
                </el-button>
                <el-popover placement="bottom" :width="146" trigger="click" popper-class="download-menu-popper"
                  :visible="downloadMenuVisibleIndex === index"
                  @update:visible="(visible: boolean) => setDownloadMenuVisible(index, visible)">
                  <template #reference>
                    <el-button class="action-btn" :loading="isDownloading(asset, index)"
                      :disabled="isDownloading(asset, index)" type="primary" @click.stop>
                      <img :src="images.downloadIcon" alt="下载" class="action-icon" />
                      <span>{{ isDownloading(asset, index) ? '下载中...' : '下载' }}</span>
                    </el-button>
                  </template>
                  <div class="download-menu">
                    <div class="download-menu-item" @click.stop="handleDownloadFromMenu(index)">
                      <img :src="images.downloadIcon" alt="下载" class="download-menu-icon" />
                      <span>下载</span>
                    </div>
                    <div class="download-menu-item switch-row">
                      <el-switch v-model="removeWatermarkEnabled" :disabled="!props.isVip" active-color="#17A0E1"
                        inactive-color="#201B26" @change="(v) => handleRemoveWatermarkToggle(Boolean(v))" />
                      <span>去除水印</span>
                      <img :src="images.vipText" alt="VIP" class="vip-text-icon" />
                    </div>
                  </div>
                </el-popover>
                <el-button class="action-btn delete-btn" type="primary" @click.stop="handleDelete(index)">
                  <img :src="images.delMini" alt="删除" class="action-icon" />
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
    </el-scrollbar>
  </div>
</template>

<script setup lang="ts">
// 自动导入：Vue API, Element Plus 图标
import { type CreationResult } from '@/composables/useTaskPolling'
import { ElMessage } from 'element-plus'
import { ArrowUp, Loading } from '@element-plus/icons-vue'
import { images } from '@/assets'
import GradientProgress from './GradientProgress.vue'
import LoadingSpinner from './LoadingSpinner.vue'
import { useModalStore } from '@/stores/modal'
import { useUserStore } from '@/stores/user'

// 定义组件属性
interface Props {
  assets: CreationResult[]
  currentIndex: number
  // 分页相关属性
  hasMoreData?: boolean
  loading?: boolean // 加载中（自动判断是首次加载还是加载更多）
  loadingMore?: boolean // 加载更多标志，防止重复请求
  // 右侧顶部导航（用于展示“一级菜单 + 收藏”）
  contentTabs?: Array<{ key: string; label: string; fileType?: number }>
  // 父层控制：用于让右侧 el-tabs 默认/切换时保持同一 key
  activeTabKey?: string
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
  contentTabs: () => [],
  downloadingAssetKeys: () => [],
  isVip: false,
  removeWatermarkEnabled: false,
  activeTabKey: '',
})

const emit = defineEmits<Emits>()

const modalStore = useModalStore()
const userStore = useUserStore()

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
const mainContentRef = ref<HTMLElement>()
const scrollbarRef = ref<any>(null)
const activeContentTab = ref(props.activeTabKey || 'all')
const downloadMenuVisibleIndex = ref<number | null>(null)

// 回到顶部相关
const showBackTop = ref(false)

// 已完成数量（所有生成中创作的已完成数量总和）
const completedCount = computed(() => {
  const generatingAssets = props.assets.filter((asset) => asset.status === 2)
  // 计算所有生成中创作的已完成数量（成功数量 + 失败数量）
  return generatingAssets.reduce((total, asset) => {
    const successfulCount = asset.successfulCount || 0
    const failedCount = asset.failedCount || 0
    // 已完成数量 = 成功数量 + 失败数量
    return total + successfulCount + failedCount
  }, 0)
})

// 正在生成中数量（所有生成中创作的正在生成中数量总和）
const generatingCount = computed(() => {
  const generatingAssets = props.assets.filter((asset) => asset.status === 2)
  // 计算所有生成中创作的正在生成中数量
  return generatingAssets.reduce((total, asset) => {
    const successfulCount = asset.successfulCount || 0
    const failedCount = asset.failedCount || 0
    // 最新字段不再提供 count：按“至少 1 个结果”估算
    const count = Math.max(1, Number(asset.successfulCount ?? 0) + Number(asset.failedCount ?? 0) || 1)
    // 已完成数量 = 成功数量 + 失败数量
    const completedCount = successfulCount + failedCount
    // 正在生成中数量 = 总数 - 已完成数量
    const generatingCount = Math.max(0, count - completedCount)
    return total + generatingCount
  }, 0)
})

// 下载中的 key 集合（来自父级）
const downloadingKeySet = computed(() => new Set(props.downloadingAssetKeys))

const getAssetKey = (asset: CreationResult, index: number) => {
  // 尽量使用稳定且唯一的 key（与 v-for key 口径保持一致）
  return (asset as any).id || (asset as any).algoOrderId || (asset as any).algoUuId || `creation-${index}`
}

const isDownloading = (asset: CreationResult, index: number) => {
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

// 计算属性：获取当前选中的创作（预留扩展，当前未直接使用）

const currentAsset = computed(() => {
  // 只有当用户主动选择了创作（currentIndex >= 0）且索引有效时才返回
  if (props.currentIndex >= 0 && props.currentIndex < props.assets.length) {
    return props.assets[props.currentIndex]
  }
  // 没有选择时返回 null，不显示任何创作
  return null
})
void currentAsset

// 计算属性：根据图片尺寸判断媒体框架的样式类（预留扩展，当前未使用）

const mediaFrameClass = computed(() => '')
void mediaFrameClass

// 默认内容标签（历史/兜底用；若父级传入 contentTabs 则以父级为准）
const defaultContentTabs = [
  { key: 'all', label: '全部' },
  { key: 'fashion', label: '服装设计', fileType: 3 },
  { key: 'fabric', label: 'AI面料', fileType: 4 },
  { key: 'favorites', label: '收藏' },
]

// 内容标签：优先使用父级传入
const contentTabs = computed(() => {
  return Array.isArray(props.contentTabs) && props.contentTabs.length ? props.contentTabs : defaultContentTabs
})

// activeContentTab 若不在 tabs 列表中，则切换到第一个 tab
watch(
  contentTabs,
  (tabs) => {
    if (!tabs?.length) return
    const hasActive = tabs.some((t) => t.key === activeContentTab.value)
    const hasExternal = props.activeTabKey && tabs.some((t) => t.key === props.activeTabKey)
    if (hasExternal) {
      activeContentTab.value = props.activeTabKey
    } else if (!hasActive) {
      activeContentTab.value = tabs[0].key
    }
  },
  { immediate: true },
)

// 父层 activeTabKey 变化时，同步切换
watch(
  () => props.activeTabKey,
  (next) => {
    if (!next) return
    const tabs = contentTabs.value
    if (!tabs?.length) return
    if (tabs.some((t) => t.key === next)) {
      activeContentTab.value = next
    }
  },
)

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

const isVideo = (asset: CreationResult) => {
  const ft = Number((asset as any).fileType ?? asset.fileType)
  return ft === 2 || ft === 4
}

const getImagePoster = (asset: CreationResult) => {
  return (asset as any).thumbUrl || ''
}

const getVideoUrl = (asset: CreationResult) => {
  return (asset as any).url || ''
}

const isCollected = (asset: CreationResult) => {
  return Number((asset as any).collectStatus ?? 0) === 1
}

// 进度显示：直接使用接口 progress（0-100）
const getProgressValue = (asset: CreationResult) => {
  const p = Number((asset as any).progress ?? 0)
  if (!Number.isFinite(p)) return 0
  return Math.min(100, Math.max(0, Math.floor(p)))
}

// 进度显示：只使用接口返回的 progress 字段，向下取整并限制在 0-100
// 处理主大图拖拽开始：与缩略图拖拽保持同一协议，方便左侧统一解析
const handleAssetDragStart = (asset: CreationResult, event: DragEvent) => {
  try {
    // 视频不参与拖拽到图片上传区
    if (isVideo(asset)) {
      event.preventDefault()
      return
    }

    const data = {
      type: 'asset',
      imageUrl: getImagePoster(asset),
      fileUrl: getVideoUrl(asset),
      id: (asset as any).id,
      fileType: asset.fileType,
    }
    event.dataTransfer?.setData('application/json', JSON.stringify(data))
    const poster = getImagePoster(asset)
    if (poster) {
      event.dataTransfer?.setData('text/plain', poster)
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
  emit('tab-change', key, (tab as any)?.fileType)
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
  console.log('[操作] 收藏创作:', index)
  emit('collect', index)
}

// 处理下载
const handleDownload = (index: number) => {
  emit('download', index, removeWatermarkEnabled.value)
}

const setDownloadMenuVisible = (index: number, visible: boolean) => {
  downloadMenuVisibleIndex.value = visible ? index : null
}

const handleDownloadFromMenu = (index: number) => {
  handleDownload(index)
  downloadMenuVisibleIndex.value = null
}

const handleRemoveWatermarkToggle = async (enabled: boolean) => {
  if (enabled && !props.isVip) {
    removeWatermarkEnabled.value = false
    emit('watermark-toggle-change', false)
    emit('open-membership-modal')
    return
  }

  // VIP 且用户未选择“不再弹窗提醒”：需要先确认责任声明
  if (enabled) {
    const noRemind = localStorage.getItem('watermark_disclaimer_no_remind') === 'true'
    if (!noRemind) {
      // 与详情页一致：弹窗前先保持开关关闭
      removeWatermarkEnabled.value = false
      emit('watermark-toggle-change', false)
      modalStore.openWatermarkDisclaimerModalPage()
      return
    }
  }

  removeWatermarkEnabled.value = enabled
  emit('watermark-toggle-change', enabled)

  try {
    // watermarkStatus 1 表示“去除水印开启”（无水印）
    await userStore.updateUserInfo({ watermarkStatus: enabled ? 1 : 0 })
  } catch (e) {
    console.error('[MainImageDisplay] 更新水印状态失败:', e)
    // 接口失败则回显为 store 当前值（避免 UI 与后端不一致）
    removeWatermarkEnabled.value = userStore.userInfo?.watermarkStatus === 1
    emit('watermark-toggle-change', removeWatermarkEnabled.value)
  }
}
// 处理删除
const handleDelete = (index: number) => {
  console.log('[操作] 删除创作:', index)
  emit('delete', index)
}

// el-scrollbar 滚动：同步滚动状态 + 触底加载更多（替代 v-infinite-scroll）
const handleMainScroll = ({ scrollTop }: { scrollTop: number }) => {
  const wrapEl: HTMLElement | undefined = scrollbarRef.value?.wrapRef
  if (!wrapEl) return

  // 始终同步：回到顶部按钮显示 + 缩略图滚动百分比
  const maxScroll = wrapEl.scrollHeight - wrapEl.clientHeight
  const scrollPercentage = maxScroll > 0 ? scrollTop / maxScroll : 0
  showBackTop.value = scrollTop > 300
  emit('scroll-change', scrollPercentage)

  // 顶部兜底：滚到最顶时 IntersectionObserver 的 rootMargin 会让第 2 个更“可见”，导致自动选中错位
  // 这里在接近顶部时强制选中第 1 个，并短暂禁用自动选中避免被抢回。
  if (scrollTop <= 8 && props.assets.length > 0 && props.currentIndex !== 0) {
    allowAutoSelect = false
    isAutoScrolling = true
    emit('asset-click', 0)
    setTimeout(() => {
      allowAutoSelect = true
    }, 200)
  }

  // 触底加载更多
  if (props.loading || props.loadingMore || !props.hasMoreData) return
  const distance = 200
  const reachBottom = wrapEl.scrollHeight - (scrollTop + wrapEl.clientHeight) <= distance
  if (reachBottom) handleLoadMore()
}

// 组件挂载时初始化 Intersection Observer
onMounted(() => {
  nextTick(() => {
    // mainContentRef 用于 scrollToAsset/syncScroll：这里指向 scrollbar 的 wrap
    mainContentRef.value = (scrollbarRef.value?.wrapRef as HTMLElement) || mainContentRef.value
    initIntersectionObserver()
    // 首次渲染阶段可能误触发 IntersectionObserver，导致父层 currentIndex 被自动改掉
    // 所以要稍晚再允许自动选中逻辑（避免刷新时父层 currentIndex 还没就绪）
    setTimeout(() => {
      allowAutoSelect = true
    }, 300)
  })
})

// 组件卸载时移除滚动监听和清理 Observer
onUnmounted(() => {
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
// 允许自动选中（避免首屏 IntersectionObserver 误触发）
let allowAutoSelect = false

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

// 监听创作列表变化，重新观察元素
watch(
  () => props.assets,
  () => {
    nextTick(() => {
      // assets 列表变化时先禁用自动选中，等待父层 currentIndex 同步完成再启用
      allowAutoSelect = false
      observeMediaElements()
      setTimeout(() => {
        allowAutoSelect = true
      }, 300)
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
      // 只处理生成中状态且有失败数量的创作
      if (asset.status === 2 && asset.failedCount && asset.failedCount > 0) {
        const previousFailedCount = failedCountNotified.get(asset.id) || 0
        // 如果失败数量增加了，显示提示
        if (asset.failedCount > previousFailedCount) {
          const successfulCount = asset.successfulCount || 0
          ElMessage.warning(
            `成功${successfulCount}个，失败${asset.failedCount}个${successfulCount > 0 ? '（失败已返还灵衍值）' : ''}`
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

    console.log(`[智能播放] 正在观察 ${assetItems.length} 个创作元素`)
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
        console.log('[智能播放] 未找到创作数据:', index)
        return
      }

      console.log(`[智能播放] 检测创作 ${index}:`, {
        isIntersecting: entry.isIntersecting,
        intersectionRatio: Math.round(entry.intersectionRatio * 100) / 100, // 保持数字类型，保留2位小数
        fileType: asset.fileType,
        status: asset.status,
      })

      // 当创作进入视口（可见度超过30%时更新选中状态）
      if (entry.isIntersecting && entry.intersectionRatio > 0.3) {
        if (!allowAutoSelect) return
        // 更新选中状态（同步缩略图）
        if (props.currentIndex !== index) {
          isAutoScrolling = true // 标记为自动滚动触发，避免 watch 再次滚动
          emit('asset-click', index)
          console.log(
            `[智能播放] 更新选中索引: ${index}，可见度: ${Math.round(entry.intersectionRatio * 100)}%`
          )
        }
      }

      // 当创作滚动到视口中心区域（intersectionRatio >= 0.6，即可见60%以上）才自动播放视频
      if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
        // 如果是视频，自动播放
        if (isVideo(asset)) {
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
        if (isVideo(asset) && currentPlayingIndex.value === index) {
          const mediaPlayer = mediaPlayerRefs.get(index)
          if (mediaPlayer && typeof mediaPlayer.pause === 'function') {
            mediaPlayer.pause()
            currentPlayingIndex.value = null
            console.log(`[智能播放] 自动暂停视频 ${index}`)
          }
        }
      }
    } catch (error) {
      console.error('[智能播放] 处理创作时出错:', error)
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

// 回到顶部方法
const scrollToTop = () => {
  if (mainContentRef.value) {
    mainContentRef.value.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  // 回到顶部时同步选中第一个创作
  if (props.assets.length > 0) {
    emit('asset-click', 0)
  }
}

// 预留：检测当前可见的创作（目前未用到，后续可扩展智能播放等能力）

const detectVisibleAsset = () => { }
void detectVisibleAsset

// 滚动到指定创作（供外部调用，如缩略图点击）
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
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding-right: 27px;
}

/* ========== 内容标签页 ========== */
.content-tabs {
  position: sticky;
  top: 0;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 0 16px;
  font-size: $font-size-md;

  :deep(.el-tabs__item).is-active {
    font-family: NotoSans-bold;
    font-weight: bold;
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
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch; // iOS平滑滚动
  will-change: scroll-position; // 优化滚动性能

  // Element Plus el-scrollbar：隐藏滚动条（保留滚动）
  :deep(.el-scrollbar__bar) {
    display: none !important;
  }

  // 隐藏滚动条，但保留滚动功能
  &::-webkit-scrollbar {
    width: 0;
    display: none;
  }

  scrollbar-width: none; // Firefox
  -ms-overflow-style: none; // IE/Edge
}

/* ========== 创作列表 ========== */
.assets-list {
  display: flex;
  flex-direction: column;
  gap: 37px;
}

.asset-item {
  cursor: pointer;
  will-change: transform;
  transform: translateZ(0); // GPU加速

  &.failed {
    opacity: 0.8;
  }
}

/* ========== 创作占位符（生成中/失败） ========== */
.asset-placeholder {
  width: 100%;
  height: 420px;
  border-radius: $border-radius-md;
  background: $color-bg-dark-secondary;
  margin-bottom: 28px;
  overflow: hidden;
  font-size: $font-size-xl;
  color: $color-primary;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  &.generating {
    background-color: $color-bg-dark-secondary;
    background: url('@/assets/images/generating.gif') no-repeat center center;
    background-size: 100% 100%;

    .status-text {
      margin: $spacing-md 0;
    }
  }

  &.failed {
    .placeholder-icon {
      width: 130px;
      height: 130px;
      margin-bottom: $spacing-md;
      object-fit: contain;
    }

  }
}

/* ========== 当前创作展示区域 ========== */
.current-asset-display {
  overflow: hidden;
}

.media-frame {
  position: relative;
  background: $color-bg-dark-secondary;
  border-radius: $border-radius-md;
  overflow: hidden;
  width: 100%;
  height: 420px;
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
  gap: 29px;
  margin-top: 15px;

  .action-btn {
    display: flex;
    align-items: center;
    width: 82px;
    height: 31px;
    margin: 0;
    font-family: NotoSans-bold;
    transition: all 0.3s ease;
    border-radius: 4px;
    background: radial-gradient(0.5% 0.5% at 50% 50%, rgba(23, 160, 225, 1) 0%, rgba(112, 197, 237, 1) 100%);
    color: $color-text-white;
    font-size: 11px;
    border: 1px solid rgba(76, 87, 86, 1);

    .action-icon {
      width: 13px;
      height: 13px;
      margin-right: 3px;
      object-fit: contain;
    }
  }
}

/* ========== 固定在底部的状态和回到顶部按钮（统一主题样式） ========== */
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
  gap: $spacing-sm;
  pointer-events: none;

  .status-content {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
    padding: $spacing-sm $spacing-md;
    background: $color-bg-dark-secondary;
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: $border-radius-2xl;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.45);
    pointer-events: auto;

    /* 生成状态区域 */
    .generating-status-section {
      display: flex;
      align-items: center;
      gap: $spacing-sm;

      .status-icon {
        font-size: $font-size-md;
        color: $color-primary;
      }

      .status-text {
        color: $color-primary;
        font-size: $font-size-sm;
        font-weight: 500;
        white-space: nowrap;
      }
    }

    /* 竖线分隔符 */
    .divider {
      width: 1px;
      height: 10px;
      background: rgba(255, 255, 255, 0.18);
      flex-shrink: 0;
    }

    /* 回到顶部按钮 */
    .back-to-top-section {
      display: flex;
      align-items: center;
      gap: $spacing-xs;
      cursor: pointer;
      transition: all 0.3s ease;

      &:hover {
        .back-to-top-icon {
          color: $color-primary;
        }

        .back-to-top-text {
          color: $color-primary;
        }
      }

      .back-to-top-icon {
        font-size: $font-size-md;
        color: $color-text-secondary;
        transition: color 0.3s ease;
      }

      .back-to-top-text {
        color: $color-text-secondary;
        font-size: $font-size-sm;
        font-weight: 500;
        white-space: nowrap;
        transition: color 0.3s ease;
      }
    }
  }
}
</style>
