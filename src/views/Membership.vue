<template>
  <div class="membership-page">
    <Header />

    <div class="membership-content">
      <div class="main-content">
        <div class="main-inner">
          <!-- 用户基本信息 -->
          <div class="user-info-card">
            <div class="user-main-info">
              <!-- 头像 -->
              <div class="user-avatar">
                <img :src="avatarSrc" alt="用户头像" />
              </div>
              <!-- 基本信息 -->
              <div class="user-details">
                <div class="user-nickname">{{ userInfo?.nickName || userInfo?.userName || '' }}</div>
                <div class="user-mobile" v-if="userInfo?.mainAccount">+86 {{ userInfo?.mobile || '' }}</div>
                <div class="user-mobile" v-else>{{ userInfo?.nickName || '' }}</div>
              </div>
              <!-- 右侧：灵衍与订单 -->
              <div class="user-extra">
                <div class="coin-badge" @click="activeTab = 'tidecoins'">
                  <img :src="images.coin" alt="灵衍值" class="coin-icon" />
                  <span class="coin-number">{{ userInfo?.wavePoints || 0 }}</span>
                  <span class="coin-text">灵衍值</span>
                </div>
                <el-button class="order-btn" type="primary" @click="showInspirationModal = true">
                  订单记录
                </el-button>
                <el-button class="order-btn" type="primary" @click="showSubscriptionModal = true">
                  订阅管理
                </el-button>
              </div>
            </div>

            <!-- 订阅计划与到期时间 -->
            <div class="user-info-meta">
              <div class="meta-item">
                <div class="meta-label">订阅计划</div>
                <div :class="['meta-value', getMembershipTypeClass(userInfo?.vipType)]">
                  {{ userStore.vipMembershipDisplayText }}
                </div>
              </div>
              <div class="meta-item">
                <div class="meta-label">到期时间</div>
                <div :class="['meta-value', getMembershipTypeClass(userInfo?.vipType)]">
                  {{ userInfo?.expirationTime || '永久' }}
                </div>
              </div>
            </div>
          </div>

          <!-- 会员套餐选择区域 -->
          <div class="membership-section">
            <div class="section-header">
              <el-tabs v-model="activeTab" class="membership-tabs">
                <el-tab-pane v-for="tab in membershipTabs" :key="tab.key" :label="tab.name" :name="tab.key" />
              </el-tabs>

              <!-- 基础版 / 标准版 切换：1=基础版 2=标准版（对齐 vipLevel/productType） -->
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
              <!-- 会员卡片网格 - 带滑动箭头 -->
              <div class="membership-cards-wrapper">
                <!-- 左箭头（仅在滚动模式下显示） -->
                <div v-if="needScrollMode && showLeftArrow" class="scroll-arrow scroll-arrow-left"
                  @click="scrollCards('left')">
                  <el-icon>
                    <ArrowLeft />
                  </el-icon>
                </div>
                <!-- 右箭头（仅在滚动模式下显示） -->
                <div v-if="needScrollMode && showRightArrow" class="scroll-arrow scroll-arrow-right"
                  @click="scrollCards('right')">
                  <el-icon>
                    <ArrowRight />
                  </el-icon>
                </div>
                <!-- 会员卡片网格 -->
                <div ref="cardsContainerRef" :class="['membership-cards-grid', { 'scroll-mode': needScrollMode }]"
                  @scroll="handleScroll">
                  <!-- 循环渲染会员卡片 -->
                  <div v-for="(plan, index) in membershipPlansFromApi"
                    :key="(plan.id ?? plan.productCode ?? index) as any" class="membership-card"
                    :class="`theme-${index}`">
                    <div class="card-header">
                      <h3 class="card-title title">{{ getVipName(plan) }}</h3>
                      <!-- 右上角折扣角标（使用接口 productDiscount 动态计算） -->
                      <div v-if="getDiscountText(plan)" class="corner-discount-tag">
                        {{ getDiscountText(plan) }}
                      </div>
                      <div class="price-section">
                        <span class="price">¥{{ plan.productDiscountPrice ?? plan.productPrice }}</span>
                        <span class="price-unit">{{ getPriceUnit(plan) }}</span>
                        <!-- 显示原价（删除线） -->
                        <span
                          v-if="getDiscountText(plan) && plan.productPrice !== undefined && plan.productPrice !== null"
                          class="original-price">
                          {{ plan.productPrice }}
                        </span>
                      </div>
                    </div>

                    <div class="card-body">
                      <el-button class="purchase-button" :disabled="isFreePlan(plan)" type="primary"
                        @click="handlePurchaseAction(plan)">
                        {{ getPurchaseButtonText(plan) }}
                      </el-button>

                      <!-- 灵衍信息卡片：使用新接口字段 waveCoin / productDesc -->
                      <div v-if="plan.waveCoin && plan.productDesc && !isFreePlan(plan)" class="coin-info-card">
                        <div class="coin-content">
                          <!-- 第一行：单月 X 个灵衍值 -->
                          <div v-if="plan.waveCoin" class="coin-amount">
                            单月{{ plan.waveCoin }}个灵衍值
                          </div>
                          <!-- 第二行：接口返回的描述 -->
                          <div v-if="plan.productDesc" class="coin-detail">
                            {{ plan.productDesc }}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div class="card-features">
                      <div v-for="(right, idx) in plan.privilegesListVOS" :key="idx" class="feature-item">
                        <img v-if="index === 0" :src="images.check" class="feature-icon" alt="" />
                        <img v-if="index === 1" :src="images.check1" class="feature-icon" alt="" />
                        <img v-if="index === 2" :src="images.check2" class="feature-icon" alt="" />
                        <img v-if="index === 3" :src="images.check3" class="feature-icon" alt="" />
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

              <!-- 灵衍套餐网格 -->
              <div class="tidecoins-grid">
                <div v-for="plan in tideCoinsPlans" :key="plan.id" class="tidecoin-card"
                  :class="{ selected: (plan as any).isSelected }" @click="selectTideCoin(plan)">
                  <!-- 上半部分：暗色背景 -->
                  <div class="tidecoin-top">
                    <div class="tidecoin-amount">
                      <img class="flame-icon" :src="images.money" alt="" srcset="" />
                      <span class="amount">{{ plan.waveCoin }}</span>
                    </div>
                  </div>

                  <!-- 下半部分：更深背景 -->
                  <div class="tidecoin-bottom flex-between">
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
        </div>
      </div>
    </div>

    <!-- 灵衍值明细弹窗 -->
    <InspirationValueModal v-model="showInspirationModal" />

    <!-- 订阅管理弹窗 -->
    <SubscriptionManageModal v-model="showSubscriptionModal" />

    <!-- 客服弹窗 -->
    <ContactModal v-model="showCustomerServiceModal" />

    <!-- 支付弹窗 -->
    <PaymentModal v-model="showPayDialog" :title="payDialogTitle" :initial-amount="initialPayAmount"
      :payment-methods="paymentMethods" :create-payment-order="createVipPaymentOrder" :purchase-type="purchaseType"
      :show-customer-service="true" :on-open-customer-service="openCustomerService" @close="closePayDialog"
      @success="handlePaymentSuccess" />

    <!-- 会员变更计划弹窗 -->
    <el-dialog v-model="showChangePlanDialog" width="800px" class="change-plan-dialog" :show-close="false"
      :close-on-click-modal="false">
      <template #header>
        <div class="change-plan-header flex-between">
          <div>会员变更计划</div>
          <img :src="images.closeVip" class="close-icon" alt="" @click="showChangePlanDialog = false" />
        </div>
      </template>
      <div class="change-plan-body">
        <div class="change-plan-tip">
          <img :src="images.warning" class="tip-icon" alt="" />
          <div class="tip-content">
            <p class="tip-main">
              您正在切换至
              <span class="plan-name">
                【{{ newPlanDisplay.levelLabel }}-{{ newPlanDisplay.periodLabel }}】
              </span>
              ，新的订阅计划将于{{ effectiveDate }}生效。
              <span v-if="oldPlanDisplay.levelLabel">
                {{ oldPlanDisplay.levelLabel }}-{{
                  oldPlanDisplay.periodLabel
                }}剩余有效期将在购买会员到期后生效。
              </span>
            </p>

            <p class="tip-sub">
              如订阅周期内的会员灵衍值消耗完，可额外
              <span class="link-text" @click="() => ((activeTab = 'tidecoins'), (showChangePlanDialog = false))">
                购买灵衍值
              </span>
            </p>
          </div>
        </div>

        <div class="change-plan-desc">
          购买
          <span class="highlight">
            【{{ newPlanDisplay.levelLabel }}-{{ newPlanDisplay.periodLabel }}】
          </span>
          后，当前账号将存在多段会员计划，生效顺序如下：
        </div>

        <div class="change-plan-list">
          <!-- 新购计划（顺序1） -->
          <div class="plan-item">
            <div class="plan-order active">1</div>
            <div class="plan-info">
              <div class="plan-row">
                <span class="plan-title">
                  {{ newPlanDisplay.levelLabel }} - {{ newPlanDisplay.periodLabel }}
                </span>
                <span class="plan-tag plan-tag-primary">正在购买</span>
              </div>
              <div class="plan-meta">
                <img :src="images.date" class="meta-icon" alt="" />
                到期时间：
                {{ newPlanDisplay?.endTime || '--' }}
              </div>
            </div>
          </div>

          <!-- 现有会员计划（如果有） -->
          <div v-if="oldPlanDisplay.levelLabel" class="plan-item">
            <div class="plan-order">2</div>
            <div class="plan-info">
              <div class="plan-row">
                <span class="plan-title text-content">
                  {{ oldPlanDisplay.levelLabel }} - {{ oldPlanDisplay.periodLabel }}
                </span>
                <span class="plan-tag plan-tag-gray">当前生效中</span>
              </div>
              <div class="plan-meta">
                <img :src="images.date" class="meta-icon" alt="" />
                到期时间：
                {{ oldPlanDisplay?.endTime || '--' }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="change-plan-footer">
          <div class="pay-summary">
            <span>需支付：</span>
            <span class="amount">
              {{
                Number(
                  vipChangeDetail?.payAmount ??
                  vipChangeDetail?.productNewVO?.productDiscountPrice ??
                  vipChangeDetail?.productNewVO?.productPrice ??
                  selectedPlan?.productDiscountPrice ??
                  selectedPlan?.productPrice ??
                  0
                )
              }}
            </span>
          </div>
          <el-button type="primary" size="large" class="confirm-btn" @click="confirmChangePlanPurchase">
            确认购买
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'Membership' })
import { ElMessage } from 'element-plus'
import { ArrowLeft, ArrowRight } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { membershipApi, type AppProduct } from '@/api/membership'
import { paymentApi, type PaymentMethod } from '@/api/payment'
import { images } from '@/assets'

