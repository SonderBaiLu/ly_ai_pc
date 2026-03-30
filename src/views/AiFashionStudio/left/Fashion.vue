<template>
  <div class="left-panel studio-left--select-card-bg">
    <div class="panel-title">AI服装设计</div>

    <div class="block">
      <div class="block-title">创作款型<span class="required-mark">（必选，单选）</span></div>
      <div class="select-card" @click="emit('open-type-modal')">
        {{ typeText ? typeText : '+ 请选择款型' }}
      </div>
    </div>

    <div class="block">
      <div class="block-title">设计特征<span class="required-mark">（非必选，多选）</span></div>
      <template v-if="selectedFeatures.length">
        <div v-if="selectedFeatures && selectedFeatures.length > 0" class="feature-chips">
          <div class="feature-chip" v-for="x in selectedFeatures" :key="x.key"
            @click="removeFeature(x.categoryKey, x.label)">
            {{ x.label }}
            <img class="feature-del-icon" :src="images.tagDel" alt="" srcset="">
          </div>
          <div class="feature-plus" @click="openFeatureModal">
            <img class="feature-plus-icon" :src="images.plus" alt="">
          </div>
        </div>
      </template>
      <template v-else>
        <div class="select-card" @click="openFeatureModal">+ 请选择设计特征</div>
      </template>
    </div>

    <div class="block-title">上传参考图<span class="required-mark">（非必传）</span></div>
    <ImageUploadArea :image-url="imageUrl?.[0] || ''" image-type="ref" image-name="slot-0"
      :show-actions="String(imageUrl?.[0] ?? '').trim().length > 0" :clickable="true" placeholder-text="上传或拖拽参考图"
      :show-history-tip="true" :enable-history-replace="true" @upload="emit('coming-soon')"
      @replace="emit('coming-soon')" @delete="emit('delete')" @show-history="emit('show-history')"
      @drop-file="(p: File) => emit('drop-file', p)" v-if="imageUrl.length == 0" />

    <!-- 上传之后的样式 -->
    <el-scrollbar v-if="imageUrl.length > 0">
      <div class="scrollbar-flex-content">
        <ImageUploadArea v-for="(item, index) in imageUrl" :key="index" :image-url="item || ''" image-type="main"
          :image-name="`slot-${index}`" placeholder-text="上传或拖拽参考图" :show-history-tip="false" area-width="145px"
          :enable-history-replace="true" @delete="emit('delete')" @show-history="emit('show-history')"
          @drop-file="(p: any) => emit('drop-file', p)" />
        <ImageUploadArea placeholder-text="上传或拖拽参考图" :show-history-tip="false" area-width="145px"
          :enable-history-replace="true" @delete="emit('delete')" @show-history="emit('show-history')"
          @drop-file="(p: any) => emit('drop-file', p)" v-if="imageUrl.length < 6" />
      </div>
    </el-scrollbar>

    <!-- 创意描述 -->
    <CreativeDescription v-model:prompt="prompt" :optional="true" placeholder="请输入创作描述，提升设计精准度"
      :inspiration-words="inspirationWords" :menu-id="props.menuId" @inspiration-library="emit('inspiration-library')"
      @update:inspiration-words="updateInspirationWords" />

    <!-- 底部参数以及生成按钮 -->
    <VideoOptionsSection :options="defaultImageParams" :credits="coin" :disabled="generateButtonDisabled"
      :loading="submitting" button-text="立即生成" @show-params="() => emit('show-params')"
      @generate="() => emit('generate')" />

    <!-- 设计特征弹窗 -->
    <DesignFeatureModal v-model="showFeatureModal" :selection="designFeatureSelection" :categories="featureCategories"
      @confirm="handleFeatureConfirm" />
  </div>
</template>

<script setup lang="ts">
import { images } from '@/assets'
import { appApi } from '@/api/app'
import { APP_MENU_CODES } from '@/constants/appMenuCode'
import { CREATION_PARAM_CODES } from '@/constants/creationParamCode'
import type { CreationTypeSelection } from '@/components/CreationTypeSelectModal.vue'
import DesignFeatureModal, { type DesignFeatureSelection } from '@/components/DesignFeatureModal.vue'

