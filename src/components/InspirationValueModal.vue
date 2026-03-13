<template>
  <el-dialog
    v-model="visible"
    width="1152px"
    :before-close="handleClose"
    class="inspiration-modal"
    :show-close="false"
    style="background: var(--bg-secondary) !important"
  >
    <template #header>
      <div class="modal-header">
        <img :src="images.logo" alt="潮币" class="coin-logo" />
        <span class="coin-number">{{ userInfo?.wavePoints || 0 }}</span>
      </div>
    </template>

    <div class="header-title-section">
      <h3 class="modal-title">潮币值明细</h3>
      <div class="header-desc">
        <span class="desc-text">
          图片与视频的生成由于生成数量、模式、时长等参数不同,费用会存在差异。
        </span>
        <span class="rules-link" @click="showRules">潮币值规则</span>
      </div>
    </div>
    <!-- 潮币汇总 -->
    <div class="inspiration-summary">
      <div class="summary-bar">
        <div class="summary-item">
          <span class="label">当前潮币</span>
          <span class="value">{{ userInfo?.wavePoints || 0 }}</span>
        </div>
        <span class="equals">=</span>
        <div class="summary-item">
          <span class="label">会员潮币</span>
          <span class="value">{{ userInfo?.vipPoints || 0 }}</span>
        </div>
        <span class="plus">+</span>
        <div class="summary-item">
          <span class="label">购买潮币</span>
          <span class="value">{{ userInfo?.buyPoints || 0 }}</span>
        </div>
        <span class="plus">+</span>
        <div class="summary-item">
          <span class="label">赠送潮币</span>
          <span class="value">{{ userInfo?.giftPoints || 0 }}</span>
        </div>
      </div>
    </div>

    <!-- 筛选标签 -->
    <el-tabs v-model="tabIdx" class="filter-tabs" @tab-change="handleTabChange">
      <el-tab-pane
        v-for="(tab, index) in tabsList"
        :key="tab.type"
        :label="tab.name"
        :name="index"
      />
    </el-tabs>

    <!-- 交易记录列表 -->
    <div class="transaction-list">
      <div v-if="!loading && transactions.length > 0">
        <div v-for="transaction in transactions" :key="transaction.id" class="transaction-item">
          <div class="transaction-info">
            <div class="transaction-type">{{ transaction.remark || '' }}</div>
            <div class="transaction-time">
              <img :src="images.time" alt="" srcset="" class="time-icon" />
              {{ transaction.createTime || '' }}
            </div>
          </div>
          <div
            class="transaction-amount"
            :class="{
              positive: (transaction.wavePoints || 0) > 0,
              negative: (transaction.wavePoints || 0) < 0,
            }"
          >
            {{ (transaction.wavePoints || 0) > 0 ? '+' : ''
            }}{{ Number(transaction.wavePoints || 0).toFixed(2) }}
          </div>
        </div>
      </div>

      <!-- 统一加载组件 -->
      <InfiniteScrollLoader
        :loading="loading"
        :has-more="false"
        :data-length="transactions.length"
        :show-empty-state="true"
        empty-text="暂无记录"
      />
    </div>

    <!-- 底部说明 -->
    <div class="modal-footer">
      <img :src="images.warn" alt="" srcset="" />
      订单状态更新可能存在延迟，请以实际为准。
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
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
const userInfo = userStore.userInfo

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
    type: 'consume',
  },
  {
    name: '购买',
    type: 'purchase',
  },
  {
    name: '获得',
    type: 'earn',
  },
])

// 交易记录数据（直接使用接口返回的数据）
const transactions = ref<any[]>([])

// 分页信息
const pagination = ref({
  current: 1,
  size: 20,
  total: 0,
})

// 加载潮币记录
const loadCoinRecords = async () => {
  if (!userInfo?.userId) return

  try {
    loading.value = true
    // 构建请求参数
    const params: any = {
      userId: userInfo?.userId || '',
      size: pagination.value.size,
      current: pagination.value.current,
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
    console.error('加载潮币记录失败:', error)
    ElMessage.error('加载潮币记录失败')
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
  // 跳转到潮币值规则说明
  navigateToAgreement('COIN_RULES_DESCRIPTION')
}

// 监听弹窗打开状态，加载数据
watch(visible, (newValue) => {
  if (newValue && userInfo?.userId) {
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
  background: var(--bg-card) url('@/assets/images/coin_logo.png') no-repeat right -13px top 19px;
  background-size: 160px 160px;
  border-radius: 12px 12px 5px 5px;

  .coin-logo {
    width: 50px;
    height: 50px;
    object-fit: contain;
    margin-bottom: 20px;
  }

  .coin-number {
    font-weight: 800;
    color: rgba(214, 175, 233, 1);
    font-size: 48px;
  }
}
// 潮币值明细
.header-title-section {
  display: flex;
  gap: 20px;
  padding: 23px 11px 14px;

  .modal-title {
    line-height: 1.2;
    font-size: var(--font-xxxl);
    font-weight: 700;
    color: var(--text-primary);
  }

  .header-desc {
    display: flex;
    align-items: flex-end;
    line-height: 1.5;
    font-size: 13px;
    color: var(--text-hui);
    .rules-link {
      color: var(--primary-color);
      cursor: pointer;
    }
  }
}
// 潮币汇总
.inspiration-summary {
  margin: 20px 0 32px;

  .summary-bar {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: var(--spacing-xxl);
    padding: 28px 13px;
    border-radius: var(--radius-3xl);
    background-color: rgba(24, 24, 27, 0.2);
    color: rgba(16, 16, 16, 1);
    font-size: var(--font-md);
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
      font-size: var(--font-xxxl);
      font-weight: bold;
    }
    .equals {
      margin: 0 var(--spacing-md);
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
  padding: 0;

  :deep(.el-tabs__active-bar) {
    font-size: var(--font-md) !important;
    background-color: var(--primary-color) !important;
  }
}

// 交易记录列表
.transaction-list {
  max-height: 400px;
  overflow-y: auto;

  .transaction-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 26px 20px;

    .transaction-info {
      flex: 1;

      .transaction-type {
        color: var(--text-primary);
        font-size: 14px;
        font-weight: 500;
        margin-bottom: 6px;
      }

      .transaction-time {
        display: flex;
        align-items: center;
        gap: 4px;
        color: rgba(161, 161, 170, 1);
        font-size: var(--font-md);

        .time-icon {
          width: 14px;
          height: 14px;
        }
      }
    }

    .transaction-amount {
      font-size: 16px;
      font-weight: 600;
      min-width: 80px;
      text-align: right;

      &.positive {
        color: var(--primary-color);
      }

      &.negative {
        color: #ef4444;
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
  color: var(--text-placeholder);
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
  .el-dialog__header {
    background: var(--bg-secondary) !important;
    padding: 20px 25px 0 !important;
    border-radius: 25px 25px 0 0 !important;
    margin: 0 !important;
  }

  .el-dialog__body {
    padding: 0 25px !important;
  }
}
</style>
