import { toTypedSchema } from '@vee-validate/zod';
import * as z from 'zod';

// 定义基础 原子级验证规则
const phoneRegex = /^[3-9]\d{9}$/;

export const baseRules = {
    // 手机号： 必填，且符合正则
    phone: z.string()
        .min(1, '请输入手机号')
        .regex(phoneRegex, '手机号格式不正确'),
    // 验证码： 必填 且必须是6位
    code: z.string()
        .length(4, "验证码必须是4位")
        .regex(/^\d+$/, '验证码只能包含数字'),
    //密码必填，6-20位，数字字母组成
    password: z.string()
        .min(6, "密码长度不能小于6位")
        .max(20, "密码长度不能大于20位")
        .regex(/^[a-zA-Z0-9]+$/, "密码只能由数字或字母组成"),
    // 条款：布尔值，可选可不选 (如果是必选，可以改为 .refine(val => val === true, '必须同意条款'))
    agreeTerms: z.boolean().optional(),
    teamName: z.string()
        .min(1, "昵称不能为空")
        .max(20, "昵称不能大于20个字符")
}
// 验证码登录 (手机号 + 验证码 )
export const codeLoginSchema = toTypedSchema(
    z.object({
        phone: z.string().min(1, '请输入手机号').regex(/^1[3-9]\d{9}$/, '手机号格式不正确'),
        code: z.string().length(6, '验证码必须是6位'),
    })
)
// 密码登录 (手机号 + 密码)
export const passwordLoginSchema = toTypedSchema(
    z.object({
        phone: baseRules.phone,
        password: baseRules.password,
    })
);

