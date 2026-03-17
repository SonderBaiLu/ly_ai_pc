import request from '@/utils/request'
import type { ApiResponse } from '@/types'

// 获取验证码
export const getSmsCodeApi = (mobile: number) => {
    return request.get('/v1/login/send/smsCode', {
        params: { mobile },
    }) as unknown as Promise<ApiResponse<string>>
}

// 短信验证码登录（手机号 + 验证码）
// 后端字段为 mobile / verifyCode
export const loginBySmsCodeApi = (
    payload: {
        mobile: string;
        verifyCode: string
    }) => {
    return request.post('/v1/login/loginBySmsCode', payload) as unknown as Promise<ApiResponse<any>>
}
// 用户密码登录 
export const loginByPwd = (
    payload: {
        mobile: string;
        pwd: string
    }
) => {
    return request.post('/v1/login/loginByPwd', payload) as unknown as Promise<ApiResponse<any>>
}
// 团队登录
export const teamLogin = (payload: { userName: string, pwd: string }) => {
    return request.post('/v1/sonLogin/loginByPwd', payload) as unknown as Promise<ApiResponse<any>>
}
// 用户验证手机号更变密码（登录页忘记密码）
export const changePwdBySms = (payload: {
    mobile: string,
    verifyCode: number,
    newPwd: number,
    newPwdAgain: number
}) => {
    return request.post('/v1/pwd/changePwdBySms', payload) as unknown as Promise<any>
}
