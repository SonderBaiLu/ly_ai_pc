<script setup lang="ts">
import { ElConfigProvider } from 'element-plus'
import { ref } from 'vue'

// 配置 Element Plus 暗黑主题
const isDark = ref(true)
const zIndex = 3000
const size = 'default'
</script>

<template>
  <el-config-provider :z-index="zIndex" :size="size">
    <div class="app" :class="{ 'dark': isDark }">
      <router-view />
    </div>
  </el-config-provider>
</template>

<style lang="scss">
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background: #0a0a0a;
  color: #fff;
  overflow-x: hidden;
}

.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
</style>
