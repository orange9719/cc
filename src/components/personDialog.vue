<template>
  <a-spin :spinning="loading">
    <a-input placeholder="请按姓名搜索…" v-model:value="searchKeyword" style="margin-bottom: 10px" @change="userSearch" />
    <!--组织机构树-->
    <template v-if="treeData.length > 0">
      <a-tree v-if="!treeReloading" checkable :treeData="treeData" :selectedKeys="selectedKeys"
        :load-data="loadChildrenTreeData" :checkedKeys="checkedKeys" v-model:expandedKeys="expandedKeys"
        @check="onCheck" @select="onSelect">
      </a-tree>
    </template>
    <a-empty v-else description="暂无数据" />
  </a-spin>
</template>
<script setup lang="ts">
import { debounce, uniq, difference } from 'lodash-es'

// 当前选中ID
const checkedKeys = ref<string[]>([])

// 选中的人员对象列表
const checkedUserList = ref<any[]>([])

// 当前展开的项
const expandedKeys = ref<string[]>([])

// 数据加载
const loading = ref<boolean>(false)
// 部门树列表数据
const treeData = ref<any[]>([])
// 当前选中的项
const selectedKeys = ref<any[]>([])
// 树组件重新加载
const treeReloading = ref<boolean>(false)
// 当前选中的行
const currentDepart = ref<any>(null)
// 当前选中的部门
const checkedDepart = ref<string[]>([])
// 搜索关键字
const searchKeyword = ref<string>('')

// 加载顶级部门信息
async function loadRootTreeData() {
  try {
    loading.value = true
    treeData.value = []
    // 调用接口赋值result
    const result = []

    treeData.value = result
    if (expandedKeys.value.length === 0) {
      autoExpandParentNode()
    } else {
      if (selectedKeys.value.length === 0) {
        let item = treeData.value[0]
        if (item) {
          // 默认选中第一个
          setSelectedKey(item.id, item)
        }
      }
    }
  } finally {
    loading.value = false
  }
}

loadRootTreeData()

// 加载子级部门信息
async function loadChildrenTreeData(treeNode) {
  try {
    // 调用接口赋值result
    const result = []

    if (result.length == 0) {
      treeNode.dataRef.isLeaf = true
    } else {
      treeNode.dataRef.children = result
      if (expandedKeys.value.length > 0) {
        // 判断获取的子级是否有当前展开的项
        let subKeys: any[] = []
        for (let key of expandedKeys.value) {
          if (result.findIndex((item) => item.id === key) !== -1) {
            subKeys.push(key)
          }
        }
        if (subKeys.length > 0) {
          expandedKeys.value = [...expandedKeys.value]
        }
      }
    }

    treeData.value = [...treeData.value]
  } catch (e) {
    console.error(e)
  }

  return Promise.resolve()
}

// 自动展开父节点，只展开一级
function autoExpandParentNode() {
  let item = treeData.value[0]
  if (item) {
    if (!item.isLeaf) {
      expandedKeys.value = [item.key]
    }
    // 默认选中第一个
    setSelectedKey(item.id, item)
    reloadTree()
  }
}

// 重新加载树组件，防止无法默认展开数据
async function reloadTree() {
  await nextTick()
  treeReloading.value = true
  await nextTick()
  treeReloading.value = false
}

// 设置当前选中的行
function setSelectedKey(key: string, data?: object) {
  selectedKeys.value = [key]
  if (data) {
    currentDepart.value = data
  }
}

// 搜索事件
async function onSearch() {
  if (searchKeyword.value) {
    try {
      loading.value = true
      treeData.value = []
      // 调用接口赋值reslut
      const reslut = []

      treeData.value = reslut
      autoExpandParentNode()
    } finally {
      loading.value = false
    }
  } else {
    loadRootTreeData()
  }
}

// 树复选框选择事件
function onCheck(keys, { checked, node }) {
  if (Array.isArray(keys)) {
    if (searchKeyword.value.length > 0) {
      if (checked) {
        const deptList = node.deptList.map(item => item.id)
        checkedKeys.value = [...checkedKeys.value, ...keys]
        expandedKeys.value = uniq([...expandedKeys.value, ...deptList])
      } else {
        const index = checkedKeys.value.findIndex(key => key === node.key)
        if (index > -1) checkedKeys.value.splice(index, 1)

        const excludeIds = [...node.deptList, ...node.groupList].map(({ id }) => id)
        checkedKeys.value = difference(checkedKeys.value, excludeIds)
      }
    } else {
      checkedKeys.value = keys
    }
  } else {
    checkedKeys.value = keys.checked
  }

  // 判断选中的部门
  if (node.isDepart) {
    if (checked) {
      checkedDepart.value.push(node.key)
    } else {
      const index = checkedDepart.value.findIndex((key: string) => key === node.key)
      checkedDepart.value.splice(index, 1)
    }
  } else {
    if (checked) {
      checkedUserList.value.push({
        id: node.key,
        name: node.realname
      })
    } else {
      const index = checkedUserList.value.findIndex(({ id }) => id === node.key)
      checkedUserList.value.splice(index, 1)
    }
  }
}

// 树选择事件
function onSelect(selKeys: string[], { selectedNodes }) {
  expandedKeys.value = [...expandedKeys.value, selKeys[0]]
  if (selKeys.length > 0 && selectedKeys.value[0] !== selKeys[0]) {
    setSelectedKey(selKeys[0], selectedNodes[0])
  } else {
    // 这样可以防止用户取消选择
    setSelectedKey(selectedKeys.value[0])
  }
}

// 用户搜索
const userSearch = debounce(() => {
  onSearch()
}, 500)
</script>