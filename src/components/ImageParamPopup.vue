<template>
  <el-dialog v-model="showPopup" width="840px" :close-on-click-modal="true" :close-on-press-escape="true"
    :show-close="false" class="image-param-dialog" @close="onClose">
    <template #header>
      <div class="dialog-header">
        <h3 class="dialog-title">{{ dialogTitle }}</h3>
        <img :src="images.closeParams" alt="" class="dialog-close" @click="onClose" />
      </div>
    </template>
    <div class="video-params-container">
      <!-- 算法模型选择 -->
      <div class="param-section">
        <h3 class="section-title">
          {{ selectedAlgorithm.name }}
          <span class="text-sm agree">{{ selectedAlgorithm.algorithmDesc }}</span>
        </h3>
        <el-scrollbar class="scrollbar-bottom">
          <div class="param-options">
            <div v-for="algorithm in algorithmModels" :key="(algorithm as any).id" :class="[
              'version-option',
              selectedAlgorithm.id === (algorithm as any).id ? 'active' : '',
              (algorithm as any).isVip && !userInfo?.isVip ? 'vip-locked' : '',
            ]" @click="selectAlgorithm(algorithm as any)">
              <!-- 背景图片 -->
              <img class="background-image" :src="(algorithm as any).imageUrl || images.imgVideo" />

              <!-- VIP标签 -->
              <img v-if="(algorithm as any).isVip" class="vip-tag" :src="images.vip4" />

              <!-- 选中状态图标 -->
              <img v-if="selectedAlgorithm.id === (algorithm as any).id" class="active-icon" :src="images.checked" />
            </div>
          </div>
        </el-scrollbar>
      </div>

      <!-- 动态渲染参数组（只显示有数据的） -->
      <div v-for="(paramGroup, groupIndex) in selectedAlgorithm.paramGroups"
        v-show="paramGroup.params && paramGroup.params.length > 0" :key="groupIndex" class="param-section">
        <h3 class="section-title">
          {{ getParamGroupTitle(paramGroup.type) }}：{{ getSelectedParamValue(paramGroup.type) }}
          <span v-if="paramGroup.type === 1 && getSelectedParamDesc(paramGroup.type)" class="text-sm agree">
            {{ getSelectedParamDesc(paramGroup.type) }}
          </span>
        </h3>

        <!-- 运镜参数使用横向滚动（单独处理） -->
        <el-scrollbar v-if="paramGroup.type === 3" class="scrollbar-bottom">
          <div class="camera-scroll-view">
            <div v-for="(param, paramIndex) in paramGroup.params" :key="paramIndex" class="camera-item">
              <!-- 图片使用param-item，有边框 -->
              <div :class="[
                'param-item',
                'camera-option',
                {
                  active: isParamSelected(paramGroup.type, param),
                  'vip-locked': param.isVip && !userInfo?.isVip,
                },
              ]" @click="selectParam(paramGroup.type, param, Number(paramIndex))">
                <img :src="param.imageUrl" class="camera-image" />
                <!-- 运镜参数的选中标记（图片右下角） -->
                <img v-if="isParamSelected(paramGroup.type, param)" class="active-icon" :src="images.choose" />
                <!-- VIP标签 -->
                <img v-if="param.isVip" class="vip-tag" :src="images.vip4" />
              </div>
              <!-- 文字在外面，无边框 -->
              <span class="camera-name">{{ param.templateName }}</span>
            </div>
          </div>
        </el-scrollbar>

        <!-- 比例参数使用横向滚动 -->
        <el-scrollbar v-else-if="paramGroup.type === 1" class="scrollbar-bottom">
          <div class="param-options param-scroll-view">
            <div v-for="(param, paramIndex) in paramGroup.params" :id="`ratio-param-${paramIndex}`" :key="paramIndex"
              :class="[
                'param-item',
                getParamItemClass(paramGroup.type),
                {
                  active: isParamSelected(paramGroup.type, param),
                  'vip-locked': param.isVip && !userInfo?.isVip,
                },
              ]" @click="selectParam(paramGroup.type, param, Number(paramIndex))">
              <img :src="param.imageUrl" class="ratio-image" />
              <span>{{ param.templateName }}</span>
              <img v-if="param.isVip" class="vip-tag" :src="images.vip4" />
            </div>
          </div>
        </el-scrollbar>

        <!-- 其他参数使用换行布局 -->
        <div v-else class="scrollbar-bottom">
          <div class="param-options">
            <div v-for="(param, paramIndex) in paramGroup.params" :key="paramIndex" :class="[
              'param-item',
              getParamItemClass(paramGroup.type),
              {
                active: isParamSelected(paramGroup.type, param),
                'vip-locked': param.isVip && !userInfo?.isVip,
              },
            ]" @click="selectParam(paramGroup.type, param)">
              <!-- 比例参数显示图片+文字 -->
              <template v-if="paramGroup.type === 1 && param.imageUrl">
                <img :src="param.imageUrl" class="ratio-image" />
                <span>{{ param.templateName }}</span>
              </template>

              <!-- 其他参数显示文本 -->
              <span v-else>{{ param.templateName }}</span>

              <!-- VIP标签 -->
              <img v-if="param.isVip" class="vip-tag" :src="images.vip4" />
            </div>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="algorithmModels.length === 0" class="empty-state">
        <el-empty description="暂无参数~" />
      </div>
    </div>

    <!-- 底部按钮 -->
    <template #footer>
      <div class="dialog-footer">
        <el-button class="cancel-btn" plain @click="onClose">取消</el-button>
        <el-button type="primary" @click="onConfirm">确定</el-button>
      </div>
    </template>
  </el-dialog>

  <!-- 会员购买弹窗：用于参数中点击 VIP 选项时提示升级会员（只展示会员相关内容） -->
  <MembershipModal v-model="showMembershipModal" error-type="up_vip" :is-vip="isVip" custom-title="会员购买" />
