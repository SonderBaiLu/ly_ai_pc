<template>
  <div class="custom-dialog-mask" v-if="visible">
    <div class="custom-dialog-content" :class="isSuccess ? 'is-success-mode' : 'is-form-mode'">
      <button class="close-btn" @click="closeDialog">✕</button>

      <h2 class="dialog-title" :class="{ 'success-title': isSuccess }">
        {{ isSuccess ? '默认密码' : '成员添加' }}
      </h2>

      <template v-if="!isSuccess">
        <div class="info-section">
          <div class="info-row">
            <span class="label">团队：</span>
            <span class="value">{{ displayData.mainNickName || 'xxxxx' }}</span>
          </div>
          <div class="info-row">
            <span class="label">网站：</span>
            <span class="value">{{ displayData.url || 'https://www.lingyanaigc.com/' }}</span>
          </div>
        </div>

        <div class="form-section">
          <div class="form-item">
            <div class="item-header">
              <span class="label">账号名</span>
              <span class="hint">4-16个字母组成</span>
            </div>
            <input
                type="text"
                v-model="form.userName"
                placeholder="请输入账号名"
                class="custom-input"
                :disabled="isSuccess"
                maxlength="16"
            />
          </div>

          <div class="form-item">
            <div class="item-header">
              <span class="label">昵称</span>
            </div>
            <input
                type="text"
                v-model="form.nickName"
                placeholder="请输入昵称"
                class="custom-input"
                maxlength="20"
                :disabled="isSuccess"
            />
          </div>
        </div>

        <div class="dialog-footer">
          <button
              class="action-btn submit-btn"
              :class="{ 'is-loading': loading  }"
              :disabled="loading"
              @click="handleSubmit"
          >
            {{ loading ? '添加中...' : '确认添加' }}
          </button>
        </div>
      </template>

      <template v-else>
        <div class="success-content">
          <div class="info-row">
            <span class="label">团队：</span>
            <span class="value">{{ displayData.mainNickName }}</span>
          </div>
          <div class="info-row">
            <span class="label">网站：</span>
            <span class="value">{{ displayData.url }}</span>
          </div>
          <div class="info-row">
            <span class="label">账号名：</span>
            <span class="value">{{ displayData.userName }}</span>
          </div>
          <div class="info-row">
            <span class="label">昵称：</span>
            <span class="value">{{ displayData.nickName }}</span>
          </div>
          <div class="info-row password-row">
            <span class="label-pwd">默认登录密码：</span>
            <span class="value fw-bold">{{ displayData.pwd }}</span>
          </div>
          <div class="warning-text">登录后请及时变更密码</div>

          <button
              class="copy-btn"
              :class="{ 'is-copied': isCopied }"
              @click="handleCopy"
          >
            {{ copyBtnText }}
          </button>
        </div>
      </template>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { ElMessage } from 'element-plus'
import teamApi from "@/api/teamManage.ts";
import {useUserStore} from "@/stores/user.ts";

// 1. 实例化 User Store
const userStore = useUserStore()

// --- Props & Emits ---
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:visible', 'success'])

// --- 状态数据 ---
const isSuccess = ref(false)
const loading = ref(false)

// 复制相关状态
const isCopied = ref(false)
const copyBtnText = ref('点击复制')

// 表单提交数据
const form = reactive({
  userName: '',
  nickName: ''
})
// URL 地址
const reactiveApiTarget = ref(import.meta.env.VITE_API_PROXY_TARGET)
// 展示/返回的数据
const displayData = reactive({
  mainNickName: userStore.userInfo.userName, // 修复了之前的报错
  url: reactiveApiTarget.value,
  pwd: '',
  userName: '',
  nickName: ''
})

// --- 方法 ---

// 关闭弹窗
const closeDialog = () => {
  emit('update:visible', false)
}

// 重置弹窗状态
const resetState = () => {
  form.userName = ''
  form.nickName = ''
  displayData.pwd = ''
  isSuccess.value = false
  loading.value = false
  isCopied.value = false
  copyBtnText.value = '点击复制'
}

// 监听弹窗打开，重置状态
watch(() => props.visible, (newVal) => {
  if (newVal) {
    resetState()
  }
})

// 校验表单
const validateForm = () => {
  const accountReg = /^[a-zA-Z]{4,16}$/
  if (!form.userName) {
    ElMessage.warning('请输入账号名')
    return false
  }
  if (!accountReg.test(form.userName)) {
    ElMessage.warning('账号名必须由4-16个纯字母组成')
    return false
  }
  if (!form.nickName) {
    ElMessage.warning('请输入昵称')
    return false
  }
  if (form.nickName.length > 20) {
    ElMessage.warning('昵称最多20个字符')
    return false
  }
  return true
}

// 确认添加
const handleSubmit = async () => {
  if (!validateForm()) return
  loading.value = true
  try {
    const res = await teamApi.sonUserRegister({
      userName: form.userName,
      nickName: form.nickName,
    })
    if(String((res as any).code) === '0000' && res.success === true ){
      ElMessage.success('添加成功')
      displayData.mainNickName = res.data.mainNickName
      displayData.url = res.data.url
      displayData.pwd = res.data.pwd
      displayData.userName = res.data.userName
      displayData.nickName = res.data.nickName
      // 切换到成功状态
      isSuccess.value = true
    } else {
      ElMessage.error(res.msg)
    }
  } catch (e:any){
    const errorMsg =  e.message || '添加失败'
    ElMessage.error(errorMsg)
  } finally {
    loading.value = false
  }
}

