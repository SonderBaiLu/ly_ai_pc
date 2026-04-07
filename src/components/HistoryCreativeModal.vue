<template>
  <el-dialog v-model="visible" width="800px" :close-on-click-modal="true" :close-on-press-escape="true"
    :show-close="false" append-to-body class="history-creative-dialog" @close="handleClose">
    <template #header>
      <div class="history-header">
        <!-- {{ multiSelect ? `历史创作（已选${selectedList.length}/${maxCount}）` : '历史创作' }} -->
        <h2 class="history-title">历史创作</h2>
        <img :src="images.closeDialog" alt="" class="header-close" @click="handleClose" />
      </div>
    </template>
    <div class="history-content">
      <!-- el-scrollbar 触底加载（替代 v-infinite-scroll，避免 Element Plus 弃用警告） -->
      <el-scrollbar ref="historyScrollbarRef" class="history-scroll-container" :height="historyScrollHeight"
        @scroll="handleHistoryScroll">
        <div v-loading="loading" class="image-grid">
          <ImageItem v-for="item in displayList" :key="item.id" :image-data="item as any" :show-select="multiSelect"
            :is-selected="isSelected(item)" :selected-count="selectedList.length" :max-select="maxCount"
            :show-collect="false" :show-zoom="true" @select="handleImageSelect" @click="handleImageClick"
            @zoom="handlePreviewClick" />
        </div>

        <InfiniteScrollLoader :loading="loading" :loading-more="loadingMore" :has-more="hasMore"
          :data-length="displayList.length" empty-text="暂无历史创作" :show-back-top="false" />
      </el-scrollbar>
    </div>

    <!-- 自定义预览弹窗 -->
    <ImagePreviewModal v-model="showPreviewModal" :image-src="previewImage ? getCompareUrl(previewImage as any) : ''"
      :show-selected-badge="props.multiSelect" :is-selected="previewImage ? isSelected(previewImage) : false"
      cancel-text="关闭" :show-confirm-button="true"
      :confirm-text="props.multiSelect && previewImage && isSelected(previewImage) ? '取消选择' : '选择此图片'"
      :confirm-button-type="props.multiSelect && previewImage && isSelected(previewImage) ? 'danger' : 'primary'"
      @confirm="handlePreviewConfirm" />

    <!-- 多选确认按钮 -->
    <template v-if="multiSelect" #footer>
      <div class="multi-select-footer">
        <el-button @click="visible = false">取消</el-button>
        <el-button type="primary" :disabled="selectedList.length === 0" @click="handleConfirmMultiSelect">
          确认选择（{{ selectedList.length }}/{{ maxCount }}）
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { images } from '@/assets'
import { algoApi } from '@/api/algo'
import { ElMessage } from 'element-plus'
import ImagePreviewModal from '@/components/ImagePreviewModal.vue'
import type { CreationResult } from '@/composables/useTaskPolling'

interface Props {
  modelValue: boolean
  /** 一级模块 menuCode（queryAlgoResultPage 筛选）；未传则为 '' */
  menuCode?: string
  /** 数据来源：creative-创作记录 upload-文件上传历史 */
  source?: 'creative' | 'upload'
  /** 是否多选 */
  multiSelect?: boolean
  /** 最多选择数量 */
  maxCount?: number
  /** 已选项（用于回显） */
  selectedItems?: CreationResult[]
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'select', item: CreationResult): void
  (e: 'confirm', items: CreationResult[]): void
}

// Props 和 Emits
const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  menuCode: '',
  source: 'creative',
  multiSelect: false,
  maxCount: 1,
  selectedItems: () => [],
})

const emit = defineEmits<Emits>()

// 响应式数据
const visible = ref(props.modelValue)
const loading = ref(false)
const loadingMore = ref(false)
const currentPage = ref(1)
const pageSize = ref(24)
const hasMore = ref(true)

// 历史创作数据
const historyList = ref<CreationResult[]>([])

// 多选状态
const selectedList = ref<CreationResult[]>([])

const scrollDisabled = computed(() => loading.value || loadingMore.value || !hasMore.value)

const historyScrollbarRef = ref<{ wrapRef?: HTMLElement } | null>(null)
const historyScrollHeight = computed(() => {
  // 给滚动区一个明确高度，避免在不同层级样式下被内容撑开导致“不可滚动”
  return props.multiSelect ? '52vh' : '60vh'
})

