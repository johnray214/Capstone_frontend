<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-card">
        <div class="logo-container">
          <img src="@/assets/posu_logo.png" alt="POSU Logo" class="logo" />
          <h1>POSU Traffic Violation System</h1>
        </div>
        
        <div class="login-form">
          <h2>Welcome Back</h2>
          <p class="subtitle">Sign in to your account to continue</p>

          <form @submit.prevent="handleLogin">
            <div v-if="error" class="alert alert-error">
              {{ error }}
            </div>
            <div v-if="success" class="alert alert-success">
              {{ success }}
            </div>

            <div class="form-group">
              <label for="identifier" class="form-label">Email or Mobile Number</label>
              <input
                id="identifier"
                v-model="form.identifier"
                type="text"
                class="form-input"
                placeholder="Enter your email or mobile number"
                required
              />
            </div>

            <div class="form-group">
              <div class="password-header">
                <label for="password" class="form-label">Password</label>
                <router-link to="/forgot-password?from=violator" class="forgot-password">Forgot Password?</router-link>
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

          <div class="login-footer">
            <p>Don't have an account? 
              <router-link to="/register" class="link">Sign up here</router-link>
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

export default {
  name: 'LoginPage',
  setup() {
    const router = useRouter()
    const { loginViolator } = useAuthStore()

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

        const result = await loginViolator(form.value)

        if (result.success) {
        const user = result.user;

        if (!user.role && user.user_type) {
          user.role = user.user_type;
        }

        result.user.role = user.role;

        const roleRoutes = {
          Head: "/admin/dashboard",
          Deputy: "/admin/dashboard",
          Admin: "/admin/dashboard",
          Enforcer: "/enforcer/dashboard",
          Violator: "/violator/dashboard"
        }

        const redirectTo = roleRoutes[user.role] || "/";
        router.push(redirectTo);
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

    // Check for register success message passed via router
    if (router.currentRoute.value.query?.registered === '1') {
      success.value = 'Account created successfully! You can now sign in.'
      setTimeout(() => { success.value = '' }, 3000)
      router.replace({ query: {} })
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
.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  position: relative;
}

.login-page::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="50" cy="50" r="1" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
  opacity: 0.1;
}

.login-container {
  width: 100%;
  max-width: 400px;
  position: relative;
  z-index: 1;
}

.login-card {
  background: white;
  border-radius: 16px;
  padding: 40px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
}

.logo-container {
  background: linear-gradient(135deg, #1e40af, #3b82f6);
  color: white;
  padding: 30px;
  text-align: center;
  margin: -40px -40px 30px -40px;
  border-radius: 16px 16px 0 0;
}

.logo {
  width: 80px;
  height: 80px;
  margin-bottom: 15px;
  border-radius: 50%;
  background: #0d55c8;
  border: 3px solid white;
  padding: 5px;
  box-shadow: 0 4px 16px rgba(255, 255, 255, 0.2);
}

h1 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: white;
}

h2 {
  color: #1f2937;
  margin-top: 0;
  margin-bottom: 10px;
  font-size: 1.5rem;
  text-align: center;
}

.subtitle {
  color: #6b7280;
  margin-top: 0;
  margin-bottom: 25px;
  line-height: 1.5;
  text-align: center;
}

.form-group {
  margin-bottom: 1.5rem;
}

.password-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.forgot-password {
  font-size: 0.875rem;
  color: #3b82f6;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;
}

.forgot-password:hover {
  color: #2563eb;
  text-decoration: underline;
}

.password-input {
  position: relative;
  width: 100%;
}

.toggle-password {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  color: #6b7280;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;
  width: 32px;
  height: 32px;
  border-radius: 4px;
}

.toggle-password:hover {
  color: #3b82f6;
  background-color: #f3f4f6;
}

.toggle-password:focus {
  outline: none;
  color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3);
}

/* Ensure the password input has enough padding for the eye icon */
.form-input[type="password"],
.form-input[type="text"] {
  padding-right: 44px;
}

.logo {
  margin-bottom: 24px;
}

.logo-text {
  font-size: 28px;
  font-weight: 700;
  background: linear-gradient(135deg, #1e3a8a, #3b82f6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.login-header h1 {
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 8px;
}

.login-header p {
  color: #6b7280;
  font-size: 16px;
}

.login-form {
  margin-bottom: 24px;
}

.btn-full {
  width: 100%;
  justify-content: center;
  display: flex;
  align-items: center;
  gap: 8px;
}

.spinner-small {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.login-footer {
  text-align: center;
  padding-top: 24px;
  border-top: 1px solid #e5e7eb;
}

.login-footer p {
  color: #6b7280;
  margin: 0;
}

.link {
  color: #3b82f6;
  text-decoration: none;
  font-weight: 500;
}

.link:hover {
  color: #1e40af;
  text-decoration: underline;
}

@media (max-width: 480px) {
  .login-card {
    padding: 24px;
  }
  
  .login-header h1 {
    font-size: 20px;
  }
  
  .logo-text {
    font-size: 24px;
  }
}
</style>
