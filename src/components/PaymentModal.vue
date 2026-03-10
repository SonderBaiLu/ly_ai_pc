<template>
  <!-- 支付弹窗 -->
  <el-dialog
    v-model="dialogVisible"
    width="420px"
    class="vip-pay-dialog"
    :show-close="false"
    align-center
    destroy-on-close
    append-to-body
  >
    <template #header>
      <div class="vip-pay-header">
        <span class="vip-pay-title">{{ payDialogTitle || '月度会员' }}</span>
        <img
          :src="images.closePay"
          alt=""
          srcset=""
          class="vip-pay-close-icon"
          @click="closePayDialog"
        />
      </div>
    </template>

    <div class="vip-pay-body">
      <div class="vip-pay-amount-row">
        <span class="label">扫码支付</span>
        <span class="amount">{{ payAmount }}</span>
        <span class="unit">元</span>
      </div>

      <!-- 步骤一：协议+按钮 -->
      <div v-if="!payQrCode" class="vip-pay-agreement-card">
        <div class="agreement-text-top">支付前请阅读</div>
        <div class="agreement-name" @click="navigateToAgreement('PAY_SERVICE_AGREEMENT')">
          《潮推手付费服务协议》
        </div>
        <el-button
          class="agree-button"
          type="primary"
          :loading="isCreatingPayment"
          @click="createVipPaymentOrder()"
        >
          同意并支付
        </el-button>
      </div>

      <!-- 步骤二：展示二维码 -->
      <div
        v-else
        class="vip-pay-qrcode-wrapper"
        @click="isQrCodeExpired ? createVipPaymentOrder() : null"
      >
        <div class="vip-pay-qrcode">
          <img :src="payQrCode" alt="支付二维码" />
          <!-- 过期遮罩层 -->
          <div v-if="isQrCodeExpired" class="qrcode-expired-overlay">
            <img v-if="!isCreatingPayment" :src="images.refresh" alt="刷新" class="refresh-icon" />
            <el-icon v-else class="refresh-icon loading-icon" :size="48">
              <Loading />
            </el-icon>
          </div>
        </div>
      </div>

      <div v-if="!isQrCodeExpired" class="vip-pay-footer-row">
        <div class="pay-channel">
          <img :src="images.alipayPay" alt="" srcset="" class="pay-icon" />
          <span>支付宝扫码支付</span>
          <span v-if="payExpireText" class="expire-text">{{ payExpireText }}</span>
        </div>
      </div>

      <div class="vip-pay-notice">
        <p>
          •
          <span class="bold">购买性质：</span>
          本次购买为单次购买（非自动续费套餐）。您购买的月卡、季卡或年卡在服务期结束后将自动结束，
          <span class="bold">不会自动扣费</span>
          。
        </p>
        <p>
          •
          <span class="bold">服务有效期：</span>
          服务到期后，套餐内未使用的“潮币”将自动清零。
        </p>
        <p>
          •
          <span class="bold">付款说明：</span>
          会员服务为虚拟商品，一经支付成功，不支持退款，感谢您的理解。如需发票，我们可为您开具。
        </p>
        <p>
          •
          <span class="bold">联系客服：</span>
          如有任何疑问，欢迎随时联系
          <span class="link-text" @click="openCustomerService">我们的客服</span>
          ，我们将竭诚为您服务。
        </p>
        <p class="link-text">
          • 支付即视您已同意
          <span @click="navigateToAgreement('PAY_SERVICE_AGREEMENT')">《潮推手付费服务协议》</span>
        </p>
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, onBeforeUnmount } from 'vue'
import { ElMessage } from 'element-plus'
import { Loading } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { paymentApi } from '@/api/payment'
import { generateQRCode } from '@/utils/qrcode'
import { images } from '@/assets'
import { useUserStore } from '@/stores/user'

// Props
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  // 兼容旧接口：使用 show prop
  show: {
    type: Boolean,
    default: undefined,
  },
  // 弹窗标题
  title: {
    type: String,
    default: '',
  },
  // 初始金额（在创建订单前显示）
  initialAmount: {
    type: Number,
    default: 0,
  },
  // 创建支付订单的函数，返回支付订单数据
  createPaymentOrder: {
    type: Function,
    required: true,
  },
  // 购买类型：用于显示不同的成功消息
  purchaseType: {
    type: String as () => 'membership' | 'coin',
    default: 'membership',
  },
  // 是否显示联系客服选项
  showCustomerService: {
    type: Boolean,
    default: false,
  },
  // 打开客服弹窗的回调函数
  onOpenCustomerService: {
    type: Function,
    default: undefined,
  },
})

// Emits
const emit = defineEmits(['update:modelValue', 'close', 'success'])

const router = useRouter()
const userStore = useUserStore()

// 弹窗显示状态（优先使用 show prop，兼容旧接口）
const dialogVisible = computed({
  get: () => {
    if (props.show !== undefined) {
      return props.show
    }
    return props.modelValue
  },
  set: (val) => {
    if (props.show !== undefined) {
      emit('close')
    } else {
      emit('update:modelValue', val)
    }
  },
})

