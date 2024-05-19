import piniaPersist from 'pinia-plugin-persistedstate'
import { App } from 'vue'
import router from '@/router'

const piniaStore = createPinia()
piniaStore.use(piniaPersist)

export function setupStore(app: App<Element>) {
  app.use(piniaStore)
}

export const mainStore = defineStore('app', {
  // state 类似组件的data选项，函数形式返回对象
  state: () => {
    return {
      user: {} as any, // 微信用户信息
      wxHistoryCode: [] as string[], // 企业微信CODE
      isMobile: false // 是否是手机端
    }
  },
  getters: {},
  actions: {
    login() {
      // 登录
      localStorage.clear()
      router.replace('/login')
    }
  },
  persist: {
    storage: localStorage // 存储方式
  }
})

export default piniaStore
