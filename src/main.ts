import { createApp, watch } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import './styles/global.scss'
import App from './App.vue'
import router from './router'
import { i18n, persistLocale } from './i18n'

const app = createApp(App)
app.use(createPinia())
app.use(ElementPlus)
app.use(router)
app.use(i18n)
app.mount('#app')

// 持久化语言（交给 vue-i18n 管理）
persistLocale(i18n.global.locale.value)
watch(i18n.global.locale, (val) => persistLocale(val), { immediate: false })
