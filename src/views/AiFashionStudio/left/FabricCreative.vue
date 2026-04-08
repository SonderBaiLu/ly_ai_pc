<template>
  <div class="left-panel studio-left--btn-sm studio-left--select-card-bordered studio-left--sticky-footer">
    <div class="left-panel-scroll">
      <div class="panel-title">面料创款</div>

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
          @upload="emit('coming-soon')" @replace="emit('coming-soon')" @delete="(p: any) => emit('delete', p)"
          @show-history="(p: any) => emit('show-history', p)" @drop-file="(p: File) => emit('drop-file', p)" />

        <!-- 面料缩放设置（上传后展示；生成前导出「缩放后 + 正方形中心裁切」图供后端） -->
        <div v-if="imageUrl" class="fabric-scale-card">
          <div class="fabric-scale-title">面料缩放设置</div>
          <div class="fabric-scale-body">
            <canvas ref="fabricPreviewCanvasRef" class="fabric-scale-preview" aria-hidden="true" />
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
          {{ typeText ? typeText : '+ 请选择创作款型' }}
          <img v-if="typeText" class="select-del-icon" :src="images.tagDel" alt="" srcset=""
            @click.stop="emit('clear-type-selection')">
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

      <CreativeDescription v-model="prompt" :optional="true" :inspiration-words="inspirationWords"
        :menu-id="props.menuId" @inspiration-library="emit('inspiration-library')"
        @update:inspiration-words="updateInspirationWords" placeholder="请输入完整的面料创作款式描述，建议包含类目、风格、材质、设计细节等关键信息，以生成精准的面料创款式效果。
参考示例：该面料是一块米色毛呢面料，将面料生成一件无领米色长款宽松版型毛呢大衣，20岁欧洲短发女模特穿着，搭配毛衣和阔腿裤。" />
    </div>

    <div class="bottom-sticky">
      <VideoOptionsSection :options="modelParamSummary" :credits="coin" :disabled="generateButtonDisabled"
        :loading="sectionLoading" button-text="立即生成" @show-params="() => emit('show-params')"
        @generate="handleGenerate" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { images } from '@/assets'
import type { CreationTypeSelection } from '@/components/CreationTypeSelectModal.vue'
import { buildDownloadUrl } from '@/utils/download'

const imageUrl = defineModel<string>('imageUrl', { default: '' })
const prompt = defineModel<string>('prompt', { default: '' })

const props = defineProps<{
  taskResultId?: string | number
  creationTypeSelection?: Partial<CreationTypeSelection>
  inspirationWords?: any[]
  coin?: number
  menuId?: string | number
  /** 与 AI 服装设计 / 线稿转实物一致：ImageParamPopup 回显的模型+维度摘要 */
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
  (e: 'delete', payload?: any): void
  (e: 'coming-soon'): void
  (e: 'show-params'): void
  (e: 'generate', payload: { file: File; scale: number; multiplier: number; size: number; outputType: OutputType }): void
  (e: 'open-type-modal'): void
  (e: 'clear-type-selection'): void
  (e: 'inspiration-library'): void
  (e: 'show-history', payload?: any): void
  (e: 'update:inspiration-words', words: any[]): void
}>()

type OutputType = 'flat' | 'model' | '3d'
const outputType = ref<OutputType>('flat')
const inspirationWords = ref<any[]>([])
const fabricScale = ref(0) // -4 ~ 4

const updateInspirationWords = (words: any[]) => {
  inspirationWords.value = words
  emit('update:inspiration-words', words)
}

const coin = computed(() => Number(props.coin ?? 0))
const isGenerating = ref(false)

/** 与线稿转实物一致：优先展示父层从算法配置回显的模型参数摘要 */
const modelParamSummary = computed(() => {
  const fromParent = props.defaultImageParams
  if (Array.isArray(fromParent) && fromParent.length > 0) return fromParent
  return ['请点击参数设置']
})

const submitting = computed(() => Boolean(props.submitting))
/** 父级提交中 或 本地面料纹理导出中 */
const sectionLoading = computed(() => submitting.value || isGenerating.value)

const typeText = computed(() => {
  const s = props.creationTypeSelection
  if (!s?.category || !s?.clothType || !s?.subKind) return ''
  return `${s.category}-${s.clothType}-${s.subKind}`
})

/** 进行中用 :loading，勿再 disabled，否则与 Element Plus 的 loading 叠在一起不显示转圈 */
const generateButtonDisabled = computed(() => !String(imageUrl.value || '').trim())

/** 滑块 scale∈[-4,4] → 相对默认铺满尺度的倍率：2^(scale/2)（0→1，+4→4，-4→1/4） */
const fabricZoomFromSlider = (scale: number) => Math.pow(2, scale / 2)

const fabricPreviewCanvasRef = ref<HTMLCanvasElement | null>(null)
const PREVIEW_CSS = 80
const EXPORT_SIZE = 1024

/**
 * 后端出图：cover 基准 × 滑块倍率 z。
 * - z ≥ 1（放大/默认）：单张居中绘制，画布裁出中心（与 object-fit: cover 再放大一致）
 * - z < 1（缩小）：整图缩到 tile 后「密铺」铺满画布，无白边；网格相对画布居中
 */
