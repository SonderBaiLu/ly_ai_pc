<template>
  <div class="login-overlay" @click.self="handleClose">
    <div class="login-modal">
      <div class="left-panel">
        <div class="brand-logo">
<!--          TODO: 目前logo图标中包含文字，导致中英文切换 要修改图片增加服务器压力 考虑是否更换文字 重新设计log图标-->
          <span class="logo-icon"><img src="/src/assets/images/LoginPop-Up/灵衍AIlog.png" alt=""/></span>
<!--
          <span class="logo-text">{{ t('LoginPopUpPage.title') || '灵衍AI' }}</span>
-->
        </div>

        <h1 class="main-title">{{ t('LoginPopUpPage.mainTitle') || '登录即享专属礼遇' }}</h1>

        <div class="promo-box">
          <span class="promo-text">{{ t('LoginPopUpPage.promoText') || '新用户注册免费赠送' }}</span>
          <span class="promo-value">{{ t('LoginPopUpPage.promoValue') || '50灵衍值' }}</span>
        </div>

        <ul class="feature-list">
          <li>
            <span class="icon">
              <img src="/src/assets/images/LoginPop-Up/Layered.png" alt=""/>
            </span>
            <span>{{ t('LoginPopUpPage.simplifyDesign') || '卸下设计繁琐，让每一份创意都能纯粹发光' }}</span>
          </li>
          <li>
            <span class="icon">
              <img  src="/src/assets/images/LoginPop-Up/Clothes.png" alt=""/>
            </span>
            <span>{{ t('LoginPopUpPage.aiEmpowerment') || '解锁AI设计全能力，守护你的每一份时尚热爱' }}</span>
          </li>
          <li>
            <span class="icon">
              <img src="/src/assets/images/LoginPop-Up/Shopping_cart.png" alt=""/>
            </span>
            <span>{{ t('LoginPopUpPage.loginRewards') || '登录有礼，解锁潮流面料+专属设计工具，不负初心' }}</span>
          </li>
          <li>
            <span class="icon">
              <img src="/src/assets/images/LoginPop-Up/Pen.png" alt=""/>
            </span>
            <span>{{ t('LoginPopUpPage.backToEssence') || '让设计回归本质，创作更轻松' }}</span>
          </li>
        </ul>
      </div>

      <div class="right-panel">
        <button class="close-btn" @click="handleClose">✕</button>

        <div class="account-type-switch">
          <div
              class="switch-item"
              :class="{ active: accountType === 'personal' }"
              @click="accountType = 'personal'"
          >个人登录
          </div>
          <div
              class="switch-item"
              :class="{ active: accountType === 'team' }"
              @click="accountType = 'team'"
          >团队登录
          </div>
        </div>

        <div v-if="accountType === 'personal'" class="login-method-tabs">
          <div
              class="tab-item"
              :class="{ active: loginMethod === 'qrcode' }"
              @click="loginMethod = 'qrcode'"
          >扫码登录
          </div>
          <div
              class="tab-item"
              :class="{ active: loginMethod === 'phone' }"
              @click="loginMethod = 'phone'"
          >手机登录
          </div>
        </div>

        <div class="method-content">

          <div v-if="accountType === 'personal' && loginMethod === 'qrcode'" class="qrcode-section">
            <div class="qrcode-container">
              <div class="qrcode-placeholder"></div>
            </div>
            <div class="qrcode-instruction">
              <div class="wechat-hint">
                <span class="wechat-icon">💬</span>
                <span>打开微信 扫一扫登录</span>
              </div>
              <p class="sub-hint">扫码关注「灵衍AI」公众号完成登录</p>
            </div>

            <div class="invite-link-wrap qrcode-invite">
              <a href="#" class="invite-link">填写邀请码注册</a>
            </div>
          </div>

          <div v-if="accountType === 'personal' && loginMethod === 'phone'" class="form-section">
            <div class="input-block">
              <label class="block-label">手机号</label>
              <div class="input-wrapper phone-input-wrapper">
                <span class="country-code">+86</span>
                <div class="divider"></div>
                <input type="text" v-model="formData.phone" placeholder="请输入手机号"/>
              </div>
            </div>

            <div v-if="phoneLoginType === 'code'" class="input-block">
              <div class="label-row">
                <label class="block-label">验证码</label>
                <div class="mode-switch-btn" @click="phoneLoginType = 'password'">密码登录</div>
              </div>
              <div class="input-wrapper code-input-wrapper">
                <input type="text" v-model="formData.code" placeholder="请输入验证码"/>
                <button @click="GetSmSCode" class="get-code-btn" :disabled="!formData.phone">获取验证码</button>
              </div>
            </div>

            <div v-if="phoneLoginType === 'password'" class="input-block">
              <div class="label-row">
                <label class="block-label">密码</label>
                <div class="link-group">
                  <a href="#" class="action-link" @click.prevent="phoneLoginType = 'code'">验证码登录</a>
                  <span class="link-divider"></span>
                  <a href="#" class="action-link">忘记密码?</a>
                </div>
              </div>
              <div class="input-wrapper">
                <input :type="showPersonalPwd ? 'text' : 'password'" v-model="formData.password"
                       placeholder="请输入密码"/>
                <span class="eye-icon" @click="showPersonalPwd = !showPersonalPwd">
                  <svg v-if="showPersonalPwd" viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor"
                                                                                               d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>
                  <svg v-else viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor"
                                                                               d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/></svg>
                </span>
              </div>
            </div>

            <div class="invite-link-wrap">
              <a href="#" class="invite-link">填写邀请码注册</a>
            </div>
            <button class="submit-btn" @click="handleSubmit">登录/注册</button>
          </div>

          <div v-if="accountType === 'team'" class="form-section team-form-section">
            <div class="input-block">
              <label class="block-label">账号名</label>
              <div class="input-wrapper">
                <input type="text" v-model="formData.teamAccount" placeholder="请输入账号名"/>
              </div>
            </div>

            <div class="input-block">
              <label class="block-label">密码</label>
              <div class="input-wrapper" :class="{ 'has-error': formError }">
                <input :type="showTeamPwd ? 'text' : 'password'" v-model="formData.teamPassword"
                       placeholder="请输入密码"/>
                <span class="eye-icon" @click="showTeamPwd = !showTeamPwd">
                  <svg v-if="showTeamPwd" viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor"
                                                                                           d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>
                  <svg v-else viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor"
                                                                               d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/></svg>
                </span>
              </div>
              <div v-if="formError" class="error-text">密码错误，还剩余5次机会，请重新输入</div>
            </div>

            <button class="submit-btn team-submit-btn" @click="handleTeamSubmit">登录</button>
          </div>

        </div>

        <div class="footer-agreement">
          <div class="agreement">
            注册登录即代表同意 <a href="#">《用户协议》</a> 和 <a href="#">《隐私政策》</a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref, reactive} from 'vue';
