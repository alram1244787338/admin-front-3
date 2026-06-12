<template>
  <div class="role-management">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>角色管理</span>
          <el-button type="primary" :icon="Plus" @click="openCreate">新增角色</el-button>
        </div>
      </template>

      <div class="search-bar">
        <el-form :inline="true" :model="searchForm">
          <el-form-item label="角色名称">
            <el-input v-model="searchForm.name" placeholder="请输入角色名称" clearable />
          </el-form-item>
          <el-form-item label="角色编码">
            <el-input v-model="searchForm.code" placeholder="请输入角色编码" clearable />
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
              <el-option label="启用" :value="1" />
              <el-option label="禁用" :value="0" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
            <el-button :icon="Refresh" @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <el-table :data="tableData" border style="width: 100%" v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="角色名称" min-width="120" />
        <el-table-column prop="code" label="角色编码" min-width="120" />
        <el-table-column prop="description" label="描述" min-width="180" show-overflow-tooltip />
        <el-table-column prop="dataScope" label="数据权限" width="120">
          <template #default="{ row }">
            {{ getDataScopeLabel(row.dataScope) }}
          </template>
        </el-table-column>
        <el-table-column prop="sort" label="排序" width="80" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-switch
              v-model="row.status"
              :active-value="1"
              :inactive-value="0"
              @change="handleStatusChange(row)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" min-width="160" />
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" :icon="Setting" @click="handlePermission(row)">权限</el-button>
            <el-button type="primary" size="small" :icon="Edit" @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" size="small" :icon="Delete" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
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
    </el-card>

    <!-- 新增/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      @close="handleClose"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入角色名称" maxlength="50" />
        </el-form-item>
        <el-form-item label="角色编码" prop="code">
          <el-input v-model="formData.code" placeholder="请输入角色编码" maxlength="50" :disabled="!!formData.id" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="formData.description" type="textarea" placeholder="请输入描述" :rows="3" maxlength="200" />
        </el-form-item>
        <el-form-item label="数据权限" prop="dataScope">
          <el-select v-model="formData.dataScope" placeholder="请选择数据权限范围">
            <el-option label="全部数据" :value="1" />
            <el-option label="本部门及以下" :value="2" />
            <el-option label="本部门" :value="3" />
            <el-option label="仅本人" :value="4" />
            <el-option label="自定义" :value="5" />
          </el-select>
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="formData.sort" :min="0" :max="9999" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="formData.status">
            <el-radio :value="1">启用</el-radio>
            <el-radio :value="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm" :loading="submitLoading">确定</el-button>
      </template>
    </el-dialog>

    <!-- 权限配置对话框 -->
    <el-dialog
      v-model="permissionDialogVisible"
      :title="permissionDialogTitle"
      width="600px"
      @close="handlePermissionDialogClose"
    >
      <div v-loading="permissionLoading" class="permission-tree-wrapper">
        <el-empty
          v-if="!permissionLoading && permissionTree.length === 0"
          description="暂无可配置的菜单权限"
        />
        <el-tree
          v-else
          ref="treeRef"
          :data="permissionTree"
          :props="{ label: 'label', children: 'children' }"
          show-checkbox
          node-key="id"
          default-expand-all
          check-strictly
          :check-on-click-node="true"
          :default-checked-keys="checkedKeys"
        />
      </div>
      <template #footer>
        <el-button @click="permissionDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="permissionSubmitLoading" @click="handlePermissionSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, Search, Refresh, Edit, Delete, Setting } from '@element-plus/icons-vue'
import {
  getRoleList,
  createRole,
  updateRole,
  deleteRole,
  updateRoleStatus,
  getRoleDetail,
  setRoleMenu
} from '../../api/role'
import { getMenuList } from '../../api/menu'
import { useTable } from '../../composables/useTable'
import { useDialogForm } from '../../composables/useDialogForm'
import { useDeleteConfirm, useStatusToggle } from '../../composables/useCrudActions'
import { unwrapList } from '../../utils/response'
import { buildRolePayload } from '../../utils/payload'
import { buildPermissionTree } from '../../utils/menu'
import { buildParentMap, collectAncestorIds } from '../../utils/tree'