const router = useRouter()
const route = useRoute()

// 用户信息
const userStore = useUserStore()
const userInfo = computed(() => userStore.userInfo)

const avatarSrc = computed(() =>
  String(userInfo.value?.headImgUrl || '').trim() ? userInfo.value?.headImgUrl : images.avatarDefault
)

// 灵衍值明细弹窗
const showInspirationModal = ref(false)
// 订阅管理弹窗
const showSubscriptionModal = ref(false)

// 客服弹窗
const showCustomerServiceModal = ref(false)

// 会员套餐标签
const membershipTabs = ref([
  { key: 'membership', name: '会员' },
  { key: 'tidecoins', name: '充值' },
])

const activeTab = ref(
  String(route.query.tab ?? '') === '1' || String(route.query.tab ?? '') === 'tidecoins'
    ? 'tidecoins'
    : 'membership'
)

// 当页面已打开时，仅更新路由 query（例如从其他入口 push `/membership?tab=1`）
// 组件不会重新初始化，所以需要监听 route.query.tab 同步切换 tab。
watch(
  () => route.query.tab,
  async (tab) => {
    const tabStr = String(tab ?? '')
    const nextTab = tabStr === '1' || tabStr === 'tidecoins' ? 'tidecoins' : 'membership'
    if (activeTab.value === nextTab) return
    activeTab.value = nextTab

    // 兜底：切到充值 tab 时，若套餐尚未加载则补载
    if (nextTab === 'tidecoins' && tideCoinsPlans.value.length === 0) {
      await loadTideCoinPlans()
    }
    if (nextTab === 'membership' && membershipPlansFromApi.value.length === 0) {
      await loadMembershipPlans()
    }
  }
)

