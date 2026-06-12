import request from '../utils/request'

// ===== 桥梁数据字典 =====
// 集中在接口文件维护，作为前后端字段契约的单一来源，
// 后续真正联调时只需改这里，页面与详情/筛选都跟着走。

// 当前状态
export const BRIDGE_STATUS = [
  { value: 'in_service', label: '在役', tagType: 'success' },
  { value: 'maintaining', label: '养护中', tagType: 'warning' },
  { value: 'closed', label: '封闭', tagType: 'danger' },
  { value: 'building', label: '在建', tagType: 'info' }
]

// 桥梁类型
export const BRIDGE_TYPE = [
  { value: 'beam', label: '梁桥' },
  { value: 'arch', label: '拱桥' },
  { value: 'cable_stayed', label: '斜拉桥' },
  { value: 'suspension', label: '悬索桥' },
  { value: 'other', label: '其他' }
]

// 技术状况等级
export const CONDITION_LEVEL = [
  { value: 1, label: '一类' },
  { value: 2, label: '二类' },
  { value: 3, label: '三类' },
  { value: 4, label: '四类' },
  { value: 5, label: '五类' }
]

// ===== 响应归一化 =====
// 后端分页外层包装可能是 { list, total }、{ data: { list, total } } 或直接数组，
// 这里统一拍平成 { list, total }，页面层不再各写一套兜底解析。
export const normalizeListResponse = (res) => {
  const payload = res?.data ?? res ?? {}
  const list = Array.isArray(payload) ? payload : payload.list ?? res?.list ?? []
  const safeList = Array.isArray(list) ? list : []
  const total = payload.total ?? res?.total ?? safeList.length
  return { list: safeList, total }
}

// 详情同理：兼容 { data: {...} } 与直接返回对象两种形态。
export const normalizeDetailResponse = (res) => {
  const detail = res?.data ?? res
  return detail && typeof detail === 'object' ? detail : null
}

// ===== 接口 =====
// 获取桥梁列表（分页 + 筛选）
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
