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
        <!-- 登录状态：显示头像 + 个人信息卡片（hover 展开，带延迟）；未登录：显示登录/注册按钮 -->
        <div v-if="isAuthed" class="user-menu" @mouseenter="openUserCard" @mouseleave="scheduleCloseUserCard">
          <div class="user-avatar">
            <img :src="getAvatarSrc()" alt="User Avatar" class="avatar-icon" />
          </div>
          <div v-show="isUserCardOpen" class="user-card">
            <el-button class="invitation-btn" type="primary"
              @click="enterModule(() => router.push('/invitation-code'))">
              邀请有礼
            </el-button>
            <div class="user-card-header">
              <div class="user-card-avatar">
                <img class="user-card-avatar-img" :src="userStore.userInfo?.headImgUrl || images.avatarHeader"
                  alt="User Avatar" />
                <div class="user-edit">
                  <img :src="images.editMini" alt="User Avatar" />
                </div>
              </div>
              <div class="user-card-main">
                <div class="user-card-name">
                  {{ userStore.userInfo?.nickname || userStore.userInfo?.userName || '未命名用户' }}
                </div>
                <div class="user-card-desc">
                  {{ userStore.userInfo?.desc || '暂无简介' }}
                </div>
              </div>
            </div>

            <div class="user-card-section">
              <div class="user-vip">{{ getMembershipStatusText() }}</div>
              <div class="user-card-row">
                <span>灵衍值</span>
                <div class="user-money flex items-center">
                  <img :src="images.money" alt="" />
                  <span>{{ userStore.userInfo?.wavePoints || 0 }}</span>
                </div>
              </div>
            </div>

            <!-- 语言行 + 自定义语言弹窗 -->
            <div class="user-item flex-between user-item--language" @mouseenter="openLanguagePopover"
              @mouseleave="scheduleCloseLanguagePopover">
              <div class="flex items-center">
                <img :src="images.languageBlack" alt="" class="user-icon" />
                <span class="row-label">语言</span>
              </div>
              <div class="flex items-center">
                <span class="user-language">{{ getCurrentLanguageLabel() }}</span>
                <img :src="images.arrowRight" alt="" class="user-icon" />
              </div>

              <!-- 语言选择小窗 -->
              <div v-show="isLanguagePopoverOpen" class="language-popover" @mouseenter.stop="openLanguagePopover"
                @mouseleave.stop="scheduleCloseLanguagePopover">
                <el-button class="language-option" :type="getCurrentLanguageLabel() == '简体中文' ? 'primary' : 'text'"
                  @click.stop="handleLanguageChange('zh'); closeLanguagePopover()">简体中文</el-button>
                <el-button class="language-option" :type="getCurrentLanguageLabel() == 'English' ? 'primary' : 'text'"
                  @click.stop="handleLanguageChange('en'); closeLanguagePopover()">English</el-button>
              </div>
            </div>
            <div class="user-item flex items-center" @click="router.push('/contact-us')">
              <img :src="images.customer" alt="Customer" class="user-icon" />
              <span class="row-label">客服</span>
            </div>
            <div class="user-item flex items-center" @click="router.push('/membership')">
              <img :src="images.product" alt="Product" class="user-icon" />
              <span class="row-label">产品教程</span>
            </div>

            <div class="user-item user-card-footer" @click="handleLogout">
              <img :src="images.logout" alt="Logout" class="user-icon" />
              退出登录
            </div>
          </div>
        </div>
        <div class="auth-buttons">
          <span class="login-btn" @click="showLoginModal" v-if="!isAuthed">{{ t('header.login') }}</span>
          <span class="register-btn" @click="enterModule(() => router.push('/ai-design'))">{{ t('header.register')
          }}</span>
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
        <template v-if="isAuthed">
          <span class="ai-link" role="button" tabindex="0" @click="enterModule(() => router.push('/my-creations'))"
            @keydown.enter="enterModule(() => router.push('/my-creations'))">
            我的创作
          </span>
          <div class="ai-coin-pill">
            <img src="@/assets/images/coin.png" alt="Coin" class="coin-icon" />
            <span>50</span>
            <el-button class="ai-coin-recharge" type="primary">充值</el-button>
          </div>
          <img src="@/assets/images/msg.png" alt="消息" class="msg-icon" />
          <div class="user-menu" @mouseenter="openUserCard" @mouseleave="scheduleCloseUserCard">
            <div class="user-avatar">
              <img :src="getAvatarSrc()" alt="User Avatar" class="avatar-icon" />
            </div>
            <img src="@/assets/images/more.png" alt="More" class="more-icon" />

            <div v-show="isUserCardOpen" class="user-card user-card--ai">
              <div class="user-card-header">
                <div class="user-card-avatar">
                  <img :src="getAvatarSrc()" alt="User Avatar" />
                </div>
                <div class="user-card-main">
                  <div class="user-card-name">
                    {{ userStore.userInfo?.nickname || userStore.userInfo?.userName || '未命名用户' }}
                    <span v-if="userStore.userInfo?.isVip === 1" class="user-card-badge">
                      {{ getVipTypeText() }}
                    </span>
                  </div>
                  <div class="user-card-desc">
                    {{ userStore.userInfo?.desc || '暂无简介~' }}
                  </div>
                </div>
              </div>

              <div class="user-card-section">
                <div class="user-card-row">{{ getMembershipStatusText() }}</div>
                <div class="user-card-row">
                  <span class="row-label">灵衍值</span>
                  <span class="row-value highlight">{{ userStore.userInfo?.wavePoints || 0 }}</span>
                </div>
              </div>

              <div class="user-card-section user-card-links">
                <div class="user-card-row">
                  <span class="row-label">语言</span>
                  <span class="row-value">{{ getCurrentLanguageLabel() }}</span>
                </div>
                <div class="user-card-row link-row" @click.stop="router.push('/contact-us')">
                  <span class="row-label">客服</span>
                </div>
                <div class="user-card-row link-row" @click.stop="router.push('/membership')">
                  <span class="row-label">产品教程</span>
                </div>
              </div>

              <div class="user-card-footer">
                <button class="logout-btn" type="button" @click.stop="handleLogout">
                  退出登录
                </button>
              </div>
            </div>
          </div>
        </template>
        <template v-else>
          <button class="ai-login-btn" type="button" @click="showLoginModal">登录</button>
        </template>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import { useModalStore } from '@/stores/modal'
