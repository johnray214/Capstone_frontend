<template>
  <SidebarLayout page-title="Violation History">
    <div class="violator-history">
      <!-- Header Section -->
      <div class="page-header">
        <div class="header-content">
          <h2>Violation History</h2>
          <p>View your traffic violations and payment records. For payments, please visit the POSU office.</p>
        </div>
        <div class="header-stats">
          <div class="stat-item">
            <span class="stat-number">{{ totalViolations }}</span>
            <span class="stat-label">Total</span>
          </div>
          <div class="stat-item">
            <span class="stat-number pending">{{ pendingCount }}</span>
            <span class="stat-label">Unpaid</span>
          </div>
          <div class="stat-item">
            <span class="stat-number paid">{{ paidCount }}</span>
            <span class="stat-label">Paid</span>
          </div>
        </div>
      </div>

      <!-- Filters Section -->
      <div class="filters-section">
        <div class="filters-row">
          <div class="filter-group">
            <label>Status</label>
            <select v-model="filters.status" @change="applyFilters">
              <option value="">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Paid">Paid</option>
            </select>
          </div>
          
          <div class="filter-group">
            <label>Search</label>
            <input 
              type="text" 
              v-model="filters.search" 
              @input="applyFilters"
              placeholder="Search violations..."
              class="search-input"
            >
          </div>
          
          <button @click="clearFilters" class="btn btn-secondary">
            Clear Filters
          </button>
        </div>
      </div>

      <!-- Payment Notice Card -->
      <div class="payment-notice-card" v-if="pendingViolations.length > 0">
        <div class="payment-header">
          <div class="payment-icon">
            <svg class="icon-warning" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
          <div class="payment-title">
            <h3>Outstanding Payments</h3>
            <p>You have unpaid violations that require immediate attention</p>
          </div>
          <div class="payment-amount">
            <span class="amount-label">Total Due</span>
            <span class="amount-value">₱{{ formatCurrency(totalPendingAmount) }}</span>
          </div>
        </div>
        
        <div class="payment-body">
          <div class="violations-summary">
            <div class="summary-item">
              <span class="summary-number">{{ pendingViolations.length }}</span>
              <span class="summary-text">Unpaid Violation{{ pendingViolations.length > 1 ? 's' : '' }}</span>
            </div>
            <div class="summary-divider"></div>
            <div class="summary-item">
              <span class="summary-number">{{ pendingViolations.filter(v => isOverdue(v.date_time)).length }}</span>
              <span class="summary-text">Overdue</span>
            </div>
          </div>
          
          <div class="office-details">
            <div class="office-header">
              <svg class="icon-building" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z"/>
              </svg>
              <span class="office-title">POSU Payment Office</span>
            </div>
            
            <div class="office-info-grid">
              <div class="info-item">
                <svg class="info-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
                <div class="info-content">
                  <span class="info-label">Address</span>
                  <span class="info-value">San Fabian Banchetto</span>
                </div>
              </div>
              
              <div class="info-item">
                <svg class="info-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M16.2,16.2L11,13V7H12.5V12.2L17,14.7L16.2,16.2Z"/>
                </svg>
                <div class="info-content">
                  <span class="info-label">Hours</span>
                  <span class="info-value">Mon-Fri, 8:00 AM - 5:00 PM</span>
                </div>
              </div>
              
              <div class="info-item">
                <svg class="info-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6.62,10.79C8.06,13.62 10.38,15.94 13.21,17.38L15.41,15.18C15.69,14.9 16.08,14.82 16.43,14.93C17.55,15.3 18.75,15.5 20,15.5A1,1 0 0,1 21,16.5V20A1,1 0 0,1 20,21A17,17 0 0,1 3,4A1,1 0 0,1 4,3H7.5A1,1 0 0,1 8.5,4C8.5,5.25 8.7,6.45 9.07,7.57C9.18,7.92 9.1,8.31 8.82,8.59L6.62,10.79Z"/>
                </svg>
                <div class="info-content">
                  <span class="info-label">Contact</span>
                  <span class="info-value">09123456789</span>
                </div>
              </div>
            </div>
            
            <div class="payment-instructions">
              <div class="instruction-header">
                <svg class="instruction-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11,9H13V7H11M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M11,17H13V11H11V17Z"/>
                </svg>
                <span>What to bring</span>
              </div>
              <ul class="instruction-list">
                <li>Valid government-issued ID</li>
                <li>Violation ticket numbers</li>
                <li>Exact payment amount</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- Violations List -->
      <div class="violations-section">
        <div class="section-header">
          <h3>Violations ({{ filteredViolations.length }})</h3>
        </div>

        <div v-if="loading" class="loading">
          <div class="spinner"></div>
          <p>Loading violations...</p>
        </div>

        <div v-else-if="filteredViolations.length === 0" class="no-data">
          <div class="no-data-icon">
            <svg class="icon-document" viewBox="0 0 24 24" fill="currentColor">
              <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
            </svg>
          </div>
          <h3>No violations found</h3>
          <p v-if="hasActiveFilters">Try adjusting your filters to see more results.</p>
          <p v-else>Great! You have no traffic violations on record.</p>
        </div>

        <!-- Violations Table -->
        <div v-else class="violations-table">
          <table>
            <thead>
              <tr>
                <th>Ticket Number</th>
                <th>Date</th>
                <th>Violation</th>
                <th>Location</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="violation in paginatedViolations" :key="violation.id">
                <td class="id-cell">#{{ violation.ticket_number }}</td>
                <td>{{ formatDateTime(violation.date_time) }}</td>
                <td>
                  <div class="violation-cell">
                    <span class="violation-name">{{ violation.violation?.name }}</span>
                    <span class="enforcer-name">by {{ violation.apprehending_officer?.first_name }} {{ violation.apprehending_officer?.middle_name }} {{ violation.apprehending_officer?.last_name }}</span>
                  </div>
                </td>
                <td>{{ violation.location }}</td>
                <td class="amount-cell">₱{{ formatCurrency(violation.fine_amount) }}</td>
                <td>
                  <span class="status-badge" :class="`status-${violation.status?.toLowerCase()}`">
                    {{ violation.status }}
                  </span>
                </td>
                <td>
                  <div class="action-buttons">
                    <button @click="viewViolation(violation)" class="btn btn-secondary btn-xs">
                      View Details
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="pagination">
          <button 
            @click="currentPage = 1" 
            :disabled="currentPage === 1"
            class="btn btn-secondary btn-sm"
          >
            First
          </button>
          <button 
            @click="currentPage--" 
            :disabled="currentPage === 1"
            class="btn btn-secondary btn-sm"
          >
            Previous
          </button>
          
          <span class="page-info">
            Page {{ currentPage }} of {{ totalPages }}
          </span>
          
          <button 
            @click="currentPage++" 
            :disabled="currentPage === totalPages"
            class="btn btn-secondary btn-sm"
          >
            Next
          </button>
          <button 
            @click="currentPage = totalPages" 
            :disabled="currentPage === totalPages"
            class="btn btn-secondary btn-sm"
          >
            Last
          </button>
        </div>
      </div>

      <!-- Violation Details Modal -->
      <div v-if="showViolationModal" class="modal-overlay" @click="closeViolationModal">
        <div class="modal" @click.stop>
          <div class="modal-header">
            <h3>Violation Details</h3>
            <button @click="closeViolationModal" class="modal-close">✕</button>
          </div>
          <div class="modal-body" v-if="selectedViolation">
            <div class="violation-details-modal">
              <div class="detail-section">
                <h4>Violation Information</h4>
                <div class="detail-grid">
                  <div class="detail-item">
                    <label>Ticket Number:</label>
                    <span>#{{ selectedViolation.ticket_number }}</span>
                  </div>
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
                  <span>{{ selectedViolation.location }}</span>
                </div><br>
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
                  <div class="detail-item">
                    <label>Badge Number:</label>
                    <span>{{ selectedViolation.apprehending_officer?.id || 'N/A' }}</span>
                  </div>
                </div>
              </div>
              
              <div v-if="selectedViolation.payment_date" class="detail-section">
                <h4>Payment Information</h4>
                <div class="detail-grid">
                  <div class="detail-item">
                    <label>Payment Date:</label>
                    <span>{{ formatDateTime(selectedViolation.payment_date) }}</span>
                  </div>
                  <div class="detail-item">
                    <label>Payment Method:</label>
                    <span>{{ selectedViolation.payment_method || 'Office Payment' }}</span>
                  </div>
                </div>
              </div>

              <div v-if="selectedViolation.status === 'Pending'" class="payment-instructions">
                <div class="instructions-icon">💡</div>
                <div class="instructions-content">
                  <h4>Payment Instructions</h4>
                  <p>To pay this violation fine:</p>
                  <ol>
                    <li>Visit the POSU office during business hours</li>
                    <li>Bring a valid government-issued ID</li>
                    <li>Reference Violation ID: <strong>#{{ selectedViolation.ticket_number}}</strong></li>
                    <li>Pay the amount of <strong>₱{{ formatCurrency(selectedViolation.fine_amount) }}</strong></li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button @click="closeViolationModal" class="btn btn-secondary">Close</button>
            <button @click="printViolation(selectedViolation)" class="btn btn-primary">
              Print Details
            </button>
          </div>
        </div>
      </div>
    </div>
  </SidebarLayout>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import SidebarLayout from '@/components/SidebarLayout.vue'
