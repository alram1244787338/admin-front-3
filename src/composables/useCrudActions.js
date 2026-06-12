import { ElMessage, ElMessageBox } from 'element-plus'

/**
 * 删除确认 通用逻辑
 * @param {object} options
 *  - api 删除请求 (id) => Promise
 *  - onSuccess 删除成功回调 (row) => void|Promise（一般为刷新）
 *  - confirmText 确认提示文案
 *  - successText / errorText 提示文案
 */
export const useDeleteConfirm = (options) => {
  const {
    api,
    onSuccess = null,
    confirmText = '确定要删除该数据吗?',
    title = '提示',
    successText = '删除成功',
    errorText = '删除失败'
  } = options

  const remove = async (row) => {
    try {
      await ElMessageBox.confirm(confirmText, title, {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      await api(row.id)
      ElMessage.success(successText)
      if (onSuccess) await onSuccess(row)
    } catch (error) {
      if (error !== 'cancel') {
        ElMessage.error(error?.message || errorText)
      }
    }
  }

  return remove
}

/**
 * 行内状态切换 通用逻辑（失败自动回滚）
 * @param {object} options
 *  - api 状态更新请求 (id, status) => Promise
 *  - field 状态字段名（默认 status）
 *  - successText / errorText 提示文案
 */
export const useStatusToggle = (options) => {
  const {
    api,
    field = 'status',
    successText = '状态更新成功',
    errorText = '状态更新失败'
  } = options

  const toggle = async (row) => {
    try {
      await api(row.id, row[field])
      ElMessage.success(successText)
    } catch (error) {
      ElMessage.error(error?.message || errorText)
      row[field] = row[field] === 1 ? 0 : 1
    }
  }

  return toggle
}
