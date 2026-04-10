<template>
  <div class="nav-container nav-container--ai">
    <div class="logo">
      <img class="logo-icon" src="@/assets/images/logo.png" alt="Logo" @click="ctx.router.push('/')">
    </div>

    <div class="lang-select-wrapper">
      <img class="globe-icon" src="@/assets/images/language.png" alt="Globe" />
      <el-select :model-value="ctx.locale" @update:model-value="ctx.handleLanguageChangeSelect" class="lang-select">
        <template #suffix>
          <img src="@/assets/images/down.png" alt="Arrow" class="custom-down" />
        </template>
        <el-option v-for="option in ctx.languageOptions" :key="option.value" :label="option.label"
          :value="option.value" />
      </el-select>
    </div>

    <!-- 顶部导航：普通链接 + 二维码弹层入口（联系我们/关注我们） -->
    <nav class="nav-menu">
      <template v-for="item in ctx.menuData" :key="item.key">
        <QrCodePopover v-if="item.key === 'contactUs'" :items="ctx.pcCustomerService"
          :width="Math.min(672, 160 * ctx.pcCustomerService.length)">
          <template #reference>
            <a href="#" class="nav-item" :class="{ active: item.path && item.path === ctx.route.path }">
              {{ ctx.t(`header.${item.key}`) }}
            </a>
          </template>
        </QrCodePopover>

        <QrCodePopover v-else-if="item.key === 'followUs' && ctx.followUsList.length > 0" :items="ctx.followUsList"
          :width="Math.min(672, 160 * ctx.followUsList.length)">
          <template #reference>
            <a href="#" class="nav-item" :class="{ active: item.path && item.path === ctx.route.path }">
              {{ ctx.t(`header.${item.key}`) }}
            </a>
          </template>
        </QrCodePopover>

        <a v-else href="#" class="nav-item" :class="{ active: item.path && item.path === ctx.route.path }"
          @click.prevent="ctx.handleMenuClick(item)">
          {{ ctx.t(`header.${item.key}`) }}
        </a>
      </template>
    </nav>

    <div class="nav-right nav-right--ai">
      <template v-if="ctx.isAuthed">
        <!-- 登录态：创作入口 + 灵衍值/消息/用户菜单 -->
        <span class="ai-link" role="button" tabindex="0"
          @click="ctx.enterModule(() => ctx.router.push('/my-creations'))"
          @keydown.enter="ctx.enterModule(() => ctx.router.push('/my-creations'))">
          我的创作
        </span>

        <el-popover placement="bottom" trigger="hover" :enterable="true" :show-after="0" :hide-after="150"
          :show-arrow="false" :width="229" popper-class="header-wave-points-popover"
          :popper-options="{ modifiers: [{ name: 'offset', options: { offset: [30, 24] } }] }"
          :visible="ctx.isWavePointsPanelOpen" @update:visible="ctx.setWavePointsOpen">
          <!-- 灵衍值入口：hover 展示余额与购买动作 -->
          <template #reference>
            <div class="ai-coin-pill" @mouseenter="ctx.setActivePopper('wavePoints')">
              <img src="@/assets/images/coin.png" alt="Coin" class="coin-icon" />
              <span class="ai-coin-number" role="button" tabindex="0" @click.stop="ctx.handleOpenInspirationDetail"
                @keydown.enter.stop="ctx.handleOpenInspirationDetail">
                {{ ctx.userStore.userInfo?.wavePoints || 0 }}
              </span>
              <el-button class="ai-coin-recharge" type="primary"
                @click="ctx.enterModule(() => ctx.router.push('/membership?tab=1'))">充值</el-button>
            </div>
          </template>

          <div class="wave-points-hover-panel ai-coin-wave-points-panel"
            @mouseenter="ctx.setActivePopper('wavePoints')">
            <div class="wave-points-panel-top flex-between">
              <div class="wave-points-panel-title">我的灵衍值</div>
              <div class="wave-points-panel-detail" @click="ctx.handleOpenInspirationDetail">明细</div>
            </div>
            <div class="wave-points-panel-balance">
              <img :src="ctx.images.money" alt="" />
              <span>{{ ctx.userStore.userInfo?.wavePoints || 0 }}</span>
            </div>
            <div class="wave-points-panel-actions">
              <el-button class="wave-action" type="primary" @click.stop="ctx.handleOpenMembershipPurchase">
                <img :src="ctx.images.crown" alt="" />会员订阅
              </el-button>
              <el-button class="wave-action wave-action--secondary" @click.stop="ctx.handleOpenCoinPurchase">
                <img :src="ctx.images.shop" alt="" class="shop-icon shop-icon--off" />
                <img :src="ctx.images.shopActive" alt="" class="shop-icon shop-icon--on" />
                灵衍值购买
              </el-button>
            </div>
          </div>
        </el-popover>

        <el-popover placement="bottom" trigger="hover" :width="294" popper-class="header-msg-popover"
          :popper-options="{ modifiers: [{ name: 'offset', options: { offset: [-37, 21] } }] }"
          @show="ctx.handleOfficialMsgPopoverShow">
          <template #reference>
            <div class="msg-wrapper">
              <img src="@/assets/images/msg.png" alt="消息" class="msg-icon" />
              <img :src="ctx.images.dot" class="dot-icon" v-if="ctx.userStore.userInfo?.msgCount > 0" />
            </div>
          </template>

          <div class="header-msg-panel">
            <div class="header-msg-header flex-between">
              <div class="header-msg-title">官方消息</div>
              <div class="mark-all-btn" @click="ctx.markOfficialAllRead">一键全部已读</div>
            </div>

            <div class="header-msg-tabs">
              <span class="tab" :class="{ active: ctx.officialMsgTab === 'all' }"
                @click="ctx.setOfficialMsgTab('all')">全部</span>
              <span class="tab" :class="{ active: ctx.officialMsgTab === 'unread' }"
                @click="ctx.setOfficialMsgTab('unread')">
                未读 ({{ ctx.officialUnreadCount }})
              </span>
            </div>

            <div :ref="ctx.officialMsgScrollRef" class="header-msg-scroll" @scroll="ctx.handleOfficialMsgScroll($event)">
              <div class="header-msg-list">
                <div v-for="msg in ctx.displayedOfficialMessages" :key="msg.id" class="header-msg-card">
                  <div class="header-msg-card-content">
                    <div class="header-msg-card-icon-wrap" aria-hidden="true">
                      <img :src="ctx.images.message" alt="" class="header-msg-card-icon" />
                      <span v-if="Number(msg.readStatus) === 0" class="header-msg-unread-dot" />
                    </div>
                    <div class="header-msg-card-text-wrap">
                      <div class="header-msg-card-text flex-between">
                        <div class="header-msg-card-title">{{ msg.title }}</div>
                        <el-button type="primary" size="small" class="header-msg-detail-btn"
                          @click="ctx.handleOfficialMsgDetail(msg)">
                          查看详情<img :src="ctx.images.rightWhite" alt="" class="right-white-icon">
                        </el-button>
                      </div>
                      <div class="header-msg-card-desc">{{ msg.content }}</div>
                    </div>
                  </div>
                </div>
              </div>

              <InfiniteScrollLoader :loading="!ctx.officialMsgLoadedOnce || ctx.officialMsgLoading || ctx.officialMsgLoadingMore"
                :has-more="ctx.officialMsgHasMoreRemote"
                :data-length="ctx.displayedOfficialMessages.length" :show-back-top="false" :empty-text="'暂无消息'" />
            </div>
          </div>
        </el-popover>

        <UserCenterPopover :ctx="ctx" variant="ai" :offset="[-41, 21]" :visible="ctx.isUserCardOpen"
          @update:visible="ctx.setUserCardOpen" />

        <!-- 三点菜单：设置/协议/教程/团队管理/登出 -->
        <el-popover placement="bottom" trigger="hover" :enterable="true" :show-after="0" :hide-after="150"
          :popper-options="{ modifiers: [{ name: 'offset', options: { offset: [-100, 21] } }] }" :show-arrow="false"
          :width="229" popper-class="header-user-card-popover" :visible="ctx.isUserMenuOpen"
          @update:visible="ctx.setUserMenuOpen">
          <template #reference>
            <img src="@/assets/images/more.png" alt="More" class="more-icon"
              @mouseenter.stop="ctx.setActivePopper('userMenu')" @click.stop="ctx.toggleUserMenuPopper" role="button"
              tabindex="0" />
          </template>
          <div class="more-card more-card--menu">
            <div class="user-card-menu">
              <div class="user-card-menu-item" @click="ctx.handlePersonalSettingsClick">
                <div class="user-card-menu-left">
                  <img :src="ctx.images.set" alt="" class="user-card-menu-icon" />
                  <span class="user-card-menu-label">个人设置</span>
                </div>
                <img :src="ctx.images.arrowRight" alt="" class="user-card-menu-arrow" />
              </div>

              <div class="user-card-menu-item" @click="ctx.handlePlatformAgreementClick">
                <div class="user-card-menu-left">
                  <img :src="ctx.images.agreement" alt="" class="user-card-menu-icon" />
                  <span class="user-card-menu-label">平台协议</span>
                </div>
                <img :src="ctx.images.arrowRight" alt="" class="user-card-menu-arrow" />
              </div>

              <div class="user-card-menu-item" @click="ctx.handleProductTutorialClick">
                <div class="user-card-menu-left">
                  <img :src="ctx.images.book" alt="" class="user-card-menu-icon" />
                  <span class="user-card-menu-label">产品教程</span>
                </div>
                <img :src="ctx.images.arrowRight" alt="" class="user-card-menu-arrow" />
              </div>

              <div class="user-card-menu-item" @click="ctx.handleAiWatermarkSettingsClick">
                <div class="user-card-menu-left">
                  <img :src="ctx.images.aiWatermark" alt="" class="user-card-menu-icon" />
                  <span class="user-card-menu-label">AI生成水印设置</span>
                </div>
                <img :src="ctx.images.arrowRight" alt="" class="user-card-menu-arrow" />
              </div>

              <div class="user-card-menu-item" @click="ctx.handleClick"
                v-if="ctx.userStore.userInfo?.mainAccount || ctx.userStore.userInfo?.mainAdmin">
                <div class="user-card-menu-left">
                  <img :src="ctx.images.team" alt="" class="user-card-menu-icon" />
                  <span class="user-card-menu-label">团队管理</span>
                </div>
                <img :src="ctx.images.arrowRight" alt="" class="user-card-menu-arrow" />
              </div>

              <div class="user-card-menu-divider" />

              <div class="user-card-menu-item user-card-menu-item--logout" @click="ctx.handleLogout">
                <div class="user-card-menu-left">
                  <img :src="ctx.images.logout" alt="" class="user-card-menu-icon" />
                  <span class="user-card-menu-label">退出登录</span>
                </div>
              </div>
            </div>
          </div>
        </el-popover>
      </template>
      <template v-else>
        <button class="ai-login-btn" type="button" @click="ctx.showLoginModal">登录</button>
      </template>
    </div>

    <div v-if="ctx.showMonthlyLoginPointsTip" class="monthly-login-points-tip"
      :class="{ 'is-hiding': ctx.isMonthlyTipHiding }">
      每月{{ ctx.monthlyLoginPoints }}免费灵衍值已到账
    </div>
  </div>
