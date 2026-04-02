<template>
  <!-- eslint-disable vue/html-indent -->
  <div class="template-detail-page">
    <Header />

    <!-- 主要内容区域 -->
    <div class="main-content">
      <!-- 返回放在可滚动区域外，相对 main-content 定位，避免随左侧 overflow 滚动被卷走 -->
      <el-button class="back-button" type="default" circle aria-label="返回" @click="handleBack">
        <el-icon :size="20">
          <ArrowLeft />
        </el-icon>
      </el-button>
      <div ref="mediaContainerRef" class="media-container"
        :style="{ scrollBehavior: isInitialLoad ? 'auto' : 'smooth' }">
        <div class="media-scroll-wrapper">
          <div v-for="(item, index) in relatedTemplates" :key="item.id" class="media-item"
            :class="{ active: selectedThumbnail === index }">
            <div class="media-player flex-col-center" @click="handleImagePreview(index, item)">
              <!-- 生成中/失败：不展示媒体内容，显示占位提示 -->
              <div v-if="Number((item as any).status) === 2" class="media-status-placeholder generating">
                <LoadingSpinner :size="72" :thickness="8" />
                <div class="status-text">正在生成中...</div>
              </div>
              <div v-else-if="Number((item as any).status) === 4" class="media-status-placeholder failed">
                <img :src="images.fail" class="placeholder-icon" alt="生成失败" />
                <div class="status-text">生成失败</div>
              </div>
              <!-- 媒体播放器 - 自动判断显示视频或图片 -->
              <MediaPlayer v-else :ref="(el: any) => setMediaPlayerRef(el, index)" :src="(item as any).url"
                :poster="(item as any).url || (item as any).thumbUrl"
                :autoplay="isVideoType(item) && selectedThumbnail === index" :loop="true" :controls="isVideoType(item)"
                :muted="true" :minimal-controls="true" :image-only="isImageType(item)" object-fit="contain"
                poster-fit="contain" class="video-player" />
            </div>
            <div class="content-notice">
              内容由AI生成，禁止利用功能从事违法活动，请合理规范地使用生成内容
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧信息面板 -->
      <!-- 1）未完成：展示简版状态面板，避免出现“暂无内容”空白 -->
      <div v-if="templateDetail && detailStatus !== 3" class="info-panel info-panel--pending">
        <div class="info-header">
          <div class="info-title-row">
            <h2 class="info-title">{{ detailStatus === 4 ? '生成失败' : '作品生成中' }}</h2>
          </div>
        </div>
        <div class="info-body pending-body">
          <p class="pending-text">
            <template v-if="detailStatus === 4">
              生成失败，失败记录不会展示，请稍后查看潮币余额是否回退。
            </template>
            <template v-else>
              当前作品仍在处理或刚刚生成完成，详情数据尚未同步。
              <br />
              请稍候片刻后，在右侧缩略图中重新进入详情查看完整信息。
            </template>
          </p>
        </div>
      </div>

      <!-- 2）正常详情面板 -->
      <div v-else class="info-panel">
        <!-- 顶部操作图标 -->
        <div class="info-actions">
          <el-popover placement="bottom" :width="146" trigger="click" popper-class="download-menu-popper">
            <template #reference>
              <div class="btn-icon-wrapper" @click.stop>
                <el-icon v-if="isDownloading" class="is-loading btn-icon-loading">
                  <Loading />
                </el-icon>
                <img v-else :src="images.downloadIcon" class="btn-icon" alt="下载" />
              </div>
            </template>
            <div class="download-menu">
              <div class="download-menu-item" @click.stop="handleDownloadCommand('download')">
                <img :src="images.downloadIcon" class="download-menu-icon" alt="下载" />
                <span>下载</span>
              </div>
              <div class="download-menu-item switch-row">
                <el-switch v-model="removeWatermarkEnabled" :disabled="!isUserVip" active-color="#17A0E1"
                  inactive-color="#201B26"
                  @change="(v) => handleWatermarkToggleChange(v as string | number | boolean)" />
                <span>去除水印</span>
                <img :src="images.vipText" alt="VIP" class="vip-text-icon" />
              </div>
            </div>
          </el-popover>
          <img :src="Number((templateDetail as any)?.collectStatus) === 1 ? images.collectActive : images.collectNo"
            class="btn-icon" alt="" @click="handleAssetsCollect" />
          <el-dropdown trigger="click" @command="handleMoreCommand">
            <img :src="images.more" class="btn-icon" alt="" />
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="report">
                  <img :src="images.notice" class="menu-icon" alt="" />
                  <span>反馈</span>
                </el-dropdown-item>
                <el-dropdown-item command="delete">
                  <img :src="images.delIcon" class="menu-icon" alt="" />
                  <span>删除</span>
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>

        <!-- 我的创作详情 -->
        <div>
          <div class="section-title">
            {{ studioModuleName }}
          </div>

          <!-- AI工作台（4类型）详情：完全使用四个左侧页面的展示结构（仅保留必要模块） -->
          <template v-if="isAiFashionStudioAssetsDetail">

            <template v-if="detailModule === 'sketchToReal'">
              <div class="section-title">线稿图</div>
              <div v-if="requestParams" class="video-thumb-row">
                <img v-for="(item, idx) in requestParams.imageUrls" :key="`sketch-${idx}`" :src="item" />
              </div>
            </template>

            <template v-if="detailModule === 'realToSketch'">
              <div class="section-title">实物图</div>
              <div v-if="requestParams" class="video-thumb-row">
                <img v-for="(item, idx) in requestParams.imageUrls" :key="`real-${idx}`" :src="item" />
              </div>
            </template>

            <template v-if="detailModule === 'fabricCreative'">
              <div class="section-title">面料图</div>
              <div v-if="requestParams" class="video-thumb-row">
                <img v-for="(item, idx) in requestParams.imageUrls" :key="`fabric-${idx}`" :src="item" />
              </div>
            </template>

            <!-- 款型 / 类型 -->
            <div class="section-title">款型</div>
            <div class="param-input">
              {{ requestParams?.category ? `${requestParams?.category || ''}-${requestParams?.clothType ||
                ''}-${requestParams?.subKind || ''}`
                : '—' }}
            </div>

            <!-- AI服装设计：设计特征 -->
            <template v-if="detailModule === 'aiFashion' && Array.isArray(requestParams?.features)">
              <div class="section-title">设计特征</div>
              <div class="tag-row">
                <span v-for="(f, idx) in requestParams.features" :key="`${f}-${idx}`" class="tag">
                  {{ f }}
                </span>
              </div>
            </template>

            <!-- 线稿转实物：线稿类型/风格/生成图片类型 -->
            <template v-if="detailModule === 'sketchToReal'">
              <div class="section-title">线稿类型</div>
              <div class="tag-row">
                <span v-if="requestParams?.sketchType" class="tag">{{ requestParams.sketchType }}</span>
                <span v-else class="tag">—</span>
              </div>

              <div class="section-title">线稿风格</div>
              <div class="tag-row">
                <span v-if="requestParams?.sketchStyle" class="tag">{{ requestParams.sketchStyle }}</span>
                <span v-else class="tag">—</span>
              </div>

              <div class="section-title">生成图片类型</div>
              <div class="tag-row">
                <span v-if="requestParams?.outputType" class="tag">{{ requestParams.outputType }}</span>
                <span v-else class="tag">—</span>
              </div>
            </template>

            <!-- 实物转线稿：线稿生成类型/风格 -->
            <template v-if="detailModule === 'realToSketch'">
              <div class="section-title">线稿生成类型</div>
              <div class="tag-row">
                <span v-if="requestParams?.lineType" class="tag">{{ requestParams.lineType }}</span>
                <span v-else class="tag">—</span>
              </div>

              <div class="section-title">线稿生成风格</div>
              <div class="tag-row">
                <span v-if="requestParams?.lineStyle" class="tag">{{ requestParams.lineStyle }}</span>
                <span v-else class="tag">—</span>
              </div>
            </template>

            <!-- 面料创拍：生成图片类型 -->
            <template v-if="detailModule === 'fabricCreative'">
              <div class="section-title">生成图片类型</div>
              <div class="tag-row">
                <span v-if="requestParams?.outputType" class="tag">{{ requestParams.outputType }}</span>
                <span v-else class="tag">—</span>
              </div>
            </template>

            <template v-if="requestParams?.imageUrls?.length && detailModule == 'aiFashion'">
              <div class="section-title">参考图</div>
              <div v-if="requestParams && isAiFashionStudioAssetsDetail" class="video-thumb-row">
                <img v-for="(item, idx) in requestParams.imageUrls" :key="`ref-${idx}`" :src="item" />
              </div>
            </template>
          </template>

          <!-- 创意描述 -->
          <div v-if="creativeDescription" class="creative-description">
            <div class="flex-between">
              <div>创意描述</div>
              <img :src="images.copy" class="copy-icon" alt="" @click="copyDescription(creativeDescription)" />
            </div>
            <!-- 单个描述 -->
            <p v-if="creativeDescription" class="description-text">
              {{ creativeDescription }}
            </p>
          </div>

          <div v-if="modelParamTags.length" class="tag-row">
            <span v-for="(tag, idx) in modelParamTags" :key="`model-param-${idx}-${tag}`" class="params-tag">
              {{ tag }}
            </span>
            <span class="params-tag">{{ isVideoType(templateDetail) ? '视频' : '图片' }}</span>
          </div>
          <div v-if="templateDetail?.createTime" class="use-count">
            {{ templateDetail.createTime }}
          </div>
        </div>

        <!-- 操作按钮区 -->
        <div class="action-section">
          <div v-if="isImageType(templateDetail)" class="action-item">
            <div class="section-title">生成</div>
            <!-- <div class="flex-between"> -->
            <!-- <el-button class="action-btn" @click="handleAgainEdit">
                <img :src="images.againEdit" alt="" class="action-icon" />
                重新生成
              </el-button> -->
            <!-- :loading="isSubmittingAgain" -->
            <el-button class="action-btn" :disabled="isSubmittingAgain" @click="handleAgainGenerate">
              <img :src="images.againGenerate" alt="" class="action-icon" />
              再次生成
            </el-button>
            <!-- </div> -->
          </div>
        </div>
      </div>

      <!-- 右侧缩略图列表（统一组件 ThumbnailGallery） -->
      <ThumbnailGallery class="thumbnail-gallery" ref="thumbnailRef" :assets="thumbnailAssets"
        :current-index="selectedThumbnail" :has-more-data="hasMoreRelated" :loading="loadingRelated"
        @thumbnail-click="handleThumbnailGalleryClick" @load-more="loadMoreRelated" />
    </div>

    <!-- 反馈弹窗 -->
    <FeedbackModal v-if="templateDetail" v-model="showFeedbackModal" :user-id="userStore.userInfo?.userId"
      :algo-order-id="(templateDetail as any)?.algoOrderId"
      :algo-order-result-id="templateDetail?.id || (templateDetail as any)?.algoOrderResultId"
      @success="handleFeedbackSuccess" />

    <!-- 会员购买弹窗 -->
    <MembershipModal :show="showCoinInsufficient" :error-type="coinErrorType" :is-vip="isUserVip"
      @close="handleCoinInsufficientClose" @success="handleMembershipPurchaseSuccess" />

    <!-- 图片预览 - 使用 Element Plus ImageViewer -->
    <el-image-viewer v-if="showImagePreview" :url-list="previewImageList" :initial-index="previewInitialIndex"
      :hide-on-click-modal="true" @close="handlePreviewClose" />
  </div>