// 基础版 / 标准版 切换：1=基础版 2=标准版（对齐 vipLevel/productType）
// 默认展示“基础版”，若用户是会员则按实际 vipType 展示对应内容
const memberVersion = ref<number>(1)

// 会员套餐数据（直接使用接口返回字段）
const membershipPlansFromApi = ref<AppProduct[]>([])

// 灵衍值套餐数据（从API加载）
const tideCoinsPlans = ref<any[]>([])

// 选中的套餐
const selectedPlan = ref<any>(null)
// 支付方式（父组件获取后传给支付弹窗）
const paymentMethods = ref<PaymentMethod[]>([])

// ===== 会员变更计划相关状态（参考 uniapp 实现） =====
// 会员变更计划弹窗
const showChangePlanDialog = ref(false)
// 生效日期（
const effectiveDate = ref('')
// 会员变更计划详情（来自 vipTip 接口：包含 vipItemOld / vipItemNew 等）
const vipChangeDetail = ref<any | null>(null)

// 选择灵衍值
const selectTideCoin = (plan: any) => {
  // 取消所有选择
  tideCoinsPlans.value.forEach((p) => (p.isSelected = false))
  // 选择当前项
  plan.isSelected = true
  selectedPlan.value = plan
}

// === 支付弹窗相关状态 ===
const showPayDialog = ref(false)
const payDialogTitle = ref('')
const purchaseType = ref<'membership' | 'coin'>('membership') // 购买类型：会员或灵衍值
const initialPayAmount = ref(0) // 初始支付金额

// 打开客服弹窗
const openCustomerService = () => {
  showCustomerServiceModal.value = true
}

// 跳转到协议页面
const navigateToAgreement = (agreementType: string) => {
  router.push({
    path: '/agreement',
    query: { type: agreementType },
  })
}