</template>

<script setup lang="ts">
import UserCenterPopover from '@/components/header/UserCenterPopover.vue'
import QrCodePopover from '@/components/header/QrCodePopover.vue'
import InfiniteScrollLoader from '@/components/InfiniteScrollLoader.vue'

defineProps<{ ctx: any }>()
</script>

<style scoped lang="scss">
.nav-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;

  .logo {
    margin-right: 51px;

    .logo-icon {
      width: 107px;
      height: 43px;
      cursor: pointer;
    }
  }
}

.nav-container--ai {
  .lang-select-wrapper {
    margin-right: 37px;
  }
}

.nav-menu {
  display: flex;
  flex: 1;
  gap: $spacing-xl;
  min-width: 520px;
  flex-shrink: 0;

  .nav-item {
    color: $color-text-gray;
    text-decoration: none;
    font-size: $font-size-md;
    font-weight: $font-weight-medium;
    transition: color $transition-base;
    white-space: nowrap;
    flex-shrink: 0;
  }
}

.nav-item:hover,
.nav-item.active {
  color: $color-primary;
}

.lang-select-wrapper {
  display: flex;
  align-items: center;
  gap: $spacing-xs;
}

.lang-select {
  width: 80px;

  :deep(.el-select__caret) {
    width: 16px;
    height: 16px;
    background: url('@/assets/images/down.png') no-repeat center;
  }
}

