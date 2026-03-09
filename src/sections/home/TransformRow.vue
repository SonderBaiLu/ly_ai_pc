<script setup lang="ts">
interface CardItem {
  title: string
  leftImg: string
  rightImg: string
}

defineProps<{
  title: string
  cards: CardItem[]
}>()
</script>

<template>
  <div class="transform-block">
    <div class="transform-grid">
      <div v-for="(card, index) in cards" :key="index" class="transform-card">
        <div class="transform-card-header">
          <span class="transform-card-text">
            {{ card.title }}
          </span>
          <img class="transform-card-arrow" src="@/assets/images/right_top.png" alt="" />
        </div>

        <div class="transform-card-body">
          <div class="transform-image-box">
            <img :src="card.leftImg" alt="" />
          </div>
          <img class="transform-middle-arrow" src="@/assets/images/arrow.png" alt="" />
          <div class="transform-image-box">
            <img :src="card.rightImg" alt="" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.transform-block {
  margin-top: 16px;

  .transform-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;

    .transform-card {
      padding: 25px;
      border-radius: $border-radius-xl;
      background-color: $color-bg-dark-card;
      border: 1px solid rgba(255, 255, 255, 0.02);

      .transform-card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 72px;

        .transform-card-text {
          font-size: $font-size-xl;
          font-weight: $font-weight-semibold;
          color: $color-primary;
        }

        .transform-card-arrow {
          width: 20px;
          height: 20px;
        }
      }

      .transform-card-body {
        position: relative;
        display: grid;
        grid-template-columns: 1fr auto 1fr;
        align-items: center;
        gap: 10px;

        .transform-image-box {
          width: 190px;
          height: 253px;
          border-radius: $border-radius-md;

          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
        }

        .transform-middle-arrow {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 73px;
          height: 47px;
        }
      }
    }
  }
}
</style>
