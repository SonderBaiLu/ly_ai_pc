<template>
  <div class="feature-card">
    <div class="card-header">
      <span class="card-tag">{{ title }}</span>
      <img class="arrow-icon" src="@/assets/images/right_top.png" alt="arrow" />
    </div>
    <div class="card-body">
      <div class="content-box">
        <img class="quote-icon" src="@/assets/images/comma.png" alt="" srcset="">
        <p class="card-desc">{{ description }}</p>
      </div>
      <div class="card-image">
        <img :src="image" :alt="title" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title: string
  tag: string
  description: string
  image: string
}

defineProps<Props>()
</script>

<style scoped lang="scss">
.feature-card {
  padding: 25px;
  border-radius: $border-radius-xl;
  background-color: $color-bg-dark-card;
  border: 1px solid rgba(255, 255, 255, 0.02);

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: $spacing-lg;

    .card-tag {
      font-size: $font-size-xl;
      font-weight: $font-weight-semibold;
      color: $color-primary;
    }

    .arrow-icon {
      width: 20px;
      height: 20px;
    }
  }

  .card-body {
    display: flex;
    align-items: center;
    gap: $spacing-xl;
  }

  .content-box {
    flex: 1;
    height: 350px;
    padding: $spacing-lg;
    border-radius: $border-radius-lg;
    background-color: $color-bg-dark-card-secondary;

    .quote-icon {
      width: 30px;
      height: 30px;
      margin-bottom: $spacing-md;
    }

    .card-desc {
      font-size: $font-size-md;
      line-height: 23px;
      color: $color-text-light;
      font-style: italic;
    }
  }

  .card-image {
    flex: 1;
    height: auto;
    border-radius: $border-radius-md;
  }

  .card-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  @media (max-width: 768px) {
    .card-body {
      flex-direction: column;
    }

    .card-image {
      width: 100%;
      height: 200px;
    }
  }
}
</style>