</template>

<script setup lang="ts">
import { useUserStore } from '@/stores/user'
import { storeToRefs } from 'pinia'
import { images } from '@/assets'
import MembershipModal from '@/components/MembershipModal.vue'

// ==================== 状态管理 ====================
const userStore = useUserStore()
const { userInfo } = storeToRefs(userStore)

// 定义组件名称
const componentName = 'ImageParamPopup'

defineOptions({
  name: componentName,
})

// 定义组件属性
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  // 默认参数数组：[算法名称, 参数1, 参数2, ...]
  defaultParams: {
    type: Array,
    default: () => [],
  },
  // 算法模型列表
  algorithmModels: {
    type: Array,
    default: () => [],
  },
  // 弹窗标题
  title: {
    type: String,
    default: '图片参数设置',
  },
  // 是否为多图成片
  isMultiVideo: {
    type: Boolean,
    default: false,
  },
})

// 定义事件
const emit = defineEmits(['update:modelValue', 'close', 'confirm'])

// 响应式数据
const showPopup = ref(props.modelValue)
const selectedAlgorithm = ref<any>({})
const selectedParams = ref<Record<number, any>>({}) // 存储各类型参数的选中值
const hasUserInteraction = ref(false) // 标记用户是否有过选择操作

// 会员相关
const isVip = computed(() => userInfo.value?.isVip === 1)
const showMembershipModal = ref(false)

// 弹窗标题
const dialogTitle = computed(() => props.title)

// 滚动位置
const scrollLeft = ref(0)

// 根据算法名称找到默认算法
const findDefaultAlgorithm = (models: any[]) => {
  // 从defaultParams数组第一个元素获取算法名称
  const algorithmName = props.defaultParams[0]

  if (!algorithmName) {
    return models.find((model: any) => model.isDefault === 1) || models[0] || {}
  }

  // 根据算法名称匹配
  return (
    models.find(
      (model: any) => model.name === algorithmName || model.algorithmDesc === algorithmName
    ) ||
    models[0] ||
    {}
  )
}

