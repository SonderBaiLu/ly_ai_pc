<template>
  <div
    class="image-upload-area"
    :class="{ dragging: isDragging, 'has-description': showDesc && imageUrl }"
  >
    <!-- 图片上传区域 -->
    <div
      class="upload-area"
      :style="{ width: areaWidth, height: areaHeight }"
      @dragover.prevent="handleDragOver"
      @dragleave.prevent="handleDragLeave"
      @drop.prevent="handleDrop"
      @click="!imageUrl && !showLoading && handleUpload(imageType, imageName)"
    >
      <!-- 上传占位符 -->
      <div v-if="!imageUrl" class="upload-placeholder">
        <template v-if="!showLoading">
          <div class="upload-icon-wrapper">
            <img class="upload-icon" :src="imageIcon" />
          </div>
          <span class="placeholder-text">{{ placeholderText }}</span>
          <div v-if="showHistoryTip" class="placeholder-text-box">
            <span>从</span>
            <span class="history-link" @click.stop="handleShowHistory">历史创作</span>
            <span>选择</span>
            <span>支持 JPG/PNG</span>
          </div>
        </template>
        <!-- 上传状态 -->
        <el-space v-if="showLoading" :size="8">
          <el-icon class="is-loading">
            <Loading />
          </el-icon>
          <span>{{ loadingText }}</span>
        </el-space>
      </div>

      <!-- 库选择（左上角，参考样式） -->
      <div
        v-if="libraryName"
        class="uploaded-library"
        @click.stop="handleLibrarySelection(imageType, imageName)"
      >
        <span class="library-name-text">{{ libraryName }}</span>
        <img :src="images.arrow" class="library-arrow-icon" alt=">" />
      </div>
      <div v-if="imageUrl" class="uploaded-image">
        <!-- 片段/排序 -->
        <div v-if="tagText" class="upload-sort">
          <el-tag class="tag" type="info" effect="dark">{{ tagText }}</el-tag>
          <el-icon
            class="drag-handle"
            :size="36"
            @touchstart="handleTouchStart"
            @touchmove="handleTouchMove"
            @touchend="handleTouchEnd"
            @mousedown="handleMouseDown"
            @mousemove="handleMouseMove"
            @mouseup="handleMouseUp"
            @mouseleave="handleMouseLeave"
          >
            <el-image :src="images.sort2" fit="contain" style="width: 18px; height: 18px" />
          </el-icon>
        </div>
        <!-- 视角文案 -->
        <el-tag v-if="angleText" class="uploaded-angle" type="info" effect="dark">
          {{ angleText }}
        </el-tag>
        <!-- 分类选择（右上角，保留原有功能） -->
        <el-tag
          v-if="cateName"
          class="uploaded-cate"
          type="info"
          effect="dark"
          @click.stop="handleSelection(imageType, imageName)"
        >
          <el-space :size="5" alignment="center">
            {{ cateName }}
            <el-icon :size="24" :class="isDownOrUp ? 'arrow-rotated' : 'arrow-normal'">
              <el-image :src="images.down" fit="contain" style="width: 24px; height: 24px" />
            </el-icon>
          </el-space>
        </el-tag>
        <!-- 已上传的图片 -->
        <el-image
          :src="imageUrl"
          fit="contain"
          class="uploaded-img"
          :class="{ 'img-loaded': imageLoaded }"
          :preview-src-list="clickable ? [imageUrl] : []"
          :initial-index="0"
          :preview-teleported="true"
          :hide-on-click-modal="true"
          :z-index="3000"
          @dragstart.prevent
          @load="handleImageLoad"
        />
        <!-- 操作按钮 -->
        <div v-if="showActions" class="upload-action">
          <!-- 替换按钮（带下拉菜单） -->
          <el-dropdown
            class="action-dropdown"
            trigger="hover"
            placement="top"
            popper-class="replace-dropdown-menu"
            @command="handleReplaceCommand"
          >
            <div class="action-button">
              <el-image :src="images.replace2" fit="contain" style="width: 16px; height: 16px" />
              <span>替换</span>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="upload">本地上传</el-dropdown-item>
                <el-dropdown-item v-if="enableHistoryReplace" command="history">
                  历史创作
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>

          <el-divider direction="vertical" class="action-divider" />

          <div class="action-button" @click.stop="handleDelete(imageType, imageName)">
            <el-image :src="images.delete2" fit="contain" style="width: 16px; height: 16px" />
            <span>删除</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 描述内容区域 - 使用统一组件 -->
    <CreativeDescription
      v-if="showDesc && imageUrl"
      v-model="localDescription"
      :placeholder="placeholder"
      :max-length="maxLength"
      :show-background="false"
      :show-header="false"
      :show-movement="showMovement"
      :movement-name="movementName"
      :textarea-height="textareaHeight"
      border-radius="0 0 var(--radius-sm) var(--radius-sm)"
      @input="handleInput"
      @focus="handleFocus"
      @blur="handleBlur"
      @movement="handleMovement(imageType, imageName)"
    />
  </div>
