<template>
  <div class="my-creations-page">
    <Header />

    <div class="page-body">
      <div class="page-title">
        <span class="title-cn">{{ t('myCreations.title') }}</span>
      </div>

      <div ref="stickyTopRef" class="tabs-actions" :class="{ 'is-stuck': isTopStickyActive }">
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
            <span> {{ t('myCreations.actions.delete') }}</span>
            <!-- ({{ selectedIds.length }}) -->
          </el-button>

          <el-button v-if="batchMode && selectedIds.length > 0 && activeTab !== 'upload'" type="warning"
            @click="handleBatchCollect">
            <img
              :src="selectedCollectStatus.allCollected || activeTab === 'collect' ? images.collectActive : images.collectNo"
              alt="收藏" class="action-icon" />
            <span>
              {{
                selectedCollectStatus.allCollected || activeTab === 'collect'
                  ? t('myCreations.actions.cancelCollect')
                  : t('myCreations.actions.collect')
              }}
            </span>
            <!-- ({{ selectedIds.length }}) -->
          </el-button>

          <!-- 我的上传：无水印选项，下载一键触发 -->
          <el-button v-if="batchMode && selectedIds.length > 0 && activeTab === 'upload'" type="success"
            :loading="isDownloading" :disabled="isDownloading" @click="handleBatchDownload">
            <img v-if="!isDownloading" :src="images.download" alt="下载" class="action-icon" />
            <span>{{ t('myCreations.actions.download') }}</span>
          </el-button>

          <el-popover v-else-if="batchMode && selectedIds.length > 0" placement="bottom" :width="146" trigger="click"
            popper-class="download-menu-popper">
            <template #reference>
              <el-button type="success" :loading="isDownloading" :disabled="isDownloading" @click.stop>
                <img v-if="!isDownloading" :src="images.download" alt="下载" class="action-icon" />
                <span>{{ t('myCreations.actions.download') }}</span>
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
                <span>{{ t('myCreations.actions.removeWatermark') }}</span>
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
          :enable-history-replace="false" delegate-click-upload :show-loading="uploading"
          :loading-text="t('myCreations.upload.loading')" @upload="handleUploadClick" @drop-file="handleDropFile" />

        <ImageItem v-for="item in list" :key="item.id" :image-data="item as any" :show-select="batchMode"
          :is-selected="selectedIds.includes(item.id)" :max-select="Infinity" :selected-count="selectedIds.length"
          :show-collect="true" :show-zoom="false" show-file-type collectMode="collected-only" :show-title="false"
          @zoom="handleZoom" @click="() => handleItemClick(item)"
          @select="({ imageData, isSelected }: { imageData: any; isSelected: boolean }) => handleImageSelect(imageData.id, isSelected)" />
      </div>

      <!-- 触底观察点：用于自动触发 loadMore -->
      <div ref="sentinelRef" class="sentinel"></div>

      <InfiniteScrollLoader :loading="loading" :has-more="hasMore" :data-length="list.length"
        :empty-text="t('myCreations.empty.noWorks')" />
    </div>

    <!-- 我的上传：大图预览（右上角带下载/删除） -->
    <ImagePreviewModal v-if="uploadPreviewItem" v-model="showUploadPreview" :title="t('myCreations.tabs.upload')"
      :image-src="uploadPreviewItem.fileUrl || ''" :show-name="false" :show-download="true" :show-delete="true"
      :show-confirm-button="false" :image-data="{
        id: uploadPreviewItem.id,
        imgUrl: uploadPreviewItem.fileUrl || '',
        imageUrl: uploadPreviewItem.fileUrl || '',
      }" @deleted="handleUploadPreviewDeleted" />

  </div>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox } from 'element-plus'
