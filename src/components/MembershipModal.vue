<template>
  <el-dialog v-model="dialogVisible" :title="modalTitle" width="1200px" :close-on-click-modal="false" :show-close="true"
    append-to-body class="membership-modal-dialog" @close="handleClose">
    <!-- 提示信息 -->
    <div v-if="modalConfig.content" class="modal-tip">
      {{ modalConfig.content }}
    </div>

    <!-- 会员套餐选择区域 -->
    <div class="membership-section">
      <div class="section-header">
        <el-tabs v-model="activeTab" class="membership-tabs">
          <el-tab-pane v-for="tab in membershipTabs" :key="tab.key" :label="tab.name" :name="tab.key" />
        </el-tabs>

        <div v-if="activeTab === 'membership'" class="member-version-toggle">
          <el-button class="toggle-segment" :type="memberVersion === 1 ? 'primary' : 'default'"
            @click="switchMemberVersion(1)">
            基础版
          </el-button>
          <el-button class="toggle-segment" :type="memberVersion === 2 ? 'primary' : 'default'"
            @click="switchMemberVersion(2)">
            <span class="recommend-tag">推荐</span>
            标准版
          </el-button>
        </div>
      </div>

      <!-- 会员内容 -->
      <template v-if="activeTab === 'membership'">
        <div class="membership-cards-wrapper">
          <!-- 会员卡片网格 -->
          <div class="membership-cards-grid">
            <!-- 循环渲染会员卡片 -->
            <div v-for="(plan, index) in membershipPlansFromApi" :key="(plan.id ?? plan.productCode ?? index) as any"
              class="membership-card" :class="`theme-${index}`">
              <div class="card-header">
                <h3 class="card-title title">{{ getVipName(plan) }}</h3>
                <div v-if="getDiscountText(plan)" class="corner-discount-tag">{{ getDiscountText(plan) }}</div>
                <div class="price-section">
                  <span class="price">¥{{ plan.productDiscountPrice ?? plan.productPrice }}</span>
                  <span class="price-unit">{{ getPriceUnit(plan) }}</span>
                  <!-- 显示原价（删除线） -->
                  <span v-if="getDiscountText(plan) && plan.productPrice !== undefined && plan.productPrice !== null"
                    class="original-price">
                    {{ plan.productPrice }}
                  </span>
                </div>
              </div>

              <div class="card-body">
                <el-button class="purchase-button" type="primary" :disabled="isFreePlan(plan)"
                  @click="handlePurchaseAction(plan)">
                  {{ getPurchaseButtonText(plan) }}
                </el-button>

                <!-- 灵衍信息卡片：使用新接口字段 waveCoin / productDesc -->
                <div v-if="plan.waveCoin && plan.productDesc && !isFreePlan(plan)" class="coin-info-card">
                  <div class="coin-content">
                    <div class="coin-amount">单月{{ plan.waveCoin }}个灵衍值</div>
                    <div class="coin-detail">{{ plan.productDesc }}</div>
                  </div>
                </div>
              </div>

              <div class="card-features">
                <div v-for="(right, idx) in plan.privilegesListVOS" :key="idx" class="feature-item">
                  <img v-if="idx === 0" :src="images.check" class="feature-icon" alt="" />
                  <img v-if="idx === 1" :src="images.check1" class="feature-icon" alt="" />
                  <img v-if="idx === 2" :src="images.check2" class="feature-icon" alt="" />
                  <img v-if="idx === 3" :src="images.check3" class="feature-icon" alt="" />
                  <span>{{ right.privilegesName || right.privilegesCode }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- 灵衍值页面 -->
      <template v-else-if="activeTab === 'tidecoins'">
        <!-- 温馨提示 -->
        <div class="tidecoins-notice">
          温馨提示：
          <span class="notice-text">
            灵衍值不可兑换会员，不可转赠与提现；充值后有效期为{{
              selectedPlan?.effectDate || '2'
            }}年，不支持退换或反向兑换成人民币。
          </span>
          <span class="rules-link" @click="() => navigateToAgreement('COIN_RULES_DESCRIPTION')">
            灵衍值规则
          </span>
        </div>

        <!-- 灵衍值套餐网格 -->
        <div class="tidecoins-grid">
          <div v-for="plan in tideCoinsPlans" :key="plan.id" class="tidecoin-card"
            :class="{ selected: (plan as any).isSelected }" @click="selectTideCoin(plan)">
            <!-- 上半部分：暗色背景 -->
            <div class="tidecoin-top">
              <div class="tidecoin-amount">
                <img class="flame-icon" :src="images.logoMini" alt="" srcset="" />
                <span class="amount">{{ plan.waveCoin }}</span>
              </div>
            </div>

            <!-- 下半部分：更深背景 -->
            <div class="tidecoin-bottom">
              <div class="tidecoin-price">
                <span class="current">¥ {{ plan.productDiscountPrice }}</span>
                <span v-if="Number(plan.productDiscount) < 100" class="origin">¥ {{ plan.productPrice }}</span>
              </div>
              <el-button class="tidecoin-button" type="primary" @click.stop="handlePurchaseAction(plan)">
                立即购买
              </el-button>
            </div>
          </div>
        </div>
      </template>
    </div>
  </el-dialog>

  <!-- 支付弹窗 -->
  <PaymentModal v-model="showPayDialog" :title="payDialogTitle" :initial-amount="initialPayAmount"
    :payment-methods="paymentMethods" :create-payment-order="handleCreatePaymentOrder" :purchase-type="purchaseType"
    @close="handlePayDialogClose" @success="handlePaymentSuccess" />
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { membershipApi, type AppProduct } from '@/api/membership'
import { paymentApi, type PaymentMethod } from '@/api/payment'
import { images } from '@/assets'
import { useRouter } from 'vue-router'

// Props
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  // 兼容旧接口：使用 show prop（如果提供了则使用它，否则使用 modelValue）
  show: {
    type: Boolean,
    default: undefined,
  },
  // 错误类型：coin_deficiency(灵衍值不足) | up_vip(需要升级VIP)
  errorType: {
    type: String,
    default: 'coin_deficiency',
  },
  // 用户是否是VIP（可以是布尔值或数字）
  isVip: {
    type: [Boolean, Number],
    default: undefined,
  },
  // 自定义标题（如果提供，则优先使用自定义标题）
  customTitle: {
    type: String,
    default: '',
  },
})

