<template>
  <div class="left-panel studio-left--btn-sm studio-left--select-card-bordered studio-left--sticky-footer">
    <div class="left-panel-scroll">
      <div class="panel-title">线稿转实物</div>

      <div class="block">
        <div class="block-title flex align-center flex-between">
          <div>
            上传线稿图<span class="required-mark">（必传）</span>
          </div>
          <el-button class="upload-btn" size="small" type="primary" @click="emit('open-type-modal')">选择款型</el-button>
        </div>
        <ImageUploadArea v-model:image-url="imageUrl" image-type="main" image-name="sketch" :show-actions="!!imageUrl"
          :clickable="true" placeholder-text="上传或拖拽1张图片" :show-history-tip="true" :history-max-count="1"
          @upload="emit('coming-soon')" @replace="emit('coming-soon')" @delete="(p: any) => emit('delete', p)"
          @show-history="(p: any) => emit('show-history', p)" @drop-file="(p: File) => emit('drop-file', p)" />

        <div class="select-card" @click="emit('open-type-modal')" v-if="typeText">
          {{ typeText }}
          <img class="select-del-icon" :src="images.tagDel" alt="" srcset="" @click.stop="emit('clear-type-selection')">
        </div>
      </div>
      <div v-for="category in categoryList" :key="category.id" class="block">
        <div class="block-title">
          {{ category.content }}<span class="required-mark">（必选，单选）</span>
        </div>
        <div class="ai-segmented">
          <el-button v-for="opt in category.children || []" :key="opt.id"
            :type="selectedOptionId(category.id) === String(opt.id) ? 'primary' : 'default'"
            @click="selectOption(String(category.id), String(opt.id))">
            {{ opt.content }}
          </el-button>
        </div>
      </div>

      <CreativeDescription v-model="prompt" :optional="true" :inspiration-words="inspirationWords"
        :menu-id="props.menuId" @inspiration-library="emit('inspiration-library')"
        @update:inspiration-words="updateInspirationWords" placeholder="请输入完整的服装款式描述，建议包含类目、风格、材质、设计细节等关键信息，以生成精准的款式效果。
参考示例：无领 驼色 长款 双面呢 宽松版型 羊毛材质 毛呢大衣" />
    </div>

    <!-- 底部参数以及生成按钮（贴底）：与 AI 服装设计一致，展示真实模型参数并可点击生成 -->
    <div class="bottom-sticky">
      <VideoOptionsSection :options="modelParamSummary" :credits="coin" :disabled="generateButtonDisabled"
        :loading="submitting" button-text="立即生成" @show-params="() => emit('show-params')"
        @generate="() => emit('generate')" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { images } from '@/assets'
import type { CreationTypeSelection } from '@/components/CreationTypeSelectModal.vue'

const imageUrl = defineModel<string>('imageUrl', { default: '' })
const prompt = defineModel<string>('prompt', { default: '' })

const props = defineProps<{
  taskResultId?: string | number
  creationTypeSelection?: Partial<CreationTypeSelection>
  inspirationWords?: any[]
  coin?: number
  menuId?: string | number
  sketchParamSelections?: Record<string, string>
  /** getInspirationWords（线稿转实物）返回的 class 节点列表 */
  paramCategories?: any[]
  /** 与 AI 服装设计一致：ImageParamPopup 回显的模型+维度摘要 */
  defaultImageParams?: string[]
  /** 父级提交中，禁用生成按钮 */
  submitting?: boolean
}>()

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
  (e: 'delete', payload?: any): void
  (e: 'coming-soon'): void
  (e: 'show-params'): void
  (e: 'generate'): void
  (e: 'open-type-modal'): void
  (e: 'clear-type-selection'): void
  (e: 'inspiration-library'): void
  (e: 'show-history', payload?: any): void
  (e: 'update:sketch-param-selections', selections: Record<string, string>): void
  (e: 'update:inspiration-words', words: any[]): void
}>()

const categoryList = computed(() => props.paramCategories || [])

/** 当前分类下选中的 options.id */
const selectedOptionId = (classId: string | number | undefined) => {
  return (props.sketchParamSelections || {})[String(classId ?? '')]
}

const applyDefaultSelections = () => {
  const next = { ...(props.sketchParamSelections || {}) }
  let changed = false
  for (const cat of categoryList.value) {
    const cid = String(cat.id ?? '')
    const children = Array.isArray(cat.children) ? cat.children : []
    const first = children[0]
    if (cid && first?.id != null && !next[cid]) {
      next[cid] = String(first.id)
      changed = true
    }
  }
  if (changed) {
    emit('update:sketch-param-selections', next)
  }
}

watch(categoryList, () => applyDefaultSelections(), { immediate: true, deep: true })

const selectOption = (classId: string, optionId: string) => {
  const next = { ...(props.sketchParamSelections || {}), [classId]: optionId }
  emit('update:sketch-param-selections', next)
}

const inspirationWords = ref<any[]>([])

const coin = computed(() => Number(props.coin ?? 0))

const updateInspirationWords = (words: any[]) => {
  inspirationWords.value = words
  emit('update:inspiration-words', words)
}

const typeText = computed(() => {
  const s = props.creationTypeSelection
  if (!s?.category || !s?.clothType || !s?.subKind) return ''
  return `${s.category}-${s.clothType}-${s.subKind}`
})

const hasSketchImage = computed(() => String(imageUrl.value || '').trim().length > 0)

const allSegmentCategoriesSelected = computed(() => {
  const cats = categoryList.value || []
  const sel = props.sketchParamSelections || {}
  if (!cats.length) return false
  return cats.every((cat: any) => {
    const cid = String(cat?.id ?? '')
    return cid && String(sel[cid] ?? '').trim().length > 0
  })
})

/** 无接口数据时不误放行提交按钮 */
const segmentParamsReady = computed(() => {
  const cats = categoryList.value || []
  if (!cats.length) return false
  return allSegmentCategoriesSelected.value
})

const modelParamSummary = computed(() => {
  const fromParent = props.defaultImageParams
  if (Array.isArray(fromParent) && fromParent.length > 0) return fromParent
  return ['请点击参数设置']
})

const submitting = computed(() => Boolean(props.submitting))

/** 进行中用 :loading，勿再写入 disabled */
const generateButtonDisabled = computed(
  () => !hasSketchImage.value || !segmentParamsReady.value,
)
</script>

<style scoped lang="scss">
@use '@/styles/_studio_left.scss';

.block {
  margin-bottom: $spacing-lg;
}
</style>
