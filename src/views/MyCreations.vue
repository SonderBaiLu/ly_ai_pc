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
              :src="selectedCollectStatus.allCollected || activeTab === 'collect' ? images.collectActive : images.collectNo"
              alt="收藏" class="action-icon" />
            {{
              selectedCollectStatus.allCollected || activeTab === 'collect'
                ? t('myCreations.actions.cancelCollect')
                : t('myCreations.actions.collect')
            }}
            <!-- ({{ selectedIds.length }}) -->
          </el-button>

          <el-popover v-if="batchMode && selectedIds.length > 0" placement="bottom" :width="146" trigger="click"
            popper-class="download-menu-popper">
            <template #reference>
              <el-button type="success" :loading="isDownloading" :disabled="isDownloading" @click.stop>
                <img v-if="!isDownloading" :src="images.download" alt="下载" class="action-icon" />
                {{ t('myCreations.actions.download') }}
              </el-button>
            </template>
            <div class="download-menu">
              <div class="download-menu-item" @click.stop="handleBatchDownload">
                <img :src="images.download" alt="下载" class="download-menu-icon" />
                <span>{{ t('myCreations.actions.download') }}</span>
              </div>
              <div class="download-menu-item switch-row">
                <el-switch v-model="removeWatermarkEnabled" :disabled="!isUserVip" active-color="#17A0E1"
                  inactive-color="#201B26" @change="(v) => handleWatermarkToggleChange(v)" />
                <span>去除水印</span>
                <img :src="images.vipText" alt="VIP" class="vip-text-icon" />
              </div>
            </div>
          </el-popover>

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
                      :src="selectedCollectStatus.allCollected || activeTab === 'collect' ? images.collectActive : images.collect"
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
          @select="({ imageData, isSelected }: { imageData: any; isSelected: boolean }) => handleImageSelect(imageData.id, isSelected)" />
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
import { algoApi } from '@/api/algo'
import { useUserStore } from '@/stores/user'
import { useModalStore } from '@/stores/modal'
import { watermarkDownloader } from '@/utils/WatermarkDownloader'
import { useI18n } from 'vue-i18n'
import { APP_MENU_CODES } from '@/constants/appMenuCode'

type TabKey = 'all' | 'image' | 'video' | 'fashion' | 'fabric' | 'collect' | 'upload'