</template>

<script setup lang="ts">
import { images } from '@/assets'
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'

// 定义组件属性
const props = defineProps({
  // 图片URL
  imageUrl: {
    type: String,
    default: '',
  },
  // 图片图标
  imageIcon: {
    type: String,
    default: () => images.uploadImg,
  },
  // 图片类型 即图片位置
  imageType: {
    type: String,
    default: 'main',
  },
  // 图片键值名字
  imageName: {
    type: String,
    default: 'uploadedImage',
  },
  // 分类名字
  cateName: {
    type: String,
    default: '',
  },
  // 库选择名字（左上角显示）
  libraryName: {
    type: String,
    default: '',
  },
  // 显示上下图标
  isDownOrUp: {
    type: Boolean,
    default: false,
  },
  // 加载状态
  showLoading: {
    type: Boolean,
    default: false,
  },
  // 加载文本
  loadingText: {
    type: String,
    default: '图片上传中…',
  },
  // 占位符文字
  placeholderText: {
    type: String,
    default: '上传或拖拽图片',
  },
  // 区域宽度
  areaWidth: {
    type: String,
    default: '100%',
  },
  // 区域高度
  areaHeight: {
    type: String,
    default: '200px',
  },
  // 是否显示操作按钮
  showActions: {
    type: Boolean,
    default: true,
  },
  // 是否可点击图片
  clickable: {
    type: Boolean,
    default: true,
  },
  // 图片模式
  imageMode: {
    type: String,
    default: 'aspectFit',
  },
  // 标签文案
  tagText: {
    type: String,
    default: '',
  },
  // 视角文案
  angleText: {
    type: String,
    default: '',
  },
  // 是否显示文案描述
  showDesc: {
    type: Boolean,
    default: false,
  },
  // 描述内容
  modelValue: {
    type: String,
    default: '',
  },
  // 占位符文本
  placeholder: {
    type: String,
    default: '描述您想生成的页面内容',
  },
  // 最大长度
  maxLength: {
    type: Number,
    default: 200,
  },
  // 占位符样式
  placeholderStyle: {
    type: String,
    default: 'color: #BDC3CE; padding-left: 40px;',
  },
  // 是否启用拖拽
  enableDrag: {
    type: Boolean,
    default: true,
  },
  // 当前索引
  index: {
    type: Number,
    default: 0,
  },
  // 是否显示运镜按钮
  showMovement: {
    type: Boolean,
    default: false,
  },
  // 运镜名称
  movementName: {
    type: String,
    default: '',
  },
  // 文本框高度
  textareaHeight: {
    type: String,
    default: '130px',
  },
  // 是否显示“历史创作”文案/入口
  showHistoryTip: {
    type: Boolean,
    default: true,
  },
  // 是否允许在替换菜单里显示历史创作
  enableHistoryReplace: {
    type: Boolean,
    default: true,
  },
})