// 点击复制
const handleCopy = async () => {
  if (isCopied.value) return; // 防止重复点击

  const copyText =
      ` 团队：${displayData.mainNickName}
网站：${displayData.url}
账号名：${displayData.userName}
昵称：${displayData.nickName}
默认登录密码：${displayData.pwd}`

  try {
    await navigator.clipboard.writeText(copyText)
    isCopied.value = true
    copyBtnText.value = '复制成功'

    // 延迟 1 秒后关闭，让用户看到“复制成功”的提示
    setTimeout(() => {
      closeDialog()
      emit('success')
    }, 1000)

  } catch {
    ElMessage.error('复制失败')
  }
}
</script>

<style scoped lang="scss">
/* 遮罩层 */
.custom-dialog-mask {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  background-color: rgba(11, 15, 25, 0.6);
}

/* 弹窗容器基础样式 */
.custom-dialog-content {
  position: relative;
  width: 407px;
  background: #FFFFFF;
  border-radius: 12px;
  box-sizing: border-box;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: height 0.3s ease, padding 0.3s ease;

  /* 表单模式的尺寸 */
  &.is-form-mode {
    height: 463px;
    padding: 30px 55px;
  }

  /* 成功模式的尺寸 (对齐重置密码UI) */
  &.is-success-mode {
    height: 360px;
    border: 1px solid rgba(187,187,187,1);
    border-radius: 24px; /* 成功状态变为更圆润的设计 */
  }
}

/* 关闭按钮 */
.close-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  background: transparent;
  border: none;
  font-size: 20px;
  color: #999;
  cursor: pointer;
  padding: 4px;
  transition: color 0.3s;
  z-index: 10;

  &:hover {
    color: #666;
  }
}

/* 标题 */
.dialog-title {
  font-size: 30px;
  font-weight: 800;
  color: rgba(17,24,39,1);
  text-align: center;
  font-family: Inter-black,serif;
  margin: 0;

  /* 表单状态下的间距 */
  &:not(.success-title) {
    margin-bottom: 30px;
  }
  /* 成功状态下的间距 (精准对齐) */
  &.success-title {
    padding-top: 44px;
    line-height: 1;
    letter-spacing: 1px;
    font-weight: 900;
  }
}

/* ================== 模式1: 表单原有样式 ================== */
.info-section {
  margin-bottom: 20px;
  font-size: 14px;
  line-height: 1.8;
  color: rgba(17,24,39,1);
  font-weight: 800;
  font-family: Inter-bold,serif;

  .info-row {
    font-size: 11px;
    color: rgba(17,24,39,1);
    display: flex;
    align-items: center;
    .value {
      color: rgba(17,24,39,1);
      font-family: Inter-bold,serif;
      font-size: 11px;
      font-weight: 800;
    }
  }
}

.form-section {
  .form-item {
    margin-bottom: 20px;

    .item-header {
      display: flex;
      align-items: baseline;
      margin-bottom: 8px;

      .label {
        color: rgba(107,114,128,1);
        font-weight: 800;
        font-size: 11px;
        text-align: justify;
        font-family: Inter-bold,serif;
      }
      .hint {
        color: rgba(156,163,175,1);
        margin-left: 10px;
        font-size: 11px;
        text-align: justify;
        font-family: Inter-regular,serif;
      }
    }

    .custom-input {
      width: 100%;
      height: 49px;
      border-radius: 10px;
      padding: 0 12px;
      font-size: 14px;
      background: #FFFFFF;
      color: #333;
      border: 1px solid rgba(55,65,81,1);
      box-sizing: border-box;
      outline: none;
      transition: border-color 0.2s;

      &::placeholder {
        color: #ccc;
        font-size: 14px;
      }

      &:focus {
        border-color: #207ab7;
      }
    }
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  position: absolute;
  bottom: 30px;
  right: 55px;

  .action-btn {
    width: 89px;
    height: 34px;
    border-radius: 4px;
    font-size: 14px;
    cursor: pointer;
    border: none;
    color: #fff;
    font-weight: 800;
    transition: opacity 0.3s;

    &:hover {
      opacity: 0.85;
    }

    &.is-loading {
      cursor: not-allowed;
      opacity: 0.7;
    }
  }

  .submit-btn {
    background-color: #1575A2;
  }
}

/* ================== 模式2: ================== */
.success-content {
  margin-top: 30px;
  padding-left: 65px;
  text-align: left;


  .info-row {
    margin-bottom: 14px;
    display: flex;
    align-items: flex-start;
    color: rgba(16,16,16,1);
    font-size: 11px;
    text-align: justify;
    font-family: Inter-bold,serif;
    font-weight: 600;


    .label {
      color: rgba(16,16,16,1);
      font-size: 11px;
      text-align: justify;
      font-family: Inter-bold,serif;
      font-weight: 800;
    }
    .label-pwd{
      color: rgba(107,114,128,1);
    }

    .value {
      color: rgba(16,16,16,1);
      font-size: 11px;
      text-align: justify;
      font-family: Inter-bold,serif;
      font-weight: 800;

      &.fw-bold {
        font-weight: bold;
      }
    }
  }

  .password-row {
    margin-top: 20px;
  }

  .warning-text {
    margin-top: 8px;
    line-height: 1.5;
    color: rgba(107,114,128,1);
    font-size: 11px;
    text-align: justify;
    font-family: Inter-regular,serif;
  }

  /* 复制按钮 */
  .copy-btn {
    display: block;
    margin-top: 5px;
    margin-left: 191px;
    background-color: rgba(23,160,225,1);
    color: rgba(255,255,255,1);
    border: none;
    border-radius: 4px;
    padding: 4px 15px;
    font-size: 15px;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      background-color: #1c8de0;
    }
  }
}
</style>