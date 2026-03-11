<template>
  <div class="not-found">
    <div class="card">
      <h1>404</h1>
      <p>页面不存在</p>
      <router-link class="back" to="/">返回首页</router-link>
    </div>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped lang="scss">
.not-found {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: #0a0a0a;
}

.card {
  width: min(520px, 100%);
  padding: 28px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  text-align: center;

  h1 {
    font-size: 56px;
    line-height: 1;
    margin-bottom: 12px;
    color: #fff;
  }

  p {
    margin-bottom: 20px;
    color: rgba(255, 255, 255, 0.75);
  }
}

.back {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 10px 16px;
  border-radius: 9999px;
  background: rgba(23, 160, 225, 1);
  color: #fff;
  text-decoration: none;
  font-weight: 600;
}
</style>
