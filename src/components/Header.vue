<template>
  <header class="header">
    <!-- 首页等默认导航 -->
    <div v-if="!isAiDesignPage" class="nav-container">
      <div class="logo">
        <img class="logo-icon" src="@/assets/images/logo.png" alt="Logo" @click="router.push('/')">
      </div>

      <!-- 联系我们、关注我们 -->
      <nav class="nav-menu">
        <template v-for="item in menuItems" :key="item.key">
          <el-popover v-if="item.key === 'contactUs'" placement="bottom" trigger="hover"
                      :width="Math.min(672, 160 * pcCustomerService.length)" popper-class="header-qrcode-popper">
            <template #reference>
              <a href="#" class="nav-item" :class="{ active: item.path && item.path === route.path }"
                 @click.prevent="handleMenuClick(item)">
                {{ t(`header.${item.key}`) }}
              </a>
            </template>
            <div class="qrcode-popover-content">
              <div v-for="(x, index) in pcCustomerService" :key="index" class="qrcode-popover-item">
                <h3 class="qrcode-popover-title">{{ x.title }}</h3>
                <div class="qrcode-popover-box">
                  <img :src="x.url" :alt="x.desc" class="qrcode-image"/>
                </div>
                <p class="qrcode-popover-label">{{ x.desc }}</p>
              </div>
            </div>
          </el-popover>

          <el-popover v-else-if="item.key === 'followUs' && followUsList.length > 0" placement="bottom" trigger="hover"
                      :width="Math.min(672, 160 * followUsList.length)" popper-class="header-qrcode-popper">
            <template #reference>
              <a href="#" class="nav-item" :class="{ active: item.path && item.path === route.path }"
                 @click.prevent="handleMenuClick(item)">
                {{ t(`header.${item.key}`) }}
              </a>
            </template>
            <div class="qrcode-popover-content">
              <div v-for="(x, index) in followUsList" :key="index" class="qrcode-popover-item">
                <h3 v-if="x.title" class="qrcode-popover-title">{{ x.title }}</h3>
                <div class="qrcode-popover-box">
                  <img :src="x.url" :alt="x.desc" class="qrcode-image"/>
                </div>
                <p class="qrcode-popover-label">{{ x.desc }}</p>
              </div>
            </div>
          </el-popover>

          <a v-else href="#" class="nav-item" :class="{ active: item.path && item.path === route.path }"
             @click.prevent="handleMenuClick(item)">
            {{ t(`header.${item.key}`) }}
          </a>
        </template>
      </nav>

      <div class="nav-right">
        <div class="lang-select-wrapper">
          <img class="globe-icon" src="@/assets/images/language.png" alt="Globe"/>
          <el-select v-model="locale" @change="handleLanguageChangeSelect" class="lang-select">
            <template #suffix>
              <img src="@/assets/images/down.png" alt="Arrow" class="custom-down"/>
            </template>
            <el-option v-for="option in languageOptions" :key="option.value" :label="option.label"
                       :value="option.value"/>
          </el-select>
        </div>
        <!-- 登录状态：显示头像 + 个人信息卡片（hover 展开，带延迟）；未登录：显示登录/注册按钮 -->
        <div v-if="isAuthed" class="user-menu user-menu--home">
          <div class="user-avatar" @mouseenter="openPersonalCenterOnHover" @mouseleave="scheduleCloseUserCard">
            <img :src="getAvatarSrc()" alt="User Avatar" class="avatar-icon"/>
          </div>
          <span class="register-btn" @click="enterModule(() => router.push('/ai-design'))">{{
              t('header.register')
            }}</span>
          <div v-show="isUserCardOpen" class="user-card" @mouseenter="openPersonalCenterOnHover"
               @mouseleave="scheduleCloseUserCard">
            <el-button class="invitation-btn" type="primary"
                       @click="enterModule(() => router.push('/invitation-gift'))">
              邀请有礼
            </el-button>
            <div @click="openUserInfo()" class="user-card-header">
              <div class="user-card-avatar">
                <img class="user-card-avatar-img" :src="userStore.userInfo?.headImgUrl || images.avatarHeader"
                     alt="User Avatar"/>
                <div class="user-edit">
                  <img :src="images.editMini" alt="User Avatar"/>
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
              <div :class="[
                'user-vip',
                Number(userStore.userInfo?.vipType ?? 0) === 1 ? 'popular' : '',
                Number(userStore.userInfo?.vipType ?? 0) === 2 ? 'blue' : '',
                Number(userStore.userInfo?.vipType ?? 0) === 3 ? 'yellow' : '',
                Number(userStore.userInfo?.vipType ?? 0) === 0 && Number(userStore.userInfo?.vipLevel ?? 0) === 0
                  ? 'disabled'
                  : '',
              ]" @click="enterModule(() => router.push('/membership?tab=0'))">
                {{ getMembershipStatusText() }}
              </div>

              <div class="user-card-row" role="button" tabindex="0" @click="handleOpenInspirationDetail"
                   @keydown.enter.prevent="handleOpenInspirationDetail">
                <span>灵衍值</span>
                <div class="user-money flex items-center">
                  <img :src="images.money" alt=""/>
                  <span>{{ userStore.userInfo?.wavePoints || 0 }}</span>
                </div>
              </div>
            </div>

            <!-- 语言行 + 自定义语言弹窗 -->
            <div class="user-item flex-between user-item--language" @mouseenter="openLanguagePopover"
                 @mouseleave="scheduleCloseLanguagePopover">
              <div class="flex items-center">
                <img :src="images.languageBlack" alt="" class="user-icon"/>
                <span class="row-label">语言</span>
              </div>
              <div class="flex items-center">
                <span class="user-language">{{ getCurrentLanguageLabel() }}</span>
                <img :src="images.arrowRight" alt="" class="user-icon"/>
              </div>

              <!-- 语言选择小窗 -->
              <div v-show="isLanguagePopoverOpen" class="language-popover" @mouseenter.stop="openLanguagePopover"
                   @mouseleave.stop="scheduleCloseLanguagePopover">
                <el-button class="language-option"
                           :type="getCurrentLanguageLabel() == '简体中文' ? 'primary' : 'default'"
                           :link="getCurrentLanguageLabel() != '简体中文'"
                           @click.stop="handleLanguageChange('zh-chs'); closeLanguagePopover()">简体中文
                </el-button>
                <el-button class="language-option"
                           :type="getCurrentLanguageLabel() == 'English' ? 'primary' : 'default'"
                           :link="getCurrentLanguageLabel() != 'English'"
                           @click.stop="handleLanguageChange('en'); closeLanguagePopover()">English
                </el-button>
              </div>
            </div>
            <div class="user-item flex items-center" @click="modalStore.openContactUsModal()">
              <img :src="images.customer" alt="Customer" class="user-icon"/>
              <span class="row-label">客服</span>
            </div>
            <div class="user-item flex items-center" @click="handleProductTutorialClick">
              <img :src="images.product" alt="Product" class="user-icon"/>
              <span class="row-label">产品教程</span>
            </div>

            <div class="user-item user-card-footer" @click="handleLogout">
              <img :src="images.logout" alt="Logout" class="user-icon"/>
              <span class="row-label">退出登录</span>
            </div>
          </div>
        </div>
        <div class="auth-buttons" v-if="!isAuthed">
          <span class="login-btn" @click="showLoginModal">{{ t('header.login') }}</span>
          <span class="register-btn" @click="enterModule(() => router.push('/ai-design'))">{{
              t('header.register')
            }}</span>
        </div>
      </div>
      <div v-if="showMonthlyLoginPointsTip" class="monthly-login-points-tip"
           :class="{ 'is-hiding': isMonthlyTipHiding }">
        每月{{ monthlyLoginPoints }}免费灵衍值已到账
      </div>
    </div>

    <!-- AI 服装设计页面导航：登录前/登录后样式与首页不同 -->
    <div v-else class="nav-container nav-container--ai">
      <div class="logo">
        <img class="logo-icon" src="@/assets/images/logo.png" alt="Logo" @click="router.push('/')">
      </div>

      <div class="lang-select-wrapper">
        <img class="globe-icon" src="@/assets/images/language.png" alt="Globe"/>
        <el-select v-model="locale" @change="handleLanguageChangeSelect" class="lang-select">
          <template #suffix>
            <img src="@/assets/images/down.png" alt="Arrow" class="custom-down"/>
          </template>
          <el-option v-for="option in languageOptions" :key="option.value" :label="option.label"
                     :value="option.value"/>
        </el-select>
      </div>

      <!-- 联系我们、关注我们 -->
      <nav class="nav-menu">
        <template v-for="item in menuData" :key="item.key">
          <el-popover v-if="item.key === 'contactUs'" placement="bottom" trigger="hover"
                      :width="Math.min(672, 160 * pcCustomerService.length)" popper-class="header-qrcode-popper">
            <template #reference>
              <a href="#" class="nav-item" :class="{ active: item.path && item.path === route.path }">
                {{ t(`header.${item.key}`) }}
              </a>
            </template>
            <div class="qrcode-popover-content">
              <div v-for="(x, index) in pcCustomerService" :key="index" class="qrcode-popover-item">
                <h3 class="qrcode-popover-title">{{ x.title }}</h3>
                <div class="qrcode-popover-box">
                  <img :src="x.url" :alt="x.desc" class="qrcode-image"/>
                </div>
                <p class="qrcode-popover-label">{{ x.desc }}</p>
              </div>
            </div>
          </el-popover>

          <el-popover v-else-if="item.key === 'followUs' && followUsList.length > 0" placement="bottom" trigger="hover"
                      :width="Math.min(672, 160 * followUsList.length)" popper-class="header-qrcode-popper">
            <template #reference>
              <a href="#" class="nav-item" :class="{ active: item.path && item.path === route.path }"
                 @click.prevent="handleMenuClick(item)">
                {{ t(`header.${item.key}`) }}
              </a>
            </template>
            <div class="qrcode-popover-content">
              <div v-for="(x, index) in followUsList" :key="index" class="qrcode-popover-item">
                <h3 v-if="x.title" class="qrcode-popover-title">{{ x.title }}</h3>
                <div class="qrcode-popover-box">
                  <img :src="x.url" :alt="x.desc" class="qrcode-image"/>
                </div>
                <p class="qrcode-popover-label">{{ x.desc }}</p>
              </div>
            </div>
          </el-popover>

          <a v-else href="#" class="nav-item" :class="{ active: item.path && item.path === route.path }"
             @click.prevent="handleMenuClick(item)">
            {{ t(`header.${item.key}`) }}
          </a>
        </template>
      </nav>

      <div class="nav-right nav-right--ai">
        <template v-if="isAuthed">
          <span class="ai-link" role="button" tabindex="0" @click="enterModule(() => router.push('/my-creations'))"
                @keydown.enter="enterModule(() => router.push('/my-creations'))">
            我的创作
          </span>
          <div class="ai-coin-pill" @mouseenter="openWavePointsPanel" @mouseleave="scheduleCloseWavePointsPanel">
            <img src="@/assets/images/coin.png" alt="Coin" class="coin-icon"/>
            <span class="ai-coin-number" role="button" tabindex="0" @click.stop="handleOpenInspirationDetail"
                  @keydown.enter.stop="handleOpenInspirationDetail">
              {{ userStore.userInfo?.wavePoints || 0 }}
            </span>
            <el-button class="ai-coin-recharge" type="primary"
                       @click="enterModule(() => router.push('/membership?tab=1'))">充值
            </el-button>

            <div v-show="isWavePointsPanelOpen && !isUserCardOpen"
                 class="wave-points-hover-panel ai-coin-wave-points-panel" @mouseenter="openWavePointsPanel"
                 @mouseleave="scheduleCloseWavePointsPanel">
              <div class="wave-points-panel-top flex-between">
                <div class="wave-points-panel-title">我的灵衍值</div>
                <div class="wave-points-panel-detail" @click="handleOpenInspirationDetail">
                  明细
                </div>
              </div>

              <div class="wave-points-panel-balance">
                <img :src="images.money" alt=""/>
                <span>{{ userStore.userInfo?.wavePoints || 0 }}</span>
              </div>

              <div class="wave-points-panel-actions">
                <el-button class="wave-action" type="primary" @click.stop="handleOpenMembershipPurchase">
                  <img :src="images.crown" alt=""/>
                  会员订阅
                </el-button>
                <el-button class="wave-action wave-action--secondary" @click.stop="handleOpenCoinPurchase">
                  <img :src="images.shop" alt="" class="shop-icon shop-icon--off"/>
                  <img :src="images.shopActive" alt="" class="shop-icon shop-icon--on"/>
                  灵衍值购买
                </el-button>
              </div>
            </div>
          </div>
          <div class="msg-wrapper">
            <img src="@/assets/images/msg.png" alt="消息" class="msg-icon"/>
            <img :src="images.dot" class="dot-icon" v-if="userStore.userInfo?.msgCount > 0"/>
          </div>
          <div class="user-menu" @mouseleave="scheduleCloseUserCard">
            <div class="user-avatar" @mouseenter="openPersonalCenterOnHover">
              <img :src="getAvatarSrc()" alt="User Avatar" class="avatar-icon"/>
            </div>
            <img src="@/assets/images/more.png" alt="More" class="more-icon" @mouseenter.stop="openMoreMenuOnHover"
                 @click.stop="toggleUserCard" role="button" tabindex="0"/>

            <div v-show="isUserCardOpen && isUserMenuOpen" class="more-card more-card--menu"
                 @mouseenter="openMoreMenuOnHover">
              <div class="user-card-menu">
                <div class="user-card-menu-item" @click="handlePersonalSettingsClick">
                  <div class="user-card-menu-left">
                    <img :src="images.set" alt="" class="user-card-menu-icon"/>
                    <span class="user-card-menu-label">个人设置</span>
                  </div>
                  <img :src="images.arrowRight" alt="" class="user-card-menu-arrow"/>
                </div>

                <div class="user-card-menu-item" @click="handlePlatformAgreementClick">
                  <div class="user-card-menu-left">
                    <img :src="images.agreement" alt="" class="user-card-menu-icon"/>
                    <span class="user-card-menu-label">平台协议</span>
                  </div>
                  <img :src="images.arrowRight" alt="" class="user-card-menu-arrow"/>
                </div>

                <div class="user-card-menu-item" @click="handleProductTutorialClick">
                  <div class="user-card-menu-left">
                    <img :src="images.book" alt="" class="user-card-menu-icon"/>
                    <span class="user-card-menu-label">产品教程</span>
                  </div>
                  <img :src="images.arrowRight" alt="" class="user-card-menu-arrow"/>
                </div>

                <div class="user-card-menu-item" @click="handleAiWatermarkSettingsClick">
                  <div class="user-card-menu-left">
                    <img :src="images.aiWatermark" alt="" class="user-card-menu-icon"/>
                    <span class="user-card-menu-label">AI生成水印设置</span>
                  </div>
                  <img :src="images.arrowRight" alt="" class="user-card-menu-arrow"/>
                </div>
                <!--         判断 团队管理页面 是否显示         -->
                <div class="user-card-menu-item" @click="handleClick"
                     v-if="userStore.userInfo?.mainAccount || userStore.userInfo?.mainAdmin">

                  <div class="user-card-menu-left">
                    <img :src="images.team" alt="" class="user-card-menu-icon"/>
                    <span class="user-card-menu-label">团队管理</span>
                  </div>
                  <img :src="images.arrowRight" alt="" class="user-card-menu-arrow"/>
                </div>

                <div class="user-card-menu-divider"/>

                <div class="user-card-menu-item user-card-menu-item--logout" @click="handleLogout">
                  <div class="user-card-menu-left">
                    <img :src="images.logout" alt="" class="user-card-menu-icon"/>
                    <span class="user-card-menu-label">退出登录</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- AI 页：个人中心卡片（与首页一致），三点菜单由 isUserMenuOpen 控制 -->
            <div v-show="isUserCardOpen && !isUserMenuOpen" class="user-card user-card--ai"
                 @mouseenter="openPersonalCenterOnHover">
              <el-button class="invitation-btn" type="primary"
                         @click="enterModule(() => router.push('/invitation-gift'))">
                邀请有礼
              </el-button>
              <div class="user-card-header">
                <div class="user-card-avatar">
                  <img class="user-card-avatar-img" :src="userStore.userInfo?.headImgUrl || images.avatarHeader"
                       alt="User Avatar"/>
                  <div class="user-edit">
                    <img :src="images.editMini" alt="User Avatar"/>
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
                <div :class="[
                  'user-vip',
                  Number(userStore.userInfo?.vipType ?? 0) === 1 ? 'popular' : '',
                  Number(userStore.userInfo?.vipType ?? 0) === 2 ? 'blue' : '',
                  Number(userStore.userInfo?.vipType ?? 0) === 3 ? 'yellow' : '',
                  Number(userStore.userInfo?.vipType ?? 0) === 0 && Number(userStore.userInfo?.vipLevel ?? 0) === 0
                    ? 'disabled'
                    : '',
                ]" @click="enterModule(() => router.push('/membership?tab=0'))">
                  {{ getMembershipStatusText() }}
                </div>

                <div class="user-card-row">
                  <span>灵衍值</span>
                  <div class="user-money flex items-center">
                    <img :src="images.money" alt=""/>
                    <span>{{ userStore.userInfo?.wavePoints || 0 }}</span>
                  </div>
                </div>
              </div>

              <div class="user-item flex-between user-item--language" @mouseenter="openLanguagePopover"
                   @mouseleave="scheduleCloseLanguagePopover">
                <div class="flex items-center">
                  <img :src="images.languageBlack" alt="" class="user-icon"/>
                  <span class="row-label">语言</span>
                </div>
                <div class="flex items-center">
                  <span class="user-language">{{ getCurrentLanguageLabel() }}</span>
                  <img :src="images.arrowRight" alt="" class="user-icon"/>
                </div>

                <div v-show="isLanguagePopoverOpen" class="language-popover" @mouseenter.stop="openLanguagePopover"
                     @mouseleave.stop="scheduleCloseLanguagePopover">
                  <el-button class="language-option"
                             :type="getCurrentLanguageLabel() == '简体中文' ? 'primary' : 'default'"
                             :link="getCurrentLanguageLabel() != '简体中文'"
                             @click.stop="handleLanguageChange('zh-chs'); closeLanguagePopover()">简体中文
                  </el-button>
                  <el-button class="language-option"
                             :type="getCurrentLanguageLabel() == 'English' ? 'primary' : 'default'"
                             :link="getCurrentLanguageLabel() != 'English'"
                             @click.stop="handleLanguageChange('en'); closeLanguagePopover()">English
                  </el-button>
                </div>
              </div>

              <div class="user-item flex items-center" @click="modalStore.openContactUsModal()">
                <img :src="images.customer" alt="Customer" class="user-icon"/>
                <span class="row-label">客服</span>
              </div>
              <div class="user-item flex items-center" @click="handleProductTutorialClick">
                <img :src="images.product" alt="Product" class="user-icon"/>
                <span class="row-label">产品教程</span>
              </div>

              <div class="user-item user-card-footer" @click="handleLogout">
                <img :src="images.logout" alt="Logout" class="user-icon"/>
                <span class="row-label">退出登录</span>
              </div>
            </div>
          </div>
        </template>
        <template v-else>
          <button class="ai-login-btn" type="button" @click="showLoginModal">登录</button>
        </template>
      </div>
      <div v-if="showMonthlyLoginPointsTip" class="monthly-login-points-tip"
           :class="{ 'is-hiding': isMonthlyTipHiding }">
        每月{{ monthlyLoginPoints }}免费灵衍值已到账
      </div>
    </div>
  </header>
  <!-- @success="handleBindSuccess" -->
  <OpneTeamMember ref="teamChildRef"/>
  <InspirationValueModal v-model="showInspirationValueModal"/>