</template>

<script setup lang="ts">
// Vue API 已自动导入
import { images } from '@/assets'
import { ElMessage, ElMessageBox, ElImageViewer } from 'element-plus'
import { ArrowLeft, Loading } from '@element-plus/icons-vue'
import ThumbnailGallery from '@/components/ThumbnailGallery.vue'
import type { CreationResult } from '@/composables/useTaskPolling'
import { algoApi } from '@/api/algo'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import { useUserStore } from '@/stores/user'
import { useTemplateStore } from '@/stores/template'
import { useModalStore } from '@/stores/modal'
import { watermarkDownloader } from '@/utils/WatermarkDownloader'
import type { CreativeTemplate } from '@/types'
import { copyToClipboard } from '@/utils/clipboard'
import { APP_MENU_CODES } from '@/constants/appMenuCode'

// Props 定义（支持弹窗模式）
interface Props {
  id?: string | number
  cateId?: string
  cateTitle?: string
  collectId?: string
  // 是否是弹窗模式
  isModal?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  id: undefined,
  cateId: undefined,
  cateTitle: undefined,
  collectId: undefined,
  isModal: false,
})

// Emits 定义
const emit = defineEmits<{
  close: []
  delete: [assetId: string | number]
  likeChanged: [detail: CreativeTemplate | null]
}>()

// 路由相关（仅在非弹窗模式使用）
const route = useRoute()
const router = useRouter()

// 用户store
const userStore = useUserStore()
const templateStore = useTemplateStore()
const modalStore = useModalStore()

// 响应式数据
const templateDetail = ref<CreativeTemplate | null>(null)
const relatedTemplates = ref<CreativeTemplate[]>([])
const selectedThumbnail = ref(0)
const previousThumbnailIndex = ref(-1)
const thumbnailRef = ref<any>(null)
const mediaContainerRef = ref<HTMLElement>()
const mediaPlayerRefs = ref<any[]>([]) // MediaPlayer 组件引用数组
const cateTitleRef = ref('')
const showBrandWatermarkModal = ref(false) // 品牌水印弹窗显示状态
const showImagePreview = ref(false) // 图片预览显示状态
const previewImageList = ref<string[]>([]) // 预览图片列表
const previewInitialIndex = ref(0) // 预览初始索引
const showFeedbackModal = ref(false) // 反馈弹窗显示状态

const showCoinInsufficient = ref(false) // 会员购买弹窗
const coinErrorType = ref('up_vip') // 错误类型
const isDownloading = ref(false) // 下载状态
const isSubmittingAgain = ref(false) // 再次生成提交状态
const isUserVip = computed(() => Number(userStore.userInfo?.vipLevel ?? 0) > 0)
const isUnmountedRef = ref(false)

const removeWatermarkEnabled = computed(() => {
  // 仅会员才展示“去除水印”开启状态；避免会员到期仍回显旧的 watermarkStatus=1
  return isUserVip.value && userStore.userInfo?.watermarkStatus === 1 ? true : false
})

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

// 购买会员成功后的待处理操作
type PendingAction = { type: 'download' } | { type: 'toggle' } | { type: 'brandWatermark' }
const pendingAfterVipAction = ref<PendingAction | null>(null)

// 是否初始加载（用于控制滚动行为）
const isInitialLoad = ref(true)

// 详情状态（0初始化 1待请求 2处理中 3完成 4失败）
const detailStatus = computed(() => {
  const current = relatedTemplates.value[selectedThumbnail.value] as any
  const s = Number(current?.status ?? (templateDetail.value as any)?.status)
  return Number.isFinite(s) ? s : 3
})

// 右侧详情面板状态优先跟随当前选中缩略图，避免“左侧已切到生成中，但右侧仍显示旧完成态”
watch(
  [selectedThumbnail, relatedTemplates],
  () => {
    const current = relatedTemplates.value[selectedThumbnail.value] as any
    if (!current) return
    const status = Number(current?.status)
    // 右侧详情面板始终跟随当前选中缩略图更新，避免从“生成中(status=2/1)”切到“完成(status=3)”后仍展示旧状态
    templateDetail.value = { ...current } as any

    // 如果当前选中项仍在生成中，则启动轮询，确保列表成功后详情也能刷新出结果
    if (status === 1 || status === 2) {
      const orderNoCandidate = String(current?.algoOrderId ?? current?.algoOrderNo ?? current?.id ?? '').trim()
      if (orderNoCandidate) {
        startPollingGenerateResult(orderNoCandidate, {
          successText: '生成完成',
          failText: '生成失败',
          timeoutText: '生成超时，请稍后在“我的创作”中查看',
        })
      }
    }
  },
  { deep: true }
)

// 详情是否属于 AI 工作台四模块（以详情返回的 menuCode 为准）
const isAiFashionStudioAssetsDetail = computed(() => {
  const menuCode = String((templateDetail.value as any)?.menuCode || '')
  return (
    menuCode === APP_MENU_CODES.AI_FASHION_DESIGN ||
    menuCode === APP_MENU_CODES.LINE_DRAW_TO_PHYS_OBJ ||
    menuCode === APP_MENU_CODES.PHYS_OBJ_TO_LINE_DRAW ||
    menuCode === APP_MENU_CODES.FABRIC_DESIGN_CONCEPT
  )
})

// AI 工作台详情模块名（固定 4 类型）
const studioModuleName = computed(() => {
  const map: Record<DetailModule, string> = {
    aiFashion: 'AI服装设计',
    sketchToReal: '线稿转实物',
    realToSketch: '实物转线稿',
    fabricCreative: '面料创拍',
  }
  return map[detailModule.value]
})

// 缩略图组件数据：将 relatedTemplates 映射成统一的“创作（算法结果）”结构（ThumbnailGallery 使用）
const thumbnailAssets = computed<CreationResult[]>(() => {
  return (relatedTemplates.value || []) as unknown as CreationResult[]
})

const relatedPageParams = ref({
  current: 1,
  size: 20,
})

const hasMoreRelated = ref(true)
const loadingRelated = ref(false)
// 数据是否已初始化完成（用于避免初始渲染时的闪烁）
const isDataReady = ref(false)

const getAlgoResultId = (item: any): string | number | null => {
  if (!item) return null
  return item.id ?? null
}

// 统一参数：只使用详情接口 webRequest 字段
const requestParams = computed(() => {
  const d: any = templateDetail.value
  if (!d) return null

  const res: any = {}

  const wrRaw = d?.webRequest
  let src: any = null
  if (wrRaw && typeof wrRaw === 'object') {
    src = wrRaw
  } else if (typeof wrRaw === 'string') {
    try {
      src = JSON.parse(wrRaw)
    } catch (e) {
      console.warn('[CreativeDetail] 解析 webRequest 失败:', e)
      src = null
    }
  }
  if (!src) return res

  // 创意描述
  res.creativeDescription = String(src.creativeDescription ?? '')

  // 参考图：只取 webRequest.image（数组）
  res.imageUrls = src.image

  // aiFashion：ai服装设计-创作款型
  if (Array.isArray(src.creationStyleParams)) {
    const values = src.creationStyleParams.map((x: any) => String(x?.content ?? '').trim()).filter(Boolean)
    res.category = values?.[0] || ''
    res.clothType = values?.[1] || ''
    res.subKind = values?.[3] || ''
  }
  // 实物转线稿：款型与提交字段 garmentStyleParams 一致（getInspirationWords typeCode=garment_style）
  if (Array.isArray(src.garmentStyleParams)) {
    const values = src.garmentStyleParams.map((x: any) => String(x?.content ?? '').trim()).filter(Boolean)
    if (values.length) {
      res.category = values?.[0] || ''
      res.clothType = values?.[1] || ''
      res.subKind = values?.[3] || ''
    }
  }
  // aiFashion：ai服装设计-设计特征
  if (Array.isArray(src.designFeaturesParams)) {
    res.features = src.designFeaturesParams.map((x: any) => String(x?.content ?? '').trim()).filter(Boolean)
  }

  // sketchToReal：线稿转实物-线稿类型
  if (Array.isArray(src.sketchTypeParams)) {
    const values = src.sketchTypeParams.map((x: any) => String(x?.content ?? '').trim()).filter(Boolean)
    res.sketchType = values?.[0] || ''
  }

  // sketchToReal：线稿转实物-线稿风格
  if (Array.isArray(src.sketchStyleParams)) {
    const values = src.sketchStyleParams.map((x: any) => String(x?.content ?? '').trim()).filter(Boolean)
    res.sketchStyle = values?.[0] || ''
  }

  // sketchToReal：线稿转实物-图片类型
  if (Array.isArray(src.imageTypeParams)) {
    const values = src.imageTypeParams.map((x: any) => String(x?.content ?? '').trim()).filter(Boolean)
    // 详情页里“生成图片类型”字段名是 outputType
    res.outputType = values?.[0] || ''
  }

  // 兼容：历史数据曾出现三项串位（模特图/平铺图/3D图 应属 outputType；黑白/彩色 属线稿类型；轮廓/手绘 属线稿风格）
  if (res.sketchType || res.sketchStyle || res.outputType) {
    const isOutputType = (v: string) => Boolean(v) && v.includes('图') && !v.includes('线稿')
    const isSketchType = (v: string) => Boolean(v) && (v.includes('黑白') || v.includes('彩色'))
    const isSketchStyle = (v: string) => Boolean(v) && (v.includes('轮廓') || v.includes('手绘'))

    const a = String(res.sketchType || '')
    const b = String(res.sketchStyle || '')
    const c = String(res.outputType || '')

    // 优先按内容识别归位
    const next: any = { sketchType: res.sketchType, sketchStyle: res.sketchStyle, outputType: res.outputType }
    const candidates = [a, b, c].filter(Boolean)

    const out = candidates.find(isOutputType) || ''
    const typ = candidates.find(isSketchType) || ''
    const sty = candidates.find(isSketchStyle) || ''

    // 只有在识别到至少一项且与现有字段明显不符时才改（避免影响已正确的数据）
    if (
      (out && out !== c) ||
      (typ && typ !== a) ||
      (sty && sty !== b)
    ) {
      next.outputType = out || c
      next.sketchType = typ || a
      next.sketchStyle = sty || b
      res.outputType = next.outputType
      res.sketchType = next.sketchType
      res.sketchStyle = next.sketchStyle
    }
  }

  // realToSketch：实物转线稿-线稿生成类型
  if (Array.isArray(src.sketchGenerationTypeParams)) {
    const values = src.sketchGenerationTypeParams.map((x: any) => String(x?.content ?? '').trim()).filter(Boolean)
    res.lineType = values?.[0] || ''
  }

  // realToSketch：实物转线稿-线稿生成风格
  if (Array.isArray(src.sketchGenerationStyleParams)) {
    const values = src.sketchGenerationStyleParams.map((x: any) => String(x?.content ?? '').trim()).filter(Boolean)
    res.lineStyle = values?.[0] || ''
  }

  // fabricCreative：模板里使用 outputType（由 imageTypeParams 映射）

  return res
})

