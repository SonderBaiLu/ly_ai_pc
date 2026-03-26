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
    getSonUserPage(params: { nickName?: string, }) {
        return request.post('/v1/user/getSonUserPage', params) as unknown as Promise<ApiResponse<any>>
    },
    // 编辑团队用户信息
    changeRoleBySonUser(params: {
        itemUserId: string,
        nickName: string,
        role: number,
    }) {return request.post('/v1/user/changeRoleBySonUser', params)}


}
export default teamApi
