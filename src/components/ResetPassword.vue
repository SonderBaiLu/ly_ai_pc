<template>
  <div class="reset-password-overlay">
    <div class="reset-password-modal">
      <button class="close-btn">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M1 1L13 13M1 13L13 1" stroke="#999999" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>

      <h2 class="modal-title">重置密码</h2>

      <div class="form-container">
        <div class="form-group">
          <label class="form-label">手机号</label>
          <div class="input-wrapper">
            <span class="prefix">+86</span>
            <span class="divider"></span>
            <input type="text" class="form-input" placeholder="请输入手机号" />
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">验证码</label>
          <div class="input-wrapper">
            <input type="text" class="form-input" placeholder="请输入验证码" />
            <button class="get-code-btn">获取验证码</button>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">
            新密码 <span class="label-hint">6-20个数字、字母组成</span>
          </label>
          <div class="input-wrapper">
            <input type="password" class="form-input" placeholder="请输入密码" />
            <span class="icon-eye">
              <img src="@/assets/images/login_popup/visibility_off.png" alt="小眼睛"/>
            </span>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">确认密码</label>
          <div class="input-wrapper">
            <input type="password" class="form-input" placeholder="请再次输入密码确认" />
            <span class="icon-eye">
              <img src="@/assets/images/login_popup/visibility_off.png" alt="小眼睛"/>
            </span>
          </div>
        </div>

        <button class="submit-btn">重置密码</button>
      </div>
    </div>
  </div>
</template>

<script setup>
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
      background-color: rgba(184,222,240,1);
      color: rgba(255,255,255,1);
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
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      margin-left: 8px;
      img{
        width: 24px;
      }
      &:hover svg path {
        stroke: #4A566A;
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