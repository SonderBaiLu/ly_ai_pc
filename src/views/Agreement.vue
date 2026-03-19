<template>
  <div class="agreement" :style="{ backgroundImage: `url(${images.homeBg})` }">
    <Header />

    <main class="agreement-main container">
      <h1 class="page-title">平台协议</h1>

      <div class="tab-row">
        <button v-for="tab in tabs" :key="tab.type" class="tab-item" type="button"
          :class="{ active: activeType === tab.type }" @click="setType(tab.type)">
          {{ tab.label }}
        </button>
      </div>

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
import { computed } from 'vue'
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

const activeType = computed<AgreementType>(() => String(route.query.type || 'USER_AGREEMENT'))

const currentTabLabel = computed(() => {
  return tabs.find((t) => t.type === activeType.value)?.label || '协议'
})

const setType = (type: string) => {
  router.replace({ path: '/agreement', query: { type } })
}
</script>

<style scoped lang="scss">
.agreement {
  min-height: 100vh;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.agreement-main {
  padding-top: 84px;
  padding-bottom: 80px;
  color: $color-text-white;
}

.page-title {
  font-size: 30px;
  font-weight: 700;
  margin: 0 0 18px;
}

.tab-row {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
  margin-bottom: 18px;
}

.tab-item {
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.55);
  padding: 10px 2px;
  cursor: pointer;
  position: relative;
  font-size: 14px;
}

.tab-item.active {
  color: $color-primary;
}

.tab-item.active::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: -6px;
  height: 2px;
  background: $color-primary;
  border-radius: 2px;
}

.agreement-card {
  border-radius: 16px;
  padding: 28px;
  min-height: 420px;
  background: rgba(0, 0, 0, 0.35);
  border: 1px solid rgba(255, 255, 255, 0.06);
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.35);
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
</style>
