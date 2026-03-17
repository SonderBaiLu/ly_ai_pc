<template>
  <div class="studio-page">
    <Header />

    <div class="studio-body">
      <!-- 左侧功能栏 -->
      <aside class="left-rail">
        <div v-if="!isFabricEntry" class="rail-item" :class="{ active: leftMenu === 'aiFashion' }"
          @click="leftMenu = 'aiFashion'">
          <div class="rail-icon">
            <img :src="leftMenu !== 'aiFashion' ? images.designIcon : images.designActive" alt="" />
          </div>
          <div class="rail-text">AI服装设计</div>
        </div>
        <div v-if="!isFabricEntry" class="rail-item" :class="{ active: leftMenu === 'sketchToReal' }"
          @click="leftMenu = 'sketchToReal'">
          <div class="rail-icon">
            <img :src="leftMenu !== 'sketchToReal' ? images.sketchIcon : images.sketchActive" alt="" />
          </div>
          <div class="rail-text">线稿转实物</div>
        </div>
        <div v-if="!isFabricEntry" class="rail-item" :class="{ active: leftMenu === 'realToSketch' }"
          @click="leftMenu = 'realToSketch'">
          <div class="rail-icon">
            <img :src="leftMenu !== 'realToSketch' ? images.realIcon : images.realActive" alt="" />
          </div>
          <div class="rail-text">实物转线稿</div>
        </div>

        <div v-if="isFabricEntry" class="rail-item" :class="{ active: leftMenu === 'fabricCreative' }"
          @click="leftMenu = 'fabricCreative'">
          <div class="rail-icon">
            <img :src="images.fabricActive" alt="" />
          </div>
          <div class="rail-text">面料创拍</div>
        </div>
      </aside>

      <!-- 中间：参数 + 结果区 -->
      <main class="studio-main">
        <div class="studio-content">
          <!-- 左侧参数面板 -->
          <section class="param-panel">
            <Fashion v-if="leftMenu === 'aiFashion'" v-model:image-url="refImageUrl"
              :task-result-id="refImageTaskResultId" :creation-type-selection="creationTypeSelectionByMenu.aiFashion"
              @open-type-modal="() => openTypeModal('aiFashion')"
              @clear-type-selection="() => clearTypeSelection('aiFashion')" @drop-file="handleDropFile"
              @delete="handleRefDelete" @coming-soon="showComingSoon" @show-params="openImageParams" />
            <Fabric v-else-if="leftMenu === 'fabricCreative'" v-model:image-url="refImageUrl"
              :task-result-id="refImageTaskResultId"
              :creation-type-selection="creationTypeSelectionByMenu.fabricCreative"
              @open-type-modal="() => openTypeModal('fabricCreative')"
              @clear-type-selection="() => clearTypeSelection('fabricCreative')" @drop-file="handleDropFile"
              @delete="handleRefDelete" @coming-soon="showComingSoon" @show-params="openImageParams"
              @generate="handleFabricGenerate" />
            <SketchToReal v-else-if="leftMenu === 'sketchToReal'" v-model:image-url="refImageUrl"
              :task-result-id="refImageTaskResultId" :creation-type-selection="creationTypeSelectionByMenu.sketchToReal"
              @open-type-modal="() => openTypeModal('sketchToReal')"
              @clear-type-selection="() => clearTypeSelection('sketchToReal')" @drop-file="handleDropFile"
              @delete="handleRefDelete" @coming-soon="showComingSoon" @show-params="openImageParams" />
            <RealToSketch v-else v-model:image-url="refImageUrl" :task-result-id="refImageTaskResultId"
              :creation-type-selection="creationTypeSelectionByMenu.realToSketch"
              @open-type-modal="() => openTypeModal('realToSketch')"
              @clear-type-selection="() => clearTypeSelection('realToSketch')" @drop-file="handleDropFile"
              @delete="handleRefDelete" @coming-soon="showComingSoon" @show-params="openImageParams" />
          </section>

          <!-- 结果列表（主图 + 缩略图） -->
          <section class="result-panel">
            <MainImageDisplay ref="mainImageRef" :assets="assets" :current-index="currentIndex"
              :has-more-data="hasMoreData" :loading="loading" :loading-more="loadingMore"
              @asset-click="(idx) => (currentIndex = idx as any)" @scroll-change="handleScrollChange"
              @load-more="showComingSoon" @view-detail="showComingSoon" @collect="showComingSoon"
              @download="showComingSoon" @delete="showComingSoon" @refresh="showComingSoon" />

            <ThumbnailGallery ref="thumbnailRef" :assets="assets" :current-index="currentIndex"
              :has-more-data="hasMoreData" :loading="(loading || loadingMore) as any"
              @thumbnail-click="handleThumbnailClick" @scroll-sync="handleScrollSync" @load-more="showComingSoon" />
          </section>
        </div>
      </main>
    </div>

    <!-- 模型参数弹窗（父层统一管理，子组件只负责触发 show-params） -->
    <ImageParamPopup v-model="showImageParamPopup" title="参数设置" :default-params="imageDefaultParams"
      :algorithm-models="imageAlgorithmModels" @confirm="handleImageParamsConfirm" @close="handleImageParamsClose" />

    <!-- 款型选择弹窗（父层统一管理，按 leftMenu 分开回显） -->
    <CreationTypeSelectModal v-model="showTypeModal" :selection="activeCreationTypeSelection"
      @confirm="handleTypeConfirm" />
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { images } from '@/assets'
import type { Asset } from '@/composables/useTaskPolling'
import CreationTypeSelectModal, { type CreationTypeSelection } from '@/components/CreationTypeSelectModal.vue'
import Fashion from './left/Fashion.vue'
import SketchToReal from './left/SketchToReal.vue'
import RealToSketch from './left/RealToSketch.vue'
import Fabric from './left/FabricCreative.vue'

