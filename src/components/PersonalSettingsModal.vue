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
      <el-button class="write-off-btn" type="default" size="small" @click="goToWriteOff"
        v-if="userStore.userInfo.mainAccount">
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

    <!-- 账号名 -->
    <div class="form-item flex-between">
      <div class="form-label">{{ t('personalSettings.accountName') }}<span class="account-name">{{ editingData.userName
      }}</span></div>
      <!--密码修改-->
      <el-button type="primary" size="small" @click="updatePwd()" class="password-edit-btn">
        {{ hasPassword ?
          t('personalSettings.changePassword')
          :
          t('personalSettings.setPassword')
        }}
      </el-button>
    </div>
    <!-- 昵称 -->
    <div class="form-item">
      <div class="form-label">{{ t('personalSettings.nickName') }}</div>
      <div class="form-value">
        <el-input v-model="editingData.nickName" :maxlength="20"
          :placeholder="t('personalSettings.nickNamePlaceholder')" class="nick-name-input" show-word-limit />
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
            <!-- <img class="clear-img" :src="images.clear" alt="清空" /> -->
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
  <Teleport to="body">
    <Transition name="modal">
      <ResetPassword :is-set-password="!hasPassword" v-if="isVisible" :mode="currentMode" :is-from-settings="true"
        @close="isVisible = false" />
    </Transition>
  </Teleport>


</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { useModalStore } from '@/stores/modal'
import { uploadApi } from '@/api/upload'
import { enMessages, userLanguageToI18nLocale, zhMessages } from '@/i18n'
import { images } from '@/assets'

interface Props {
  modelValue: boolean
}
const props = defineProps<Props>()
const { t, locale } = useI18n({
  useScope: 'local',
  // 与全局 i18n 隔离：避免首页导航切换时反向覆盖本弹窗语言
  inheritLocale: false,
  messages: {
    'zh-chs': zhMessages,
    en: enMessages,
  },
})
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  saved: []
}>()

const userStore = useUserStore()

// 个人中心只受“用户偏好语言”影响，避免被全局 i18n locale 反向覆盖
watch(
  () => userStore.userInfo?.language,
  (userLang) => {
    locale.value = userLanguageToI18nLocale(userLang)
  },
  { immediate: true },
)


const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const avatarInputRef = ref<HTMLInputElement>()

// 使用 ref 存储编辑中的值，用于双向绑定
// 数据从 Pinia 的 userInfo 同步
const editingData = ref({
  headImgUrl: '',
  nickName: '',
  introduction: '',
  userName: '',
})

const avatarSrc = computed(() => editingData.value.headImgUrl || images.avatar)
// 定义控制弹窗显示的变量 重置密码组件
const isVisible = ref(false)
const currentMode = ref('0')
// 定义变量 决定 按钮显示 修改密码 还是 重置密码
const hasPassword = ref(false)

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
  try {
    const updateData = {
      nickName: editingData.value.nickName.trim(),
      desc: editingData.value.introduction.trim(),
      headImgUrl: editingData.value.headImgUrl,
    }

    const res = await userStore.updateUserInfo(updateData)
    if (res.code === '0000') {
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

// 获取密码状态
const fetchPasswordStatus = async () => {
  const userInfo = userStore.userInfo
  // 判断当前登录的是否为主账号
  const isMainAccount = userInfo.mainAccount === true || String(userInfo.mainAccount) === 'true'
  if (!isMainAccount) {
    // 如果是子账号，必定有初始密码（由主账号创建时生成），所以强制认定为已设置密码
    hasPassword.value = true
  } else {
    // 主账号正常依赖后端的 setPwd 字段判断
    hasPassword.value = !!userInfo.setPwd
  }
}
// 监听弹窗打开，同步 Pinia 数据到编辑数据
watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal) {
      // 每次打开都按用户偏好语言重置，防止被外部状态影响
      locale.value = userLanguageToI18nLocale(userStore.userInfo?.language)

      const userInfo = userStore.userInfo
      if (userInfo) {
        editingData.value = {
          headImgUrl: userInfo.headImgUrl || '',
          // 兼容不同接口字段：优先使用当前项目的 nickName 字段
          nickName: userInfo.nickName || userInfo.nickname || '',
          introduction: userInfo.desc || userInfo.introduction || '',
          // 优先取 userName (子账号登录名)，没有的话再兜底显示 mobile (主账号手机号)
          userName: userInfo.userName || userInfo.mobile || '',
        }
      }
      // 监视密码是否有修改 是否有设置
      // 每次弹窗打开时，重新获取密码设置状态
      fetchPasswordStatus()
    }
  },
  { immediate: true }
)

// 修改密码
const updatePwd = () => {
  // getUserSetPwd 获取用户是否设置了 密码返回 true or false
  isVisible.value = true;
  // true 传 '1'(修改密码)，false 传 '0'(设置密码)
  // TODO: 这里需要根据 hasPassword.value 来判断是修改密码还是重置密码
  currentMode.value = hasPassword.value ? '1' : '0';
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
/* 元素进入和离开的过渡时间、缓动函数 */
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

/* 元素刚准备进入时，以及完全离开后的状态 */
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

/* 让弹窗主体在出现时有一个从小放大的 */
.modal-enter-from .reset-password-modal,
.modal-leave-to .reset-password-modal {
  transform: scale(0.9);
}

.personal-settings-modal {
  position: relative;
  border-radius: 16px;

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
    margin-bottom: 21px;

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

      .account-name {
        margin-left: $spacing-xl;
        color: $color-text-account-name;
      }
    }

    .password-edit-btn {
      background: $color-primary-dark !important;
      min-width: 81px;
      border-radius: 4px;
      font-size: $font-size-sm;
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

      .watermark-hint {
        margin-top: $spacing-xs;
        font-size: $font-size-sm;
        color: $color-text-gray;
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

    .nick-name-input {
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
