import axios from 'axios'
import type { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios'

// 防重复处理标志（参考主流应用的处理方式）
let isHandlingAuthExpired = false
let authExpiredTimer: ReturnType<typeof setTimeout> | null = null

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

    return config
  },
  (error) => Promise.reject(error)
)

const handleAuthExpired = () => {
  if (isHandlingAuthExpired) return
  isHandlingAuthExpired = true

  // 清理本地 token（按你们项目当前最简单的方式）
  try {
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
  } catch {
    // ignore
  }

  if (authExpiredTimer) clearTimeout(authExpiredTimer)
  authExpiredTimer = setTimeout(() => {
    if (typeof window !== 'undefined') {
      window.location.href = '/login'
    }
    isHandlingAuthExpired = false
    authExpiredTimer = null
  }, 0)
}

// 响应拦截器：统一返回 data，并处理登录过期/401
request.interceptors.response.use(
  (response: AxiosResponse) => {
    const data = response.data

    // 兼容后端常见的业务包裹：检测 token 过期（参考 lykj_cts_pc 的逻辑）
    if (data && typeof data === 'object' && 'resp_code' in data) {
      const tokenExpired =
        (data as any).resp_code === -1 ||
        ((data as any).resp_code === 1 && (data as any).resp_msg === 'Not Authenticated') ||
        (typeof (data as any).resp_msg === 'string' && (data as any).resp_msg.includes('invalid_token'))

      if (tokenExpired) {
        handleAuthExpired()
        const authError: any = new Error('Not Authenticated')
        authError.__AUTH_EXPIRED__ = true
        return Promise.reject(authError)
      }
    }

    return data
  },
  (error) => {
    // HTTP 401：未授权
    if (error?.response?.status === 401) {
      // 支持单次请求禁用跳转
      if ((error.config as any)?.noAuthRedirect) {
        return Promise.reject(error)
      }
      handleAuthExpired()
      const authError: any = error
      authError.__AUTH_EXPIRED__ = true
      return Promise.reject(authError)
    }

    return Promise.reject(error)
  }
)

export default request

