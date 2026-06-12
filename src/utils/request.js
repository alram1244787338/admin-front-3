import axios from 'axios'
import { ElMessage } from 'element-plus'

// 开发环境走 Vite 代理，生产环境读取构建期注入的 VITE_API_BASE_URL；缺省时退回同源相对路径。
// 作为全应用 API 基址的唯一来源，其它模块（如个人中心头像）统一从这里引入，避免到处写死地址。
export const API_BASE_URL = import.meta.env.DEV
  ? '/api'
  : (import.meta.env.VITE_API_BASE_URL || '')

// 创建 axios 实例
const request = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
request.interceptors.request.use(
  config => {
    // 从 localStorage 获取 token
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => {
    console.error('Request error:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  response => {
    // 直接返回 data
    return response.data
  },
  error => {
    // 统一错误处理
    const message = error.response?.data?.message || error.message || '请求失败'
    ElMessage.error(message)
    console.error('Response error:', error)
    return Promise.reject(error)
  }
)

export default request
