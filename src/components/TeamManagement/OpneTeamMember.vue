<template>
  <div class="modal-overlay" v-if="showCollabModal">
    <div class="modal-content collab-modal">
      <h2 class="modal-title">开启团队协作</h2>

      <div class="section">
        <h3>团队协作优势</h3>
        <ul>
          <li>多人同步使用，分工更清晰，协作更顺畅</li>
          <li>项目、素材、成果一键共享，减少重复沟通</li>
          <li>权限可控，团队使用更安全、更规范</li>
          <li>提升整体效率，支持从团队到大型团队灵活扩展</li>
        </ul>
      </div>

      <div class="section">
        <h3>团队人数说明</h3>
        <ul>
          <li><strong>免费版：</strong>可创建 1-3 人团队，满足基础协作</li>
          <li><strong>基础会员：</strong>可创建 1-6 人团队，适合小型团队</li>
          <li><strong>标准会员：</strong>可创建 1-12 人团队，适配更多成员共同使用</li>
        </ul>
      </div>

      <div class="modal-actions">
        <button class="btn-cancel" @click="showCollabModal = false">取消</button>
        <button class="btn-confirm" @click="handleOpenCollaboration">开启</button>
      </div>
    </div>
  </div>

  <div class="modal-overlay" v-if="showPwdModal">
    <div class="modal-content pwd-modal">
      <h2 class="modal-title">默认密码</h2>

      <div class="info-list">
        <div class="info-item"><span>团队：</span>{{ from.Account }}</div>
        <div class="info-item"><span>网站：</span>{{ from.website }}</div>
        <div class="info-item"><span>账号名：</span>{{ from.Account }}</div>
        <div class="info-item"><span>昵称：</span>{{ from.Account }}</div>
      </div>

      <div class="password-section">
        <span class="pwd-label">初始访问密码</span>
        <div class="pwd-box">{{ from.pwd }}</div>
        <p class="pwd-tip">系统为您生成了安全默认密码，复制后即可开启，开启后请及时变更密码</p>
      </div>

      <div class="modal-actions">
        <button class="btn-cancel" @click="showPwdModal = false">取消</button>
        <button class="btn-confirm" @click="handleCopyPassword">复制密码</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref} from 'vue'
import teamApi from "@/api/teamManage.ts";
import {useUserStore} from "@/stores/user"
import router from "@/router";
import {ElMessage} from "element-plus";

const userStore = useUserStore()

// 控制弹窗显示状态
const showCollabModal = ref(false)
const showPwdModal = ref(false)
const from = ref({
  website: '',
  Account: '',
  nickname: '',
  pwd: '',
})
// 点击“开启”按钮的处理逻辑
const handleOpenCollaboration = async () => {
  showCollabModal.value = false // 关闭第一个弹窗
  showPwdModal.value = true     // 开启第二个弹窗
  // 开启 页面
  const res = await teamApi.registerByMainUser({})
  if (String((res as any).code) === '0000') {
    ElMessage.info("开启团队成功")
    from.value.website = res.data.url // 网站
    from.value.Account = res.data.userName // 团队名称 账号名称
    from.value.nickname = res.data.nickName // 昵称
    from.value.pwd = res.data.pwd
  } else {
    ElMessage.error(res.msg)
  }
}
// 其他地方调用 子组件的弹窗
const openModal = () => {
  showCollabModal.value = true
  showPwdModal.value = false // 确保密码弹窗处于关闭状态
}
// 将方法暴露给父组件
defineExpose({
  openModal
})

// 复制密码逻辑（模拟）
const handleCopyPassword = async () => {
  const copyText = (
      `团队：${from.value.Account}
        网站：${from.value.website}
        账号名：${from.value.Account}
        昵称：${from.value.nickname}
        默认登录密码：${from.value.pwd}`
  )
  try {
    await navigator.clipboard.writeText(copyText)
    ElMessage.success('复制成功')
    showPwdModal.value = false
  } catch (err: any) {
    console.error('复制失败:', err.success)
  }
}
</script>


<style scoped lang="scss">


