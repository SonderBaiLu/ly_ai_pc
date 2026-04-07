<template>
  <el-dialog v-model="dialogVisible" :width="width" :close-on-click-modal="true" :show-close="false"
    :close-on-press-escape="true" class="image-preview-modal" :append-to-body="appendToBody">
    <template #header>
      <div class="preview-header">
        <h2 class="preview-title">{{ title }}</h2>
        <img :src="images.closeDialog" alt="" class="header-close" @click="handleClose" />
      </div>
    </template>
    <div class="preview-content">
      <div class="preview-header-actions">
        <!-- 下载按钮 -->
        <img v-if="showDownload" :src="downloadIcon" alt="下载" class="preview-action-icon" @click="handleDownload" />
        <!-- 删除按钮 -->
        <img v-if="showDelete" :src="deleteIcon" alt="删除" class="preview-action-icon" @click="handleDelete" />
        <!-- 自定义操作按钮插槽 -->
        <slot name="header-actions"></slot>
      </div>
      <!-- 套图预览：展示多张图片 -->
      <template v-if="imageSetList && imageSetList.length > 0">
        <div class="preview-set-grid">
          <LazyImage v-for="(img, index) in imageSetList" :key="img.id || index" :src="img.imgUrl || img.imageUrl || ''"
            width="100%" height="400px" object-fit="contain" class="preview-set-image" />
        </div>
      </template>
      <!-- 普通预览：单张图片 -->
      <template v-else>
        <div class="preview-image-wrapper">
          <LazyImage :src="imageSrc" width="100%" height="400px" object-fit="contain" :border-radius="8"
            class="preview-image" :lazy="false" />
          <!-- 选中状态标记 -->
          <div v-if="showSelectedBadge && isSelected" class="preview-selected-badge">
            <el-icon>
              <Check />
            </el-icon>
            <span>已选中</span>
          </div>
        </div>
      </template>

      <!-- 预览名称：受 showName 控制 -->
      <p v-if="showName && name" class="preview-name">{{ name }}</p>

      <!-- 额外信息 -->
      <div v-if="extraInfo && Object.keys(extraInfo).length > 0" class="preview-info">
        <p v-if="extraInfo.createTime" class="preview-time">创建时间：{{ extraInfo.createTime }}</p>
        <p v-if="extraInfo.prompt" class="preview-desc">描述：{{ extraInfo.prompt }}</p>
        <p v-if="extraInfo.desc" class="preview-desc">{{ extraInfo.desc }}</p>
      </div>
    </div>

    <template #footer>
      <div class="preview-footer">
        <el-button @click="handleClose">{{ cancelText }}</el-button>
        <el-button v-if="showConfirmButton" :type="confirmButtonType" @click="handleConfirm">
          {{ confirmText }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { Check } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { images } from '@/assets'

interface ImageItem {
  id?: string | number
  imgUrl?: string
  imageUrl?: string
  [key: string]: any
}

interface ExtraInfo {
  createTime?: string
  prompt?: string
  desc?: string
  [key: string]: any
}

interface Props {
  modelValue: boolean
  title?: string
  width?: string | number
  // 图片源（单张图片）
  imageSrc?: string
  // 套图列表
  imageSetList?: ImageItem[]
  // 名称
  name?: string
  // 是否显示名称
  showName?: boolean
  // 额外信息
  extraInfo?: ExtraInfo
  // 是否显示选中状态标记
  showSelectedBadge?: boolean
  // 是否已选中
  isSelected?: boolean
  // 是否显示确认按钮
  showConfirmButton?: boolean
  // 确认按钮文本
  confirmText?: string
  // 取消按钮文本
  cancelText?: string
  // 确认按钮类型
  confirmButtonType?: 'primary' | 'danger' | 'success' | 'warning' | 'info'
  // 是否追加到 body
  appendToBody?: boolean
  // 是否显示下载按钮
  showDownload?: boolean
  // 是否显示删除按钮
  showDelete?: boolean
  // 图片数据（用于下载和删除）
  imageData?: {
    id?: string | number
    imgUrl?: string
    imageUrl?: string
    name?: string
    imgDesc?: string
    [key: string]: any
  }
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  title: '图片预览',
  width: '800px',
  imageSrc: '',
  imageSetList: undefined,
  name: '',
  showName: false,
  extraInfo: undefined,
  showSelectedBadge: false,
  isSelected: false,
  showConfirmButton: true,
  confirmText: '选择',
  cancelText: '取消',
  confirmButtonType: 'primary',
  appendToBody: true,
  showDownload: false,
  showDelete: false,
  imageData: undefined,
})

