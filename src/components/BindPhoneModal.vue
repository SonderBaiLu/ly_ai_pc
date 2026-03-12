<template>
  <div class="modal-overlay">
    <div class="modal-content">
      <button class="close-btn" @click="closeModal">
        <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M14 2L2 14M2 2L14 14" stroke="#999999" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </button>
      <div class="header">
        <h2>绑定手机</h2>
        <p class="subtitle">首次登陆将通过短信验证码绑定手机</p>
      </div>
      <div class="form-area">
        <div class="form-group">
          <label>手机号</label>
          <div class="input-wrapper">
            <span class="prefix">+86</span>
            <div class="divider"></div>
            <input
                type="tel"
                placeholder="请输入手机号"
                maxlength="11"
            />
          </div>
        </div>
        <div class="form-group">
          <label>短信验证码</label>
          <div class="input-wrapper code-wrapper">
            <input
                v-model="formData.code"
                type="text"
                placeholder="请输入验证码"
                maxlength="6"
            />
            <button
                class="get-code-btn"
                :class="{ disabled: isCounting }"
                :disabled="isCounting"
                @click="handleGetCode"
            >
              {{ countText }}
            </button>
          </div>
        </div>
      </div>
      <button
          class="submit-btn"
          @click="handleSubmit">绑定
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue';

// --- Props & Emits ---
const props = defineProps({
  visible: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(['update:visible', 'submit']);

// --- 表单数据 ---
const formData = reactive({
  phone: '',
  code: ''
});

// --- 验证码倒计时逻辑 ---
const isCounting = ref(false);
const countdown = ref(60);
let timer: ReturnType<typeof setInterval> | null = null;

const countText = computed(() => {
  return isCounting.value ? `${countdown.value}s后获取` : '获取验证码';
});

const handleGetCode = () => {
  // 校验手机号是否填写
  // 开启倒计时
  isCounting.value = true;
  countdown.value = 60;
  timer = setInterval(() => {
    countdown.value--;
    if (countdown.value <= 0) {
      clearInterval(timer as ReturnType<typeof setInterval>);
      isCounting.value = false;
    }
  }, 1000);
};

// --- 提交表单 ---
const handleSubmit = () => {
  if (!formData.phone || !formData.code) {
    alert('请完整填写手机号和验证码');
    return;
  }
  // 触发父组件事件，将数据传出
  emit('submit', { ...formData });
};

// --- 关闭弹窗 ---
const closeModal = () => {
  emit('update:visible', false);
  // 清理定时器
  if (timer) clearInterval(timer);
};
</script>

<style scoped lang="scss">
// 定义 SCSS 变量
$primary-black: #000000;
$text-main: #1a1a1a;
$text-secondary: #666666;
$text-muted: #999999;
$border-color: #dcdcdc;
$input-bg: transparent;
$btn-gray: #3a3a40;
$transition: all 0.2s ease-in-out;
.modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;

  .modal-content {
    width: 435px;
    height: 592px;
    background-color: #ffffff;
    border-radius: 16px;
    padding: 40px 32px;
    position: relative;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;

    .close-btn {
      position: absolute;
      top: 24px;
      right: 24px;
      background: none;
      border: none;
      cursor: pointer;
      padding: 4px;
      transition: $transition;

      &:hover {
        opacity: 0.7;
      }
    }

    .header {
      margin-top: 10px;
      margin-bottom: 40px;

      h2 {
        font-size: 28px;
        color: $text-main;
        font-weight: bold;
        margin: 0 0 12px 0;
        letter-spacing: 1px;
      }

      .subtitle {
        font-size: 14px;
        color: $text-muted;
        margin: 0;
      }
    }

    .form-area {
      flex: 1;

      .form-group {
        margin-bottom: 24px;

        label {
          display: block; /* 确保每个表单组占满宽度 */
          font-size: 13px;
          color: $text-secondary;
          margin-bottom: 8px;
          font-weight: 500;
        }

        .input-wrapper {
          display: flex;
          align-items: center;
          border: 1px solid $border-color;
          border-radius: 8px;
          height: 48px;
          padding: 0 16px;
          transition: $transition;

          &:focus-within {
            border-color: $text-main
          }

          &:focus-within {
            border-color: $text-main;
          }

          input {
            flex: 1;
            border: none;
            outline: none;
            font-size: 15px;
            color: $text-main;
            background: $input-bg;

            &::placeholder {
              color: #b3b3b3;
            }
          }
          .prefix {
            font-size: 15px;
            color: $text-muted;
          }

          .divider {
            width: 1px;
            height: 16px;
            background-color: #e0e0e0;
            margin: 0 12px;
          }

          &.code-wrapper {
            padding-right: 6px;
          }

          .get-code-btn {
            background-color: $btn-gray;
            color: #ffffff;
            border: none;
            border-radius: 6px;
            height: 36px;
            padding: 0 14px;
            font-size: 13px;
            cursor: pointer;
            white-space: nowrap;
            transition: $transition;

            &:hover:not(.is-disabled) {
              background-color: lighten($btn-gray, 10%);
            }

            &.is-disabled {
              background-color: #cccccc;
              cursor: not-allowed;
            }
          }
        }
      }
    }

    .submit-btn {
      width: 100%;
      height: 52px;
      background-color: $primary-black;
      color: #ffffff;
      font-size: 16px;
      font-weight: 500;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      margin-bottom: 10px;
      transition: opacity 0.2s; // 按钮点击效果
      &:hover {
        opacity: 0.85;
      }

      &:active {
        transform: scale(0.99); // 点击缩放效果
      }
    }
  }
}
</style>































