<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'

const { t, locale } = useI18n()

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
  { key: 'aiDesign' },
  { key: 'fabricCreative' },
  { key: 'about' },
  { key: 'contactUs' },
  { key: 'followUs' },
]

const showComingSoon = () => {
  ElMessage.info(
    locale.value === 'zh'
      ? '功能暂未开放，敬请期待'
      : 'This feature is not available yet. Stay tuned.'
  )
}
</script>

<template>
  <header class="header">
    <div class="nav-container">
      <div class="logo">
        <img class="logo-icon" src="@/assets/images/logo.png" alt="Logo" />
      </div>

      <nav class="nav-menu">
        <a v-for="item in menuItems" :key="item.key" href="#" class="nav-item" @click.prevent="showComingSoon">
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

.nav-container {
  display: flex;
  align-items: center;

  .logo {
    margin-right: 51px;

    .logo-icon {
      width: 107px;
      height: 43px;
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
