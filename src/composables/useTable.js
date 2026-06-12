import { reactive, ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { unwrapList, unwrapTotal } from '../utils/response'

/**
 * 列表加载 + 分页 + 搜索 通用逻辑
 * @param {(params:object)=>Promise} fetcher 列表请求
 * @param {object} options
 *  - immediate 是否 onMounted 自动加载（默认 true）
 *  - searchForm 搜索表单初值对象（提供则启用搜索/重置）
 *  - paginate 是否分页（树表传 false）
 *  - defaultPageSize 默认每页条数
 *  - transform 列表后处理 (list) => rows
 *  - afterLoad 加载完成钩子 (list, res) => void|Promise
 *  - errorMessage 加载失败提示
 */
export const useTable = (fetcher, options = {}) => {
  const {
    immediate = true,
    searchForm: searchDefaults = null,
    paginate = true,
    defaultPageSize = 10,
    transform = (list) => list,
    afterLoad = null,
    errorMessage = '加载失败'
  } = options

  const loading = ref(false)
  const tableData = ref([])
  const searchForm = searchDefaults ? reactive({ ...searchDefaults }) : null
  const pagination = reactive({ page: 1, pageSize: defaultPageSize, total: 0 })

  const buildParams = () => {
    const params = {}
    if (paginate) {
      params.page = pagination.page
      params.pageSize = pagination.pageSize
    }
    if (searchForm) Object.assign(params, searchForm)
    return params
  }

  const load = async () => {
    loading.value = true
    try {
      const res = await fetcher(buildParams())
      const list = unwrapList(res)
      tableData.value = transform(list)
      if (paginate) {
        pagination.total = unwrapTotal(res, tableData.value.length)
      }
      if (afterLoad) await afterLoad(list, res)
    } catch (error) {
      ElMessage.error(error?.message || errorMessage)
    } finally {
      loading.value = false
    }
  }

  const handleSearch = () => {
    if (paginate) pagination.page = 1
    load()
  }

  const handleReset = () => {
    if (searchForm && searchDefaults) Object.assign(searchForm, searchDefaults)
    handleSearch()
  }

  const handleSizeChange = () => load()
  const handleCurrentChange = () => load()

  if (immediate) onMounted(load)

  return {
    loading,
    tableData,
    pagination,
    searchForm,
    load,
    handleSearch,
    handleReset,
    handleSizeChange,
    handleCurrentChange
  }
}
