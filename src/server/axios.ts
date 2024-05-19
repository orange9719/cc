import Axios, { AxiosError, AxiosInstance } from 'axios'
import pinia, { mainStore } from '@/store'

const axios: AxiosInstance = Axios.create({
  // 请求地址
  baseURL: import.meta.env.VITE_API_PREFIX,
  // 请求超时/单位秒
  timeout: 10 * 60 * 1000
})

// 发起请求之前的拦截器
axios.interceptors.request.use(
  config => {
    // 如果有token 就携带tokon
    const token = localStorage.token
    if (token && config.headers) {
      config.headers['X-Access-Token'] = token
    }

    return config
  },
  (error: AxiosError) => {
    Promise.reject(error)
  }
)

// 响应拦截器
axios.interceptors.response.use(
  response => {
    const { request } = response
    const apiData = response.data

    // 二进制流格式白名单
    const responseTypeWhiteList = ['blob', 'arraybuffer']
    if (responseTypeWhiteList.includes(request?.responseType)) {
      return Promise.resolve(response)
    }

    if (apiData.code === 0) {
      return Promise.resolve(apiData)
    } else if (apiData.code === 200) {
      return Promise.resolve(apiData.result)
    } else {
      Snackbar.error(apiData.message)
      return Promise.reject(apiData || 'Error')
    }
  },
  (error: AxiosError) => {
    const store = mainStore(pinia)

    switch (error?.response?.status) {
      case 400:
        error.message = '请求错误'
        break
      case 401:
        store.login()
        break
      case 403:
        error.message = '拒绝访问'
        break
      case 404:
        error.message = '请求地址出错'
        break
      case 408:
        error.message = '请求超时'
        break
      case 500:
        error.message = '服务器内部错误'
        break
      case 501:
        error.message = '服务未实现'
        break
      case 502:
        error.message = '网关错误'
        break
      case 503:
        error.message = '服务不可用'
        break
      case 504:
        error.message = '网关超时'
        break
      case 505:
        error.message = 'HTTP 版本不受支持'
        break
      default:
        break
    }
    
    const { message = '' } = error?.response?.data as responseData
    if(error?.response?.status != 401) {
      Snackbar.error(message || error.message)
    }
    return Promise.reject(error)
  }
)

export default axios
