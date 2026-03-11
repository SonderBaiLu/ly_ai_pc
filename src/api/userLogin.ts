import request from '@/utils/request';
// 定义接口返回的类型
interface SmsCodeResponse {
    success: boolean;
    data: string;
    extend: any;
    msg: string;
    code: string;
}
// 获取验证码的 API 函数
const getSmsCodeApi =
    (mobile: string) => {
    return request.get<any, SmsCodeResponse>('/api/v1/login/send/smsCode',{
        // GET 请求使用 params，axios 会自动拼接到 URL 后: ?mobile=xxx
        params: {mobile}
    })
}