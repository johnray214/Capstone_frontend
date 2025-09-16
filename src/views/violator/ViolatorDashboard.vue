<template>
  <SidebarLayout page-title="My Dashboard">
    <div class="violator-dashboard">
      <!-- Welcome Section -->
      <div class="welcome-section">
        <div class="welcome-content">
          <h2>Welcome back, {{ userName }}!</h2>
          <p>Here's an overview of your traffic violation records.</p>
        </div>
        <div class="welcome-actions">
          <router-link to="/violator/history" class="btn btn-primary">
            <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
            View All Violations
          </router-link>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon total">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ stats.total_violations || 0 }}</div>
            <div class="stat-label">Total Violations</div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon pending">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ stats.pending_violations || 0 }}</div>
            <div class="stat-label">Unpaid Violations</div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon paid">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ stats.paid_violations || 0 }}</div>
            <div class="stat-label">Paid Violations</div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon amount">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <div class="stat-content">
            <div class="stat-number">₱{{ formatCurrency(stats.total_fines || 0) }}</div>
            <div class="stat-label">Total Fines</div>
          </div>
        </div>
      </div>

      <!-- Outstanding Violations Info -->
      <div v-if="stats.unpaid_fines > 0" class="alert-card">
        <div class="alert-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
          </svg>
        </div>
        <div class="alert-content">
          <h3>Outstanding Violations</h3>
          <p>You have {{ stats.pending_violations }} unpaid violation{{ stats.pending_violations > 1 ? 's' : '' }} 
            with a total amount of ₱{{ formatCurrency(stats.unpaid_fines || 0) }}. 
            Please visit the office to settle your payments.</p>
        </div>
      </div>

      <!-- Recent Violations -->
      <div class="dashboard-card">
        <div class="card-header">
          <h3>Recent Violations</h3>
          <router-link to="/violator/history" class="btn btn-primary btn-sm">
            View All
          </router-link>
        </div>
        <div class="violations-container">
          <div v-if="loading" class="loading">
            <div class="spinner"></div>
          </div>
          <div v-else-if="recentViolations.length === 0" class="no-data">
            <div class="no-data-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <h3>No violations found</h3>
            <p>Great! You have no traffic violations on record. Keep up the safe driving!</p>
          </div>
          <div v-else class="violations-list">
            <div v-for="violation in recentViolations" :key="violation.id" class="violation-item">
              <div class="violation-info">
                <div class="violation-header">
                  <span class="violation-type">{{ violation.violation?.name }}</span>
                  <span class="violation-amount">₱{{ formatCurrency(violation.fine_amount) }}</span>
                  <span class="status-badge" :class="`status-${violation.status?.toLowerCase()}`">
                    {{ violation.status }}
                  </span>
                </div>
                <div class="violation-details">
                  <div class="violation-detail">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                      <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                    </svg>
                    {{ violation.location }}
                  </div>
                  <div class="violation-detail">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                      <line x1="16" y1="2" x2="16" y2="6"/>
                      <line x1="8" y1="2" x2="8" y2="6"/>
                      <line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                    {{ formatDateTime(violation.date_time) }}
                  </div>
                  <div class="violation-detail">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                    {{ violation.apprehending_officer?.first_name }} {{ violation.apprehending_officer?.middle_name }} {{ violation.apprehending_officer?.last_name }}
                  </div>
                </div>
              </div>
              <div class="violation-actions">
                <button @click="viewViolation(violation)" class="btn btn-secondary btn-sm">
                  View Details
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="quick-actions">
        <h3>Quick Actions</h3>
        <div class="actions-grid">
          <router-link to="/violator/history" class="action-card">
            <div class="action-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
            </div>
            <div class="action-title">Violation History</div>
            <div class="action-desc">View all your traffic violations</div>
          </router-link>
          
          <router-link to="/violator/profile" class="action-card">
            <div class="action-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
              </svg>
            </div>
            <div class="action-title">Security Settings</div>
            <div class="action-desc">Change your password and security settings</div>
          </router-link>
          
          <router-link to="/violator/notifications" class="action-card">
            <div class="action-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 8a6 6 0 00-12 0c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 01-3.46 0"/>
              </svg>
            </div>
            <div class="action-title">Notifications</div>
            <div class="action-desc">Check important messages</div>
          </router-link>
        </div>
      </div>

      <!-- Violation Details Modal -->
      <div v-if="showViolationModal" class="modal-overlay" @click="closeViolationModal">
        <div class="modal" @click.stop>
          <div class="modal-header">
            <h3>Violation Details</h3>
            <button @click="closeViolationModal" class="modal-close">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          <div class="modal-body" v-if="selectedViolation">
            <div class="violation-details-modal">
              <div class="detail-section">
                <h4>Violation Information</h4>
                <div class="detail-grid">
                  <div class="detail-item">
                    <label>Violation Type:</label>
                    <span>{{ selectedViolation.violation?.name }}</span>
                  </div>
                  <div class="detail-item">
                    <label>Fine Amount:</label>
                    <span class="fine-amount">₱{{ formatCurrency(selectedViolation.fine_amount) }}</span>
                  </div>
                  <div class="detail-item">
                    <label>Status:</label>
                    <span class="status-badge" :class="`status-${selectedViolation.status?.toLowerCase()}`">
                      {{ selectedViolation.status }}
                    </span>
                  </div>
                  <div class="detail-item">
                    <label>Date & Time:</label>
                    <span>{{ formatDateTime(selectedViolation.date_time) }}</span>
                  </div>
                </div>
              </div>
              
              <div class="detail-section">
                <h4>Location & Details</h4>
                <div class="detail-item full-width">
                  <label>Location:</label>
                  <span>{{ selectedViolation.location }}</span><br>
                </div>
                <div class="detail-item full-width">
                  <label>Description:</label>
                  <span>{{ selectedViolation.violation?.description }}</span>
                </div>
                <div v-if="selectedViolation.remarks" class="detail-item full-width">
                  <label>Remarks:</label>
                  <span>{{ selectedViolation.remarks }}</span>
                </div>
              </div>
              
              <div class="detail-section">
                <h4>Enforcer Information</h4>
                <div class="detail-grid">
                  <div class="detail-item">
                    <label>Enforcer:</label>
                    <span>{{ selectedViolation.apprehending_officer?.first_name }} {{ selectedViolation.apprehending_officer?.middle_name }} {{ selectedViolation.apprehending_officer?.last_name }}</span>
                  </div>
                </div>
              </div>
              
              <div v-if="selectedViolation.status === 'Pending'" class="payment-notice">
                <div class="notice-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="16" x2="12" y2="12"/>
                    <line x1="12" y1="8" x2="12.01" y2="8"/>
                  </svg>
                </div>
                <div class="notice-content">
                  <h4>Payment Required</h4>
                  <p>Please visit the POSU office to settle this violation. Bring a valid ID and reference this Ticket Number: #{{ selectedViolation.ticket_number }}</p>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button @click="closeViolationModal" class="btn btn-secondary">Close</button>
          </div>
        </div>
      </div>
    </div>
  </SidebarLayout>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import SidebarLayout from '@/components/SidebarLayout.vue'