/* 弹窗遮罩层 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 4000;
}

/* 弹窗通用基础样式 */
.modal-content {
  border-radius: 16px;
  color: #fff;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  background-color: rgba(18, 18, 18, 1);
  color: rgba(16, 16, 16, 1);

  .modal-title {
    text-align: center;
    font-size: 28px;
    margin-top: 40px; /* 增加顶部间距 */
    //margin-bottom: 40px;
    font-weight: bold;
    color: #ffffff;
    letter-spacing: 1px;
  }
}

/* === 弹窗 1 样式 (开启团队协作) === */
.collab-modal {
  width: 602px;
  height: 752px;
  padding: 0 50px 40px;

  .section {
    margin-bottom: -45px;
    margin-top: 40px;

    h3 {
      margin-top: 40px;
      margin-bottom: 16px;
      color: #ffffff;
      font-size: 18px;
      font-weight: bold;
      text-align: left;
    }

    ul {
      color: #d1d1d1;
      font-size: 19px;
      line-height: 1.8;
      font-weight: 600;
      text-align: left;
      list-style-type: none; // 关键：禁用默认的项目符号
      padding-left: 0; // 清除默认左侧内边距
      li {
        position: relative;
        padding-left: 20px;

        &::before {
          content: '';
          position: absolute; // 绝对定位
          left: 0; // 对齐到 li 的最左边
          top: 0.73em; // 调整小蓝点的垂直位置，使其与首行文字居中对齐
          width: 8px; // 增加宽度
          height: 8px; // 增加高度
          background-color: #3a8ee6; // 设置蓝色
          border-radius: 50%; // 设置为圆形
          box-shadow: 0 0 2px rgba(58, 142, 230, 0.5);
        }
      }
    }
  }
}

/* === 弹窗 2 样式 (默认密码) === */
.pwd-modal {
  width: 602px;
  height: 503px;
  padding: 30px 40px;
  justify-content: space-between;

  .info-list {
    margin-top: 10px;
    font-size: 18px;
    line-height: 2;
    color: rgba(255, 255, 255, 1);
    text-align: justify;
    font-family: Inter-bold, serif;
    font-weight: 700;

    .info-item {
      span {
        display: inline-block;
        width: 80px;
        font-size: 18px;
        line-height: 2;
        color: rgba(255, 255, 255, 1);
        text-align: justify;
        font-family: Inter-bold, serif;
        font-weight: 700;
      }
    }
  }

  .password-section {
    margin-top: 20px;

    .pwd-label {
      font-size: 14px;
      color: rgba(148, 163, 184, 1);
      text-align: justify;
      font-family: NotoSans-regular;
      margin-bottom: 8px;
      display: block;
    }

    .pwd-box {
      background-color: rgba(0, 0, 0, 0.4);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 16px 16px 16px 16px;
      padding: 15px 20px;
      width: 470px;
      height: 62px;
      font-size: 20px;
      font-weight: bold;
      text-align: justify;
      color: rgba(150, 221, 255, 1);
      margin-bottom: 10px;
    }

    .pwd-tip {
      color: rgba(100, 116, 139, 1);
      font-size: 11px;
      text-align: center;
      font-family: NotoSans-regular;
    }
  }
}

/* 底部按钮通用样式 */
.modal-actions {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: auto;
  padding-top: 20px;

  button {
    width: 140px;
    height: 44px;
    border-radius: 6px;
    font-size: 16px;
    cursor: pointer;
    transition: all 0.3s;

  }

  .btn-cancel {
    border-radius: 12px 12px 12px 12px;
    background-color: transparent;
    border: 1px solid #666;
    color: #ccc;
    width: 204px;
    height: 50px;


    &:hover {
      background-color: rgba(255, 255, 255, 0.05);
      color: #fff;
    }
  }

  .btn-confirm {
    width: 204px;
    height: 50px;
    border-radius: 12px 12px 12px 12px;
    background: radial-gradient(0.5% 0.5% at 50% 50%, rgba(23, 160, 225, 1) 0%, rgba(112, 197, 237, 1) 100%);
    border: none;
    font-weight: 400;
    font-size: 14px;
    color: rgba(255, 255, 255, 1);

    &:hover {
      opacity: 0.9;
    }
  }
}
</style>