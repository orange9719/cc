<template>
  <footer class="footer">
    <var-style-provider :style-vars="styleVars">
      <var-bottom-navigation v-model:active="active" safe-area @change="tabChange" class="bottom-navigation-example">
        <var-bottom-navigation-item name="/home" label="首页" icon="home"></var-bottom-navigation-item>
      </var-bottom-navigation>
    </var-style-provider>
  </footer>
</template>

<script setup lang="ts">
// 当前路由
const route = useRoute()
// 路由管理器
const router = useRouter()

const styleVars = ref({
  '--bottom-navigation-height': '56px'
})

// 选中的tab
const active = ref<string>(route.path)

// 切换选项卡时触发
const tabChange = (path: string) => {
  router.push(path)
}

// 兼容路由后退导致的Tab高亮变化
watch(
  () => route.path,
  (val) => {
    active.value = val
  }
)
</script>

<style lang="less" scoped></style>
