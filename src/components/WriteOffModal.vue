<template>
  <el-dialog v-model="dialogVisible" width="800px" :close-on-click-modal="false" :close-on-press-escape="true"
    :show-close="false" class="write-off-modal" @close="handleClose">
    <div class="modal-header">
      <div class="header-title">{{ t('writeOffModal.title') }}</div>
      <div class="header-close" @click="handleClose">
        <img :src="images.closeDialog" alt="" />
      </div>
    </div>

    <div class="modal-content">
      <div class="content-text">
        {{ t('writeOffModal.desc1') }}
        <br />
        {{ t('writeOffModal.desc2') }}
      </div>

      <div class="delete-list">
        <div class="delete-item">
          <div class="delete-dot"></div>
          <div class="delete-content">
            <div class="delete-title">
              {{ t('writeOffModal.item1Title') }}
            </div>
            <div class="delete-desc">
              {{ t('writeOffModal.item1Desc') }}
            </div>
          </div>
        </div>
        <div class="delete-item">
          <div class="delete-dot"></div>
          <div class="delete-content">
            <div class="delete-title">
              {{ t('writeOffModal.item2Title') }}
            </div>
            <div class="delete-desc">
              {{ t('writeOffModal.item2Desc') }}
            </div>
          </div>
        </div>
        <div class="delete-item">
          <div class="delete-dot"></div>
          <div class="delete-content">
            <div class="delete-title">
              {{ t('writeOffModal.item3Title') }}
            </div>
            <div class="delete-desc">
              {{ t('writeOffModal.item3DescLine1') }}
            </div>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <el-button type="danger" class="confirm-btn" :disabled="!agreed" @click="handleConfirm">
          {{ t('writeOffModal.confirmButton') }}
        </el-button>
        <div class="agreement-check">
          <label class="checkbox-label" @click="agreed = !agreed">
            <img :src="agreed ? images.chooseActive : images.chosseNo" alt="" class="checkbox-icon" />
            <span class="agreement-text">
              {{ t('writeOffModal.agreementPrefix') }}
              <span class="agreement-link" @click.stop="goToAgreement">
                {{ t('writeOffModal.agreementLink') }}
              </span>
            </span>
          </label>
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { userApi } from '@/api/user'
import { images } from '@/assets'
import { enMessages, userLanguageToI18nLocale, zhMessages } from '@/i18n'

const { t, locale } = useI18n({
  useScope: 'local',
  // 与全局 i18n 隔离，避免首页导航语言覆盖该弹窗
  inheritLocale: false,
  messages: {
    'zh-chs': zhMessages,
    en: enMessages,
  },
})

interface Props {
  modelValue: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const router = useRouter()
const userStore = useUserStore()

// 个人中心弹窗：只跟随用户偏好语言，避免被全局 i18n locale 覆盖
watch(
  () => userStore.userInfo?.language,
  (userLang) => {
    locale.value = userLanguageToI18nLocale(userLang)
  },
  { immediate: true },
)

// 弹窗每次打开时再按用户偏好语言重置一次，保证始终与个人中心一致
watch(
  () => props.modelValue,
  (visible) => {
    if (visible) {
      locale.value = userLanguageToI18nLocale(userStore.userInfo?.language)
    }
  },
)

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const agreed = ref(false)

// 跳转到注销协议页面（新标签页打开）
const goToAgreement = () => {
  const routeData = router.resolve({
    path: '/agreement',
    query: { type: 'LOG_OFF_AGREEMENT' },
  })
  window.open(routeData.href, '_blank')
}

// 确认注销
const handleConfirm = async () => {
  // 勾选协议
  if (!agreed.value) {
    ElMessage.warning(t('writeOffModal.msgNeedAgree'))
    return
  }
  const res = await userApi.usercancellation() as any;
  if (res.code === '0000') {
    ElMessage.success(t('writeOffModal.msgSuccess') || '账号已注销')
    // 成功 之后 清理 本地数据
    userStore.logout();
    handleClose() // 关闭弹窗
    router.push('/') // 注销之后返回主界面
  } else {
    ElMessage.error(res.msg || t('writeOffModal.msgFail') || '注销失败')
  }
}
const handleClose = () => {
  agreed.value = false
  dialogVisible.value = false
}
</script>

<style lang="scss" scoped>
.write-off-modal {
  position: relative;
  border-radius: 16px;

  .modal-header {
    margin-bottom: $spacing-sm;

    .header-title {
      font-size: $font-size-2xl-lg;
      font-weight: bold;
      font-family: NotoSans-bold;
      color: $color-text-white;
    }

    .header-close {
      position: absolute;
      top: 32px;
      right: 32px;
      width: 32px;
      height: 32px;
      cursor: pointer;

      img {
        width: 100%;
        height: 100%;
      }
    }
  }

  .modal-content {
    .content-text {
      font-size: $font-size-md;
      line-height: 20px;
      margin-bottom: $spacing-xl;
      color: $color-text-white;
    }

    .delete-list {
      background: $color-bg-dark-secondary;
      border-radius: $border-radius-lg;
      padding: 35px 16px 37px;
      margin-bottom: 66px;

      .delete-item {
        display: flex;
        align-items: flex-start;
        margin-bottom: $spacing-xl;

        .delete-dot {
          width: 6px;
          height: 6px;
          background: $color-bg-yellow;
          border-radius: 50%;
          margin-right: 9px;
          margin-top: 8px;
          flex-shrink: 0;
        }

        .delete-content {
          flex: 1;

          .delete-title {
            font-family: NotoSans-regular;
            font-size: $font-size-base;
            color: $color-text-white;
            margin-bottom: 10px;
          }

          .delete-desc {
            font-size: $font-size-sm;
            color: $color-text-desc;
          }
        }
      }
    }

    .modal-footer {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;

      .confirm-btn {
        width: 204px;
        height: 50px;
        margin-bottom: 14px;
        border-radius: $border-radius-lg;
        background-color: $color-bg-red;
        border: none;
        font-size: $font-size-base;
        color: $color-text-white;
        font-family: NotoSans-regular;

        &:disabled {
          background-color: rgba($color-bg-red, 0.5);
          cursor: not-allowed;
        }
      }

      .agreement-check {

        .checkbox-label {
          display: flex;
          align-items: center;
          cursor: pointer;
          user-select: none;

          .checkbox-icon {
            width: 18px;
            height: 18px;
            margin-right: 8px;
            flex-shrink: 0;
            transition: all 0.2s ease;
          }

          .agreement-text {
            color: $color-text-white;
            font-size: $font-size-md;

            .agreement-link {
              color: $color-primary;
              cursor: pointer;
            }
          }
        }
      }
    }
  }
}
</style>

<style lang="scss">
.el-dialog.write-off-modal {
  background: linear-gradient(135deg, rgba(9, 17, 37, 1) 14.6%, rgba(13, 18, 31, 1) 50%, rgba(22, 29, 49, 1) 85.4%);
  border: none;
  font-family: -regular;

  .el-dialog__header {
    display: none;
  }

  .el-dialog__body {
    padding: 46px 48px 40px;
  }
}
</style>