const rules = {
  name: [
    { required: true, message: '请输入角色名称', trigger: 'blur' },
    { max: 50, message: '角色名称不能超过50个字符', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入角色编码', trigger: 'blur' },
    { max: 50, message: '角色编码不能超过50个字符', trigger: 'blur' },
    { pattern: /^[a-zA-Z_][a-zA-Z0-9_]*$/, message: '角色编码只能包含字母、数字和下划线，且不能以数字开头', trigger: 'blur' }
  ],
  description: [
    { max: 200, message: '描述不能超过200个字符', trigger: 'blur' }
  ],
  dataScope: [
    { required: true, message: '请选择数据权限范围', trigger: 'change' }
  ],
  sort: [
    { required: true, message: '请输入排序值', trigger: 'blur' }
  ]
}

// 数据权限范围标签
const getDataScopeLabel = (dataScope) => {
  const map = {
    1: '全部',
    2: '本部门及以下',
    3: '本部门',
    4: '仅本人',
    5: '自定义'
  }
  return map[dataScope] || '-'
}

// 列表加载 + 分页 + 搜索
const {
  loading,
  tableData,
  pagination,
  searchForm,
  load: fetchRoleList,
  handleSearch,
  handleReset,
  handleSizeChange,
  handleCurrentChange
} = useTable(getRoleList, {
  searchForm: { name: '', code: '', status: null },
  errorMessage: '获取角色列表失败'
})

// 新增/编辑弹窗
const {
  dialogVisible,
  dialogTitle,
  submitLoading,
  formRef,
  formData,
  openCreate,
  openEdit,
  submitForm,
  handleClose
} = useDialogForm({
  defaultForm: {
    id: null,
    name: '',
    code: '',
    description: '',
    dataScope: 1,
    sort: 0,
    status: 1
  },
  submit: async (form, { isEdit }) => {
    const payload = buildRolePayload(form)
    if (isEdit) {
      await updateRole(form.id, payload)
      ElMessage.success('更新成功')
    } else {
      await createRole(payload)
      ElMessage.success('创建成功')
    }
  },
  onSuccess: fetchRoleList,
  createTitle: '新增角色',
  editTitle: '编辑角色'
})

const handleEdit = (row) => {
  openEdit({
    id: row.id,
    name: row.name,
    code: row.code,
    description: row.description,
    dataScope: row.dataScope,
    sort: row.sort,
    status: row.status
  })
}

// 删除
const handleDelete = useDeleteConfirm({
  api: deleteRole,
  onSuccess: fetchRoleList,
  confirmText: '确定要删除该角色吗?'
})

// 状态切换
const handleStatusChange = useStatusToggle({ api: updateRoleStatus })

// ==================== 权限配置（页面自有逻辑） ====================
const treeRef = ref(null)
const permissionDialogVisible = ref(false)
const permissionLoading = ref(false)
const permissionSubmitLoading = ref(false)
const permissionDialogTitle = ref('权限配置')
const currentPermissionRoleId = ref(null)
const permissionParentMap = ref(new Map())
const permissionTree = ref([])
const checkedKeys = ref([])

const extractRoleMenuIds = (roleDetail) => {
  return (roleDetail?.menus || [])
    .map((item) => item.menuId ?? item.menu?.id)
    .filter((id) => typeof id === 'number')
}

const handlePermission = async (row) => {
  currentPermissionRoleId.value = row.id
  permissionDialogTitle.value = `权限配置 - ${row.name}`
  checkedKeys.value = []
  permissionTree.value = []
  permissionDialogVisible.value = true
  permissionLoading.value = true

  try {
    const [menuRes, roleRes] = await Promise.all([
      getMenuList(),
      getRoleDetail(row.id)
    ])

    const menuTree = unwrapList(menuRes)
    const roleDetail = roleRes.data || roleRes
    const roleMenuIds = extractRoleMenuIds(roleDetail)

    permissionTree.value = buildPermissionTree(menuTree)
    permissionParentMap.value = buildParentMap(permissionTree.value)
    checkedKeys.value = roleMenuIds

    await nextTick()
    treeRef.value?.setCheckedKeys(roleMenuIds)
  } catch (error) {
    ElMessage.error(error.message || '获取权限配置失败')
    permissionDialogVisible.value = false
  } finally {
    permissionLoading.value = false
  }
}

const handlePermissionSubmit = async () => {
  if (!currentPermissionRoleId.value || !treeRef.value) return

  permissionSubmitLoading.value = true

  try {
    const checkedMenuIds = treeRef.value.getCheckedKeys(false)
    const menuIds = new Set(checkedMenuIds)

    checkedMenuIds.forEach((menuId) => {
      collectAncestorIds(menuId, permissionParentMap.value).forEach((id) => menuIds.add(id))
    })

    await setRoleMenu(currentPermissionRoleId.value, Array.from(menuIds))
    ElMessage.success('权限配置成功')
    permissionDialogVisible.value = false
    await fetchRoleList()
  } catch (error) {
    ElMessage.error(error.message || '权限配置失败')
  } finally {
    permissionSubmitLoading.value = false
  }
}

const handlePermissionDialogClose = () => {
  currentPermissionRoleId.value = null
  permissionDialogTitle.value = '权限配置'
  permissionTree.value = []
  checkedKeys.value = []
  permissionParentMap.value = new Map()
  treeRef.value?.setCheckedKeys([])
}
</script>

<style scoped>
.role-management {
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

.permission-tree-wrapper {
  min-height: 240px;
}
</style>