type LeftMenuKey = 'aiFashion' | 'sketchToReal' | 'realToSketch' | 'fabricCreative'

const route = useRoute()
const leftMenu = ref<LeftMenuKey>('aiFashion')
const isFabricEntry = route.query.mode === 'fabricCreative'
const showComingSoon = () => ElMessage.warning('暂未开放')

// FabricCreative 生成：先预留接口（子组件会产出“平铺+缩放后的纹理图文件”）
const handleFabricGenerate = (payload: any) => {
  // TODO: 接口联调时，将 payload.file 上传/随请求提交给算法
  console.log('[fabricCreative] generate payload:', payload)
  showComingSoon()
}

// ==================== 款型选择弹窗（父层统一管理） ====================
const showTypeModal = ref(false)
const activeTypeMenu = ref<LeftMenuKey>('aiFashion')

const creationTypeSelectionByMenu = reactive<Record<LeftMenuKey, Partial<CreationTypeSelection>>>({
  aiFashion: {},
  sketchToReal: {},
  realToSketch: {},
  fabricCreative: {},
})

const activeCreationTypeSelection = computed(() => creationTypeSelectionByMenu[activeTypeMenu.value] || {})

const openTypeModal = (menu: LeftMenuKey) => {
  activeTypeMenu.value = menu
  showTypeModal.value = true
}

const clearTypeSelection = (menu: LeftMenuKey) => {
  creationTypeSelectionByMenu[menu] = {}
}

const handleTypeConfirm = (v: CreationTypeSelection) => {
  creationTypeSelectionByMenu[activeTypeMenu.value] = v
}

// ==================== 图片参数弹窗（父层统一管理） ====================
const showImageParamPopup = ref(false)

// 默认回显： [算法名称, 参数1, 参数2, ...]
const imageDefaultParams = ref<string[]>(['LingImage 1.0', '3:4', '2K', '1'])

