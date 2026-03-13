<template>
  <div class="my-creations-page">
    <Header />

    <div class="page-body">
      <div class="page-title">
        <span class="title-cn">{{ t('myCreations.title') }}</span>
      </div>

      <div class="tabs-actions">
        <el-tabs class="creations-tabs" :model-value="activeTab" @tab-change="handleTabChange">
          <el-tab-pane v-for="tab in tabs" :key="tab.key" :name="tab.key" :label="tab.label" />
        </el-tabs>

        <!-- 操作按钮（桌面端） -->
        <div class="header-actions-desktop">
          <!-- <el-button :loading="loading" :disabled="loading" @click="handleRefresh">
            <el-icon>
              <Refresh />
            </el-icon>
            <span>刷新</span>
          </el-button> -->

          <el-button v-if="batchMode && selectedIds.length > 0" type="danger" @click="handleBatchDelete">
            <img :src="images.del" alt="删除" class="action-icon" />
            {{ t('myCreations.actions.delete') }}
            <!-- ({{ selectedIds.length }}) -->
          </el-button>

          <el-button v-if="batchMode && selectedIds.length > 0 && activeTab !== 'upload'" type="warning"
            @click="handleBatchCollect">
            <img
              :src="selectedCollectStatus.allCollected || activeTab === 'collect' ? images.collected : images.collect"
              alt="收藏" class="action-icon" />
            {{
              selectedCollectStatus.allCollected || activeTab === 'collect'
                ? t('myCreations.actions.cancelCollect')
                : t('myCreations.actions.collect')
            }}
            <!-- ({{ selectedIds.length }}) -->
          </el-button>

          <el-button v-if="batchMode && selectedIds.length > 0" type="success" :loading="isDownloading"
            :disabled="isDownloading" @click="handleBatchDownload">
            <img v-if="!isDownloading" :src="images.download" alt="下载" class="action-icon" />
            {{ t('myCreations.actions.download') }}
            <!-- ({{ selectedIds.length }}) -->
          </el-button>

          <el-button type="primary" @click="handleToggleBatchMode">
            {{ batchMode ? t('myCreations.actions.cancel') : t('myCreations.actions.select') }}
          </el-button>
        </div>

        <!-- 操作按钮（移动端下拉） -->
        <div class="header-actions-mobile">
          <el-dropdown trigger="click" @command="handleMobileAction">
            <el-button type="primary">
              <el-icon>
                <MoreFilled />
              </el-icon>
              {{ t('myCreations.actions.operate') }}
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <!-- <el-dropdown-item command="refresh" :disabled="loading">
                  <div class="menu-item-content">
                    <el-icon>
                      <Refresh />
                    </el-icon>
                    <span>刷新</span>
                  </div>
                </el-dropdown-item> -->
                <el-dropdown-item v-if="batchMode && selectedIds.length > 0" command="delete"
                  :disabled="selectedIds.length === 0">
                  <div class="menu-item-content">
                    <img :src="images.del" alt="删除" class="menu-icon" />
                    <span>{{ t('myCreations.actions.delete') }}({{ selectedIds.length }})</span>
                  </div>
                </el-dropdown-item>
                <el-dropdown-item v-if="batchMode && selectedIds.length > 0 && activeTab !== 'upload'" command="collect"
                  :disabled="selectedIds.length === 0">
                  <div class="menu-item-content">
                    <img
                      :src="selectedCollectStatus.allCollected || activeTab === 'collect' ? images.collected : images.collect"
                      alt="收藏" class="menu-icon" />
                    <span>
                      {{
                        selectedCollectStatus.allCollected || activeTab === 'collect'
                          ? t('myCreations.actions.cancelCollect')
                          : t('myCreations.actions.collect')
                      }}({{ selectedIds.length }})
                    </span>
                  </div>
                </el-dropdown-item>
                <el-dropdown-item v-if="batchMode && selectedIds.length > 0" command="download"
                  :disabled="selectedIds.length === 0">
                  <div class="menu-item-content">
                    <img :src="images.download" alt="下载" class="menu-icon" />
                    <span>{{ t('myCreations.actions.download') }}({{ selectedIds.length }})</span>
                  </div>
                </el-dropdown-item>
                <el-dropdown-item divided command="toggle">
                  {{ batchMode ? t('myCreations.actions.cancelSelect') : t('myCreations.actions.select') }}
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>

      <div class="grid">
        <ImageUploadArea v-if="activeTab === 'upload'" class="image-upload-area" :image-url="''"
          :placeholder-text="t('myCreations.upload.placeholder')" area-width="100%" area-height="100%"
          :show-actions="false" :clickable="false" :show-desc="false" :show-history-tip="false"
          :enable-history-replace="false" :show-loading="uploading" :loading-text="t('myCreations.upload.loading')"
          @upload="handleUploadClick" @drop-file="handleDropFile" />

        <!-- 仅开发环境：一键预览“上传失败”提示样式 -->
        <div v-if="activeTab === 'upload'" class="upload-debug">
          <el-button class="upload-debug-btn" @click="showUploadFailToast(t('myCreations.upload.debugFail'))">
            {{ t('myCreations.upload.debugButton') }}
          </el-button>
        </div>

        <ImageItem v-for="item in list" :key="item.id" :image-data="item" :show-select="batchMode"
          :is-selected="selectedIds.includes(item.id)" :max-select="Infinity" :selected-count="selectedIds.length"
          :show-collect="true" :show-zoom="false" collectMode="collected-only" :show-title="false" @zoom="handleZoom"
          @click="() => handleItemClick(item)"
          @select="({ imageData, isSelected }) => handleImageSelect(imageData.id, isSelected)" />
      </div>

      <!-- 触底观察点：用于自动触发 loadMore -->
      <div ref="sentinelRef" class="sentinel"></div>

      <InfiniteScrollLoader :loading="loading" :has-more="hasMore" :data-length="list.length"
        :empty-text="t('myCreations.empty.noWorks')" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { MoreFilled } from '@element-plus/icons-vue'
