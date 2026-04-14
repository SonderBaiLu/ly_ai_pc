<template>
  <div class="login-overlay">
    <div class="login-modal">
      <div class="left-panel">
        <div class="brand-logo">
          <span class="logo-icon">
            <img :src="images.lingyan" alt=""/>
          </span>
        </div>
        <h1 class="main-title">{{ t('LoginPopUpPage.mainTitle') }}</h1>
        <div class="promo-box">
          <span class="promo-text">{{ t('LoginPopUpPage.promoText') }}</span>
          <span class="promo-value">{{ t('LoginPopUpPage.promoValue') }}</span>
        </div>
        <ul class="feature-list">
          <li>
            <span class="icon"><img src="/src/assets/images/login_popup/layered.png" alt=""/></span>
            <span>{{ t('LoginPopUpPage.simplifyDesign') }}</span>
          </li>
          <li>
            <span class="icon"><img src="/src/assets/images/login_popup/clothes.png" alt=""/></span>
            <span>{{ t('LoginPopUpPage.aiEmpowerment') }}</span>
          </li>
          <li>
            <span class="icon"><img src="/src/assets/images/login_popup/shopping.png" alt=""/></span>
            <span>{{ t('LoginPopUpPage.loginRewards') }}</span>
          </li>
          <li>
            <span class="icon"><img src="/src/assets/images/login_popup/pen.png" alt=""/></span>
            <span>{{ t('LoginPopUpPage.backToEssence') }}</span>
          </li>
        </ul>
      </div>

      <div class="right-panel">
        <button  class="close-btn" @click="handleClose">✕</button>

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
              <div v-if="qrStatus === 'loading'" class="qrcode-mask loading-mask">
                <span>加载中...</span>
              </div>

              <img v-if="qrCodeImg && qrStatus !== 'loading' && qrStatus !== 'scanned'" :src="qrCodeImg"
                   class="qrcode-image" alt="微信登录二维码"/>
              <div v-if="qrStatus === 'scanned'" class="qrcode-mask scanned-mask">
                <!--                <img class="success-icon"  src=" " alt="二维码过期"/>-->
                <div class="scanned-title">扫描成功</div>
                <div class="scanned-desc">关注「灵衍 AI」即可登录</div>
              </div>

              <div v-if="qrStatus === 'expired'" class="qrcode-mask expired-mask" @click="initQrCode"
                   title="点击刷新二维码">
                <div class="refresh-icon-wrapper">
                  <img :src="images.recaptureQR" alt=""/>
                </div>
              </div>
            </div>

            <div class="qrcode-instruction" v-if="qrStatus !== 'scanned'">
              <div class="wechat-hint">
                <span class="wechat-icon">
                  <img src="@/assets/images/login_popup/weixin.png" alt=""/>
                </span>
                <span>打开微信 扫一扫登录</span>
              </div>
              <p class="sub-hint">扫码关注「灵衍AI」公众号完成登录</p>
            </div>

            <div class="invite-link-wrap qrcode-invite">
              <a @click.prevent="openInviteLink" class="invite-link">
                {{ confirmedInviteCode ? `邀请码: ${confirmedInviteCode}` : t('LoginPopUpPage.inviteLink') }}
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
                       maxlength="11" @input="handlePhoneInput"/>
              </div>
              <div v-if="codeErrorMsg && phoneLoginType === 'code'" class="error-text">
                {{ codeErrorMsg }}
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
                       :placeholder="t('LoginPopUpPage.enterTheVerificationCode')"/>
                <button type="button" @click.prevent="GetSmSCode" class="get-code-btn"
                        :disabled="!formData.phone || isCounting || isGettingCode">
                  {{
                  isGettingCode ? '发送中...' :
                  isCounting ? t('LoginPopUpPage.smsCountdown', {seconds: countdown}) :
                  t('LoginPopUpPage.getVerificationCode')
                  }}
                </button>

              </div>
            </div>

            <div v-if="phoneLoginType === 'password'" class="input-block">
              <div v-if="pwdErrorMsg" class="error-text error-top">
                {{ pwdErrorMsg }}
              </div>
              <div class="label-row">
                <label class="block-label">{{ t('LoginPopUpPage.passwordLabel') }}</label>
                <div class="link-group">
                  <a href="#" class="action-link" @click.prevent="phoneLoginType = 'code'">
                    {{ t('LoginPopUpPage.codeLogin') }}
                  </a>
                  <span class="link-divider"></span>
                  <a @click="forgotPassword()" class="action-link">{{ t('LoginPopUpPage.forgotPassword') }}</a>
                </div>
              </div>
              <!--              :class="{ 'has-error': pwdErrorMsg }" -->
              <div class="input-wrapper">
                <input :type="showPersonalPwd ? 'text' : 'password'" v-model="formData.password"
                       :placeholder="t('LoginPopUpPage.passwordPlaceholder')" @input="clearPwdError"/>
                <span class="eye-icon" @click="showPersonalPwd = !showPersonalPwd">
                  <img :src="showPersonalPwd ? images.eye : images.eyeClose" alt="" class="eye-img"/>
                </span>
              </div>
            </div>
            <div class="invite-link-wrap">
              <a @click.prevent="openInviteLink" class="invite-link">
                {{ confirmedInviteCode ? `邀请码: ${confirmedInviteCode}` : t('LoginPopUpPage.inviteFill') }}
              </a>
            </div>
            <button class="submit-btn" @click.prevent="handleSubmit" :disabled="isSubmitting">
              {{ t('LoginPopUpPage.loginOrRegister') }}
            </button>
          </div>

          <div v-if="accountType === 'team'" class="form-section team-form-section">
            <div class="input-block">
              <label class="block-label">{{ t('LoginPopUpPage.teamAccountLabel') }}</label>
              <div class="input-wrapper">
                <input type="text" v-model="formData.teamAccount"
                       :placeholder="t('LoginPopUpPage.teamAccountPlaceholder')"/>
              </div>
            </div>

            <div class="input-block">
              <label class="block-label">{{ t('LoginPopUpPage.teamPasswordLabel') }}</label>
              <div class="input-wrapper" :class="{ 'has-error': teamErrorMsg }">
                <input :type="showTeamPwd ? 'text' : 'password'" v-model="formData.teamPassword"
                       :placeholder="t('LoginPopUpPage.teamPasswordPlaceholder')" @input="clearTeamError"/>
                <span class="eye-icon" @click="showTeamPwd = !showTeamPwd">
                  <img :src="showTeamPwd ? images.eye : images.eyeClose" alt="" class="eye-img"/>
                </span>
              </div>
              <div v-if="teamErrorMsg" class="error-text">
                {{ teamErrorMsg }}
              </div>
            </div>

            <button class="submit-btn team-submit-btn" @click.prevent="handleTeamSubmit" :disabled="isTeamSubmitting">
              {{ t('LoginPopUpPage.teamLoginButton') }}
            </button>
          </div>
        </div>

        <div class="footer-agreement">
          <div class="agreement">
            {{ t('LoginPopUpPage.agreement') }}
            <a href="#" @click.prevent="goAgreement('USER_AGREEMENT')">{{ t('LoginPopUpPage.userAgreement') }}</a>
            {{ t('LoginPopUpPage.and') }}
            <a href="#" @click.prevent="goAgreement('PRIVACY_POLICY')">{{ t('LoginPopUpPage.userPolicy') }}</a>
          </div>
        </div>
      </div>
    </div>
    <Transition name="modal">
      <ResetPassword
          v-if="dialogs.isVisible"
          :open-id="openId"
          :mode="currentMode"
          :confirmedInviteCode="confirmedInviteCode"
          @success="handleBindSuccess"
          @close="dialogs.isVisible = false"/>
    </Transition>
    <InvitationCode v-if="dialogs.invitation" @update:visible="dialogs.invitation = $event"
                    @confirm="handleInviteConfirm"/>
  </div>
