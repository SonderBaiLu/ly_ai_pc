<template>
  <el-dialog v-model="visible" width="800px" :close-on-click-modal="false" :show-close="false"
    class="watermark-disclaimer-modal" @close="handleClose">
    <div class="modal-container">
      <!-- 右上角关闭 -->
      <div class="close-btn-wrapper flex justify-end" @click="handleClose">
        <img class="close-btn" :src="images.closeDialog" :alt="t('components.watermarkDisclaimerModal.closeAlt')" />
      </div>

      <!-- 弹窗标题 -->
      <div class="modal-header">
        <h2 class="modal-title">{{ t('components.watermarkDisclaimerModal.title') }}</h2>
      </div>

      <!-- 内容 -->
      <div class="modal-body">
        <div class="content-text">
          <div>{{ t('components.watermarkDisclaimerModal.greeting') }}</div>
          <p>
            {{ t('components.watermarkDisclaimerModal.p1') }}
          </p>
          <p>
            {{ t('components.watermarkDisclaimerModal.p2') }}
          </p>
          <p>
            {{ t('components.watermarkDisclaimerModal.p3') }}
          </p>
          <p>
            {{ t('components.watermarkDisclaimerModal.p4') }}
          </p>
          <p class="thanks">{{ t('components.watermarkDisclaimerModal.thanks') }}</p>
        </div>
      </div>

      <!-- 底部：开关 + 保存 -->
      <div class="modal-footer">
        <div class="left">
          <el-switch v-model="noRemind" active-color="#17A0E1" inactive-color="##9CA3AF"
            @change="handleNoRemindChange" />
          <div class="toggle-content">
            <h3 class="toggle-title">{{ t('components.watermarkDisclaimerModal.removeWatermarkTitle') }}</h3>
            <p class="toggle-desc">{{ t('components.watermarkDisclaimerModal.removeWatermarkDesc1') }}</p>
            <p class="toggle-desc">{{ t('components.watermarkDisclaimerModal.removeWatermarkDesc2') }}</p>
          </div>
        </div>

        <div class="right flex justify-end">
          <el-button class="save-btn" type="primary" @click="handleConfirm">
            {{ t('components.watermarkDisclaimerModal.save') }}
          </el-button>
        </div>
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
  confirm: []
  cancel: []
  'no-remind-change': [value: boolean]
}>()

const { t } = useI18n()

const visible = computed({
  get: () => props.modelValue,
  set: (val: boolean) => emit('update:modelValue', val),
})

const noRemind = ref(false)

const handleClose = () => {
  emit('cancel')
  visible.value = false
}

const handleConfirm = () => {
  emit('confirm')
  visible.value = false
}

const handleNoRemindChange = (val: string | number | boolean) => {
  emit('no-remind-change', Boolean(val))
}
</script>

<style lang="scss" scoped>
// 弹窗容器
.modal-container {
  padding: 59px 85px;
  position: relative;
  color: $color-text-white;

  .close-btn-wrapper {
    position: absolute;
    top: 32px;
    right: 32px;

    .close-btn {
      width: 32px;
      height: 32px;
      cursor: pointer;
    }
  }

  // 弹窗头部
  .modal-header {
    text-align: center;
    margin-bottom: 9px;

    .modal-title {
      font-size: $font-size-xl;
      font-family: NotoSans-bold;
      font-weight: bold;
    }
  }

  // 弹窗主体
  .modal-body {
    flex: 1;
    overflow-y: auto;
    margin-bottom: 50px;

    .content-text {
      font-size: $font-size-base;
      line-height: 23px;
      font-family: NotoSans-regular;

      p {
        text-indent: 2em;
      }
    }
  }

  // 操作按钮
  .modal-footer {

    .left {
      display: flex;

      .toggle-content {
        margin: 2px 0 0 6px;

        .toggle-title {
          margin-bottom: 6px;
          font-size: $font-size-base;
          font-weight: bold;
        }
      }

      .toggle-desc {
        font-size: $font-size-sm;
        color: $color-text-gray;
      }
    }

    .right {
      margin-top: 36px;

      .save-btn {
        width: 204px;
        height: 50px;
        border-radius: 12px 12px 12px 12px;
        background: radial-gradient(0.5% 0.5% at 50% 50%, rgba(23, 160, 225, 1) 0%, rgba(112, 197, 237, 1) 100%);
        font-size: $font-size-base;
        text-align: center;
        font-family: NotoSans-regular;
      }
    }
  }
}
</style>

<style lang="scss">
.el-dialog.watermark-disclaimer-modal {
  .el-dialog__header {
    display: none;
    padding: 0;
  }

  .el-dialog__body {
    padding: 0;
  }
}
</style>
