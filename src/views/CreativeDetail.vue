<template>
  <!-- eslint-disable vue/html-indent -->
  <div class="template-detail-page">
    <Header />

    <!-- 主要内容区域 -->
    <div class="main-content">
      <div ref="mediaContainerRef" class="media-container"
        :style="{ scrollBehavior: isInitialLoad ? 'auto' : 'smooth' }">
        <!--左侧返回按钮  -->
        <el-button class="back-button" type="default" @click="handleBack">
          <el-icon :size="20">
            <Back />
          </el-icon>
        </el-button>
        <!-- 左侧视频/图片展示区 - 可滚动显示多个模板 -->
        <div class="media-scroll-wrapper">
          <div v-for="(item, index) in relatedTemplates" :key="item.id" class="media-item"
            :class="{ active: selectedThumbnail === index }">
            <div class="media-player flex-col-center" @click="handleImagePreview(index, item)">
              <!-- 媒体播放器 - 自动判断显示视频或图片 -->
              <!-- :poster="item.imageUrl || item.imgUrl" -->
              <MediaPlayer :ref="(el: any) => setMediaPlayerRef(el, index)" :src="item.fileUrl"
                poster="https://chao-tryon-dev.chaotuishou.com/images/2026/03/t2i_t2i_085ab023-51b7-4e92-a8e1-1c5664eca137_20260318_160916_0798b151.jpg"
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
      <div class="info-panel">
        <!-- 顶部操作图标 -->
        <div class="info-actions">
          <div class="btn-icon-wrapper" @click.stop="handleDownloadCommand('download')">
            <el-icon v-if="isDownloading" class="is-loading btn-icon-loading">
              <Loading />
            </el-icon>
            <img v-else :src="images.downloadIcon" class="btn-icon" alt="下载" />
          </div>
          <img :src="templateDetail?.isCollect === 1 ? images.collectActive : images.collectNo" class="btn-icon" alt=""
            @click="handleAssetsCollect" />
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
        <div v-if="pageTypeRef == 'assets'">
<<<<<<< HEAD
          <h5 class="section-title">{{ templateDetail?.typeName }}</h5>
          <div v-if="requestParams" class="video-thumb-row">
            <!-- AI视频-单图/模板动作 AI图片-指令改图/姿势裂变-->
            <img v-if="requestParams.imageUrl" :src="requestParams.imageUrl" />
            <!-- AI视频-尾帧 -->
            <img v-if="requestParams.lastFrameUrl" :src="requestParams.lastFrameUrl" />
            <!-- AI视频-多图成片 -->
            <img v-for="item in requestParams.imageUrls" :key="item" :src="item" />

            <!-- AI图片-商品展示 6 -->
            <img v-if="requestParams.productItemUrl" :src="requestParams.productItemUrl" />
            <!-- AI图片-穿搭调整-模特图 5 -->
            <img v-if="templateDetail?.type == 5 && requestParams.flatSceneImageUrl"
              :src="requestParams.flatSceneImageUrl" />

            <!-- 万物穿戴-单视角/多视角 -->
            <img v-if="requestParams.itemViewOneUrl" :src="requestParams.itemViewOneUrl" />
            <img v-if="requestParams.itemViewTwoUrl" :src="requestParams.itemViewTwoUrl" />

            <!-- 换模特换背景/只换模特/只换背景 -->
            <img v-if="requestParams.clothesSceneUrl" :src="requestParams.clothesSceneUrl" />
            <!-- 只换模特 -->
            <img v-if="requestParams.clothesSceneUrlModel" :src="requestParams.clothesSceneUrlModel" />
            <!-- 只换背景 -->
            <img v-if="requestParams.clothesSceneUrlBg" :src="requestParams.clothesSceneUrlBg" />

            <!-- AI试衣-自定义=>连体衣/上下装 -->
            <img v-if="requestParams.upperFrontUrl" :src="requestParams.upperFrontUrl" />
            <img v-if="requestParams.downFrontUrl" :src="requestParams.downFrontUrl" />
            <img v-if="requestParams.frontDressUrl" :src="requestParams.frontDressUrl" />

            <!-- AI试衣-平铺图=>连体衣/上下装正面背面 -->
            <!-- AI试衣-平铺图=>上下装/上装正面 -->
            <img v-if="requestParams.flatUpperFrontUrl" :src="requestParams.flatUpperFrontUrl" />
            <!-- AI试衣-平铺图=>上下装/上装背面 -->
            <img v-if="requestParams.flatUpperBackUrl" :src="requestParams.flatUpperBackUrl" />
            <!-- AI试衣-平铺图=>上下装/下装正面 -->
            <img v-if="requestParams.flatDownFrontUrl" :src="requestParams.flatDownFrontUrl" />
            <!-- AI试衣-平铺图=>上下装/下装背面 -->
            <img v-if="requestParams.flatDownBackUrl" :src="requestParams.flatDownBackUrl" />
            <!-- AI试衣-平铺图=>连体衣正面 -->
            <img v-if="requestParams.flatFrontDressUrl" :src="requestParams.flatFrontDressUrl" />
            <!-- AI试衣-平铺图=>连体衣背面 -->
            <img v-if="requestParams.flatBackDressUrl" :src="requestParams.flatBackDressUrl" />

            <!-- AI试衣-挂拍图 => 正面/背面 -->
            <img v-if="requestParams.hangingFrontUrl" :src="requestParams.hangingFrontUrl" />
            <img v-if="requestParams.hangingBackUrl" :src="requestParams.hangingBackUrl" />

            <!-- AI试衣-搭配图 => 一身搭-->
            <img v-if="requestParams.mixedItemsUrl" :src="requestParams.mixedItemsUrl" />

            <!-- AI试衣-人台图 => 正面/背面-->
            <!-- 人台图 正面-->
            <img v-if="requestParams.mannequinFrontUrl" :src="requestParams.mannequinFrontUrl"  />
            <!-- 人台图 背面 -->
            <img v-if="requestParams.mannequinBackUrl" :src="requestParams.mannequinBackUrl" />
=======
          <div class="section-title">
            {{ isAiFashionStudioAssetsDetail ? studioModuleName : templateDetail?.typeName }}