const drawFabricExport = (
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  output: number,
  scale: number,
) => {
  const W = img.naturalWidth || img.width
  const H = img.naturalHeight || img.height
  if (!W || !H) return
  const z = fabricZoomFromSlider(scale)
  const cover = Math.max(output / W, output / H)

  if (z >= 1) {
    const drawW = W * cover * z
    const drawH = H * cover * z
    const x = (output - drawW) / 2
    const y = (output - drawH) / 2
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, output, output)
    ctx.drawImage(img, 0, 0, W, H, x, y, drawW, drawH)
    return
  }

  const tileW = Math.max(1, W * cover * z)
  const tileH = Math.max(1, H * cover * z)
  const nCol = Math.ceil(output / tileW)
  const nRow = Math.ceil(output / tileH)
  const ox = (output - nCol * tileW) / 2
  const oy = (output - nRow * tileH) / 2
  for (let row = 0; row < nRow; row++) {
    for (let col = 0; col < nCol; col++) {
      ctx.drawImage(img, 0, 0, W, H, ox + col * tileW, oy + row * tileH, tileW, tileH)
    }
  }
}

const paintFabricPreview = async () => {
  const canvas = fabricPreviewCanvasRef.value
  const url = String(imageUrl.value || '').trim()
  if (!canvas || !url) return

  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  canvas.width = Math.round(PREVIEW_CSS * dpr)
  canvas.height = Math.round(PREVIEW_CSS * dpr)
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

  try {
    const img = await loadImage(url)
    drawFabricExport(ctx, img, PREVIEW_CSS, Number(fabricScale.value))
  } catch (e) {
    console.warn('[FabricCreative] 面料预览绘制失败:', {
      url,
      scale: fabricScale.value,
      error: e,
    })
    ctx.clearRect(0, 0, PREVIEW_CSS, PREVIEW_CSS)
  }
}

watch([imageUrl, fabricScale], () => {
  void nextTick(() => paintFabricPreview())
}, { immediate: true })

const loadImageByUrl = (src: string, withCrossOrigin = true) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image()
    if (withCrossOrigin) {
      img.crossOrigin = 'anonymous'
    }
    img.onload = () => resolve(img)
    img.onerror = (e) => reject(e)
    img.src = src
  })

const loadImage = async (src: string) => {
  const directUrl = String(src || '').trim()
  if (!directUrl) throw new Error('empty image url')

  // 生产环境：优先走同域代理，避免源站缺少 CORS 时先触发一次控制台报错
  // 开发环境：仍优先直连（更快且方便排查源站问题）
  const preferProxy = !import.meta.env.DEV

  if (preferProxy) {
    const proxyUrl = buildDownloadUrl(directUrl)
    const hasProxy = typeof proxyUrl === 'string' && proxyUrl !== directUrl
    if (hasProxy) {
      try {
        return await loadImageByUrl(proxyUrl, false)
      } catch (proxyErr) {
        // 代理失败再尝试直连（极少数：代理未配置但源站有 CORS）
        try {
          return await loadImageByUrl(directUrl, true)
        } catch (err) {
          console.warn('[FabricCreative] 画布图片加载失败（代理+直连均失败）', {
            directUrl,
            proxyUrl,
            proxyErr,
            err,
          })
          throw err
        }
      }
    }
  }

  try {
    // 优先直接加载（命中源站 CORS 时最快）
    return await loadImageByUrl(directUrl, true)
  } catch (err) {
    // 线上常见：源站缺少 CORS，canvas 无法 drawImage；兜底改走同域 file-proxy
    const proxyUrl = buildDownloadUrl(directUrl)
    const hasProxy = typeof proxyUrl === 'string' && proxyUrl !== directUrl
    if (!hasProxy) throw err
    try {
      // 代理地址为同域资源，不依赖源站 CORS
      return await loadImageByUrl(proxyUrl, false)
    } catch (proxyErr) {
      console.warn('[FabricCreative] 画布图片加载失败（直连+代理均失败）', {
        directUrl,
        proxyUrl,
        err,
        proxyErr,
      })
      throw proxyErr
    }
  }
}

const exportTiledTextureFile = async (src: string, scale: number) => {
  const img = await loadImage(src)
  const size = EXPORT_SIZE
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas 2D context unavailable')

  drawFabricExport(ctx, img, size, Number(scale))

  const blob: Blob = await new Promise((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('toBlob failed'))), 'image/png')
  })
  const file = new File([blob], `fabric_crop_${size}_${scale}x.png`, { type: 'image/png' })
  // multiplier 与滑块刻度一致（-4 即 -4），供父层兜底；提交 zoomRatio 以 scale 为准
  return { file, multiplier: scale, size }
}

const handleGenerate = async () => {
  const url = String(imageUrl.value || '').trim()
  if (!url) return
  isGenerating.value = true
  try {
    const { file, multiplier, size } = await exportTiledTextureFile(url, fabricScale.value)
    emit('generate', { file, scale: fabricScale.value, multiplier, size, outputType: outputType.value })
  } finally {
    isGenerating.value = false
  }
}
</script>

<style scoped lang="scss">
@use '@/styles/_studio_left.scss';

.left-panel {
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