// ai服装设计：参考图最多 6 张（slot-0 ~ slot-5）
const imageUrl = defineModel<string[]>('imageUrl', { default: () => [] })

const props = defineProps<{
  taskResultId?: string | number | Array<string | number>
  creationTypeSelection?: Partial<CreationTypeSelection>
  inspirationWords?: any[]
  coin?: number
  menuId?: string | number
  defaultImageParams?: string[]
  /** 父级提交生成中（与 index loading 同步） */
  submitting?: boolean
}>()

// 监听inspirationWords变化
watch(
  () => props.inspirationWords,
  (newWords) => {
    if (newWords) {
      inspirationWords.value = newWords
    }
  },
  { deep: true }
)

const emit = defineEmits<{
  (e: 'drop-file', payload: any): void
  (e: 'delete'): void
  (e: 'coming-soon'): void
  (e: 'show-params'): void
  (e: 'generate'): void
  (e: 'open-type-modal'): void
  (e: 'clear-type-selection'): void
  (e: 'inspiration-library'): void
  (e: 'show-history'): void
  (e: 'update:inspiration-words', words: any[]): void
  /**
   * ai服装设计：将“设计特性”确认后的后端参数结构上抛
   * 用于 payload.designFeaturesParams
   */
  (e: 'update:design-features-params', params: Array<{ id: string; configType: string; prentId: string; content: string }>): void
}>()

const prompt = defineModel<string>('prompt', { default: '' })
const inspirationWords = ref<any[]>([])

const typeText = computed(() => {
  const s = props.creationTypeSelection
  if (!s?.category || !s?.clothType || !s?.subKind) return ''
  return `${s.category}-${s.clothType}-${s.subKind}`
})

/** 创作款型（必选）已选满三级 */
const isCreationTypeReady = computed(() => Boolean(typeText.value))

/** 默认不可点；选完款型后可点；提交中不可点 */
const generateButtonDisabled = computed(() => !isCreationTypeReady.value || Boolean(props.submitting))

const showFeatureModal = ref(false)
const designFeatureSelection = ref<DesignFeatureSelection>({})
const featureCategories = ref<Array<{ key: string; label: string; options: string[] }>>([])
type DesignFeatureOptionMeta = { id: string; configType: string; prentId: string; content: string }
// featureOptionMetaMap[categoryKey][optionLabel] => 后端 payload 必填字段
const featureOptionMetaMap = ref<Record<string, Record<string, DesignFeatureOptionMeta>>>({})

const handleFeatureConfirm = (v: DesignFeatureSelection) => {
  designFeatureSelection.value = v

  // 把用户选择转换为后端需要的 designFeaturesParams 结构
  const params: Array<{ id: string; configType: string; prentId: string; content: string }> = []
  for (const [categoryKey, labels] of Object.entries(v || {})) {
    if (!Array.isArray(labels)) continue
    const metaByLabel = featureOptionMetaMap.value[categoryKey] || {}
    for (const label of labels) {
      const m = metaByLabel[label]
      if (!m) continue
      params.push({ id: m.id, configType: m.configType, prentId: m.prentId, content: m.content })
    }
  }

  emit('update:design-features-params', params)
}