import { violatorAPI } from '@/services/api'

export default {
  name: 'ViolatorHistory',
  components: {
    SidebarLayout
  },
  setup() {
    const loading = ref(true)
    const violations = ref([])
    const currentPage = ref(1)
    const itemsPerPage = ref(10)
    const showViolationModal = ref(false)
    const selectedViolation = ref(null)
    
    const filters = ref({
      status: '',
      search: ''
    })
    
    const loadViolations = async () => {
      try {
        loading.value = true
        const response = await violatorAPI.getHistory()
        
        if (response.data.status === 'success') {
          violations.value = response.data.data.data
        }
      } catch (error) {
        console.error('Failed to load violations:', error)
      } finally {
        loading.value = false
      }
    }
    
    const filteredViolations = computed(() => {
      let result = violations.value
      
      if (filters.value.status) {
        result = result.filter(v => v.status === filters.value.status)
      }
      
      if (filters.value.search) {
        const search = filters.value.search.toLowerCase()
        result = result.filter(v => 
          v.violation?.name.toLowerCase().includes(search) ||
          v.location.toLowerCase().includes(search) ||
          `${v.apprehending_officer?.first_name} ${v.apprehending_officer?.middle_name} ${v.apprehending_officer?.last_name}`.toLowerCase().includes(search) ||
          v.id.toString().includes(search)
        )
      }
      
      return result.sort((a, b) => new Date(b.date_time) - new Date(a.date_time))
    })
    
    const paginatedViolations = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage.value
      const end = start + itemsPerPage.value
      return filteredViolations.value.slice(start, end)
    })
    
    const totalPages = computed(() => {
      return Math.ceil(filteredViolations.value.length / itemsPerPage.value)
    })
    
    const totalViolations = computed(() => violations.value.length)
    const pendingCount = computed(() => violations.value.filter(v => v.status === 'Pending').length)
    const paidCount = computed(() => violations.value.filter(v => v.status === 'Paid').length)
    
    const pendingViolations = computed(() => violations.value.filter(v => v.status === 'Pending'))
    const totalPendingAmount = computed(() => 
      pendingViolations.value.reduce((sum, v) => sum + Number(v.fine_amount || 0), 0)
    )

    const hasActiveFilters = computed(() => 
      filters.value.status || filters.value.search
    )
    
    const applyFilters = () => {
      currentPage.value = 1
    }
    
    const clearFilters = () => {
      filters.value = {
        status: '',
        search: ''
      }
      currentPage.value = 1
    }
    
    const viewViolation = (violation) => {
      selectedViolation.value = violation
      showViolationModal.value = true
    }
    
    const closeViolationModal = () => {
      showViolationModal.value = false
      selectedViolation.value = null
    }

    
    const isOverdue = (dateString) => {
      const violationDate = new Date(dateString)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      return violationDate < thirtyDaysAgo
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
      loadViolations()
    })
    
    return {
      loading,
      violations,
      currentPage,
      filters,
      showViolationModal,
      selectedViolation,
      filteredViolations,
      paginatedViolations,
      totalPages,
      totalViolations,
      pendingCount,
      paidCount,
      pendingViolations,
      totalPendingAmount,
      hasActiveFilters,
      applyFilters,
      clearFilters,
      viewViolation,
      closeViolationModal,
      isOverdue,
      formatCurrency,
      formatDateTime
    }
  }
}
</script>