>>>>>>> origin/dev
          </div>

          <!-- AI工作台（4类型）详情：完全使用四个左侧页面的展示结构（仅保留必要模块） -->
          <template v-if="isAiFashionStudioAssetsDetail">

            <template v-if="detailModule === 'sketchToReal'">
              <div class="section-title">线稿图</div>
              <div v-if="requestParams" class="video-thumb-row">
                <img v-if="requestParams.imageUrl" :src="requestParams.imageUrl" />
                <img v-for="item in requestParams.imageUrls" :key="item" :src="item" />
              </div>
            </template>

            <template v-if="detailModule === 'realToSketch'">
              <div class="section-title">实物图</div>
              <div v-if="requestParams" class="video-thumb-row">
                <img v-if="requestParams.imageUrl" :src="requestParams.imageUrl" />
              </div>
            </template>

            <template v-if="detailModule === 'fabricCreative'">
              <div class="section-title">面料图</div>
              <div v-if="requestParams" class="video-thumb-row">
                <img v-if="requestParams.imageUrl" :src="requestParams.imageUrl" />
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

            <template
              v-if="(requestParams?.imageUrl || (Array.isArray(requestParams?.imageUrls) && requestParams.imageUrls.length)) && detailModule == 'aiFashion'">
              <div class="section-title">参考图</div>
              <div v-if="requestParams && isAiFashionStudioAssetsDetail" class="video-thumb-row">
                <img v-if="requestParams.imageUrl" :src="requestParams.imageUrl" />
                <img v-for="item in requestParams.imageUrls" :key="item" :src="item" />
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

          <div v-if="
            requestParams &&
            (requestParams.algorithmName ||
              requestParams.duration ||
              requestParams.resolution ||
              requestParams.aspectRatio ||
              requestParams.quality)
          " class="tag-row">
            <span v-if="requestParams.algorithmName" class="params-tag">
              {{ requestParams.algorithmName }}
            </span>
            <span v-if="requestParams.duration" class="params-tag">{{ requestParams.duration }}秒</span>
            <span v-if="requestParams.resolution" class="params-tag">
              {{ requestParams.resolution }}
            </span>
            <span v-if="requestParams.aspectRatio" class="params-tag">
              {{ requestParams.aspectRatio }}
            </span>
            <span v-if="requestParams.quality" class="params-tag">
              {{ requestParams.quality }}
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
            <div class="flex-between">
              <el-button class="action-btn" @click="handleAgainEdit">
                <img :src="images.againEdit" alt="" class="action-icon" />
                重新生成
              </el-button>
              <el-button class="action-btn" @click="handleAgainGenerate">
                <img :src="images.againGenerate" alt="" class="action-icon" />
                再次生成
              </el-button>
            </div>
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
      :task-id="templateDetail?.taskId" :task-result-id="templateDetail?.id" @success="handleFeedbackSuccess" />

    <!-- 会员购买弹窗 -->
    <MembershipModal :show="showCoinInsufficient" :error-type="coinErrorType" :is-vip="isUserVip"
      @close="handleCoinInsufficientClose" @success="handleMembershipPurchaseSuccess" />

    <!-- 责任声明弹窗 -->
    <WatermarkDisclaimerModal v-model="showWatermarkDisclaimer" @confirm="handleWatermarkDisclaimerConfirm"
      @cancel="handleWatermarkDisclaimerCancel" @no-remind-change="handleWatermarkDisclaimerNoRemindChange" />

    <!-- 图片预览 - 使用 Element Plus ImageViewer -->
    <el-image-viewer v-if="showImagePreview" :url-list="previewImageList" :initial-index="previewInitialIndex"
      :hide-on-click-modal="true" @close="handlePreviewClose" />
  </div>
</template>

<script setup lang="ts">
// Vue API 已自动导入
import { images } from '@/assets'
import { ElMessage, ElMessageBox, ElImageViewer } from 'element-plus'
import { Loading, Back } from '@element-plus/icons-vue'
import ThumbnailGallery from '@/components/ThumbnailGallery.vue'
import type { Asset } from '@/composables/useTaskPolling'
import { creativeApi } from '@/api/creative'
import { assetApi } from '@/api/asset'
import { userApi } from '@/api/user'
import { useUserStore } from '@/stores/user'
import { useTemplateStore } from '@/stores/template'
import { useWatermarkStore } from '@/stores/watermark'
import { watermarkDownloader } from '@/utils/WatermarkDownloader'
import type { CreativeTemplate } from '@/types'
import { copyToClipboard } from '@/utils/clipboard'

