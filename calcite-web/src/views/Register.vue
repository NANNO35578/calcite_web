<template>
  <div class="register-container">
    <el-card class="register-card">
      <template #header>
        <div class="card-header">
          <h2>用户注册</h2>
        </div>
      </template>
      
      <el-form
        ref="registerFormRef"
        :model="registerForm"
        :rules="registerRules"
        label-width="100px"
        @submit.prevent="handleRegister"
      >
        <el-form-item label="用户名" prop="username">
          <el-input
            v-model="registerForm.username"
            placeholder="请输入用户名"
            clearable
          />
        </el-form-item>
        
        <el-form-item label="邮箱" prop="email">
          <el-input
            v-model="registerForm.email"
            type="email"
            placeholder="请输入邮箱（可选）"
            clearable
          />
        </el-form-item>
        
        <el-form-item label="密码" prop="password">
          <el-input
            v-model="registerForm.password"
            type="password"
            placeholder="请输入密码"
            show-password
            clearable
          />
        </el-form-item>
        
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
            v-model="registerForm.confirmPassword"
            type="password"
            placeholder="请再次输入密码"
            show-password
            clearable
            @keyup.enter="handleRegister"
          />
        </el-form-item>
        
        <el-form-item>
          <el-button
            type="primary"
            :loading="loading"
            @click="handleRegister"
            style="width: 100%"
          >
            注册
          </el-button>
        </el-form-item>
        
        <el-form-item>
          <div class="login-link">
            <span>已有账号？</span>
            <el-link type="primary" @click="goToLogin">立即登录</el-link>
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
import { register } from '../api/auth'

const router = useRouter()
const registerFormRef = ref(null)
const loading = ref(false)

const registerForm = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: ''
})

// 自定义验证规则：确认密码
const validateConfirmPassword = (rule, value, callback) => {
  if (value !== registerForm.password) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const registerRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, message: '用户名长度不能少于3位', trigger: 'blur' }
  ],
  email: [
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ]
}

const handleRegister = async () => {
  if (!registerFormRef.value) return
  
  await registerFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        const data = await register({
          username: registerForm.username,
          email: registerForm.email || undefined,
          password: registerForm.password
        })
        
        ElMessage.success('注册成功，请登录')
        router.push('/login')
      } catch (error) {
        console.error('注册失败:', error)
      } finally {
        loading.value = false
      }
    }
  })
}

const goToLogin = () => {
  router.push('/login')
}
</script>

<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: #272e33;
  /* background-image: 
    radial-gradient(circle at 20% 50%, rgba(127, 187, 179, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(167, 192, 128, 0.1) 0%, transparent 50%); */
}

.register-card {
  width: 90%;
  max-width: 420px;
  background: #2d353b;
  border: 1px solid #7a8478;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}

.register-card :deep(.el-card__header) {
  background: #414b50;
  border-bottom: 1px solid #7a8478;
  padding: 20px;
}

.register-card :deep(.el-card__body) {
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

.register-card :deep(.el-form-item__label) {
  color: #d3c6aa;
}

.register-card :deep(.el-input__wrapper) {
  background-color: #414b50;
  border: 1px solid #7a8478;
  box-shadow: none;
}

.register-card :deep(.el-input__wrapper:hover) {
  border-color: #a7c080;
}

.register-card :deep(.el-input__wrapper.is-focus) {
  border-color: #7fbbb3;
  box-shadow: 0 0 0 1px #7fbbb3 inset;
}

.register-card :deep(.el-input__inner) {
  color: #d3c6aa;
}

.register-card :deep(.el-input__inner::placeholder) {
  color: #7a8478;
}

.register-card :deep(.el-button--primary) {
  background-color: #7fbbb3;
  border-color: #7fbbb3;
  color: #272e33;
  font-weight: 600;
}

.register-card :deep(.el-button--primary:hover) {
  background-color: #a7c080;
  border-color: #a7c080;
}

.register-card :deep(.el-button--primary:active) {
  background-color: #83c092;
  border-color: #83c092;
}

.login-link {
  width: 100%;
  text-align: center;
  font-size: 14px;
}

.login-link span {
  margin-right: 8px;
  color: #7a8478;
}

.register-card :deep(.el-link) {
  color: #7fbbb3;
}

.register-card :deep(.el-link:hover) {
  color: #a7c080;
}

:root[data-theme="light"] {
  .register-container {
    background: #fdf6e3;
    background-image: 
      radial-gradient(circle at 20% 50%, rgba(127, 187, 179, 0.15) 0%, transparent 50%),
      radial-gradient(circle at 80% 80%, rgba(167, 192, 128, 0.15) 0%, transparent 50%);
  }

  .register-card {
    background: #f3e7c8;
    border: 1px solid #a7c080;
  }

  .register-card :deep(.el-card__header) {
    background: #e6dcc4;
    border-bottom: 1px solid #a7c080;
  }

  .register-card :deep(.el-card__body) {
    background: #f3e7c8;
  }

  .card-header h2 {
    color: #5c6a72;
  }

  .register-card :deep(.el-form-item__label) {
    color: #5c6a72;
  }

  .register-card :deep(.el-input__wrapper) {
    background-color: #fdf6e3;
    border: 1px solid #a7c080;
  }

  .register-card :deep(.el-input__wrapper:hover) {
    border-color: #e69875;
  }

  .register-card :deep(.el-input__inner) {
    color: #5c6a72;
  }

  .register-card :deep(.el-input__inner::placeholder) {
    color: #a7c080;
  }

  .login-link span {
    color: #7a8478;
  }
}
</style>