import { useUserStore } from '@/stores/user'
import { images } from '@/assets'
import { useAuthGate } from '@/composables/useAuthGate'

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

const { isAuthed, enterModule } = useAuthGate()

// 首页 & AI 页用户信息卡片 hover 展开/收起（带延迟，避免闪烁）
const isUserCardOpen = ref(false)
let userCardHideTimer: number | null = null

const openUserCard = () => {
  if (userCardHideTimer) {
    window.clearTimeout(userCardHideTimer)
    userCardHideTimer = null
  }
  isUserCardOpen.value = true
}

const scheduleCloseUserCard = () => {
  if (userCardHideTimer) {
    window.clearTimeout(userCardHideTimer)
  }
  userCardHideTimer = window.setTimeout(() => {
    isUserCardOpen.value = false
  }, 150)
}

// 语言小弹窗（hover + 延迟隐藏，避免从右侧滑到左侧时消失）
const isLanguagePopoverOpen = ref(false)
let languagePopoverHideTimer: number | null = null

const openLanguagePopover = () => {
  if (languagePopoverHideTimer) {
    window.clearTimeout(languagePopoverHideTimer)
    languagePopoverHideTimer = null
  }
  isLanguagePopoverOpen.value = true
}

const closeLanguagePopover = () => {
  isLanguagePopoverOpen.value = false
}

const scheduleCloseLanguagePopover = () => {
  if (languagePopoverHideTimer) {
    window.clearTimeout(languagePopoverHideTimer)
  }
  languagePopoverHideTimer = window.setTimeout(() => {
    isLanguagePopoverOpen.value = false
  }, 150)
}

// 用户信息
const userStore = useUserStore()

// 头像地址：优先使用用户头像，兜底默认头像
const getAvatarSrc = () => {
  const info: any = userStore.userInfo || {}
  return String(info.headImgUrl || '').trim() ? info.headImgUrl : images.avatarDefault
}

// 会员类型文案
const getVipTypeText = () => {
  const info: any = userStore.userInfo || {}
  if (info.isVip !== 1) return '未开通会员'
  const vipType = info.vipType
  if (vipType === 1) return '基础会员'
  if (vipType === 0) return '标准会员'
  if (vipType === 2) return '高级会员'
  return '会员'
}

const getMembershipStatusText = () => {
  const info: any = userStore.userInfo || {}
  if (info.isVip !== 1) return '未开通会员'
  return getVipTypeText()
}

const getCurrentLanguageLabel = () => (locale.value === 'zh' ? '简体中文' : 'English')

const menuItems = [
  { key: 'aiDesign', path: '/ai-design' },
  // 面料创拍：进入 AI 工作台，并带上 mode=fabricCreative
  { key: 'fabricCreative', path: '/ai-fashion', query: { mode: 'fabricCreative' } },
  { key: 'about', path: '/about' },
  { key: 'contactUs', path: '/contact-us' },
  { key: 'followUs', path: '/follow-us' },
]

const menuData = [
  { key: 'contactUs', label: '联系我们', path: '/contact-us' },
  { key: 'followUs', label: '关注我们', path: '/follow-us' },
]

// 规则：仅首页(Home)与关于(About)使用默认导航，其余页面统一使用“AI 专用导航”
const isAiDesignPage = route.name !== 'Home' && route.name !== 'About'

