<template>
  <div class="image-upload-area" :class="{ dragging: isDragging }">
    <!-- 图片上传区域 -->
    <div class="upload-area" :style="{ width: areaWidth, height: areaHeight }" @dragover.prevent="handleDragOver"
      @dragleave.prevent="handleDragLeave" @drop.prevent="handleDrop"
      @click="!imageUrl && !showLoading && handleUpload(imageType, imageName)">
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
            <span>选择，</span>
            <span v-if="historyMaxCount > 1">最多可选择{{ historyMaxCount }}张，</span>
            <span v-if="historyMinSizeKB && historyMaxSizeMB">文件大小{{ historyMinSizeKB }}KB - {{ historyMaxSizeMB
              }}MB之间，</span>
            <span v-if="historyMinResolution">分辨率大于{{ historyMinResolution }}，</span>
          </div>
          <div class="placeholder-text-box" v-if="historyFormats && showHistoryTip">
            <span>格式支持{{ historyFormats.join('/') }}</span>
          </div>
        </template>
        <!-- 上传中状态 -->
        <el-icon class="is-loading uploading-icon" v-if="showLoading">
          <Loading />
        </el-icon>
        <span class="uploading-text" v-if="showLoading">{{ loadingText }}</span>
      </div>

      <div v-if="imageUrl" class="uploaded-image">
        <!-- 已上传的图片 -->
        <el-image :src="imageUrl" fit="contain" class="uploaded-img" :class="{ 'img-loaded': imageLoaded }"
          :preview-src-list="clickable ? [imageUrl] : []" :initial-index="0" :preview-teleported="true"
          :hide-on-click-modal="true" :z-index="3000" @dragstart.prevent @load="handleImageLoad" />
        <!-- 操作按钮 -->
        <div v-if="showActions" class="upload-action">
          <!-- 替换按钮（带下拉菜单） -->
          <el-dropdown class="action-dropdown" trigger="hover" placement="top" popper-class="replace-dropdown-menu"
            @command="handleReplaceCommand">
            <div class="action-button">
              <el-image :src="images.replace" fit="contain" style="width: 16px; height: 16px" />
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
            <el-image :src="images.delete" fit="contain" style="width: 16px; height: 16px" />
            <span>删除</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { images } from '@/assets'
import { ElMessage } from 'element-plus'
import { Loading } from '@element-plus/icons-vue'

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
    default: '109px',
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
  // 是否显示“历史创作”文案/入口
  showHistoryTip: {
    type: Boolean,
    default: true,
  },
  // 历史创作：最多选择几张
  historyMaxCount: {
    type: Number,
    default: 6,
  },
  // 历史创作：文件大小下限（KB）
  historyMinSizeKB: {
    type: Number,
    default: 20,
  },
  // 历史创作：文件大小上限（MB）
  historyMaxSizeMB: {
    type: Number,
    default: 30,
  },
  // 历史创作：最小分辨率
  historyMinResolution: {
    type: String,
    default: '400*400',
  },
  // 历史创作：允许的格式（用于展示）
  historyFormats: {
    type: Array as () => string[],
    default: () => ['jpg', 'jpeg', 'png', 'webp'],
  },
  // 是否允许在替换菜单里显示历史创作
  enableHistoryReplace: {
    type: Boolean,
    default: true,
  },
})

// 定义事件
const emit = defineEmits([
  'upload', // 上传图片
  'replace', // 替换图片
  'delete', // 删除图片
  'preview', // 预览图片
  'update:imageUrl', // 更新图片URL
  'show-history', // 显示历史创作弹窗
  'drop-file', // 拖拽文件上传
])

// NOTE: 描述输入区已移除，这里不再维护 description 相关状态

// 图片加载状态
const imageLoaded = ref(false)

const isDragging = ref(false)

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

  // 其次处理从"我的创作"拖过来的 JSON 数据（application/json）
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
          // 从“我的创作/缩略图”拖拽过来时，认为是历史创作图片，需要把 id 透传出去
          // 统一命名为 taskResultId，提交时组装 historyParams 使用
          taskResultId: data.id,
          type: props.imageType,
          position: props.imageName,
          fileType: data.fileType, // 传递文件类型，让父组件也能判断
        })
        return
      }
    } catch (error) {
      console.error('[ImageUploadArea] 解析拖拽创作失败:', error)
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

// 防抖：防止快速重复点击
let uploadTimer: ReturnType<typeof setTimeout> | null = null

// 打开本地文件选择器，并把结果透传为 drop-file
const openLocalUploadPicker = (type: string, position: string) => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.multiple = false
  input.onchange = (e: any) => {
    const file: File | undefined = e?.target?.files?.[0]
    if (!file) return
    emit('drop-file', { file, type, position })
  }
  input.click()
}

// 处理上传（本地上传）
const handleUpload = (type: string, position: string) => {
  if (uploadTimer) return
  openLocalUploadPicker(type, position)
  uploadTimer = setTimeout(() => {
    uploadTimer = null
  }, 300)
}

// 处理替换下拉菜单命令
const handleReplaceCommand = (command: string) => {
  if (command === 'upload') {
    // 本地上传（替换已上传图片）
    openLocalUploadPicker(props.imageType, props.imageName)
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
  background-color: $color-bg-black;
  border-radius: $spacing-sm;
  overflow: clip; // 使用 clip 代替 hidden，避免影响拖拽
  box-sizing: border-box;
  border: 2px dashed transparent; // 默认透明边框，防止dragging时尺寸变化

  &.dragging {
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    z-index: 1000;
    border-color: $color-primary-dark;
    border-style: dashed;
  }
}

/* 图片上传区域 */
.upload-area {
  position: relative;
  height: 109px;
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
    border: 2px dashed rgba(255, 255, 255, 0.15);
    border-radius: $spacing-sm;
    background-color: $color-bg-black-secondary;
    text-align: center;
    color: $color-primary;

    .uploading-icon {
      margin-bottom: 7px;
      font-size: $font-size-2xl;
    }

    .uploading-text {
      font-size: $font-size-md;
    }

    .upload-icon-wrapper {
      .upload-icon {
        width: 22px;
        height: 22px;
        margin-bottom: 7px;
        object-fit: contain;
      }
    }

    .placeholder-text {
      font-size: $font-size-md;
      color: $color-text-gray;
    }

    .placeholder-text-box {
      margin-top: 6px;
      font-size: $font-size-xxs;
      text-align: center;
      color: $color-text-tip;

      .history-link {
        color: $color-primary-dark;
        cursor: pointer;
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
      border: 2px dashed rgba(255, 255, 255, 0.15);
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

  // 替换删除
  .upload-action {
    position: absolute;
    left: 0;
    bottom: 0;
    width: 100%;
    height: 40px;
    background-color: rgba(24, 24, 27, 0.2);
    border-radius: 0 0 $border-radius-sm $border-radius-sm;
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
      gap: $spacing-xs;
      height: 100%;
      color: $color-text-white;
      font-size: $font-size-xs;
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
      border-color: rgba($color-text-white, 0.15);
    }
  }
}
</style>
