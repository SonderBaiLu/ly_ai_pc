<template>
  <div class="page-layout">
    <Header/>

    <main class="team-management-container pt-header">
      <div class="page-header">
        <div class="header-left">
          <h2 class="page-title">团队成员管理</h2>
          <span class="userconst">共{{ total }}名成员</span>
        </div>

        <div class="header-right">
          <div class="search-wrapper">
            <input class="searchUser" type="text" placeholder="搜索昵称..." v-model="queryParams.keyword"
                   @keyup.enter="handleSearch"/>
            <img class="search-icon" :src="images.teamSearch" alt="teamSearch" @click="handleSearch"/>
          </div>

          <button class="add-btn" @click="openAddDialog">
            <span class="icon">
              <img :src="images.teamAdd" alt=""/>
            </span> 添加成员
          </button>
        </div>
      </div>

      <div class="table-wrapper">
        <table class="native-team-table">
          <thead>
          <tr>
            <th style="width: 25%; text-align: left;">成员信息</th>
            <th style="width: 20%;">注册时间</th>
            <th style="width: 20%;">角色</th>
            <th style="width: 15%;">账号状态</th>
            <th class="endth" style="width: 20%; text-align: right;">操作栏项</th>
          </tr>
          </thead>
          <tbody>
          <tr v-if="teamList.length === 0">
            <td colspan="5">
              <div class="empty-state">
                <p>{{ loading ? '加载中...' : '暂无团队成员' }}</p>
              </div>
            </td>
          </tr>

          <tr v-for="row in teamList" :key="row.id" :class="[{ 'disabled-row': row.joinStatus === 0 }]">
            <td>
              <div class="member-info-col">
                <span class="member-userNameTwo">{{ row.userNameTwo }}</span>
                <span class="member-name">{{ row.nickName }}</span>
                <span v-if="row.mainStatus === 0" class="main-account-badge">主账号</span>
              </div>
            </td>

            <td class="create-time">{{ row.createTime }}</td>

            <td>
      <span :class="['role-tag', row.role === 1 ? 'admin' : 'member']">
        {{ row.role === 1 ? '管理员' : '成员' }}
      </span>
            </td>

            <td>
      <span v-if="row.joinStatus === 0" class="status disabled-status">
        <span class="status-dot gray-dot"></span> 停用
      </span>
              <span v-else :class="['status', row.status === 1 ? 'normal' : 'ban']">
        <img v-if="row.status === 1" src="@/assets/images/team/normal.png" class="role-dot" alt="正常"/>
        <img v-else src="../assets/images/team/banRedDot.png" class="role-dot" alt="封禁"/>
        {{ row.status === 1 ? '正常' : '封禁' }}
      </span>
            </td>

            <td style="text-align: right;">
              <div class="action-buttons justify-end">

                <button class="action-btn" v-if="canOperate(row)" @click="openConfirm('disable', row)" title="停用" :disabled="row.joinStatus === 0">
                  <img :class="['status', row.status === 1 ? 'Disable' : 'NoDisable']"
                       :src="row.status === 1 ? images.ban : images.banRedColor" class="action-icon" alt="停用" />
                  <span class="action-text">
            {{ row.status === 1 ? '停用' : '取消停用' }}
          </span>
                </button>

                <button class="action-btn" v-if="canOperate(row)" @click="openEdit(row)" title="编辑" :disabled="row.joinStatus === 0">
                  <img :src="images.editors" class="action-icon" alt="编辑" />
                  <span class="action-text">编辑</span>
                </button>

                <button class="action-btn" v-if="canResetPwd(row)" @click="openConfirm('resetPwd', row)" title="重置密码" :disabled="row.joinStatus === 0">
                  <img :src="images.reset" class="action-icon" alt="重置密码" />
                  <span class="action-text">重置密码</span>
                </button>

                <button class="action-btn" v-if="canOperate(row)" @click="openConfirm('delete', row)" title="删除" :disabled="row.joinStatus === 0">
                  <img :src="images.deleteT" class="action-icon" alt="删除" />
                  <span class="action-text">删除</span>
                </button>

              </div>
            </td>
          </tr>
          </tbody>
        </table>
      </div>
    </main>

    <footer class="bottom-pagination" v-if="totalPages > 0">
      <div class="pagination-content">
        <div class="pagination-left">
          <span>{{ paginationText }}</span>
        </div>
        <div class="pagination-right">
          <div class="custom-pagination">
            <button class="page-btn text-btn" :disabled="queryParams.currentPage === 1"
                    @click="changePage(queryParams.currentPage - 1)">
              上一页
            </button>
            <button v-for="page in totalPages" :key="page"
                    :class="['page-btn', { 'is-active': queryParams.currentPage === page }]" @click="changePage(page)">
              {{ page }}
            </button>
            <button class="page-btn text-btn" :disabled="queryParams.currentPage === totalPages"
                    @click="changePage(queryParams.currentPage + 1)">
              下一页
            </button>
          </div>
        </div>
      </div>
    </footer>
    <div class="custom-modal-overlay" v-if="confirmDialog.visible">
      <div class="custom-delete-modal">
        <h3 class="modal-title">{{ confirmDialog.title }}</h3>
        <p class="modal-desc">{{ confirmDialog.message }}</p>

        <div class="modal-footer">
          <button class="btn-cancel" @click="confirmDialog.visible = false">取消</button>
          <button class="btn-confirm" @click="handleConfirm">确定</button>
        </div>
      </div>
    </div>

    <EditMemberDialog v-model:visible="editDialogVisible" :member-data="currentEditRow" @success="handleEditSuccess"/>
    <addTeamMember @success="handleEditSuccess" v-model:visible="isDialogVisible"/>
    <ResetPasswordModal
        v-if="showResetPwdModal"
        :userInfo="resetPwdData"
        @close="handleResetModalClose"
    />
  </div>