// Emits
const emit = defineEmits(['update:modelValue', 'close', 'success'])

const router = useRouter()

// 用户信息
const userStore = useUserStore()
const userInfo = computed(() => userStore.userInfo)

// 会员套餐标签
// - 默认：显示「会员」+「充值」两个tab
// - 当 errorType === 'up_vip'（例如非会员点击生成数量多张触发升级会员）时：
//   只展示「会员」tab，隐藏「充值」和购买灵衍值相关入口
const membershipTabs = computed(() => {
  const baseTabs = [{ key: 'membership', name: '会员' }]
  if (props.errorType === 'up_vip') {
    return baseTabs
  }
  return [...baseTabs, { key: 'tidecoins', name: '充值' }]
})

const activeTab = ref('membership')

// 基础版 / 标准版 切换：1=基础版 2=标准版
const memberVersion = ref<number>(1)

// 会员套餐数据（直接使用接口返回字段）
const membershipPlansFromApi = ref<AppProduct[]>([])

// 灵衍值套餐数据（从API加载）
const tideCoinsPlans = ref<any[]>([])

// 选中的套餐
const selectedPlan = ref<any>(null)

// === 支付弹窗相关状态 ===
const showPayDialog = ref(false)
const payDialogTitle = ref('')
const purchaseType = ref<'membership' | 'coin'>('membership') // 购买类型：会员或灵衍值
const currentSelectedPlan = ref<any>(null) // 当前选择的套餐
const initialPayAmount = ref(0) // 初始支付金额
const paymentMethods = ref<PaymentMethod[]>([])

// 加载会员套餐数据
const loadMembershipPlans = async () => {
  try {
    // 新接口：/api/v1/app/getAppProductList?productKind=vip
    const res = await membershipApi.getAppProductList({ productKind: 'vip' })

    if (res.code === '0000' && res.data) {
      const products: AppProduct[] = Array.isArray(res.data) ? res.data : []

      // memberVersion: 1 基础版 / 2 标准版（与 productType：1 基础 / 2 标准 对齐）
      // productType=0 是“免费版/普通会员”，在基础版/标准版切换时都需要展示
      const targetProductType = memberVersion.value
      membershipPlansFromApi.value = products.filter((p) => {
        const t = Number(p.productType ?? 0)
        return t === targetProductType || t === 0
      })
    } else {
      ElMessage.error(res.msg || '获取会员套餐失败')
    }
  } catch (error) {
    console.error('加载会员套餐失败:', error)
    ElMessage.error('加载会员套餐失败')
  }
}