// 左侧大图/预览：展示“生成结果输出图/视频”
const getLeftImagePreviewUrl = (_index: number, item: any): string => {
  // 图片预览：只用接口 url
  return String(item?.url || '')
}

// 统一判断是否为视频类型（创作详情页仅使用 fileType）
const isVideoType = (item: any): boolean => {
  if (!item) return false

  // fileType: 2 视频 / 4 音视频
  const ft = Number(item.fileType)
  return ft === 2 || ft === 4
}

// 统一判断是否为“封面图模式”（非视频则走 poster）
const isImageType = (item: any): boolean => {
  return !isVideoType(item)
}

// 详情所属模块：AI服装设计三模块 + 面料创拍一模块（用于“重新生成/再次生成”跳转）
type DetailModule = 'aiFashion' | 'sketchToReal' | 'realToSketch' | 'fabricCreative'

// 详情所属模块：AI服装设计三模块 + 面料创拍一模块（用于“重新生成/再次生成”跳转）
const detailModule = computed<DetailModule>(() => {
  if (!templateDetail.value) return 'aiFashion'

  const menuCode = String((templateDetail.value as any)?.menuCode || '')
  if (menuCode === APP_MENU_CODES.AI_FASHION_DESIGN) return 'aiFashion'
  if (menuCode === APP_MENU_CODES.LINE_DRAW_TO_PHYS_OBJ) return 'sketchToReal'
  if (menuCode === APP_MENU_CODES.PHYS_OBJ_TO_LINE_DRAW) return 'realToSketch'
  if (menuCode === APP_MENU_CODES.FABRIC_DESIGN_CONCEPT) return 'fabricCreative'

  return 'aiFashion'
})

// 重新生成：跳转到 AiFashionStudio 对应模块，并带上当前详情图
// const handleAgainEdit = () => {
//   router.push({
//     name: 'AiFashionStudio',
//     query: {
//       mode: detailModule.value,
//       refImageUrl: url,
//       taskResultId: String((templateDetail.value as any)?.id ?? ''),
//       from: 'detail',
//       action: 'againEdit',
//     },
//   })
// }

// 再次生成：同上（预留 action 让目标页后续可区分不同入口）
const handleAgainGenerate = async () => {
  if (isSubmittingAgain.value) return
  const d: any = templateDetail.value
  if (!d) {
    ElMessage.warning('详情数据不存在')
    return
  }

  const wrRaw = d?.webRequest
  let payload: any = null
  if (wrRaw && typeof wrRaw === 'object') {
    payload = wrRaw
  } else if (typeof wrRaw === 'string') {
    try {
      payload = JSON.parse(wrRaw)
    } catch (e) {
      console.warn('[handleAgainGenerate] 解析 webRequest 失败:', e)
      payload = null
    }
  }

  if (!payload || typeof payload !== 'object') {
    ElMessage.warning('缺少可提交的 webRequest 参数')
    return
  }

  try {
    isSubmittingAgain.value = true
    const resp = await algoApi.submit(payload as any)
    if ((resp as any)?.code === '0000') {
      const data = (resp as any)?.data
      const orderNo = String(
        (typeof data === 'string' || typeof data === 'number'
          ? data
          : data?.orderNo ?? data?.algoOrderNo ?? data?.algoOrderId ?? '') || ''
      )
      if (!orderNo) {
        ElMessage.warning('提交成功，但未返回任务编号')
        return
      }
      ElMessage.success('已提交再次生成任务，正在生成中')
      prependGeneratingPlaceholder(orderNo, payload)
      await pollAgainGenerateResult(orderNo)
      return
    }
    ElMessage.error((resp as any)?.msg || '再次生成提交失败')
  } catch (error) {
    console.error('[handleAgainGenerate] submit failed:', error)
    ElMessage.error('再次生成提交失败，请稍后重试')
  } finally {
    isSubmittingAgain.value = false
  }
}

const sleep = (ms: number) => new Promise<void>((resolve) => window.setTimeout(resolve, ms))

const prependGeneratingPlaceholder = (orderNo: string, payload: any) => {
  const now = new Date().toISOString()
  const placeholder: any = {
    id: `pending-${orderNo}`,
    algoOrderId: orderNo,
    menuCode: String((templateDetail.value as any)?.menuCode || ''),
    fileType: Number((templateDetail.value as any)?.fileType ?? 1),
    status: 2,
    prompt: String(payload?.creativeDescription ?? creativeDescription.value ?? '生成中...'),
    createTime: now,
    url: '',
    thumbUrl: '',
    originalUrl: '',
    collectStatus: 0,
  }

  const existed = relatedTemplates.value.findIndex(
    (x: any) => String(x?.algoOrderId || '') === String(orderNo) || String(x?.id || '') === String(placeholder.id)
  )
  if (existed >= 0) {
    relatedTemplates.value[existed] = { ...(relatedTemplates.value[existed] as any), ...placeholder }
  } else {
    relatedTemplates.value = [placeholder, ...relatedTemplates.value] as any[]
  }

  selectedThumbnail.value = 0
  previousThumbnailIndex.value = 0
  templateDetail.value = { ...placeholder } as any
  nextTick(() => syncMediaContainerToSelected(true))
}

const patchAgainGeneratePlaceholder = (orderNo: string, patch: Record<string, any>) => {
  const idx = relatedTemplates.value.findIndex(
    (x: any) => String(x?.algoOrderId || '') === String(orderNo) || String(x?.id || '') === `pending-${orderNo}`
  )
  if (idx < 0) return
  relatedTemplates.value[idx] = {
    ...(relatedTemplates.value[idx] as any),
    ...patch,
    algoOrderId: String((relatedTemplates.value[idx] as any)?.algoOrderId || orderNo),
  } as any

  if (selectedThumbnail.value === idx) {
    templateDetail.value = { ...(relatedTemplates.value[idx] as any) }
  }
}

const prependGeneratedResults = (records: any[], orderNo?: string) => {
  if (!Array.isArray(records) || records.length === 0) return null
  const normalized = records
    .map((item: any) => {
      const id = getAlgoResultId(item)
      return {
        ...item,
        id: id != null ? String(id) : '',
      }
    })
    .filter((item: any) => !!item?.id)

  if (normalized.length === 0) return null

  const idSet = new Set(normalized.map((x: any) => String(x.id)))
  const merged = [
    ...normalized,
    ...relatedTemplates.value.filter((x: any) => {
      const sameId = idSet.has(String(x?.id))
      const sameOrderPlaceholder =
        !!orderNo &&
        Number((x as any)?.status) === 2 &&
        String((x as any)?.algoOrderId || '') === String(orderNo)
      return !sameId && !sameOrderPlaceholder
    }),
  ]
  relatedTemplates.value = merged as any[]

  const first = normalized[0]
  selectedThumbnail.value = 0
  previousThumbnailIndex.value = 0
  templateDetail.value = { ...first } as any
  nextTick(() => syncMediaContainerToSelected(true))
  return first
}

// 防止同一个 orderNo 在详情页被重复轮询（例如滚动/重复触发 loadTemplateDetail）
const pollingOrderNoSet = new Set<string>()

const pollAgainGenerateResult = async (
  orderNo: string,
  opts?: {
    successText?: string
    failText?: string
    timeoutText?: string
    noResultText?: string
  },
) => {
  const successText = opts?.successText ?? '再次生成完成'
  const failText = opts?.failText ?? '再次生成失败'
  const timeoutText = opts?.timeoutText ?? '再次生成超时，请稍后在列表查看'
  const noResultText = opts?.noResultText ?? '生成完成，但未返回结果'

  const maxPolls = 120
  const intervalMs = 3000

  for (let i = 0; i < maxPolls; i++) {
    if (isUnmountedRef.value) return
    try {
      const queryResp = await algoApi.query({ orderNo })
      if ((queryResp as any)?.code !== '0000' || !(queryResp as any)?.data) {
        await sleep(intervalMs)
        continue
      }
      const data: any = (queryResp as any).data
      const status = Number(data?.status)
      const orderResultVOS = Array.isArray(data?.orderResultVOS) ? data.orderResultVOS : []

      // 1未开始 2进行中 3完成 4失败
      if (status === 3) {
        const first = prependGeneratedResults(orderResultVOS, orderNo)
        if (!first) {
          ElMessage.warning(noResultText)
          return
        }
        const firstId = getAlgoResultId(first)
        if (firstId) {
          await loadDetailOnce(firstId)
        }
        // 生成成功后刷新一次服务端列表，确保新增结果和列表数据一致
        const snapshotList = [...relatedTemplates.value] as any[]
        const snapshotSelected = selectedThumbnail.value
        const snapshotDetail = templateDetail.value ? { ...(templateDetail.value as any) } : null
        await loadRelatedTemplates(true)
        // 防御：若刷新异常导致列表被清空，回滚到刷新前，避免页面“全没了”
        if (!relatedTemplates.value.length) {
          relatedTemplates.value = snapshotList as any[]
          selectedThumbnail.value = Math.max(0, Math.min(snapshotSelected, relatedTemplates.value.length - 1))
          templateDetail.value = snapshotDetail as any
          nextTick(() => syncMediaContainerToSelected(true))
        }
        ElMessage.success(successText)
        return
      }

      if (status === 4) {
        // 失败时把顶部占位卡切换为失败态，便于查看失败样式
        patchAgainGeneratePlaceholder(orderNo, {
          status: 4,
          prompt: '生成失败',
          thumbUrl: '',
          url: '',
          originalUrl: '',
        })
        selectedThumbnail.value = 0
        previousThumbnailIndex.value = 0
        const top = relatedTemplates.value[0] as any
        if (top) templateDetail.value = { ...top }
        nextTick(() => syncMediaContainerToSelected(true))
        ElMessage.error(failText)
        return
      }
    } catch (error) {
      console.error('[pollAgainGenerateResult] query failed:', error)
    }
    await sleep(intervalMs)
  }

  ElMessage.warning(timeoutText)
}

