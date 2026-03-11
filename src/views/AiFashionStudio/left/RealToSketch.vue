<template>
  <div class="left-panel">
    <div class="panel-title">实物转线稿</div>

    <div class="block">
      <div class="block-title">上传实物图（必传）</div>
      <ImageUploadArea v-model:image-url="imageUrl" :image-icon="images.uploadIcon" image-type="main" image-name="real"
        :show-actions="!!imageUrl" :clickable="true" area-height="150px" placeholder-text="上传或拖拽1张图片"
        :show-history-tip="true" @upload="emit('coming-soon')" @replace="emit('coming-soon')" @delete="emit('delete')"
        @show-history="emit('coming-soon')" @drop-file="(p) => emit('drop-file', p)" />
      <div v-if="taskResultId" class="sub-tip">已从我的资产引用（ID: {{ taskResultId }}）</div>
    </div>

    <div class="block">
      <div class="block-title">选择线稿生成类型（必选，单选）</div>
      <div class="segmented">
        <button class="seg-btn" :class="{ active: sketchColor === 'bw' }" type="button" @click="sketchColor = 'bw'">
          黑白线稿
        </button>
        <button class="seg-btn" :class="{ active: sketchColor === 'color' }" type="button"
          @click="sketchColor = 'color'">
          彩色线稿
        </button>
      </div>
    </div>

    <div class="block">
      <div class="block-title">选择线稿生成风格（必选，单选）</div>
      <div class="segmented">
        <button class="seg-btn" :class="{ active: sketchStyle === 'outline' }" type="button"
          @click="sketchStyle = 'outline'">
          轮廓线稿
        </button>
        <button class="seg-btn" :class="{ active: sketchStyle === 'hand' }" type="button" @click="sketchStyle = 'hand'">
          手绘线稿
        </button>
      </div>
    </div>

    <div class="block">
      <div class="block-title row-between">
        <span>创意描述（选填）</span>
        <div class="mini-actions">
          <el-button class="mini-btn" size="small" @click="emit('coming-soon')">灵感调优</el-button>
          <el-button class="mini-btn" size="small" @click="prompt = ''">全部清空</el-button>
        </div>
      </div>
      <el-input v-model="prompt" type="textarea" :rows="5" maxlength="200" show-word-limit placeholder="可选：补充风格、材质、细节等描述" />
      <div class="try-line">
        试一试：一位意大利时尚男模特（齐耳黑色短卷发，轮廓造型，超宽肩）
        <span class="refresh" @click="emit('coming-soon')">换一换</span>
      </div>
    </div>

    <div class="bottom-bar">
      <div class="bar-left">
        <div class="pill">LingImage 1.0</div>
        <div class="pill">自适应</div>
        <div class="pill">2K</div>
        <div class="pill">1</div>
      </div>
      <div class="bar-right">
        <div class="coin">
          <img :src="images.coin" class="coin-icon" alt="" />
          <span>50</span>
        </div>
        <el-button type="primary" class="gen-btn" @click="emit('coming-soon')">立即生成</el-button>
      </div>
    </div>

    <div class="footer-tip">内容由AI生成，禁止利用功能从事违法活动</div>
  </div>
</template>

<script setup lang="ts">
import { images } from '@/assets'

const imageUrl = defineModel<string>('imageUrl', { default: '' })

defineProps<{
  taskResultId?: string | number
}>()

const emit = defineEmits<{
  (e: 'drop-file', payload: any): void
  (e: 'delete'): void
  (e: 'coming-soon'): void
}>()

type SketchColor = 'bw' | 'color'
type SketchStyle = 'outline' | 'hand'

const sketchColor = ref<SketchColor>('bw')
const sketchStyle = ref<SketchStyle>('outline')
const prompt = ref('')
</script>

<style scoped lang="scss">
.left-panel {
  color: $color-text-white;
}

.panel-title {
  font-size: $font-size-2xl;
  font-weight: $font-weight-semibold;
  margin-bottom: $spacing-lg;
}

.block {
  margin-bottom: $spacing-lg;
}

.block-title {
  font-size: $font-size-sm;
  color: $color-text-light;
  margin-bottom: $spacing-sm;
}

.row-between {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: $spacing-sm;
}

.mini-actions {
  display: inline-flex;
  gap: $spacing-sm;
}

.mini-btn {
  padding: 0 $spacing-md;
  border-radius: $border-radius-lg;
}

.segmented {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: $spacing-md;
}

.seg-btn {
  height: 44px;
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.02);
  color: rgba(255, 255, 255, 0.78);
  cursor: pointer;
  transition: all $transition-base;

  &:hover {
    border-color: rgba(112, 197, 237, 0.5);
  }

  &.active {
    border-color: rgba(112, 197, 237, 0.9);
    background: rgba(23, 160, 225, 0.14);
    color: $color-text-white;
    box-shadow: 0 0 0 2px rgba(23, 160, 225, 0.12) inset;
  }
}

.sub-tip {
  margin-top: $spacing-xs;
  font-size: $font-size-xs;
  color: rgba(255, 255, 255, 0.55);
}

.try-line {
  margin-top: $spacing-sm;
  font-size: $font-size-xs;
  color: rgba(255, 255, 255, 0.6);

  .refresh {
    margin-left: $spacing-xs;
    color: $color-primary;
    cursor: pointer;
  }
}

.bottom-bar {
  margin-top: $spacing-xl;
  padding: $spacing-md;
  border-radius: $border-radius-xl;
  background: rgba(6, 12, 26, 0.55);
  border: 1px solid rgba(255, 255, 255, 0.06);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: $spacing-md;
}

.bar-left {
  display: flex;
  flex-wrap: wrap;
  gap: $spacing-sm;
}

.pill {
  padding: 6px 10px;
  border-radius: 10px;
  font-size: $font-size-xs;
  color: rgba(255, 255, 255, 0.78);
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.bar-right {
  display: flex;
  align-items: center;
  gap: $spacing-md;
}

.coin {
  display: flex;
  align-items: center;
  gap: $spacing-xs;
  color: $color-primary;
  font-weight: 600;
}

.coin-icon {
  width: 18px;
  height: 18px;
  object-fit: contain;
}

.gen-btn {
  height: 44px;
  padding: 0 22px;
  border-radius: 12px;
}

.footer-tip {
  margin-top: $spacing-sm;
  font-size: $font-size-xs;
  color: rgba(255, 255, 255, 0.45);
  text-align: center;
}
</style>