const handleMenuClick = (item: { key: string; path?: string; query?: Record<string, any> }) => {
  if (item.path) {
    // 首页模块入口：未登录统一弹登录弹窗；登录后正常跳转
    if (item.path === '/ai-design' || item.path === '/ai-fashion' || item.path === '/my-creations') {
      // 未登录统一先进 AI 设计工作台；登录后再按入口进入对应模块
      enterModule(() => router.push({ path: item.path!, query: item.query }))
      return
    }
    router.push({ path: item.path, query: item.query })
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

const modalStore = useModalStore()

// 打开登录弹窗
const showLoginModal = () => {
  modalStore.openLoginModal()
  modalStore.openPersonalSettingsModal()
}

// 退出登录
const handleLogout = () => {
  userStore.logout()
  router.push('/')
}
</script>

<style scoped lang="scss">
.header {
  position: sticky;
  top: 0;
  z-index: 100;
  padding: 12px 25px;
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

.ai-link {
  cursor: pointer;
  user-select: none;

  &:hover {
    color: rgba(255, 255, 255, 0.9);
  }
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

.user-menu {
  position: relative;
  display: flex;
  align-items: center;
  /* 作为不可见 hover 连接区域 */

  .user-card {
    position: absolute;
    top: calc(100% + 30px);
    /* 头像与卡片视觉上约 30px 间距，与设计稿一致 */
    right: -91px;
    /* 卡片右侧与头像右侧对齐，更接近设计稿 */
    width: 229px;
    padding: 28px 14px 6px;
    border-radius: 24px 24px 24px 24px;
    background-color: rgba(255, 255, 255, 1);
    display: block;
    color: $color-text-dark-secondary;
    font-size: $font-size-md;
    /* 由 v-show 控制显隐 */
    z-index: 200;
    cursor: pointer;

    .invitation-btn {
      position: absolute;
      top: 11px;
      right: 14px;
      width: 66px;
      height: 23px;
      border-radius: 4px 4px 4px 4px;
      background: radial-gradient(0.5% 0.5% at 50% 50%, rgba(23, 160, 225, 1) 0%, rgba(112, 197, 237, 1) 100%);
      font-size: $font-size-xs;
    }

    .user-card-header {
      display: flex;
      align-items: flex-end;
      margin-bottom: 18px;
    }

    .user-card-avatar {
      position: relative;

      .user-card-avatar-img {
        width: 52px;
        height: 54px;
        border-radius: 50%;
        // background-color: rgba(0, 0, 0, 1);
      }

      .user-edit {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 15px;
        height: 15px;
        cursor: pointer;
        position: absolute;
        right: 0;
        bottom: 0;
        background: $color-primary-dark;
        border-radius: 50%;

        img {
          width: 10px;
          height: 10px;
        }
      }
    }

    .user-card-main {
      margin-left: 17px;
      flex: 1;

      .user-card-name {
        color: rgba(17, 24, 39, 1);
        font-size: 16px;
      }

      .user-card-desc {
        color: $color-text-placeholder;
        font-size: 12px;
      }
    }

    .user-card-section {
      margin-bottom: 5px;

      .user-vip {
        padding: 11px 13px 9px;
        border-radius: 16px 16px 0px 0px;
        background-color: rgba(241, 245, 249, 1);

        // 月度会员-紫色
        &.popular {
          color: $color-text-white;
          font-family: NotoSans-bold;
          background: linear-gradient(90deg, rgba(204, 166, 244, 1) 0%, rgba(192, 126, 255, 1) 53%, rgba(204, 166, 244, 1) 99%);
        }

        // 季度会员-蓝色
        &.blue {
          color: $color-text-white;
          font-family: NotoSans-bold;
          background: linear-gradient(90deg, rgba(130, 209, 246, 1) 0%, rgba(41, 171, 244, 1) 50%, rgba(80, 199, 253, 1) 99%);
        }

        // 年度会员-黄色
        &.yellow {
          color: $color-text-white;
          font-family: NotoSans-bold;
          background: linear-gradient(90deg, rgba(244, 232, 190, 1) 0%, rgba(196, 170, 117, 1) 50%, rgba(244, 232, 190, 1) 99%);
        }
      }

      .user-card-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 5px 8px 6px 13px;
        background-color: rgba(249, 250, 251, 1);
        border: 1px solid rgba(243, 244, 246, 1);
        border-radius: 0 0 16px 16px;

        .user-money {
          color: $color-primary-dark;

          img {
            width: 12px;
            height: 12px;
            margin-right: 5px;
          }
        }
      }
    }

    .user-item {
      padding: 11px 3px;

      &:hover {
        border-radius: 5px;
        background-color: rgba(228, 246, 255, 1);
      }
    }

    .row-label {
      margin-left: 16px;
    }

    .user-language {
      margin-right: 2px;
      font-size: $font-size-xs;
    }

    .user-icon {
      width: 16px;
      height: 16px;
    }

    .user-card-footer {
      margin-top: 7px;
      border-top: 1px solid rgba(187, 187, 187, 1);
    }

    .user-item--language {
      position: relative;
    }

    .language-popover {
      position: absolute;
      top: 50%;
      left: -122px;
      transform: translateY(-50%);
      padding: 7px 12px;
      border-radius: 8px;
      background-color: rgba(255, 255, 255, 1);
      gap: 15px;
      z-index: 210;
      display: flex;
      flex-direction: column;
    }

    .language-option {
      width: 79px;
      height: 30px;
      margin: 0;
    }
  }
}

.user-card--ai {
  top: 48px;
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
