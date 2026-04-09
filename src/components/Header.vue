<template>
  <header class="header">
    <HeaderHome v-if="!isAiDesignPage" :ctx="homeCtx" />
    <HeaderAi v-else :ctx="aiCtx" />
  </header>
  <!-- @success="handleBindSuccess" -->
  <OpneTeamMember @updateStatus="handleStatusUpdate" ref="teamChildRef" />
  <InspirationValueModal v-model="showInspirationValueModal" />
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import { useModalStore } from '@/stores/modal'
import { useUserStore } from '@/stores/user'
import { userLanguageToI18nLocale } from '@/i18n'
import { appApi } from '@/api/app'
import { images } from '@/assets'
import { useAuthGate } from '@/composables/useAuthGate'
import OpneTeamMember from "@/components/TeamManagement/OpneTeamMember.vue";
import { useHeaderPoppers } from '@/components/header/useHeaderPoppers'
import { useOfficialMessages } from '@/components/header/useOfficialMessages'
import HeaderHome from '@/components/header/HeaderHome.vue'
import HeaderAi from '@/components/header/HeaderAi.vue'

const { t, locale } = useI18n()
const router = useRouter()
const route = useRoute()

const languageOptions = [
  { label: '简体中文', value: 'zh-chs' },
  { label: 'English', value: 'en' },
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
      await userStore.updateUserInfo({ language: language.value }, '语言切换成功')
    }
  } catch (e) {
    // 后端同步失败不影响当前前端翻译
    console.warn('[Header] 更新语言失败：', e)
  }
}

const { isAuthed, enterModule } = useAuthGate()

// 灵衍值明细弹窗
const showInspirationValueModal = ref(false)

// 用户信息
const userStore = useUserStore()
const {
  officialMsgTab,
  officialMsgLoading,
  officialMsgLoadedOnce,
  officialMsgLoadingMore,
  officialUnreadCount,
  displayedOfficialMessages,
  officialMsgHasMoreRemote,
  officialMsgScrollRef,
  setOfficialMsgTab,
  handleOfficialMsgPopoverShow,
  handleOfficialMsgScroll,
  markOfficialAllRead,
  handleOfficialMsgDetail,
} = useOfficialMessages({
  userStore,
  router,
  warn: (message: string) => ElMessage.warning(message),
})
// 官方消息弹窗显示
const handleOpenInspirationDetail = () => {
  closeAllPoppers()
  showInspirationValueModal.value = true
}

// 会员订阅 / 灵衍值购买（跳转会员页对应 tab）
const handleOpenMembershipPurchase = () => {
  closeAllPoppers()
  enterModule(() => router.push('/membership?tab=0'))
}
// 灵衍值购买
const handleOpenCoinPurchase = () => {
  closeAllPoppers()
  enterModule(() => router.push('/membership?tab=1'))
}

const {
  setActivePopper,
  closeAllPoppers,
  toggleUserMenuPopper,
  isWavePointsPanelOpen,
  isUserCardOpen,
  isUserMenuOpen,
} = useHeaderPoppers()

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
// 语言小弹窗关闭
const closeLanguagePopover = () => {
  isLanguagePopoverOpen.value = false
}
// 语言小弹窗关闭
const scheduleCloseLanguagePopover = () => {
  if (languagePopoverHideTimer) {
    window.clearTimeout(languagePopoverHideTimer)
  }
  languagePopoverHideTimer = window.setTimeout(() => {
    isLanguagePopoverOpen.value = false
  }, 150)
}

// 头像地址：优先使用用户头像，兜底默认头像
const getAvatarSrc = () => {
  const info: any = userStore.userInfo || {}
  return String(info.headImgUrl || '').trim() ? info.headImgUrl : images.avatarDefault
}
// 会员状态文本
const getMembershipStatusText = () => {
  // 统一交由 userStore 的 vipDisplayText 计算，保证 Header/Membership 文案一致
  return userStore.vipDisplayText
}

// 月度登录积分
const monthlyLoginPoints = computed(() => {
  const val = Number((userStore.userInfo as any)?.monthlyLoginPoints ?? 0)
  return Number.isFinite(val) && val > 0 ? val : 0
})

