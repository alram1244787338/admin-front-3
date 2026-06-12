// 菜单 / 权限树相关的数据转换

// 由菜单树构建权限配置树（带 label 回退、type、permission、parentId）
export const buildPermissionTree = (menus = [], parentId = null) => {
  return menus.map((menu) => ({
    id: menu.id,
    parentId,
    label: menu.title || menu.name || (menu.type === 'button' ? menu.permission : `菜单#${menu.id}`),
    type: menu.type,
    permission: menu.permission,
    children: buildPermissionTree(menu.children || [], menu.id)
  }))
}
