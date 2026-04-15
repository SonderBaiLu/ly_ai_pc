<template>
  <section class="model-section">
    <div class="model-container">
      <h2 class="model-title">{{ t('modelSection.title') }}</h2>
      <p class="model-subtitle">{{ t('modelSection.subtitle') }}</p>

      <div class="model-scroller">
        <div class="model-track">
          <div class="model-item" v-for="(model, index) in doubledModels" :key="index">
            <LazyImage :src="model.src" :alt="'Model ' + (index + 1)" class="model-image" width="100%" height="100%"
              object-fit="cover" :border-radius="0" />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import model1 from '@/assets/images/home/model1.png'
import model2 from '@/assets/images/home/model2.png'
import model3 from '@/assets/images/home/model3.png'
import model4 from '@/assets/images/home/model4.png'
import model5 from '@/assets/images/home/model5.png'
import model6 from '@/assets/images/home/model6.png'
import model7 from '@/assets/images/home/model7.png'
import model8 from '@/assets/images/home/model8.png'
import model9 from '@/assets/images/home/model9.png'
import model10 from '@/assets/images/home/model10.png'
import model11 from '@/assets/images/home/model11.png'
import model12 from '@/assets/images/home/model12.png'
import model13 from '@/assets/images/home/model13.png'
import model14 from '@/assets/images/home/model14.png'
import model15 from '@/assets/images/home/model15.png'

const { t } = useI18n()

const models = [
  { src: model1 },
  { src: model2 },
  { src: model3 },
  { src: model4 },
  { src: model5 },
  { src: model6 },
  { src: model7 },
  { src: model8 },
  { src: model9 },
  { src: model10 },
  { src: model11 },
  { src: model12 },
  { src: model13 },
  { src: model14 },
  { src: model15 },
]

const doubledModels = [...models, ...models]
</script>

<style scoped lang="scss">
.model-section {
  padding: $spacing-5xl 0 43px;
  background: $color-bg-white;
  color: $color-text-dark;
  margin-left: calc(-50vw + 50%);
  overflow: hidden;

  .model-container {
    .model-title {
      margin-bottom: $spacing-sm;
      font-size: $font-size-4xl;
      font-weight: $font-weight-bold;
      text-align: center;
    }

    .model-subtitle {
      font-size: $font-size-md;
      color: $color-text-placeholder;
      text-align: center;
      margin-bottom: 31px;
    }

    .model-scroller {
      width: 100%;
      overflow: hidden;
      position: relative;

      .model-track {
        display: flex;
        gap: $spacing-lg;
        align-items: flex-end;
        animation: scroll-horizontal 40s linear infinite;
        width: max-content;

        &:hover {
          animation-play-state: paused;
        }

        .model-item {
          border-radius: $border-radius-lg;
          overflow: hidden;
          flex-shrink: 0;
          width: 280px;

          .model-image {
            width: 100%;
            object-fit: cover;
            display: block;
          }
        }
      }
    }
  }

  @keyframes scroll-horizontal {
    0% {
      transform: translateX(0);
    }

    100% {
      transform: translateX(-50%);
    }
  }

  @media (max-width: 1024px) {
    .model-container {
      .model-scroller {
        .model-track {
          .model-item {
            width: 240px;
          }
        }
      }
    }
  }

  @media (max-width: 640px) {
    .model-container {
      .model-title {
        font-size: $font-size-3xl;
      }

      .model-scroller {
        .model-track {
          .model-item {
            width: 200px;
          }
        }
      }
    }
  }
}
</style>