// 定义事件
const emit = defineEmits([
  'update:modelValue',
  'upload', // 上传图片
  'replace', // 替换图片
  'delete', // 删除图片
  'preview', // 预览图片
  'selection', // 分类选择
  'library-selection', // 库选择
  'update:imageUrl', // 更新图片URL
  'input', // 输入事件
  'focus', // 获得焦点
  'blur', // 失去焦点
  'movement', // 运镜
  'clear', // 清空描述
  'drag-start', // 开始拖拽
  'drag-move', // 拖拽移动
  'drag-end', // 结束拖拽
  'show-history', // 显示历史创作弹窗
  'drop-file', // 拖拽文件上传
])

// 本地描述内容
const localDescription = ref(props.modelValue || '')

// 图片加载状态
const imageLoaded = ref(false)

// 拖拽相关状态
const isDragging = ref(false)
const dragStartX = ref(0)
const dragStartY = ref(0)
const dragOffsetX = ref(0)
const dragOffsetY = ref(0)

// 拖拽上传处理函数
const handleDragOver = (_e: DragEvent) => {
  // 只在没有图片时才显示拖拽状态
  if (!props.imageUrl) {
    isDragging.value = true
  }
}

const handleDragLeave = (_e: DragEvent) => {
  isDragging.value = false
}
const handleDrop = (e: DragEvent) => {
  isDragging.value = false

  const dt = e.dataTransfer
  if (!dt) return

  // 优先处理拖拽文件
  if (dt.files && dt.files.length > 0) {
    // 如果已有图片，仍然触发 drop-file 事件，让父组件决定是否替换
    // 这样可以支持拖拽替换已上传的图片
    const file = dt.files[0]

    // 触发文件上传事件，始终传递 type 和 position，确保归属正确
    emit('drop-file', {
      file,
      type: props.imageType,
      position: props.imageName,
    })
    return
  }

  // 其次处理从"我的资产"拖过来的 JSON 数据（application/json）
  const jsonText = dt.getData('application/json')
  if (jsonText) {
    try {
      const data = JSON.parse(jsonText)
      if (data && data.type === 'asset' && (data.imageUrl || data.fileUrl)) {
        // 检查是否是视频（fileType === 2），视频不能拖拽到表单
        if (data.fileType === 2) {
          ElMessage.warning('视频不能拖拽到表单，仅支持图片')
          return
        }
        // 如果已有图片，仍然触发 drop-file 事件，让父组件决定是否替换
        emit('drop-file', {
          url: data.imageUrl || data.fileUrl,
          // 从“我的资产/缩略图”拖拽过来时，认为是历史资产图片，需要把 id 透传出去
          // 统一命名为 taskResultId，提交时组装 historyParams 使用
          taskResultId: data.id,
          type: props.imageType,
          position: props.imageName,
          fileType: data.fileType, // 传递文件类型，让父组件也能判断
        })
        return
      }
    } catch (error) {
      console.error('[ImageUploadArea] 解析拖拽资产失败:', error)
    }
  }

  // 兜底：如果有纯文本 URL，则也尝试作为图片地址处理
  const textUrl = dt.getData('text/plain')
  if (textUrl && /^https?:\/\//.test(textUrl)) {
    // 如果已有图片，仍然触发 drop-file 事件，让父组件决定是否替换
    emit('drop-file', {
      url: textUrl,
      type: props.imageType,
      position: props.imageName,
    })
  }
}

// 监听外部传入的值变化
watch(
  () => props.modelValue,
  (newVal) => {
    if (localDescription.value !== newVal) {
      localDescription.value = newVal
    }
  }
)

// 监听本地值变化，向外部发送更新事件
watch(localDescription, (newVal) => {
  if (props.modelValue !== newVal) {
    emit('update:modelValue', newVal)
  }
})

// 监听图片URL变化，重置加载状态
watch(
  () => props.imageUrl,
  (_newVal) => {
    imageLoaded.value = false
  }
)

// 处理图片加载完成
const handleImageLoad = () => {
  imageLoaded.value = true
}