// 预览相关状态
const showPreviewModal = ref(false)
const previewImage = ref<CreationResult | null>(null)

const getCompareUrl = (item: any) => {
  return String(item?.fileUrl || item?.url || item?.originalUrl || item?.thumbUrl || item?.videoUrl || '').trim()
}

// 计算属性 - 显示列表
const displayList = computed(() => {
  // 直接返回从API获取的历史列表，因为分页和筛选已经在API调用时处理
  return historyList.value
})

async function loadHistoryData(isLoadMore = false, options: { skipCache?: boolean } = {}) {
  void options
  if (isLoadMore) {
    if (loading.value || loadingMore.value || !hasMore.value) return
    loadingMore.value = true
    currentPage.value++
  } else {
    loading.value = true
  }

  try {
    const moduleCode = String(props.menuCode ?? '').trim()
    const params = {
      menuCode: moduleCode,
      fileType: '', // 接口字段要求必传：空字符串表示不筛选
      collectStatus: '', // 接口字段要求必传：空字符串表示不筛选
      currentPage: currentPage.value,
      pageSize: pageSize.value,
    }
    const res = await algoApi.queryAlgoResultPage(params)
    if (res.code !== '0000') {
      if (!isLoadMore) ElMessage.error(res.msg || '加载历史数据失败')
      hasMore.value = false
      return
    }
    const { list, hasNext } = res.data || {}
    historyList.value = isLoadMore ? [...historyList.value, ...list] : list
    hasMore.value = hasNext
  } catch (error) {
    console.error('加载历史数据出错:', error)
    if (!isLoadMore) {
      ElMessage.error('加载历史数据失败')
    }
    if (!isLoadMore) historyList.value = []
    hasMore.value = false
  } finally {
    if (isLoadMore) {
      loadingMore.value = false
    } else {
      loading.value = false
    }
  }
}

const loadMore = () => {
  loadHistoryData(true)
}

/** 与 MainImageDisplay 一致：用 scrollbar wrap 判断是否触底 */
const handleHistoryScroll = ({ scrollTop }: { scrollTop: number }) => {
  const wrapEl = historyScrollbarRef.value?.wrapRef
  if (!wrapEl) return
  if (scrollDisabled.value) return
  const distance = 100
  const reachBottom = wrapEl.scrollHeight - (scrollTop + wrapEl.clientHeight) <= distance
  if (reachBottom) loadMore()
}

const refresh = () => {
  currentPage.value = 1
  historyList.value = []
  hasMore.value = true
  loadHistoryData(false)
}

// 监听 modelValue 变化（须在 loadHistoryData 定义之后）
watch(
  () => props.modelValue,
  (newVal) => {
    if (visible.value !== newVal) {
      visible.value = newVal
    }
    if (!newVal) return
    currentPage.value = 1
    historyList.value = []
    hasMore.value = true
    selectedList.value = props.multiSelect ? [...(props.selectedItems || [])] : []
    void loadHistoryData()
  },
  { immediate: true }
)

watch(visible, (newVal) => {
  // 只有当值真正改变时才 emit
  if (props.modelValue !== newVal) {
    emit('update:modelValue', newVal)
  }
})

// 处理图片选择（来自ImageItem的select事件）
const handleImageSelect = (data: { imageData: any; isSelected: boolean }) => {
  toggleSelection(data.imageData as CreationResult)
}

// 点击图片处理
const handleImageClick = (data: { imageData: any }) => {
  if (props.multiSelect) {
    toggleSelection(data.imageData as CreationResult)
  } else {
    emit('select', data.imageData as CreationResult)
    visible.value = false
  }
}

// 切换选择状态（多选）
const toggleSelection = (item: CreationResult) => {
  const index = selectedList.value.findIndex((i) => {
    if (i.id === item.id) return true
    const itemUrl = getCompareUrl(item as any)
    const selectedUrl = getCompareUrl(i as any)
    return itemUrl && selectedUrl && itemUrl === selectedUrl
  })

  if (index > -1) {
    selectedList.value.splice(index, 1)
  } else {
    if (selectedList.value.length >= props.maxCount) {
      ElMessage.warning(`最多选择${props.maxCount}张图片`)
      return
    }
    selectedList.value.push(item)
  }
}

