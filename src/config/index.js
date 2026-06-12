// 环境相关配置统一入口
// 开发环境走 vite 代理（/api），生产环境读取 VITE_API_BASE_URL，并保留原线上地址兜底
const isDev = import.meta.env.DEV

export const API_BASE_URL = isDev
  ? '/api'
  : (import.meta.env.VITE_API_BASE_URL || 'http://8.130.84.165:3001')

// 根据 avatarId 生成头像访问地址
export const getAvatarUrl = (avatarId) => {
  if (!avatarId) return ''
  return `${API_BASE_URL}/upload/image/${avatarId}?download=false`
}