import { MoreFilled } from '@element-plus/icons-vue'
import { images } from '@/assets'
import { uploadApi } from '@/api/upload'
import { algoApi } from '@/api/algo'
import { userApi } from '@/api/user'
import { appApi } from '@/api/app'
import { useUserStore } from '@/stores/user'
import { useModalStore } from '@/stores/modal'
import { watermarkDownloader } from '@/utils/WatermarkDownloader'
import { useI18n } from 'vue-i18n'
import { APP_MENU_CODES } from '@/constants/appMenuCode'
import { useRouter } from 'vue-router'
import { useTemplateStore } from '@/stores/template'
import { enMessages, userLanguageToI18nLocale, zhMessages } from '@/i18n'
import type { CreationResult } from '@/composables/useTaskPolling'
import { mapRecordToCreationResult } from '@/utils/creationResult'

/** 与产品一级导航一致：全部 / 服装设计 / AI面料 / 收藏 / 我的上传（图片与视频在「全部」内混合展示，角标区分） */
type TabKey = 'all' | 'fashion' | 'fabric' | 'collect' | 'upload'

// 复用统一的“创作结果”类型；上传记录额外可能带 fileUrl 等字段
type CreationItem = Omit<CreationResult, 'id' | 'createTime'> & {
  id: string | number
  createTime?: string
  fileUrl?: string | null
  [key: string]: any
}

const userStore = useUserStore()
const { t, locale } = useI18n({
  useScope: 'local',
  inheritLocale: false,
  messages: {
    'zh-chs': zhMessages,
    en: enMessages,
  },
})
const router = useRouter()
const templateStore = useTemplateStore()

// 我的创作文案仅跟随用户偏好语言，不跟随导航全局语言
watch(
  () => userStore.userInfo?.language,
  (userLang) => {
    locale.value = userLanguageToI18nLocale(userLang)
  },
  { immediate: true },
)

const tabs = computed<Array<{ key: TabKey; label: string }>>(() => [
  { key: 'all', label: t('myCreations.tabs.all') },
  { key: 'fashion', label: t('myCreations.tabs.fashion') },
  { key: 'fabric', label: t('myCreations.tabs.fabric') },
  { key: 'collect', label: t('myCreations.tabs.collect') },
  { key: 'upload', label: t('myCreations.tabs.upload') },
])

const activeTab = ref<TabKey>('all')
const loading = ref(false)
const hasMore = ref(true)
// 仅接收“最后一次请求”的结果，避免切换 tab 时旧请求回写覆盖新数据
let latestFetchReqId = 0
const batchMode = ref(false)
const selectedIds = ref<(string | number)[]>([])
const isDownloading = ref(false)
const uploading = ref(false)
const modalStore = useModalStore()

const isUserVip = computed(() => Number(userStore.userInfo?.vipLevel ?? 0) > 0)

const removeWatermarkEnabled = computed(() => {
  // 仅会员才展示“去除水印”开启状态；避免会员到期仍回显 watermarkStatus=1
  return isUserVip.value && userStore.userInfo?.watermarkStatus === 1 ? true : false
})

// 只处理“打开开关”这类动作：未确认前先强制保持关闭
const pendingWatermarkToggleTo = ref<boolean | null>(null)

const pageSize = 24
const page = ref(1)
const list = ref<CreationItem[]>([])
const totalCount = ref(0)

const allData = ref<CreationItem[]>([])

// 我的上传：大图预览（右上角支持下载 / 删除）
const showUploadPreview = ref(false)
const uploadPreviewItem = ref<CreationItem | null>(null)

// ========= “一级 menuCode”解析（用于解决后端要求一级父级 code） =========
const platformMenus = ref<any[]>([])
let platformMenusLoadPromise: Promise<void> | null = null

const ensurePlatformMenusLoaded = async () => {
  if (platformMenusLoadPromise) return platformMenusLoadPromise
  platformMenusLoadPromise = (async () => {
    try {
      const res = await appApi.getSysPlatformMenu()
      if (String((res as any)?.code) === '0000' && Array.isArray((res as any)?.data)) {
        platformMenus.value = (res as any).data
      } else {
        platformMenus.value = []
      }
    } catch (e) {
      console.warn('[MyCreations] getSysPlatformMenu failed, fallback to APP_MENU_CODES:', e)
      platformMenus.value = []
    }
  })()
  return platformMenusLoadPromise
}