// 加载灵衍值套餐数据
const loadTideCoinPlans = async () => {
  try {
    // 新接口：/api/v1/app/getAppProductList?productKind=Points
    const res = await membershipApi.getAppProductList({ productKind: 'Points' })
    if (res.code === '0000' && res.data) {
      const rows = Array.isArray(res.data) ? res.data : []
      tideCoinsPlans.value = rows.map((item: any) => ({
        ...item,
        isSelected: false,
      }))
      if (tideCoinsPlans.value.length > 0) {
        selectTideCoin(tideCoinsPlans.value[0])
      }
    } else {
      ElMessage.error(res.msg || '获取灵衍值套餐失败')
    }
  } catch (error) {
    console.error('加载灵衍值套餐失败:', error)
    ElMessage.error('加载灵衍值套餐失败')
  }
}

// 弹窗显示状态（优先使用 show prop，兼容旧接口）
const dialogVisible = computed(() => {
  if (props.show !== undefined) {
    return props.show
  }
  return props.modelValue
})

// 监听显示状态变化
watch(
  () => (props.show !== undefined ? props.show : props.modelValue),
  (newVal) => {
    if (newVal) {
      // 弹窗打开时执行
      // 根据错误类型设置默认标签页
      // 如果是灵衍值不足，默认选中灵衍值购买模块
      if (props.errorType === 'coin_deficiency') {
        activeTab.value = 'tidecoins'
      } else if (props.errorType === 'up_vip') {
        // 如果需要升级VIP，默认选中会员模块
        activeTab.value = 'membership'
      } else {
        // 其他情况，根据用户类型设置
        if (Number(userInfo.value?.vipLevel ?? 0) > 0) {
          activeTab.value = 'tidecoins'
        } else {
          activeTab.value = 'membership'
        }
      }

      // 初始化基础版/标准版：保持与 Membership.vue 一致
      // - 按 vipLevel 展示（vipLevel >=2 视为标准版）
      // - 否则展示基础版（1）
      const vipLevel = userInfo.value?.vipLevel ?? 0
      memberVersion.value = vipLevel >= 2 ? 2 : 1

      loadMembershipPlans()
      loadTideCoinPlans()
    } else {
      // 弹窗关闭时重置状态
      showPayDialog.value = false
      selectedPlan.value = null
      currentSelectedPlan.value = null
      // 重置所有套餐的选中状态
      membershipPlansFromApi.value.forEach((p: any) => (p.isSelected = false))
      tideCoinsPlans.value.forEach((p: any) => (p.isSelected = false))
    }
  },
  { immediate: true }
)

// 选择灵衍值
const selectTideCoin = (plan: any) => {
  // 取消所有选择
  tideCoinsPlans.value.forEach((p) => (p.isSelected = false))
  // 选择当前项
  plan.isSelected = true
  selectedPlan.value = plan
}

// 创建支付订单的函数（供 PaymentModal 调用）
// 后端 /v1/payment/submit 只需要 channelId、productId
const handleCreatePaymentOrder = async (channelId?: string | number) => {
  if (!userInfo.value) {
    ElMessage.warning('请先登录后再购买')
    router.push('/login')
    throw new Error('用户未登录')
  }

  const targetPlan = currentSelectedPlan.value
  if (!targetPlan) {
    throw new Error('未选择套餐')
  }

  if (channelId === undefined || channelId === null || channelId === '') {
    throw new Error('未选择支付渠道')
  }

  const productId = Number(targetPlan.id ?? targetPlan.productCode)
  if (Number.isNaN(productId)) {
    throw new Error('未找到购买商品ID（productId）')
  }

  const payload = {
    channelId: Number(channelId),
    productId,
  }

  const res = await paymentApi.createPaymentOrder(payload)
  if (res.code !== '0000' || !res.data) {
    throw new Error(res.msg || '创建支付订单失败')
  }

  return res.data as any
}

const loadPaymentMethods = async () => {
  if (paymentMethods.value.length > 0) return
  const res = await paymentApi.getPaymentMethod()
  if (res.code !== '0000' || !Array.isArray(res.data) || res.data.length === 0) {
    throw new Error(res.msg || '获取支付方式失败')
  }
  paymentMethods.value = res.data
}

// 支付弹窗关闭回调
const handlePayDialogClose = () => {
  showPayDialog.value = false
}

