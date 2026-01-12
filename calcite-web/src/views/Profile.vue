<template>
  <div class="profile-container">
    <el-container>
      <el-header>
        <div class="header-content">
          <h1>智能笔记管理系统</h1>
          <el-button type="danger" @click="handleLogout">退出登录</el-button>
        </div>
      </el-header>
      
      <el-main>
        <el-card class="profile-card">
          <template #header>
            <div class="card-header">
              <h2>用户信息</h2>
            </div>
          </template>
          
          <div v-if="loading" class="loading-container">
            <el-skeleton :rows="5" animated />
          </div>
          
          <div v-else-if="userInfo" class="user-info">
            <el-descriptions :column="1" border>
              <el-descriptions-item label="用户名">
                {{ userInfo.username }}
              </el-descriptions-item>
              <el-descriptions-item label="邮箱" v-if="userInfo.email">
                {{ userInfo.email }}
              </el-descriptions-item>
              <el-descriptions-item label="用户ID">
                {{ userInfo.id || userInfo.userId || 'N/A' }}
              </el-descriptions-item>
              <el-descriptions-item label="注册时间" v-if="userInfo.createdAt">
                {{ formatDate(userInfo.createdAt) }}
              </el-descriptions-item>
            </el-descriptions>
          </div>
          
          <div v-else class="error-container">
            <el-alert
              title="获取用户信息失败"
              type="error"
              :closable="false"
            />
          </div>
        </el-card>
      </el-main>
    </el-container>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getUserProfile } from '../api/user'
import { logout } from '../api/auth'

const router = useRouter()
const loading = ref(false)
const userInfo = ref(null)

const fetchUserProfile = async () => {
  loading.value = true
  try {
    const data = await getUserProfile()
    userInfo.value = data
    // 更新本地存储的用户信息
    localStorage.setItem('userInfo', JSON.stringify(data))
  } catch (error) {
    console.error('获取用户信息失败:', error)
    // 如果获取失败，尝试从本地存储读取
    const localUserInfo = localStorage.getItem('userInfo')
    if (localUserInfo) {
      try {
        userInfo.value = JSON.parse(localUserInfo)
      } catch (e) {
        console.error('解析本地用户信息失败:', e)
      }
    }
  } finally {
    loading.value = false
  }
}

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN')
}

const handleLogout = async () => {
  try {
    await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    try {
      await logout()
    } catch (error) {
      console.error('退出登录请求失败:', error)
    }
    
    // 清除本地存储
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
    
    ElMessage.success('已退出登录')
    router.push('/login')
  } catch (error) {
    // 用户取消操作
  }
}

onMounted(() => {
  fetchUserProfile()
})
</script>

<style scoped>
.profile-container {
  min-height: 100vh;
  background-color: #272e33;
}

.el-header {
  background-color: #2d353b;
  border-bottom: 1px solid #7a8478;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
}

.header-content {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 30px;
}

.header-content h1 {
  margin: 0;
  color: #d3c6aa;
  font-size: 24px;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.header-content :deep(.el-button--danger) {
  background-color: #e69875;
  border-color: #e69875;
  color: #272e33;
  font-weight: 600;
}

.header-content :deep(.el-button--danger:hover) {
  background-color: #dd6b4c;
  border-color: #dd6b4c;
}

.el-main {
  padding: 30px;
  display: flex;
  justify-content: center;
  background-color: #272e33;
}

.profile-card {
  width: 100%;
  max-width: 800px;
  background: #2d353b;
  border: 1px solid #7a8478;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
}

.profile-card :deep(.el-card__header) {
  background: #414b50;
  border-bottom: 1px solid #7a8478;
  padding: 20px;
}

.profile-card :deep(.el-card__body) {
  background: #2d353b;
  padding: 30px;
}

.card-header {
  text-align: center;
}

.card-header h2 {
  margin: 0;
  color: #d3c6aa;
  font-size: 20px;
  font-weight: 600;
}

.loading-container {
  padding: 20px;
}

.user-info {
  padding: 20px;
}

.user-info :deep(.el-descriptions) {
  --el-descriptions-table-border-color: #7a8478;
  --el-descriptions-item-bordered-label-background: #414b50;
}

.user-info :deep(.el-descriptions__label) {
  color: #a7c080;
  font-weight: 600;
}

.user-info :deep(.el-descriptions__content) {
  color: #d3c6aa;
}

.error-container {
  padding: 20px;
}

.error-container :deep(.el-alert) {
  background-color: #414b50;
  border: 1px solid #e69875;
}

.error-container :deep(.el-alert__title) {
  color: #e69875;
}

@media (prefers-color-scheme: light) {
  .profile-container {
    background-color: #fdf6e3;
  }

  .el-header {
    background-color: #f3e7c8;
    border-bottom: 1px solid #a7c080;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .header-content h1 {
    color: #5c6a72;
  }

  .header-content :deep(.el-button--danger) {
    background-color: #e69875;
    border-color: #e69875;
    color: #fdf6e3;
  }

  .header-content :deep(.el-button--danger:hover) {
    background-color: #dd6b4c;
    border-color: #dd6b4c;
  }

  .el-main {
    background-color: #fdf6e3;
  }

  .profile-card {
    background: #f3e7c8;
    border: 1px solid #a7c080;
  }

  .profile-card :deep(.el-card__header) {
    background: #e6dcc4;
    border-bottom: 1px solid #a7c080;
  }

  .profile-card :deep(.el-card__body) {
    background: #f3e7c8;
  }

  .card-header h2 {
    color: #5c6a72;
  }

  .user-info :deep(.el-descriptions) {
    --el-descriptions-table-border-color: #a7c080;
    --el-descriptions-item-bordered-label-background: #e6dcc4;
  }

  .user-info :deep(.el-descriptions__label) {
    color: #7fbbb3;
  }

  .user-info :deep(.el-descriptions__content) {
    color: #5c6a72;
  }

  .error-container :deep(.el-alert) {
    background-color: #f3e7c8;
    border: 1px solid #e69875;
  }

  .error-container :deep(.el-alert__title) {
    color: #e69875;
  }
}
</style>

