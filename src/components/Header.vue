<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'

const { t, locale } = useI18n()
const router = useRouter()
const route = useRoute()

const languageOptions = [
  { label: '简体中文', value: 'zh' },
  { label: 'English', value: 'en' },
]

const handleLanguageChange = (value: string) => {
  locale.value = value as 'zh' | 'en'
}

// 模拟登录状态
const isLoggedIn = ref(false)
const userAvatar = ref('@/assets/images/avatar.png')

const menuItems = [
  { key: 'aiDesign', path: '/ai-design' },
  { key: 'fabricCreative' },
  { key: 'about' },
  { key: 'contactUs' },
  { key: 'followUs' },
]

const isAiDesignPage = computed(() => route.name === 'AiDesign')

const handleMenuClick = (item: { key: string; path?: string }) => {
  if (item.path) {
    router.push(item.path)
    return
  }
  showComingSoon()
}

const showComingSoon = () => {
  ElMessage.info(
    locale.value === 'zh'
      ? '功能暂未开放，敬请期待'
      : 'This feature is not available yet. Stay tuned.'
  )
}
</script>

<template>
  <header :class="['header', { 'header--ai': isAiDesignPage }]">
    <!-- 首页等默认导航 -->
    <div v-if="!isAiDesignPage" class="nav-container">
      <div class="logo">
        <img class="logo-icon" src="@/assets/images/logo.png" alt="Logo" />
      </div>

      <nav class="nav-menu">
        <a v-for="item in menuItems" :key="item.key" href="#" class="nav-item"
          :class="{ active: item.path && item.path === route.path }" @click.prevent="handleMenuClick(item)">
          {{ t(`header.${item.key}`) }}
        </a>
      </nav>

      <div class="nav-right">
        <div class="lang-select-wrapper">
          <img class="globe-icon" src="@/assets/images/language.png" alt="Globe" />
          <el-select v-model="locale" @change="handleLanguageChange" class="lang-select">
            <template #suffix>
              <img src="@/assets/images/down.png" alt="Arrow" class="custom-down" />
            </template>
            <el-option v-for="option in languageOptions" :key="option.value" :label="option.label"
              :value="option.value" />
          </el-select>
        </div>
        <!-- 登录状态显示头像，未登录显示登录/注册按钮 -->
        <div v-if="isLoggedIn" class="user-avatar">
          <img :src="userAvatar" alt="User Avatar" class="avatar-icon" />
        </div>
        <div v-else class="auth-buttons">
          <span class="login-btn" @click="showComingSoon">{{ t('header.login') }}</span>
          <span class="register-btn" @click="showComingSoon">{{ t('header.register') }}</span>
        </div>
      </div>
    </div>

    <!-- AI 服装设计页面导航：登录前/登录后样式与首页不同 -->
    <div v-else class="nav-container nav-container--ai">
      <div class="logo">
        <img class="logo-icon" src="@/assets/images/logo.png" alt="Logo" />
      </div>

      <div class="nav-spacer" />

      <div class="nav-right nav-right--ai">
        <template v-if="isLoggedIn">
          <span class="ai-link">我的创作</span>
          <div class="ai-coin-pill">
            <span class="ai-coin-icon" />
            <span class="ai-coin-value">50</span>
            <button class="ai-coin-recharge" type="button">充值</button>
          </div>
          <span class="ai-icon-circle" />
          <div class="user-avatar">
            <img :src="userAvatar" alt="User Avatar" class="avatar-icon" />
          </div>
          <span class="ai-icon-dot">···</span>
        </template>
        <template v-else>
          <button class="ai-login-btn" type="button" @click="showComingSoon">登录</button>
        </template>
      </div>
    </div>
  </header>
</template>

<style scoped lang="scss">
.header {
  position: sticky;
  top: 0;
  z-index: 100;
  padding: $spacing-md $spacing-xl;
  background-color: $color-bg-dark;
  backdrop-filter: blur(10px);
}

.header--ai {
  border-bottom: 1px solid rgba(150, 221, 255, 0.4);
}

.nav-container {
  display: flex;
  align-items: center;
  justify-content: space-between;

  .logo {
    margin-right: 51px;

    .logo-icon {
      width: 107px;
      height: 43px;
    }
  }
}