const downloadIcon = images.download
const deleteIcon = images.del

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'confirm'): void
  (e: 'close'): void
  (e: 'download'): void
  // 删除确认后交给父组件处理（例如调用 algoApi.del）
  (e: 'deleted'): void
}>()

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

const handleClose = () => {
  dialogVisible.value = false
  emit('close')
}

const handleConfirm = () => {
  emit('confirm')
}

// 下载图片
const handleDownload = async () => {
  const imageUrl = props.imageData?.imgUrl || props.imageData?.imageUrl || props.imageSrc || ''
  if (!imageUrl) {
    ElMessage.warning('图片地址无效')
    return
  }

  try {
    const { downloadFile } = await import('@/utils/download')
    const name = props.imageData?.name || props.imageData?.imgDesc || props.name || ''
    // 如果是"未命名"或没有名字，就不加名字部分
    const filename =
      name && name !== '未命名'
        ? `lingyan_${name}_${Date.now()}.png`
        : `lingyan_${Date.now()}.png`
    await downloadFile(imageUrl, filename)
    ElMessage.success('下载成功')
    emit('download')
  } catch (error) {
    console.error('下载失败:', error)
    ElMessage.error('下载失败，请重试')
  }
}

// 删除图片（仅负责交互和事件，不直接调用后端）
const handleDelete = async () => {
  if (!props.imageData?.id) {
    ElMessage.warning('无法获取图片ID')
    return
  }

  try {
    await ElMessageBox.confirm('确定要删除这张图片吗？删除后将无法恢复。', '删除创作确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
      customClass: 'creative-delete-confirm',
      confirmButtonClass: 'creative-delete-confirm-btn',
      cancelButtonClass: 'creative-delete-cancel-btn',
      showClose: false,
      closeOnClickModal: false,
      closeOnPressEscape: true,
      center: true,
    })

    // 仅发出事件，由父组件决定具体删除逻辑
    emit('deleted')
    dialogVisible.value = false
  } catch (error: any) {
    // 用户取消删除，不处理
    if (error === 'cancel' || error === 'close') {
      return
    }
    console.error('删除失败:', error)
    ElMessage.error(error?.message || '删除失败，请重试')
  }
}
</script>

<style lang="scss" scoped>
.image-preview-modal {
  border-radius: 16px;

  .preview-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px;

    .preview-title {
      font-size: $font-size-xl;
      color: $color-text-white;
      font-weight: $font-weight-semibold;
    }

    .header-close {
      width: 24px;
      height: 24px;
      cursor: pointer;
    }
  }

  .preview-content {
    text-align: center;

    .preview-header-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      padding: 0 20px 20px 20px;

      .preview-action-icon {
        width: 20px;
        height: 20px;
        cursor: pointer;
        transition: opacity 0.2s ease;

        &:hover {
          opacity: 0.7;
        }
      }
    }

    .preview-image-wrapper {
      position: relative;
      width: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .preview-image {
      max-width: 100%;
      max-height: 400px;
      object-fit: contain;
    }

    .preview-selected-badge {
      position: absolute;
      top: 12px;
      right: 12px;
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 6px 12px;
      background: rgba(0, 0, 0, 0.6);
      color: #fff;
      border-radius: 4px;
      font-size: 12px;
    }

    .preview-set-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      width: 100%;

      .preview-set-image {
        max-width: 100%;
        max-height: 400px;
        object-fit: contain;
      }
    }

    .preview-name {
      margin-top: var(--spacing-md);
      font-size: 14px;
      color: var(--el-text-color-primary);
      text-align: center;
      word-break: break-all;
    }

    .preview-info {
      width: 100%;
      padding: 12px;
      background: var(--el-bg-color-page);
      border-radius: 4px;

      .preview-time,
      .preview-desc {
        margin: 4px 0;
        font-size: 12px;
        color: var(--el-text-color-regular);
        line-height: 1.5;
      }
    }
  }

  .preview-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    padding: 24px 22px;

    :deep(.el-button) {
      width: 120px;
    }
  }
}
</style>
