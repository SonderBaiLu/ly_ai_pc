<template>
  <section class="features-section">
    <div class="features-container container">
      <div class="tabs-container">
        <el-radio-group v-model="activeTab" size="default">
          <el-radio-button v-for="(tab, index) in tabs" :key="index" :value="index" :border="false">
            {{ tab }}
          </el-radio-button>
        </el-radio-group>
      </div>
      <div v-if="activeTab === 0" class="cards-grid">
        <FeatureCard
          :title="t('features.feature1Title')"
          :tag="t('features.feature1Tag')"
          :description="t('features.feature1Desc')"
          :image="coat1"
          @click="goAiFashion('aiFashion')"
        />
        <FeatureCard
          :title="t('features.feature2Title')"
          :tag="t('features.feature2Tag')"
          :description="t('features.feature2Desc')"
          :image="coat2"
          @click="goAiFashion('aiFashion')"
        />
        <FeatureCard
          :title="t('features.feature3Title')"
          :tag="t('features.feature3Tag')"
          :description="t('features.feature3Desc')"
          :image="coat3"
          @click="goAiFashion('aiFashion')"
        />
      </div>

      <TransformRow
        v-else-if="activeTab === 1"
        :title="tabs[1]"
        :cards="sketchToRealCards"
        @card-click="goAiFashion('sketchToReal')"
      />
      <TransformRow
        v-else
        :title="tabs[2]"
        :cards="realToSketchCards"
        @card-click="goAiFashion('realToSketch')"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { ElRadioGroup, ElRadioButton } from 'element-plus'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useAuthGate } from '@/composables/useAuthGate'
import FeatureCard from './FeatureCard.vue'
import TransformRow from './TransformRow.vue'
import coat1 from '@/assets/images/home/design1.png'
import coat2 from '@/assets/images/home/design2.png'
import coat3 from '@/assets/images/home/design3.png'
import home1 from '@/assets/images/home/line_draw1.png'
import home2 from '@/assets/images/home/line_draw2.png'
import home3 from '@/assets/images/home/line_draw3.png'
import home4 from '@/assets/images/home/line_draw4.png'
import home5 from '@/assets/images/home/line_draw5.png'
import home6 from '@/assets/images/home/line_draw6.png'
import home7 from '@/assets/images/home/draw_line1.png'
import home8 from '@/assets/images/home/draw_line2.png'
import home9 from '@/assets/images/home/draw_line3.png'
import home10 from '@/assets/images/home/draw_line4.png'
import home11 from '@/assets/images/home/draw_line5.png'
import home12 from '@/assets/images/home/draw_line6.png'

const { t, tm } = useI18n()
const router = useRouter()
const { enterModule } = useAuthGate()
const activeTab = ref(0)

const tabs = computed(() => (tm('features.tabs') as string[]) || [])

const sketchToRealCards = computed(() => [
  { title: t('features.sketchToRealCard1Title'), leftImg: home1, rightImg: home2 },
  { title: t('features.sketchToRealCard2Title'), leftImg: home3, rightImg: home4 },
  { title: t('features.sketchToRealCard3Title'), leftImg: home5, rightImg: home6 },
])

const realToSketchCards = computed(() => [
  { title: t('features.realToSketchCard1Title'), leftImg: home7, rightImg: home8 },
  { title: t('features.realToSketchCard2Title'), leftImg: home9, rightImg: home10 },
  { title: t('features.realToSketchCard3Title'), leftImg: home11, rightImg: home12 },
])

type FashionMode = 'aiFashion' | 'sketchToReal' | 'realToSketch' | 'fabricCreative'
const goAiFashion = (mode: FashionMode) => {
  // 未登录：先进 AI 设计工作台；登录后：进入对应 AI 服装设计模块
  enterModule(() => router.push({ path: '/ai-fashion', query: { mode } }))
}
</script>

<style scoped lang="scss">
.features-section {
  padding: calc($spacing-2xl - 4px) 0 104px;
  width: 100vw;
  margin-left: calc(-50vw + 50%);
  overflow: hidden;
  background: $color-bg-dark;

  .features-container {
    .tabs-container {
      display: flex;
      justify-content: center;
      margin-bottom: $spacing-3xl;
    }

    .cards-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: $spacing-xl;
    }
  }

  @media (max-width: 1024px) {
    .features-container {
      .cards-grid {
        grid-template-columns: 1fr;
      }
    }
  }
}
</style>