</template>

<script setup lang="ts">
import {useI18n} from 'vue-i18n'
import {useRouter} from 'vue-router'
import {ElMessage} from 'element-plus'
import {getSmsCodeApi, getUserWechat, getWechatQrCodeApi} from '@/api/userLogin'
import {useUserStore} from "@/stores/user"
import {images} from '@/assets'
import {enMessages, userLanguageToI18nLocale, zhMessages} from '@/i18n'
import ResetPassword from '@/components/ResetPassword.vue'
import InvitationCode from '@/components/InvitationCode.vue'

// ==========================================
// 1. 全局配置与基础状态
// ==========================================
const userStore = useUserStore()
const {t, locale} = useI18n({
  useScope: 'local',
  inheritLocale: false,
  messages: {
    'zh-chs': zhMessages,
    en: enMessages,
  },
})
const router = useRouter()
const emit = defineEmits(['close'])
const accountType = ref<'personal' | 'team'>('personal') // 账号类型：个人 / 团队
const loginMethod = ref<'qrcode' | 'phone'>('phone')     // 个人登录方式：扫码 / 手机
const phoneLoginType = ref<'code' | 'password'>('code')  // 手机登录方式：验证码 / 密码

// 控制所有弹窗显示状态
const dialogs = reactive({
  isVisible: false,
  invitation: false, // 邀请码弹窗
})
const currentMode = ref('0') // 忘记密码模式
const openId = ref('0') // 这个变量给ResetPassword页面的绑定手机号调用的接口使用，变量名和接口文档字段名称一样

