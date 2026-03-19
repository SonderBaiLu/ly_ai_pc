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
        <div v-if="hasActiveSubscription" class="subscription-list">
          <div class="subscription-item">
            <div class="info">
              <img :src="images.subscription" alt="订阅" class="icon" />
              <div class="name">{{ effectUnitText }}</div>
            </div>
            <div class="desc">
              <div class="label">有效期至</div>
              <div class="value">{{ subscriptions.expirationDate || '--' }}</div>
            </div>
          </div>
        </div>

        <InfiniteScrollLoader :loading="loadingSubscription" :has-more="false"
          :data-length="hasActiveSubscription ? 1 : 0" :show-empty-state="!hasActiveSubscription" empty-text="暂无订阅" />
      </div>

      <!-- 购买记录 -->
      <div v-else class="tab-panel">
        <div v-if="!loadingRecords && records.length > 0" class="record-list">
          <div v-for="item in records" :key="item.id || item.orderId" class="record-item">
            <div class="record-header">
              <!-- {{ getOrderTypeName(item.orderType) || '潮推手会员购买' }} -->
              {{ item.remark || getOrderTypeName(item.orderType) || '潮推手会员购买' }}
            </div>
            <div class="record-row">
              <span class="label">价格</span>
              <span class="value">¥{{ (item.payAmount || item.amount || 0).toFixed?.(2) }}</span>
            </div>
            <div class="record-row">
              <span class="label">购买时间</span>
              <span class="value">{{ item.payTime || '--' }}</span>
            </div>
            <div class="record-row">
              <span class="label">订单编号</span>
              <div class="order-no">
                <span class="value">
                  {{ item.orderNo || '--' }}
                </span>
                <img :src="images.copy" alt="复制" class="copy-icon" @click="handleCopy(item.orderNo)" />
              </div>
            </div>
            <div class="record-row">
              <span class="label">支付方式</span>
              <span class="value">
                {{ item.paymentTypeName || '--' }}
              </span>
            </div>
          </div>
        </div>

        <InfiniteScrollLoader :loading="loadingRecords" :loading-more="loadingMoreRecords" :has-more="hasMoreRecords"
          :data-length="records.length" :show-empty-state="true" empty-text="暂无购买记录" />
      </div>
    </el-scrollbar>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
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
const records = ref<any[]>([])
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
    subscriptions.value?.effectUnit !== null &&
    subscriptions.value?.expirationDate !== null &&
    Object.keys(subscriptions.value || {}).length > 0
  )
})

const effectUnitText = computed(() => {
  const unit = subscriptions.value?.effectUnit
  const map: Record<string, string> = {
    '-1': '永久',
    '0': '月度会员',
    '1': '季度会员',
    '2': '年度会员',
  }
  return map[String(unit)] || '会员订阅'
})

// 获取订单类型名称
const getOrderTypeName = (orderType: number | string | undefined) => {
  const orderTypeMap: Record<string, string> = {
    '0': '潮推手会员购买',
    '1': '潮推手潮币充值',
  }
  return orderTypeMap[String(orderType)] || ''
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

      const newRecords = orderVoPage.records || []
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

  .title {
    font-size: var(--font-xxl);
    font-weight: 700;
    color: var(--text-primary);
  }

  .close-icon {
    position: relative;
    cursor: pointer;
    width: 24px;
    height: 24px;
  }
}

.tabs {
  margin-top: 15px;

  // 选中下划线与主题色保持一致
  :deep(.el-tabs__active-bar) {
    font-size: var(--font-xxl) !important;
    background-color: var(--primary-color) !important;
  }
}

.modal-body {
  height: 498px;
  overflow-y: auto;
  overflow-x: hidden;
}

.subscription-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.subscription-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-md);
  border-radius: var(--radius-sm);
  background: var(--bg-first);
  border: 1px solid rgba(63, 62, 62, 0.5);
  font-size: var(--font-md);
  color: var(--text-primary);

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
      color: var(--text-six);
    }
  }
}

.record-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.record-item {
  padding: var(--spacing-md);
  border-radius: 12px 12px 12px 12px;
  background-color: rgba(30, 30, 30, 1);

  .record-header {
    margin-bottom: 18px;
    font-weight: bold;
    color: #f5e6c8;
    font-size: var(--font-lg);
  }

  .record-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: var(--font-md);
    color: var(--text-primary);
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

<style lang="scss">
// 订阅管理弹窗整体样式
.el-dialog.subscription-manage-modal {
  border-radius: 16px !important;
  overflow: hidden;
  background: var(--bg-first) !important;
  border: 1px solid rgba(255, 255, 255, 0.04);

  .el-dialog__header {
    background: var(--bg-first) !important;
    padding: 0 29px !important;
    border-radius: 25px 25px 0 0 !important;
  }

  .el-dialog__body {
    padding: 0 29px !important;
    background: var(--bg-first) !important;
  }
}
</style>