const showMonthlyLoginPointsTip = ref(false)
const isMonthlyTipHiding = ref(false)
const hasPlayedMonthlyTip = ref(false)
let monthlyTipShowTimer: number | null = null
let monthlyTipHideTimer: number | null = null
// 月度登录积分提示定时器清除
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
// 月度登录积分提示消费
const consumeMonthlyLoginPointsTip = () => {
  const currentInfo = (userStore.userInfo as any) || {}
  // 提示播放后本地消费 monthlyLoginPoints，避免后端延迟更新期间重复展示
  userStore.setUserInfo({
    ...currentInfo,
    monthlyLoginPoints: 0,
  })
}
// 月度登录积分提示播放
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
// 月度登录积分提示监听
watch(
  () => [isAuthed.value, monthlyLoginPoints.value],
  () => {
    playMonthlyTip()
  },
  { immediate: true }
)

onBeforeUnmount(() => {
  clearMonthlyTipTimers()
})
// 当前用户语言
const currentUserLanguage = computed<'zh-chs' | 'en'>(() =>
  userStore.userInfo?.language === 'en' ? 'en' : 'zh-chs'
)
// 当前用户语言标签
const getCurrentLanguageLabel = () => (currentUserLanguage.value === 'zh-chs' ? '简体中文' : 'English')

const homeCtx = computed(() => ({
  t,
  route,
  router,
  locale: locale.value,
  handleLanguageChangeSelect,
  languageOptions,
  isAuthed: isAuthed.value,
  enterModule,
  showLoginModal,
  userStore,
  images,
  modalStore,
  openUserInfo: () => modalStore.openPersonalSettingsModal(),
  menuItems,
  pcCustomerService: pcCustomerService.value,
  followUsList: followUsList.value,
  handleMenuClick,
  getAvatarSrc,
  getMembershipStatusText,
  handleOpenInspirationDetail,
  isLanguagePopoverOpen: isLanguagePopoverOpen.value,
  openLanguagePopover,
  scheduleCloseLanguagePopover,
  closeLanguagePopover,
  handleLanguageChange,
  getCurrentLanguageLabel,
  handleProductTutorialClick,
  handleLogout,
  setActivePopper,
  isUserCardOpen: isUserCardOpen.value,
  setUserCardOpen: (v: boolean) => (isUserCardOpen.value = v),
  showMonthlyLoginPointsTip: showMonthlyLoginPointsTip.value,
  isMonthlyTipHiding: isMonthlyTipHiding.value,
  monthlyLoginPoints: monthlyLoginPoints.value,
}))

const aiCtx = computed(() => ({
  t,
  route,
  router,
  locale: locale.value,
  handleLanguageChangeSelect,
  languageOptions,
  isAuthed: isAuthed.value,
  enterModule,
  showLoginModal,
  userStore,
  images,
  modalStore,
  openUserInfo: () => modalStore.openPersonalSettingsModal(),
  menuData,
  pcCustomerService: pcCustomerService.value,
  followUsList: followUsList.value,
  handleMenuClick,
  getAvatarSrc,
  getMembershipStatusText,
  handleOpenInspirationDetail,
  handleOpenMembershipPurchase,
  handleOpenCoinPurchase,
  setActivePopper,
  toggleUserMenuPopper,
  isWavePointsPanelOpen: isWavePointsPanelOpen.value,
  setWavePointsOpen: (v: boolean) => (isWavePointsPanelOpen.value = v),
  isUserCardOpen: isUserCardOpen.value,
  setUserCardOpen: (v: boolean) => (isUserCardOpen.value = v),
  isUserMenuOpen: isUserMenuOpen.value,
  setUserMenuOpen: (v: boolean) => (isUserMenuOpen.value = v),
  isLanguagePopoverOpen: isLanguagePopoverOpen.value,
  openLanguagePopover,
  scheduleCloseLanguagePopover,
  closeLanguagePopover,
  handleLanguageChange,
  getCurrentLanguageLabel,
  handleProductTutorialClick,
  handleLogout,
  handlePersonalSettingsClick,
  handlePlatformAgreementClick,
  handleAiWatermarkSettingsClick,
  handleClick,

  // official messages
  handleOfficialMsgPopoverShow,
  officialMsgTab: officialMsgTab.value,
  setOfficialMsgTab,
  officialMsgLoading: officialMsgLoading.value,
  officialMsgLoadedOnce: officialMsgLoadedOnce.value,
  officialUnreadCount: officialUnreadCount.value,
  displayedOfficialMessages: displayedOfficialMessages.value,
  officialMsgLoadingMore: officialMsgLoadingMore.value,
  officialMsgHasMoreRemote: officialMsgHasMoreRemote.value,
  officialMsgScrollRef,
  handleOfficialMsgScroll,
  markOfficialAllRead,
  handleOfficialMsgDetail,

  showMonthlyLoginPointsTip: showMonthlyLoginPointsTip.value,
  isMonthlyTipHiding: isMonthlyTipHiding.value,
  monthlyLoginPoints: monthlyLoginPoints.value,
}))

