import App from './App.vue'
import { setupRouter } from './router'
import { setupStore } from './store'
import 'normalize.css/normalize.css'
import '@varlet/touch-emulator'
import '@varlet/ui/es/style'
import 'ant-design-vue/dist/reset.css'
import '@wangeditor/editor/dist/css/style.css'
import './assets/css/index.less'

const app = createApp(App)

setupStore(app) // 配置store

setupRouter(app) // 配置router

app.mount('#app')
