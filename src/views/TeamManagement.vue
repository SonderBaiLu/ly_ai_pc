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
            <input class="searchUser" type="text" placeholder="搜索账号名或昵称..." v-model="queryParams.keyword"
              @keyup.enter="handleSearch" />
          </div>

          <button class="add-btn" @click="openAddDialog">
            <span class="icon">+</span> 添加成员
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
                <img src="../assets/vue.svg" alt="暂无数据" class="empty-img"/>
                <p>{{ loading ? '加载中...' : '暂无团队成员' }}</p>
              </div>
            </td>
          </tr>

            <tr v-for="row in teamList" :key="row.accountId">
              <td>
                <div class="member-info-col">
                  <span class="member-userNameTwo">{{ row.userNameTwo }}</span>
                  <span class="member-name">{{ row.nickName }}</span>
                  <span v-if="row.mainStatus === '1'" class="main-account-badge">主账号</span>
                </div>
              </td>
              <td class="create-time">{{ formatDate(row.createTime) }}</td>
              <td>
                <span :class="['role-tag', row.role === '1' ? 'admin' : 'member']">
                  {{ row.role === '1' ? '管理员' : '成员' }}
                </span>
            </td>
            <td>
                <span :class="['status', row.status === '1' ? 'normal' : 'ban']">
                  <img v-if="row.status === '1'" src="@/assets/images/team/normal.png" class="role-dot" alt="正常"/>
                  <img v-else src="../assets/images/team/banRedDot.png" class="role-dot" alt="封禁"/>
                  {{ row.status === '1' ? '正常' : '封禁' }}
                </span>
              </td>
              <td style="text-align: right;">
                <div class="action-buttons justify-end" v-if="row.accountId !== currentUserId">
                  <template v-if="row.role !== '1'">
                    <button class="action-btn" @click="openConfirm('disable', row)" title="停用">
                      <img :class="['status', row.status === '1' ? 'Disable' : 'NoDisable']"
                        :src="row.status === '1' ? images.ban : images.banRedColor" class="action-icon" alt="停用" />
                      <span class="action-text">
                        {{ row.status === '1' ? '停用' : '取消停用' }}
                      </span>
                    </button>
                  </template>
                  <button class="action-btn" @click="openEdit(row)" title="编辑">
                    <img :src="images.editors" class="action-icon" alt="编辑" />
                    <span class="action-text">编辑</span>
                  </button>
                  <button class="action-btn" @click="openConfirm('resetPwd', row)" title="重置密码">
                    <img :src="images.reset" class="action-icon" alt="重置密码" />
                    <span class="action-text">重置密码</span>
                  </button>
                  <button class="action-btn" @click="openConfirm('delete', row)" title="删除">
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
            <button class="page-btn text-btn" :disabled="queryParams.pageNum === 1"
              @click="changePage(queryParams.pageNum - 1)">
              上一页
            </button>
            <button v-for="page in totalPages" :key="page"
              :class="['page-btn', { 'is-active': queryParams.pageNum === page }]" @click="changePage(page)">
              {{ page }}
            </button>
            <button class="page-btn text-btn" :disabled="queryParams.pageNum === totalPages" @click="changePage(queryParams.pageNum + 1)">
              下一页
            </button>
          </div>
        </div>
      </div>
    </footer>

    <div v-if="addDialogVisible" class="custom-modal-overlay">
      <div class="custom-modal">
        <button class="close-btn" @click="closeAddDialog">
          <img :src="images.closeDialog" alt="关闭" style="width: 14px; height: 14px;"/>
        </button>
        <h2 class="modal-title">添加成员</h2>

        <div class="form-container">
          <div class="form-group">
            <label class="form-label">账号名</label>
            <div class="input-wrapper">
              <input type="text" v-model="addForm.nickName" class="form-input" placeholder="请输入账号名"/>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">密码 <span class="label-hint">6-20个数字、字母组成</span></label>
            <div class="input-wrapper">
              <input :type="showPwd ? 'text' : 'password'" v-model="addForm.password" class="form-input"
                     placeholder="请输入密码"/>
              <span class="icon-eye" @click="showPwd = !showPwd">
                <img :src="showPwd ? images.eye : images.eyeClose" alt=""/>
              </span>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">确认密码</label>
            <div class="input-wrapper">
              <input :type="showConfirmPwd ? 'text' : 'password'" v-model="addForm.confirmPassword" class="form-input"
                     placeholder="请再次输入密码确认"/>
              <span class="icon-eye" @click="showConfirmPwd = !showConfirmPwd">
                <img :src="showConfirmPwd ? images.eye : images.eyeClose" alt=""/>
              </span>
            </div>
          </div>

          <button @click="submitAddMember" class="submit-btn" :disabled="isSubmitting">
            {{ isSubmitting ? '添加中...' : '确定添加' }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="confirmDialog.visible" class="custom-modal-overlay">
      <div class="custom-modal confirm-modal">
        <h2 class="modal-title">{{ confirmDialog.title }}</h2>
        <p class="confirm-message">{{ confirmDialog.message }}</p>
        <div class="confirm-actions">
          <button class="cancel-btn" @click="confirmDialog.visible = false">取消</button>
          <button class="submit-btn confirm-submit" @click="executeConfirm">确定</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref, reactive, computed, onMounted} from 'vue'
