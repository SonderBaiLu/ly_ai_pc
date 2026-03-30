<template>
  <div class="modal-wrapper">
    <div class="reset-password-modal">
      <button class="close-btn" aria-label="关闭" @click="handleClose">✕</button>

      <h2 class="modal-title">重置密码</h2>

      <div class="modal-content">
        <div class="info-row">
          <span class="label">团队：</span>
          <span class="value">{{ userInfo.team }}</span>
        </div>
        <div class="info-row">
          <span class="label">网站：</span>
          <span class="value">{{ userInfo.website }}</span>
        </div>
        <div class="info-row">
          <span class="label">账号名：</span>
          <span class="value">{{ userInfo.accountName }}</span>
        </div>
        <div class="info-row">
          <span class="label">昵称：</span>
          <span class="value">{{ userInfo.nickname }}</span>
        </div>
        <div class="info-row password-row">
          <span class="label">重置后密码：</span>
          <span class="value fw-bold">{{ userInfo.password }}</span>
        </div>
        <div class="warning-text">登录后请及时变更密码</div>
      </div>

      <button
          class="copy-btn"
          :class="{ 'is-copied': isCopied }"
          @click="handleCopy"
      >
        {{ copyBtnText }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

// 定义展示数据的 TypeScript 接口
interface UserInfo {
  team: string;
  website: string;
  accountName: string;
  nickname: string;
  password: string;
}

// 定义抛出的事件（例如关闭弹窗）
const emit = defineEmits<{
  (e: 'close'): void;
}>();

// 接收父组件传来的 props
const props = defineProps<{ userInfo: UserInfo; }>();

const userInfo = ref<UserInfo>({
  team: props.userInfo.team,
  website: props.userInfo.website,
  accountName: props.userInfo.accountName,
  nickname: props.userInfo.nickname,
  password: props.userInfo.password,
});

// 复制按钮状态管理
const isCopied = ref<boolean>(false);
const copyBtnText = ref<string>('点击复制');

// 复制功能逻辑
const handleCopy = async () => {
  if (isCopied.value) return; // 防止重复点击

  try {
    await navigator.clipboard.writeText(props.userInfo.password);
    isCopied.value = true;
    copyBtnText.value = '复制成功';

    // 2秒后恢复默认状态
    setTimeout(() => {
      isCopied.value = false;
      copyBtnText.value = '点击复制';
    }, 2000);
  } catch (err) {
    console.error('复制失败:', err);
    ElMessage.error('复制失败')
  }
};

// 关闭弹窗逻辑
const handleClose = () => {
  emit('close');
};
</script>

<style scoped lang="scss">
/* 外层遮罩 */
.modal-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(11, 15, 25, 0.6); // 半透明深色背景
  z-index: 999;

  /* 弹窗主容器 */
  .reset-password-modal {
    width: 407px;
    height: 360px;
    background-color: rgba(255,255,255,1);
    color: rgba(16,16,16,1);
    border-radius: 24px;
    position: relative;
    box-sizing: border-box;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    text-align: center;
    font-family: PingFangSC-regular,serif;
    border: 1px solid rgba(187,187,187,1);

    /* 关闭按钮 */
    .close-btn {
      position: absolute;
      top: 16px;
      right: 16px;
      background: none;
      border: none;
      font-size: 20px;
      color: #999999;
      cursor: pointer;
      padding: 4px;
      transition: color 0.2s;

      &:hover {
        color: #666666;
      }
    }

    /* 标题 */
    .modal-title {
      text-align: center;
      font-size: 30px;
      line-height: 60px;
      margin: 0;
      padding-top: 40px;
      color: rgba(17,24,39,1);
      letter-spacing: 1px;
      font-family: Inter-black,serif;
      font-weight: 900;
    }

    /* 内容区域 */
    .modal-content {
      margin-top: 30px;
      padding-left: 65px;

      .info-row {
        margin-bottom: 12px;
        display: flex;
        align-items: center;
        font-weight: bold;
        color: rgba(16,16,16,1);
        font-size: 11px;
        text-align: justify;
        font-family: Inter-bold;


        .label {
          font-weight: bold;
          color: rgba(16,16,16,1);
          font-size: 11px;
          text-align: justify;

        }

        .value {
          font-weight: bold;
          color: rgba(16,16,16,1);
          font-size: 11px;
          text-align: justify;

          &.fw-bold {
            font-weight: bold;
          }
        }
      }

      .password-row {
        margin-top: 20px;
      }

      /* 提示文案 */
      .warning-text {
        color: #888888;
        margin-top: 8px;
        line-height: 17px;
        color: rgba(107,114,128,1);
        font-size: 11px;
        text-align: justify;
        font-family: Inter-regular;
      }
    }

    /* 复制按钮 */
    .copy-btn {
      position: absolute;
      bottom: 49px;
      right: 57px;
      background-color: rgba(23,160,225,1);
      color: rgba(255,255,255,1);
      border: none;
      border-radius: 4px;
      padding: 10px 24px;
      font-size: 15px;
      font-weight: bold;
      cursor: pointer;
      transition: all 0.3s ease;

      &:hover {
        background-color: #1c8de0;
      }
    }
  }
}
</style>