const startPollingGenerateResult = (
  orderNo: string,
  opts?: {
    successText?: string
    failText?: string
    timeoutText?: string
    noResultText?: string
  },
) => {
  const key = String(orderNo ?? '')
  if (!key) return
  if (pollingOrderNoSet.has(key)) return
  pollingOrderNoSet.add(key)
  void pollAgainGenerateResult(key, opts).finally(() => {
    pollingOrderNoSet.delete(key)
  })
}

// 获取创意描述文本：灵感词(inspirationWordsParams[].content) + creativeDescription
const creativeDescription = computed(() => {
  const d: any = templateDetail.value
  if (!d) return ''

  const wrRaw = d?.webRequest
  let wr: any = null
  if (wrRaw && typeof wrRaw === 'object') {
    wr = wrRaw
  } else if (typeof wrRaw === 'string') {
    try {
      wr = JSON.parse(wrRaw)
    } catch {
      wr = null
    }
  }
  if (!wr) return ''

  const words = Array.isArray(wr.inspirationWordsParams)
    ? wr.inspirationWordsParams
      .map((x: any) => String(x?.content ?? '').trim())
      .filter(Boolean)
    : []
  const creative = String(wr.creativeDescription ?? '').trim()

  return [...words, creative].filter(Boolean).join(' ')
})

// 模型参数展示：优先使用详情接口 webRequest 中的模型信息
// - 模型名：modelConfigName
// - 参数项：templateParams[*].modelConfigTemplateName
const modelParamTags = computed<string[]>(() => {
  const d: any = templateDetail.value
  if (!d) return []

  const wrRaw = d?.webRequest
  let wr: any = null
  if (wrRaw && typeof wrRaw === 'object') {
    wr = wrRaw
  } else if (typeof wrRaw === 'string') {
    try {
      wr = JSON.parse(wrRaw)
    } catch {
      wr = null
    }
  }

  const src = wr || requestParams.value || d
  const tags: string[] = []

  const modelName = String(src?.modelConfigName ?? d?.modelConfigName ?? '').trim()
  if (modelName) tags.push(modelName)

  const templateParams = Array.isArray(src?.templateParams) ? src.templateParams : []
  templateParams.forEach((item: any) => {
    const name = String(item?.modelConfigTemplateName ?? '').trim()
    if (name) tags.push(name)
  })

  return Array.from(new Set(tags))
})

// 详情请求并发控制：
// - detailRequestToken: 每次发起详情请求递增，用于丢弃过期响应（用户快速切换缩略图时）
// - currentDetailTargetId: 当前“应该展示”的详情 id
const detailRequestToken = ref(0)
const currentDetailTargetId = ref<string | number | null>(null)

// 获取详情数据（固定调用 getAlgoResultDetails）
const loadTemplateDetail = async (
  id?: string | number,
  options?: { token: number; expectedId?: string | number },
) => {
  if (!id) return

  const myToken = options?.token
  const expectedId = options?.expectedId ?? id
  // 丢弃过期请求：防止接口返回乱序覆盖当前选中项
  if (myToken != null && myToken !== detailRequestToken.value) return
  if (
    expectedId != null &&
    currentDetailTargetId.value != null &&
    String(expectedId) !== String(currentDetailTargetId.value)
  )
    return

  // 1) 先用缓存/列表项兜底渲染
  // 2) 再请求 /api/v1/algo/getAlgoResultDetails 补全右侧展示字段
  const fallback = relatedTemplates.value.find((x: any) => String(x?.id) === String(id)) as any
  if (fallback) {
    templateDetail.value = {
      ...(templateDetail.value || ({} as any)),
      ...fallback,
    }
  } else {
    templateDetail.value = null
  }

  // 进行中/失败：不调用详情接口（右侧直接使用列表项展示）
  if (!shouldFetchDetailForId(id)) {
    // 只有最新请求才更新“已加载标记”
    if (myToken != null && myToken === detailRequestToken.value) {
      lastLoadedDetailId.value = expectedId
    }

    // 当前展示项如果是“生成中”，需要轮询 orderNo，
    // 否则列表生成成功后详情页不会自动刷新 requestParams 展示。
    const target = relatedTemplates.value.find((x: any) => String(x?.id) === String(id)) as any
    const status = Number(target?.status)
    if (myToken != null && myToken === detailRequestToken.value && (status === 1 || status === 2)) {
      const orderNo = String(target?.algoOrderId ?? target?.id ?? expectedId ?? '')
      startPollingGenerateResult(orderNo, {
        successText: '生成完成',
        failText: '生成失败',
        timeoutText: '生成超时，请稍后在“我的创作”中查看',
      })
    }
    return
  }

  try {
    const algoResulId = String(id)
    const response = await algoApi.getAlgoResultDetails({ algoResulId })
    const detailData = (response as any)?.data ?? response

    // 二次校验：请求过程中可能已经切换到别的 item
    if (myToken != null && myToken !== detailRequestToken.value) return
    if (
      expectedId != null &&
      currentDetailTargetId.value != null &&
      String(expectedId) !== String(currentDetailTargetId.value)
    )
      return

    // 回填到当前详情
    templateDetail.value = {
      ...(templateDetail.value || ({} as any)),
      ...(detailData as any),
    }

    // 同步回写到缩略图列表对应项（避免左右不一致）
    const idx = relatedTemplates.value.findIndex((x: any) => String(x?.id) === algoResulId)
    if (idx >= 0) {
      relatedTemplates.value[idx] = {
        ...(relatedTemplates.value[idx] as any),
        ...(detailData as any),
      }
    }

    lastLoadedDetailId.value = expectedId
  } catch (e) {
    // 详情拉取失败：保留兜底缓存渲染，避免页面空白
    console.warn('[CreativeDetail] getAlgoResultDetails failed:', e)
    if (myToken != null && myToken === detailRequestToken.value) {
      lastLoadedDetailId.value = expectedId
    }
  }
}

// 获取相关创作结果列表（调用 /v1/algo/queryAlgoResultPage）
const loadRelatedTemplates = async (isRefresh = false) => {
  if (loadingRelated.value) return

  const d: any = templateDetail.value
  // 列表筛选优先使用路由/缓存里传入的一级 modeCode，避免误用详情里的二级 menuCode
  const modeCodeFromQuery = String(route.query.modeCode || '').trim()
  const modeCodeFromCache = String(templateStore.getTemplateListData()?.modeCode || '').trim()
  const menuCode = String(modeCodeFromQuery || modeCodeFromCache || d?.menuCode || '').trim()
  if (!menuCode) {
    console.warn('[loadRelatedTemplates] 缺少 menuCode，跳过列表请求')
    return
  }

  const requestPage = isRefresh ? 1 : relatedPageParams.value.current

  try {
    loadingRelated.value = true
    const params = {
      menuCode,
      fileType: '', // 1图片 2视频 3音频 4音视频 空是全部的意思
      collectStatus: '', // 0未收藏 1已收藏（不筛选时按后端约定调整） 空是全部的意思
      currentPage: requestPage,
      pageSize: relatedPageParams.value.size,
    }
    const resp = await algoApi.queryAlgoResultPage(params)
    if (resp.code !== '0000' || !resp.data) {
      console.warn('[loadRelatedTemplates] queryAlgoResultPage 响应异常:', resp)
      return
    }

    const data: any = resp.data || {}
    const rawList = Array.isArray(data?.list) ? data.list : []
    const total = Number(data?.total ?? data?.totalCount ?? rawList.length ?? 0)

    let processed = (rawList as any[])
      .map((item) => {
        const normalizedId = getAlgoResultId(item)
        return {
          ...item,
          id: normalizedId != null ? String(normalizedId) : item?.id,
        }
      })
      .filter((x) => !!x?.id)

    if (isRefresh) {
      // 首次刷新：确保当前详情这条记录在列表中且排在第一位，避免刷新后大图指向其他记录导致“黑屏”
      const currentId = templateDetail.value ? String(getAlgoResultId(templateDetail.value as any)) : ''
      if (currentId) {
        const idx = processed.findIndex((x: any) => String(x.id) === currentId)
        if (idx >= 0) {
          const currentItem = processed[idx]
          processed = [currentItem, ...processed.slice(0, idx), ...processed.slice(idx + 1)]
        } else {
          processed = [templateDetail.value as any, ...processed]
        }
        selectedThumbnail.value = 0
      }

      relatedTemplates.value = processed as any[]
      relatedPageParams.value.current = 1
      hasMoreRelated.value = true
    } else {
      relatedTemplates.value = [...relatedTemplates.value, ...processed] as any[]
    }

    const currentTotal = relatedTemplates.value.length
    hasMoreRelated.value = currentTotal < Number(total || 0)
    if (hasMoreRelated.value) {
      relatedPageParams.value.current += 1
    }
  } catch (error) {
    console.error('[loadRelatedTemplates] 获取相关列表失败:', error)
  } finally {
    loadingRelated.value = false
  }
}

// 加载更多（供右侧缩略图滚动触底触发）
const loadMoreRelated = async () => {
  if (!hasMoreRelated.value || loadingRelated.value) return
  relatedPageParams.value.current++
  await loadRelatedTemplates(false)
}

// 设置 MediaPlayer ref
const setMediaPlayerRef = (el: any, index: number) => {
  if (el) {
    mediaPlayerRefs.value[index] = el
  }
}

// 统一缩略图组件点击：转发到现有 selectThumbnail 逻辑
const handleThumbnailGalleryClick = (index: number) => {
  const item = relatedTemplates.value[index]
  if (!item) return
  selectThumbnail(index, item)
}