// 开始拖拽
const startDrag = (event: MouseEvent | TouchEvent) => {
  if (!props.enableDrag || !props.tagText) return

  event.preventDefault()
  event.stopPropagation()

  const isTouchEvent = (e: MouseEvent | TouchEvent): e is TouchEvent =>
    'touches' in e && !!e.touches.length

  const clientX = isTouchEvent(event) ? event.touches[0].clientX : event.clientX
  const clientY = isTouchEvent(event) ? event.touches[0].clientY : event.clientY

  isDragging.value = true
  dragStartX.value = clientX
  dragStartY.value = clientY
  dragOffsetX.value = 0
  dragOffsetY.value = 0

  // 添加全局事件监听
  if (typeof window !== 'undefined') {
    window.addEventListener('touchmove', handleGlobalTouchMove, {
      passive: false,
    })
    window.addEventListener('touchend', handleGlobalTouchEnd)
    window.addEventListener('mousemove', handleGlobalMouseMove)
    window.addEventListener('mouseup', handleGlobalMouseUp)
  }

  emit('drag-start', {
    index: props.index,
    startX: clientX,
    startY: clientY,
    imageType: props.imageType,
    imageName: props.imageName,
  })
}

// 全局触摸移动
const handleGlobalTouchMove = (event: TouchEvent) => {
  if (!isDragging.value) return

  const currentX = event.touches[0].clientX
  const currentY = event.touches[0].clientY

  dragOffsetX.value = currentX - dragStartX.value
  dragOffsetY.value = currentY - dragStartY.value

  emit('drag-move', {
    index: props.index,
    offsetX: dragOffsetX.value,
    offsetY: dragOffsetY.value,
    imageType: props.imageType,
    imageName: props.imageName,
  })
}

// 全局触摸结束
const handleGlobalTouchEnd = (event: TouchEvent) => {
  if (!isDragging.value) return
  event.preventDefault()
  endDrag()
}

// 全局鼠标移动
const handleGlobalMouseMove = (event: MouseEvent) => {
  if (!isDragging.value) return
  event.preventDefault()

  dragOffsetX.value = event.clientX - dragStartX.value
  dragOffsetY.value = event.clientY - dragStartY.value

  emit('drag-move', {
    index: props.index,
    offsetX: dragOffsetX.value,
    offsetY: dragOffsetY.value,
    imageType: props.imageType,
    imageName: props.imageName,
  })
}

// 全局鼠标抬起
const handleGlobalMouseUp = (event: MouseEvent) => {
  if (!isDragging.value) return
  event.preventDefault()
  endDrag()
}

// 结束拖拽
const endDrag = () => {
  if (!isDragging.value) return

  isDragging.value = false
  dragOffsetX.value = 0
  dragOffsetY.value = 0

  // 移除全局事件监听
  if (typeof window !== 'undefined') {
    window.removeEventListener('touchmove', handleGlobalTouchMove)
    window.removeEventListener('touchend', handleGlobalTouchEnd)
    window.removeEventListener('mousemove', handleGlobalMouseMove)
    window.removeEventListener('mouseup', handleGlobalMouseUp)
  }

  emit('drag-end', {
    index: props.index,
    imageType: props.imageType,
    imageName: props.imageName,
  })
}

// 触摸开始
const handleTouchStart = (event: TouchEvent) => {
  if (!props.enableDrag || !props.tagText) return
  startDrag(event)
}

// 触摸移动
const handleTouchMove = (_event: TouchEvent) => {
  if (!isDragging.value) return
}

// 触摸结束
const handleTouchEnd = (_event: TouchEvent) => {
  if (!isDragging.value) return
}

// 鼠标按下
const handleMouseDown = (event: MouseEvent) => {
  if (!props.enableDrag || !props.tagText) return
  startDrag(event)
}

// 鼠标移动
const handleMouseMove = (_event: MouseEvent) => {
  // 这个事件现在由全局事件处理
}

// 鼠标抬起
const handleMouseUp = (_event: MouseEvent) => {
  // 这个事件现在由全局事件处理
}

// 鼠标离开
const handleMouseLeave = (_event: MouseEvent) => {
  // 这个事件现在由全局事件处理
}

