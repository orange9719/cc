<!--
 * @Author: CC
 * @Date: 2024-03-12 11:21:32
 * @LastEditTime: 2024-05-19 14:52:17
 * @Description: 登录页面
-->

<template>
  <var-loading type="wave" size="large" />
</template>

<script setup lang="ts">
import qs from 'qs'
import { mainStore } from '@/store'
import { GetUserInfo } from '@/server/http'
import { isMobile } from '@/utils'

// 路由管理器
const router = useRouter()
// 当前路由
const route = useRoute()
// 状态管理器
const store = mainStore()

const getCode = () => {
  // 非静默授权，第一次有弹框
  const code = getUrlParam('code')
  // 截取路径中的code，如果没有就去微信授权，如果已经获取到了就直接传code给后台获取openId
  let local = window.location.href
  
  if (code == null || code === '' || store.wxHistoryCode?.includes(code)) {
    if(code) local = `${location.origin}${location.pathname}${location.hash}`
    if(code == null || code === '') store.wxHistoryCode = []

    window.location.href =
      'https://open.weixin.qq.com/connect/oauth2/authorize?appid=' +
      import.meta.env.VITE_APP_ID +
      '&redirect_uri=' +
      encodeURIComponent(local) +
      '&response_type=code&scope=snsapi_privateinfo&agentid=' + import.meta.env.VITE_AGENT_ID + '&state=' + encodeURIComponent(qs.stringify(redirectQuery.value)) + '#wechat_redirect'
  } else {
    store.wxHistoryCode.push(code)
    getUserInfo(code)
  }
}

const getUrlParam = (name: string) => {
  const reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)')
  const r = window.location.search.substr(1).match(reg)
  if (r != null) return decodeURIComponent(r[2])

  return ''
}

// 获取微信提供的用户信息
const getUserInfo = (code: string) => {
  const query = qs.parse(decodeURIComponent(getUrlParam('state')))
  const path = '/home'

  const params = {
    code
  }

  GetUserInfo(params).then((res: any) => {
    store.user = res
    store.isMobile = isMobile()
    localStorage.token = res.token
    
    router.push({
      path,
      query
    })
  })
}

// 登录后重定向的参数
const redirectQuery = ref({})

onBeforeMount(() => {
  redirectQuery.value = route.query
  getCode()
})
</script>
<style lang="less" scoped>
.var-loading {
  position: fixed;
  top: 40%;
  left: 50%;
  transform: translate3d(-50%, -50%, 0);
}
</style>