</template>

<script setup lang="ts">
import {ref, reactive, computed, onMounted} from 'vue'
import Header from '@/components/Header.vue'
import {images} from '@/assets'
import {useUserStore} from '@/stores/user'
import teamApi from "@/api/teamManage.ts";



const userStore = useUserStore()
const myInfo = computed(() => userStore.userInfo || {})
const isMainAccount = computed(() => {
  return myInfo.value.mainAccount === true || String(myInfo.value.mainAccount) === 'true'
})
const isAdmin = computed(() => {
  return myInfo.value.mainAdmin === true || String(myInfo.value.mainAdmin) === 'true'
})
const isSelf = (row: any) => {
  if (!row) return false
  if (isMainAccount.value && (row.mainStatus === 0 || String(row.mainStatus) === '0')) {
    return true
  }
  const myId = String(myInfo.value.userId || myInfo.value.id || '')
  if (myId && String(row.id) === myId) {
    return true
  }
  return !!(myInfo.value.nickName && row.nickName && myInfo.value.nickName === row.nickName);
}
// 编辑/停用/删除 操作权限
const canOperate = (row: any) => {
  // 任何人都不能操作自己（主账号也不能删自己）
  if (isSelf(row)) return false
  // 规则 A：主账号可以操作除了自己之外的任何人
  if (isMainAccount.value) return true
  // 规则 B：管理员只能操作普通成员
  if (isAdmin.value) {
    // 目标如果是主账号 (mainStatus: 0) -> 不能碰
    const isTargetMain = row.mainStatus === 0 || String(row.mainStatus) === '0'
    // 目标如果是同级管理员 (role: 1) -> 不能碰
    const isTargetAdmin = row.role === 1 || String(row.role) === '1'
    // 只有既不是主账号，也不是管理员的普通成员，才放行
     return !isTargetMain && !isTargetAdmin
  }
  // 其他情况无权限
  return false
}

// 4重置密码 权限
const canResetPwd = (row: any) => {
  // 如果是 主账号那么显示 重置密码
  if (myInfo.value.mainAccount) return true
  // 对别人的重置权限 = 常规操作权限
  return canOperate(row)
}

const loading = ref(false)
const teamList = ref<any[]>([])
const joinStatus = ref(1)
const total = ref(0)
// 搜索 分页参数
const queryParams = reactive({
  currentPage: 1,
  pageSize: 8,      // 对应接口的每页数量
  keyword: ''
})

// 计算总页数
const totalPages = computed(() => Math.ceil(total.value / queryParams.pageSize))
// 计算分页显示文本
const paginationText = computed(() => {
  if (total.value === 0) return '暂无数据';
  const start = (queryParams.currentPage - 1) * queryParams.pageSize + 1;
  const end = Math.min(queryParams.currentPage * queryParams.pageSize, total.value);
  return `当前显示 ${start}-${end} 条，共 ${total.value}条记录`;
});