// 初始化参数选择
const initSelectedParams = (algorithm: any) => {
  if (!algorithm.paramGroups) return

  algorithm.paramGroups.forEach((group: any) => {
    if (group.params && group.params.length > 0) {
      let defaultParam = null

      // 从defaultParams数组的其余元素中查找匹配的templateName
      if (props.defaultParams.length > 1) {
        // 跳过第一个元素（算法名称），从第二个开始查找
        for (let i = 1; i < props.defaultParams.length; i++) {
          const templateName = props.defaultParams[i]
          defaultParam = group.params.find((param: any) => param.templateName === templateName)
          if (defaultParam) break // 找到匹配的就停止
        }
      }

      // 如果找到默认参数就使用，否则使用第一个
      selectedParams.value[group.type] = defaultParam || group.params[0]
    }
  })
}

// 监听props变化
watch(
  () => props.modelValue,
  (newValue) => {
    if (showPopup.value !== newValue) {
      showPopup.value = newValue
      // 弹窗打开时，重置用户交互标志
      if (newValue) {
        hasUserInteraction.value = false
      }
    }
  }
)

watch(
  () => props.algorithmModels,
  (newModels) => {
    if (newModels && newModels.length > 0) {
      // 根据defaultParams中的算法名称找到默认算法
      const defaultAlgorithm = findDefaultAlgorithm(newModels)
      selectedAlgorithm.value = defaultAlgorithm
      // 初始化参数选择
      initSelectedParams(defaultAlgorithm)
    }
  },
  {
    immediate: true,
    deep: true,
  }
)

// 监听 defaultParams 变化，当参数变化时重新初始化
watch(
  () => props.defaultParams,
  () => {
    if (props.algorithmModels && props.algorithmModels.length > 0) {
      // 根据defaultParams中的算法名称找到默认算法
      const defaultAlgorithm = findDefaultAlgorithm(props.algorithmModels)
      selectedAlgorithm.value = defaultAlgorithm
      // 重新初始化参数选择
      initSelectedParams(defaultAlgorithm)
    }
  },
  {
    deep: true,
  }
)

// 获取参数组标题
const getParamGroupTitle = (type: number) => {
  const isVideo = props.title?.includes('视频')
  const titles: Record<number, string> = {
    1: '生成比例',
    2: isVideo ? (props.isMultiVideo ? '每片段时长' : '视频时长') : '参数选择',
    3: isVideo ? '选择运镜' : '参数选择',
    4: isVideo ? '视频清晰度' : '图片清晰度',
    5: '生成数量',
  }
  return titles[type] || '参数选择'
}

// 获取参数项样式类
const getParamItemClass = (type: number) => {
  const classes: Record<number, string> = {
    1: 'ratio-option',
    2: 'duration-option', // 视频时长
    3: 'camera-option', // 运镜
    4: 'quality-option',
    5: 'count-option',
  }
  return classes[type] || 'param-option'
}

// 获取当前选中的参数值
const getSelectedParamValue = (type: number) => {
  const selected = selectedParams.value[type]
  if (!selected) return ''

  return selected.templateName || ''
}

// 获取当前选中的参数描述（用于比例参数）
const getSelectedParamDesc = (type: number) => {
  const selected = selectedParams.value[type]
  if (!selected) return ''

  return selected.templateDesc || ''
}

// 判断参数是否被选中
const isParamSelected = (type: number, param: any) => {
  const selected = selectedParams.value[type]
  if (!selected) return false

  return selected.templateName === param.templateName
}

// 选择算法
const selectAlgorithm = (algorithm: any) => {
  // 如果是VIP算法，判断用户是否是 vip 不是则跳转到会员页面
  if (algorithm.isVip && !isVip.value) {
    showMembershipModal.value = true
    return
  }

  selectedAlgorithm.value = algorithm
  // 重新初始化参数选择
  initSelectedParams(algorithm)
  // 标记用户进行了选择操作
  hasUserInteraction.value = true
}

