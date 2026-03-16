import request from '@/utils/request'
import type {ApiResponse} from '@/types'

// 获取验证码
export const getSmsCodeApi = (mobile: number) => {
    return request.get('/v1/login/send/smsCode', {
        params: {mobile},
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
// 检查密码登录
export const loginByPwd = (
    payload: {
        mobile: string;
        pwd: string
    }
) => {
    return request.post('/v1/login/loginByPwd', payload) as unknown as Promise<ApiResponse<any>>
}
