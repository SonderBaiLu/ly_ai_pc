<template>
  <div class="membership-page">
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
                <div class="user-nickname">
                  {{ userInfo?.nickname || '未登录' }}
                  <template v-if="userInfo?.isVip === 1">
                    <text v-if="userInfo?.vipType === 1" class="user-type">基础会员</text>
                    <text v-if="userInfo?.vipType === 0" class="user-type">标准会员</text>
                    <text v-if="userInfo?.vipType === 2" class="user-type">高级会员</text>
                  </template>
                </div>
                <div class="user-mobile">{{ userInfo?.mobile || '未登录' }}</div>
              </div>
              <!-- 右侧：潮币与订单 -->
              <div class="user-extra">
                <div class="coin-badge" @click="activeTab = 'tidecoins'">
                  <img :src="images.coin" alt="潮币" class="coin-icon" />
                  <span class="coin-number">{{ userInfo?.wavePoints || 0 }}</span>
                  <span class="coin-text">潮币</span>
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
                <div :class="['meta-value', getMembershipTypeClass(userInfo?.effectUnit)]">
                  {{ getMembershipTypeText(userInfo?.effectUnit, userInfo?.isVip) }}
                </div>
              </div>
              <div class="meta-item">
                <div class="meta-label">到期时间</div>
                <div :class="['meta-value', getMembershipTypeClass(userInfo?.effectUnit)]">
                  {{ userInfo?.expirationDate || '永久' }}
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

              <!-- 基础版 / 标准版 切换：0=标准版 1=基础版（接口 vipType：0 标准版 1 基础版） -->
              <div v-if="activeTab === 'membership'" class="member-version-toggle">
                <div class="toggle-segment" :class="{ active: memberVersion === 1 }" @click="switchMemberVersion(1)">
                  <span>基础版</span>
                </div>
                <div class="toggle-segment" :class="{ active: memberVersion === 0 }" @click="switchMemberVersion(0)">
                  <span class="recommend-tag">推荐</span>
                  <span>标准版</span>
                </div>
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
                  <div v-for="(plan, index) in membershipPlansFromApi" :key="plan.id" class="membership-card"
                    :class="`theme-${index}`">
                    <div class="card-header">
                      <h3 class="card-title title">{{ getVipName(plan) }}</h3>
                      <div class="price-section">
                        <span class="price">¥{{ plan.itemPrice }}</span>
                        <span class="price-unit">{{ getPriceUnit(plan) }}</span>
                        <!-- 显示原价（删除线） -->
                        <span v-if="getOriginalPrice(plan, index)" class="original-price">
                          {{ getOriginalPrice(plan, index) }}
                        </span>
                      </div>
                    </div>

                    <div class="card-body">
                      <el-button class="purchase-button" :disabled="isFreePlan(plan)" type="primary"
                        @click="handlePurchaseAction(plan)">
                        {{ getPurchaseButtonText(plan) }}
                      </el-button>

                      <!-- 潮币信息卡片 -->
                      <div v-if="plan.itemDescList && plan.itemDescList.length > 0" class="coin-info-card">
                        <!-- <img :src="getCoinIcon(index)" class="coin-icon" alt="潮币图标" /> -->
                        <div class="coin-content">
                          <div v-for="(desc, descIdx) in (plan.itemDescList || []).slice(-2)" :key="descIdx"
                            :class="descIdx === 0 ? 'coin-amount' : 'coin-detail'">
                            {{ desc }}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div class="card-features">
                      <div v-for="(right, idx) in plan.vipRightsList" :key="idx" class="feature-item">
                        <!-- <img
                    :src="right.imgUrl || images.vipPrivilege"
                    class="feature-icon"
                    alt="权益图标"
                    /> -->
                        <img v-if="index === 0" :src="images.right" class="feature-icon" alt="" />
                        <img v-if="index === 1" :src="images.check1" class="feature-icon" alt="" />
                        <img v-if="index === 2" :src="images.check2" class="feature-icon" alt="" />
                        <img v-if="index === 3" :src="images.check3" class="feature-icon" alt="" />
                        <span>{{ right.rightName }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </template>

            <!-- 潮币值页面 -->
            <template v-else-if="activeTab === 'tidecoins'">
              <!-- 温馨提示 -->
              <div class="tidecoins-notice">
                温馨提示：
                <span class="notice-text">
                  潮币值不可兑换会员，不可转赠与提现；充值后有效期为{{
                    selectedPlan?.effectDate || '2'
                  }}年，不支持退换或反向兑换成人民币。
                </span>
                <span class="rules-link" @click="() => navigateToAgreement('COIN_RULES_DESCRIPTION')">
                  潮币值规则
                </span>
              </div>

              <!-- 潮币套餐网格 -->
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
                  <div class="tidecoin-bottom flex-between">
                    <div class="tidecoin-price">¥ {{ plan.waveCoinPrice }}</div>
                    <el-button class="tidecoin-button" type="primary" @click.stop="handlePurchaseAction(plan)">
                      立即购买
                    </el-button>
                  </div>
                </div>
              </div>
            </template>
          </div>

          <!-- 服务条款链接 -->
          <!-- <div class="terms-links">
        <el-button text class="term-link" @click="navigateToAgreement('PAY_SERVICE_AGREEMENT')">
          服务条款
        </el-button>
        <el-divider direction="vertical" />
        <el-button text class="term-link" @click="navigateToAgreement('ANDROID_PRIVACY_POLICY')">
          隐私协议
        </el-button>
        <el-divider direction="vertical" />
        <el-button text class="term-link" @click="navigateToAgreement('PAY_SERVICE_AGREEMENT')">
          付费服务协议
        </el-button>
        </div> -->
        </div>

        <!-- 潮币值明细弹窗 -->
        <InspirationValueModal v-model="showInspirationModal" />
        <!-- 订阅管理弹窗 -->
        <SubscriptionManageModal v-model="showSubscriptionModal" />
      </div>
    </div>
    <!-- 客服弹窗 -->
    <ContactModal v-model="showCustomerServiceModal" />

    <!-- 支付弹窗 -->
    <PaymentModal v-model="showPayDialog" :title="payDialogTitle" :initial-amount="initialPayAmount"
      :create-payment-order="createVipPaymentOrder" :purchase-type="purchaseType" :show-customer-service="true"
      :on-open-customer-service="openCustomerService" @close="closePayDialog" @success="handlePaymentSuccess" />

    <!-- 会员变更计划弹窗 -->
    <el-dialog v-model="showChangePlanDialog" title="会员变更计划" width="800px" class="change-plan-dialog" :show-close="true"
      :close-on-click-modal="false">
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
              如订阅周期内的会员潮币消耗完，可额外
              <span class="link-text" @click="() => ((activeTab = 'tidecoins'), (showChangePlanDialog = false))">
                购买潮币
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
            <div class="plan-order">1</div>
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
                {{
                  vipChangeDetail?.effectiveDate ||
                  effectiveDate ||
                  userInfo?.expirationDate ||
                  '--'
                }}
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
                {{ vipChangeDetail?.oldExpirationDate || userInfo?.expirationDate || '--' }}
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
                    vipChangeDetail?.vipItemNew?.itemPrice ??
                    selectedPlan?.itemPrice ??
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
import { membershipApi } from '@/api/membership'
import { paymentApi } from '@/api/payment'
import { images } from '@/assets'
import PaymentModal from '@/components/PaymentModal.vue'
import { resolveAvatarUrl } from '@/utils/avatar'

const router = useRouter()

// 用户信息
const userStore = useUserStore()
const userInfo = computed(() => userStore.userInfo)

const avatarSrc = computed(() => resolveAvatarUrl(userInfo.value?.headImgUrl, images.avatar))

// 潮币值明细弹窗
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

const activeTab = ref('membership')

// 基础版 / 标准版 切换：0=标准版 1=基础版（接口 vipType：0 标准版 1 基础版 2 高级版）
// 默认展示“基础版”，若用户是会员则按实际 vipType 展示对应内容
const memberVersion = ref<number>(1)

// 会员套餐数据（从API获取）
type VipItem = {
  id: string | number
  itemName: string
  itemPrice: number | string
  itemDescList?: string[]
  itemDesc?: string
  vipRightsList?: Array<{ rightName: string; imgUrl?: string }>
  itemUnit?: string | number
  priceUnit?: string
  tag?: string
  [key: string]: any
}

const membershipPlansFromApi = ref<VipItem[]>([])

// 潮币值套餐数据（从API加载）
const tideCoinsPlans = ref<any[]>([])

// 选中的套餐
const selectedPlan = ref<any>(null)

// ===== 会员变更计划相关状态（参考 uniapp 实现） =====
// 会员变更计划弹窗
const showChangePlanDialog = ref(false)
// 生效日期（若后端未返回，则前端计算兜底）
const effectiveDate = ref('')
// 会员变更计划详情（来自 vipTip 接口：包含 vipItemOld / vipItemNew 等）
const vipChangeDetail = ref<any | null>(null)

// 选择潮币值
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
const purchaseType = ref<'membership' | 'coin'>('membership') // 购买类型：会员或潮币
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

// 创建支付订单并展示二维码（支持会员和潮币购买）
const createVipPaymentOrder = async (plan?: any) => {
  if (!userInfo.value) {
    ElMessage.warning('请先登录后再购买')
    router.push('/login')
    throw new Error('用户未登录')
  }

  const targetPlan = plan || selectedPlan.value
  if (!targetPlan) {
    throw new Error('未选择套餐')
  }

  // 判断是潮币购买还是会员购买
  const isCoinPurchase = purchaseType.value === 'coin' || !!targetPlan.coinCode

  // 根据购买类型构建不同的支付参数
  const payload: any = {
    userId: userInfo.value.userId || userInfo.value.logicId || userInfo.value.phone,
    paymentType: 0, // 0-支付宝
    orderType: isCoinPurchase ? 1 : 0, // 订单类型：0-开通会员 1-购买潮币
    itemCode: isCoinPurchase ? targetPlan.itemCode || targetPlan.coinCode : targetPlan.itemCode,
    itemId: targetPlan.id,
    platformType: 0, // 默认PC端
    currencyType: 1, // 默认人民币
  }

  const res = await paymentApi.createPaymentOrder(payload)
  if (res.resp_code !== 0 || !res.datas) {
    throw new Error(res.resp_msg || '创建支付订单失败')
  }

  return res.datas as any
}

// 支付弹窗关闭回调
const closePayDialog = () => {
  showPayDialog.value = false
}

// 支付成功回调
const handlePaymentSuccess = () => {
  showPayDialog.value = false
  // 支付成功后可以在这里做额外处理，比如刷新列表等
}

// 打开支付弹窗（封装公共逻辑）
const openPaymentForPlan = (plan: any) => {
  if (!plan) return

  // 记录当前选择的套餐
  selectedPlan.value = plan

  const isCoinPurchase = !!plan.coinCode

  if (isCoinPurchase) {
    purchaseType.value = 'coin'
    payDialogTitle.value = '潮币充值'
    initialPayAmount.value = Number(plan.waveCoinPrice) || 0
  } else {
    purchaseType.value = 'membership'
    payDialogTitle.value = getVipName(plan) || '会员购买'
    initialPayAmount.value = Number(plan.itemPrice) || 0
  }

  showPayDialog.value = true
}

// 计算生效日期（后端未返回时的兜底文案）
const calculateEffectiveDate = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1
  const day = now.getDate()
  effectiveDate.value = `${year}年${month}月${day}日`
}

