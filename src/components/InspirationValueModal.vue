<template>
  <el-dialog v-model="visible" width="1152px" :before-close="handleClose" class="inspiration-modal" :show-close="false">
    <template #header>
      <div class="modal-header">
        <img :src="images.inspirationValue" alt="灵衍值" class="coin-logo" />
        <span class="coin-number">{{ userInfo?.wavePoints || 0 }}</span>
      </div>
    </template>

    <div class="header-title-section">
      <span class="modal-title">灵衍值明细</span>
      图片与视频的生成由于生成数量、模式、时长等参数不同,费用会存在差异。
      <span class="rules-link" @click="showRules">灵衍值规则</span>
    </div>
    <!-- 灵衍值汇总 -->
    <div class="inspiration-summary">
      <div class="summary-bar">
        <div class="summary-item">
          <span class="label">当前灵衍值</span>
          <span class="value">{{ userInfo?.wavePoints || 0 }}</span>
        </div>
        <span class="equals">=</span>
        <div class="summary-item">
          <span class="label">会员灵衍值</span>
          <span class="value">{{ userInfo?.vipPoints || 0 }}</span>
        </div>
        <span class="plus">+</span>
        <div class="summary-item">
          <span class="label">购买灵衍值</span>
          <span class="value">{{ userInfo?.buyPoints || 0 }}</span>
        </div>
        <span class="plus">+</span>
        <div class="summary-item">
          <span class="label">赠送灵衍值</span>
          <span class="value">{{ userInfo?.giftPoints || 0 }}</span>
        </div>
      </div>
    </div>

    <!-- 筛选标签 -->
    <el-tabs v-model="tabIdx" class="filter-tabs" @tab-change="handleTabChange">
      <el-tab-pane v-for="(tab, index) in tabsList" :key="tab.type" :label="tab.name" :name="index" />
    </el-tabs>

    <!-- 交易记录列表 -->
    <div class="transaction-list">
      <div v-if="!loading && transactions.length > 0">
        <div v-for="transaction in transactions" :key="transaction.id" class="transaction-item">
          <div class="transaction-left">
            <img :src="transaction.headImgUrl || userInfo?.headImgUrl || images.avatarDefault" alt=""
              class="transaction-avatar" />
            <div class="transaction-name">
              {{ transaction.userName || transaction.nickname || userInfo?.nickname || userInfo?.userName || '' }}
            </div>
          </div>
          <div class="transaction-info">
            <div class="transaction-type">{{ getCoinRecordTitle(transaction) }}252</div>
            <div class="transaction-time">
              <img :src="images.time" alt="" srcset="" class="time-icon" />
              {{ transaction.createTime || transaction.payTime || '' }}
            </div>
          </div>
          <div class="transaction-amount" :class="{
            positive: Number(transaction.wavePoints ?? transaction.amount ?? 0) > 0,
            negative: Number(transaction.wavePoints ?? transaction.amount ?? 0) < 0,
          }">
            {{
              Number(transaction.wavePoints ?? transaction.amount ?? 0) > 0 ? '+' : ''
            }}{{ Number(transaction.wavePoints ?? transaction.amount ?? 0).toFixed(2) }}
          </div>
        </div>
      </div>

      <!-- 统一加载组件 -->
      <InfiniteScrollLoader :loading="loading" :has-more="false" :data-length="transactions.length"
        :show-empty-state="true" empty-text="暂无记录" :empty-image="images.noRecord" image-size="140px"
        empty-text-color="#474B64" empty-text-font-size="13px" />
    </div>

    <!-- 底部说明 -->
    <div class="modal-footer">
      <img :src="images.warn" alt="" srcset="" />
      订单状态更新可能存在延迟，请以实际为准。
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { membershipApi } from '@/api/membership'
import { useUserStore } from '@/stores/user'
import { images } from '@/assets'
import InfiniteScrollLoader from '@/components/InfiniteScrollLoader.vue'

