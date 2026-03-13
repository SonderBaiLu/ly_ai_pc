<template>
  <el-dialog v-model="dialogVisible" :title="''" width="600px" :close-on-click-modal="true"
    :close-on-press-escape="true" :show-close="false" class="personal-settings-modal" @close="handleClose">
    <div class="modal-header">
      <div class="header-title">{{ t('personalSettings.title') }}</div>
      <div class="header-close" @click="handleClose">
        <img :src="images.closeDialog" alt="" srcset="" />
      </div>
    </div>

    <!-- 基本信息部分 -->
    <div class="section-header">
      <span class="section-title">{{ t('personalSettings.basicInfo') }}</span>
      <el-button class="write-off-btn" type="default" size="small" @click="goToWriteOff">
        {{ t('personalSettings.writeOff') }}
      </el-button>
    </div>

    <!-- 头像 -->
    <div class="form-item form-avatar">
      <div class="form-label">{{ t('personalSettings.avatar') }}</div>
      <div class="avatar-wrapper" @click="handleAvatarClick">
        <img :src="avatarSrc || images.avatar" alt="头像" class="avatar-image" />
        <div class="avatar-edit">
          <img :src="images.editWhite" alt="" />
        </div>
        <input ref="avatarInputRef" type="file" accept="image/*" style="display: none" @change="handleAvatarChange" />
      </div>
    </div>

    <!-- 昵称 -->
    <div class="form-item">
      <div class="flex items-center justify-between">
        <div class="form-label">{{ t('personalSettings.nickname') }}</div>
        <el-button type="primary" size="small" class="password-edit-btn">
          {{ t('personalSettings.changePassword') }}
        </el-button>
      </div>
      <div class="form-value">
        <el-input v-model="editingData.nickname" :maxlength="20"
          :placeholder="t('personalSettings.nicknamePlaceholder')" class="nickname-input" show-word-limit />
      </div>
    </div>

    <!-- 个人简介 -->
    <div class="form-item">
      <div class="form-label">{{ t('personalSettings.introduction') }}</div>
      <div class="form-value description-textarea">
        <textarea id="textarea" v-model="editingData.introduction" name="textarea"
          :placeholder="t('personalSettings.introductionPlaceholder')" :maxlength="300" class="description-input"
          style="resize: none" />
        <!-- 右侧字数统计和清空 -->
        <div class="flex-end">
          <div class="footer-right" @click="editingData.introduction = ''">
            <span class="char-count">{{ editingData.introduction.length }}/300</span>
            <img class="clear-img" :src="images.clear" alt="清空" />
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <el-button type="primary" class="save-btn" @click="handleSave">
          {{ t('personalSettings.save') }}
        </el-button>
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { useModalStore } from '@/stores/modal'
import { userApi } from '@/api/user'
import { uploadApi } from '@/api/upload'
import { images } from '@/assets'

interface Props {
  modelValue: boolean
}

const props = defineProps<Props>()
const { t } = useI18n()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  saved: []
}>()

const userStore = useUserStore()

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const avatarInputRef = ref<HTMLInputElement>()

// 使用 ref 存储编辑中的值，用于双向绑定
// 数据从 Pinia 的 userInfo 同步
const editingData = ref({
  headImgUrl: '',
  nickname: '',
  introduction: '',
})

const avatarSrc = computed(() => editingData.value.headImgUrl || images.avatar)

// 监听弹窗打开，同步 Pinia 数据到编辑数据
watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal) {
      const userInfo = userStore.userInfo
      if (userInfo) {
        editingData.value = {
          headImgUrl: userInfo.headImgUrl || '',
          nickname: userInfo.nickname || '',
          introduction: userInfo.introduction || '',
        }
      }
    }
  },
  { immediate: true }
)

// 点击头像
const handleAvatarClick = () => {
  avatarInputRef.value?.click()
}

// 头像文件变化
const handleAvatarChange = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  try {
    // 上传图片 - 支持多种图片格式
    const result = await uploadApi.uploadImage(file, {
      showLoading: true,
      loadingText: '头像上传中...',
    })

    if (result.success && result.url) {
      editingData.value.headImgUrl = result.url
    }
  } catch (error) {
    console.error('上传头像失败:', error)
  } finally {
    // 清空input，以便可以重复选择同一文件
    if (target) {
      target.value = ''
    }
  }
}