// 先用本地 mock 数据跑通弹窗展示；后续接接口时替换这里的数据即可
const imageAlgorithmModels = ref<any[]>([
  {
    id: 1,
    code: 'lingimage-1.0',
    name: 'LingImage 1.0',
    algorithmDesc: '视觉专业级生成模型',
    imageUrl: images.imgVideo,
    isVip: 0,
    isDefault: 1,
    paramGroups: [
      {
        type: 1,
        params: [
          { templateName: '9:16', templateDesc: '竖屏/产品标准比例', imageUrl: images.imgVideo, isVip: 0 },
          { templateName: '3:4', templateDesc: '竖屏/产品标准比例', imageUrl: images.imgVideo, isVip: 0 },
          { templateName: '2:3', templateDesc: '竖屏/产品标准比例', imageUrl: images.imgVideo, isVip: 0 },
          { templateName: '1:1', templateDesc: '方图/标准比例', imageUrl: images.imgVideo, isVip: 0 },
          { templateName: '3:2', templateDesc: '横图/标准比例', imageUrl: images.imgVideo, isVip: 0 },
          { templateName: '4:3', templateDesc: '横图/标准比例', imageUrl: images.imgVideo, isVip: 0 },
          { templateName: '16:9', templateDesc: '横屏/宽屏比例', imageUrl: images.imgVideo, isVip: 0 },
          { templateName: '21:9', templateDesc: '横屏/宽屏比例', imageUrl: images.imgVideo, isVip: 1 },
        ],
      },
      {
        type: 4,
        params: [
          { templateName: '2K', templateDesc: '', isVip: 0 },
          { templateName: '4K', templateDesc: '', isVip: 1 },
        ],
      },
      {
        type: 5,
        params: [
          { templateName: '1', templateDesc: '', isVip: 0 },
          { templateName: '2', templateDesc: '', isVip: 0 },
          { templateName: '3', templateDesc: '', isVip: 0 },
          { templateName: '4', templateDesc: '', isVip: 1 },
        ],
      },
    ],
  },
])

const openImageParams = () => {
  showImageParamPopup.value = true
}

const handleImageParamsConfirm = (result: any) => {
  // ImageParamPopup 的 result: { algorithmName, paramList: [{templateName,...}, ...] }
  const algorithmName = String(result?.algorithmName || '').trim()
  const paramNames: string[] = Array.isArray(result?.paramList)
    ? result.paramList.map((p: any) => String(p?.templateName || '').trim()).filter(Boolean)
    : []
  imageDefaultParams.value = [algorithmName || imageDefaultParams.value[0], ...paramNames]
}

const handleImageParamsClose = (_result: any) => {
  // 关闭时不强制更新；需要更新走 confirm 即可
}

// ==================== 右侧：我的资产（列表 + 缩略图） ====================
// 先用本地 mock 数据跑通交互；后续接接口时替换 assets 的赋值即可
const assets = ref<Asset[]>([
  {
    id: 'mock-1',
    taskId: 'mock-1',
    taskUuid: 'mock-1',
    imageUrl: images.aiDesign1,
    fileType: 1,
    prompt: 'AI服装设计-示例1',
    createTime: new Date().toISOString(),
    status: 3,
  },
  {
    id: 'mock-2',
    taskId: 'mock-2',
    taskUuid: 'mock-2',
    imageUrl: images.aiDesign2,
    fileType: 1,
    prompt: 'AI服装设计-示例2',
    createTime: new Date().toISOString(),
    status: 3,
  },
  {
    id: 'mock-3',
    taskId: 'mock-3',
    taskUuid: 'mock-3',
    imageUrl: images.aiDesign3,
    fileType: 1,
    prompt: 'AI服装设计-示例3',
    createTime: new Date().toISOString(),
    status: 3,
  },
])

const currentIndex = ref(0)
const hasMoreData = ref(false)
const loading = ref(false)
const loadingMore = ref(false)

const mainImageRef = ref<any>(null)
const thumbnailRef = ref<any>(null)