// 处理输入事件
const handleInput = (event: Event) => {
  const target = event.target as HTMLTextAreaElement | null
  const value = target?.value ?? localDescription.value
  emit('input', {
    value,
    imageType: props.imageType,
    imageName: props.imageName,
  })
}

// 处理获得焦点事件
const handleFocus = (event: Event) => {
  emit('focus', {
    imageType: props.imageType,
    imageName: props.imageName,
    event,
  })
}

// 处理失去焦点事件
const handleBlur = (event: Event) => {
  emit('blur', {
    value: localDescription.value,
    type: props.imageType,
    position: props.imageName,
    event,
  })
}

// 处理清空内容
// 处理清空内容（目前未在模板中直接使用，保留以兼容外部可能的调用）
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const handleClear = () => {
  localDescription.value = ''
  emit('clear', {
    type: props.imageType,
    position: props.imageName,
  })
}

// 处理运镜
const handleMovement = (type: string, position: string) => {
  emit('movement', {
    type,
    position,
  })
}

// 防抖：防止快速重复点击
let uploadTimer: ReturnType<typeof setTimeout> | null = null

// 处理上传
const handleUpload = (type: string, position: string) => {
  // 清除之前的定时器
  if (uploadTimer) {
    return
  }

  // 立即触发上传事件
  emit('upload', {
    type,
    position,
  })

  // 设置300ms防抖
  uploadTimer = setTimeout(() => {
    uploadTimer = null
  }, 300)
}

// 处理替换下拉菜单命令
const handleReplaceCommand = (command: string) => {
  if (command === 'upload') {
    // 本地上传
    emit('replace', {
      type: props.imageType,
      position: props.imageName,
    })
  } else if (command === 'history' && props.enableHistoryReplace) {
    // 历史创作
    emit('show-history', {
      type: props.imageType,
      position: props.imageName,
    })
  }
}
// 处理删除
const handleDelete = (type: string, position: string) => {
  emit('delete', {
    type,
    position,
  })
}

// 处理分类选择
const handleSelection = (type: string, position: string) => {
  emit('selection', {
    type,
    position,
    cateName: props.cateName,
  })
}

// 处理库选择
const handleLibrarySelection = (type: string, position: string) => {
  emit('library-selection', {
    type,
    position,
    libraryName: props.libraryName,
  })
}

// 显示历史创作弹窗
const handleShowHistory = () => {
  if (!props.showHistoryTip) return
  emit('show-history', {
    type: props.imageType,
    position: props.imageName,
  })
}

// 组件卸载时清理定时器
onBeforeUnmount(() => {
  if (uploadTimer) {
    clearTimeout(uploadTimer)
    uploadTimer = null
  }
})
</script>

<style lang="scss" scoped>
/* 图片上传区域 */
.image-upload-area {
  position: relative;
  transition: all 0.3s ease;
  background-color: var(--bg-card);
  border-radius: var(--radius-sm);
  overflow: clip; // 使用 clip 代替 hidden，避免影响拖拽
  box-sizing: border-box;
  border: 2px solid transparent; // 默认透明边框，防止dragging时尺寸变化

  &.dragging {
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    z-index: 1000;
    border-color: var(--primary-color);
    border-style: dashed;
  }
}