// 登录弹窗语言仅跟随用户偏好；未登录/无偏好时默认中文
watch(
  () => userStore.userInfo?.language,
  (userLang) => {
    locale.value = userLanguageToI18nLocale(userLang)
  },
  {immediate: true},
)

// 统一关闭弹窗的方法
const handleClose = () => {
  emit('close')
}

const goAgreement = (type: 'USER_AGREEMENT' | 'PRIVACY_POLICY') => {
  handleClose()
  router.push({
    path: '/agreement',
    query: {type},
  })
}

// ==========================================
// 2. 微信扫码登录逻辑模块
// ==========================================
const qrCodeImg = ref('')
const sceneId = ref('') // 轮询参数
const qrStatus = ref<'loading' | 'waiting' | 'scanned' | 'expired'>('loading')
let qrCodeTimer: ReturnType<typeof setInterval> | null = null
const qrCountdown = ref(0) // 二维码剩余有效秒数
let qrCountdownTimer: ReturnType<typeof setInterval> | null = null // 倒计时定时器 二维码过期

// 开启倒计时的方法
const startQrCountdown = (expireSeconds: number) => {
  if (qrCountdownTimer) clearTimeout(qrCountdownTimer)
  qrCountdown.value = expireSeconds

  qrCountdownTimer = setInterval(() => {
    qrCountdown.value--
    if (qrCountdown.value <= 0) {
      // 倒计时归零：清理倒计时、清理轮询、将状态置为过期
      clearTimeout(qrCountdownTimer!)
      qrCountdownTimer = null

      if (qrCodeTimer) {
        clearTimeout(qrCodeTimer)
        qrCodeTimer = null
      }
      qrStatus.value = 'expired'
    }
  }, 1000)
}

const initQrCode = async () => {
  qrStatus.value = 'loading' // 刚进函数应该是 装载 状态
  if (qrCodeTimer) clearTimeout(qrCodeTimer)
  if (qrCountdownTimer) clearTimeout(qrCountdownTimer)
  try {
    const res = await getWechatQrCodeApi()
    qrCodeImg.value = res.data.qrUrl
    sceneId.value = res.data.sceneId
    const expireTime = res.data.expire || 600
    console.log('二维码过期时间', res.data.expire)
    console.log('二维码过期时间', expireTime)
    startQrCountdown(expireTime)
    qrStatus.value = 'waiting'; // 等待扫码
    startPolling() // 获取成功后开始轮询
  } catch {
    ElMessage.error('获取二维码失败，请重试')
    qrStatus.value = 'expired'
  }
}

const startPolling = () => {
  // 定义一个内部的异步轮询函数
  const poll = async () => {
    try {
      const res = await getUserWechat({sceneId: sceneId.value})
      if (String((res as any).code) === '0000') {
        const apiStatus = res.data.status;
        if (apiStatus === 0) {
          qrStatus.value = 'waiting';
          // 只要还是 waiting 状态，就在 2 秒后安排下一次 poll
          qrCodeTimer = setTimeout(poll, 2000);
        } else if (apiStatus === 1) {
          // 扫码成功，此时不需要再设定下一个 setTimeout 了
          if (res.data.mobileStatus) {
            qrStatus.value = 'expired';
            dialogs.isVisible = true;
            currentMode.value = '3';
            openId.value = res.data.openId;
            ElMessage.success('扫码成功，请绑定手机号');
          } else {
            const accessToken = res.data.accessToken;
            if (accessToken) {
              userStore.setToken(accessToken);
            }
            try {
              await userStore.getUserInfo();
              ElMessage.success('登录成功');
              emit('close');
              await router.push('/').catch(() => {
              });
            } catch (e: any) {
              ElMessage.error(e.message);
            }
          }

        } else if (Number(apiStatus === -1)) {
          qrStatus.value = 'expired';
          // 二维码失效，不用再设定 setTimeout
        }
      }
    } catch (e) {
      console.error('查询状态异常', e);
      // 就算报错了（比如网络波动断了一下），也要在 2 秒后继续尝试
      qrCodeTimer = setTimeout(poll, 2000);
    }
  };

  // 启动第一次请求
  poll();
}


