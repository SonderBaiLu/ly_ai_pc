<template>
  <el-dialog v-model="visible" width="800px" :close-on-click-modal="false" :close-on-press-escape="true"
    :show-close="false" class="creation-type-modal" @close="handleClose">

    <template #header>
      <div class="modal-header">
        <div class="header-left">
          <img class="header-icon" :src="images.magic" alt="" />
          <span class="header-title">创作款型选择</span>
        </div>
        <img :src="images.closeDialog" alt="" class="header-close" @click="handleClose" />
      </div>
    </template>

    <div class="modal-body">
      <div class="section">
        <div class="section-title">类别选择</div>
        <div class="btn-row">
          <button v-for="x in categories" :key="x" class="pill" :class="{ active: local.category === x }" type="button"
            @click="local.category = x">
            {{ x }}
          </button>
        </div>
      </div>

      <div class="section">
        <div class="section-title">服装分类</div>
        <div class="btn-row">
          <button v-for="x in clothTypes" :key="x" class="pill" :class="{ active: local.clothType === x }" type="button"
            @click="local.clothType = x">
            {{ x }}
          </button>
        </div>
      </div>

      <div class="section">
        <div class="section-title">品类</div>
        <div class="btn-row wrap">
          <button v-for="x in kinds" :key="x" class="tag" :class="{ active: local.kind === x }" type="button"
            @click="local.kind = x">
            {{ x }}
          </button>
        </div>
      </div>

      <div class="section">
        <div class="section-title">详细子类</div>
        <div class="btn-row wrap">
          <button v-for="x in subKinds" :key="x" class="tag" :class="{ active: local.subKind === x }" type="button"
            @click="local.subKind = x">
            {{ x }}
          </button>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="footer">
        <div class="current">当前选择：{{ currentText }}</div>
        <el-button type="primary" class="confirm-btn" @click="handleConfirm">确定</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import { images } from '@/assets'

export type CreationTypeSelection = {
  category: string
  clothType: string
  kind: string
  subKind: string
}

const props = withDefaults(defineProps<{
  modelValue: boolean
  selection?: Partial<CreationTypeSelection>
}>(), {
  modelValue: false,
  selection: () => ({}),
})

const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  (e: 'confirm', v: CreationTypeSelection): void
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (v: boolean) => emit('update:modelValue', v),
})

const categories = ['女装', '男装', '男童', '女童']
const clothTypes = ['上装', '下装', '连身装', '套装']
const kinds = ['T恤类', '针织类', '衬衫类', '卫衣类', '外套类', '马甲类', '背心类', '家居类', '内衣类', '泳衣类']
const subKinds = [
  'T恤',
  '短袖T恤',
  '长袖T恤',
  '七分袖T恤',
  'V领T恤',
  '鸡心领T恤',
  'polo领T恤',
  '半高领T恤',
  '方领T恤',
  'U领T恤',
  '高领T恤',
  '亨利领T恤',
  '一字领T恤',
  '娃娃领T恤',
  '小飞袖T恤',
  'oversizeT恤',
  '修身T恤',
  '宽松T恤',
  '落肩T恤',
  '正肩T恤',
  '插肩袖T恤',
  '泡泡袖T恤',
  '印花T恤',
  '刺绣T恤',
  '扎染T恤',
  '渐变T恤',
  '做旧T恤',
  '磨毛T恤',
  '破洞T恤',
  '镂空T恤',
  '拼接T恤',
  '撞色T恤',
  '纯色T恤',
  '条纹T恤',
  '格纹T恤',
  '波点T恤',
]

const local = reactive<CreationTypeSelection>({
  category: props.selection?.category ?? '女装',
  clothType: props.selection?.clothType ?? '上装',
  kind: props.selection?.kind ?? 'T恤类',
  subKind: props.selection?.subKind ?? 'T恤',
})

watch(
  () => props.selection,
  (v) => {
    if (!v) return
    local.category = v.category ?? local.category
    local.clothType = v.clothType ?? local.clothType
    local.kind = v.kind ?? local.kind
    local.subKind = v.subKind ?? local.subKind
  },
  { deep: true },
)

const currentText = computed(() => `${local.category} > ${local.clothType} > ${local.subKind}`)

const handleClose = () => {
  visible.value = false
}

const handleConfirm = () => {
  emit('confirm', { ...local })
  visible.value = false
}
</script>

<style scoped lang="scss">
.creation-type-modal {
  font-family: Inter-medium;

  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 15px 25px;
    background: $color-bg-dark-secondary;
    border-radius: 10px 10px 0 0;

    .header-left {
      display: flex;
      align-items: center;
      gap: $spacing-sm;
      font-weight: 600;
      font-size: $font-size-xl;
      color: $color-text-white;

      .header-icon {
        width: 20px;
        height: 21px;
        object-fit: contain;
      }
    }

    .header-close {
      width: 24px;
      height: 24px;
      cursor: pointer;
    }
  }

  .modal-body {
    padding: 9px 45px;
    background: $color-bg-black;
    border-radius: 0 0 10px 10px;

    .section {
      margin-bottom: $spacing-xl;
    }

    .section-title {
      font-size: $font-size-base;
      color: $color-text-white;
      margin-bottom: $spacing-md;
    }

    .btn-row {
      display: flex;
      gap: $spacing-md;
      align-items: center;
    }

    .btn-row.wrap {
      flex-wrap: wrap;
      gap: 10px;
    }

    .pill {
      padding: 9px 32px;
      border-radius: $border-radius-sm;
      border: 1px solid rgba(18, 18, 18, 1);
      background: transparent;
      cursor: pointer;
      font-size: $font-size-md;
      color: $color-text-white;

      &.active {
        background: $color-primary-dark;
        border-color: transparent;
        color: $color-text-white;
      }
    }

    .tag {
      padding: 5px 18px;
      border-radius: $border-radius-sm;
      border: 1px solid rgba(18, 18, 18, 1);
      background: transparent;
      color: $color-text-white;
      font-size: $font-size-sm;
      cursor: pointer;

      &.active {
        background: $color-primary-dark;
        border-color: transparent;
      }
    }
  }

  .footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 18px 25px 16px;
    background: $color-bg-dark-secondary;
    border-radius: 0 0 10px 10px;

    .current {
      color: $color-text-tags;
      font-size: 13px;
    }

    .confirm-btn {
      width: 120px;
      height: 42px;
    }
  }
}
</style>
