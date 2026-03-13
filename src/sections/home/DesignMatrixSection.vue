<template>
  <section class="design-section">
    <div class="design-container container">
      <div class="design-header">
        <div class="design-title-section">
          <h2 class="design-title">{{ t('designMatrix.title') }}</h2>
          <p class="design-subtitle">{{ t('designMatrix.subtitle') }}</p>
        </div>
        <div class="design-tags">
          <span v-for="(tag, index) in tags.slice(0, -1)" :key="index" class="design-tag"
            :class="{ active: index === activeTagIndex }" @click="activeTagIndex = index">
            {{ tag }}
          </span>
          <button class="design-tag design-tag-cta" type="button">
            {{ tags[tags.length - 1] }}
          </button>
        </div>
      </div>
      <div class="design-grid">
        <div v-for="(design, index) in currentDesigns" :key="index" class="design-item">
          <img :src="design" :alt="`Design ${index + 1}`" class="design-image" />
        </div>
      </div>
    </div>
    <CtaSection :on-click="showComingSoon" />
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import CtaSection from '@/components/CtaSection.vue'

// 外套
import coat1 from '@/assets/images/home/coat1.png'
import coat2 from '@/assets/images/home/coat2.png'
import coat3 from '@/assets/images/home/coat3.png'
import coat4 from '@/assets/images/home/coat4.png'
import coat5 from '@/assets/images/home/coat5.png'
import coat6 from '@/assets/images/home/coat6.png'
import coat7 from '@/assets/images/home/coat7.png'
import coat8 from '@/assets/images/home/coat8.png'

// T 恤
import shirt1 from '@/assets/images/home/shirt1.png'
import shirt2 from '@/assets/images/home/shirt2.png'
import shirt3 from '@/assets/images/home/shirt3.png'
import shirt4 from '@/assets/images/home/shirt4.png'
import shirt5 from '@/assets/images/home/shirt5.png'
import shirt6 from '@/assets/images/home/shirt6.png'
import shirt7 from '@/assets/images/home/shirt7.png'
import shirt8 from '@/assets/images/home/shirt8.png'

// 裙子
import skirt1 from '@/assets/images/home/skirt1.png'
import skirt2 from '@/assets/images/home/skirt2.png'
import skirt3 from '@/assets/images/home/skirt3.png'
import skirt4 from '@/assets/images/home/skirt4.png'
import skirt5 from '@/assets/images/home/skirt5.png'
import skirt6 from '@/assets/images/home/skirt6.png'
import skirt7 from '@/assets/images/home/skirt7.png'
import skirt8 from '@/assets/images/home/skirt8.png'

// 裤子
import pants1 from '@/assets/images/home/pants1.png'
import pants2 from '@/assets/images/home/pants2.png'
import pants3 from '@/assets/images/home/pants3.png'
import pants4 from '@/assets/images/home/pants4.png'
import pants5 from '@/assets/images/home/pants5.png'
import pants6 from '@/assets/images/home/pants6.png'
import pants7 from '@/assets/images/home/pants7.png'
import pants8 from '@/assets/images/home/pants8.png'

const { t, tm, locale } = useI18n()

// 当前激活的标签索引（只针对前四个品类标签）
const activeTagIndex = ref(0)

// 不同标签下要展示的设计图
// 0: 外套  1: T恤  2: 裙子  3: 裤子
const designGroups = [
  [coat1, coat2, coat3, coat4, coat5, coat6, coat7, coat8],
  [shirt1, shirt2, shirt3, shirt4, shirt5, shirt6, shirt7, shirt8],
  [skirt1, skirt2, skirt3, skirt4, skirt5, skirt6, skirt7, skirt8],
  [pants1, pants2, pants3, pants4, pants5, pants6, pants7, pants8],
]

const currentDesigns = computed(() => designGroups[activeTagIndex.value] || designGroups[0])

const showComingSoon = () => {
  ElMessage.info(
    locale.value === 'zh'
      ? '功能暂未开放，敬请期待'
      : 'This feature is not available yet. Stay tuned.'
  )
}

const tags = computed(() => (tm('designMatrix.tags') as string[]) || [])
</script>

<style scoped lang="scss">
.design-section {
  padding: $spacing-4xl 0;
  background: $color-bg-dark-primary;
  color: $color-text-white;

  .design-container {
    .design-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-bottom: $spacing-2xl;

      .design-title-section {

        .design-title {
          font-size: $font-size-3xl;
          font-weight: $font-weight-bold;
          margin-bottom: $spacing-xs;
        }

        .design-subtitle {
          font-size: $font-size-base;
          color: $color-text-placeholder;
        }
      }

      .design-tags {
        display: flex;
        gap: $spacing-sm;

        .design-tag {
          padding: 5px 17px;
          border-radius: $border-radius-sm;
          font-size: $font-size-sm;
          color: $color-text-placeholder;
          cursor: pointer;
          transition: all $transition-base;

          &.active,
          &:hover {
            background: radial-gradient(0.5% 0.5% at 50% 50%, rgba(23, 160, 225, 1) 0%, rgba(112, 197, 237, 1) 100%);
            color: $color-text-white;
          }

          &.design-tag-cta {
            background-color: transparent;
            border: 1px solid rgba(184, 222, 240, 1);
            color: $color-primary-light;

            &:hover {
              background: radial-gradient(0.5% 0.5% at 50% 50%, rgba(23, 160, 225, 1) 0%, rgba(112, 197, 237, 1) 100%);
              color: $color-text-white;
            }
          }
        }
      }
    }

    .design-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 60px;
      margin-bottom: $spacing-3xl;

      .design-item {
        width: 260px;
        height: 346px;
        border-radius: $border-radius-xl;

        .design-image {
          width: 260px;
          height: 346px;
          border-radius: $border-radius-xl;
        }
      }
    }
  }

  @media (max-width: 1024px) {
    .design-container {
      .design-header {
        flex-direction: column;
        align-items: flex-start;
        gap: $spacing-xl;
      }

      .design-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }
  }

  @media (max-width: 640px) {
    .design-container {
      .design-header {
        .design-title-section {
          .design-title {
            font-size: $font-size-3xl;
          }
        }
      }

      .design-grid {
        grid-template-columns: 1fr;
      }
    }

    // CTA 响应式已在 CtaSection 内处理
  }
}
</style>
