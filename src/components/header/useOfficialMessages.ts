/* global HTMLDivElement, requestAnimationFrame, Event */
import { computed, ref, watch } from 'vue'
import { userApi } from '@/api/user'

type UseOfficialMessagesDeps = {
  userStore: any
  router: any
  warn: (message: string) => void
}

export function useOfficialMessages(deps: UseOfficialMessagesDeps) {
  const { userStore, router, warn } = deps

  // 原始消息数据（后端分页累计结果）
  const officialMessages = ref<any[]>([])
  // 当前标签：全部 / 未读
  const officialMsgTab = ref<'all' | 'unread'>('all')
  // 首屏加载（用于空态/加载态展示）
  const officialMsgLoading = ref(false)
  // 是否完成过首轮拉取（用于避免首次打开先闪空态）
  const officialMsgLoadedOnce = ref(false)
  // 滚动触底加载更多
  const officialMsgLoadingMore = ref(false)
  // 最近一次拉取时间，用于避免 hover 高频请求
  const officialMsgLastFetchAt = ref(0)
  // 后端是否还有下一页
  const officialMsgHasMoreRemote = ref(true)
  const officialMsgScrollRef = ref<HTMLDivElement | null>(null)
  // 后端当前页码
  const officialMsgPage = ref(1)
  // 未读数量（只用接口返回值驱动）
  const officialUnreadCountApi = ref(0)

  // 后端每页拉取条数
  const officialMsgPageSize = 20
  const setOfficialMsgTab = (v: 'all' | 'unread') => {
    officialMsgTab.value = v
  }

  // ===== 派生状态（放在状态定义区）=====
  const officialUnreadCount = officialUnreadCountApi
  // “未读”标签仅展示 readStatus = 0，其它直接展示接口列表
  const displayedOfficialMessages = computed(() =>
    officialMsgTab.value === 'unread'
      ? officialMessages.value.filter((m) => Number(m.readStatus) === 0)
      : officialMessages.value,
  )

  // 将接口未读数同步到展示状态与 userStore
  const syncUnreadCount = (unreadRaw: unknown) => {
    if (unreadRaw === undefined || unreadRaw === null || unreadRaw === '') return
    const unread = Number(unreadRaw)
    officialUnreadCountApi.value = Number.isFinite(unread) && unread >= 0 ? unread : 0
    if (userStore.userInfo) {
      ;(userStore.userInfo as any).msgCount = officialUnreadCountApi.value
    }
  }

  const fetchOfficialMessagesPage = async (page: number, opts?: { force?: boolean; append?: boolean }) => {
    // 未登录不拉取
    if (!userStore.isLoggedIn) return
    // 避免并发请求导致页码/列表错乱
    if (officialMsgLoading.value || officialMsgLoadingMore.value) return

    const now = Date.now()
    // 首屏 30s 内不重复请求（除非 force）
    if (!opts?.force && now - officialMsgLastFetchAt.value < 30_000 && page === 1) return

    if (page === 1) officialMsgLoading.value = true
    else officialMsgLoadingMore.value = true

    try {
      const readStatusParam = officialMsgTab.value === 'unread' ? '0' : '-'
      const msgPageParams: any = {
        currentPage: page,
        pageSize: officialMsgPageSize,
        readStatus: readStatusParam,
      }

      const res = await userApi.getUserMsgPage(msgPageParams)
      if (String((res as any)?.code) !== '0000') return

      const { list, hasNext, unRead } = ((res as any)?.data ?? {}) as {
        list?: any[]
        hasNext?: boolean
        unRead?: unknown
      }
      const rawList = Array.isArray(list) ? list : []
      if (opts?.append) {
        officialMessages.value = [...officialMessages.value, ...rawList]
      } else {
        officialMessages.value = rawList
      }

      officialMsgHasMoreRemote.value =
        typeof hasNext === 'boolean' ? hasNext : rawList.length >= officialMsgPageSize

      syncUnreadCount(unRead)

      officialMsgPage.value = page
      officialMsgLastFetchAt.value = now
    } catch (e) {
      console.error('[Header] getUserMsgPage failed:', e)
    } finally {
      if (page === 1) {
        officialMsgLoadedOnce.value = true
      }
      officialMsgLoading.value = false
      officialMsgLoadingMore.value = false
    }
  }

  // 一键全部已读：先调接口，再本地把 readStatus 置为 1
  const markOfficialAllRead = async () => {
    const unreadIds = officialMessages.value.filter((m) => Number(m.readStatus) === 0).map((m) => m.id).filter(Boolean)
    if (unreadIds.length) {
      try {
        const res = await userApi.doRead({ readAll: 'true' })
        const { unRead } = ((res as any)?.data ?? {}) as { unRead?: unknown }
        syncUnreadCount(unRead)
      } catch (e) {
        console.warn('[Header] doRead(all) failed:', e)
      }
    }
    officialMessages.value = officialMessages.value.map((m) => ({ ...m, readStatus: 1 }))
  }
// 查看详情：跳转到 CreativeDetail（左大图 + 右侧信息面板）
  const handleOfficialMsgDetail = async (msg: any) => {
    const idx = officialMessages.value.findIndex((m) => m.id === msg.id)
    const wasUnread = idx !== -1 && Number(officialMessages.value[idx].readStatus) === 0
    if (wasUnread) {
      try {
        const res = await userApi.doRead({ readAll: 'false', id: msg.id })
        const { unRead } = ((res as any)?.data ?? {}) as { unRead?: unknown }
        syncUnreadCount(unRead)
      } catch (e) {
        console.warn('[Header] doRead(single) failed:', e)
      }
      officialMessages.value[idx] = { ...officialMessages.value[idx], readStatus: 1 }
    }

    const businessId = msg.businessId && String(msg.businessId).trim()
    if (!businessId) {
      warn('该消息没有可跳转的创作记录')
      return
    }

    // 从消息进入详情时使用 replace，避免连续查看多个详情导致返回栈过长
    void router.replace({
      name: 'CreativeDetail',
      params: { id: businessId },
    })
  }

  const resetAndFetchFirstPage = () => {
    officialMsgHasMoreRemote.value = true
    officialMsgPage.value = 1
    void fetchOfficialMessagesPage(1, { force: true, append: false })
    requestAnimationFrame(() => {
      if (officialMsgScrollRef.value) officialMsgScrollRef.value.scrollTop = 0
    })
  }
  // 弹窗显示：每次打开都刷新第一页
  const handleOfficialMsgPopoverShow = () => {
    resetAndFetchFirstPage()
  }

  watch(
    () => officialMsgTab.value,
    () => {
      // 切 tab 后从第一页重新拉取（后端 readStatus 条件变化）
      resetAndFetchFirstPage()
    },
  )

  // 滚动触底加载更多：直接拉取后端下一页
  const handleOfficialMsgScroll = async (evt?: Event) => {
    const el = (evt?.target as HTMLDivElement | null) ?? officialMsgScrollRef.value
    if (!el) return
    if (officialMsgLoading.value || officialMsgLoadingMore.value) return

    const distanceToBottom = el.scrollHeight - (el.scrollTop + el.clientHeight)
    if (distanceToBottom > 60) return

    // 直接拉取后端下一页
    if (officialMsgHasMoreRemote.value) {
      const nextPage = officialMsgPage.value + 1
      await fetchOfficialMessagesPage(nextPage, { force: true, append: true })
    }
  }

  return {
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
  }
}

