<template>
  <div class="reset-password-overlay">
    <div :class="['reset-password-modal', `mode-${modeType}`]">
      <button class="close-btn" @click="closeModal">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M1 1L13 13M1 13L13 1" stroke="#999999" stroke-width="1.5" stroke-linecap="round"
                stroke-linejoin="round"/>
        </svg>
      </button>

      <div class="header-area">
        <h2 class="modal-title">{{ modalTitle }}</h2>
        <p v-if="modeType === '3'" class="modal-subtitle">首次登录将通过短信验证码绑定手机</p>
      </div>

      <div class="form-container">
        <div class="form-group" v-if="modeType === '2'">
          <label class="form-label">账号名</label>
          <div class="input-wrapper disabled-wrapper">
            <input type="text" v-model="formData.accountName" class="form-input" disabled/>
          </div>
        </div>

        <div class="form-group" v-if="['0', '1', '3'].includes(modeType)">
          <label class="form-label">手机号</label>
          <div class="input-wrapper" :class="{ 'disabled-wrapper': isFromSettings }">
            <span class="prefix">+86</span>
            <span class="divider"></span>
            <input
                type="tel"
                maxlength="11"
                v-model="formData.phone"
                class="form-input"
                placeholder="请输入手机号"
                :disabled="isFromSettings"
                @input="handlePhoneInput"
            />
          </div>
        </div>

        <div class="form-group" v-if="['1', '2'].includes(modeType)">
          <label class="form-label">旧密码</label>
          <div class="input-wrapper">
            <input type="password" v-model="formData.oldPassword" class="form-input" placeholder="请输入旧密码"/>
          </div>
        </div>

        <div class="form-group" v-if="['0', '3'].includes(modeType)">
          <label class="form-label">验证码</label>
          <div class="input-wrapper code-wrapper">
            <input maxlength="4" v-model="formData.code" type="tel" class="form-input" placeholder="请输入验证码"/>
            <button @click='fetchSmsCode' :disabled="!formData.phone || isCounting" class="get-code-btn">
              {{ isCounting ? t('LoginPopUpPage.smsCountdown', {seconds: countdown}) : '获取验证码' }}
            </button>
          </div>
        </div>

        <template v-if="['0', '1', '2'].includes(modeType)">
          <div class="form-group">
            <label class="form-label">
              新密码 <span class="label-hint">6-20个数字、字母组成</span>
            </label>
            <div class="input-wrapper">
              <input maxlength="20" :type="showPwdOne ? 'text' : 'password'" v-model="formData.newPassword"
                     class="form-input" placeholder="请输入密码"/>
              <span class="icon-eye" @click="showPwdOne = !showPwdOne">
                <img :src="showPwdOne ? images.eye : images.eyeClose" alt=""/>
              </span>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">确认密码</label>
            <div class="input-wrapper">
              <input maxlength="20" :type="showPwdTwo ? 'text' : 'password'" v-model="formData.confirmPassword"
                     class="form-input" placeholder="请再次输入密码确认"/>
              <span class="icon-eye" @click="showPwdTwo = !showPwdTwo">
                <img :src="showPwdTwo ? images.eye : images.eyeClose" alt=""/>
              </span>
            </div>
          </div>
        </template>

        <button @click="handleSubmit" class="submit-btn">{{ submitBtnText }}</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref, reactive, computed, watch, onUnmounted} from 'vue'
import {images} from '@/assets'
import {useI18n} from 'vue-i18n'
import {ElMessage} from 'element-plus'
import {changePwdBySms, doUserWechatLogin, getSmsCodeApi} from "@/api/userLogin"
import userApi from '@/api/user'
import {useUserStore} from '@/stores/user'
import {userLanguageToI18nLocale} from '@/i18n'

const userStore = useUserStore()
import {baseRules} from '@/utils/validationSchemas.ts'
import {useModalStore} from "@/stores/modal.ts";

const {t, locale} = useI18n({useScope: 'local'})

// 个人中心弹窗：只跟随用户偏好语言，避免被全局 i18n locale 覆盖
watch(
    () => userStore.userInfo?.language,
    (userLang) => {
      locale.value = userLanguageToI18nLocale(userLang)
    },
    {immediate: true},
)