// Props 定义（支持弹窗模式）
interface Props {
  id?: string | number
  pageType?: string
  cateId?: string
  cateTitle?: string
  sourceTab?: string
  collectId?: string
  isCollect?: number
  // 是否是弹窗模式
  isModal?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  id: undefined,
  pageType: undefined,
  cateId: undefined,
  cateTitle: undefined,
  sourceTab: undefined,
  collectId: undefined,
  isCollect: undefined,
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
const watermarkStore = useWatermarkStore()

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

// 去除水印相关状态
const removeWatermarkEnabled = computed(() => watermarkStore.removeWatermarkEnabled)
const showCoinInsufficient = ref(false) // 会员购买弹窗
const coinErrorType = ref('up_vip') // 错误类型
const showWatermarkDisclaimer = ref(false) // 责任声明弹窗
const isDownloading = ref(false) // 下载状态
const isUserVip = computed(() => userStore.userInfo?.isVip === 1)

// 购买会员成功后的待处理操作
type PendingAction = { type: 'download' } | { type: 'toggle' } | { type: 'brandWatermark' }
const pendingAfterVipAction = ref<PendingAction | null>(null)

// 页面类型：assets-我的资产详情 | template-创意模板详情 | like-我的喜欢详情
const pageTypeRef = ref<string>('template')
// 来源标签（用于 assets 页面，标识从哪个列表跳转过来）
const sourceTabRef = ref<string>('')
// 是否初始加载（用于控制滚动行为）
const isInitialLoad = ref(true)

// AI 工作台（AiFashionStudio）进入的资产详情：仅展示 4 种类型需要的信息，隐藏其它业务类型的多余回显
const isAiFashionStudioAssetsDetail = computed(() => {
  return pageTypeRef.value === 'assets' && sourceTabRef.value === 'aiFashionStudio'
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

// 缩略图组件数据：将 relatedTemplates 映射成统一的 Asset 结构（ThumbnailGallery 使用）
const thumbnailAssets = computed<Asset[]>(() => {
  return (relatedTemplates.value || []).map((t: any) => {
    return {
      id: t?.id,
      taskId: t?.taskId,
      taskUuid: t?.taskUuid,
      imageUrl: t?.lessenImg || t?.imgUrl || t?.imageUrl || '',
      fileUrl: t?.fileUrl || '',
      fileType: t?.fileType ?? 1,
      status: t?.status ?? 3,
      prompt: t?.prompt || t?.title || '',
    }
  }) as unknown as Asset[]
})

const relatedPageParams = ref({
  current: 1,
  size: 20,
})

const hasMoreRelated = ref(true)
const loadingRelated = ref(false)
// 数据是否已初始化完成（用于避免初始渲染时的闪烁）
const isDataReady = ref(false)

// 解析 requestParam（资产详情返回的参数内容）
const requestParams = computed(() => {
  if (!templateDetail.value || !(templateDetail.value as any).requestParam) {
    return null
  }

  try {
    const requestParamStr = (templateDetail.value as any).requestParam
    if (typeof requestParamStr === 'string') {
      // 仅在需要时调试打印，避免频繁访问 computed 导致控制台刷屏
      // console.log('[CreativeDetail] requestParams:', JSON.parse(requestParamStr))
      return JSON.parse(requestParamStr)
    }
    return requestParamStr
  } catch (error) {
    console.warn('解析 requestParam 失败:', error)
    return null
  }
})

// 判断是否为面料创拍类型（用于模块路由跳转）
const isFabricShoot = computed(() => {
  if (!templateDetail.value) return false
  const typeName = String((templateDetail.value as any).typeName || '')
  const titleName = String((templateDetail.value as any).titleName || '')
  return `${typeName} ${titleName}`.includes('面料创拍')
})

// 统一判断是否为视频类型（根据页面类型使用不同字段）
// 创意模板和做同款详情：使用 type 字段（type==0是视频，type==1是图片）
// 我的资产：使用 fileType 字段（fileType==1是图片，fileType==2是视频）
const isVideoType = (item: any): boolean => {
  if (!item) return false

  // 我的资产页面：使用 fileType 字段
  if (pageTypeRef.value === 'assets') {
    if (item.fileType !== undefined && item.fileType !== null) {
      return item.fileType === 2 // fileType === 2 表示视频
    }
    // 如果 fileType 不存在，根据是否有 fileUrl 判断（有 fileUrl 通常是视频）
    return !!item.fileUrl
  }

  // 创意模板和做同款详情：使用 type 字段
  // pageType 为 'template' 或 'like' 时使用 type
  if (item.type !== undefined && item.type !== null) {
    return item.type === 0 // type === 0 表示视频
  }

  // 兼容旧数据：如果没有 type，尝试使用 fileType
  if (item.fileType !== undefined && item.fileType !== null) {
    return item.fileType === 2
  }

  // 如果都没有，根据是否有 fileUrl 判断（有 fileUrl 通常是视频）
  return !!item.fileUrl
}

// 统一判断是否为图片类型
const isImageType = (item: any): boolean => {
  return !isVideoType(item)
}

// （已移除）与 4 类型无关的模板 imageSetList/穿戴/热门穿搭/模特视频等详情渲染逻辑

type DetailModule = 'aiFashion' | 'sketchToReal' | 'realToSketch' | 'fabricCreative'

// 详情所属模块：AI服装设计三模块 + 面料创拍一模块（用于“重新生成/再次生成”跳转）
const detailModule = computed<DetailModule>(() => {
  if (!templateDetail.value) return 'aiFashion'

  // 优先按 titleCode/titleName 判定“面料创拍”
  if (isFabricShoot.value) return 'fabricCreative'

  const typeName = String((templateDetail.value as any).typeName || '')
  const titleName = String((templateDetail.value as any).titleName || '')
  const combined = `${typeName} ${titleName}`

  if (combined.includes('线稿转实物')) return 'sketchToReal'
  if (combined.includes('实物转线稿')) return 'realToSketch'
  if (combined.includes('面料')) return 'fabricCreative'

  return 'aiFashion'
})

const getDetailMainImageUrl = () => {
  const d: any = templateDetail.value as any
  return (
    d?.noWatermarkUrl ||
    d?.imageUrl ||
    d?.imgUrl ||
    d?.lessenImg ||
    d?.fileUrl ||
    ''
  )
}

// 重新生成：跳转到 AiFashionStudio 对应模块，并带上当前详情图
const handleAgainEdit = () => {
  const url = getDetailMainImageUrl()
  router.push({
    name: 'AiFashionStudio',
    query: {
      mode: detailModule.value,
      refImageUrl: url,
      taskResultId: String((templateDetail.value as any)?.id ?? ''),
      from: 'detail',
      action: 'againEdit',
    },
  })
}

// 再次生成：同上（预留 action 让目标页后续可区分不同入口）
const handleAgainGenerate = () => {
  const url = getDetailMainImageUrl()
  router.push({
    name: 'AiFashionStudio',
    query: {
      mode: detailModule.value,
      refImageUrl: url,
      taskResultId: String((templateDetail.value as any)?.id ?? ''),
      from: 'detail',
      action: 'againGenerate',
    },
  })
}

// 统一的创意描述文本（用于复制等功能）
const descriptionText = computed(() => {
  const params: any = requestParams.value
  if (!params) return ''

  // 优先使用 description / prompt / creativityDesc 字段
  if (params.description) return params.description
  if (params.prompt) return params.prompt
  if (params.creativityDesc) return params.creativityDesc

  // 其次尝试从 prompts 数组中拼接 value 字段
  if (Array.isArray(params.prompts)) {
    return params.prompts
      .map((item: any) => item?.value)
      .filter((v: any) => !!v)
      .join('\n')
  }

  return ''
})

// 获取创意描述文本（优先级：description > prompt > creativityDesc）
const creativeDescription = computed(() => {
  if (!requestParams.value) return ''
  return (
    requestParams.value.description ||
    requestParams.value.prompt ||
    requestParams.value.creativityDesc ||
    requestParams.value.productPrompt ||
    requestParams.value.creativeDescription ||
    ''
  )
})

// 详情请求并发控制：
// - detailRequestToken: 每次发起详情请求递增，用于丢弃过期响应（用户快速切换缩略图时）
// - currentDetailTargetId: 当前“应该展示”的详情 id
const detailRequestToken = ref(0)
const currentDetailTargetId = ref<string | number | null>(null)

// 获取详情数据（根据 pageType 调用不同接口）
const loadTemplateDetail = async (
  templateId?: string | number,
  options?: { token?: number; expectedId?: string | number }
) => {
  const normalizeId = (v: any): string | number | null => {
    if (v == null) return null
    if (Array.isArray(v)) return v[0] ?? null
    return v
  }

  const id = normalizeId(templateId || props.id || route.params.id)
  if (!id) {
    // 弹窗模式下，如果没有ID，可能是组件刚创建时props还未传递，不立即关闭弹窗
    // 等待一个tick，如果还是没有ID，再关闭
    if (props.isModal) {
      await nextTick()
      const retryId = templateId || props.id || route.params.id
      if (!retryId) {
        ElMessage.error('ID不存在')
        emit('close')
      }
      return
    } else {
      ElMessage.error('ID不存在')
      router.back()
    }
    return
  }

  const expectedId = normalizeId(options?.expectedId ?? id) ?? id
  const token = options?.token

  try {
    const params: any = {
      id: String(id),
      userId: userStore.userInfo?.userId,
    }

    let response: any = { code: '9999' }

    switch (pageTypeRef.value) {
      case 'assets': // 我的资产详情
        console.log('[资产详情] 查询参数:', params)
        response = await assetApi.getTaskDetail(params)
        console.log('[资产详情] 查询结果:', response)
        if (response.code === '0000') {
          const assetData = response.data || {}
          // 映射资产详情字段到页面使用的字段
          const updatedDetail = {
            ...assetData,
            imgUrl: assetData.imageUrl || assetData.imgUrl, // 映射 imageUrl 到 imgUrl
          }
          // 丢弃过期响应：token 不一致或当前目标 id 已变化
          if (
            (typeof token === 'number' && token !== detailRequestToken.value) ||
            (currentDetailTargetId.value != null &&
              String(currentDetailTargetId.value) !== String(expectedId))
          ) {
            return
          }

          templateDetail.value = updatedDetail

          // 同步更新 relatedTemplates 中对应项的数据（确保数据一致性）
          if (
            selectedThumbnail.value >= 0 &&
            selectedThumbnail.value < relatedTemplates.value.length &&
            String(relatedTemplates.value[selectedThumbnail.value]?.id) === String(id)
          ) {
            relatedTemplates.value[selectedThumbnail.value] = {
              ...relatedTemplates.value[selectedThumbnail.value],
              ...updatedDetail,
            }
          }

          // 只有成功回写到 UI 后，才认为该 id “已加载”
          lastLoadedDetailId.value = expectedId
        }
        break

      case 'template': // 创意模板详情
      case 'like': // 我的喜欢详情
        console.log('[模板详情] 查询参数:', params)
        response = await creativeApi.getCreativeTemplateDetail(params)
        console.log('[模板详情] 查询结果:', response)
        if (response.code === '0000') {
          const updatedDetail = response.data || {}
          // 丢弃过期响应：token 不一致或当前目标 id 已变化
          if (
            (typeof token === 'number' && token !== detailRequestToken.value) ||
            (currentDetailTargetId.value != null &&
              String(currentDetailTargetId.value) !== String(expectedId))
          ) {
            return
          }

          templateDetail.value = updatedDetail

          // 同步更新 relatedTemplates 中对应项的数据（确保数据一致性）
          if (
            selectedThumbnail.value >= 0 &&
            selectedThumbnail.value < relatedTemplates.value.length &&
            String(relatedTemplates.value[selectedThumbnail.value]?.id) === String(id)
          ) {
            relatedTemplates.value[selectedThumbnail.value] = {
              ...relatedTemplates.value[selectedThumbnail.value],
              ...updatedDetail,
            }
          }

          // 只有成功回写到 UI 后，才认为该 id “已加载”
          lastLoadedDetailId.value = expectedId
        }
        break
    }

    if (response.code !== '0000') {
      ElMessage.error(response.msg || '获取详情失败')
    }
  } catch (error) {
    console.error('获取详情失败:', error)
    ElMessage.error('获取详情失败')
  }
}

// 获取相关模板/资产（统一加载逻辑）
const loadRelatedTemplates = async (isRefresh = false) => {
  if (loadingRelated.value) return

  if (isRefresh) {
    relatedPageParams.value.current = 1
    relatedTemplates.value = []
    hasMoreRelated.value = true
  }

  try {
    loadingRelated.value = true

    if (pageTypeRef.value === 'assets') {
      // assets 页面：加载相关资产
      const userId = userStore.userInfo?.userId
      if (!userId) {
        return
      }

      // 根据来源标签决定加载什么数据
      const params: any = {
        userId: String(userId),
        size: relatedPageParams.value.size,
        current: relatedPageParams.value.current,
      }

      // 根据来源标签对照接口字段获取对应的接口参数
      // 来源标签：all, image, video, favorite（兼容：images, videos, favorites）
      const sourceTabMap: Record<string, { isCollect?: number; fileType?: number }> = {
        favorite: { isCollect: 1 },
        favorites: { isCollect: 1 },
        image: { fileType: 1 },
        images: { fileType: 1 },
        video: { fileType: 2 },
        videos: { fileType: 2 },
        all: { isCollect: 0 }, // 全部列表：isCollect = 0 显示全部
      }

      const tabConfig = sourceTabMap[sourceTabRef.value]
      if (tabConfig) {
        Object.assign(params, tabConfig)
        // 如果详情有类型且没有设置 fileType，可以根据详情类型设置
        if (!tabConfig.fileType && templateDetail.value?.fileType) {
          params.fileType = templateDetail.value.fileType
        }
      } else if (templateDetail.value?.fileType) {
        // 如果没有来源标签，默认显示全部（isCollect = 0）并使用当前资产类型
        params.isCollect = 0
        params.fileType = templateDetail.value.fileType
      } else {
        // 如果既没有来源标签也没有详情类型，默认显示全部
        params.isCollect = 0
      }

      const response = await assetApi.getMyAssetsPage(params)

      if (response.code === '0000' && response.data) {
        const { records, total } = response.data as any

        // 处理数据，确保有 imgUrl 字段
        const processedRecords = records.map((item: any) => ({
          ...item,
          imgUrl: item.imageUrl || item.imgUrl,
        }))

        if (isRefresh) {
          // 先设置列表数据
          relatedTemplates.value = processedRecords

          // 尝试从缓存获取索引
          const cachedListData = templateStore.getTemplateListData()
          let currentIndex = -1

          // 如果缓存数据中有索引且列表数据匹配，优先使用缓存索引
          if (
            cachedListData &&
            cachedListData.currentIndex !== undefined &&
            cachedListData.currentIndex >= 0 &&
            cachedListData.list &&
            cachedListData.list.length > 0 &&
            cachedListData.list.length === processedRecords.length
          ) {
            // 检查缓存列表的第一个和最后一个ID是否匹配，如果匹配则使用缓存索引
            const firstMatches = cachedListData.list[0]?.id === processedRecords[0]?.id
            const lastMatches =
              cachedListData.list[cachedListData.list.length - 1]?.id ===
              processedRecords[processedRecords.length - 1]?.id
            if (firstMatches && lastMatches) {
              currentIndex = cachedListData.currentIndex
            }
          }

          // 如果缓存索引无效，通过ID查找
          if (currentIndex < 0) {
            const currentAssetId = templateDetail.value?.id
            currentIndex = processedRecords.findIndex((item: any) => item.id === currentAssetId)
          }

          if (currentIndex >= 0 && currentIndex < processedRecords.length) {
            // 当前资产在列表中，设置为选中并更新详情
            selectedThumbnail.value = currentIndex
            templateDetail.value = {
              ...processedRecords[currentIndex],
              ...templateDetail.value, // 保留详情接口返回的额外字段
            }
          } else {
            // 如果当前资产不在当前页，将其插入到列表开头并选中
            if (templateDetail.value) {
              const currentAsset = {
                ...templateDetail.value,
                imgUrl: templateDetail.value.imageUrl || templateDetail.value.imgUrl,
              }
              relatedTemplates.value = [currentAsset, ...processedRecords]
              selectedThumbnail.value = 0
            } else {
              // 如果没有详情数据，默认选中第一项
              if (processedRecords.length > 0) {
                selectedThumbnail.value = 0
                templateDetail.value = processedRecords[0] as CreativeTemplate
              }
            }
          }
        } else {
          relatedTemplates.value.push(...processedRecords)
        }

        // 根据总数和当前页数据判断是否还有更多数据
        const currentTotal = relatedTemplates.value.length
        hasMoreRelated.value = currentTotal < total
      }
    } else if (pageTypeRef.value === 'like') {
      // 我的喜欢页面：加载用户点赞的模板
      const userId = userStore.userInfo?.userId
      if (!userId) {
        return
      }

      const response = await userApi.getUserLikesPage({
        userId: String(userId),
        size: relatedPageParams.value.size,
        current: relatedPageParams.value.current,
      })

      if (response.code === '0000' && response.data) {
        let { records, total } = response.data as any

        // 处理数据格式，确保有正确的字段
        const processedRecords = records.map((item: any) => {
          // 如果返回的是点赞记录，需要提取模板信息
          if (item.creativeTemplate) {
            return {
              ...item.creativeTemplate,
              likeId: item.id, // 保留点赞记录ID
            }
          }
          return item
        })

        if (isRefresh) {
          // 找到当前模板在列表中的位置
          const currentTemplateId = templateDetail.value?.id
          let foundIndex = -1

          if (currentTemplateId) {
            foundIndex = processedRecords.findIndex(
              (item: any) =>
                item.id === currentTemplateId || item.creativeTemplate?.id === currentTemplateId
            )
          }

          if (foundIndex >= 0) {
            // 当前模板在列表中，使用列表数据并设置正确的索引
            relatedTemplates.value = processedRecords
            selectedThumbnail.value = foundIndex
            // 使用列表中的数据更新详情（确保数据一致）
            templateDetail.value = {
              ...processedRecords[foundIndex],
              ...templateDetail.value, // 保留详情接口返回的额外字段
            }
          } else {
            // 如果当前模板不在列表中，将其插入到列表开头并选中
            if (templateDetail.value) {
              relatedTemplates.value = [templateDetail.value as any, ...processedRecords]
              selectedThumbnail.value = 0
            } else {
              // 如果没有详情数据，使用列表数据
              relatedTemplates.value = processedRecords
              if (processedRecords.length > 0) {
                selectedThumbnail.value = 0
                templateDetail.value = processedRecords[0] as CreativeTemplate
              }
            }
          }
        } else {
          relatedTemplates.value.push(...processedRecords)
        }

        // 根据总数和当前页数据判断是否还有更多数据
        const currentTotal = relatedTemplates.value.length
        hasMoreRelated.value = currentTotal < total
      }
    } else {
      // 其他页面（template）：加载相关模板
      const cateId = props.cateId || (route.query.cateId as string)
      const response = await creativeApi.getCreativeTemplateList({
        titleId: cateId,
        userId: userStore.userInfo?.userId,
        size: relatedPageParams.value.size,
        current: relatedPageParams.value.current,
      })

      if (response.code === '0000') {
        let { records, total } = (response.data as any) || {}

        if (isRefresh) {
          // 找到当前模板在列表中的位置
          const currentTemplateId = templateDetail.value?.id
          let foundIndex = -1

          if (currentTemplateId) {
            foundIndex = records.findIndex((item: any) => item.id === currentTemplateId)
          }

          if (foundIndex >= 0) {
            // 当前模板在列表中，使用列表数据并设置正确的索引
            relatedTemplates.value = records
            selectedThumbnail.value = foundIndex
            // 使用列表中的数据更新详情（确保数据一致）
            templateDetail.value = {
              ...records[foundIndex],
              ...templateDetail.value, // 保留详情接口返回的额外字段
            }
          } else {
            // 如果当前模板不在列表中，将其插入到列表开头并选中
            if (templateDetail.value) {
              relatedTemplates.value = [templateDetail.value as any, ...records]
              selectedThumbnail.value = 0
            } else {
              // 如果没有详情数据，使用列表数据
              relatedTemplates.value = records
              if (records.length > 0) {
                selectedThumbnail.value = 0
                templateDetail.value = records[0] as CreativeTemplate
              }
            }
          }
        } else {
          relatedTemplates.value.push(...records)
        }

        // 根据总数和当前页数据判断是否还有更多数据
        const currentTotal = relatedTemplates.value.length
        hasMoreRelated.value = currentTotal < total
      }
    }
  } catch (error) {
    console.error('获取相关数据失败:', error)
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
  // 取消滚动停顿触发的详情请求，避免“刚滚动完 + 立刻点击”产生多次详情请求
  clearScrollDetailTimer()

  // 验证索引有效性
  if (index < 0 || index >= relatedTemplates.value.length) {
    console.warn('[selectThumbnail] 无效的索引:', index, '列表长度:', relatedTemplates.value.length)
    isUserClickingThumbnail.value = false
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
  if (currentTemplate?.id) {
    // 异步加载详情，不阻塞滚动
    loadDetailOnce(currentTemplate.id).catch((err) => {
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
      syncMediaContainerToSelected()

      // 滚动完成后，延迟重置标志（确保所有滚动事件处理完成）
      // 根据滚动距离计算延迟时间：每个项大约需要 100-200ms，从第1个到第5个需要更多时间
      const scrollDistance = Math.abs(index - (previousThumbnailIndex.value || 0))
      const delay = Math.max(500, scrollDistance * 150) // 每个项150ms，最少500ms

      setTimeout(() => {
        // 延迟重置标志，确保滚动事件处理完成
        isUserClickingThumbnail.value = false
        console.log('[缩略图点击] 标志已重置，允许滚动触发详情加载')
      }, delay)
    })
  })

  console.log('缩略图切换:', {
    from: previousThumbnailIndex.value,
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
  const textToCopy = text || descriptionText.value
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
  const imageUrl = item.imageUrl || item.imgUrl || item.fileUrl
  if (!imageUrl) {
    ElMessage.warning('图片地址不存在')
    return
  }

  // 收集所有图片类型的URL用于预览列表
  const imageUrls = relatedTemplates.value
    .filter((t) => isImageType(t)) // 只包含图片类型
    .map((t) => t.imageUrl || t.imgUrl || t.fileUrl)
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
    await userStore.getUserInfo(phone)
  } catch (e) {
    console.warn('[TemplateDetail] 刷新用户信息失败（忽略，继续走本地状态）:', e)
  }
}

// 确保资产有 noWatermarkUrl（如果没有则调用接口获取）
const ensureNoWatermarkUrlForAsset = async (asset: any): Promise<string | null> => {
  if (asset?.noWatermarkUrl) {
    return asset.noWatermarkUrl
  }

  try {
    const userId = userStore.userInfo?.userId
    if (!userId) {
      console.warn('[TemplateDetail] 用户ID不存在，无法获取无水印URL')
      return null
    }

    const taskResultId = asset?.id || templateDetail.value?.id
    if (!taskResultId) {
      console.warn('[TemplateDetail] 资产ID不存在，无法获取无水印URL')
      return null
    }

    const res = await creativeApi.findAlgorithmResulList({
      taskResultIds: [String(taskResultId)],
      userId: String(userId),
    })

    if (res.code === '0000' && res.data) {
      const list: any[] =
        (Array.isArray(res.data) ? res.data : null) ||
        (Array.isArray((res.data as any)?.records) ? (res.data as any).records : null) ||
        (Array.isArray((res.data as any)?.list) ? (res.data as any).list : null) ||
        []
      const hit = list.find((it) => String(it?.id) === String(taskResultId)) || list[0]
      const fetchedNoWatermarkUrl = hit?.noWatermarkUrl

      if (fetchedNoWatermarkUrl) {
        // 更新内存中的数据
        if (templateDetail.value) {
          ; (templateDetail.value as any).noWatermarkUrl = fetchedNoWatermarkUrl
        }
        if (
          selectedThumbnail.value >= 0 &&
          selectedThumbnail.value < relatedTemplates.value.length
        ) {
          ; (relatedTemplates.value[selectedThumbnail.value] as any).noWatermarkUrl =
            fetchedNoWatermarkUrl
        }
        return fetchedNoWatermarkUrl
      }
    }
  } catch (e) {
    console.warn('[TemplateDetail] 获取 noWatermarkUrl 失败:', e)
  }
  return null
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
const handleWatermarkToggleChange = (val: string | number | boolean) => {
  const enabled = val === true || val === 1 || val === '1' || val === 'true'
  // 如果不是会员，打开会员购买弹窗
  if (!isUserVip.value) {
    pendingAfterVipAction.value = { type: 'toggle' }
    showCoinInsufficient.value = true
    coinErrorType.value = 'up_vip'
    watermarkStore.setRemoveWatermarkEnabled(false)
    return
  }

  // 如果是会员，检查是否需要显示责任声明
  const noRemind = localStorage.getItem('watermark_disclaimer_no_remind') === 'true'
  if (!noRemind && enabled) {
    // 显示责任声明弹窗
    pendingAfterVipAction.value = { type: 'toggle' }
    showWatermarkDisclaimer.value = true
    watermarkStore.setRemoveWatermarkEnabled(false)
    return
  }

  // 更新状态
  watermarkStore.setRemoveWatermarkEnabled(enabled)
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
        showWatermarkDisclaimer.value = true
      } else {
        watermarkStore.setRemoveWatermarkEnabled(true)
      }
    } else if (pendingAfterVipAction.value.type === 'brandWatermark') {
      // 品牌水印入口购买成功后，自动打开品牌水印弹窗
      pendingAfterVipAction.value = null
      showBrandWatermarkModal.value = true
    }
  }
}

// 处理责任声明确认
const handleWatermarkDisclaimerConfirm = () => {
  showWatermarkDisclaimer.value = false
  watermarkStore.setRemoveWatermarkEnabled(true)
  // 如果之前有待处理的下载操作，继续执行
  if (pendingAfterVipAction.value?.type === 'download') {
    pendingAfterVipAction.value = null
    handleDownload()
  } else if (pendingAfterVipAction.value?.type === 'toggle') {
    pendingAfterVipAction.value = null
  }
}

// 处理责任声明取消
const handleWatermarkDisclaimerCancel = () => {
  showWatermarkDisclaimer.value = false
  watermarkStore.setRemoveWatermarkEnabled(false)
  pendingAfterVipAction.value = null
}

// 处理不再弹窗提醒变化
const handleWatermarkDisclaimerNoRemindChange = (noRemind: boolean) => {
  localStorage.setItem('watermark_disclaimer_no_remind', noRemind ? 'true' : 'false')
}

// 下载/保存资产（参考资产列表的下载逻辑）
const handleDownload = async () => {
  if (!templateDetail.value) return

  if (isDownloading.value) return // 防止重复点击

  try {
    isDownloading.value = true
    // 优先使用当前选中项的数据（因为 MediaPlayer 使用的是 relatedTemplates 中的数据）
    // 如果 relatedTemplates 中有数据，优先使用；否则使用 templateDetail
    const currentItem =
      selectedThumbnail.value >= 0 && selectedThumbnail.value < relatedTemplates.value.length
        ? relatedTemplates.value[selectedThumbnail.value]
        : templateDetail.value

    // 根据文件类型选择下载 URL（与资产列表逻辑一致）
    const isVideo = isVideoType(currentItem)

    // 详情页去除水印逻辑（仅资产详情生效）：
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

    let downloadUrl = isVideo ? currentItem.fileUrl : currentItem.imageUrl || currentItem.imgUrl

    // 如果需要去除水印，尝试获取 noWatermarkUrl
    if (pageTypeRef.value === 'assets' && wantRemoveWatermark && isUserVip.value) {
      const noWatermarkUrl = await ensureNoWatermarkUrlForAsset(currentItem)
      if (noWatermarkUrl) {
        downloadUrl = noWatermarkUrl
      }
    }

    console.log('[handleDownload] 下载信息:', {
      isVideo,
      selectedThumbnail: selectedThumbnail.value,
      currentItem,
      fileUrl: currentItem.fileUrl,
      imageUrl: currentItem.imageUrl,
      imgUrl: currentItem.imgUrl,
      downloadUrl,
      templateDetailFileUrl: templateDetail.value.fileUrl,
      relatedTemplatesLength: relatedTemplates.value.length,
    })

    if (!downloadUrl) {
      ElMessage.warning('文件地址无效')
      return
    }

    // 文件名生成（与资产列表逻辑一致）
    const filePrefix = 'chaotuishou'
    const namePart =
      currentItem?.prompt ||
      currentItem?.title ||
      currentItem?.name ||
      templateDetail.value?.prompt ||
      templateDetail.value?.title ||
      templateDetail.value?.name ||
      (isVideo ? 'video' : 'image')

    // 文件扩展名：视频 mp4，图片 png（与资产列表逻辑一致）
    const fileExtension = isVideo ? 'mp4' : 'png'

    try {
      await watermarkDownloader.download([downloadUrl], {
        filename: `${filePrefix}_${namePart}_${Date.now()}.${fileExtension}`,
        silent: false,
      })
    } catch (err) {
      console.warn('[下载] 跨域或网络限制，使用跳转方式下载', err)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.target = '_blank'
      link.rel = 'noopener'
      link.download = `${filePrefix}_${namePart}_${Date.now()}.${fileExtension}`
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

const loadDetailOnce = async (id?: string | number) => {
  if (!id) return
  // 只要 id 相同且已成功回写过，就不重复请求
  if (lastLoadedDetailId.value != null && String(lastLoadedDetailId.value) === String(id)) return
  // 同一 id 正在请求中，直接跳过（避免滚动 + 点击触发重复请求）
  if (inFlightDetailId.value != null && String(inFlightDetailId.value) === String(id)) return

  // 设置当前目标 id，用于丢弃过期响应
  currentDetailTargetId.value = id
  const token = ++detailRequestToken.value
  inFlightDetailId.value = id
  try {
    await loadTemplateDetail(id, { token, expectedId: id })
  } finally {
    // 只清理由本次请求设置的 inFlight（防止快速切换时误清空）
    if (inFlightDetailId.value != null && String(inFlightDetailId.value) === String(id)) {
      inFlightDetailId.value = null
    }
  }
}

// 左侧媒体容器滚动监听 - 同步选中项和右侧缩略图
const handleMediaContainerScroll = async (event: Event) => {
  // 每次滚动先清理待触发的详情请求
  clearScrollDetailTimer()

  // 如果是用户点击缩略图触发的滚动
  if (isUserClickingThumbnail.value) {
    const target = event.target as HTMLElement
    if (!target || relatedTemplates.value.length === 0) return

    const { scrollTop, clientHeight } = target
    const itemHeight = clientHeight
    const currentIndex = Math.floor(scrollTop / itemHeight)
    const validIndex = Math.max(0, Math.min(currentIndex, relatedTemplates.value.length - 1))
    // 关键：点击触发的平滑滚动过程中，不要用“滚动中的临时 index”覆盖详情展示
    // 否则会出现：缩略图已选中第2个，但滚动经过第1个时把详情刷回第1个（错位）

    // 只有当滚动到目标位置时，才调用详情接口
    if (validIndex === selectedThumbnail.value && validIndex < relatedTemplates.value.length) {
      const targetTemplate = relatedTemplates.value[validIndex]
      // 调用详情接口获取完整数据（如果还没有加载过）
      if (lastLoadedDetailId.value !== targetTemplate.id) {
        await loadDetailOnce(targetTemplate.id)
      }
    }

    // 同步右侧缩略图滚动
    const scrollPercentage =
      relatedTemplates.value.length > 1 ? validIndex / (relatedTemplates.value.length - 1) : 0
    syncRightThumbnailScroll(scrollPercentage)

    return // 直接返回，不执行后续的详情加载逻辑
  }

  const target = event.target as HTMLElement
  if (!target || relatedTemplates.value.length === 0) return

  const { scrollTop, clientHeight } = target

  // 每个媒体项占据完整的视口高度（100vh = clientHeight）
  const itemHeight = clientHeight

  // 根据滚动位置计算当前应该选中的项（向下取整，因为 scroll-snap 会对齐到开始位置）
  const currentIndex = Math.floor(scrollTop / itemHeight)

  // 确保索引在有效范围内
  const validIndex = Math.max(0, Math.min(currentIndex, relatedTemplates.value.length - 1))

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

    // 滚动停顿后再加载选中项详情，避免滚动过程频繁请求
    if (currentTemplate.id) {
      scrollDetailTimer = window.setTimeout(async () => {
        await loadDetailOnce(currentTemplate.id)
      }, 200)
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
  const { clientHeight } = container

  // 每个媒体项占据完整的视口高度（100vh = clientHeight）
  const itemHeight = clientHeight

  // 根据选中索引计算目标滚动位置（每个项的开始位置）
  const targetScrollTop = selectedThumbnail.value * itemHeight

  // 初始加载时使用立即滚动，避免看到滚动过程
  container.scrollTo({
    top: targetScrollTop,
    behavior: instant ? 'auto' : 'smooth',
  })

  console.log('滚动到选中项:', {
    index: selectedThumbnail.value,
    itemHeight,
    targetScrollTop,
    containerHeight: clientHeight,
    instant,
  })
}

// 切换喜欢状态（用于template和like页面）
// 当前详情页 UI 已不展示“喜欢”入口；为避免 noUnusedLocals 导致 build 失败，先移除该逻辑

// 资产收藏操作（用于assets页面）
const handleAssetsCollect = async () => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    return
  }
  if (!templateDetail.value) return

  try {
    const isCollecting = !templateDetail.value.isCollect
    const userId = userStore.userInfo?.userId
    if (!userId) {
      ElMessage.warning('请先登录')
      return
    }
    const params: any = {
      userId,
    }

    if (isCollecting) {
      params.dataIds = [templateDetail.value.id]
    } else {
      if (templateDetail.value.collectId) {
        params.collectIds = [templateDetail.value.collectId]
      } else {
        ElMessage.error('收藏信息丢失')
        return
      }
    }

    const response = await assetApi.batchCollect(params)
    if (response.code === '0000') {
      templateDetail.value.isCollect = isCollecting ? 1 : 0
      templateDetail.value.collectId = (response.data as any)?.collectIds?.[0] || null
      ElMessage.success(isCollecting ? '收藏成功' : '取消收藏')
    } else {
      ElMessage.error(response.msg || '网络开小差了~，请稍后再试')
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

// 删除处理（仅资产页面可用）
const handleDelete = async () => {
  if (pageTypeRef.value !== 'assets') {
    ElMessage.warning('只有我的资产页面可以删除')
    return
  }

  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    return
  }

  if (!templateDetail.value) {
    ElMessage.warning('数据不存在')
    return
  }

  try {
    const userId = userStore.userInfo?.userId
    if (!userId) {
      ElMessage.warning('请先登录')
      return
    }

    // 确认删除
    await ElMessageBox.confirm('确定要删除这个资产吗？删除后无法恢复。', '确认删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    const params = {
      taskResultIds: [templateDetail.value.id],
      userId,
    }

    const response = await assetApi.batchDelete(params)
    if (response.code === '0000') {
      ElMessage.success('删除成功')
      const deletedAssetId = templateDetail.value.id
      // 触发 delete 事件，通知父组件更新列表
      if (deletedAssetId !== undefined && deletedAssetId !== null) {
        emit('delete', deletedAssetId)
      }
      // 返回上一页
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
  // 获取页面类型参数（优先使用 props，否则使用路由参数）
  pageTypeRef.value = props.pageType || (route.query.pageType as string) || 'template'
  cateTitleRef.value = props.cateTitle || (route.query.cateTitle as string) || ''
  sourceTabRef.value = props.sourceTab || (route.query.sourceTab as string) || ''

  // ===== 临时：AI服装设计详情先用静态数据展示（不调用接口）=====
  // 触发条件：从 AI 工作台进入详情（assets + sourceTab=aiFashionStudio），或显式携带 ?mock=1
  if (
    (pageTypeRef.value === 'assets' && sourceTabRef.value === 'aiFashionStudio') ||
    String(route.query.mock || '') === '1'
  ) {
    const now = new Date()
    const dateText = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
      now.getDate()
    ).padStart(2, '0')}`

    // 兼容：如果从 AiFashionStudio 来，通常会带 query.mode（aiFashion / sketchToReal / realToSketch / fabricCreative）
    // 若未带，兜底使用当前详情的 typeName/titleName 关键词
    const normalizeMode = (v: any): DetailModule => {
      const raw = String(v || '').trim()
      if (raw === 'aiFashion' || raw === 'sketchToReal' || raw === 'realToSketch' || raw === 'fabricCreative') {
        return raw
      }
      if (raw.includes('线稿转实物')) return 'sketchToReal'
      if (raw.includes('实物转线稿')) return 'realToSketch'
      if (raw.includes('面料')) return 'fabricCreative'
      return 'aiFashion'
    }

    // 优先级：URL query.mode > 缓存列表 mode > 兼容字段(detailModule/module)
    const cachedMode = (templateStore.getTemplateListData() as any)?.mode
    const mode = normalizeMode(route.query.mode || cachedMode || route.query.detailModule || route.query.module)

    const buildMockRequestParam = (m: DetailModule) => {
      const common = {
        // 参数 tag（右侧“LingImage 1.0 / 3:4 / 2K / 图片”）
        algorithmName: 'LingImage 1.0',
        aspectRatio: '3:4',
        resolution: '2K',
        quality: '图片',
        // 款型
        category: '女装',
        clothType: '上装',
        subKind: m === 'sketchToReal' ? '卫衣' : 'T恤',
        // 时间
        createTime: dateText,
      }

      if (m === 'sketchToReal') {
        return {
          ...common,
          // 参考图（线稿输入）
          imageUrl: images.aiDesign1,
          imageUrls: [images.aiDesign1],
          // 线稿转实物专属字段（右侧展示用）
          sketchType: '黑白线稿',
          sketchStyle: '轮廓线稿',
          outputType: '平铺图',
          // 创意描述
          prompt: '黑白线稿转写实服装，上衣卫衣，布料质感清晰，高清细节，写实光影',
          creativeDescription: '黑白线稿转写实服装，上衣卫衣，布料质感清晰，高清细节，写实光影',
        }
      }

      if (m === 'realToSketch') {
        return {
          ...common,
          imageUrl: images.design2,
          imageUrls: [images.design2],
          lineType: '黑白线稿',
          lineStyle: '轮廓线稿',
          prompt: '实物照片生成黑白线稿，保留结构比例与关键褶皱',
          creativeDescription: '实物照片生成黑白线稿，保留结构比例与关键褶皱',
        }
      }

      if (m === 'fabricCreative') {
        return {
          ...common,
          imageUrl: images.design3,
          imageUrls: [images.design3],
          outputType: '模特图',
          prompt: '面料创拍，突出面料纹理与垂坠感，商业级布料质感',
          creativeDescription: '面料创拍，突出面料纹理与垂坠感，商业级布料质感',
        }
      }

      // aiFashion
      return {
        ...common,
        // 参考图（右侧“参考图”区域）
        imageUrl: images.design1,
        imageUrls: [images.design1],
        // 款型/设计特征（用于右侧展示）
        features: ['A型', '白色', '牛仔面料', '小香风'],
        // 创意描述
        prompt: '无领 米白色 长款 宽松版型 毛呢大衣，20岁欧洲短发女模特穿着，时尚街拍，高清细节',
        creativeDescription:
          '无领 米白色 长款 宽松版型 毛呢大衣，20岁欧洲短发女模特穿着，时尚街拍，高清细节',
      }
    }

    const buildMockList = (m: DetailModule) => {
      // 左侧/右侧多图预览：保证 MediaPlayer 的 :src 有值（图片用 fileUrl 传入）
      const baseId = String(route.params.id || 'mock')
      if (m === 'sketchToReal') {
        return [
          {
            id: `${baseId}-sketch`,
            typeName: '线稿转实物',
            titleName: '线稿转实物',
            fileType: 1,
            imageUrl: images.aiDesign1,
            imgUrl: images.aiDesign1,
            fileUrl: images.aiDesign1,
          },
          {
            id: `${baseId}-real-1`,
            typeName: '线稿转实物',
            titleName: '线稿转实物',
            fileType: 1,
            imageUrl: images.design2,
            imgUrl: images.design2,
            fileUrl: images.design2,
          },
          {
            id: `${baseId}-real-2`,
            typeName: '线稿转实物',
            titleName: '线稿转实物',
            fileType: 1,
            imageUrl: images.design4,
            imgUrl: images.design4,
            fileUrl: images.design4,
          },
        ]
      }
      // 其它类型先给 1 张即可（后续需要多图再扩展）
      return [
        {
          id: `${baseId}-${m}-1`,
          typeName:
            m === 'realToSketch'
              ? '实物转线稿'
              : m === 'fabricCreative'
                ? '面料创拍'
                : 'AI服装设计',
          titleName:
            m === 'realToSketch'
              ? '实物转线稿'
              : m === 'fabricCreative'
                ? '面料创拍'
                : 'AI服装设计',
          fileType: 1,
          imageUrl: m === 'realToSketch' ? images.design2 : m === 'fabricCreative' ? images.design3 : images.design1,
          imgUrl: m === 'realToSketch' ? images.design2 : m === 'fabricCreative' ? images.design3 : images.design1,
          fileUrl: m === 'realToSketch' ? images.design2 : m === 'fabricCreative' ? images.design3 : images.design1,
        },
      ]
    }

    const list = buildMockList(mode)
    const mockRequestParam = buildMockRequestParam(mode)

    const mockDetail: any = {
      ...list[0],
      createTime: dateText,
      requestParam: JSON.stringify(mockRequestParam),
      isCollect: 0,
      isLike: 0,
    }

    templateDetail.value = mockDetail
    // 让列表项也带上 requestParam/createTime，避免切换缩略图时右侧回显丢字段
    relatedTemplates.value = list.map((it: any, idx: number) => {
      return {
        ...it,
        createTime: dateText,
        requestParam: JSON.stringify(mockRequestParam),
        isCollect: 0,
        isLike: 0,
        // 让第 0 张当作“主详情”
        id: it.id || `${mockDetail.id}-${idx}`,
      }
    })
    selectedThumbnail.value = 0
    isDataReady.value = true
    isInitialLoad.value = false
    return
  }

  console.log(
    '[详情页] pageType:',
    pageTypeRef.value,
    'sourceTab:',
    sourceTabRef.value,
    'isModal:',
    props.isModal
  )

  // 对于我的资产页面，如果从列表传过来了收藏状态，先设置（接口返回后会覆盖）
  if (pageTypeRef.value === 'assets') {
    const collectId = props.collectId || (route.query.collectId as string)
    const isCollect =
      props.isCollect !== undefined
        ? props.isCollect
        : route.query.isCollect
          ? Number(route.query.isCollect)
          : undefined
    if (collectId || isCollect !== undefined) {
      // 先初始化一个临时对象，避免后续访问 undefined
      if (!templateDetail.value) {
        templateDetail.value = {} as CreativeTemplate
      }
      if (collectId && templateDetail.value) {
        ; (templateDetail.value as any).collectId = collectId
      }
      if (isCollect !== undefined && templateDetail.value) {
        ; (templateDetail.value as any).isCollect = Number(isCollect)
      }
    }
  }

  // 尝试从store获取列表数据（如果是从列表页跳转过来的）
  const cachedListData = templateStore.getTemplateListData()
  const cateIdFromRoute = props.cateId || (route.query.cateId as string)
  const shouldUseCachedData =
    cachedListData &&
    cachedListData.pageType === pageTypeRef.value &&
    (pageTypeRef.value !== 'template' || cachedListData.cateId === cateIdFromRoute) &&
    (pageTypeRef.value !== 'assets' || cachedListData.sourceTab === sourceTabRef.value)

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
            // 保留一些外层字段（likeId 和 useLikes 可能在外层）
            taskId: item.taskId,
            taskUuid: item.taskUuid,
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
      await loadTemplateDetail()
      if (templateDetail.value) {
        relatedTemplates.value = [templateDetail.value as any]
        selectedThumbnail.value = 0
        isDataReady.value = true
      }
    }
  } else {
    // 没有缓存数据，先加载详情数据（优先显示详情内容）
    await loadTemplateDetail()
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

    .media-container {
      display: flex;
      flex-direction: column;
      flex: 1;
      height: 100%;
      gap: $spacing-md;
      position: relative;
      overflow-y: auto;
      overflow-x: hidden;
      scroll-snap-type: y mandatory;
      scroll-behavior: smooth;

      .back-button {
        position: absolute;
        top: 21px;
        left: 21px;
        width: 36px;
        height: 36px;
        z-index: 999999;
        border: none;
      }

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
        width: 120px;
        height: 27px;
        border-radius: 4px;
        background-color: rgba(18, 18, 18, 1);
        font-size: 14px;
        color: $color-text-white;
        text-align: center;
        font-family: PingFangSC-regular;
        border: 1px solid rgba(255, 255, 255, 0.15);
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