// 会员类型 & 周期映射（仅用于变更计划文案）
// vipType：0 标准版 1 基础版 2 高级版（与后端保持一致）
const vipLevelNameMap: Record<string | number, string> = {
  0: '标准会员',
  1: '基础会员',
  2: '高级会员',
}
const vipPeriodNameMap: Record<string | number, string> = {
  '-1': '永久会员',
  0: '月度会员',
  1: '季度会员',
  2: '年度会员',
}
const vipPeriodUnitMap: Record<string | number, string> = {
  '-1': '终身',
  0: '月',
  1: '季',
  2: '年',
}

const getVipLevelName = (vipType?: number | string) => {
  const key = String(vipType ?? '')
  return vipLevelNameMap[key] || vipLevelNameMap[Number(key)] || ''
}
const getVipPeriodName = (unit?: number | string) => {
  const key = String(unit ?? '')
  return vipPeriodNameMap[key] || vipPeriodNameMap[Number(key)] || ''
}
const getVipPeriodUnit = (unit?: number | string) => {
  const key = String(unit ?? '')
  return vipPeriodUnitMap[key] || vipPeriodUnitMap[Number(key)] || ''
}

// 会员变更卡片展示文案（旧套餐）
const oldPlanDisplay = computed(() => {
  const info = vipChangeDetail.value?.vipItemOld
  if (!info) {
    return {
      levelLabel: '',
      periodLabel: '',
      priceText: '',
    }
  }
  const levelLabel = getVipLevelName(info.vipType)
  const periodLabel = getVipPeriodName(info.itemUnit)
  const unitShort = getVipPeriodUnit(info.itemUnit)
  const price =
    info.itemPrice !== null && info.itemPrice !== undefined ? Number(info.itemPrice).toFixed(0) : ''
  const priceText = price ? `¥${price} / ${unitShort}` : ''
  return {
    levelLabel,
    periodLabel,
    priceText,
  }
})