// 创建支付订单并展示二维码（支持会员和灵衍购买）
// 后端 /v1/payment/submit 只需要 channelId、productId
const createVipPaymentOrder = async (channelId?: number) => {
  if (!userInfo.value) {
    ElMessage.warning('请先登录后再购买')
    router.push('/login')
    throw new Error('用户未登录')
  }

  const targetPlan = selectedPlan.value
  if (!targetPlan) {
    throw new Error('未选择套餐')
  }

  if (channelId === undefined || channelId === null || Number.isNaN(channelId)) {
    throw new Error('未选择支付渠道')
  }

  const productId = Number(targetPlan.id ?? targetPlan.productCode)
  if (Number.isNaN(productId)) {
    throw new Error('未找到购买商品ID（productId）')
  }

  const payload: any = {
    channelId,
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
const closePayDialog = () => {
  showPayDialog.value = false
}

// 支付成功回调：刷新用户信息与页面数据，确保灵衍值/会员状态即时更新
const handlePaymentSuccess = async () => {
  showPayDialog.value = false
  try {
    await userStore.getUserInfo()
    await Promise.all([loadMembershipPlans(), loadTideCoinPlans()])
  } catch (error) {
    console.error('支付成功后刷新数据失败:', error)
  }
}

// 打开支付弹窗（封装公共逻辑）
const openPaymentForPlan = async (plan: any) => {
  if (!plan) return

  // 记录当前选择的套餐
  selectedPlan.value = plan

  const isCoinPurchase = plan.productKind === 'Points'

  if (isCoinPurchase) {
    purchaseType.value = 'coin'
    payDialogTitle.value = '灵衍充值'
    initialPayAmount.value = Number(plan.productPrice) || 0
  } else {
    purchaseType.value = 'membership'
    payDialogTitle.value = getVipName(plan) || '会员购买'
    initialPayAmount.value = Number(plan.productDiscountPrice) || 0
  }

  try {
    await loadPaymentMethods()
    showPayDialog.value = true
  } catch (error: any) {
    ElMessage.error(error?.message || '获取支付方式失败')
  }
}

// 会员类型 & 周期映射（仅用于变更计划文案）
// productType：0 积分/普通会员；1 基础版；2 标准版；3 高级版
const productTypeNameMap: Record<string | number, string> = {
  0: '普通会员',
  1: '基础版',
  2: '标准版',
  3: '高级版',
}
const vipPeriodNameMap: Record<string | number, string> = {
  '-1': '终身会员',
  0: '普通会员',
  1: '月度会员',
  2: '季度会员',
  3: '年度会员',
}
const vipPeriodUnitMap: Record<string | number, string> = {
  '-1': '终身',
  0: '',
  1: '月',
  2: '季',
  3: '年',
}

const getVipLevelName = (vipType?: number | string) => {
  const key = String(vipType ?? '')
  return productTypeNameMap[key] || productTypeNameMap[Number(key)] || ''
}
const getVipPeriodName = (unit?: number | string) => {
  const key = String(unit ?? '')
  return vipPeriodNameMap[key] || vipPeriodNameMap[Number(key)] || ''
}
const getVipPeriodUnit = (unit?: number | string) => {
  const key = String(unit ?? '')
  return vipPeriodUnitMap[key] || vipPeriodUnitMap[Number(key)] || ''
}

type VipTipPlanVO = {
  productType?: string | number
  productUnit?: string | number
  productDiscountPrice?: string | number
  productPrice?: string | number
  endTime?: string
}

const normalizeVipPlanDisplay = (info?: VipTipPlanVO) => {
  if (!info) {
    return { levelLabel: '', periodLabel: '', priceText: '', endTime: '' }
  }
  const levelLabel = getVipLevelName(info.productType)
  const periodLabel = getVipPeriodName(info.productUnit)
  const unitShort = getVipPeriodUnit(info.productUnit)
  const priceVal = info.productDiscountPrice ?? info.productPrice
  const price =
    priceVal !== null && priceVal !== undefined && priceVal !== ''
      ? Number(priceVal).toFixed(0)
      : ''
  const priceText = price ? `¥${price} / ${unitShort}` : ''

  return {
    levelLabel,
    periodLabel,
    priceText,
    // 直接使用接口返回的到期时间（不做本地计算/兜底拼接）
    endTime: info.endTime ?? '',
  }
}

// 会员变更卡片展示文案（旧/新套餐）
const oldPlanDisplay = computed(() => normalizeVipPlanDisplay(vipChangeDetail.value?.productOldVO))
const newPlanDisplay = computed(() => normalizeVipPlanDisplay(vipChangeDetail.value?.productNewVO))

// 处理购买（会员或灵衍）
const handlePurchaseAction = async (plan: any) => {
  // 注意：当会员购买触发 vipTip 弹窗后会 return，openPaymentForPlan 不会立刻执行，
  // 这会导致 selectedPlan.value 可能还是上一次选择的“灵衍值”套餐。
  // 在这里先同步 selectedPlan，确保弹窗“确认购买”使用的就是当前 plan。
  selectedPlan.value = plan

  // 判断是灵衍购买还是会员购买
  const isCoinPurchase = plan.productKind === 'Points'
  // 仅会员场景拦截免费版，灵衍值（Points）允许购买
  if (!isCoinPurchase && isFreePlan(plan)) return

  // 会员购买前先调用 vipTip 接口，判断是否需要展示“会员变更计划”弹窗
  if (!isCoinPurchase && userInfo.value) {
    try {
      // memberVersion: 1 基础版 / 2 标准版（对齐 vipLevel/productType）
      const res = await membershipApi.vipTip({
        productId: String(plan.id ?? plan.productCode),
      })

      if (res.code === '0000' && res.data.vipTip) {
        vipChangeDetail.value = res.data
        effectiveDate.value = res.data.effectiveDate || ''
        showChangePlanDialog.value = true
        return
      }
    } catch (error) {
      console.warn('调用 vipTip 接口失败，忽略提示直接进入购买流程:', error)
    }
  }

  await openPaymentForPlan(plan)
}

// 确认变更会员计划 -> 打开支付弹窗
const confirmChangePlanPurchase = async () => {
  if (!selectedPlan.value) {
    showChangePlanDialog.value = false
    return
  }
  showChangePlanDialog.value = false
  await openPaymentForPlan(selectedPlan.value)
}

// 切换会员版本（基础版 / 标准版）
const switchMemberVersion = (version: number) => {
  if (memberVersion.value === version) return
  memberVersion.value = version
  // 版本切换后重新加载会员套餐列表
  loadMembershipPlans()
}

// 加载会员套餐数据（参考uniapp实现）
const loadMembershipPlans = async () => {
  try {
    // 新接口：/api/v1/app/getAppProductList?productKind=vip
    const res = await membershipApi.getAppProductList({ productKind: 'vip' })

    if (res.code === '0000' && res.data) {
      const products: AppProduct[] = Array.isArray(res.data) ? res.data : []

      // memberVersion: 1 基础版 / 2 标准版（与 productType：1 基础 / 2 标准 对齐）
      const targetProductType = memberVersion.value
      // productType=0 是“免费版/普通会员”，需要在基础版/标准版切换时都展示
      const filtered = products.filter((p) => {
        const t = Number(p.productType)
        return t === targetProductType || t === 0
      })

      membershipPlansFromApi.value = filtered
    } else {
      console.error('获取会员套餐失败:', res.msg)
      ElMessage.error(res.msg || '获取会员套餐失败')
    }
  } catch (error) {
    console.error('加载会员套餐失败:', error)
    ElMessage.error('加载会员套餐失败')
  }
}

// 根据用户当前会员类型
watch(
  () => userInfo.value?.vipLevel,
  async (vipLevel) => {
    const nextVersion = Number(vipLevel ?? 0) >= 2 ? 2 : 1
    if (memberVersion.value === nextVersion) return
    memberVersion.value = nextVersion
    await loadMembershipPlans()
  },
  { immediate: true }
)

// 加载灵衍套餐数据
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
      console.error('获取灵衍套餐失败:', res.msg)
      ElMessage.error(res.msg || '获取灵衍套餐失败')
    }
  } catch (error) {
    console.error('加载灵衍套餐失败:', error)
    ElMessage.error('加载灵衍套餐失败')
  }
}

// 根据 vipType 获取会员类型颜色类
const getMembershipTypeClass = (vipType?: number) => {
  if (vipType === -1) {
    return 'membership-permanent'
  }
  if (vipType === 1) {
    return 'membership-monthly' // 月度会员 - 紫色
  }
  if (vipType === 2) {
    return 'membership-quarterly' // 季度会员 - 蓝色
  }
  if (vipType === 3) {
    return 'membership-yearly' // 年度会员 - 金黄色
  }
  return ''
}

// 卡片滚动相关
const cardsContainerRef = ref<HTMLElement>()
const showLeftArrow = ref(false)
const showRightArrow = ref(true)
const needScrollMode = ref(false) // 是否需要滚动模式

