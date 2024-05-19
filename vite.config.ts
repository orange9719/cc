import fs from 'fs'
import { defineConfig, loadEnv, ConfigEnv, UserConfig } from 'vite'
import { resolve } from 'path'
import vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite'
import AutoImport from 'unplugin-auto-import/vite'
import legacy from '@vitejs/plugin-legacy'
import { AntDesignVueResolver } from 'unplugin-vue-components/resolvers'
import { VarletImportResolver } from '@varlet/import-resolver'
import { createHtmlPlugin } from 'vite-plugin-html'
import autoprefixer from 'autoprefixer'
import { visualizer } from 'rollup-plugin-visualizer'
import browserslist from 'browserslist'

const browserslistConfig = browserslist.loadConfig({ path: '.' })

const timeStamp = new Date().getTime() // 时间戳
const assetsDir = 'static' // 生产环境构建文件的目录

export default defineConfig(({ mode }: ConfigEnv): UserConfig => {
  const env = loadEnv(mode, process.cwd()) // 环境变量
  const optimizeDepsIncludes: string[] = ['qs', 'axios', '@vueuse/core', '@wangeditor/editor-for-vue']
 
  fs.readdirSync('node_modules/@varlet/ui/es').map(dirname => {
    fs.access(`node_modules/@varlet/ui/es/${dirname}/style/index.mjs`, err => {
      if (!err) {
        optimizeDepsIncludes.push(`@varlet/ui/es/${dirname}/style/index`)
      }
    })
  })

  return {
    base: env.VITE_PROJECT_BASE,
    plugins: [
      vue({
        template: {
          transformAssetUrls: {
            video: ['src', 'poster'],
            img: ['src'],
            'var-avatar': ['src'],
            'var-image': ['src']
          }
        }
      }),
      legacy({
        targets: browserslistConfig,
        additionalLegacyPolyfills: ['regenerator-runtime/runtime'],
        polyfills: [
          'es.object.has-own',
        ],
        modernPolyfills: ['es.object.has-own'],
        renderLegacyChunks: true // 编译一份额外的针对传统浏览器(不支持esm的浏览器)的代码
      }),
      Components({
        dts: true,
        dirs: ['src/components', 'src/views'],
        resolvers: [
          VarletImportResolver(),
          AntDesignVueResolver({
            importStyle: false, // css in js
          })
        ]
      }),
      AutoImport({
        imports: ['vue', 'vue-router', 'pinia'],
        dts: true,
        resolvers: [
          VarletImportResolver({ autoImport: true })
        ]
      }),
      createHtmlPlugin({
        /**
         * 需要注入 index.html ejs 模版的数据
         */
        inject: {
          data: {
            title: env.VITE_TITLE
          }
        }
      }),
      visualizer()
    ],
    build: {
      target: 'modules', // 设置最终构建的浏览器兼容目标
      outDir: 'dist', // 指定输出路径（相对于项目根目录)
      assetsDir, // 指定生成静态资源的存放路径
      minify: 'terser', // 混淆器
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              const arr = id.toString().split('node_modules/')[1].split('/')
              switch (arr[0]) {
                case '@vueuse/core':
                case '@vue':
                case '@wangeditor':
                case 'ant-design-vue':
                case '@ant-design':
                case '@varlet':
                case 'element-plus':
                  return '_' + arr[0]
                default:
                  return '__vendor'
              }
            }
          },
          chunkFileNames: `${assetsDir}/js/[name].[hash].${timeStamp}.js`,
          entryFileNames: `${assetsDir}/js/[name].[hash].${timeStamp}.js`,
          assetFileNames: `${assetsDir}/[ext]/[name].[hash].${timeStamp}.[ext]`
        }
      },
      terserOptions: {
        compress: {
          drop_console: true, // 生产环境移除console
          drop_debugger: true // 生产环境移除debugger
        },
        output: {
          comments: true // 去掉注释内容
        }
      }
    },
    optimizeDeps: {
      include: optimizeDepsIncludes
    },
    resolve: {
      alias: {
        '@': resolve(__dirname, './src'),
        '@com': resolve(__dirname, './src/components')
      },
      // 导入时想要省略的扩展名列表,不建议加入 .vue 影响IDE和类型支持
      extensions: ['.js', '.mjs', '.ts', '.jsx', '.tsx', '.json']
    },
    css: {
      postcss: {
        plugins: [
          autoprefixer()
        ]
      }
    },
    server: {
      host: '0.0.0.0',
      port: 9090, // 端口
      hmr: true, // 热更新
      open: true, // 是否自动在浏览器打开
      cors: true, // 允许跨域
      // proxy: {
      //   [env.VITE_API_PREFIX]: {
      //     target: 'http://10.168.13.38:8080',
      //     changeOrigin: true,
      //     // rewrite: pathStr => pathStr.replace('/api', '/api')
      //   }
      // },
      // 预热文件以提前转换和缓存结果，降低启动期间的初始页面加载时长并防止转换瀑布
      warmup: {
        clientFiles: ['./index.html', './src/{views,components}/*']
      }
    }
  }
})