</template>

<script setup lang="ts">
import {useRouter, useRoute} from 'vue-router'
import {useI18n} from 'vue-i18n'
import {ElMessage} from 'element-plus'
import {useModalStore} from '@/stores/modal'
import {useUserStore} from '@/stores/user'
import {userLanguageToI18nLocale} from '@/i18n'
import {appApi} from '@/api/app'
import {images} from '@/assets'
import {useAuthGate} from '@/composables/useAuthGate'
import OpneTeamMember from "@/components/TeamManagement/OpneTeamMember.vue";

const {t, locale} = useI18n()
const router = useRouter()
const route = useRoute()

const languageOptions = [
  {label: '简体中文', value: 'zh-chs'},
  {label: 'English', value: 'en'},
]

const language = ref(useUserStore().userInfo?.language || 'zh-chs')  // 个人语言设置
const handleLanguageChangeSelect = (value: 'zh-chs' | 'en') => {
  // 顶部语言下拉：同步更新 vue-i18n + 后端偏好
  void handleLanguageChange(value)
}

const handleLanguageChange = async (value: 'zh-chs' | 'en') => {
  // 1) 切换前端语言
  language.value = value as 'zh-chs' | 'en'
  locale.value = userLanguageToI18nLocale(language.value)

  // 2) 同步后端语言偏好（仅登录态需要）
  try {
    if (userStore.isLoggedIn) {
      await userStore.updateUserInfo({language: language.value}, '语言切换成功')
    }
  } catch (e) {
    // 后端同步失败不影响当前前端翻译
    console.warn('[Header] 更新语言失败：', e)
  }
}