const resolveTopMenuCodeByTargets = (targetCodes: string[]): string => {
  const targets = (Array.isArray(targetCodes) ? targetCodes : []).map((x) => String(x || '').trim()).filter(Boolean)
  if (!targets.length) return ''

  const isMatch = (node: any, code: string): boolean => {
    if (!node) return false
    if (String(node?.menuCode ?? '') === code) return true
    const children = Array.isArray(node?.children) ? node.children : []
    return children.some((c: any) => isMatch(c, code))
  }

  for (const top of platformMenus.value || []) {
    const topCode = String(top?.menuCode ?? '')
    if (!topCode) continue
    // 命中任意 target：返回该“一级父节点”的 menuCode
    if (targets.some((c) => isMatch(top, c))) return topCode
  }

  // 兜底：返回第一个目标 code（避免完全为空导致列表查不到）
  return targets[0] || ''
}

const filteredAll = computed(() => {
  // 当前 tab 的数据已在接口层面完成过滤（或通过 fallback 合并），这里直接复用
  return allData.value
})

// 计算选中项的收藏状态
const selectedCollectStatus = computed(() => {
  if (selectedIds.value.length === 0) return { allCollected: false }
  const set = new Set(selectedIds.value)
  const items = filteredAll.value.filter((x) => set.has(x.id))
  if (items.length === 0) return { allCollected: false }
  const collected = items.filter((x) => Number(x.collectStatus ?? 0) === 1)
  return { allCollected: collected.length === items.length }
})

/** 与详情页、AI 工作室一致：GET /api/v1/algo/queryAlgoResultPage，空字符串表示不按该维度筛选 */
const dedupeCreationsByIdPreserveOrder = (arr: CreationItem[]): CreationItem[] => {
  const map = new Map<string, CreationItem>()
  for (const item of arr) {
    const id = String(item?.id ?? '')
    if (!id) continue
    // Map.set(已存在key)只会覆盖 value，不会改变 key 的插入顺序
    // 用于避免后续分页/多 menuCode 合并时，状态字段无法刷新到最新数据
    map.set(id, item)
  }
  return Array.from(map.values())
}

// 复用统一映射：把 queryAlgoResultPage 记录映射为 CreationResult
const mapRecordToCreationItem = (r: any): CreationItem | null => {
  const mapped = mapRecordToCreationResult(r, {
    fallbackIdFromAlgoResultId: true,
    fallbackCreateTime: String(r?.uploadTime ?? ''),
  })
  return mapped as unknown as CreationItem | null
}

