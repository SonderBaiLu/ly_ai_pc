<template>
  <div class="modal-overlay" v-if="visible" @click.self="closeModal">
    <div class="modal-card">
      <button class="close-btn" @click="closeModal">
        <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none"
          stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
      <h2 class="title">Hi~欢迎填写灵衍AI邀请码</h2>
      <div class="input-group">
        <div class="icon-wrapper">
          <img src="../assets/images/login_popup/link.png" alt="邀请码图标" width="22" height="22">
        </div>
        <div class="divider"></div>
        <input type="text" v-model="inviteCode" placeholder="请输入邀请码" @keyup.enter="handleConfirm" />
      </div>
      <button class="confirm-btn" @click="handleConfirm">确认</button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import userApi from '@/api/user';
import {ElMessage} from "element-plus";

// 定义属性
defineProps({
  visible: {
    type: Boolean,
    default: true
  }
})

// 定义事件
const emit = defineEmits(['update:visible', 'confirm', 'invitationsCode'])

// 响应式数据
const inviteCode = ref('')

// 关闭弹窗
const closeModal = () => {
  emit('update:visible', false)
}

// 点击确认
const handleConfirm = async () => {
  if (!inviteCode.value.trim()) {
    alert('请输入邀请码')
    return
  }
  try {
    const res = await userApi.checkInvitationsCode({invitationsCode: inviteCode.value})
    console.log("接口成功返回", res)
    if (String((res as any).code) === '0000') {
      //将邀请码作为参数传给父组件
      emit('confirm', inviteCode.value)
      // 成功后自动关闭弹窗
      emit('update:visible', false)
    }
  } catch (err: any) {
    ElMessage.error(err.message || err.msg)
  }
}
</script>

<style lang="scss" scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.modal-card {
  position: relative;
  width: 546px;
  height: 382px;
  background: #ffffff;
  border-radius: 24px;
  padding: 0 49px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.close-btn {
  position: absolute;
  top: 28px;
  right: 25px;
  background: transparent;
  border: none;
  cursor: pointer;
  color: #999999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  border-radius: 50%;
  transition: color 0.2s, background-color 0.2s;

  &:hover {
    color: #333333;
    background-color: #f2f3f5;
  }
}

.title {
  font-size: 26px;
  color: #1d2129;
  font-weight: 600;
  letter-spacing: 1px;
  /* 标题左右各有85px，弹窗padding已有49px 补36px */
  padding: 0 36px;
  text-align: center;
  margin: 0 0 11px;
}

.input-group {
  width: 100%;
  height: 56px;
  border: 1px solid #dcdcdc;
  border-radius: 12px;
  display: flex;
  align-items: center;
  padding: 0 16px;
  box-sizing: border-box;
  margin-bottom: 21px;
  transition: border-color 0.2s;

  &:focus-within {
    border-color: #135b79;
  }

  .icon-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 14px;
    padding-left: 4px;
  }

  .divider {
    width: 1px;
    height: 18px;
    background-color: #e5e6eb;
    margin-right: 16px;
  }

  input {
    flex: 1;
    height: 100%;
    border: none;
    outline: none;
    font-size: 16px;
    color: #1d2129;
    background: transparent;

    &::placeholder {
      color: #8f959e;
    }
  }
}

.confirm-btn {
  width: 100%;
  height: 56px;
  background-color: #135b79;
  color: #ffffff;
  border: none;
  border-radius: 12px;
  font-size: 18px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #0f4b64;
  }

  &:active {
    background-color: #0c3d52;
  }
}
</style>
