<template>
  <div class="sidebar-footer">
    <el-dropdown trigger="click" @command="$emit('command', $event)">
      <div class="user-info">
        <div class="user-avatar">
          <el-icon><User /></el-icon>
        </div>
        <div class="user-details">
          <div class="username">{{ userInfo?.username || '用户' }}</div>
          <div class="user-email">{{ userInfo?.email || '' }}</div>
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
import { User } from '@element-plus/icons-vue'

defineProps(['userInfo'])
defineEmits(['command'])
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