import {ElMessage} from 'element-plus' // 仅保留轻提示，用于成功/失败提示
import Header from '@/components/Header.vue'
import {images} from '@/assets'
import {useUserStore} from '@/stores/user'

const userStore = useUserStore()
const currentUserId = userStore.userInfo?.userId || ''

const loading = ref(false)
const teamList = ref<any[]>([])
const total = ref(0)

const queryParams = reactive({
  pageNum: 1,
  pageSize: 8,
  keyword: ''
})

// 新增：计算总页数
const totalPages = computed(() => Math.ceil(total.value / queryParams.pageSize))

// 新增：计算左下角的分页显示文本
const paginationText = computed(() => {
  if (total.value === 0) return '暂无数据';
  const start = (queryParams.pageNum - 1) * queryParams.pageSize + 1;
  const end = Math.min(queryParams.pageNum * queryParams.pageSize, total.value);
  return `当前显示 ${start}-${end} 条，共 ${total.value}条记录`;
});

const addDialogVisible = ref(false)
const isSubmitting = ref(false)
const showPwd = ref(false)
const showConfirmPwd = ref(false)
const addForm = reactive({nickName: '', password: '', confirmPassword: ''})

// 确认弹窗状态
const confirmDialog = reactive({
  visible: false,
  type: '', // 'remove' or 'transfer'
  title: '',
  message: '',
  targetRow: null as any
})

