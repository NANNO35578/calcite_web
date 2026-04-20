<template>
  <div class="sidebar-footer">
    <el-dropdown trigger="click" @command="$emit('command', $event)">
      <div class="user-info">
        <div class="user-avatar">
          <el-icon><User /></el-icon>
        </div>
        <div class="user-details">
          <div class="username">{{ userStore.userInfo?.username || '用户' }}</div>
          <div class="user-email">{{ userStore.userInfo?.email || '' }}</div>
        </div>
        <div class="theme-toggle" @click.stop="toggleTheme" title="切换主题">
          <el-icon>
            <Sunny v-if="isDark" />
            <Moon v-else />
          </el-icon>
        </div>
      </div>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item command="logout">退出登录</el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>

<script setup>
import { User, Sunny, Moon } from '@element-plus/icons-vue'
import { useTheme } from '../../composables/useTheme'
import { useUserStore } from '../../stores'

const userStore = useUserStore()

defineEmits(['command'])

const { isDark, toggleTheme } = useTheme()
</script>

<style scoped>
.sidebar-footer {
  border-top: 1px solid var(--border-primary);
  padding: 12px;
  background-color: var(--bg-secondary);
}

.user-info {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: background-color 0.2s;
}

.user-info:hover {
  background-color: var(--bg-tertiary);
}

.theme-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  cursor: pointer;
  color: var(--text-secondary);
  transition: all 0.2s;
  margin-left: 4px;
}

.theme-toggle:hover {
  background-color: var(--bg-hover);
  color: var(--accent-primary);
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: var(--accent-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
}

.user-avatar .el-icon {
  font-size: 18px;
  color: var(--text-inverse);
}

.user-details {
  flex: 1;
}

.username {
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 2px;
}

.user-email {
  color: var(--text-secondary);
  font-size: 12px;
}
</style>
