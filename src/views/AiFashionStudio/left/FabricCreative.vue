<template>
  <div class="left-panel studio-left--btn-sm studio-left--select-card-bordered studio-left--bottom-sticky">
    <div class="panel-title">面料创拍</div>

    <div class="block">
      <div class="block-title flex align-center flex-between">
        <div>
          上传面料图<span class="required-mark">（必传）</span>
        </div>
        <el-button class="upload-btn" size="small" type="primary" plain
          @click="emit('open-type-modal')">选择款型</el-button>
      </div>
      <ImageUploadArea v-model:image-url="imageUrl" image-type="main" image-name="fabric" :show-actions="!!imageUrl"
        :clickable="true" :history-max-count="1" placeholder-text="上传或拖拽1张图片" :show-history-tip="true"
        @upload="emit('coming-soon')" @replace="emit('coming-soon')" @delete="emit('delete')"
        @show-history="emit('coming-soon')" @drop-file="(p: File) => emit('drop-file', p)" />

      <!-- 面料缩放设置（上传后展示；生成前会用 canvas 导出平铺+缩放后的纹理图） -->
      <div v-if="imageUrl" class="fabric-scale-card">
        <div class="fabric-scale-title">面料缩放设置</div>
        <div class="fabric-scale-body">
          <div class="fabric-scale-preview" :style="fabricPreviewStyle" />
          <div class="fabric-scale-slider">
            <div class="fabric-scale-slider-header flex align-center flex-between">
              <div class="fabric-scale-label">缩放设置</div>
              <div class="fabric-scale-value">{{ fabricScale }}x</div>
            </div>
            <el-slider v-model="fabricScale" :min="-4" :max="4" :step="1" :show-tooltip="false" />
            <div class="fabric-scale-ticks flex align-center flex-between">
              <span>-4x</span>
              <span>0x</span>
              <span>4x</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 款型选择回显 -->
      <div class="select-card" @click="emit('open-type-modal')" v-if="typeText">
        {{ typeText }}
        <img class="select-del-icon" :src="images.tagDel" alt="" srcset="" @click.stop="emit('clear-type-selection')">
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
      @inspiration-library="emit('inspiration-library')" @update:inspiration-words="updateInspirationWords" placeholder="请输入完整的面料创作款式描述，建议包含类目、风格、材质、设计细节等关键信息，以生成精准的面料创款式效果。
参考示例：该面料是一块米色毛呢面料，将面料生成一件无领米色长款宽松版型毛呢大衣，20岁欧洲短发女模特穿着，搭配毛衣和阔腿裤。" />

    <!-- 底部参数以及生成按钮 -->
    <div class="bottom-sticky">
      <VideoOptionsSection :options="defaultImageParams" :credits="coin" :disabled="true" :loading="isGenerating"
        button-text="立即生成" @show-params="() => emit('show-params')" @generate="handleGenerate" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { images } from '@/assets'
import type { CreationTypeSelection } from '@/components/CreationTypeSelectModal.vue'

// const imageUrl = defineModel<string>('imageUrl', { default: '' })
const imageUrl = ref('https://image-prod.chaotuishou.com/erp/2025/11/27/ML-38%E7%BB%B8%E7%BC%8E%E8%A3%85%E7%BD%AE.jpg')

const props = defineProps<{
  taskResultId?: string | number
  creationTypeSelection?: Partial<CreationTypeSelection>
  inspirationWords?: any[]
  coin?: number
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
  (e: 'generate', payload: { file: File; scale: number; multiplier: number; size: number }): void
  (e: 'open-type-modal'): void
  (e: 'clear-type-selection'): void
  (e: 'inspiration-library'): void
  (e: 'update:inspiration-words', words: any[]): void
}>()

type OutputType = 'flat' | 'model' | '3d'
const outputType = ref<OutputType>('flat')
const prompt = ref('')
const inspirationWords = ref<any[]>([])
const fabricScale = ref(0) // -4 ~ 4

const updateInspirationWords = (words: any[]) => {
  inspirationWords.value = words
  emit('update:inspiration-words', words)
}

