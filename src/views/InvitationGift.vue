<template>
  <div class="invitation-gift-page">
    <Header />

    <main class="invitation-main">
      <div class="invitation-hero">
        <el-button class="rules-btn" text @click="handleRulesClick">活动规则</el-button>
        <h1 class="hero-title">邀请有礼</h1>
        <div class="hero-subtitle">
          邀请好友，得<span class="hero-reward">{{ invitationData?.invitationMaxWaveCoin }}</span>灵衍值
        </div>

        <div class="cards-row">
          <!-- 左：邀请码 -->
          <section class="card">
            <div class="card-title-row">
              <img class="card-icon" :src="images.link" alt="邀请码" />
              <div class="card-title">我的邀请码</div>
            </div>

            <div class="invite-code-row">
              <input class="invite-code-input" :value="invitationData?.invitationCode" readonly />
              <button class="copy-btn" @click="copyInviteCode">
                复制邀请码
              </button>
            </div>

            <div class="card-tip">
              邀请新用户注册成功并成为会员后，你将获得奖励
            </div>
          </section>

          <!-- 右：邀请进度 -->
          <section class="card progress-card">
            <div class="card-title">我的邀请进度</div>

            <div class="progress-grid">
              <div class="progress-item">
                <div class="progress-value">{{ invitationData?.invitationWaveCoin }}</div>
                <div class="progress-label">已获得灵衍值</div>
              </div>

              <div class="progress-item">
                <div class="progress-value">{{ invitationData?.invitationCount }}</div>
                <div class="progress-label">邀请好友数量</div>
              </div>
            </div>
          </section>
        </div>
      </div>

      <div class="steps">
        <div v-for="item in steps" :key="item.step" class="step-box">
          <div class="step-meta">Step {{ item.step }}</div>
          <div class="step-title">{{ item.title }}</div>
          <div class="step-icon-glow">
            <img :src="item.icon" :alt="item.title" class="step-icon" />
          </div>

          <!-- 前两步显示右侧引导箭头（第三步不需要） -->
          <img v-if="item.step < 3" :src="images.stepRight" alt="" class="step_right" />

          <div class="step-desc">{{ item.desc }}</div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { images } from '@/assets'
import { userApi, type UserInvitationsData } from '@/api/user'
import { copyToClipboard } from '@/utils/clipboard'


const invitationData = ref<UserInvitationsData | null>(null)

const router = useRouter()

const handleRulesClick = () => {
  // 打开独立的活动规则页面，并把当前奖励金额带过去展示
  router.push({ path: '/activity-rules', query: { giftValue: invitationData.value?.invitationMaxWaveCoin } })
}

const steps = computed(() => [
  { step: 1, title: '邀请好友', desc: '复制邀请码给好友', icon: images.step1 },
  { step: 2, title: '好友首次注册并付费', desc: '好友成功注册并成为会员', icon: images.step2 },
  { step: 3, title: '双方获得奖励', desc: '你和好友都将获得' + invitationData.value?.invitationMaxWaveCoin + '灵衍值奖励', icon: images.step3 },
])

const loadUserInvitations = async () => {
  try {
    const res = await userApi.getUserInvitations()
    if (res?.code === '0000' && res.data) {
      invitationData.value = res.data
    }
  } catch (error) {
    console.error('获取邀请有礼数据失败:', error)
  }
}

onMounted(() => {
  loadUserInvitations()
})

const copyInviteCode = async () => {
  const code = invitationData.value?.invitationCode || ''
  if (!code) {
    ElMessage.warning('邀请码为空')
    return
  }
  const ok = await copyToClipboard(code)
  if (ok) {
    ElMessage.success('邀请码已复制')
    return
  }
  ElMessage.error('复制失败，请手动复制邀请码')
}
</script>