// Props
interface Props {
  modelValue: boolean
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

// 路由
const router = useRouter()

// 用户信息
const userStore = useUserStore()
const userInfo = computed(() => userStore.userInfo)

// 响应式数据
const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

// 加载状态
const loading = ref(false)

// 状态定义
const tabIdx = ref(0)
const currentTabType = ref('all')

// 处理标签切换
const handleTabChange = (name: string | number) => {
  const index = typeof name === 'number' ? name : Number(name)
  tabIdx.value = index
  currentTabType.value = tabsList.value[index]?.type || 'all'
  // 重置分页并重新加载数据
  pagination.value.current = 1
  loadCoinRecords()
}

const tabsList = ref([
  {
    name: '全部',
    type: 'all',
  },
  {
    name: '消耗',
    type: 'CONSUME',
  },
  {
    name: '购买',
    type: 'PURCHASE',
  },
  {
    name: '获得',
    type: 'EARN',
  },
])

const getCoinRecordTitle = (item: any) => {
  // 优先后端 remark
  if (item?.remark) return String(item.remark)

  // 再根据 orderType（如后端返回）
  const orderType = item?.orderType
  const orderTypeNum = orderType != null && orderType !== '' ? Number(orderType) : NaN
  const orderTypeMap: Record<number, string> = {
    0: '灵衍值消费',
    1: '灵衍值购买',
    2: '灵衍值获得',
  }
  if (!Number.isNaN(orderTypeNum) && orderTypeMap[orderTypeNum]) return orderTypeMap[orderTypeNum]

  // 最后兜底：按当前 tab 显示标题
  const tabMap: Record<string, string> = {
    CONSUME: '灵衍值消费',
    PURCHASE: '灵衍值购买',
    EARN: '灵衍值获得',
  }
  return tabMap[currentTabType.value] || ''
}

// 交易记录数据（直接使用接口返回的数据）
const transactions = ref<any[]>([{
  id: 1,
  headImgUrl: 'https://img.yzcdn.cn/vant/ipad.png',
  userName: '张三',
  nickname: '张三',
  createTime: '2026-03-23 10:00:00',
  payTime: '2026-03-23 10:00:00',
  wavePoints: -106,
}, {
  id: 2,
  headImgUrl: 'https://img.yzcdn.cn/vant/ipad.png',
  userName: '李四',
  nickname: '李四',
  createTime: '2026-03-23 10:00:00',
  payTime: '2026-03-23 10:00:00',
  wavePoints: 50,
}])


// 分页信息
const pagination = ref({
  current: 1,
  size: 20,
  total: 0,
})

// 加载灵衍值记录
const loadCoinRecords = async () => {
  if (!userStore.isLoggedIn) return

  try {
    loading.value = true
    // 构建请求参数
    const params: any = {
      // 后端分页字段：
      // - currentPage: 当前页码
      // - offset: 每页数量
      currentPage: pagination.value.current,
      offset: pagination.value.size,
    }

    // 根据选中的tab添加类型过滤
    if (currentTabType.value !== 'all') {
      params.type = currentTabType.value
    }

    const response = await membershipApi.getCoinRecordList(params)
    if (response.code === '0000' && response.data) {
      // 直接使用接口返回的数据
      const data: any = response.data
      transactions.value = data.records || []
      pagination.value.total = data.total || 0
    }
  } catch (error) {
    console.error('加载灵衍值记录失败:', error)
    ElMessage.error('加载灵衍值记录失败')
  } finally {
    loading.value = false
  }
}

// 方法
const handleClose = () => {
  visible.value = false
}

// 跳转到协议页面
const navigateToAgreement = (agreementType: string) => {
  router.push({
    path: '/agreement',
    query: { type: agreementType },
  })
  // 关闭弹窗
  visible.value = false
}

const showRules = () => {
  // 跳转到灵衍值规则说明
  navigateToAgreement('COIN_RULES_DESCRIPTION')
}

// 监听弹窗打开状态，加载数据
watch(visible, (newValue) => {
  if (newValue) {
    // 初始化当前标签类型
    currentTabType.value = tabsList.value[tabIdx.value]?.type || 'all'
    // 重置分页
    pagination.value.current = 1
    loadCoinRecords()
  }
})
</script>

<style lang="scss" scoped>
// 弹窗头部
.modal-header {
  width: 100%;
  height: 133px;
  padding: 15px 17px;
  background: $color-bg-black url('@/assets/images/logo_hui.png') no-repeat right 18px top 36px;
  background-size: 132px 97px;
  border-radius: 12px 12px 0 0;

  .coin-logo {
    width: 50px;
    height: 50px;
    object-fit: contain;
    margin-bottom: 26px;
  }

  .coin-number {
    margin-left: 18px;
    font-weight: 800;
    color: $color-primary-dark;
    font-size: 48px;
  }
}

// 灵衍值明细
.header-title-section {
  padding: 23px 11px 14px;
  border-radius: 0px 0px 12px 12px;
  background: linear-gradient(135deg, rgba(9, 17, 37, 1) 14.6%, rgba(13, 18, 31, 1) 50%, rgba(22, 29, 49, 1) 85.4%);
  font-size: 13px;
  font-family: NotoSans-regular;
  color: $color-text-gray;

  .modal-title {
    margin-right: 20px;
    font-size: $font-size-2xl;
    font-weight: 700;
    color: $color-text-white;
    font-family: NotoSans-bold;
  }

  .rules-link {
    color: $color-primary-dark;
    cursor: pointer;
  }
}

// 灵衍值汇总
.inspiration-summary {
  margin: 16px 0 23px;

  .summary-bar {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: $spacing-2xl;
    padding: 28px 13px;
    border-radius: $border-radius-2xl;
    background-color: rgba(24, 24, 27, 0.2);
    font-size: $font-size-md;
    text-align: center;
    font-family: -regular;
    border: 1px solid rgba(39, 39, 42, 1);

    .summary-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 3px;
    }

    .label {
      color: #71717a;
      font-size: 15px;
    }

    .value {
      color: rgba(212, 212, 216, 1);
      font-size: $font-size-2xl;
      font-weight: bold;
    }

    .equals {
      margin: 0 $spacing-md;
    }

    .equals,
    .plus {
      color: rgba(63, 63, 70, 1);
      font-size: 30px;
    }

    .plus {
      font-size: 20px;
    }
  }
}