const fetchPage = async (reset = false) => {
  // 加载更多时防重入；reset（切换 tab/刷新）允许抢占进行中的旧请求
  if (loading.value && !reset) return
  const reqId = ++latestFetchReqId
  loading.value = true
  try {
    if (activeTab.value === 'upload') {
      if (reset) {
        allData.value = []
        list.value = []
        totalCount.value = 0
      }

      const res = await userApi.getStorageLogList({
        currentPage: page.value,
        pageSize,
      })

      const code = String((res as any)?.code ?? '')
      if (code !== '0000') {
        throw new Error(String((res as any)?.msg ?? 'getStorageLogList failed'))
      }

      const data = (res as any)?.data ?? {}
      const recordsRaw = Array.isArray(data?.list) ? data.list : []

      const total = Number(data?.total ?? data?.totalCount ?? 0)

      // 免映射：直接使用上传接口返回的记录对象
      // 组件渲染层会兼容 fileUrl/originalUrl 等字段
      const mapped = recordsRaw as CreationItem[]
      const merged = reset ? dedupeCreationsByIdPreserveOrder(mapped) : dedupeCreationsByIdPreserveOrder([...allData.value, ...mapped])
      if (reqId !== latestFetchReqId) return

      allData.value = merged
      list.value = allData.value
      totalCount.value = total

      // 后端用 hasNext 控制分页：有下一页就返回 true
      hasMore.value = Boolean(data?.hasNext)

      return
    }

    if (reset) {
      allData.value = []
      list.value = []
      totalCount.value = 0
    }

    const tab = activeTab.value
    const collectStatus = tab === 'collect' ? '1' : ''
    // 我的创作页面需要区分图片/视频：但列表查询这里不做 fileType 限制，让后端返回混合数据
    const fileType = ''

    // 一级导航（menuCode）过滤：
    // 后端期望的是“平台菜单树里的一级父级 menuCode”，而不是我们前端按钮对应的具体功能 code。
    // 因此：先拉取 getSysPlatformMenu，再把 fashion/fabric 映射成其一级父节点。
    let menuCode = ''
    if (tab === 'fashion') {
      await ensurePlatformMenusLoaded()
      // “服装设计”一级导航只对应 ai_fashion_design 这一组
      menuCode = resolveTopMenuCodeByTargets([APP_MENU_CODES.AI_FASHION_DESIGN])
      if (!menuCode) menuCode = APP_MENU_CODES.AI_FASHION_DESIGN
    } else if (tab === 'fabric') {
      await ensurePlatformMenusLoaded()
      menuCode = resolveTopMenuCodeByTargets([APP_MENU_CODES.FABRIC_DESIGN_CONCEPT])
      if (!menuCode) menuCode = APP_MENU_CODES.FABRIC_DESIGN_CONCEPT
    }

    const res = await algoApi.queryAlgoResultPage({
      menuCode,
      fileType,
      collectStatus,
      currentPage: page.value,
      pageSize: pageSize,
    })

    const code = String((res as any)?.code ?? '')
    if (code !== '0000') {
      throw new Error(String((res as any)?.msg ?? 'queryAlgoResultPage failed'))
    }

    const data = (res as any)?.data ?? {}
    const recordsRaw = Array.isArray(data?.list) ? data.list : []

    const inProgressRaw: any[] = Array.isArray(data?.orderResulGenerated) ? data.orderResulGenerated : []

    const recordsMapped = recordsRaw.map(mapRecordToCreationItem).filter(Boolean) as CreationItem[]
    const inProgressMapped = inProgressRaw.map(mapRecordToCreationItem).filter(Boolean) as CreationItem[]

    const merged = reset
      ? dedupeCreationsByIdPreserveOrder([...inProgressMapped, ...recordsMapped])
      : dedupeCreationsByIdPreserveOrder([...inProgressMapped, ...allData.value, ...recordsMapped])
    if (reqId !== latestFetchReqId) return

    const total = Number(data?.total ?? data?.totalCount ?? 0)
    totalCount.value = total
    allData.value = merged
    list.value = allData.value

    // 后端用 hasNext 控制分页：有下一页就返回 true
    hasMore.value = Boolean(data?.hasNext)
  } catch (e: any) {
    if (reqId !== latestFetchReqId) return
    console.error('[MyCreations] queryAlgoResultPage failed:', e)
    if (reset) {
      allData.value = []
      list.value = []
      totalCount.value = 0
    }
    hasMore.value = false
  } finally {
    if (reqId === latestFetchReqId) {
      loading.value = false
    }
  }
}

const resetAndFetch = async () => {
  page.value = 1
  hasMore.value = true
  await fetchPage(true)
  await nextTick()
  await tryAutoLoadMoreWhenSentinelVisible()
}

const loadMore = async () => {
  if (loading.value || !hasMore.value) return
  page.value += 1
  await fetchPage(false)
}

