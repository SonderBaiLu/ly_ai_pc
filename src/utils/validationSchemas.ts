import { toTypedSchema } from '@vee-validate/zod';
import * as z from 'zod';

// 定义基础 原子级验证规则
const phoneRegex = /^[3-9]\d{9}$/;

const baseRules = {
    // 手机号： 必填，且符合正则
    phone: z.string()
        .min(1,'请输入手机号')
        .regex(phoneRegex, '手机号格式不正确'),
    // 验证码： 必填 且必须是6位
    code: z.string()
        .length(6, "验证码必须是6位"),
    // 密码：必填，至少6位
    password: z.string()
        .min(6,"密码长度不能小于6位")
        .max(22,"密码长度不能大于22位"),
    // 条款：布尔值，可选可不选 (如果是必选，可以改为 .refine(val => val === true, '必须同意条款'))
    agreeTerms: z.boolean().optional(),
}
// 验证码登录 (手机号 + 验证码 + 条款)
export const codeLoginSchema = toTypedSchema(
    z.object({
        phone: baseRules.phone,
        password: baseRules.password,
        agreeTerms: baseRules.agreeTerms,
    })
)
// 密码登录 (手机号 + 密码)
export const passwordLoginSchema = toTypedSchema(
    z.object({
        phone: baseRules.phone,
        password: baseRules.password,
    })
);