<style scoped>
.violator-history {
  max-width: 1400px;
  margin: 0 auto;
  background: #f8fafc;
  min-height: 100vh;
}

/* Header with blue gradient (only section with blue) */
.page-header {
  background: linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #60a5fa 100%);
  color: white;
  border-radius: 16px;
  padding: 40px;
  margin-bottom: 32px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 10px 30px rgba(30, 64, 175, 0.2);
  position: relative;
  overflow: hidden;
}

.page-header::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -50%;
  width: 200%;
  height: 200%;
  background: url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M0 0h40v40H0V0zm10 10h20v20H10V10z'/%3E%3C/g%3E%3C/svg%3E");
}

.header-content {
  position: relative;
  z-index: 1;
}

.header-content h2 {
  font-size: 32px;
  font-weight: 800;
  margin: 0 0 12px 0;
}

.header-content p {
  font-size: 16px;
  opacity: 0.9;
  margin: 0;
}

.header-stats {
  display: flex;
  gap: 32px;
  position: relative;
  z-index: 1;
}

.stat-item {
  text-align: center;
  background: rgba(255, 255, 255, 0.15);
  padding: 20px 24px;
  border-radius: 12px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.stat-number {
  display: block;
  font-size: 32px;
  font-weight: 800;
  line-height: 1;
}

.stat-number.pending {
  color: #fcd34d;
}

.stat-number.paid {
  color: #6ee7b7;
}

.stat-label {
  display: block;
  font-size: 14px;
  opacity: 0.8;
  margin-top: 8px;
  font-weight: 500;
}

/* Other sections with neutral colors */
.filters-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  border: 1px solid #f1f5f9;
}

