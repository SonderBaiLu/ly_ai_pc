<template>
  <el-dialog v-model="visible" width="1022px" :close-on-click-modal="false" :close-on-press-escape="true"
    :show-close="false" class="design-feature-modal" @close="handleClose">
    <template #header>
      <div class="modal-header">
        <div class="header-left">
          <div class="header-title-wrap">
            <span class="header-title">设计特征</span>
            <span class="header-sub">（多选模式）</span>
          </div>
        </div>
        <img :src="images.closeDialog" alt="" class="header-close" @click="handleClose" />
      </div>
    </template>

    <div class="modal-body">
      <aside class="left-rail">
        <button v-for="c in categories" :key="c.key" type="button" class="category-item"
          :class="{ active: activeCategoryKey === c.key }" @click="activeCategoryKey = c.key">
          <img v-if="(c.key === activeCategoryKey ? c.functionIconSelected : c.functionIcon)"
            :src="c.key === activeCategoryKey ? c.functionIconSelected || '' : c.functionIcon || ''" :alt="c.label"
            class="category-icon" />
          <span class="category-text">{{ c.label }}</span>
        </button>
      </aside>

      <main class="right-panel">
        <div class="chips">
          <button v-for="opt in activeOptions" :key="opt" type="button" class="chip"
            :class="{ active: isSelected(activeCategoryKey, opt) }" @click="toggle(activeCategoryKey, opt)">
            {{ opt }}
          </button>
        </div>
      </main>
    </div>

    <template #footer>
      <div class="footer">
        <div class="footer-left">
          <span class="count">已选择 <span class="count-num">{{ selectedCount }}</span> 项特征</span>
          <el-button class="clear-btn" plain @click="clearAll">清空重选</el-button>
        </div>
        <el-button type="primary" class="confirm-btn" :disabled="!canConfirm" @click="handleConfirm">确定</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { images } from '@/assets'

export type DesignFeatureSelection = Record<string, string[]>

type FeatureCategory = {
  key: string
  label: string
  options: string[]
  /** 接口下发图标（未选中/选中） */
  functionIcon?: string | null
  functionIconSelected?: string | null
}

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    selection?: DesignFeatureSelection
    categories?: FeatureCategory[]
  }>(),
  {
    modelValue: false,
    selection: () => ({}),
    categories: () => [],
  }
)

const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  (e: 'confirm', v: DesignFeatureSelection): void
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (v: boolean) => emit('update:modelValue', v),
})

const categories = computed<FeatureCategory[]>(() => {
  // 只使用接口下发；不做本地兜底
  return Array.isArray(props.categories) ? props.categories : []
})

const activeCategoryKey = ref(categories.value[0]?.key || '')

watch(
  categories,
  (list) => {
    const next = list[0]?.key || ''
    if (!list.length) {
      activeCategoryKey.value = ''
      return
    }
    if (!list.some((x) => x.key === activeCategoryKey.value)) activeCategoryKey.value = next
  },
  { immediate: true, deep: true }
)

const local = reactive<DesignFeatureSelection>({})

watch(
  () => props.selection,
  (v) => {
    // 覆盖式同步：打开弹窗时以外部为准
    Object.keys(local).forEach((k) => delete local[k])
    Object.entries(v || {}).forEach(([k, arr]) => {
      local[k] = Array.isArray(arr) ? [...arr] : []
    })
  },
  { immediate: true, deep: true }
)

const activeOptions = computed(() => {
  const c = categories.value.find((x) => x.key === activeCategoryKey.value)
  return c?.options || []
})

const isSelected = (categoryKey: string, option: string) => {
  const set = local[categoryKey] || []
  return set.includes(option)
}

const toggle = (categoryKey: string, option: string) => {
  const current = local[categoryKey] || []
  if (current.includes(option)) {
    local[categoryKey] = current.filter((x) => x !== option)
  } else {
    local[categoryKey] = [...current, option]
  }
}

