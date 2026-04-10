<template>
  <div class="studio-page">
    <Header />

    <div class="studio-body">
      <!-- 左侧功能栏 -->
      <aside class="left-rail">
        <div v-for="item in leftRailItems" :key="item.key" class="rail-item" :class="{ active: leftMenu === item.key }"
          @click="leftMenu = item.key">
          <div class="rail-icon">
            <img :src="leftMenu === item.key ? item.functionIconSelected : item.functionIcon" alt="" />
          </div>
          <div class="rail-text">{{ item.label }}</div>
        </div>
      </aside>

      <!-- 中间：参数 + 结果区 -->
      <main class="studio-main">
        <div class="studio-content">
          <!-- 左侧参数面板 -->
          <section class="param-panel">
            <Fashion v-if="leftMenu === 'aiFashion'" v-model:image-url="formDataByMenu.aiFashion.image"
              v-model:prompt="formDataByMenu.aiFashion.prompt" :task-result-id="formDataByMenu.aiFashion.taskResultId"
              :creation-type-selection="formDataByMenu.aiFashion.creationTypeSelection" :submitting="loading"
              :uploading="refImageUploading" :default-image-params="currentImageDefaultParams"
              :inspiration-words="formDataByMenu.aiFashion.inspirationWords" :coin="imageCoin" :menu-id="currentMenuId"
              @open-type-modal="() => openTypeModal('aiFashion')"
              @clear-type-selection="() => clearTypeSelection('aiFashion')" @drop-file="handleDropFile"
              @delete="handleRefDelete" @coming-soon="showComingSoon" @show-params="openImageParams"
              @update:design-features-params="(v) => (formDataByMenu.aiFashion.designFeaturesParams = v)"
              @generate="handleAiFashionGenerate" @inspiration-library="handleInspirationLibrary"
              @show-history="openHistoryModal"
              @update:inspiration-words="(words) => formDataByMenu.aiFashion.inspirationWords = words" />
            <Fabric v-else-if="leftMenu === 'fabricCreative'" v-model:image-url="formDataByMenu.fabricCreative.image"
              v-model:prompt="formDataByMenu.fabricCreative.prompt"
              :task-result-id="formDataByMenu.fabricCreative.taskResultId"
              :creation-type-selection="creationTypeSelectionByMenu.fabricCreative"
              :inspiration-words="formDataByMenu.fabricCreative.inspirationWords" :coin="imageCoin"
              :default-image-params="currentImageDefaultParams" :submitting="loading" :menu-id="currentMenuId"
              :uploading="refImageUploading" @open-type-modal="() => openTypeModal('fabricCreative')"
              @clear-type-selection="() => clearTypeSelection('fabricCreative')" @drop-file="handleDropFile"
              @delete="handleRefDelete" @coming-soon="showComingSoon" @show-params="openImageParams"
              @generate="handleFabricGenerate" @inspiration-library="handleInspirationLibrary"
              @show-history="openHistoryModal"
              @update:inspiration-words="(words) => formDataByMenu.fabricCreative.inspirationWords = words" />
            <SketchToReal v-else-if="leftMenu === 'sketchToReal'" v-model:image-url="formDataByMenu.sketchToReal.image"
              v-model:prompt="formDataByMenu.sketchToReal.prompt"
              :sketch-param-selections="formDataByMenu.sketchToReal.sketchParamSelections"
              :param-categories="sketchToRealParamCategories" :task-result-id="formDataByMenu.sketchToReal.taskResultId"
              :creation-type-selection="creationTypeSelectionByMenu.sketchToReal"
              :inspiration-words="formDataByMenu.sketchToReal.inspirationWords" :coin="imageCoin"
              :default-image-params="currentImageDefaultParams" :submitting="loading" :menu-id="currentMenuId"
              :uploading="refImageUploading" @open-type-modal="() => openTypeModal('sketchToReal')"
              @clear-type-selection="() => clearTypeSelection('sketchToReal')" @drop-file="handleDropFile"
              @delete="handleRefDelete" @coming-soon="showComingSoon" @show-params="openImageParams"
              @generate="handleSketchToRealGenerate" @inspiration-library="handleInspirationLibrary"
              @show-history="openHistoryModal"
              @update:sketch-param-selections="(v) => (formDataByMenu.sketchToReal.sketchParamSelections = v)"
              @update:inspiration-words="(words) => (formDataByMenu.sketchToReal.inspirationWords = words)" />
            <RealToSketch v-else v-model:image-url="formDataByMenu.realToSketch.image"
              v-model:prompt="formDataByMenu.realToSketch.prompt"
              :sketch-param-selections="formDataByMenu.realToSketch.sketchParamSelections"
              :param-categories="realToSketchParamCategories" :task-result-id="formDataByMenu.realToSketch.taskResultId"
              :creation-type-selection="creationTypeSelectionByMenu.realToSketch"
              :inspiration-words="formDataByMenu.realToSketch.inspirationWords" :coin="imageCoin"
              :default-image-params="currentImageDefaultParams" :submitting="loading" :menu-id="currentMenuId"
              :uploading="refImageUploading" @open-type-modal="() => openTypeModal('realToSketch')"
              @clear-type-selection="() => clearTypeSelection('realToSketch')" @drop-file="handleDropFile"
              @delete="handleRefDelete" @coming-soon="showComingSoon" @show-params="openImageParams"
              @generate="handleRealToSketchGenerate" @inspiration-library="handleInspirationLibrary"
              @show-history="openHistoryModal"
              @update:sketch-param-selections="(v) => (formDataByMenu.realToSketch.sketchParamSelections = v)"
              @update:inspiration-words="(words) => (formDataByMenu.realToSketch.inspirationWords = words)" />
          </section>

          <!-- 结果列表（主图 + 缩略图） -->
          <section class="result-panel">
            <MainImageDisplay ref="mainImageRef" :assets="assets" :current-index="currentIndex"
              :has-more-data="hasMoreData" :loading="listLoading" :loading-more="loadingMore" :is-vip="isUserVip"
              :remove-watermark-enabled="removeWatermarkEnabled" :content-tabs="rightContentTabs"
              :active-tab-key="currentContentTab" @asset-click="(idx: number) => (currentIndex = idx as any)"
              @scroll-change="handleScrollChange" @tab-change="handleContentTabChange" @load-more="handleLoadMore"
              @view-detail="handleViewDetail" @collect="handleCollect" @download="handleAssetDownload"
              @delete="handleAlgoDelete" @refresh="showComingSoon" />

            <ThumbnailGallery ref="thumbnailRef" :assets="assets" :current-index="currentIndex"
              :has-more-data="hasMoreData" :loading="(listLoading || loadingMore) as any"
              @thumbnail-click="handleThumbnailClick" @scroll-sync="handleScrollSync" @load-more="handleLoadMore"
              v-if="assets.length > 0" />
          </section>
        </div>
      </main>
    </div>

    <!-- 模型参数弹窗（父层统一管理，子组件只负责触发 show-params） -->
    <ImageParamPopup v-model="showImageParamPopup" title="参数设置" :default-params="currentImageDefaultParams"
      :default-selection="currentImageDefaultSelection" :algorithm-models="currentImageAlgorithmModels"
      @selection-change="handleImageParamsSelectionChange" @confirm="handleImageParamsConfirm"
      @close="handleImageParamsClose" />

    <!-- 款型选择弹窗（父层统一管理，按 leftMenu 分开回显） -->
    <CreationTypeSelectModal v-model="showTypeModal" :selection="activeCreationTypeSelection"
      :option-tree="creationTypeOptionTree" :loading="creationTypeLoading" @confirm="handleTypeConfirm" />

    <!-- 灵感词词典弹窗（父层统一管理） -->
    <InspirationLibrary v-model="showInspirationLibrary" :library-data="libraryData"
      :defaults="formDataByMenu[activeInspirationMenu].inspirationWords" @confirm="handleInspirationConfirm" />

    <HistoryCreativeModal v-model="showHistoryModal" source="creative" :file-type="1" :menu-code="activeMenuCode"
      :multi-select="false" :max-count="1" @select="selectHistoryCreation" />
  </div>
</template>

<script setup lang="ts">
// 与 App.vue 中 keep-alive :include 一致，避免跳转详情后创作台卸载导致上传图/表单丢失
defineOptions({ name: 'AiFashionStudio' })
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { appApi } from '@/api/app'
import { algoApi, buildTemplateParamsFromPopup } from '@/api/algo'
import { uploadApi } from '@/api/upload'
import { watermarkDownloader } from '@/utils/WatermarkDownloader'
import { APP_MENU_CODES } from '@/constants/appMenuCode'
import { CREATION_PARAM_CODES } from '@/constants/creationParamCode'
import type { CreationResult } from '@/composables/useTaskPolling'
import { mapRecordToCreationResult as mapRecordToCreationResultCommon } from '@/utils/creationResult'
import { mergeOrderResultsIntoList } from '@/utils/orderResultMerge'
import { useAlgoPollingStore } from '@/stores/algoPolling'
import CreationTypeSelectModal, { type CreationTypeSelection } from '@/components/CreationTypeSelectModal.vue'
import { useTemplateStore } from '@/stores/template'
import Fashion from './left/Fashion.vue'
import SketchToReal from './left/SketchToReal.vue'
import RealToSketch from './left/RealToSketch.vue'
import Fabric from './left/FabricCreative.vue'

type LeftMenuKey = 'aiFashion' | 'sketchToReal' | 'realToSketch' | 'fabricCreative'
type RailItem = {
  key: LeftMenuKey
  label: string
  menuCode: string
  functionIcon?: string
  functionIconSelected?: string
}

const route = useRoute()
const router = useRouter()
const templateStore = useTemplateStore()
const userStore = useUserStore()
const algoPollingStore = useAlgoPollingStore()

const isUserVip = computed(() => Number(userStore.userInfo?.vipLevel ?? 0) > 0)

const removeWatermarkEnabled = computed(() => {
  return userStore.userInfo?.watermarkStatus === 1 ? true : false
})

function parseLeftMenuFromRouteMode(mode: unknown): LeftMenuKey | null {
  const raw = Array.isArray(mode) ? mode[0] : mode
  const m = raw as LeftMenuKey | undefined
  if (!m || typeof m !== 'string') return null
  const keys: LeftMenuKey[] = ['aiFashion', 'sketchToReal', 'realToSketch', 'fabricCreative']
  return keys.includes(m as LeftMenuKey) ? (m as LeftMenuKey) : null
}

const initialLeftMenu: LeftMenuKey = parseLeftMenuFromRouteMode(route.query.mode) ?? 'aiFashion'
const leftMenu = ref<LeftMenuKey>(initialLeftMenu)
// keep-alive 下组件只创建一次：必须响应式读 query，否则从面料入口进一次后左侧栏永远只显示面料
const isFabricEntry = computed(() => route.query.mode === 'fabricCreative')

watch(
  () => route.query.mode,
  (mode) => {
    const parsed = parseLeftMenuFromRouteMode(mode)
    if (parsed) leftMenu.value = parsed
  },
)

// 在工作台内切换模块时，同步更新 URL 的 mode（用 replace，避免返回时被入口 mode 覆盖）
watch(
  () => leftMenu.value,
  (menu) => {
    const currentMode = Array.isArray(route.query.mode) ? route.query.mode[0] : route.query.mode
    if (currentMode === menu) return
    router.replace({
      query: {
        ...route.query,
        mode: menu,
      },
    })
  },
)
const showComingSoon = () => ElMessage.warning('暂未开放')

const menuKeyByCode: Record<string, LeftMenuKey> = {
  [APP_MENU_CODES.AI_FASHION_DESIGN]: 'aiFashion',
  [APP_MENU_CODES.LINE_DRAW_TO_PHYS_OBJ]: 'sketchToReal',
  [APP_MENU_CODES.PHYS_OBJ_TO_LINE_DRAW]: 'realToSketch',
  [APP_MENU_CODES.FABRIC_DESIGN_CONCEPT]: 'fabricCreative',
}
const menuCodeByKey: Record<LeftMenuKey, string> = {
  aiFashion: APP_MENU_CODES.AI_FASHION_DESIGN,
  sketchToReal: APP_MENU_CODES.LINE_DRAW_TO_PHYS_OBJ,
  realToSketch: APP_MENU_CODES.PHYS_OBJ_TO_LINE_DRAW,
  fabricCreative: APP_MENU_CODES.FABRIC_DESIGN_CONCEPT,
}
/**
 * 款型弹窗拉树用的 typeCode（getInspirationWords）
 * - 实物转线稿：creation_style（创作款型）
 */
const creationTypeCodeByMenu: Record<LeftMenuKey, string> = {
  aiFashion: CREATION_PARAM_CODES.CREATION_STYLE,
  // 线稿转实物：款型选择与 AI 服装设计一致，typeCode 为 creation_style
  sketchToReal: CREATION_PARAM_CODES.CREATION_STYLE,
  realToSketch: CREATION_PARAM_CODES.CREATION_STYLE,
  // 面料创款：弹窗选择“创作款型”（creation_style）
  fabricCreative: CREATION_PARAM_CODES.CREATION_STYLE,
}

const defaultRailLabelByKey: Record<LeftMenuKey, string> = {
  aiFashion: 'AI服装设计',
  sketchToReal: '线稿转实物',
  realToSketch: '实物转线稿',
  fabricCreative: '面料创款',
}

const allPlatformMenus = ref<any[]>([])
const activeMenuCode = ref<string>('')
// 记录已经拉取过算法模型配置的菜单 code，避免重复请求
const fetchedAlgoMenuCodes = new Set<string>()

// 参考图上传中：用于禁用重复点击/重复选择文件
const refImageUploading = ref(false)

