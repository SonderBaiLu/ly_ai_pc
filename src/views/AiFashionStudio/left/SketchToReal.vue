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
        @show-history="emit('coming-soon')" @drop-file="(p: File) => emit('drop-file', p)" />

      <!-- 款型选择回显 -->
      <div class="select-card" @click="emit('open-type-modal')" v-if="typeText">
        {{ typeText }}
        <img class="select-del-icon" :src="images.tagDel" alt="" srcset="" @click.stop="emit('clear-type-selection')">
      </div>
    </div>

    <div class="block">
      <div class="block-title">选择线稿类型<span class="required-mark">（必选，单选）</span></div>
      <div class="ai-segmented">
        <el-button :type="sketchColor === 'bw' ? 'primary' : 'default'" @click="sketchColor = 'bw'">
          黑白线稿
        </el-button>
        <el-button :type="sketchColor === 'color' ? 'primary' : 'default'" @click="sketchColor = 'color'">
          彩色线稿
        </el-button>
      </div>
    </div>

    <div class="block">
      <div class="block-title">选择线稿风格 <span class="required-mark">（必选，单选）</span></div>
      <div class="ai-segmented">
        <el-button :type="sketchStyle === 'outline' ? 'primary' : 'default'" @click="sketchStyle = 'outline'">
          轮廓线稿
        </el-button>
        <el-button :type="sketchStyle === 'hand' ? 'primary' : 'default'" @click="sketchStyle = 'hand'">
          手绘线稿
        </el-button>
      </div>
    </div>

    <div class="block">
      <div class="block-title">生成图片类型 <span class="required-mark">（必选，单选）</span></div>
      <div class="ai-segmented">
        <el-button :type="outputType === 'flat' ? 'primary' : 'default'" @click="outputType = 'flat'">
          平铺图
        </el-button>
        <el-button :type="outputType === 'model' ? 'primary' : 'default'" @click="outputType = 'model'">
          模特图
        </el-button>
        <el-button :type="outputType === '3d' ? 'primary' : 'default'" @click="outputType = '3d'">
          3D图
        </el-button>
      </div>
    </div>

    <CreativeDescription v-model:prompt="prompt" :optional="true" :inspiration-words="inspirationWords"
      @inspiration-library="emit('inspiration-library')" @update:inspiration-words="updateInspirationWords" placeholder="请输入完整的服装款式描述，建议包含类目、风格、材质、设计细节等关键信息，以生成精准的款式效果。
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
  (e: 'update:inspiration-words', words: any[]): void
}>()

type SketchColor = 'bw' | 'color'
type SketchStyle = 'outline' | 'hand'
type OutputType = 'flat' | 'model' | '3d'

const sketchColor = ref<SketchColor>('bw')
const sketchStyle = ref<SketchStyle>('outline')
const outputType = ref<OutputType>('flat')
const prompt = ref('')
const inspirationWords = ref<any[]>([])

// 底部参数区（先给默认展示，后续接生成/参数弹窗时可从父层传入真实值）
const defaultImageParams = computed<string[]>(() => ['LingImage 1.0', '3:4', '2K', '1'])
const coin = computed(() => 0)
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
