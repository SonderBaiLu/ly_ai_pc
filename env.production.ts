import type { AppEnv } from './env.development'

const env: AppEnv = {
  // prod：前端直连 API 的 baseURL（建议包含 /api）
  VITE_API_BASE_URL: 'https://test.lingyanaigc.com/api',
  // prod 一般不需要 dev proxy，但这里留个默认值不影响
  VITE_API_PROXY_TARGET: 'https://test.lingyanaigc.com',
  // 客户端版本号（用于请求头公共参数 system.appVersion）
  VITE_APP_VERSION: '0.0.0',
}

export default env
