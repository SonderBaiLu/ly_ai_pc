<template>
  <el-dialog v-model="showPopup" title="灵感词词典" width="560px" :close-on-click-modal="true" :show-close="false"
    class="inspiration-library-dialog" @close="onClose">
    <template #header>
      <div class="dialog-header">
        <h3 class="dialog-title">灵感词词典</h3>
        <img :src="images.closeWords" alt="" class="dialog-close" @click="onClose" />
      </div>
    </template>
    <div class="inspiration-library-container">
      <!-- 弹窗内容 -->
      <div class="popup-content">
        <div v-for="item in libraryData" :key="item.code" class="category-section">
          <h3 class="category-title">
            <span class="category-marker"></span>
            {{ item.title }}
          </h3>
          <div class="options-grid">
            <div v-for="option in item.wordsList" :key="option.id"
              :class="['option-item', { active: isSelected(item.code, option.id) }]"
              @click="selectOption(item.code, option.id, option.name, option.wordsDesc)">
              <span class="option-text">{{ option.name }}</span>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-if="libraryData.length === 0" class="empty-state">
          <el-empty description="暂无灵感词库数据" />
        </div>
      </div>
    </div>

    <!-- 底部按钮 -->
    <template #footer>
      <div class="dialog-footer">
        <el-button class="cancel-btn" @click="onClose">取消</el-button>
        <el-button class="confirm-btn" type="primary" @click="onConfirm">确定</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { images } from '@/assets'

// 定义组件名称
const componentName = 'InspirationLibrary'

defineOptions({
  name: componentName,
})

// 定义组件属性
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  // 灵感词库数据
  libraryData: {
    type: Array as () => any[],
    default: () => [],
  },
  // 默认选中的值
  defaults: {
    type: Array as () => any[],
    default: () => [],
  },
})

// 定义事件
const emit = defineEmits(['update:modelValue', 'close', 'confirm'])

// 响应式数据
const showPopup = ref(props.modelValue)
// 存储选中的选项 - 每个分类可以多选
const selectedItems = ref<Record<string, any[]>>({})

// 从已选中的灵感词数组恢复选中状态
const restoreSelectedItems = (inspirationWordsArray: any[]) => {
  if (!inspirationWordsArray || inspirationWordsArray.length === 0) {
    selectedItems.value = {}
    return
  }

  // 重置选中状态
  selectedItems.value = {}

  // 遍历灵感词库数据，找到匹配的词汇并恢复选中状态
  props.libraryData.forEach((category: any) => {
    if (!category.wordsList) return

    category.wordsList.forEach((word: any) => {
      // 检查这个词是否在已选中的数组中
      const isInSelected = inspirationWordsArray.some((item: any) => item.id === word.id)

      if (isInSelected) {
        // 初始化分类数组（如果不存在）
        if (!selectedItems.value[category.code]) {
          selectedItems.value[category.code] = []
        }

        // 添加到选中列表
        selectedItems.value[category.code].push({
          id: word.id,
          name: word.name,
          wordsDesc: word.wordsDesc || '',
        })
      }
    })
  })

  console.log('恢复选中状态:', selectedItems.value)
}

// 监听显示状态变化
watch(
  () => props.modelValue,
  (newValue) => {
    if (showPopup.value !== newValue) {
      showPopup.value = newValue
      // 弹窗打开时从defaults恢复选中状态
      if (newValue) {
        restoreSelectedItems(props.defaults)
      }
    }
  }
)

// 监听defaults变化（当父组件更新defaults时）
watch(
  () => props.defaults,
  (newDefaults) => {
    if (showPopup.value) {
      restoreSelectedItems(newDefaults)
    }
  },
  {
    deep: true,
  }
)

// 监听内部显示状态变化
watch(showPopup, (newValue) => {
  if (props.modelValue !== newValue) {
    emit('update:modelValue', newValue)
  }
})

