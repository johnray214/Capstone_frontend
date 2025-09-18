<template>
  <div class="officials-login">
    <div class="split left-panel">
      <div class="brand">
        <img src="@/assets/posu_logo.png" alt="POSU Logo" class="logo" />
        <h1>POSU Officials</h1>
        <p>Admin • Head • Deputy</p>
      </div>
    </div>
    <div class="split right-panel">
      <div class="login-card">
        <div class="logo-header">
          <h2>Welcome Back</h2>
          <p class="subtitle">Sign in to your account to continue</p>
        </div>

        <form @submit.prevent="handleLogin">
          <div v-if="error" class="alert alert-error">{{ error }}</div>
          <div v-if="success" class="alert alert-success">{{ success }}</div>

          <div class="form-group">
            <label for="identifier" class="form-label">Email or Username</label>
            <input
              id="identifier"
              v-model="form.identifier"
              type="text"
              class="form-input"
              placeholder="Enter your email or username"
              required
            />
          </div>

          <div class="form-group">
            <div class="password-header">
              <label for="password" class="form-label">Password</label>
              <router-link to="/forgot-password" class="forgot-password">Forgot Password?</router-link>
            </div>
            <div class="password-input">
              <input
                id="password"
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                class="form-input"
                placeholder="Enter your password"
                required
              />
              <button type="button" class="toggle-password" @click="togglePasswordVisibility">
                <span v-if="showPassword">🙈</span>
                <span v-else>👁️</span>
              </button>
            </div>
          </div>

          <button type="submit" class="btn btn-primary btn-full" :disabled="loading">
            <span v-if="loading" class="spinner-small"></span>
            {{ loading ? 'Signing in...' : 'Sign In' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

export default {
  name: 'OfficialsLogin',
  setup() {
    const router = useRouter()
    const { loginOfficials } = useAuthStore()

    const form = ref({
      identifier: '',
      password: ''
    })

    const showPassword = ref(false)
    const togglePasswordVisibility = () => {
      showPassword.value = !showPassword.value
    }

    const error = ref('')
    const success = ref('')
    const loading = ref(false)

    const handleLogin = async () => {
      try {
        loading.value = true
        error.value = ''

        const result = await loginOfficials(form.value)

        if (result.success) {
          const user = result.user
          if (!user.role && user.user_type) user.role = user.user_type

          const roleRoutes = {
            Head: '/admin/dashboard',
            Deputy: '/admin/dashboard',
            Admin: '/admin/dashboard',
            Enforcer: '/enforcer/dashboard',
            Violator: '/violator/dashboard'
          }

          const redirectTo = roleRoutes[user.role] || '/'
          router.push(redirectTo)
        } else {
          error.value = result.message
        }
      } catch (err) {
        error.value = err.response?.data?.message || 'Invalid credentials'
        console.error('Login error:', err)
      } finally {
        loading.value = false
      }
    }

    return {
      form,
      error,
      success,
      loading,
      handleLogin,
      showPassword,
      togglePasswordVisibility
    }
  }
}
</script>

<style scoped>
.officials-login {
  min-height: 100vh;
  display: flex;
}

.split {
  flex: 1;
}

.left-panel {
  background: #1e3a8a;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
}

.brand {
  text-align: center;
  padding: 24px;
}

.brand .logo {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  background: #0d55c8;
  border: 3px solid white;
  padding: 6px;
  box-shadow: 0 6px 20px rgba(0,0,0,0.25);
  margin-bottom: 16px;
}

.brand h1 {
  margin: 0 0 4px 0;
  font-size: 24px;
  font-weight: 700;
}

.right-panel {
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.login-card {
  background: white;
  width: 100%;
  max-width: 420px;
  border-radius: 16px;
  padding: 40px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08);
}

.logo-header h2 {
  color: #1f2937;
  margin: 0 0 8px 0;
  text-align: center;
}

.subtitle {
  color: #6b7280;
  margin: 0 0 24px 0;
  text-align: center;
}

.form-group { margin-bottom: 1.5rem; }
.form-label { display: block; margin-bottom: 6px; color: #374151; font-weight: 500; }
.form-input { width: 100%; padding: 10px 12px; border: 1px solid #d1d5db; border-radius: 8px; }

.password-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
.forgot-password { font-size: 0.875rem; color: #3b82f6; text-decoration: none; }
.password-input { position: relative; }
.toggle-password { position: absolute; right: 8px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; }

.btn-full { width: 100%; display: flex; justify-content: center; align-items: center; gap: 8px; }
.btn-primary { background: #2563eb; color: white; border: none; padding: 10px 14px; border-radius: 8px; cursor: pointer; }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

.alert { padding: 10px 12px; border-radius: 8px; margin-bottom: 12px; font-size: 14px; }
.alert-error { background: #fee2e2; color: #991b1b; }
.alert-success { background: #dcfce7; color: #166534; }

.spinner-small {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin { from { transform: rotate(0); } to { transform: rotate(360deg); } }

@media (max-width: 900px) {
  .officials-login { flex-direction: column; }
  .left-panel { min-height: 180px; }
}
</style>


