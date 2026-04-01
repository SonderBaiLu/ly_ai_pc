<template>
  <div class="creative-description">
    <div v-if="showHeader" class="description-header">
      <div class="title-section">
        <span v-if="showTitle" class="description-title">{{ title }}</span>
        <span v-if="optional && showTitle" class="required-mark">（选填）</span>
      </div>
      <div class="action-buttons">
        <el-button class="action-btn" type="primary" @click="handleAiAssistant">灵感词词典</el-button>
        <el-button class="action-btn action-btn-clear" type="primary" @click="handleClear">全部清空</el-button>
      </div>
    </div>

    <div v-if="showDescSection" class="description-section">

      <!-- 标签展示区 -->
      <div v-if="inspirationWords && inspirationWords.length > 0" class="tags-container">
        <div class="inspiration-tag" v-for="tag in inspirationWords" :key="tag.id" @click="handleRemoveTag(tag.id)">
          {{ tag.name }}
          <img class="tag-del-icon" :src="images.tagDel" alt="" srcset="">
        </div>
      </div>

      <!-- 文本输入区 -->
      <div class="description-textarea" :class="{ 'has-content': localDescription, 'is-focused': isFocused }">
        <img v-show="localDescription === '' || !localDescription" class="edit-icon" :src="images.editText" alt="编辑" />
        <textarea id="textarea" v-model="localDescription" name="textarea" :placeholder="placeholder"
          :maxlength="maxLength" class="description-input" :style="{ height: textareaHeight }" style="resize: none"
          @input="handleInput" @focus="handleFocus" @blur="handleBlur" @dragover.prevent.stop @drop.prevent.stop />
        <div class="description-footer">
          <!-- 右侧字数统计 -->
          <div class="footer-right">
            <span class="char-count">{{ localDescription.length }}/{{ maxLength }}</span>
          </div>
        </div>
      </div>
    </div>
    <!-- 试一试示例行 -->
    <div v-if="showTryLine && displayTryText" class="try-line">
      <span class="try-label">试一试：</span>
      <div class="try-noticebar" role="button" tabindex="0" @click="handleApplyTryText" :class="{ 'is-try-anim': isTryAnimating }">
        <ScrollText class="try-scroll" :text="displayTryText" :speed="10" :key="tryRefreshNonce" />
      </div>
      <span class="try-refresh" title="换一换" @click="handleShuffle">
        <img :src="images.refreshTry" alt="" class="refresh-icon" />
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { images } from '@/assets'
import { algoApi } from '@/api/algo'
import ScrollText from '@/components/ScrollText.vue'

// 定义灵感词项接口
interface InspirationItem {
  id: string
  name: string
  wordsDesc?: string
}

// 定义组件属性接口
interface Props {
  // 描述内容
  modelValue?: string
  // 标题
  title?: string
  // 占位符文本
  placeholder?: string
  // 最大长度
  maxLength?: number
  // 占位符样式（PC端不需要）
  placeholderStyle?: string
  // 灵感词数组
  inspirationWords?: InspirationItem[]
  // 是否显示"(选填)"标签
  optional?: boolean
  // 是否显示背景色
  showBackground?: boolean
  // 是否显示头部（标题和按钮）
  showHeader?: boolean
  // 文本框高度
  textareaHeight?: string
  // 圆角样式（默认 var(--radius-sm)，可设置为 0 或自定义值）
  borderRadius?: string
  // 是否显示描述输入区域
  showDescSection?: boolean
  // 是否显示标题区域
  showTitle?: boolean
  // 是否显示“试一试”示例行
  showTryLine?: boolean
  // “试一试”示例文案列表
  tryExamples?: string[]
  // 自动轮播间隔（毫秒）
  tryIntervalMs?: number

  // 功能模块Id（用于“试一试”接口）
  menuId?: string | number
}

// 定义事件接口
interface Emits {
  (e: 'update:modelValue', value: string): void
  (e: 'update:inspirationWords', value: InspirationItem[]): void
  (e: 'ai-assistant'): void
  (e: 'inspiration-library'): void
  (e: 'input', event: Event): void
  (e: 'focus', event: Event): void
  (e: 'blur', event: Event): void
  (e: 'try-example', value: string): void
}