// 格式化日期为 YYYY-MM-DD
const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  return dateStr.split(' ')[0];
}
// 模拟加载数据
const allMockData = [
  { id: '1', nickName: 'admin_test', createTime: '2023-10-01 12:00:00', role: '1', userNameTwo: 'AC', status: '1', mainStatus: '1' },
  { id: '2', nickName: 'member_01', createTime: '2023-10-05 14:30:00', role: '0', userNameTwo: 'SW', status: '0', mainStatus: '0' },
  { id: '3', nickName: 'member_02', createTime: '2023-10-06 09:15:00', role: '1', userNameTwo: 'LM', status: '1', mainStatus: '0' },
  { id: '4', nickName: 'member_03', createTime: '2023-10-06 09:15:00', role: '0', userNameTwo: 'JR', status: '0', mainStatus: '1' },
  { id: '5', nickName: 'member_04', createTime: '2023-10-06 09:15:00', role: '1', userNameTwo: 'EZ', status: '1', mainStatus: '0' },
  { id: '6', nickName: 'member_05', createTime: '2023-10-06 09:15:00', role: '0', userNameTwo: 'CE', status: '1', mainStatus: '0' },
  { id: '7', nickName: 'member_06', createTime: '2023-10-06 09:15:00', role: '0', userNameTwo: 'HT', status: '1', mainStatus: '0' },
  { id: '8', nickName: 'member_07', createTime: '2023-10-06 09:15:00', role: '0', userNameTwo: 'NM', status: '1', mainStatus: '0' },
  // 下面是第二页的数据
  { id: '9', nickName: 'member_08', createTime: '2023-10-07 10:00:00', role: '0', userNameTwo: 'A8', status: '1', mainStatus: '0' },
  { id: '10', nickName: 'member_09', createTime: '2023-10-07 11:00:00', role: '0', userNameTwo: 'A9', status: '1', mainStatus: '0' },
  { id: '11', nickName: 'member_10', createTime: '2023-10-08 09:00:00', role: '0', userNameTwo: 'B1', status: '1', mainStatus: '0' },
  { id: '12', nickName: 'member_11', createTime: '2023-10-08 10:00:00', role: '0', userNameTwo: 'B2', status: '1', mainStatus: '0' },
  { id: '13', nickName: 'member_12', createTime: '2023-10-08 11:00:00', role: '0', userNameTwo: 'B3', status: '1', mainStatus: '0' },
  { id: '14', nickName: 'member_13', createTime: '2023-10-09 14:00:00', role: '0', userNameTwo: 'B4', status: '1', mainStatus: '0' },
  { id: '15', nickName: 'member_14', createTime: '2023-10-09 15:00:00', role: '0', userNameTwo: 'B5', status: '1', mainStatus: '0' },
];

// 分页逻辑
const fetchTeamList = async () => {
  loading.value = true
  try {
    setTimeout(() => {
      total.value = allMockData.length;
      const startIdx = (queryParams.pageNum - 1) * queryParams.pageSize;
      const endIdx = startIdx + queryParams.pageSize;
      teamList.value = allMockData.slice(startIdx, endIdx);
      loading.value = false
    }, 500)
  } catch {
    loading.value = false
  }
}

// 新增：分页切换函数
const changePage = (page: number) => {
  if (page < 1 || page > totalPages.value) return
  queryParams.pageNum = page
  fetchTeamList()
}

// 搜索
const handleSearch = () => {
  queryParams.pageNum = 1
  fetchTeamList()
}

// 添加成员
const openAddDialog = () => {
  addForm.nickName = ''
  addForm.password = ''
  addForm.confirmPassword = ''
  showPwd.value = false
  showConfirmPwd.value = false
  addDialogVisible.value = true
}

const closeAddDialog = () => addDialogVisible.value = false

const submitAddMember = async () => {
  if (!addForm.nickName) return ElMessage.warning("请输入账号名")
  if (!addForm.password) return ElMessage.warning("请输入密码")
  if (addForm.password !== addForm.confirmPassword) return ElMessage.warning("两次输入的密码不一致")

  isSubmitting.value = true
  setTimeout(() => {
    ElMessage.success('添加成功')
    closeAddDialog()
    fetchTeamList()
    isSubmitting.value = false
  }, 500)
}

// 打开二次确认弹窗
const openConfirm = (type: 'disable' | 'resetPwd' | 'delete', row: any) => {
  confirmDialog.type = type
  confirmDialog.targetRow = row

  if (type === 'disable') {
    confirmDialog.title = '停用成员'
    confirmDialog.message = `确定要停用成员【${row.nickName}】的账号吗？`
  } else if (type === 'resetPwd') {
    confirmDialog.title = '重置密码'
    confirmDialog.message = `确定要重置成员【${row.nickName}】的密码吗？`
  } else if (type === 'delete') {
    confirmDialog.title = '删除成员'
    confirmDialog.message = `确定要将成员【${row.nickName}】从团队中删除吗？`
  }
  confirmDialog.visible = true
}