type CreationItem = {
  id: string | number
  algoOrderId: string
  algoOrderNo?: string
  userId?: string
  userSonId?: string | null
  menuCode?: string
  thumbUrl?: string | null
  url?: string | null
  originalUrl?: string | null
  fileSize?: number
  duration?: number
  fileType: number // 1图片 2视频 3音频 4音视频
  status: number // 0初始化 1待请求 2处理中 3完成 4失败
  collectStatus: number // 0未收藏 1已收藏
  prompt?: string
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
const modalStore = useModalStore()

const isUserVip = computed(() => Number(userStore.userInfo?.vipLevel ?? 0) > 0)

const removeWatermarkEnabled = computed(() => {
  // 仅会员才展示“去除水印”开启状态；避免会员到期仍回显 watermarkStatus=1
  return isUserVip.value && userStore.userInfo?.watermarkStatus === 1 ? true : false
})

// 只处理“打开开关”这类动作：未确认前先强制保持关闭
const pendingWatermarkToggleTo = ref<boolean | null>(null)

const pageSize = 12
const page = ref(1)
const list = ref<CreationItem[]>([])
const totalCount = ref(0)

const allData = ref<CreationItem[]>([])

const filteredAll = computed(() => {
  // 当前 tab 的数据已在接口层面完成过滤（或通过 fallback 合并），这里直接复用
  return allData.value
})

const selectedCollectStatus = computed(() => {
  if (selectedIds.value.length === 0) return { allCollected: false }
  const set = new Set(selectedIds.value)
  const items = filteredAll.value.filter((x) => set.has(x.id))
  if (items.length === 0) return { allCollected: false }
  const collected = items.filter((x) => Number(x.collectStatus ?? 0) === 1)
  return { allCollected: collected.length === items.length }
})

const fetchPage = async (reset = false) => {
  if (loading.value) return
  loading.value = true
  try {
    if (activeTab.value === 'upload') {
      if (reset) {
        allData.value = []
        list.value = []
        totalCount.value = 0
      }
      hasMore.value = false
      return
    }

    if (reset) {
      allData.value = []
      list.value = []
      totalCount.value = 0
    }

    const menuCode =
      activeTab.value === 'fashion'
        ? APP_MENU_CODES.AI_FASHION_DESIGN
        : activeTab.value === 'fabric'
          ? APP_MENU_CODES.FABRIC_DESIGN_CONCEPT
          : 'ALL'

    const collectStatus = activeTab.value === 'collect' ? '1' : '0'

    const shouldTryFileTypeAll = !['image', 'video'].includes(activeTab.value)

    const fileTypeTargets = (() => {
      if (activeTab.value === 'image') return ['1']
      if (activeTab.value === 'video') return ['2']
      // 先请求“全部类型”（如果后端不支持 0，会进入 fallback）
      return shouldTryFileTypeAll ? ['0'] : ['1']
    })()

    const fetchOne = async (fileType: string) => {
      const res = await algoApi.queryAlgoResultPage({
        menuCode,
        fileType,
        collectStatus,
        currentPage: page.value,
        offset: pageSize,
      })

      const code = String((res as any)?.code ?? '')
      if (code !== '0000') {
        throw new Error(String((res as any)?.msg ?? 'queryAlgoResultPage failed'))
      }

      const data = (res as any)?.data ?? {}
      const recordsRaw =
        (Array.isArray(data?.records) && data.records) ||
        (Array.isArray(data?.list) && data.list) ||
        (Array.isArray(data) ? data : [])

      const total = Number(data?.total ?? data?.totalCount ?? recordsRaw.length ?? 0)
      return { records: recordsRaw, total }
    }

    const mapToCreationItem = (r: any): CreationItem | null => {
      const id = String(r?.id ?? '')
      if (!id) return null
      const backendFileType = Number(r?.fileType ?? 1)
      const backendStatus = Number(r?.status ?? 3)
      const collect = Number(r?.collectStatus ?? 0)
      const menu = String(r?.menuCode ?? '')
      return {
        id,
        algoOrderId: String(r?.algoOrderId ?? ''),
        algoOrderNo: r?.algoOrderNo != null ? String(r.algoOrderNo) : undefined,
        userId: r?.userId != null ? String(r.userId) : undefined,
        userSonId: r?.userSonId != null ? String(r.userSonId) : null,
        menuCode: menu,
        thumbUrl: (r?.thumbUrl ?? null) as any,
        url: (r?.url ?? null) as any,
        originalUrl: (r?.originalUrl ?? null) as any,
        fileSize: r?.fileSize !== undefined && r?.fileSize !== null ? Number(r.fileSize) : undefined,
        duration: r?.duration !== undefined && r?.duration !== null ? Number(r.duration) : undefined,
        fileType: backendFileType,
        status: backendStatus,
        collectStatus: collect,
        prompt: String(r?.prompt ?? r?.functionPrompt ?? r?.creativeDescription ?? ''),
      }
    }

    const mergeRecords = (recordsList: any[][], totals: number[]) => {
      const map = new Map<string, any>()
      for (let i = 0; i < recordsList.length; i++) {
        for (const r of recordsList[i] || []) {
          const id = String(r?.id ?? r?.algoOrderResultId ?? '')
          if (!id) continue
          map.set(id, r)
        }
      }
      return { records: Array.from(map.values()), total: totals.reduce((s, x) => s + Number(x ?? 0), 0) }
    }

    // 先按 fileTypeTargets 尝试获取
    const results: any[][] = []
    const totals: number[] = []

    let usedFallback = false
    try {
      for (const ft of fileTypeTargets) {
        const { records, total } = await fetchOne(ft)
        results.push(records)
        totals.push(total)
      }
    } catch (e) {
      if (!shouldTryFileTypeAll || usedFallback) throw e

      // fallback：后端可能不接受 fileType=0，则分别拉图片/视频再合并
      usedFallback = true
      const [imgRes, videoRes] = await Promise.all([fetchOne('1'), fetchOne('2')])
      results.push(imgRes.records, videoRes.records)
      totals.push(imgRes.total, videoRes.total)
    }

    const merged = mergeRecords(results, totals)
    const mapped = merged.records.map(mapToCreationItem).filter(Boolean) as CreationItem[]

    if (mapped.length === 0) {
      list.value = []
      allData.value = []
      totalCount.value = merged.total
      hasMore.value = false
      return
    }

    allData.value = reset ? mapped : [...allData.value, ...mapped]
    list.value = allData.value
    totalCount.value = merged.total
    hasMore.value = allData.value.length < totalCount.value
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

// 刷新用户信息：用于校验会员状态是否已变更（例如会员到期）
const refreshUserInfoIfPossible = async () => {
  if (!userStore.isLoggedIn) return
  try {
    await userStore.getUserInfo()
  } catch (e) {
    console.warn('[MyCreations] 刷新用户信息失败（忽略）：', e)
  }
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
  try {
    const ids = selectedIds.value.map((x) => String(x))
    for (const id of ids) {
      const res = await algoApi.del({ algoOrderResultId: id })
      if (res.code !== '0000') throw new Error(res.msg || '删除失败')
    }
    const set = new Set(selectedIds.value)
    allData.value = allData.value.filter((x) => !set.has(x.id))
    list.value = allData.value
    selectedIds.value = []
    batchMode.value = false
    ElMessage.success(t('myCreations.message.deleteSuccess'))
  } catch (e: any) {
    ElMessage.error(e?.message || '删除失败')
  }
}

const handleBatchCollect = async () => {
  if (selectedIds.value.length === 0) return
  try {
    const set = new Set(selectedIds.value)
    const shouldCancel = selectedCollectStatus.value.allCollected || activeTab.value === 'collect'
    for (const id of selectedIds.value) {
      const res = await algoApi.collect({ algoOrderResultId: String(id) })
      if (res.code !== '0000') throw new Error(res.msg || '收藏失败')
    }
    allData.value = allData.value.map((x) => {
      if (!set.has(x.id)) return x
      return { ...x, collectStatus: shouldCancel ? 0 : 1 }
    })
    list.value = allData.value
    selectedIds.value = []
    batchMode.value = false
    ElMessage.success(
      shouldCancel ? t('myCreations.message.cancelCollectSuccess') : t('myCreations.message.collectSuccess'),
    )
  } catch (e: any) {
    ElMessage.error(e?.message || '收藏失败')
  }
}

const getItemUrl = (item: CreationItem) => {
  if (removeWatermarkEnabled.value && item.originalUrl) return String(item.originalUrl)
  return String(item.url || item.thumbUrl || '')
}

const setLocalWatermarkStatus = (enabled: boolean) => {
  const prev = userStore.userInfo
  if (!prev) return
  userStore.setUserInfo({
    ...prev,
    // watermarkStatus 1 表示“去除水印开启”（无水印）
    watermarkStatus: enabled ? 1 : 0,
  })
}

const persistWatermarkStatus = async (enabled: boolean) => {
  const payload = { watermarkStatus: enabled ? 1 : 0 }
  await userStore.updateUserInfo(payload).catch(() => { })
}

const handleWatermarkToggleChange = async (val: string | number | boolean) => {
  const enabled = val === true || val === 1 || val === '1' || val === 'true'
  // 只有尝试“开启去水印”时才需要校验是否仍为会员
  if (enabled) await refreshUserInfoIfPossible()
  const isVip = isUserVip.value
  if (enabled && !isVip) {
    ElMessage.warning('仅会员可去除水印，请开通会员')
    return
  }

  // enabled=true 且为会员：先检查是否需要责任声明
  if (enabled && isVip) {
    const noRemind = localStorage.getItem('watermark_disclaimer_no_remind') === 'true'
    if (!noRemind) {
      pendingWatermarkToggleTo.value = true
      setLocalWatermarkStatus(false)
      modalStore.openWatermarkDisclaimerModalPage()
      return
    }
  }

  pendingWatermarkToggleTo.value = null
  await persistWatermarkStatus(enabled)
}

// 责任声明弹窗确认/取消：清理页面内 pending 状态
watch(
  () => modalStore.watermarkDisclaimerConfirmToken,
  () => {
    if (pendingWatermarkToggleTo.value !== null) pendingWatermarkToggleTo.value = null
  },
)
watch(
  () => modalStore.watermarkDisclaimerCancelToken,
  () => {
    if (pendingWatermarkToggleTo.value !== null) pendingWatermarkToggleTo.value = null
  },
)

const handleBatchDownload = async () => {
  if (selectedIds.value.length === 0) return
  if (isDownloading.value) return
  isDownloading.value = true
  try {
    // 如果用户当前选择了“去除水印”下载，需要再次校验会员状态（例如会员到期）
    const wantRemoveWatermark = removeWatermarkEnabled.value
    if (wantRemoveWatermark) {
      await refreshUserInfoIfPossible()
      if (!isUserVip.value) {
        ElMessage.warning('仅会员可去除水印，请开通会员')
        return
      }
    }

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

    // 本地插入一条（后续接真实列表接口时可直接改为 refresh）
    const id = `upload-${Date.now()}`
    // “我的上传”暂不接算法创作列表接口：这里先按创作结构插入一条本地记录
    allData.value = [
      {
        id,
        algoOrderId: id,
        menuCode: 'upload',
        thumbUrl: imageUrl,
        url: imageUrl,
        originalUrl: imageUrl,
        fileType: 1,
        status: 3,
        collectStatus: 0,
        prompt: '',
        source: 'upload',
      },
      ...allData.value,
    ]
    // upload tab：跳过重拉接口，避免 reset 时清空刚插入的数据
    list.value = allData.value
    hasMore.value = false
    totalCount.value = allData.value.length
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