// 处理 ResetPassword 组件绑定成功后的回调 接收子组件传来的 mode 参数
const handleBindSuccess = async (mode: string) => {
  try {
    dialogs.isVisible = false; // 关掉弹窗

    // 只有模式 3(扫码后绑定手机号) 才会有新 token 并需要拉取用户信息
    if (mode === '3') {
      await userStore.getUserInfo();
      ElMessage.success('登录成功');
      emit('close'); // 关闭整个登录大弹窗
      await router.push('/').catch(() => {
      });
    } else {
      // 模式 0, 1, 2 (重置/修改密码) 成功后，不需要拉取用户信息
      // 只需要引导用户回到密码登录界面即可
      loginMethod.value = 'phone';
      phoneLoginType.value = 'password';
    }
  } catch (e: any) {
    ElMessage.error(e.message);
  }
}

// 监听登录方式切换，决定是否请求二维码和清理定时器
watch(loginMethod, (newMethod) => {
  if (newMethod === 'qrcode') {
    initQrCode()
  } else {
    if (qrCodeTimer) {
      clearTimeout(qrCodeTimer)
      qrCodeTimer = null
    }
    // 补充清理倒计时
    if (qrCountdownTimer) {
      clearTimeout(qrCountdownTimer)
      qrCountdownTimer = null
    }
  }
})

// 组件销毁前必须清理二维码定时器
onBeforeUnmount(() => {
  if (qrCodeTimer) clearTimeout(qrCodeTimer)
})

// ==========================================
// 3. 手机号/验证码/密码 登录表单模块
// ==========================================
const formData = reactive({
  phone: '',
  code: '',
  password: '',
  teamAccount: '',
  teamPassword: '',
})
// ---  Loading 状态 ---  登录按钮  获取验证码按钮
const isGettingCode = ref(false)    // 获取验证码的 loading
const isSubmitting = ref(false)     // 个人登录的 loading
const isTeamSubmitting = ref(false) // 团队登录的 loading

// UI ---交互状态 ---
const showPersonalPwd = ref(false)
const pwdErrorMsg = ref('')
const codeErrorMsg = ref('')

const clearPwdError = () => pwdErrorMsg.value = ''

// 切换手机登录方式时清空报错
watch(phoneLoginType, () => {
  pwdErrorMsg.value = ''
  codeErrorMsg.value = ''
})

// 限制手机号只允许数字且最长 11 位
const handlePhoneInput = () => {
  formData.phone = formData.phone.replace(/\D/g, '').slice(0, 11)
}

// 发送短信验证码
const isCounting = ref(false)
const countdown = ref(120)
let smsTimer: ReturnType<typeof setInterval> | null = null

const GetSmSCode = async () => {
  const mobile = Number(formData.phone)
  if (!formData.phone || !Number.isInteger(mobile)) {
    ElMessage.warning(t('LoginPopUpPage.enterPhoneNumber'))
    return
  }
  isGettingCode.value = true // 开启 loading 防抖
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
        }
      }, 1000)
    } else {
      ElMessage.error("验证码发送失败")
    }
  } catch (e) {
    console.error('getSmsCode error', e)
  } finally {
    isGettingCode.value = false // 无论成功失败，解除 loading
  }
}