.filters-row {
  display: flex;
  gap: 20px;
  align-items: end;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 150px;
}

.filter-group label {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
}

.filter-group select,
.search-input {
  padding: 10px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.2s ease;
  background: white;
}

.filter-group select:focus,
.search-input:focus {
  outline: none;
  border-color: #6b7280;
  box-shadow: 0 0 0 3px rgba(107, 114, 128, 0.1);
}

/* Payment card with orange/amber theme */
.payment-notice-card {
  background: white;
  border-radius: 16px;
  margin-bottom: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid #f59e0b;
  overflow: hidden;
}

.payment-header {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 20px;
}

.payment-icon {
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.icon-warning {
  width: 24px;
  height: 24px;
  color: white;
}

.payment-title {
  flex: 1;
}

.payment-title h3 {
  font-size: 20px;
  font-weight: 700;
  margin: 0 0 4px 0;
}

.payment-title p {
  font-size: 14px;
  opacity: 0.9;
  margin: 0;
}

.payment-amount {
  text-align: right;
}

.amount-label {
  display: block;
  font-size: 12px;
  opacity: 0.8;
  margin-bottom: 4px;
}

.amount-value {
  display: block;
  font-size: 28px;
  font-weight: 800;
}

/* Continuing from .payment-body */
.payment-body {
  padding: 24px;
  background: #fefefe;
}

.violations-summary {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 16px 20px;
  background: #fff7ed;
  border-radius: 10px;
  margin-bottom: 24px;
  border: 1px solid #fed7aa;
}

.summary-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.summary-number {
  font-size: 20px;
  font-weight: 800;
  color: #ea580c;
}

.summary-text {
  font-size: 12px;
  color: #9a3412;
  font-weight: 500;
}

.summary-divider {
  width: 1px;
  height: 40px;
  background: #fed7aa;
}

.office-details {
  background: #f8fafc;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #e2e8f0;
}

.office-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e2e8f0;
}