// 会员变更卡片展示文案（新套餐）
const newPlanDisplay = computed(() => {
  const info = vipChangeDetail.value?.vipItemNew
  if (!info) {
    return {
      levelLabel: '',
      periodLabel: '',
      priceText: '',
    }
  }
  const levelLabel = getVipLevelName(info.vipType)
  const periodLabel = getVipPeriodName(info.itemUnit)
  const unitShort = getVipPeriodUnit(info.itemUnit)
  const price =
    info.itemPrice !== null && info.itemPrice !== undefined ? Number(info.itemPrice).toFixed(0) : ''
  const priceText = price ? `¥${price} / ${unitShort}` : ''
  return {
    levelLabel,
    periodLabel,
    priceText,
  }
})

// 处理购买（会员或潮币）
const handlePurchaseAction = async (plan: any) => {
  if (isFreePlan(plan)) return

  // 判断是潮币购买还是会员购买
  const isCoinPurchase = !!plan.coinCode

  // 会员购买前先调用 vipTip 接口，判断是否需要展示“会员变更计划”弹窗
  if (!isCoinPurchase && userInfo.value) {
    try {
      const res = await membershipApi.vipTip({
        userId: userInfo.value.userId || userInfo.value.logicId || userInfo.value.phone,
        vipItemId: plan.id,
        vipType: memberVersion.value,
      })

      if (res && res.resp_code === 0 && res.datas && res.datas.vipTip) {
        // 缓存会员变更详情用于弹窗展示
        vipChangeDetail.value = res.datas
        selectedPlan.value = plan

        // 使用后端返回的生效时间文案，若没有则本地计算
        if (res.datas.effectiveDate) {
          effectiveDate.value = res.datas.effectiveDate
        } else {
          calculateEffectiveDate()
        }

        showChangePlanDialog.value = true
        return
      }
    } catch (error) {
      console.warn('调用 vipTip 接口失败，忽略提示直接进入购买流程:', error)
    }
  }

  openPaymentForPlan(plan)
}