// 个人登录提交 (区分验证码和密码)
const handleSubmit = async () => {
  if (!formData.phone) return ElMessage.warning(t('LoginPopUpPage.enterPhoneNumber'))
  isSubmitting.value = true
  try {
    if (phoneLoginType.value === 'code') {
      if (!formData.code) return ElMessage.error(t('LoginPopUpPage.enterTheVerificationCode'))
      const res = await userStore.loginWithSms(formData.phone, formData.code, confirmedInviteCode.value)
      if (String((res as any).code) === '0000') {
        ElMessage.success(t('LoginPopUpPage.loginSuccess') || '登录成功')
        emit('close')
      } else {
        codeErrorMsg.value = res as any
      }
    } else {
      if (!formData.password) return ElMessage.error(t('LoginPopUpPage.passwordPlaceholder') || '请输入密码')
      const res = await userStore.loginWithPassword(formData.phone, formData.password,confirmedInviteCode.value)
      if (String((res as any).code) === '0000') {
        ElMessage.success(t('LoginPopUpPage.loginSuccess') || '登录成功')
        emit('close')
      } else {
        pwdErrorMsg.value = res as any
      }
    }
  } catch (e: any) {
    const errorMsg = e.msg || e.response?.data?.msg || e.message || '登录失败，请重试'
    if (phoneLoginType.value === 'password') {
      pwdErrorMsg.value = errorMsg
    } else if (phoneLoginType.value === 'code') {
      codeErrorMsg.value = errorMsg
    }
  } finally {
    isSubmitting.value = false // 解除 loading
  }
}

// 清理短信定时器
onUnmounted(() => {
  if (smsTimer) clearInterval(smsTimer)
})

// ==========================================
// 4. 团队登录模块
// ==========================================
const showTeamPwd = ref(false)
const teamErrorMsg = ref('')

const clearTeamError = () => teamErrorMsg.value = ''

const handleTeamSubmit = async () => {
  teamErrorMsg.value = ''
  if (!formData.teamAccount) return ElMessage.warning(t('LoginPopUpPage.teamAccountPlaceholder'))
  if (!formData.teamPassword) return ElMessage.warning(t('LoginPopUpPage.teamPasswordPlaceholder'))
  isTeamSubmitting.value = true //  开启 loading
  try {
    const res = await userStore.teamLogin(formData.teamAccount, formData.teamPassword)
    if (String((res as any).code) === '0000') {
      ElMessage.success(t('LoginPopUpPage.loginSuccess') || '登录成功')
      emit('close')
    } else {
      teamErrorMsg.value = (res as any).msg
    }
  } catch {
    teamErrorMsg.value = "登录失败，请重试"
  } finally {
    isTeamSubmitting.value = false //  解除 loading
  }
}

// 5. 邀请码与其他辅助模块
// ==========================================
const confirmedInviteCode = ref('') // 保存用户填写的邀请码

const openInviteLink = () => {
  dialogs.invitation = true
}

const handleInviteConfirm = (code: string) => {
  confirmedInviteCode.value = code
  dialogs.invitation = false
}

const forgotPassword = () => {
  dialogs.isVisible = true;
  currentMode.value = '0'
}
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
      font-size: 18px;
      color: rgba(255, 255, 255, 1);
      font-family: NotoSans-bold;
      text-align: justify;
      font-weight: 700;

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
    position: relative;
    width: 200px;
    height: 200px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 20px;
    overflow: hidden;
    border-radius: 8px 8px 8px 8px;
    background-color: rgba(255, 255, 255, 1);
    border: 1px solid rgba(243, 244, 246, 1);


    .qrcode-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    /* 状态遮罩层（加载中 / 已过期） */
    .qrcode-mask {
      position: absolute;
      inset: 0;
      background: rgba(255, 255, 255, 0.9);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      color: #666;
      z-index: 10;
    }

    .expired-mask {
      background: rgba(0, 0, 0, 0.6) !important;
      cursor: pointer;
      transition: background 0.3s;

      &:hover {
        background: rgba(0, 0, 0, 0.7) !important;

        .refresh-icon-wrapper {
          transform: rotate(90deg);
        }
      }

      .refresh-icon-wrapper {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      }

      .refresh-btn {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        background: transparent;
        border: none;

        svg {
          width: 50px;
          height: 50px;
        }
      }

      .refresh-btn {
        margin-top: 12px;
        padding: 6px 16px;
        background: #3bb1ff;
        border: none;
        color: #fff;
        border-radius: 4px;
        cursor: pointer;

        &:hover {
          background: #2a9df4;
        }
      }
    }
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
      font-size: 11px;
      margin-top: 6px;

    }

    .error-top {
      margin-top: -9px;
      padding-bottom: 19px;
      margin-bottom: 6px;
    }
  }

  /* 特定输入框覆盖 */
  .phone-input-wrapper {
    margin-bottom: 9px;

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