// 支付成功回调
const handlePaymentSuccess = async () => {
  showPayDialog.value = false

  // 支付成功后刷新用户信息与列表（更新是否为会员、灵衍值等）
  try {
    await userStore.getUserInfo()
    await Promise.all([loadMembershipPlans(), loadTideCoinPlans()])
  } catch (error) {
    console.error('支付成功后刷新数据失败:', error)
  }

  // 通知父组件（用于继续无水印下载等后续流程）
  emit('success')
}

// 处理购买（会员或灵衍值）
const handlePurchaseAction = async (plan: any) => {
  // 记录当前选择的套餐
  selectedPlan.value = plan
  currentSelectedPlan.value = plan

  // 判断是灵衍值购买还是会员购买
  const isCoinPurchase = plan.productKind === 'Points'
  if (!isCoinPurchase && isFreePlan(plan)) return

  // 设置购买类型和标题
  if (isCoinPurchase) {
    purchaseType.value = 'coin'
    payDialogTitle.value = '灵衍充值'
  } else {
    purchaseType.value = 'membership'
    payDialogTitle.value = getVipName(plan) || '会员购买'
  }

  // 设置初始支付金额（在创建订单前显示）
  // 与 Membership.vue 保持一致：展示/支付金额使用 productPrice
  initialPayAmount.value = Number(plan.productPrice) || 0

  try {
    await loadPaymentMethods()
    showPayDialog.value = true
  } catch (error: any) {
    ElMessage.error(error?.message || '获取支付方式失败')
  }
}

// 价格单位
const getPriceUnit = (plan: any) => {
  // 商品单位：0个/普通会员 1月 2季度 3年度
  const unit = Number(plan?.productUnit ?? 0)
  if (unit === 0) return '/永久'
  if (unit === 1) return '/月'
  if (unit === 2) return '/季'
  if (unit === 3) return '/年'
  return '/年'
}

// 切换会员版本（基础版 / 标准版）
const switchMemberVersion = async (version: number) => {
  if (memberVersion.value === version) return
  memberVersion.value = version
  await loadMembershipPlans()
}

// 会员名字
const getVipName = (plan: any) => {
  return plan.productName || ''
}

// 跳转到协议页面
const navigateToAgreement = (agreementType: string) => {
  router.push({
    path: '/agreement',
    query: { type: agreementType },
  })
}

// 原价文案
const getDiscountText = (plan: any) => {
  const d = Number(plan?.productDiscount)
  if (!d || Number.isNaN(d)) return ''
  if (d >= 100) return ''
  if (d <= 0) return ''
  const zhe = d % 10 === 0 ? String(d / 10) : String((d / 10).toFixed(1)).replace(/\.0$/, '')
  return `${zhe}折`
}

const isFreePlan = (plan: any) => {
  const level = Number(plan?.productType ?? 0)
  const price = Number(plan?.productPrice)
  return level === 0 || price === 0
}

const isCurrentMembershipPlan = (plan: any) => {
  const info: any = userInfo.value || {}
  const vipType = Number(info.vipType ?? 0)
  const vipLevel = Number(info.vipLevel ?? 0)
  const planLevel = Number(plan?.productType ?? 0)
  const planUnit = Number(plan?.productUnit ?? 0)
  if (vipType === 0 && vipLevel === 0) return planLevel === 0
  return planLevel === vipLevel && planUnit === vipType
}

const getPurchaseButtonText = (plan: any) => {
  if (isCurrentMembershipPlan(plan)) return '当前套餐'
  return '立即购买'
}

// 弹窗标题和提示内容
const modalConfig = computed(() => {
  // 如果提供了自定义标题，优先使用自定义标题
  if (props.customTitle) {
    // 根据自定义标题判断内容
    if (props.customTitle === '会员购买') {
      return {
        title: '会员购买',
        content: '选择适合您的会员套餐，享受更多权益',
        buttonText: '订阅',
        action: 'subscribe',
      }
    }
    // 其他自定义标题的情况，返回默认配置但使用自定义标题
    return {
      title: props.customTitle,
      content: modalConfigWithoutCustom.value.content,
      buttonText: modalConfigWithoutCustom.value.buttonText,
      action: modalConfigWithoutCustom.value.action,
    }
  }

  // 如果没有自定义标题，使用原有逻辑
  return modalConfigWithoutCustom.value
})