<style scoped lang="scss">
.invitation-gift-page {
  min-height: 100vh;
  background-color: $color-bg-dark;
  background-image: url('@/assets/images/home_bg.png');
  background-size: cover;
  background-position: center top;
  position: relative;
  color: $color-text-white;

  .invitation-main {
    position: relative;
    z-index: 1;
    margin: 0 auto;
    padding: 101px 14% 0;

    .rules-btn {
      position: absolute;
      right: 14%;
      top: 101px;
      width: 66px;
      height: 22px;
      border-radius: 4px 4px 4px 4px;
      background-color: rgba(150, 221, 255, 0.05);
      color: $color-primary;
      font-size: $font-size-sm;
      text-align: center;
      font-family: -regular;
      border: 1px solid rgba(23, 160, 225, 1);
    }

    .hero-title {
      font-size: 48px;
      font-weight: 700;
      text-align: center;
    }

    .hero-subtitle {
      letter-spacing: 2px;
      font-size: 18px;
      text-align: center;
      font-family: Inter-regular;
      font-style: italic;
    }

    .hero-reward {
      color: $color-primary;
      font-weight: 700;
      font-size: 28px;
    }

    .cards-row {
      margin-top: 70px;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(375px, 1fr));
      gap: 37px;
    }

    .card {
      height: 183px;
      border-radius: 12px 12px 12px 12px;
      background: linear-gradient(135deg, rgba(5, 7, 10, 1) 14.6%, rgba(13, 18, 31, 1) 50%, rgba(22, 29, 49, 1) 85.4%);
      border: 1px solid rgba(255, 255, 255, 0.15);
      padding: 33px 33px 0;
      text-align: left;
      backdrop-filter: blur(8px);

      .card-title-row {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 16px;

        .card-icon {
          width: 18px;
          height: 18px;
        }

        .card-title {
          font-family: Inter-semiBold;
          font-size: $font-size-lg;
          font-weight: 600;
        }
      }
    }

    .invite-code-row {
      display: flex;
      align-items: center;
      gap: 14px;
      margin-bottom: 16px;

      .invite-code-input {
        flex: 1;
        height: 39px;
        border-radius: 8px 8px 8px 8px;
        background-color: rgba(18, 18, 18, 1);
        border: 1px solid rgba(255, 255, 255, 0.15);
        color: rgba(255, 255, 255, 0.31);
        padding: 0 13px;
        font-size: $font-size-md;
        outline: none;
      }

      .copy-btn {
        width: 120px;
        height: 39px;
        border-radius: 8px 8px 8px 8px;
        background-color: rgba(255, 255, 255, 0.04);
        border: 1px solid rgba(255, 255, 255, 0.08);
        font-size: $font-size-md;
        cursor: pointer;
        transition: all $transition-base;
      }
    }

    .card-tip {
      font-size: $font-size-sm;
      color: $color-text-gray;
    }

    .progress-card {
      padding: 33px 68px 0;

      .progress-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;

        .progress-item {
          text-align: center;
        }

        .progress-value {
          font-weight: 800;
          font-size: $font-size-4xl;
          font-family: Inter-bold;
        }

        .progress-label {
          font-size: $font-size-md;
          color: $color-text-placeholder;
        }
      }
    }

    .steps {
      margin: 220px 10% 0;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(331px, 1fr));
      gap: 28px;

      .step-box {
        position: relative;
        overflow: visible;
        border-radius: 12px 12px 12px 12px;
        background-color: rgba(255, 255, 255, 0.01);
        border: 1px solid rgba(255, 255, 255, 0.02);
        padding-top: 25px;
        text-align: center;
        height: 247px;

        .step-meta {
          font-size: $font-size-sm;
          color: $color-primary;
          letter-spacing: 1px;
          margin-bottom: 16px;
        }

        .step-title {
          font-family: Inter-bold;
          font-size: $font-size-lg;
          font-weight: 700;
        }

        .step-icon-glow {
          width: 58px;
          height: 58px;
          border-radius: 50%;
          background-color: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(23, 160, 225, 1);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 24px auto 0;

          .step-icon {
            width: 24px;
            height: 24px;
          }
        }

        .step_right {
          position: absolute;
          right: -17px;
          top: 50%;
          transform: translateY(-50%);
          width: 24px;
          height: 24px;
          pointer-events: none;
        }

        .step-desc {
          margin-top: 24px;
          font-size: $font-size-sm;
          color: $color-text-gray;
        }
      }
    }
  }
}
</style>
