import axios from 'axios'
import type { AxiosInstance, InternalAxiosRequestConfig } from 'axios'
import { ElMessage } from 'element-plus'
import type { ApiResponse } from '@/types'

type OSType = 'iOS' | 'Android' | 'HarmonyOS' | 'Web' | 'WeChatMini'

// 全局错误提示去重：短时间内相同文案只弹一次，避免多个接口同时失败刷屏
const ERROR_TOAST_TTL_MS = 2000
const recentErrorToasts = new Map<string, number>()
const originalElMessageError = ElMessage.error.bind(ElMessage)

const extractMessageText = (input: any): string => {
  if (typeof input === 'string') return input.trim()
  if (input && typeof input === 'object' && typeof input.message === 'string') {
    return input.message.trim()
  }
  return ''
}

ElMessage.error = ((options: any) => {
  const text = extractMessageText(options)
  if (!text) return originalElMessageError(options)

  const now = Date.now()
  const lastAt = recentErrorToasts.get(text) ?? 0
  if (now - lastAt < ERROR_TOAST_TTL_MS) return undefined as any

  recentErrorToasts.set(text, now)
  return originalElMessageError(options)
}) as typeof ElMessage.error

// 防重复处理标志（参考主流应用的处理方式）
let isHandlingAuthExpired = false
let authExpiredTimer: ReturnType<typeof setTimeout> | null = null

const APP_CODE = 'ly_ai'
const DEVICE_ID_STORAGE_KEY = 'deviceId'
const LOCALE_STORAGE_KEY = 'locale'

const pad2 = (n: number) => String(n).padStart(2, '0')

const formatDateYYYYMMDD = (d: Date) =>
  `${d.getFullYear()}${pad2(d.getMonth() + 1)}${pad2(d.getDate())}`