// 右侧展示导航：只展示“一级菜单（menuCode）+ 收藏”
const rightContentTabs = computed(() => {
  const topMenus: any[] = Array.isArray(allPlatformMenus.value) ? allPlatformMenus.value : []
  const menuTabs = topMenus
    .map((m) => ({
      key: String(m?.menuCode ?? ''),
      label:
        String(m?.menuName ?? m?.menuLabel ?? m?.name ?? '') ||
        (() => {
          const code = String(m?.menuCode ?? '')
          const mk = menuKeyByCode[code]
          return mk ? defaultRailLabelByKey[mk as LeftMenuKey] : ''
        })() ||
        String(m?.menuCode ?? ''),
    }))
    // 一级菜单项；你只想展示真实一级导航 + 收藏
    .filter((t) => t.key && String(t.key).toUpperCase() !== '')

  // 收藏统一展示所有一级菜单的收藏
  return [{ key: '', label: '全部' }, ...menuTabs, { key: 'favorites', label: '收藏' }]
})

const leftRailItems = computed<RailItem[]>(() => {
  const sourceItems: any[] = []
  for (const item of allPlatformMenus.value || []) {
    sourceItems.push(item)
    if (Array.isArray(item.children) && item.children.length) {
      sourceItems.push(...item.children)
    }
  }

  const menuByCode = new Map<string, any>()
  sourceItems.forEach((item) => {
    const code = String(item.menuCode || '')
    if (code && menuKeyByCode[code]) {
      menuByCode.set(code, item)
    }
  })

  const codes = isFabricEntry.value
    ? [APP_MENU_CODES.FABRIC_DESIGN_CONCEPT]
    : [
      APP_MENU_CODES.AI_FASHION_DESIGN,
      APP_MENU_CODES.LINE_DRAW_TO_PHYS_OBJ,
      APP_MENU_CODES.PHYS_OBJ_TO_LINE_DRAW,
    ]

  return codes.map((code) => {
    const key = menuKeyByCode[code]
    const apiItem = menuByCode.get(code)
    return {
      key,
      menuCode: code,
      label: String(apiItem?.menuName || defaultRailLabelByKey[key]),
      functionIcon: String(apiItem?.functionIcon || ''),
      functionIconSelected: String(apiItem?.functionIconSelected || ''),
    }
  })
})

const fetchSysPlatformMenu = async () => {
  try {
    const res = await appApi.getSysPlatformMenu()
    if (String((res as any)?.code) === '0000' && Array.isArray(res?.data)) {
      allPlatformMenus.value = res.data
      syncActiveMenuCode()
      normalizePendingLocalMenuCodes()
    }
  } catch (error) {
    console.error('获取功能菜单失败', error)
  }
}
// ==================== 面料创款：提交生成 ====================
const handleFabricGenerate = async (payload: any) => {
  loading.value = true
  try {
    const currentForm: any = formDataByMenu.fabricCreative
    const original = String(currentForm?.image ?? '').trim()

    currentForm.originalImage = original ? [original] : []
    currentForm.zoomRatio = Number(payload?.scale ?? payload?.zoomRatio ?? 0)
    currentForm.fabricImageOutputType = (payload?.outputType || 'flat') as any

    if (!(payload?.file instanceof File)) {
      ElMessage.error('面料处理图生成失败，请重试')
      return
    }
    // showLoading=false 时 uploadApi 不会弹「上传成功」，避免与后续「已提交生成任务」叠两层；
    // 失败/异常仍由 uploadApi 按接口 msg 弹一次（与拖拽本地上传一致）
    const uploadResult = await uploadApi.uploadImage(payload.file as File, {
      showLoading: false,
      showMessage: true,
    })
    if (!uploadResult.success || !uploadResult.url) return
    currentForm.fabricProcessedImageUrl = String(uploadResult.url).trim()

    await submitByMenuCode(menuCodeByKey.fabricCreative, { skipLoading: true })
  } finally {
    loading.value = false
  }
}

const buildInspirationWordsParams = (words: any[] = []) => {
  return (Array.isArray(words) ? words : [])
    .map((w: any) => ({
      id: String(w?.id ?? w?.wordsId ?? w?.code ?? ''),
      configType: String(w?.configType ?? 'words'),
      prentId: String(w?.prentId ?? w?.parentId ?? ''),
      content: String(w?.content ?? w?.name ?? w?.wordsName ?? ''),
    }))
    .filter((x) => x.id && x.content)
}

/**
 * 与 algo.submit 一致：仅含来自历史/创作的图。
 * - 提交的 image 与这里入参 imageSlots 一致，均为数组；单图模块也是 length === 1 的数组。
 * - imageSlots.length > 1：type 与下标对应，image0、image1…
 * - length === 1：type 用 historyImageType；未单独指定时默认为 image（与提交图片参数 key 一致）。
 */
const buildHistoryParams = (form: any, menuKey: LeftMenuKey | undefined, imageSlots: string[]): Array<{ taskResultId: string; type: string }> => {
  if (!menuKey || !Array.isArray(imageSlots) || imageSlots.length === 0) return []

  const useIndexedType = imageSlots.length > 1
  const singleSlotType = () => String(form?.historyImageType || 'image').trim() || 'image'

  if (menuKey === 'aiFashion') {
    const ids = Array.isArray(form?.taskResultId) ? form.taskResultId : []
    const out: Array<{ taskResultId: string; type: string }> = []
    for (let i = 0; i < imageSlots.length; i++) {
      const rawId = ids[i]
      const id = rawId == null ? '' : String(rawId).trim()
      if (!id) continue
      const type = useIndexedType ? `image${i}` : singleSlotType()
      out.push({ taskResultId: id, type })
    }
    return out
  }

  const tid = form?.taskResultId
  const id = Array.isArray(tid) ? '' : tid == null ? '' : String(tid).trim()
  if (!id) return []
  const type = useIndexedType ? `image0` : singleSlotType()
  return [{ taskResultId: id, type }]
}

const buildCreationStyleParams = (selection: any) => {
  const values: string[] = Array.isArray(selection?.pathValues) ? selection.pathValues : []
  const ids: string[] = Array.isArray(selection?.pathNodeIds) ? selection.pathNodeIds : []
  if (!values.length) return []
  return values.map((content, idx) => ({
    id: String(ids[idx] ?? ''),
    configType: 'class',
    prentId: String(idx > 0 ? (ids[idx - 1] ?? '') : ''),
    content: String(content ?? ''),
  })).filter((x) => x.content)
}

const getFabricImageLeafContentByOutputType = (outputType: string) => {
  if (outputType === 'model') return '模特图'
  if (outputType === '3d') return '3D图'
  return '平铺图'
}

const buildFabricImageTypeParamsByOutputType = (outputType: string, tree: any[]) => {
  const leafCandidatesByOutputType: Record<string, string[]> = {
    flat: ['平铺图', '平铺', 'flat'],
    model: ['模特图', '模特', 'model'],
    '3d': ['3D图', '3D', '三维图', '3d'],
  }

  const candidates = leafCandidatesByOutputType[outputType] || leafCandidatesByOutputType.flat

  const getContent = (node: any) =>
    String(node?.content ?? node?.title ?? node?.typeName ?? node?.name ?? node?.wordsName ?? '').trim()
  const getId = (node: any) => String(node?.id ?? node?.wordsId ?? node?.code ?? '').trim()
  const getChildren = (node: any) => (Array.isArray(node?.children) ? node.children : [])

  const dfs = (
    nodes: any[],
    pathValues: string[],
    pathNodeIds: string[],
  ): { pathValues: string[]; pathNodeIds: string[] } | null => {
    for (const node of nodes || []) {
      const content = getContent(node)
      const id = getId(node)
      const nextValues = [...pathValues, content]
      const nextIds = [...pathNodeIds, id]
      const children = getChildren(node)
      const isLeaf = !Array.isArray(children) || children.length === 0

      const isMatch = Boolean(content) && candidates.includes(content)
      if (isMatch && isLeaf) {
        const pairs = nextValues
          .map((v, idx) => ({ v, id: nextIds[idx] }))
          .filter((x) => String(x.v || '').trim().length > 0)
        return { pathValues: pairs.map((x) => x.v), pathNodeIds: pairs.map((x) => x.id) }
      }

      if (children.length) {
        const found = dfs(children, nextValues, nextIds)
        if (found) return found
      }

      // 没找到严格叶子匹配时，允许中间节点兜底（至少把 content 传给后端）
      if (isMatch) {
        const pairs = nextValues
          .map((v, idx) => ({ v, id: nextIds[idx] }))
          .filter((x) => String(x.v || '').trim().length > 0)
        return { pathValues: pairs.map((x) => x.v), pathNodeIds: pairs.map((x) => x.id) }
      }
    }
    return null
  }

  const toLeafOnlyParam = (resolved: { pathValues: string[]; pathNodeIds: string[] }) => {
    const values = Array.isArray(resolved?.pathValues) ? resolved.pathValues : []
    const ids = Array.isArray(resolved?.pathNodeIds) ? resolved.pathNodeIds : []
    if (!values.length) return []
    const lastIdx = values.length - 1
    return [{
      id: String(ids[lastIdx] ?? ''),
      configType: 'class',
      prentId: String(lastIdx > 0 ? (ids[lastIdx - 1] ?? '') : ''),
      content: String(values[lastIdx] ?? ''),
    }].filter((x) => x.content)
  }

  const resolved = Array.isArray(tree) && tree.length ? dfs(tree, [], []) : null
  // 仅提交命中的“生成图片类型”叶子项（不带父级）
  if (resolved?.pathValues?.length) return toLeafOnlyParam(resolved)

  // 兜底：未知树结构时，仅把叶子 content 传给后端（id/prentId 为空）
  const leafContent = getFabricImageLeafContentByOutputType(outputType)
  return [{
    id: '',
    configType: 'class',
    prentId: '',
    content: leafContent,
  }]
}

/** 线稿转实物：左侧三组单选 → sketchTypeParams / sketchStyleParams / imageTypeParams（与详情页字段一致） */
const classifySketchToRealCategory = (cat: any, index: number): 'type' | 'style' | 'image' | null => {
  const code = String(cat?.code ?? cat?.typeCode ?? '').toLowerCase()
  if (code === CREATION_PARAM_CODES.SKETCH_TYPE || code.endsWith('sketch_type')) return 'type'
  if (code === CREATION_PARAM_CODES.SKETCH_STYLE || code.endsWith('sketch_style')) return 'style'
  if (code === CREATION_PARAM_CODES.IMAGE_TYPE || code.endsWith('image_type')) return 'image'

  // 部分接口返回的三组参数并不会带 typeCode（而是用 content 标题区分），这里用标题兜底
  const title = String(cat?.content ?? cat?.title ?? '').trim()
  if (title.includes('生成图片') || title.includes('图片类型')) return 'image'
  if (title.includes('线稿类型')) return 'type'
  if (title.includes('线稿风格')) return 'style'

  // 最后兜底：按顺序猜（避免空）
  if (index === 0) return 'image'
  if (index === 1) return 'type'
  if (index === 2) return 'style'
  return null
}

const buildSketchToRealSegmentParams = (
  categories: any[],
  selections: Record<string, string>,
): {
  sketchTypeParams: Array<{ id: string; configType: string; prentId: string; content: string }>
  sketchStyleParams: Array<{ id: string; configType: string; prentId: string; content: string }>
  imageTypeParams: Array<{ id: string; configType: string; prentId: string; content: string }>
} => {
  const sketchTypeParams: Array<{ id: string; configType: string; prentId: string; content: string }> = []
  const sketchStyleParams: Array<{ id: string; configType: string; prentId: string; content: string }> = []
  const imageTypeParams: Array<{ id: string; configType: string; prentId: string; content: string }> = []

  const push = (
    bucket: Array<{ id: string; configType: string; prentId: string; content: string }>,
    category: any,
    opt: any,
  ) => {
    bucket.push({
      id: String(opt?.id ?? ''),
      configType: String(opt?.configType ?? 'class'),
      prentId: String(category?.id ?? ''),
      content: String(opt?.content ?? opt?.name ?? opt?.wordsName ?? ''),
    })
  }

  const list = Array.isArray(categories) ? categories : []
  list.forEach((cat, index) => {
    const classId = String(cat?.id ?? '')
    const selId = String((selections || {})[classId] ?? '').trim()
    if (!classId || !selId) return
    const children = Array.isArray(cat?.children) ? cat.children : []
    const opt = children.find((c: any) => String(c?.id ?? '') === selId)
    if (!opt) return
    const kind = classifySketchToRealCategory(cat, index)
    if (kind === 'type') push(sketchTypeParams, cat, opt)
    else if (kind === 'style') push(sketchStyleParams, cat, opt)
    else if (kind === 'image') push(imageTypeParams, cat, opt)
  })

  return { sketchTypeParams, sketchStyleParams, imageTypeParams }
}

/** 实物转线稿：两组单选 → sketchGenerationTypeParams / sketchGenerationStyleParams */
const classifyRealToSketchCategory = (cat: any, index: number): 'genType' | 'genStyle' | null => {
  const code = String(cat?.code ?? cat?.typeCode ?? '').toLowerCase()
  if (code === CREATION_PARAM_CODES.SKETCH_GENERATION_TYPE || code.endsWith('sketch_generation_type')) return 'genType'
  if (code === CREATION_PARAM_CODES.SKETCH_GENERATION_STYLE || code.endsWith('sketch_generation_style')) return 'genStyle'
  const title = String(cat?.content ?? cat?.title ?? '').trim()
  if (title.includes('线稿生成类型')) return 'genType'
  if (title.includes('线稿生成风格')) return 'genStyle'
  if (index === 0) return 'genType'
  if (index === 1) return 'genStyle'
  return null
}

const buildRealToSketchSegmentParams = (
  categories: any[],
  selections: Record<string, string>,
): {
  sketchGenerationTypeParams: Array<{ id: string; configType: string; prentId: string; content: string }>
  sketchGenerationStyleParams: Array<{ id: string; configType: string; prentId: string; content: string }>
} => {
  const sketchGenerationTypeParams: Array<{ id: string; configType: string; prentId: string; content: string }> = []
  const sketchGenerationStyleParams: Array<{ id: string; configType: string; prentId: string; content: string }> = []

  const push = (
    bucket: Array<{ id: string; configType: string; prentId: string; content: string }>,
    category: any,
    opt: any,
  ) => {
    bucket.push({
      id: String(opt?.id ?? ''),
      configType: String(opt?.configType ?? 'class'),
      prentId: String(category?.id ?? ''),
      content: String(opt?.content ?? opt?.name ?? opt?.wordsName ?? ''),
    })
  }

  const list = Array.isArray(categories) ? categories : []
  list.forEach((cat, index) => {
    const classId = String(cat?.id ?? '')
    const selId = String((selections || {})[classId] ?? '').trim()
    if (!classId || !selId) return
    const children = Array.isArray(cat?.children) ? cat.children : []
    const opt = children.find((c: any) => String(c?.id ?? '') === selId)
    if (!opt) return
    const kind = classifyRealToSketchCategory(cat, index)
    if (kind === 'genType') push(sketchGenerationTypeParams, cat, opt)
    else if (kind === 'genStyle') push(sketchGenerationStyleParams, cat, opt)
  })

  return { sketchGenerationTypeParams, sketchGenerationStyleParams }
}

