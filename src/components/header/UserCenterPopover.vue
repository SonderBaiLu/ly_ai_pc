<template>
  <el-popover placement="bottom" trigger="hover" :enterable="true" :show-after="0" :hide-after="150" :show-arrow="false"
    :width="229" popper-class="header-user-card-popover"
    :popper-options="{ modifiers: [{ name: 'offset', options: { offset } }] }" :visible="visible"
    @update:visible="emit('update:visible', $event)">
    <template #reference>
      <div class="user-avatar" @mouseenter="ctx.setActivePopper('userCard')">
        <img :src="ctx.getAvatarSrc()" alt="User Avatar" class="avatar-icon" />
      </div>
    </template>

    <div class="user-card" :class="variant === 'ai' ? 'user-card--ai' : ''">
      <el-button class="invitation-btn" type="primary"
        @click="ctx.enterModule(() => ctx.router.push('/invitation-gift'))">
        邀请有礼
      </el-button>

      <div class="user-card-header" @click="ctx.openUserInfo()">
        <div class="user-card-avatar">
          <img class="user-card-avatar-img" :src="ctx.userStore.userInfo?.headImgUrl || ctx.images.avatarHeader"
            alt="User Avatar" />
          <div class="user-edit">
            <img :src="ctx.images.editMini" alt="User Avatar" />
          </div>
        </div>
        <div class="user-card-main">
          <div class="user-card-name">
            {{ ctx.userStore.userInfo?.nickName || ctx.userStore.userInfo?.userName || '未命名用户' }}
          </div>
          <div class="user-card-desc">
            {{ ctx.userStore.userInfo?.desc || '暂无简介' }}
          </div>
        </div>
      </div>

      <div class="user-card-section">
        <div :class="[
          'user-vip',
          Number(ctx.userStore.userInfo?.vipType ?? 0) === 1 ? 'popular' : '',
          Number(ctx.userStore.userInfo?.vipType ?? 0) === 2 ? 'blue' : '',
          Number(ctx.userStore.userInfo?.vipType ?? 0) === 3 ? 'yellow' : '',
          Number(ctx.userStore.userInfo?.vipType ?? 0) === 0 && Number(ctx.userStore.userInfo?.vipLevel ?? 0) === 0 ? 'disabled' : '',
        ]" @click="ctx.enterModule(() => ctx.router.push('/membership?tab=0'))">
          {{ ctx.getMembershipStatusText() }}
        </div>

        <div class="user-card-row" role="button" tabindex="0" @click="ctx.handleOpenInspirationDetail"
          @keydown.enter.prevent="ctx.handleOpenInspirationDetail">
          <span>灵衍值</span>
          <div class="user-money flex items-center">
            <img :src="ctx.images.money" alt="" />
            <span>{{ ctx.userStore.userInfo?.wavePoints || 0 }}</span>
          </div>
        </div>
      </div>

      <!-- <div class="user-item flex-between user-item--language" @mouseenter="ctx.openLanguagePopover"
        @mouseleave="ctx.scheduleCloseLanguagePopover">
        <div class="flex items-center">
          <img :src="ctx.images.languageBlack" alt="" class="user-icon" />
          <span class="row-label">语言</span>
        </div>
        <div class="flex items-center">
          <span class="user-language">{{ ctx.getCurrentLanguageLabel() }}</span>
          <img :src="ctx.images.arrowRight" alt="" class="user-icon" />
        </div>

        <div v-show="ctx.isLanguagePopoverOpen" class="language-popover" @mouseenter.stop="ctx.openLanguagePopover"
          @mouseleave.stop="ctx.scheduleCloseLanguagePopover">
          <el-button class="language-option" :type="ctx.getCurrentLanguageLabel() == '简体中文' ? 'primary' : 'default'"
            :link="ctx.getCurrentLanguageLabel() != '简体中文'"
            @click.stop="ctx.handleLanguageChange('zh-chs'); ctx.closeLanguagePopover()">简体中文</el-button>
          <el-button class="language-option" :type="ctx.getCurrentLanguageLabel() == 'English' ? 'primary' : 'default'"
            :link="ctx.getCurrentLanguageLabel() != 'English'"
            @click.stop="ctx.handleLanguageChange('en'); ctx.closeLanguagePopover()">English</el-button>
        </div>
      </div> -->

      <div class="user-item flex items-center" @click="ctx.modalStore.openContactUsModal()">
        <img :src="ctx.images.customer" alt="Customer" class="user-icon" />
        <span class="row-label">客服</span>
      </div>
      <div class="user-item flex items-center" @click="ctx.handleProductTutorialClick">
        <img :src="ctx.images.product" alt="Product" class="user-icon" />
        <span class="row-label">产品教程</span>
      </div>

      <div class="user-item user-card-footer" @click="ctx.handleLogout">
        <img :src="ctx.images.logout" alt="Logout" class="user-icon" />
        <span class="row-label">退出登录</span>
      </div>
    </div>
  </el-popover>
</template>

<script setup lang="ts">
import { computed } from 'vue'

type Props = {
  ctx: any
  variant?: 'home' | 'ai'
  offset?: [number, number]
  visible: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'home',
  offset: () => [-37, 20],
})