// 选择参数
const selectParam = (type: number, param: any, paramIndex?: number) => {
  // 如果是VIP选项，判断用户是否是 vip 不是则跳转到会员页面
  if (param.isVip && !isVip.value) {
    showMembershipModal.value = true
    return
  }
  // 非VIP选项正常选中
  selectedParams.value[type] = param
  // 标记用户进行了选择操作
  hasUserInteraction.value = true

  // 如果是比例参数且需要滚动，自动滚动到合适位置
  if (type === 1 && paramIndex !== undefined) {
    scrollToParam(paramIndex)
  }
}

// 滚动到指定参数位置
const scrollToParam = (paramIndex: number) => {
  // 每个比例参数项的宽度：120px（item） + 16px（gap）= 136px
  const itemWidth = 136 // px
  // scroll-view 的可视宽度约为 686px（750 - 32*2 padding）
  const viewWidth = 686 // px

  // 计算滚动位置，让点击的项目尽量居中
  // 如果点击的是前几个，不需要滚动
  // 如果点击的是中间或后面的，滚动让其居中显示
  const targetScrollLeft = Math.max(0, paramIndex * itemWidth - viewWidth / 2 + itemWidth / 2)

  scrollLeft.value = targetScrollLeft
}

// 构建返回结果
const buildResult = () => {
  const paramList = Object.values(selectedParams.value)

  return {
    algorithmId: selectedAlgorithm.value.id || 0,
    algorithmCode: selectedAlgorithm.value.code || '',
    algorithmName: selectedAlgorithm.value.name || '',
    paramList: paramList, // 保持数组格式，与接口返回一致
  }
}

// 确认选择
const onConfirm = () => {
  const result = buildResult()
  console.log('参数选择结果（接口格式）:', result)
  emit('confirm', result)
  showPopup.value = false
}

// 关闭弹窗
const onClose = () => {
  showPopup.value = false
  emit('update:modelValue', false)

  // 如果用户没有进行任何选择操作（直接关闭），传递 null
  if (!hasUserInteraction.value) {
    console.log('用户未进行任何选择，传递 null')
    emit('close', null)
    return
  }

  // 用户进行了选择操作，返回选择结果
  const result = buildResult()
  console.log('参数选择结果（接口格式）:', result)
  emit('close', result)
}
</script>

<style lang="scss" scoped>
.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 32px 30px 32px 20px;
  background: $color-bg-dark-two;
  border-radius: 12px 12px 0 0;

  .dialog-title {
    font-size: $font-size-xl;
    color: $color-text-white;
    font-weight: $font-weight-semibold;
  }

  .dialog-close {
    width: 20px;
    height: 20px;
    cursor: pointer;
  }
}

