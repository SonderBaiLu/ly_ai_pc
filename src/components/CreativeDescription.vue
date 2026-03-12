<template>
  <div class="creative-description">
    <div v-if="showHeader" class="description-header">
      <div class="title-section">
        <h4 v-if="showTitle" class="description-title">{{ title }}</h4>
        <span v-if="optional && showTitle" class="optional-tag">（非必填）</span>
      </div>
      <div class="action-buttons">
        <el-button class="action-btn" @click="handleAiAssistant">
          <img :src="images.ai" alt="" />
          AI助理
        </el-button>
        <el-button class="action-btn" type="primary" @click="handleInspirationLibrary">
          <img :src="images.inspiration" alt="" />
          灵感词库
        </el-button>
      </div>
    </div>

    <div
      v-if="showDescSection"
      class="description-section"
      :class="{
        'with-background': showBackground,
        'no-background': !showBackground,
      }"
      :style="showBackground ? { borderRadius: borderRadius } : {}"
    >
      <div class="input-wrapper" :style="!showBackground ? { borderRadius: borderRadius } : {}">
        <!-- 标签展示区 -->
        <div v-if="inspirationWords && inspirationWords.length > 0" class="tags-container">
          <el-tag
            v-for="tag in inspirationWords"
            :key="tag.id"
            closable
            size="default"
            class="inspiration-tag"
            @close="handleRemoveTag(tag.id)"
          >
            {{ tag.name }}
          </el-tag>
        </div>

        <!-- 文本输入区 -->
        <div
          class="description-textarea"
          :class="{ 'has-content': localDescription, 'is-focused': isFocused }"
        >
          <img
            v-show="localDescription === '' || !localDescription"
            class="edit-icon"
            :src="images.edit"
            alt="编辑"
          />
          <textarea
            id="textarea"
            v-model="localDescription"
            name="textarea"
            :placeholder="placeholder"
            :maxlength="maxLength"
            class="description-input"
            :style="{ height: textareaHeight }"
            style="resize: none"
            @input="handleInput"
            @focus="handleFocus"
            @blur="handleBlur"
            @dragover.prevent.stop
            @drop.prevent.stop
          />
        </div>
        <div class="description-footer">
          <!-- 左侧运镜按钮 -->
          <div class="movement-button">
            <div v-if="showMovement" @click="handleMovement">
              <img :src="images.movement" />
              <span>{{ movementName || '运镜' }}</span>
            </div>
          </div>

          <!-- 右侧字数统计和清空 -->
          <div class="footer-right">
            <span class="char-count">{{ localDescription.length }}/{{ maxLength }}</span>
            <img class="clear-img" :src="images.clear" alt="清空" @click="handleClear" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { images } from '@/assets'

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
  // 是否显示"(非必填)"标签
  optional?: boolean
  // 是否显示背景色
  showBackground?: boolean
  // 是否显示运镜按钮
  showMovement?: boolean
  // 运镜名称
  movementName?: string
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
  (e: 'movement'): void
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
  showMovement: false,
  movementName: '',
  showHeader: true,
  textareaHeight: '130px',
  borderRadius: 'var(--radius-sm)',
  showDescSection: true,
  showTitle: true,
})

// 定义事件
const emit = defineEmits<Emits>()

// Local state for v-model binding
const localDescription = ref(props.modelValue)
// 跟踪输入框是否获得焦点
const isFocused = ref(false)

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

// 处理运镜按钮点击
const handleMovement = () => {
  emit('movement')
}

// 处理AI助理点击
const handleAiAssistant = (): void => {
  // PC端路由跳转
  emit('ai-assistant')
}

// 处理灵感词库点击
const handleInspirationLibrary = (): void => {
  emit('inspiration-library')
}

// 处理清空内容
const handleClear = (): void => {
  localDescription.value = ''
}

// 处理删除标签
const handleRemoveTag = (id: string): void => {
  const newWords = props.inspirationWords?.filter((item) => item.id !== id) || []
  emit('update:inspirationWords', newWords)
}
</script>

<style lang="scss" scoped>
.creative-description {
  width: 100%;

  .description-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: var(--spacing-md);

    .title-section {
      .description-title {
        display: inline-block;
        color: var(--text-primary);
        font-size: var(--font-lg);
        font-weight: 600;
      }
    }
    .optional-tag {
      color: var(--text-placeholder);
      font-size: var(--font-sm);
      font-weight: 400;
    }

    .action-buttons {
      display: flex;

      .action-btn {
        color: var(--text-secondary);
        font-size: var(--font-sm);
        display: flex;
        align-items: center;
        gap: var(--spacing-xs);

        img {
          width: 14px;
          height: 14px;
          margin-right: var(--spacing-xs);
        }
      }
    }
  }

  .description-section {
    // 文本输入和标签容器始终有背景
    .input-wrapper {
      background: var(--bg-card);
      padding: var(--spacing-md);
      // border-radius 由 prop 动态控制
    }

    // 整体容器可选背景
    &.with-background {
      background: var(--bg-card);
      padding: var(--spacing-md);
      // border-radius 由 prop 动态控制

      .input-wrapper {
        background: transparent;
        padding: 0;
      }
    }

    // 无背景模式（紧贴父容器时使用）
    &.no-background {
      .input-wrapper {
        background: var(--bg-card);
        padding: 12px var(--spacing-md);
      }
    }

    .tags-container {
      display: flex;
      flex-wrap: wrap;
      gap: var(--spacing-sm);
      margin-bottom: var(--spacing-md);

      :deep(.inspiration-tag) {
        background-color: var(--bg-tertiary);
        border: none;
        color: var(--primary-color);

        .el-tag__close {
          color: var(--primary-color);
          transition: all 0.3s ease;

          &:hover {
            background-color: var(--primary-color);
            color: #fff;
            transform: scale(1.1);
          }
        }
      }
    }

    .description-textarea {
      position: relative;
      margin-bottom: var(--spacing-md);

      // 编辑图标
      .edit-icon {
        position: absolute;
        left: 0;
        top: 3px;
        width: 16px;
        height: 16px;
        opacity: 0.6;
        pointer-events: none;
        z-index: 1;
        transition: opacity 0.2s ease;
      }

      .description-input {
        width: 100%;
        background: transparent;
        border: none;
        outline: none;
        color: var(--text-primary);
        font-size: var(--font-sm);
        line-height: 1.8;
        resize: none;
        font-family: inherit;

        &::placeholder {
          padding-left: 20px;
          color: var(--text-placeholder);
        }

        &:focus {
          outline: none;
        }
      }
    }

    .description-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .movement-button {
        color: var(--text-primary);
        font-size: var(--font-md);
        line-height: 1;
        cursor: pointer;

        img {
          width: 20px;
          height: 20px;
          margin-right: var(--spacing-xs);
          vertical-align: middle;
        }
      }

      .footer-right {
        display: flex;
        align-items: center;
        gap: var(--spacing-xs);
        cursor: pointer;
      }

      .char-count {
        font-size: var(--font-sm);
        color: var(--text-clear);
      }

      .clear-img {
        width: 14px;
        height: 14px;
      }
    }
  }
}
</style>
