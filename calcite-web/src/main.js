import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import { ElSplitter, ElSplitterPanel } from 'element-plus'
import 'element-plus/dist/index.css'
import router from './router'
import App from './App.vue'
import './style.css'
import './styles/theme.css'
import { initTheme } from './styles/theme'

// 初始化主题
initTheme()

const app = createApp(App)
const pinia = createPinia()

// 注册 Pinia、Element Plus 和 Splitter 组件
app.use(pinia)
app.use(ElementPlus)
app.component('ElSplitter', ElSplitter)
app.component('ElSplitterPanel', ElSplitterPanel)
app.use(router)
app.mount('#app')
