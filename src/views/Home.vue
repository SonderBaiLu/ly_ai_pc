<template>
  <div class="home" :style="{ backgroundImage: `url(${images.homeBg})` }">
    <Header />

    <main class="main-content">
      <HeroSection />
      <GallerySection />
      <FeaturesSection />
      <FabricSection />
      <ModelSection />
      <StatsSection />
      <DesignMatrixSection />
    </main>

    <Footer />
  </div>
</template>

<script setup lang="ts">
import { images } from '@/assets'
</script>

<style scoped lang="scss"></style>