// 生成 32 位 uuid（无分隔符）
const uuid32 = () =>
  (globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`)
    .replace(/-/g, '')
    .slice(0, 32)
    .padEnd(32, '0')

const getOrCreateDeviceId = () => {
  try {
    const existing = localStorage.getItem(DEVICE_ID_STORAGE_KEY)
    if (existing) return existing
    const next = uuid32()
    localStorage.setItem(DEVICE_ID_STORAGE_KEY, next)
    return next
  } catch {
    return uuid32()
  }
}

const detectOsType = (): OSType => {
  const nav = globalThis.navigator
  if (!nav) return 'Web'
  const ua = nav.userAgent || ''
  // 微信小程序：Web 端一般拿不到，这里仅做兜底
  if (ua.includes('miniProgram') || ua.includes('MiniProgram')) return 'WeChatMini'
  if (/HarmonyOS/i.test(ua)) return 'HarmonyOS'
  if (/Android/i.test(ua)) return 'Android'
  if (/iPhone|iPad|iPod/i.test(ua)) return 'iOS'
  return 'Web'
}

const getAppLanguage = () => {
  try {
    // 已登录：优先用个人中心语言偏好（后端字段：userInfo.language）
    const token = localStorage.getItem('token')
    if (token) {
      const rawUserInfo = localStorage.getItem('userInfo')
      if (rawUserInfo) {
        const userInfo = JSON.parse(rawUserInfo) as any
        const lang = String(userInfo?.language ?? '').trim()
        if (lang === 'en') return 'en'
        if (lang === 'zh-chs') return 'zh-chs'
      }
    }

    const stored = localStorage.getItem(LOCALE_STORAGE_KEY)
    if (stored === 'en') return 'en'
    if (stored === 'zh-chs') return 'zh-chs'
  } catch {
    // ignore
  }
  return 'zh-chs'
}

const getAppVersion = () => {
  // 预留：如有配置 VITE_APP_VERSION，可直接透传
  return (import.meta.env.VITE_APP_VERSION as string) || (import.meta.env.VITE_APP_BUILD_VERSION as string) || ''
}

const buildSystemHeader = (token: string | null) => {
  const now = new Date()
  const osType = detectOsType()
  const requestIdPrefix = osType === 'Android' ? 'A' : osType === 'iOS' ? 'I' : 'W'

  return {
    requestId: `${requestIdPrefix}${formatDateYYYYMMDD(now)}${uuid32()}`, // 例：W20240313...(32位UUID)
    appVersion: getAppVersion(),
    osType,
    osVersion: globalThis.navigator ? globalThis.navigator.userAgent : '',
    deviceModel: globalThis.navigator || '',
    deviceId: getOrCreateDeviceId(),
    appLanguage: getAppLanguage(), // en / zh-chs
    timestamp: Date.now(), // 毫秒时间戳
    clientIp: '', // Web 端无法可靠获取，后端可从请求源 IP 获取
    appCode: APP_CODE,
    token: token || '',
  }
}

/**
 * 获取 API Base URL
 *
 * - 开发环境：默认用 `/api`，方便配合 Vite 代理或本地同源后端
 * - 生产环境：
 *   - 优先用 `import.meta.env.VITE_API_BASE_URL`
 *   - 否则跟随当前部署域名 + `/api`
 */
const getBaseURL = (): string => {
  const { DEV, VITE_API_BASE_URL } = import.meta.env

  if (DEV) return '/api'
  if (VITE_API_BASE_URL) return VITE_API_BASE_URL as string

  if (typeof window !== 'undefined') {
    const { origin } = window.location
    return `${origin}/api`
  }

  return '/api'
}

// 创建 axios 实例
const request: AxiosInstance = axios.create({
  baseURL: getBaseURL(),
  timeout: 60000,
})

// 请求拦截器：自动带上 token、通用头
request.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token')
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }

    if (config.headers && !config.headers['Content-Type']) {
      config.headers['Content-Type'] = 'application/json;charset=UTF-8'
    }

    // === 请求头公共参数（system）===
    // 后端一般要求是 JSON 字符串，避免对象被隐式转成 [object Object]
    if (config.headers) {
      config.headers.system = JSON.stringify(buildSystemHeader(token))
    }

    return config
  },
  (error) => Promise.reject(error)
)

const handleAuthExpired = (msg?: string) => {
  if (isHandlingAuthExpired) return
  isHandlingAuthExpired = true
  ElMessage.error(msg || '登录状态已失效，请重新登录')
  // 清理本地登录态
  try {
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
  } catch {
    // ignore
  }

  if (authExpiredTimer) clearTimeout(authExpiredTimer)
  authExpiredTimer = setTimeout(() => {
    // 102：直接回到首页，让用户重新登录
    try {
      if (typeof window !== 'undefined') {
        window.location.replace('/')
      }
    } catch {
      // ignore redirect failures
    }
     // 跳转到首页后自动打开登录弹窗
    try {
      localStorage.setItem('openLoginModalAfterRedirect', '1')
    } catch {
      // ignore
    }
    isHandlingAuthExpired = false
    authExpiredTimer = null
  }, 2000)
}

const SERVER_ERROR_TOAST = '网络开小差了，请稍后重试~'

// 响应拦截器：统一返回 ApiResponse（仅支持新结构），并处理登录过期/102
;(request.interceptors.response as any).use(
  (response: any) => {
    const data = response?.data as ApiResponse<any> | undefined

    // 只接受新结构：{ code, success, msg, data, extend }
    if (!data || typeof data !== 'object' || !('code' in data)) {
      ElMessage.error('接口返回结构异常')
      const structError: any = new Error('Invalid API response structure')
      structError.code = 'INVALID_RESPONSE'
      return Promise.reject(structError)
    }

    const code = String((data as any).code ?? '')

    // 业务码由调用方根据 res.code 处理；此处仅在 HTTP 成功且 body 结构合法时 resolve
    if (code === '102') {
      handleAuthExpired()
      handleAuthExpired('该账号已被管理员停用或删除，请联系管理员')
    }

    return data as any
  },
  (error: any) => {
    const status = Number(error?.response?.status ?? 0)

    // HTTP 401：未授权
    if (error?.response?.status === 401) {
      // 支持单次请求禁用跳转
      if ((error.config as any)?.noAuthRedirect) {
        return Promise.reject(error)
      }
      handleAuthExpired()
      handleAuthExpired('登录状态已失效，请重新登录')
      const authError: any = error
      authError.__AUTH_EXPIRED__ = true
      return Promise.reject(authError)
    }

    // HTTP 5xx / 网关错误：统一提示
    // - status === 0：通常为断网/跨域/被浏览器拦截，统一按网络问题提示
    // - 5xx：nginx / 服务端异常
    if (!status || status >= 500) {
      ElMessage.error(SERVER_ERROR_TOAST)
    }

    return Promise.reject(error)
  }
)

export default request

