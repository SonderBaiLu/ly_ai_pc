<template>
  <div class="login-overlay">
    <div class="login-modal">

      <div class="left-panel">
        <div class="brand-logo">
          <span class="logo-icon">✨</span> <span class="logo-text">灵衍AI</span>
        </div>

        <h1 class="main-title">登录即享专属礼遇</h1>

        <div class="promo-box">
          <span class="promo-text">新用户注册免费赠送</span>
          <span class="promo-value">50灵衍值</span>
        </div>

        <ul class="feature-list">
          <li>
            <span class="icon">📚</span>
            <span>卸下设计繁琐，让每一份创意都能纯粹发光</span>
          </li>
          <li>
            <span class="icon">👕</span>
            <span>解锁AI设计全能力，守护你的每一份时尚热爱</span>
          </li>
          <li>
            <span class="icon">🛒</span>
            <span>登录有礼，解锁潮流面料+专属设计工具，不负初心</span>
          </li>
          <li>
            <span class="icon">🖌️</span>
            <span>让设计回归本质，创作更轻松</span>
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
          >个人登录</div>
          <div
              class="switch-item"
              :class="{ active: accountType === 'team' }"
              @click="accountType = 'team'"
          >团队登录</div>
        </div>

        <div class="login-method-tabs">
          <div
              class="tab-item"
              :class="{ active: loginMethod === 'qrcode' }"
              @click="loginMethod = 'qrcode'"
          >扫码登录</div>
          <div
              class="tab-item"
              :class="{ active: loginMethod === 'phone' }"
              @click="loginMethod = 'phone'"
          >手机登录</div>
        </div>

        <div class="form-container" v-show="loginMethod === 'phone'">
          <div class="form-group phone-input-group">
            <span class="country-code">+86</span>
            <div class="divider"></div>
            <input type="text" v-model="formData.phone" placeholder="请输入手机号" />
          </div>

          <div class="form-group code-input-group">
            <input type="text" v-model="formData.code" placeholder="请输入验证码" />
            <button class="get-code-btn" :disabled="!formData.phone">获取验证码</button>
          </div>

          <div class="invite-link-wrap">
            <a href="#" class="invite-link">填写邀请码注册</a>
          </div>

          <button class="submit-btn" @click="handleSubmit">登录/注册</button>

          <div class="agreement">
            注册登录即代表同意 <a href="#">《用户协议》</a> 和 <a href="#">《隐私政策》</a>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';

// 账号类型：personal (个人), team (团队)
const accountType = ref<'personal' | 'team'>('personal');

// 登录方式：qrcode (扫码), phone (手机)
const loginMethod = ref<'qrcode' | 'phone'>('phone');

// 表单数据
const formData = reactive({
  phone: '',
  code: ''
});

// 处理关闭弹窗
const handleClose = () => {
  console.log('Close modal clicked');
  // 触发关闭逻辑或向父组件 emit 事件
};

// 处理提交登录
const handleSubmit = () => {
  console.log('Submit login:', formData);
  // 执行登录 API 请求
};
</script>

<style scoped lang="scss">
/* 页面遮罩层 */
.login-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

/* 弹窗主体容器：Flex 布局，居中对齐 */
.login-modal {
  display: flex;
  align-items: center; /* 关键：使左右两边垂直居中对齐，突出高度差 */
  justify-content: center;
  position: relative;
  border-radius: 24px;
}