const {isAuthed, enterModule} = useAuthGate()

// 灵衍值明细弹窗
const showInspirationValueModal = ref(false)

const handleOpenInspirationDetail = () => {
  isWavePointsPanelOpen.value = false
  showInspirationValueModal.value = true
}

// 会员订阅 / 灵衍值购买（跳转会员页对应 tab）
const handleOpenMembershipPurchase = () => {
  isWavePointsPanelOpen.value = false
  enterModule(() => router.push('/membership?tab=0'))
}

const handleOpenCoinPurchase = () => {
  isWavePointsPanelOpen.value = false
  enterModule(() => router.push('/membership?tab=1'))
}

// 首页 & AI 页用户信息卡片 hover 展开/收起（带延迟，避免闪烁）
const isUserCardOpen = ref(false)
const isUserMenuOpen = ref(false) // 仅用于 AI 页「更多（三点）」菜单卡片
let userCardHideTimer: number | null = null

// 灵衍值 hover 子面板：鼠标悬停在“灵衍值”区域后，在正下方弹出
const isWavePointsPanelOpen = ref(false)
let wavePointsPanelHideTimer: number | null = null

const openWavePointsPanel = () => {
  if (wavePointsPanelHideTimer) {
    window.clearTimeout(wavePointsPanelHideTimer)
    wavePointsPanelHideTimer = null
  }
  isWavePointsPanelOpen.value = true
}