// 确认变更会员计划 -> 打开支付弹窗
const confirmChangePlanPurchase = () => {
  if (!selectedPlan.value) {
    showChangePlanDialog.value = false
    return
  }
  showChangePlanDialog.value = false
  openPaymentForPlan(selectedPlan.value)
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
    const res = await membershipApi.vipInfoList({
      vipType: memberVersion.value,
      code: 'COMMON_PROBLEM',
    })
    console.log('会员套餐API响应:', res)

    if (res.resp_code === 0 && res.datas) {
      // 获取vipItemList数组
      const { vipItemList } = res.datas
      const plans = vipItemList || []

      // 前端补充免费版套餐（后端暂无返回）
      const hasFree = plans.some((p: any) => p.itemName === '免费版' || p.id === 'free')
      const freePlan: VipItem = {
        id: 'free',
        itemName: '免费版',
        itemPrice: 0,
        vipRightsList: [{ rightName: '每月赠送50潮币', imgUrl: images.vipPrivilege }],
        itemUnit: -1,
        tag: 'free',
        itemDesc: '每月赠送50潮币',
      }

      membershipPlansFromApi.value = hasFree ? plans : [freePlan, ...plans]
      console.log('会员套餐数据已加载:', membershipPlansFromApi.value)
    } else {
      console.error('获取会员套餐失败:', res.resp_msg)
      ElMessage.error(res.resp_msg || '获取会员套餐失败')
    }
  } catch (error) {
    console.error('加载会员套餐失败:', error)
    ElMessage.error('加载会员套餐失败')
  }
}