// 检查是否需要滚动模式
const checkScrollMode = () => {
  if (!cardsContainerRef.value) return

  // 等待DOM更新
  nextTick(() => {
    if (!cardsContainerRef.value) return

    const container = cardsContainerRef.value
    // 获取容器的实际可用宽度（减去padding）
    const containerWidth = container.clientWidth
    const cardWidth = 280 // 卡片宽度
    const gap = 20 // 卡片间距
    const cardsCount = membershipPlansFromApi.value.length

    if (cardsCount === 0) {
      needScrollMode.value = false
      return
    }

    // 计算4个卡片需要的宽度（正常显示4个）
    const fourCardsWidth = 4 * cardWidth + 3 * gap
    // 计算所有卡片需要的宽度
    const totalCardsWidth = cardsCount * cardWidth + (cardsCount - 1) * gap

    // 如果容器宽度不足以显示4个卡片，或者所有卡片总宽度超过容器宽度，需要滚动模式
    needScrollMode.value = containerWidth < fourCardsWidth || totalCardsWidth > containerWidth

    // 如果不需要滚动，重置滚动位置
    if (!needScrollMode.value) {
      container.scrollLeft = 0
      showLeftArrow.value = false
      showRightArrow.value = false
    } else {
      // 需要滚动时，初始位置稍微向右滚动一点，让用户看到更多内容
      // 滚动到第一个卡片完全可见的位置（考虑padding）
      const initialScroll = Math.min(60, container.scrollWidth * 0.1) // 最多滚动10%或60px
      container.scrollLeft = initialScroll

      // 检查滚动状态
      handleScroll()
    }
  })
}

// 处理滚动事件，显示/隐藏箭头
const handleScroll = () => {
  if (!cardsContainerRef.value || !needScrollMode.value) return

  const { scrollLeft, scrollWidth, clientWidth } = cardsContainerRef.value
  showLeftArrow.value = scrollLeft > 0
  showRightArrow.value = scrollLeft < scrollWidth - clientWidth - 1
}

// 滚动卡片
const scrollCards = (direction: 'left' | 'right') => {
  if (!cardsContainerRef.value) return

  const scrollAmount = 400 // 每次滚动的距离
  const currentScroll = cardsContainerRef.value.scrollLeft
  const targetScroll =
    direction === 'left' ? currentScroll - scrollAmount : currentScroll + scrollAmount

  cardsContainerRef.value.scrollTo({
    left: targetScroll,
    behavior: 'smooth',
  })
}

const refreshUserInfoIfLoggedIn = async () => {
  if (!userStore.isLoggedIn) return
  try {
    await userStore.getUserInfo()
  } catch (error) {
    console.error('刷新用户信息失败', error)
  }
}

// 组件挂载
onMounted(async () => {
  await refreshUserInfoIfLoggedIn()
  console.log('Membership 组件挂载，当前用户信息:', userInfo.value)

  // 加载会员和灵衍套餐数据
  await Promise.all([loadMembershipPlans(), loadTideCoinPlans()])

  // 等待DOM更新后检查是否需要滚动模式
  nextTick(() => {
    checkScrollMode()
  })

  // 监听窗口大小变化，重新检查滚动模式
  window.addEventListener('resize', checkScrollMode)
})

onActivated(() => {
  refreshUserInfoIfLoggedIn()
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', checkScrollMode)
})

// 监听会员套餐数据变化，重新检查滚动模式
watch(
  () => membershipPlansFromApi.value.length,
  () => {
    nextTick(() => {
      checkScrollMode()
    })
  }
)

// 价格单位：优先使用新字段 productUnit（0 永久 1 月度会员 2 季度会员 3 年度会员）
const getPriceUnit = (plan: any) => {
  const unit = Number(plan?.productUnit ?? 0)
  // 1 月度会员 2 季度会员 3 年度会员
  if (unit === 0) return '/永久'
  if (unit === 1) return '/月'
  if (unit === 2) return '/季'
  if (unit === 3) return '/年'
  return '/年'
}
// 会员名字
const getVipName = (plan: any) => {
  return plan.productName || ''
}

const getDiscountText = (plan: any) => {
  const d = Number(plan?.productDiscount)
  if (!d || Number.isNaN(d)) return ''
  if (d >= 100) return ''
  if (d <= 0) return ''
  // 70 => 7折；75 => 7.5折
  const zhe = d % 10 === 0 ? String(d / 10) : String((d / 10).toFixed(1)).replace(/\.0$/, '')
  return `${zhe}折`
}

// 判断是否免费版（等级为免费 或 价格为 0）
const isFreePlan = (plan: any) => {
  // 套餐里没有 vipLevel，这里用 productType：0 免费 1 基础 2 标准 3 高级
  const level = Number(plan?.productType ?? 0)
  const price = Number(plan?.productPrice)
  return level === 0 || price === 0
}

// 当前会员是否为该套餐（用于按钮“当前套餐”文案）
const isCurrentMembershipPlan = (plan: any) => {
  const info: any = userInfo.value || {}
  const vipType = Number(info.vipType ?? 0) // 用户：0 普通用户 1 月度会员 2 季度会员 3 年度会员
  const vipLevel = Number(info.vipLevel ?? 0) // 用户：0 普通用户 1 基础 2 标准 3 高级

  // 套餐侧字段：使用 productType/productUnit（0 免费 1 基础 2 标准 3 高级; 1 月 2 季 3 年）
  const planLevel = Number(plan?.productType ?? 0)
  const planUnit = Number(plan?.productUnit ?? 0)

  // 非会员（vipType=0 && vipLevel=0）：当前套餐就是“免费版”（vipLevel=0）
  if (vipType === 0 && vipLevel === 0) {
    return planLevel === 0
  }

  // 会员：等级 + 周期都一致时，为当前套餐
  return planLevel === vipLevel && planUnit === vipType
}

// 获取购买按钮文案
const getPurchaseButtonText = (plan: any) => {
  if (isCurrentMembershipPlan(plan)) {
    return '当前套餐'
  }
  return '立即购买'
}
</script>

<style lang="scss" scoped>
.membership-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: radial-gradient(0.5% 0.5% at 50% 50%, rgba(11, 79, 141, 1) 0%, rgba(11, 7, 23, 1) 70%);
}

.membership-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  overflow-x: visible; // 确保横向内容不被裁剪
  max-height: 100vh;
  padding: 54px 0 41px;
}