// 选择选项
const selectOption = (
  categoryCode: string,
  optionId: string,
  optionName: string,
  wordsDesc: string
) => {
  // 初始化分类数组（如果不存在）
  if (!selectedItems.value[categoryCode]) {
    selectedItems.value[categoryCode] = []
  }

  // 查找是否已选中
  const existingIndex = selectedItems.value[categoryCode].findIndex(
    (item: any) => item.id === optionId
  )

  if (existingIndex >= 0) {
    // 如果已选中，则取消选中
    selectedItems.value[categoryCode].splice(existingIndex, 1)
  } else {
    // 单选逻辑：清空该分类的所有选项，只保留当前选中的
    selectedItems.value[categoryCode] = [
      {
        id: optionId,
        name: optionName,
        wordsDesc: wordsDesc || '',
      },
    ]
  }
}

// 判断选项是否被选中
const isSelected = (categoryCode: string, optionId: string) => {
  // 确保分类存在
  if (!selectedItems.value[categoryCode]) {
    return false
  }
  // 查找是否在选中列表中
  const isSelected = selectedItems.value[categoryCode].some((item: any) => item.id === optionId)
  return isSelected
}

// 构建返回结果
const buildResult = () => {
  const allSelectedItems: any[] = []

  Object.keys(selectedItems.value).forEach((key) => {
    if (selectedItems.value[key] && selectedItems.value[key].length > 0) {
      allSelectedItems.push(...selectedItems.value[key])
    }
  })

  // 直接返回选中的灵感词数组
  return allSelectedItems
}

// 确认选择
const onConfirm = () => {
  const result = buildResult()
  emit('confirm', result)
  showPopup.value = false
}

// 关闭弹窗
const onClose = () => {
  emit('close')
  showPopup.value = false
}

// 提供给父组件的方法
defineExpose({
  open() {
    showPopup.value = true
  },
  close() {
    showPopup.value = false
  },
  getSelectedValues() {
    return selectedItems.value
  },
})
</script>

<style lang="scss" scoped>
.inspiration-library-dialog {
  border: none !important;

  .dialog-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 23px 28px 23px 25px;
    background: $color-bg-dark-two;
    border-radius: 12px 12px 0 0;

    .dialog-title {
      font-size: $font-size-lg;
      color: $color-text-white;
      font-weight: $font-weight-semibold;
    }

    .dialog-close {
      width: 24px;
      height: 24px;
      cursor: pointer;
    }
  }

  .inspiration-library-container {
    max-height: 500px;
    padding: 24px 25px;
    overflow-y: auto;
    background: $color-bg-dark-first !important;
  }

  .popup-content {
    .category-section {
      margin-bottom: $spacing-xl;

      .category-title {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: $font-size-md;
        color: $color-text-seven;
        margin-bottom: $spacing-md;

        .category-marker {
          width: 4px;
          height: 12px;
          border-radius: 6px;
          background-color: $color-primary-dark;
        }
      }

      .options-grid {
        display: flex;
        flex-wrap: wrap;
        gap: $spacing-sm;

        .option-item {
          padding: 9px 17px;
          border-radius: 4px;
          background-color: rgba(51, 51, 51, 1);
          border: 1px solid transparent;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: $font-size-md;
          color: $color-text-white;
          text-align: center;

          &:hover,
          &.active {
            background-color: rgba(51, 51, 51, 1);
            border-color: rgba(150, 221, 255, 1);
          }
        }
      }
    }
  }

  .empty-state {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 48px;
    min-height: 200px;

    :deep(.el-empty) {
      .el-empty__description {
        color: #888;
      }
    }
  }

  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    padding: 24px 24px 20px;
    border-radius: 0px 0px 12px 12px !important;
    background-color: rgba(34, 34, 34, 1) !important;
    border: 1px solid rgba(255, 255, 255, 0.05) !important;

    .cancel-btn,
    .confirm-btn {
      width: 84px;
      height: 36px;
      margin: 0;
      border-radius: 4px;
      color: $color-text-white;
      font-size: $font-size-md;
      font-family: -regular;
    }

    .cancel-btn {
      border: 1px solid rgba(23, 160, 225, 1);
    }
  }
}
</style>

<style lang="scss">
.inspiration-library-dialog {
  border: none !important;

  .dialog-header {
    background: $color-bg-dark-first !important;
  }
}
</style>
