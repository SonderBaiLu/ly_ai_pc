export type AppEnv = {
  VITE_API_PROXY_TARGET: string
  VITE_API_BASE_URL: string
  VITE_APP_VERSION: string
}

const env: AppEnv = {
  // dev：只需要目标域名（不带 /api），Vite 代理会把 /api 转发过去
  VITE_API_PROXY_TARGET: 'https://chaotuishou.com',
  // dev 走 /api（见 src/api/index.ts），这里保留空字符串即可
  VITE_API_BASE_URL: '',
  // 客户端版本号（用于请求头公共参数 system.appVersion）
  VITE_APP_VERSION: '0.0.0',
}

export default env
