<template>
  <div class="reset-password-overlay">
    <div class="reset-password-modal">
      <button class="close-btn" @click="closeModal">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M1 1L13 13M1 13L13 1" stroke="#999999" stroke-width="1.5" stroke-linecap="round"
                stroke-linejoin="round" />
        </svg>
      </button>

      <h2 class="modal-title">{{ modalTitle }}</h2>

      <div class="form-container">
        <div class="form-group" v-if="modeType === '0' || modeType === '1'">
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
            />
          </div>
        </div>

        <div class="form-group" v-if="modeType === '2'">
          <label class="form-label">账号名</label>
          <div class="input-wrapper disabled-wrapper">
            <input type="text" v-model="formData.accountName" class="form-input" disabled=""/>
          </div>
        </div>

        <div class="form-group" v-if="modeType === '0'">
          <label class="form-label">验证码</label>
          <div class="input-wrapper">
            <input maxlength="4" v-model="formData.code" type="tel" class="form-input" placeholder="请输入验证码" />
            <button @click='GetSmSCode' :disabled="!formData.phone || isCounting" class="get-code-btn">
              {{
                isCounting
                    ? t('LoginPopUpPage.smsCountdown', { seconds: countdown })
                    : t('LoginPopUpPage.getVerificationCode')
              }}
            </button>
          </div>
        </div>

        <div class="form-group" v-if="modeType === '1' || modeType === '2'">
          <label class="form-label">旧密码</label>
          <div class="input-wrapper">
            <input type="password" v-model="formData.oldPassword" class="form-input" placeholder="请输入旧密码" />
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">
            新密码 <span class="label-hint">6-20个数字、字母组成</span>
          </label>
          <div class="input-wrapper">
            <input :type="onePasswordInputType" v-model="formData.onepassword" class="form-input" placeholder="请输入密码" />
            <span class="icon-eye" @click="oneShowPersonalPwd = !oneShowPersonalPwd">
              <img :src="oneShowPersonalPwd ? images.eye : images.eyeClose" alt="" />
            </span>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">确认密码</label>
          <div class="input-wrapper">
            <input :type="TwoPasswordInputType" v-model="formData.twoPassword" class="form-input"
                   placeholder="请再次输入密码确认" />
            <span class="icon-eye" @click="twoShowPersonalPwd = !twoShowPersonalPwd">
              <img :src="twoShowPersonalPwd ? images.eye : images.eyeClose" alt="" />
            </span>
          </div>
        </div>

        <button @click="resetPassword" class="submit-btn">重置密码</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onUnmounted } from 'vue'
import { images } from '@/assets'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus';
import { changePwdBySms, getSmsCodeApi } from "@/api/userLogin";
import userApi from '@/api/user';
import { useUserStore } from '@/stores/user';

const userStore = useUserStore()
const { t } = useI18n()

