export { default as $mitt } from './mitt'
import dayjs from 'dayjs'
import { mainStore } from '@/store'

// 状态管理器
const store = mainStore()

// 获取本地图片地址
export const getImageUrl = (name: string) => {
  return new URL(`../assets/image/${name}`, import.meta.url).href
}

// 获取富文本中的图片src
export const getRichImgUrl = (rich: string) => {
  const imgList: any[] = []
  rich?.replace(/<img [^>]*src=['"]([^'"]+)[^>]*>/g, (_match, capture): any => {
    imgList.push(capture)
  })
  return imgList
}

// 判断移动平台
export const isMobile = () => {
  return !!navigator.userAgent.match(/(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i)
}

// 添加图片水印
export const addWatermark = (imageSrc: string) => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d') as any
    const img = new Image()
    img.crossOrigin = 'Anonymous'
   
    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      ctx.drawImage(img, 0, 0)

      let font = 14
   
      ctx.font = `${font}px serif`
      ctx.fillStyle = 'rgba(238, 238, 238, 0.7)'
      ctx.textBaseline = 'top'

      const { name, mobile, userId } = store.user
      const watermarkText = `${name} ${mobile.slice(-4)}\n${userId} ${dayjs().format('YYYY-M-D')}`
      const lines = watermarkText.split('\n')
      const padding = img.width / 10 // 上下左右间隔

      const textWidth = ctx.measureText(watermarkText).width
      const textHeight = 50

        // 计算水印文本需要重复的次数
      const repeatX = Math.ceil(canvas.width / (textWidth + padding))
      const repeatY = Math.ceil(canvas.height / (textHeight + padding))

      // 创建水印元素并设置样式
      for (var i = 0; i < repeatY; i++) {
        for (var j = 0; j < repeatX; j++) {
          const x = j * (textWidth + padding);
          const y = i * (textHeight + padding);
          // 分割文本并逐行绘制
          for (let k = 0; k < lines.length; k++) {
            const line = lines[k]
            ctx.fillText(line, x, y + k * 16)
          }
        }
      }

      resolve(canvas.toDataURL())
    }

    img.onerror = (err) => {
      reject(err)
    }
   
    img.src = imageSrc
  })
}