// Props & Emits
const props = defineProps({
  mode: {
    type: String,
    default: '0', // 0:重置密码, 1:个人改密, 2:团队改密, 3:绑定手机
  },
  openId: {  // 绑定手机号登录接口需要用到的 openId 在扫码登陆那边传过来的
    type: String,
    default: '',
  },
  isFromSettings: {
    type: Boolean,
    default: false
  },
  confirmedInviteCode: {  // 邀请码
    type: String,
    default: '',
  },
  isSetPassword: {  // 用来判断是不是“首次设置密码”
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'success'])
const modeType = computed(() => props.mode as '0' | '1' | '2' | '3')

// ====== UI 状态与文案计算 ======
const modalTitle = computed(() => {
  if (modeType.value === '0' && props.isSetPassword) {
    return '设置密码'
  }
  const titles = {'0': '重置密码', '1': '修改密码', '2': '修改密码', '3': '绑定手机'}
  return titles[modeType.value] || '修改密码'
})

const submitBtnText = computed(() => {
  // if (modeType.value === '0' && props.isSetPassword) {
  //   return '设置密码'
  // }
  return modeType.value === '3' ? '绑定' : '重置密码'
})

const showPwdOne = ref(false)
const showPwdTwo = ref(false)

// ====== 表单数据 ======
const formData = reactive({
  phone: '',
  accountName: userStore.userInfo?.accountName || '',
  code: '',
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
})

// 监听 Settings 传入手机号
watch(
    () => props.isFromSettings,
    (isFromSettings) => {
      if (isFromSettings && userStore.userInfo) {
        formData.phone = userStore.userInfo.mobile  // 这里是 账号设置重置主页里面重置密码框
      }
    },
    {immediate: true}
)

// 限制手机号输入只能为数字
const handlePhoneInput = () => {
  formData.phone = formData.phone.replace(/\D/g, '').slice(0, 11)
}

// ====== 短信验证码逻辑 ======
const isCounting = ref(false)
const countdown = ref(120)
let smsTimer: ReturnType<typeof setInterval> | null = null

const fetchSmsCode = async () => {
  if (!formData.phone || formData.phone.length !== 11) {
    return ElMessage.warning("请输入正确的11位手机号")
  }

  try {
    const res = await getSmsCodeApi(Number(formData.phone))
    if (String((res as any).code) === '0000') {
      ElMessage.success('验证码已发送')
      startCountdown()
    } else {
      ElMessage.error(res.msg)
    }
  } catch (e: any) {
    ElMessage.error(e.message)
  }
}

const startCountdown = () => {
  isCounting.value = true
  countdown.value = 120
  if (smsTimer) clearInterval(smsTimer)
  smsTimer = setInterval(() => {
    countdown.value -= 1
    if (countdown.value <= 0) {
      clearInterval(smsTimer!)
      smsTimer = null
      isCounting.value = false
    }
  }, 1000)
}

// ====== 提交逻辑 ======
const handleSubmit = async () => {
  try {
    // 公共校验：密码模式需要校验密码
    if (['0', '1', '2'].includes(modeType.value)) {
      if (!formData.newPassword) return ElMessage.error("请输入新密码")
      const pwdResult = baseRules.password.safeParse(formData.newPassword)
      if (!pwdResult.success) {
        // 解析失败，提取 zod 里的错误提示
        return ElMessage.error(pwdResult.error.issues[0].message)
      }

      if (!formData.confirmPassword) return ElMessage.error("请再次输入密码")
      if (formData.newPassword !== formData.confirmPassword) {
        return ElMessage.error("两次输入的密码不一致，请重新输入")
      }
    }

    // 据模式执行对应 API
    switch (modeType.value) {
      case '0': // 找回/重置密码 (短信验证)
      {
        if (!formData.phone) return ElMessage.error("请输入手机号")
        if (!formData.code) return ElMessage.error("请输入验证码")
        const res = await changePwdBySms({
          mobile: formData.phone,
          verifyCode: Number(formData.code),
          newPwd: formData.newPassword,
          newPwdAgain: formData.confirmPassword
        })
        if (String((res as any).code) === '0000') {
          if (props.isSetPassword) {
            ElMessage.success('密码设置成功')
            setTimeout(async () => {
              await userStore.logout() // 修改成功后退出登录
            }, 500); // 等待0.5秒防止卡顿
            emit('success', modeType.value)
            emit('close')
          } else {
            ElMessage.success('密码重置成功')
            setTimeout(async () => {
              await userStore.logout() // 修改成功后退出登录
            }, 500); // 等待0.5秒防止卡顿
            emit('success', modeType.value)
            emit('close')
          }
        } else {
          ElMessage.error(res.msg || '操作失败')
        }

        break
      }

      case '1': // 个人修改密码 (旧密码验证)
      {
        let res = null;
        if (!formData.phone) return ElMessage.error("请输入手机号")
        if (!formData.oldPassword) return ElMessage.error("请输入旧密码")
        if (userStore.userInfo.mainAccount === true || userStore.userInfo.mainAccount === 'true') {
          // 个人用户修改密码
          res = await userApi.changePwdByOldPwd({
            oldPwd: formData.oldPassword,
            newPwd: formData.newPassword,
            newPwdAgain: formData.confirmPassword,
          })
        } else if (userStore.userInfo.mainAccount === false || userStore.userInfo.mainAccount === 'false') {
          // 团队用户 自己修改密码
          res = await userApi.changeTeamPwd({
            oldPwd: formData.oldPassword,
            newPwd: formData.newPassword,
            newPwdAgain: formData.confirmPassword,
          })
        }
        if (String((res as any).code) === '0000') {
          ElMessage.success('修改密码成功')
          const modalStore = useModalStore()
          modalStore.closePersonalSettingsModal()
          await userStore.logout() // 修改成功后退出登录
          emit('success', modeType.value)
          emit('close')
        } else {
          ElMessage.error(res?.msg || '操作失败')
        }
        break
      }
      case '3': // 绑定手机号
      {
        if (!formData.phone) return ElMessage.error("请输入手机号");
        if (!formData.code) return ElMessage.error("请输入验证码");

        const res = await doUserWechatLogin({
          mobile: formData.phone, // 手机号
          verifyCode: Number(formData.code), // 邀请码
          openId: props.openId, // 绑定手机号登录接口需要用到的 openId 在扫码登陆那边传过来的 d
          invitationsCode: props.confirmedInviteCode,  // 邀请验证码
        })
        if (String((res as any).code) === '0000' && res.success === true) {
          userStore.setToken(res.data.accessToken)
          ElMessage.success('手机号绑定成功')
          emit('success', modeType.value)
          emit('close')
        } else {
          ElMessage.error(res.msg)
        }
        break
      }
    }
  } catch (e: any) {
    ElMessage.error(e.message)
  }
}

const closeModal = () => {
  emit('close')
}

onUnmounted(() => {
  if (smsTimer) clearInterval(smsTimer)
})
</script>

<style lang="scss" scoped>
.reset-password-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3109;
}

