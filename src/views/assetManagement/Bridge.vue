<template>
  <div class="bridge-management">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>桥梁管理</span>
          <el-button
            v-permission="'asset:bridge:create'"
            type="primary"
            :icon="Plus"
            @click="handleAdd"
          >
            新增桥梁
          </el-button>
        </div>
      </template>

      <div class="search-bar">
        <el-form :inline="true" :model="searchForm" @submit.prevent>
          <el-form-item label="桥梁名称">
            <el-input
              v-model="searchForm.bridgeName"
              placeholder="请输入桥梁名称"
              clearable
              @keyup.enter="handleSearch"
            />
          </el-form-item>
          <el-form-item label="所属线路">
            <el-input
              v-model="searchForm.lineName"
              placeholder="请输入所属线路"
              clearable
              @keyup.enter="handleSearch"
            />
          </el-form-item>
          <el-form-item label="当前状态">
            <el-select v-model="searchForm.status" placeholder="全部状态" clearable style="width: 160px">
              <el-option
                v-for="item in STATUS_OPTIONS"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
            <el-button :icon="Refresh" @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 加载失败：内联错误 + 重新加载 -->
      <el-result
        v-if="loadError && !loading"
        icon="error"
        title="桥梁列表加载失败"
        sub-title="请检查网络或后端服务后重试"
      >
        <template #extra>
          <el-button type="primary" :icon="Refresh" @click="fetchList">重新加载</el-button>
        </template>
      </el-result>

      <template v-else>
        <el-table :data="tableData" border style="width: 100%" v-loading="loading">
          <el-table-column prop="bridgeCode" label="桥梁编码" min-width="130" show-overflow-tooltip />
          <el-table-column prop="bridgeName" label="桥梁名称" min-width="150" show-overflow-tooltip />
          <el-table-column prop="lineName" label="所属线路" min-width="130" show-overflow-tooltip />
          <el-table-column label="桥梁类型" min-width="110">
            <template #default="{ row }">{{ getTypeLabel(row.bridgeType) }}</template>
          </el-table-column>
          <el-table-column label="主跨(米)" min-width="100">
            <template #default="{ row }">{{ row.mainSpan ?? '-' }}</template>
          </el-table-column>
          <el-table-column label="当前状态" width="110">
            <template #default="{ row }">
              <el-tag :type="getStatusTag(row.status)">{{ getStatusLabel(row.status) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="技术状况" min-width="100">
            <template #default="{ row }">{{ getConditionLabel(row.conditionLevel) }}</template>
          </el-table-column>
          <el-table-column label="负责人" min-width="110" show-overflow-tooltip>
            <template #default="{ row }">{{ row.manager || '-' }}</template>
          </el-table-column>
          <el-table-column label="建成日期" min-width="120">
            <template #default="{ row }">{{ row.buildDate || '-' }}</template>
          </el-table-column>
          <el-table-column label="操作" width="230" fixed="right">
            <template #default="{ row }">
              <el-button type="info" size="small" :icon="View" @click="handleViewDetail(row)">详情</el-button>
              <el-button
                v-permission="'asset:bridge:update'"
                type="primary"
                size="small"
                :icon="Edit"
                @click="handleEdit(row)"
              >
                编辑
              </el-button>
              <el-button
                v-permission="'asset:bridge:delete'"
                type="danger"
                size="small"
                :icon="Delete"
                @click="handleDelete(row)"
              >
                删除
              </el-button>
            </template>
          </el-table-column>

          <template #empty>
            <el-empty
              :description="hasActiveFilters ? '未找到匹配的桥梁，试试调整筛选条件' : '暂无桥梁数据'"
            />
          </template>
        </el-table>

        <div class="pagination">
          <el-pagination
            v-model:current-page="pagination.page"
            v-model:page-size="pagination.pageSize"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            :total="pagination.total"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </template>
    </el-card>

    <!-- 新增/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="680px"
      @close="handleDialogClose"
    >
      <el-form ref="formRef" :model="formData" :rules="rules" label-width="100px">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="桥梁编码" prop="bridgeCode">
              <el-input v-model="formData.bridgeCode" placeholder="请输入桥梁编码" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="桥梁名称" prop="bridgeName">
              <el-input v-model="formData.bridgeName" placeholder="请输入桥梁名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="所属线路" prop="lineName">
              <el-input v-model="formData.lineName" placeholder="请输入所属线路" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="桥梁类型" prop="bridgeType">
              <el-select v-model="formData.bridgeType" placeholder="请选择桥梁类型" style="width: 100%">
                <el-option
                  v-for="item in BRIDGE_TYPE_OPTIONS"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="主跨(米)" prop="mainSpan">
              <el-input-number
                v-model="formData.mainSpan"
                :min="0"
                :controls="false"
                placeholder="主跨"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="全长(米)" prop="totalLength">
              <el-input-number
                v-model="formData.totalLength"
                :min="0"
                :controls="false"
                placeholder="全长"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="建成日期" prop="buildDate">
              <el-date-picker
                v-model="formData.buildDate"
                type="date"
                value-format="YYYY-MM-DD"
                placeholder="选择建成日期"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="技术状况" prop="conditionLevel">
              <el-select
                v-model="formData.conditionLevel"
                placeholder="请选择技术状况等级"
                clearable
                style="width: 100%"
              >
                <el-option
                  v-for="item in CONDITION_OPTIONS"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="当前状态" prop="status">
              <el-select v-model="formData.status" placeholder="请选择当前状态" style="width: 100%">
                <el-option
                  v-for="item in STATUS_OPTIONS"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="负责人" prop="manager">
              <el-input v-model="formData.manager" placeholder="请输入负责人" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系电话" prop="contactPhone">
              <el-input v-model="formData.contactPhone" placeholder="请输入联系电话" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="位置/坐标" prop="location">
              <el-input v-model="formData.location" placeholder="如经纬度或桩号" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="备注" prop="remark">
              <el-input
                v-model="formData.remark"
                type="textarea"
                :rows="3"
                placeholder="补充说明（选填）"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <!-- 详情抽屉 -->
    <el-drawer v-model="drawerVisible" title="桥梁详情" size="460px">
      <div v-loading="detailLoading">
        <el-descriptions v-if="detailData" :column="1" border>
          <el-descriptions-item label="桥梁编码">{{ detailData.bridgeCode || '-' }}</el-descriptions-item>
          <el-descriptions-item label="桥梁名称">{{ detailData.bridgeName || '-' }}</el-descriptions-item>
          <el-descriptions-item label="所属线路">{{ detailData.lineName || '-' }}</el-descriptions-item>
          <el-descriptions-item label="桥梁类型">{{ getTypeLabel(detailData.bridgeType) }}</el-descriptions-item>
          <el-descriptions-item label="主跨(米)">{{ detailData.mainSpan ?? '-' }}</el-descriptions-item>
          <el-descriptions-item label="全长(米)">{{ detailData.totalLength ?? '-' }}</el-descriptions-item>
          <el-descriptions-item label="建成日期">{{ detailData.buildDate || '-' }}</el-descriptions-item>
          <el-descriptions-item label="技术状况">{{ getConditionLabel(detailData.conditionLevel) }}</el-descriptions-item>
          <el-descriptions-item label="当前状态">
            <el-tag :type="getStatusTag(detailData.status)">{{ getStatusLabel(detailData.status) }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="负责人">{{ detailData.manager || '-' }}</el-descriptions-item>
          <el-descriptions-item label="联系电话">{{ detailData.contactPhone || '-' }}</el-descriptions-item>
          <el-descriptions-item label="位置/坐标">{{ detailData.location || '-' }}</el-descriptions-item>
          <el-descriptions-item label="备注">{{ detailData.remark || '-' }}</el-descriptions-item>
        </el-descriptions>
        <el-empty v-else description="暂无详情数据" />
      </div>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search, Refresh, Edit, Delete, View } from '@element-plus/icons-vue'
import {
  getBridgeList,
  getBridgeDetail,
  createBridge,
  updateBridge,
  deleteBridge
} from '../../api/bridge'

// 当前状态枚举（本地常量，不依赖后端字典）
const STATUS_OPTIONS = [
  { value: 'in_service', label: '在役', tagType: 'success' },
  { value: 'maintaining', label: '养护中', tagType: 'warning' },
  { value: 'closed', label: '封闭', tagType: 'danger' },
  { value: 'building', label: '在建', tagType: 'info' }
]

// 桥梁类型枚举
const BRIDGE_TYPE_OPTIONS = [
  { value: 'beam', label: '梁桥' },
  { value: 'arch', label: '拱桥' },
  { value: 'cable_stayed', label: '斜拉桥' },
  { value: 'suspension', label: '悬索桥' },
  { value: 'other', label: '其他' }
]

// 技术状况等级枚举
const CONDITION_OPTIONS = [
  { value: 1, label: '一类' },
  { value: 2, label: '二类' },
  { value: 3, label: '三类' },
  { value: 4, label: '四类' },
  { value: 5, label: '五类' }
]

const getStatusMeta = (value) => STATUS_OPTIONS.find((item) => item.value === value)
const getStatusLabel = (value) => getStatusMeta(value)?.label || '-'
const getStatusTag = (value) => getStatusMeta(value)?.tagType || 'info'
const getTypeLabel = (value) => BRIDGE_TYPE_OPTIONS.find((item) => item.value === value)?.label || '-'
const getConditionLabel = (value) => CONDITION_OPTIONS.find((item) => item.value === value)?.label || '-'

const loading = ref(false)
const loadError = ref(false)
const tableData = ref([])

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

// 实时输入
const searchForm = reactive({
  bridgeName: '',
  lineName: '',
  status: ''
})

// 已提交的查询快照：分页只用它，保证切页时筛选条件不丢失、也不会输入未点搜索就提前生效
const activeQuery = reactive({
  bridgeName: '',
  lineName: '',
  status: ''
})

const hasActiveFilters = computed(() =>
  Boolean(activeQuery.bridgeName || activeQuery.lineName || activeQuery.status)
)

const dialogVisible = ref(false)
const dialogTitle = ref('新增桥梁')
const submitLoading = ref(false)
const formRef = ref(null)

const createDefaultForm = () => ({
  id: null,
  bridgeCode: '',
  bridgeName: '',
  lineName: '',
  bridgeType: '',
  mainSpan: undefined,
  totalLength: undefined,
  buildDate: '',
  conditionLevel: undefined,
  status: 'in_service',
  manager: '',
  contactPhone: '',
  location: '',
  remark: ''
})

const formData = reactive(createDefaultForm())

const validateContactPhone = (rule, value, callback) => {
  if (!value) return callback()
  if (/^1[3-9]\d{9}$/.test(value)) return callback()
  callback(new Error('请输入正确的手机号'))
}

const rules = {
  bridgeCode: [{ required: true, message: '请输入桥梁编码', trigger: 'blur' }],
  bridgeName: [{ required: true, message: '请输入桥梁名称', trigger: 'blur' }],
  lineName: [{ required: true, message: '请输入所属线路', trigger: 'blur' }],
  bridgeType: [{ required: true, message: '请选择桥梁类型', trigger: 'change' }],
  status: [{ required: true, message: '请选择当前状态', trigger: 'change' }],
  contactPhone: [{ validator: validateContactPhone, trigger: 'blur' }]
}

const drawerVisible = ref(false)
const detailLoading = ref(false)
const detailData = ref(null)

// 获取桥梁列表
const fetchList = async () => {
  loading.value = true
  loadError.value = false
  try {
    const params = {
      page: pagination.page,
      pageSize: pagination.pageSize,
      ...(activeQuery.bridgeName ? { bridgeName: activeQuery.bridgeName } : {}),
      ...(activeQuery.lineName ? { lineName: activeQuery.lineName } : {}),
      ...(activeQuery.status ? { status: activeQuery.status } : {})
    }
    const res = await getBridgeList(params)
    const list = res.data?.list || res.data || res.list || []
    tableData.value = Array.isArray(list) ? list : []
    pagination.total = res.data?.total ?? res.total ?? tableData.value.length
  } catch (error) {
    // request 拦截器已统一弹一次错误提示，这里只切到失败态，不重复 toast、不用假数据掩盖
    loadError.value = true
    tableData.value = []
    pagination.total = 0
  } finally {
    loading.value = false
  }
}

// 搜索：提交查询快照并回到第一页
const handleSearch = () => {
  pagination.page = 1
  Object.assign(activeQuery, {
    bridgeName: searchForm.bridgeName,
    lineName: searchForm.lineName,
    status: searchForm.status
  })
  fetchList()
}

// 重置：清空输入与查询快照
const handleReset = () => {
  Object.assign(searchForm, { bridgeName: '', lineName: '', status: '' })
  Object.assign(activeQuery, { bridgeName: '', lineName: '', status: '' })
  pagination.page = 1
  fetchList()
}

const handleSizeChange = (size) => {
  pagination.pageSize = size
  pagination.page = 1
  fetchList()
}

const handleCurrentChange = (page) => {
  pagination.page = page
  fetchList()
}

const handleAdd = () => {
  dialogTitle.value = '新增桥梁'
  Object.assign(formData, createDefaultForm())
  dialogVisible.value = true
}

const handleEdit = (row) => {
  dialogTitle.value = '编辑桥梁'
  Object.assign(formData, createDefaultForm(), {
    id: row.id,
    bridgeCode: row.bridgeCode ?? '',
    bridgeName: row.bridgeName ?? '',
    lineName: row.lineName ?? '',
    bridgeType: row.bridgeType ?? '',
    mainSpan: row.mainSpan ?? undefined,
    totalLength: row.totalLength ?? undefined,
    buildDate: row.buildDate ?? '',
    conditionLevel: row.conditionLevel ?? undefined,
    status: row.status ?? 'in_service',
    manager: row.manager ?? '',
    contactPhone: row.contactPhone ?? '',
    location: row.location ?? '',
    remark: row.remark ?? ''
  })
  dialogVisible.value = true
}

const handleViewDetail = async (row) => {
  drawerVisible.value = true
  detailLoading.value = true
  detailData.value = row
  try {
    const res = await getBridgeDetail(row.id)
    const detail = res.data || res
    if (detail && typeof detail === 'object') {
      detailData.value = { ...row, ...detail }
    }
  } catch (error) {
    // 详情接口失败时退回列表行数据，request 已统一弹错误
    detailData.value = row
  } finally {
    detailLoading.value = false
  }
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除桥梁「${row.bridgeName || row.bridgeCode || ''}」吗?`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    await deleteBridge(row.id)
    ElMessage.success('删除成功')
    // 删除当前页最后一条且非首页时回退一页，避免停在空页
    if (tableData.value.length === 1 && pagination.page > 1) {
      pagination.page -= 1
    }
    fetchList()
  } catch (error) {
    // 取消确认时 error === 'cancel'；接口失败时 request 已统一弹错误，无需重复提示
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (!valid) return

    submitLoading.value = true
    try {
      const payload = {
        bridgeCode: formData.bridgeCode,
        bridgeName: formData.bridgeName,
        lineName: formData.lineName,
        bridgeType: formData.bridgeType,
        mainSpan: formData.mainSpan,
        totalLength: formData.totalLength,
        buildDate: formData.buildDate,
        conditionLevel: formData.conditionLevel,
        status: formData.status,
        manager: formData.manager,
        contactPhone: formData.contactPhone,
        location: formData.location,
        remark: formData.remark
      }

      if (formData.id) {
        await updateBridge(formData.id, payload)
        ElMessage.success('更新成功')
      } else {
        await createBridge(payload)
        ElMessage.success('创建成功')
      }
      dialogVisible.value = false
      fetchList()
    } catch (error) {
      // 提交失败：弹窗保持打开可重试，request 已统一弹错误
    } finally {
      submitLoading.value = false
    }
  })
}

const handleDialogClose = () => {
  formRef.value?.resetFields()
  Object.assign(formData, createDefaultForm())
}

onMounted(() => {
  fetchList()
})
</script>

<style scoped>
.bridge-management {
  padding: 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-bar {
  margin-bottom: 20px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