import { images } from '@/assets'
import { uploadApi } from '@/api/upload'
import { creativeApi } from '@/api/creative'
import { useUserStore } from '@/stores/user'
import { watermarkDownloader } from '@/utils/WatermarkDownloader'
import { useI18n } from 'vue-i18n'

type TabKey = 'all' | 'image' | 'video' | 'fashion' | 'fabric' | 'collect' | 'upload'

type CreationItem = {
  id: string | number
  imageUrl?: string
  imgUrl?: string
  lessenImg?: string
  fileType?: number // 1-图片 2-视频
  status?: number // 1未开始 2进行中 3完成 4失败
  isCollect?: number
  title?: string
  name?: string
  [key: string]: any
}

const { t } = useI18n()

const tabs = computed<Array<{ key: TabKey; label: string }>>(() => [
  { key: 'all', label: t('myCreations.tabs.all') },
  { key: 'image', label: t('myCreations.tabs.image') },
  { key: 'video', label: t('myCreations.tabs.video') },
  { key: 'fashion', label: t('myCreations.tabs.fashion') },
  { key: 'fabric', label: t('myCreations.tabs.fabric') },
  { key: 'collect', label: t('myCreations.tabs.collect') },
  { key: 'upload', label: t('myCreations.tabs.upload') },
])

const activeTab = ref<TabKey>('all')
const loading = ref(false)
const hasMore = ref(true)
const batchMode = ref(false)
const selectedIds = ref<(string | number)[]>([])
const isDownloading = ref(false)
const uploading = ref(false)
const userStore = useUserStore()

const pageSize = 12
const page = ref(1)
const list = ref<CreationItem[]>([])

// 先用本地 mock 数据跑通 UI；后续可替换为真实接口
const allData = ref<CreationItem[]>([
  { id: 'c-1', imageUrl: images.design1, fileType: 1, status: 3, isCollect: 0, title: '外套-1', biz: 'fashion' },
  { id: 'c-2', imageUrl: images.design2, fileType: 1, status: 3, isCollect: 1, title: 'T恤-1', biz: 'fashion' },
  { id: 'c-3', imageUrl: images.design3, fileType: 1, status: 3, isCollect: 0, title: '裙子-1', biz: 'fashion' },
  { id: 'c-4', imageUrl: images.design4, fileType: 1, status: 3, isCollect: 0, title: '裤子-1', biz: 'fashion' },
  { id: 'c-5', imageUrl: images.design2, fileType: 1, status: 3, isCollect: 0, title: '面料-1', biz: 'fabric' },
  { id: 'c-6', imageUrl: images.design3, fileType: 1, status: 3, isCollect: 1, title: '面料-2', biz: 'fabric' },
  { id: 'c-7', imageUrl: images.design1, fileType: 1, status: 2, isCollect: 0, title: '生成中', biz: 'fashion' },
  { id: 'c-8', imageUrl: images.design4, fileType: 1, status: 4, isCollect: 0, title: '失败', biz: 'fashion' },
  // 补足数量，让分页/加载更多可见
  ...Array.from({ length: 60 }).map((_, idx) => ({
    id: `c-mock-${idx + 1}`,
    imageUrl: [images.design1, images.design2, images.design3, images.design4][idx % 4],
    fileType: idx % 11 === 0 ? 2 : 1,
    status: 3,
    isCollect: idx % 7 === 0 ? 1 : 0,
    title: `作品-${idx + 1}`,
    biz: idx % 5 === 0 ? 'fabric' : 'fashion',
    source: idx % 9 === 0 ? 'upload' : 'generate',
  })),
])

