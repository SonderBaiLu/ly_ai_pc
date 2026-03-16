<template>
  <div class="left-panel">
    <div class="panel-title">AI服装设计</div>

    <div class="block">
      <div class="block-title">创作款型<span class="required-mark">（必选，单选）</span></div>
      <div class="select-card" @click="showTypeModal = true">
        {{ typeText ? typeText : '+ 请选择款型' }}
      </div>
    </div>

    <div class="block">
      <div class="block-title">设计特征<span class="required-mark">（非必选，多选）</span></div>
      <div class="select-card" @click="emit('coming-soon')">+ 请选择设计特征</div>
    </div>

    <div class="block-title">上传参考图<span class="required-mark">（非必传）</span></div>
    <ImageUploadArea v-model:image-url="imageUrl" image-type="ref" image-name="reference" :show-actions="!!imageUrl"
      :clickable="true" area-height="109px" placeholder-text="上传或拖拽参考图" :show-history-tip="true"
      :enable-history-replace="false" @upload="emit('coming-soon')" @replace="emit('coming-soon')"
      @delete="emit('delete')" @drop-file="(p) => emit('drop-file', p)" />

    <!-- 创意描述 -->
    <CreativeDescription v-model:prompt="prompt" :optional="true" />

    <!-- 底部参数以及生成按钮 -->
    <VideoOptionsSection :options="defaultImageParams" :credits="coin" :disabled="true" :loading="isGenerating"
      button-text="立即生成" @show-params="() => emit('show-params')" @generate="() => emit('generate')" />

    <!-- 款型选择弹窗 -->
    <CreationTypeSelectModal v-model="showTypeModal" :selection="creationTypeSelection" @confirm="handleTypeConfirm" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import CreationTypeSelectModal, { type CreationTypeSelection } from '@/components/CreationTypeSelectModal.vue'

const imageUrl = defineModel<string>('imageUrl', { default: '' })

defineProps<{
  taskResultId?: string | number
}>()

const emit = defineEmits<{
  (e: 'drop-file', payload: any): void
  (e: 'delete'): void
  (e: 'coming-soon'): void
  (e: 'show-params'): void
  (e: 'generate'): void
}>()

const prompt = ref('')

const showTypeModal = ref(false)
const creationTypeSelection = ref<Partial<CreationTypeSelection>>({})
const typeText = computed(() => {
  const s = creationTypeSelection.value
  if (!s?.category || !s?.clothType || !s?.subKind) return ''
  return `${s.category}-${s.clothType}-${s.subKind}`
})

const handleTypeConfirm = (v: CreationTypeSelection) => {
  creationTypeSelection.value = v
}

// 底部参数区（先给默认展示，后续接生成/参数弹窗时可从父层传入真实值）
const defaultImageParams = computed<string[]>(() => ['高清', '写实', '1:1'])
const coin = computed(() => 0)
const isGenerating = ref(false)
</script>

<style scoped lang="scss">
.left-panel {
  color: $color-text-white;

  .panel-title {
    font-size: $font-size-xl;
    font-weight: $font-weight-semibold;
    margin-bottom: 35px;
    text-align: center;
  }

  .block {
    padding: 25px 10px 26px;
    margin-bottom: $spacing-sm;
    border-radius: $border-radius-md;
    background: linear-gradient(135deg, rgba(9, 17, 37, 1) 14.6%, rgba(13, 18, 31, 1) 50%, rgba(22, 29, 49, 1) 85.4%);
    border: 1px solid rgba(255, 255, 255, 0.15);
  }

  .block-title {
    margin-bottom: $spacing-md;
    font-family: Inter-medium;
    font-size: $font-size-md;
    font-weight: $font-weight-medium;

    .required-mark {
      color: $color-primary;
    }
  }

  .select-card {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 350px;
    height: 50px;
    margin: 0 auto;
    background: url('@/assets/images/select_btn.png') no-repeat center center;
    background-size: 100% 100%;
    color: $color-text-gray;
    font-size: $font-size-base;
    font-family: Inter-regular;
    cursor: pointer;
  }
}
</style>