// 底部参数区（先给默认展示，后续接生成/参数弹窗时可从父层传入真实值）
const defaultImageParams = computed<string[]>(() => ['LingImage 1.0', '自适应', '2K', '1'])
const coin = computed(() => Number(props.coin ?? 0))
const isGenerating = ref(false)

const typeText = computed(() => {
  const s = props.creationTypeSelection
  if (!s?.category || !s?.clothType || !s?.subKind) return ''
  return `${s.category}-${s.clothType}-${s.subKind}`
})

// 将 -4~4 映射为倍率：2^(scale/2)（变化更平滑，也更像“纹理变大/变小”）
const fabricMultiplier = computed(() => Math.pow(2, fabricScale.value / 2))

const fabricPreviewStyle = computed(() => {
  const url = String(imageUrl.value || '').trim()
  if (!url) return {}
  const base = 80 // 基础平铺尺寸（px）
  const size = Math.max(16, Math.round(base * fabricMultiplier.value))
  return {
    backgroundImage: `url(${url})`,
    backgroundRepeat: 'repeat',
    backgroundPosition: 'center',
    backgroundSize: `${size}px ${size}px`,
  }
})

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = (e) => reject(e)
    img.src = src
  })

const exportTiledTextureFile = async (src: string, scale: number) => {
  const img = await loadImage(src)
  const multiplier = Math.pow(2, scale / 2)
  const size = 1024 // 输出纹理尺寸：可按算法要求调整（1024/2048）
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas 2D context unavailable')

  // 纹理平铺单元尺寸：按倍率缩放
  const baseTile = 256
  const tile = Math.max(32, Math.round(baseTile * multiplier))

  // 平铺绘制
  for (let y = 0; y < size; y += tile) {
    for (let x = 0; x < size; x += tile) {
      ctx.drawImage(img, x, y, tile, tile)
    }
  }

  const blob: Blob = await new Promise((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('toBlob failed'))), 'image/png')
  })
  const file = new File([blob], `fabric_texture_${size}_${scale}x.png`, { type: 'image/png' })
  return { file, multiplier, size }
}

const handleGenerate = async () => {
  const url = String(imageUrl.value || '').trim()
  if (!url) return
  isGenerating.value = true
  try {
    const { file, multiplier, size } = await exportTiledTextureFile(url, fabricScale.value)
    emit('generate', { file, scale: fabricScale.value, multiplier, size })
  } finally {
    isGenerating.value = false
  }
}
</script>

<style scoped lang="scss">
@use '@/styles/_studio_left.scss';

.left-panel {
  display: flex;
  flex-direction: column;
  min-height: 100%;
  color: $color-text-white;
}

.block {
  margin-bottom: $spacing-lg;
  position: relative;
}

.fabric-scale-card {
  padding: 15px 13px 13px;
  margin-top: $spacing-sm;
  border-radius: $border-radius-md;
  background: linear-gradient(135deg, rgba(9, 17, 37, 1) 14.6%, rgba(13, 18, 31, 1) 50%, rgba(22, 29, 49, 1) 85.4%);
  border: 1px solid rgba(255, 255, 255, 0.15);
  font-size: $font-size-md;

  .fabric-scale-title {
    font-family: Inter-medium;
    margin-bottom: $spacing-sm;
  }

  .fabric-scale-body {
    display: flex;
    align-items: center;
    gap: 14px;


    .fabric-scale-preview {
      width: 80px;
      height: 80px;
    }

    .fabric-scale-slider {
      flex: 1;
      min-width: 0;

      :deep(.el-slider__button) {
        width: 14px;
        height: 14px;
        border: none;
        background: $color-primary;
      }

      :deep(.el-slider__bar) {
        height: 4px;
        background: $color-primary;
      }

      :deep(.el-slider__runway) {
        height: 4px;
        border-radius: 2px 2px 2px 2px;
        background-color: rgba(255, 255, 255, 0.3);
      }

      .fabric-scale-label {
        color: $color-text-gray;
        margin-bottom: $spacing-sm;
      }

      .fabric-scale-value {
        font-family: NotoSans-bold;
        font-weight: $font-weight-bold;
      }

      .fabric-scale-ticks {
        font-size: $font-size-xs;
        color: $color-text-seven;
      }
    }
  }
}
</style>
