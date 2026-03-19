<template>
  <div class="login-overlay" @click.self="handleClose">
    <div class="login-modal">
      <div class="left-panel">
        <div class="brand-logo">
          <span class="logo-icon">
            <img src="/src/assets/images/login_popup/ailog.png" alt="" />
          </span>
        </div>
        <h1 class="main-title">{{ t('LoginPopUpPage.mainTitle') }}</h1>
        <div class="promo-box">
          <span class="promo-text">{{ t('LoginPopUpPage.promoText') }}</span>
          <span class="promo-value">{{ t('LoginPopUpPage.promoValue') }}</span>
        </div>
        <ul class="feature-list">
          <li>
            <span class="icon"><img src="/src/assets/images/login_popup/layered.png" alt="" /></span>
            <span>{{ t('LoginPopUpPage.simplifyDesign') }}</span>
          </li>
          <li>
            <span class="icon"><img src="/src/assets/images/login_popup/clothes.png" alt="" /></span>
            <span>{{ t('LoginPopUpPage.aiEmpowerment') }}</span>
          </li>
          <li>
            <span class="icon"><img src="/src/assets/images/login_popup/shopping.png" alt="" /></span>
            <span>{{ t('LoginPopUpPage.loginRewards') }}</span>
          </li>
          <li>
            <span class="icon"><img src="/src/assets/images/login_popup/pen.png" alt="" /></span>
            <span>{{ t('LoginPopUpPage.backToEssence') }}</span>
          </li>
        </ul>
      </div>

      <div class="right-panel">
        <button class="close-btn" @click="handleClose">✕</button>

        <div class="account-type-switch" :class="accountType">
          <div class="switch-item" :class="{ active: accountType === 'personal' }" @click="accountType = 'personal'">
            {{ t('LoginPopUpPage.personalLogin') }}
          </div>
          <div class="switch-item" :class="{ active: accountType === 'team' }" @click="accountType = 'team'">
            {{ t('LoginPopUpPage.teamLogin') }}
          </div>
        </div>

        <div v-if="accountType === 'personal'" class="login-method-tabs" :class="loginMethod">
          <div class="tab-item" :class="{ active: loginMethod === 'qrcode' }" @click="loginMethod = 'qrcode'">
            {{ t('LoginPopUpPage.scanToLogIn') }}
          </div>
          <div class="tab-item" :class="{ active: loginMethod === 'phone' }" @click="loginMethod = 'phone'">
            {{ t('LoginPopUpPage.mobileLogin') }}
          </div>
        </div>

        <div class="method-content">
          <div v-if="accountType === 'personal' && loginMethod === 'qrcode'" class="qrcode-section">
            <div class="qrcode-container">
              <div class="qrcode-placeholder"></div>
            </div>
            <div class="qrcode-instruction">
              <div class="wechat-hint">
                <span class="wechat-icon">
                  <img src="@/assets/images/login_popup/weixin.png" alt="" />
                </span>
                <span>{{ t('LoginPopUpPage.wechatScanLogin') }}</span>
              </div>
              <p class="sub-hint">{{ t('LoginPopUpPage.subHint') }}</p>
            </div>
            <div class="invite-link-wrap qrcode-invite">
              <a @click.prevent="openInviteLink" class="invite-link">
                {{ t('LoginPopUpPage.inviteLink') }}
              </a>
            </div>
          </div>

          <div v-if="accountType === 'personal' && loginMethod === 'phone'" class="form-section">
            <div class="input-block">
              <label class="block-label">{{ t('LoginPopUpPage.mobilePhoneNumber') }}</label>
              <div class="input-wrapper phone-input-wrapper">
                <span class="country-code">+86</span>
                <div class="divider"></div>
                <input type="tel" v-model="formData.phone" :placeholder="t('LoginPopUpPage.enterPhoneNumber')"
                  maxlength="11" @input="handlePhoneInput" />
              </div>
            </div>

            <div v-if="phoneLoginType === 'code'" class="input-block">
              <div class="label-row">
                <label class="block-label">{{ t('LoginPopUpPage.captcha') }}</label>
                <div class="mode-switch-btn" @click="phoneLoginType = 'password'">
                  {{ t('LoginPopUpPage.passwordLogin') }}
                </div>
              </div>
              <div class="input-wrapper code-input-wrapper">
                <input type="tel" maxlength="4" v-model="formData.code"
                  :placeholder="t('LoginPopUpPage.enterTheVerificationCode')" />
                <button @click="GetSmSCode" class="get-code-btn" :disabled="!formData.phone || isCounting">
                  {{ isCounting ? t('LoginPopUpPage.smsCountdown', { seconds: countdown }) :
                    t('LoginPopUpPage.getVerificationCode') }}
                </button>
              </div>
            </div>

            <div v-if="phoneLoginType === 'password'" class="input-block">
              <div class="label-row">
                <label class="block-label">{{ t('LoginPopUpPage.passwordLabel') }}</label>
                <div class="link-group">
                  <a href="#" class="action-link" @click.prevent="phoneLoginType = 'code'">
                    {{ t('LoginPopUpPage.codeLogin') }}
                  </a>
                  <span class="link-divider"></span>
                  <a href="#" class="action-link">{{ t('LoginPopUpPage.forgotPassword') }}</a>
                </div>
              </div>
              <div class="input-wrapper" :class="{ 'has-error': pwdErrorMsg }">
                <input :type="showPersonalPwd ? 'text' : 'password'" v-model="formData.password"
                  :placeholder="t('LoginPopUpPage.passwordPlaceholder')" @input="clearPwdError" />
                <span class="eye-icon" @click="showPersonalPwd = !showPersonalPwd">
                  <img :src="showPersonalPwd ? iconEyesOpen : iconEyeClose" alt="" class="eye-img" />
                </span>
              </div>
              <div v-if="pwdErrorMsg" class="error-text">
                {{ pwdErrorMsg }}
              </div>
            </div>
            <div class="invite-link-wrap">
              <a @click.prevent="openInviteLink" class="invite-link">
                {{ t('LoginPopUpPage.inviteFill') }}
              </a>
            </div>
            <button class="submit-btn" @click="handleSubmit">
              {{ t('LoginPopUpPage.loginOrRegister') }}
            </button>
          </div>

          <div v-if="accountType === 'team'" class="form-section team-form-section">
            <div class="input-block">
              <label class="block-label">{{ t('LoginPopUpPage.teamAccountLabel') }}</label>
              <div class="input-wrapper">
                <input type="text" v-model="formData.teamAccount"
                  :placeholder="t('LoginPopUpPage.teamAccountPlaceholder')" />
              </div>
            </div>

            <div class="input-block">
              <label class="block-label">{{ t('LoginPopUpPage.teamPasswordLabel') }}</label>
              <div class="input-wrapper" :class="{ 'has-error': teamErrorMsg }">
                <input :type="showTeamPwd ? 'text' : 'password'" v-model="formData.teamPassword"
                  :placeholder="t('LoginPopUpPage.teamPasswordPlaceholder')" @input="clearTeamError" />
                <span class="eye-icon" @click="showTeamPwd = !showTeamPwd">
                  <img :src="showTeamPwd ? iconEyesOpen : iconEyeClose" alt="" class="eye-img" />
                </span>
              </div>
              <div v-if="teamErrorMsg" class="error-text">
                {{ teamErrorMsg }}
              </div>
            </div>

            <button class="submit-btn team-submit-btn" @click="handleTeamSubmit">
              {{ t('LoginPopUpPage.teamLoginButton') }}
            </button>
          </div>
        </div>

        <div class="footer-agreement">
          <div class="agreement">
            {{ t('LoginPopUpPage.agreement') }}
            <a href="#">{{ t('LoginPopUpPage.userAgreement') }}</a>
            {{ t('LoginPopUpPage.and') }}
            <a href="#">{{ t('LoginPopUpPage.userPolicy') }}</a>
          </div>
        </div>
      </div>
    </div>
    <Transition name="modal">
      <ResetPassword v-if="dialogs.isVisible" :mode="currentMode" @close="dialogs.isVisible = false" />
    </Transition>
    <InvitationCode v-if="dialogs.invitation" @close="dialogs.isVisible = false" />
  </div>
