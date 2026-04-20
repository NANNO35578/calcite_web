<template>
  <div class="login-container">
    <el-card class="login-card">
      <template #header>
        <div class="card-header">
          <h2>用户登录</h2>
        </div>
      </template>
      
      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginRules"
        label-width="80px"
        @submit.prevent="handleLogin"
      >
        <el-form-item label="用户名" prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="请输入用户名"
            clearable
          />
        </el-form-item>
        
        <el-form-item label="密&nbsp;&nbsp;&nbsp;&nbsp;码" prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            show-password
            clearable
            @keyup.enter="handleLogin"
          />
        </el-form-item>
        
        <el-form-item>
          <el-button
            type="primary"
            :loading="loading"
            @click="handleLogin"
            style="width: 100%"
          >
            登录
          </el-button>
        </el-form-item>
        
        <el-form-item>
          <div class="register-link">
            <span>还没有账号？</span>
            <el-link type="primary" @click="goToRegister">立即注册</el-link>
          </div>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { login } from '../api/auth'

const router = useRouter()
const loginFormRef = ref(null)
const loading = ref(false)

const loginForm = reactive({
  username: '',
  password: ''
})

const loginRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ]
}

const handleLogin = async () => {
  if (!loginFormRef.value) return
  
  await loginFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        const data = await login({
          username: loginForm.username,
          password: loginForm.password
        })
        
        // 保存token和用户信息
        if (data.token) {
          localStorage.setItem('token', data.token)
        }
        if (data.user) {
          localStorage.setItem('userInfo', JSON.stringify(data.user))
        }
        
        ElMessage.success('登录成功')
        router.push('/home')
      } catch (error) {
        console.error('登录失败:', error)
      } finally {
        loading.value = false
      }
    }
  })
}

const goToRegister = () => {
  router.push('/register')
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: #272e33;
  /* background-image: 
    radial-gradient(circle at 20% 50%, rgba(127, 187, 179, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(167, 192, 128, 0.1) 0%, transparent 50%); */
}

.login-card {
  width: 90%;
  max-width: 420px;
  background: #2d353b;
  border: 1px solid #7a8478;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}

.login-card :deep(.el-card__header) {
  background: #414b50;
  border-bottom: 1px solid #7a8478;
  padding: 20px;
}

.login-card :deep(.el-card__body) {
  background: #2d353b;
  padding: 30px;
}

.card-header {
  text-align: center;
}

.card-header h2 {
  margin: 0;
  color: #d3c6aa;
  font-size: 24px;
  font-weight: 600;
  letter-spacing: 1px;
}

.login-card :deep(.el-form-item__label) {
  color: #d3c6aa;
}

.login-card :deep(.el-input__wrapper) {
  background-color: #414b50;
  border: 1px solid #7a8478;
  box-shadow: none;
}

.login-card :deep(.el-input__wrapper:hover) {
  border-color: #a7c080;
}

.login-card :deep(.el-input__wrapper.is-focus) {
  border-color: #7fbbb3;
  box-shadow: 0 0 0 1px #7fbbb3 inset;
}

.login-card :deep(.el-input__inner) {
  color: #d3c6aa;
}

.login-card :deep(.el-input__inner::placeholder) {
  color: #7a8478;
}

.login-card :deep(.el-button--primary) {
  background-color: #7fbbb3;
  border-color: #7fbbb3;
  color: #272e33;
  font-weight: 600;
}

.login-card :deep(.el-button--primary:hover) {
  background-color: #a7c080;
  border-color: #a7c080;
}

.login-card :deep(.el-button--primary:active) {
  background-color: #83c092;
  border-color: #83c092;
}

.register-link {
  width: 100%;
  text-align: center;
  font-size: 14px;
}

.register-link span {
  margin-right: 8px;
  color: #7a8478;
}

.login-card :deep(.el-link) {
  color: #7fbbb3;
}

.login-card :deep(.el-link:hover) {
  color: #a7c080;
}

:root[data-theme="light"] {
  .login-container {
    background: #fdf6e3;
    background-image: 
      radial-gradient(circle at 20% 50%, rgba(127, 187, 179, 0.15) 0%, transparent 50%),
      radial-gradient(circle at 80% 80%, rgba(167, 192, 128, 0.15) 0%, transparent 50%);
  }

  .login-card {
    background: #f3e7c8;
    border: 1px solid #a7c080;
  }

  .login-card :deep(.el-card__header) {
    background: #e6dcc4;
    border-bottom: 1px solid #a7c080;
  }

  .login-card :deep(.el-card__body) {
    background: #f3e7c8;
  }

  .card-header h2 {
    color: #5c6a72;
  }

  .login-card :deep(.el-form-item__label) {
    color: #5c6a72;
  }

  .login-card :deep(.el-input__wrapper) {
    background-color: #fdf6e3;
    border: 1px solid #a7c080;
  }

  .login-card :deep(.el-input__wrapper:hover) {
    border-color: #e69875;
  }

  .login-card :deep(.el-input__inner) {
    color: #5c6a72;
  }

  .login-card :deep(.el-input__inner::placeholder) {
    color: #a7c080;
  }

  .register-link span {
    color: #7a8478;
  }
}
</style>