/* 图片上传区域 */
.upload-area {
  position: relative;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;

  // 只在没有图片时显示手型光标
  &:not(:has(.uploaded-image)) {
    cursor: pointer;
  }

  .upload-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    text-align: center;

    .upload-icon-wrapper {
      .upload-icon {
        width: 22px;
        height: 22px;
        object-fit: contain;
      }
    }
    .placeholder-text {
      font-size: var(--font-sm);
      color: var(--text-primary);
      font-weight: 400;
    }

    .placeholder-text-box {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: center;
      margin-top: var(--spacing-xs);
      gap: var(--spacing-xs);
      font-size: var(--font-xs);
      text-align: center;

      span {
        &:nth-child(1),
        &:nth-child(3) {
          color: var(--text-placeholder);
        }

        &:nth-child(2) {
          color: var(--primary-color);
          cursor: pointer;
        }

        &:nth-child(4) {
          color: var(--text-agree);
        }
      }
    }
  }

  .uploaded-image {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden; // 防止图片溢出

    :deep(.uploaded-img) {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 0;
      // 图片未加载完成时隐藏，避免闪烁
      opacity: 0;
      transition: opacity 0.3s ease-in-out;

      &.img-loaded {
        opacity: 1;
      }

      img {
        object-fit: contain !important;
        border-radius: 0;
        // 限制图片尺寸，防止撑满
        max-width: 100% !important;
        max-height: 100% !important;
        width: auto !important;
        height: auto !important;
        user-select: none;
        -webkit-user-drag: none;
      }
    }
  }

  // 片段/排序
  .upload-sort {
    position: absolute;
    left: 0;
    top: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 6px 0 6px 12px;
    z-index: 9;
    user-select: none;

    .tag {
      background: rgba(7, 7, 7, 0.8) !important;
      border: none !important;
      color: white !important;
      backdrop-filter: blur(8px);
      padding: 6px 12px !important;
      font-size: 13px !important;
    }

    .drag-handle {
      cursor: move;
      transition: all 0.3s ease;

      &:hover {
        transform: scale(1.1);
      }
    }
  }

  // 视角文案
  .uploaded-angle {
    position: absolute;
    right: 12px;
    top: 12px;
    z-index: 9;
  }

  // 库选择（左上角，参考样式：黑色背景，白色文字，右箭头）
  .uploaded-library {
    position: absolute;
    left: 0;
    top: 0;
    z-index: 9;
    cursor: pointer;
    background-color: #000000 !important;
    border: none !important;
    border-radius: var(--radius-sm) 0 var(--radius-sm) 0 !important;
    padding: 6px 12px 6px 12px !important;
    display: flex;
    align-items: center;
    gap: 4px;
    transition: background-color 0.2s ease;

    &:hover {
      background-color: rgba(0, 0, 0, 0.9) !important;
    }

    .library-name-text {
      font-size: 13px;
      color: #ffffff;
      font-weight: 400;
      white-space: nowrap;
    }

    .library-arrow-icon {
      width: 14px;
      height: 14px;
      object-fit: contain;
      flex-shrink: 0;
    }
  }

  // 分类选择（右上角，保留原有功能）
  .uploaded-cate {
    position: absolute;
    right: 12px;
    top: 12px;
    z-index: 9;
    cursor: pointer;
    background-color: var(--primary-dark) !important;
    border: none !important;
    padding: 7px 6px 8px 12px !important; // 左右padding平衡

    .arrow-rotated {
      transform: rotate(180deg);
      transition: transform 0.3s ease;
    }

    .arrow-normal {
      transform: rotate(0deg);
      transition: transform 0.3s ease;
    }
  }

  // 替换删除
  .upload-action {
    position: absolute;
    left: 0;
    bottom: 0;
    width: 100%;
    height: 40px;
    background: rgba(32, 27, 38, 0.8);
    border-radius: 0 0 var(--radius-sm) var(--radius-sm);
    z-index: 2;
    display: flex;
    align-items: center;

    .action-dropdown {
      flex: 1;
      display: flex;
      height: 100%;
      outline: none !important;

      &:focus,
      &:focus-visible {
        outline: none !important;
      }
    }

    .action-button {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--spacing-xs);
      height: 100%;
      color: #fff;
      font-size: var(--font-xs);
      outline: none !important;

      &:hover {
        cursor: pointer;
      }

      &:focus,
      &:focus-visible {
        outline: none !important;
      }
    }

    .action-divider {
      height: 18px;
      margin: 0;
      border-color: var(--bg-tertiary);
    }
  }
}

// 有描述区域时，上传区域只显示上方圆角
.image-upload-area.has-description {
  .upload-area {
    border-radius: var(--radius-sm) var(--radius-sm) 0 0;
  }
}
</style>
