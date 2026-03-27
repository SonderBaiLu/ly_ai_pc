<template>
  <div class="agreement" :style="{ backgroundImage: `url(${images.homeBg})` }">
    <Header />

    <main class="agreement-main">
      <h1 class="page-title">平台协议</h1>

      <el-tabs v-model="activeType" class="agreement-tabs">
        <el-tab-pane v-for="tab in tabs.slice(0, tabs.length - 1)" :key="tab.type" :label="tab.label" :name="tab.type" />
      </el-tabs>

      <section class="agreement-card">
        <div class="agreement-body" v-loading="loading">
          <div v-if="agreement?.content" class="agreement-content" v-html="agreement.content" />
          <div v-else class="state-text">暂无内容</div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { images } from '@/assets'
import { AGREEMENT_TABS, DEFAULT_AGREEMENT_TYPE, type AgreementType } from '@/constants/agreement'
import { appApi, type AppAgreementContent } from '@/api/app'

const route = useRoute()
const router = useRouter()

const tabs = AGREEMENT_TABS

const activeType = ref<AgreementType>(String(route.query.type || DEFAULT_AGREEMENT_TYPE))
const loading = ref(false)
const agreement = ref<AppAgreementContent | null>(null)

// URL -> UI
watch(
  () => route.query.type,
  (type) => {
    activeType.value = String(type || DEFAULT_AGREEMENT_TYPE)
  }
)

// UI -> URL
watch(
  activeType,
  (type) => {
    const nextType = String(type || DEFAULT_AGREEMENT_TYPE)
    if (String(route.query.type || DEFAULT_AGREEMENT_TYPE) === nextType) return
    router.replace({ path: '/agreement', query: { type: nextType } })
  }
)

const fetchAgreement = async (type: AgreementType) => {
  loading.value = true
  try {
    const res = await appApi.getContent({ code: type })
    agreement.value = res.data || null
  } catch (e: any) {
    agreement.value = null
    ElMessage.error(e?.message || '加载失败')
  } finally {
    loading.value = false
  }
}

watch(
  () => activeType.value,
  (type) => {
    fetchAgreement(type)
  },
  { immediate: true }
)

// 协议页已精简为仅展示正文，这里不需要额外的 label 计算
</script>

<style scoped lang="scss">
.agreement {
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.agreement-main {
  display: flex;
  flex-direction: column;
  width: 100%;
  min-height: calc(100vh - 110px);
  padding: 34px;
  color: $color-text-white;
}

.page-title {
  margin-bottom: 18px;
  font-weight: 700;
  font-size: 30px;
  font-family: AlibabaPuHui-regular;
}

.agreement-tabs {
  margin-bottom: 18px;

  :deep(.el-tabs__item) {
    color: #686D70;
    font-size: $font-size-md;
    height: 44px;
    line-height: 44px;
  }

  :deep(.el-tabs__item:hover) {
    color: #686D70;
  }

  :deep(.el-tabs__item.is-active) {
    color: $color-primary-dark;
    font-weight: 600;
  }

  :deep(.el-tabs__active-bar) {
    background: $color-primary-dark;
    height: 2px;
  }

  :deep(.el-tabs__nav-wrap::after) {
    background-color: rgba(255, 255, 255, 0.06);
  }
}

.agreement-card {
  width: 100%;
  flex: 1;
  border-radius: 16px;
  background-color: rgba(18, 18, 18, 1);
  border: 1px solid rgba(255, 255, 255, 0.15);
}

.agreement-body {
  height: 100%;
  padding: 22px;
  overflow: auto;
}

.agreement-content {
  color: rgba(255, 255, 255, 0.85);
}

.agreement-content :deep(p) {
  margin: 0 0 12px;
}

.agreement-content :deep(h1),
.agreement-content :deep(h2),
.agreement-content :deep(h3) {
  margin: 18px 0 10px;
  color: rgba(255, 255, 255, 0.92);
}

.state-text {
  padding: 18px 0;
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
}

@media (max-width: 1024px) {
  .agreement-main {
    padding-left: 20px;
    padding-right: 20px;
  }
}

@media (max-width: 640px) {
  .agreement-main {
    padding-left: 12px;
    padding-right: 12px;
  }
}
</style>