// 选择缩略图
const selectThumbnail = async (index: number, template: CreativeTemplate) => {
  // 设置标志：表示是用户主动点击触发的（必须在最开始设置，防止滚动事件提前触发）
  isUserClickingThumbnail.value = true
  clickingTargetIndex.value = index
  scrollSyncResumeAt.value = Date.now() + 600
  suppressScrollDetailLoadUntil.value = Date.now() + 1200
  // 取消滚动停顿触发的详情请求，避免“刚滚动完 + 立刻点击”产生多次详情请求
  clearScrollDetailTimer()
  // 保留旧选中索引：用于计算滚动完成等待时间
  const fromIndex = previousThumbnailIndex.value

  // 验证索引有效性
  if (index < 0 || index >= relatedTemplates.value.length) {
    console.warn('[selectThumbnail] 无效的索引:', index, '列表长度:', relatedTemplates.value.length)
    isUserClickingThumbnail.value = false
    clickingTargetIndex.value = null
    return
  }

  // 如果上一个选中的是视频，先暂停视频播放
  if (
    previousThumbnailIndex.value >= 0 &&
    previousThumbnailIndex.value < relatedTemplates.value.length
  ) {
    const previousTemplate = relatedTemplates.value[previousThumbnailIndex.value]
    if (isVideoType(previousTemplate)) {
      // 如果是视频类型，暂停播放
      const previousPlayer = mediaPlayerRefs.value[previousThumbnailIndex.value]
      if (previousPlayer && typeof previousPlayer.pause === 'function') {
        previousPlayer.pause()
      }
    }
  }

  // 更新当前选中的缩略图
  selectedThumbnail.value = index

  // 使用 relatedTemplates 中的数据更新显示（确保数据一致性）
  const currentTemplate = relatedTemplates.value[index]
  if (currentTemplate) {
    // 立即使用列表数据更新显示，确保页面不会空白
    templateDetail.value = { ...currentTemplate }
    // 更新 previousThumbnailIndex，确保后续逻辑正确
    previousThumbnailIndex.value = index
  } else {
    // 如果列表中没有数据，使用传入的 template 作为兜底
    templateDetail.value = template
    previousThumbnailIndex.value = index
    console.warn('[selectThumbnail] 列表中没有找到对应索引的数据，使用传入的 template')
  }

  // 立即调用详情接口获取完整数据（不等待滚动完成）
  const currentId = getAlgoResultId(currentTemplate) ?? getAlgoResultId(template)
  if (currentId) {
    // 异步加载详情，不阻塞滚动
    loadDetailOnce(currentId).catch((err) => {
      console.error('[selectThumbnail] 加载详情失败:', err)
      // 即使加载失败，也要确保页面显示基本数据
      if (!templateDetail.value) {
        templateDetail.value = currentTemplate || template
      }
    })
  }

  // 使用 requestAnimationFrame 确保标志已经生效，然后再触发滚动
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      // 双重 requestAnimationFrame 确保在下一个渲染周期执行
      // 点击后立即对齐滚动位置，避免 smooth 滚动过程中滚动监听把选中态“改回去”
      syncMediaContainerToSelected(true)

      // 标志短暂保持：阻止滚动监听在“点击对齐”期间覆盖选中态/详情
      const delay = 300

      setTimeout(() => {
        // 延迟重置标志，确保滚动事件处理完成
        isUserClickingThumbnail.value = false
        clickingTargetIndex.value = null
        console.log('[缩略图点击] 标志已重置，允许滚动触发详情加载')
      }, delay)
    })
  })

  console.log('缩略图切换:', {
    from: fromIndex,
    to: index,
    currentTemplate: currentTemplate || template,
    templateType: isVideoType(currentTemplate || template) ? '视频' : '图片',
  })
}

// 返回上一页
const handleBack = () => {
  if (props.isModal) {
    emit('close')
  } else {
    router.back()
  }
}

// 复制描述
const copyDescription = async (text?: string) => {
  const textToCopy = text || creativeDescription.value
  if (!textToCopy) {
    ElMessage.warning('暂无可复制的描述')
    return
  }
  const success = await copyToClipboard(textToCopy)
  if (success) {
    ElMessage.success('复制成功')
  } else {
    ElMessage.error('复制失败，请重试')
  }
}

// 图片预览 - 点击图片放大预览
const handleImagePreview = (_index: number, item: any) => {
  // 只有图片类型才支持预览
  if (isVideoType(item)) {
    return // 视频不预览
  }

  // 获取当前图片URL
  const imageUrl = getLeftImagePreviewUrl(_index, item)
  if (!imageUrl) {
    ElMessage.warning('图片地址不存在')
    return
  }

  // 收集所有图片类型的URL用于预览列表
  const imageUrls = relatedTemplates.value
    .filter((t) => isImageType(t)) // 只包含图片类型
    .map((t) => (t as any).url)
    .filter((url) => url) // 过滤空值

  // 如果当前图片不在列表中，添加到列表开头
  const currentIndex = imageUrls.findIndex((url) => url === imageUrl)
  if (currentIndex === -1) {
    imageUrls.unshift(imageUrl)
    previewInitialIndex.value = 0
  } else {
    previewInitialIndex.value = currentIndex
  }

  previewImageList.value = imageUrls.filter((url) => url !== undefined) as string[]
  showImagePreview.value = true
}

// 关闭预览
const handlePreviewClose = () => {
  showImagePreview.value = false
  previewImageList.value = []
  previewInitialIndex.value = 0
}

// 刷新用户信息（用于下载前检查会员状态）
const refreshUserInfoIfPossible = async () => {
  const phone = userStore.userInfo?.phone
  if (!phone) return
  try {
    await userStore.getUserInfo()
  } catch (e) {
    console.warn('[TemplateDetail] 刷新用户信息失败（忽略，继续走本地状态）:', e)
  }
}

// 获取“无水印链接”：优先使用最新接口字段 originalUrl
// - 只做本地取值，不再走旧接口（避免依赖 creative.ts 中的旧算法结果接口）
const ensureNoWatermarkUrlForAsset = async (asset: any): Promise<string | null> => {
  const originalUrl = asset?.originalUrl
  if (!originalUrl) return null
  return String(originalUrl)
}

// 处理下载菜单命令
const handleDownloadCommand = (command: string) => {
  if (command === 'download') {
    handleDownload()
  } else if (command === 'toggle-watermark') {
    // 点击整个按钮区域时切换开关状态
    handleWatermarkToggleChange(!removeWatermarkEnabled.value)
  }
}

// 处理去除水印开关变化
const handleWatermarkToggleChange = async (val: string | number | boolean) => {
  const enabled = val === true || val === 1 || val === '1' || val === 'true'
  // 只有尝试“开启去水印”时才需要校验会员是否还有效
  if (enabled) await refreshUserInfoIfPossible()
  // 只有“开启去水印”才需要会员；关闭去水印允许所有用户操作
  if (!isUserVip.value && enabled) {
    pendingAfterVipAction.value = { type: 'toggle' }
    showCoinInsufficient.value = true
    coinErrorType.value = 'up_vip'
    setLocalWatermarkStatus(false)
    return
  }

  // 如果是会员，检查是否需要显示责任声明
  const noRemind = localStorage.getItem('watermark_disclaimer_no_remind') === 'true'
  if (!noRemind && enabled) {
    // 显示责任声明弹窗
    pendingAfterVipAction.value = { type: 'toggle' }
    setLocalWatermarkStatus(false)
    modalStore.openWatermarkDisclaimerModalPage()
    return
  }

  // 更新状态并持久化（不需要弹窗的情况下）
  await persistWatermarkStatus(enabled)
}

// 处理会员购买弹窗关闭
const handleCoinInsufficientClose = () => {
  showCoinInsufficient.value = false
  pendingAfterVipAction.value = null
}

// 处理会员购买成功
const handleMembershipPurchaseSuccess = async () => {
  showCoinInsufficient.value = false
  // 刷新用户信息
  await refreshUserInfoIfPossible()
  // 继续之前的操作
  if (pendingAfterVipAction.value) {
    if (pendingAfterVipAction.value.type === 'download') {
      pendingAfterVipAction.value = null
      handleDownload()
    } else if (pendingAfterVipAction.value.type === 'toggle') {
      pendingAfterVipAction.value = null
      // 检查是否需要显示责任声明
      const noRemind = localStorage.getItem('watermark_disclaimer_no_remind') === 'true'
      if (!noRemind) {
        setLocalWatermarkStatus(false)
        modalStore.openWatermarkDisclaimerModalPage()
      } else {
        await persistWatermarkStatus(true)
      }
    } else if (pendingAfterVipAction.value.type === 'brandWatermark') {
      // 品牌水印入口购买成功后，自动打开品牌水印弹窗
      pendingAfterVipAction.value = null
      showBrandWatermarkModal.value = true
    }
  }
}

// 责任声明弹窗确认/取消：清理 pending，并在需要时继续执行
watch(
  () => modalStore.watermarkDisclaimerConfirmToken,
  () => {
    const pending = pendingAfterVipAction.value
    if (!pending) return

    if (pending.type === 'download') {
      pendingAfterVipAction.value = null
      handleDownload()
    } else if (pending.type === 'toggle') {
      pendingAfterVipAction.value = null
    }
  },
)

watch(
  () => modalStore.watermarkDisclaimerCancelToken,
  () => {
    pendingAfterVipAction.value = null
  },
)

// 下载/保存创作（参考创作列表的下载逻辑）
const handleDownload = async () => {
  if (!templateDetail.value) return

  if (isDownloading.value) return // 防止重复点击

  try {
    isDownloading.value = true
    // 优先使用最新映射后的缩略图数据（ThumbnailGallery 使用的字段：thumbUrl/url/originalUrl）
    const currentItemBase =
      selectedThumbnail.value >= 0 && selectedThumbnail.value < relatedTemplates.value.length
        ? relatedTemplates.value[selectedThumbnail.value]
        : templateDetail.value

    // 下载使用“生成结果”新字段（url/originalUrl），不要使用 webRequest 输入图字符串
    const currentItem = currentItemBase as any

    // 根据文件类型选择下载 URL（与创作列表逻辑一致）
    const isVideo = isVideoType(currentItem)

    // 详情页去除水印逻辑（仅创作详情生效）：
    const wantRemoveWatermark = removeWatermarkEnabled.value

    // 若用户尝试无水印下载：先刷新用户信息再判断是否会员/是否已过期
    if (wantRemoveWatermark) {
      await refreshUserInfoIfPossible()
      if (!isUserVip.value) {
        // 非会员/已过期：拦截无水印下载，提示开通会员
        pendingAfterVipAction.value = { type: 'download' }
        showCoinInsufficient.value = true
        coinErrorType.value = 'up_vip'
        ElMessage.warning('仅会员可去除水印，请开通会员')
        return
      }
    }

    let downloadUrl = currentItem.url

    // 如果需要去除水印，优先使用 originalUrl（无水印链接）
    if (wantRemoveWatermark && isUserVip.value) {
      const noWatermarkUrl = await ensureNoWatermarkUrlForAsset(currentItem)
      if (noWatermarkUrl) downloadUrl = noWatermarkUrl
    }

    console.log('[handleDownload] 下载信息:', {
      isVideo,
      selectedThumbnail: selectedThumbnail.value,
      currentItem,
      url: currentItem.url,
      originalUrl: currentItem.originalUrl,
      downloadUrl,
      relatedTemplatesLength: relatedTemplates.value.length,
    })

    if (!downloadUrl) {
      ElMessage.warning('文件地址无效')
      return
    }

    try {
      // 统一下载：只传 URL，文件名和后缀由 WatermarkDownloader 根据 URL 自动生成
      await watermarkDownloader.download(downloadUrl, { silent: false })
    } catch (err) {
      console.warn('[下载] 跨域或网络限制，使用跳转方式下载', err)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.target = '_blank'
      link.rel = 'noopener'
      // 兜底下载也不强行改后缀，交给浏览器和 URL 自己决定
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      ElMessage.info('已为你打开新标签页进行下载')
    }
  } catch (error) {
    console.error('[下载] 失败:', error)
    ElMessage.error('下载失败，请重试')
  } finally {
    isDownloading.value = false
  }
}

