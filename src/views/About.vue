<template>
  <div class="about">
    <Header />

    <main class="main">
      <!-- 顶部介绍 -->
      <section class="hero" :style="{ backgroundImage: `url(${images.aboutBg})` }">
        <h1 class="hero-title">{{ t('about.title') }}</h1>
        <p class="hero-desc">{{ t('about.description') }}</p>
      </section>

      <!-- 我们的愿景 -->
      <section class="vision" :style="{ backgroundImage: `url(${images.visionBg})` }">
        <h2 class="section-title">{{ t('about.visionTitle') }}</h2>
        <div class="cards">
          <div v-for="(item, idx) in visionItems" :key="idx" class="card">
            <div class="card-top">
              <div class="card-icon-box">
                <img class="card-icon" :src="item.icon" :alt="item.alt" />
              </div>
              <span class="card-index">{{ String(idx + 1).padStart(2, '0') }}</span>
            </div>
            <div class="card-text">{{ item.text }}</div>
          </div>
        </div>
      </section>
    </main>

    <!-- CTA -->
    <CtaSection :on-click="() => router.push('/ai-design')" />

    <Footer />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'
import CtaSection from '@/components/CtaSection.vue'
import { images } from '@/assets'

const router = useRouter()
const { t, locale } = useI18n()

const visionItems = computed(() => {
  const isZh = locale.value === 'zh'
  return [
    { icon: images.favorite, alt: isZh ? '愿景 1' : 'Vision 1', text: t('about.vision.1') },
    { icon: images.handshake, alt: isZh ? '愿景 2' : 'Vision 2', text: t('about.vision.2') },
    { icon: images.certification, alt: isZh ? '愿景 3' : 'Vision 3', text: t('about.vision.3') },
    { icon: images.together, alt: isZh ? '愿景 4' : 'Vision 4', text: t('about.vision.4') },
  ]
})
</script>

<style scoped lang="scss">
.about {
  min-height: 100vh;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  color: $color-text-white;

  .main {

    .hero {
      padding: 131px 0 129px;

      .hero-title {
        text-align: center;
        font-size: $font-size-4xl;
        font-family: Inter-bold;
        margin-bottom: 34px;
      }

      .hero-desc {
        max-width: 800px;
        margin: 0 auto;
        line-height: 30px;
        font-size: $font-size-2xl;
      }
    }

    .vision {
      text-align: center;
      padding: 87px 0 240px;
    }

    .section-title {
      display: inline-block;
      font-size: $font-size-3xl-lg;
      font-family: Inter-bold;
      color: $color-text-white;
      margin-bottom: 80px;

      &::after {
        content: '';
        display: block;
        width: 100%;
        height: 4px;
        margin-top: 14px;
        background-color: $color-primary-dark;
        border-radius: 4px 4px 4px 4px;
      }
    }

    .cards {
      max-width: 1156px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 32px;

      .card {
        height: 218px;
        box-sizing: border-box;
        border-radius: 16px 16px 16px 16px;
        background-color: rgba(255, 255, 255, 0.01);
        color: rgba(16, 16, 16, 1);
        font-size: 14px;
        text-align: center;
        box-shadow: 0px 2px 6px 0px rgba(0, 0, 0, 0.4);
        font-family: -regular;
        border: 1px solid rgba(255, 255, 255, 0.15);
        padding: 0 31px 0 41px;
      }

      .card-top {
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        margin-bottom: 26px;

        .card-icon-box {
          width: 56px;
          height: 56px;
          border-radius: 8px 8px 8px 8px;
          background-color: rgba(255, 255, 255, 0.02);
          display: flex;
          align-items: center;
          justify-content: center;

          .card-icon {
            width: 30px;
            height: 30px;
          }
        }

        .card-index {
          font-weight: $font-weight-bold;
          font-size: $font-size-6xl;
          text-align: justify;
          font-family: Inter-bold;
          color: $color-primary-dark;
        }
      }

      .card-text {
        text-align: left;
        color: $color-text-light;
        font-size: $font-size-xl;
        font-family: Inter-regular;
      }

      @media (max-width: 768px) {
        .hero-title {
          font-size: 30px;
        }

        .cards {
          grid-template-columns: 1fr;
        }

        .cta-title {
          font-size: 28px;
        }
      }
    }
  }
}
</style>