.globe-icon {
  width: 16px;
  height: 16px;
}

.nav-right--ai {
  display: flex;
  align-items: center;
  gap: $spacing-2xl-sm;
  flex-wrap: nowrap;

  .ai-link {
    cursor: pointer;
    user-select: none;
    white-space: nowrap;
    font-size: $font-size-md;

    &:hover {
      color: rgba(255, 255, 255, 0.9);
    }
  }

  .msg-wrapper {
    position: relative;
    width: 24px;
    height: 24px;
    cursor: pointer;

    .dot-icon {
      position: absolute;
      top: -2px;
      right: -1px;
      width: 13px;
      height: 13px;
      border-radius: 50%;
    }
  }

  .ai-coin-pill {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: $spacing-xs;
    height: 24px;
    padding-left: 6px;
    border-radius: 9999px;
    border: 1px solid $color-primary;
    font-size: $font-size-md;
    color: $color-primary;
    background: rgba(150, 221, 255, 0.1);
    cursor: pointer;

    .coin-icon {
      width: 12px;
      height: 12px;
    }

    .ai-coin-recharge {
      height: 100%;
      color: $color-text-white;
      padding: 0 $spacing-sm;
      border-radius: 0px 99px 99px 0px;
      font-size: $font-size-xs;
      cursor: pointer;
    }
  }

  .msg-icon,
  .more-icon {
    width: 24px;
    height: 24px;
    cursor: pointer;
  }

  .user-menu {
    gap: 12px;
  }

  .user-avatar {
    flex-shrink: 0;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }
}

