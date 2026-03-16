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
              :task-result-id="refImageTaskResultId" @drop-file="handleDropFile" @delete="handleRefDelete"
              @coming-soon="showComingSoon" />
            <Fabric v-else-if="leftMenu === 'fabricCreative'" v-model:image-url="refImageUrl"
              :task-result-id="refImageTaskResultId" @drop-file="handleDropFile" @delete="handleRefDelete"
              @coming-soon="showComingSoon" />
            <SketchToReal v-else-if="leftMenu === 'sketchToReal'" v-model:image-url="refImageUrl"
              :task-result-id="refImageTaskResultId" @drop-file="handleDropFile" @delete="handleRefDelete"
              @coming-soon="showComingSoon" />
            <RealToSketch v-else v-model:image-url="refImageUrl" :task-result-id="refImageTaskResultId"
              @drop-file="handleDropFile" @delete="handleRefDelete" @coming-soon="showComingSoon" />
          </section>

          <!-- 中间结果列表（先用现成组件空态占位） -->
          <section class="result-panel">
            <MainImageDisplay ref="mainImageRef" :assets="assets" :current-index="currentIndex"
              :has-more-data="hasMoreData" :loading="loading" :loading-more="loadingMore"
              @asset-click="(idx) => (currentIndex = idx as any)" @scroll-change="handleScrollChange"
              @load-more="showComingSoon" @view-detail="showComingSoon" @collect="showComingSoon"
              @download="showComingSoon" @delete="showComingSoon" @refresh="showComingSoon" />
          </section>

          <!-- 右侧缩略图栏（先占位） -->
          <aside class="thumb-rail">
            <ThumbnailGallery ref="thumbnailRef" :assets="assets" :current-index="currentIndex"
              :has-more-data="hasMoreData" :loading="(loading || loadingMore) as any"
              @thumbnail-click="handleThumbnailClick" @scroll-sync="handleScrollSync" @load-more="showComingSoon" />
          </aside>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { images } from '@/assets'
import type { Asset } from '@/composables/useTaskPolling'
import Fashion from './left/Fashion.vue'
import SketchToReal from './left/SketchToReal.vue'
import RealToSketch from './left/RealToSketch.vue'
import Fabric from './left/FabricCreative.vue'

type LeftMenuKey = 'aiFashion' | 'sketchToReal' | 'realToSketch' | 'fabricCreative'

const route = useRoute()
const leftMenu = ref<LeftMenuKey>('aiFashion')
const isFabricEntry = route.query.mode === 'fabricCreative'
const showComingSoon = () => ElMessage.warning('暂未开放')

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
  background: $color-bg-dark;
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
      padding: $spacing-2xl-md $spacing-sm;
      border-radius: 0px 8px 0px 0px;
      border: 1px solid rgba(255, 255, 255, 0.15);
      display: flex;
      flex-direction: column;
      flex-shrink: 0;

      .rail-item {
        padding: $spacing-sm-md 0;
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
      overflow: hidden;

      .studio-content {
        display: grid;
        grid-template-columns: 480px minmax(520px, 1fr) 98px;
        gap: $spacing-md;
        height: 100%;

        .param-panel {
          padding: 17px 25px 0;
          height: 100%;
          overflow-y: auto;
        }

        .result-panel {
          height: 100%;
          overflow-y: auto;
        }

        .thumb-rail {
          height: 100%;
          overflow-y: auto;
        }
      }
    }
  }
}
</style>