/* ================= 左侧面板 ================= */
.left-panel {
  width: 592px;
  height: 627px; /* 左侧比右侧高，形成上下层次感 */
  background: linear-gradient(135deg, #4A3AFF 0%, #7B3FE4 100%); /* 渐变紫 */
  border-radius: 24px; /* 四周都有圆角 */
  padding: 50px;
  box-sizing: border-box;
  color: #fff;
  position: relative;
  z-index: 2; /* 关键：层级高于右侧 */
  box-shadow: 10px 0 20px rgba(0, 0, 0, 0.1); /* 右侧阴影，增加交界处的立体感 */

  .brand-logo {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 24px;
    font-weight: bold;
    margin-bottom: 60px;
  }

  .main-title {
    font-size: 36px;
    font-weight: 600;
    margin-bottom: 30px;
  }

  .promo-box {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: rgba(255, 255, 255, 0.2);
    padding: 16px 24px;
    border-radius: 12px;
    margin-bottom: 40px;

    .promo-text {
      font-size: 16px;
    }
    .promo-value {
      font-size: 20px;
      font-weight: bold;
    }
  }

  .feature-list {
    list-style: none;
    padding: 0;
    margin: 0;

    li {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 24px;
      font-size: 15px;
      line-height: 1.5;
      color: rgba(255, 255, 255, 0.9);

      .icon {
        font-size: 18px;
      }
    }
  }
}

/* ================= 右侧面板 ================= */
.right-panel {
  width: 443px; /* 根据整体1035px估算：1035 - 592 = 443 */
  height: 602px; /* 高度较小 */
  background: #ffffff;
  border-radius: 0 24px 24px 0; /* 仅右侧有圆角 */
  padding: 40px 50px;
  box-sizing: border-box;
  position: relative;
  z-index: 1; /* 层级低于左侧 */

  /* 关键：负边距。向左缩进，使得左侧的右半边覆盖在白板之上，避免交界处出现白边或缝隙 */
  margin-left: -24px;
  padding-left: 74px; /* 内部内容向右补偿由于缩进损失的空间 */

  .close-btn {
    position: absolute;
    top: 24px;
    right: 24px;
    background: none;
    border: none;
    font-size: 20px;
    color: #999;
    cursor: pointer;
    transition: color 0.3s;
    &:hover { color: #333; }
  }

  /* 个人/团队切换（胶囊形状） */
  .account-type-switch {
    display: flex;
    background: #f5f6f8;
    border-radius: 30px;
    padding: 4px;
    margin-bottom: 40px;
    width: fit-content;
    margin-left: auto;
    margin-right: auto;

    .switch-item {
      padding: 8px 24px;
      border-radius: 20px;
      font-size: 14px;
      color: #666;
      cursor: pointer;
      transition: all 0.3s;

      &.active {
        background: #4A85F6; /* 选中项蓝色背景 */
        color: #fff;
        box-shadow: 0 2px 6px rgba(74, 133, 246, 0.3);
      }
    }
  }

  /* 扫码/手机切换（下划线形状） */
  .login-method-tabs {
    display: flex;
    justify-content: center;
    gap: 40px;
    border-bottom: 1px solid #eee;
    margin-bottom: 30px;

    .tab-item {
      padding-bottom: 12px;
      font-size: 16px;
      color: #999;
      cursor: pointer;
      position: relative;

      &.active {
        color: #4A85F6;
        font-weight: 500;

        /* 底部蓝色指示条 */
        &::after {
          content: '';
          position: absolute;
          bottom: -1px;
          left: 50%;
          transform: translateX(-50%);
          width: 30px;
          height: 3px;
          background: #4A85F6;
          border-radius: 2px;
        }
      }
    }
  }

  /* 表单区域 */
  .form-container {
    .form-group {
      display: flex;
      align-items: center;
      border: 1px solid #ddd;
      border-radius: 8px;
      height: 48px;
      padding: 0 16px;
      margin-bottom: 20px;
      transition: border-color 0.3s;

      &:focus-within {
        border-color: #4A85F6;
      }

      input {
        border: none;
        outline: none;
        flex: 1;
        font-size: 14px;
        color: #333;
        &::placeholder {
          color: #bbb;
        }
      }
    }

    .phone-input-group {
      .country-code {
        color: #666;
        font-size: 14px;
      }
      .divider {
        width: 1px;
        height: 16px;
        background: #ddd;
        margin: 0 12px;
      }
    }

    .code-input-group {
      padding-right: 4px; /* 给内部按钮留空隙 */

      .get-code-btn {
        background: #bce1f4; /* 未激活状态淡蓝色 */
        color: #fff;
        border: none;
        padding: 8px 16px;
        border-radius: 6px;
        font-size: 13px;
        cursor: pointer;

        &:not(:disabled) {
          background: #73c8ef; /* 激活时颜色 */
        }
      }
    }

    .invite-link-wrap {
      text-align: center;
      margin-bottom: 20px;
      .invite-link {
        color: #4A85F6;
        font-size: 13px;
        text-decoration: none;
      }
    }

    .submit-btn {
      width: 100%;
      height: 48px;
      background: #0f4c6b; /* 深蓝色/墨蓝色按钮 */
      color: #fff;
      border: none;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 500;
      cursor: pointer;
      margin-bottom: 20px;
      transition: opacity 0.3s;

      &:hover {
        opacity: 0.9;
      }
    }

    .agreement {
      text-align: center;
      font-size: 12px;
      color: #999;

      a {
        color: #4A85F6;
        text-decoration: none;
      }
    }
  }
}
</style>