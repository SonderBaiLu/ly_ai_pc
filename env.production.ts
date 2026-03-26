import type { AppEnv } from './env.development'

const env: AppEnv = {
  // prod：使用“当前部署域名 + /api”（由 src/utils/request.ts 自动拼 window.location.origin）
  // 要求：部署时由网关/Nginx 将 /api 反向代理到真实后端
  VITE_API_BASE_URL: '',
  // prod 一般不需要 dev proxy，但这里留个默认值不影响
  VITE_API_PROXY_TARGET: 'https://test.lingyanaigc.com',
  // 客户端版本号（用于请求头公共参数 system.appVersion）
  VITE_APP_VERSION: '0.0.0',
}

export default env
