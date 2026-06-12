// 统一解包后端响应，兼容 { data: { list, total } } / { data: [] } / { list } 等形态

export const unwrapList = (res) => {
  if (!res) return []
  return res.data?.list || res.data || res.list || []
}

export const unwrapTotal = (res, fallback = 0) => {
  if (!res) return fallback
  return res.data?.total || res.total || fallback
}