// 1. 调用接口获取完整数据
const searchUsers = async () => {
  loading.value = true
  try {
    const res = await teamApi.getSonUserPage({
      nickName: queryParams.keyword,
      currentPage: queryParams.currentPage,
      pageSize: queryParams.pageSize,
    })
    if (String((res as any).code) === '0000') {
      teamList.value = res.data.list || []
      joinStatus.value = res.data.joinStatus || [1]
      total.value = res.data.total || res.data.list.length // 后端没返回总条数，总数显示会受限
    } else {
      teamList.value = []
      total.value = 0
    }
  } catch (err) {
    console.error('请求失败：', err)
    teamList.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}
// 分页切换（直接调用接口，不再使用前端切片）
const changePage = (page: number) => {
  if (page < 1 || page > totalPages.value) return
  queryParams.currentPage = page
  searchUsers()
}
// 4. 搜索（重置页码 + 重新请求）
const handleSearch = () => {
  queryParams.currentPage = 1
  searchUsers()
}
// ---------------- 弹窗/操作逻辑 ----------------
const isDialogVisible = ref(false)  // 控制 添加成员弹窗的变量
const showPwd = ref(false)
const showConfirmPwd = ref(false)
const addForm = reactive({nickName: '', password: '', confirmPassword: ''})

const openAddDialog = () => {
  addForm.nickName = ''
  addForm.password = ''
  addForm.confirmPassword = ''
  showPwd.value = false
  showConfirmPwd.value = false
  isDialogVisible.value = true
}

// 确认弹窗
const confirmDialog = reactive({
  visible: false,
  type: '',
  title: '',
  message: '',
  targetRow: null as any
})

const openConfirm = (type: 'disable' | 'resetPwd' | 'delete', row: any) => {
  confirmDialog.type = type
  confirmDialog.targetRow = row

  if (type === 'disable') {
    // 动态判断是 停用 还是 启用
    const isEnableAction = row.status === 0; // 默认是0
    confirmDialog.title = isEnableAction ? '启用账号确认' : '停用账号确认'
    confirmDialog.message = isEnableAction
        ? `确定需要启用该账号吗？启用后该成员将恢复正常登录及使用权限。`
        : `确定需要停用该账号吗？停用后将无法登录，请谨慎操作。`
    confirmDialog.visible = true
  } else if (type === 'resetPwd') {
    confirmDialog.title = '重置密码确认'
    confirmDialog.message = `确定需要重置该账号的密码吗？`
    confirmDialog.visible = true

  } else if (type === 'delete') {
    confirmDialog.title = '删除账号确认'
    confirmDialog.message = `确定需要删除该账号吗？删除后将无法登录，请谨慎操作。`
    confirmDialog.visible = true
  }
}
// 控制弹窗显示的变量
const showResetPwdModal = ref(false)

// 存放接口返回的数据
const resetPwdData = ref({
  team: '',
  website: '',
  accountName: '',
  nickname: '',
  password: ''
})

// 确认弹窗的提交操作
const handleConfirm = async () => {
  if (!confirmDialog.targetRow) return
  try {
    // 这里可以根据 confirmDialog.type 来判断调用哪个接口
    if (confirmDialog.type === 'delete') {
      const res = await teamApi.deleteUser({itemUserId: confirmDialog.targetRow.id})
      if (String((res as any).code) === '0000') {
        ElMessage.success('删除成功')
      }
    } else if (confirmDialog.type === 'disable') {
      const targetStatus = confirmDialog.targetRow.status === 1 ? 0 : 1;
      await teamApi.changeStatusBySonUser({
        itemUserId: confirmDialog.targetRow.id,
        status: targetStatus,
      })
      ElMessage.success(targetStatus === 1 ? '账号已启用' : '账号已停用')
    } else if (confirmDialog.type === 'resetPwd') {
      const res = await teamApi.changeSonUser({itemUserId: confirmDialog.targetRow.id})
      if (String((res as any).code) === '0000') {
        ElMessage.success('密码重置成功')
        // 弹出信息展示弹窗
        resetPwdData.value = {
          team: res.data.mainNickName,
          website: res.data.url,
          accountName: res.data.userName,
          nickname: res.data.nickName,
          password: res.data.pwd,
        }
        showResetPwdModal.value = true
      }
    }
    confirmDialog.visible = false
    await searchUsers() // 刷新列表
  } catch (e: any) {
    ElMessage.error(e.message)
  }
}

const handleResetModalClose = () => {
  showResetPwdModal.value = false
}
// 编辑弹窗
const editDialogVisible = ref(false)
const currentEditRow = ref<any>(null)

const openEdit = (row: any) => {
  currentEditRow.value = row
  editDialogVisible.value = true
}

// 编辑成功回调
const handleEditSuccess = () => {
  searchUsers()
}
// ---------------- 生命周期 ----------------

onMounted(() => {
  searchUsers()
})
</script>

<style lang="scss" scoped>
.page-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: rgba(10,15,29,1);
  padding-bottom: 56px;
}

