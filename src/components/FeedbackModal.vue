<template>
  <el-dialog v-model="dialogVisible" width="598px" :show-close="false" class="feedback-modal"
    :close-on-click-modal="false" :close-on-press-escape="false" @close="handleClose">
    <div class="modal-header">
      <div class="title">反馈内容</div>
      <img :src="images.closeFeedback" alt="关闭" class="close-icon" @click="handleClose" />
    </div>

    <div class="feedback-content">
      <!-- 选择反馈理由 -->
      <div class="feedback-section">
        <div class="section-label">
          选择反馈理由
          <span class="required">*</span>
        </div>

        <div v-for="reason in reasonList" :key="reason.id" class="reason-group">
          <div class="group-title">{{ reason.content }}:</div>
          <div class="button-group">
            <div v-for="item in reason.children" :key="item.id"
              :class="{ selected: selectedReasons.includes(String(item.id)) }" class="reason-button"
              @click="toggleReason(item.id)">
              {{ item.content }}
            </div>
          </div>
        </div>
      </div>

      <!-- 其他原因 -->
      <div class="feedback-section">
        <div class="section-label">其他:</div>
        <div class="textarea-wrapper">
          <textarea v-model="otherContent" placeholder="其他原因 (100字以内)" :maxlength="100" show-word-limit />
          <div class="char-count-wrapper">
            <div class="char-count">{{ otherContent.length }}/100</div>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button v-if="canSubmit" type="primary" class="button-item" @click="handleSubmit">
          提交
        </el-button>
        <el-button v-else class="button-item disabled">提交</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { images } from '@/assets'
import { creativeApi } from '@/api/creative'

interface Props {
  modelValue: boolean
  userId?: string | number // 反馈用户id (必填)
  taskId?: string | number // 任务id (必填)
  taskResultId?: string | number // 任务结果id (必填)
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'success'): void // 提交成功事件
}>()

// 反馈配置项类型（接口返回的数据结构）
interface FeedbackConfigItem {
  id: string
  configType: string
  parentId: string
  content: string
  children: FeedbackConfigItem[]
}

// 反馈理由列表（将从接口获取）
const reasonList = ref<FeedbackConfigItem[]>([])
// 其他内容
const otherContent = ref('')

// 选中的反馈理由ID（存储为字符串数组）
const selectedReasons = ref<string[]>([])

// 弹窗显示状态
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

// 是否可以提交（至少选择一个反馈理由）
const canSubmit = computed(
  () => selectedReasons.value.length > 0 || otherContent.value.trim() !== ''
)

// 切换反馈理由选择
const toggleReason = (id: string | number) => {
  const idStr = String(id)
  const index = selectedReasons.value.indexOf(idStr)
  if (index > -1) {
    selectedReasons.value.splice(index, 1)
  } else {
    selectedReasons.value.push(idStr)
  }
}

// 重置表单
const resetForm = () => {
  selectedReasons.value = []
  otherContent.value = ''
}

// 关闭弹窗
const handleClose = () => {
  resetForm()
  dialogVisible.value = false
}

// 提交反馈
const handleSubmit = async () => {
  if (!canSubmit.value) {
    ElMessage.warning('请至少选择一个反馈理由或填写其他原因')
    return
  }

  // 检查必要参数
  if (!props.userId || !props.taskId || !props.taskResultId) {
    ElMessage.error('反馈参数不完整，无法提交')
    return
  }

  // 获取选中的理由内容
  const selectedReasonContents: string[] = []
  for (const reason of reasonList.value) {
    if (Array.isArray(reason.children)) {
      for (const item of reason.children) {
        if (selectedReasons.value.includes(String(item.id))) {
          selectedReasonContents.push(`${item.content}`)
        }
      }
    }
  }

  // 其他原因
  if (otherContent.value.trim()) {
    selectedReasonContents.push(`${otherContent.value.trim()}`)
  }

  try {
    const res = await creativeApi.addFeedbackRecord({
      userId: props.userId,
      taskId: props.taskId,
      taskResultId: props.taskResultId,
      content: selectedReasonContents.join(','),
    })

    if (res.code === '0000') {
      ElMessage.success('反馈提交成功，感谢您的反馈！')
      emit('success')
      handleClose()
    } else {
      ElMessage.error(res.msg || '反馈提交失败，请稍后重试')
    }
  } catch (error: any) {
    console.error('反馈提交失败:', error)
    ElMessage.error(error?.response?.data?.msg || '反馈提交失败，请稍后重试')
  }
}

