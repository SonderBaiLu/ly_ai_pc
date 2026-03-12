<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="visible" class="modal-overlay" @click="handleClose">
        <div class="modal-container" @click.stop>
          <!-- 弹窗标题 -->
          <div class="modal-header">
            <h2 class="modal-title">潮推手AI生成内容标识规则及责任声明</h2>
          </div>

          <!-- 弹窗内容 -->
          <div class="modal-body">
            <div class="content-text">
              <p class="greeting">尊敬的用户:</p>
              <p>
                根据法律法规要求，潮推手（以下简称“平台”）向您提供 AI 图片 /
                视频合成等服务时，为避免公众对内容来源产生混淆或误认，平台将默认在所有 AI
                生成合成内容中添加 “AI 生成” 显式明水印，以向公众进行明确提示。
              </p>
              <p>
                如您因商业场景特殊需求（如品牌宣传物料制作、线下展示等），需要获取未添加显式标识的
                AI 生成合成内容，经过您的申请，平台可以向您提供未添加显式标识的 AI 生成合成内容。
              </p>
              <p class="special-reminder">
                <strong>特别提醒：</strong>
              </p>
              <p>
                如您后续使用网络信息内容传播服务发布 AI
                生成合成内容，请注意您还需主动声明并使用传播平台提供的标识功能进行标识。您理解并承诺，如您未按照法律法规要求在
                AI
                生成合成内容上添加显式标识，导致公众混淆或者误认，因此所发生的后果和责任均由您自行承担。
              </p>
              <p>
                您确认已充分理解并同意：如您未按法律法规及本声明要求，在 AI
                生成合成内容上添加显式标识，导致公众产生混淆、误认或引发任何法律纠纷、第三方投诉索赔等后果，相关法律责任、经济损失及声誉风险均由您自行承担，与平台无涉。平台有权根据法律法规要求，随时核查您的内容使用情况，如发现违规使用行为，平台可暂停或终止向您提供相关服务，并保留追究您违约责任的权利。
              </p>
              <p class="thanks">感谢您的理解与配合，共同维护合规、透明的 AI 应用环境。</p>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="modal-footer">
            <el-button class="cancel-btn" @click="handleCancel">取消</el-button>
            <el-button class="confirm-btn" type="primary" @click="handleConfirm">确认</el-button>
          </div>

          <!-- 不再弹窗提醒选项 -->
          <div class="no-remind-option" @click="toggleNoRemind">
            <img
              class="no-remind-icon"
              :src="noRemind ? images.checkedActive : images.checkedNo"
              alt=""
            />
            <span>不再弹窗提醒</span>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { images } from '@/assets'

interface Props {
  modelValue: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  confirm: []
  cancel: []
  'no-remind-change': [value: boolean]
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (val: boolean) => emit('update:modelValue', val),
})

const noRemind = ref(false)

const handleClose = () => {
  emit('cancel')
  visible.value = false
}

const handleCancel = () => {
  emit('cancel')
  visible.value = false
}

const handleConfirm = () => {
  emit('confirm')
  visible.value = false
}

const toggleNoRemind = () => {
  noRemind.value = !noRemind.value
  emit('no-remind-change', noRemind.value)
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
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  background: linear-gradient(145deg, rgba(32, 27, 38, 0.95) 0%, rgba(23, 19, 27, 0.95) 100%);
  border-radius: var(--radius-xl);
  padding: var(--spacing-xxl);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(143, 80, 234, 0.2);
  backdrop-filter: blur(20px);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

// 弹窗头部
.modal-header {
  text-align: center;
  margin-bottom: var(--spacing-xl);

  .modal-title {
    font-size: var(--font-xl);
    font-weight: 700;
    color: var(--text-primary);
    margin: 0;
  }
}

// 弹窗主体
.modal-body {
  flex: 1;
  overflow-y: auto;
  margin-bottom: var(--spacing-lg);

  .content-text {
    color: var(--text-primary);
    font-size: var(--font-md);
    line-height: 1.8;

    p {
      margin-bottom: var(--spacing-md);
      text-align: justify;
      text-indent: 2em;

      &:last-child {
        margin-bottom: 0;
      }
    }

    .greeting {
      font-weight: 500;
      text-indent: 0;
    }

    .special-reminder {
      margin-top: var(--spacing-lg);
      margin-bottom: var(--spacing-sm);
      text-indent: 0;

      strong {
        color: var(--primary-color);
      }
    }

    .thanks {
      margin-top: var(--spacing-lg);
      color: var(--text-secondary);
      text-indent: 0;
    }
  }
}

// 操作按钮
.modal-footer {
  display: flex;
  justify-content: center;
  gap: var(--spacing-md);
  margin-top: var(--spacing-lg);

  .cancel-btn,
  .confirm-btn {
    min-width: 120px;
    min-height: 40px;
  }
}

// 不再弹窗提醒选项
.no-remind-option {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: var(--spacing-md);
  color: var(--text-secondary);
  font-size: var(--font-sm);
  cursor: pointer;
  user-select: none;
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 0.8;
  }

  .no-remind-icon {
    width: 16px;
    height: 16px;
    object-fit: contain;
    flex-shrink: 0;
  }
}

// 过渡动画
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;

  .modal-container {
    transition:
      transform 0.3s ease,
      opacity 0.3s ease;
  }
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;

  .modal-container {
    transform: scale(0.9) translateY(20px);
    opacity: 0;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .modal-container {
    padding: var(--spacing-xl);
    max-height: 85vh;
  }

  .modal-header {
    .modal-title {
      font-size: var(--font-lg);
    }
  }

  .modal-body {
    .content-text {
      font-size: var(--font-sm);
    }
  }

  .modal-footer {
    flex-direction: column;

    .cancel-btn,
    .confirm-btn {
      width: 100%;
    }
  }
}
</style>