// ==================== payload 公共部分（仅 doCalculationPoint 入参） ====================
const buildCommonPayloadBase = (
  menuCode: string,
  modelConfigId: number,
  modelConfigCode: string,
  modelConfigName: string,
  paramListOrSelectedParams: any[],
) => {
  const templateParams = buildTemplateParamsFromPopup(paramListOrSelectedParams)
  return {
    modelConfigId,
    modelConfigCode,
    modelConfigName,
    menuCode,
    templateParams,
  }
}

// ==================== 统一提交入口：按 menuCode 构造差异字段 ====================
const submitByMenuCode = async (
  menuCode: string,
  options?: { skipLoading?: boolean },
) => {
  const manageLoading = !options?.skipLoading
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    return
  }

  const menuKey = menuKeyByCode[menuCode]
  if (!menuKey) {
    ElMessage.error('功能菜单未就绪')
    return
  }

  const form: any = formDataByMenu[menuKey]
  const paramsState: any = form.params
  const algoModel: any = paramsState?.selectedAlgorithm
  const modelConfigId = Number(algoModel?.algorithmId ?? algoModel?.id ?? 0)
  const modelConfigCode = String(algoModel?.code ?? '')
  const modelConfigName = String(algoModel?.name ?? '')

  if (!modelConfigId || !modelConfigCode || !menuCode) {
    ElMessage.error('模型参数未就绪，请先点击“参数设置”确认算法模型')
    return
  }

  let images: string[]

  if (menuKey === 'aiFashion') {
    images = (Array.isArray(form.image) ? form.image : [form.image])
      .map((v: any) => String(v ?? '').trim())
      .filter(Boolean)
      .slice(0, 6)
  } else if (menuKey === 'fabricCreative') {
    const processed = String(form.fabricProcessedImageUrl || '').trim()
    images = processed
      ? [processed]
      : String(form.image || '').trim()
        ? [String(form.image).trim()]
        : []
    if (!images.length) {
      ElMessage.error('请先上传面料参考图')
      return
    }
  } else if (menuKey === 'sketchToReal') {
    images = String(form.image || '').trim() ? [String(form.image).trim()] : []
    if (!images.length) {
      ElMessage.error('请先上传线稿参考图')
      return
    }
    const segCats = sketchToRealParamCategories.value || []
    const selMap = form.sketchParamSelections || {}
    for (const cat of segCats) {
      const cid = String(cat?.id ?? '')
      if (!cid || !String(selMap[cid] ?? '').trim()) {
        ElMessage.error('请完成线稿类型、线稿风格与生成图片类型的选择')
        return
      }
    }
  } else if (menuKey === 'realToSketch') {
    images = String(form.image || '').trim() ? [String(form.image).trim()] : []
    if (!images.length) {
      ElMessage.error('请先上传实物参考图')
      return
    }
    const segCats = realToSketchParamCategories.value || []
    const selMap = form.sketchParamSelections || {}
    for (const cat of segCats) {
      const cid = String(cat?.id ?? '')
      if (!cid || !String(selMap[cid] ?? '').trim()) {
        ElMessage.error('请完成线稿生成类型与线稿生成风格的选择')
        return
      }
    }
  } else {
    ElMessage.error('功能模块未就绪')
    return
  }

  const basePayload = buildCommonPayloadBase(
    menuCode,
    modelConfigId,
    modelConfigCode,
    modelConfigName,
    Object.values(paramsState.selectedParams || {}),
  )
  const submitPayloadBase: any = {
    ...basePayload,
    image: images,
    inspirationWordsParams: buildInspirationWordsParams(form.inspirationWords),
    creativeDescription: String(form.prompt || '').trim(),
    historyParams: buildHistoryParams(form, menuKey, images),
  }

  let diffPayload: any
  if (menuKey === 'aiFashion') {
    diffPayload = {
      creationStyleParams: buildCreationStyleParams(formDataByMenu.aiFashion.creationTypeSelection),
      designFeaturesParams: form.designFeaturesParams || [],
    }
  } else if (menuKey === 'fabricCreative') {
    const creationStyleParams = buildCreationStyleParams(creationTypeSelectionByMenu.fabricCreative)

    const outputType = String(form.fabricImageOutputType || 'flat')
    const imageTypeParams = buildFabricImageTypeParamsByOutputType(outputType, fabricImageTypeOptionTree.value || [])

    diffPayload = {
      creationStyleParams,
      imageTypeParams,
      originalImage: (form.originalImage && form.originalImage.length ? form.originalImage : images) || [],
      zoomRatio: Number(form.zoomRatio ?? 0),
    }
  } else if (menuKey === 'sketchToReal') {
    const { sketchTypeParams, sketchStyleParams, imageTypeParams } = buildSketchToRealSegmentParams(
      sketchToRealParamCategories.value,
      form.sketchParamSelections || {},
    )
    const creationRows = buildCreationStyleParams(creationTypeSelectionByMenu.sketchToReal)
    diffPayload = {
      // 与 AI 服装设计一致：款型走 creationStyleParams，详情页「款型」展示用（款型非必选）
      ...(creationRows.length ? { creationStyleParams: creationRows } : {}),
      sketchTypeParams,
      sketchStyleParams,
      imageTypeParams,
    }
  } else {
    const { sketchGenerationTypeParams, sketchGenerationStyleParams } = buildRealToSketchSegmentParams(
      realToSketchParamCategories.value,
      form.sketchParamSelections || {},
    )
    const garmentRows = buildCreationStyleParams(creationTypeSelectionByMenu.realToSketch)
    diffPayload = {
      ...(garmentRows.length ? { garmentStyleParams: garmentRows } : {}),
      sketchGenerationTypeParams,
      sketchGenerationStyleParams,
    }
  }

  const payload: any = { ...submitPayloadBase, ...diffPayload }

  try {
    if (manageLoading) loading.value = true
    const res = await algoApi.submit(payload)
    if (res.code === '0000') {
      ElMessage.success('已提交生成任务')
      // 提交成功会扣灵衍值，刷新 Header 等处的灵衍值/余额展示
      await refreshUserInfoIfLoggedIn()
      if (res.data.orderNo) {
        _upsertGeneratingAssetByOrderNo(
          String(res.data.orderNo),
          String(form?.prompt || '').trim(),
          String(menuCode || '').trim(),
        )
        void algoPollingStore.start(res.data.orderNo)
      }
    } else {
      ElMessage.error(res.msg || '提交失败')
    }
  } catch (e) {
    // 登录态失效时由全局拦截器统一提示/跳转，这里不再重复弹窗
    if ((e as any)?.__AUTH_EXPIRED__) return
    console.error('[AiFashionStudio] doCalculationPoint failed:', e)
    ElMessage.error('网络开小差了，请稍后重试~')
  } finally {
    if (manageLoading) loading.value = false
  }
}

// ==================== 右侧：我的创作（轮询/列表共享状态） ====================
// 注意：这些 state 会被“轮询生成结果”相关方法提前引用，所以需要放在方法声明之前以提升可读性
const assets = ref<CreationResult[]>([])
const currentIndex = ref(0)
const mainImageRef = ref<any>(null)
const thumbnailRef = ref<any>(null)
// 主图当前滚动百分比（0=顶部），用于避免轮询回填时“把用户拉回顶部”
const lastMainScrollPercentage = ref(0)
// 对“本次提交的每个任务”生效：全部完成后统一回到顶部（支持并发提交）
const autoFocusOrderNoSet = reactive(new Set<string>())
// 完成态回填去重：避免同一 orderNo 的同一批结果被 watcher 反复 apply，导致列表顺序/可见性异常
const appliedDoneSignatureByOrderNo = reactive(new Map<string, string>())
// 本地生成中占位：不挂在 assets 上，避免切 tab/reset 时被过滤丢失
const pendingLocalMap = reactive(new Map<string, CreationResult>())

// ==================== 生成结果轮询（全局唯一：列表/详情共用同一份） ====================
const stopAllQueryTimers = () => {
  algoPollingStore.stopAll()
}

// 根据 orderNo / algoOrderId 在 assets 中定位创作
const findAssetIndexByOrderNo = (orderNo: string) => {
  const key = String(orderNo ?? '').trim()
  if (!key) return -1
  return assets.value.findIndex((item: CreationResult) => {
    const a = String((item as any)?.algoOrderNo ?? '').trim()
    const b = String((item as any)?.algoOrderId ?? '').trim()
    return a === key || b === key
  })
}

// 更新指定创作：以 updater 的返回值覆盖原 assets 项
const updateAssetByOrderNo = (orderNo: string, updater: (asset: CreationResult) => CreationResult) => {
  const idx = findAssetIndexByOrderNo(orderNo)
  if (idx === -1) return
  assets.value[idx] = updater(assets.value[idx])
}

// 提交成功后：先插入“生成中”的占位卡片，并开始轮询
const _upsertGeneratingAssetByOrderNo = (
  orderNo: string,
  prompt: string,
  anyMenuCode: string,
) => {
  const key = String(orderNo ?? '').trim()
  if (!key) return
  autoFocusOrderNoSet.add(key)
  // submit 侧通常是二级/叶子 menuCode，这里统一归一化为右侧 tab 使用的一级 menuCode
  const pendingMenuCode = String(resolveTopMenuCodeByAnyCode(anyMenuCode) || '').trim()
  if (!pendingMenuCode) return
  const now = new Date().toISOString()
  const idx = findAssetIndexByOrderNo(key)

  const generatingItem: CreationResult = {
    // 生成中占位卡片只有 orderNo；结果 id 只能来自 queryDone / 列表接口
    id: '',
    algoOrderId: '',
    algoOrderNo: key,
    algoUuId: null,
    // 这里存“右侧一级 tabKey”，用于 tab 过滤与展示规则（服装设计为聚合）
    menuCode: pendingMenuCode,
    thumbUrl: null,
    url: null,
    originalUrl: null,
    fileType: 1,
    status: 2,
    collectStatus: 0,
    prompt: prompt || '生成中...',
    createTime: now,
    progress: 0,
  }

  // 先写入本地 pendingMap（跨 tab 持久），后续列表按 tab 规则投影展示
  pendingLocalMap.set(key, generatingItem)

  // 当前右侧 tab 不属于该模块：不把占位插入当前列表（避免跨模块串到 AI面料/收藏等）
  if (!shouldShowPendingInTab(currentContentTab.value, pendingMenuCode)) return

  if (idx === -1) {
    assets.value.unshift(generatingItem)
    currentIndex.value = 0
    // 提交后强制回到顶部：避免滚动同步/布局变化把缩略图又“同步回去”
    nextTick(() => {
      requestAnimationFrame(() => {
        thumbnailRef.value?.scrollToTop?.()
        thumbnailRef.value?.scrollToIndex?.(0)
        thumbnailRef.value?.syncScroll?.(0)
        mainImageRef.value?.scrollToAsset?.(0)
        mainImageRef.value?.syncScroll?.(0)
        // 二次兜底：部分情况下主图滚动事件会把缩略图同步回非顶部
        setTimeout(() => {
          thumbnailRef.value?.scrollToTop?.()
          thumbnailRef.value?.syncScroll?.(0)
          mainImageRef.value?.syncScroll?.(0)
        }, 350)
      })
    })
    return
  }

  // 已存在同 orderNo 的记录：更新并移动到顶部，保证“生成中”始终出现在列表最前
  const nextItem = {
    ...assets.value[idx],
    ...generatingItem,
  }
  if (idx === 0) {
    assets.value[0] = nextItem
  } else {
    assets.value.splice(idx, 1)
    assets.value.unshift(nextItem)
  }
  currentIndex.value = 0
  nextTick(() => {
    requestAnimationFrame(() => {
      thumbnailRef.value?.scrollToTop?.()
      thumbnailRef.value?.scrollToIndex?.(0)
      thumbnailRef.value?.syncScroll?.(0)
      mainImageRef.value?.scrollToAsset?.(0)
      mainImageRef.value?.syncScroll?.(0)
      setTimeout(() => {
        thumbnailRef.value?.scrollToTop?.()
        thumbnailRef.value?.syncScroll?.(0)
        mainImageRef.value?.syncScroll?.(0)
      }, 350)
    })
  })
}

// 轮询完成后：把 orderResultVOS 映射回 assets（包含多结果扩展）
const applyQueryDoneResult = (orderNo: string, orderResultVOS: any[]) => {
  const key = String(orderNo ?? '').trim()
  const idx = findAssetIndexByOrderNo(key)
  const mappedList = orderResultVOS.map((vo: any) => mapOrderResultToAsset(vo, key))
  if (!mappedList.length) return

  // 已完成：移除本地生成中占位
  pendingLocalMap.delete(key)

  const shouldAutoFocus = autoFocusOrderNoSet.has(key)
  const merged = mergeOrderResultsIntoList(
    assets.value as any[],
    key,
    mappedList as any[],
    {
      preferInPlace: idx >= 0,
      insertAtIfNotFound: (list) => (shouldAutoFocus ? 0 : list.length),
    },
  )
  assets.value = dedupeCreationResultsPreserveOrder(merged.list as any)

  // 完成后保持“原位替换”：生成中在哪展示，结果就在哪展示。
  // 但当“本次提交集合”全部完成时，自动回到顶部展示一次最终结果。
  if (shouldAutoFocus) {
    autoFocusOrderNoSet.delete(key)
    if (autoFocusOrderNoSet.size === 0) {
      currentIndex.value = 0
      nextTick(() => {
        requestAnimationFrame(() => {
          thumbnailRef.value?.scrollToTop?.()
          thumbnailRef.value?.scrollToIndex?.(0)
          thumbnailRef.value?.syncScroll?.(0)
          mainImageRef.value?.scrollToAsset?.(0)
          mainImageRef.value?.syncScroll?.(0)
        })
      })
    }
  }
  // 一次完成态回填后，pending 已经结束；允许释放签名缓存，避免长期增长
  // 注意：这里不删 appliedDoneSignatureByOrderNo，避免同一完成态在后续 watcher 触发时重复 apply。
}

