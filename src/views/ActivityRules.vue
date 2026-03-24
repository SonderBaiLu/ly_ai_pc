<template>
  <div class="activity-rules-page">
    <Header />

    <main class="rules-main">
      <h1 class="rules-title">活动规则</h1>

      <el-tabs v-model="activeTab" class="rules-tabs">
        <el-tab-pane label="邀请好友" name="INVITE_GIFT" />
      </el-tabs>

      <section class="rules-card">
        <div class="rules-body" v-loading="loading">
          <div v-if="rulesContent" class="rules-content" v-html="rulesContent" />
          <div v-else class="state-text">暂无内容</div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { AGREEMENT_TYPES } from '@/constants/agreement'
import { appApi } from '@/api/app'

const activeTab = ref<'INVITE_GIFT'>('INVITE_GIFT')
const loading = ref(false)
const rulesContent = ref('')

const fetchInvitationRules = async () => {
  loading.value = true
  try {
    const res = await appApi.getContent({ code: AGREEMENT_TYPES.INVITATION_ACTIVITY_RULES })
    rulesContent.value = String(res?.data?.content || '')
  } catch (error: any) {
    rulesContent.value = ''
    ElMessage.error(error?.message || '加载失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchInvitationRules()
})

</script>

<style scoped lang="scss">
.activity-rules-page {
  min-height: 100vh;
  background-color: $color-bg-dark;
  background-image: url('@/assets/images/home_bg.png');
  background-size: cover;
  background-position: center top;
  position: relative;
  color: $color-text-white;
}

.rules-main {
  width: 100%;
  min-height: calc(100vh - 67px);
  padding: 44px 33px 0;
  color: $color-text-white;
}

.rules-title {
  margin-bottom: 18px;
  font-weight: 700;
  font-size: 30px;
  font-family: AlibabaPuHui-regular;
}

.rules-tabs {
  margin-bottom: 18px;

  :deep(.el-tabs__item) {
    font-size: $font-size-md !important;
  }

  :deep(.el-tabs__nav-wrap::after) {
    display: none !important;
  }
}

.rules-card {
  width: 100%;
  flex: 1;
  border-radius: 16px;
  background-color: rgba(18, 18, 18, 1);
  border: 1px solid rgba(255, 255, 255, 0.15);
}

.rules-body {
  height: 100%;
  overflow: auto;
  padding: 22px;
}

.rules-content {
  color: rgba(255, 255, 255, 0.85);
}

.rules-content :deep(p) {
  margin: 0 0 12px;
}

.rules-content :deep(h1),
.rules-content :deep(h2),
.rules-content :deep(h3) {
  margin: 18px 0 10px;
  color: rgba(255, 255, 255, 0.92);
}

.state-text {
  padding: 18px 0;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
}

@media (max-width: 1024px) {
  .rules-main {
    padding-left: 20px;
    padding-right: 20px;
  }
}

@media (max-width: 640px) {
  .rules-main {
    padding-left: 12px;
    padding-right: 12px;
  }
}
</style>
