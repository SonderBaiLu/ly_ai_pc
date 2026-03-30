<template>
  <div class="video-options-section">
    <!-- 参数选项区域 -->
    <div v-if="showParamsVideo" class="options-list" @click="handleShowParams">
      <div class="options-scroll">
        <div class="options-container">
          <div v-for="(option, index) in options" :key="index" class="option-item">
            {{ option }}
          </div>
        </div>
      </div>
      <el-icon class="expand-icon" :size="16">
        <ArrowUp />
      </el-icon>
    </div>

    <!-- 生成控制区域 -->
    <div class="generate-control">
      <div class="credits-section">
        <img class="logo-icon" :src="images.money" alt="Logo" />
        <span class="credits-text">{{ credits }}</span>
      </div>
      <el-button type="primary" :disabled="disabled" :loading="loading"
        :class="['generate-btn', { 'generate-btn--locked': disabled }]" @click="handleGenerate">
        {{ buttonText }}
      </el-button>
    </div>

    <!-- 免责声明 -->
    <div class="disclaimer">{{ disclaimerText }}</div>
  </div>
</template>

<script setup lang="ts">
import { images } from '@/assets'
import { ArrowUp } from '@element-plus/icons-vue'

// 定义组件属性接口
interface Props {
  // 选项列表
  options?: string[]
  // 积分数量
  credits?: number
  // 参数类型
  paramsType?: string
  // 按钮文本
  buttonText?: string
  // 是否显示适配参数选择
  showParamsVideo?: boolean
  // 是否禁用按钮
  disabled?: boolean
  // 按钮loading状态
  loading?: boolean
  // 免责声明文本
  disclaimerText?: string
}

// 定义事件接口
interface Emits {
  (e: 'show-params'): void
  (e: 'generate'): void
}

// 定义属性默认值
withDefaults(defineProps<Props>(), {
  options: () => [],
  credits: 0,
  paramsType: '图片',
  buttonText: '立即生成',
  showParamsVideo: true,
  disabled: true,
  loading: false,
  disclaimerText: '内容由AI生成,禁止利用功能从事违法活动',
})

// 定义事件
const emit = defineEmits<Emits>()

// 处理显示参数弹窗
const handleShowParams = () => {
  emit('show-params')
}

// 处理生成按钮点击
const handleGenerate = () => {
  emit('generate')
}
</script>

<style lang="scss" scoped>
// 固定在底部的样式（当作为底部固定区域使用时）
.video-options-section {
  padding: 12px 0;
  background: $color-bg-dark;
  position: sticky;
  bottom: 0;
  z-index: 10;

  // 参数选项区域
  .options-list {
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-radius: $border-radius-md;
    background-color: rgba(22, 29, 49, 1);
    border: 1px solid rgba(255, 255, 255, 0.15);
    padding: 11px 40px 11px 11px;
    margin-bottom: 14px;
    cursor: pointer;
    font-family: PingFangSC-regular;

    .options-scroll {
      flex: 1;
      overflow-x: auto;
      overflow-y: hidden;

      /* 隐藏滚动条 */
      &::-webkit-scrollbar {
        display: none;
      }

      .options-container {
        display: flex;
        gap: 10px;
        align-items: center;

        .option-item {
          flex-shrink: 0;
          background: $color-bg-dark;
          font-size: 11px;
          padding: 7px 11px;
          border-radius: 6px;
          white-space: nowrap;
          color: $color-text-white;
        }
      }
    }

    .expand-icon {
      color: $color-text-desc-secondary;
      margin-left: 12px;
      transition: color $transition-base;
      flex-shrink: 0;
    }

    &:hover .expand-icon {
      color: $color-text-light-secondary;
    }
  }

  // 生成控制区域
  .generate-control {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 34px;

    .credits-section {
      display: flex;
      align-items: center;
      gap: 6px;

      .logo-icon {
        width: 24px;
        height: 24px;
        object-fit: contain;
      }

      .credits-text {
        font-size: $font-size-lg;
        font-weight: $font-weight-bold;
        color: $color-primary-dark;
        font-family: NotoSans-bold;
      }
    }

    .generate-btn {
      width: 257px;
      height: 46px;
      font-weight: $font-weight-medium;
      font-size: $font-size-base;

      &.generate-btn--locked {
        background-color: rgba(0, 0, 0, 0.5);
      }
    }
  }

  // 免责声明
  .disclaimer {
    font-size: $font-size-xs;
    color: $color-text-placeholder-gray;
    text-align: center;
  }
}
</style>