// 把单条后端结果 VO 映射为前端 CreationResult
const mapOrderResultToAsset = (vo: any, fallbackOrderNo: string): CreationResult => {
  const key = String(fallbackOrderNo ?? '').trim()
  const pendingMenuCode = key ? String((pendingLocalMap.get(key) as any)?.menuCode ?? '').trim() : ''
  return {
    id: String(vo?.id ?? key).trim(),
    algoOrderId: String(vo?.algoOrderId ?? key).trim(),
    algoOrderNo: String(vo?.algoOrderNo ?? key).trim(),
    algoUuId: vo?.algoUuId == null ? null : String(vo.algoUuId),
    // queryDone 在部分场景不返回 menuCode：优先继承本地 pending 的分组，避免按当前 activeMenuCode 串模块
    menuCode: String(vo?.menuCode ?? '').trim() || pendingMenuCode || '',
    thumbUrl: vo?.thumbUrl ?? null,
    url: vo?.url ?? null,
    originalUrl: vo?.originalUrl ?? null,
    fileType: Number(vo?.fileType ?? 1),
    status: Number(vo?.status ?? 3),
    collectStatus: Number(vo?.collectStatus ?? 0),
    prompt: String(vo?.prompt ?? vo?.creativeDescription ?? ''),
    createTime: String(vo?.createTime ?? new Date().toISOString()),
    progress: Number(vo?.progress ?? 100),
    successfulCount: vo?.successfulCount == null ? undefined : Number(vo.successfulCount),
    failedCount: vo?.failedCount == null ? undefined : Number(vo.failedCount),
  }
}

// 查询单个 orderNo 的生成状态，并把结果回填到 assets
// 轮询由 useAlgoPollingStore 统一负责，这里仅消费 store 的最新状态回填到 assets
watch(
  () => algoPollingStore.tasks,
  (tasks) => {
    if (!tasks) return
    for (const [orderNo, s] of Object.entries(tasks)) {
      const st = Number(s?.status ?? 0)
      const doneListRaw = Array.isArray((s as any)?.orderResultVOS) ? ((s as any).orderResultVOS as any[]) : []
      // 仅认“可展示结果”（有 id 或有 url），避免 status 变化但空 payload 触发误回填
      const doneList = doneListRaw.filter((vo: any) => {
        const id = String(vo?.id ?? vo?.algoOrderId ?? vo?.algoOrderNo ?? '').trim()
        const url = String(vo?.url ?? vo?.thumbUrl ?? '').trim()
        return !!id || !!url
      })
      const hasDonePayload = doneList.length > 0

      // 切 tab 时生成中占位来自 pendingLocalMap：这里也要同步更新，避免投影后进度归零/反复新增
      const key = String(orderNo ?? '').trim()
      const pending = key ? pendingLocalMap.get(key) : undefined
      if (pending) {
        // 兼容“status=3 但结果列表尚未返回”的窗口期：继续保持占位可见
        const nextStatus = st === 3 && !hasDonePayload ? Number((pending as any).status ?? 2) || 2 : st
        pendingLocalMap.set(key, {
          ...(pending as any),
          status: nextStatus,
          progress: Math.max(Number((pending as any).progress ?? 0), Number((s as any)?.progress ?? 0)),
          successfulCount: (s as any)?.successfulCount ?? (pending as any).successfulCount,
          failedCount: (s as any)?.failedCount ?? (pending as any).failedCount,
        } as any)
      }
      // 关键修复：
      // 完成态回填不能依赖“当前 assets 里是否还能找到该 orderNo”。
      // 并发/切换/重置时占位可能暂时不在当前列表，若只走 updateAssetByOrderNo 会导致“成功结果丢失，需刷新才出现”。
      if (hasDonePayload) {
        // 同一订单同一批结果只 apply 一次，避免 tasks 深度变更导致重复回填
        const doneSig = doneList
          .map((vo: any) => String(vo?.id ?? vo?.algoOrderId ?? vo?.algoOrderNo ?? '').trim())
          .filter(Boolean)
          .join('|')
        const prevSig = appliedDoneSignatureByOrderNo.get(key) || ''
        if (doneSig && doneSig === prevSig) continue
        applyQueryDoneResult(orderNo, doneList)
        if (doneSig) appliedDoneSignatureByOrderNo.set(key, doneSig)
        continue
      }
      // 非完成态：允许后续完成时重新回填
      if (st !== 3) appliedDoneSignatureByOrderNo.delete(key)

      updateAssetByOrderNo(orderNo, (oldItem) => {
        const st = Number(s?.status ?? oldItem.status ?? 0)
        const next: any = {
          ...oldItem,
          status: st,
          progress: Math.max(Number(oldItem.progress ?? 0), Number(s?.progress ?? 0)),
          successfulCount: s?.successfulCount ?? oldItem.successfulCount,
          failedCount: s?.failedCount ?? oldItem.failedCount,
        }
        // 失败：保持失败态文案
        if (st === 4) next.prompt = oldItem.prompt || '生成失败'
        return next
      })
    }
  },
  { deep: true },
)

// ==================== ai服装设计：提交生成 ====================
const handleAiFashionGenerate = async () => {
  await submitByMenuCode(menuCodeByKey.aiFashion)
}

// ==================== 线稿转实物：提交生成 ====================
const handleSketchToRealGenerate = async () => {
  await submitByMenuCode(menuCodeByKey.sketchToReal)
}

// ==================== 实物转线稿：提交生成 ====================
const handleRealToSketchGenerate = async () => {
  await submitByMenuCode(menuCodeByKey.realToSketch)
}

// 查看详情：跳转到 CreativeDetail（左大图 + 右侧信息面板）
const handleViewDetail = (index: number) => {
  const list = assets.value || []
  const item: any = list[index]
  // “生成中/排队中”没有结果 id，不能进入详情（否则会把 orderNo 当成 id 去打详情接口）
  const status = Number(item?.status)
  if (status === 1 || status === 2) return
  if (!item?.id) return

  // 缓存列表数据，详情页可直接用来渲染 & 支持“上一张/下一张”
  templateStore.setTemplateListData({
    list,
    currentIndex: index,
    // 记录当前模块“一级菜单” code，详情页按模块动态展示
    modeCode: activeMenuCode.value,
  })

  router.push({
    name: 'CreativeDetail',
    params: { id: String(item.id) },
    // 路由也携带一级菜单 code，方便详情页按模块还原 UI
    query: { modeCode: activeMenuCode.value },
  })
}

// ==================== 款型选择弹窗（父层统一管理） ====================
const showTypeModal = ref(false)
const activeTypeMenu = ref<LeftMenuKey>('aiFashion')
const creationTypeOptionTree = ref<any[]>([])
const creationTypeLoading = ref(false)

const creationTypeSelectionByMenu = reactive<Record<Exclude<LeftMenuKey, 'aiFashion'>, Partial<CreationTypeSelection>>>({
  sketchToReal: {},
  realToSketch: {},
  fabricCreative: {},
})

const activeCreationTypeSelection = computed(() => {
  if (activeTypeMenu.value === 'aiFashion') return formDataByMenu.aiFashion.creationTypeSelection
  return creationTypeSelectionByMenu[activeTypeMenu.value as Exclude<LeftMenuKey, 'aiFashion'>] || {}
})

const fetchCreationTypeWords = async (menu: LeftMenuKey) => {
  const functionCode = menuCodeByKey[menu]
  const typeCode = creationTypeCodeByMenu[menu]
  if (!functionCode || !typeCode) {
    creationTypeOptionTree.value = []
    return
  }
  creationTypeLoading.value = true
  try {
    const res = await appApi.getInspirationWords({ functionCode, typeCode })
    if (String((res as any)?.code) === '0000' && Array.isArray(res?.data)) {
      creationTypeOptionTree.value = res.data as any[]
      return
    }
    creationTypeOptionTree.value = []
  } catch (error) {
    creationTypeOptionTree.value = []
    console.error('获取创作款型词典失败', error)
  } finally {
    creationTypeLoading.value = false
  }
}

const openTypeModal = (menu: LeftMenuKey) => {
  activeTypeMenu.value = menu
  fetchCreationTypeWords(menu)
  showTypeModal.value = true
}

const clearTypeSelection = (menu: LeftMenuKey) => {
  if (menu === 'aiFashion') formDataByMenu.aiFashion.creationTypeSelection = {}
  else creationTypeSelectionByMenu[menu as Exclude<LeftMenuKey, 'aiFashion'>] = {}
}

const handleTypeConfirm = (v: CreationTypeSelection) => {
  if (activeTypeMenu.value === 'aiFashion') formDataByMenu.aiFashion.creationTypeSelection = v
  else creationTypeSelectionByMenu[activeTypeMenu.value as Exclude<LeftMenuKey, 'aiFashion'>] = v
}

// ==================== 图片参数弹窗（父层统一管理） ====================
const showImageParamPopup = ref(false)
const showInspirationLibrary = ref(false)
const showHistoryModal = ref(false)
const historyModalContext = ref<{ position?: string; type?: string } | null>(null)

type AlgoParamsState = {
  selectedAlgorithm: any
  selectedParams: Record<number, any>
  defaultModelsParams: string[]
  algorithmModels: any[]
  coinCost: number
  defaultParamObject: any
}

// 这些字段在所有模块里都存在：创意描述(prompt)、灵感词词典选择(inspirationWords)、模型参数选择(params)
type CreativeAndModelState = {
  prompt: string
  inspirationWords: any[]
  params: AlgoParamsState
}

type CommonFormState = CreativeAndModelState & {
  historyParams: any[]
  /** 单图模块：历史/创作入图时的 type；未设时提交 historyParams 默认 image */
  historyImageType?: string
}

type DesignFeatureParam = { id: string; configType: string; prentId: string; content: string }

// ai服装设计：参考图最多 6 张，且包含设计特性（designFeaturesParams）
type AiFashionFormState = CommonFormState & {
  image: string[]
  taskResultId?: Array<string | number>
  designFeaturesParams: DesignFeatureParam[]
  // ai服装设计：创作款型（用于 payload 的 creationStyleParams）
  creationTypeSelection: Partial<CreationTypeSelection>
}

// 线稿转实物/实物转线稿/面料创款：参考图单张
type SingleImageFormState = CommonFormState & {
  image: string
  /** 面料创款：原图（后端需要的原始输入数组） */
  originalImage?: string[]
  /** 面料创款：缩放比例（zoomRatio） */
  zoomRatio?: number
  /** 面料创款：canvas 缩放纹理图上传后的 URL（仅提交用；左侧展示仍用 image 原图） */
  fabricProcessedImageUrl?: string
  taskResultId?: string | number
  sketchParamSelections: Record<string, string>
  /** 面料创款：左侧“生成图片类型”按钮值（flat/model/3d），用于映射后端 fabric_image_type */
  fabricImageOutputType?: 'flat' | 'model' | '3d'
}

type SketchToRealFormState = SingleImageFormState
type RealToSketchFormState = SingleImageFormState
type FabricCreativeFormState = SingleImageFormState

type FormStateByMenu = {
  aiFashion: AiFashionFormState
  sketchToReal: SketchToRealFormState
  realToSketch: RealToSketchFormState
  fabricCreative: FabricCreativeFormState
}

const createAlgoParamsState = (): AlgoParamsState => ({
  selectedAlgorithm: null,
  selectedParams: {},
  defaultModelsParams: [],
  algorithmModels: [],
  coinCost: 0,
  defaultParamObject: null,
})

const createAiFashionFormState = (): AiFashionFormState => ({
  image: [],
  taskResultId: undefined,
  prompt: '',
  inspirationWords: [],
  historyParams: [],
  designFeaturesParams: [],
  creationTypeSelection: {},
  params: createAlgoParamsState(),
})

const createSingleImageFormState = (): SingleImageFormState => ({
  image: '',
  originalImage: [],
  zoomRatio: undefined,
  fabricProcessedImageUrl: undefined,
  taskResultId: undefined,
  prompt: '',
  inspirationWords: [],
  historyParams: [],
  sketchParamSelections: {},
  params: createAlgoParamsState(),
  fabricImageOutputType: 'flat',
})

const formDataByMenu = reactive<FormStateByMenu>({
  aiFashion: createAiFashionFormState(),
  sketchToReal: createSingleImageFormState(),
  realToSketch: createSingleImageFormState(),
  fabricCreative: createSingleImageFormState(),
})
const activeInspirationMenu = ref<LeftMenuKey>('aiFashion')
const getCurrentForm = () => formDataByMenu[leftMenu.value]
const getCurrentParams = () => getCurrentForm().params

const imageCoin = computed(() => getCurrentParams()?.coinCost ?? 0)
const currentImageDefaultParams = computed(() => getCurrentParams()?.defaultModelsParams || [])
const currentImageAlgorithmModels = computed(() => getCurrentParams()?.algorithmModels || [])

/** 从算法列表中按 defaultStatus 提取“默认选中”对象，供参数弹窗直接回显选中态 */
const extractDefaultSelectionFromModels = (models: any[]) => {
  if (!Array.isArray(models) || models.length === 0) return null
  const defaultModel = models.find((m: any) => Number(m?.defaultStatus) === 1) || models[0]
  if (!defaultModel) return null

  const groups = Array.isArray(defaultModel?.paramGroups) ? defaultModel.paramGroups : []
  const paramList = groups
    .map((group: any) => {
      const params = Array.isArray(group?.params) ? group.params : []
      if (!params.length) return null
      const p = params.find((x: any) => Number(x?.defaultStatus) === 1) || params[0]
      return p
        ? {
          templateId: p?.templateId || '',
          templateCode: p?.templateCode || '',
          templateName: p?.templateName || '',
          type: p?.type,
          vipStatus: p?.vipStatus,
          waveCoin: p?.waveCoin,
          templateDesc: p?.templateDesc || '',
          imageUrl: p?.imageUrl || '',
        }
        : null
    })
    .filter(Boolean)

  return {
    algorithmId: defaultModel?.algorithmId ?? defaultModel?.id ?? 0,
    algorithmCode: defaultModel?.code || '',
    algorithmName: defaultModel?.name || '',
    paramList,
  }
}