// 定义组件属性
const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  title: '创意描述',
  placeholder: '描述您想生成的页面内容',
  maxLength: 200,
  placeholderStyle: '',
  inspirationWords: () => [],
  optional: false,
  showBackground: true,
  showHeader: true,
  textareaHeight: '130px',
  borderRadius: '8px',
  showDescSection: true,
  showTitle: true,
  showTryLine: true,
  tryIntervalMs: 10000,
})

// 定义事件
const emit = defineEmits<Emits>()

// Local state for v-model binding
const localDescription = ref(props.modelValue)
// 跟踪输入框是否获得焦点
const isFocused = ref(false)

// ===== 试一试推荐逻辑（点击触发接口，回填创意描述）=====
const isFetchingTryPrompt = ref(false)
const displayTryText = ref<string>('')
const hasFetchedTryPromptOnce = ref(false)
const tryRefreshNonce = ref(0)
const isTryAnimating = ref(false)

// 监听外部传入的值变化
watch(
  () => props.modelValue,
  (newVal: string) => {
    if (localDescription.value !== newVal) {
      localDescription.value = newVal
    }
  }
)

// 监听本地值变化，向外部发送更新事件
watch(localDescription, (newVal: string) => {
  if (props.modelValue !== newVal) {
    emit('update:modelValue', newVal)
  }
})
// 处理输入事件
const handleInput = (event: Event) => {
  // 确保 localDescription 已更新（v-model 会自动更新，这里只是为了确保响应式）
  const target = event.target as HTMLTextAreaElement
  if (target.value !== localDescription.value) {
    localDescription.value = target.value
  }
  emit('input', event)
}

// 处理获得焦点事件
const handleFocus = (event: Event) => {
  isFocused.value = true
  emit('focus', event)
}

// 处理失去焦点事件
const handleBlur = (event: Event) => {
  isFocused.value = false
  emit('blur', event)
}

// 处理灵感词词典点击
const handleAiAssistant = (): void => {
  // 打开灵感词词典
  emit('inspiration-library')
}

// 处理清空内容
const handleClear = (): void => {
  localDescription.value = ''
  // 清空灵感词词典的选择
  emit('update:inspirationWords', [])
}

// 处理删除标签
const handleRemoveTag = (id: string): void => {
  const newWords = props.inspirationWords?.filter((item) => item.id !== id) || []
  emit('update:inspirationWords', newWords)
}

const handleShuffle = async () => {
  if (isFetchingTryPrompt.value) return
  if (!props.menuId) return
  // 强制让 UI 动画/文本区域重新挂载一次：即便接口返回相同内容，也能看出“换了一次”
  tryRefreshNonce.value += 1
  isTryAnimating.value = true
  isFetchingTryPrompt.value = true
  try {
    const res = await algoApi.getFunctionPrompt({ menuId: String(props.menuId) })
    if (res?.code !== '0000') return

    // 接口返回里通常直接包含：{ functionPromptId, prompt }
    // 但也可能多包一层 data: { data: { prompt } }
    const resAny = res as any
    const prompt = String(resAny?.data?.prompt ?? resAny?.data?.data?.prompt ?? '').trim()
    if (prompt) displayTryText.value = prompt
    hasFetchedTryPromptOnce.value = true
    return displayTryText.value
  } finally {
    isFetchingTryPrompt.value = false
    // 给出肉眼可见的短暂动画反馈
    window.setTimeout(() => {
      isTryAnimating.value = false
    }, 650)
  }
}

const handleApplyTryText = async () => {
  if (isFetchingTryPrompt.value) return

  if (!displayTryText.value) {
    const next = await handleShuffle()
    if (!next) return
    localDescription.value = next
    emit('try-example', next)
    return
  }

  localDescription.value = displayTryText.value
  emit('try-example', displayTryText.value)
}
onMounted(() => {
  if (props.menuId) {
    handleShuffle()
  }
})

watch(
  () => props.menuId,
  (v) => {
    if (!v) return
    if (props.tryExamples?.length) return
    if (hasFetchedTryPromptOnce.value) return
    handleShuffle()
  }
)
</script>

