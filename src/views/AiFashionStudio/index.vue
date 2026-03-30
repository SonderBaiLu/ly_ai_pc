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
              :creation-type-selection="formDataByMenu.aiFashion.creationTypeSelection" :submitting="loading"
              :default-image-params="currentImageDefaultParams"
              :inspiration-words="formDataByMenu.aiFashion.inspirationWords" :coin="imageCoin" :menu-id="currentMenuId"
              @open-type-modal="() => openTypeModal('aiFashion')"
              @clear-type-selection="() => clearTypeSelection('aiFashion')" @drop-file="handleDropFile"
              @delete="handleRefDelete" @coming-soon="showComingSoon" @show-params="openImageParams"
              @update:design-features-params="(v) => (formDataByMenu.aiFashion.designFeaturesParams = v)"
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
              :sketch-param-selections="formDataByMenu.sketchToReal.sketchParamSelections"
              :param-categories="sketchToRealParamCategories" :task-result-id="formDataByMenu.sketchToReal.taskResultId"
              :creation-type-selection="creationTypeSelectionByMenu.sketchToReal"
              :inspiration-words="formDataByMenu.sketchToReal.inspirationWords" :coin="imageCoin"
              :menu-id="currentMenuId" @open-type-modal="() => openTypeModal('sketchToReal')"
              @clear-type-selection="() => clearTypeSelection('sketchToReal')" @drop-file="handleDropFile"
              @delete="handleRefDelete" @coming-soon="showComingSoon" @show-params="openImageParams"
              @generate="handleSketchToRealGenerate" @inspiration-library="handleInspirationLibrary"
              @show-history="openHistoryModal"
              @update:sketch-param-selections="(v) => formDataByMenu.sketchToReal.sketchParamSelections = v"
              @update:inspiration-words="(words) => formDataByMenu.sketchToReal.inspirationWords = words" />
            <RealToSketch v-else v-model:image-url="formDataByMenu.realToSketch.image"
              :task-result-id="formDataByMenu.realToSketch.taskResultId"
              :creation-type-selection="creationTypeSelectionByMenu.realToSketch"
              :inspiration-words="formDataByMenu.realToSketch.inspirationWords" :coin="imageCoin"
              :menu-id="currentMenuId" @open-type-modal="() => openTypeModal('realToSketch')"
              @clear-type-selection="() => clearTypeSelection('realToSketch')" @drop-file="handleDropFile"
              @delete="handleRefDelete" @coming-soon="showComingSoon" @show-params="openImageParams"
              @generate="handleRealToSketchGenerate" @inspiration-library="handleInspirationLibrary"
              @show-history="openHistoryModal"
              @update:inspiration-words="(words) => formDataByMenu.realToSketch.inspirationWords = words" />
          </section>

          <!-- 结果列表（主图 + 缩略图） -->
          <section class="result-panel">
            <MainImageDisplay ref="mainImageRef" :assets="assets" :current-index="currentIndex"
              :has-more-data="hasMoreData" :loading="listLoading" :loading-more="loadingMore" :is-vip="isUserVip"
              :remove-watermark-enabled="removeWatermarkEnabled" :content-tabs="rightContentTabs"
              :active-tab-key="currentContentTab"
              @asset-click="(idx: number) => (currentIndex = idx as any)" @scroll-change="handleScrollChange"
              @tab-change="handleContentTabChange" @load-more="handleLoadMore" @view-detail="handleViewDetail"
              @collect="handleCollect" @download="showComingSoon" @delete="handleAlgoDelete"
              @refresh="showComingSoon" />

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
import { nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { images } from '@/assets'
import { useUserStore } from '@/stores/user'
import { appApi } from '@/api/app'
import { algoApi, buildTemplateParamsFromPopup } from '@/api/algo'
import { uploadApi } from '@/api/upload'
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
// ==================== 面料创拍：提交生成 ====================
const handleFabricGenerate = async (_payload: any) => {
  await submitByMenuCode(menuCodeByKey.fabricCreative)
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
  if (Array.isArray(taskResultId)) {
    return taskResultId
      .map((id: any) => (id == null ? '' : String(id)))
      .filter((id: string) => Boolean(id))
      .map((id: string) => ({ taskResultId: id, type: 'ref' }))
  }

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

// ==================== payload 公共部分（各模块只补差异字段） ====================
const buildCommonPayloadBase = (
  form: any,
  paramsState: any,
  menuCode: string,
  images: string[],
  modelConfigId: number,
  modelConfigCode: string,
  modelConfigName: string,
) => {
  const templateParams = buildTemplateParamsFromPopup(Object.values(paramsState.selectedParams || {}))
  return {
    modelConfigId,
    modelConfigCode,
    modelConfigName,
    menuCode,
    image: images,
    templateParams,
    inspirationWordsParams: buildInspirationWordsParams(form.inspirationWords),
    creativeDescription: String(form.prompt || '').trim(),
    historyParams: buildHistoryParams(form.taskResultId),
  }
}

// ==================== 统一提交入口：按 menuCode 构造差异字段 ====================
const submitByMenuCode = async (menuCode: string) => {
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
    images = String(form.image || '').trim() ? [String(form.image).trim()] : []
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
  } else {
    // realToSketch
    images = String(form.image || '').trim() ? [String(form.image).trim()] : []
    if (!images.length) {
      ElMessage.error('请先上传实物参考图')
      return
    }
  }

  const basePayload = buildCommonPayloadBase(form, paramsState, menuCode, images, modelConfigId, modelConfigCode, modelConfigName)

  let diffPayload: any
  if (menuKey === 'aiFashion') {
    diffPayload = {
      creationStyleParams: buildCreationStyleParams(formDataByMenu.aiFashion.creationTypeSelection),
      designFeaturesParams: form.designFeaturesParams || [],
    }
  } else if (menuKey === 'fabricCreative') {
    diffPayload = {
      // 面料创款：只需要 imageTypeParams（由款型选择树生成）
      imageTypeParams: buildCreationStyleParams(creationTypeSelectionByMenu.fabricCreative),
    }
  } else if (menuKey === 'sketchToReal') {
    diffPayload = {
      sketchTypeParams: buildCreationStyleParams(creationTypeSelectionByMenu.sketchToReal),
      sketchStyleParams: [],
      imageTypeParams: [],
    }
  } else {
    // realToSketch
    diffPayload = {
      garmentStyleParams: buildCreationStyleParams(creationTypeSelectionByMenu.realToSketch),
      sketchGenerationTypeParams: [],
      sketchGenerationStyleParams: [],
    }
  }

  const payload: any = {
    ...basePayload,
    ...diffPayload,
  }

  try {
    loading.value = true
    const res = await algoApi.submit(payload)
    if (res.code === '0000') {
      ElMessage.success('已提交生成任务')
      const orderNo = String((res as any)?.data?.orderNo ?? '')
      if (orderNo) {
        upsertGeneratingAssetByOrderNo(orderNo, String(form.prompt || '').trim(), menuCode)
        await startQueryByOrderNo(orderNo)
      }
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

// ==================== 右侧：我的创作（轮询/列表共享状态） ====================
// 注意：这些 state 会被“轮询生成结果”相关方法提前引用，所以需要放在方法声明之前以提升可读性
const assets = ref<CreationResult[]>([])
const currentIndex = ref(0)
const mainImageRef = ref<any>(null)
const thumbnailRef = ref<any>(null)

// ==================== 生成结果轮询（提交后持续拉取状态并回填 assets） ====================
const queryTimerMap = new Map<string, ReturnType<typeof setInterval>>()

// 清理所有轮询定时器（切换 tab/重新加载时避免残留轮询）
const stopAllQueryTimers = () => {
  queryTimerMap.forEach((timer) => clearInterval(timer))
  queryTimerMap.clear()
}

// 停止某个 orderNo 对应的轮询定时器
const stopQueryTimer = (orderNo: string) => {
  const timer = queryTimerMap.get(orderNo)
  if (timer) {
    clearInterval(timer)
    queryTimerMap.delete(orderNo)
  }
}

// 根据 orderNo / algoOrderId / id 在 assets 中定位资产
const findAssetIndexByOrderNo = (orderNo: string) => {
  return assets.value.findIndex((item: CreationResult) => {
    return String(item?.algoOrderNo ?? '') === orderNo || String(item?.algoOrderId ?? '') === orderNo || String(item?.id ?? '') === orderNo
  })
}

// 更新指定资产：以 updater 的返回值覆盖原 assets 项
const updateAssetByOrderNo = (orderNo: string, updater: (asset: CreationResult) => CreationResult) => {
  const idx = findAssetIndexByOrderNo(orderNo)
  if (idx === -1) return
  assets.value[idx] = updater(assets.value[idx])
}

// 提交成功后：先插入“生成中”的占位卡片，并开始轮询
const upsertGeneratingAssetByOrderNo = (orderNo: string, prompt: string, menuCode: string) => {
  const now = new Date().toISOString()
  const idx = findAssetIndexByOrderNo(orderNo)

  const generatingItem: CreationResult = {
    id: orderNo,
    algoOrderId: orderNo,
    algoOrderNo: orderNo,
    algoUuId: null,
    menuCode,
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

  if (idx === -1) {
    assets.value.unshift(generatingItem)
    currentIndex.value = 0
    return
  }

  assets.value[idx] = {
    ...assets.value[idx],
    ...generatingItem,
  }
}

// 轮询完成后：把 orderResultVOS 映射回 assets（包含多结果扩展）
const applyQueryDoneResult = (orderNo: string, orderResultVOS: any[]) => {
  const idx = findAssetIndexByOrderNo(orderNo)
  if (idx === -1) return
  const oldItem = assets.value[idx]
  const mappedList = orderResultVOS.map((vo: any) => mapOrderResultToAsset(vo, orderNo))
  if (!mappedList.length) return

  const firstItem = mappedList[0]
  assets.value[idx] = {
    ...oldItem,
    ...firstItem,
    status: 3,
    progress: 100,
  }

  if (mappedList.length > 1) {
    const extraAssets = mappedList.slice(1).map((item, index) => ({
      ...oldItem,
      ...item,
      id: String(item.id || `${orderNo}-${index + 1}`),
      algoOrderId: String(item.algoOrderId || orderNo),
      algoOrderNo: String(item.algoOrderNo || orderNo),
      status: 3,
      progress: 100,
    }))
    assets.value.splice(idx + 1, 0, ...extraAssets)
  }

  currentIndex.value = idx
  setTimeout(() => {
    mainImageRef.value?.scrollToAsset?.(idx)
  }, 0)
}

// 把单条后端结果 VO 映射为前端 CreationResult
const mapOrderResultToAsset = (vo: any, fallbackOrderNo: string): CreationResult => {
  return {
    id: String(vo?.id ?? fallbackOrderNo),
    algoOrderId: String(vo?.algoOrderId ?? fallbackOrderNo),
    algoOrderNo: String(vo?.algoOrderNo ?? fallbackOrderNo),
    algoUuId: vo?.algoUuId == null ? null : String(vo.algoUuId),
    menuCode: String(vo?.menuCode ?? activeMenuCode.value ?? ''),
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
const queryAlgoResultByOrderNo = async (orderNo: string) => {
  try {
    const res = await algoApi.query({ orderNo })
    if (res.code !== '0000' || !res.data) return
    const status = Number(res.data?.status ?? 0)
    const orderResultVOS = Array.isArray(res.data?.orderResultVOS) ? res.data.orderResultVOS : []
    const firstVO = orderResultVOS[0]
    const mergedProgress = Number(res.data?.progress ?? firstVO?.progress ?? 0)

    if (status === 2 || status === 1) {
      updateAssetByOrderNo(orderNo, (oldItem) => ({
        ...oldItem,
        status: status === 1 ? 1 : 2,
        progress: mergedProgress,
        successfulCount: res.data?.successfulCount ?? firstVO?.successfulCount ?? oldItem.successfulCount,
        failedCount: res.data?.failedCount ?? firstVO?.failedCount ?? oldItem.failedCount,
      }))
      return
    }

    if (status === 3) {
      if (orderResultVOS.length) {
        applyQueryDoneResult(orderNo, orderResultVOS)
      } else {
        updateAssetByOrderNo(orderNo, (oldItem) => ({
          ...oldItem,
          status: 4,
          prompt: '生成完成但未返回结果',
        }))
      }
      stopQueryTimer(orderNo)
      return
    }

    if (status === 4) {
      updateAssetByOrderNo(orderNo, (oldItem) => ({
        ...oldItem,
        status: 4,
        prompt: '生成失败',
      }))
      stopQueryTimer(orderNo)
    }
  } catch (error) {
    console.error('[AiFashionStudio] query algo result failed:', error)
  }
}

// 开启轮询：定期调用 queryAlgoResultByOrderNo
const startQueryByOrderNo = async (orderNo: string) => {
  if (!orderNo) return
  stopQueryTimer(orderNo)
  await queryAlgoResultByOrderNo(orderNo)
  const timer = setInterval(() => {
    queryAlgoResultByOrderNo(orderNo)
  }, 5000)
  queryTimerMap.set(orderNo, timer)
}

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

// 线稿转实物/实物转线稿/面料创拍：参考图单张
type SingleImageFormState = CommonFormState & {
  image: string
  taskResultId?: string | number
  sketchParamSelections: Record<string, string>
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
  taskResultId: undefined,
  prompt: '',
  inspirationWords: [],
  historyParams: [],
  sketchParamSelections: {},
  params: createAlgoParamsState(),
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

const openImageParams = async () => {
  await fetchAlgoConfigTempRelation(activeMenuCode.value)
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

/** 线稿转实物：左侧三组单选；与「灵感词词典」共用同一接口一次请求（functionCode=line_draw_to_phys_obj，typeCode=sketch_type） */
const sketchToRealParamCategories = ref<any[]>([])

const fetchInspirationWords = async (menu: LeftMenuKey = leftMenu.value) => {
  const functionCode = menuCodeByKey[menu]
  const typeCode = creationTypeCodeByMenu[menu]
  if (!functionCode || !typeCode) {
    libraryData.value = []
    if (menu !== 'sketchToReal') sketchToRealParamCategories.value = []
    return
  }
  if (menu !== 'sketchToReal') {
    sketchToRealParamCategories.value = []
  }
  try {
    const res = await appApi.getInspirationWords({
      functionCode,
      typeCode,
    })
    if (String((res as any)?.code) === '0000' && Array.isArray(res?.data)) {
      if (menu === 'sketchToReal') {
        sketchToRealParamCategories.value = (res.data as any[]).filter(
          (x: any) => Array.isArray(x?.children) && x.children.length > 0,
        )
      }
      libraryData.value = normalizeInspirationCategories(res.data)
      return
    }
    libraryData.value = []
    if (menu === 'sketchToReal') sketchToRealParamCategories.value = []
  } catch (error) {
    libraryData.value = []
    if (menu === 'sketchToReal') sketchToRealParamCategories.value = []
    console.error('获取灵感词词典失败', error)
  }
}

// ==================== 右侧：我的创作（列表 + 缩略图） ====================
// 列表分页/加载状态（避免与左侧“提交生成”loading 互相干扰）
const listLoading = ref(false)

const listPageSize = ref(12)
const listPage = ref(1)

const hasMoreData = ref(false)
// 左侧“提交生成”按钮 loading
const loading = ref(false)
// 右侧列表无限滚动 loadingMore（复用 MainImageDisplay / ThumbnailGallery 的 loadingMore）
const loadingMore = ref(false)

const currentContentTab = ref<string>('favorites')

// 根据左侧模块 key，兜底推导右侧 tabKey（确保默认能选中“服装设计”）
const deriveRightTabKeyFromLeftMenu = () => {
  const moduleMenuCode = activeMenuCode.value
  const rightTabs = rightContentTabs.value
  if (rightTabs.some((t) => t.key === moduleMenuCode)) return moduleMenuCode

  // 如果 menuCode 映射不上，按 label 兜底匹配（右侧显示的是“一级菜单”+ 收藏）
  const fallbackLabel = defaultRailLabelByKey[leftMenu.value]
  const byLabel = rightTabs.find((t) => String(t.label ?? '').includes(fallbackLabel))
  return byLabel?.key ?? ''
}

// 同步右侧 UI（MainImageDisplay 内部 el-tabs）到当前 content tab key
const syncMainImageDisplayTab = async () => {
  await nextTick()
  const child: any = mainImageRef.value
  if (!child?.activeContentTab) return
  if (import.meta.env.DEV) {
    console.log('[AiFashionStudio] syncMainImageDisplayTab:', {
      currentContentTab: currentContentTab.value,
      childActiveBefore: child.activeContentTab.value,
      tabs: rightContentTabs.value.map((t) => t.key),
    })
  }
  child.activeContentTab.value = currentContentTab.value
}

// 右侧 tab -> 列表查询参数
// - tabKey 是一级菜单的 menuCode（favorites 为收藏）
// - fileType 在“一级菜单 + 收藏”场景下固定为 0（全部类型）
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

// 把 queryAlgoResultPage 返回记录映射为前端 CreationResult
const mapRecordToCreationResult = (r: any): CreationResult | null => {
  const id = String(r?.id ?? '')
  if (!id) return null

  const backendFileType = Number(r?.fileType ?? 1)
  const backendStatus = Number(r?.status ?? 3)
  const collect = Number(r?.collectStatus ?? 0)

  return {
    id,
    algoOrderId: String(r?.algoOrderId ?? ''),
    algoOrderNo: r?.algoOrderNo != null ? String(r.algoOrderNo) : undefined,
    algoUuId: r?.algoUuId === undefined ? undefined : (r?.algoUuId == null ? null : String(r.algoUuId)),
    menuCode: r?.menuCode != null ? String(r.menuCode) : undefined,
    thumbUrl: (r?.thumbUrl ?? null) as any,
    url: (r?.url ?? null) as any,
    originalUrl: (r?.originalUrl ?? null) as any,
    fileSize: r?.fileSize !== undefined && r?.fileSize !== null ? Number(r.fileSize) : undefined,
    duration: r?.duration !== undefined && r?.duration !== null ? Number(r.duration) : undefined,
    fileType: backendFileType,
    status: backendStatus,
    collectStatus: collect,
    prompt: String(r?.prompt ?? r?.functionPrompt ?? r?.creativeDescription ?? ''),
    createTime: String(r?.createTime ?? new Date().toISOString()),
    progress: Number(r?.progress ?? (backendStatus === 3 ? 100 : 0)),
  }
}

// 拉取“我的创作列表”（支持 reset=重置分页、并把新结果合并去重）
const fetchMyCreations = async (reset = false) => {
  if (listLoading.value || loadingMore.value) return

  if (reset) {
    stopAllQueryTimers()
    listPage.value = 1
    hasMoreData.value = false
    assets.value = []
    currentIndex.value = 0
  }

  const tabKey = currentContentTab.value
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
    const recordsRaw: any[] =
      (Array.isArray(data?.records) && data.records) ||
      (Array.isArray(data?.list) && data.list) ||
      (Array.isArray(data) ? data : [])

    const mapped = recordsRaw.map(mapRecordToCreationResult).filter(Boolean) as CreationResult[]

    if (reset) {
      assets.value = mapped
    } else {
      // 合并去重
      const map = new Map<string, CreationResult>()
      for (const item of assets.value) map.set(item.id, item)
      for (const item of mapped) map.set(item.id, item)
      assets.value = Array.from(map.values())
    }

    // 有更多数据判断
    const total = Number(data?.total ?? data?.totalCount ?? 0)
    if (typeof data?.hasNext === 'boolean') {
      hasMoreData.value = data.hasNext
    } else if (total > 0) {
      hasMoreData.value = assets.value.length < total
    } else {
      hasMoreData.value = mapped.length >= listPageSize.value
    }

    // 如果首次加载没数据，确保 currentIndex 不越界
    if (assets.value.length === 0) currentIndex.value = 0
    else if (currentIndex.value >= assets.value.length) currentIndex.value = 0
  } catch (e) {
    console.error('[AiFashionStudio] fetchMyCreations failed:', e)
    assets.value = reset ? [] : assets.value
    hasMoreData.value = false
  } finally {
    listLoading.value = false
    loadingMore.value = false
  }
}

// 右侧 tab 切换：重置列表并重新加载
const handleContentTabChange = (tabKey: string, _fileType?: number) => {
  currentContentTab.value = tabKey === 'favorites' ? 'favorites' : String(tabKey)
  void fetchMyCreations(true)
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
  thumbnailRef.value?.syncScroll?.(scrollPercentage)
}

// 缩略图滚动：同步主图滚动位置
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

const handleDropFile = async (payload: any) => {
  const currentForm = formDataByMenu[leftMenu.value]
  // payload 可能来自：
  // 1) 本地文件拖拽：{ file, type, position }
  // 2) 我的资产拖拽：{ url, taskResultId, type, position, fileType }
  if (payload?.file) {
    const file: File = payload.file
    const uploadResult = await uploadApi.uploadImage(file, {
      showLoading: false,
      showMessage: true,
    })
    if (!uploadResult.success || !uploadResult.url) {
      ElMessage.error('图片上传失败，请重试')
      return
    }
    const fileUrl = String(uploadResult.url).trim()

    if (leftMenu.value === 'aiFashion') {
      const parsedIdx = parseAiFashionSlotIndex(payload.position)
      const nextImages = Array.isArray(currentForm.image) ? [...currentForm.image] : []

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
      return
    }

    currentForm.image = fileUrl
    currentForm.taskResultId = undefined
    return
  }

  if (payload?.url) {
    const url = String(payload.url)

    if (leftMenu.value === 'aiFashion') {
      const parsedIdx = parseAiFashionSlotIndex(payload.position)
      const nextImages = Array.isArray(currentForm.image) ? [...currentForm.image] : []

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
      nextIds[idx] = payload.taskResultId
      nextIds.length = Math.min(6, Math.max(nextIds.length, idx + 1))
      currentForm.taskResultId = nextIds
      return
    }

    currentForm.image = url
    currentForm.taskResultId = payload.taskResultId
    return
  }
}

const handleRefDelete = () => {
  const currentForm = formDataByMenu[leftMenu.value]
  if (leftMenu.value === 'aiFashion') {
    currentForm.image = []
    currentForm.taskResultId = undefined
  } else {
    currentForm.image = ''
    currentForm.taskResultId = undefined
  }
}

const openHistoryModal = () => {
  showHistoryModal.value = true
}

const selectHistoryCreation = (item: any) => {
  const imageUrl = String(item?.imageUrl || item?.resultUrl || item?.thumbUrl || item?.url || '').trim()
  if (!imageUrl) return
  const currentForm = formDataByMenu[leftMenu.value]

  if (leftMenu.value === 'aiFashion') {
    const nextImages = Array.isArray(currentForm.image) ? [...currentForm.image] : []
    if (nextImages.length >= 6) {
      ElMessage.warning('最多可选择 6 张参考图')
      return
    }
    nextImages.push(imageUrl)
    currentForm.image = nextImages

    const nextIds = Array.isArray(currentForm.taskResultId) ? [...currentForm.taskResultId] : []
    const idVal = item?.id == null ? undefined : String(item.id)
    if (idVal) nextIds.push(idVal)
    currentForm.taskResultId = nextIds
  } else {
    currentForm.image = imageUrl
    currentForm.taskResultId = item?.id == null ? undefined : String(item.id)
  }
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
    }
  }

  await fetchSysPlatformMenu()
  await syncActiveMenuCode()

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
  void syncMainImageDisplayTab()

  setTimeout(() => {
    fetchAlgoConfigTempRelation(activeMenuCode.value)
  }, 1000);
})

onActivated(() => {
  refreshUserInfoIfLoggedIn()
})

onBeforeUnmount(() => {
  queryTimerMap.forEach((timer) => clearInterval(timer))
  queryTimerMap.clear()
})

watch(
  () => leftMenu.value,
  (menu) => {
    syncActiveMenuCode()
    fetchInspirationWords(menu)
    if (activeMenuCode.value) {
      fetchAlgoConfigTempRelation(activeMenuCode.value)
    }
    // 左侧模块切换时：右侧列表默认选中“该模块对应的一级菜单”
    const moduleMenuCode = activeMenuCode.value
    const hasModuleTab = rightContentTabs.value.some((t) => t.key === moduleMenuCode)
    currentContentTab.value = hasModuleTab ? moduleMenuCode : deriveRightTabKeyFromLeftMenu()
    if (import.meta.env.DEV) {
      console.log('[AiFashionStudio] leftMenu watch tab:', {
        activeMenuCode: moduleMenuCode,
        hasModuleTab,
        currentContentTab: currentContentTab.value,
        rightTabs: rightContentTabs.value.map((t) => t.key),
      })
    }
    void fetchMyCreations(true)
    void syncMainImageDisplayTab()
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
