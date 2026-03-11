<template>
  <header class="header">
    <!-- 首页等默认导航 -->
    <div v-if="!isAiDesignPage" class="nav-container">
      <div class="logo">
        <img class="logo-icon" src="@/assets/images/logo.png" alt="Logo" @click="router.push('/')">
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
          <img src="@/assets/images/avatar_default.png" alt="User Avatar" class="avatar-icon" />
        </div>
        <div v-else class="auth-buttons">
          <span class="login-btn" @click="showLoginModal">{{ t('header.login') }}</span>
          <span class="register-btn" @click="showLoginModal">{{ t('header.register') }}</span>
        </div>
      </div>
    </div>

    <!-- AI 服装设计页面导航：登录前/登录后样式与首页不同 -->
    <div v-else class="nav-container nav-container--ai">
      <div class="logo">
        <img class="logo-icon" src="@/assets/images/logo.png" alt="Logo" @click="router.push('/')">
      </div>

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

      <nav class="nav-menu">
        <a v-for="item in menuData" :key="item.key" href="#" class="nav-item"
          :class="{ active: item.path && item.path === route.path }" @click.prevent="handleMenuClick(item)">
          {{ t(`header.${item.key}`) }}
        </a>
      </nav>

      <div class="nav-right nav-right--ai">
        <template v-if="isLoggedIn">
          <span class="ai-link">我的创作</span>
          <div class="ai-coin-pill">
            <img src="@/assets/images/coin.png" alt="Coin" class="coin-icon" />
            <span>50</span>
            <el-button class="ai-coin-recharge" type="primary">充值</el-button>
          </div>
          <img src="@/assets/images/msg.png" alt="Coin" class="msg-icon" />
          <div class="user-avatar">
            <img src="@/assets/images/avatar_default.png" alt="User Avatar" class="avatar-icon" />
          </div>
          <img src="@/assets/images/more.png" alt="More" class="more-icon" />
        </template>
        <template v-else>
          <button class="ai-login-btn" type="button" @click="showLoginModal">登录</button>
        </template>
      </div>
    </div>
  </header>
  <!-- 登录弹窗 -->
  <UserLogin v-if="isLoginVisible" @close="closeLoginModal" />
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import UserLogin from '@/components/UserLogin.vue'

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

const menuItems = [
  { key: 'aiDesign', path: '/ai-design' },
  { key: 'fabricCreative', path: '/fabric-creative' },
  { key: 'about', path: '/about' },
  { key: 'contactUs', path: '/contact-us' },
  { key: 'followUs', path: '/follow-us' },
]

const menuData = [
  { key: 'contactUs', label: '联系我们', path: '/contact-us' },
  { key: 'followUs', label: '关注我们', path: '/follow-us' },
]

const isAiDesignPage = computed(() => route.name === 'AiDesign' || route.name === 'AiFashionStudio')

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

// 控制弹窗显示的变量
const isLoginVisible = ref(false)

// 打开登录弹窗
const showLoginModal = () => {
  isLoginVisible.value = true
}

// 关闭登录弹窗
const closeLoginModal = () => {
  isLoginVisible.value = false
}
</script>

<style scoped lang="scss">
.header {
  position: sticky;
  top: 0;
  z-index: 100;
  padding: $spacing-md $spacing-xl;
  background-color: $color-bg-dark-second;
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
      cursor: pointer;
    }
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

.nav-container--ai {
  .lang-select-wrapper {
    margin-right: 37px;
  }
}

.nav-right--ai {
  gap: $spacing-2xl-sm;

  .ai-link {
    cursor: pointer;
    font-size: $font-size-md;
  }

  .ai-coin-pill {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: $spacing-xs;
    height: 24px;
    padding-left: 6px;
    border-radius: 9999px;
    border: 1px solid $color-primary;
    font-size: $font-size-md;
    color: $color-primary;
    background: rgba(150, 221, 255, 0.1);

    .coin-icon {
      width: 12px;
      height: 12px;
    }

    .ai-coin-recharge {
      height: 100%;
      color: $color-text-white;
      padding: 0 $spacing-sm;
      border-radius: 0px 99px 99px 0px;
      font-size: $font-size-xs;
      cursor: pointer;
    }
  }

  .msg-icon,
  .more-icon {
    width: 24px;
    height: 24px;
    cursor: pointer;
  }
}

.ai-login-btn {
  width: 88px;
  height: 32px;
  border-radius: 9999px;
  border: none;
  background-color: $color-bg-white;
  color: $color-bg-dark;
  font-size: $font-size-md;
  font-weight: $font-weight-semibold;
  cursor: pointer;
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

  .avatar-icon {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    object-fit: cover;
  }
}

.register-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  background: $color-bg-white;
  border: none;
  color: $color-bg-dark;
  width: 88px;
  height: 32px;
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