.pt-header {
  padding-top: 100px;
}

.team-management-container {
  flex: 1;
  width: 100%;
  max-width: 1919px;
  padding: 0 140px;
  margin: 56px auto 0;
  box-sizing: border-box;


  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 40px;
    padding-bottom: 24px;
    border-bottom: 1px solid rgba(51, 65, 85, 1);

    .header-left {
      display: flex;
      align-items: center;
      gap: 16px;

      .page-title {
        margin: 0;
        color: #ffffff;
        font-size: 18px;
        font-weight: 600;
        letter-spacing: 0.5px;
      }

      .userconst {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 0 12px;
        height: 24px;
        font-size: 12px;
        color: rgba(255, 255, 255, 0.8);
        border-radius: 4px;
        background-color: #1E293B;
        border: 1px solid #334155;
      }
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 16px;

      .search-wrapper {
        position: relative;
        display: flex;
        align-items: center;

        .searchUser {
          width: 256px;
          height: 38px;
          border-radius: 8px;
          background-color: #0F172A;
          border: 1px solid #334155;
          padding: 0 40px 0 16px;
          color: rgba(156, 163, 175, 1);
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s;
          text-align: justify;
          font-family: Inter-black, serif;
          font-weight: 900;

          &::placeholder {
            color: rgba(156,163,175,1);
            font-size: 14px;
            font-family: Inter-black;
            font-weight: 800;
            text-align: center;
          }

          &:focus {
            border-color: #38BDF8;
          }
        }

        // 搜索框的 搜索图标
        .search-icon {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          width: 16px;
          height: 16px;
          cursor: pointer;
          transition: opacity 0.2s;

          &:hover {
            opacity: 0.8;
          }
        }
      }

      .add-btn {
        display: flex;
        align-items: center;
        gap: 6px;
        height: 38px;
        padding: 0 16px;
        background-color: #0284C7;
        color: #ffffff;
        border: none;
        border-radius: 6px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: background-color 0.2s;

        img {
          width: 15px;
          height: 15px;
        }

        &:hover {
          background-color: #0369A1;
        }
      }
    }
  }

  /* --- Table 样式 --- */
  .table-wrapper {
    //width: 100%;
    margin: 0 32px;
    border-radius: 24px;
    border: 1px solid rgba(51, 65, 85, 0.2);
    box-sizing: border-box;
    background-color: rgba(10, 15, 29, 1);
    color: rgba(16, 16, 16, 1);
    font-size: 14px;
    // 防止内部表头的背景色溢出遮挡圆角
    overflow: hidden;

    .native-team-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
      background-color: #1E293B;

      th {
        padding: 14px 16px;
        color: rgba(148, 163, 184, 1);
        font-weight: 800;
        font-size: 16px;
        text-align: center;
        vertical-align: middle;
        font-family: Inter-semiBold, serif;
        border-bottom: 1px solid rgba(51, 65, 85, 1);
      }

      tbody tr {
        transition: background-color 0.2s;
      }

      tbody tr:hover {
        background-color: rgba(56, 189, 248, 0.08);
        position: relative;
      }

      tbody tr:hover td {
        border-bottom-color: rgba(56, 189, 248, 0.5);
      }
      .disabled-row {
        opacity: 0.5;
        background-color: rgba(30, 41, 59, 0.1);
        &:hover{
          background-color: rgba(30, 41, 59, 0.4) !important;
          td {
            border-bottom-color: rgba(30, 41, 59, 0.2) !important;
          }
        }
      }
      td {
        padding: 16px;
        height: 72px;
        color: #F8FAFC;
        font-size: 14px;
        border-bottom: 1px solid rgba(30, 41, 59, 0.2);
        vertical-align: middle;
        text-align: center;
        .status.disabled-status{
          color: rgba(148, 163, 184, 1);
          display: inline-flex;
          align-items: center;

          .gray-dot {
            display: inline-block;
            width: 9px;
            height: 9px;
            border-radius: 50%;
            background-color: rgba(148, 163, 184, 1);
            margin-right: 4px;
          }
        }
      }

      .create-time {
        color: $color-text-time;
      }
    }

    .member-info-col {
      display: flex;
      align-items: center;
      justify-content: flex-start;
      gap: 12px;

      .member-userNameTwo {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: linear-gradient(135deg, rgba(51, 65, 85, 1) 14.6%, rgba(30, 41, 59, 1) 85.4%);
        border: 1px solid rgba(51, 65, 85, 1);
        color: rgba(56, 189, 248, 1);
        font-size: 14px;
        font-weight: 600;
        font-family: Inter, serif;
      }

      .member-name {
        color: #F8FAFC;
        font-size: 14px;
      }

      .main-account-badge {
        margin-left: 22%;
        padding: 4px 12px;
        width: 88px;
        height: 24px;
        background: radial-gradient(0.5% 0.5% at 50% 50%, rgba(23, 160, 225, 1) 0%, rgba(112, 197, 237, 1) 100%);
        color: rgba(255, 255, 255, 1);
        font-size: 12px;
        font-weight: 600;
        border-radius: 4px 4px 4px 4px;
        text-align: center;
        white-space: nowrap;
      }
    }

    .role-tag {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: 12px;
      font-size: 12px;
      line-height: 1.5;
      padding: 0 16px;
      height: 24px;

      &.admin {
        background-color: rgba(245, 158, 11, 0.08);
        border-radius: 9999px;
        border: 1px solid rgba(245, 158, 11, 0.08);
        color: rgba(245, 158, 11, 1);
        font-size: 11px;
        text-align: left;
        font-family: Inter-bold, serif;
      }

      &.member {
        border-radius: 12px;
        padding: 0 16px;
        background-color: rgba(51, 65, 85, 0.4);
        border: 1px solid rgba(71, 85, 105, 1);
        color: rgba(148, 163, 184, 1);
      }
    }

    .status {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 4px;

      img {
        width: 9px;
        height: 9px;
        margin-right: 4px;
      }

      &.normal {
        color: rgba(16, 185, 129, 1);
        font-size: 14px;
      }

      &.ban {
        color: rgba(255, 119, 119, 1);
        font-size: 14px;
        text-align: left;
      }
    }

    .action-buttons {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 14px;
      width: 100%;

      &.justify-end {
        justify-content: flex-end;
      }

      .action-icon {
        width: 18px;
        height: 18px;
        opacity: 0.85;
        transition: opacity 0.2s;

        &:hover {
          opacity: 1;
        }
      }

      .action-btn {
        background: none;
        border: none;
        padding: 0;
        font-size: 14px;
        cursor: pointer;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 6px;
        &:disabled{
          cursor: not-allowed;
          opacity: 0.4;
          img{
            filter: grayscale(100%);
          }
          .action-text {
            color: #64748B; /* 按钮文字变暗 */
          }
        }
        &.text-blue {
          color: #38BDF8;
        }

        &.text-red {
          color: #F87171;
        }

        &:hover {
          opacity: 0.8;
        }

        .action-text {
          color: #94A3B8;
          font-size: 12px;
          white-space: nowrap;
        }
      }
    }

    .empty-state {
      padding: 60px 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      color: #94A3B8;

      .empty-img {
        width: 120px;
        margin-bottom: 16px;
      }
    }
  }
}