const normalizeFeatureCategories = (list: any[] = []) => {
  const nextMetaMap: Record<string, Record<string, DesignFeatureOptionMeta>> = {}

  const normalized = list
    .map((item: any) => ({
      key: String(item?.code ?? item?.typeCode ?? item?.id ?? ''),
      label: String(item?.title ?? item?.typeName ?? item?.content ?? ''),
      options: (item?.wordsList || item?.children || [])
        .map((w: any) => String(w?.name ?? w?.wordsName ?? w?.content ?? '').trim())
        .filter(Boolean),
    }))
    .filter((item: { key: string; label: string }) => item.key && item.label)

  // 同步构建 meta map（用于把选中 label 映射到后端必填字段）
  for (const item of list) {
    const categoryKey = String(item?.code ?? item?.typeCode ?? item?.id ?? '')
    if (!categoryKey) continue
    const words = item?.wordsList || item?.children || []
    for (const w of words) {
      const label = String(w?.name ?? w?.wordsName ?? w?.content ?? '').trim()
      if (!label) continue
      const meta: DesignFeatureOptionMeta = {
        id: String(w?.id ?? w?.wordsId ?? w?.code ?? ''),
        configType: String(w?.configType ?? 'words'),
        prentId: String(w?.prentId ?? w?.parentId ?? item?.id ?? categoryKey ?? ''),
        content: String(w?.content ?? w?.name ?? w?.wordsName ?? label),
      }
      nextMetaMap[categoryKey] = nextMetaMap[categoryKey] || {}
      nextMetaMap[categoryKey][label] = meta
    }
  }

  featureOptionMetaMap.value = nextMetaMap
  return normalized
}

const fetchDesignFeatures = async () => {
  try {
    const res = await appApi.getInspirationWords({
      functionCode: APP_MENU_CODES.AI_FASHION_DESIGN,
      typeCode: CREATION_PARAM_CODES.DESIGN_FEATURES,
    })
    if (String((res as any)?.code) === '0000' && Array.isArray(res?.data)) {
      featureCategories.value = normalizeFeatureCategories(res.data)
      return
    }
    featureCategories.value = []
  } catch (error) {
    featureCategories.value = []
    console.error('获取设计特征词典失败', error)
  }
}

const openFeatureModal = async () => {
  await fetchDesignFeatures()
  showFeatureModal.value = true
}

const updateInspirationWords = (words: any[]) => {
  inspirationWords.value = words
  emit('update:inspiration-words', words)
}

const selectedFeatures = computed(() => {
  const result: Array<{ key: string; categoryKey: string; label: string }> = []
  Object.entries(designFeatureSelection.value || {}).forEach(([categoryKey, arr]) => {
    ; (arr || []).forEach((label) => {
      const t = String(label || '').trim()
      if (!t) return
      result.push({ key: `${categoryKey}::${t}`, categoryKey, label: t })
    })
  })
  return result
})

const removeFeature = (categoryKey: string, label: string) => {
  const next = { ...(designFeatureSelection.value || {}) }
  const arr = next[categoryKey] || []
  next[categoryKey] = arr.filter((x) => String(x || '').trim() !== label)
  if (!next[categoryKey]?.length) delete next[categoryKey]
  designFeatureSelection.value = next
}
</script>

<style scoped lang="scss">
@use '@/styles/_studio_left.scss';

.left-panel {

  .block {
    padding: 25px 10px 26px;
    margin-bottom: $spacing-sm;
    border-radius: $border-radius-md;
    background: linear-gradient(135deg, rgba(9, 17, 37, 1) 14.6%, rgba(13, 18, 31, 1) 50%, rgba(22, 29, 49, 1) 85.4%);
    border: 1px solid rgba(255, 255, 255, 0.15);
  }

  .feature-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 8px 5px;

    .feature-chip {
      position: relative;
      padding: 5px 10px;
      border-radius: 4px;
      background-color: rgba(0, 0, 0, 0.5);
      color: $color-text-gray;
      font-size: 14px;
      text-align: center;
      font-family: -regular;
      border: 1px solid rgba(255, 255, 255, 0.15);
      cursor: pointer;

      .feature-del-icon {
        position: absolute;
        right: -5px;
        top: -5px;
        width: 10px;
        height: 10px;
      }
    }

    .feature-plus {
      padding: 0 17px;
      cursor: pointer;
      border-radius: 4px;
      background-color: rgba(150, 221, 255, 0.15);
      font-family: -regular;
      border: 1px solid rgba(255, 255, 255, 0.15);

      .feature-plus-icon {
        width: 16px;
        height: 16px;
      }
    }
  }

  .scrollbar-flex-content {
    display: flex;
    flex-wrap: nowrap;
    gap: 11px;
    padding-bottom: 10px;
  }
}
</style>
