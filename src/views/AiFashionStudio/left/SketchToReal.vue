<template>
  <div class="left-panel studio-left--btn-sm studio-left--select-card-bordered">
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
        @upload="emit('coming-soon')" @replace="emit('coming-soon')" @delete="emit('delete')"
        @show-history="emit('show-history')" @drop-file="(p: File) => emit('drop-file', p)" />

      <!-- 款型选择回显 -->
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
        <el-button
          v-for="opt in category.children || []"
          :key="opt.id"
          :type="selectedOptionId(category.id) === String(opt.id) ? 'primary' : 'default'"
          @click="selectOption(String(category.id), String(opt.id))"
        >
          {{ opt.content }}
        </el-button>
      </div>
    </div>

    <CreativeDescription v-model:prompt="prompt" :optional="true" :inspiration-words="inspirationWords"
      :menu-id="props.menuId" @inspiration-library="emit('inspiration-library')"
      @update:inspiration-words="updateInspirationWords" placeholder="请输入完整的服装款式描述，建议包含类目、风格、材质、设计细节等关键信息，以生成精准的款式效果。
参考示例：无领 驼色 长款 双面呢 宽松版型 羊毛材质 毛呢大衣" />

    <!-- 底部参数以及生成按钮 -->
    <VideoOptionsSection :options="defaultImageParams" :credits="coin" :disabled="true" :loading="isGenerating"
      button-text="立即生成" @show-params="() => emit('show-params')" @generate="() => emit('generate')" />
  </div>
</template>

<script setup lang="ts">
import { images } from '@/assets'
import type { CreationTypeSelection } from '@/components/CreationTypeSelectModal.vue'

const imageUrl = defineModel<string>('imageUrl', { default: '' })

const props = defineProps<{
  taskResultId?: string | number
  creationTypeSelection?: Partial<CreationTypeSelection>
  inspirationWords?: any[]
  coin?: number
  menuId?: string | number
  sketchParamSelections?: Record<string, string>
  /** getInspirationWords(line_draw_to_phys_obj ×2) 返回的 class 节点列表 */
  paramCategories?: any[]
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
  (e: 'delete'): void
  (e: 'coming-soon'): void
  (e: 'show-params'): void
  (e: 'generate'): void
  (e: 'open-type-modal'): void
  (e: 'clear-type-selection'): void
  (e: 'inspiration-library'): void
  (e: 'show-history'): void
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

const prompt = ref('')
const inspirationWords = ref<any[]>([])

const defaultImageParams = computed<string[]>(() => ['LingImage 1.0', '3:4', '2K', '1'])
const coin = computed(() => Number(props.coin ?? 0))
const isGenerating = ref(false)

const updateInspirationWords = (words: any[]) => {
  inspirationWords.value = words
  emit('update:inspiration-words', words)
}

const typeText = computed(() => {
  const s = props.creationTypeSelection
  if (!s?.category || !s?.clothType || !s?.subKind) return ''
  return `${s.category}-${s.clothType}-${s.subKind}`
})
</script>

<style scoped lang="scss">
@use '@/styles/_studio_left.scss';

.block {
  margin-bottom: $spacing-lg;
}
</style>