// 弹窗配置（不包含自定义标题的逻辑）
const modalConfigWithoutCustom = computed(() => {
  // 如果没有错误类型（主动购买），显示"会员购买"
  if (!props.errorType || props.errorType === '') {
    return {
      title: '会员购买',
      content: '选择适合您的会员套餐，享受更多权益',
      buttonText: '订阅',
      action: 'subscribe',
    }
  }

  // 如果不是会员
  if (!props.isVip) {
    // 场景一：明确是“灵衍值不足”（例如生成时提示先充值灵衍值）
    if (props.errorType === 'coin_deficiency') {
      return {
        title: '灵衍值不足',
        content: '您当前灵衍值不足，开通会员可获得灵衍值，继续生成还能享受更多会员权益。',
        buttonText: '订阅',
        action: 'subscribe',
      }
    }

    // 场景二：仅需要开通会员（例如去除水印、提升权益），不需要提示“灵衍值不足”
    // 统一文案为「会员购买」
    return {
      title: '会员购买',
      content: '选择适合您的会员套餐，享受更多权益',
      buttonText: '订阅',
      action: 'subscribe',
    }
  }

  // 如果是会员且错误类型是灵衍值不足
  if (props.isVip && props.errorType === 'coin_deficiency') {
    return {
      title: '灵衍值不足',
      content: '您当前灵衍值不足，请充值灵衍值后继续生成',
      buttonText: '充值',
      action: 'recharge',
    }
  }

  // 如果是会员且需要升级/续费
  if (props.isVip && props.errorType === 'up_vip') {
    return {
      title: '会员权益不足',
      content: '您的会员权益不足，续费会员后继续生成',
      buttonText: '会员续费',
      action: 'renewVip',
    }
  }

  // 默认配置
  return {
    title: '会员购买',
    content: '选择适合您的会员套餐，享受更多权益',
    buttonText: '订阅',
    action: 'subscribe',
  }
})

// 弹窗标题（兼容旧接口）
const modalTitle = computed(() => {
  return modalConfig.value.title
})

const handleClose = () => {
  // 弹窗关闭时重置状态
  showPayDialog.value = false
  selectedPlan.value = null
  currentSelectedPlan.value = null
  initialPayAmount.value = 0
  // 重置所有套餐的选中状态
  membershipPlansFromApi.value.forEach((p: any) => (p.isSelected = false))
  tideCoinsPlans.value.forEach((p: any) => (p.isSelected = false))

  if (props.show !== undefined) {
    // 如果使用 show prop，需要通过 emit 通知父组件关闭
    emit('close')
  } else {
    // 如果使用 modelValue，直接更新
    emit('update:modelValue', false)
  }
}
</script>

<style lang="scss" scoped>
// 弹窗响应式适配
:deep(.membership-modal-dialog) {
  // 弹窗包装器和居中样式已在全局样式中设置，无需重复
  border-radius: 16px;

  .el-dialog {
    width: 1200px;
    max-width: 90vw;
    max-height: 90vh; // 限制弹窗最大高度
    margin: 0 auto; // 确保水平居中

    // 小屏幕优化
    @media (max-width: 768px) {
      width: 95vw !important;
      max-width: 95vw !important;
    }

    @media (max-width: 480px) {
      width: 100vw !important;
      max-width: 100vw !important;
      margin: 0 !important;
      border-radius: 0 !important;
      max-height: 100vh !important;
    }
  }

  // 弹窗头部固定，不滚动
  .el-dialog__header {
    flex-shrink: 0;
  }

  // 弹窗内容区域可滚动
  .el-dialog__body {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    padding: 20px;
    min-height: 0; // 重要：允许 flex 子元素缩小

    // 小屏幕优化
    @media (max-width: 768px) {
      padding: 15px;
    }

    @media (max-width: 480px) {
      padding: 10px;
    }
  }

  // 弹窗底部固定，不滚动
  .el-dialog__footer {
    flex-shrink: 0;
  }
}

// 提示信息样式
.modal-tip {
  margin-bottom: 24px;
  padding: 16px 20px;
  background: rgba(143, 80, 234, 0.1);
  border: 1px solid rgba(143, 80, 234, 0.3);
  border-radius: 8px;
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.6;
  text-align: center;

  @media (max-width: 768px) {
    margin-bottom: 16px;
    padding: 12px 16px;
    font-size: 13px;
    line-height: 1.5;
  }

  @media (max-width: 480px) {
    margin-bottom: 12px;
    padding: 10px 12px;
    font-size: 12px;
    line-height: 1.4;
    border-radius: 6px;
  }
}

