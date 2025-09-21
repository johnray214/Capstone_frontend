<template>
  <SidebarLayout page-title="My Profile">
    <div class="violator-profile">
      <!-- Profile Header -->
      <div class="profile-header">
        <div class="profile-avatar">
          <div class="avatar-circle">
            {{ userInitials }}
          </div>
        </div>
        <div class="profile-info">
          <h2>{{ fullName }}</h2>
          <p class="mobile-number">Mobile: {{ user ? user.mobile_number : 'N/A' }}</p>
          <p class="member-since">Member since {{ user ? formatDate(user.created_at) : 'N/A' }}</p>
        </div>
      </div>

      <!-- Account Information (Read-Only) -->
      <div class="profile-form">
        <div class="form-section">
          <h3>Personal Information</h3>
          <div class="info-grid">
            <div class="info-item">
              <label>First Name</label>
              <span>{{ user?.first_name || 'N/A' }}</span>
            </div>
            <div class="info-item">
              <label>Middle Name</label>
              <span>{{ user?.middle_name || 'N/A' }}</span>
            </div>
            <div class="info-item">
              <label>Last Name</label>
              <span>{{ user?.last_name || 'N/A' }}</span>
            </div>
            <div class="info-item">
              <label>Mobile Number</label>
              <span>{{ user?.mobile_number || 'N/A' }}</span>
            </div>
            <div class="info-item full-width">
              <label>Address</label>
              <span>{{ user?.barangay || 'N/A' }} {{ user?.city || 'N/A' }} {{ user?.province || 'N/A' }}</span>
            </div>
            <div class="info-item">
              <label>Driver's License</label>
              <span>{{ user?.license_number || 'N/A' }}</span>
            </div>
            <div class="info-item">
              <label>Email</label>
              <span>{{ user?.email || 'N/A' }}</span>
            </div>
          </div>
          <div class="info-note">
            <div class="note-icon">ℹ️</div>
            <p>To update your personal information, please visit the POSU office with a valid ID.</p>
          </div>
        </div>
      </div>

      <!-- Change Password Section -->
      <div class="profile-form">
        <div class="form-section">
          <h3>Change Password</h3>
          <div class="form-grid">
            <div class="form-group">
              <label for="current_password">Current Password *</label>
              <div class="password-input-container">
                <div class="password-input">
                  <input
                    id="current_password"
                    :type="showCurrentPassword ? 'text' : 'password'"
                    v-model="passwordData.current_password"
                    class="form-input"
                    :class="{ error: passwordErrors.current_password }"
                    placeholder="Enter Current Password"
                  >
                  <button type="button" class="toggle-password" @click="showCurrentPassword = !showCurrentPassword">
                    <span v-if="showCurrentPassword">🙈</span>
                    <span v-else>👁️</span>
                  </button>
                </div>
              </div>
              <span v-if="passwordErrors.current_password" class="error-message">{{ passwordErrors.current_password[0] }}</span>
            </div>

            <div class="form-group">
              <label for="new_password">New Password *</label>
              <div class="password-input-container">
                <div class="password-input">
                  <input
                    id="new_password"
                    :type="showNewPassword ? 'text' : 'password'"
                    v-model="passwordData.new_password"
                    class="form-input"
                    :class="{
                      error: passwordErrors.new_password,
                      'password-weak': newPasswordStrength === 'weak',
                      'password-medium': newPasswordStrength === 'medium',
                      'password-strong': newPasswordStrength === 'strong'
                    }"
                    placeholder="Enter New Password"
                  >
                  <button type="button" class="toggle-password" @click="showNewPassword = !showNewPassword">
                    <span v-if="showNewPassword">🙈</span>
                    <span v-else>👁️</span>
                  </button>
                </div>
                
                <!-- Password Strength Indicator -->
                <div v-if="passwordData.new_password && newPasswordStrength" class="password-strength">
                  <div class="strength-bar">
                    <div 
                      class="strength-fill"
                      :class="getPasswordStrengthClass(newPasswordStrength)"
                      :style="{ width: newPasswordStrength === 'weak' ? '33%' : newPasswordStrength === 'medium' ? '66%' : '100%' }"
                    ></div>
                  </div>
                  <span class="strength-text" :class="getPasswordStrengthClass(newPasswordStrength)">
                    {{ getPasswordStrengthText(newPasswordStrength) }}
                  </span>
                </div>
                
                <!-- Password Requirements -->
                <div v-if="passwordData.new_password" class="password-requirements">
                  <small class="requirements-title">Password Requirements:</small>
                  <ul class="requirements-list">
                    <li :class="{ 'requirement-met': passwordData.new_password.length >= 8 }">
                      <span class="requirement-icon">
                        <svg v-if="passwordData.new_password.length >= 8" class="check-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <polyline points="20,6 9,17 4,12"></polyline>
                        </svg>
                        <svg v-else class="x-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <line x1="18" y1="6" x2="6" y2="18"></line>
                          <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                      </span>
                      At least 8 characters long
                    </li>
                    <li :class="{ 'requirement-met': /[A-Z]/.test(passwordData.new_password) }">
                      <span class="requirement-icon">
                        <svg v-if="/[A-Z]/.test(passwordData.new_password)" class="check-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <polyline points="20,6 9,17 4,12"></polyline>
                        </svg>
                        <svg v-else class="x-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <line x1="18" y1="6" x2="6" y2="18"></line>
                          <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                      </span>
                      At least one uppercase letter (A-Z)
                    </li>
                    <li :class="{ 'requirement-met': /[a-z]/.test(passwordData.new_password) }">
                      <span class="requirement-icon">
                        <svg v-if="/[a-z]/.test(passwordData.new_password)" class="check-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <polyline points="20,6 9,17 4,12"></polyline>
                        </svg>
                        <svg v-else class="x-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <line x1="18" y1="6" x2="6" y2="18"></line>
                          <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                      </span>
                      At least one lowercase letter (a-z)
                    </li>
                    <li :class="{ 'requirement-met': /\d/.test(passwordData.new_password) }">
                      <span class="requirement-icon">
                        <svg v-if="/\d/.test(passwordData.new_password)" class="check-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <polyline points="20,6 9,17 4,12"></polyline>
                        </svg>
                        <svg v-else class="x-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <line x1="18" y1="6" x2="6" y2="18"></line>
                          <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                      </span>
                      At least one number (0-9)
                    </li>
                  </ul>
                </div>
              </div>
              <span v-if="passwordErrors.new_password" class="error-message">{{ passwordErrors.new_password[0] }}</span>
            </div>

            <div class="form-group">
              <label for="new_password_confirmation">Confirm New Password *</label>
              <div class="password-input-container">
                <div class="password-input">
                  <input
                    id="new_password_confirmation"
                    :type="showConfirmPassword ? 'text' : 'password'"
                    v-model="passwordData.new_password_confirmation"
                    class="form-input"
                    :class="{ 
                      error: passwordErrors.new_password_confirmation,
                      'password-match': passwordData.new_password && passwordData.new_password_confirmation && passwordData.new_password === passwordData.new_password_confirmation,
                      'password-mismatch': passwordData.new_password && passwordData.new_password_confirmation && passwordData.new_password !== passwordData.new_password_confirmation
                    }"
                    placeholder="Confirm new password"
                  >
                  <button type="button" class="toggle-password" @click="showConfirmPassword = !showConfirmPassword">
                    <span v-if="showConfirmPassword">🙈</span>
                    <span v-else>👁️</span>
                  </button>
                </div>
                
                <!-- Password Match Indicator -->
                <div v-if="passwordData.new_password && passwordData.new_password_confirmation" class="password-match-indicator">
                  <div v-if="passwordData.new_password === passwordData.new_password_confirmation" class="match-success">
                    <svg class="check-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="20,6 9,17 4,12"></polyline>
                    </svg>
                    Passwords match
                  </div>
                  <div v-else class="match-error">
                    <svg class="x-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                    Passwords do not match
                  </div>
                </div>
              </div>
              <span v-if="passwordErrors.new_password_confirmation" class="error-message">{{ passwordErrors.new_password_confirmation[0] }}</span>
            </div>
          </div>

          <div class="form-actions">
            <button @click="changePassword" :disabled="changingPassword || !isPasswordFormValid" class="btn btn-primary">
              <span v-if="changingPassword" class="spinner-sm"></span>
              {{ changingPassword ? 'Changing...' : 'Change Password' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Account Statistics -->
      <div class="account-stats">
        <h3>Account Statistics</h3>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">📋</div>
            <div class="stat-content">
              <div class="stat-number">{{ accountStats.total_violations || 0 }}</div>
              <div class="stat-label">Total Violations</div>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon">⏳</div>
            <div class="stat-content">
              <div class="stat-number">{{ accountStats.pending_violations || 0 }}</div>
              <div class="stat-label">Unpaid Violations</div>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon">✅</div>
            <div class="stat-content">
              <div class="stat-number">{{ accountStats.paid_violations || 0 }}</div>
              <div class="stat-label">Paid Violations</div>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon">💰</div>
            <div class="stat-content">
              <div class="stat-number">₱{{ formatCurrency(accountStats.total_amount || 0) }}</div>
              <div class="stat-label">Total Fines</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Account Security Info -->
      <div class="profile-form">
        <div class="form-section">
          <h3>Account Security</h3>
          <div class="security-info">
            <div class="security-item">
              <div class="security-label">Last Login</div>
              <div class="security-value">{{ formatDateTime(user?.last_login_at) || 'Never' }}</div>
            </div>
            <div class="security-item">
              <div class="security-label">Account Created</div>
              <div class="security-value">{{ formatDate(user?.created_at) || 'N/A' }}</div>
            </div>
            <div class="security-item">
              <div class="security-label">Password Last Changed</div>
              <div class="security-value">{{ formatDate(user?.password_changed_at) || 'Never' }}</div>
            </div>
          </div>
          <div class="security-note">
            <div class="note-icon">🔒</div>
            <p>For your account security, change your password regularly and never share your login credentials.</p>
          </div>
        </div>
      </div>

      <!-- Error Messages (Success messages now handled by SweetAlert) -->
      <div v-if="message && messageType === 'error'" class="message" :class="messageType">
        {{ message }}
      </div>
    </div>
  </SidebarLayout>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import SidebarLayout from '@/components/SidebarLayout.vue'
import { useAuthStore } from '@/stores/auth'
import { violatorAPI } from '@/services/api/'
import Swal from 'sweetalert2'
import { validatePassword, getPasswordStrength } from '@/utils/passwordValidation' 

const { state } = useAuthStore()
const user = computed(() => state.user)

// Password visibility toggles
const showCurrentPassword = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)

// Password validation states
const newPasswordStrength = ref('')

const passwordData = ref({
  current_password: '',
  new_password: '',
  new_password_confirmation: ''
})

const passwordErrors = ref({})
const changingPassword = ref(false)

const accountStats = ref({
  total_violations: 0,
  pending_violations: 0,
  paid_violations: 0,
  total_amount: 0
})

const message = ref('')
const messageType = ref('')

const userInitials = computed(() => {
  if (!user.value) return '?'
  const first = user.value.first_name?.charAt(0) || ''
  const last = user.value.last_name?.charAt(0) || ''
  return (first + last).toUpperCase()
})

const fullName = computed(() => {
  if (!user.value) return ''
  const middle = user.value.middle_name ? ` ${user.value.middle_name}` : ''
  return `${user.value.first_name}${middle} ${user.value.last_name}`
})

// Watch new password for real-time validation
watch(() => passwordData.value.new_password, (newPassword) => {
  if (newPassword) {
    newPasswordStrength.value = getPasswordStrength(newPassword)
  } else {
    newPasswordStrength.value = ''
  }
})

// Computed property to check if password form is valid
const isPasswordFormValid = computed(() => {
  return passwordData.value.current_password &&
         passwordData.value.new_password &&
         passwordData.value.new_password_confirmation &&
         passwordData.value.new_password === passwordData.value.new_password_confirmation &&
         newPasswordStrength.value !== 'weak'
})

const getPasswordStrengthClass = (strength) => {
  return `password-${strength}`
}

const getPasswordStrengthText = (strength) => {
  switch (strength) {
    case 'weak': return 'Weak'
    case 'medium': return 'Medium'
    case 'strong': return 'Strong'
    default: return ''
  }
}

const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const formatDateTime = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatCurrency = (amount) => {
  if (!amount) return '0.00'
  return new Intl.NumberFormat('en-PH', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(Number(amount))
}

const loadProfileData = async () => {
  try {
    const profileRes = await violatorAPI.getProfile()
    const statsRes = await violatorAPI.getStatistics()

    // Map profile data
    if (profileRes.data?.violator) {
      Object.assign(state.user, profileRes.data.violator)
    }

    // Map statistics data
    if (statsRes.data?.data?.stats) {
      const stats = statsRes.data.data.stats
      accountStats.value = {
        total_violations: stats.total_violations,
        pending_violations: stats.pending_violations,
        paid_violations: stats.paid_violations,
        total_amount: Number(stats.total_fines) || 0
      }
    }

  } catch (err) {
    console.error('Failed to load profile data:', err)
  }
}

const changePassword = async () => {
  try {
    changingPassword.value = true
    passwordErrors.value = {}
    message.value = ''

    // Validate password requirements using our utility
    const passwordValidation = validatePassword(passwordData.value.new_password)
    if (!passwordValidation.isValid) {
      passwordErrors.value.new_password = passwordValidation.errors
      return
    }

    // Validate password confirmation
    if (passwordData.value.new_password !== passwordData.value.new_password_confirmation) {
      passwordErrors.value.new_password_confirmation = ['Passwords do not match']
      return
    }

    await violatorAPI.changePassword(passwordData.value)

    // Show success message with SweetAlert
    await Swal.fire({
      icon: 'success',
      title: 'Success!',
      text: 'Password changed successfully',
      confirmButtonText: 'OK'
    })

    // Reset password form
    passwordData.value = {
      current_password: '',
      new_password: '',
      new_password_confirmation: ''
    }

    // Reset password visibility
    showCurrentPassword.value = false
    showNewPassword.value = false
    showConfirmPassword.value = false
    newPasswordStrength.value = ''

  } catch (err) {
    if (err.response?.status === 422) {
      passwordErrors.value = err.response.data.errors
    } else if (err.response?.data?.message) {
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.response.data.message,
        confirmButtonText: 'OK'
      })
    } else {
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to change password',
        confirmButtonText: 'OK'
      })
    }
  } finally {
    changingPassword.value = false
  }
}

