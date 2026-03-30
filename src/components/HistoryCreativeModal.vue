<template>
  <el-dialog
    v-model="visible"
    :title="multiSelect ? `历史创作（已选${selectedList.length}/${maxCount}）` : '历史创作'"
    width="800px"
    :close-on-click-modal="true"
    :close-on-press-escape="true"
    append-to-body
    class="history-creative-dialog"
    @close="handleClose"
  >
    <div class="history-content">
      <!-- 图片网格 - 无限滚动 -->
      <div
        v-infinite-scroll="loadMore"
        class="scroll-container"
        :infinite-scroll-disabled="scrollDisabled"
        :infinite-scroll-distance="100"
      >
        <div v-loading="loading" class="image-grid">
          <ImageItem
            v-for="item in displayList"
            :key="item.id"
            :image-data="item"
            :show-select="multiSelect"
            :is-selected="isSelected(item)"
            :selected-count="selectedList.length"
            :max-select="maxCount"
            :show-collect="false"
            :show-zoom="true"
            @select="handleImageSelect"
            @click="handleImageClick"
            @zoom="handlePreviewClick"
          />
        </div>

        <!-- 下拉加载状态：加载中/加载更多/END/空状态 -->
        <InfiniteScrollLoader
          :loading="loading"
          :loading-more="loadingMore"
          :has-more="hasMore"
          :data-length="displayList.length"
          empty-text="暂无历史创作"
          :show-back-top="false"
        />
      </div>
    </div>

    <!-- 自定义预览弹窗 -->
    <ImagePreviewModal
      v-model="showPreviewModal"
      :image-src="previewImage?.imageUrl || previewImage?.resultUrl || ''"
      :show-selected-badge="props.multiSelect"
      :is-selected="previewImage ? isSelected(previewImage) : false"
      :extra-info="
        previewImage
          ? {
              createTime: previewImage.createTime,
              prompt: previewImage.prompt,
            }
          : undefined
      "
      cancel-text="关闭"
      :show-confirm-button="true"
      :confirm-text="
        props.multiSelect && previewImage && isSelected(previewImage) ? '取消选择' : '选择此图片'
      "
      :confirm-button-type="
        props.multiSelect && previewImage && isSelected(previewImage) ? 'danger' : 'primary'
      "
      @confirm="handlePreviewConfirm"
    />

    <!-- 多选确认按钮 -->
    <template v-if="multiSelect" #footer>
      <div class="multi-select-footer">
        <el-button @click="visible = false">取消</el-button>
        <el-button
          type="primary"
          :disabled="selectedList.length === 0"
          @click="handleConfirmMultiSelect"
        >
          确认选择（{{ selectedList.length }}/{{ maxCount }}）
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { algoApi } from '@/api/algo'
import { ElMessage } from 'element-plus'
import ImagePreviewModal from '@/components/ImagePreviewModal.vue'

// 定义接口
interface HistoryItem {
  id: string | number
  imageUrl?: string | null
  thumbUrl?: string | null
  url?: string | null
  resultUrl?: string | null
  prompt?: string
  [key: string]: any // 允许其他字段
}

interface Props {
  modelValue: boolean
  /** 类型：1指令生图 2姿势裂变 3表情控制 4文生图 5穿搭调整 6商品展示 */
  type?: string | number
  /** 文件类型：1图片 2视频 */
  fileType?: string | number
  /** 数据来源：creative-创作记录 upload-文件上传历史 */
  source?: 'creative' | 'upload'
  /** 是否多选 */
  multiSelect?: boolean
  /** 最多选择数量 */
  maxCount?: number
  /** 已选项（用于回显） */
  selectedItems?: HistoryItem[]
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'select', item: HistoryItem): void
  (e: 'confirm', items: HistoryItem[]): void
}

// Props 和 Emits
const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  type: undefined,
  fileType: 1,
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
const historyList = ref<HistoryItem[]>([])

// 多选状态
const selectedList = ref<HistoryItem[]>([])

const scrollDisabled = computed(() => loading.value || loadingMore.value || !hasMore.value)

// 预览相关状态
const showPreviewModal = ref(false)
const previewImage = ref<HistoryItem | null>(null)

// 计算属性 - 显示列表
const displayList = computed(() => {
  // 直接返回从API获取的历史列表，因为分页和筛选已经在API调用时处理
  return historyList.value
})