import { violatorAPI } from '@/services/api'
import { useAuthStore } from '@/stores/auth'

export default {
  name: 'ViolatorDashboard',
  components: {
    SidebarLayout
  },
  setup() {
    const { state } = useAuthStore()
    const loading = ref(true)
    const stats = ref({})
    const recentViolations = ref([])
    const showViolationModal = ref(false)
    const selectedViolation = ref(null)
    
    const userName = computed(() => {
      if (!state.user) return ''
      return `${state.user.first_name} ${state.user.last_name}`
    })
    
    const loadDashboardData = async () => {
      try {
        loading.value = true
        const response = await violatorAPI.dashboard()

        if (response.data.status === 'success') {
          const data = response.data.data
          stats.value = data.stats || {}
          recentViolations.value = data.recent_violations || []
        }
      } catch (error) {
        console.error('Failed to load dashboard data:', error)
      } finally {
        loading.value = false
      }
    }
    
    const viewViolation = (violation) => {
      selectedViolation.value = violation
      showViolationModal.value = true
    }
    
    const closeViolationModal = () => {
      showViolationModal.value = false
      selectedViolation.value = null
    }
    
    const formatCurrency = (amount) => {
      return new Intl.NumberFormat('en-PH').format(amount)
    }
    
    const formatDateTime = (dateString) => {
      if (!dateString) return ''
      return new Date(dateString).toLocaleString('en-PH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
    
    onMounted(() => {
      loadDashboardData()
    })
    
    return {
      loading,
      stats,
      recentViolations,
      showViolationModal,
      selectedViolation,
      userName,
      viewViolation,
      closeViolationModal,
      formatCurrency,
      formatDateTime
    }
  }
}
</script>

<style scoped>

.violator-dashboard {
  max-width: 1400px;
  margin: 0 auto;
  background: #f8fafc;
  min-height: 100vh;
  padding: 20px;
}

.welcome-section {
  background: linear-gradient(135deg, #3b82f6, #1e40af);
  color: white;
  border-radius: 16px;
  padding: 32px;
  margin-bottom: 32px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 4px 20px rgba(59, 130, 246, 0.3);
}

.welcome-content h2 {
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 8px 0;
}

.welcome-content p {
  font-size: 16px;
  opacity: 0.9;
  margin: 0;
}

.btn {
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
}

.btn-icon {
  width: 18px;
  height: 18px;
}

.btn-primary {
  background: white;
  color: #3b82f6;
}

.btn-primary:hover {
  background: #f1f5f9;
  transform: translateY(-2px);
}

.btn-secondary {
  background: #e2e8f0;
  color: #475569;
}

.btn-secondary:hover {
  background: #cbd5e1;
}

.btn-sm {
  padding: 8px 16px;
  font-size: 13px;
}

/* Light Stats Cards */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.1);
  border: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(59, 130, 246, 0.15);
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-icon svg {
  width: 24px;
  height: 24px;
}

/* Light pastel colors for stats */
.stat-icon.total { 
  background: #dbeafe;
  color: #3b82f6;
}

.stat-icon.pending { 
  background: #fef3c7;
  color: #f59e0b;
}

.stat-icon.paid { 
  background: #d1fae5;
  color: #10b981;
}

.stat-icon.amount { 
  background: #e0e7ff;
  color: #6366f1;
}

.stat-number {
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
  line-height: 1;
}

.stat-label {
  font-size: 13px;
  color: #6b7280;
  margin-top: 4px;
  font-weight: 500;
}

.alert-card {
  background: #fef3c7;
  border: 1px solid #f59e0b;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 32px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.alert-icon {
  width: 40px;
  height: 40px;
  background: #f59e0b;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.alert-icon svg {
  width: 20px;
  height: 20px;
}

.alert-content h3 {
  font-size: 16px;
  font-weight: 600;
  color: #92400e;
  margin: 0 0 4px 0;
}

.alert-content p {
  color: #92400e;
  margin: 0;
  line-height: 1.5;
  font-size: 14px;
}

.dashboard-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.1);
  border: 1px solid #e2e8f0;
  margin-bottom: 32px;
  overflow: hidden;
}

