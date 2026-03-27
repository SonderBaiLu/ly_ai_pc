<template>
  <div class="studio-page">
    <Header />

    <div class="studio-body">
      <!-- 左侧功能栏 -->
      <aside class="left-rail">
        <div v-for="item in leftRailItems" :key="item.key" class="rail-item" :class="{ active: leftMenu === item.key }"
          @click="leftMenu = item.key">
          <div class="rail-icon">
            <img :src="getRailIcon(item.key, leftMenu === item.key)" alt="" />
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
              :creation-type-selection="creationTypeSelectionByMenu.aiFashion"
              :default-image-params="currentImageDefaultParams"
              :inspiration-words="formDataByMenu.aiFashion.inspirationWords" :coin="imageCoin" :menu-id="currentMenuId"
              @open-type-modal="() => openTypeModal('aiFashion')"
              @clear-type-selection="() => clearTypeSelection('aiFashion')" @drop-file="handleDropFile"
              @delete="handleRefDelete" @coming-soon="showComingSoon" @show-params="openImageParams"
              @generate="handleAiFashionGenerate" @inspiration-library="handleInspirationLibrary"
              @show-history="openHistoryModal"
              @update:inspiration-words="(words) => formDataByMenu.aiFashion.inspirationWords = words" />
            <Fabric v-else-if="leftMenu === 'fabricCreative'" v-model:image-url="formDataByMenu.fabricCreative.image"
              :task-result-id="formDataByMenu.fabricCreative.taskResultId"
              :creation-type-selection="creationTypeSelectionByMenu.fabricCreative"
              :inspiration-words="formDataByMenu.fabricCreative.inspirationWords" :coin="imageCoin"
              :menu-id="currentMenuId" @open-type-modal="() => openTypeModal('fabricCreative')"
              @clear-type-selection="() => clearTypeSelection('fabricCreative')" @drop-file="handleDropFile"
              @delete="handleRefDelete" @coming-soon="showComingSoon" @show-params="openImageParams"
              @generate="handleFabricGenerate" @inspiration-library="handleInspirationLibrary"
              @show-history="openHistoryModal"
              @update:inspiration-words="(words) => formDataByMenu.fabricCreative.inspirationWords = words" />
            <SketchToReal v-else-if="leftMenu === 'sketchToReal'" v-model:image-url="formDataByMenu.sketchToReal.image"
              :task-result-id="formDataByMenu.sketchToReal.taskResultId"
              :creation-type-selection="creationTypeSelectionByMenu.sketchToReal"
              :inspiration-words="formDataByMenu.sketchToReal.inspirationWords" :coin="imageCoin"
              :menu-id="currentMenuId" @open-type-modal="() => openTypeModal('sketchToReal')"
              @clear-type-selection="() => clearTypeSelection('sketchToReal')" @drop-file="handleDropFile"
              @delete="handleRefDelete" @coming-soon="showComingSoon" @show-params="openImageParams"
              @inspiration-library="handleInspirationLibrary" @show-history="openHistoryModal"
              @update:inspiration-words="(words) => formDataByMenu.sketchToReal.inspirationWords = words" />
            <RealToSketch v-else v-model:image-url="formDataByMenu.realToSketch.image"
              :task-result-id="formDataByMenu.realToSketch.taskResultId"
              :creation-type-selection="creationTypeSelectionByMenu.realToSketch"
              :inspiration-words="formDataByMenu.realToSketch.inspirationWords" :coin="imageCoin"
              :menu-id="currentMenuId" @open-type-modal="() => openTypeModal('realToSketch')"
              @clear-type-selection="() => clearTypeSelection('realToSketch')" @drop-file="handleDropFile"
              @delete="handleRefDelete" @coming-soon="showComingSoon" @show-params="openImageParams"
              @inspiration-library="handleInspirationLibrary" @show-history="openHistoryModal"
              @update:inspiration-words="(words) => formDataByMenu.realToSketch.inspirationWords = words" />
          </section>

          <!-- 结果列表（主图 + 缩略图） -->
          <section class="result-panel">
            <MainImageDisplay ref="mainImageRef" :assets="assets" :current-index="currentIndex"
              :has-more-data="hasMoreData" :loading="loading" :loading-more="loadingMore" :is-vip="isUserVip"
              :remove-watermark-enabled="removeWatermarkEnabled"
              @asset-click="(idx: number) => (currentIndex = idx as any)" @scroll-change="handleScrollChange"
              @load-more="showComingSoon" @view-detail="handleViewDetail" @collect="handleCollect"
              @download="showComingSoon" @delete="handleAlgoDelete" @refresh="showComingSoon" />

            <ThumbnailGallery ref="thumbnailRef" :assets="assets" :current-index="currentIndex"
              :has-more-data="hasMoreData" :loading="(loading || loadingMore) as any"
              @thumbnail-click="handleThumbnailClick" @scroll-sync="handleScrollSync" @load-more="showComingSoon" />
          </section>
        </div>
      </main>
    </div>

    <!-- 模型参数弹窗（父层统一管理，子组件只负责触发 show-params） -->
    <ImageParamPopup v-model="showImageParamPopup" title="参数设置" :default-params="currentImageDefaultParams"
      :algorithm-models="currentImageAlgorithmModels" @confirm="handleImageParamsConfirm"
      @close="handleImageParamsClose" />

    <!-- 款型选择弹窗（父层统一管理，按 leftMenu 分开回显） -->
    <CreationTypeSelectModal v-model="showTypeModal" :selection="activeCreationTypeSelection"
      :option-tree="creationTypeOptionTree" @confirm="handleTypeConfirm" />

    <!-- 灵感词词典弹窗（父层统一管理） -->
    <InspirationLibrary v-model="showInspirationLibrary" :library-data="libraryData"
      :defaults="formDataByMenu[activeInspirationMenu].inspirationWords" @confirm="handleInspirationConfirm" />

    <HistoryCreativeModal v-model="showHistoryModal" source="creative" :file-type="1" @select="selectHistoryCreation" />
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { images } from '@/assets'
import { useUserStore } from '@/stores/user'
import { appApi } from '@/api/app'
import { algoApi, buildTemplateParamsFromPopup } from '@/api/algo'
import { APP_MENU_CODES } from '@/constants/appMenuCode'
import { CREATION_PARAM_CODES } from '@/constants/creationParamCode'
import type { CreationResult } from '@/composables/useTaskPolling'
import HistoryCreativeModal from '@/components/HistoryCreativeModal.vue'
import CreationTypeSelectModal, { type CreationTypeSelection } from '@/components/CreationTypeSelectModal.vue'
import { useTemplateStore } from '@/stores/template'
import Fashion from './left/Fashion.vue'
import SketchToReal from './left/SketchToReal.vue'
import RealToSketch from './left/RealToSketch.vue'
import Fabric from './left/FabricCreative.vue'