// 支付相关状态
const payAmount = ref(0)
const payQrCode = ref('') // 支付二维码图片地址
const payExpireSeconds = ref(0)
const isCreatingPayment = ref(false) // 创建支付订单的加载状态
let payTimer: number | null = null
// 当前支付订单号（用于轮询支付结果）
let currentPayOrderId: string | null = null

// 初始化金额从 props 获取（始终使用传过来的 initialAmount）
watch(
  () => props.initialAmount,
  (newAmount) => {
    if (!payQrCode.value) {
      // 只有在没有二维码时才更新金额（避免在支付过程中覆盖金额）
      payAmount.value = newAmount || 0
    }
  },
  { immediate: true }
)

const isQrCodeExpired = computed(() => payExpireSeconds.value <= 0 && payQrCode.value)

const payExpireText = computed(() => {
  if (!payExpireSeconds.value) return
  const m = Math.floor(payExpireSeconds.value / 60)
  const s = payExpireSeconds.value % 60
  const mm = m.toString().padStart(2, '0')
  const ss = s.toString().padStart(2, '0')
  return `${mm}分${ss}秒后失效`
})

const clearPayTimer = () => {
  if (payTimer !== null) {
    window.clearInterval(payTimer)
    payTimer = null
  }
}

const handleClose = () => {
  clearPayTimer()
  if (props.show !== undefined) {
    // 如果使用 show prop，需要通过 emit 通知父组件关闭
    emit('close')
  } else {
    // 如果使用 modelValue，直接更新
    emit('update:modelValue', false)
  }
}

// 支付弹窗标题（兼容模板中的 payDialogTitle）
const payDialogTitle = computed(() => props.title || '月度会员')

// 关闭支付弹窗（兼容模板中的 closePayDialog）
const closePayDialog = () => {
  handleClose()
}

// 监听弹窗关闭时清理
watch(dialogVisible, (newVal) => {
  if (!newVal) {
    clearPayTimer()
    // 重置状态
    payQrCode.value = ''
    payAmount.value = props.initialAmount || 0 // 重置为初始金额
    payExpireSeconds.value = 0
    currentPayOrderId = null
  } else {
    // 弹窗打开时，设置初始金额（即使为0也要设置，确保金额正确）
    payAmount.value = props.initialAmount || 0
  }
})

// 轮询查询支付宝支付结果
const checkAlipayPayStatus = async () => {
  if (!currentPayOrderId) return

  try {
    const res = await paymentApi.queryAlipayOrder(currentPayOrderId)
    // 当 resp_code === 0 且 datas === 1 时，支付成功
    const datas = res.datas as any
    if (res.resp_code === 0 && datas === 1) {
      // 停止轮询
      clearPayTimer()
      currentPayOrderId = null
      payExpireSeconds.value = 0

      // 根据购买类型显示不同的成功提示
      let successMessage = '支付成功'
      if (props.purchaseType === 'coin') {
        successMessage = '支付成功，潮币已充值'
      } else {
        successMessage = '支付成功，会员已开通'
      }
      ElMessage.success(successMessage)

      // 关闭弹窗
      handleClose()

      // 支付成功后刷新用户信息（更新 isVip、expirationDate、潮币等）
      const userInfo = userStore.userInfo
      const mobile = userInfo?.phone
      if (mobile) {
        try {
          await userStore.getUserInfo(mobile)
        } catch (error) {
          console.error('更新用户信息失败:', error)
        }
      }

      // 通知父组件支付成功
      emit('success', { orderId: currentPayOrderId })
    }
  } catch (error) {
    console.error('查询支付结果异常:', error)
  }
}

// 跳转到协议页面（兼容模板中的 navigateToAgreement，接受参数）
const navigateToAgreement = (agreementType: string) => {
  // 在新标签页中打开协议页面，避免关闭支付弹窗导致金额丢失
  const routeData = router.resolve({
    path: '/agreement',
    query: { type: agreementType },
  })
  window.open(routeData.href, '_blank')
}

// 打开客服弹窗
const handleOpenCustomerService = () => {
  if (props.onOpenCustomerService) {
    props.onOpenCustomerService()
  }
}

// 打开客服弹窗（兼容模板中的 openCustomerService）
const openCustomerService = () => {
  handleOpenCustomerService()
}

