import { computed, ref } from 'vue'

export type HeaderPopperKey = 'wavePoints' | 'userCard' | 'userMenu' | null

/**
 * Header 顶部 hover/click popover 互斥控制：
 * - 任意时刻只允许一个 popper 打开
 * - 关闭时做“只关自己”的保护，避免 Element Plus hide-after 把新打开的 popper 误关掉
 */
export function useHeaderPoppers() {
  const activePopper = ref<HeaderPopperKey>(null)

  const setActivePopper = (key: Exclude<HeaderPopperKey, null>) => {
    activePopper.value = key
  }

  const closeAllPoppers = () => {
    activePopper.value = null
  }

  const toggleUserMenuPopper = () => {
    activePopper.value = activePopper.value === 'userMenu' ? null : 'userMenu'
  }

  const isWavePointsPanelOpen = computed<boolean>({
    get: () => activePopper.value === 'wavePoints',
    set: (v) => {
      if (v) {
        activePopper.value = 'wavePoints'
        return
      }
      if (activePopper.value === 'wavePoints') activePopper.value = null
    },
  })

  const isUserCardOpen = computed<boolean>({
    get: () => activePopper.value === 'userCard',
    set: (v) => {
      if (v) {
        activePopper.value = 'userCard'
        return
      }
      if (activePopper.value === 'userCard') activePopper.value = null
    },
  })

  const isUserMenuOpen = computed<boolean>({
    get: () => activePopper.value === 'userMenu',
    set: (v) => {
      if (v) {
        activePopper.value = 'userMenu'
        return
      }
      if (activePopper.value === 'userMenu') activePopper.value = null
    },
  })

  return {
    activePopper,
    setActivePopper,
    closeAllPoppers,
    toggleUserMenuPopper,
    isWavePointsPanelOpen,
    isUserCardOpen,
    isUserMenuOpen,
  }
}

