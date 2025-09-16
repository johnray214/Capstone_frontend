<template>
  <SidebarLayout>
    <div class="archives-page">
      <div class="archives-header">
        <h1 class="page-title">Archives Management</h1>
        <p class="page-subtitle">Restore archived users based on your access level.</p>
      </div>

      <div class="archives-content">
        <div class="tabs-container">
          <button
            v-for="userType in manageableUserTypes"
            :key="userType"
            @click="switchTab(userType)"
            :class="{ active: activeTab === userType }"
            class="tab-button"
          >
            {{ formatUserType(userType) }}s 
            <span class="tab-count">{{ getTabCount(userType) }}</span>
          </button>
        </div>

        <div class="search-container">
           <svg class="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
           </svg>
           <input type="text" :placeholder="`Search archived ${formatUserType(activeTab)}s...`" v-model="searchQuery" class="search-input">
        </div>

        <div v-if="loading" class="state-container">
          <div class="loading-spinner"></div>
          <p class="loading-text">Loading archived users...</p>
        </div>
        <div v-else-if="error" class="state-container error-state">
          <div class="error-icon">⚠️</div>
          <p class="error-text">{{ error }}</p>
          <button @click="retryLoad" class="retry-button">Try Again</button>
        </div>
        <div v-else-if="filteredUsers.length === 0" class="state-container empty-state">
          <div class="empty-icon">📂</div>
          <p class="empty-text">No archived {{ formatUserType(activeTab) }}s found.</p>
        </div>

        <div v-else class="table-wrapper">
          <div class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>{{ formatUserType(activeTab) }}</th>
                  <th>Email</th>
                  <th>Archived Date</th>
                  <th class="actions-header">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="user in filteredUsers" :key="user.id" class="table-row">
                  <td>
                    <div class="user-info">
                      <div class="user-avatar">{{ getUserInitials(user.first_name, user.last_name) }}</div>
                      <div class="user-details">
                        <div class="text-primary">{{ user.first_name }} {{ user.last_name }}</div>
                        <div class="text-secondary">
                          <span class="user-type-badge" :class="getUserTypeBadgeClass(user.user_type || activeTab)">
                            {{ formatUserType(user.user_type || activeTab) }}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td class="text-secondary email-cell">{{ user.email }}</td>
                  <td class="text-secondary date-cell">{{ formattedDate(user.deleted_at) }}</td>
                  <td>
                    <div class="action-buttons">
                       <button 
                         @click="restoreUser(user.user_type || activeTab, user.id)" 
                         class="btn-restore" 
                         :disabled="isProcessing(`user-${user.user_type || activeTab}-${user.id}`)">
                         <svg v-if="isProcessing(`user-${user.user_type || activeTab}-${user.id}`)" class="animate-spin loading-spinner-small" fill="none" viewBox="0 0 24 24">
                           <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                           <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                         </svg>
                         <svg v-else class="restore-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                         </svg>
                         Restore
                       </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </SidebarLayout>
</template>

<script>
import { ref, onMounted, computed } from 'vue';
import SidebarLayout from '@/components/SidebarLayout.vue';
import { adminAPI } from '@/services/api';
import { useAuthStore } from '@/stores/auth';
import Swal from 'sweetalert2';

