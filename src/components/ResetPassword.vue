<template>
  <div class="reset-password-overlay">
    <div class="reset-password-modal">
      <button class="close-btn">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M1 1L13 13M1 13L13 1" stroke="#999999" stroke-width="1.5" stroke-linecap="round"
            stroke-linejoin="round" />
        </svg>
      </button>

      <h2 class="modal-title">重置密码</h2>

      <div class="form-container">
        <div class="form-group">
          <label class="form-label">手机号</label>
          <div class="input-wrapper">
            <span class="prefix">+86</span>
            <span class="divider"></span>
            <input type="number" maxlength="11" v-model="formData.phone" class="form-input" placeholder="请输入手机号" />
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">验证码</label>
          <div class="input-wrapper">
            <input maxlength="4" v-model="formData.code" type="number" class="form-input" placeholder="请输入验证码" />
            <button @click='GetSmSCode' :disabled="!formData.phone || isCounting" class="get-code-btn">
              {{
                isCounting
                  ? t('LoginPopUpPage.smsCountdown', { seconds: countdown })
                  : t('LoginPopUpPage.getVerificationCode')
              }}
            </button>
          </div>
        </div>
        something
        <div class="form-group">
          <label class="form-label">
            新密码 <span class="label-hint">6-20个数字、字母组成</span>
          </label>
          <div class="input-wrapper">
            <input :type="onePasswordInputType" v-model="formData.password" class="form-input" placeholder="请输入密码" />
            <span class="icon-eye" @click="oneShowPersonalPwd = !oneShowPersonalPwd">
              <img :src="oneShowPersonalPwd ? iconEyeClose : iconEyesOpen" alt="" />
            </span>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">确认密码</label>
          <div class="input-wrapper">
            <input :type="TwoPasswordInputType" v-model="formData.twoPassword" class="form-input"
              placeholder="请再次输入密码确认" />
            <span class="icon-eye" @click="twoShowPersonalPwd = !twoShowPersonalPwd">
              <img :src="twoShowPersonalPwd ? iconEyeClose : iconEyesOpen" alt="" />
            </span>
          </div>
        </div>

        <button @click="resetPassword()" class="submit-btn">重置密码</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
import iconEyesOpen from '@/assets/images/login_popup/eyes.png'
import iconEyeClose from '@/assets/images/login_popup/eye_close.png'

// 密码显示切换状态
import { changePwdBySms, getSmsCodeApi } from "@/api/userLogin";
import { reactive, ref, computed } from "vue";
const oneShowPersonalPwd = ref(false)
const twoShowPersonalPwd = ref(false)
// 表单数据
const formData = reactive({
  phone: '',
  code: '',
  password: '',
  twoPassword: '',
})

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
    if (!formData.phone || !Number.isInteger(mobile)) {
      ElMessage.warning("？")
      return
    }
    const res = await getSmsCodeApi(mobile)
    if (String((res as any).code) === '0000') {
      ElMessage.success('验证码已发送')
      // 启动 120s 倒计时
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


const resetPassword = async () => {
  //定义校验规则字典
  const rules = [
    { isInvalid: !formData.phone, msg: "请输入手机号" },
    { isInvalid: !formData.code, msg: "请输入验证码" },
    { isInvalid: !formData.password, msg: "请输入密码" },
    { isInvalid: !formData.twoPassword, msg: "请再次输入密码" },
    { isInvalid: formData.password !== formData.twoPassword, msg: "两次输入的密码不一致，请重新输入" },
  ]
  // 遍历校验
  const errorRule = rules.find(rule => rule.isInvalid)
  if (errorRule) {
    ElMessage.warning(errorRule.msg)
  }
  try {
    await changePwdBySms({
      mobile: formData.phone,
      verifyCode: Number(formData.code),
      newPwd: Number(formData.password),
      newPwdAgain: Number(formData.twoPassword)
    })
    ElMessage.success('修改成功')
  } catch (e) {
    console.error('login error', e)
  }
}
</script>

<style lang="scss" scoped>
.reset-password-overlay {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: rgba(0, 0, 0, 0.6);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}

//主体
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

  //输入框外层
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

    //手机号前缀
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

    //内部输入框
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

    .get-code-btn {
      height: 32px;
      padding: 0 16px;
      background-color: rgba(184, 222, 240, 1);
      color: rgba(255, 255, 255, 1);
      border: none;
      border-radius: 4px;
      font-size: 14px;
      font-weight: bold;
      cursor: pointer;
      white-space: nowrap;
      transition: background-color 0.2s;

      &:hover {
        background: #A6D4E7;
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
  background: rgba(11, 80, 112, 1);
  color: rgba(173, 179, 189, 1);
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background: #0E425B;
  }
}
</style>