const currentImageDefaultSelection = computed(() => {
  const byList = extractDefaultSelectionFromModels(currentImageAlgorithmModels.value)
  // 有用户手动确认结果时，优先使用用户选择；否则回退到接口默认
  return getCurrentParams()?.defaultParamObject || byList
})

const buildDefaultStateFromModels = (models: any[]) => {
  if (!Array.isArray(models) || models.length === 0) {
    return {
      selectedAlgorithm: null,
      selectedParams: {} as Record<number, any>,
      defaultModelsParams: [] as string[],
      coinCost: 0,
      defaultParamObject: null,
    }
  }

  const defaultModel = models.find((m: any) => Number(m?.defaultStatus) === 1) || models[0]
  const groups = (Array.isArray(defaultModel?.paramGroups) ? defaultModel.paramGroups : [])
    .slice()
    .sort((a: any, b: any) => Number(a?.type || 0) - Number(b?.type || 0))

  const selectedParams: Record<number, any> = {}
  const paramList: any[] = []
  for (const group of groups) {
    const params = Array.isArray(group?.params) ? group.params : []
    if (!params.length) continue
    const defaultParam = params.find((p: any) => Number(p?.defaultStatus) === 1) || params[0]
    selectedParams[Number(group?.type)] = defaultParam
    paramList.push(defaultParam)
  }

  const algorithmName = String(defaultModel?.name || '').trim()
  const paramNames = paramList.map((p: any) => String(p?.templateName || '').trim()).filter(Boolean)
  const defaultModelsParams = algorithmName ? [algorithmName, ...paramNames] : []

  const paramsCoin = paramList.reduce((sum: number, p: any) => sum + Number(p?.waveCoin ?? 0), 0)
  const coinCost = Number(defaultModel?.waveCoin ?? 0) + paramsCoin
  const defaultParamObject = {
    algorithmId: defaultModel?.algorithmId ?? defaultModel?.id ?? 0,
    algorithmCode: defaultModel?.code || '',
    algorithmName: algorithmName || '',
    paramList: paramList.map((p: any) => ({
      templateId: p?.templateId || '',
      templateCode: p?.templateCode || '',
      templateName: p?.templateName || '',
      type: p?.type,
      vipStatus: p?.vipStatus,
      waveCoin: p?.waveCoin,
      templateDesc: p?.templateDesc || '',
      imageUrl: p?.imageUrl || '',
    })),
  }

  return {
    selectedAlgorithm: defaultModel,
    selectedParams,
    defaultModelsParams,
    coinCost,
    defaultParamObject,
  }
}

const calculateCoinCost = (selectedAlgorithm: any, selectedParams: Record<number, any>) => {
  const modelCoin = Number(selectedAlgorithm?.waveCoin ?? 0)
  const paramsCoin = Object.values(selectedParams || {}).reduce(
    (sum: number, p: any) => sum + Number(p?.waveCoin ?? 0),
    0,
  )
  return modelCoin + paramsCoin
}

const normalizeAlgoConfigModels = (payload: any): any[] => {
  const rawList = Array.isArray(payload) ? payload : (payload?.algorithmModels || [])
  return Array.isArray(rawList) ? rawList : []
}

const fetchAlgoConfigTempRelation = async (menuCode: string) => {
  console.log('fetchAlgoConfigTempRelation', menuCode)
  if (!menuCode) return
  // 同一个菜单 code 只加载一次算法配置
  if (fetchedAlgoMenuCodes.has(menuCode)) return
  try {
    const res = await appApi.getAlgoConfigTempRelation({ menuCode })
    if (String((res as any)?.code) === '0000') {
      const dataObj: any = (res as any)?.data ?? (res as any)?.datas ?? {}
      const models = normalizeAlgoConfigModels(dataObj)
      const menuKey = menuKeyByCode[menuCode]
      if (menuKey) {
        const state = formDataByMenu[menuKey].params
        state.algorithmModels = models

        const triggerCoinCostCalculationOnce = () => {
          // 每个模块仅在“首次加载模型配置”时触发一次试算
          if (coinCostCalculatedOnceByMenu.has(menuKey)) return
          activeImageParamsMenuKey.value = menuKey
          // 优先使用“默认模型参数数据”（defaultParamObject），确保试算输入与弹窗默认回显一致
          const defaultParamObject = state?.defaultParamObject
          const hasDefaultParamObject =
            defaultParamObject &&
            Number(defaultParamObject?.algorithmId ?? 0) > 0 &&
            Array.isArray(defaultParamObject?.paramList)

          const selectionResult = hasDefaultParamObject
            ? defaultParamObject
            : (() => {
              const selectedAlgorithm = state?.selectedAlgorithm
              const selectedParams = state?.selectedParams || {}
              return {
                algorithmId: selectedAlgorithm?.algorithmId ?? selectedAlgorithm?.id ?? 0,
                algorithmCode: selectedAlgorithm?.code ?? selectedAlgorithm?.algorithmCode ?? '',
                algorithmName: selectedAlgorithm?.name ?? selectedAlgorithm?.algorithmName ?? '',
                paramList: Object.values(selectedParams).map((p: any) => ({
                  templateId: p?.templateId || '',
                  templateCode: p?.templateCode || '',
                  templateName: p?.templateName || '',
                  type: p?.type,
                  vipStatus: p?.vipStatus,
                  waveCoin: p?.waveCoin,
                  templateDesc: p?.templateDesc || '',
                  imageUrl: p?.imageUrl || '',
                })),
              }
            })()
          triggerCalculationPointNow(selectionResult, { debounceMs: 0 })
          coinCostCalculatedOnceByMenu.add(menuKey)
        }

        const hasSelectedParams = Object.keys(state.selectedParams || {}).length > 0
        // 接口仅返回 algorithmModels：默认值从数组内逐层按 defaultStatus 提取
        if (!hasSelectedParams) {
          const defaultState = buildDefaultStateFromModels(models)
          state.selectedAlgorithm = defaultState.selectedAlgorithm
          state.selectedParams = defaultState.selectedParams
          state.defaultModelsParams = defaultState.defaultModelsParams
          state.coinCost = defaultState.coinCost
          state.defaultParamObject = defaultState.defaultParamObject
          fetchedAlgoMenuCodes.add(menuCode)
          triggerCoinCostCalculationOnce()
          return
        }

        // 用户已手动选择：刷新模型后保持选择并重算展示/积分
        const currentAlgorithmId = String(state.selectedAlgorithm?.algorithmId ?? state.selectedAlgorithm?.id ?? '')
        const matchedAlgorithm = (models || []).find(
          (m: any) => String(m?.algorithmId ?? m?.id ?? '') === currentAlgorithmId,
        )
        state.selectedAlgorithm = matchedAlgorithm || models[0] || null
        const selectedParamNames = Object.values(state.selectedParams || {})
          .map((p: any) => String(p?.templateName || '').trim())
          .filter(Boolean)
        state.defaultModelsParams = [
          String(state.selectedAlgorithm?.name || ''),
          ...selectedParamNames,
        ].filter(Boolean)
        state.coinCost = calculateCoinCost(state.selectedAlgorithm, state.selectedParams)
        // 兼容：首次试算优先使用 defaultParamObject
        state.defaultParamObject = {
          algorithmId: state.selectedAlgorithm?.algorithmId ?? state.selectedAlgorithm?.id ?? 0,
          algorithmCode: state.selectedAlgorithm?.code ?? state.selectedAlgorithm?.algorithmCode ?? '',
          algorithmName: state.selectedAlgorithm?.name ?? state.selectedAlgorithm?.algorithmName ?? '',
          paramList: Object.values(state.selectedParams || {}).map((p: any) => ({
            templateId: p?.templateId || '',
            templateCode: p?.templateCode || '',
            templateName: p?.templateName || '',
            type: p?.type,
            vipStatus: p?.vipStatus,
            waveCoin: p?.waveCoin,
            templateDesc: p?.templateDesc || '',
            imageUrl: p?.imageUrl || '',
          })),
        }
        fetchedAlgoMenuCodes.add(menuCode)
        triggerCoinCostCalculationOnce()
      }
    }
  } catch (error) {
    fetchedAlgoMenuCodes.delete(menuCode)
    console.error('获取功能模型列表失败', error)
  }
}

const openImageParams = async () => {
  // getAlgoConfigTempRelation 要求传二级菜单 code，这里直接用当前左侧模块对应的 menuCode
  // 锁定弹窗对应的模块：防止用户切换左侧模块后，回显/试算更新到错误模块（避免“串联”）
  activeImageParamsMenuKey.value = leftMenu.value
  await fetchAlgoConfigTempRelation(menuCodeByKey[activeImageParamsMenuKey.value])

  showImageParamPopup.value = true
}

const resolveMenuCodeByLeftMenu = (menu: LeftMenuKey) => {
  const targetCode = menuCodeByKey[menu]

  // 右侧只展示“一级菜单”，所以这里需要把命中的任意层级子节点 menuCode
  // 归一化到其“一级父节点 menuCode”（支持超过两层嵌套）。
  const isMatch = (node: any, code: string): boolean => {
    if (!node) return false
    if (String(node?.menuCode ?? '') === code) return true
    const children = Array.isArray(node?.children) ? node.children : []
    return children.some((c: any) => isMatch(c, code))
  }

  for (const top of allPlatformMenus.value || []) {
    const topCode = String(top?.menuCode ?? '')
    if (!topCode) continue
    if (isMatch(top, targetCode)) return topCode
  }

  // 找不到时兜底返回原目标 code（让现有逻辑尽量不被破坏）
  return String(targetCode || '')
}

// 把任意层级 menuCode 归一化到一级菜单 code（用于 submit 的 functionCode -> 右侧 tabKey）
const resolveTopMenuCodeByAnyCode = (targetCode: string) => {
  const code = String(targetCode ?? '').trim()
  if (!code) return ''
  const isMatch = (node: any, c: string): boolean => {
    if (!node) return false
    if (String(node?.menuCode ?? '') === c) return true
    const children = Array.isArray(node?.children) ? node.children : []
    return children.some((n: any) => isMatch(n, c))
  }
  for (const top of allPlatformMenus.value || []) {
    const topCode = String(top?.menuCode ?? '')
    if (!topCode) continue
    if (isMatch(top, code)) return topCode
  }
  // 菜单树未就绪/找不到：先返回原 code（后续菜单加载后会再归一化）
  return code
}

// 菜单树加载后，把 pendingLocalMap 里已存在的占位 menuCode 归一化到一级菜单 key
const normalizePendingLocalMenuCodes = () => {
  if (!pendingLocalMap.size) return
  const topTabKeySet = new Set<string>(
    (rightContentTabs.value || [])
      .map((t: any) => String(t?.key ?? '').trim())
      .filter(Boolean),
  )
  for (const [k, v] of pendingLocalMap.entries()) {
    const current = String((v as any)?.menuCode ?? '').trim()
    if (!current) continue
    // 已经是合法的一级 tabKey：不要改，避免“刚显示又被改掉从而被过滤”
    if (topTabKeySet.has(current)) continue
    const nextMenuCode = resolveTopMenuCodeByAnyCode(current)
    if (nextMenuCode && nextMenuCode !== current) {
      pendingLocalMap.set(k, { ...(v as any), menuCode: nextMenuCode })
    }
  }
}
// 同步激活菜单代码
const syncActiveMenuCode = () => {
  activeMenuCode.value = resolveMenuCodeByLeftMenu(leftMenu.value)
}

/** 在菜单树中按 menuCode 查找节点（getFunctionPrompt 要用「具体功能」节点 id，不是一级父节点 id） */
const findPlatformMenuNodeByCode = (nodes: any[] | undefined, code: string): any | null => {
  if (!code || !Array.isArray(nodes)) return null
  for (const n of nodes) {
    if (!n) continue
    if (String(n?.menuCode ?? '') === code) return n
    const child = findPlatformMenuNodeByCode(n?.children || [], code)
    if (child) return child
  }
  return null
}

// 当前左侧功能模块的 menuId（用于 getFunctionPrompt「试一试」）：与左侧 rail 对应的二级/叶子 menuCode 的 id
const currentMenuId = computed(() => {
  const targetCode = menuCodeByKey[leftMenu.value]
  if (!targetCode) return ''
  const matched = findPlatformMenuNodeByCode(allPlatformMenus.value || [], targetCode)
  return matched?.id != null ? String(matched.id) : ''
})

// ==================== 灵衍值试算（首次加载一次 + 弹窗“确定”再触发） ====================
const calculationToken = ref(0)
const calculationDebounceTimer = ref<number | null>(null)
// 记录当前“试算”绑定的模块：首次加载与弹窗确定时，都严格用它更新对应模块数据
const activeImageParamsMenuKey = ref<LeftMenuKey>('aiFashion')

// 记录每个模块是否已完成“首次加载”试算（后续只在弹窗确定时再试算一次）
const coinCostCalculatedOnceByMenu = new Set<LeftMenuKey>()