.card-header {
  padding: 24px;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f8fafc;
}

.card-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.violations-container {
  min-height: 200px;
}

.violations-list {
  padding: 24px;
}

.violation-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 20px 0;
  border-bottom: 1px solid #f3f4f6;
}

.violation-item:hover {
  background: #f8fafc;
  margin: 0 -24px;
  padding: 20px 24px;
  border-radius: 8px;
}

.violation-item:last-child {
  border-bottom: none;
}

.violation-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.violation-type {
  font-weight: 600;
  color: #1f2937;
  flex: 1;
  min-width: 200px;
}

.violation-amount {
  font-weight: 600;
  color: #10b981;
  background: #d1fae5;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 14px;
}

.violation-details {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.violation-detail {
  font-size: 14px;
  color: #6b7280;
  display: flex;
  align-items: center;
  gap: 8px;
}

.violation-detail svg {
  width: 16px;
  height: 16px;
  color: #9ca3af;
  flex-shrink: 0;
}

.violation-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 120px;
  flex-shrink: 0;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-pending {
  background: #fef3c7;
  color: #92400e;
}

.status-paid {
  background: #d1fae5;
  color: #065f46;
}

.quick-actions {
  margin-top: 32px;
}

.quick-actions h3 {
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 20px;
  text-align: center;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.action-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.1);
  border: 1px solid #e2e8f0;
  text-decoration: none;
  transition: all 0.3s ease;
  text-align: center;
}

.action-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(59, 130, 246, 0.15);
}

.action-icon {
  width: 48px;
  height: 48px;
  background: #dbeafe;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  color: #3b82f6;
}

.action-icon svg {
  width: 24px;
  height: 24px;
}

.action-title {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 8px;
}

.action-desc {
  font-size: 14px;
  color: #6b7280;
  line-height: 1.4;
}

.no-data {
  text-align: center;
  padding: 60px 20px;
}

.no-data-icon {
  width: 64px;
  height: 64px;
  background: #d1fae5;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  color: #10b981;
}

.no-data-icon svg {
  width: 32px;
  height: 32px;
}