type LeftMenuKey = 'aiFashion' | 'sketchToReal' | 'realToSketch' | 'fabricCreative'
type RailItem = { key: LeftMenuKey; label: string; menuCode: string }

const route = useRoute()
const router = useRouter()
const templateStore = useTemplateStore()
const userStore = useUserStore()

const isUserVip = computed(() => Number(userStore.userInfo?.vipLevel ?? 0) > 0)

const removeWatermarkEnabled = computed(() => {
  return userStore.userInfo?.watermarkStatus === 1 ? true : false
})

const leftMenu = ref<LeftMenuKey>('aiFashion')
const isFabricEntry = route.query.mode === 'fabricCreative'
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
const creationTypeCodeByMenu: Record<LeftMenuKey, string> = {
  aiFashion: CREATION_PARAM_CODES.CREATION_STYLE,
  sketchToReal: CREATION_PARAM_CODES.SKETCH_TYPE,
  realToSketch: CREATION_PARAM_CODES.GARMENT_STYLE,
  fabricCreative: CREATION_PARAM_CODES.FABRIC_IMAGE_TYPE,
}

const defaultRailLabelByKey: Record<LeftMenuKey, string> = {
  aiFashion: 'AI服装设计',
  sketchToReal: '线稿转实物',
  realToSketch: '实物转线稿',
  fabricCreative: '面料创拍',
}

const allPlatformMenus = ref<any[]>([])
const activeMenuCode = ref<string>('')
const lastFetchedMenuCode = ref<string>('')

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

  const codes = isFabricEntry
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
    }
  })
})

const getRailIcon = (key: LeftMenuKey, isActive: boolean) => {
  if (key === 'aiFashion') return isActive ? images.designActive : images.designIcon
  if (key === 'sketchToReal') return isActive ? images.sketchActive : images.sketchIcon
  if (key === 'realToSketch') return isActive ? images.realActive : images.realIcon
  return images.fabricActive
}

const fetchSysPlatformMenu = async () => {
  try {
    const res = await appApi.getSysPlatformMenu()
    if (String((res as any)?.code) === '0000' && Array.isArray(res?.data)) {
      allPlatformMenus.value = res.data
      syncActiveMenuCode()
    }
  } catch (error) {
    console.error('获取功能菜单失败', error)
  }
}

