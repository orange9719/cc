import { App } from 'vue'
import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login.vue'),
    meta: { title: '登录', keepAlive: false, requiresAuth: false }
  },
  {
    path: '/',
    component: () => import('@com/layout/Layout.vue'),
    redirect: '/home',
    children: [
      {
        path: '/home',
        name: 'home',
        component: () => import('@/views/home.vue'),
        meta: { title: '首页', keepAlive: true, requiresAuth: true }
      }
    ]
  },
  {
    path: '/editor',
    name: 'editor',
    component: () => import('@/views/editor.vue'),
    meta: { title: '富文本', keepAlive: true, requiresAuth: true }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'error_404',
    component: () => import('@/views/error_404.vue'),
    meta: { title: '404' }
  }
]

const router = createRouter({
  history: createWebHashHistory(import.meta.env.VITE_PROJECT_BASE),
  routes,
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { left: 0, top: 0 }
    }
  }
})

// 路由守卫  进入页面之前
router.beforeEach((to, _from, next) => {
  if (to.path === '/login') {
    next()
  } else {
    if (to.path === '/' || (to.meta.requiresAuth && !localStorage.token)) {
      next('/login')
    } else {
      next()
    }
  }
})

// 路由守卫  进入页面之后
router.afterEach((to: any) => {
  document.title = to.meta.title || import.meta.env.VITE_TITLE
})

export function setupRouter(app: App<Element>) {
  app.use(router)
}

export default router