/* 底部通栏分页器样式 */
.bottom-pagination {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 56px;
  background-color: rgba(15, 23, 42, 1);
  border-top: 1px solid rgba(30, 41, 59, 1);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
  color: rgba(148, 163, 184, 1);
  font-size: 14px;
}

.pagination-content {
  width: 100%;
  max-width: 1919px;
  padding: 0 140px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  .pagination-left{
    color: $color-text-white-disabled;
  }
}

.pagination-right {
  display: flex;
  align-items: center;

  .custom-pagination {
    display: flex;
    gap: 8px;
  }

  .page-btn {
    min-width: 32px;
    height: 32px;
    padding: 0 8px;
    background-color: rgba(30, 41, 59, 1);
    border: 1px solid transparent;
    border-radius: 4px 4px 4px 4px;
    color: #94A3B8;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    justify-content: center;
    align-items: center;

    &:hover:not(:disabled) {
      color: #ffffff;
      background-color: rgba(255, 255, 255, 0.05);
    }

    &.is-active {
      color: #38BDF8;
      font-weight: bold;
      background-color: rgba(56, 189, 248, 0.1);
      border-color: #38BDF8;
    }

    &:disabled {
      color: #475569;
      cursor: not-allowed;
    }

    &.text-btn {
      background-color: rgba(30, 41, 59, 1);
      border-radius: 4px 4px 4px 4px;

    }
  }
}

