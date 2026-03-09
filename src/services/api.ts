import api from '@/api'

export const apiService = {
  // 示例 API 请求
  getTechStack: () => {
    return api.get('/tech-stack')
  },
  // 可以添加更多 API 请求方法
  getAbout: () => {
    return api.get('/about')
  },
}