.video-params-container {
  max-height: 60vh;
  padding: $spacing-sm-md $spacing-lg;
  overflow-y: auto;

  .param-section {
    margin-bottom: $spacing-md;

    .section-title {
      font-size: $font-size-md;
      color: $color-text-white;
      font-family: PingFangSC-regular;

      .agree {
        font-size: $font-size-sm;
        color: $color-text-agree;
        margin-left: $spacing-md;
      }
    }

    .param-scroll-view {
      display: flex;
      gap: 15px;
      min-width: max-content;
      flex-wrap: nowrap; // 不换行
    }

    /* 运镜横向滚动视图 */
    .camera-scroll-view {
      display: flex !important;
      gap: 15px;
      min-width: max-content;
      flex-wrap: nowrap !important;
    }

    /* el-scrollbar 滚动条样式 */
    :deep(.el-scrollbar) {
      .el-scrollbar__bar.is-horizontal {
        height: 8px;
        bottom: 0;

        .el-scrollbar__thumb {
          background-color: $color-primary-dark;
          border-radius: 4px;
          opacity: 0.6;
          cursor: pointer;

          &:hover {
            opacity: 0.8;
          }
        }
      }

      .el-scrollbar__view {
        display: flex;
      }
    }

    // 滚动条：显示在内容下方，不遮挡文字
    .scrollbar-bottom {
      padding-top: 15px; // 为滚动条留出空间，滚动条显示在这个区域内，不遮挡内容;
    }

    /* 运镜容器（图片+文字垂直布局） */
    .camera-item {
      display: flex;
      flex-direction: column;
      gap: 6px;
      flex-shrink: 0;
      width: 100px;

      .camera-name {
        color: $color-text-desc;
        font-size: 12px;
        text-align: center;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }

    /* 运镜选项（复用param-item边框） */
    .param-item.camera-option {
      width: 100px !important;
      height: 100px !important;
      min-height: 100px !important;
      padding: 0 !important;
      overflow: hidden;
      position: relative;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;

      .camera-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
        border-radius: $border-radius-sm;
      }

      .active-icon {
        position: absolute;
        bottom: 0;
        right: 0;
        width: 20px;
        height: 20px;
        z-index: 10;
      }
    }

    .param-options {
      display: flex;
      gap: $spacing-md;
      flex-wrap: wrap;

      .version-option {
        position: relative;
        width: 81px;
        height: 81px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        border-radius: $border-radius-md;
        border: 1px solid transparent;
        cursor: pointer;
        flex-shrink: 0;
        overflow: hidden;

        // 背景图片
        .background-image {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border-radius: $border-radius-md;
          z-index: 0;
          object-fit: cover;
        }

        &.active {
          border-color: $color-primary-dark;
        }

        &.vip-locked {
          opacity: 0.5;

          &::after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.3);
            border-radius: $border-radius-sm;
            z-index: 1;
          }
        }
      }

      .param-item {
        position: relative;
        background-color: rgba(23, 160, 225, 0.1);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        border-radius: $border-radius-sm;
        font-size: $font-size-sm;
        color: $color-text-white;
        z-index: 1;
        cursor: pointer;
        flex-shrink: 0;

        &.active {
          border-color: $color-primary;
        }

        &.vip-locked {
          opacity: 0.6;
          position: relative;

          &::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.01);
            border-radius: $border-radius-sm;
            z-index: 0;
          }
        }
      }

      /* 比例选项 */
      .ratio-option {
        width: 78px;
        height: 78px;
        padding: $spacing-xs 0;
        justify-content: flex-start;
        flex-shrink: 0;
        gap: 4px;

        /* 比例图片样式 */
        .ratio-image {
          width: 38px;
          height: 38px;
          object-fit: contain;
          flex-shrink: 0;
        }

        /* 选中标记（只用于非运镜参数） */
        .active-icon {
          position: absolute;
          bottom: 0;
          right: 0;
          width: 16px;
          height: 15px;
          z-index: 99;
        }
      }

      /* 时长选项 */
      .duration-option {
        width: 108px;
        height: 36px;
      }

      /* 数量选项 */
      /* 清晰度选项 */
      .count-option,
      .quality-option {
        width: 78px;
        height: 36px;
      }

      // vip图标
      .vip-tag {
        position: absolute;
        top: -8px;
        right: -8px;
        z-index: 99;
        width: 28px;
        height: 16px;
      }

      // 选择图标
      .active-icon {
        position: absolute;
        bottom: 0;
        right: 0;
        width: 16px;
        height: 15px;
        z-index: 99;
      }
    }
  }
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: $spacing-3xl;
  min-height: 200px;

  :deep(.el-empty) {
    .el-empty__description {
      color: $color-text-placeholder;
    }
  }
}

.dialog-footer {
  background: $color-bg-dark-two;
  border-radius: 0 0 12px 12px;
  padding: 24px 22px;

  :deep(.el-button) {
    min-width: 142px;
    height: 44px;
    margin-left: 15px;
    font-size: $font-size-md;
    font-family: Inter-bold;
  }

  .cancel-btn {
    border: 1px solid rgba(150, 221, 255, 1);
    color: $color-text-white;

    &:hover {
      color: $color-text-white;
    }
  }
}
</style>

<style lang="scss">
.image-param-dialog {
  border: none !important;
}
</style>