.nav-container--ai {
  .nav-spacer {
    flex: 1;
  }
}

.nav-menu {
  display: flex;
  flex: 1;
  gap: $spacing-xl;

  .nav-item {
    color: $color-text-gray;
    text-decoration: none;
    font-size: $font-size-md;
    font-weight: $font-weight-medium;
    transition: color $transition-base;
  }
}

.nav-item:hover,
.nav-item.active {
  color: $color-primary;
}

.nav-right {
  display: flex;
  align-items: center;
  gap: $spacing-md;
  color: $color-text-white;
  font-size: $font-size-md;
  font-weight: $font-weight-medium;
}

.nav-right--ai {
  gap: $spacing-lg;
}

.ai-login-btn {
  padding: $spacing-sm $spacing-xl-sm;
  border-radius: 9999px;
  border: none;
  background-color: $color-bg-white;
  color: $color-bg-dark;
  font-size: $font-size-md;
  font-weight: $font-weight-semibold;
  cursor: pointer;
}

.ai-link {
  cursor: pointer;
  font-size: $font-size-md;
}

.ai-coin-pill {
  display: inline-flex;
  align-items: center;
  gap: $spacing-xs;
  padding: 4px $spacing-md;
  border-radius: 9999px;
  background: rgba(15, 23, 42, 0.9);
  border: 1px solid rgba(150, 221, 255, 0.6);
  font-size: $font-size-sm;
}

.ai-coin-icon {
  width: 16px;
  height: 16px;
  border-radius: 9999px;
  background: linear-gradient(135deg, #17a0e1 0%, #70c5ed 50%, #96ddff 100%);
}

.ai-coin-value {
  color: $color-text-white;
}

.ai-coin-recharge {
  margin-left: $spacing-xs;
  padding: 2px 10px;
  border-radius: 9999px;
  border: none;
  background: rgba(150, 221, 255, 0.1);
  color: $color-primary;
  font-size: $font-size-xs;
  cursor: pointer;
}

.ai-icon-circle {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 1px solid rgba(148, 163, 184, 0.7);
}

.ai-icon-dot {
  font-size: $font-size-lg;
  color: $color-text-white;
  padding: 0 $spacing-xs;
}

.menu-toggle {
  display: none;
  border: none;
  background: transparent;
  color: $color-text-white;
  cursor: pointer;
  padding: $spacing-xs;
  border-radius: 9999px;
  transition: background $transition-base;

  :deep(.el-icon) {
    font-size: 20px;
  }
}

.menu-toggle:hover {
  background: rgba($color-primary, 0.1);
}

.lang-select-wrapper {
  display: flex;
  align-items: center;
  gap: $spacing-xs;
}

.lang-select {
  width: 80px;

  /* 隐藏默认下拉图标 */
  :deep(.el-select__caret) {
    width: 16px;
    height: 16px;
    background: url('@/assets/images/down.png') no-repeat center;
  }
}

.globe-icon {
  width: 16px;
  height: 16px;
}


.auth-buttons {
  display: flex;
  align-items: center;
  gap: $spacing-lg;
}

.login-btn {
  cursor: pointer;
}

.login-btn:hover {
  color: $color-primary;
}

.user-avatar {
  cursor: pointer;
}

.avatar-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
}

.register-btn {
  background: $color-bg-white;
  border: none;
  color: $color-bg-dark;
  padding: $spacing-sm $spacing-md;
  border-radius: 9999px;
  font-size: $font-size-md;
  font-weight: $font-weight-semibold;
  cursor: pointer;
  transition: all $transition-base;
}

@media (max-width: 1024px) {
  .nav-menu {
    display: none;
  }

  .login-btn,
  .register-btn {
    display: none;
  }

  .menu-toggle {
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
}

@media (max-width: 640px) {
  .nav-container {
    padding: 0 $spacing-md;
  }

  .nav-right {
    gap: $spacing-sm;
  }

  .login-btn,
  .register-btn {
    padding: $spacing-xs $spacing-md;
    font-size: $font-size-sm;
  }
}
</style>
