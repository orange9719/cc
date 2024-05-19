<template>
  <a-config-provider :locale="zhCN">
    <router-view v-slot="{ Component }">
      <keep-alive :include="includeList">
        <component :is="Component"></component>
      </keep-alive>
    </router-view>
  </a-config-provider>
</template>

<script setup>
import zhCN from 'ant-design-vue/es/locale/zh_CN'

// 路由管理器
const router = useRouter()
const includeList = ref(['Layout'])

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