.custom-modal-overlay {
  display: flex;
  align-items: center;
  justify-content: center;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
}

.custom-modal {
  position: relative;
  background: #1E293B;
  border-radius: 16px;
  border: 1px solid #334155;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);

  &.confirm-modal {
    width: 360px;
    padding: 32px;

    .confirm-message {
      color: #94A3B8;
      font-size: 14px;
      text-align: center;
      margin-bottom: 32px;
      line-height: 1.5;
    }

    .confirm-actions {
      display: flex;
      gap: 16px;

      button {
        flex: 1;
        height: 40px;
        border-radius: 8px;
        font-size: 14px;
        cursor: pointer;
      }

      .cancel-btn {
        background: transparent;
        border: 1px solid #334155;
        color: #E2E8F0;

        &:hover {
          background: rgba(255, 255, 255, 0.05);
        }
      }

      .confirm-submit {
        margin-top: 0;
        height: 40px;
      }
    }
  }

  &:not(.confirm-modal) {
    width: 407px;
    padding: 48px 40px 52px;
  }

  .close-btn {
    position: absolute;
    top: 24px;
    right: 24px;
    background: none;
    border: none;
    cursor: pointer;
    opacity: 0.6;
    transition: opacity 0.2s;

    &:hover {
      opacity: 1;
    }
  }

  .modal-title {
    font-size: 20px;
    font-weight: bold;
    color: #ffffff;
    text-align: center;
    margin: 0 0 32px 0;
  }

  .form-container {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 8px;

    .form-label {
      font-size: 14px;
      color: #E2E8F0;

      .label-hint {
        margin-left: 8px;
        font-size: 12px;
        color: #64748B;
      }
    }

    .input-wrapper {
      display: flex;
      align-items: center;
      height: 48px;
      border: 1px solid #334155;
      border-radius: 8px;
      padding: 0 16px;
      background: #0F172A;
      transition: border-color 0.2s;

      &:focus-within {
        border-color: #38BDF8;
      }

      .form-input {
        flex: 1;
        height: 100%;
        border: none;
        outline: none;
        font-size: 14px;
        color: #ffffff;
        background: transparent;

        &::placeholder {
          color: #64748B;
        }
      }

      .icon-eye {
        cursor: pointer;
        opacity: 0.6;
        transition: opacity 0.2s;

        &:hover {
          opacity: 1;
        }

        img {
          width: 16px;
          height: 16px;
        }
      }
    }
  }

  .submit-btn {
    margin-top: 16px;
    width: 100%;
    height: 48px;
    background: #0284C7;
    color: #ffffff;
    border: none;
    border-radius: 8px;
    font-size: 15px;
    font-weight: bold;
    cursor: pointer;
    transition: background-color 0.2s;

    &:hover:not(:disabled) {
      background: #0369A1;
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
}

/* --- 确认弹窗定制样式 --- */
.custom-delete-modal {
  width: 482px;
  height: 228px;
  background-color: rgba(18, 18, 18, 1);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-family: -regular, sans-serif;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);

  .modal-title {
    margin: 0 0 16px 0;
    letter-spacing: 1px;
    color: $color-bg-white;
    font-size: 20px;
    text-align: center;
    font-family: NotoSans-bold, serif;
    font-weight: 800;
  }

  .modal-desc {
    color: $color-bg-white;
    font-size: 16px;
    margin: 0 0 36px 0;
    text-align: center;
    padding: 0 20px;
    font-weight: 300;
  }

  .modal-footer {
    display: flex;
    gap: 24px;

    button {
      width: 142px;
      height: 44px;
      border-radius: 4px;
      font-size: 14px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
    }

    .btn-cancel {
      background: transparent;
      border: 1px solid rgba(255, 255, 255, 0.8);
      color: #ffffff;

      &:hover {
        background: rgba(255, 255, 255, 0.1);
      }
    }

    .btn-confirm {
      background: radial-gradient(0.5% 0.5% at 50% 50%, rgba(23, 160, 225, 1) 0%, rgba(112, 197, 237, 1) 100%);
      border: none;
      color: #ffffff;

      &:hover {
        opacity: 0.9;
        box-shadow: 0 0 10px rgba(56, 189, 248, 0.4);
      }
    }
  }
}
</style>