<style lang="scss" scoped>
.creative-description {
  width: 100%;
  display: flex;
  flex-direction: column;
  margin-top: 8px;

  .description-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 15px;

    .title-section {
      font-family: Inter-medium;
      font-size: $font-size-md;
      font-weight: $font-weight-medium;

      .required-mark {
        color: $color-primary;
      }
    }

    .action-buttons {
      display: flex;
      align-items: center;

      .action-btn {
        width: 66px;
        height: 23px;
        border-radius: $spacing-xs;
        background: $color-primary-dark;
        color: $color-text-white;
        font-family: NotoSans-regular;
        border: none;
        cursor: pointer;
        font-size: $font-size-xs;
      }

      .action-btn-clear {
        margin-left: 8px;
        background: $color-bg-dark-clear;
        color: $color-text-desc-secondary;
      }
    }
  }

  .description-section {

    .tags-container {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: $spacing-sm;

      .inspiration-tag {
        position: relative;
        padding: 6px 7px;
        border-radius: 4px;
        background-color: rgba(0, 0, 0, 0.5);
        color: $color-text-gray;
        font-size: $font-size-sm;
        text-align: center;
        font-family: NotoSans-regular;
        border: 1px solid $color-primary;
        cursor: pointer;

        .tag-del-icon {
          position: absolute;
          right: -5px;
          top: -5px;
          width: 10px;
          height: 10px;
        }
      }
    }

    .description-textarea {
      position: relative;
      font-size: $font-size-md;
      text-align: center;
      font-family: PingFangSC-regular;
      background-color: $color-bg-dark-secondary;
      border: 1px solid rgba(255, 255, 255, 0.15);
      padding: 10px;
      border-radius: 8px;

      // 编辑图标
      .edit-icon {
        position: absolute;
        left: 10px;
        top: 11px;
        width: 16px;
        height: 16px;
      }

      .description-input {
        width: 100%;
        background: transparent;
        border: none;
        outline: none;
        color: $color-text-white;
        font-size: $font-size-sm;
        resize: none;
        font-family: inherit;

        &::placeholder {
          padding-left: 20px;
          color: $color-text-gray;
        }

        &:focus {
          outline: none;
        }
      }
    }

    .description-footer {
      display: flex;
      justify-content: flex-end;

      .footer-right {
        display: flex;
        align-items: center;
        cursor: pointer;
      }

      .char-count {
        font-size: $font-size-sm;
        color: $color-text-placeholder-gray;
        font-family: NotoSans-regular;
      }
    }
  }

  // 「试一试」示例条（独立 bar）
  .try-line {
    display: flex;
    align-items: center;
    padding: 16px 8px 16px 10px;
    margin-top: 8px;
    border-radius: 8px;
    background-color: $color-bg-dark-secondary;
    border: 1px solid rgba(255, 255, 255, 0.15);
    font-size: $font-size-sm;
    font-family: NotoSans-regular;

    .try-label {
      flex: 0 0 auto;
      color: $color-text-white;
    }

    .try-noticebar {
      flex: 1 1 auto;
      min-width: 0;
      cursor: pointer;
      overflow: hidden;
      user-select: none;
    }

    .try-text {
      display: inline-block;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      color: $color-text-tip;
      cursor: pointer;
    }

    .try-text-carousel {
      width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .try-gap {
      display: inline-block;
      width: 32px;
      flex: 0 0 auto;
    }

    .try-refresh {
      flex: 0 0 auto;
      cursor: pointer;
      margin-left: 6px;

      .refresh-icon {
        width: 16px;
        height: 16px;
      }
    }

    .try-noticebar.is-try-anim {
      animation: tryBarBlink 0.65s ease-in-out;
    }
  }
}

@keyframes tryBarBlink {
  0% {
    opacity: 0.35;
    transform: translateY(0);
  }
  35% {
    opacity: 1;
    transform: translateY(-2px);
  }
  70% {
    opacity: 0.9;
    transform: translateY(0);
  }
  100% {
    opacity: 1;
  }
}
</style>