// 模块级别的缓存变量，避免重复请求反馈配置
let feedbackConfigLoaded = false
let isLoadingConfig = false

// 加载反馈配置（带缓存，只加载一次）
const loadFeedbackConfig = async () => {
  // 如果已经加载过，直接返回
  if (feedbackConfigLoaded) return

  // 如果正在加载中，避免重复请求
  if (isLoadingConfig) return

  isLoadingConfig = true

  try {
    const res = await creativeApi.findFeedbackConfig()
    if (res.code === '0000' && Array.isArray(res.data)) {
      // 过滤出 configType === 'class' 的项（分类项）
      reasonList.value = res.data.filter(
        (item: any) => item.configType === 'class' && Array.isArray(item.children)
      ) as FeedbackConfigItem[]
      // 标记为已加载
      feedbackConfigLoaded = true
    }
  } catch (error) {
    console.error('获取反馈配置失败:', error)
    // 失败时继续使用默认值，不影响使用
  } finally {
    isLoadingConfig = false
  }
}

// 监听弹窗打开，加载配置
watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal) {
      // 弹窗打开时加载反馈配置（只会加载一次）
      loadFeedbackConfig()
    }
  }
)
</script>

<style lang="scss">
// 非 scoped 样式，确保覆盖其他弹窗的全局样式
.feedback-modal.el-dialog {
  height: auto !important;

  .el-dialog__body {
    height: auto !important;
    max-height: 660px !important;
    overflow-y: auto !important;
    padding: 0 !important;
  }
}
</style>

<style lang="scss" scoped>
.feedback-modal {
  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background-color: $color-primary-dark;
    padding: $spacing-lg $spacing-xl;

    .title {
      font-size: $font-size-xl;
      font-weight: $font-weight-bold;
      color: $color-text-white;
    }

    .close-icon {
      position: relative;
      cursor: pointer;
      width: 24px;
      height: 24px;
    }
  }

  .feedback-content {
    overflow-y: auto;
    padding: $spacing-xl;
    background: $color-bg-dark-first;
    color: $color-text-white;

    .feedback-section {
      margin-bottom: $spacing-xl;

      &:last-child {
        margin-bottom: 0;
      }

      .section-label {
        font-size: $font-size-lg;
        font-weight: $font-weight-medium;
        margin-bottom: $spacing-md;

        .required {
          color: $color-bg-red;
          margin-left: $spacing-xs;
        }
      }
    }

    .reason-group {
      margin-bottom: $spacing-sm-md;

      .group-title {
        font-size: $font-size-md;
        color: $color-text-desc;
        margin-bottom: $spacing-sm-md;
        font-weight: $font-weight-medium;
      }

      .button-group {
        display: flex;
        flex-wrap: wrap;
        gap: $spacing-sm;

        .reason-button {
          font-size: $font-size-md;
          padding: 10px 18px;
          border-radius: $border-radius-md;
          transition: all $transition-base;
          margin: 0;
          background-color: $color-bg-dark-clear;
          border: 1px solid rgba($color-text-white, 0.12);
          color: $color-text-white;
          cursor: pointer;
          user-select: none;
          line-height: 1;

          // 选中状态 - 只改变边框
          &.selected {
            border-color: $color-primary-dark;
          }
        }
      }
    }

    .textarea-wrapper {
      position: relative;
      width: 100%;
      height: 128px;
      padding: $spacing-md;
      background-color: $color-bg-dark-clear;
      border: 1px solid rgba($color-text-white, 0.12);
      border-radius: $border-radius-md;

      textarea {
        width: 100%;
        height: 100%;
        background-color: transparent;
        color: $color-text-white;
        font-size: $font-size-md;
        font-family: inherit;
        resize: vertical;
        transition: all $transition-base;
        resize: none;
        box-sizing: border-box;
        outline: none;
        border: none;

        &::placeholder {
          color: $color-text-gray;
        }

        &:focus {
          outline: none;
        }
      }

      .char-count-wrapper {
        position: absolute;
        bottom: 6px;
        right: 9px;
        pointer-events: none;
      }

      .char-count {
        font-size: $font-size-sm;
        color: $color-text-gray;
      }
    }
  }

  .dialog-footer {
    padding: 0 $spacing-xl $spacing-xl;

    .button-item {
      width: 96px;
      height: 44px;
      font-size: $font-size-md;
      color: $color-text-white;
      border-radius: $border-radius-md;
    }

    .disabled {
      background-color: rgba($color-text-white, 0.25) !important;
      border: none !important;
      color: rgba($color-text-white, 0.6) !important;
    }
  }
}
</style>