// 根据用户当前会员类型，初始化/更新默认显示的版本，并确保拉取对应版本的价格（套餐）
// - 非会员（isVip !== 1）-> 标准版（0）
// - 会员：vipType === 1 -> 基础版（1）；其他（0 标准 / 2 高级 / 空）-> 标准版（0）
watch(
  () => [userInfo.value?.isVip, userInfo.value?.vipType] as const,
  async ([isVip, vipType]) => {
    // 非会员保持默认“基础版”；会员则按实际 vipType 决定显示基础/标准
    const nextVersion = isVip === 1 ? (vipType === 1 ? 1 : 0) : 1
    if (memberVersion.value === nextVersion) return
    memberVersion.value = nextVersion
    await loadMembershipPlans()
  },
  { immediate: true }
)

// 加载潮币套餐数据
const loadTideCoinPlans = async () => {
  try {
    const res = await membershipApi.waveCoinList({})
    if (res.resp_code === 0 && res.datas) {
      // 将API数据转换为显示格式
      tideCoinsPlans.value = res.datas
      console.log('潮币套餐数据已加载:', tideCoinsPlans.value)
    } else {
      console.error('获取潮币套餐失败:', res.resp_msg)
      ElMessage.error(res.resp_msg || '获取潮币套餐失败')
    }
  } catch (error) {
    console.error('加载潮币套餐失败:', error)
    ElMessage.error('加载潮币套餐失败')
  }
}

// 根据 effectUnit 获取会员类型文本
const getMembershipTypeText = (effectUnit?: number, isVip?: number) => {
  if (isVip !== 1) {
    return '免费版'
  }
  if (effectUnit === -1) {
    return '永久会员'
  }
  if (effectUnit === 0) {
    return '月度会员'
  }
  if (effectUnit === 1) {
    return '季度会员'
  }
  if (effectUnit === 2) {
    return '年度会员'
  }
  return '会员版'
}