// 判断是否已选中（支持通过imageUrl匹配）
const isSelected = (item: CreationResult) => {
  return selectedList.value.some((i) => {
    // 优先通过ID匹配
    if (i.id === item.id) return true
    // 如果ID不匹配，尝试通过imageUrl匹配
    const itemUrl = getCompareUrl(item as any)
    const selectedUrl = getCompareUrl(i as any)
    return itemUrl && selectedUrl && itemUrl === selectedUrl
  })
}

// 确认选择（多选）
const handleConfirmMultiSelect = () => {
  if (selectedList.value.length === 0) {
    ElMessage.warning('请至少选择一张图片')
    return
  }
  emit('confirm', selectedList.value)
  visible.value = false
}

// 预览图片处理
const handlePreviewClick = (data: { imageData: any }) => {
  previewImage.value = data.imageData as CreationResult
  showPreviewModal.value = true
}

// 预览时选择图片（多选模式）
const handlePreviewSelect = () => {
  if (previewImage.value) {
    toggleSelection(previewImage.value)
    // 不关闭预览弹窗，用户可以继续查看
  }
}

// 确认选择图片（单选模式）
const handleConfirmSelect = () => {
  if (previewImage.value) {
    emit('select', previewImage.value)
    showPreviewModal.value = false
    visible.value = false
  }
}

// 预览弹窗确认处理
const handlePreviewConfirm = () => {
  if (props.multiSelect) {
    handlePreviewSelect()
  } else {
    handleConfirmSelect()
  }
}

// 关闭弹窗
const handleClose = () => {
  visible.value = false
}

// 暴露方法给父组件
defineExpose({
  refresh,
  loadHistoryData,
})
</script>

<style lang="scss" scoped>
.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;

  .history-title {
    font-size: $font-size-xl;
  }

  .header-close {
    width: 24px;
    height: 24px;
    object-fit: contain;
  }
}

.history-content {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;

  .history-scroll-container {
    flex: 1;
    min-height: 0;
    height: min(600px, 60vh);
  }

  :deep(.history-scroll-container.el-scrollbar) {
    height: 100%;
  }

  :deep(.history-scroll-container .el-scrollbar__wrap) {
    overflow-y: auto !important;
    overflow-x: hidden;
  }

  .image-grid {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 10px;
    padding: 17px;
    align-content: start;
  }
}

.multi-select-footer {
  display: flex;
  justify-content: flex-end;
  gap: $spacing-sm;
  padding: 24px 22px;
}

// 响应式设计：小屏幕优化（始终保持6列）
@media (max-height: 800px) {
  .history-creative-dialog {
    :deep(.el-dialog) {
      margin: 2vh auto;
      max-height: 96vh;
      display: flex;
      flex-direction: column;
    }

    .history-content {
      flex: 1;
      overflow: hidden;
      display: flex;
      flex-direction: column;

      .history-scroll-container {
        height: min(500px, 55vh);
      }
    }
  }
}

@media (max-height: 650px) {
  .history-creative-dialog {
    :deep(.el-dialog) {
      max-height: 95vh;
    }

    .history-content {
      .history-scroll-container {
        height: min(400px, 50vh);
      }
    }
  }
}

@media (max-height: 550px) {
  .history-creative-dialog {
    :deep(.el-dialog) {
      max-height: 92vh;
      margin: 1vh auto;
    }

    .history-content {
      .history-scroll-container {
        height: min(300px, 45vh);
      }
    }
  }
}
</style>
<style lang="scss">
.history-creative-dialog.el-dialog,
.history-creative-dialog .el-dialog {
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.04);
  /* 限制弹窗总高度 + flex 列布局，否则 body 无法收缩，内部 scrollbar 不会生效 */
  max-height: 90vh;
  margin: 5vh auto !important;
  display: flex;
  flex-direction: column;

  .el-dialog__header {
    padding: 32px 17px;
    flex-shrink: 0;
  }

  .el-dialog__body {
    flex: 1;
    min-height: 0;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    padding-top: 0;
  }

  .el-dialog__footer {
    flex-shrink: 0;
  }
}
</style>