.section-header {
  .membership-tabs {
    :deep(.el-tabs__item) {
      color: var(--text-secondary);
      font-size: 16px;
      height: 48px;
      line-height: 48px;
      border: none;
      background: transparent;
      transition: all 0.3s ease;

      @media (max-width: 768px) {
        font-size: 14px;
        height: 44px;
        line-height: 44px;
        padding: 0 12px;
      }

      @media (max-width: 480px) {
        font-size: 13px;
        height: 40px;
        line-height: 40px;
        padding: 0 10px;
      }

      &:hover {
        color: var(--text-primary);
      }

      &.is-active {
        color: var(--primary-color);
        font-weight: 600;
      }
    }

    :deep(.el-tabs__active-bar) {
      background: linear-gradient(135deg, var(--primary-color), #a67ce8);
      height: 3px;

      @media (max-width: 480px) {
        height: 2px;
      }
    }

    :deep(.el-tabs__content) {
      display: none;
    }
  }

  // 基础会员 / 标准会员 切换按钮组（参考 Membership.vue 图二样式）
  .member-version-toggle {
    position: relative;
    display: inline-flex;
    padding: 5px;
    border-radius: 12px;
    background-color: rgba(17, 17, 21, 1);
    border: 1px solid rgba(255, 255, 255, 0.02);

    .toggle-segment {
      position: relative;
      width: 162px;
      height: 44px;
      border-radius: 12px 12px 12px 12px;
      border: none;
      margin: 0;

      &.el-button--default {
        background-color: rgba(43, 40, 49, 1);
      }

      .recommend-tag {
        position: absolute;
        top: -5px;
        right: -5px;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 30px;
        height: 18px;
        border-radius: 0px 8px 0px 8px;
        background-color: rgba(244, 63, 94, 1);
        color: $color-text-white;
        font-size: 9px;
        font-weight: 400;
      }
    }
  }
}

// 会员卡片容器（参考 Membership.vue）
.membership-cards-wrapper {
  position: relative;
  padding: 60px 0 86px;
  margin: 0;
  overflow: visible; // 确保右上角标签不被裁剪
}

// 会员卡片网格
.membership-cards-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  padding: 0;
  overflow: visible;

  @media (max-width: 1400px) {
    padding: 15px 40px 0;
  }

  @media (min-width: 1401px) and (max-width: 1820px) {
    padding: 15px 60px 0 0;
  }

  @media (max-width: 1200px) {
    padding: 15px 20px 0;
    gap: 16px;
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 1024px) {
    padding: 15px 10px 0;
    gap: 16px;
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 768px) {
    padding: 15px 5px 0;
    gap: 12px;
    grid-template-columns: 1fr;
  }

  @media (max-width: 480px) {
    padding: 10px 0 0;
    gap: 12px;
  }
}

