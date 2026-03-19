import { computed } from 'vue'
import { useUserStore } from '@/stores/user'
import { useModalStore } from '@/stores/modal'
import { useRouter } from 'vue-router'

/**
 * 首页/导航等入口的统一鉴权：
 * - 未登录：打开登录弹窗
 * - 已登录：执行回调（通常是 router.push）
 *
 * 注意：当前项目登录 token 可能只存在 localStorage（刷新后 pinia 未回填），这里做兜底判断。
 */
export function useAuthGate() {
  const userStore = useUserStore()
  const modalStore = useModalStore()
  const router = useRouter()

  const isAuthed = computed(() => {
    return userStore.isLoggedIn || !!localStorage.getItem('token')
  })

  const requireAuth = (next?: () => void) => {
    if (!isAuthed.value) {
      modalStore.openLoginModal()
      return false
    }
    next?.()
    return true
  }

  /**
   * 首页模块入口统一规则：
   * - 未登录：统一先进入 AI 设计工作台（/ai-design）
   * - 已登录：执行回调（跳转到对应模块）
   */
  const enterModule = (next?: () => void) => {
    if (!isAuthed.value) {
      router.push('/ai-design')
      return false
    }
    next?.()
    return true
  }

  return { isAuthed, requireAuth, enterModule }
}

