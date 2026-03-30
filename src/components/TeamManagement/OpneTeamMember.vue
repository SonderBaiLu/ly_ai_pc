<template>
  <div class="page-container">
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
          <div class="info-item"><span>团队：</span>xxxxx</div>
          <div class="info-item"><span>网站：</span>https://www.lingyanaigc.com/</div>
          <div class="info-item"><span>账号名：</span>DGVGhkh</div>
          <div class="info-item"><span>昵称：</span>DGNh好h</div>
        </div>

        <div class="password-section">
          <span class="pwd-label">初始访问密码</span>
          <div class="pwd-box">LINGYANdesign</div>
          <p class="pwd-tip">系统为您生成了安全默认密码，复制后即可开启，开启后请及时变更密码</p>
        </div>

        <div class="modal-actions">
          <button class="btn-cancel" @click="showPwdModal = false">取消</button>
          <button class="btn-confirm" @click="handleCopyPassword">复制密码</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// 控制弹窗显示状态
const showCollabModal = ref(true)
const showPwdModal = ref(false)

// 点击“开启”按钮的处理逻辑
const handleOpenCollaboration = () => {
  showCollabModal.value = false // 关闭第一个弹窗
  showPwdModal.value = true     // 开启第二个弹窗
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
  try {
    await navigator.clipboard.writeText('LINGYANdesign')
    alert('密码已复制！')
    showPwdModal.value = false // 复制后可根据业务需求决定是否关闭弹窗
  } catch (err) {
    console.error('复制失败:', err)
  }
}
</script>


<style scoped lang="scss">
.page-container {
  min-height: 100vh;
  display: flex;
  font-size: 14px;
  justify-content: center;
  align-items: center;
  /* 使用标准的无衬线字体栈，优先苹方和微软雅黑 */
  font-family: "PingFang SC", "Helvetica Neue", Helvetica, "Microsoft YaHei", Arial, sans-serif;
}

/* 弹窗遮罩层 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(252, 252, 252, 0.7);
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
  background-color: rgba(18,18,18,1);
  color: rgba(16,16,16,1);

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
  width: 602px;  /* 严格按照图1标注 */
  height: 752px; /* 严格按照图1标注 */
  padding: 0 50px 40px; /* 左右留白加大 */

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
        &::before{
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
  justify-content: space-between; /* 确保密码弹窗的内容也能上下撑开 */

  .info-list {
    margin-top: 10px;
    font-size: 16px;
    line-height: 2;

    .info-item {
      span {
        display: inline-block;
        width: 80px;
        color: #999;
      }
    }
  }

  .password-section {
    margin-top: 20px;

    .pwd-label {
      font-size: 12px;
      color: #888;
      margin-bottom: 8px;
      display: block;
    }

    .pwd-box {
      background-color: #0f1012;
      border: 1px solid #333;
      border-radius: 6px;
      padding: 15px 20px;
      font-size: 18px;
      font-weight: bold;
      color: #5ab1ff;
      margin-bottom: 10px;
    }

    .pwd-tip {
      font-size: 12px;
      color: #666;
      text-align: center;
    }
  }
}

/* 底部按钮通用样式 */
.modal-actions {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: auto; /* 关键：这行代码会把按钮自动推到 752px 盒子最底部 */
  padding-top: 20px;

  button {
    width: 140px;
    height: 44px; /* 稍微加高一点按钮 */
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
    background: radial-gradient(0.5% 0.5% at 50% 50%, rgba(23,160,225,1) 0%,rgba(112,197,237,1) 100%);
    border: none;
    font-weight: 400;
    font-size: 14px;
    color: rgba(255,255,255,1);
    &:hover {
      opacity: 0.9;
    }
  }
}
</style>