.main-content {

  // 内容区域居中，最大宽度80%
  .main-inner {
    width: 80%;
    // max-width: 1283px;
    margin-left: auto;
    margin-right: auto;
    padding-top: $spacing-xl;
    min-height: 100vh;
    overflow: visible; // 确保内容不被裁剪

    // 小屏幕优化
    @media (max-width: 1024px) {
      padding-bottom: 60px;
    }

    @media (max-width: 600px) {
      padding-bottom: 40px;
    }
  }
}

// 用户信息卡片
.user-info-card {
  margin-bottom: 15px;
  padding: 26px 34px 19px;
  border-radius: $border-radius-xl;
  background-color: rgba(18, 18, 18, 1);
  box-shadow: 0px 0px 15px 0px rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.15);

  .user-main-info {
    display: flex;
    align-items: center;
    gap: $spacing-md;
    margin-bottom: $spacing-2xl;

    .user-avatar {
      width: 56px;
      height: 56px;
      border-radius: 50%;

      img {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        object-fit: cover;
      }
    }

    .user-details {
      flex: 1;

      .user-nickname {
        font-size: $font-size-lg;
        font-weight: bold;
        color: $color-text-nickname;
      }

      .user-mobile {
        font-size: $font-size-md;
        color: $color-text-gray;
      }
    }
  }

  .user-info-meta {
    display: flex;
    gap: $spacing-lg;

    .meta-item {
      padding: 8px 31px;
      border-radius: $border-radius-md;
      background-color: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(63, 62, 62, 0.5);
      text-align: center;

      .meta-label {
        margin-bottom: 5px;
        font-size: $font-size-sm;
        color: $color-text-placeholder;
      }

      .meta-value {
        font-size: $font-size-md;
        color: $color-text-nickname;

        // 月度会员 - 紫色
        &.membership-monthly {
          color: #C7B4EC;
        }

        // 季度会员 - 蓝绿色
        &.membership-quarterly {
          color: $color-primary-dark;
        }

        // 年度会员 - 金黄色
        &.membership-yearly {
          color: #F4E8BE;
        }
      }
    }
  }

  .user-extra {
    display: flex;
    align-items: center;

    .coin-badge {
      display: flex;
      align-items: center;
      padding: 10px 7px;
      height: 36px;
      margin-right: 21px;
      border-radius: $border-radius-md;
      background-color: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(63, 62, 62, 0.5);
      color: $color-primary-dark;

      .coin-icon {
        width: 16px;
        height: 16px;
        margin-right: 4px;
      }

      .coin-number {
        margin-right: 6px;
        font-size: $font-size-lg;
        font-weight: bold;
        font-family: NotoSans-bold;
      }

      .coin-text {
        font-size: $font-size-sm;
        font-family: NotoSans-regular;
      }
    }

    .order-btn {
      height: 36px;

      &:last-child {
        margin-left: 18px;
      }
    }
  }

  // 小屏幕适配
  @media (max-width: 1024px) {
    padding: $spacing-lg;
    margin-bottom: $spacing-xl;

    .user-main-info {
      flex-direction: column;
      align-items: flex-start;
      gap: $spacing-lg;
      margin-bottom: $spacing-lg;

      .user-avatar {
        width: 48px;
        height: 48px;
      }

      .user-details {
        width: 100%;

        .user-nickname {
          font-size: $font-size-lg;
        }

        .user-mobile {
          font-size: $font-size-sm;
        }
      }

      .user-extra {
        width: 100%;
        flex-direction: column;
        gap: $spacing-md;
        align-items: stretch;

        .coin-badge {
          width: 100%;
          justify-content: center;
          margin-right: 0;
          margin-bottom: 0;
        }

        .order-btn {
          width: 100%;
          margin: 0;
        }
      }
    }

    .user-info-meta {
      flex-direction: column;
      gap: $spacing-md;

      .meta-item {
        width: 100%;
        padding: $spacing-md;
      }
    }
  }

  // 中等屏幕适配
  @media (min-width: 769px) and (max-width: 1024px) {
    padding: $spacing-lg;

    .user-main-info {
      gap: $spacing-sm;

      .user-avatar {
        width: 50px;
        height: 50px;
      }

      .user-details {
        .user-nickname {
          font-size: $font-size-lg;
        }
      }

      .user-extra {
        flex-wrap: wrap;
        gap: $spacing-sm;

        .coin-badge {
          margin-right: $spacing-sm;
        }

        .order-btn {
          font-size: $font-size-sm;
          padding: 0 $spacing-sm;
        }
      }
    }

    .user-info-meta {
      gap: $spacing-md;

      .meta-item {
        padding: $spacing-sm $spacing-lg;
      }
    }
  }
}

// 会员卡片容器（带箭头）
.membership-cards-wrapper {
  position: relative;
  padding: 60px 0 86px;
  margin: 0 82px;
  overflow: visible; // 确保右上角标签不被裁剪

  // 小屏幕优化：减少左右间距
  @media (max-width: 1600px) {
    margin: 0 60px;
  }

  @media (max-width: 1400px) {
    margin: 0 40px;
    padding: 50px 0 86px;
  }

  @media (max-width: 1200px) {
    margin: 0 20px;
    padding: 40px 0 86px;
  }

  @media (max-width: 1024px) {
    margin: 0 10px;
    padding: 30px 0 86px;
  }

  @media (max-width: 768px) {
    margin: 0 5px;
    padding: 20px 0 86px;
  }

  // 滑动箭头样式
  .scroll-arrow {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 48px;
    height: 48px;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 10;
    transition: all 0.3s ease;
    color: $color-text-white;
    font-size: 24px;

    &:hover {
      background: rgba(255, 255, 255, 0.2);
      border-color: $color-primary;
      color: $color-primary;
    }

    &.scroll-arrow-left {
      left: 20px;

      // 小屏幕时箭头位置调整
      @media (max-width: 1200px) {
        left: 5px;
        width: 40px;
        height: 40px;
        font-size: 20px;
      }

      @media (max-width: 768px) {
        left: 2px;
        width: 36px;
        height: 36px;
        font-size: 18px;
      }
    }

    &.scroll-arrow-right {
      right: 20px;

      // 小屏幕时箭头位置调整
      @media (max-width: 1200px) {
        right: 5px;
        width: 40px;
        height: 40px;
        font-size: 20px;
      }

      @media (max-width: 768px) {
        right: 2px;
        width: 36px;
        height: 36px;
        font-size: 18px;
      }
    }
  }
}