const scheduleCloseWavePointsPanel = () => {
  if (wavePointsPanelHideTimer) {
    window.clearTimeout(wavePointsPanelHideTimer)
  }
  wavePointsPanelHideTimer = window.setTimeout(() => {
    isWavePointsPanelOpen.value = false
  }, 150)
}

// 悬停头像区域：展示个人中心卡片
const openPersonalCenterOnHover = () => {
  if (userCardHideTimer) {
    window.clearTimeout(userCardHideTimer)
    userCardHideTimer = null
  }
  isWavePointsPanelOpen.value = false
  isUserCardOpen.value = true
  isUserMenuOpen.value = false
}

// 悬停「更多（三点）」图标：展示更多弹窗菜单卡片
const openMoreMenuOnHover = () => {
  if (userCardHideTimer) {
    window.clearTimeout(userCardHideTimer)
    userCardHideTimer = null
  }
  isWavePointsPanelOpen.value = false
  isUserCardOpen.value = true
  isUserMenuOpen.value = true
}

const toggleUserCard = () => {
  if (userCardHideTimer) {
    window.clearTimeout(userCardHideTimer)
    userCardHideTimer = null
  }
  isWavePointsPanelOpen.value = false
  if (!isUserCardOpen.value) {
    isUserCardOpen.value = true
    isUserMenuOpen.value = true
    return
  }
  isUserMenuOpen.value = !isUserMenuOpen.value
}