// 切换 tab 后，若观察点一直可见，IO 可能不触发；主动补拉直到撑满首屏或无更多
const tryAutoLoadMoreWhenSentinelVisible = async () => {
  const maxRounds = 6
  for (let i = 0; i < maxRounds; i++) {
    if (loading.value || !hasMore.value || !sentinelRef.value) break
    const rect = sentinelRef.value.getBoundingClientRect()
    if (rect.top > window.innerHeight + 200) break
    await loadMore()
    await nextTick()
  }
}

const handleTabClick = async (key: TabKey) => {
  if (activeTab.value === key) return
  activeTab.value = key
}

const handleTabChange = async (name: string | number) => {
  await handleTabClick(name as TabKey)
}

const handleZoom = () => {
  // 历史遗留的缩略图放大事件，目前列表点击已分别处理：
  // - 非“我的上传”：跳转详情页
  // - “我的上传”：弹出大图预览（右上角带下载/删除）
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

  // “我的上传”：点击卡片仅做大图预览（右上角带下载/删除）
  if (activeTab.value === 'upload') {
    uploadPreviewItem.value = item
    showUploadPreview.value = true
    return
  }

  // 其他 tab：进入创作详情页
  const listForDetail = filteredAll.value
  const currentIndex = Math.max(
    0,
    listForDetail.findIndex((x) => String(x.id) === String(item.id)),
  )

  // 与 AiFashionStudio 一致：缓存当前列表，详情页支持“上一张/下一张”
  const modeCode =
    activeTab.value === 'fashion'
      ? APP_MENU_CODES.AI_FASHION_DESIGN
      : activeTab.value === 'fabric'
        ? APP_MENU_CODES.FABRIC_DESIGN_CONCEPT
        : ''

  templateStore.setTemplateListData({
    list: listForDetail,
    currentIndex,
    modeCode,
  })

  router.push({
    name: 'CreativeDetail',
    params: { id: String(item.id) },
    query: { modeCode },
  })
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
  // “我的上传”：删除上传记录（后端接口 + 本地列表移除）
  if (activeTab.value === 'upload') {
    try {
      await ElMessageBox.confirm('确定要删除选中的上传记录吗？删除后将无法恢复。', '删除上传记录确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        customClass: 'creative-delete-confirm',
        confirmButtonClass: 'creative-delete-confirm-btn',
        cancelButtonClass: 'creative-delete-cancel-btn',
        showClose: false,
        closeOnClickModal: false,
        closeOnPressEscape: true,
        center: true,
      })

      const ids = selectedIds.value.map((x) => String(x))
      const res = await userApi.delStorageLog({ logId: ids })
      if (String((res as any)?.code) !== '0000') {
        throw new Error(String((res as any)?.msg || '删除失败'))
      }

      const idSet = new Set(ids)
      allData.value = allData.value.filter((x) => !idSet.has(String((x as any)?.id)))
      list.value = allData.value
      selectedIds.value = []
      batchMode.value = false
      ElMessage.success(t('myCreations.message.deleteSuccess'))
    } catch (e: any) {
      // 用户取消：忽略
      if (e === 'cancel' || e === 'close') return
      ElMessage.error(e?.message || '删除失败')
    }
    return
  }
  try {
    await ElMessageBox.confirm('确定要删除选中的创作吗？删除后将无法恢复。', '删除创作确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
      customClass: 'creative-delete-confirm',
      confirmButtonClass: 'creative-delete-confirm-btn',
      cancelButtonClass: 'creative-delete-cancel-btn',
      showClose: false,
      closeOnClickModal: false,
      closeOnPressEscape: true,
      center: true,
    })

    const ids = selectedIds.value.map((x) => String(x))
    const res = await algoApi.del({ algoOrderResultId: ids })
    if (res.code !== '0000') throw new Error(res.msg || '删除失败')
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
    const ids = selectedIds.value.map((id) => String(id))
    const res = await algoApi.collect({ algoOrderResultId: ids })
    if (res.code !== '0000') throw new Error(res.msg || '收藏失败')
    // 取消收藏：在「收藏」tab 里应立即从列表移除（否则需要手动刷新才消失，体验像没生效）
    if (shouldCancel && activeTab.value === 'collect') {
      allData.value = allData.value.filter((x) => !set.has(x.id))
      list.value = allData.value
    } else {
      allData.value = allData.value.map((x) => {
        if (!set.has(x.id)) return x
        return { ...x, collectStatus: shouldCancel ? 0 : 1 }
      })
      list.value = allData.value
    }
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
  // 上传记录字段可能来自 fileUrl / originalUrl / thumbUrl 等
  if (removeWatermarkEnabled.value) {
    return String(item.originalUrl || item.fileUrl || item.url || item.thumbUrl || '')
  }
  return String(item.fileUrl || item.url || item.originalUrl || item.thumbUrl || '')
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
    // “我的上传”：只用 fileUrl 下载，不走去水印校验
    if (activeTab.value === 'upload') {
      const set = new Set(selectedIds.value)
      const items = filteredAll.value.filter((x) => set.has(x.id))
      const urls = items
        .map((item) => String((item as any)?.fileUrl || '').trim())
        .filter(Boolean)
      if (urls.length === 0) {
        ElMessage.warning(t('myCreations.message.downloadNoUrl'))
        return
      }
      const payload = urls.length === 1 ? urls[0] : urls
      const result = await watermarkDownloader.download(payload)
      if (result.success) {
        selectedIds.value = []
        batchMode.value = false
      }
      return
    }

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
    const urls = items.map((item) => getItemUrl(item)).filter((u) => String(u || '').trim())
    if (urls.length === 0) {
      ElMessage.warning(t('myCreations.message.downloadNoUrl'))
      return
    }

    // 与 WatermarkDownloader 一致：单个直接下文件，多个打成 ZIP
    const payload = urls.length === 1 ? urls[0] : urls
    const result = await watermarkDownloader.download(payload)
    if (result.success) {
      selectedIds.value = []
      batchMode.value = false
    }
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

