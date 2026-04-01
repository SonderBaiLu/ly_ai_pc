<template>
  <el-dialog v-model="visible" :width="variant === 'more' ? '800px' : '480px'" :close-on-click-modal="false"
    :show-close="false" class="watermark-disclaimer-modal" @close="handleCancel">
    <div class="modal-container" :class="{ 'modal-container--more': variant === 'page' }">
      <!-- 右上角关闭 -->
      <div class="close-btn-wrapper flex justify-end" @click="handleCancel" v-if="variant === 'more'">
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

      <!-- 更多里面打开显示这个 底部：开关 + 保存 -->
      <div v-if="variant === 'more'" class="modal-footer">
        <div class="left">
          <el-switch v-model="removeWatermarkEnabled" active-color="#17A0E1" inactive-color="#9CA3AF" :disabled="!isVip"
            @click="handleMoreSwitchClick" />
          <div class="toggle-content">
            <h3 class="toggle-title">{{ t('components.watermarkDisclaimerModal.removeWatermarkTitle') }}</h3>
            <p class="toggle-desc">{{ t('components.watermarkDisclaimerModal.removeWatermarkDesc1') }}</p>
            <p class="toggle-desc">{{ t('components.watermarkDisclaimerModal.removeWatermarkDesc2') }}</p>
          </div>
        </div>

        <div class="right flex justify-end">
          <el-button class="save-btn" type="primary" @click="handleConfirm('保存成功')">
            {{ t('components.watermarkDisclaimerModal.save') }}
          </el-button>
        </div>
      </div>

      <!-- 其他地方打开这个弹窗显示这个 -->
      <!-- 操作按钮 -->
      <div v-else class="modal-footer flex justify-center">
        <el-button class="cancel-btn" @click="handleCancel">取消</el-button>
        <el-button class="confirm-btn" type="primary" @click="handleConfirm('确认成功')" :disabled="!isVip">确认</el-button>
      </div>

      <!-- 不再弹窗提醒选项 -->
      <div v-if="variant === 'page'" class="no-remind-option" @click="toggleNoRemind">
        <img class="no-remind-icon" :src="noRemind ? images.checkActive : images.checkNo" alt="" />
        <span>不再弹窗提醒</span>
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ElDialog } from 'element-plus'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { images } from '@/assets'
import { toRefs } from 'vue'
import { useModalStore } from '@/stores/modal'
import { useUserStore } from '@/stores/user'
import { userLanguageToI18nLocale } from '@/i18n'

interface Props {
  modelValue: boolean
  /**
   * more：更多入口样式（底部：开关 + 保存）
   * page：其它页面样式（底部：取消/确认 + 不再提醒）
   */
  variant?: 'more' | 'page'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'more',
})
const { variant } = toRefs(props)
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  confirm: []
  cancel: []
  'no-remind-change': [value: boolean]
}>()

const { t, locale } = useI18n({ useScope: 'local' })

const modalStore = useModalStore()
const userStore = useUserStore()
const router = useRouter()

// 个人中心弹窗：只跟随用户偏好语言，避免被全局 i18n locale 覆盖
watch(
  () => userStore.userInfo?.language,
  (userLang) => {
    locale.value = userLanguageToI18nLocale(userLang)
  },
  { immediate: true },
)

const isVip = computed(() => Number(userStore.userInfo?.vipLevel ?? 0) > 0)

const visible = computed({
  get: () => props.modelValue,
  set: (val: boolean) => emit('update:modelValue', val),
})

// more 入口：开关用于“去除水印”授权（回显/保存均由后端 watermarkStatus 决定）
// 后端字段语义：watermarkStatus 1=去除水印开启（无水印），0=水印开启
const removeWatermarkEnabled = ref(userStore.userInfo?.watermarkStatus == 1 ? true : false)

const syncRemoveWatermarkEnabledFromStore = () => {
  // 依赖 userStore.userInfo 的响应式变化：每次弹窗打开时强制同步，避免全局弹窗“常驻导致状态过期”
  removeWatermarkEnabled.value = userStore.userInfo?.watermarkStatus == 1 ? true : false
}

watch(
  visible,
  (v) => {
    if (v) syncRemoveWatermarkEnabledFromStore()
  },
  { immediate: false },
)
// page / more 入口：不再弹窗提醒
const noRemind = ref(localStorage.getItem('watermark_disclaimer_no_remind') === 'true')

// 不再弹窗提醒点击切换
const toggleNoRemind = () => {
  noRemind.value = !noRemind.value
  localStorage.setItem('watermark_disclaimer_no_remind', noRemind.value ? 'true' : 'false')
  emit('no-remind-change', noRemind.value)
}
// 取消按钮点击
const handleCancel = () => {
  visible.value = false
  modalStore.notifyWatermarkDisclaimerCancelled()
  emit('cancel')
}
// 确认按钮点击
const handleConfirm = async (successMessage: '保存成功' | '确认成功') => {
  // 确认时：只关闭弹窗并触发“确认”token；不要复用 handleCancel()
  // 否则会误触发“取消”token，影响其它页面 pending 状态。
  visible.value = false
  await userStore.updateUserInfo({ watermarkStatus: removeWatermarkEnabled.value ? 1 : 0 }, successMessage)
  modalStore.notifyWatermarkDisclaimerConfirmed()
  emit('confirm')
}
// 非会员跳转会员
const handleMoreSwitchClick = () => {
  if (!isVip.value) {
    // 非会员：去除水印被禁用，点击引导去开通会员页
    router.push('/membership?tab=0')
  }
}
</script>

<style lang="scss" scoped>
// 弹窗容器
.modal-container {
  padding: 59px 85px;
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  color: $color-text-white;

  &.modal-container--more {
    padding: 21px 15px 19px;

    .modal-body {
      margin-bottom: 26px !important;
      line-height: 17px !important;
    }

    .content-text {
      font-size: $font-size-sm !important;
    }
  }

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

    .cancel-btn,
    .confirm-btn {
      width: 130px;
      height: 26px;
      margin: 0;
    }

    .cancel-btn {
      border: 1px solid rgba(150, 221, 255, 1);
      margin-right: 6px;
    }
  }

  // 不再弹窗提醒选项
  .no-remind-option {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 3px;
    margin-top: 23px;
    color: $color-text-white;
    font-size: $font-size-xxs;
    cursor: pointer;
    user-select: none;

    .no-remind-icon {
      width: 11px;
      height: 11px;
      object-fit: contain;
      flex-shrink: 0;
    }
  }
}
</style>

<style lang="scss">
.el-dialog.watermark-disclaimer-modal {

  .modal-container {
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 16px;
    overflow: hidden;
  }

  .modal-container--more {
    border: 1px solid rgba(255, 255, 255, 0.04);
  }

  .el-dialog__header {
    display: none;
    padding: 0;
  }

  .el-dialog__body {
    padding: 0;
  }
}
</style>