// 右侧缩略图滚动由统一组件 `ThumbnailGallery` 内部处理

// 标志：是否是用户主动点击缩略图触发的滚动（此时不应在滚动事件中加载详情）
const isUserClickingThumbnail = ref(false)
// 点击触发滚动期间锁定目标索引，避免滚动中间态引发选中错位
const clickingTargetIndex = ref<number | null>(null)
// 点击后的短暂保护期：忽略滚动事件对选中项/详情的反向覆盖
const scrollSyncResumeAt = ref(0)
// 点击跨大跨度切换（如首尾）后的请求保护期，避免滚动中间态触发大量详情请求
const suppressScrollDetailLoadUntil = ref(0)

// 滚动触发的详情加载定时器（避免滚动过程频繁请求）
let scrollDetailTimer: number | undefined
const clearScrollDetailTimer = () => {
  if (scrollDetailTimer) {
    clearTimeout(scrollDetailTimer)
    scrollDetailTimer = undefined
  }
}

// 已加载的详情 ID，避免同一项重复请求
const lastLoadedDetailId = ref<string | number | null>(null)
// 当前正在请求中的详情 ID（同一 ID 的并发请求直接跳过）
const inFlightDetailId = ref<string | number | null>(null)

// 调试开关：URL 带 ?debugDetailFlow=1 或 localStorage.debugDetailFlow='1' 时开启
const isDetailFlowDebugEnabled = () => {
  try {
    const fromQuery = String(route.query.debugDetailFlow || '') === '1'
    const fromStorage = window?.localStorage?.getItem('debugDetailFlow') === '1'
    return fromQuery || fromStorage
  } catch {
    return false
  }
}

const logDetailFlow = (stage: string, payload?: Record<string, unknown>) => {
  if (!isDetailFlowDebugEnabled()) return
  console.log(`[CreativeDetail][detail-flow] ${stage}`, payload || {})
}

const shouldFetchDetailForId = (id?: string | number) => {
  if (id === undefined || id === null) {
    logDetailFlow('shouldFetchDetailForId:skip-empty-id', { id })
    return false
  }
  const target = relatedTemplates.value.find((x: any) => String(x?.id) === String(id)) as any
  const status = Number(target?.status)
  // status: 0初始化 1待请求 2处理中 3完成 4失败
  // 进行中/失败：不调用详情接口（右侧直接展示列表项即可）
  if (status === 0 || status === 1 || status === 2 || status === 4) {
    logDetailFlow('shouldFetchDetailForId:skip-by-status', { id, status })
    return false
  }
  // 完成：才需要补全详情字段
  const shouldFetch = status === 3 || !Number.isFinite(status)
  logDetailFlow('shouldFetchDetailForId:result', { id, status, shouldFetch })
  return shouldFetch
}

const loadDetailOnce = async (id?: string | number) => {
  if (!id) {
    logDetailFlow('loadDetailOnce:skip-empty-id', { id })
    return
  }
  if (!shouldFetchDetailForId(id)) {
    logDetailFlow('loadDetailOnce:skip-shouldFetch=false', { id })
    return
  }
  // 同一 id 正在请求中，直接跳过（避免滚动 + 点击触发重复请求）
  if (inFlightDetailId.value != null && String(inFlightDetailId.value) === String(id)) {
    logDetailFlow('loadDetailOnce:skip-in-flight', { id, inFlightDetailId: inFlightDetailId.value })
    return
  }

  // 设置当前目标 id，用于丢弃过期响应
  currentDetailTargetId.value = id
  const token = ++detailRequestToken.value
  inFlightDetailId.value = id
  logDetailFlow('loadDetailOnce:request-start', { id, token })
  try {
    await loadTemplateDetail(id, { token, expectedId: id })
    logDetailFlow('loadDetailOnce:request-success', { id, token, lastLoadedDetailId: lastLoadedDetailId.value })
  } catch (error) {
    logDetailFlow('loadDetailOnce:request-error', {
      id,
      token,
      error: error instanceof Error ? error.message : String(error),
    })
    throw error
  } finally {
    // 只清理由本次请求设置的 inFlight（防止快速切换时误清空）
    if (inFlightDetailId.value != null && String(inFlightDetailId.value) === String(id)) {
      inFlightDetailId.value = null
    }
  }
}

const scheduleDetailLoadByIndex = (index: number, delay = 200) => {
  if (index < 0 || index >= relatedTemplates.value.length) {
    logDetailFlow('scheduleDetailLoadByIndex:skip-invalid-index', {
      index,
      total: relatedTemplates.value.length,
    })
    return
  }
  const targetTemplate = relatedTemplates.value[index]
  const targetId = getAlgoResultId(targetTemplate)
  if (!targetId) {
    logDetailFlow('scheduleDetailLoadByIndex:skip-no-id', { index, targetTemplate })
    return
  }
  clearScrollDetailTimer()
  logDetailFlow('scheduleDetailLoadByIndex:scheduled', { index, targetId, delay })
  scrollDetailTimer = window.setTimeout(() => {
    logDetailFlow('scheduleDetailLoadByIndex:timer-fire', { index, targetId })
    loadDetailOnce(targetId).catch(() => { })
  }, delay)
}

// 左侧媒体容器滚动监听 - 同步选中项和右侧缩略图
const handleMediaContainerScroll = async (event: Event) => {
  // 如果是用户点击缩略图触发的滚动
  if (isUserClickingThumbnail.value) {
    const target = event.target as HTMLElement
    if (!target || relatedTemplates.value.length === 0) return

    const { scrollTop, clientHeight } = target
    const mediaItems = target.querySelectorAll<HTMLElement>('.media-item')
    const step = mediaItems.length > 1 ? mediaItems[1].offsetTop - mediaItems[0].offsetTop : clientHeight
    const baseline = mediaItems.length > 0 ? mediaItems[0].offsetTop : 0
    const currentIndex = Math.round((scrollTop - baseline) / Math.max(step, 1))
    const validIndex = Math.max(0, Math.min(currentIndex, relatedTemplates.value.length - 1))
    logDetailFlow('handleMediaContainerScroll:click-branch', {
      scrollTop,
      step,
      baseline,
      currentIndex,
      validIndex,
      selected: selectedThumbnail.value,
    })
    // 点击对齐滚动期间：锁定为点击目标索引，不用滚动中间态去反推选中项
    // 否则会出现：点击第4个，滚动中被计算成第3个，导致详情错位。
    const lockedIndex =
      clickingTargetIndex.value != null ? clickingTargetIndex.value : selectedThumbnail.value

    if (
      lockedIndex >= 0 &&
      lockedIndex < relatedTemplates.value.length &&
      lockedIndex !== selectedThumbnail.value
    ) {
      const currentTemplate = relatedTemplates.value[lockedIndex]
      selectedThumbnail.value = lockedIndex
      previousThumbnailIndex.value = lockedIndex
      if (currentTemplate) {
        templateDetail.value = { ...currentTemplate }
      }
    }

    // 点击场景：详情请求只在 selectThumbnail 中触发一次。
    // 这里不再触发任何详情请求，避免对齐滚动过程中的中间态请求覆盖点击目标。

    // 同步右侧缩略图滚动
    const scrollPercentage =
      relatedTemplates.value.length > 1 ? lockedIndex / (relatedTemplates.value.length - 1) : 0
    syncRightThumbnailScroll(scrollPercentage)

    return // 直接返回，不执行后续的详情加载逻辑
  }

  const target = event.target as HTMLElement
  if (!target || relatedTemplates.value.length === 0) return

  // 点击后的保护期内，不允许滚动事件覆盖点击选中结果
  if (Date.now() < scrollSyncResumeAt.value) {
    const safeIndex = Math.max(0, Math.min(selectedThumbnail.value, relatedTemplates.value.length - 1))
    const scrollPercentage =
      relatedTemplates.value.length > 1 ? safeIndex / (relatedTemplates.value.length - 1) : 0
    syncRightThumbnailScroll(scrollPercentage)
    logDetailFlow('handleMediaContainerScroll:normal-branch-suppressed-after-click', {
      selected: selectedThumbnail.value,
      resumeAt: scrollSyncResumeAt.value,
      now: Date.now(),
    })
    return
  }

  const { scrollTop, clientHeight } = target

  // 由于容器使用了 gap/padding，不能直接用 clientHeight 作为步长
  const mediaItems = target.querySelectorAll<HTMLElement>('.media-item')
  const step = mediaItems.length > 1 ? mediaItems[1].offsetTop - mediaItems[0].offsetTop : clientHeight
  const baseline = mediaItems.length > 0 ? mediaItems[0].offsetTop : 0
  const currentIndex = Math.round((scrollTop - baseline) / Math.max(step, 1))
  // 确保索引在有效范围内
  const validIndex = Math.max(0, Math.min(currentIndex, relatedTemplates.value.length - 1))
  logDetailFlow('handleMediaContainerScroll:normal-branch', {
    scrollTop,
    step,
    baseline,
    currentIndex,
    validIndex,
    selected: selectedThumbnail.value,
  })

  // 如果索引发生变化，更新选中项并处理视频播放
  if (validIndex !== selectedThumbnail.value && validIndex < relatedTemplates.value.length) {
    const previousIndex = selectedThumbnail.value
    const currentTemplate = relatedTemplates.value[validIndex]
    const previousTemplate =
      previousIndex >= 0 && previousIndex < relatedTemplates.value.length
        ? relatedTemplates.value[previousIndex]
        : null

    // 如果上一个选中的是视频，暂停播放
    if (previousTemplate && isVideoType(previousTemplate)) {
      const previousPlayer = mediaPlayerRefs.value[previousIndex]
      if (previousPlayer && typeof previousPlayer.pause === 'function') {
        previousPlayer.pause()
      }
    }

    // 更新选中项
    selectedThumbnail.value = validIndex
    previousThumbnailIndex.value = validIndex

    // 滚动过程中优先使用列表数据展示（确保数据一致性）
    templateDetail.value = { ...currentTemplate }

    // 点击跳转后的保护期内，不触发滚动详情请求，避免中间项被逐个请求
    if (Date.now() >= suppressScrollDetailLoadUntil.value) {
      // 滚动停顿后再加载选中项详情，避免滚动过程频繁请求
      scheduleDetailLoadByIndex(validIndex, 180)
    } else {
      clearScrollDetailTimer()
      logDetailFlow('handleMediaContainerScroll:skip-detail-load-in-protection-window', {
        validIndex,
        selected: selectedThumbnail.value,
        suppressUntil: suppressScrollDetailLoadUntil.value,
        now: Date.now(),
      })
    }

    // 如果当前选中的是视频，自动播放
    if (isVideoType(currentTemplate)) {
      nextTick(() => {
        const currentPlayer = mediaPlayerRefs.value[validIndex]
        if (currentPlayer && typeof currentPlayer.play === 'function') {
          currentPlayer.play()
        }
      })
    }
  }

  // 计算滚动百分比用于同步右侧缩略图
  const scrollPercentage =
    relatedTemplates.value.length > 1 ? validIndex / (relatedTemplates.value.length - 1) : 0

  // 同步右侧缩略图滚动
  syncRightThumbnailScroll(scrollPercentage)
}