const handleFabricGenerate = (payload: any) => {
  // TODO: 接口联调时，将 payload.file 上传/随请求提交给算法
  console.log('[fabricCreative] generate payload:', payload)
  showComingSoon()
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

const buildHistoryParams = (taskResultId: any) => {
  const id = taskResultId == null ? '' : String(taskResultId)
  if (!id) return []
  return [{ taskResultId: id, type: 'ref' }]
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

const handleAiFashionGenerate = async () => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    return
  }

  const form = formDataByMenu.aiFashion
  const paramsState = form.params
  const algoModel: any = paramsState.selectedAlgorithm
  const modelConfigId = Number(algoModel?.algorithmId ?? algoModel?.id ?? 0)
  const modelConfigCode = String(algoModel?.code ?? '')
  const modelConfigName = String(algoModel?.name ?? '')
  const menuCode = String(activeMenuCode.value || menuCodeByKey.aiFashion)

  if (!modelConfigId || !modelConfigCode || !menuCode) {
    ElMessage.error('模型参数未就绪，请先点击“参数设置”确认算法模型')
    return
  }

  const image = String(form.image || '').trim()

  const templateParams = buildTemplateParamsFromPopup(Object.values(paramsState.selectedParams || {}))
  const payload: any = {
    modelConfigId,
    modelConfigCode,
    modelConfigName,
    menuCode,
    image,
    templateParams,
    inspirationWordsParams: buildInspirationWordsParams(form.inspirationWords),
    creativeDescription: String(form.prompt || '').trim(),
    historyParams: buildHistoryParams(form.taskResultId),
    creationStyleParams: buildCreationStyleParams(creationTypeSelectionByMenu.aiFashion),
    designFeaturesParams: [],
  }

  try {
    loading.value = true
    const res = await algoApi.submit(payload)
    if (res.code === '0000') {
      ElMessage.success('已提交生成任务')
    } else {
      ElMessage.error(res.msg || '提交失败')
    }
  } catch (e) {
    console.error('[AiFashionStudio] doCalculationPoint failed:', e)
    ElMessage.error('网络开小差了~，请稍后再试')
  } finally {
    loading.value = false
  }
}

// 查看详情：跳转到 CreativeDetail（左大图 + 右侧信息面板）
const handleViewDetail = (index: number) => {
  const list = assets.value || []
  const item: any = list[index]
  if (!item?.id) return

  // 缓存列表数据，详情页可直接用来渲染 & 支持“上一张/下一张”
  templateStore.setTemplateListData({
    pageType: 'assets',
    sourceTab: 'aiFashionStudio',
    list,
    currentIndex: index,
    // 记录当前模块，详情页可用于 UI mock / 回跳
    mode: leftMenu.value,
  })

  router.push({
    name: 'CreativeDetail',
    params: { id: String(item.id) },
    query: { pageType: 'assets', sourceTab: 'aiFashionStudio', mode: leftMenu.value },
  })
}

// ==================== 款型选择弹窗（父层统一管理） ====================
const showTypeModal = ref(false)
const activeTypeMenu = ref<LeftMenuKey>('aiFashion')
const creationTypeOptionTree = ref<any[]>([])

const creationTypeSelectionByMenu = reactive<Record<LeftMenuKey, Partial<CreationTypeSelection>>>({
  aiFashion: {},
  sketchToReal: {},
  realToSketch: {},
  fabricCreative: {},
})

const activeCreationTypeSelection = computed(() => creationTypeSelectionByMenu[activeTypeMenu.value] || {})

const fetchCreationTypeWords = async (menu: LeftMenuKey) => {
  const functionCode = menuCodeByKey[menu]
  const typeCode = creationTypeCodeByMenu[menu]
  if (!functionCode || !typeCode) {
    creationTypeOptionTree.value = []
    return
  }
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
  }
}