const scheduleCloseUserCard = () => {
  if (userCardHideTimer) {
    window.clearTimeout(userCardHideTimer)
  }
  userCardHideTimer = window.setTimeout(() => {
    isUserCardOpen.value = false
    isUserMenuOpen.value = false
    isWavePointsPanelOpen.value = false
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

const getMembershipStatusText = () => {
  // 统一交由 userStore 的 vipDisplayText 计算，保证 Header/Membership 文案一致
  return userStore.vipDisplayText
}

const monthlyLoginPoints = computed(() => {
  const val = Number((userStore.userInfo as any)?.monthlyLoginPoints ?? 0)
  return Number.isFinite(val) && val > 0 ? val : 0
})

const showMonthlyLoginPointsTip = ref(false)
const isMonthlyTipHiding = ref(false)
const hasPlayedMonthlyTip = ref(false)
let monthlyTipShowTimer: number | null = null
let monthlyTipHideTimer: number | null = null

const clearMonthlyTipTimers = () => {
  if (monthlyTipShowTimer) {
    window.clearTimeout(monthlyTipShowTimer)
    monthlyTipShowTimer = null
  }
  if (monthlyTipHideTimer) {
    window.clearTimeout(monthlyTipHideTimer)
    monthlyTipHideTimer = null
  }
}

const consumeMonthlyLoginPointsTip = () => {
  const currentInfo = (userStore.userInfo as any) || {}
  // 提示播放后本地消费 monthlyLoginPoints，避免后端延迟更新期间重复展示
  userStore.setUserInfo({
    ...currentInfo,
    monthlyLoginPoints: 0,
  })
}

const playMonthlyTip = () => {
  if (!isAuthed.value || monthlyLoginPoints.value <= 0 || hasPlayedMonthlyTip.value) return
  hasPlayedMonthlyTip.value = true
  showMonthlyLoginPointsTip.value = true
  isMonthlyTipHiding.value = false

  monthlyTipShowTimer = window.setTimeout(() => {
    isMonthlyTipHiding.value = true
    monthlyTipHideTimer = window.setTimeout(() => {
      showMonthlyLoginPointsTip.value = false
      consumeMonthlyLoginPointsTip()
    }, 800)
  }, 2000)
}

watch(
    () => [isAuthed.value, monthlyLoginPoints.value],
    () => {
      playMonthlyTip()
    },
    {immediate: true}
)

onBeforeUnmount(() => {
  clearMonthlyTipTimers()
})

const currentUserLanguage = computed<'zh-chs' | 'en'>(() =>
    userStore.userInfo?.language === 'en' ? 'en' : 'zh-chs'
)
const getCurrentLanguageLabel = () => (currentUserLanguage.value === 'zh-chs' ? '简体中文' : 'English')

const menuItems = [
  {key: 'aiDesign', path: '/ai-design'},
  // 面料创拍：进入 AI 工作台，并带上 mode=fabricCreative
  {key: 'fabricCreative', path: '/ai-fashion', query: {mode: 'fabricCreative'}},
  {key: 'about', path: '/about'},
  {key: 'contactUs', path: ''},
  {key: 'followUs', path: '/follow-us'},
]

const menuData = [
  {key: 'contactUs', label: '联系我们', path: ''},
  {key: 'followUs', label: '关注我们', path: ''},
]

const customerCodeCards = [
  {src: images.customerCode1, name: '商务咨询-小潮'},
  {src: images.customerCode2, name: '商务咨询-雾楠'},
  {src: images.customerCode3, name: '商务咨询-云纱'},
]

const pcCustomerService = computed(() =>
    customerCodeCards.map((c) => ({
      title: '扫码添加商务',
      desc: c.name,
      url: c.src,
    })),
)

const followUsList = computed(() => [
  {title: '扫码关注公众号', desc: '微信公众号', url: images.follow1},
  {title: '扫码关注视频号', desc: '微信视频号', url: images.follow2},
  {title: '扫码关注小红书', desc: '小红书官方号', url: images.follow3},
  {title: '打开抖音扫码关注', desc: '抖音官方号', url: images.follow4},
])

// 规则：仅 AI 工作台相关页面使用“AI 专用导航”
// 其它业务页面（如会员/邀请有礼）使用首页同款“第一个导航样式”
const isAiDesignPage = computed(() => {
  const name = String(route.name ?? '')
  // 详情页也沿用 AI 专用导航样式，避免切换到详情后回退到首页导航
  return (
      name === 'AiDesign' ||
      name === 'AiFashionStudio' ||
      name === 'MyCreations' ||
      name === 'TeamManagement' ||
      name === 'CreativeDetail'
  )
})

const handleMenuClick = (item: { key: string; path?: string; query?: Record<string, any> }) => {
  if (item.path) {
    // 首页模块入口：未登录统一弹登录弹窗；登录后正常跳转
    if (item.path === '/ai-design' || item.path === '/ai-fashion' || item.path === '/my-creations') {
      // 未登录统一先进 AI 设计工作台；登录后再按入口进入对应模块
      enterModule(() => router.push({path: item.path!, query: item.query}))
      return
    } else {
      router.push({path: item.path, query: item.query})
    }
  }
}
const teamChildRef = ref<InstanceType<typeof OpneTeamMember> | null>(null)
const handleClick = () => {
  // 1. 关闭右上角的头像下拉菜单
  closeUserMenu()
  // 1. 如果是主账号，直接跳转
  if (userStore.userInfo.mainAccount || userStore.userInfo.mainAdmin === 'true') {
    router.push('/team-management')
    return
  }
  // 2. 只有非主账号，调起子组件的弹窗
  if (teamChildRef.value) {
    console.log(userStore.userInfo)
    console.log(userStore.userInfo.mainAdmin)
    teamChildRef.value.openModal()
  }
}

const modalStore = useModalStore()

// 关闭右上角「更多」弹窗并避免与顶部灵衍值 hover 面板互相干扰
const closeUserMenu = () => {
  isUserCardOpen.value = false
  isUserMenuOpen.value = false
  isWavePointsPanelOpen.value = false
}
// ===== 「更多」弹窗菜单点击事件（头像右侧三点）=====
const handlePersonalSettingsClick = () => {
  closeUserMenu()
  modalStore.openPersonalSettingsModal()
}

const handlePlatformAgreementClick = () => {
  closeUserMenu()
  router.push({path: '/agreement', query: {type: 'USER_AGREEMENT'}})
}

const handleProductTutorialClick = () => {
  closeUserMenu()
  void (async () => {
    try {
      // 文档分类（后端字段必填：categoriesCode）
      const res = (await appApi.getTutorialList({categoriesCode: 'ALL'})) as any
      if (String(res?.code) !== '0000' && res?.success !== true) {
        ElMessage.error(res?.msg || (locale.value === 'zh-chs' ? '获取教程失败' : 'Failed to fetch tutorials'))
        return
      }

      window.open(res?.data?.[0]?.url, '_blank')

    } catch (e) {
      console.error('[Header] getTutorialList error:', e)
      ElMessage.error(locale.value === 'zh-chs' ? '获取教程失败' : 'Failed to fetch tutorials')
    }
  })()
}

const handleAiWatermarkSettingsClick = () => {
  closeUserMenu()
  modalStore.openWatermarkDisclaimerModal()
}


// 打开登录弹窗
const showLoginModal = () => {
  modalStore.openLoginModal()
}
const openUserInfo = () => {
  modalStore.openPersonalSettingsModal()
}


// 退出登录
const handleLogout = async () => {
  await userStore.logout()
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

  .nav-item-wrap {
    position: relative;
    padding-bottom: 12px;
  }

  .nav-item {
    color: $color-text-gray;
    text-decoration: none;
    font-size: $font-size-md;
    font-weight: $font-weight-medium;
    transition: color $transition-base;
  }
}

/* ================= QR Code Hover Popover（联系我们 / 关注我们） ================= */

// 二维码卡片内部布局
.qrcode-popover {
  &-content {
    display: flex;
    align-items: center;
    gap: 45px;
    padding: 12px 34px 11px 33px;
  }

  &-title {
    margin-bottom: 15px;
    color: $color-primary;
    font-family: AlibabaPuHui-bold;
    font-weight: 600;
    font-size: $font-size-sm;
  }

  &-item {
    text-align: center;
  }

  &-box {
    width: 100px;
    height: 100px;
    border-radius: 5px;
  }

  &-image {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  &-label {
    margin-top: 11px;
    font-size: $font-size-xs;
    color: rgba(255, 255, 255, 0.7);
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

  .msg-wrapper {
    position: relative;
    width: 24px;
    height: 24px;
    cursor: pointer;

    .dot-icon {
      position: absolute;
      top: -2px;
      right: -1px;
      width: 13px;
      height: 13px;
      border-radius: 50%;
    }
  }

  .ai-coin-pill {
    position: relative;
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
    cursor: pointer;

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

  .ai-coin-wave-points-panel {
    position: absolute;
    top: 58px;
    right: 0;
    z-index: 2000;
    padding: 28px 17px;
    border-radius: 24px 24px 24px 24px;
    background-color: rgba(255, 255, 255, 1);
    width: 229px;

    .wave-points-panel-top {
      margin-bottom: 14px;

      .wave-points-panel-title {
        font-size: $font-size-base;
        font-weight: 700;
        color: $color-text-dark;
      }

      .wave-points-panel-detail {
        color: $color-primary-dark;
        font-size: $font-size-md;
        cursor: pointer;
      }
    }

    .wave-points-panel-balance {
      display: flex;
      align-items: center;
      gap: 9px;
      color: $color-primary-dark;
      font-weight: 700;
      font-size: 28px;
      margin-bottom: 32px;

      img {
        width: 25px;
        height: 24px;
        border-radius: 50%;
      }
    }

    .wave-points-panel-actions {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }

    .wave-action {
      height: 44px;
      width: 100%;
      margin: 0;
      font-size: $font-size-lg;
      font-weight: normal;

      img {
        width: 24px;
        height: 24px;
        margin-right: 20px;
        object-fit: contain;
      }

      &.wave-action--secondary {
        background-color: $color-bg-white;
        color: $color-text-gray;
        border: 1px solid rgba(18, 18, 18, 0.15);

        img {
          margin-right: 7px;
        }

        // 默认显示“非激活”图标；hover 时切换到 active 图标，并蓝底白字
        .shop-icon--on {
          display: none;
        }

        &:hover {
          background-color: $color-primary-dark;
          color: $color-text-white;
          border: 1px solid rgba($color-primary-dark, 0.2);

          .shop-icon--on {
            display: block;
          }

          .shop-icon--off {
            display: none;
          }
        }
      }
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
  gap: 26px;
  /* 作为不可见 hover 连接区域 */

  &.user-menu--home {
    gap: 20px;
  }

  .user-card,
  .more-card {
    position: absolute;
    top: calc(100% + 30px);
    right: 59px;
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
        /* 1. 强制文字在一行显示，不换行 */
        white-space: nowrap;
        /* 2. 超出容器宽度的内容隐藏 */
        overflow: hidden;
        /* 3. 超出部分显示省略号 */
        text-overflow: ellipsis;
        /* 必须给容器设置宽度，否则无法生效！ */
        width: 120px;
        /* 行内元素需要加这个，比如 span/a 标签 */
        display: inline-block;
      }
    }

    .user-card-section {
      margin-bottom: 5px;

      .user-vip {
        padding: 11px 13px 12px;
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
        padding: 7px 8px 7px 11px;
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
      display: flex;
      align-items: center;
      padding: 12px 3px;

      &:hover {
        border-radius: 5px;
        background-color: rgba(228, 246, 255, 1);
      }
    }

    .row-label {
      margin-left: 10px;
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
      margin-top: 8px;
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
      color: $color-text-dark-secondary;

      &:hover {
        background: $color-primary-dark;
        color: $color-text-white;
      }
    }
  }
}

.more-card--menu {
  top: calc(100% + 19px) !important;
  right: 0 !important;
  padding: 10px 13px !important;

  .user-card-menu {
    display: flex;
    flex-direction: column;
    gap: 0;
  }

  .user-card-menu-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 1px;
    border-radius: 5px;
    color: $color-text-dark-secondary;
    font-size: $font-size-md;
    cursor: pointer;
    font-family: NotoSans-regular;

    &:hover {
      background-color: rgba($color-primary-light, 0.12);
    }

    .user-card-menu-left {
      display: flex;
      align-items: center;
      gap: 12px;

      .user-card-menu-icon {
        width: 16px;
        height: 16px;
        object-fit: contain;
      }

      .user-card-menu-label {
        white-space: nowrap;
      }
    }

    .user-card-menu-arrow {
      width: 16px;
      height: 16px;
      object-fit: contain;
    }
  }

  .user-card-menu-divider {
    height: 1px;
    margin: 6px 2px;
    background-color: #BBBBBB;
  }

  // .user-card-menu-item--logout {
  //   color: $color-color-red;

  //   &:hover {
  //     background-color: rgba($color-color-red, 0.1);
  //   }
  // }
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
