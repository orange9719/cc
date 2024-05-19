import axios from './axios'
import qs from 'qs'

// 获取用户信息
export const GetUserInfo = params => axios.get('/wx/user?' + qs.stringify(params))