// 同步右侧缩略图滚动
const syncRightThumbnailScroll = (scrollPercentage: number) => {
  const inst = thumbnailRef.value
  if (inst && typeof inst.syncScroll === 'function') {
    inst.syncScroll(scrollPercentage)
  }
}

// 同步左侧滚动位置到选中项
const syncMediaContainerToSelected = (instant = false) => {
  if (!mediaContainerRef.value || relatedTemplates.value.length === 0) return

  const container = mediaContainerRef.value
  const mediaItems = container.querySelectorAll<HTMLElement>('.media-item')
  if (mediaItems.length === 0) return
  const safeIndex = Math.max(0, Math.min(selectedThumbnail.value, mediaItems.length - 1))
  // 直接滚动到对应 .media-item 的 offsetTop，避免 gap/padding 导致的步长误差
  const targetScrollTop = mediaItems[safeIndex].offsetTop

  // 初始加载时使用立即滚动，避免看到滚动过程
  container.scrollTo({
    top: targetScrollTop,
    behavior: instant ? 'auto' : 'smooth',
  })

  const containerHeight = container.clientHeight
  const step = mediaItems.length > 1 ? mediaItems[1].offsetTop - mediaItems[0].offsetTop : containerHeight
  console.log('滚动到选中项:', {
    index: selectedThumbnail.value,
    step,
    targetScrollTop,
    containerHeight,
    instant,
  })
}

// 切换喜欢状态（用于template和like页面）
// 当前详情页 UI 已不展示“喜欢”入口；为避免 noUnusedLocals 导致 build 失败，先移除该逻辑

// 创作收藏操作（用于assets页面）
const handleAssetsCollect = async () => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    return
  }
  if (!templateDetail.value) return
  if ((templateDetail.value as any).collectStatus === undefined) {
    ElMessage.warning('数据未加载完成，请稍后再试')
    return
  }

  try {
    const isCollecting = Number((templateDetail.value as any).collectStatus) !== 1
    // AI 工作台（AiFashionStudio）生成的创作：使用 /api/v1/algo/collect
    if (isAiFashionStudioAssetsDetail.value) {
      const algoOrderResultId = String(templateDetail.value.id || '')
      if (!algoOrderResultId) {
        ElMessage.error('结果ID丢失，无法收藏')
        return
      }

      const response = await algoApi.collect({ algoOrderResultId })
      if (response.code === '0000') {
        ; (templateDetail.value as any).collectStatus = isCollecting ? 1 : 0
        // 如果后端有返回新的 collectId，则回填；没有则保留原值
        const nextCollectId =
          (response.data as any)?.collectId ??
          (response.data as any)?.collectIds?.[0] ??
          templateDetail.value.collectId
        templateDetail.value.collectId = nextCollectId || null
        ElMessage.success(isCollecting ? '收藏成功' : '取消收藏')
      } else {
        ElMessage.error(response.msg || '网络开小差了~，请稍后再试')
      }
    } else {
      // 其它来源创作：旧接口 creative.ts / asset.ts 已下线
      ElMessage.warning('暂未接入收藏/取消收藏（旧接口已下线）')
      return
    }
  } catch (error) {
    console.error('收藏操作失败:', error)
    ElMessage.error('网络开小差了~，请稍后再试')
  }
}

// 更多菜单命令处理
const handleMoreCommand = (command: string) => {
  switch (command) {
    case 'report':
      handleReport()
      break
    case 'delete':
      handleDelete()
      break
  }
}

// 举报处理
const handleReport = () => {
  showFeedbackModal.value = true
}

// 反馈提交成功回调
const handleFeedbackSuccess = () => {
  // 反馈提交成功后的处理（如果需要刷新数据等）
  console.log('反馈提交成功')
}

// 删除处理：详情页统一调用删除创作结果接口
const handleDelete = async () => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    return
  }

  if (!templateDetail.value) {
    ElMessage.warning('数据不存在')
    return
  }

  try {
    // 确认删除
    await ElMessageBox.confirm('确定要删除这个创作吗？删除后将无法恢复。', '删除创作确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      customClass: 'creative-delete-confirm',
      confirmButtonClass: 'creative-delete-confirm-btn',
      cancelButtonClass: 'creative-delete-cancel-btn',
      showClose: false,
      closeOnClickModal: false,
      closeOnPressEscape: true,
      center: true,
    })

    const deletedAssetId: string = String(templateDetail.value.id)
    if (!deletedAssetId) {
      ElMessage.warning('结果ID丢失，无法删除')
      return
    }

    const response = await algoApi.del({ algoOrderResultId: deletedAssetId })
    if (response.code === '0000') {
      ElMessage.success('删除成功')
      emit('delete', deletedAssetId)
      if (props.isModal) {
        emit('close')
      } else {
        router.back()
      }
    } else {
      ElMessage.error(response.msg || '删除失败')
    }
  } catch (error: any) {
    // 用户取消删除
    if (error === 'cancel') {
      return
    }
    console.error('删除操作失败:', error)
    ElMessage.error('网络开小差了~，请稍后再试')
  }
}

// 组件挂载
onMounted(async () => {
  cateTitleRef.value = props.cateTitle || (route.query.cateTitle as string) || ''

  // 尝试从store获取列表数据（如果是从列表页跳转过来的）
  const cachedListData = templateStore.getTemplateListData()
  const cateIdFromRoute = props.cateId || (route.query.cateId as string)
  const shouldUseCachedData =
    cachedListData &&
    (cachedListData.cateId === undefined || cachedListData.cateId === cateIdFromRoute)

  if (shouldUseCachedData && cachedListData.list && cachedListData.list.length > 0) {
    const templateId = props.id || route.params.id
    console.log('[详情页] 使用缓存数据:', {
      listLength: cachedListData.list.length,
      currentIndex: cachedListData.currentIndex,
      templateId: templateId,
    })

    // 先找到当前项目在列表中的位置（在设置列表之前）
    let foundIndex: number

    if (cachedListData.currentIndex !== undefined && cachedListData.currentIndex >= 0) {
      // 优先使用缓存的索引（最准确）
      foundIndex = cachedListData.currentIndex
      console.log('[详情页] 使用缓存索引:', foundIndex)
    } else {
      // 如果没有缓存索引，通过ID查找（支持多种ID格式）
      foundIndex = cachedListData.list.findIndex((item: any) => {
        const itemTemplateId = item.creativeTemplateId || item.creativeTemplate?.id || item.id
        return (
          String(item.id) === String(templateId) ||
          String(item.creativeTemplateId) === String(templateId) ||
          String(item.creativeTemplate?.id) === String(templateId) ||
          String(itemTemplateId) === String(templateId)
        )
      })
      console.log('[详情页] 通过ID查找索引:', foundIndex, 'templateId:', templateId)
    }

    // 验证索引是否在有效范围内
    if (foundIndex >= 0 && foundIndex < cachedListData.list.length) {
      // 直接使用缓存数据中对应索引的项作为详情数据
      const selectedItem = cachedListData.list[foundIndex]

      // 处理嵌套的 creativeTemplate 结构（做同款数据是嵌套的）
      const processedList = cachedListData.list.map((item: any) => {
        // 如果数据嵌套在 creativeTemplate 中，提取出来
        if (item.creativeTemplate) {
          return {
            ...item.creativeTemplate,
            // 如果外层的 likeId 或 useLikes 存在，优先使用外层值（覆盖内层值）
            likeId: item.likeId || item.creativeTemplate?.likeId,
            useLikes: item.useLikes !== undefined ? item.useLikes : item.creativeTemplate?.useLikes,
            // creativeTemplateId 也在外层
            creativeTemplateId: item.creativeTemplateId || item.creativeTemplate?.id,
          }
        }
        return item
      })

      // 先设置选中索引（必须在设置列表之前）
      selectedThumbnail.value = foundIndex
      // 使用处理后的列表数据初始化详情（列表数据已经包含足够的信息）
      templateDetail.value = processedList[foundIndex] as CreativeTemplate
      // 然后设置处理后的列表数据（此时 selectedThumbnail 已经是正确的值）
      relatedTemplates.value = processedList as any[]

      // 收藏状态：统一使用 collectStatus(0/1)

      console.log('[详情页] 设置选中索引:', foundIndex, 'itemId:', selectedItem.id)

      // 等待 DOM 更新完成，并设置滚动位置
      await nextTick()

      // 设置滚动位置，确保显示正确的项目
      if (mediaContainerRef.value && relatedTemplates.value.length > 0) {
        await new Promise((resolve) => requestAnimationFrame(resolve))
        const container = mediaContainerRef.value
        // 可能在等待期间组件已卸载或弹窗已关闭，此时直接返回
        if (!container) return
        const itemHeight = container.clientHeight
        const targetScrollTop = selectedThumbnail.value * itemHeight
        container.scrollTop = targetScrollTop
      }

      // 标记数据已准备好，可以显示内容
      isDataReady.value = true

      // 最后调用详情接口获取完整数据（如果有模板ID的话）
      // 注意：这会覆盖 templateDetail.value，但由于用户已经看到正确的数据，不会感到闪烁
      // 对于"做同款"数据，需要使用 creativeTemplateId，而不是任务ID
      const templateId =
        selectedItem.creativeTemplateId || selectedItem.creativeTemplate?.id || selectedItem.id
      if (templateId) {
        await loadTemplateDetail(templateId)
      }
    } else {
      console.warn('[详情页] 索引无效，使用路由ID加载详情:', {
        foundIndex,
        listLength: cachedListData.list.length,
        routeId: route.params.id,
      })
      // 如果索引无效，使用路由参数ID加载详情
      await loadTemplateDetail(route.params.id as string | number | undefined)
      if (templateDetail.value) {
        relatedTemplates.value = [templateDetail.value as any]
        selectedThumbnail.value = 0
        isDataReady.value = true
      }
    }
  } else {
    // 没有缓存数据，先加载详情数据（优先显示详情内容）
    await loadTemplateDetail((props.id || route.params.id) as string | number | undefined)
    // 没有缓存数据，先显示当前详情
    if (templateDetail.value) {
      relatedTemplates.value = [templateDetail.value as any]
      selectedThumbnail.value = 0
      isDataReady.value = true
    }

    // 延迟加载相关列表数据（不阻塞详情显示，使用 nextTick 确保详情先渲染）
    nextTick(() => {
      // 异步加载相关列表，不阻塞当前渲染
      loadRelatedTemplates(true).then(() => {
        // loadRelatedTemplates 内部已经处理了选中逻辑，这里只需要确保滚动位置正确
        // 不需要再次查找和设置，避免覆盖 loadRelatedTemplates 中的正确逻辑
      })
    })
  }

  // 初始进入详情页时，直接设置滚动位置（在渲染前设置，避免看到滚动过程）
  if (relatedTemplates.value.length > 0 && mediaContainerRef.value) {
    // 等待 DOM 渲染完成
    await nextTick()
    // 再等待一帧，确保容器高度已计算
    await new Promise((resolve) => requestAnimationFrame(resolve))

    // 直接设置 scrollTop，不使用 scrollTo（避免任何动画）
    const container = mediaContainerRef.value
    // 在等待期间，组件可能被销毁或弹窗关闭，此时不再操作 DOM
    if (!container) return
    const itemHeight = container.clientHeight
    const targetScrollTop = selectedThumbnail.value * itemHeight
    container.scrollTop = targetScrollTop

    // 同步右侧缩略图滚动位置
    const scrollPercentage =
      relatedTemplates.value.length > 1
        ? selectedThumbnail.value / (relatedTemplates.value.length - 1)
        : 0
    syncRightThumbnailScroll(scrollPercentage)

    // 初始加载完成后，恢复平滑滚动（用于后续用户操作）
    nextTick(() => {
      isInitialLoad.value = false
    })
  }

  // 如果第一个项是视频，自动播放
  nextTick(() => {
    if (relatedTemplates.value.length > 0) {
      const firstItem = relatedTemplates.value[selectedThumbnail.value]
      if (firstItem && isVideoType(firstItem)) {
        // 如果是视频类型，自动播放
        const currentPlayer = mediaPlayerRefs.value[selectedThumbnail.value]
        if (currentPlayer && typeof currentPlayer.play === 'function') {
          currentPlayer.play()
        }
      }
    }
  })

  // 初始化上一个缩略图索引
  previousThumbnailIndex.value = selectedThumbnail.value

  // 添加滚动监听
  nextTick(() => {
    // 添加左侧媒体容器滚动监听
    const mediaContainerElement = mediaContainerRef.value
    if (mediaContainerElement) {
      mediaContainerElement.addEventListener('scroll', handleMediaContainerScroll)
    }
  })
})