import {useI18n} from "vue-i18n";

const {t} = useI18n();
const emit = defineEmits(['close']);

// 基础状态
const accountType = ref<'personal' | 'team'>('personal');
const loginMethod = ref<'qrcode' | 'phone'>('phone'); // 测试默认设为phone看效果
const phoneLoginType = ref<'code' | 'password'>('code'); // code (验证码) | password (密码)

// 密码显示切换状态
const showPersonalPwd = ref(false);
const showTeamPwd = ref(false);

// 错误提示状态（示例）
const formError = ref(false);

// 表单数据
const formData = reactive({
  phone: '',
  code: '',
  password: '',
  teamAccount: '',
  teamPassword: ''
});

const GetSmSCode = () => {
  ElMessage.success(formData.phone);
};

const handleClose = () => {
  emit('close');
};

const handleSubmit = () => {
  console.log('个人登录提交:', {
    phone: formData.phone,
    code: formData.code,
    password: formData.password,
    type: phoneLoginType.value
  });
};

const handleTeamSubmit = () => {
  console.log('团队登录提交:', {
    account: formData.teamAccount,
    password: formData.teamPassword
  });
  // 模拟验证失败
  if (formData.teamPassword !== '123456') {
    formError.value = true;
  } else {
    formError.value = false;
  }
};
</script>

<style scoped lang="scss">
/* 基础遮罩与容器样式不变 */
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