// 监听 modelValue 变化
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
    loadHistoryData()
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
const handleImageSelect = (data: { imageData: HistoryItem; isSelected: boolean }) => {
  toggleSelection(data.imageData)
}

// 点击图片处理
const handleImageClick = (data: { imageData: HistoryItem }) => {
  if (props.multiSelect) {
    toggleSelection(data.imageData)
  } else {
    emit('select', data.imageData)
    visible.value = false
  }
}

// 切换选择状态（多选）
const toggleSelection = (item: HistoryItem) => {
  const index = selectedList.value.findIndex((i) => {
    if (i.id === item.id) return true
    const itemUrl = item.imageUrl || item.videoUrl || item.resultUrl
    const selectedUrl = i.imageUrl || i.videoUrl || i.resultUrl
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
const isSelected = (item: HistoryItem) => {
  return selectedList.value.some((i) => {
    // 优先通过ID匹配
    if (i.id === item.id) return true
    // 如果ID不匹配，尝试通过imageUrl匹配
    const itemUrl = item.imageUrl || item.videoUrl || item.resultUrl
    const selectedUrl = i.imageUrl || i.videoUrl || i.resultUrl
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
const handlePreviewClick = (data: { imageData: HistoryItem }) => {
  previewImage.value = data.imageData
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

const loadHistoryData = async (isLoadMore = false, options: { skipCache?: boolean } = {}) => {
  void options
  if (isLoadMore) {
    if (loading.value || loadingMore.value || !hasMore.value) return
    loadingMore.value = true
    currentPage.value++
  } else {
    loading.value = true
  }

  try {
    const params = {
      menuCode: 'ALL',
      collectStatus: '0',
      fileType: String(props.fileType ?? 1),
      currentPage: currentPage.value,
      pageSize: pageSize.value,
    }
    const res = await algoApi.queryAlgoResultPage(params)
    if (res.code !== '0000') {
      if (!isLoadMore) ElMessage.error(res.msg || '加载历史数据失败')
      hasMore.value = false
      return
    }

    const data: any = res.data || {}
    const records = (Array.isArray(data?.records) && data.records) || (Array.isArray(data?.list) && data.list) || []
    const mapped: HistoryItem[] = records.map((item: any) => {
      const imageUrl = String(item?.url || item?.thumbUrl || item?.originalUrl || '').trim()
      return {
        ...item,
        id: item?.id ?? imageUrl,
        imageUrl,
        thumbUrl: item?.thumbUrl || imageUrl,
        resultUrl: item?.url || imageUrl,
      }
    })

    historyList.value = isLoadMore ? [...historyList.value, ...mapped] : mapped
    if (typeof data?.hasNext === 'boolean') {
      hasMore.value = data.hasNext
    } else {
      const total = Number(data?.total ?? data?.totalCount ?? 0)
      hasMore.value = total > 0 ? historyList.value.length < total : mapped.length >= pageSize.value
    }
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

// 加载更多数据（调用统一方法）
const loadMore = () => {
  loadHistoryData(true)
}

// 刷新列表（供父组件调用）
const refresh = () => {
  currentPage.value = 1
  historyList.value = []
  hasMore.value = true
  loadHistoryData(false)
}

// 暴露方法给父组件
defineExpose({
  refresh,
  loadHistoryData,
})
</script>

<style lang="scss" scoped>
.history-content {
  .scroll-container {
    max-height: min(600px, 60vh);
    overflow-y: auto;
    overflow-x: hidden;

    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-thumb {
      background-color: rgba(144, 147, 153, 0.3);
      border-radius: 3px;

      &:hover {
        background-color: rgba(144, 147, 153, 0.5);
      }
    }
  }

  .image-grid {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: $spacing-md;
    padding: $spacing-sm;
    align-content: start;
  }
}

.multi-select-footer {
  display: flex;
  justify-content: flex-end;
  gap: $spacing-sm;
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

    :deep(.el-dialog__body) {
      flex: 1;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    .history-content {
      flex: 1;
      overflow: hidden;
      display: flex;
      flex-direction: column;

      .scroll-container {
        max-height: min(500px, 55vh);
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
      .scroll-container {
        max-height: min(400px, 50vh);
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
      .scroll-container {
        max-height: min(300px, 45vh);
      }
    }
  }
}
</style>
