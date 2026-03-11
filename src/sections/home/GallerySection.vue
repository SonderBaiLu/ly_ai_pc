<template>
  <section class="gallery-section">
    <div class="image-grid">
      <div v-for="(img, index) in doubledImages" :key="index" class="image-card">
        <img :src="img.src" :alt="'Fashion ' + (index + 1)" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import home1 from '@/assets/images/home/home1.png'
import home2 from '@/assets/images/home/home2.png'
import home3 from '@/assets/images/home/home3.png'
import home4 from '@/assets/images/home/home4.png'
import home5 from '@/assets/images/home/home5.png'
import home6 from '@/assets/images/home/home6.png'
import home7 from '@/assets/images/home/home7.png'

const fashionImages = [
  { src: home1 },
  { src: home2 },
  { src: home3 },
  { src: home4 },
  { src: home5 },
  { src: home6 },
  { src: home7 },
]

const doubledImages = [...fashionImages, ...fashionImages]
</script>

<style scoped lang="scss">
.gallery-section {
  padding: $spacing-2xl 0;
  width: 100vw;
  margin-left: calc(-50vw + 50%);
  overflow: hidden;

  .image-grid {
    display: flex;
    align-items: center;
    gap: $spacing-lg;
    padding: 0 $spacing-md;
    width: max-content;
    animation: gallery-scroll 60s linear infinite;

    .image-card {
      flex-shrink: 0;
      width: 235px;
      height: 312px;
      border-radius: $border-radius-lg;
      overflow: hidden;
      // 用 CSS 变量保存“基础错位”，hover 时叠加 scale，避免 transform 覆盖导致跳动
      --card-y: 0px;
      transform: translateY(var(--card-y));
      transition: transform $transition-base;

      &:nth-child(odd) {
        --card-y: -16px;
      }

      &:nth-child(even) {
        --card-y: 16px;
      }

      &:hover {
        transform: translateY(var(--card-y)) scale(1.02);
        z-index: 10;
      }

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }
  }
}

@keyframes gallery-scroll {
  0% {
    transform: translateX(0);
  }

  100% {
    transform: translateX(-50%);
  }
}
</style>
