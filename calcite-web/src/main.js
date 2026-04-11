import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import router from './router'
import App from './App.vue'
import './style.css'
import './styles/theme.css'
import { initTheme } from './styles/theme'

// 初始化主题
initTheme()

const app = createApp(App)

app.use(ElementPlus)
app.use(router)
app.mount('#app')
