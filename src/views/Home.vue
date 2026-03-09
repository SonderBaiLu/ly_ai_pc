<script setup lang="ts">
import homeBg from '@/assets/images/home_bg.png'
</script>

<template>
  <div class="home" :style="{ backgroundImage: `url(${homeBg})` }">
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

<style scoped lang="scss"></style>
