<template>
  <div class="left-panel studio-left--select-card-bg">
    <div class="panel-title">实物转线稿</div>

    <div class="block-title">上传实物图<span class="required-mark">（必传）</span></div>
    <ImageUploadArea v-model:image-url="imageUrl" image-type="main" image-name="real" :show-actions="!!imageUrl"
      :clickable="true" placeholder-text="上传或拖拽1张图片" :history-max-count="1" :show-history-tip="true"
      @upload="emit('coming-soon')" @replace="emit('coming-soon')" @delete="emit('delete')"
      @show-history="emit('coming-soon')" @drop-file="(p) => emit('drop-file', p)" />

    <div class="block">
      <div class="block-title">选择款型<span class="required-mark">（非必选，单选）</span></div>
      <div class="select-card" @click="emit('open-type-modal')">
        {{ typeText ? typeText : '+ 请选择款型' }}
      </div>
    </div>

    <div class="block-title">选择线稿生成类型<span class="required-mark">（必选，单选）</span></div>
    <div class="ai-segmented">
      <el-button :type="sketchColor === 'bw' ? 'primary' : 'default'" @click="sketchColor = 'bw'">
        黑白线稿
      </el-button>
      <el-button :type="sketchColor === 'color' ? 'primary' : 'default'" @click="sketchColor = 'color'">
        彩色线稿
      </el-button>
    </div>

    <div class="block-title">选择线稿生成风格<span class="required-mark">（必选，单选）</span></div>
    <div class="ai-segmented">
      <el-button :type="sketchStyle === 'outline' ? 'primary' : 'default'" @click="sketchStyle = 'outline'">
        轮廓线稿
      </el-button>
      <el-button :type="sketchStyle === 'hand' ? 'primary' : 'default'" @click="sketchStyle = 'hand'">
        手绘线稿
      </el-button>
    </div>

    <!-- 创意描述 -->
    <CreativeDescription v-model:prompt="prompt" :optional="true"
      placeholder="请输入完整的服装款式描述，建议包含类目、风格、材质、设计细节等关键信息，以生成精准的款式效果。参考示例：无领 驼色 长款 双面呢 宽松版型 羊毛材质 毛呢大衣" />

    <!-- 底部参数以及生成按钮 -->
    <VideoOptionsSection :options="defaultImageParams" :credits="coin" :disabled="true" :loading="isGenerating"
      button-text="立即生成" @show-params="() => emit('show-params')" @generate="() => emit('generate')" />
  </div>
</template>

<script setup lang="ts">
import type { CreationTypeSelection } from '@/components/CreationTypeSelectModal.vue'
import CreativeDescription from '@/components/CreativeDescription.vue'
import VideoOptionsSection from '@/components/VideoOptionsSection.vue'

const imageUrl = defineModel<string>('imageUrl', { default: '' })

const props = defineProps<{
  taskResultId?: string | number
  creationTypeSelection?: Partial<CreationTypeSelection>
}>()

const emit = defineEmits<{
  (e: 'drop-file', payload: any): void
  (e: 'delete'): void
  (e: 'coming-soon'): void
  (e: 'show-params'): void
  (e: 'generate'): void
  (e: 'open-type-modal'): void
  (e: 'clear-type-selection'): void
}>()

type SketchColor = 'bw' | 'color'
type SketchStyle = 'outline' | 'hand'

const sketchColor = ref<SketchColor>('bw')
const sketchStyle = ref<SketchStyle>('outline')
const prompt = ref('')

const typeText = computed(() => {
  const s = props.creationTypeSelection
  if (!s?.category || !s?.clothType || !s?.subKind) return ''
  return `${s.category}-${s.clothType}-${s.subKind}`
})

// 底部参数区（先给默认展示，后续接生成/参数弹窗时可从父层传入真实值）
const defaultImageParams = computed<string[]>(() => ['LingImage 1.0', '自适应', '2K', '1'])
const coin = computed(() => 50)
const isGenerating = ref(false)
</script>

<style scoped lang="scss">
@use '@/styles/_studio_left.scss';

.left-panel {

  .block {
    padding: 25px 0 26px;
    margin: $spacing-sm 0 $spacing-sm-xs;
    border-radius: $border-radius-md;
    background: linear-gradient(135deg, rgba(9, 17, 37, 1) 14.6%, rgba(13, 18, 31, 1) 50%, rgba(22, 29, 49, 1) 85.4%);
    border: 1px solid rgba(255, 255, 255, 0.15);
  }

  .ai-segmented {
    margin-bottom: 15px;
  }
}
</style>
