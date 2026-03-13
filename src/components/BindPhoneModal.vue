<template>
  <div class="modal-overlay">
    <div class="modal-content">
      <button class="close-btn" @click="closeModal">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M14 2L2 14M2 2L14 14" stroke="#999999" stroke-width="2" stroke-linecap="round" />
        </svg>
      </button>

      <div class="header">
        <h2>绑定手机</h2>
        <p class="subtitle">首次登陆将通过短信验证码绑定手机</p>
      </div>
      <div class="form-area">
        <div class="form-group">
          <label>手机号</label>
          <div class="input-wrapper" :class="{ 'has-error': phoneErr }">
            <span class="prefix">+86</span>
            <div class="divider"></div>
            <input v-model="phone" type="tel" placeholder="请输入手机号" maxlength="11" />
          </div>
          <span class="error-text">{{ phoneErr }}</span>
        </div>

        <div class="form-group">
          <label>短信验证码</label>
          <div class="input-wrapper code-wrapper" :class="{ 'has-error': codeErr }">
            <input v-model="code" type="text" placeholder="请输入验证码" maxlength="6" />
            <button class="get-code-btn" :class="{ disabled: isCounting }" :disabled="isCounting"
              @click="handleGetCode">
              {{ countText }}
            </button>
          </div>
          <span class="error-text">{{ codeErr }}</span>
        </div>
      </div>

      <button class="submit-btn" @click="onSubmit">绑定</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useForm, useField } from "vee-validate"; // 记得导入 useField
import { codeLoginSchema } from "@/utils/validationSchemas.ts";
//表单验证初始化
const { handleSubmit, validateField } = useForm({
  validationSchema: codeLoginSchema,
  // 初始值可以写在这里
  initialValues: {
    phone: '',
    code: '',
  }
});
// 字段绑定
// 使用 useField 替代你原来的 reactive formData
const { value: phone, errorMessage: phoneErr } = useField('phone');
const { value: code, errorMessage: codeErr } = useField('code');

// 提交
const onSubmit = handleSubmit((values: { phone: string; code: string }) => {
  console.log('校验通过！提交给后端的数据:', values);
  // API 请求
});
const emit = defineEmits(['update:visible', 'submit']);

// --- 4. 验证码倒计时逻辑 ---
const isCounting = ref(false);
const countdown = ref(60);
let timer: ReturnType<typeof setInterval> | null = null;

const countText = computed(() => isCounting.value ? `${countdown.value}s后获取` : '获取验证码');

const handleGetCode = async () => {
  // 【关键点】获取验证码前，只触发手机号的单独校验
  const { valid } = await validateField('phone');

  if (!valid) return; // 如果手机号校验没通过，不往下走

  // 开始倒计时
  isCounting.value = true;
  countdown.value = 60;
  timer = setInterval(() => {
    countdown.value--;
    if (countdown.value <= 0) {
      clearInterval(timer!);
      isCounting.value = false;
    }
  }, 1000);
};

const closeModal = () => {
  emit('update:visible', false);
  if (timer) clearInterval(timer);
};
</script>

<style scoped lang="scss">
@use "sass:color";
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
        position: relative;
        margin-bottom: 28px;

        label {
          display: block;
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
            border-color: $text-main;
          }

          &.has-error {
            border-color: #ff4d4f; // 校验失败变红
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
              background-color: color.adjust($btn-gray, $lightness: 10%);
            }

            &.is-disabled {
              background-color: #cccccc;
              cursor: not-allowed;
            }
          }
        }

        .error-text {
          position: absolute;
          bottom: -20px;
          left: 0;
          font-size: 12px;
          color: #ff4d4f;
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
      transition: opacity 0.2s;

      &:hover {
        opacity: 0.85;
      }

      &:active {
        transform: scale(0.99);
      }
    }
  }
}
</style>