const emit = defineEmits<{
  'update:visible': [value: boolean]
}>()

const ctx = computed(() => props.ctx)
const variant = computed(() => props.variant)
const offset = computed(() => props.offset)
const visible = computed(() => props.visible)
</script>

<style lang="scss">
/* 注意：el-popover 会 teleport 到 body，涉及 popper-class 必须非 scoped */
.user-avatar {
  cursor: pointer;

  .avatar-icon {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    object-fit: cover;
  }
}

.el-popper.header-user-card-popover {
  padding: 0 !important;
  border: none !important;
  background: transparent !important;
  box-shadow: none !important;

  .el-popper__content {
    padding: 0 !important;
  }

  .el-popper__arrow {
    display: none !important;
  }

  width: 229px !important;
  border-radius: 24px !important;
  background-color: rgba(255, 255, 255, 1) !important;
  /* 语言切换小窗会在卡片外侧展开：不能裁切 */
  overflow: visible !important;
  color: $color-text-dark-secondary;
  font-size: $font-size-md;

  .el-popper__content {
    overflow: visible !important;
  }

  .user-card {
    box-sizing: border-box;
    width: 229px;
    padding: 28px 14px 6px;
    border-radius: 24px;
    background-color: rgba(255, 255, 255, 1);
    display: block;
    cursor: pointer;

    .invitation-btn {
      position: absolute;
      top: 11px;
      right: 14px;
      width: 66px;
      height: 23px;
      border-radius: 4px;
      background: radial-gradient(0.5% 0.5% at 50% 50%, rgba(23, 160, 225, 1) 0%, rgba(112, 197, 237, 1) 100%);
      font-size: $font-size-xs;
    }

    .user-card-header {
      display: flex;
      align-items: flex-end;
      margin-bottom: 18px;
    }

    .user-card-avatar {
      position: relative;

      .user-card-avatar-img {
        width: 52px;
        height: 54px;
        border-radius: 50%;
      }

      .user-edit {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 15px;
        height: 15px;
        cursor: pointer;
        position: absolute;
        right: 0;
        bottom: 0;
        background: $color-primary-dark;
        border-radius: 50%;

        img {
          width: 10px;
          height: 10px;
        }
      }
    }

    .user-card-main {
      margin-left: 17px;
      flex: 1;

      .user-card-name {
        color: rgba(17, 24, 39, 1);
        font-size: 16px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        width: 120px;
        display: inline-block;
      }

      .user-card-desc {
        color: $color-text-placeholder;
        font-size: 12px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        width: 120px;
        display: inline-block;
      }
    }

    .user-card-section {
      margin-bottom: 5px;

      .user-vip {
        padding: 11px 13px 12px;
        border-radius: 16px 16px 0px 0px;
        background-color: rgba(241, 245, 249, 1);

        &.popular {
          color: $color-text-white;
          font-family: NotoSans-bold;
          background: linear-gradient(90deg, rgba(204, 166, 244, 1) 0%, rgba(192, 126, 255, 1) 53%, rgba(204, 166, 244, 1) 99%);
        }

        &.blue {
          color: $color-text-white;
          font-family: NotoSans-bold;
          background: linear-gradient(90deg, rgba(130, 209, 246, 1) 0%, rgba(41, 171, 244, 1) 50%, rgba(80, 199, 253, 1) 99%);
        }

        &.yellow {
          color: $color-text-white;
          font-family: NotoSans-bold;
          background: linear-gradient(90deg, rgba(244, 232, 190, 1) 0%, rgba(196, 170, 117, 1) 50%, rgba(244, 232, 190, 1) 99%);
        }
      }

      .user-card-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 7px 8px 7px 11px;
        background-color: rgba(249, 250, 251, 1);
        border: 1px solid rgba(243, 244, 246, 1);
        border-radius: 0 0 16px 16px;

        .user-money {
          color: $color-primary-dark;

          img {
            width: 12px;
            height: 12px;
            margin-right: 5px;
          }
        }
      }
    }

    .user-item {
      display: flex;
      align-items: center;
      padding: 12px 3px;

      &:hover {
        border-radius: 5px;
        background-color: rgba(228, 246, 255, 1);
      }
    }

    .row-label {
      margin-left: 10px;
    }

    .user-language {
      margin-right: 2px;
      font-size: $font-size-xs;
    }

    .user-icon {
      width: 16px;
      height: 16px;
    }

    .user-card-footer {
      margin-top: 8px;
      border-top: 1px solid rgba(187, 187, 187, 1);
    }

    .user-item--language {
      position: relative;
    }
  }
}

.el-popper.header-user-card-popover {
  .language-popover {
    position: absolute;
    top: 50%;
    left: -122px;
    transform: translateY(-50%);
    padding: 7px 12px;
    border-radius: 8px;
    background-color: rgba(255, 255, 255, 1);
    z-index: 210;
    display: flex;
    flex-direction: column;
    gap: 15px;
  }

  .language-option {
    width: 79px;
    height: 30px;
    margin: 0;
    color: $color-text-dark-secondary;

    &:hover {
      background: $color-primary-dark;
      color: $color-text-white;
    }
  }
}
</style>
