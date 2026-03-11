<template>
  <section class="fabric-section">
    <div class="fabric-container container">
      <div class="fabric-left">
        <h2 class="fabric-title">{{ t('fabricSection.title') }}</h2>
        <p class="fabric-subtitle">{{ t('fabricSection.subtitle') }}</p>
        <p class="fabric-desc">{{ t('fabricSection.description') }}</p>

        <div class="steps">
          <div class="step-item" v-for="index in 3" :key="index">
            <img class="step-icon" src="@/assets/images/choose.png" alt="" srcset="">
            <div class="step-content">
              <span class="step-title">
                {{ steps[index - 1] }}
              </span>
              <span class="step-desc">
                {{ stepDescriptions[index - 1] }}
              </span>
            </div>
          </div>
        </div>

        <button class="fabric-btn" @click="showComingSoon">
          {{ t('fabricSection.button') }}
          <img class="right-icon" src="@/assets/images/arrow_icon.png" alt="" srcset="">
        </button>
      </div>

      <div class="fabric-right">
        <div class="main-card">
          <div class="images-showcase">
            <div class="image-wrapper">
              <div class="image-title">
                <img class="image-icon" src="@/assets/images/edit.png" alt="" srcset="">
                {{ t('fabricSection.originalFabric') }}
              </div>
              <img class="image-cover" :src="fabricImage" :alt="t('fabricSection.originalFabric')" />
            </div>
            <div class="image-wrapper">
              <div class="image-title">
                <img class="image-icon" src="@/assets/images/star2.png" alt="" srcset="">
                {{ t('fabricSection.fabricRender') }}
              </div>
              <img class="image-cover" :src="modelImage" :alt="t('fabricSection.fabricRender')" />
            </div>
          </div>

          <div class="features-section">
            <div class="features-label">{{ t('fabricSection.fabricFeatures') }}</div>
            <div class="tags">
              <div class="tag-item">
                <span>{{ t('fabricSection.high') }}</span>
                <img src="@/assets/images/close.png" alt="" srcset="">
              </div>
              <div class="tag-item">
                <span>{{ t('fabricSection.same') }}</span>
                <img src="@/assets/images/close.png" alt="" srcset="">
              </div>
              <span class="tag-item input-tag">
                <input type="text" :placeholder="t('fabricSection.addPrompt')" />
              </span>
            </div>
            <div class="prompt-input">
              <input type="text" :placeholder="t('fabricSection.placeholder')" />
              <button class="input-btn"><img src="@/assets/images/add.png" alt="" srcset=""></button>
            </div>
            <button class="regenerate-btn">
              <img src="@/assets/images/refresh.png" alt="" srcset="">
              {{ t('fabricSection.regenerate') }}
            </button>
          </div>
        </div>

        <div class="thumbnails-section">
          <div class="thumbnails-header">
            <span>{{ t('fabricSection.moreCreative') }}</span>
          </div>
          <div class="thumbnails-list">
            <div v-for="(thumb, index) in thumbnails.slice(2)" :key="index" class="thumbnail-item">
              <img :src="thumb" :alt="t('fabricSection.moreCreative') + ' ' + (index + 1)" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import fabric1 from '@/assets/images/home/fabric1.png'
import fabric2 from '@/assets/images/home/fabric2.png'
import fabric3 from '@/assets/images/home/fabric3.png'
import fabric4 from '@/assets/images/home/fabric4.png'
import fabric5 from '@/assets/images/home/fabric5.png'
import fabric6 from '@/assets/images/home/fabric6.png'
import fabric7 from '@/assets/images/home/fabric7.png'

const { t, tm, locale } = useI18n()

const fabricImage = fabric1
const modelImage = fabric2

const thumbnails = [
  fabric1,
  fabric2,
  fabric3,
  fabric4,
  fabric5,
  fabric6,
  fabric7,
]

const showComingSoon = () => {
  ElMessage.info(
    locale.value === 'zh'
      ? '功能暂未开放，敬请期待'
      : 'This feature is not available yet. Stay tuned.'
  )
}

const steps = computed(() => (tm('fabricSection.steps') as string[]) || [])
const stepDescriptions = computed(() => (tm('fabricSection.stepDescriptions') as string[]) || [])
</script>