// ============ 我的上传：/v1/storage/uploadImage + /v1/user/getStorageLogList ============
const handleUploadClick = async () => {
  if (uploading.value) return
  const input = document.createElement('input')
  input.type = 'file'
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
    ElMessage.warning(t('myCreations.upload.localFileOnlyHint'))
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
  if (uploading.value) return
  const isAuthed = userStore.isLoggedIn || !!localStorage.getItem('token')
  if (!isAuthed) {
    ElMessage.warning(t('myCreations.upload.needLogin'))
    modalStore.openLoginModal()
    return
  }

  uploading.value = true
  try {
    const uploadResult = await uploadApi.uploadImage(file, {
      showLoading: false,
      loadingText: t('myCreations.upload.uploadingImage'),
      showMessage: false,
    })

    if (!uploadResult.success || !uploadResult.url) {
      showUploadFailToast(
        `${t('myCreations.upload.uploadFailPrefix')}${uploadResult.message || t('myCreations.upload.uploadFailFallback')}`,
      )
      return
    }

    if (activeTab.value !== 'upload') {
      return
    }
    await resetAndFetch()
    ElMessage.success(t('myCreations.upload.uploadSuccess'))
  } finally {
    uploading.value = false
  }
}

// “我的上传”：预览弹窗中删除当前上传记录（调用后端 + 本地列表移除）
const handleUploadPreviewDeleted = async () => {
  const item = uploadPreviewItem.value
  if (!item) return

  const logId = (item as any).logId ?? item.id
  if (!logId) return

  try {
    const res = await userApi.delStorageLog({ logId: [String(logId)] })
    if (String((res as any)?.code) !== '0000') throw new Error(String((res as any)?.msg || '删除失败'))

    const idSet = new Set<string>([String(logId)])
    allData.value = allData.value.filter((x) => !idSet.has(String((x as any)?.id)))
    list.value = allData.value
    uploadPreviewItem.value = null
    showUploadPreview.value = false
    ElMessage.success(t('myCreations.message.deleteSuccess'))
  } catch (e: any) {
    ElMessage.error(e?.message || '删除失败，请重试')
  }
}