// 创建支付订单并展示二维码
const handleCreatePayment = async () => {
  // 如果正在创建订单，防止重复点击
  if (isCreatingPayment.value) {
    return
  }

  isCreatingPayment.value = true

  try {
    // 调用父组件传入的创建支付订单函数
    const data = await props.createPaymentOrder()

    if (!data) {
      ElMessage.error('创建支付订单失败')
      return
    }

    currentPayOrderId = data.orderNo || data.orderId || null

    if (data.alipayOrderInfo) {
      try {
        const qrCodeDataUrl = await generateQRCode(data.alipayOrderInfo, {
          width: 300,
          margin: 1,
          color: {
            dark: '#000000',
            light: '#FFFFFF',
          },
        })
        payQrCode.value = qrCodeDataUrl
      } catch (error) {
        console.error('生成二维码失败:', error)
        ElMessage.error('生成二维码失败，请稍后重试')
        payQrCode.value = ''
      }
    }

    // 默认 10 分钟有效期
    payExpireSeconds.value = data.expireSeconds || 10 * 60

    clearPayTimer()
    payTimer = window.setInterval(async () => {
      if (payExpireSeconds.value > 0) {
        payExpireSeconds.value -= 1
        // 每 3 秒轮询一次支付结果
        if (currentPayOrderId && payExpireSeconds.value % 3 === 0) {
          await checkAlipayPayStatus()
        }
      } else {
        clearPayTimer()
      }
    }, 1000)
  } catch (error) {
    console.error('创建支付订单异常:', error)
    ElMessage.error('创建支付订单失败，请稍后重试')
  } finally {
    isCreatingPayment.value = false
  }
}

// 创建支付订单并展示二维码（兼容模板中的 createVipPaymentOrder）
const createVipPaymentOrder = async () => {
  await handleCreatePayment()
}

// 组件卸载时清理定时器
onBeforeUnmount(() => {
  clearPayTimer()
})
</script>

<style lang="scss" scoped>
.vip-pay-header {
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  position: relative;

  .vip-pay-title {
    font-size: var(--font-xxl);
    font-weight: 700;
    color: var(--text-primary);
  }

  .vip-pay-close-icon {
    position: absolute;
    top: -6px;
    right: 17px;
    cursor: pointer;
    width: 24px;
    height: 24px;
  }
}

.vip-pay-body {
  font-size: var(--font-md);
  color: var(--text-hui);
  text-align: center;

  .vip-pay-amount-row {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 20px;

    .amount {
      margin: 0 14px;
      color: rgba(192, 126, 255, 1);
      font-size: var(--font-5xl);
      font-weight: bold;
    }
  }

  .vip-pay-agreement-card {
    margin: 0 auto 19px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 216px;
    height: 216px;
    border-radius: var(--radius-sm);
    background-color: #333333;
    box-sizing: border-box;
    font-size: var(--font-md);
    color: var(--text-primary);
    .agreement-text-top {
      margin-bottom: 8px;
    }

    .agreement-name {
      margin-bottom: 41px;
    }

    .agree-button {
      width: 166px;
      height: 37px;
      border-radius: 12px 12px 12px 12px;
      background: linear-gradient(
        90deg,
        rgba(204, 166, 244, 1) 0%,
        rgba(192, 126, 255, 1) 53%,
        rgba(204, 166, 244, 1) 99%
      );
      font-size: var(--font-lg);
      font-weight: 600;
      color: var(--text-primary);
      border: none !important;
      box-shadow: none !important;

      &:hover,
      &:focus,
      &:focus-visible,
      &:active {
        border: none !important;
        box-shadow: none !important;
      }
    }
  }

  .vip-pay-qrcode-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin-bottom: 24px;
  }

  .vip-pay-qrcode {
    position: relative;
    width: 216px;
    height: 216px;
    padding: var(--spacing-sm);
    border-radius: var(--radius-sm);
    background: #333333;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;

    img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      border-radius: var(--radius-sm);
    }

    // 过期遮罩层
    .qrcode-expired-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: var(--radius-sm);
      cursor: pointer;
      z-index: 10;

      .refresh-icon {
        width: 48px;
        height: 48px;
        object-fit: contain;
      }
    }
  }

  .vip-pay-footer-row {
    display: flex;
    justify-content: center;
    gap: 16px;
    margin-bottom: 29px;
    font-size: var(--font-md);

    .pay-channel {
      display: flex;
      align-items: center;
      gap: 6px;
      color: rgba(59, 130, 246, 1);

      .pay-icon {
        width: 20px;
        height: 20px;
      }

      .expire-text {
        margin-left: 33px;
      }
    }
  }

  .vip-pay-notice {
    text-align: left;
    color: rgba(255, 255, 255, 1);
    font-size: var(--font-xs);

    p {
      margin-bottom: 11px;
    }

    .bold {
      font-weight: bold;
    }

    .link-text {
      color: var(--primary-color);
      cursor: pointer;

      span {
        cursor: pointer;
        transition: opacity 0.2s ease;

        &:hover {
          opacity: 0.8;
        }
      }

      &:hover {
        opacity: 0.8;
      }
    }
  }
}
</style>

<style lang="scss">
// 支付弹窗样式
// 提高 z-index，确保在任何详情弹窗/会员弹窗之上
.vip-pay-dialog.el-dialog {
  z-index: 2100 !important;
}

.vip-pay-dialog {
  .el-dialog {
    border-radius: 16px !important;
    overflow: hidden;
    background-color: rgba(26, 26, 26, 1);
    border: 1px solid rgba(255, 255, 255, 0.04);
  }

  .el-dialog__header {
    padding: 25px 0 !important;
    background-color: rgba(26, 26, 26, 1) !important;
  }

  .el-dialog__body {
    padding: 0 48px 22px !important;
    text-align: center;
    background-color: rgba(26, 26, 26, 1);
  }
}
</style>