<style scoped lang="scss">
.fabric-section {
  padding: $spacing-2xl 0;
  background: $color-bg-light;

  .fabric-container {
    display: flex;
    gap: $spacing-xl;
    align-items: center;

    .fabric-left {
      padding-top: $spacing-3xl;

      .fabric-title {
        font-size: $font-size-4xl;
        font-weight: $font-weight-bold;
        margin-bottom: $spacing-md;
        color: $color-text-dark;
      }

      .fabric-subtitle {
        font-size: $font-size-xl;
        color: $color-text-placeholder;
        margin-bottom: $spacing-lg;
      }

      .fabric-desc {
        font-size: $font-size-base;
        line-height: 26px;
        color: $color-text-four;
        margin-bottom: $spacing-lg;
      }

      .steps {
        margin-bottom: $spacing-xl;

        .step-item {
          display: flex;
          gap: $spacing-md;
          margin-bottom: $spacing-md;
          color: $color-text-four;
          font-size: $font-size-md;

          .step-icon {
            width: 16px;
            height: 16px;
            margin-top: 4px;
          }

          .step-content {
            display: flex;
            flex-direction: column;

            .step-title {
              font-size: $font-size-base;
              font-weight: $font-weight-semibold;
            }
          }
        }
      }

      .fabric-btn {
        display: flex;
        align-items: center;
        background: radial-gradient(0.5% 0.5% at 50% 50%, rgba(23, 160, 225, 1) 0%, rgba(112, 197, 237, 1) 100%);
        border: none;
        color: $color-text-white;
        padding: 16px 40px;
        border-radius: $border-radius-lg;
        font-size: $font-size-lg;
        font-weight: $font-weight-semibold;
        cursor: pointer;
        transition: all $transition-base;

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(56, 189, 248, 0.3);
        }

        .right-icon {
          width: 18px;
          height: 18px;
          margin-left: $spacing-sm;
        }
      }
    }

    .fabric-right {
      display: flex;
      gap: $spacing-lg;

      .main-card {
        width: 781px;
        background: $color-bg-white;
        border-radius: $border-radius-2xl;
        padding: $spacing-xl $spacing-xl 39px;
        border: 1px solid rgba(243, 244, 246, 1);

        .images-showcase {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: $spacing-lg;
          margin-bottom: $spacing-lg;

          .image-wrapper {
            cursor: pointer;

            .image-title {
              display: flex;
              align-items: center;
              margin-bottom: $spacing-sm;
              gap: $spacing-xs;
              border: none;
              font-size: $font-size-sm;
              font-weight: $font-weight-medium;
              color: $color-text-placeholder;

              .image-icon {
                width: 14px;
                height: 14px;
              }
            }

            .image-cover {
              width: 100%;
              object-fit: cover;
              border-radius: $border-radius-lg;
            }
          }
        }

        .features-section {
          margin-top: $spacing-xl;
          padding: $spacing-xl-sm;
          border-radius: $border-radius-xl;
          background-color: $color-bg-white;
          box-shadow: 0 0 0 1px rgba(229, 231, 235, 1);

          .features-label {
            font-size: $font-size-base;
            font-weight: $font-weight-medium;
            color: $color-text-dark;
            margin-bottom: $spacing-sm-md;
          }

          .tags {
            display: flex;
            flex-wrap: wrap;
            gap: $spacing-sm;
            margin-bottom: $spacing-sm-md;

            .tag-item {
              display: flex;
              align-items: center;
              gap: $spacing-xs;
              padding: 8px 21px;
              border-radius: 99px;
              background: radial-gradient(0.5% 0.5% at 50% 50%, rgba(23, 160, 225, 1) 0%, rgba(112, 197, 237, 1) 100%);
              color: $color-text-white;
              font-size: $font-size-md;
              cursor: pointer;

              img {
                width: 14px;
                height: 14px;
                margin-left: 6px;
                cursor: pointer;
              }

              &.input-tag {
                padding: 0;
                background: transparent;

                input {
                  padding: 6px 13px;
                  border-radius: 999px;
                  background-color: rgba(255, 255, 255, 1);
                  border: 1px solid rgba(229, 231, 235, 1);
                  font-size: $font-size-md;
                  outline: none;
                  background: transparent;
                  font-style: italic;
                  color: $color-text-placeholder;

                  &::placeholder {
                    color: $color-text-placeholder;
                  }
                }
              }
            }
          }

          .prompt-input {
            display: flex;
            align-items: center;
            gap: $spacing-sm;
            padding: 9px 8px 9px 20px;
            margin-bottom: $spacing-2xl;
            background-color: rgba(255, 255, 255, 1);
            border: 1px solid rgba(229, 231, 235, 1);
            border-radius: $border-radius-lg;

            input {
              flex: 1;
              font-size: $font-size-base;
              font-family: Inter-black;
              outline: none;
              border: none;
              background: transparent;
              color: $color-text-gray;
              font-weight: $font-weight-bold;

              &::placeholder {
                color: $color-text-gray;
              }
            }

            .input-btn {
              border-radius: $border-radius-lg;
              padding: 8px;
              border: none;
              background: $color-bg-black;
              cursor: pointer;
              flex-shrink: 0;

              img {
                width: 16px;
                height: 16px;
              }
            }
          }

          .regenerate-btn {
            width: 100%;
            padding: $spacing-md;
            background: $color-bg-black;
            color: $color-text-white;
            border: none;
            border-radius: $border-radius-lg;
            font-size: $font-size-md;
            font-weight: $font-weight-bold;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: $spacing-sm;

            img {
              width: 20px;
              height: 20px;
            }
          }
        }
      }

      .thumbnails-section {
        flex: 0 0 100px;
        display: flex;
        flex-direction: column;
        gap: $spacing-lg;
        margin-top: 35px;

        .thumbnails-header {
          font-size: $font-size-md;
          font-weight: $font-weight-medium;
          color: $color-text-gray;
          text-align: center;
        }

        .thumbnails-list {
          display: flex;
          flex-direction: column;
          gap: $spacing-md;

          .thumbnail-item {
            width: 100%;
            height: auto;
            border-radius: 10px;
            overflow: hidden;
            cursor: pointer;
            transition: all $transition-fast;

            &:hover {
              transform: scale(1.05);
            }

            img {
              width: 100%;
              height: 100%;
              object-fit: cover;
            }
          }
        }
      }
    }
  }

  @media (max-width: 1200px) {
    .fabric-container {
      flex-direction: column;

      .fabric-left {
        flex: none;
        width: 100%;
        padding-top: 0;
      }

      .fabric-right {
        width: 100%;
      }
    }
  }

  @media (max-width: 768px) {
    .fabric-container {
      .fabric-left {
        .fabric-title {
          font-size: 32px;
        }
      }

      .fabric-right {
        flex-direction: column;

        .thumbnails-section {
          flex-direction: row;
          flex-wrap: wrap;

          .thumbnails-list {
            flex-direction: row;
            flex-wrap: wrap;
          }
        }
      }
    }
  }
}
</style>