onMounted(() => {
  loadProfileData()
})
</script>

<style scoped>
.violator-profile {
  max-width: 1200px;
  margin: 0 auto;
}

.profile-header {
  background: linear-gradient(135deg, #1e3a8a, #3b82f6);
  color: white;
  border-radius: 12px;
  padding: 32px;
  margin-bottom: 32px;
  display: flex;
  align-items: center;
  gap: 24px;
}

.profile-avatar {
  flex-shrink: 0;
}

.avatar-circle {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  font-weight: 700;
  color: white;
}

.profile-info {
  flex: 1;
}

.profile-info h2 {
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 8px 0;
}

.mobile-number {
  font-size: 16px;
  opacity: 0.9;
  margin: 0 0 4px 0;
}

.member-since {
  font-size: 14px;
  opacity: 0.8;
  margin: 0;
}

.profile-form {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  margin-bottom: 32px;
  overflow: hidden;
}

.form-section {
  padding: 32px;
}

.form-section h3 {
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 24px 0;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-item.full-width {
  grid-column: 1 / -1;
}

.info-item label {
  font-size: 12px;
  font-weight: 500;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.info-item span {
  font-size: 14px;
  color: #1f2937;
  font-weight: 500;
}

.info-note, .security-note {
  background: #f0f9ff;
  border: 1px solid #0ea5e9;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.note-icon {
  font-size: 16px;
  flex-shrink: 0;
  margin-top: 2px;
}

.info-note p, .security-note p {
  font-size: 14px;
  color: #0c4a6e;
  margin: 0;
  line-height: 1.4;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.form-input {
  padding: 12px 16px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.form-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-input.error {
  border-color: #ef4444;
}

.error-message {
  font-size: 12px;
  color: #ef4444;
}

.form-actions {
  padding: 24px 32px;
  background: #f9fafb;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin: 0 -32px -32px -32px;
}

.notification-settings {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  cursor: pointer;
}

.checkbox-label input[type="checkbox"] {
  margin: 0;
  width: 16px;
  height: 16px;
}

.setting-description {
  font-size: 13px;
  color: #6b7280;
  margin: 0;
  line-height: 1.4;
  margin-left: 28px;
}

.account-stats {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  padding: 32px;
  margin-bottom: 32px;
}

.account-stats h3 {
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 24px 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 15px -3px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  font-size: 24px;
}

.stat-number {
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
  line-height: 1;
}

.stat-label {
  font-size: 14px;
  color: #6b7280;
  margin-top: 4px;
}

.security-info {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;
}

.security-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f3f4f6;
}

.security-item:last-child {
  border-bottom: none;
}

.security-label {
  font-size: 14px;
  color: #6b7280;
  font-weight: 500;
}

.security-value {
  font-size: 14px;
  color: #1f2937;
  font-weight: 500;
}

.message {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 12px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  z-index: 1000;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.message.success {
  background: #d1fae5;
  color: #065f46;
  border: 1px solid #a7f3d0;
}

.message.error {
  background: #fee2e2;
  color: #991b1b;
  border: 1px solid #fca5a5;
}

.spinner-sm {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: 8px;
}
.password-input-container {
  position: relative;
}

.password-input {
  position: relative;
  display: flex;
  align-items: center;
}

.password-input .form-input {
  padding-right: 45px;
}

.password-input .form-input.password-weak {
  border-color: #ef4444;
}

.password-input .form-input.password-medium {
  border-color: #f59e0b;
}

.password-input .form-input.password-strong {
  border-color: #10b981;
}

.password-input .form-input.password-match {
  border-color: #10b981;
}

.password-input .form-input.password-mismatch {
  border-color: #ef4444;
}

.toggle-password {
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
  z-index: 2;
}

.password-strength {
  margin-top: 8px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.strength-bar {
  flex: 1;
  height: 4px;
  background-color: #e5e7eb;
  border-radius: 2px;
  overflow: hidden;
}

.strength-fill {
  height: 100%;
  transition: all 0.3s ease;
}

.strength-fill.password-weak {
  background-color: #ef4444;
}

.strength-fill.password-medium {
  background-color: #f59e0b;
}

.strength-fill.password-strong {
  background-color: #10b981;
}

.strength-text {
  font-size: 12px;
  font-weight: 500;
  min-width: 60px;
}

.strength-text.password-weak {
  color: #ef4444;
}

.strength-text.password-medium {
  color: #f59e0b;
}

.strength-text.password-strong {
  color: #10b981;
}

.password-requirements {
  margin-top: 12px;
  padding: 12px;
  background-color: #f9fafb;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
}

.requirements-title {
  font-weight: 500;
  color: #374151;
  display: block;
  margin-bottom: 6px;
}

.requirements-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.requirements-list li {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 4px;
}

.requirements-list li:last-child {
  margin-bottom: 0;
}

.requirements-list li.requirement-met {
  color: #10b981;
}

.requirement-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 14px;
}

.check-icon {
  color: #10b981;
}

.x-icon {
  color: #ef4444;
}

.password-match-indicator {
  margin-top: 6px;
  font-size: 12px;
}

.match-success {
  color: #10b981;
  display: flex;
  align-items: center;
  gap: 6px;
}

.match-error {
  color: #ef4444;
  display: flex;
  align-items: center;
  gap: 6px;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  .profile-header {
    flex-direction: column;
    text-align: center;
    gap: 20px;
  }
  
  .info-grid, .form-grid, .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .security-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
}
</style>