export default {
  name: 'ArchivesPage',
  components: { SidebarLayout },
  setup() {
    const { state: authState } = useAuthStore();
    
    const activeTab = ref('');
    const archivedUsers = ref([]);
    const loading = ref(false);
    const error = ref(null);
    const processingItems = ref(new Set());
    const searchQuery = ref('');
    const manageableUserTypes = ref([]);

    const getTabCount = (userType) => {
      return archivedUsers.value.filter(user => 
        (user.user_type || activeTab.value) === userType
      ).length;
    };

    // Filtering
    const filteredUsers = computed(() => {
      let users = archivedUsers.value.filter(user => 
        (user.user_type || activeTab.value) === activeTab.value
      );
      
      // Apply search filter
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase();
        users = users.filter(u =>
          `${u.first_name} ${u.last_name}`.toLowerCase().includes(query) ||
          u.email.toLowerCase().includes(query)
        );
      }
      
      return users;
    });

    // Get manageable user types based on current user
    const getManageableUserTypes = () => {
    const userRole = authState.user?.role;

    switch (userRole) {
      case 'Head':
        return ['deputy', 'admin', 'enforcer'];
      case 'Deputy':
        return ['admin', 'enforcer'];
      case 'Admin':
        return ['enforcer'];
      default:
        return [];
    }
  };

    // API Methods
    const fetchArchivedUsers = async (userType = 'all') => {
      loading.value = true;
      error.value = null;
      try {
        const params = {
          user_type: userType,
          search: searchQuery.value
        };
        const res = await adminAPI.getArchivedUsers(params);
        archivedUsers.value = res.data.data || [];
      } catch (err) {
        error.value = 'Failed to load archived users. Please try again.';
        console.error(err);
      } finally {
        loading.value = false;
      }
    };

    const switchTab = (userType) => {
      if (activeTab.value !== userType) {
        activeTab.value = userType;
        searchQuery.value = '';
      }
    };

    const retryLoad = () => fetchArchivedUsers();

    const restoreUser = async (userType, id) => {
      const itemKey = `user-${userType}-${id}`;
      const result = await Swal.fire({
        title: `Restore this ${formatUserType(userType)}?`,
        text: `This ${formatUserType(userType)} will be restored and become active again.`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Yes, restore it!',
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#10b981',
        cancelButtonColor: '#6b7280'
      });
      if (!result.isConfirmed) return;

      processingItems.value.add(itemKey);
      try {
        await adminAPI.restoreUser(userType, id);
        archivedUsers.value = archivedUsers.value.filter(u => !(u.id === id && (u.user_type || activeTab.value) === userType));
        Swal.fire({ 
          title: 'Restored!', 
          text: `${formatUserType(userType)} has been restored successfully.`,
          icon: 'success', 
          timer: 1500, 
          showConfirmButton: true 
        });
      } catch (err) {
        const errorMessage = err.response?.data?.message || 'Failed to restore user.';
        Swal.fire({ 
          title: 'Error!', 
          text: errorMessage, 
          icon: 'error' 
        });
        console.error(err);
      } finally {
        processingItems.value.delete(itemKey);
      }
    };

    const isProcessing = (itemKey) => processingItems.value.has(itemKey);

    // Utility Methods
    const formattedDate = date => {
      if (!date) return 'N/A';
      return new Date(date).toLocaleString('en-PH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    };

    const getUserInitials = (first, last) => `${first?.charAt(0)||''}${last?.charAt(0)||''}`.toUpperCase();
    
    const formatUserType = (userType) => {
      const typeMap = {
        'super_admin': 'Super Admin',
        'admin': 'Admin',
        'enforcer': 'Enforcer',
        'deputy': 'Deputy'
      };
      return typeMap[userType] || userType;
    };

    const getUserTypeBadgeClass = (userType) => {
      const classMap = {
        'head': 'badge-super-admin',
        'admin': 'badge-admin',
        'enforcer': 'badge-enforcer',
        'deputy': 'badge-deputy'
      };
      return classMap[userType] || 'badge-default';
    };

    // Initialize
    onMounted(() => {
      manageableUserTypes.value = getManageableUserTypes();
      if (manageableUserTypes.value.length > 0) {
        activeTab.value = manageableUserTypes.value[0];
        fetchArchivedUsers();
      }
    });

    return {
      activeTab, archivedUsers, manageableUserTypes,
      loading, error, searchQuery,
      filteredUsers, getTabCount,
      switchTab, retryLoad, restoreUser, isProcessing,
      formattedDate, getUserInitials, formatUserType, getUserTypeBadgeClass
    };
  }
};
</script>

<style scoped>
.archives-page {
  min-height: 100vh;
  width: 100%;
  padding: 1.5rem;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
}

.archives-header {
  padding: 2rem;
  margin-bottom: 1.5rem;
  border-radius: 12px;
  background: linear-gradient(135deg, #1e3a8a, #3b82f6);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.page-title {
  font-size: 2rem;
  font-weight: bold;
  color: #ffffff;
  margin: 0 0 0.5rem 0;
}

.page-subtitle {
  font-size: 1rem;
  font-weight: 300;
  color: #a7c5f4;
  margin: 0;
}

/* Enhanced Content Area */
.archives-content {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

/* Enhanced Tabs */
.tabs-container {
  display: flex;
  gap: 0.25rem;
  background: #f8fafc;
  border-radius: 12px;
  padding: 0.25rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.06);
}

.tab-button {
  padding: 0.875rem 1.5rem;
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 500;
  color: #64748b;
  border-radius: 10px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  position: relative;
  overflow: hidden;
}

.tab-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: -1;
}

.tab-button:hover {
  color: #1e40af;
  background: rgba(59, 130, 246, 0.05);
  transform: translateY(-1px);
}

.tab-button.active {
  color: white;
  font-weight: 600;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
  transform: translateY(-2px);
}

.tab-count {
  background-color: rgba(255, 255, 255, 0.2);
  color: currentColor;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.25rem 0.6rem;
  border-radius: 20px;
  min-width: 1.5rem;
  text-align: center;
  backdrop-filter: blur(8px);
}

.tab-button.active .tab-count {
  background-color: rgba(255, 255, 255, 0.3);
}

/* Enhanced Search */
.search-container {
  position: relative;
  margin-bottom: 2rem;
}

.search-input {
  width: 100%;
  padding: 1rem 1.25rem 1rem 3rem;
  border: 2px solid #e2e8f0;
  border-radius: 16px;
  font-size: 0.95rem;
  color: #1e293b;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(8px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.search-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1), 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  background: white;
  transform: translateY(-1px);
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  width: 1.25rem;
  height: 1.25rem;
  color: #64748b;
  transition: color 0.3s ease;
}

.search-input:focus + .search-icon {
  color: #3b82f6;
}

/* Enhanced User Type Badges */
.user-type-badge {
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.375rem 0.875rem;
  border-radius: 20px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border: 1px solid transparent;
}

.badge-super-admin {
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  color: white;
  border-color: rgba(251, 191, 36, 0.3);
}

.badge-admin {
  background: linear-gradient(135deg, #60a5fa, #3b82f6);
  color: white;
  border-color: rgba(96, 165, 250, 0.3);
}

.badge-enforcer {
  background: linear-gradient(135deg, #34d399, #10b981);
  color: white;
  border-color: rgba(52, 211, 153, 0.3);
}

.badge-deputy {
  background: linear-gradient(135deg, #a78bfa, #8b5cf6);
  color: white;
  border-color: rgba(167, 139, 250, 0.3);
}

.badge-default {
  background: linear-gradient(135deg, #9ca3af, #6b7280);
  color: white;
  border-color: rgba(156, 163, 175, 0.3);
}

/* Enhanced Loading/Error/Empty States */
.state-container {
  text-align: center;
  padding: 4rem 2rem;
  border-radius: 16px;
  background: rgba(248, 250, 252, 0.8);
  backdrop-filter: blur(8px);
}

.loading-spinner {
  width: 3rem;
  height: 3rem;
  border: 4px solid #e2e8f0;
  border-top: 4px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

.loading-text {
  color: #64748b;
  font-size: 1.1rem;
  font-weight: 500;
  margin: 0;
}

.error-state {
  background: rgba(254, 242, 242, 0.9);
}

.error-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.error-text {
  color: #dc2626;
  font-size: 1.1rem;
  font-weight: 500;
  margin: 0 0 1.5rem 0;
}

.empty-state {
  background: rgba(249, 250, 251, 0.9);
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.7;
}

.empty-text {
  color: #6b7280;
  font-size: 1.1rem;
  font-weight: 500;
  margin: 0;
}

.retry-button {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
  border: none;
  padding: 0.875rem 1.75rem;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.retry-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(59, 130, 246, 0.4);
}

/* Enhanced Table Styling */
.table-wrapper {
  overflow: hidden;
  border-radius: 16px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.table-container {
  overflow-x: auto;
  background: white;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  color: #1e293b;
  background: white;
}

.data-table th, .data-table td {
  padding: 1.25rem 1.5rem;
  text-align: left;
}

.data-table th {
  font-size: 0.8rem;
  font-weight: 700;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  background: linear-gradient(135deg, #f8fafc, #f1f5f9);
  border-bottom: 2px solid #e2e8f0;
}

.table-row {
  background: white;
  transition: all 0.3s ease;
  border-bottom: 1px solid #f1f5f9;
}

.table-row:hover {
  background: linear-gradient(135deg, #f8fafc, #f1f5f9);
  transform: scale(1.005);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.actions-header {
  text-align: right;
}

/* Enhanced Cell Content */
.text-primary {
  font-weight: 600;
  color: #0f172a;
  margin-bottom: 0.375rem;
  font-size: 0.95rem;
}

.text-secondary {
  font-size: 0.875rem;
  color: #64748b;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-details {
  flex: 1;
}

.user-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #e0e7ff, #c7d2fe);
  color: #4338ca;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.95rem;
  flex-shrink: 0;
  box-shadow: 0 4px 8px rgba(67, 56, 202, 0.2);
  border: 2px solid white;
}

.email-cell {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

.date-cell {
  white-space: nowrap;
}

/* Enhanced Action Buttons */
.action-buttons {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
}

.action-buttons button {
  border: 2px solid #e2e8f0;
  background: white;
  color: #475569;
  padding: 0.75rem 1.25rem;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 100px;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.action-buttons button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.action-buttons button.btn-restore:hover:not(:disabled) {
  background: linear-gradient(135deg, #10b981, #059669);
  border-color: #10b981;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(16, 185, 129, 0.4);
}

.restore-icon, .loading-spinner-small {
  width: 1rem;
  height: 1rem;
}

/* Loading spinner animations */
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Enhanced Responsive Design */
@media (max-width: 1024px) {
  .archives-content {
    padding: 1.5rem;
  }
  
  .data-table th, .data-table td {
    padding: 1rem;
  }
}

@media (max-width: 768px) {
  .archives-page {
    padding: 1rem;
  }
  
  .archives-header {
    padding: 1.5rem;
  }
  
  .page-title {
    font-size: 1.5rem;
  }
  
  .archives-content {
    padding: 1rem;
    border-radius: 16px;
  }
  
  .tabs-container {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .tab-button {
    justify-content: center;
  }
  
  .data-table {
    font-size: 0.875rem;
  }
  
  .data-table th, .data-table td {
    padding: 0.75rem;
  }
  
  .user-info {
    gap: 0.75rem;
  }
  
  .user-avatar {
    width: 40px;
    height: 40px;
    font-size: 0.8rem;
  }
  
  .action-buttons {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .action-buttons button {
    min-width: auto;
    width: 100%;
  }
}

@media (max-width: 640px) {
  .search-input {
    padding: 0.875rem 1rem 0.875rem 2.75rem;
  }
  
  .search-icon {
    left: 0.875rem;
  }
  
  .table-wrapper {
    border-radius: 12px;
  }
  
  .user-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .text-primary, .text-secondary {
    text-align: left;
  }
}
</style>