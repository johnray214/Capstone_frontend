<template>
  <SidebarLayout page-title="Notifications">
    <div class="admin-notifications">
      <!-- Header Section -->
      <div class="page-header">
        <div class="header-content">
          <h2>Notifications Dashboard</h2>
          <p>Manage and monitor all system notifications - sent and received</p>
        </div>
        <div class="header-actions">
          <router-link to="/admin/notifications/send" class="btn btn-primary">
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 3h18l-9 15L3 3z"/>
            </svg>
            Send Notification
          </router-link>
        </div>
      </div>

      <!-- Notification Stats -->
      <div class="notification-stats">
        <div class="stat-card">
          <div class="stat-icon sent">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 3h18l-9 15L3 3z"/>
            </svg>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ stats.sent }}</div>
            <div class="stat-label">Sent by You</div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon received">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ stats.received }}</div>
            <div class="stat-label">Received</div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon total">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ stats.total }}</div>
            <div class="stat-label">Total System</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon unread">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="16" x2="12" y2="12"/>
              <line x1="12" y1="8" x2="12.01" y2="8"/>
            </svg>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ stats.unread }}</div>
            <div class="stat-label">Unread</div>
          </div>
        </div>
      </div>

      <!-- View Toggle -->
      <div class="view-toggle-section">
        <div class="view-toggle">
          <button 
            @click="activeView = 'all'" 
            :class="['toggle-btn', { active: activeView === 'all' }]"
          >
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
            All Notifications ({{ allCountFiltered }})
          </button>
          <button 
            @click="activeView = 'sent'" 
            :class="['toggle-btn', { active: activeView === 'sent' }]"
          >
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 3h18l-9 15L3 3z"/>
            </svg>
            Sent by Me ({{ sentCountFiltered }})
          </button>
          <button 
            @click="activeView = 'received'" 
            :class="['toggle-btn', { active: activeView === 'received' }]"
          >
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="16" x2="12" y2="12"/>
              <line x1="12" y1="8" x2="12.01" y2="8"/>
            </svg>
            Received ({{ receivedCountFiltered }})
          </button>
        </div>
      </div>

      <!-- Filters Section -->
      <div class="filters-section">
        <div class="filters-row">
          <div class="filter-group">
            <label>Filter by Type</label>
            <select v-model="filters.type" @change="applyFilters">
              <option value="">All Types</option>
              <option value="info">Information</option>
              <option value="alert">Alert</option>
              <option value="warning">Warning</option>
              <option value="reminder">Reminder</option>
              <option value="system">System</option>
            </select>
          </div>
          
          <div class="filter-group">
            <label>Target Type</label>
            <select v-model="filters.targetType" @change="applyFilters">
              <option value="">All Targets</option>
              <option value="Violator">Violators</option>
              <option value="Enforcer">Enforcers</option>
              <option value="Management">Management</option>
            </select>
          </div>
          
          <div class="filter-group" v-if="activeView !== 'sent'">
            <label>Status</label>
            <select v-model="filters.status" @change="applyFilters">
              <option value="">All Status</option>
              <option value="read">Read</option>
              <option value="unread">Unread</option>
            </select>
          </div>
          
          <div class="filter-group">
            <label>Search</label>
            <div class="search-container">
              <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"/>
                <path d="M21 21l-4.35-4.35"/>
              </svg>
              <input 
                type="text" 
                v-model="filters.search" 
                @input="applyFilters"
                placeholder="Search notifications..."
                class="search-input"
              >
            </div>
          </div>
          
          <button @click="clearFilters" class="btn btn-secondary">
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3,6 5,6 21,6"/>
              <path d="M19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"/>
            </svg>
            Clear Filters
          </button>
        </div>
      </div>

      <!-- Notifications List -->
      <div class="notifications-section">
        <div class="section-header">
          <h3>{{ getSectionTitle() }}</h3>
          <button @click="loadNotifications" class="btn btn-ghost" :disabled="loading">
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="23,4 23,10 17,10"/>
              <path d="M20.49,15a9,9,0,1,1-2.12-9.36L23,10"/>
            </svg>
            Refresh
          </button>
        </div>

        <div v-if="loading" class="loading">
          <div class="spinner"></div>
          <p>Loading notifications...</p>
        </div>

        <div v-else-if="getCurrentNotifications().length === 0" class="no-data">
          <div class="no-data-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
          </div>
          <h3>No notifications found</h3>
          <p v-if="hasActiveFilters">Try adjusting your filters to see more results.</p>
          <p v-else-if="activeView === 'sent'">You haven't sent any notifications yet.</p>
          <p v-else-if="activeView === 'received'">You have no received notifications.</p>
          <p v-else>No notifications in the system.</p>
          <router-link v-if="activeView === 'sent'" to="/admin/notifications/send" class="btn btn-primary">
            Send First Notification
          </router-link>
        </div>

        <div v-else class="notifications-list">
          <div 
            v-for="notification in paginatedNotifications" 
            :key="notification.id" 
            class="notification-item"
            :class="{ 
              'unread': !notification.read_at && activeView !== 'sent',
              [`type-${notification.type}`]: true,
              'sent-item': isSentByCurrentUser(notification)
            }"
            @click="handleNotificationClick(notification)"
          >
            <div class="notification-icon">
              <svg v-if="notification.type === 'info'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="16" x2="12" y2="12"/>
                <line x1="12" y1="8" x2="12.01" y2="8"/>
              </svg>
              <svg v-else-if="notification.type === 'alert'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
              <svg v-else-if="notification.type === 'warning'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
              <svg v-else-if="notification.type === 'system'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
              <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12,6 12,12 16,14"/>
              </svg>
            </div>
            
            <div class="notification-content">
              <div class="notification-header">
                <h4 class="notification-title">{{ notification.title }}</h4>
                <div class="notification-meta">
                  <div class="meta-badges">
                    <span 
                      class="notification-type" 
                      :class="getTypeClass(notification)"
                    >
                      {{ getTypeLabel(notification) }}
                    </span>
                    <span v-if="isSentByCurrentUser(notification)" class="sent-badge">
                      SENT BY YOU
                    </span>
                  </div>
                  <span class="notification-date">
                    {{ formatDateTime(notification.created_at) }}
                  </span>
                </div>
              </div>
              
              <div class="notification-message">
                {{ notification.message }}
              </div>

              <div class="notification-details">
                <div class="detail-row">
                  <div class="detail-item">
                    <span class="detail-label">From:</span>
                    <span class="detail-value">{{ getSenderInfo(notification) }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">To:</span>
                    <span class="detail-value">{{ getTargetInfo(notification) }}</span>
                  </div>
                </div>
                <div v-if="notification.violator_id || notification.transaction_id" class="detail-row">
                  <div v-if="notification.violator_id" class="detail-item">
                    <span class="detail-label">Violator ID:</span>
                    <span class="detail-value">#{{ notification.violator_id }}</span>
                  </div>
                  <div v-if="notification.transaction_id" class="detail-item">
                    <span class="detail-label">Transaction ID:</span>
                    <span class="detail-value">#{{ notification.transaction_id }}</span>
                  </div>
                </div>
              </div>
              
              <div v-if="showActions(notification)" class="notification-actions">
                <button 
                  v-if="notification.violator_id" 
                  @click.stop="viewViolator(notification.violator_id)" 
                  class="btn btn-primary btn-sm"
                >
                  <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                  View Violator
                </button>
                <button 
                  v-if="notification.transaction_id" 
                  @click.stop="viewTransaction(notification.transaction_id)" 
                  class="btn btn-secondary btn-sm"
                >
                  <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14,2 14,8 20,8"/>
                  </svg>
                  View Transaction
                </button>
              </div>
            </div>
            
            <div class="notification-status">
              <div v-if="!notification.read_at && activeView !== 'sent'" class="unread-indicator"></div>
              <div class="status-actions">
                <button 
                  v-if="activeView !== 'sent' && !isSentByCurrentUser(notification)"
                  @click.stop="toggleRead(notification)" 
                  class="btn btn-ghost btn-xs"
                  :title="notification.read_at ? 'Mark as unread' : 'Mark as read'"
                >
                  <svg v-if="notification.read_at" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                  <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v10l-4-4H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                </button>
                <div class="more-actions">
                  <button class="btn btn-ghost btn-xs" @click.stop="showNotificationMenu(notification)">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="12" cy="12" r="1"/>
                      <circle cx="19" cy="12" r="1"/>
                      <circle cx="5" cy="12" r="1"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="pagination">
          <button 
            @click="currentPage = 1" 
            :disabled="currentPage === 1"
            class="btn btn-secondary btn-sm"
          >
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="11,17 6,12 11,7"/>
              <polyline points="18,17 13,12 18,7"/>
            </svg>
            First
          </button>
          <button 
            @click="currentPage--" 
            :disabled="currentPage === 1"
            class="btn btn-secondary btn-sm"
          >
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="15,18 9,12 15,6"/>
            </svg>
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
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9,18 15,12 9,6"/>
            </svg>
            Next
          </button>
          <button 
            @click="currentPage = totalPages" 
            :disabled="currentPage === totalPages"
            class="btn btn-secondary btn-sm"
          >
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="13,17 18,12 13,7"/>
              <polyline points="6,17 11,12 6,7"/>
            </svg>
            Last
          </button>
        </div>
      </div>
    </div>
  </SidebarLayout>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import SidebarLayout from '@/components/SidebarLayout.vue'
import { adminAPI } from '@/services/api'
import { useAuthStore } from '@/stores/auth'

export default {
  name: 'AdminNotifications',
  components: {
    SidebarLayout
  },
  setup() {
    const authStore = useAuthStore()
    const currentUser = computed(() => authStore.state.user)
    const loading = ref(true)
    const notifications = ref([])
    const currentPage = ref(1)
    const itemsPerPage = ref(10)
    const activeView = ref('all')
    const error = ref(null)
    
    const filters = ref({
      type: '',
      targetType: '',
      status: '',
      search: ''
    })
    
    // Function to update notification statistics
    const updateStats = () => {
      if (!currentUser.value) return { sent: 0, received: 0, total: 0, unread: 0 }
      
      // Get all unique notifications
      const all = [...new Set([
        ...notifications.value
      ])]
      
      // Count sent notifications
      const sentCount = notifications.value.filter(n => {
        if (!n) return false
        return (
          n.sender_id && n.sender_id.toString() === currentUser.value.id.toString() &&
          n.sender_role && n.sender_role.toLowerCase() === currentUser.value.role.toLowerCase()
        )
      }).length
      
      // Count received notifications (excluding those sent by current user)
      const receivedCount = notifications.value.filter(n => {
        if (!n) return false
        
        // Exclude notifications sent by current user
        const isSentByCurrentUser = (n.sender_id && n.sender_id.toString() === currentUser.value.id.toString()) ||
                                  (n.sender_role && n.sender_role.toLowerCase() === currentUser.value.role.toLowerCase()) ||
                                  (n.sent_by && n.sent_by.toString() === currentUser.value.id.toString())
        if (isSentByCurrentUser) return false
        
        // Check if notification is for this user
        const isForThisUser = n.target_id && n.target_id.toString() === currentUser.value.id.toString() && 
                            n.target_type && n.target_type.toLowerCase() === currentUser.value.role.toLowerCase()
        
        // Check if notification is for all management
        const isForAllManagement = n.target_type === 'Management' && (n.target_id === null || n.target_id === '')
        
        // Check if notification is for all admins
        const isForAllAdmins = (n.target_type === 'Admin' || n.target_type === 'Deputy' || n.target_type === 'Head') && 
                             (n.target_id === null || n.target_id === '')
        
        return isForThisUser || isForAllManagement || isForAllAdmins
      }).length
      
      // Count unread notifications (excluding those sent by current user)
      const unreadCount = notifications.value.filter(n => {
        if (!n || n.read_at) return false
        
        // Only count unread notifications that are received by the user
        const isForThisUser = n.target_id && n.target_id.toString() === currentUser.value.id.toString() && 
                            n.target_type && n.target_type.toLowerCase() === currentUser.value.role.toLowerCase()
        
        const isForAllManagement = n.target_type === 'Management' && (n.target_id === null || n.target_id === '')
        const isForAllAdmins = (n.target_type === 'Admin' || n.target_type === 'Deputy' || n.target_type === 'Head') && 
                             (n.target_id === null || n.target_id === '')
        
        const sentByCurrent = (
          n.sender_id && n.sender_id.toString() === currentUser.value.id.toString() &&
          n.sender_role && n.sender_role.toLowerCase() === currentUser.value.role.toLowerCase()
        )
        return (isForThisUser || isForAllManagement || isForAllAdmins) && !sentByCurrent
      }).length
      
      const stats = {
        sent: sentCount,
        received: receivedCount,
        total: all.length,
        unread: unreadCount
      }
      
      console.log('Updated stats:', stats)
      return stats
    }

    const loadNotifications = async () => {
      try {
        loading.value = true
        error.value = null
        console.log('Fetching all notifications...')
        
        // Always fetch all notifications regardless of the current view
        const [receivedRes, sentRes, mgmtRes] = await Promise.all([
          adminAPI.getNotifications(),
          adminAPI.getSentNotifications(),
          adminAPI.getAllNotifications()
        ])
        
        const received = Array.isArray(receivedRes.data?.data) ? receivedRes.data.data : []
        const sent = Array.isArray(sentRes.data?.data) ? sentRes.data.data : []
        const mgmt = Array.isArray(mgmtRes.data?.data) ? mgmtRes.data.data : []
        
        // De-duplicate by id and combine all notifications
        const map = new Map()
        ;[...received, ...sent, ...mgmt].forEach(n => { 
          if (n && n.id != null) map.set(n.id, n) 
        })
        
        const allNotifications = Array.from(map.values())
        console.log('All notifications loaded:', allNotifications)
        
        notifications.value = allNotifications
        console.log('Notifications set to state:', notifications.value)
        
        // Update stats after loading
        updateStats()
        
      } catch (err) {
        console.error('Failed to load notifications:', err)
        error.value = `Failed to load notifications: ${err.message || 'Unknown error'}`
        notifications.value = []
      } finally {
        loading.value = false
      }
      
      // Log the current state after loading
      console.log('After loadNotifications:', {
        notifications: notifications.value,
        loading: loading.value,
        error: error.value
      })
    }

    // Computed properties for different views
    const sentNotifications = computed(() => filterByView('sent'))

    const receivedNotifications = computed(() => filterByView('received'))

    const filterByView = (view) => {
      let result = []
      switch (view) {
        case 'sent':
          result = notifications.value.filter(n => {
            if (!n || !currentUser.value) return false
            const isSenderMatch = n.sender_id && n.sender_id.toString() === currentUser.value.id.toString()
            const isRoleMatch = n.sender_role && n.sender_role.toLowerCase() === currentUser.value.role.toLowerCase()
            return isSenderMatch && isRoleMatch
          })
          break
        case 'received':
          result = notifications.value.filter(n => {
            if (!n || !currentUser.value) return false
            const isSentByCurrentUser = (
              n.sender_id && n.sender_id.toString() === currentUser.value.id.toString() &&
              n.sender_role && n.sender_role.toLowerCase() === currentUser.value.role.toLowerCase()
            )
            if (isSentByCurrentUser) return false
            const isForThisUser = n.target_id && n.target_id.toString() === currentUser.value.id.toString() &&
                                  n.target_type && n.target_type.toLowerCase() === currentUser.value.role.toLowerCase()
            const isForAllManagement = n.target_type === 'Management' && (n.target_id === null || n.target_id === '')
            const isForAllAdmins = (n.target_type === 'Admin' || n.target_type === 'Deputy' || n.target_type === 'Head') &&
                                   (n.target_id === null || n.target_id === '')
            return isForThisUser || isForAllManagement || isForAllAdmins
          })
          break
        default:
          // All notifications visible to user, excluding those sent by current user
          result = (Array.isArray(notifications.value) ? [...notifications.value] : []).filter(n => {
            if (!n || !currentUser.value) return false
            const sentByMe = n.sender_id && n.sender_id.toString() === currentUser.value.id.toString() &&
                             n.sender_role && n.sender_role.toLowerCase() === currentUser.value.role.toLowerCase()
            return !sentByMe
          })
      }

      // Apply filters
      if (filters.value.type) {
        result = result.filter(n => n.type === filters.value.type)
      }
      if (filters.value.targetType) {
        result = result.filter(n => n.target_type === filters.value.targetType)
      }
      if (filters.value.status && view !== 'sent') {
        if (filters.value.status === 'unread') {
          result = result.filter(n => !n.read_at)
        } else if (filters.value.status === 'read') {
          result = result.filter(n => n.read_at)
        }
      }
      if (filters.value.search) {
        const search = filters.value.search.toLowerCase()
        result = result.filter(n =>
          (n.title && n.title.toLowerCase().includes(search)) ||
          (n.message && n.message.toLowerCase().includes(search))
        )
      }
      return [...result].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    }

    const filteredNotifications = computed(() => filterByView(activeView.value))

    const getCurrentNotifications = () => {
      return filteredNotifications.value
    }

    const paginatedNotifications = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage.value
      const end = start + itemsPerPage.value
      return getCurrentNotifications().slice(start, end)
    })
    
    const totalPages = computed(() => {
      return Math.ceil(getCurrentNotifications().length / itemsPerPage.value)
    })

    const sentCountFiltered = computed(() => filterByView('sent').length)
    const receivedCountFiltered = computed(() => filterByView('received').length)
    const allCountFiltered = computed(() => filterByView('all').length)
    const unreadCountFiltered = computed(() => filterByView('received').filter(n => !n.read_at).length)

    const stats = computed(() => ({
      sent: sentCountFiltered.value,
      received: receivedCountFiltered.value,
      total: allCountFiltered.value,
      unread: unreadCountFiltered.value
    }))
    
    const hasActiveFilters = computed(() => 
      filters.value.type || filters.value.targetType || filters.value.status || filters.value.search
    )

    const getSectionTitle = () => {
      switch (activeView.value) {
        case 'sent':
          return `Notifications Sent by You (${getCurrentNotifications().length})`
        case 'received':
          return `Notifications Received (${getCurrentNotifications().length})`
        default:
          return `All System Notifications (${getCurrentNotifications().length})`
      }
    }
    
    const applyFilters = () => {
      currentPage.value = 1
    }
    
    const clearFilters = () => {
      filters.value = {
        type: '',
        targetType: '',
        status: '',
        search: ''
      }
      currentPage.value = 1
    }

    const isSentByCurrentUser = (notification) => {
      if (!currentUser?.value || !notification) return false
      
      const isSenderMatch = notification.sender_id && 
             notification.sender_id.toString() === currentUser.value.id.toString()
      const isRoleMatch = notification.sender_role &&
             notification.sender_role.toLowerCase() === currentUser.value.role.toLowerCase()
      
      return isSenderMatch && isRoleMatch
    }

    const getSenderInfo = (notification) => {
      if (notification.sender_name) {
        return notification.sender_name
      }
      if (notification.sender_role && notification.sender_id) {
        return `${notification.sender_role} #${notification.sender_id}`
      }
      return 'System'
    }

    const getTargetInfo = (notification) => {
      if (notification.target_type === 'Management') {
        return 'Management Team'
      }
      if (notification.target_type && notification.target_id) {
        return `${notification.target_type} #${notification.target_id}`
      }
      return notification.target_type || 'Management'
    }

    const getTypeClass = (notification) => {
      if (notification.read_at && activeView.value !== 'sent') {
        return 'read'
      }
      return `type-${notification.type}`
    }

    const getTypeLabel = (notification) => {
      if (notification.read_at && activeView.value !== 'sent') {
        return 'READ'
      }
      // Default to 'info' if type is not specified
      const type = notification?.type || 'info'
      return type.toString().toUpperCase()
    }

    const showActions = (notification) => {
      return notification.violator_id || notification.transaction_id
    }
    
    const handleNotificationClick = (notification) => {
      if (activeView.value !== 'sent' && !isSentByCurrentUser(notification) && !notification.read_at) {
        markAsRead(notification)
      }
    }

    const markAsRead = async (notification) => {
      if (!notification || notification.read_at || isSentByCurrentUser(notification)) return
      
      try {
        await adminAPI.markNotificationAsRead(notification.id)
        notification.read_at = new Date().toISOString()
      } catch (err) {
        console.error('Failed to mark notification as read:', err)
      }
    }
    
    const toggleRead = async (notification) => {
      if (!notification || isSentByCurrentUser(notification)) return
      
      try {
        if (notification.read_at) {
          await adminAPI.markNotificationAsUnread(notification.id)
          notification.read_at = null
        } else {
          await adminAPI.markNotificationAsRead(notification.id)
          notification.read_at = new Date().toISOString()
        }
      } catch (err) {
        console.error('Failed to toggle notification status:', err)
      }
    }

    const viewViolator = () => {
      // Navigate to violator details
      window.location.href = `/admin/violators`
    }

    const viewTransaction = () => {
      // Navigate to transaction details
      window.location.href = `/admin/transactions`
    }

    const showNotificationMenu = (notification) => {
      // Show context menu for additional actions
      console.log('Show menu for notification:', notification.id)
    }
    
    const formatDateTime = (dateString) => {
      if (!dateString) return ''
      
      const date = new Date(dateString)
      const now = new Date()
      const diffInHours = (now - date) / (1000 * 60 * 60)
      
      if (diffInHours < 1) {
        const minutes = Math.floor((now - date) / (1000 * 60))
        return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`
      } else if (diffInHours < 24) {
        const hours = Math.floor(diffInHours)
        return `${hours} hour${hours !== 1 ? 's' : ''} ago`
      } else if (diffInHours < 168) { // 7 days
        const days = Math.floor(diffInHours / 24)
        return `${days} day${days !== 1 ? 's' : ''} ago`
      } else {
        return date.toLocaleDateString('en-PH', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      }
    }
    
    onMounted(() => {
      // Initialize auth store to get current user
      authStore.initAuth()
      // Load notifications only once when component mounts
      loadNotifications()
    })
    
    return {
      loading,
      notifications,
      currentPage,
      activeView,
      filters,
      error,
      stats,
      sentNotifications,
      receivedNotifications,
      filteredNotifications,
      getCurrentNotifications,
      paginatedNotifications,
      totalPages,
      hasActiveFilters,
      getSectionTitle,
      applyFilters,
      clearFilters,
      isSentByCurrentUser,
      getSenderInfo,
      getTargetInfo,
      getTypeClass,
      getTypeLabel,
      showActions,
      handleNotificationClick,
      markAsRead,
      toggleRead,
      viewViolator,
      viewTransaction,
      showNotificationMenu,
      formatDateTime,
      loadNotifications,
      // expose counts for toggle labels
      sentCountFiltered,
      receivedCountFiltered,
      allCountFiltered
    }
  }
}
</script>

<style scoped>
.admin-notifications {
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  background: linear-gradient(135deg, #1e3a8a, #3b82f6);
  color: white;
  border-radius: 16px;
  padding: 32px;
  margin-bottom: 32px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 10px 25px -3px rgba(0, 0, 0, 0.1);
}

.header-content h2 {
  font-size: 32px;
  font-weight: 700;
  margin: 0 0 8px 0;
}

.header-content p {
  font-size: 16px;
  opacity: 0.9;
  margin: 0;
}

.header-actions .btn {
  background: rgba(255, 255, 255, 0.15);
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
}

.header-actions .btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.25);
  border-color: rgba(255, 255, 255, 0.4);
  transform: translateY(-1px);
}

.notification-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.stat-card {
  background: white;
  border-radius: 16px;
  padding: 28px;
  box-shadow: 0 4px 20px -1px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 20px;
  transition: all 0.3s ease;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 30px -3px rgba(0, 0, 0, 0.15);
}

.stat-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  color: white;
}

.stat-icon svg {
  width: 24px;
  height: 24px;
}

.stat-icon.sent {
  background: linear-gradient(135deg, #10b981, #059669);
}

.stat-icon.received {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
}

.stat-icon.total {
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
}

.stat-icon.unread {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  animation: pulse 2s infinite;
}

.stat-number {
  font-size: 28px;
  font-weight: 800;
  color: #1f2937;
  line-height: 1;
}

.stat-label {
  font-size: 14px;
  color: #6b7280;
  margin-top: 4px;
  font-weight: 500;
}

.view-toggle-section {
  margin-bottom: 24px;
}

.view-toggle {
  background: white;
  border-radius: 16px;
  padding: 8px;
  box-shadow: 0 4px 20px -1px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(0, 0, 0, 0.05);
  display: flex;
  gap: 4px;
}

.toggle-btn {
  flex: 1;
  padding: 16px 20px;
  border: none;
  background: transparent;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.toggle-btn:hover {
  background: #f8fafc;
  color: #374151;
}

.toggle-btn.active {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
}

.toggle-btn svg {
  width: 16px;
  height: 16px;
}

.filters-section {
  background: white;
  border-radius: 16px;
  padding: 28px;
  margin-bottom: 24px;
  box-shadow: 0 4px 20px -1px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.filters-row {
  display: flex;
  gap: 24px;
  align-items: end;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 180px;
}

.filter-group label {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
}

.filter-group select {
  padding: 12px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  font-size: 14px;
  transition: all 0.2s ease;
  background: white;
}

.filter-group select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.search-container {
  position: relative;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  color: #9ca3af;
  pointer-events: none;
}

.search-input {
  padding: 12px 16px 12px 40px;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  font-size: 14px;
  transition: all 0.2s ease;
  background: white;
  width: 100%;
}

.search-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.notifications-section {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px -1px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  margin-bottom: 32px;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.section-header {
  padding: 28px;
  border-bottom: 2px solid #f3f4f6;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-header h3 {
  font-size: 20px;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.notifications-list {
  max-height: 800px;
  overflow-y: auto;
}

.notification-item {
  display: flex;
  align-items: flex-start;
  gap: 20px;
  padding: 24px 28px;
  border-bottom: 1px solid #f3f4f6;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.notification-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: transparent;
  transition: all 0.2s ease;
}

.notification-item:hover {
  background: #fafbfc;
}

.notification-item:last-child {
  border-bottom: none;
}

.notification-item.unread {
  background: linear-gradient(to right, #f0f9ff, #ffffff);
}

.notification-item.unread::before {
  background: #3b82f6;
}

.notification-item.sent-item {
  background: linear-gradient(to right, #f0fdf4, #ffffff);
}

.notification-item.sent-item::before {
  background: #10b981;
}

.notification-item.type-alert::before {
  background: #ef4444;
}

.notification-item.type-warning::before {
  background: #f59e0b;
}

.notification-item.type-system::before {
  background: #8b5cf6;
}

.notification-item.type-info::before {
  background: #10b981;
}

.notification-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  flex-shrink: 0;
  margin-top: 2px;
}

.notification-icon svg {
  width: 20px;
  height: 20px;
}

.notification-item.type-info .notification-icon {
  background: #ecfdf5;
  color: #059669;
}

.notification-item.type-alert .notification-icon {
  background: #fef2f2;
  color: #dc2626;
}

.notification-item.type-warning .notification-icon {
  background: #fffbeb;
  color: #d97706;
}

.notification-item.type-system .notification-icon {
  background: #faf5ff;
  color: #7c3aed;
}

.notification-item.sent-item .notification-icon {
  background: #ecfdf5;
  color: #059669;
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 12px;
}

.notification-title {
  font-size: 17px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
  line-height: 1.4;
}

.notification-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
  flex-shrink: 0;
}

.meta-badges {
  display: flex;
  gap: 8px;
  align-items: center;
}

.notification-type {
  font-size: 10px;
  font-weight: 700;
  padding: 4px 8px;
  border-radius: 6px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.notification-type.read {
  background: #d1fae5;
  color: #065f46;
}

.notification-type.type-info {
  background: #d1fae5;
  color: #065f46;
}

.notification-type.type-alert {
  background: #fee2e2;
  color: #991b1b;
}

.notification-type.type-warning {
  background: #fef3c7;
  color: #92400e;
}

.notification-type.type-system {
  background: #ede9fe;
  color: #6b21a8;
}

.sent-badge {
  font-size: 9px;
  font-weight: 700;
  padding: 3px 6px;
  border-radius: 4px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background: #d1fae5;
  color: #065f46;
}

.notification-date {
  font-size: 12px;
  color: #6b7280;
  font-weight: 500;
}

.notification-message {
  color: #4b5563;
  line-height: 1.6;
  margin-bottom: 16px;
  font-size: 15px;
}

.notification-details {
  background: #f8fafc;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 16px;
  font-size: 13px;
}

.detail-row {
  display: flex;
  gap: 24px;
  margin-bottom: 8px;
}

.detail-row:last-child {
  margin-bottom: 0;
}

.detail-item {
  display: flex;
  gap: 8px;
}

.detail-label {
  font-weight: 600;
  color: #374151;
}

.detail-value {
  color: #6b7280;
}

.notification-actions {
  display: flex;
  gap: 8px;
  margin-top: 16px;
}

.notification-status {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.unread-indicator {
  width: 10px;
  height: 10px;
  background: #3b82f6;
  border-radius: 50%;
  box-shadow: 0 0 8px rgba(59, 130, 246, 0.4);
}

.status-actions {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.more-actions {
  position: relative;
}

.pagination {
  padding: 28px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  border-top: 2px solid #f3f4f6;
}

.page-info {
  font-size: 14px;
  color: #6b7280;
  margin: 0 20px;
  font-weight: 500;
}

.quick-actions {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px -1px rgba(0, 0, 0, 0.1);
  padding: 32px;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.quick-actions h3 {
  font-size: 22px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 28px 0;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
}

.action-card {
  border: 2px solid #f3f4f6;
  border-radius: 12px;
  padding: 24px;
  display: flex;
  gap: 20px;
  transition: all 0.3s ease;
  background: #fafbfc;
}

.action-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px -3px rgba(0, 0, 0, 0.1);
  border-color: #e5e7eb;
  background: white;
}

.action-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f8fafc, #e2e8f0);
  border-radius: 12px;
  flex-shrink: 0;
  color: #64748b;
}

.action-icon svg {
  width: 24px;
  height: 24px;
}

.action-content {
  flex: 1;
}

.action-content h4 {
  font-size: 17px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 8px 0;
}

.action-content p {
  font-size: 14px;
  color: #6b7280;
  margin: 0 0 16px 0;
  line-height: 1.5;
}

.no-data {
  text-align: center;
  padding: 80px 20px;
}

.no-data-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto 20px;
  color: #9ca3af;
}

.no-data-icon svg {
  width: 100%;
  height: 100%;
}

.no-data h3 {
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 12px;
}

.no-data p {
  color: #6b7280;
  margin: 0 0 16px 0;
  font-size: 15px;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  gap: 20px;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #f3f4f6;
  border-top: 3px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border: 2px solid transparent;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s ease;
  cursor: pointer;
  text-align: center;
  white-space: nowrap;
}

.btn-primary {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #2563eb, #1e40af);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px -2px rgba(59, 130, 246, 0.4);
}

.btn-secondary {
  background: #f8fafc;
  color: #475569;
  border-color: #e2e8f0;
}

.btn-secondary:hover:not(:disabled) {
  background: #f1f5f9;
  border-color: #cbd5e1;
}

.btn-ghost {
  background: transparent;
  border: none;
  padding: 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-ghost:hover {
  background: #f3f4f6;
}

.btn-sm {
  padding: 8px 16px;
  font-size: 13px;
}

.btn-xs {
  padding: 6px 8px;
  font-size: 12px;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
  box-shadow: none !important;
}

.icon {
  width: 16px;
  height: 16px;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    text-align: center;
    gap: 24px;
    padding: 24px;
  }
  
  .header-content h2 {
    font-size: 28px;
  }
  
  .notification-stats {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .view-toggle {
    flex-direction: column;
    padding: 4px;
  }
  
  .filters-row {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filter-group {
    min-width: unset;
  }
  
  .notification-item {
    flex-direction: column;
    gap: 16px;
    padding: 20px;
  }
  
  .notification-header {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
  
  .notification-meta {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
  
  .detail-row {
    flex-direction: column;
    gap: 8px;
  }
  
  .actions-grid {
    grid-template-columns: 1fr;
  }
  
  .action-card {
    flex-direction: column;
    text-align: center;
  }
  
  .section-header {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }
  
  .pagination {
    flex-wrap: wrap;
    gap: 8px;
  }
  
  .page-info {
    order: -1;
    margin: 0;
  }
}

@media (max-width: 480px) {
  .notification-stats {
    grid-template-columns: 1fr;
  }
  
  .notifications-list {
    padding: 16px;
  }
  
  .notification-item {
    padding: 16px;
  }
  
  .notification-status {
    flex-direction: row;
    justify-content: flex-end;
  }
  
  .meta-badges {
    flex-wrap: wrap;
  }
}
</style>