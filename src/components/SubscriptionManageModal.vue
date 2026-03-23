<template>
  <el-dialog v-model="visible" width="723px" :show-close="false" class="subscription-manage-modal"
    :close-on-click-modal="false" :close-on-press-escape="false">
    <template #header>
      <div class="modal-header">
        <div class="title">订阅管理</div>
        <img :src="images.closePay" alt="关闭" class="close-icon" @click="handleClose" />
      </div>
      <el-tabs v-model="activeTab" class="tabs">
        <el-tab-pane label="订阅" name="subscription" />
        <el-tab-pane label="购买记录" name="records" />
      </el-tabs>
    </template>

    <!-- 使用 el-scrollbar + scroll 触底加载-->
    <el-scrollbar ref="scrollbarRef" class="modal-body" @scroll="handleBodyScroll">
      <!-- 订阅列表 -->
      <div v-if="activeTab === 'subscription'" class="tab-panel">
        <!-- v-if="hasActiveSubscription" -->
        <div class="subscription-list">
          <div class="subscription-item">
            <div class="info">
              <img :src="images.subscription" alt="订阅" class="icon" />
              <div class="name">{{ membershipTypeText }}</div>
            </div>
            <div class="desc">
              <div class="label">有效期至</div>
              <div class="value">{{ subscriptions.expirationDate || '--' }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 购买记录 -->
      <div v-else class="tab-panel">
        <div class="record-list" v-if="!loadingRecords && records.length > 0">
          <div v-for="item in records" :key="item.id" class="record-item">
            <div class="record-header">
              {{ item.title }}
            </div>
            <div class="record-row">
              <span class="label">价格</span>
              <span class="value">¥{{ item.payAmount.toFixed(2) }}</span>
            </div>
            <div class="record-row">
              <span class="label">购买时间</span>
              <span class="value">{{ item.payTime }}</span>
            </div>
            <div class="record-row">
              <span class="label">订单编号</span>
              <div class="order-no">
                <span class="value">
                  {{ item.orderNo }}
                </span>
                <img :src="images.copy" alt="复制" class="copy-icon" @click="handleCopy(item.orderNo)" />
              </div>
            </div>
            <div class="record-row">
              <span class="label">支付方式</span>
              <span class="value">
                {{ item.paymentTypeName }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <InfiniteScrollLoader :key="activeTab" :loading="loaderLoading" :has-more="loaderHasMore"
        :data-length="loaderDataLength" :show-empty-state="true" :empty-text="loaderEmptyText"
        :empty-image="images.noRecord" image-size="140px" empty-text-color="#474B64" empty-text-font-size="13px" />
    </el-scrollbar>
  </el-dialog>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { subscriptionApi } from '@/api/subscription'
import InfiniteScrollLoader from '@/components/InfiniteScrollLoader.vue'
import { images } from '@/assets'
import { copyToClipboard } from '@/utils/clipboard'

interface Props {
  modelValue: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const userStore = useUserStore()
const userInfo = userStore.userInfo

const visible = computed({
  get: () => props.modelValue,
  set: (val: boolean) => emit('update:modelValue', val),
})

const activeTab = ref<'subscription' | 'records'>('subscription')

const subscriptions = ref<any>({})
const loadingSubscription = ref(false)
const records = ref<any[]>([
  {
    id: '1',
    title: '灵衍AI会员购买',
    payAmount: 100,
    payTime: '2026-03-23 10:00:00',
    orderNo: '1234567890',
    paymentTypeName: '支付宝',
    orderType: 0,
  },
])
const loadingRecords = ref(false)
const loadingMoreRecords = ref(false)
const hasMoreRecords = ref(true)
const scrollbarRef = ref<any>(null)

// vue-tsc 不会把 template 里的 ref 当作“被读取”，这里在脚本侧补一次使用
const resetScroll = () => {
  const wrapEl: HTMLElement | undefined = scrollbarRef.value?.wrapRef
  wrapEl?.scrollTo?.({ top: 0 })
}

// el-scrollbar 触底加载更多（购买记录 tab）
const handleBodyScroll = ({ scrollTop }: { scrollTop: number }) => {
  if (activeTab.value !== 'records') return
  const wrapEl: HTMLElement | undefined = scrollbarRef.value?.wrapRef
  if (!wrapEl) return
  if (loadingRecords.value || loadingMoreRecords.value || !hasMoreRecords.value) return

  const distance = 100
  const reachBottom = wrapEl.scrollHeight - (scrollTop + wrapEl.clientHeight) <= distance
  if (reachBottom) loadMoreRecords()
}

// 分页参数
const pageParams = ref({
  current: 1,
  size: 20,
  total: 0,
})

const hasActiveSubscription = computed(() => {
  return (
    subscriptions.value?.vipType != null &&
    subscriptions.value?.vipLevel != null &&
    subscriptions.value?.expirationDate != null &&
    Object.keys(subscriptions.value || {}).length > 0
  )
})

const membershipTypeText = computed(() => {
  const vipType = Number(subscriptions.value?.vipType ?? 0) // 0 普通用户；1 月度；2 季度；3 年度
  const vipLevel = Number(subscriptions.value?.vipLevel ?? 0) // 0 普通用户；1 基础；2 标准；3 高级

  if (vipType === 0 && vipLevel === 0) return '免费版'

  const levelMap: Record<number, string> = {
    1: '基础版',
    2: '标准版',
    3: '高级版',
  }
  const periodMap: Record<number, string> = {
    1: '月度会员',
    2: '季度会员',
    3: '年度会员',
  }

  const levelText = levelMap[vipLevel] || ''
  const periodText = periodMap[vipType] || ''
  return levelText && periodText ? `${levelText}-${periodText}` : '会员订阅'
})

const loaderState = computed(() => {
  if (activeTab.value === 'subscription') {
    return {
      loading: loadingSubscription.value,
      hasMore: false,
      dataLength: hasActiveSubscription.value ? 1 : 0,
      emptyText: '暂无订阅',
    }
  }
  return {
    loading: loadingRecords.value || loadingMoreRecords.value,
    hasMore: hasMoreRecords.value,
    dataLength: records.value.length,
    emptyText: '暂无购买记录',
  }
})

const loaderLoading = computed(() => loaderState.value.loading)
const loaderHasMore = computed(() => loaderState.value.hasMore)
const loaderDataLength = computed(() => loaderState.value.dataLength)
const loaderEmptyText = computed(() => loaderState.value.emptyText)

// 获取订单类型名称
const getOrderTypeName = (orderType: number | string | undefined) => {
  const orderTypeMap: Record<string, string> = {
    '0': '灵衍AI会员购买',
    '1': '灵衍AI灵衍值充值',
  }
  return orderTypeMap[String(orderType)] || ''
}

const normalizeRecord = (item: any, index: number) => {
  const orderType = Number(item?.orderType)
  return {
    id: String(item?.id ?? item?.orderId ?? item?.orderNo ?? `${pageParams.value.current}_${index}`),
    title: String(item?.remark || getOrderTypeName(orderType) || '灵衍AI会员购买'),
    payAmount: Number(item?.payAmount ?? item?.amount ?? 0),
    payTime: String(item?.payTime || '--'),
    orderNo: String(item?.orderNo || '--'),
    paymentTypeName: String(item?.paymentTypeName || '--'),
    orderType,
  }
}

const loadRecords = async (isRefresh = false) => {
  if (!userInfo?.userId) return

  if (isRefresh) {
    loadingRecords.value = true
    pageParams.value.current = 1
    records.value = []
    hasMoreRecords.value = true
  } else {
    if (loadingMoreRecords.value || !hasMoreRecords.value) return
    loadingMoreRecords.value = true
  }

  try {
    const res = await subscriptionApi.getSubscriptionRecords({
      userId: userInfo.userId,
      current: pageParams.value.current,
      size: pageParams.value.size,
    })
    if (res.code === '0000' && res.data) {
      const data: any = res.data
      let { vipSubscribeVO, orderVoPage } = data

      // 只在首次加载或刷新时更新订阅信息
      if (isRefresh) {
        subscriptions.value = vipSubscribeVO || {}
      }

      const rawRecords = orderVoPage.records || []
      const newRecords = rawRecords.map((item: any, index: number) => normalizeRecord(item, index))
      const total = orderVoPage.total || 0

      if (isRefresh) {
        records.value = newRecords
      } else {
        records.value.push(...newRecords)
      }

      pageParams.value.total = total

      // 判断是否还有更多数据
      hasMoreRecords.value = records.value.length < total
    }
  } finally {
    loadingRecords.value = false
    loadingMoreRecords.value = false
  }
}

// 加载更多购买记录
const loadMoreRecords = async () => {
  if (loadingMoreRecords.value || !hasMoreRecords.value) return

  pageParams.value.current++
  await loadRecords(false)
}

const handleClose = () => {
  visible.value = false
}

const handleCopy = async (text: string | undefined) => {
  if (!text) {
    ElMessage.warning('订单编号为空')
    return
  }
  const success = await copyToClipboard(text)
  if (success) {
    ElMessage.success('复制成功')
  } else {
    ElMessage.error('复制失败，请手动复制')
  }
}

watch(
  () => visible.value,
  (val) => {
    if (val) {
      resetScroll()
      activeTab.value = 'subscription'
      loadRecords(true)
    }
  }
)

// 监听标签切换，切换到购买记录时重新加载
watch(
  () => activeTab.value,
  (val) => {
    if (val === 'records' && records.value.length === 0) {
      loadRecords(true)
    }
  }
)
</script>

<style lang="scss" scoped>
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 29px 35px;

  .title {
    font-size: $font-size-xl;
    font-weight: $font-weight-bold;
    color: $color-text-white;
    font-family: NotoSans-bold;
  }

  .close-icon {
    cursor: pointer;
    width: 24px;
    height: 24px;
  }
}

.tabs {
  padding: 0 35px;

  :deep(.el-tabs__item) {
    height: 52px;
    line-height: 52px;
    color: $color-text-seven;
    font-size: $font-size-md;

    &.is-active {
      color: $color-text-white;
      font-family: NotoSans-bold;
    }
  }

  &:deep(.el-tabs__nav-wrap::after) {
    background: $color-bg-dark-clear;
  }
}

.modal-body {
  padding: 0 35px;
  height: 497px;
  overflow-y: auto;
  overflow-x: hidden;
}

.subscription-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 16px;
}

.subscription-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: $spacing-md;
  border-radius: $border-radius-md;
  background-color: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(63, 62, 62, 0.5);
  font-size: $font-size-md;
  color: $color-text-white;
  font-family: NotoSans-regular;

  .info {
    display: flex;
    align-items: center;
    gap: 4px;

    .icon {
      width: 24px;
      height: 24px;
    }
  }

  .desc {
    text-align: right;

    .label {
      font-size: 12px;
      color: $color-text-placeholder;
    }
  }
}

.record-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.record-item {
  padding: $spacing-md;
  border-radius: 12px 12px 12px 12px;
  background-color: rgba(30, 30, 30, 1);

  .record-header {
    margin-bottom: 18px;
    font-weight: bold;
    color: #f5e6c8;
    font-size: $font-size-base;
  }

  .record-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: $font-size-md;
    color: $color-text-white;
    margin-bottom: 11px;

    .order-no {
      display: flex;
      align-items: center;
      gap: 5px;

      img {
        width: 17px;
        height: 17px;
        cursor: pointer;
      }
    }
  }
}
</style>