// 灵衍值试算
const triggerCalculationPointNow = (selectionResult: any, opts?: { debounceMs?: number }) => {
  const targetMenuKey = activeImageParamsMenuKey.value
  const state = formDataByMenu[targetMenuKey].params

  const menuCode = menuCodeByKey[targetMenuKey]
  const modelConfigId = Number(selectionResult?.algorithmId ?? 0)
  const modelConfigCode = String(selectionResult?.algorithmCode ?? '')
  const modelConfigName = String(selectionResult?.algorithmName ?? '')
  if (!menuCode || !modelConfigId || !modelConfigCode || !modelConfigName) return

  // doCalculationPoint 只需要公共字段：算法模型 + menuCode + templateParams
  const payload = buildCommonPayloadBase(
    menuCode,
    modelConfigId,
    modelConfigCode,
    modelConfigName,
    selectionResult?.paramList || [],
  )

  // token 用于丢弃过期响应；debounce 用于减少短时间内的重复试算
  const currentToken = ++calculationToken.value
  if (calculationDebounceTimer.value != null) window.clearTimeout(calculationDebounceTimer.value)
  const debounceMs = typeof opts?.debounceMs === 'number' ? opts.debounceMs : 300
  calculationDebounceTimer.value = window.setTimeout(async () => {
    // 只要有新的选择触发，就丢弃当前请求结果
    if (currentToken !== calculationToken.value) return
    try {
      const res = await algoApi.doCalculationPoint(payload)
      if (currentToken !== calculationToken.value) return

      const data: any = (res as any)?.data ?? (res as any)
      if (String((res as any)?.code) !== '0000') return

      // 按你的要求：直接使用接口返回 points 字段
      const points = Number(data?.points ?? 0)
      if (Number.isFinite(points) && points >= 0) {
        state.coinCost = points
      }
    } catch (_e) {
      // 试算失败不影响生成，只保留本地 coinCost
    }
  }, debounceMs)
}

const handleImageParamsConfirm = (result: any) => {
  // ImageParamPopup 的 result: { algorithmId, algorithmName, paramList: [{templateName,...}, ...] }
  const state = formDataByMenu[activeImageParamsMenuKey.value].params
  const algorithmName = String(result?.algorithmName || '').trim()
  const paramNames: string[] = Array.isArray(result?.paramList)
    ? result.paramList.map((p: any) => String(p?.templateName || '').trim()).filter(Boolean)
    : []
  state.defaultModelsParams = [algorithmName || state.defaultModelsParams?.[0] || '', ...paramNames].filter(Boolean)
  state.selectedParams = Array.isArray(result?.paramList)
    ? result.paramList.reduce((acc: Record<number, any>, p: any) => {
      const t = Number(p?.type)
      if (Number.isFinite(t)) acc[t] = p
      return acc
    }, {})
    : {}
  state.selectedAlgorithm = (state.algorithmModels || []).find(
    (m: any) => String(m?.algorithmId ?? m?.id) === String(result?.algorithmId)
  ) || null
  const paramsCoin = Array.isArray(result?.paramList)
    ? result.paramList.reduce((sum: number, p: any) => sum + Number(p?.waveCoin ?? 0), 0)
    : 0
  const modelCoin = Number(
    (state.algorithmModels || []).find(
      (m: any) => String(m?.algorithmId ?? m?.id) === String(result?.algorithmId)
    )?.waveCoin ?? 0
  )
  state.coinCost = modelCoin + paramsCoin
  state.defaultParamObject = result

  void triggerCalculationPointNow(result)
}

const handleImageParamsSelectionChange = (_result: any) => {
  // 本需求：灵衍值试算不随弹窗内切换实时触发，避免多次扣灵衍值请求
}

const handleImageParamsClose = (_result: any) => {
  // 关闭弹窗不触发试算；coinCost/credits 由“首次加载”和“确定”触发后更新
}

// ==================== 灵感词词典弹窗（父层统一管理） ====================
const handleInspirationLibrary = () => {
  activeInspirationMenu.value = leftMenu.value
  fetchInspirationWords(leftMenu.value)
  showInspirationLibrary.value = true
}

const handleInspirationConfirm = (words: any[]) => {
  formDataByMenu[activeInspirationMenu.value].inspirationWords = words
  showInspirationLibrary.value = false
}

const normalizeWordsList = (list: any[] = []) => {
  return list
    .map((item) => ({
      id: String(item?.id ?? item?.wordsId ?? item?.code ?? ''),
      name: String(item?.name ?? item?.wordsName ?? item?.content ?? item?.title ?? ''),
      wordsDesc: String(item?.wordsDesc ?? ''),
    }))
    .filter((item) => item.id && item.name)
}

const normalizeInspirationCategories = (list: any[] = []) => {
  return list
    .map((item: any) => ({
      code: String(item?.code ?? item?.typeCode ?? item?.id ?? ''),
      title: String(item?.title ?? item?.typeName ?? item?.content ?? ''),
      wordsList: normalizeWordsList(item?.wordsList || item?.children || []),
    }))
    .filter((item) => item.code && item.title)
}

// 灵感词词典数据
const libraryData = ref<any[]>([])

// 面料创款：fabric_image_type 词典（用于把“生成图片类型”(flat/model/3d)映射成后端 imageTypeParams）
const fabricImageTypeOptionTree = ref<any[]>([])

const fetchFabricImageTypeOptionTree = async () => {
  try {
    const functionCode = menuCodeByKey.fabricCreative
    const typeCode = CREATION_PARAM_CODES.FABRIC_IMAGE_TYPE
    if (!functionCode || !typeCode) {
      fabricImageTypeOptionTree.value = []
      return
    }

    const res = await appApi.getInspirationWords({ functionCode, typeCode })
    if (String((res as any)?.code) === '0000' && Array.isArray(res?.data)) {
      fabricImageTypeOptionTree.value = res.data as any[]
      return
    }
    fabricImageTypeOptionTree.value = []
  } catch (error) {
    fabricImageTypeOptionTree.value = []
    console.error('获取面料创款 fabric_image_type 词典失败', error)
  }
}

/** 线稿转实物：左侧三组单选（线稿类型/线稿风格/图片类型），后端一次返回（typeCode=sketch_type） */
const sketchToRealParamCategories = ref<any[]>([])

/**
 * 实物转线稿-页面配置：左侧分段单选（线稿生成类型/风格等）
 * typeCode = sketch_generation_type（与线稿转实物的 sketch_type 用法一致，一次返回多组 class）
 */
const realToSketchParamCategories = ref<any[]>([])

const fetchSketchToRealParamCategories = async (functionCode: string) => {
  try {
    const res = await appApi.getInspirationWords({
      functionCode,
      typeCode: CREATION_PARAM_CODES.SKETCH_TYPE,
    })
    if (String((res as any)?.code) === '0000' && Array.isArray((res as any)?.data)) {
      sketchToRealParamCategories.value = ((res as any).data as any[]).filter(
        (x: any) => Array.isArray(x?.children) && x.children.length > 0,
      )
      return
    }
    sketchToRealParamCategories.value = []
  } catch (_e) {
    sketchToRealParamCategories.value = []
  }
}

const fetchRealToSketchParamCategories = async (functionCode: string) => {
  try {
    const res = await appApi.getInspirationWords({
      functionCode,
      typeCode: CREATION_PARAM_CODES.SKETCH_GENERATION_TYPE,
    })
    if (String((res as any)?.code) === '0000' && Array.isArray((res as any)?.data)) {
      realToSketchParamCategories.value = ((res as any).data as any[]).filter(
        (x: any) => Array.isArray(x?.children) && x.children.length > 0,
      )
      return
    }
    realToSketchParamCategories.value = []
  } catch (_e) {
    realToSketchParamCategories.value = []
  }
}

const fetchInspirationWords = async (menu: LeftMenuKey = leftMenu.value) => {
  const functionCode = menuCodeByKey[menu]
  // 灵感词词典：typeCode = inspiration_words，按当前模块 functionCode（如实物转线稿 phys_obj_to_line_draw）区分配置
  const typeCode = CREATION_PARAM_CODES.INSPIRATION_WORDS
  if (!functionCode || !typeCode) {
    libraryData.value = []
    if (menu !== 'sketchToReal') sketchToRealParamCategories.value = []
    if (menu !== 'realToSketch') realToSketchParamCategories.value = []
    return
  }
  if (menu !== 'sketchToReal') {
    sketchToRealParamCategories.value = []
  }
  if (menu !== 'realToSketch') {
    realToSketchParamCategories.value = []
  }
  try {
    const res = await appApi.getInspirationWords({
      functionCode,
      typeCode,
    })
    if (String((res as any)?.code) === '0000' && Array.isArray(res?.data)) {
      libraryData.value = normalizeInspirationCategories(res.data)
      return
    }
    libraryData.value = []
    if (menu === 'sketchToReal') sketchToRealParamCategories.value = []
    if (menu === 'realToSketch') realToSketchParamCategories.value = []
  } catch (error) {
    libraryData.value = []
    if (menu === 'sketchToReal') sketchToRealParamCategories.value = []
    if (menu === 'realToSketch') realToSketchParamCategories.value = []
    console.error('获取灵感词词典失败', error)
  }
}

// ==================== 右侧：我的创作（列表 + 缩略图） ====================
// 列表分页/加载状态（避免与左侧“提交生成”loading 互相干扰）
// 初始为 true：避免首屏/从详情 router.back 重新挂载时，在 onMounted 拉列表前误展示「空状态」闪一下
const listLoading = ref(true)

const listPageSize = ref(12)
const listPage = ref(1)

const hasMoreData = ref(false)
// 左侧“提交生成”按钮 loading
const loading = ref(false)
// 右侧列表无限滚动 loadingMore（复用 MainImageDisplay / ThumbnailGallery 的 loadingMore）
const loadingMore = ref(false)

const currentContentTab = ref<string>('favorites')
// 首次进入后右侧列表已初始化；keep-alive 下切换 leftMenu 时才触发刷新，避免 onMounted 重复拉取
const hasInitializedRightList = ref(false)

// 根据左侧模块 key 推导右侧 tabKey：来源是哪个模块就选中哪个模块的一级菜单
const deriveRightTabKeyFromLeftMenu = () => {
  const moduleMenuCode = resolveMenuCodeByLeftMenu(leftMenu.value)
  const rightTabs = rightContentTabs.value
  return rightTabs.some((t) => t.key === moduleMenuCode) ? moduleMenuCode : ''
}

// 进入面料创款时，右侧应优先展示“AI面料”分组
const resolveFabricRightTabKey = () => {
  const moduleMenuCode = resolveMenuCodeByLeftMenu('fabricCreative')
  const rightTabs = rightContentTabs.value || []
  if (rightTabs.some((t) => t.key === moduleMenuCode)) return moduleMenuCode
  // 兜底：部分环境菜单 code 可能有历史差异，按“面料”文案匹配
  const fallback = rightTabs.find((t: any) => {
    const key = String(t?.key ?? '').trim()
    if (!key || key === 'favorites') return false
    const label = String(t?.label ?? '').trim()
    return label.includes('面料')
  })
  return String(fallback?.key ?? '')
}

// 左侧模块与右侧 tab 必须一致：从面料切回服装设计时，不能把 tab 留在「AI面料」
const resolveRightTabKeyForLeftMenu = (menu: LeftMenuKey) => {
  if (menu === 'fabricCreative') return resolveFabricRightTabKey()
  const moduleMenuCode = resolveMenuCodeByLeftMenu(menu)
  const rightTabs = rightContentTabs.value || []
  if (rightTabs.some((t) => t.key === moduleMenuCode)) return moduleMenuCode
  return deriveRightTabKeyFromLeftMenu()
}

const syncRightContentTabToLeftMenu = (menu: LeftMenuKey) => {
  const fabricTabKey = resolveFabricRightTabKey()
  const nextTab = resolveRightTabKeyForLeftMenu(menu)
  if (!nextTab) return

  // 进入面料创款：右侧必须是 AI面料
  if (menu === 'fabricCreative') {
    if (currentContentTab.value === nextTab) return
    currentContentTab.value = nextTab
    if (hasInitializedRightList.value) {
      void fetchMyCreations(true, { clearList: true })
    }
    return
  }

  // 非面料：仅当右侧仍停留在「AI面料」时才纠正（避免从面料回到服装设计仍高亮面料）
  // 不强制覆盖用户已选的「全部 / 收藏」，也不在线稿子模块之间切换时改 tab
  if (fabricTabKey && currentContentTab.value === fabricTabKey) {
    if (currentContentTab.value === nextTab) return
    currentContentTab.value = nextTab
    if (hasInitializedRightList.value) {
      void fetchMyCreations(true, { clearList: true })
    }
  }
}

// 右侧 tab -> 列表查询参数
// - tabKey 是一级菜单的 menuCode（favorites 为收藏）,默认空字符串
// - fileType默认为''
const deriveListMenuCode = (tabKey: string) => {
  // “全部”/“收藏”场景：不做 menuCode 限定（传空字符串让后端走全量）
  if (tabKey === '' || tabKey === 'favorites') return ''
  return tabKey
}

const deriveListQueryParams = (tabKey: string) => {
  // 你的约定：非收藏场景传空字符串；收藏场景才传 '1'
  const collectStatus = tabKey === 'favorites' ? '1' : ''
  // 按你的要求：列表查询时 fileType 不做筛选 -> 传空字符串
  const fileType = ''
  return { collectStatus, fileType }
}

// 生成中占位的展示规则：只在「全部」和「对应一级菜单」里出现；「收藏」不出现
const shouldShowPendingInTab = (tabKey: string, moduleMenuCode: string) => {
  const t = String(tabKey ?? '').trim()
  const m = String(moduleMenuCode ?? '').trim()
  if (!m) return false
  if (t === 'favorites') return false
  if (t === '') return true // 全部
  return t === m
}

// 把 queryAlgoResultPage 返回记录映射为前端 CreationResult（复用公共映射）
const mapRecordToCreationResult = (r: any): CreationResult | null => {
  return mapRecordToCreationResultCommon(r, {
    fallbackCreateTime: new Date().toISOString(),
  })
}

