/**
 * 浏览器报告离线时，阻塞直到 window『online』或超时（避免断网时仍疯狂打轮询接口）。
 * SSR / 无 navigator 时直接 resolve。
 */
export function waitForNavigatorOnline(opts?: { timeoutMs?: number }): Promise<void> {
  const nav = typeof globalThis !== 'undefined' ? (globalThis as any).navigator : null
  if (typeof window === 'undefined' || !nav || nav.onLine) {
    return Promise.resolve()
  }
  const timeoutMs = opts?.timeoutMs ?? 60_000
  return new Promise((resolve) => {
    let done = false
    const finish = () => {
      if (done) return
      done = true
      window.removeEventListener('online', onOnline)
      clearTimeout(timer)
      resolve()
    }
    const onOnline = () => finish()
    window.addEventListener('online', onOnline)
    const timer = window.setTimeout(finish, timeoutMs)
  })
}
