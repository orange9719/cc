<template>
  <div id="layout-app" class="layout-app">
    <div class="layout-body">
      <router-view v-slot="{ Component, route }">
        <keep-alive :include="includeList">
          <component :is="Component"></component>
        </keep-alive>
      </router-view>
    </div>
    <LayoutFooter />
  </div>
</template>
<script setup>
// 路由管理器
const router = useRouter()

const includeList = ref([])

watch(
  () => router.currentRoute.value,
  (to) => {
    if (to.meta.keepAlive && includeList.value.indexOf(to.name) === -1) {
      includeList.value.push(to.name)
    }
  },
  {
    immediate: true
  }
)
</script>

<style lang="less" scpoed>
.layout-app {
  position: relative;
  height: 100%;
  display: flex;
  flex-flow: column;

  .layout-body {
    flex: 1;
    overflow: hidden;
  }
}
</style>