// 列表合并去重：
// - 优先用结果 id（algoResulId）
// - 若 id 缺失（提交后的本地“生成中”占位），退化用 algoOrderNo 去重
// - 同 key 冲突时优先保留“信息更完整”的那条（有 id / 有 url）
const dedupeCreationResultsPreserveOrder = (arr: CreationResult[]): CreationResult[] => {
  const map = new Map<string, CreationResult>()
  const keyOf = (item: CreationResult) => {
    const id = String((item as any)?.id ?? '').trim()
    if (id) return `id:${id}`
    const orderNo = String((item as any)?.algoOrderNo ?? '').trim()
    if (orderNo) return `order:${orderNo}`
    return ''
  }
  const score = (item: CreationResult) => {
    const id = String((item as any)?.id ?? '').trim()
    const url = String((item as any)?.url ?? '').trim()
    const thumb = String((item as any)?.thumbUrl ?? '').trim()
    return (id ? 10 : 0) + (url ? 3 : 0) + (thumb ? 1 : 0)
  }

  for (let i = 0; i < arr.length; i++) {
    const item = arr[i]
    if (!item) continue
    const key = keyOf(item) || `fallback:${i}` // 稳定兜底 key：同一次合并内固定
    if (!map.has(key)) {
      map.set(key, item)
      continue
    }
    const existed = map.get(key) as CreationResult
    if (score(item) > score(existed)) map.set(key, item)
  }
  return Array.from(map.values())
}

type FetchCreationsOpts = {
  clearList?: boolean
  /** 是否强制刷新「生成中」列表（orderResulGenerated） */
  forceInProgress?: boolean
}

// 每个 tabKey 仅在“首次进入/首次拉取”时注入一次后端的 orderResulGenerated，
// 避免下拉加载更多时把生成中记录越堆越多。
const injectedInProgressByTab = new Map<string, boolean>()
// 列表请求序号：只允许最新一次请求回填，避免切 tab 与提交并发时旧响应覆盖新状态
let fetchCreationsRequestSeq = 0

// 拉取“我的创作列表”（支持 reset=重置分页、并把新结果合并去重）
const fetchMyCreations = async (reset = false, opts?: FetchCreationsOpts) => {
  if (loadingMore.value) return
  // 加载更多走 reset=false；全量刷新走 reset=true。初始 listLoading=true 时仍允许首次 reset 进入
  if (listLoading.value && !reset) return

  if (reset) {
    stopAllQueryTimers()
    listPage.value = 1
    hasMoreData.value = false
    // 仅切换 tab 等需要「立刻换一批」时清空；从详情返回重挂载时不先清空，避免空状态闪烁
    if (opts?.clearList) {
      // reset 直接清空当前列表；本地生成中占位由 pendingLocalMap 统一托管
      assets.value = []
      currentIndex.value = 0
    }
  }

  const tabKey = currentContentTab.value
  const requestSeq = ++fetchCreationsRequestSeq
  const { collectStatus, fileType } = deriveListQueryParams(tabKey)
  const menuCode = deriveListMenuCode(tabKey)
  // menuCode 可能是空字符串（对应“全部”tab），此时依然要发起查询

  const isLoadMore = !reset

  try {
    if (isLoadMore) loadingMore.value = true
    else listLoading.value = true

    const res = await algoApi.queryAlgoResultPage({
      menuCode,
      fileType,
      collectStatus,
      currentPage: listPage.value,
      pageSize: listPageSize.value,
    })

    const code = String((res as any)?.code ?? '')
    if (code !== '0000') {
      throw new Error(String((res as any)?.msg ?? 'queryAlgoResultPage failed'))
    }

    const data: any = (res as any)?.data ?? {}
    const recordsRaw: any[] = Array.isArray(data?.list) ? data.list : []

    // 若期间又触发了新的列表请求（如切 tab/提交后刷新），丢弃当前旧响应，避免覆盖最新 UI
    if (requestSeq !== fetchCreationsRequestSeq) return

    let recordsMapped = recordsRaw.map(mapRecordToCreationResult).filter(Boolean) as CreationResult[]
    // 进行中：后端会单独返回 orderResulGenerated
    // - 仅在 reset（第一页刷新）时按需注入兜底（首次进入/切 tab/手动刷新）
    // - loadMore（下拉分页）时绝不注入，避免生成中内容重复堆叠
    // - 若本地已存在生成中占位（submit 插入），则无需再从后端兜底注入
    const hasLocalInProgress =
      reset &&
      Array.from(pendingLocalMap.values()).some((a: any) => {
        const st = Number(a?.status ?? 0)
        if (st !== 1 && st !== 2 && st !== 0) return false
        return shouldShowPendingInTab(tabKey, String(a?.menuCode ?? ''))
      })
    const shouldInjectInProgress =
      reset &&
      !hasLocalInProgress &&
      (opts?.forceInProgress === true || injectedInProgressByTab.get(tabKey) !== true)
    const inProgressRaw: any[] = shouldInjectInProgress && Array.isArray(data?.orderResulGenerated)
      ? data.orderResulGenerated
      : []
    let inProgressMapped = inProgressRaw.map(mapRecordToCreationResult).filter(Boolean) as CreationResult[]
    if (shouldInjectInProgress) injectedInProgressByTab.set(tabKey, true)

    // 收藏：不展示生成中（无论后端是否返回）
    if (tabKey === 'favorites') {
      const notGenerating = (a: any) => {
        const st = Number(a?.status ?? 0)
        return st !== 0 && st !== 1 && st !== 2
      }
      recordsMapped = recordsMapped.filter(notGenerating)
      inProgressMapped = []
    }

    if (reset) {
      // 首次/重置：本地 pending（按 tab 规则投影） + 后端 inProgress + 当前页 records
      const localPending = Array.from(pendingLocalMap.values()).filter((a: any) => {
        const st = Number(a?.status ?? 0)
        const orderNo = String(a?.algoOrderNo ?? '').trim()
        const hasOrderNo = !!orderNo
        if (!hasOrderNo) return false
        if (st !== 1 && st !== 2 && st !== 0) return false
        return shouldShowPendingInTab(tabKey, String(a?.menuCode ?? ''))
      }) as CreationResult[]
      // reset 不应该把旧列表再拼回去（否则顺序会乱，变成“新页插到前面”）
      assets.value = dedupeCreationResultsPreserveOrder([...localPending, ...inProgressMapped, ...recordsMapped])
    } else {
      // 加载更多：只追加 records（不再注入 inProgress），保持当前选中项不跳动
      const selectedId = assets.value[currentIndex.value]?.id
      assets.value = dedupeCreationResultsPreserveOrder([...assets.value, ...recordsMapped])
      if (selectedId) {
        const nextIdx = assets.value.findIndex((a) => a?.id === selectedId)
        currentIndex.value = nextIdx >= 0 ? nextIdx : 0
      }
    }

    // 不在这里强制置顶：避免用户下滚查看时被轮询/刷新“拉回顶部”

    // 如果列表里已经包含“进行中”记录（orderResulGenerated），需要补上轮询，
    // 以便后端返回 status=3 后自动刷新 UI。
    const inProgressAssets = assets.value.filter((a) => {
      const st = Number(a?.status ?? 0)
      return st === 1 || st === 2
    })
    for (const a of inProgressAssets) {
      // 注意：轮询接口 query({ orderNo }) 需要传“订单号”，列表字段为 algoOrderNo
      const key = String(a?.algoOrderNo ?? '')
      if (!key) continue
      void algoPollingStore.start(key)
    }

    // 有更多数据判断：后端 hasNext 直接决定是否还有下一页
    hasMoreData.value = Boolean(data?.hasNext)

    // 开发环境兜底：用于直观看“生成中(status=2)/失败(status=4)”占位 UI
    // - 若列表缺少 status=2 或 status=4，则补入一条假数据（避免每次 reset 都重复插入）
    // if (import.meta.env.DEV && reset) {
    //   const wasEmpty = assets.value.length === 0
    //   const hasGen = assets.value.some((a: any) => Number(a?.status) === 2)
    //   const hasFail = assets.value.some((a: any) => Number(a?.status) === 4)
    //   if (!hasGen || !hasFail) {
    //     const now = new Date().toISOString()
    //     const menu = String(menuCode || 'dev')

    //     const mocks: any[] = []
    //     if (!hasGen) {
    //       mocks.push({
    //         id: 'dev-mock-order-gen-2',
    //         algoOrderId: 'dev-mock-order-gen-2',
    //         algoUuId: null,
    //         menuCode: menu,
    //         thumbUrl: null,
    //         url: null,
    //         originalUrl: null,
    //         fileType: 1,
    //         collectStatus: 0,
    //         status: 2,
    //         prompt: '生成中（假数据）',
    //         createTime: now,
    //         progress: 30,
    //       })
    //     }
    //     if (!hasFail) {
    //       mocks.push({
    //         id: 'dev-mock-order-fail-4',
    //         algoOrderId: 'dev-mock-order-fail-4',
    //         algoUuId: null,
    //         menuCode: menu,
    //         thumbUrl: null,
    //         url: null,
    //         originalUrl: null,
    //         fileType: 1,
    //         collectStatus: 0,
    //         status: 4,
    //         prompt: '生成失败（假数据）',
    //         createTime: now,
    //         progress: 0,
    //       })
    //     }

    //     assets.value = [...mocks, ...assets.value] as any
    //     currentIndex.value = 0
    //     if (wasEmpty) hasMoreData.value = false
    //   }
    // }

    // 如果首次加载没数据，确保 currentIndex 不越界
    if (assets.value.length === 0) currentIndex.value = 0
    else if (currentIndex.value >= assets.value.length) currentIndex.value = 0
  } catch (e) {
    console.error('[AiFashionStudio] fetchMyCreations failed:', e)
    if (reset && opts?.clearList) {
      assets.value = []
    }
    hasMoreData.value = false
  } finally {
    listLoading.value = false
    loadingMore.value = false
  }
}

// 右侧 tab 切换：重置列表并重新加载
const handleContentTabChange = (tabKey: string, _fileType?: number) => {
  currentContentTab.value = tabKey === 'favorites' ? 'favorites' : String(tabKey)
  void fetchMyCreations(true, { clearList: true })
}

// 无限滚动加载更多：分页 +1 并继续追加到 assets
const handleLoadMore = () => {
  if (loadingMore.value || listLoading.value || !hasMoreData.value) return
  listPage.value += 1
  void fetchMyCreations(false)
}

// 点击缩略图：切换主图并保持 currentIndex 同步
const handleThumbnailClick = (idx: number) => {
  currentIndex.value = idx
  mainImageRef.value?.scrollToAsset?.(idx)
}

// 主图滚动：同步缩略图列表滚动位置
const handleScrollChange = (scrollPercentage: number) => {
  lastMainScrollPercentage.value = Number(scrollPercentage ?? 0) || 0
  thumbnailRef.value?.syncScroll?.(scrollPercentage)
}

// 缩略图滚动：同步主图滚动位置
const handleScrollSync = (scrollPercentage: number) => {
  lastMainScrollPercentage.value = Number(scrollPercentage ?? 0) || 0
  mainImageRef.value?.syncScroll?.(scrollPercentage)
}

// 收藏/取消收藏（AI 工作台生成的算法结果）
const handleCollect = async (idx: number) => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    return
  }

  const asset = assets.value[idx]
  if (!asset?.id) {
    ElMessage.error('结果ID丢失，无法收藏')
    return
  }

  const wasCollected = Number(asset.collectStatus ?? 0) === 1
  try {
    const response = await algoApi.collect({
      algoOrderResultId: [String(asset.id)],
    })

    if (response.code === '0000') {
      // 如果后端直接返回 collectStatus，同步一下，便于 UI 兜底展示
      const nextCollectStatus = (response.data as any)?.collectStatus
      if (nextCollectStatus !== undefined) {
        asset.collectStatus = Number(nextCollectStatus)
      } else {
        asset.collectStatus = wasCollected ? 0 : 1
      }
      ElMessage.success(wasCollected ? '取消收藏' : '收藏成功')
    } else {
      ElMessage.error(response.msg || '网络开小差了，请稍后重试~')
    }
  } catch (e) {
    console.error('[AiFashionStudio] collect failed:', e)
    ElMessage.error('网络开小差了，请稍后重试~')
  }
}

// 下载生成结果：会员且开启“去除水印”时，图片优先下载 originalUrl
const handleAssetDownload = async (idx: number, removeWatermark?: boolean) => {
  const asset = assets.value[idx] as any
  if (!asset) return

  const isVideo = Number(asset?.fileType) === 2 || Number(asset?.fileType) === 4
  const wantRemoveWatermark = !!removeWatermark && isUserVip.value
  const downloadUrl = (() => {
    if (wantRemoveWatermark && !isVideo && asset?.originalUrl) {
      return String(asset.originalUrl)
    }
    // 后端当前仅返回 url/thumbUrl，这里优先用 url，再退回 thumbUrl
    return String(asset?.url || asset?.thumbUrl || '')
  })()

  if (!downloadUrl) {
    ElMessage.warning('文件地址无效')
    return
  }

  try {
    await watermarkDownloader.download(downloadUrl, {
      silent: false,
    })
  } catch (error) {
    console.error('[AiFashionStudio] 下载失败', error)
    ElMessage.error('下载失败，请稍后重试')
  }
}