// 会员卡片
.membership-card {
  background-color: rgba(18, 18, 18, 1);
  border-radius: 16px;
  padding: 25px 20px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  transition: all 0.3s ease;
  position: relative;
  overflow: visible;
  display: flex;
  flex-direction: column;

  &:hover {
    background: linear-gradient(135deg,
        $color-primary 0%,
        $color-primary-light 50%,
        #96ddff 100%);
  }

  // 小屏幕优化
  @media (max-width: 768px) {
    padding: 20px 15px;
    border-radius: 12px;
  }

  @media (max-width: 480px) {
    padding: 16px 12px;
    border-radius: 10px;
  }

  .card-header {
    padding: 0 6px;
    position: relative;
    overflow: visible; // 确保右上角标签不被裁剪

    @media (max-width: 480px) {
      padding: 0 4px;
    }

    .card-title {
      font-size: 20px;
      font-weight: 600;
      color: $color-text-nickname;
      margin: 0;

      @media (max-width: 768px) {
        font-size: 18px;
      }

      @media (max-width: 480px) {
        font-size: 16px;
      }
    }

    .price-section {
      margin: 23px 0 26px;
      display: flex;
      align-items: baseline;
      gap: var(--spacing-sm);

      @media (max-width: 768px) {
        margin: 18px 0 20px;
      }

      @media (max-width: 480px) {
        margin: 15px 0 18px;
        flex-wrap: wrap;
      }

      .price {
        font-size: 30px;
        font-weight: 700;
        color: $color-text-nickname;
        line-height: 1;

        @media (max-width: 768px) {
          font-size: 26px;
        }

        @media (max-width: 480px) {
          font-size: 24px;
        }
      }

      .price-unit {
        font-size: $font-size-base;
        color: $color-text-gray;

        @media (max-width: 480px) {
          font-size: var(--font-sm);
        }
      }

      .original-price {
        font-size: 12px;
        color: $color-text-gray;
        text-decoration: line-through;

        &::before {
          content: '¥';
          font-size: 15px;
          font-weight: normal;
        }

        @media (max-width: 480px) {
          font-size: 13px;
        }
      }

      // discount-tag moved to .corner-discount-tag
    }

    .corner-discount-tag {
      position: absolute;
      top: -36px;
      right: -13px;
      z-index: 10;
      color: $color-text-white;
      padding: 3px 16px;
      border-radius: 12px;
      font-size: 10px;
      font-weight: bold;
      font-family: NotoSans-bold;
    }
  }

  .card-body {
    margin-bottom: 24px;

    @media (max-width: 768px) {
      margin-bottom: 20px;
    }

    @media (max-width: 480px) {
      margin-bottom: 16px;
    }

    .purchase-button {
      width: 100%;
      height: 47px;
      border-radius: 12px;
      font-size: $font-size-base !important;
      font-weight: 600;
      color: $color-text-gray;
      border: none !important;
      box-shadow: none !important;

      @media (max-width: 768px) {
        height: 44px;
        font-size: $font-size-md !important;
        border-radius: 10px;
      }

      @media (max-width: 480px) {
        height: 40px;
        font-size: $font-size-sm !important;
        border-radius: 8px;
      }

      &:disabled {
        cursor: not-allowed;
      }

      &:hover,
      &:focus,
      &:focus-visible,
      &:active {
        border: none !important;
        box-shadow: none !important;
      }
    }

    // 灵衍值信息卡片
    .coin-info-card {
      margin-top: 17px;
      padding: 14px;
      background: rgba(255, 255, 255, 0.08);
      border-radius: 12px;
      gap: 12px;

      @media (max-width: 768px) {
        margin-top: 14px;
        padding: 12px;
        border-radius: 10px;
      }

      @media (max-width: 480px) {
        margin-top: 12px;
        padding: 10px;
        border-radius: 8px;
        gap: 8px;
      }

      .coin-icon {
        width: 32px;
        height: 32px;
        flex-shrink: 0;
        margin-top: 2px;

        @media (max-width: 480px) {
          width: 28px;
          height: 28px;
        }
      }

      .coin-content {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 6px;

        @media (max-width: 480px) {
          gap: 4px;
        }

        .coin-amount {
          font-size: 14px;
          font-weight: 600;

          @media (max-width: 768px) {
            font-size: 13px;
          }

          @media (max-width: 480px) {
            font-size: 12px;
          }
        }

        .coin-detail {
          font-size: 10px;

          @media (max-width: 480px) {
            font-size: 9px;
          }
        }
      }
    }
  }

  .card-features {
    .feature-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 0;
      font-size: var(--font-sm);
      color: #d1d5db;

      @media (max-width: 768px) {
        padding: 6px 0;
        gap: 6px;
      }

      @media (max-width: 480px) {
        padding: 5px 0;
        gap: 6px;
        font-size: 12px;
      }

      .feature-icon {
        width: 15px;
        height: 15px;
        object-fit: contain;
        flex-shrink: 0;

        @media (max-width: 480px) {
          width: 14px;
          height: 14px;
        }
      }
    }
  }

  // 主题0 - 免费版（灰色调，禁用状态）
  &.theme-0 {
    border-color: rgba(255, 255, 255, 0.15);

    &:hover {
      background: none;
    }

    .purchase-button {
      background-color: rgba(255, 255, 255, 0.04) !important;
      color: $color-text-gray !important;
      border: none !important;
      cursor: not-allowed !important;
    }
  }

  // 主题1 - 月度会员（紫色调）
  &.theme-1 {
    border: 1px solid rgba(216, 180, 254, 1);

    &:hover {
      background: rgba(216, 180, 254, 0.3);
    }

    .title {
      color: #c7b4ec !important;
    }

    .corner-discount-tag,
    .purchase-button {
      background: linear-gradient(90deg,
          rgba(204, 166, 244, 1) 0%,
          rgba(192, 126, 255, 1) 53%,
          rgba(204, 166, 244, 1) 99%) !important;
    }

    // 灵衍值信息卡片
    .coin-info-card {
      background-color: rgba(192, 132, 252, 0.04);
      border: 1px solid rgba(192, 132, 252, 0.08);

      .coin-content {
        .coin-amount {
          color: #e9d5ff;
        }

        .coin-detail {
          color: rgba(233, 213, 255, 0.24);
        }
      }
    }
  }

  // 主题2 - 季度会员（蓝绿色调，推荐）
  &.theme-2 {
    border: 1px solid rgba(23, 160, 225, 1);

    &:hover {
      background: rgba(150, 221, 255, 0.3);
    }

    .title {
      color: #50c7fd !important;
    }

    .corner-discount-tag {
      background: linear-gradient(90deg,
          rgba(145, 213, 243, 1) 0%,
          rgba(79, 179, 250, 1) 47%,
          rgba(142, 204, 232, 1) 100%);
    }

    .purchase-button {
      background: linear-gradient(90deg,
          rgba(130, 209, 246, 1) 0%,
          rgba(41, 171, 244, 1) 50%,
          rgba(80, 199, 253, 1) 99%) !important;
    }

    .coin-info-card {
      background-color: rgba(80, 199, 253, 0.04);
      border: 1px solid rgba(197, 239, 244, 0.08);

      .coin-content {
        .coin-amount {
          color: #c5eff4;
        }

        .coin-detail {
          color: rgba(197, 239, 244, 0.24);
        }
      }
    }
  }

  // 主题3 - 年度会员（金黄色调）
  &.theme-3 {
    border: 1px solid rgba(196, 170, 117, 0.5);

    &:hover {
      background: rgba(196, 170, 117, 0.3);
    }

    .corner-discount-tag {
      background: linear-gradient(90deg, rgba(244, 232, 190, 1) 0%, rgba(196, 170, 117, 1) 47%, rgba(244, 232, 190, 1) 100%);
    }

    .title {
      color: #c4aa75 !important;
    }

    .purchase-button {
      background: linear-gradient(90deg,
          rgba(244, 232, 190, 1) 0%,
          rgba(196, 170, 117, 1) 50%,
          rgba(244, 232, 190, 1) 99%);
    }

    .coin-info-card {
      background-color: rgba(196, 170, 117, 0.04);
      border: 1px solid rgba(196, 170, 117, 0.08);

      .coin-content {
        .coin-amount {
          color: #f4e8be;
        }

        .coin-detail {
          color: rgba(244, 232, 190, 0.24);
        }
      }
    }
  }
}

