<template>
  <el-dialog
    v-model="dialogVisible"
    :title="''"
    width="800px"
    :close-on-click-modal="false"
    :close-on-press-escape="true"
    :show-close="false"
    class="write-off-modal"
    @close="handleClose"
  >
    <div class="modal-header">
      <div class="header-title">删除账户</div>
      <div class="header-close" @click="handleClose">
        <img :src="images.close3" alt="" />
      </div>
    </div>

    <div class="modal-content">
      <div class="content-text">
        将删除此账号在潮推手中所生成的视频、图片等创意资产，以及潮推手的剩余潮币和会员身份等。
        <br />
        如确认注销账号，潮推手将为您开启15天注销冷静期，在此期间，您可以随时终止注销流程，恢复账号的资产与权益；如不进行其他操作，冷静期到后，潮推手将正式注销您的账号。注销账号将包含以下信息，请仔细确认:
      </div>

      <div class="delete-list">
        <div class="delete-item">
          <div class="delete-dot"></div>
          <div class="delete-content">
            <div class="delete-title">账号生成的数据</div>
            <div class="delete-desc">在潮推手内生成的视频、图片等创意资产</div>
          </div>
        </div>
        <div class="delete-item">
          <div class="delete-dot"></div>
          <div class="delete-content">
            <div class="delete-title">账号的基础数据</div>
            <div class="delete-desc">潮推手的头像、用户昵称等</div>
          </div>
        </div>
        <div class="delete-item">
          <div class="delete-dot"></div>
          <div class="delete-content">
            <div class="delete-title">账号相关权益</div>
            <div class="delete-desc">
              当前账号在潮推手的剩余潮币值、会员身份等,剩余权益不支持退款与折现
            </div>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <el-button type="danger" class="confirm-btn" :disabled="!agreed" @click="handleConfirm">
          确认注销
        </el-button>
        <div class="agreement-check">
          <label class="checkbox-label" @click="agreed = !agreed">
            <img
              :src="agreed ? images.checkedActive : images.checkedNo"
              alt=""
              class="checkbox-icon"
            />
            <span class="agreement-text">
              已阅读并同意
              <span class="agreement-link" @click.stop="goToAgreement">《账号注销协议》</span>
            </span>
          </label>
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { userApi } from '@/api/user'
import { images } from '@/assets'

interface Props {
  modelValue: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const router = useRouter()
const userStore = useUserStore()

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const agreed = ref(false)

// 跳转到注销协议页面（新标签页打开）
const goToAgreement = () => {
  const routeData = router.resolve({
    path: '/agreement',
    query: { type: 'LOG_OFF_AGREEMENT' },
  })
  window.open(routeData.href, '_blank')
}

// 确认注销
const handleConfirm = async () => {
  if (!agreed.value) {
    ElMessage.warning('请先阅读并同意《账号注销协议》')
    return
  }

  const userId = userStore.userInfo?.userId
  if (!userId) {
    ElMessage.warning('用户信息不存在')
    return
  }

  try {
    const res = await userApi.writeOff({ userId })
    if (res.resp_code === 0) {
      ElMessage.success('注销申请已提交，15天冷静期后账号将被正式注销')
      // 退出登录
      await userStore.logout()
      router.push('/login')
      handleClose()
    } else {
      ElMessage.error(res.resp_msg || '注销失败')
    }
  } catch (error) {
    console.error('注销账号失败:', error)
    ElMessage.error('注销失败，请重试')
  }
}

const handleClose = () => {
  agreed.value = false
  dialogVisible.value = false
}
</script>

<style lang="scss" scoped>
.write-off-modal {
  position: relative;
  color: var(--text-primary);

  .header-title {
    margin-bottom: var(--spacing-sm);
    font-size: var(--font-4xl);
    font-weight: bold;
  }

  .header-close {
    position: absolute;
    top: 32px;
    right: 32px;
    width: 32px;
    height: 32px;
    cursor: pointer;
    img {
      width: 100%;
      height: 100%;
    }
  }

  .modal-content {
    .content-text {
      font-size: var(--font-md);
      line-height: 1.8;
      margin-bottom: var(--spacing-xl);
    }

    .delete-list {
      background: var(--bg-card);
      border-radius: var(---radius-lg);
      padding: var(--spacing-lg);
      margin-bottom: var(--spacing-xxl) var(--spacing-md);

      .delete-item {
        display: flex;
        align-items: flex-start;
        margin-bottom: var(--spacing-md);

        .delete-dot {
          width: 6px;
          height: 6px;
          background: var(--text-yellow);
          border-radius: 50%;
          margin-right: var(--spacing-md);
          margin-top: var(--spacing-sm);
          flex-shrink: 0;
        }

        .delete-content {
          flex: 1;

          .delete-title {
            font-size: var(--font-lg);
            font-weight: 600;
            color: var(--text-primary);
            margin-bottom: var(--spacing-s);
          }

          .delete-desc {
            font-size: var(--font-sm);
            color: var(--text-gray);
          }
        }
      }
    }

    .modal-footer {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      margin-top: 80px;

      .confirm-btn {
        width: 204px;
        height: 50px;
        margin-bottom: var(--spacing-md);
        border-radius: var(--radius-lg);
        background-color: var(--secondary-color);
        border: none;
        font-size: var(--font-lg);
        font-weight: 600;

        &:disabled {
          background: var(--bg-disabled);
          cursor: not-allowed;
        }
      }

      .agreement-check {
        margin-bottom: var(--spacing-xl);

        .checkbox-label {
          display: flex;
          align-items: center;
          cursor: pointer;
          user-select: none;

          .checkbox-icon {
            width: 20px;
            height: 20px;
            margin-right: var(--spacing-sm);
            flex-shrink: 0;
            transition: all 0.2s ease;
          }

          .agreement-text {
            color: rgba(255, 255, 255, 0.9);
            font-size: var(--font-md);

            .agreement-link {
              color: var(--primary-color);
              cursor: pointer;
            }
          }
        }
      }
    }
  }
}
</style>

<style lang="scss">
.el-dialog.write-off-modal {
  // 居中样式已在全局样式中设置，无需重复

  .el-dialog__header {
    display: none;
  }

  .el-dialog__body {
    background-color: var(--bg-third) !important;
    border-radius: var(--radius-lg) !important;
    padding: var(--spacing-3xl) var(--spacing-4xl) !important;
  }
}
</style>