// 保存
const handleSave = async () => {
  if (!userStore.userInfo?.userId) {
    ElMessage.warning('请先登录')
    return
  }

  const userData = computed(() => userStore.userInfo)
  if (!userData.value) {
    ElMessage.warning('用户信息不存在')
    return
  }

  try {
    // 准备更新的用户信息
    const updateData = {
      userId: userData.value.userId,
      mobile: userData.value.mobile,
      nickname: editingData.value.nickname.trim(),
      introduction: editingData.value.introduction.trim(),
      headImgUrl: editingData.value.headImgUrl,
    }

    const res = await userApi.updateUserInfo(updateData)
    if (res.code === '0000') {
      ElMessage.success('保存成功')
      // 刷新用户信息
      if (userData.value.mobile) {
        await userStore.getUserInfo(userData.value.mobile)
      }
      emit('saved')
      handleClose()
    } else {
      ElMessage.error(res.msg || '保存失败')
    }
  } catch (error) {
    console.error('保存失败:', error)
    ElMessage.error('保存失败，请重试')
  }
}

// 去注销
const goToWriteOff = () => {
  const modalStore = useModalStore()
  // 先关闭账号设置弹窗
  modalStore.closePersonalSettingsModal()
  // 然后打开注销弹窗
  modalStore.openWriteOffModal()
}

const handleClose = () => {
  dialogVisible.value = false
}
</script>

<style lang="scss" scoped>
.personal-settings-modal {
  position: relative;

  .header-title {
    margin-bottom: 11px;
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

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 25px;

    .section-title {
      font-size: $font-size-xl;
      color: $color-text-white;
    }

    .write-off-btn {
      min-width: 91px !important;
      height: 32px !important;
      line-height: 32px !important;
      border-radius: 5px;
      background-color: rgba(184, 222, 240, 0.15);
      border: 1px solid rgba(184, 222, 240, 1);
      font-size: $font-size-base;
      color: $color-text-white;
      font-family: NotoSans-bold;
      cursor: pointer;

      &:hover {
        color: $color-primary;
      }
    }
  }

  .form-item {
    margin-bottom: $spacing-lg;

    .form-label {
      color: $color-text-light;
      font-size: $font-size-lg;
      margin-bottom: $spacing-md;
    }

    .password-edit-btn {
      background: $color-primary-dark;
    }

    .form-value {
      border-radius: 8px 8px 8px 8px;
      background: linear-gradient(135deg, rgba(9, 17, 37, 1) 14.6%, rgba(13, 18, 31, 1) 50%, rgba(22, 29, 49, 1) 85.4%);

      :deep(.el-input__wrapper) {
        padding: 0 17px;
        background: transparent;
        border: none;
        box-shadow: none;
        outline: none;

        .el-input__inner {
          color: $color-text-white !important;
          font-size: $font-size-base;
          font-family: NotoSans-bold;

          &::placeholder,
          &::-moz-placeholder {
            color: $color-text-placeholder;
          }
        }
      }

      :deep(.el-input__count-inner) {
        background: transparent;
        border: none;
        box-shadow: none;
        outline: none;
        color: $color-text-white !important;
        font-size: $font-size-base;
        font-family: NotoSans-bold;
      }
    }

    .description-textarea {
      padding-bottom: 11px;

      .description-input {
        width: 100%;
        height: 91px;
        padding: 11px 17px;
        background: transparent;
        border: none;
        outline: none;
        color: $color-text-white !important;
        font-size: $font-size-base;
        font-family: NotoSans-bold;
        resize: none;
        font-family: inherit;

        &:focus {
          outline: none;
        }

        &::placeholder {
          color: $color-text-placeholder;
        }
      }

      .footer-right {
        display: flex;
        align-items: center;
        margin-right: 13px;
        gap: $spacing-xs;

        .char-count {
          font-size: $font-size-base;
          color: $color-text-white;
          font-family: NotoSans-bold;
        }

        .clear-img {
          width: 26px;
          height: 26px;
          cursor: pointer;
        }
      }
    }

    .nickname-input {
      height: 50px;
    }
  }

  .form-avatar {
    display: flex;
    align-items: center;

    .avatar-wrapper {
      position: relative;
      cursor: pointer;

      .avatar-image {
        width: 80px;
        height: 80px;
        margin-left: 126px;
        border-radius: 50%;
        object-fit: cover;
      }

      .avatar-edit {
        position: absolute;
        bottom: 0;
        right: 0;
        width: 26px;
        height: 26px;
        background: $color-primary-dark;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;

        img {
          width: 16px;
          height: 16px;
        }
      }
    }
  }

  .modal-footer {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 35px;

    .save-btn {
      width: 204px;
      height: 50px;
      border-radius: $border-radius-lg;
      background: radial-gradient(0.5% 0.5% at 50% 50%, rgba(23, 160, 225, 1) 0%, rgba(112, 197, 237, 1) 100%);
      font-size: $font-size-base;
      color: $color-text-white;
      font-family: NotoSans-regular;
    }
  }
}
</style>

<style lang="scss">
.el-dialog.personal-settings-modal {

  .el-dialog__header {
    display: none;
  }

  .el-dialog__body {
    padding: 45px 48px 42px;
  }
}
</style>