const menuItems = [
  { key: 'aiDesign', path: '/ai-design' },
  // 面料创款：进入 AI 工作台，并带上 mode=fabricCreative
  { key: 'fabricCreative', path: '/ai-fashion', query: { mode: 'fabricCreative' } },
  { key: 'about', path: '/about' },
  { key: 'contactUs', path: '' },
  { key: 'followUs', path: '/follow-us' },
]

// 菜单数据
const menuData = [
  { key: 'contactUs', label: '联系我们', path: '' },
  { key: 'followUs', label: '关注我们', path: '' },
]

// 客户服务二维码
const customerCodeCards = [
  { src: images.customerCode1, name: '商务咨询-小潮' },
  { src: images.customerCode2, name: '商务咨询-雾楠' },
  { src: images.customerCode3, name: '商务咨询-云纱' },
]

// 客户服务二维码
const pcCustomerService = computed(() =>
  customerCodeCards.map((c) => ({
    title: '扫码添加商务',
    desc: c.name,
    url: c.src,
  })),
)

// 关注我们列表
const followUsList = computed(() => [
  { title: '扫码关注公众号', desc: '微信公众号', url: images.follow1 },
  { title: '扫码关注视频号', desc: '微信视频号', url: images.follow2 },
  { title: '扫码关注小红书', desc: '小红书官方号', url: images.follow3 },
  { title: '打开抖音扫码关注', desc: '抖音官方号', url: images.follow4 },
])

// 规则：除「首页 / 关于 / 邀请有礼」外，其它页面统一使用「AI 专用导航」
const isAiDesignPage = computed(() => {
  const name = String(route.name ?? '')
  if (!name) return true
  return name !== 'Home' && name !== 'About' && name !== 'InvitationGift'
})
// 菜单点击
const handleMenuClick = (item: { key: string; path?: string; query?: Record<string, any> }) => {
  if (item.path) {
    // 首页模块入口：未登录统一弹登录弹窗；登录后正常跳转
    if (item.path === '/ai-design' || item.path === '/ai-fashion' || item.path === '/my-creations') {
      // 未登录统一先进 AI 设计工作台；登录后再按入口进入对应模块
      enterModule(() => router.push({ path: item.path!, query: item.query }))
      return
    } else {
      router.push({ path: item.path, query: item.query })
    }
  }
}

// 团队状态更新
const handleStatusUpdate = (newStatus: string | boolean) => {
  userStore.userInfo.teamStatus = newStatus
}
// 团队子账号引用
const teamChildRef = ref<InstanceType<typeof OpneTeamMember> | null>(null)
// 点击「更多」弹窗菜单
const handleClick = () => {
  // 1. 关闭右上角的头像下拉菜单
  closeUserMenu()
  const userInfo = userStore.userInfo
  const isMainAccount = String(userInfo.mainAccount) === 'true'
  const isTeamEnabled = String(userInfo.teamStatus) === 'true'
  const isAdmin = String(userInfo.mainAdmin) === 'true'  // 只要是管理员，直接放行进入管理页
  // A 当前是主账号
  if (isMainAccount) {
    if (isTeamEnabled) {
      router.push('/team-management')
    } else {
      if (teamChildRef.value) {
        teamChildRef.value.openModal()
      }
    }
    return
  }
  // B 当前是 子账号
  if (!isMainAccount) {
    if (isAdmin) {
      router.push('/team-management')
    }
    return
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

// 平台协议点击
const handlePlatformAgreementClick = () => {
  closeUserMenu()
  router.push({ path: '/agreement', query: { type: 'USER_AGREEMENT' } })
}

// 产品教程点击
const handleProductTutorialClick = () => {
  closeUserMenu()
  void (async () => {
    try {
      // 文档分类（后端字段必填：categoriesCode）
      const res = (await appApi.getTutorialList({ categoriesCode: 'ALL' })) as any
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

// AI生成水印设置点击
const handleAiWatermarkSettingsClick = () => {
  closeUserMenu()
  modalStore.openWatermarkDisclaimerModal()
}


// 打开登录弹窗
const showLoginModal = () => {
  modalStore.openLoginModal()
}


// 退出登录
const handleLogout = async () => {
  await userStore.logout()
  router.push('/')
}
</script>

<style lang="scss">
.header {
  position: sticky;
  top: 0;
  z-index: 100;
  padding: 12px 25px;
  background-color: $color-bg-dark-second;
}
</style>