// 会员卡片网格
.membership-cards-grid {
  // 默认网格布局（大屏幕，能显示4个）
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  overflow: visible; // 确保右上角标签不被裁剪

  // 小屏幕优化：减少左右内边距，让更多内容可见
  @media (max-width: 1400px) {
    padding: 15px 40px 0;
  }

  // 1400-1600px 范围内，增加右侧 padding，为折扣标签留出空间（标签 right: -13px + 标签宽度约50px）
  @media (min-width: 1401px) and (max-width: 1820px) {
    padding: 15px 60px 0 0; // 右侧留出足够空间给标签，避免被裁剪
  }

  @media (max-width: 1200px) {
    padding: 15px 20px 0;
    gap: 16px;
    grid-template-columns: repeat(2, 1fr); // 中等屏幕改为2列
  }

  @media (max-width: 1024px) {
    padding: 15px 10px 0;
    gap: 16px;
    grid-template-columns: repeat(2, 1fr); // 平板改为2列
  }

  @media (max-width: 768px) {
    padding: 15px 5px 0;
    gap: 12px;
    grid-template-columns: 1fr; // 小屏幕改为1列
  }

  @media (max-width: 480px) {
    padding: 10px 0 0;
    gap: 12px;
  }

  // 滚动模式（小屏幕，显示不全时）
  &.scroll-mode {
    display: flex;
    overflow-x: auto;
    overflow-y: hidden;
    scroll-behavior: smooth;
    scrollbar-width: none; // Firefox 隐藏滚动条
    -ms-overflow-style: none; // IE 隐藏滚动条

    // 隐藏 Webkit 浏览器的滚动条
    &::-webkit-scrollbar {
      display: none;
    }

    // 滚动模式下，卡片不收缩
    .membership-card {
      flex: 0 0 auto;
      width: 280px;
      min-width: 280px;

      // 小屏幕时卡片宽度稍微减小
      @media (max-width: 768px) {
        width: 260px;
        min-width: 260px;
      }
    }
  }

  // 网格模式下，卡片正常显示
  &:not(.scroll-mode) {
    .membership-card {
      width: 100%;
    }
  }
}

