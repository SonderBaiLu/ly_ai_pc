<template>
  <div class="agreement" :style="{ backgroundImage: `url(${images.homeBg})` }">
    <Header />

    <main class="agreement-main">
      <h1 class="page-title">平台协议</h1>

      <el-tabs v-model="activeType" class="agreement-tabs">
        <el-tab-pane v-for="tab in tabs" :key="tab.type" :label="tab.label" :name="tab.type" />
      </el-tabs>

      <section class="agreement-card">
        <!-- 这里先做占位：后续接接口/富文本内容时替换 -->
        <div class="agreement-placeholder">
          <div class="placeholder-title">{{ currentTabLabel }}</div>
          <div class="placeholder-desc">
            {{ activeType }} 协议内容待接入（可后续替换为富文本/markdown/iframe）。
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { images } from '@/assets'

type AgreementType =
  | 'USER_AGREEMENT'
  | 'ANDROID_PRIVACY_POLICY'
  | 'PAY_SERVICE_AGREEMENT'
  | 'COIN_RULES_DESCRIPTION'
  | string

const route = useRoute()
const router = useRouter()

const tabs = [
  { type: 'USER_AGREEMENT', label: '用户协议' },
  { type: 'PAY_SERVICE_AGREEMENT', label: '付费服务协议' },
  { type: 'ANDROID_PRIVACY_POLICY', label: '隐私政策' },
  { type: 'WRITE_OFF_AGREEMENT', label: '注销协议' },
  { type: 'SOCIAL_PUBLIC_CONVENTION', label: '社会公约' },
  { type: 'RIGHTS_LIST', label: '权限列表' },
  { type: 'COIN_RULES_DESCRIPTION', label: '灵衍值规则' },
]

const activeType = ref<AgreementType>(String(route.query.type || 'USER_AGREEMENT'))

// URL -> UI
watch(
  () => route.query.type,
  (type) => {
    activeType.value = String(type || 'USER_AGREEMENT')
  }
)

// UI -> URL
watch(
  activeType,
  (type) => {
    const nextType = String(type || 'USER_AGREEMENT')
    if (String(route.query.type || 'USER_AGREEMENT') === nextType) return
    router.replace({ path: '/agreement', query: { type: nextType } })
  }
)

const currentTabLabel = computed(() => {
  return tabs.find((t) => t.type === activeType.value)?.label || '协议'
})
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

.agreement-placeholder {
  max-width: 980px;
}

.placeholder-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 10px;
}

.placeholder-desc {
  color: rgba(255, 255, 255, 0.6);
  line-height: 1.7;
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
