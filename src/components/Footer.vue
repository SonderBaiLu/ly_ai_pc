<template>
  <footer class="footer">
    <div class="footer-container container">
      <div class="footer-content">
        <div class="footer-left">
          <div class="footer-logo">
            <img class="logo-icon" src="@/assets/images/logo2.png" alt="Logo" />
          </div>
          <p class="footer-contact">{{ t('footer.businessEmail', { at: '@' }) }}</p>
          <div class="qrcode-box">
            <div class="qrcode-card">
              <img src="@/assets/images/wechat_code1.png" alt="微信二维码-小澍" class="qrcode-image" />
              <div class="qrcode-label">
                {{ locale === 'zh' ? '商务咨询-小澍' : 'Business inquiry - Xiaoshu' }}
              </div>
            </div>
            <div class="qrcode-card">
              <img src="@/assets/images/wechat_code2.png" alt="微信二维码-雾楠" class="qrcode-image" />
              <div class="qrcode-label">
                {{ locale === 'zh' ? '商务咨询-雾楠' : 'Business inquiry - Wunan' }}
              </div>
            </div>
            <div class="qrcode-card">
              <img src="@/assets/images/wechat_code3.png" alt="微信二维码-云纱" class="qrcode-image" />
              <div class="qrcode-label">
                {{ locale === 'zh' ? '商务咨询-云纱' : 'Business inquiry - Yunsha' }}
              </div>
            </div>
          </div>

          <div class="social-icons">
            <img src="@/assets/images/wechat.png" alt="WeChat" class="social-icon" />
            <img src="@/assets/images/red book.png" alt="Xiaohongshu" class="social-icon" />
            <img src="@/assets/images/douyin.png" alt="Douyin" class="social-icon" />
            <img src="@/assets/images/channel.png" alt="WeChat Channels" class="social-icon" />
          </div>
        </div>

        <div class="footer-right">
          <div class="footer-nav">
            <div class="nav-column">
              <h4>{{ t('footer.nav.fashionDesign') }}</h4>
              <a href="#" @click.prevent="showComingSoon">{{ t('footer.nav.aiFashionDesign') }}</a>
              <a href="#" @click.prevent="showComingSoon">{{ t('footer.nav.sketchToReal') }}</a>
              <a href="#" @click.prevent="showComingSoon">{{ t('footer.nav.realToSketch') }}</a>
            </div>
            <div class="nav-column">
              <h4>{{ t('footer.nav.aiFabric') }}</h4>
              <a href="#" @click.prevent="showComingSoon">{{ t('footer.nav.fabricCreative') }}</a>
            </div>
            <div class="nav-column">
              <h4>{{ t('footer.nav.help') }}</h4>
              <a href="#" @click.prevent="showComingSoon">{{ t('footer.nav.productTutorial') }}</a>
            </div>
          </div>
        </div>
      </div>

      <div class="footer-bottom">
        <p class="copyright">{{ t('footer.copyright') }}</p>
        <div class="footer-links">
          <a href="#" @click.prevent="showComingSoon">{{ t('footer.privacy') }}</a>
          <a href="#" @click.prevent="showComingSoon">{{ t('footer.userAgreement') }}</a>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'

const { t, locale } = useI18n()

const showComingSoon = () => {
  ElMessage.info(
    locale.value === 'zh'
      ? '功能暂未开放，敬请期待'
      : 'This feature is not available yet. Stay tuned.'
  )
}
</script>

<style scoped lang="scss">
.footer {
  position: relative;
  z-index: 10;
  padding: $spacing-3xl 0 $spacing-lg;
  background: $color-bg-dark;
  color: $color-text-white;
}

.footer-content {
  display: flex;
  justify-content: space-between;
  margin-bottom: 36px;

  .footer-left {
    .footer-logo {
      width: 127px;
      height: 51px;

      .logo-icon {
        width: 127px;
        height: 51px;
      }
    }

    .footer-contact {
      font-size: $font-size-sm;
      color: $color-text-placeholder;
      margin-bottom: $spacing-xs;
    }

    .qrcode-box {
      margin: $spacing-xl 0 $spacing-xl-sm;
      display: flex;
      align-items: center;
      gap: 10px;

      .qrcode-card {
        width: 90px;
        line-height: 20px;
        background: radial-gradient(0.5% 0.5% at 50% 50%, rgba(23, 160, 225, 1) 0%, rgba(112, 197, 237, 1) 100%);
        color: $color-text-white;
        font-size: $font-size-sm;
        border-radius: $border-radius-md;
        text-align: center;
      }

      .qrcode-image {
        width: 90px;
        height: 90px;
        border-radius: $border-radius-sm;
        object-fit: cover;
      }

      .qrcode-label {
        font-size: $font-size-xs;
      }
    }

    .social-icons {
      display: flex;
      gap: $spacing-md;

      .social-icon {
        width: 28px;
        height: 28px;
      }
    }
  }

  .footer-right {
    flex: 1;
    margin-left: $spacing-4xl;

    .footer-nav {
      display: flex;
      gap: $spacing-4xl;
      justify-content: flex-end;
    }

    .nav-column {
      h4 {
        font-size: $font-size-base;
        font-weight: $font-weight-semibold;
        margin-bottom: $spacing-xl-sm;
        color: $color-text-white;
      }

      a {
        display: block;
        font-size: $font-size-sm;
        color: $color-text-gray;
        text-decoration: none;
        margin-bottom: $spacing-md;
        transition: color $transition-base;

        &:hover {
          color: $color-primary;
        }
      }
    }
  }
}

.footer-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: $spacing-xl 0;
  border-top: 1px solid $color-border;
  font-size: $font-size-sm;
  color: $color-text-gray;

  .footer-links {
    display: flex;
    gap: $spacing-xl-sm;
  }

  .footer-links a {
    font-size: $font-size-sm;
    text-decoration: none;
    transition: color $transition-base;
    color: $color-text-gray;
  }

  .footer-links a:hover {
    color: $color-primary;
  }
}

@media (max-width: 1024px) {
  .footer-content {
    flex-direction: column;
    gap: $spacing-2xl;
  }

  .footer-right {
    margin-left: 0;
  }

  .footer-nav {
    justify-content: flex-start;
  }
}

@media (max-width: 640px) {
  .footer-nav {
    flex-direction: column;
    gap: $spacing-xl;
  }

  .footer-bottom {
    flex-direction: column;
    gap: $spacing-md;
    text-align: center;
  }
}
</style>