// 灵衍值页面样式
.tidecoins-notice {
  padding: 21px 0 40px;
  text-align: center;
  color: $color-text-light;
  font-size: 13px;

  .notice-text {
    color: $color-primary-dark;
  }

  .rules-link {
    color: $color-text-gray;
    cursor: pointer;
  }
}

.tidecoins-grid {
  display: grid;
  // 使用 auto-fit 和 minmax，确保卡片固定大小，放不下时自动换行
  grid-template-columns: repeat(auto-fit, minmax(332px, 1fr));
  gap: 40px;
  padding: 0 118px 130px;

  // 响应式设计
  @media (max-width: 1600px) {
    padding: 0 60px 130px;
    gap: 30px;
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  }

  @media (max-width: 1024px) {
    padding: 0 20px 130px;
    gap: 20px;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  }

  @media (max-width: 600px) {
    padding: 0 10px 130px;
    gap: 12px;
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  }
}

.tidecoin-card {
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  width: 100%; // 确保卡片占满网格单元格
  min-width: 0; // 防止内容溢出

  &.selected {
    border-color: $color-primary;
  }

  // 上半部分
  .tidecoin-top {
    position: relative;
    height: 132px;
    padding: 28px 34px;
    background: $color-bg-dark-secondary;
    border-radius: 0 0 12px 12px;

    .tidecoin-amount {
      display: flex;
      align-items: center;
      gap: $spacing-sm;

      .flame-icon {
        width: 33px;
        height: 33px;
      }

      .amount {
        font-size: 36px;
        font-weight: bold;
        color: $color-primary-dark;
      }
    }
  }

  // 下半部分
  .tidecoin-bottom {
    background: linear-gradient(135deg, rgba(5, 7, 10, 1) 14.6%, rgba(13, 18, 31, 1) 50%, rgba(22, 29, 49, 1) 85.4%);
    padding: 15px 39px 15px 35px;
    border-radius: 0 0 12px 12px;

    display: flex;
    align-items: center;
    justify-content: space-between;

    .tidecoin-price {
      font-size: $font-size-2xl;
      color: $color-text-white;
    }

    .tidecoin-button {
      width: 102px;
      height: 40px;
      border-radius: 20px;
      font-size: $font-size-base;
      text-align: center;
      font-family: NotoSans-bold;
      color: $color-text-white;
    }
  }
}
</style>
