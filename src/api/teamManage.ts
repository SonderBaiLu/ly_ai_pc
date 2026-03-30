import request from '@/utils/request'
import type {ApiResponse} from '@/types'


export const teamApi = {
    // 新增团队用户
    sonUserRegister(params: {
        userName: string,
        nickName: string,
    }) {return request.post('/v1/user/sonUserRegister', params) as unknown as Promise<ApiResponse<any>>},
    // 删除团队用户
    deleteUser(params: { itemUserId: string, }){return request.post(`/v1/user/removeBySonUser`, params) as unknown as Promise<ApiResponse<any>>},
    // 获取团队成员列表
    getSonUserPage(params: { nickName?: string, currentPage: number, pageSize: number }) {
        return request.post('/v1/user/getSonUserPage', params) as unknown as Promise<ApiResponse<any>>
    },
    // 编辑团队用户信息
    changeRoleBySonUser(params: {
        itemUserId: string,
        nickName: string,
        role: number,
    }) {return request.post('/v1/user/changeRoleBySonUser', params)},
    // 停用 团队用户
    changeStatusBySonUser(params: { itemUserId: string, status: number, }){
        return request.post('/v1/user/changeStatusBySonUser',params) as unknown as Promise<ApiResponse<any>>
    },
    // 重置团队成员密码
    changeSonUser(params: { itemUserId: string, }){
        return request.post('/v1/user/changeSonUserPwd',params) as unknown as Promise<ApiResponse<any>>
    },
    // 团队用户开启
    registerByMainUser(params: object) {
        return request.post('/v1/user/registerByMainUser', params) as unknown as Promise<ApiResponse<any>>
    }
}
export default teamApi