// 根据 effectUnit 获取会员类型颜色类
const getMembershipTypeClass = (effectUnit?: number) => {
  if (effectUnit === -1) {
    return 'membership-permanent' // 永久会员 - 金色
  }
  if (effectUnit === 0) {
    return 'membership-monthly' // 月度会员 - 紫色
  }
  if (effectUnit === 1) {
    return 'membership-quarterly' // 季度会员 - 蓝绿色
  }
  if (effectUnit === 2) {
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

// 组件挂载
onMounted(async () => {
  console.log('Membership 组件挂载，当前用户信息:', userInfo.value)

  // 加载会员和潮币套餐数据
  await Promise.all([loadMembershipPlans(), loadTideCoinPlans()])

  // 等待DOM更新后检查是否需要滚动模式
  nextTick(() => {
    checkScrollMode()
  })

  // 监听窗口大小变化，重新检查滚动模式
  window.addEventListener('resize', checkScrollMode)
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

// 价格单位：优先用 plan.itemUnit，否则按索引兜底
const getPriceUnit = (plan: any) => {
  if (plan.itemUnit === 0) return '/月'
  if (plan.itemUnit === 1) return '/季'
  if (plan.itemUnit === 2) return '/年'
  return '/年'
}
// 会员名字
const getVipName = (plan: any) => {
  if (plan.itemUnit === -1) return '免费版'
  if (plan.itemUnit === 0) return '月度会员'
  if (plan.itemUnit === 1) return '季度会员'
  if (plan.itemUnit === 2) return '年度会员'
  return '会员版'
}

// 原价文案：季度会员 894，年度会员 3576，先写死
const getOriginalPrice = (plan: any, index: number) => {
  // 免费版和月度不显示原价
  if (index <= 0) return ''
  // index 2 -> 季度，index 3 -> 年度（根据当前卡片顺序）
  if (index === 2) return '¥894'
  if (index === 3) return '¥3576'
  return ''
}

// 判断是否免费版
const isFreePlan = (plan: any) => plan?.id === 'free' || plan?.itemName === '免费版'

// 判断是否是当前套餐（根据用户的 vipType + effectUnit 与套餐匹配）
const isCurrentPlan = (plan: any) => {
  const userEffectUnit = userInfo.value?.effectUnit
  const userVipType = userInfo.value?.vipType
  const isVip = userInfo.value?.isVip === 1

  // 免费版判断
  if (isFreePlan(plan)) {
    // 如果用户不是会员，或者 effectUnit === -1（永久/免费），则免费版是当前套餐
    return !isVip || userEffectUnit === -1
  }

  // 如果用户不是会员，非免费版都不是当前套餐
  if (!isVip) {
    return false
  }

  // 永久会员（effectUnit === -1）只匹配免费版，不匹配其他套餐
  if (userEffectUnit === -1) {
    return false
  }

  const planItemUnit = plan?.itemUnit
  const planVipType = plan?.vipType ?? plan?.vip_type

  // 匹配：用户的 vipType + effectUnit 与套餐一致
  // vipType: 区分标准 / 基础 / 高级会员
  // effectUnit: -1永久（免费） 0月 1季度 2年
  // itemUnit: 0月 1季 2年
  if (userVipType === undefined || userVipType === null) {
    return false
  }

  return userEffectUnit === planItemUnit && userVipType === planVipType
}

// 获取购买按钮文案
const getPurchaseButtonText = (plan: any) => {
  const userEffectUnit = userInfo.value?.effectUnit

  // 免费版套餐
  if (isFreePlan(plan)) {
    // 如果是免费永久会员（effectUnit === -1），显示"当前套餐"
    if (userEffectUnit === -1) {
      return '当前套餐'
    }
    // 如果是其他会员类型，显示"免费套餐"
    return '免费套餐'
  }

  // 如果是当前套餐，显示"继续购买"
  if (isCurrentPlan(plan)) {
    return '继续购买'
  }

  // 其他情况显示"立即购买"
  return '立即购买'
}
</script>

<style lang="scss" scoped>
.membership-page {
  display: flex;
}

.membership-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  overflow-x: visible; // 确保横向内容不被裁剪
  max-height: 100vh;
  padding: 34px 34px 34px var(--sidebar-width);
}

.main-content {
  background: linear-gradient(143.13deg,
    rgba(15, 23, 42, 0.5) 14.29%,
    rgba(30, 27, 75, 0.5) 50%,
      rgba(2, 6, 23, 1) 85.71%);

  // 内容区域居中，最大宽度80%
  .main-inner {
    width: 80%;
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
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: $border-radius-xl;
  padding: $spacing-xl;
  margin-bottom: 60px;
  box-shadow: 0px 0px 15px 0px rgba(0, 0, 0, 0.4);

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
        font-size: $font-size-xl;
        font-weight: bold;
        color: $color-text-secondary;

        .user-type {
          line-height: 1;
          background: linear-gradient(90deg,
            rgba(204, 166, 244, 1) 0%,
            rgba(192, 126, 255, 1) 53%,
              rgba(204, 166, 244, 1) 99%);
          color: $color-text-white;
          font-size: $font-size-md;
          font-weight: bold;
          padding: 4px 8px;
          border-radius: 8px;
          margin-left: 10px;
        }
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
      padding: $spacing-sm $spacing-2xl;
      border-radius: $border-radius-sm;
      background-color: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(63, 62, 62, 0.5);
      text-align: center;

      .meta-label {
        margin-bottom: 5px;
        font-size: $font-size-sm;
        color: $color-text-light;
      }

      .meta-value {
        font-size: $font-size-md;
        color: $color-text-secondary;

        .membership-permanent {
          color: $color-primary;
        }

        // 月度会员 - 紫色
        &.membership-monthly {
          color: $color-primary-light;
        }

        // 季度会员 - 蓝绿色
        &.membership-quarterly {
          color: $color-primary-light;
        }

        // 年度会员 - 金黄色
        &.membership-yearly {
          color: $color-primary;
        }
      }
    }
  }

  .user-extra {
    display: flex;
    align-items: center;

    .coin-badge {
      display: inline-flex;
      align-items: center;
      gap: $spacing-sm;
      padding: 0 $spacing-md;
      height: 36px;
      margin-right: 12px;
      background-color: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(63, 62, 62, 0.5);
      border-radius: $border-radius-sm;
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover {
        border-color: $color-primary;
      }

      .coin-icon {
        width: 24px;
        height: 24px;
      }

      .coin-number {
        font-size: 18px;
        font-weight: 700;
        color: white;
      }

      .coin-text {
        font-size: $font-size-sm;
        color: $color-text-gray;
      }
    }

    .order-btn {
      height: 36px;
      border-radius: $border-radius-sm;
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
  background-color: rgba(255, 255, 255, 0.01);
  border-radius: 16px;
  padding: 26px 20px;
  border: 1px solid transparent;
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
      color: $color-text-secondary;
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
        color: $color-text-secondary;
        line-height: 1;
      }

      .price-unit {
        font-size: $font-size-md;
        color: $color-text-gray;
      }

      .original-price {
        font-size: 15px;
        color: $color-text-gray;
        text-decoration: line-through;
      }
    }
  }

  .card-body {
    margin-bottom: 24px;

    .purchase-button {
      width: 100%;
      height: 50px;
      border-radius: 12px;
      font-size: $font-size-lg !important;
      font-weight: 600;
      background: $color-bg-dark-tertiary;
      color: $color-text-white;
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

    // 潮币信息卡片
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
      color: #d1d5db;

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
    border-color: rgba(255, 255, 255, 0.1);

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
      background: linear-gradient(180deg, rgba(46, 16, 101, 1) 0%, rgba(2, 6, 23, 1) 100%);
    }

    .title {
      color: #c7b4ec !important;
    }

    .purchase-button {
      background: linear-gradient(90deg,
        rgba(204, 166, 244, 1) 0%,
        rgba(192, 126, 255, 1) 53%,
          rgba(204, 166, 244, 1) 99%) !important;
    }

    // 潮币信息卡片
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
    border: 1px solid rgba(80, 199, 253, 0.5);

    &:hover {
      background: linear-gradient(180deg, rgba(0, 66, 102, 1) 0%, rgba(2, 6, 23, 1) 100%);
    }

    .card-header::before {
      content: '9.5折';
      position: absolute;
      top: -36px;
      right: -13px;
      z-index: 10; // 确保标签在最上层
      background: linear-gradient(90deg,
        rgba(145, 213, 243, 1) 0%,
        rgba(79, 179, 250, 1) 47%,
          rgba(142, 204, 232, 1) 100%);
      color: $color-text-white;
      padding: 4px 16px;
      border-radius: 12px;
      font-size: 10px;
      font-weight: bold;
    }

    .title {
      color: #50c7fd !important;
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
      background: linear-gradient(180deg, rgba(56, 50, 36, 1) 4%, rgba(2, 6, 23, 1) 100%);
    }

    .card-header::before {
      content: '8.5折';
      position: absolute;
      top: -36px;
      right: -13px;
      z-index: 10; // 确保标签在最上层
      background: linear-gradient(90deg,
        rgba(244, 232, 190, 1) 0%,
        rgba(196, 170, 117, 1) 47%,
          rgba(244, 232, 190, 1) 100%);
      color: $color-text-white;
      padding: 4px 16px;
      border-radius: 12px;
      font-size: 10px;
      font-weight: bold;
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
      color: $color-text-secondary;
      font-size: 16px;
      height: 48px;
      line-height: 48px;
      border: none;
      background: transparent;
      transition: all 0.3s ease;

      &:hover {
        color: $color-text-white;
      }

      &.is-active {
        color: $color-primary;
        font-weight: 600;
      }
    }

    :deep(.el-tabs__active-bar) {
      background: linear-gradient(135deg, $color-primary, #a67ce8);
      height: 3px;
    }

    :deep(.el-tabs__content) {
      display: none;
    }

    // 让 tabs 的下划线拉满一整行，视觉上形成顶部细线
    :deep(.el-tabs__nav-wrap) {
      &::after {
        left: 0;
        right: 0;
        background-color: rgba(55, 65, 81, 0.6);
      }
    }
  }

  // 基础会员 / 标准会员 切换按钮组（参考图二样式）
  .member-version-toggle {
    position: relative;
    display: inline-flex;
    padding: 4px;
    border-radius: 999px;
    background: #111115;

    .toggle-segment {
      padding: 12px 52px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      font-size: 14px;
      color: $color-text-gray;
      cursor: pointer;
      transition: all 0.25s ease;

      &:hover {
        color: #e5e7eb;
      }

      &.active {
        border-radius: 12px 12px 12px 12px;
        background-color: #6366f1;
        font-weight: 600;
        color: $color-text-white;
      }

      .recommend-tag {
        position: absolute;
        top: 0;
        right: 0;
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

  // 潮币值页面布局
  &.tidecoins-layout {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }
}

// 潮币值页面样式
.tidecoins-notice {
  padding: 30px 0 40px;
  text-align: center;
  color: rgba(209, 213, 219, 1);
  font-size: 13px;

  // 小屏幕优化
  @media (max-width: 1024px) {
    padding: 20px 0 30px;
    font-size: 12px;
  }

  @media (max-width: 600px) {
    padding: 15px 0 25px;
    font-size: 11px;
  }

  .notice-text {
    color: rgba(156, 163, 175, 1);
    font-size: 13px;

    @media (max-width: 1024px) {
      font-size: 12px;
    }

    @media (max-width: 600px) {
      font-size: 11px;
    }
  }

  .rules-link {
    color: $color-primary;
    cursor: pointer;
  }
}

.change-plan-dialog :deep(.el-dialog__title) {
  font-size: $font-size-xl;
  font-weight: 600;
  color: $color-text-white;
}

.change-plan-body {
  font-size: $font-size-md;
  color: $color-text-gray;
}

.change-plan-tip {
  display: flex;
  gap: 16px;
  padding: 34px 25px;
  border-radius: 12px 12px 12px 12px;
  background: linear-gradient(135deg,
    rgba(255, 255, 255, 0.05) 14.6%,
      rgba(255, 255, 255, 0.02) 85.4%);
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
    border: 1px solid rgba(192, 126, 255, 1);
    display: flex;
    align-items: center;
    justify-content: center;
    color: rgba(192, 126, 255, 1);
    font-size: $font-size-md;
  }

  .plan-info {
    flex: 1;
  }

  .plan-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 6px;

    .plan-title {
      font-size: $font-size-xl;
      color: $color-text-white;
      font-weight: 500;

      &.text-content {
        color: $color-text-light;
      }
    }
  }

  .plan-meta {
    font-size: $font-size-md;
    color: $color-text-light;

    .meta-icon {
      width: 16px;
      height: 16px;
      margin-right: 6px;
    }
  }
}

.plan-tag {
  padding: 3px 9px;
  border-radius: 4px 4px 4px 4px;
  background-color: rgba(192, 126, 255, 0.04);
  color: rgba(16, 16, 16, 1);
  font-size: $font-size-sm;

  &.plan-tag-primary {
    color: $color-primary;
  }

  &.plan-tag-gray {
    color: #999999;
  }
}

.change-plan-footer {
  display: flex;
  justify-content: flex-end;
  align-items: center;

  .pay-summary {
    font-size: $font-size-md;

    .amount {
      margin-left: 8px;
      font-size: $font-size-4xl;
      font-weight: 600;
      color: $color-primary;

      &:before {
        content: '¥';
        font-size: $font-size-md;
      }
    }
  }

  .confirm-btn {
    padding: 0 36px;
    margin-left: 34px;
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
    background: $color-bg-dark-card url('@/assets/images/logo_hui.png') no-repeat right 4px top 17px;
    background-size: 144px 162px;
    padding: 20px;
    position: relative;
    height: 132px;

    .tidecoin-amount {
      display: flex;
      align-items: center;
      gap: 12px;

      .flame-icon {
        width: 40px;
        height: 40px;
        margin-top: 5px;
      }

      .amount {
        font-size: 36px;
        font-weight: bold;
        color: $color-text-white;
      }
    }
  }

  // 下半部分
  .tidecoin-bottom {
    background-color: rgba(23, 19, 27, 1);
    padding: 15px 35px;

    .tidecoin-price {
      font-size: $font-size-3xl;
      color: $color-text-white;
    }

    .tidecoin-button {
      width: 102px;
      height: 40px;
      border-radius: 20px;
      background: linear-gradient(90deg,
        rgba(204, 166, 244, 1) 0%,
        rgba(192, 126, 255, 1) 53%,
          rgba(204, 166, 244, 1) 99%);
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
}

// 服务条款链接
.terms-links {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  margin-top: 40px;
  padding: 20px 0;

  .term-link {
    color: $color-primary;
    font-size: 12px;
  }
}
</style>
<style lang="scss">
.change-plan-dialog.el-dialog {
  .el-dialog__header {
    padding: 33px 33px 16px;
    background-color: $color-bg-dark-primary !important;
  }

  .el-dialog__body {
    padding: 0 33px 24px;
    background-color: $color-bg-dark-primary !important;
    border: none !important;
  }

  .el-dialog__footer {
    padding: 24rpx 32px;
    border-radius: 0px 0px 12px 12px;
    background-color: rgba(34, 34, 34, 1);
    display: flex;
    justify-content: flex-end;
    align-items: center;
    border: none !important;
  }
}
</style>
