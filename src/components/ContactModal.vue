<template>
  <el-dialog v-model="dialogVisible" width="420px" :close-on-click-modal="false" :show-close="false"
    class="contact-modal">
    <div class="modal-container">
      <!-- 关闭按钮 -->
      <div class="close-btn-wrapper flex justify-end">
        <img :src="images.closeCustomer" :alt="t('components.contactModal.title')" class="close-btn"
          @click="handleClose" />
      </div>

      <!-- 弹窗标题 -->
      <div class="modal-header">
        <h2 class="modal-title">{{ t('components.contactModal.title') }}</h2>
        <p class="modal-subtitle">{{ t('components.contactModal.subtitle') }}</p>
      </div>

      <!-- 弹窗内容 -->
      <div class="modal-body">
        <!-- 二维码区域 -->
        <div class="qrcode-wrapper">
          <!-- 客服二维码图片 -->
          <img :src="customerCodeSrc" :alt="t('components.contactModal.qrcodeAlt')" class="qrcode-img" />
        </div>

        <p class="contact-tip">{{ t('components.contactModal.tip') }}</p>
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ElDialog } from 'element-plus'
import { useI18n } from 'vue-i18n'
import { images } from '@/assets'
interface Props {
  modelValue: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const { t } = useI18n()

// 和 v-model:dialogVisible 双向绑定
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val: boolean) => {
    emit('update:modelValue', val)
  },
})

// 客服二维码：暂时使用本地静态资源，后续可接平台配置
const customerCodeSrc = computed(() => images.wechatCode1)

const handleClose = () => {
  emit('update:modelValue', false)
}
</script>

<style lang="scss" scoped>
// 弹窗容器
.modal-container {
  padding-bottom: 61px;
  border-radius: 16px;

  // 关闭按钮
  .close-btn-wrapper {
    padding: 28px 26px 0 0;

    .close-btn {
      width: 32px;
      height: 32px;
      cursor: pointer;
    }
  }

  // 弹窗头部
  .modal-header {
    text-align: center;
    margin: $spacing-md 0 49px;

    .modal-title {
      font-size: $font-size-3xl;
      font-family: PingFangSC-regular;
      color: $color-primary;
      margin-bottom: $spacing-sm;
    }

    .modal-subtitle {
      font-size: $font-size-md;
      color: $color-text-gray;
    }
  }

  // 弹窗主体
  .modal-body {
    display: flex;
    flex-direction: column;
    align-items: center;

    .qrcode-wrapper {
      width: 200px;
      height: 200px;
      transition: all 0.3s ease;
      margin-bottom: $spacing-xl-sm;

      .qrcode-img {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }
    }

    .contact-tip {
      font-size: $font-size-base;
      color: $color-text-gray;
      text-align: center;
    }
  }
}
</style>

<style lang="scss">
.el-dialog.contact-modal {
  font-family: -regular;

  .el-dialog__header {
    display: none;
    padding: 0;
  }
}
</style>
