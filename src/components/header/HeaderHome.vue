<template>
  <div class="nav-container">
    <!-- Logo：回首页 -->
    <div class="logo">
      <img class="logo-icon" src="@/assets/images/logo.png" alt="Logo" @click="ctx.router.push('/')">
    </div>

    <!-- 顶部导航：普通链接 + 二维码弹层（联系我们 / 关注我们） -->
    <nav class="nav-menu">
      <template v-for="item in ctx.menuItems" :key="item.key">
        <QrCodePopover
          v-if="item.key === 'contactUs'"
          :items="ctx.pcCustomerService"
          :width="Math.min(672, 160 * ctx.pcCustomerService.length)"
        >
          <template #reference>
            <a href="#" class="nav-item" :class="{ active: item.path && item.path === ctx.route.path }">
              {{ ctx.t(`header.${item.key}`) }}
            </a>
          </template>
        </QrCodePopover>
        <!-- 扫码关注公众号 -->
        <QrCodePopover
          v-else-if="item.key === 'followUs' && ctx.followUsList.length > 0"
          :items="ctx.followUsList"
          :width="Math.min(672, 160 * ctx.followUsList.length)"
        >
          <template #reference>
            <a href="#" class="nav-item" :class="{ active: item.path && item.path === ctx.route.path }">
              {{ ctx.t(`header.${item.key}`) }}
            </a>
          </template>
        </QrCodePopover>

        <a
          v-else
          href="#"
          class="nav-item"
          :class="{ active: item.path && item.path === ctx.route.path }"
          @click.prevent="ctx.handleMenuClick(item)"
        >
          {{ ctx.t(`header.${item.key}`) }}
        </a>
      </template>
    </nav>

    <!-- 右侧：语言 + 登录态（头像/注册 或 登录/注册） -->
    <div class="nav-right">
      <div class="lang-select-wrapper">
        <img class="globe-icon" src="@/assets/images/language.png" alt="Globe" />
        <el-select :model-value="ctx.locale" @update:model-value="ctx.handleLanguageChangeSelect" class="lang-select">
          <template #suffix>
            <img src="@/assets/images/down.png" alt="Arrow" class="custom-down" />
          </template>
          <el-option v-for="option in ctx.languageOptions" :key="option.value" :label="option.label" :value="option.value" />
        </el-select>
      </div>

      <!-- 已登录：用户卡片 + 进入 AI 设计（注册按钮文案） -->
      <div v-if="ctx.isAuthed" class="user-menu user-menu--home">
        <UserCenterPopover
          :ctx="ctx"
          variant="home"
          :offset="[-37, 20]"
          :visible="ctx.isUserCardOpen"
          @update:visible="ctx.setUserCardOpen"
        />

        <span class="register-btn" @click="ctx.enterModule(() => ctx.router.push('/ai-design'))">
          {{ ctx.t('header.register') }}
        </span>
      </div>

      <!-- 未登录：登录弹窗 + 进入 AI 设计 -->
      <div class="auth-buttons" v-else>
        <span class="login-btn" @click="ctx.showLoginModal">{{ ctx.t('header.login') }}</span>
        <span class="register-btn" @click="ctx.enterModule(() => ctx.router.push('/ai-design'))">
          {{ ctx.t('header.register') }}
        </span>
      </div>
    </div>

    <!-- 每月登录赠送灵衍值提示（由 ctx 控制显隐与动画） -->
    <div v-if="ctx.showMonthlyLoginPointsTip" class="monthly-login-points-tip" :class="{ 'is-hiding': ctx.isMonthlyTipHiding }">
      每月{{ ctx.monthlyLoginPoints }}免费灵衍值已到账
    </div>
  </div>
</template>

<script setup lang="ts">
import UserCenterPopover from '@/components/header/UserCenterPopover.vue'
import QrCodePopover from '@/components/header/QrCodePopover.vue'

defineProps<{ ctx: any }>()
</script>

<style scoped lang="scss">
.nav-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;

  .logo {
    margin-right: 51px;

    .logo-icon {
      width: 107px;
      height: 43px;
      cursor: pointer;
    }
  }
}

.monthly-login-points-tip {
  position: absolute;
  right: 22px;
  top: calc(100% + 8px);
  padding: 15px 10px;
  border-radius: 8px;
  background: radial-gradient(0.5% 0.5% at 50% 50%, rgba(23, 160, 225, 1) 0%, rgba(112, 197, 237, 1) 100%);
  color: $color-text-white;
  font-size: $font-size-base;
  font-family: PingFangSC-bold;
  white-space: nowrap;
  line-height: 1;
  z-index: 20;
  animation: monthly-tip-enter 0.6s ease-out;
  opacity: 1;
  transform: translateY(0);

  &.is-hiding {
    opacity: 0;
    transform: translateY(-4px);
    transition: opacity 0.8s ease-in-out, transform 0.8s ease-in-out;
  }
}

@keyframes monthly-tip-enter {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.nav-menu {
  display: flex;
  flex: 1;
  gap: $spacing-xl;
  min-width: 520px;
  flex-shrink: 0;

  .nav-item {
    color: $color-text-gray;
    text-decoration: none;
    font-size: $font-size-md;
    font-weight: $font-weight-medium;
    transition: color $transition-base;
    white-space: nowrap;
    flex-shrink: 0;
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

/* 顶部右侧「头像 / 注册」布局（仅负责布局，不包含弹层样式） */
.user-menu {
  display: flex;
  align-items: center;
  gap: 26px;

  &.user-menu--home {
    gap: 20px;
  }

  :deep(.el-popover__reference) {
    display: flex;
    align-items: center;
  }
}

.lang-select-wrapper {
  display: flex;
  align-items: center;
  gap: $spacing-xs;
}

.lang-select {
  width: 80px;

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
    display: flex;
    gap: $spacing-lg;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    width: 520px;
    flex: 0 0 520px;
    min-width: 520px;

    &::-webkit-scrollbar {
      height: 0;
    }
  }

  .login-btn,
  .register-btn {
    display: inline-flex;
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