const openTypeModal = (menu: LeftMenuKey) => {
  activeTypeMenu.value = menu
  fetchCreationTypeWords(menu)
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
const showInspirationLibrary = ref(false)
const showHistoryModal = ref(false)

type LeftPanelFormState = {
  image: string
  taskResultId?: string | number
  prompt: string
  inspirationWords: any[]
  params: {
    selectedAlgorithm: any
    selectedParams: Record<number, any>
    defaultModelsParams: string[]
    algorithmModels: any[]
    coinCost: number
    defaultParamObject: any
  }
}

const createLeftPanelFormState = (): LeftPanelFormState => ({
  image: '',
  taskResultId: undefined,
  prompt: '',
  inspirationWords: [],
  params: {
    selectedAlgorithm: null,
    selectedParams: {},
    defaultModelsParams: [],
    algorithmModels: [],
    coinCost: 0,
    defaultParamObject: null,
  },
})

const formDataByMenu = reactive<Record<LeftMenuKey, LeftPanelFormState>>({
  aiFashion: createLeftPanelFormState(),
  sketchToReal: createLeftPanelFormState(),
  realToSketch: createLeftPanelFormState(),
  fabricCreative: createLeftPanelFormState(),
})
const activeInspirationMenu = ref<LeftMenuKey>('aiFashion')
const getCurrentForm = () => formDataByMenu[leftMenu.value]
const getCurrentParams = () => getCurrentForm().params

const imageCoin = computed(() => getCurrentParams()?.coinCost ?? 0)
const currentImageDefaultParams = computed(() => getCurrentParams()?.defaultModelsParams || [])
const currentImageAlgorithmModels = computed(() => getCurrentParams()?.algorithmModels || [])

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
  console.log('fetchAlgoConfigTempRelation', menuCode, lastFetchedMenuCode.value)
  if (!menuCode) return
  if (lastFetchedMenuCode.value === menuCode) return
  lastFetchedMenuCode.value = menuCode
  try {
    const res = await appApi.getAlgoConfigTempRelation({ menuCode })
    if (String((res as any)?.code) === '0000') {
      const dataObj: any = (res as any)?.data ?? (res as any)?.datas ?? {}
      const models = normalizeAlgoConfigModels(dataObj)
      const menuKey = menuKeyByCode[menuCode]
      if (menuKey) {
        const state = formDataByMenu[menuKey].params
        state.algorithmModels = models

        const hasSelectedParams = Object.keys(state.selectedParams || {}).length > 0
        // 接口仅返回 algorithmModels：默认值从数组内逐层按 defaultStatus 提取
        if (!hasSelectedParams) {
          const defaultState = buildDefaultStateFromModels(models)
          state.selectedAlgorithm = defaultState.selectedAlgorithm
          state.selectedParams = defaultState.selectedParams
          state.defaultModelsParams = defaultState.defaultModelsParams
          state.coinCost = defaultState.coinCost
          state.defaultParamObject = defaultState.defaultParamObject
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
      }
    }
  } catch (error) {
    lastFetchedMenuCode.value = ''
    console.error('获取功能模型列表失败', error)
  }
}

const openImageParams = () => {
  fetchAlgoConfigTempRelation(activeMenuCode.value)
  showImageParamPopup.value = true
}

const resolveMenuCodeByLeftMenu = (menu: LeftMenuKey) => {
  const targetCode = menuCodeByKey[menu]
  const sourceItems: any[] = []
  for (const item of allPlatformMenus.value || []) {
    sourceItems.push(item)
    if (Array.isArray(item.children) && item.children.length) {
      sourceItems.push(...item.children)
    }
  }
  const matched = sourceItems.find((x) => String(x?.menuCode || '') === targetCode)
  return String(matched?.menuCode || targetCode || '')
}

const syncActiveMenuCode = () => {
  activeMenuCode.value = resolveMenuCodeByLeftMenu(leftMenu.value)
}

// 当前左侧功能模块的 menuId（用于“试一试”创意描述推荐）
const currentMenuId = computed(() => {
  const menuCode = resolveMenuCodeByLeftMenu(leftMenu.value)
  if (!menuCode) return ''

  const sourceItems: any[] = []
  for (const item of allPlatformMenus.value || []) {
    sourceItems.push(item)
    if (Array.isArray(item.children) && item.children.length) {
      sourceItems.push(...item.children)
    }
  }

  const matched = sourceItems.find((x) => String(x?.menuCode || '') === menuCode)
  return String(matched?.id ?? '')
})

const handleImageParamsConfirm = (result: any) => {
  // ImageParamPopup 的 result: { algorithmId, algorithmName, paramList: [{templateName,...}, ...] }
  const state = getCurrentParams()
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
}

const handleImageParamsClose = (_result: any) => {
  // 关闭时不强制更新；需要更新走 confirm 即可
}

// ==================== 灵感词词典弹窗（父层统一管理） ====================
const handleInspirationLibrary = () => {
  activeInspirationMenu.value = leftMenu.value
  fetchInspirationWords()
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

const fetchInspirationWords = async () => {
  const functionCode = menuCodeByKey[leftMenu.value]
  if (!functionCode) {
    libraryData.value = []
    return
  }
  try {
    const res = await appApi.getInspirationWords({
      functionCode,
      typeCode: CREATION_PARAM_CODES.INSPIRATION_WORDS,
    })
    if (String((res as any)?.code) === '0000' && Array.isArray(res?.data)) {
      libraryData.value = normalizeInspirationCategories(res.data)
      return
    }
    libraryData.value = []
  } catch (error) {
    libraryData.value = []
    console.error('获取灵感词词典失败', error)
  }
}

// ==================== 右侧：我的创作（列表 + 缩略图） ====================
// 先用本地 mock 数据跑通交互；后续接接口时替换 creations 的赋值即可
const assets = ref<CreationResult[]>([
  {
    id: 'mock-1',
    algoOrderId: 'mock-1',
    algoUuId: null,
    menuCode: APP_MENU_CODES.AI_FASHION_DESIGN,
    thumbUrl: images.aiDesign1,
    url: images.aiDesign1,
    fileType: 1,
    originalUrl: null,
    prompt: 'AI服装设计-示例1',
    createTime: new Date().toISOString(),
    status: 3,
    collectStatus: 0,
  },
  {
    id: 'mock-2',
    algoOrderId: 'mock-2',
    algoUuId: null,
    menuCode: APP_MENU_CODES.AI_FASHION_DESIGN,
    thumbUrl: images.aiDesign2,
    url: images.aiDesign2,
    fileType: 1,
    originalUrl: null,
    prompt: 'AI服装设计-示例2',
    createTime: new Date().toISOString(),
    status: 2,
    collectStatus: 0,
  },
  {
    id: 'mock-3',
    algoOrderId: 'mock-3',
    algoUuId: null,
    menuCode: APP_MENU_CODES.AI_FASHION_DESIGN,
    thumbUrl: images.aiDesign3,
    url: images.aiDesign3,
    fileType: 1,
    originalUrl: null,
    prompt: 'AI服装设计-示例3',
    createTime: new Date().toISOString(),
    status: 4,
    collectStatus: 0,
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
      algoOrderResultId: String(asset.id),
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
      ElMessage.error(response.msg || '网络开小差了~，请稍后再试')
    }
  } catch (e) {
    console.error('[AiFashionStudio] collect failed:', e)
    ElMessage.error('网络开小差了~，请稍后再试')
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
    await ElMessageBox.confirm('确定要删除这个生成结果吗？删除后无法恢复。', '确认删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    const response = await algoApi.del({
      algoOrderResultId: String(asset.id),
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
    ElMessage.error('网络开小差了~，请稍后再试')
  }
}

// ==================== 左侧：上传参考图（支持从右侧拖拽） ====================

const handleDropFile = (payload: any) => {
  const currentForm = formDataByMenu[leftMenu.value]
  // payload 可能来自：
  // 1) 本地文件拖拽：{ file, type, position }
  // 2) 我的资产拖拽：{ url, taskResultId, type, position, fileType }
  if (payload?.file) {
    const file: File = payload.file
    currentForm.image = URL.createObjectURL(file)
    currentForm.taskResultId = undefined
    return
  }

  if (payload?.url) {
    currentForm.image = String(payload.url)
    currentForm.taskResultId = payload.taskResultId
    return
  }
}

const handleRefDelete = () => {
  const currentForm = formDataByMenu[leftMenu.value]
  currentForm.image = ''
  currentForm.taskResultId = undefined
}

const openHistoryModal = () => {
  showHistoryModal.value = true
}

const selectHistoryCreation = (item: any) => {
  const imageUrl = String(item?.imageUrl || item?.resultUrl || item?.thumbUrl || item?.url || '').trim()
  if (!imageUrl) return
  const currentForm = formDataByMenu[leftMenu.value]
  currentForm.image = imageUrl
  currentForm.taskResultId = item?.id == null ? undefined : String(item.id)
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
    formDataByMenu[leftMenu.value].image = String(refImageUrlFromQuery)
  }
  const taskResultIdFromQuery = route.query.taskResultId
  if (taskResultIdFromQuery) {
    formDataByMenu[leftMenu.value].taskResultId = String(taskResultIdFromQuery)
  }

  await fetchSysPlatformMenu()
  await syncActiveMenuCode()

  setTimeout(() => {
    fetchAlgoConfigTempRelation(activeMenuCode.value)
  }, 1000);
})

onActivated(() => {
  refreshUserInfoIfLoggedIn()
})

watch(
  () => leftMenu.value,
  () => {
    syncActiveMenuCode()
    if (activeMenuCode.value) {
      fetchAlgoConfigTempRelation(activeMenuCode.value)
    }
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