.icon-building {
  width: 20px;
  height: 20px;
  color: #64748b;
}

.office-title {
  font-size: 16px;
  font-weight: 700;
  color: #1e293b;
}

.office-info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: white;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.info-icon {
  width: 16px;
  height: 16px;
  color: #64748b;
  flex-shrink: 0;
}

.info-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.info-label {
  font-size: 12px;
  color: #64748b;
  font-weight: 500;
}

.info-value {
  font-size: 14px;
  color: #1e293b;
  font-weight: 600;
}

.payment-instructions {
  background: white;
  border-radius: 8px;
  padding: 16px;
  border: 1px solid #e2e8f0;
}

.instruction-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  color: #374151;
  font-size: 14px;
  font-weight: 600;
}

.instruction-icon {
  width: 16px;
  height: 16px;
  color: #6b7280;
}

.instruction-list {
  margin: 0;
  padding-left: 20px;
  color: #4b5563;
  font-size: 13px;
}

.instruction-list li {
  margin-bottom: 4px;
}

/* Violations Section */
.violations-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  border: 1px solid #f1f5f9;
}

.section-header {
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e5e7eb;
}

.section-header h3 {
  font-size: 18px;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

/* Loading and No Data States */
.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f4f6;
  border-top: 3px solid #6b7280;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.no-data {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  color: #6b7280;
}

.no-data-icon {
  width: 64px;
  height: 64px;
  background: #f3f4f6;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}

.icon-document {
  width: 32px;
  height: 32px;
  color: #9ca3af;
}

.no-data h3 {
  font-size: 18px;
  font-weight: 600;
  color: #374151;
  margin: 0 0 8px 0;
}

.no-data p {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
}

/* Violations Table */
.violations-table {
  overflow-x: auto;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.violations-table table {
  width: 100%;
  border-collapse: collapse;
  background: white;
}

.violations-table th {
  background: #f9fafb;
  padding: 16px 12px;
  text-align: left;
  font-size: 12px;
  font-weight: 700;
  color: #374151;
  text-transform: uppercase;
  letter-spacing: 0.025em;
  border-bottom: 1px solid #e5e7eb;
}

.violations-table td {
  padding: 16px 12px;
  border-bottom: 1px solid #f3f4f6;
  font-size: 14px;
  color: #374151;
  vertical-align: top;
}

.violations-table tr:last-child td {
  border-bottom: none;
}

.violations-table tr:hover {
  background: #f9fafb;
}

.id-cell {
  font-family: 'Courier New', monospace;
  font-weight: 600;
  color: #6b7280;
}

.violation-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.violation-name {
  font-weight: 600;
  color: #1f2937;
}

.enforcer-name {
  font-size: 12px;
  color: #6b7280;
  font-style: italic;
}

.amount-cell {
  font-weight: 600;
  color: #059669;
  text-align: right;
}

/* Status Badges */
.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.status-pending {
  background: #fef3c7;
  color: #d97706;
  border: 1px solid #f59e0b;
}

.status-paid {
  background: #d1fae5;
  color: #047857;
  border: 1px solid #10b981;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  gap: 8px;
}

/* Pagination */
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 20px 0;
  margin-top: 24px;
  border-top: 1px solid #e5e7eb;
}

.page-info {
  font-size: 14px;
  color: #6b7280;
  margin: 0 16px;
}

/* Button Styles */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  white-space: nowrap;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #2563eb;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.btn-secondary {
  background: #f8fafc;
  color: #374151;
  border: 1px solid #d1d5db;
}