</template>

<script setup lang="ts">
import { onUnmounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import iconEyesOpen from '@/assets/images/login_popup/eyes.png'
import iconEyeClose from '@/assets/images/login_popup/eye_close.png'
import { getSmsCodeApi } from '@/api/userLogin'
import { useUserStore } from "@/stores/user"
import ResetPassword from '@/components/ResetPassword.vue'
import InvitationCode from '@/components/InvitationCode.vue'
const userStore = useUserStore()
const { t } = useI18n()
const emit = defineEmits(['close'])
// ----- 扫码登陆 ------------- 测试 --------
// const qrCodeImg = ref('') // 二维码图片源
// const currentTicket = ref('') // 这个是二维码的唯一凭证
// WAITING：还没扫。
// SCANNED：已扫码，但在手机上还没点确认
// SUCCESS：登录成功。
// EXPIRED：二维码过期了
// const qrStatus = ref<'loading' | 'waiting' | 'scanned' | 'expired'>('loading') // 二维码当前状态
// let qrCodeTimer: ReturnType<typeof setInterval> | null = null
// 初始化获取二维码
/*
const initQrCode = async () => {
  qrStatus.value = 'loading';
  if (qrCodeTimer) clearInterval(qrCodeTimer) // 清理定时器
  try {
    // 假设
    // const res = await getWechatQrCodeApi()
    qrCodeImg.value = "res.data.imgUrl"; // 获取后端给的图片地址
    currentTicket.value = "rs.data.ticket";
    qrStatus.value = 'waiting';
    // 拿到 二维码之后 立刻开始轮询检查 二维码的状态
  } catch (e) {
    ElMessage.error('获取二维码失败，请重试')
    qrStatus.value = 'expired'
  }
}
*/
// 轮询检查
/*
const startPolling = () => {
  qrCodeTimer = setInterval(async () => {
    try {
      // 假设
      const res = "await checkScanStatusApi(currentTicket.value)";
      const status = "scanned"//"res.data.status";
      if (status === "scanned") {
        // 用户手机扫了，但还没点确认
        qrStatus.value = 'scanned'
      } else if (status === "success") {
        //登录成功
        clearInterval(qrCodeTimer!)
        qrCodeTimer = null
        // 执行登录成功逻辑（存 token 等）
        //userStore.setToken(res.data.token)
        ElMessage.success('扫码登录成功')
        emit('close') // 关闭弹窗
      } else if (status === 'expired') {
        // 二维码过期
        clearInterval(qrCodeTimer!)
        qrCodeTimer = null
        qrStatus.value = 'expired'
      }
    } catch (e) {
      console.error('查询状态异常', e)
    }
  }, 2000)

}
  */
/* watch(loginMethod, (newMethod) => {
  if (newMethod === 'qrcode') {
    // 只要切到扫码登陆，就去请求二维码并轮询
    initQrCode()
  } else {
    // 只要切换走 就杀死
    if (qrCodeTimer) {
      clearInterval(qrCodeTimer)
      qrCodeTimer = null;
    }
  }
})
*/
// === 基础状态 ===
const accountType = ref<'personal' | 'team'>('personal')
const loginMethod = ref<'qrcode' | 'phone'>('phone')
const phoneLoginType = ref<'code' | 'password'>('code')

// 定义控制弹窗显示的变量 重置密码组件
// 集中管理所有弹窗的显示状态
const dialogs = reactive({
  isVisible: false,
  invitation: false,
})
const currentMode = ref('0')
// 密码显示切换状态
const showPersonalPwd = ref(false)
const showTeamPwd = ref(false)

// 错误提示状态
const pwdErrorMsg = ref('')
const teamErrorMsg = ref('')

const clearPwdError = () => { pwdErrorMsg.value = '' }
const clearTeamError = () => { teamErrorMsg.value = '' }

// === 表单数据 ===
const formData = reactive({
  phone: '',
  code: '',
  password: '',
  teamAccount: '',
  teamPassword: '',
})

// 限制手机号只允许数字且最长 11 位
const handlePhoneInput = () => {
  formData.phone = formData.phone.replace(/\D/g, '').slice(0, 11)
}

// === 短信验证码逻辑 ===
const isCounting = ref(false)
const countdown = ref(120)
let smsTimer: ReturnType<typeof setInterval> | null = null

const GetSmSCode = async () => {
  const mobile = Number(formData.phone)
  if (!formData.phone || !Number.isInteger(mobile)) {
    ElMessage.warning(t('LoginPopUpPage.enterPhoneNumber'))
    return
  }

  try {
    const res = await getSmsCodeApi(mobile)
    if (String((res as any).code) === '0000') {
      ElMessage.success(t('LoginPopUpPage.smsCodeSent'))
      isCounting.value = true
      countdown.value = 120
      if (smsTimer) clearInterval(smsTimer)

      smsTimer = setInterval(() => {
        countdown.value -= 1
        if (countdown.value <= 0) {
          if (smsTimer) clearInterval(smsTimer)
          smsTimer = null
          isCounting.value = false
        } return
      }, 1000)
    } else {
      ElMessage.error((res as any).msg || '发送失败')
    }
  } catch (e) {
    console.error('getSmsCode error', e)
  }
}

const handleClose = () => {
  emit('close')
}

// === 个人登录提交 ===
const handleSubmit = async () => {
  if (!formData.phone) {
    ElMessage.warning(t('LoginPopUpPage.enterPhoneNumber'))
    return
  }

  pwdErrorMsg.value = '' // 提交前重置报错

  try {
    if (phoneLoginType.value === 'code') {
      if (!formData.code) {
        ElMessage.warning(t('LoginPopUpPage.enterTheVerificationCode'))
        return
      }
      await userStore.loginWithSms(formData.phone, formData.code)
      // 查询用户是否设置了密码 如果没有就弹出 设置密码弹窗
      //const setPwd = await userApi.getUserSetPwd()
      //if (setPwd.data.setPwd === false) {
      // 弹出 设置密码的窗口
      //  currentMode.value = '0'
      //  isVisible.value = true
      // }
      ElMessage.success(t('LoginPopUpPage.loginSuccess') || '登录成功')
      emit('close')

    } else {
      if (!formData.password) {
        ElMessage.warning(t('LoginPopUpPage.passwordPlaceholder') || '请输入密码')
        return
      }
      await userStore.loginWithPassword(formData.phone, formData.password)
    }
  } catch (e: any) {
    const errorMsg = e.msg || e.response?.data?.msg || e.message || '登录失败，请重试'
    if (phoneLoginType.value === 'password') {
      pwdErrorMsg.value = errorMsg // 渲染到输入框下方
      console.log(errorMsg)
    } else {
      // 验证码登录直接顶部提示 使用拦截器的提示

    }
  }
}
// 校验填写的邀请码
const openInviteLink = () => {
  // 打开 填写邀请码弹窗
  dialogs.invitation = true
  console.log(dialogs.invitation)
}
const handleTeamSubmit = async () => {
  teamErrorMsg.value = '' // 提交前重置报错

  if (!formData.teamAccount) {
    ElMessage.warning(t('LoginPopUpPage.teamAccountPlaceholder'))
    return
  }
  if (!formData.teamPassword) {
    ElMessage.warning(t('LoginPopUpPage.teamPasswordPlaceholder'))
    return
  }

  try {
    await userStore.teamLogin(formData.teamAccount, formData.teamPassword)
    ElMessage.success(t('LoginPopUpPage.loginSuccess') || '登录成功')
    emit('close')
  } catch (e: any) {
    teamErrorMsg.value = e.msg || e.response?.data?.msg || e.message || '登录失败，请重试' // 渲染到输入框下方
  }
}
onUnmounted(() => {
<<<<<<< HEAD
  if (smsTimer) clearInterval(smsTimer)
=======
  if (smsTimer) {
    clearInterval(smsTimer)
    smsTimer = null
  }
>>>>>>> origin/dev
})
</script>

<style scoped lang="scss">
/* ====== 基础遮罩与容器样式 ====== */
.login-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.login-modal {
  display: flex;
  align-items: stretch;
  position: relative;
}

/* ====== 左侧面板 ====== */
.left-panel {
  width: 592px;
  min-height: 627px;
  border-radius: 24px;
  background: linear-gradient(135deg, rgba(30, 58, 138, 1) 14.6%, rgba(109, 40, 217, 1) 85.4%);
  padding-top: 20px;
  box-sizing: border-box;
  color: #fff;
  z-index: 2;
  box-shadow: 12px 0 30px rgba(0, 0, 0, 0.1);

  .brand-logo {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 24px;
    font-weight: 600;
    margin-left: 29px;
    margin-bottom: 69px;

    .logo-icon {
      width: 136px;
      height: 54px;

      img {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }
    }
  }

  .main-title {
    font-size: 40px;
    letter-spacing: 1px;
    line-height: 1.2;
    margin-left: 68px;
    margin-bottom: 40px;
  }

  .promo-box {
    display: flex;
    justify-content: space-between;
    background: rgba(255, 255, 255, 0.15);
    padding: 18px 24px;
    border-radius: 14px;
    backdrop-filter: blur(10px);
    margin-left: 68px;
    margin-right: 76px;
    margin-bottom: 50px;

    .promo-text {
      font-size: 16px;
      opacity: 0.9;
    }

    .promo-value {
      font-size: 20px;
      font-weight: 700;
    }
  }

  .feature-list {
    list-style: none;
    padding: 0;
    margin-left: 68px;
    margin-right: 76px;

    img {
      width: 24px;
      height: 24px;
      display: flex;
    }

    li {
      display: flex;
      gap: 14px;
      margin-bottom: 28px;
      font-size: 16px;
      opacity: 0.95;

      .icon {
        font-size: 20px;
        display: flex;
        align-items: center;
      }
    }
  }
}

/* ====== 右侧面板 ====== */
.right-panel {
  width: 480px;
  background: #fff;
  border-radius: 0 24px 24px 0;
  margin-left: -20px;
  padding: 40px 40px 30px 60px;
  display: flex;
  flex-direction: column;
  z-index: 1;
  position: relative;
  box-sizing: border-box;

  .close-btn {
    position: absolute;
    top: 25px;
    right: 25px;
    background: none;
    border: none;
    font-size: 22px;
    color: #ccc;
    cursor: pointer;

    &:hover {
      color: #666;
    }
  }
}

/* 顶部开关 */
.account-type-switch {
  display: flex;
  background: #f1f4f9;
  border-radius: 30px;
  padding: 4px;
  align-self: center;
  margin-bottom: 35px;
  position: relative;
  z-index: 1;

  &::before {
    content: '';
    position: absolute;
    top: 4px;
    left: 4px;
    width: calc(50% - 4px);
    height: calc(100% - 8px);
    background: #4a85f6;
    border-radius: 25px;
    box-shadow: 0 4px 10px rgba(74, 133, 246, 0.2);
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    z-index: -1;
  }

  &.team::before {
    transform: translateX(100%);
  }

  .switch-item {
    padding: 8px 30px;
    border-radius: 25px;
    font-size: 14px;
    color: #8e97a7;
    cursor: pointer;
    transition: color 0.3s ease;

    &.active {
      color: #fff;
    }
  }
}

/* Tabs */
.login-method-tabs {
  display: flex;
  justify-content: center;
  gap: 60px;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 30px;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    bottom: -1px;
    left: 50%;
    margin-left: -32px;
    width: 64px;
    height: 3px;
    background: #3bb1ff;
    border-radius: 2px;
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  &.qrcode::after {
    transform: translateX(-62px);
  }

  &.phone::after {
    transform: translateX(62px);
  }

  .tab-item {
    padding-bottom: 12px;
    font-size: 16px;
    color: #999;
    cursor: pointer;
    transition: color 0.3s ease;

    &.active {
      color: #3bb1ff;
      font-weight: 600;
    }
  }
}

@keyframes formFadeIn {
  from {
    opacity: 0;
    transform: translateY(4px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.qrcode-section,
.form-section {
  animation: formFadeIn 0.35s ease-out forwards;
}

.method-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* ====== 扫码区域 ====== */
.qrcode-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 10px;

  .qrcode-container {
    width: 200px;
    height: 200px;
    border: 1px solid #3bb1ff;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 20px;
    background: #fff;
  }

  .qrcode-instruction {
    text-align: center;
    margin-bottom: 30px;

    .wechat-hint {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      font-size: 15px;
      color: #333;
      margin-bottom: 8px;

      .wechat-icon {
        color: #07c160;
        font-size: 18px;

        img {
          width: 18px;
          padding-bottom: 4px;
        }
      }
    }

    .sub-hint {
      font-size: 13px;
      color: #999;
    }
  }
}

/* ====== 表单通用样式 ====== */
.form-section {
  width: 328px;
  margin: 0 auto;

  .input-block {
    margin-bottom: 20px;

    .block-label {
      display: block;
      font-size: 13px;
      color: #666;
      margin-bottom: 8px;
    }

    .label-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;

      .block-label {
        margin-bottom: 0;
      }

      .mode-switch-btn {
        font-size: 12px;
        color: #999;
        background-color: #f2f2f2;
        padding: 4px 10px;
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.3s;
        user-select: none;

        &:hover {
          background-color: #e5e5e5;
          color: #666;
        }
      }

      .link-group {
        display: flex;
        align-items: center;
        gap: 8px;

        .link-divider {
          width: 1px;
          height: 10px;
          background: #ccc;
        }
      }

      .action-link {
        font-size: 12px;
        color: #999;
        text-decoration: none;

        &:hover {
          color: #3bb1ff;
        }
      }
    }

    .input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      height: 49px;
      padding: 0 16px;
      background: #ffffff;
      transition: 0.3s;

      &:focus-within {
        border-color: #3bb1ff;
      }

      &.has-error,
      &.has-error:focus-within {
        border-color: #ff4d4f !important;
      }

      input {
        border: none;
        outline: none;
        flex: 1;
        font-size: 14px;
        width: 100%;
        color: #333;
        background: transparent;
        caret-color: #111;

        &::placeholder {
          color: #ccc;
        }
      }

      .eye-icon {
        color: #999;
        cursor: pointer;
        display: flex;
        align-items: center;

        .eye-img {
          width: 24px;
          height: 24px;
          display: block;
        }

        &:hover {
          color: #666;
        }
      }
    }

    /* 报错红字样式 */
    .error-text {
      color: #ff4d4f;
      font-size: 12px;
      margin-top: 6px;
    }
  }

  /* 特定输入框覆盖 */
  .phone-input-wrapper {
    margin-bottom: 24px;

    .country-code {
      color: #adb3bd;
      font-weight: 500;
      font-size: 14px;
    }

    .divider {
      width: 1px;
      height: 16px;
      background: #eee;
      margin: 0 12px;
    }
  }

  .code-input-wrapper {
    padding-right: 6px;

    .get-code-btn {
      background: #e8f4ff;
      color: #3bb1ff;
      border: none;
      padding: 6px 14px;
      border-radius: 6px;
      font-size: 13px;
      cursor: pointer;

      &:disabled {
        background: #f5f5f5;
        color: #ccc;
      }
    }
  }

  .submit-btn {
    width: 100%;
    height: 48px;
    background: #0d2139;
    color: #fff;
    border: none;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;

    &:hover {
      opacity: 0.9;
    }
  }
}

/* 填写邀请码注册 */
.invite-link-wrap {
  text-align: center;
  margin: 10px 0 20px 0;

  .invite-link {
    color: #3bb1ff;
    text-decoration: none;
    font-size: 14px;
    font-weight: 600;
    border-radius: 24px;
    background-color: #fff;
    padding: 4px 12px;
    display: inline-block;
  }
}

/* 团队登录 */
.team-form-section {
  margin-top: 10px;

  .team-submit-btn {
    margin-top: 30px;
  }
}

/* 底部协议 */
.footer-agreement {
  margin-top: auto;
  text-align: center;
  padding-top: 20px;

  .agreement {
    font-size: 12px;
    color: #999;

    a {
      color: #3bb1ff;
    }
  }
}

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
</style>