// 会员卡片
.membership-card {
  background-color: rgba(18, 18, 18, 1);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 16px;
  padding: 25px 20px;
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

  .card-header {
    padding: 0 6px;
    position: relative;
    overflow: visible; // 确保右上角标签不被裁剪

    .card-title {
      font-size: 20px;
      font-weight: 600;
      color: $color-text-nickname;
      margin: 0;
    }

    .price-section {
      margin: 23px 0 26px;
      display: flex;
      align-items: baseline;
      gap: $spacing-sm;

      .price {
        font-size: 30px;
        font-weight: 700;
        color: $color-text-nickname;
        line-height: 1;
      }

      .price-unit {
        font-size: $font-size-base;
        color: $color-text-gray;
      }

      .original-price {
        font-size: 12px;
        color: $color-text-gray;
        text-decoration: line-through;

        &::before {
          content: '¥';
          font-size: 15px;
        }
      }
    }
  }

  // 顶部右侧折扣角标（使用接口 productDiscount 动态渲染）
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

  .card-body {
    margin-bottom: 24px;

    .purchase-button {
      width: 100%;
      height: 47px;
      border-radius: 12px;
      font-size: $font-size-base !important;
      font-weight: 600;
      color: $color-text-gray;
      border: none !important;
      box-shadow: none !important;

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

    // 灵衍信息卡片
    .coin-info-card {
      margin-top: 17px;
      padding: 14px;
      background: rgba(255, 255, 255, 0.08);
      border-radius: 12px;
      gap: 12px;

      .coin-icon {
        width: 32px;
        height: 32px;
        flex-shrink: 0;
        margin-top: 2px;
      }

      .coin-content {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 6px;

        .coin-amount {
          margin-bottom: 6px;
          font-size: 14px;
          font-weight: 600;
        }

        .coin-detail {
          font-size: 10px;
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
      font-size: $font-size-sm;
      color: $color-text-light;

      .feature-icon {
        width: 15px;
        height: 15px;
        object-fit: contain;
        flex-shrink: 0;
      }
    }
  }

  // 主题0 - 免费版（灰色调，禁用状态）
  &.theme-0 {
    border: 1px solid rgba(255, 255, 255, 0.15);

    &:hover {
      background: none;
    }

    .purchase-button {
      background: rgba(255, 255, 255, 0.04) !important;
      color: $color-text-gray !important;
      border: none !important;
      cursor: not-allowed !important;
    }

    .card-features {
      .feature-item {
        .feature-icon {
          width: 12px;
          height: 11px;
          object-fit: contain;
          flex-shrink: 0;
        }
      }
    }
  }

  // 主题1 - 月度会员（紫色调）
  &.theme-1 {
    border: 1px solid rgba(216, 180, 254, 1);

    &:hover {
      background: rgba(216, 180, 254, 0.3);
    }

    .title {
      color: #C7B4EC !important;
    }

    .corner-discount-tag,
    .purchase-button {
      background: linear-gradient(90deg, rgba(204, 166, 244, 1) 0%, rgba(192, 126, 255, 1) 53%, rgba(204, 166, 244, 1) 99%) !important;
    }

    // 灵衍信息卡片
    .coin-info-card {
      background-color: rgba(192, 132, 252, 0.04);
      border: 1px solid rgba(192, 132, 252, 0.08);

      .coin-content {
        .coin-amount {
          color: #E9D5FF;
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
      background: linear-gradient(90deg, rgba(145, 213, 243, 1) 0%, rgba(79, 179, 250, 1) 47%, rgba(142, 204, 232, 1) 100%);
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
          color: rgba(197, 239, 244, 1);
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

    .title {
      color: #c4aa75 !important;
    }

    .corner-discount-tag {
      background: linear-gradient(90deg, rgba(244, 232, 190, 1) 0%, rgba(196, 170, 117, 1) 47%, rgba(244, 232, 190, 1) 100%) !important;
    }

    .purchase-button {
      background: linear-gradient(90deg,
          rgba(244, 232, 190, 1) 0%,
          rgba(196, 170, 117, 1) 50%,
          rgba(244, 232, 190, 1) 99%) !important;
    }

    .coin-info-card {
      background-color: rgba(196, 170, 117, 0.04);
      border: 1px solid rgba(196, 170, 117, 0.08);

      .coin-content {
        .coin-amount {
          color: rgba(244, 232, 190, 1);
        }

        .coin-detail {
          color: rgba(244, 232, 190, 0.24);
        }
      }
    }
  }
}

// 会员套餐选择区域
.membership-section {
  margin-bottom: 0;
  padding-bottom: 0;
  overflow: visible; // 确保内容不被裁剪
}

.section-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;

  .membership-tabs {
    width: 100%;

    :deep(.el-tabs__item) {
      height: 60px;
      line-height: 60px;

      &.is-active {
        color: $color-text-white;
      }
    }
  }

  // 基础会员 / 标准会员 切换按钮组（参考图二样式）
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

.membership-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;

  // 灵衍值页面布局
  &.tidecoins-layout {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }
}

// 灵衍值页面样式
.tidecoins-notice {
  padding: 21px 0 40px;
  text-align: center;
  color: $color-text-light;
  font-size: 13px;

  .notice-text {
    color: $color-text-gray;
  }

  .rules-link {
    cursor: pointer;
    color: $color-primary-dark;
  }
}

// 升级会员弹窗
.change-plan-dialog {
  border-radius: 16px;

  .change-plan-header {
    padding: 21px 33px 28px;
    font-size: $font-size-2xl;
    font-weight: 600;
    color: $color-text-white;

    .close-icon {
      width: 24px;
      height: 24px;
    }
  }

  .change-plan-body {
    padding: 0 33px;
    font-size: $font-size-md;
    color: $color-text-gray;

    .change-plan-tip {
      display: flex;
      gap: 16px;
      padding: 35px 25px;
      border-radius: 12px 12px 12px 12px;
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.05) 14.6%, rgba(255, 255, 255, 0.02) 85.4%);
      border: 1px solid rgba(255, 255, 255, 0.04);

      .tip-icon {
        width: 20px;
        height: 20px;
        border-radius: 50%;
      }

      .tip-main {
        margin-bottom: 4px;
      }

      .plan-name {
        color: $color-text-white;
        font-weight: bold;
      }

      .link-text {
        color: $color-primary;
        cursor: pointer;
      }
    }

    .change-plan-desc {
      margin: 32px 0 24px;
      font-size: $font-size-md;
      color: $color-text-light;

      .highlight {
        color: $color-text-white;
      }
    }

    .plan-item {
      display: flex;
      gap: 16px;
      margin-bottom: 40px;

      .plan-order {
        width: 32px;
        height: 32px;
        border-radius: 999px;
        background-color: rgba(26, 26, 26, 1);
        border: 1px solid rgba(75, 85, 99, 1);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: $font-size-sm;
        color: $color-text-gray;

        &.active {
          border-color: $color-primary-dark;
          color: $color-primary-dark;
        }
      }

      .plan-info {
        flex: 1;
      }

      .plan-row {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 4px;

        .plan-title {
          font-family: Inter-semiBold;
          font-size: $font-size-lg;
          color: $color-text-white;
          font-weight: 500;

          &.text-content {
            color: $color-text-light;
          }
        }
      }

      .plan-meta {
        display: flex;
        align-items: center;
        font-size: $font-size-md;
        color: $color-text-placeholder;

        .meta-icon {
          width: 16px;
          height: 16px;
          margin-right: 6px;
        }
      }
    }

    .plan-tag {
      padding: 0 9px;
      border-radius: 4px 4px 4px 4px;
      background-color: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(255, 255, 255, 0.04);
      font-size: $font-size-sm;
      line-height: 22px;

      &.plan-tag-primary {
        color: $color-primary;
        border-color: $color-primary;
      }

      &.plan-tag-gray {
        color: #999999;
      }
    }
  }

  .change-plan-footer {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    padding: 24px 32px;
    background: $color-bg-dark-two;

    .pay-summary {
      font-size: $font-size-md;
      font-family: Inter-bold;
      font-weight: bold;

      .amount {
        font-size: $font-size-2xl;
        font-weight: 600;
        color: $color-primary-dark;

        &:before {
          content: '¥';
          margin-right: 8px;
          font-size: $font-size-md;
          font-weight: normal;
        }
      }
    }

    .confirm-btn {
      width: 142px;
      height: 44px;
      margin-left: 40px;
      // 覆盖 el-button--primary 默认渐变/边框，否则视觉会有差距
      border-radius: 12px;
    }
  }
}

.tidecoins-grid {
  display: grid;
  // 使用 auto-fit 和 minmax，确保卡片固定大小，放不下时自动换行
  // grid-template-columns: repeat(auto-fit, minmax(332px, 1fr));
  grid-template-columns: repeat(3, 1fr);
  gap: 40px;
  padding: 0 118px 130px;

  // 响应式设计
  @media (max-width: 1600px) {
    padding: 0 60px 130px;
    gap: 30px;
    grid-template-columns: repeat(auto-fit, minmax(332px, 1fr));
  }

  @media (max-width: 1024px) {
    padding: 0 20px 130px;
    gap: 20px;
    grid-template-columns: repeat(2, 2fr);
  }

  @media (max-width: 600px) {
    padding: 0 10px 130px;
    gap: 12px;
    grid-template-columns: repeat(1, 1fr);
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
    border-radius: 0 0 12px 12px;
    background: $color-bg-dark-secondary url('@/assets/images/logo_black.png') no-repeat right 3px bottom 0;
    background-size: 132px 97px;

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
