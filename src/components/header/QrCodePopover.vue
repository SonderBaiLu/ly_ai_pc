<template>
  <el-popover
    placement="bottom"
    trigger="hover"
    :width="width"
    :popper-class="popperClass"
    :popper-options="popperOptions"
  >
    <template #reference>
      <slot name="reference" />
    </template>

    <div class="qrcode-popover-content">
      <div v-for="(x, index) in items" :key="index" class="qrcode-popover-item">
        <h3 v-if="x.title" class="qrcode-popover-title">{{ x.title }}</h3>
        <div class="qrcode-popover-box">
          <img :src="x.url" :alt="x.desc" class="qrcode-image" />
        </div>
        <p class="qrcode-popover-label">{{ x.desc }}</p>
      </div>
    </div>
  </el-popover>
</template>

<script setup lang="ts">
type QrCodeItem = {
  title?: string
  desc: string
  url: string
}

type Props = {
  items: QrCodeItem[]
  width: number
  popperClass?: string
  popperOptions?: Record<string, any>
}

withDefaults(defineProps<Props>(), {
  popperClass: 'header-qrcode-popper',
  popperOptions: undefined,
})
</script>

<style lang="scss">
/* 注意：popover 内容会 teleport 到 body，不能用 scoped */
.qrcode-popover {
  &-content {
    display: flex;
    align-items: center;
    gap: 45px;
    padding: 12px 34px 11px 33px;
  }

  &-title {
    margin-bottom: 15px;
    color: $color-primary;
    font-family: AlibabaPuHui-bold;
    font-weight: 600;
    font-size: $font-size-sm;
  }

  &-item {
    text-align: center;
  }

  &-box {
    width: 100px;
    height: 100px;
    border-radius: 5px;
  }

  &-image {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  &-label {
    margin-top: 11px;
    font-size: $font-size-xs;
    color: rgba(255, 255, 255, 0.7);
  }
}
</style>

