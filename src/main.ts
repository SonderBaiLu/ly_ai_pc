import { createApp, watch } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import './styles/global.scss'
import App from './App.vue'
import router from './router'
import { i18n, persistLocale } from './i18n'

// 非开发环境关闭常规控制台日志，避免测试/线上被业务日志刷屏
if (!import.meta.env.DEV) {
  console.log = () => undefined
  console.info = () => undefined
  console.debug = () => undefined
}

const app = createApp(App)
app.use(createPinia())
app.use(ElementPlus)
app.use(router)
app.use(i18n)
app.mount('#app')

// 持久化语言（交给 vue-i18n 管理）
persistLocale(i18n.global.locale.value)
watch(i18n.global.locale, (val) => persistLocale(val), { immediate: false })