.btn-secondary:hover:not(:disabled) {
  background: #f1f5f9;
  border-color: #9ca3af;
  transform: translateY(-1px);
}

.btn-xs {
  padding: 6px 12px;
  font-size: 12px;
}

.btn-sm {
  padding: 8px 12px;
  font-size: 13px;
}

.btn-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
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
  backdrop-filter: blur(4px);
}

.modal {
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 700px;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  transform: scale(0.95);
  animation: modal-appear 0.2s ease-out forwards;
}

@keyframes modal-appear {
  to {
    transform: scale(1);
  }
}

.modal-header {
  display: flex;
  justify-content: between;
  align-items: center;
  padding: 24px 24px 16px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h3 {
  font-size: 20px;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
  flex: 1;
}

.modal-close {
  background: #f3f4f6;
  border: none;
  border-radius: 8px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #6b7280;
  font-size: 18px;
  transition: all 0.2s ease;
}

.modal-close:hover {
  background: #e5e7eb;
  color: #374151;
}

.modal-body {
  padding: 24px;
  max-height: 60vh;
  overflow-y: auto;
}

.modal-footer {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding: 16px 24px 24px;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
}

/* Violation Details Modal */
.violation-details-modal {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.detail-section {
  background: #f8fafc;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #e2e8f0;
}

.detail-section h4 {
  font-size: 16px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 16px 0;
  padding-bottom: 8px;
  border-bottom: 1px solid #e2e8f0;
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
  color: #6b7280;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.detail-item span {
  font-size: 14px;
  color: #1f2937;
  font-weight: 500;
}

.fine-amount {
  font-size: 18px !important;
  font-weight: 700 !important;
  color: #059669 !important;
}

/* Payment Instructions in Modal */
.payment-instructions {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #f59e0b;
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.instructions-icon {
  font-size: 24px;
  flex-shrink: 0;
}

.instructions-content h4 {
  font-size: 16px;
  font-weight: 700;
  color: #92400e;
  margin: 0 0 8px 0;
}

.instructions-content p {
  font-size: 14px;
  color: #92400e;
  margin: 0 0 12px 0;
}

.instructions-content ol {
  margin: 0;
  padding-left: 20px;
  color: #78350f;
}

.instructions-content li {
  font-size: 13px;
  margin-bottom: 4px;
}

.instructions-content strong {
  font-weight: 700;
  color: #451a03;
}

/* Responsive Design */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 24px;
    text-align: center;
    padding: 24px;
  }

  .header-stats {
    gap: 16px;
  }

  .stat-item {
    padding: 16px 20px;
  }

  .filters-row {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-group {
    min-width: auto;
  }

  .office-info-grid {
    grid-template-columns: 1fr;
  }

  .violations-table {
    font-size: 12px;
  }

  .violations-table th,
  .violations-table td {
    padding: 12px 8px;
  }

  .pagination {
    flex-wrap: wrap;
    gap: 8px;
  }

  .modal {
    margin: 10px;
    max-height: 95vh;
  }

  .detail-grid {
    grid-template-columns: 1fr;
  }

  .payment-instructions {
    flex-direction: column;
    gap: 12px;
  }
}

@media (max-width: 480px) {
  .violator-history {
    padding: 0 16px;
  }

  .page-header {
    border-radius: 12px;
    padding: 20px;
  }

  .header-content h2 {
    font-size: 24px;
  }

  .header-stats {
    flex-direction: column;
    gap: 12px;
    width: 100%;
  }

  .stat-item {
    padding: 12px 16px;
  }

  .violations-section,
  .filters-section{
    padding: 16px;
  }
}
</style>