const selectedCount = computed(() => {
  return Object.values(local).reduce((sum, arr) => sum + (Array.isArray(arr) ? arr.length : 0), 0)
})

const canConfirm = computed(() => selectedCount.value > 0)

const clearAll = () => {
  Object.keys(local).forEach((k) => (local[k] = []))
}

const handleClose = () => {
  visible.value = false
}

const handleConfirm = () => {
  if (!canConfirm.value) return
  const normalized: DesignFeatureSelection = {}
  Object.entries(local).forEach(([k, arr]) => {
    const list = Array.isArray(arr) ? arr.filter((x) => String(x || '').trim()) : []
    if (list.length > 0) normalized[k] = list
  })
  emit('confirm', normalized)
  visible.value = false
}
</script>

<style scoped lang="scss">
.design-feature-modal {
  font-family: Inter-medium;
  border-radius: 16px;

  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 27px 35px;
    background: $color-bg-dark-secondary;
    border-radius: 16px 16px 0 0;

    .header-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .header-icon {
      width: 24px;
      height: 24px;
      object-fit: contain;
    }

    .header-title-wrap {
      display: flex;
      align-items: baseline;
      gap: 10px;
    }

    .header-title {
      color: $color-text-white;
      font-weight: 600;
      font-size: $font-size-xl;
      line-height: 1;
    }

    .header-sub {
      color: $color-text-gray;
      font-size: $font-size-md;
    }

    .header-close {
      width: 24px;
      height: 24px;
      cursor: pointer;
    }
  }

  .modal-body {
    display: flex;
    min-height: 560px;
    background: $color-bg-black;
  }

  .left-rail {
    width: 200px;
    padding: 16px 12px;
    background: linear-gradient(135deg, rgba(9, 17, 37, 1) 14.6%, rgba(13, 18, 31, 1) 50%, rgba(22, 29, 49, 1) 85.4%);
  }

  .category-item {
    width: 100%;
    margin-bottom: 4px;
    padding: 14px 16px;
    display: flex;
    align-items: center;
    gap: 12px;
    border-radius: 12px;
    background: transparent;
    border: none;
    color: $color-text-placeholder;
    cursor: pointer;
    transition: all 0.2s ease;

    &.active {
      background: $color-primary-dark;
      color: $color-text-white;
    }

    .category-icon {
      width: 20px;
      height: 20px;
      object-fit: contain;
    }

    .category-text {
      font-size: $font-size-md;
      font-weight: 500;
    }
  }

  .right-panel {
    flex: 1;
    padding: 18px 16px;
  }

  .chips {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    align-content: flex-start;
  }

  .chip {
    min-width: 75px;
    padding: 5px 13px;
    color: $color-text-white;
    font-size: $font-size-sm;
    cursor: pointer;
    border-radius: 4px 4px 4px 4px;
    background-color: $color-bg-black;
    font-family: -regular;
    border: 1px solid rgba(18, 18, 18, 1);

    &.active {
      border-color: $color-primary;
    }
  }

  .footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 18px 42px;
    background: $color-bg-dark-secondary;
    border-radius: 0 0 16px 16px;
  }

  .footer-left {
    display: flex;
    align-items: center;
    gap: 27px;
  }

  .count {
    color: $color-text-placeholder;
    font-size: $font-size-md;
  }

  .count-num {
    color: $color-primary-dark;
    font-weight: $font-weight-bold;
    font-family: Inter-bold;
    margin: 0 6px;
  }

  .clear-btn {
    width: 82px;
    height: 26px;
    border-radius: 4px;
    background-color: rgba(23, 160, 225, 0.15);
    color: $color-text-gray;
    font-size: $font-size-md;
    font-family: -regular;
    border: 1px solid $color-primary-dark;
  }

  .confirm-btn {
    width: 120px;
    height: 42px;
  }
}
</style>