/* 基础模态框样式 */
.reset-password-modal {
  position: relative;
  width: 440px;
  background: #FFFFFF;
  border-radius: 16px;
  padding: 40px;
  box-sizing: border-box;

  .close-btn {
    position: absolute;
    top: 24px;
    right: 24px;
    background: none;
    border: none;
    cursor: pointer;
    padding: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.2s;

    &:hover {
      transform: scale(1.1);

      svg path {
        stroke: #333;
      }
    }
  }

  /* 头部区域 */
  .header-area {
    text-align: center;
    margin-bottom: 32px;

    .modal-title {
      font-size: 24px;
      font-weight: 600;
      color: #1A2233;
      margin: 0;
    }

    .modal-subtitle {
      font-size: 14px;
      color: #8D95A1;
      margin: 12px 0 0 0;
    }
  }
}

/* ================== 表单通用样式 ================== */
.form-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;

  .form-label {
    font-size: 14px;
    color: #4A566A;
    font-weight: 500;

    .label-hint {
      margin-left: 8px;
      font-size: 12px;
      color: #99A3B3;
      font-weight: normal;
    }
  }

  .input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
    height: 48px;
    border: 1px solid #D1D8E1;
    border-radius: 8px;
    padding: 0 16px;
    background: #FFFFFF;
    transition: all 0.2s ease;

    &:focus-within {
      border-color: #0B5070;
      box-shadow: 0 0 0 2px rgba(11, 80, 112, 0.1);
    }

    &.disabled-wrapper {
      background: #F5F7FA;

      input {
        color: #99A3B3;
        cursor: not-allowed;
      }
    }

    .prefix {
      font-size: 14px;
      color: #8D95A1;
    }

    .divider {
      width: 1px;
      height: 14px;
      background-color: #D1D8E1;
      margin: 0 12px;
    }

    .form-input {
      flex: 1;
      height: 100%;
      border: none;
      outline: none;
      font-size: 14px;
      color: #1A2233;
      background: transparent;

      &::placeholder {
        color: #B0B8C6;
      }
    }

    .icon-eye {
      cursor: pointer;
      display: flex;
      padding: 4px;

      img {
        width: 18px;
        height: 18px;
        opacity: 0.6;
        transition: 0.2s;
      }

      &:hover img {
        opacity: 1;
      }
    }
  }

  /* 基础验证码按钮样式 (用于模式 0) */
  .get-code-btn {
    height: 32px;
    padding: 0 16px;
    background-color: #B8DEF0;
    color: #0B5070;
    border: none;
    border-radius: 4px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    white-space: nowrap;
    transition: all 0.2s;

    &:hover:not(:disabled) {
      background: #A6D4E7;
    }

    &:disabled {
      cursor: not-allowed;
      opacity: 0.6;
    }
  }
}

/* 基础提交按钮样式 */
.submit-btn {
  margin-top: 12px;
  width: 100%;
  height: 48px;
  background: #0B5070;
  color: #FFFFFF;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #0E425B;
  }
}

/* ================== 模式 3 (绑定手机) 专属覆盖样式 ================== */
.reset-password-modal.mode-3 {
  width: 480px; /* 设计稿看起来稍微宽一点点 */

  .header-area {
    margin-bottom: 40px; /* 增加标题和输入框的间距 */
  }

  /* 覆盖：验证码按钮变成深色 (依照图2) */
  .get-code-btn {
    background-color: #333333;
    color: #FFFFFF;
    border-radius: 6px;

    &:hover:not(:disabled) {
      background: #1A1A1A;
    }
  }

  /* 覆盖：底部提交按钮变成黑色 */
  .submit-btn {
    background: #000000;
    margin-top: 24px; /* 增加验证码和按钮之间的间距 */
    border-radius: 8px;

    &:hover {
      background: #222222;
    }
  }
}
</style>