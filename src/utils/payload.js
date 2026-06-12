// 各实体提交 payload 的构建（纯函数，入参为表单对象）

export const buildUserPayload = (form) => ({
  username: form.username,
  email: form.email,
  ...(form.departmentId ? { departmentId: form.departmentId } : {}),
  status: form.status
})

export const buildRolePayload = (form) => ({
  name: form.name,
  code: form.code,
  description: form.description,
  dataScope: form.dataScope,
  sort: form.sort,
  status: form.status
})

export const buildMenuPayload = (form) => ({
  ...(form.parentId ? { parentId: form.parentId } : {}),
  ...(form.type === 'menu' && form.name ? { name: form.name } : {}),
  title: form.title,
  type: form.type,
  ...(form.type === 'menu' && form.path ? { path: form.path } : {}),
  ...(form.type === 'menu' && form.component ? { component: form.component } : {}),
  ...(form.type === 'button' && form.permission ? { permission: form.permission } : {}),
  ...(form.type === 'menu' && form.icon ? { icon: form.icon } : {}),
  sort: form.sort,
  ...(form.type === 'menu' ? { visible: form.visible } : {}),
  status: form.status
})

export const buildDepartmentPayload = (form) => ({
  name: form.name,
  ...(form.code ? { code: form.code } : {}),
  ...(form.parentId ? { parentId: form.parentId } : {}),
  ...(form.leaderId ? { leaderId: form.leaderId } : {}),
  ...(form.phone ? { phone: form.phone } : {}),
  ...(form.email ? { email: form.email } : {}),
  ...(form.sort ? { sort: form.sort } : {}),
  ...(form.description ? { description: form.description } : {})
})

export const buildDictTypePayload = (form) => ({
  name: form.name,
  code: form.code,
  description: form.description,
  sort: form.sort,
  status: form.status
})

export const buildDictDataPayload = (form) => ({
  dictTypeId: form.dictTypeId,
  label: form.label,
  value: form.value,
  cssClass: form.cssClass,
  sort: form.sort,
  remark: form.remark,
  status: form.status
})