/* --- 左侧面板 --- */
.left-panel {
  width: 592px;
  min-height: 627px;
  background: linear-gradient(180deg, #4435FF 0%, #7641F0 100%);
  border-radius: 24px;

  /* 关键修改：移除统一的 padding，仅保留顶部初始距离，并开启 box-sizing */
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

    /* 关键修改：精准定位 Logo (对应图4、图2) */
    margin-left: 29px;
    margin-bottom: 69px;
  }

  .main-title {
    font-size: 40px;
    letter-spacing: 1px;
    line-height: 1.2;

    /* 关键修改：统一左侧缩进，并控制到下方卡片的距离 */
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

    /* 关键修改：对应图3的左右边距标注 (68px / 76px) */
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

    /* 关键修改：列表与上方卡片和标题保持左侧对齐 */
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
/* --- 右侧面板 --- */
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
  background: #F1F4F9;
  border-radius: 30px;
  padding: 4px;
  align-self: center;
  margin-bottom: 35px;

  .switch-item {
    padding: 8px 30px;
    border-radius: 25px;
    font-size: 14px;
    color: #8E97A7;
    cursor: pointer;
    transition: 0.3s;

    &.active {
      background: #4A85F6;
      color: #fff;
      box-shadow: 0 4px 10px rgba(74, 133, 246, 0.2);
    }
  }
}

/* Tabs */
.login-method-tabs {
  display: flex;
  justify-content: center;
  gap: 60px;
  border-bottom: 1px solid #F0F0F0;
  margin-bottom: 30px;

  .tab-item {
    padding-bottom: 12px;
    font-size: 16px;
    color: #999;
    cursor: pointer;
    position: relative;

    &.active {
      color: #3BB1FF;
      font-weight: 600;

      &::after {
        content: '';
        position: absolute;
        bottom: -1px;
        left: 0;
        width: 100%;
        height: 3px;
        background: #3BB1FF;
        border-radius: 2px;
      }
    }
  }
}

/* 内容区域 */
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
    border: 1px solid #3BB1FF;
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
        color: #07C160;
        font-size: 18px;
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
        background-color: #F2F2F2;
        padding: 4px 10px;
        border-radius: 4px;
        cursor: pointer; /* 鼠标悬停时显示为小爪子 */
        transition: all 0.3s;
        user-select: none;

        &:hover {
          background-color: #E5E5E5; /* 鼠标悬浮北京变色 */
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
          color: #3BB1FF;
        }
      }
    }

    .input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
      border: 1px solid #E5E7EB;
      border-radius: 8px;
      height: 48px;
      padding: 0 16px;
      transition: 0.3s;

      &:focus-within {
        border-color: #3BB1FF;
      }

      &.has-error {
        border-color: #FF4D4F;
      }

      input {
        border: none;
        outline: none;
        flex: 1;
        font-size: 14px;
        width: 100%;
        color: #333;

        &::placeholder {
          color: #CCC;
        }
      }

      .eye-icon {
        color: #999;
        cursor: pointer;
        display: flex;
        align-items: center;

        &:hover {
          color: #666;
        }
      }
    }

    .error-text {
      color: #FF4D4F;
      font-size: 12px;
      margin-top: 6px;
    }
  }

  /* 特定输入框覆盖 */
  .phone-input-wrapper {
    margin-bottom: 40px; /* 手机号的input和验证码input之间的间距 */
    .country-code {
      color: #333;
      font-weight: 500;
      font-size: 14px;
    }

    .divider {
      width: 1px;
      height: 16px;
      background: #EEE;
      margin: 0 12px;
    }

  }

  .code-input-wrapper {
    padding-right: 6px;

    .get-code-btn {
      background: #E8F4FF;
      color: #3BB1FF;
      border: none;
      padding: 6px 14px;
      border-radius: 6px;
      font-size: 13px;
      cursor: pointer;

      &:disabled {
        background: #F5F5F5;
        color: #CCC;
      }
    }
  }

  .invite-link-wrap {
    text-align: center;
    margin: 10px 0 20px 0;

    .invite-link {
      color: #3BB1FF;
      text-decoration: none;
      font-size: 16px;
      font-weight: 600;
    }
  }

  .submit-btn {
    width: 100%;
    height: 48px;
    background: #0D2139;
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

/* 团队登录特化调整 */
.team-form-section {
  margin-top: 10px;

  .team-submit-btn {
    margin-top: 30px;
  }
}

/* ====== 底部协议 ====== */
.footer-agreement {
  margin-top: auto;
  text-align: center;
  padding-top: 20px;

  .agreement {
    font-size: 12px;
    color: #999;

    a {
      color: #3BB1FF;
      text-decoration: none;
    }
  }
}
</style>