const handleThumbnailClick = (idx: number) => {
  currentIndex.value = idx
  mainImageRef.value?.scrollToAsset?.(idx)
}

const handleScrollChange = (scrollPercentage: number) => {
  thumbnailRef.value?.syncScroll?.(scrollPercentage)
}

const handleScrollSync = (scrollPercentage: number) => {
  mainImageRef.value?.syncScroll?.(scrollPercentage)
}

// ==================== 左侧：上传参考图（支持从右侧拖拽） ====================
const refImageUrl = ref('')
const refImageTaskResultId = ref<string | number | undefined>(undefined)

const handleDropFile = (payload: any) => {
  // payload 可能来自：
  // 1) 本地文件拖拽：{ file, type, position }
  // 2) 我的资产拖拽：{ url, taskResultId, type, position, fileType }
  if (payload?.file) {
    const file: File = payload.file
    refImageUrl.value = URL.createObjectURL(file)
    refImageTaskResultId.value = undefined
    return
  }

  if (payload?.url) {
    refImageUrl.value = String(payload.url)
    refImageTaskResultId.value = payload.taskResultId
    return
  }
}

const handleRefDelete = () => {
  refImageUrl.value = ''
  refImageTaskResultId.value = undefined
}

// 根据路由参数初始化当前模块（从 AiDesign 页面跳转时生效）
onMounted(() => {
  const mode = route.query.mode as LeftMenuKey | undefined
  if (mode && ['aiFashion', 'sketchToReal', 'realToSketch', 'fabricCreative'].includes(mode)) {
    leftMenu.value = mode
  }

  // 详情页“重新生成/再次生成”跳转过来时，支持预填参考图
  const refImageUrlFromQuery = route.query.refImageUrl
  if (refImageUrlFromQuery) {
    refImageUrl.value = String(refImageUrlFromQuery)
  }
  const taskResultIdFromQuery = route.query.taskResultId
  if (taskResultIdFromQuery) {
    refImageTaskResultId.value = String(taskResultIdFromQuery)
  }
})
</script>

<style scoped lang="scss">
.studio-page {
  height: 100vh;
  background: $color-bg-black;
  display: flex;
  flex-direction: column;

  .studio-body {
    flex: 1;
    display: flex;
    overflow: hidden; // 固定整页高度，只让内部区域滚动

    .left-rail {
      width: 95px;
      margin-top: 17px;
      background: $color-bg-dark-secondary;
      padding: $spacing-2xl-md 0;
      border-radius: 0px 8px 0px 0px;
      border: 1px solid rgba(255, 255, 255, 0.15);
      display: flex;
      flex-direction: column;
      align-items: center;
      flex-shrink: 0;

      .rail-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        width: 80px;
        height: 80px;
        border: 1px solid transparent;
        border-radius: $border-radius-md;
        cursor: pointer;
        color: $color-text-light-secondary;
        text-align: center;
        transition: all $transition-base;

        &.active {
          background: linear-gradient(135deg, rgba(9, 17, 37, 1) 14.6%, rgba(13, 18, 31, 1) 50%, rgba(22, 29, 49, 1) 85.4%);
          border-color: $color-primary;
          color: $color-primary;
        }

        .rail-icon {
          width: 35px;
          height: 35px;
          margin: 0 auto $spacing-xs;
          display: grid;
          place-items: center;

          img {
            width: 35px;
            height: 35px;
            object-fit: contain;
          }
        }

        .rail-text {
          font-size: $font-size-sm;
        }
      }
    }

    .studio-main {
      flex: 1;
      height: 100%;
      background: $color-bg-black;
      overflow: hidden;

      .studio-content {
        display: grid;
        grid-template-columns: 480px 1fr;
        height: 100%;

        .param-panel {
          padding: 17px 25px 0;
          height: 100%;
          overflow-y: auto;
        }

        .result-panel {
          width: 100%;
          height: 100%;
          display: flex;
          overflow-y: auto;
          overflow-x: hidden;
        }
      }
    }
  }
}
</style>
