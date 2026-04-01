<template>
  <div v-if="visible" class="custom-modal-overlay" @click.self="closeDialog">
    <div class="edit-modal-ui">
      <button class="close-btn" @click="closeDialog">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#999999" stroke-width="2"
             stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
      <h2 class="modal-title">编辑</h2>

      <div class="form-container">
        <div class="form-group">
          <label class="form-label">昵称编辑</label>
          <input maxlength="20" type="text" v-model="form.nickName" class="input-box" placeholder="请输入昵称"/>
        </div>

        <div class="form-group role-group">
          <label class="form-label">角色</label>
          <div class="custom-select" @click="isRoleDropdownOpen = !isRoleDropdownOpen">
            <span v-if="form.role === 1" class="role-badge admin">管理员</span>
            <span v-else class="role-badge member">成员</span>

            <div class="arrow-circle" :class="{ 'is-open': isRoleDropdownOpen }">
              <img :src="images.enumArrow" alt=""/>
            </div>
          </div>

          <div v-if="isRoleDropdownOpen" class="role-dropdown-menu">
            <div class="dropdown-item" :class="{ 'is-active': form.role === 1 }" @click.stop="selectRole(1)">管理员
            </div>
            <div class="dropdown-item" :class="{ 'is-active': form.role === 0 }" @click.stop="selectRole(0)">成员</div>
          </div>
        </div>
        <div class="form-button">
          <button @click="submit" class="submit-btn edit-submit" >
            {{ isSubmitting ? '确定修改' : '确定修改' }}
          </button>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref, reactive, watch} from 'vue'
import {ElMessage} from 'element-plus'
import {images} from '@/assets'
import teamApi from "@/api/teamManage.ts";
import {baseRules} from "@/utils/validationSchemas.ts";
// 定义接收的 Props
const props = defineProps<{
  visible: boolean
  memberData: any
}>()

// 定义向外发送的事件
const emit = defineEmits(['update:visible', 'success'])

const isSubmitting = ref(false)
const isRoleDropdownOpen = ref(false)

// 组件内部的表单状态
const form = reactive({
  itemUserId: '',  // string 类型
  nickName: '',   // string 类型
  role: 0         // number 类型 (0成员 1管理员)
})

// 监听弹窗打开，并同步父组件传来的数据
watch(() => props.visible, (newVal) => {
  if (newVal && props.memberData) {
    form.itemUserId = props.memberData.id  // 被操作用户唯一id
    form.nickName = props.memberData.nickName // 被操作用户 名字
    form.role = Number(props.memberData.role) //
    isRoleDropdownOpen.value = false
  }
})

// 关闭弹窗
const closeDialog = () => {
  emit('update:visible', false)
  isRoleDropdownOpen.value = false
}

// 选择角色
const selectRole = (role: number) => {
  form.role = role
  isRoleDropdownOpen.value = false
}

// 提交编辑
const submit = async () => {
  if (!form.nickName) {
    ElMessage.warning('请输入昵称')
    return
  }
  if (!form.itemUserId) {
    ElMessage.error('缺失用户ID，无法编辑')
    return
  }

  isSubmitting.value = true

  try {
    // 调用 编辑 团队成员接口
    // 表单验证
    const teamName = baseRules.teamName.safeParse(form.nickName)
    if(!teamName.success){
      // 解析失败，打印 zod 里面的提示
      return ElMessage.error(teamName.error.issues[0].message)
    }
    const res = await teamApi.changeRoleBySonUser({
      itemUserId: form.itemUserId,
      nickName: form.nickName,
      role: form.role
    })
    if (String((res as any).code) === '0000') {
      ElMessage.success('编辑成功')
      emit('success')
      closeDialog()
    }else {
      console.log(res)
      ElMessage.error((res as any).msg)
    }

  } catch (e) {
    ElMessage.error((e as any).msg)
    isSubmitting.value = false
  }
}
</script>

<style lang="scss" scoped>
/* 遮罩层 */
.custom-modal-overlay {
  display: flex;
  align-items: center;
  justify-content: center;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 3119;
}

/* 编辑弹窗白底专属样式 */
.edit-modal-ui {
  position: relative;
  background: #FFFFFF;
  border-radius: 16px;
  width: 407px;
  height: 404px;
  padding: 40px 28px;
  box-sizing: border-box;

  .close-btn {
    position: absolute;
    top: 20px;
    right: 20px;
    background: none;
    border: none;
    cursor: pointer;
    transition: transform 0.2s;

    &:hover {
      transform: scale(1.1);
    }
  }

  .modal-title {
    font-size: 30px;
    line-height: 60px;
    font-weight: 900;
    color: rgba(17, 24, 39, 1);
    text-align: center;
    margin: 0 0 32px 0;
    font-family: Inter-black, serif;
  }

  .form-container {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 8px;

    .form-label {
      font-size: 11px;
      color: rgba(107, 114, 128, 1);
      font-weight: bold;
    }

    .input-box {
      background-color: #FFFFFF;
      width: 351px;
      height: 49px;
      border-radius: 8px;
      padding: 0 16px;
      font-size: 14px;
      box-sizing: border-box;
      border: 1px solid rgba(55, 65, 81, 1);
      outline: none;
      transition: border-color 0.2s;
      color: $color-text-gray;

      &:focus {
        border-color: #38BDF8;
      }
    }

    &.role-group {
      position: relative;
    }

    .custom-select {
      width: 351px;
      height: 49px;
      border: 1px solid #CBD5E1;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 12px;
      box-sizing: border-box;
      cursor: pointer;
      user-select: none;

      .role-badge {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        height: 26px;
        padding: 0 25px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: bold;

        &.admin {
          background: linear-gradient(180deg, #60C3F8 0%, #38BDF8 100%);
          color: #FFFFFF;
        }

        &.member {
          background: transparent;
          color: #94A3B8;
          border: 1px solid #334155;
        }
      }

      .arrow-circle {
        transform: rotate(180deg);
        width: 24px;
        height: 24px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.2s;

        &.is-open {
          transform: rotate(360deg);
        }
      }
    }

    .role-dropdown-menu {
      position: absolute;
      top: 76px;
      right: 0;
      width: 116px;
      height: 81px;
      background: #0A0F1D;
      border: 1px solid #1E293B;
      border-radius: 8px;
      z-index: 100;
      display: flex;
      flex-direction: column;
      padding: 12px;
      box-sizing: border-box;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);

      .dropdown-item {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        color: #94A3B8;
        cursor: pointer;
        border-radius: 4px;
        transition: all 0.2s;

        &:hover, &.is-active {
          background: linear-gradient(180deg, #60C3F8 0%, #38BDF8 100%);
          color: #FFFFFF;
          font-weight: bold;
        }
      }
    }
  }

  .form-button {
    display: flex;
    align-items: center;
    justify-content: flex-end;

    .submit-btn {
      margin-top: 10px;
      width: 89px;
      height: 34px;
      border-radius: 4px;
      color: rgba(16, 16, 16, 1);
      font-size: 14px;
      text-align: center;
      font-family: -regular, serif;
      color: #ffffff;
      border: none;
      font-weight: bold;
      cursor: pointer;
      transition: background-color 0.2s;
      background-color: rgba(23,160,225,1);
      &:hover{
        background-color: #1575A2;
      }
    }
  }
}
</style>