const filteredAll = computed(() => {
  const tab = activeTab.value
  const src = allData.value
  if (tab === 'all') return src
  if (tab === 'image') return src.filter((x) => (x.fileType ?? 1) === 1)
  if (tab === 'video') return src.filter((x) => x.fileType === 2)
  if (tab === 'fashion') return src.filter((x) => x.biz === 'fashion')
  if (tab === 'fabric') return src.filter((x) => x.biz === 'fabric')
  if (tab === 'collect') return src.filter((x) => x.isCollect === 1)
  // 我的上传：先置空，方便验证空状态（后续接真实上传列表接口后再替换）
  if (tab === 'upload') return []
  return src
})

const selectedCollectStatus = computed(() => {
  if (selectedIds.value.length === 0) return { allCollected: false }
  const set = new Set(selectedIds.value)
  const items = filteredAll.value.filter((x) => set.has(x.id))
  if (items.length === 0) return { allCollected: false }
  const collected = items.filter((x) => x.isCollect === 1)
  return { allCollected: collected.length === items.length }
})

const fetchPage = async (reset = false) => {
  if (loading.value) return
  loading.value = true
  try {
    // mock：用 setTimeout 模拟接口耗时
    await new Promise((r) => setTimeout(r, 350))

    const all = filteredAll.value
    const start = (page.value - 1) * pageSize
    const end = start + pageSize
    const chunk = all.slice(start, end)

    if (reset) list.value = []
    list.value = reset ? chunk : [...list.value, ...chunk]
    hasMore.value = end < all.length
  } finally {
    loading.value = false
  }
}

const resetAndFetch = async () => {
  page.value = 1
  hasMore.value = true
  await fetchPage(true)
}

const loadMore = async () => {
  if (loading.value || !hasMore.value) return
  page.value += 1
  await fetchPage(false)
}

const handleTabClick = async (key: TabKey) => {
  if (activeTab.value === key) return
  activeTab.value = key
}

const handleTabChange = async (name: string | number) => {
  await handleTabClick(name as TabKey)
}

const handleZoom = () => {
  ElMessage.info(t('myCreations.message.previewTodo'))
}

const handleItemClick = (item: CreationItem) => {
  if (batchMode.value) {
    // 选择模式下，点击卡片等同于切换选中状态
    handleImageSelect(item.id, !selectedIds.value.includes(item.id))
    return
  }
  ElMessage.info(t('myCreations.message.detailTodo'))
}

const handleToggleBatchMode = () => {
  batchMode.value = !batchMode.value
  if (!batchMode.value) {
    selectedIds.value = []
  }
}

const handleImageSelect = (id: string | number, isSelected: boolean) => {
  const idx = selectedIds.value.indexOf(id)
  if (isSelected) {
    if (idx === -1) selectedIds.value.push(id)
  } else if (idx > -1) {
    selectedIds.value.splice(idx, 1)
  }
}

const handleRefresh = async () => {
  if (loading.value) return
  await resetAndFetch()
  ElMessage.success(t('myCreations.message.listRefreshed'))
}

const handleBatchDelete = async () => {
  if (selectedIds.value.length === 0) return
  const set = new Set(selectedIds.value)
  allData.value = allData.value.filter((x) => !set.has(x.id))
  selectedIds.value = []
  batchMode.value = false
  await resetAndFetch()
  ElMessage.success(t('myCreations.message.deleteSuccess'))
}

const handleBatchCollect = async () => {
  if (selectedIds.value.length === 0) return
  const set = new Set(selectedIds.value)
  const shouldCancel = selectedCollectStatus.value.allCollected || activeTab.value === 'collect'
  allData.value = allData.value.map((x) => {
    if (!set.has(x.id)) return x
    return { ...x, isCollect: shouldCancel ? 0 : 1 }
  })
  selectedIds.value = []
  batchMode.value = false
  await resetAndFetch()
  ElMessage.success(
    shouldCancel ? t('myCreations.message.cancelCollectSuccess') : t('myCreations.message.collectSuccess'),
  )
}