// 有三种模式
// 0 = "用户第一次手机号注册 没有密码时候弹"
// 1 = "用户修改密码 有密码的时候"
// 2 = "团队修改密码"
const props = defineProps({
  mode: {
    type: String,
    default: '0' // 默认为模式 0
  },
  // 接收从设置页面传来的标识
  isFromSettings: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['close']) //定义抛出给父组件的关闭事件
const modeType = ref<'0' | '1' | '2'>(props.mode as '0')

// 标题修改
const modalTitle = computed(() => {
  switch (modeType.value) {
    case '0':
      return '重置密码'
    case '1':
      return '修改密码'
    case '2':
      return '修改密码'
    default:
      return '修改密码'
  }
})

// 密码显示切换状态
const oneShowPersonalPwd = ref(false)
const twoShowPersonalPwd = ref(false)

// 表单数据
const formData = reactive({
  // 如果是从设置页面来的，自动填入用户当前绑定的手机号
  phone: props.isFromSettings ? (userStore.userInfo?.mobile || '') : '',
  accountName: userStore.userInfo?.accountName || '',
  code: '',
  oldPassword: '',
  onepassword: '',
  twoPassword: '',
})
watch(
    () => props.isFromSettings,
    (isFromSettings) => {
      if (isFromSettings) {
        const info = userStore.userInfo
        if (info) {
          // 这个userName 就是他的手机号
          formData.phone = info.userName
        }
      }
    },
    { immediate: true }
)

const onePasswordInputType = computed(() => {
  return oneShowPersonalPwd.value ? 'text' : 'password';
});
const TwoPasswordInputType = computed(() => {
  return twoShowPersonalPwd.value ? 'text' : 'password';
});

// 短信验证码倒计时
const isCounting = ref(false)
const countdown = ref(120)
let smsTimer: ReturnType<typeof setInterval> | null = null

const GetSmSCode = async () => {
  try {
    const mobile = Number(formData.phone)
    if (!formData.phone || !Number.isInteger(mobile) || String(mobile).length !== 11) {
      ElMessage.warning("请输入正确的手机号")
      return
    }
    const res = await getSmsCodeApi(mobile)
    if (String((res as any).code) === '0000') {
      ElMessage.success('验证码已发送')
      isCounting.value = true;
      countdown.value = 120;
      if (smsTimer) clearInterval(smsTimer)
      smsTimer = setInterval(() => {
        countdown.value -= 1
        if (countdown.value <= 0) {
          if (smsTimer) clearInterval(smsTimer)
          smsTimer = null
          isCounting.value = false
        }
      }, 1000)
    }
  } catch (e) {
    console.error('getSmscode error', e)
  }
}

// 提交逻辑
const resetPassword = async () => {
  // 1. 公共校验：新密码
  if (!formData.onepassword) return ElMessage.warning("请输入密码");
  if (!formData.twoPassword) return ElMessage.warning("请再次输入密码");
  if (formData.onepassword !== formData.twoPassword) {
    return ElMessage.warning("两次输入的密码不一致，请重新输入");
  }

  try {
    // 2. 根据不同模式进行特定校验和 API 请求
    if (modeType.value === '0') {
      if (!formData.phone) return ElMessage.warning("请输入手机号");
      if (!formData.code) return ElMessage.warning("请输入验证码");

      await changePwdBySms({
        mobile: formData.phone,
        verifyCode: Number(formData.code),
        newPwd: Number(formData.onepassword),
        newPwdAgain: Number(formData.twoPassword)
      });
      ElMessage.success('修改成功')
    }
    else if (modeType.value === '1') {
      if (!formData.phone) return ElMessage.warning("请输入手机号");
      if (!formData.oldPassword) return ElMessage.warning("请输入旧密码");
      console.log("oldPwd", formData)
      await userApi.changePwdByOldPwd(
          {
            oldPwd: Number(formData.oldPassword),
            newPwd: Number(formData.onepassword),
            newPwdAgain: Number(formData.twoPassword),
          })
      ElMessage.success('修改成功')
      emit('close')
    }
    else if (modeType.value === '2') {
      // TODO:这里是 团队的 修改密码
      if (!formData.oldPassword) return ElMessage.warning("请输入旧密码");
      console.log('当前登录的用户是：', userStore)
      ElMessage.success('修改成功')
    }
    closeModal()
  } catch (e) {
    console.error('reset error', e)
  }
}

const closeModal = () => {
  // 触发关闭弹窗的事件
  emit('close')
}

onUnmounted(() => {
  if (smsTimer) {
    clearInterval(smsTimer)
    smsTimer = null
  }
})
</script>

<style lang="scss" scoped>
.reset-password-overlay {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: rgba(0, 0, 0, 0.6);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 3119;
}

// 主体
.reset-password-modal {
  position: relative;
  width: 407px;
  background: #FFFFFF;
  border-radius: 16px;
  padding: 48px 40px 52px;
  box-sizing: border-box;

  .close-btn {
    position: absolute;
    top: 24px;
    right: 24px;
    background: none;
    border: none;
    cursor: pointer;
    padding: 4px;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover svg path {
      stroke: #333;
    }
  }

  .modal-title {
    font-size: 24px;
    font-weight: bold;
    color: #1A2233;
    text-align: center;
    margin: 0 0 40px 0;
  }
}

/* 表单区域 */
.form-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;

  .form-label {
    font-size: 14px;
    color: #4A566A;
    font-weight: 500;
    display: flex;
    align-items: center;

    .label-hint {
      margin-left: 8px;
      font-size: 12px;
      color: #99A3B3;
      font-weight: normal;
    }
  }

  // 输入框外层
  .input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
    height: 48px;
    border: 1px solid #D1D8E1;
    border-radius: 8px;
    padding: 0 16px;
    background: #FFFFFF;
    transition: border-color 0.2s;

    &:focus-within {
      border-color: #125474;
    }

    &.disabled-wrapper {
      background: #F5F7FA;

      input {
        color: #99A3B3;
        cursor: not-allowed;
      }
    }

    // 手机号前缀
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

    // 内部输入框
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

      &:disabled {
        background: transparent;
      }
    }

    .get-code-btn {
      height: 32px;
      padding: 0 16px;
      background-color: #B8DEF0;
      color: #FFFFFF;
      border: none;
      border-radius: 4px;
      font-size: 14px;
      font-weight: bold;
      cursor: pointer;
      white-space: nowrap;
      transition: background-color 0.2s;

      &:hover:not(:disabled) {
        background: #A6D4E7;
      }

      &:disabled {
        cursor: not-allowed;
        opacity: 0.8;
      }
    }

    .icon-eye {
      color: #999;
      cursor: pointer;
      display: flex;
      align-items: center;

      img {
        width: 18px;
        height: 18px;
      }

      &:hover {
        color: #666;
      }
    }
  }
}

/* 底部提交按钮 */
.submit-btn {
  margin-top: 16px;
  width: 100%;
  height: 52px;
  background: #0B5070;
  color: #ADB3BD;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background: #0E425B;
    color: #FFFFFF;
  }
}
</style>