// 组件卸载时移除监听
onUnmounted(() => {
  isUnmountedRef.value = true
  const mediaContainerElement = mediaContainerRef.value
  if (mediaContainerElement) {
    mediaContainerElement.removeEventListener('scroll', handleMediaContainerScroll)
  }

  // 清理滚动详情定时器
  clearScrollDetailTimer()
})
</script>

<style lang="scss" scoped>
.template-detail-page {
  // 页面本身不滚动：Header 固定占位，下方内容在内部容器滚动
  height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background-color: $color-bg-black;
  color: $color-text-white;
  position: relative;

  .main-content {
    display: flex;
    flex: 1;
    min-height: 0; // 允许子元素正确计算滚动高度（避免双滚动条）
    overflow: hidden;
    position: relative;

    .back-button {
      position: absolute;
      top: 21px;
      left: 21px;
      width: 36px;
      height: 36px;
      z-index: 100000;
      padding: 0;
      border: 1px solid rgba(255, 255, 255, 0.2);
      color: $color-text-white;

      &:hover {
        color: $color-primary-dark;
        background: rgba(0, 0, 0, 0.6);
        border-color: $color-primary-dark;
      }

      :deep(.el-icon) {
        color: inherit;
      }
    }

    .media-container {
      display: flex;
      flex-direction: column;
      flex: 1;
      height: 100%;
      gap: $spacing-md;
      position: relative;
      overflow-y: auto;
      overflow-x: hidden;
      min-height: 0;
      scroll-snap-type: y mandatory;
      scroll-behavior: smooth;

      // 媒体滚动容器
      .media-scroll-wrapper {
        display: flex;
        flex-direction: column;
        gap: 0;
        min-height: 100%;
      }

      // 可滚动，每个item占满一屏
      .media-item {
        width: 100%;
        height: 100%;
        min-height: 100%;
        flex-shrink: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-start;
        scroll-snap-align: start;
        scroll-snap-stop: always;
        position: relative;
        padding-top: 21px;
        box-sizing: border-box;
      }

      .media-player {
        position: relative;
        width: 100%;
        flex: 1;
        min-height: 0; // 允许 flex 子元素缩小
        overflow: hidden;
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;

        .media-status-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          color: $color-primary;
          background: $color-bg-dark-secondary;
          border-radius: $border-radius-md;
          box-sizing: border-box;
          padding: 24px;

          &.generating {
            background: url('@/assets/images/generating.gif') no-repeat center center;
            background-size: 100% 100%;

            .status-text {
              margin: $spacing-md 0;
            }
          }

          &.failed {
            color: $color-text-white;

            .placeholder-icon {
              width: 130px;
              height: 130px;
              margin-bottom: $spacing-md;
              object-fit: contain;
            }
          }

          .status-text {
            font-size: $font-size-xl;
            text-align: center;
          }
        }

        .video-player {
          width: 100%;
          height: 100%;
          display: block;
          object-fit: contain;
        }
      }

      .image-display {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;

        .main-image {
          max-width: 100%;
          object-fit: contain;
          border-radius: $border-radius-lg;
        }
      }

      .content-notice {
        padding: 21px 0 25px;
        text-align: center;
        font-size: $font-size-sm;
        color: $color-text-white;
        flex-shrink: 0;
      }
    }

    // 中间板块
    .info-panel {
      width: 286px;
      display: flex;
      flex-direction: column;
      overflow-y: auto;
      padding: 30px 15px 66px;
      position: relative;
      // 纯黑主题：右侧信息区使用黑底 + 轻描边分隔
      background: $color-bg-dark-secondary;
      border-left: 1px solid rgba(255, 255, 255, 0.15);
      border-right: 1px solid rgba(255, 255, 255, 0.15);
      color: $color-text-white;
      font-size: $font-size-md;

      .info-actions {
        display: flex;
        align-items: start;
        justify-content: flex-end;
        gap: $spacing-md;
        margin-bottom: 29px;

        .btn-icon {
          width: 24px;
          height: 24px;
          cursor: pointer;
        }

        .btn-icon-loading {
          width: 24px;
          height: 24px;
          font-size: 24px;
        }

        .btn-icon-wrapper {
          display: inline-block;
          cursor: pointer;
        }
      }

      &.info-panel--pending {
        .info-actions {
          display: none;
        }

        .info-header {
          margin-bottom: 18px;
        }

        .info-title-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .info-title {
          font-size: 18px;
          font-weight: 600;
          margin: 0;
        }

        .pending-body {
          padding: 14px 12px;
          border-radius: $border-radius-md;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.12);
        }

        .pending-text {
          margin: 0;
          font-size: 13px;
          line-height: 1.6;
          color: rgba(255, 255, 255, 0.8);
        }
      }

      // 标题
      .section-title,
      .param-input,
      .tag-row {
        margin-bottom: $spacing-sm-xs;
      }

      .param-input {
        padding: 16px 10px;
      }

      .copy-icon {
        width: 18px;
        height: 18px;
        cursor: pointer;
      }

      .video-thumb-row {
        display: flex;
        align-items: center;
        gap: $spacing-sm;
        flex-wrap: wrap;
        margin-bottom: 15px;

        img {
          width: 80px;
          height: 80px;
          object-fit: cover;
          border-radius: $border-radius-md;
        }
      }
    }

    .creative-description {
      margin-bottom: $spacing-md;

      .description-text {
        margin-top: $spacing-sm-xs;
        line-height: 23px;
        word-break: break-word;
        white-space: pre-wrap;
        -webkit-user-select: text;
        user-select: text;
        color: $color-text-gray;
        text-align: justify;
        font-family: NotoSans-regular;
      }
    }

    .tag-row {
      display: flex;
      align-items: center;
      gap: 5px;
      flex-wrap: wrap;

      .tag {
        padding: 6px 10px 5px;
      }
    }

    .param-input,
    .tag {
      border-radius: 4px;
      background-color: rgba(0, 0, 0, 0.5);
      color: $color-text-gray;
      font-family: -regular;
      border: 1px solid rgba(255, 255, 255, 0.15);
    }

    .params-tag {
      padding: 3px 6px;
      border-radius: 4px;
      background-color: rgba(150, 221, 255, 0.15);
      font-size: $font-size-sm;
      text-align: center;
      font-family: -regular;
      border: 1px solid rgba(150, 221, 255, 1);
    }

    .use-count {
      font-size: 8px;
      color: $color-text-tags;
      margin-top: 5px;
    }

    .thumbnail-gallery {
      border: none;
      background: transparent;
      margin-top: 0;
    }
  }

  .action-section {
    display: flex;
    flex-direction: column;
    gap: $spacing-xs;
    margin-top: auto;

    .action-item {

      .action-btn {
        // width: 120px;
        // height: 27px;
        width: 100%;
        height: 47px;
        border-radius: 4px;
        background-color: rgba(18, 18, 18, 1);
        font-size: 14px;
        color: $color-text-white;
        text-align: center;
        font-family: PingFangSC-regular;
        border: 1px solid rgba(255, 255, 255, 0.15);

        &.is-disabled {
          background-color: rgba(255, 255, 255, 0.15);
          color: rgba(255, 255, 255, 0.5);
          border: 1px solid rgba(255, 255, 255, 0.05);

          .action-icon {
            opacity: 0.5;
          }
        }
      }

      .action-icon {
        height: 16px;
        width: 16px;
        object-fit: contain;
        margin-right: 6px;
        box-shadow: 0px 2px 6px 0px rgba(0, 0, 0, 0.4);
      }
    }
  }
}
</style>