const getItemUrl = (item: CreationItem) => item.imageUrl || item.imgUrl || item.lessenImg || ''

const handleBatchDownload = async () => {
  if (selectedIds.value.length === 0) return
  if (isDownloading.value) return
  isDownloading.value = true
  try {
    const set = new Set(selectedIds.value)
    const items = filteredAll.value.filter((x) => set.has(x.id))
    for (const item of items) {
      const url = getItemUrl(item)
      if (!url) continue
      await watermarkDownloader.download(url)
    }
    ElMessage.success(t('myCreations.message.downloadStarted'))
    selectedIds.value = []
    batchMode.value = false
  } catch (e) {
    console.error('[MyCreations] batch download failed:', e)
    ElMessage.error(t('myCreations.message.downloadFailed'))
  } finally {
    isDownloading.value = false
  }
}

const handleMobileAction = (command: string) => {
  switch (command) {
    case 'refresh':
      handleRefresh()
      break
    case 'delete':
      handleBatchDelete()
      break
    case 'collect':
      handleBatchCollect()
      break
    case 'download':
      handleBatchDownload()
      break
    case 'toggle':
      handleToggleBatchMode()
      break
  }
}

// ============ 我的上传（本地 mock + 兼容真实接口）============
const handleUploadClick = async () => {
  if (uploading.value) return
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.multiple = false
  input.onchange = async (e: any) => {
    const file = e.target.files?.[0]
    if (!file) return
    await uploadFile(file)
  }
  input.click()
}

const handleDropFile = async (params: { file?: File; url?: string }) => {
  if (params.file) {
    await uploadFile(params.file)
  } else if (params.url) {
    ElMessage.info(t('myCreations.upload.urlUploadTodo'))
  }
}

const showUploadFailToast = (text: string) => {
  const safeText = String(text || t('myCreations.upload.uploadFailPrefix'))
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

  ElMessage({
    duration: 1800,
    showClose: false,
    customClass: 'my-toast-fail-face',
    dangerouslyUseHTMLString: true,
    message: `<span class="my-toast-content"><img class="my-toast-icon" src="${images.failFace}" alt="fail" />${safeText}</span>`,
  })
}

const uploadFile = async (file: File) => {
  if (!userStore.userInfo?.userId) {
    ElMessage.warning(t('myCreations.upload.needLogin'))
    return
  }

  // 与你截图一致：图片最小需大于 20KB
  const minSize = 20 * 1024
  if (file.size < minSize) {
    showUploadFailToast(t('myCreations.upload.debugFail'))
    return
  }

  uploading.value = true
  try {
    // 对齐 Assets.vue：走封装好的上传方法
    const uploadResult = await uploadApi.uploadImage(file, {
      showLoading: false, // 使用组件内的 loading 状态
      loadingText: t('myCreations.upload.uploadingImage'),
      showMessage: false, // 使用自定义提示样式
    })

    if (!uploadResult.success || !uploadResult.url) {
      showUploadFailToast(
        `${t('myCreations.upload.uploadFailPrefix')}${uploadResult.message || t('myCreations.upload.uploadFailFallback')}`,
      )
      return
    }

    const imageUrl = uploadResult.url

    // 保存上传记录（接口存在即可使用；失败不影响前端列表展示）
    try {
      await creativeApi.saveUserResource({
        userId: userStore.userInfo.userId,
        imageUrl,
      })
    } catch (e) {
      console.warn('[MyCreations] saveUserResource failed (ignored):', e)
    }

    // 本地插入一条（后续接真实列表接口时可直接改为 refresh）
    const id = `upload-${Date.now()}`
    allData.value = [{ id, imageUrl, fileType: 1, status: 3, isCollect: 0, source: 'upload' }, ...allData.value]
    await resetAndFetch()
  } finally {
    uploading.value = false
  }
}

// ============ 触底加载更多：IntersectionObserver ============
const sentinelRef = ref<HTMLElement | null>(null)
let io: IntersectionObserver | null = null

const initObserver = () => {
  if (!sentinelRef.value) return
  io?.disconnect()
  io = new IntersectionObserver(
    async (entries) => {
      const entry = entries[0]
      if (!entry?.isIntersecting) return
      await loadMore()
    },
    { root: null, rootMargin: '200px 0px 200px 0px', threshold: 0 }
  )
  io.observe(sentinelRef.value)
}