.ai-login-btn {
  width: 88px;
  height: 32px;
  border-radius: 9999px;
  border: none;
  background-color: $color-bg-white;
  color: $color-bg-dark;
  font-size: $font-size-md;
  font-weight: $font-weight-semibold;
  cursor: pointer;
}

.monthly-login-points-tip {
  position: absolute;
  right: 22px;
  top: calc(100% + 8px);
  padding: 15px 10px;
  border-radius: 8px;
  background: radial-gradient(0.5% 0.5% at 50% 50%, rgba(23, 160, 225, 1) 0%, rgba(112, 197, 237, 1) 100%);
  color: $color-text-white;
  font-size: $font-size-base;
  font-family: PingFangSC-bold;
  white-space: nowrap;
  line-height: 1;
  z-index: 20;
  animation: monthly-tip-enter 0.6s ease-out;
  opacity: 1;
  transform: translateY(0);

  &.is-hiding {
    opacity: 0;
    transform: translateY(-4px);
    transition: opacity 0.8s ease-in-out, transform 0.8s ease-in-out;
  }
}

@keyframes monthly-tip-enter {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 1024px) {
  .nav-menu {
    display: flex;
    gap: $spacing-lg;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    width: 520px;
    flex: 0 0 520px;
    min-width: 520px;

    &::-webkit-scrollbar {
      height: 0;
    }
  }
}

@media (max-width: 640px) {
  .nav-container {
    padding: 0 $spacing-md;
  }

  .nav-right--ai {
    gap: $spacing-sm;
  }
}
</style>

<style lang="scss">
/* 注意：popper 走 teleport，必须非 scoped */
.el-popper.header-wave-points-popover {
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
  overflow: hidden !important;

  .ai-coin-wave-points-panel {
    box-sizing: border-box;
    width: 229px;
    padding: 28px 17px;
    border-radius: 24px;
    background-color: rgba(255, 255, 255, 1);

    .wave-points-panel-top {
      margin-bottom: 14px;

      .wave-points-panel-title {
        font-size: $font-size-base;
        font-weight: 700;
        color: $color-text-dark;
      }

      .wave-points-panel-detail {
        color: $color-primary-dark;
        font-size: $font-size-md;
        cursor: pointer;
      }
    }

    .wave-points-panel-balance {
      display: flex;
      align-items: center;
      gap: 9px;
      color: $color-primary-dark;
      font-weight: 700;
      font-size: 28px;
      margin-bottom: 32px;

      img {
        width: 25px;
        height: 24px;
        border-radius: 50%;
      }
    }

    .wave-points-panel-actions {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }

    .wave-action {
      height: 44px;
      width: 100%;
      margin: 0;
      font-size: $font-size-lg;
      font-weight: normal;

      img {
        width: 24px;
        height: 24px;
        margin-right: 20px;
        object-fit: contain;
      }

      &.wave-action--secondary {
        background-color: $color-bg-white;
        color: $color-text-gray;
        border: 1px solid rgba(18, 18, 18, 0.15);

        img {
          margin-right: 7px;
        }

        .shop-icon--on {
          display: none;
        }

        &:hover {
          background-color: $color-primary-dark;
          color: $color-text-white;
          border: 1px solid rgba($color-primary-dark, 0.2);

          .shop-icon--on {
            display: block;
          }

          .shop-icon--off {
            display: none;
          }
        }
      }
    }
  }
}

