import request from '../utils/request'

// 获取桥梁列表
export const getBridgeList = (params) => {
  return request.get('/bridge', { params })
}

// 获取桥梁详情
export const getBridgeDetail = (id) => {
  return request.get(`/bridge/${id}`)
}

// 创建桥梁
export const createBridge = (data) => {
  return request.post('/bridge', data)
}

// 更新桥梁
export const updateBridge = (id, data) => {
  return request.put(`/bridge/${id}`, data)
}

// 删除桥梁
export const deleteBridge = (id) => {
  return request.delete(`/bridge/${id}`)
}
