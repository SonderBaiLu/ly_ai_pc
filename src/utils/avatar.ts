import { images } from '@/assets'

export function getDefaultAvatar() {
  return images.avatarDefault || images.avatar
}

// 兼容旧代码：根据传入 url/路径解析头像
export function resolveAvatarUrl(url?: string) {
  return url || getDefaultAvatar()
}