// 筛选标签
.filter-tabs {

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

// 交易记录列表
.transaction-list {
  max-height: 400px;
  overflow-y: auto;

  .transaction-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 26px 24px;
    border-radius: 16px 16px 16px 16px;
    background-color: rgba(24, 24, 27, 0.2);
    border: 1px solid rgba(39, 39, 42, 0.2);
    color: $color-text-desc-secondary;
    font-size: $font-size-md;
    font-family: NotoSans-regular;

    .transaction-left {
      display: flex;
      align-items: center;

      .transaction-avatar {
        width: 54px;
        height: 54px;
        margin-right: 9px;
        border-radius: 50%;
        object-fit: cover;
      }

      .transaction-name {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }

    .transaction-info {
      flex: 1;
      padding-left: 120px;

      .transaction-type {
        color: $color-text-white;
        font-size: $font-size-lg;
        font-weight: bold;
        font-family: NotoSans-bold;
        margin-bottom: $spacing-sm;
      }

      .transaction-time {
        display: flex;
        align-items: center;
        gap: 4px;

        .time-icon {
          width: 14px;
          height: 14px;
        }
      }
    }

    .transaction-amount {
      font-size: $font-size-2xl;
      font-weight: bold;
      text-align: right;
      font-family: NotoSans-bold;

      &.positive {
        color: $color-primary-dark;
      }

      &.negative {
        color: $color-color-red;
      }
    }
  }
}

// 底部
.modal-footer {
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 12px 0 14px;
  color: $color-text-placeholder;
  font-size: 12px;

  img {
    width: 13px;
    height: 13px;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .inspiration-modal {
    :deep(.el-dialog) {
      width: 95%;
      margin: 0 auto;
    }
  }

  .inspiration-summary {
    .summary-bar {
      flex-direction: column;
      gap: 4px;
      text-align: center;
    }
  }

  .filter-tabs {
    flex-wrap: wrap;
    justify-content: center;
  }

  .modal-footer {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
}
</style>

<style lang="scss">
// 全局样式，确保覆盖 Element Plus 的默认样式
.el-dialog.inspiration-modal {
  border-radius: 25px !important;
  border: none !important;

  .el-dialog__header {
    padding: 21px 25px 0 !important;
  }

  .el-dialog__body {
    padding: 0 25px !important;
  }
}
</style>