// 删除算法生成结果（AI 工作台列表）
const handleAlgoDelete = async (idx: number) => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    return
  }

  const asset = assets.value[idx]
  if (!asset?.id) {
    ElMessage.error('结果ID丢失，无法删除')
    return
  }

  try {
    await ElMessageBox.confirm('确定要删除这个生成结果吗？删除后将无法恢复。', '删除创作确认', {
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

    const response = await algoApi.del({
      algoOrderResultId: [String(asset.id)],
    })

    if (response.code === '0000') {
      assets.value.splice(idx, 1)
      ElMessage.success('删除成功')

      // 保证当前选中索引有效
      if (assets.value.length === 0) {
        currentIndex.value = 0
      } else if (currentIndex.value >= assets.value.length) {
        currentIndex.value = assets.value.length - 1
      } else if (currentIndex.value > idx) {
        currentIndex.value = currentIndex.value - 1
      }
    } else {
      ElMessage.error(response.msg || '删除失败')
    }
  } catch (e: any) {
    if (e === 'cancel') return
    console.error('[AiFashionStudio] del failed:', e)
    ElMessage.error('网络开小差了，请稍后重试~')
  }
}

// ==================== 左侧：上传参考图（支持从右侧拖拽） ====================

// ai服装设计：参考图 slots（slot-0 ~ slot-5）
const parseAiFashionSlotIndex = (position: any): number | null => {
  const s = String(position ?? '')
  const m = s.match(/(\d+)/)
  if (!m) return null
  const idx = Number(m[1])
  if (!Number.isFinite(idx)) return null
  if (idx < 0 || idx > 5) return null
  return idx
}

/** 面料创款：换图/选历史时清理“纹理图上传缓存”，避免与左侧原图预览混用 */
const clearFabricCreativeTransientFields = (form: any) => {
  form.fabricProcessedImageUrl = undefined
  form.originalImage = []
  form.zoomRatio = undefined
}

const handleDropFile = async (payload: any) => {
  const currentForm = formDataByMenu[leftMenu.value]
  // payload 可能来自：
  // 1) 本地文件拖拽：{ file, type, position }
  // 2) 我的创作拖拽：{ url, taskResultId, type, position, fileType }
  if (payload?.file) {
    if (refImageUploading.value) {
      ElMessage.info('图片上传中…')
      return
    }
    refImageUploading.value = true
    const file: File = payload.file
    let uploadResult: any
    try {
      uploadResult = await uploadApi.uploadImage(file, {
        showLoading: true,
        showMessage: true,
      })
    } finally {
      refImageUploading.value = false
    }
    // uploadApi 已按 showMessage 展示接口 msg，此处勿再弹窗避免重复
    if (!uploadResult?.success || !uploadResult?.url) return
    const fileUrl = String(uploadResult.url).trim()
    if (!fileUrl) return

    if (leftMenu.value === 'aiFashion') {
      const parsedIdx = parseAiFashionSlotIndex(payload.position)
      const nextImages = Array.isArray(currentForm.image) ? [...currentForm.image] : []

      const normalizeAiFashionPairs = (imgs: string[], ids: any[], max = 6) => {
        // 始终保持 imgs/ids 一一对应；过滤掉空字符串，避免出现“空位挤在中间”
        const pairs = imgs.map((img, i) => ({ img, id: ids[i] }))
          .filter((p) => String(p.img ?? '').trim().length > 0)
          .slice(0, max)
        return {
          imgs: pairs.map((p) => String(p.img)),
          ids: pairs.map((p) => String(p.id ?? '')),
        }
      }

      // 如果 position 解析不到（例如本地上传某些入口没带 slot 信息），则自动填充“下一个空位”
      const idx =
        parsedIdx ??
        (() => {
          const firstEmpty = nextImages.findIndex((x) => !String(x || '').trim())
          if (firstEmpty !== -1) return firstEmpty
          return nextImages.length
        })()

      if (idx > 5) {
        ElMessage.warning('最多可选择 6 张参考图')
        return
      }

      nextImages[idx] = fileUrl
      nextImages.length = Math.min(6, Math.max(nextImages.length, idx + 1))
      currentForm.image = nextImages

      const nextIds = Array.isArray(currentForm.taskResultId) ? [...currentForm.taskResultId] : []
      // 本地上传没有 taskResultId：用空字符串占位，提交时过滤掉
      nextIds[idx] = ''
      nextIds.length = Math.min(6, Math.max(nextIds.length, idx + 1))
      currentForm.taskResultId = nextIds

      // 将“最新上传的这张图”移动到最前面（index=0），保证 UI 从前到后是最新优先
      const movedImg = currentForm.image[idx]
      const movedId = (currentForm.taskResultId || [])[idx] ?? ''
      const imgs2 = [...currentForm.image]
      const ids2 = [...(currentForm.taskResultId || [])]
      if (idx >= 0 && idx < imgs2.length) {
        imgs2.splice(idx, 1)
        ids2.splice(idx, 1)
        imgs2.unshift(movedImg)
        ids2.unshift(movedId)
        const normalized = normalizeAiFashionPairs(imgs2, ids2)
        currentForm.image = normalized.imgs
        currentForm.taskResultId = normalized.ids
      }
      return
    }

    if (leftMenu.value === 'fabricCreative') clearFabricCreativeTransientFields(currentForm)
    currentForm.image = fileUrl
    currentForm.taskResultId = undefined
    currentForm.historyImageType = undefined
    return
  }

  if (payload?.url) {
    const url = String(payload.url)

    if (leftMenu.value === 'aiFashion') {
      const parsedIdx = parseAiFashionSlotIndex(payload.position)
      const nextImages = Array.isArray(currentForm.image) ? [...currentForm.image] : []

      const normalizeAiFashionPairs = (imgs: string[], ids: any[], max = 6) => {
        const pairs = imgs.map((img, i) => ({ img, id: ids[i] }))
          .filter((p) => String(p.img ?? '').trim().length > 0)
          .slice(0, max)
        return {
          imgs: pairs.map((p) => String(p.img)),
          ids: pairs.map((p) => String(p.id ?? '')),
        }
      }

      // 拖拽/历史带 position 的场景优先使用解析值；如果解析不到，仍然按“下一个空位”补位
      const idx =
        parsedIdx ??
        (() => {
          const firstEmpty = nextImages.findIndex((x) => !String(x || '').trim())
          if (firstEmpty !== -1) return firstEmpty
          return nextImages.length
        })()

      if (idx > 5) {
        ElMessage.warning('最多可选择 6 张参考图')
        return
      }

      nextImages[idx] = url
      nextImages.length = Math.min(6, Math.max(nextImages.length, idx + 1))
      currentForm.image = nextImages

      const nextIds = Array.isArray(currentForm.taskResultId) ? [...currentForm.taskResultId] : []
      const tid =
        payload.taskResultId == null || payload.taskResultId === ''
          ? ''
          : String(payload.taskResultId).trim()
      nextIds[idx] = tid
      nextIds.length = Math.min(6, Math.max(nextIds.length, idx + 1))
      currentForm.taskResultId = nextIds

      // 将“最新拖拽/选中的这张图”移动到最前面（index=0）
      const movedImg = currentForm.image[idx]
      const movedId = (currentForm.taskResultId || [])[idx] ?? ''
      const imgs2 = [...currentForm.image]
      const ids2 = [...(currentForm.taskResultId || [])]
      if (idx >= 0 && idx < imgs2.length) {
        imgs2.splice(idx, 1)
        ids2.splice(idx, 1)
        imgs2.unshift(movedImg)
        ids2.unshift(movedId)
        const normalized = normalizeAiFashionPairs(imgs2, ids2)
        currentForm.image = normalized.imgs
        currentForm.taskResultId = normalized.ids
      }
      return
    }

    if (leftMenu.value === 'fabricCreative') clearFabricCreativeTransientFields(currentForm)
    currentForm.image = url
    const tidSingle =
      payload.taskResultId == null || payload.taskResultId === ''
        ? undefined
        : String(payload.taskResultId).trim()
    currentForm.taskResultId = tidSingle
    // 与提交体 image 字段对应的历史参数 key，统一为 image
    currentForm.historyImageType = tidSingle != null ? 'image' : undefined
    return
  }
}
// 删除参考图
const handleRefDelete = (payload?: any) => {
  const currentForm = formDataByMenu[leftMenu.value]
  if (leftMenu.value === 'aiFashion') {
    const parsedIdx = parseAiFashionSlotIndex(payload?.position)
    if (parsedIdx == null) {
      // 未带槽位时兜底全清空（兼容旧调用）
      currentForm.image = []
      currentForm.taskResultId = undefined
      return
    }

    const nextImages = Array.isArray(currentForm.image) ? [...currentForm.image] : []
    const nextIds = Array.isArray(currentForm.taskResultId) ? [...currentForm.taskResultId] : []
    if (parsedIdx < 0 || parsedIdx >= nextImages.length) return

    nextImages.splice(parsedIdx, 1)
    if (nextIds.length) nextIds.splice(parsedIdx, 1)

    currentForm.image = nextImages
    currentForm.taskResultId = nextIds.length ? nextIds : undefined
  } else {
    if (leftMenu.value === 'fabricCreative') clearFabricCreativeTransientFields(currentForm)
    currentForm.image = ''
    currentForm.taskResultId = undefined
    currentForm.historyImageType = undefined
  }
}
// 打开历史创作弹窗
const openHistoryModal = (payload?: any) => {
  historyModalContext.value = payload && typeof payload === 'object' ? payload : null
  showHistoryModal.value = true
}
// 选择历史创作
const selectHistoryCreation = (item: any) => {
  const imageUrl = String(item?.imageUrl || item?.resultUrl || item?.thumbUrl || item?.url || '').trim()
  if (!imageUrl) return
  if (leftMenu.value === 'aiFashion') {
    const currentForm = formDataByMenu.aiFashion
    const parsedIdx = parseAiFashionSlotIndex(historyModalContext.value?.position)
    const nextImages = Array.isArray(currentForm.image) ? [...currentForm.image] : []
    const nextIds = Array.isArray(currentForm.taskResultId) ? [...currentForm.taskResultId] : []
    const idx =
      parsedIdx ??
      (() => {
        const firstEmpty = nextImages.findIndex((x) => !String(x || '').trim())
        if (firstEmpty !== -1) return firstEmpty
        return nextImages.length
      })()
    if (idx < 0 || idx > 5) {
      ElMessage.warning('最多可选择 6 张参考图')
      return
    }
    nextImages[idx] = imageUrl
    nextImages.length = Math.min(6, Math.max(nextImages.length, idx + 1))
    nextIds[idx] = item?.id == null ? '' : String(item.id)
    nextIds.length = Math.min(6, Math.max(nextIds.length, idx + 1))
    currentForm.image = nextImages
    currentForm.taskResultId = nextIds.some(Boolean) ? nextIds : undefined
    historyModalContext.value = null
    showHistoryModal.value = false
    return
  }

  const currentForm = formDataByMenu[leftMenu.value]
  if (leftMenu.value === 'fabricCreative') clearFabricCreativeTransientFields(currentForm)
  currentForm.image = imageUrl
  currentForm.taskResultId = item?.id == null ? undefined : String(item.id)
  currentForm.historyImageType = item?.id == null ? undefined : 'image'
  historyModalContext.value = null
  showHistoryModal.value = false
}

const refreshUserInfoIfLoggedIn = async () => {
  if (!userStore.isLoggedIn) return
  try {
    await userStore.getUserInfo()
  } catch (error) {
    console.error('刷新用户信息失败', error)
  }
}

// 根据路由参数初始化当前模块（从 AiDesign 页面跳转时生效）
onMounted(async () => {
  await refreshUserInfoIfLoggedIn()

  const mode = route.query.mode as LeftMenuKey | undefined
  if (mode && ['aiFashion', 'sketchToReal', 'realToSketch', 'fabricCreative'].includes(mode)) {
    leftMenu.value = mode
  }

  // 详情页“重新生成/再次生成”跳转过来时，支持预填参考图
  const refImageUrlFromQuery = route.query.refImageUrl
  if (refImageUrlFromQuery) {
    if (leftMenu.value === 'aiFashion') {
      formDataByMenu[leftMenu.value].image = [String(refImageUrlFromQuery)]
    } else {
      formDataByMenu[leftMenu.value].image = String(refImageUrlFromQuery)
    }
  }
  const taskResultIdFromQuery = route.query.taskResultId
  if (taskResultIdFromQuery) {
    if (leftMenu.value === 'aiFashion') {
      formDataByMenu[leftMenu.value].taskResultId = [String(taskResultIdFromQuery)]
    } else {
      formDataByMenu[leftMenu.value].taskResultId = String(taskResultIdFromQuery)
      formDataByMenu[leftMenu.value].historyImageType = 'image'
    }
  }

  await fetchSysPlatformMenu()
  syncActiveMenuCode()

  // 初始化右侧 tab：左侧当前模块对应的一级菜单；否则默认“全部”
  const moduleMenuCode = activeMenuCode.value
  const hasModuleTab = rightContentTabs.value.some((t) => t.key === moduleMenuCode)
  currentContentTab.value = hasModuleTab ? moduleMenuCode : deriveRightTabKeyFromLeftMenu()
  if (import.meta.env.DEV) {
    console.log('[AiFashionStudio] onMounted init tab:', {
      activeMenuCode: moduleMenuCode,
      hasModuleTab,
      currentContentTab: currentContentTab.value,
      rightTabs: rightContentTabs.value.map((t) => t.key),
    })
  }
  void fetchMyCreations(true)
  hasInitializedRightList.value = true

  setTimeout(() => {
    // 这里同样传二级菜单 code
    fetchAlgoConfigTempRelation(menuCodeByKey[leftMenu.value])
  }, 1000);
})

onActivated(() => {
  // 返回工作台时只刷新用户信息，不再强制根据初始 route.mode 覆盖用户当前选择的模块
  refreshUserInfoIfLoggedIn()
})

onBeforeUnmount(() => {
  algoPollingStore.stopAll()
})

watch(
  () => leftMenu.value,
  (menu) => {
    // 左侧模块变化时，更新左侧菜单激活状态
    syncActiveMenuCode()
    // 左侧模块变化时，右侧 tab 与列表必须与当前模块一致（避免从面料回到服装设计仍高亮 AI面料）
    syncRightContentTabToLeftMenu(menu)
    // 左侧切换：面料必对 AI面料；从面料回到其它模块时若右侧仍为 AI面料则纠正（「全部/收藏」在线稿子模块间切换时保留）
    fetchInspirationWords(menu)
    if (menu === 'fabricCreative') void fetchFabricImageTypeOptionTree()
    // 线稿转实物：进入模块时单独拉一次左侧三组选项（避免每次点“灵感词词库”都重复请求）
    if (menu === 'sketchToReal') {
      const functionCode = menuCodeByKey[menu]
      if (functionCode) void fetchSketchToRealParamCategories(functionCode)
    }
    if (menu === 'realToSketch') {
      const functionCode = menuCodeByKey[menu]
      if (functionCode) void fetchRealToSketchParamCategories(functionCode)
    }
    // getAlgoConfigTempRelation 需要传二级菜单 code，这里按照左侧模块映射
    fetchAlgoConfigTempRelation(menuCodeByKey[menu])
  },
  { immediate: true }
)

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
          min-height: 0;
          overflow: hidden;
          display: flex;
          flex-direction: column;

          >* {
            flex: 1;
            min-height: 0;
            min-width: 0;
          }
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
