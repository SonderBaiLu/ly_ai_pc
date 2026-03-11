<template>
  <div class="left-panel">
    <div class="panel-title">AI服装设计</div>

    <div class="block">
      <div class="block-title">创作款型（必选，单选）</div>
      <button class="select-card" type="button" @click="emit('coming-soon')">
        <span class="select-card__plus">+</span>
        <span>请选择款型</span>
      </button>
    </div>

    <div class="block">
      <div class="block-title">设计特征（非必选，多选）</div>
      <button class="select-card" type="button" @click="emit('coming-soon')">
        <span class="select-card__plus">+</span>
        <span>请选择设计特征</span>
      </button>
    </div>

    <div class="block">
      <div class="block-title">上传参考图（非必传）</div>
      <ImageUploadArea v-model:image-url="imageUrl" :image-icon="images.uploadIcon" image-type="ref"
        image-name="reference" :show-actions="!!imageUrl" :clickable="true" area-height="150px"
        placeholder-text="上传或拖拽参考图" :show-history-tip="false" :enable-history-replace="false"
        @upload="emit('coming-soon')" @replace="emit('coming-soon')" @delete="emit('delete')"
        @drop-file="(p) => emit('drop-file', p)" />
      <div v-if="taskResultId" class="sub-tip">已从我的资产引用（ID: {{ taskResultId }}）</div>
    </div>

    <div class="block">
      <div class="block-title row-between">
        <span>创意描述（选填）</span>
        <div class="mini-actions">
          <el-button class="mini-btn" size="small" @click="emit('coming-soon')">灵感调优</el-button>
          <el-button class="mini-btn" size="small" @click="prompt = ''">全部清空</el-button>
        </div>
      </div>
      <el-input v-model="prompt" type="textarea" :rows="5" maxlength="200" show-word-limit
        placeholder="请输入完整的服装款式描述，建议包含类别、风格、材质、设计细节等关键信息，以生成精准的款式效果。" />
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

.select-card {
  width: 100%;
  height: 48px;
  border-radius: $border-radius-xl;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.03);
  color: rgba(255, 255, 255, 0.78);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: $spacing-xs;
  transition: all $transition-base;

  &:hover {
    border-color: rgba(112, 197, 237, 0.55);
    background: rgba(23, 160, 225, 0.08);
  }
}

.select-card__plus {
  font-weight: 700;
  font-size: 18px;
  line-height: 1;
  color: $color-primary;
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