.el-popper.header-msg-popover {
  width: 294px !important;
  height: 474px !important;
  border-radius: 24px !important;
  background-color: rgba(255, 255, 255, 1) !important;
  font-size: 14px !important;
  text-align: center !important;
  font-family: -regular !important;
  padding: 0 !important;
  border: none !important;
  box-shadow: none !important;
  overflow: hidden !important;

  .el-popper__content {
    height: 100% !important;
    overflow: hidden !important;
  }

  .el-popper__arrow::before {
    background-color: rgba(255, 255, 255, 1) !important;
  }

  .el-popover__title {
    display: none;
  }

  .header-msg-panel {
    box-sizing: border-box;
    width: 294px;
    height: 474px;
    background: #fff;
    border-radius: 24px;
    border: none;
    box-shadow: none;
    padding: 28px 15px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    cursor: pointer;

    .header-msg-header {
      margin-bottom: 9px;

      .header-msg-title {
        color: rgba(17, 24, 39, 1);
        font-size: 20px;
        text-align: justify;
        font-weight: $font-weight-bold;
        font-family: NotoSans-bold;
      }

      .mark-all-btn {
        padding: 3px 5px;
        border-radius: 4px;
        color: $color-text-gray;
        font-size: 10px;
        text-align: justify;
        font-family: NotoSans-regular;
        text-align: center;
        font-family: PingFangSC-regular;
        border: 1px solid rgba(18, 18, 18, 0.15);
      }
    }

    .header-msg-tabs {
      display: flex;
      align-items: center;
      gap: 33px;
      font-size: $font-size-base;
      margin-bottom: 17px;
      color: $color-text-gray;

      .tab {
        position: relative;
        padding-bottom: 8px;
        cursor: pointer;
        user-select: none;
        font-weight: 500;
      }

      .tab.active {
        color: $color-primary-dark;
        font-weight: 700;
      }

      .tab.active::after {
        content: '';
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        width: 34px;
        height: 5px;
        border-radius: 999px;
        background: $color-primary-dark;
      }
    }

    .header-msg-scroll {
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden;

      .infinite-scroll-loader {
        padding: 10px 0 4px;

        .empty-state {
          min-height: 140px;
        }
      }

      .header-msg-list {
        display: flex;
        flex-direction: column;
        gap: 10px;

        .header-msg-card {
          border-radius: 8px;
          background: #f4f6f9;
          color: $color-text-dark;
          font-size: 14px;
          font-family: PingFangSC-regular;
          border-left: 3px solid rgba(150, 221, 255, 1);

          .header-msg-card-content {
            flex: 1;
            display: flex;
            align-items: center;
            gap: 11px;
            padding: 7px 9px;

            .header-msg-card-icon-wrap {
              position: relative;
              flex-shrink: 0;
              display: flex;
              align-items: center;
              justify-content: center;

              .header-msg-card-icon {
                width: 24px;
                height: 24px;
              }

              .header-msg-unread-dot {
                position: absolute;
                top: 0;
                right: -2px;
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background: #FF7777;
                box-sizing: content-box;
              }
            }

            .header-msg-card-text-wrap {
              width: calc(100% - 33px);
              font-size: 10px;
              color: $color-text-gray;

              .header-msg-card-text {
                .header-msg-card-title {
                  font-family: NotoSans-bold;
                  font-size: $font-size-md;
                  color: $color-text-dark;
                  font-weight: $font-weight-bold;
                }

                .header-msg-detail-btn {
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  padding: 2px 0 2px 4px;
                  border-radius: 4px;
                  font-size: 10px;
                  color: $color-text-white;
                  background: $color-primary-dark !important;

                  .right-white-icon {
                    width: 16px;
                    height: 16px;
                  }
                }
              }

              .header-msg-card-desc {
                margin-top: 6px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
              }
            }
          }
        }
      }

    }
  }
}

/* 更多（三点）菜单弹层样式（复用 header-user-card-popover 这个 popper-class） */
.el-popper.header-user-card-popover {
  .more-card--menu {
    box-sizing: border-box;
    width: 229px;
    padding: 10px 13px !important;
    border-radius: 24px;
    background-color: rgba(255, 255, 255, 1);
    display: block;
    cursor: pointer;
  }

  .user-card-menu {
    display: flex;
    flex-direction: column;
    gap: 0;
  }

  .user-card-menu-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 1px;
    border-radius: 5px;
    color: $color-text-dark-secondary;
    font-size: $font-size-md;
    cursor: pointer;
    font-family: NotoSans-regular;

    &:hover {
      background-color: rgba($color-primary-light, 0.12);
    }

    .user-card-menu-left {
      display: flex;
      align-items: center;
      gap: 12px;

      .user-card-menu-icon {
        width: 16px;
        height: 16px;
        object-fit: contain;
      }

      .user-card-menu-label {
        white-space: nowrap;
      }
    }

    .user-card-menu-arrow {
      width: 16px;
      height: 16px;
      object-fit: contain;
    }
  }

  .user-card-menu-divider {
    height: 1px;
    margin: 6px 2px;
    background-color: #BBBBBB;
  }
}
</style>