.no-data h3 {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 8px;
}

.no-data p {
  color: #6b7280;
  margin: 0;
}

.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #e2e8f0;
  border-top: 3px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

/* Modal Styles - Continuation */
.modal {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 700px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-header {
  padding: 24px;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f8fafc;
}

.modal-header h3 {
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.modal-close {
  background: none;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s ease;
}

.modal-close:hover {
  background: #e5e7eb;
  color: #374151;
}

.modal-close svg {
  width: 18px;
  height: 18px;
}

.modal-body {
  padding: 24px;
}

.modal-footer {
  padding: 20px 24px;
  border-top: 1px solid #e2e8f0;
  background: #f8fafc;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.violation-details-modal {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.detail-section {
  border-bottom: 1px solid #f3f4f6;
  padding-bottom: 20px;
}

.detail-section:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.detail-section h4 {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 2px solid #dbeafe;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.detail-item.full-width {
  grid-column: 1 / -1;
}

.detail-item label {
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.detail-item span {
  font-size: 14px;
  color: #1f2937;
  font-weight: 500;
}

.fine-amount {
  font-size: 18px !important;
  font-weight: 700 !important;
  color: #10b981 !important;
}

.payment-notice {
  background: #fef3c7;
  border: 1px solid #f59e0b;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-top: 16px;
}

.notice-icon {
  width: 24px;
  height: 24px;
  color: #f59e0b;
  flex-shrink: 0;
  margin-top: 2px;
}

.notice-icon svg {
  width: 100%;
  height: 100%;
}

.notice-content h4 {
  font-size: 14px;
  font-weight: 600;
  color: #92400e;
  margin: 0 0 4px 0;
  border: none;
  padding: 0;
}

.notice-content p {
  font-size: 13px;
  color: #92400e;
  margin: 0;
  line-height: 1.4;
}

/* Responsive Design */
@media (max-width: 768px) {
  .violator-dashboard {
    padding: 16px;
  }

  .welcome-section {
    flex-direction: column;
    text-align: center;
    gap: 20px;
    padding: 24px;
  }

  .stats-grid {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
  }

  .stat-card {
    padding: 20px;
  }

  .stat-number {
    font-size: 20px;
  }

  .violation-item {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }

  .violation-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .violation-type {
    min-width: auto;
  }

  .violation-actions {
    flex-direction: row;
    min-width: auto;
  }

  .actions-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .modal {
    margin: 10px;
    max-width: calc(100vw - 20px);
  }

  .detail-grid {
    grid-template-columns: 1fr;
  }

  .modal-header {
    padding: 20px;
  }

  .modal-body {
    padding: 20px;
  }

  .modal-footer {
    padding: 16px 20px;
  }
}

@media (max-width: 480px) {
  .welcome-section {
    padding: 20px;
  }

  .welcome-content h2 {
    font-size: 24px;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .stat-card {
    padding: 16px;
    gap: 12px;
  }

  .stat-icon {
    width: 48px;
    height: 48px;
  }

  .stat-icon svg {
    width: 20px;
    height: 20px;
  }

  .card-header {
    padding: 20px;
  }

  .violations-list {
    padding: 20px;
  }

  .violation-item:hover {
    margin: 0 -20px;
    padding: 20px;
  }

  .action-card {
    padding: 20px;
  }

  .action-icon {
    width: 40px;
    height: 40px;
  }
}

/* Animation Enhancements */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.stat-card,
.dashboard-card,
.action-card {
  animation: fadeInUp 0.6s ease forwards;
}

.stat-card:nth-child(1) { animation-delay: 0.1s; }
.stat-card:nth-child(2) { animation-delay: 0.2s; }
.stat-card:nth-child(3) { animation-delay: 0.3s; }
.stat-card:nth-child(4) { animation-delay: 0.4s; }

.modal-overlay {
  animation: fadeIn 0.3s ease;
}

.modal {
  animation: slideUp 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Focus states for accessibility */
.btn:focus,
.modal-close:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* Print styles */
@media print {
  .welcome-actions,
  .violation-actions,
  .quick-actions,
  .modal-overlay {
    display: none !important;
  }

  .violator-dashboard {
    padding: 0;
    background: white;
  }

  .welcome-section {
    background: white !important;
    color: #1f2937 !important;
    border: 1px solid #e2e8f0;
  }

  .stat-card,
  .dashboard-card {
    box-shadow: none !important;
    border: 1px solid #e2e8f0 !important;
    break-inside: avoid;
  }
}
</style>