// 执行二次确认逻辑
const executeConfirm = async () => {
  confirmDialog.visible = false
  if (confirmDialog.type === 'disable') {
// TODO: 调用停用接口
    ElMessage.success('已停用该成员')
  } else if (confirmDialog.type === 'resetPwd') {
    // TODO: 调用重置密码接口
    ElMessage.success('密码已重置')
  } else if (confirmDialog.type === 'delete') {
    // TODO: 调用删除接口
    ElMessage.success('删除成功')
  }
  await fetchTeamList()
}
// 打开编辑功能
const openEdit = (row: any) => {
  // TODO: 打开编辑弹窗的逻辑
  ElMessage.info(`点击了编辑成员：${row.nickName}`)
}

onMounted(() => {
  fetchTeamList()
})
</script>

<style lang="scss" scoped>
.page-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #050505;
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
    margin-bottom: 24px;
    padding-bottom: 24px;
    border-bottom: 2px solid rgba(30, 41, 59, 1);

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
        .searchUser {
          width: 256px;
          height: 38px;
          border-radius: 8px;
          background-color: #0F172A;
          border: 1px solid #334155;
          padding: 0 16px;
          color: #ffffff;
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s;

          &::placeholder {
            color: rgba(255, 255, 255, 0.3);
          }

          &:focus {
            border-color: #38BDF8;
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

        &:hover {
          background-color: #0369A1;
        }
      }
    }
  }

  /* --- Table 样式 --- */
  .table-wrapper {
    width: 100%;
    border-radius: 10px;
    border: 1px solid rgba(51, 65, 85, 0.5);
    padding: 24px;
    margin-right: 15px;
    box-sizing: border-box;
    background-color: rgba(10, 15, 29, 1);
    color: rgba(16, 16, 16, 1);
    font-size: 14px;

    .native-team-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;

      th {
        padding: 14px 16px;
        color: rgba(148, 163, 184, 1);
        line-height: 16px;
        font-weight: 800;
        font-size: 16px;
        text-align: left;
        font-family: Inter-semiBold, serif;
        border-bottom: 2px solid rgba(51, 65, 85, 1);
        vertical-align: middle;
      }

      /* 修改：增加悬停过渡动画 */
      tbody tr {
        transition: background-color 0.2s;
      }

      /* 修改：表格行悬停样式 - 浅蓝背景和底边框 */
      tbody tr:hover {
        background-color: rgba(56, 189, 248, 0.08); /* 浅蓝透明背景 */
        position: relative;
      }

      tbody tr:hover td {
        border-bottom-color: rgba(56, 189, 248, 0.5); /* 悬停时底边框变蓝 */
      }

      td {
        padding: 16px;
        height: 72px;
        color: #F8FAFC;
        font-size: 14px;
        border-bottom: 1px solid rgba(51, 65, 85, 0.5);
        vertical-align: middle;
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
        background: radial-gradient(0.5% 0.5% at 50% 50%, rgba(23, 160, 225, 1) 0%, rgba(112, 197, 237, 1) 100%);
        color: rgba(16, 16, 16, 1);
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
      gap: 14px;

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

        &.text-blue { color: #38BDF8; }
        &.text-red { color: #F87171; }

        &:hover { opacity: 0.8; }

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

/* 新增：底部通栏分页器样式 */
.bottom-pagination {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 56px;
  background-color: #0A0F1D;
  border-top: 1px solid #38BDF8; /* 蓝色的上边框 */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
  color: rgba(148, 163, 184, 1);
  font-size: 14px;
}

.pagination-content {
  width: 100%;
  max-width: 1919px; /* 与表格区域宽度一致 */
  padding: 0 140px; /* 保持与上面 .team-management-container 相同的 padding */
  display: flex;
  justify-content: space-between;
  align-items: center;
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
    border-radius: 4px;
    background-color: #1E293B;
    border: 1px solid transparent;
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
      opacity: 0.5;
    }

    &.text-btn {
      background-color: transparent; /* 文本按钮背景透明 */
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
  z-index: 3119;
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

  /* 添加成员弹窗专用尺寸 */
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
</style>