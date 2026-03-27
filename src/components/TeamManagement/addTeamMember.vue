<template>
  <div class="custom-dialog-mask" v-if="visible">
    <div class="custom-dialog-content">
      <button class="close-btn" @click="closeDialog">✕</button>

      <h2 class="dialog-title">成员添加</h2>

      <div class="info-section" v-if="isTeamAndUrl">
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

      <div class="success-section" v-if="isSuccess">
        <div class="pwd-row">
          <span class="label">默认登录密码：</span>
          <span class="value bold">{{ displayData.pwd }}</span>
        </div>
        <div class="hint-msg">登录后请及时变更密码</div>
      </div>

      <div class="dialog-footer">
        <button
            v-if="!isSuccess"
            class="action-btn submit-btn"
            :class="{ 'is-loading': loading  }"
            :disabled="loading"
            @click="handleSubmit"
        >
          {{ loading ? '添加中...' : '确认添加' }}
        </button>

        <button
            v-else
            class="action-btn copy-btn"
            @click="handleCopy"
        >
          点击复制
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus'
import teamApi from "@/api/teamManage.ts";
// TODO: VITE_API_PROXY_TARGET 获取 URL
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
const isTeamAndUrl = ref(false) // 这个和设计稿不一样 成员添加之前 是否显示网站 和 团队名字
// 表单提交数据
const form = reactive({
  userName: '',
  nickName: ''
})

// 展示/返回的数据
const displayData = reactive({
  mainNickName: 'xxxxx',
  url: 'https://www.lingyanaigc.com/',
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
    isTeamAndUrl.value = false; // TODO: 是否显示名称 与 URL
    const res = await teamApi.sonUserRegister({
      userName: form.userName,
      nickName: form.nickName,
    })
    if(String((res as any).code) === '0000' && res.success === true ){
      ElMessage.success('添加成功')
      // 填充返回的数据
      displayData.mainNickName = res.data.mainNickName
      displayData.url = res.data.url
      displayData.pwd = res.data.pwd
      displayData.userName = res.data.userName
      displayData.nickName = res.data.nickName
      // 切换到【点击复制】状态
      isSuccess.value = true
      isTeamAndUrl.value = true; // TODO: 是否显示名称 与 URL

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
  const copyText =
      ` 团队：${displayData.mainNickName}
        网站：${displayData.url}
        账号名：${displayData.userName}
        昵称：${displayData.nickName}
        默认登录密码：${displayData.pwd}`

  try {
    // 使用剪贴板
    await navigator.clipboard.writeText(copyText)
    ElMessage.success('复制成功')
    closeDialog()
    emit('success')
  } catch (e:any) {
    ElMessage.error(e.success)
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
}

/* 弹窗容器 */
.custom-dialog-content {
  position: relative;
  width: 407px;
  height: 463px;
  background: #FFFFFF;
  border-radius: 12px;
  padding: 30px 55px;
  box-sizing: border-box;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* 关闭按钮 */
.close-btn {
  position: absolute;
  top: 20px;
  right: 20px;
  background: transparent;
  border: none;
  font-size: 18px;
  color: #999;
  cursor: pointer;
  transition: color 0.3s;

  &:hover {
    color: #333;
  }
}

/* 标题 */
.dialog-title {
  font-size: 30px;
  font-weight: 800;
  color: $color-bg-dark;
  text-align: center;
  font-family: Inter-black,serif;
  margin: 0 0 30px 0;
}

/* 基本信息区 */
.info-section {
  /* 成员 网站 title  */
  margin-bottom: 20px;
  font-size: 14px;
  line-height: 1.8;
  color: $color-bg-dark;
  font-weight: 500;
  font-family: Inter-bold,serif;

  .info-row {
    display: flex;
    align-items: center;
    .label {
      font-weight: 500;
    }
    .value {
      color: $color-bg-dark;
      font-family: Inter-bold,serif;
      font-size: 11px;
      font-weight: 500;
    }
  }
}

/* 表单区 */
.form-section {
  .form-item {
    margin-bottom: 20px;

    .item-header {
      display: flex;
      align-items: baseline;
      margin-bottom: 8px;

      .label {
        font-weight: 800;
        color: $color-text-placeholder;
        font-size: 11px;
        text-align: justify;
        font-family: Inter-bold,serif;
      }
      .hint {
        margin-left: 10px;
        color: $color-text-gray;
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
      color: $color-text-dark;
      border: 1px solid rgba(55,65,81,1);
      font-family: -regular,serif;
      box-sizing: border-box;
      outline: none;
      transition: border-color 0.2s;

      &::placeholder {
        color: $color-text-gray;
        font-size: 14px;
        font-family: PingFangSC-regular,serif;
      }

      &:focus {
        border-color: #207ab7;
      }

      &:disabled {
        background-color: #f5f7fa;
        color: #606266;
        cursor: not-allowed;
      }
    }
  }
}

/* 成功后的密码提示区 */
.success-section {
  margin-top: -5px;
  margin-bottom: 20px;
  font-size: 14px;

  .pwd-row {
    color: #333;
    margin-bottom: 8px;

    .label {
      font-weight: 500;
    }
    .value.bold {
      font-weight: bold;
      color: #1a1a1a;
    }
  }

  .hint-msg {
    font-size: 12px;
    color: #999;
  }
}

/* 底部操作区 */
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  position: absolute;
  bottom: 30px; /* 对应父容器 custom-dialog-content 的 padding-bottom */
  right: 55px;  /* 对应父容器 custom-dialog-content 的 padding-right */

  .action-btn {
    width: 89px;
    height: 34px;
    border-radius: 4px;
    font-size: 14px;
    cursor: pointer;
    border: none;
    color: $color-text-white;

    font-weight: 800;
    transition: opacity 0.3s;

    &:hover {
      opacity: 0.85;
    }

    &.is-loading {
      cursor: not-allowed;
      opacity: 0.7;
    }
     /* TODO:: 禁用按钮样式  */

    //&.disabled{
    //  cursor: not-allowed;
    //  background-color: rgba(16,16,16,0.3);
    //}
  }

  .submit-btn {
    background-color: #1575A2;
  }


  .copy-btn {
    background-color: #00a0e9;
  }
}
</style>