onMounted(async () => {
  await resetAndFetch()
  initObserver()
})

watch(activeTab, async () => {
  await resetAndFetch()
})

onBeforeUnmount(() => {
  io?.disconnect()
  io = null
})
</script>

<style lang="scss">
body {
  background: radial-gradient(1200px 700px at 70% 30%, rgba(41, 66, 130, 0.55) 0%, rgba(0, 0, 0, 0.9) 60%),
    #000;
}

.my-creations-page {
  color: $color-text-white;

  .page-body {
    padding: $spacing-xl;

    .page-title {
      display: flex;
      flex-direction: column;
      gap: 4px;
      font-family: AlibabaPuHui-regular;

      .title-cn {
        font-size: $font-size-2xl-lg;
      }

      .title-en {
        font-size: $font-size-md;
        color: $color-text-secondary;
      }
    }

    .tabs-actions {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin: $spacing-sm-md 0 $spacing-xl-sm;
      gap: $spacing-md;
    }

    .creations-tabs {
      flex: 1;
      min-width: 0;

      .el-tabs__item {
        color: $color-text-tabs;
        font-size: $font-size-md;
        height: 48px;
        line-height: 48px;
      }

      .el-tabs__item.is-active {
        color: $color-primary;
        font-family: NotoSans-bold;
      }

      .el-tabs__nav-wrap:after {
        background-color: $color-border-light;
        height: 1px;
        border-radius: 0;
      }

      .el-tabs__active-bar {
        background-color: $color-primary;
        height: 1px;
        border-radius: 0;
      }
    }

    .header-actions-desktop {
      position: absolute;
      right: 0;
      bottom: calc($spacing-sm + $spacing-xl-sm);
      display: flex;
      gap: $spacing-sm;
      flex-shrink: 0;

      // 统一右侧操作按钮（删除/收藏/下载/取消/选择）样式
      .el-button {
        width: 58px;
        height: 26px;
        padding: 0;
        border-radius: 4px;
        background-color: rgba(18, 18, 18, 1);
        border: 1px solid rgba(255, 255, 255, 0.15);
        color: $color-text-white;
        font-size: 12px;
        font-weight: 400;
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }

      .el-button:hover,
      .el-button:focus {
        background-color: rgba(18, 18, 18, 1);
        border-color: rgba(255, 255, 255, 0.25);
        color: $color-text-white;
      }

      .el-button.is-disabled,
      .el-button.is-disabled:hover {
        opacity: 0.5;
        background-color: rgba(18, 18, 18, 1);
        border-color: rgba(255, 255, 255, 0.15);
      }

      // 去掉 element-plus 不同 type 的默认填充色
      .el-button--primary,
      .el-button--success,
      .el-button--warning,
      .el-button--danger {
        background-color: rgba(18, 18, 18, 1);
        border-color: rgba(255, 255, 255, 0.15);
      }

      .action-icon {
        width: 16px;
        height: 16px;
        margin-right: 2px;
        object-fit: contain;
        vertical-align: middle;
      }

      @media (max-width: 768px) {
        display: none;
      }
    }

    .header-actions-mobile {
      display: none;
      flex-shrink: 0;

      .menu-item-content {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .menu-icon {
        width: 16px;
        height: 16px;
        object-fit: contain;
      }

      @media (max-width: 768px) {
        display: block;
      }
    }


    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
      gap: $spacing-lg;
    }

    .image-upload-area {
      width: 100%;
      aspect-ratio: 3 / 4;
    }

    .grid :deep(.image-item) {
      width: 160px;
      justify-self: center;
    }

    .upload-debug {
      grid-column: 1 / -1;
      display: flex;
      justify-content: center;
      margin-top: 8px;
    }

    .upload-debug-btn.el-button {
      height: 26px;
      padding: 0 12px;
      border-radius: 4px;
      background-color: rgba(18, 18, 18, 1);
      border: 1px solid rgba(255, 255, 255, 0.15);
      color: rgba(255, 255, 255, 0.85);
    }

    .sentinel {
      height: 1px;
    }

    @media (max-width: 1200px) {
      .grid {
        grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
      }
    }

    @media (max-width: 900px) {
      .grid {
        grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
      }
    }

    @media (max-width: 560px) {
      .grid {
        grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
      }
    }
  }
}
</style>
