import request from '@/utils/request'
import type {ApiResponse} from '@/types'

// 这个是 获取用户信息接口 获取得到的信息
export interface UserDetailData {
    userName: string
    nickName: string
    headImgUrl: string
    language: string
    vipType: number
    vipLevel: number
    expirationTime: string
    wavePoints: number
    vipPoints: number
    buyPoints: number
    giftPoints: number
    desc: string | null
    msgCount: string
}

// 获取验证码
export const getSmsCodeApi = (mobile: number) => {
    return request.get('/v1/login/send/smsCode', {
        params: {mobile},
    }) as unknown as Promise<ApiResponse<string>>
}

// 短信验证码登录（手机号 + 验证码）
// 后端字段为 mobile / verifyCode / invitationsCode
export const loginBySmsCodeApi = (
    payload: { mobile: string; verifyCode: string; invitationsCode?: string }) => {
    return request.post('/v1/login/loginBySmsCode', payload) as unknown as Promise<ApiResponse<any>>
}
// 用户密码登录 
export const loginByPwd = (
    payload: { mobile: string; pwd: string; invitationsCode?: string | undefined }
) => {
    return request.post('/v1/login/loginByPwd', payload) as unknown as Promise<ApiResponse<any>>
}
// 团队登录
export const teamLogin = (
    payload: {
        userName: string,
        pwd: string
    }
) => {
    return request.post('/v1/sonLogin/loginByPwd', payload) as unknown as Promise<ApiResponse<any>>
}
// 用户验证手机号更变密码（登录页忘记密码）
export const changePwdBySms = (payload: {
    mobile: string,
    verifyCode: string,
    newPwd: string,
    newPwdAgain: string
}) => {
    return request.post('/v1/pwd/changePwdBySms', payload) as unknown as Promise<any>
}
// 登录成功后  获取用户信息
export const getUserDetailsApi = () => {
    return request.get('/v1/user/getUserDetails')
}
// 用户登出
export const logout = () => {
    return request.get('/v1/login/logout')
}
// 用户扫码登录- 获取微信二维码
export const getWechatQrCodeApi = () => {
    return request.get('/v1/login/getUserWechatQrUrl')
}
// 用户扫码登录 - 轮询获取当前登录
export const getUserWechat = (params: { sceneId: string }) => {
    return request.get('/v1/login/getUserWechat', {params})
}
// 用户第一次登录 - 绑定手机号
export const doUserWechatLogin = (data: {
    mobile: string;
    verifyCode: number;
    openId: string;
    invitationsCode?: string;
}) => {
    return request.post('/v1/login/doUserWechatLogin', data) as unknown as Promise<ApiResponse<any>>
}
































