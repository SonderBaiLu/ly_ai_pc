import type { AppEnv } from './env.development'

const env: AppEnv = {
  // prod：前端直连 API 的 baseURL（建议包含 /api）
  VITE_API_BASE_URL: 'http://www.lingyanaigc.com/api',
  // prod 一般不需要 dev proxy，但这里留个默认值不影响
  VITE_API_PROXY_TARGET: 'http://www.lingyanaigc.com',
}

export default env
