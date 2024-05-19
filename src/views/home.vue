<!--
 * @Author: CC
 * @Date: 2024-04-19 10:43:52
 * @LastEditTime: 2024-05-10 16:06:13
 * @Description: 首页
-->

<template>
  <div class="home-page">
    <var-pull-refresh v-model="refreshing" @refresh="search" ref="pullRefreshRef">
      <var-list ref="listRef" v-model:loading="loading" @load="load" :finished="finished" :offset="10">
        <p>Home</p>
      </var-list>
    </var-pull-refresh>
  </div>
</template>

<script setup lang="ts">

// 下拉列表ref
const pullRefreshRef = ref()
// 列表ref
const listRef = ref()
// 刷新loading
const refreshing = ref<boolean>(false)
// 列表加载loading
const loading = ref<boolean>(false)
// 列表加载完毕
const finished = ref<boolean>(false)
// 列表数据
const list = ref<any[]>([])
// 页码
const pageIndex = ref<number>(1)
// 页数
const pageSize = ref<number>(20)
// 加载数据
const load = () => {
  loading.value = true

  setTimeout(() => {
    loading.value = false
    refreshing.value = false

    const { records, total } = {
      records: [],
      total: 0
    }

    if (pageIndex.value === 1) {
      list.value = records
    } else {
      list.value.push(...records)
    }

    if (pageIndex.value * pageSize.value >= total) {
      finished.value = true
    } else {
      pageIndex.value++
    }

    listRef.value?.check()
  }, 1000)
}

// 搜索
const search = () => {
  pageIndex.value = 1
  finished.value = false
  loading.value = false
  pullRefreshRef.value.$el.scrollTo(0, 0)
  list.value = []
  load()
}
</script>

<style lang="less" scoped>
.home-page {
  height: 100%;

  .var-pull-refresh {
    height: 100%;
    overflow: auto;
  }
}
</style>