// ============ 触底加载更多：IntersectionObserver ============
const sentinelRef = ref<HTMLElement | null>(null)
let io: IntersectionObserver | null = null
const stickyTopRef = ref<HTMLElement | null>(null)
const isTopStickyActive = ref(false)

const updateStickyTopState = () => {
  const el = stickyTopRef.value
  if (!el) return
  // 与 .tabs-actions 的 sticky top 保持一致
  isTopStickyActive.value = el.getBoundingClientRect().top <= 67
}

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
  // 预先拉取一次平台菜单树，后续切换 fashion/fabric 时可更快解析“一级父级 menuCode”
  void ensurePlatformMenusLoaded()
  await resetAndFetch()
  initObserver()
  updateStickyTopState()
  window.addEventListener('scroll', updateStickyTopState, { passive: true })
  window.addEventListener('resize', updateStickyTopState)
})

watch(activeTab, async () => {
  await resetAndFetch()
})

onBeforeUnmount(() => {
  io?.disconnect()
  io = null
  window.removeEventListener('scroll', updateStickyTopState)
  window.removeEventListener('resize', updateStickyTopState)
})
</script>

<style lang="scss">
.my-creations-page {
  min-height: 100vh;
  background: linear-gradient(135deg, rgba(5, 7, 10, 1) 14.6%, rgba(13, 18, 31, 1) 50%, rgba(22, 29, 49, 1) 85.4%);

  .page-body {

    .page-title {
      display: flex;
      flex-direction: column;
      padding: $spacing-xl $spacing-xl 14px;
      gap: 4px;
      font-family: AlibabaPuHui-regular;
      flex-shrink: 0;

      .title-cn {
        font-size: $font-size-2xl-lg;
      }

      .title-en {
        font-size: $font-size-md;
        color: $color-text-secondary;
      }
    }

    .tabs-actions {
      position: sticky;
      top: 67px;
      z-index: 99;
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: $spacing-md;
      margin: 0 0 $spacing-sm-md;
      padding: 0 $spacing-xl;
      background: transparent;

      &.is-stuck {
        background: $color-bg-dark-secondary;
      }
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
        color: $color-primary-dark;
        font-family: NotoSans-bold;
      }

      .el-tabs__nav-wrap:after {
        background-color: $color-border-light;
        height: 1px;
      }
    }

    .header-actions-desktop {
      display: flex;
      align-items: center;
      gap: $spacing-sm;
      flex-shrink: 0;
      align-self: flex-start;
      // margin-top: 4px;

      // 统一右侧操作按钮（删除/收藏/下载/取消/选择）样式
      .el-button {
        margin: 0;
        min-width: 58px;
        height: 26px;
        padding: 0 8px 0 9px;
        border-radius: 4px;
        background-color: rgba(18, 18, 18, 1);
        border: 1px solid rgba(255, 255, 255, 0.15);
        color: $color-text-white;
        font-size: 12px;
      }

      .el-button:hover,
      .el-button:focus {
        background-color: rgba(18, 18, 18, 1);
        border-color: rgba(255, 255, 255, 0.25);
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

    .header-actions-desktop,
    .header-actions-mobile {
      position: absolute;
      right: $spacing-xl;
      top: 6px;
    }

    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
      gap: $spacing-lg;
      padding: 0 $spacing-xl;
    }

    .image-upload-area {
      width: 100%;
      aspect-ratio: 3 / 4;
    }

    .grid :deep(.image-item) {
      width: 160px;
      justify-self: center;
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
      .tabs-actions {
        top: 60px;
      }

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
