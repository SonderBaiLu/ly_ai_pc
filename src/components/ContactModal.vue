<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="visible" class="modal-overlay" @click="handleClose">
        <div class="modal-container" @click.stop>
          <!-- 关闭按钮 -->
          <button class="close-btn" @click="handleClose">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>

          <!-- 弹窗标题 -->
          <div class="modal-header">
            <h2 class="modal-title">联系我们</h2>
            <p class="modal-subtitle">扫码添加客服微信</p>
          </div>

          <!-- 弹窗内容 -->
          <div class="modal-body">
            <!-- 二维码区域 -->
            <div class="qrcode-wrapper">
              <!-- 客服二维码图片 -->
              <img :src="customerCodeSrc" alt="客服二维码" class="qrcode-img" />
            </div>

            <p class="contact-tip">扫码添加客服微信，获取更多帮助</p>

            <!-- 联系方式 -->
            <!-- <div class="contact-info">
              <div class="info-item">
                <span class="info-label">工作时间</span>
                <span class="info-value">周一至周日 9:00-21:00</span>
              </div>
              <div class="info-item">
                <span class="info-label">客服热线</span>
                <span class="info-value">4001502277</span>
              </div>
              <div class="info-item">
                <span class="info-label">商务合作</span>
                <span class="info-value">lingyanservice@126.com</span>
              </div>
            </div> -->
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { images } from '@/assets'
import { usePlatformStore } from '@/stores/platform'

interface Props {
  modelValue: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const visible = computed(() => props.modelValue)

// 平台配置：优先使用接口下发的客服二维码，兜底为本地静态资源
const platformStore = usePlatformStore()
platformStore.fetchPcPlatformConfig?.()

const customerCodeSrc = computed(
  () => platformStore.pcPlatformConfig?.pcCustomerService || images.customerCode
)

const handleClose = () => {
  emit('update:modelValue', false)
}
</script>

<style lang="scss" scoped>
// 遮罩层
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: var(--spacing-xl);
}

// 弹窗容器
.modal-container {
  position: relative;
  max-width: 500px;
  width: 100%;
  background: linear-gradient(145deg, rgba(32, 27, 38, 0.95) 0%, rgba(23, 19, 27, 0.95) 100%);
  border-radius: var(--radius-xl);
  padding-top: var(--spacing-xxl);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(143, 80, 234, 0.2);
  backdrop-filter: blur(20px);
}

// 关闭按钮
.close-btn {
  position: absolute;
  top: var(--spacing-lg);
  right: var(--spacing-lg);
  width: 32px;
  height: 32px;
  border: none;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  z-index: 10;

  svg {
    width: 18px;
    height: 18px;
  }

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    color: var(--text-primary);
    transform: rotate(90deg);
  }
}

// 弹窗头部
.modal-header {
  text-align: center;
  margin-bottom: var(--spacing-xl);

  .modal-title {
    font-size: var(--font-xxl);
    font-weight: 700;
    background: var(--gradient-primary);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: var(--spacing-sm);
  }

  .modal-subtitle {
    font-size: var(--font-md);
    color: var(--text-secondary);
  }
}

// 弹窗主体
.modal-body {
  display: flex;
  flex-direction: column;
  align-items: center;

  .qrcode-wrapper {
    width: 240px;
    height: 240px;
    transition: all 0.3s ease;
    margin-bottom: var(--spacing-lg);

    .qrcode-img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }

    .qrcode-placeholder {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: var(--spacing-md);
      background: linear-gradient(135deg, rgba(143, 80, 234, 0.1), rgba(171, 114, 252, 0.1));
      border-radius: var(--radius-sm);

      svg {
        color: var(--primary-color);
        opacity: 0.6;
      }

      .placeholder-text {
        font-size: var(--font-md);
        color: var(--text-secondary);
      }
    }
  }

  .contact-tip {
    font-size: var(--font-sm);
    color: var(--text-placeholder);
    text-align: center;
    margin-bottom: var(--spacing-xxl);
  }
}

// 联系方式
// .contact-info {
//   width: 100%;
//   display: flex;
//   flex-direction: column;
//   gap: var(--spacing-md);

//   .info-item {
//     display: flex;
//     justify-content: space-between;
//     align-items: center;
//     padding: var(--spacing-md);
//     background: rgba(255, 255, 255, 0.03);
//     border-radius: var(--radius-sm);
//     border: 1px solid rgba(255, 255, 255, 0.05);
//     transition: all 0.3s ease;

//     &:hover {
//       background: rgba(255, 255, 255, 0.05);
//       border-color: rgba(143, 80, 234, 0.3);
//     }

//     .info-label {
//       font-size: var(--font-sm);
//       color: var(--text-placeholder);
//     }

//     .info-value {
//       font-size: var(--font-md);
//       color: var(--text-primary);
//       font-weight: 500;
//     }
//   }
// }

// 响应式设计
@media (max-width: 768px) {
  .modal-container {
    padding: var(--spacing-xl);
  }

  .qrcode-wrapper {
    width: 200px !important;
    height: 200px !important;
  }

  .modal-header {
    .modal-title {
      font-size: var(--font-xl);
    }
  }
}
</style>
