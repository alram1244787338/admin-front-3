// 通用树处理工具

// 扁平列表 -> 嵌套树。叶子节点不挂空 children（避免表格出现多余展开箭头）
export const buildTree = (list = [], options = {}) => {
  const {
    idKey = 'id',
    parentKey = 'parentId',
    childrenKey = 'children',
    rootParentId = null
  } = options

  const walk = (parentId) => {
    const nodes = []
    list.forEach((item) => {
      if (item[parentKey] === parentId) {
        const children = walk(item[idKey])
        if (children.length > 0) {
          nodes.push({ ...item, [childrenKey]: children })
        } else {
          nodes.push(item)
        }
      }
    })
    return nodes
  }

  return walk(rootParentId)
}

// 按条件过滤树（保留命中节点并递归过滤其子节点）
export const filterTree = (nodes = [], predicate, childrenKey = 'children') => {
  return nodes
    .filter((node) => predicate(node))
    .map((node) => ({
      ...node,
      [childrenKey]: filterTree(node[childrenKey] || [], predicate, childrenKey)
    }))
}

// 构建 节点id -> 父id 的映射
export const buildParentMap = (nodes = [], options = {}, map = new Map()) => {
  const { idKey = 'id', parentKey = 'parentId', childrenKey = 'children' } = options

  nodes.forEach((node) => {
    map.set(node[idKey], node[parentKey])
    const children = node[childrenKey]
    if (children?.length) {
      buildParentMap(children, { idKey, parentKey, childrenKey }, map)
    }
  })

  return map
}

// 沿父链回溯收集所有祖先 id
export const collectAncestorIds = (id, parentMap) => {
  const ancestors = []
  let parentId = parentMap.get(id)

  while (typeof parentId === 'number') {
    ancestors.push(parentId)
    parentId = parentMap.get(parentId)
  }

  return ancestors
}
