<template>
  <div class="settings-container">
    <!-- 顶部标题栏 -->
    <div class="settings-header">
      <h1 class="settings-title">个人中心</h1>
      <el-button size="small" :icon="ArrowLeft" @click="router.push('/home')">
        返回首页
      </el-button>
    </div>

    <!-- 设置网格 -->
    <div class="settings-grid">
      <!-- 基本信息 -->
      <el-card class="settings-card" :body-style="{ padding: '20px' }">
        <template #header>
          <span class="card-header-title">基本信息</span>
        </template>
        <div class="user-info-row">
          <div class="user-avatar-large">
            <el-icon><User /></el-icon>
          </div>
          <div class="user-details">
            <div class="detail-item">
              <label>用户名</label>
              <span>{{ userStore.userInfo?.username || '未设置' }}</span>
            </div>
            <div class="detail-item">
              <label>邮箱</label>
              <span>{{ userStore.userInfo?.email || '未设置' }}</span>
            </div>
            <div class="detail-item">
              <label>用户ID</label>
              <span>{{ userStore.userInfo?.id || '-' }}</span>
            </div>
          </div>
        </div>
      </el-card>

      <!-- 账号安全 -->
      <el-card class="settings-card" :body-style="{ padding: '20px' }">
        <template #header>
          <span class="card-header-title">账号安全</span>
        </template>
        <el-form :model="passwordForm" label-width="100px" size="default">
          <el-form-item label="原密码">
            <el-input
              v-model="passwordForm.oldPassword"
              type="password"
              show-password
              placeholder="请输入原密码"
            />
          </el-form-item>
          <el-form-item label="新密码">
            <el-input
              v-model="passwordForm.newPassword"
              type="password"
              show-password
              placeholder="请输入新密码"
            />
          </el-form-item>
          <el-form-item label="确认密码">
            <el-input
              v-model="passwordForm.confirmPassword"
              type="password"
              show-password
              placeholder="请再次输入新密码"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" size="small" @click="handleUpdatePassword">
              修改密码
            </el-button>
          </el-form-item>
        </el-form>
      </el-card>

      <!-- 外观设置 -->
      <el-card class="settings-card" :body-style="{ padding: '20px' }">
        <template #header>
          <span class="card-header-title">外观设置</span>
        </template>
        <div class="setting-row">
          <div class="setting-info">
            <div class="setting-name">深色模式</div>
            <div class="setting-desc">切换系统的深色/浅色主题</div>
          </div>
          <el-switch
            v-model="isDarkModel"
            active-text="深色"
            inactive-text="浅色"
            @change="handleThemeChange"
          />
        </div>
        <div class="setting-divider"></div>
        <div class="setting-row">
          <div class="setting-info">
            <div class="setting-name">主题色</div>
            <div class="setting-desc">选择你喜欢的强调色</div>
          </div>
          <div class="color-presets">
            <div
              v-for="color in accentColors"
              :key="color.value"
              class="color-dot"
              :style="{ backgroundColor: color.value }"
              :class="{ active: currentAccent === color.value }"
              @click="setAccentColor(color.value)"
            />
          </div>
        </div>
      </el-card>

      <!-- 关于 -->
      <el-card class="settings-card" :body-style="{ padding: '20px' }">
        <template #header>
          <span class="card-header-title">关于 Calcite</span>
        </template>
        <div class="about-list">
          <div class="about-item">
            <label>系统版本</label>
            <span>v1.0.0</span>
          </div>
          <div class="about-item">
            <label>前端技术</label>
            <span>Vue 3.5 + Vite 7 + Element Plus 2.13</span>
          </div>
          <div class="about-item">
            <label>后端技术</label>
            <span>Drogon (C++17) + MariaDB + Elasticsearch</span>
          </div>
          <div class="about-item">
            <label>移动端</label>
            <span>Kotlin + Jetpack Compose</span>
          </div>
          <div class="about-item">
            <label>开源协议</label>
            <span>MIT / GPL-3.0</span>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, User } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '../stores'
import { useTheme } from '../composables/useTheme'

const router = useRouter()
const userStore = useUserStore()
const { isDark, toggleTheme } = useTheme()

// ===== 密码表单 =====
const passwordForm = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const handleUpdatePassword = () => {
  if (!passwordForm.value.oldPassword) {
    ElMessage.warning('请输入原密码')
    return
  }
  if (!passwordForm.value.newPassword) {
    ElMessage.warning('请输入新密码')
    return
  }
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    ElMessage.error('两次输入的新密码不一致')
    return
  }
  // Mock 修改成功
  ElMessage.success('密码修改成功')
  passwordForm.value = { oldPassword: '', newPassword: '', confirmPassword: '' }
}

// ===== 主题切换 =====
const isDarkModel = ref(isDark.value)

const handleThemeChange = (val) => {
  toggleTheme()
}

// ===== 主题色预设 =====
const currentAccent = ref('')

const accentColors = [
  { name: '默认绿', value: '#7fbbb3' },
  { name: '活力橙', value: '#e69875' },
  { name: '天空蓝', value: '#7ba2d5' },
  { name: '薰衣草', value: '#d196c0' },
  { name: '柠檬黄', value: '#dbbc7f' }
]

const setAccentColor = (color) => {
  currentAccent.value = color
  document.documentElement.style.setProperty('--accent-primary', color)
  ElMessage.success('主题色已更新')
}

onMounted(() => {
  // 初始化当前主题色
  const computedStyle = getComputedStyle(document.documentElement)
  currentAccent.value = computedStyle.getPropertyValue('--accent-primary').trim() || '#7fbbb3'
})
</script>

<style scoped>
.settings-container {
  width: 100%;
  min-height: 100vh;
  background-color: var(--bg-primary);
  padding: 24px;
  box-sizing: border-box;
}

.settings-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.settings-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

/* 设置网格 */
.settings-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  max-width: 1000px;
}

.settings-card {
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-primary);
}

.settings-card :deep(.el-card__header) {
  padding: 12px 20px;
  border-bottom: 1px solid var(--border-primary);
}

.card-header-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

/* 用户信息 */
.user-info-row {
  display: flex;
  align-items: flex-start;
  gap: 20px;
}

.user-avatar-large {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background-color: var(--accent-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.user-avatar-large .el-icon {
  font-size: 28px;
  color: var(--text-inverse);
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.detail-item label {
  font-size: 13px;
  color: var(--text-secondary);
  min-width: 60px;
}

.detail-item span {
  font-size: 14px;
  color: var(--text-primary);
  font-weight: 500;
}

/* 设置项 */
.setting-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;
}

.setting-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.setting-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
}

.setting-desc {
  font-size: 12px;
  color: var(--text-muted);
}

.setting-divider {
  height: 1px;
  background-color: var(--border-primary);
  margin: 12px 0;
}

/* 主题色预设 */
.color-presets {
  display: flex;
  gap: 10px;
}

.color-dot {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.2s;
}

.color-dot:hover {
  transform: scale(1.1);
}

.color-dot.active {
  border-color: var(--text-primary);
  box-shadow: 0 0 0 2px var(--bg-secondary), 0 0 0 4px var(--text-primary);
}

/* 关于列表 */
.about-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.about-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 0;
}

.about-item label {
  font-size: 13px;
  color: var(--text-secondary);
}

.about-item span {
  font-size: 13px;
  color: var(--text-primary);
  font-weight: 500;
}

/* 响应式 */
@media (max-width: 800px) {
  .settings-grid {
    grid-template-columns: 1fr;
  }
}
</style>
