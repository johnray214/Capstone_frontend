<template>
  <SidebarLayout page-title="Reports & Analytics">
    <div class="admin-reports">
      <!-- Header -->
      <header class="dashboard-header">
        <div class="header-content">
          <h1>System Reports & Analytics</h1>
          <p>Generate comprehensive reports with multiple export formats</p>
        </div>
        <button class="refresh-btn" @click="loadDashboardData" aria-label="Refresh Dashboard">
          <svg 
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            stroke-width="2" 
            stroke-linecap="round" 
            stroke-linejoin="round"
          >
            <path d="M21 12a9 9 0 1 1-3-6.7" />
            <polyline points="21 3 21 9 15 9" />
          </svg>
          Refresh
        </button>
      </header>

      <!-- Report Generation Card -->
      <div class="report-card">
        <div class="card-header">
          <h3>Generate New Report</h3>
          <div class="card-subtitle">Create detailed reports with customizable parameters</div>
        </div>
        <div class="card-body">
          <form @submit.prevent="generateReport" class="report-form">
            <div class="form-section">
              <h4>Report Configuration</h4>
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Report Type <span class="required">*</span></label>
                  <select v-model="reportForm.type" class="form-select" required>
                    <option value="">Select Report Type</option>
                    <option value="total_revenue">Total Revenue</option>
                    <option value="all_violators">All Violators</option>
                    <option value="common_violations">Common Violations</option>
                    <option value="enforcer_performance">Enforcer Performance</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">Date Range <span class="required">*</span></label>
                  <select v-model="reportForm.period" class="form-select" required>
                    <option value="">Select Period</option>
                    <option value="today">Today</option>
                    <option value="yesterday">Yesterday</option>
                    <option value="last_7_days">Last 7 Days</option>
                    <option value="last_30_days">Last 30 Days</option>
                    <option value="last_3_months">Last 3 Months</option>
                    <option value="last_6_months">Last 6 Months</option>
                    <option value="last_year">Last Year</option>
                    <option value="year_to_date">Year to Date</option>
                    <option value="custom">Custom Range</option>
                  </select>
                </div>
              </div>

              <div v-if="reportForm.period === 'custom'" class="form-row">
                <div class="form-group">
                  <label class="form-label">Start Date</label>
                  <input v-model="reportForm.start_date" type="date" class="form-input" required />
                </div>
                <div class="form-group">
                  <label class="form-label">End Date</label>
                  <input v-model="reportForm.end_date" type="date" class="form-input" required />
                </div>
              </div>
            </div>

            <div class="form-section">
              <h4>Export Options</h4>
              <div class="export-options">
  <div class="export-group">
    <div class="export-item">
      <input v-model="reportForm.export_formats" type="checkbox" value="pdf" id="pdf" />
      <label for="pdf" class="export-label">
        <svg class="export-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
          <polyline points="14,2 14,8 20,8"></polyline>
          <path d="M16,13a2,2 0 0,1 -2,2 2,2 0 0,1 -2,-2 2,2 0 0,1 2,-2 2,2 0 0,1 2,2z"></path>
          <path d="M10,13h2v6h-2v-6z"></path>
        </svg>
        <div class="export-info">
          <div class="export-title">PDF Report</div>
          <div class="export-desc">Professional formatted document</div>
        </div>
      </label>
    </div>
    <div class="export-item">
      <input v-model="reportForm.export_formats" type="checkbox" value="excel" id="excel" />
      <label for="excel" class="export-label">
        <svg class="export-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
          <path d="M7 7h10v2H7zM7 11h10v2H7zM7 15h6v2H7z"></path>
        </svg>
        <div class="export-info">
          <div class="export-title">Excel Spreadsheet</div>
          <div class="export-desc">Data analysis and manipulation</div>
        </div>
      </label>
    </div>
    <div class="export-item">
      <input v-model="reportForm.export_formats" type="checkbox" value="word" id="word" />
      <label for="word" class="export-label">
        <svg class="export-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
          <polyline points="14,2 14,8 20,8"></polyline>
          <path d="M7,10 L9,16 L12,10 L15,16 L17,10"></path>
        </svg>
        <div class="export-info">
          <div class="export-title">Word Document</div>
          <div class="export-desc">Detailed narrative report</div>
        </div>
      </label>
    </div>
    
  </div>
</div>
            </div>



            <div class="form-actions">
              <button type="submit" class="btn btn-primary btn-sm" :disabled="generating || !canGenerate">
                <span v-if="generating" class="spinner"></span>
                <svg v-else class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7,10 12,15 17,10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                {{ generating ? 'Generating...' : 'Generate Report' }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Report Preview Section -->
      <div v-if="previewData && canGenerate" class="report-preview-section">
        <div class="preview-header">
          <h3>Report Preview</h3>
          <div class="preview-meta">
            <div class="meta-item">
              <strong>Report Type:</strong> {{ getReportTypeLabel(previewData.type) }}
            </div>
            <div class="meta-item">
              <strong>Period:</strong> {{ getPeriodLabel(previewData.period) }}
            </div>
            <div class="meta-item">
              <strong>Date Range:</strong> 
              {{ previewData.date_range?.start ? formatDate(previewData.date_range.start) : 'N/A' }} - 
              {{ previewData.date_range?.end ? formatDate(previewData.date_range.end) : 'N/A' }}
            </div>
            <div class="meta-item">
              <strong>Total Records:</strong> {{ previewData.total_records }}
            </div>
          </div>
        </div>
        
        <div class="preview-table">
          <div class="table-header">
            <div class="table-info">
              Showing {{ (currentPage - 1) * itemsPerPage + 1 }} to {{ Math.min(currentPage * itemsPerPage, previewData.preview_data.length) }} of {{ previewData.preview_data.length }} records
            </div>
            <div class="table-controls">
              <select v-model="itemsPerPage" class="page-size-select">
                <option value="10">10 per page</option>
                <option value="25">25 per page</option>
                <option value="50">50 per page</option>
                <option value="100">100 per page</option>
              </select>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th v-for="(value, key) in previewData.preview_data[0]" :key="key">
                  {{ key }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, index) in paginatedData" :key="index">
                <td v-for="(value, key) in row" :key="key">
                  {{ formatValue(value, key) }}
                </td>
              </tr>
            </tbody>
          </table>
          <div class="pagination" v-if="totalPages > 1">
            <button 
              @click="currentPage = Math.max(1, currentPage - 1)" 
              :disabled="currentPage === 1"
              class="pagination-btn"
            >
              Previous
            </button>
            <span class="pagination-info">
              Page {{ currentPage }} of {{ totalPages }}
            </span>
            <button 
              @click="currentPage = Math.min(totalPages, currentPage + 1)" 
              :disabled="currentPage === totalPages"
              class="pagination-btn"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      <!-- Report History -->
      <div class="report-history">
        <div class="card-header">
          <h3>Report History</h3>
          <div class="header-actions">
  <button @click="clearHistory" class="btn btn-ghost btn-sm clear-history-btn" :disabled="recentReports.length === 0">
    <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <polyline points="3,6 5,6 21,6"></polyline>
      <path d="M19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"></path>
      <line x1="10" y1="11" x2="10" y2="17"></line>
      <line x1="14" y1="11" x2="14" y2="17"></line>
    </svg>
    Clear History
  </button>
</div>
        </div>
        
        <div class="history-filters">
          <div class="filter-group">
            <select v-model="historyFilter" class="form-select form-select-sm">
              <option value="">All Reports</option>
              <option value="violations">Violations</option>
              <option value="revenue">Revenue</option>
              <option value="enforcer_performance">Performance</option>
            </select>
            <input v-model="searchQuery" type="text" placeholder="Search reports..." class="form-input form-input-sm" />
          </div>
        </div>

        <div class="reports-list">
          <div v-if="filteredReports.length === 0" class="empty-state">
            <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
              <polyline points="14,2 14,8 20,8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10,9 9,9 8,9"></polyline>
            </svg>
            <h4>No reports found</h4>
            <p>Generate your first report to see it here</p>
          </div>
          
          <div v-else class="report-grid">
            <div v-for="report in filteredReports" :key="report.id" class="report-card-item">
              <div class="report-header">
                <div class="report-type-badge" :class="getReportTypeClass(report.type)">
                  {{ getReportTypeLabel(report.type) }}
                </div>
                <div class="report-date">{{ formatDate(report.created_at) }}</div>
              </div>
              
              <div class="report-content">
  <h4 class="report-title">{{ getReportTitle(report.type) }}</h4>
  <div class="report-meta">
    <span class="meta-item">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
        <line x1="16" y1="2" x2="16" y2="6"></line>
        <line x1="8" y1="2" x2="8" y2="6"></line>
        <line x1="3" y1="10" x2="21" y2="10"></line>
      </svg>
      {{getPeriodLabel(report.period) }}
    </span>
    <span class="meta-item">
  <template v-for="f in report.files" :key="f.filename">
  <span 
    class="file-badge" 
    :class="getFileClass(f.filename)"
  >
    {{ getFileLabel(f.filename) }}
  </span>
</template>

</span>

  </div>
</div>
              
              <div class="report-actions">
                <div class="action-group">
                  <button @click="viewReport(report)" class="btn btn-ghost btn-sm">
                    <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                    View
                  </button>
                  <button @click="downloadReport(report)" class="btn btn-primary btn-sm">
                    <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="7,10 12,15 17,10"></polyline>
                      <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                    Download
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>

    <!-- Preview Modal -->
    <div v-if="showPreview" class="modal-overlay" @click="showPreview = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Report Preview</h3>
          <button @click="showPreview = false" class="close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <div v-if="previewData" class="preview-info">
            <div class="preview-meta">
              <div class="meta-item">
                <strong>Report Type:</strong> {{ getReportTypeLabel(previewData.type) }}
              </div>
              <div class="meta-item">
                <strong>Period:</strong> {{ getPeriodLabel(previewData.period) }}
              </div>
              <div class="meta-item">
                <strong>Date Range:</strong> 
                {{ previewData.date_range?.start ? formatDate(previewData.date_range.start) : 'N/A' }} - 
                {{ previewData.date_range?.end ? formatDate(previewData.date_range.end) : 'N/A' }}
              </div>
              <div class="meta-item">
                <strong>Total Records:</strong> {{ previewData.total_records }}
              </div>
            </div>
            
            <div class="preview-actions">
              <button @click="generateReport" class="btn btn-primary">Generate Report</button>
            </div>
            
            <div class="preview-table">
              <table>
                <thead>
                  <tr>
                    <th v-for="(value, key) in previewData.preview_data[0]" :key="key">
                      {{ key }}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(row, index) in previewData.preview_data" :key="index">
                    <td v-for="(value, key) in row" :key="key">
                      {{ formatValue(value, key) }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="showPreview = false" class="btn btn-secondary">Close</button>
        </div>
      </div>
    </div>
  </SidebarLayout>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import SidebarLayout from '@/components/SidebarLayout.vue'
import { adminAPI } from '@/services/api'
import Swal from 'sweetalert2'

export default {
  name: 'AdminReports',
  components: {
    SidebarLayout
  },
  setup() {
    const generating = ref(false)
    const refreshing = ref(false)
    const previewing = ref(false)
    const quickStats = ref({})
    const recentReports = ref([])
    const historyFilter = ref('')
    const searchQuery = ref('')
    const lastUpdated = ref('')
    const previewData = ref(null)
    const showPreview = ref(false)
    const currentPage = ref(1)
    const itemsPerPage = ref(25)
    
    const reportForm = ref({
      type: '',
      period: '',
      start_date: '2022-01-01', // Default start date
      end_date: new Date().toISOString().split('T')[0], // Current date
      export_formats: ['pdf'],
      include_charts: false,
      include_details: false,
      include_summary: false,
      include_comparison: false
    })

    const generateSummaryFromData = (records) => {
  if (!Array.isArray(records)) return {}

  const summary = {}
  summary.total_violations = records.length
  summary.total_fines = records.reduce((sum, r) => sum + Number(r.fine_amount || 0), 0)

  const pending = records.filter(r => r.status === 'Pending').length
  const paid = records.filter(r => r.status === 'Paid').length
  summary.pending_count = pending
  summary.paid_count = paid

  return summary
}
    const canGenerate = computed(() => {
      const hasBase = reportForm.value.type && reportForm.value.period && reportForm.value.export_formats.length > 0
      if (reportForm.value.period === 'custom') {
        return hasBase && reportForm.value.start_date && reportForm.value.end_date
      }
      return hasBase
    })

    const totalPages = computed(() => {
      if (!previewData.value?.preview_data) return 0
      return Math.ceil(previewData.value.preview_data.length / itemsPerPage.value)
    })

    const paginatedData = computed(() => {
      if (!previewData.value?.preview_data) return []
      const start = (currentPage.value - 1) * itemsPerPage.value
      const end = start + itemsPerPage.value
      return previewData.value.preview_data.slice(start, end)
    })
    
    const filteredReports = computed(() => {
      let filtered = recentReports.value
      
      if (historyFilter.value) {
        filtered = filtered.filter(report => report.type === historyFilter.value)
      }
      
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        filtered = filtered.filter(report => 
          getReportTitle(report.type).toLowerCase().includes(query) ||
          report.period.toLowerCase().includes(query)
        )
      }
      
      return filtered
    })
    
    // Simple file generation 
    const downloadFileFromBase64 = (base64, filename, mimeType) => {
  try {
    const binary = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
    const blob = new Blob([binary], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (e) {
    console.error('Failed to download file:', e);
  }
};
    
    // Preview report
    const previewReport = async () => {
      if (!canGenerate.value) return;

      try {
        previewing.value = true;

        const payload = {
          type: reportForm.value.type,
          period: reportForm.value.period,
          start_date: reportForm.value.period === 'custom' ? reportForm.value.start_date : undefined,
          end_date: reportForm.value.period === 'custom' ? reportForm.value.end_date : undefined,
        };

        console.log('🔍 DEBUG: Manual preview payload:', payload);
        const response = await adminAPI.previewReport(payload);
        const data = response.data?.data || {};
        console.log('🔍 DEBUG: Manual preview response:', data);
        console.log('🔍 DEBUG: Manual preview total records:', data.total_records);
        console.log('🔍 DEBUG: Manual preview data length:', data.preview_data?.length);

        previewData.value = {
          type: data.type,
          period: data.period,
          date_range: data.date_range,
          preview_data: data.preview_data,
          total_records: data.total_records,
        };

        showPreview.value = true;

        await Swal.fire({
          title: '✅ Preview Generated',
          text: `Found ${data.total_records} records for ${data.type} report`,
          icon: 'success',
          confirmButtonText: 'OK'
        });

      } catch (error) {
        console.error('Failed to preview report:', error);

        let errorMessage = 'Failed to preview report. Please try again.';
        const message = error?.response?.data?.message;
        const errors = error?.response?.data?.errors;

        if (errors) {
          const firstKey = Object.keys(errors)[0];
          errorMessage = `${firstKey} - ${errors[firstKey]?.[0] || ''}`;
        } else if (message) {
          errorMessage = message;
        }

        await Swal.fire({
          title: '❌ Error',
          text: errorMessage,
          icon: 'error',
          confirmButtonText: 'OK'
        });
      } finally {
        previewing.value = false;
      }
    };

    // Report generation
const generateReport = async () => {
  if (!canGenerate.value) return;

  // Check if export formats are selected
  if (!reportForm.value.export_formats || reportForm.value.export_formats.length === 0) {
    await Swal.fire({
      title: '⚠️ Export Options Required',
      text: 'Please select at least one export format (PDF, Excel, or Word) before generating the report.',
      icon: 'warning',
      confirmButtonText: 'OK',
      confirmButtonColor: '#3b82f6'
    });
    return;
  }

  try {
    generating.value = true;

    const payload = {
      type: reportForm.value.type,
      period: reportForm.value.period,
      start_date: reportForm.value.period === 'custom' ? reportForm.value.start_date : undefined,
      end_date: reportForm.value.period === 'custom' ? reportForm.value.end_date : undefined,
      export_formats: reportForm.value.export_formats,
      limit: 1000,
      per_page: 1000,
      page_size: 1000,
    };

    const response = await adminAPI.generateReport(payload);
    const data = response.data?.data || {};

    // Prepare report record
    const reportRecord = {
      id: data.id || Date.now(),
      type: payload.type,
      period: payload.period,
      formats: payload.export_formats,
      created_at: data.created_at || new Date().toISOString(),
      reportContent: data.report || data,
      total_records: data.total_records || data.report?.length || 0,
      summary: data.summary || generateSummaryFromData(data.report || []),
      files: Array.isArray(data.files) ? data.files : []
    };

    recentReports.value.unshift(reportRecord);

    if (reportRecord.files.length > 0) {
  for (const f of reportRecord.files) {
    if (f.filename) {
      try {
        const response = await adminAPI.downloadReportFile(f.filename);
        const blob = new Blob([response.data], { type: f.mimeType || 'application/octet-stream' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = f.filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(link.href), 100);
      } catch (err) {
        console.error('Failed to download file:', err);
        alert(`Failed to download ${f.filename}`);
      }
    }
  }
} else {
  const jsonContent = JSON.stringify(reportRecord.reportContent, null, 2);
  downloadFileFromBase64(
    btoa(jsonContent),
    `${reportRecord.type}_report_${reportRecord.id}.json`,
    'application/json'
  );
}

    await Swal.fire({
      title: '✅ Report Generated & Downloaded',
      text: `Formats: ${payload.export_formats.join(', ').toUpperCase()}`,
      icon: 'success',
      confirmButtonText: 'OK'
    });

    resetForm();
  } catch (error) {
    console.error('Failed to generate report:', error);

    let errorMessage = 'Failed to generate report. Please try again.';
    const message = error?.response?.data?.message;
    const errors = error?.response?.data?.errors;

    if (errors) {
      const firstKey = Object.keys(errors)[0];
      errorMessage = `${firstKey} - ${errors[firstKey]?.[0] || ''}`;
    } else if (message) {
      errorMessage = message;
    }

    await Swal.fire({
      title: '❌ Error',
      text: errorMessage,
      icon: 'error',
      confirmButtonText: 'OK'
    });
  } finally {
    generating.value = false;
  }
};

    const viewReport = (report) => {
      // Direct download instead of preview
      downloadReport(report)
    }
    
    const downloadReport = async (report) => {
  try {
    if (report.files && report.files.length > 0) {
      for (const fileInfo of report.files) {
        if (fileInfo.filename) {
          const response = await adminAPI.downloadReportFile(fileInfo.filename);

          const blob = new Blob([response.data], { type: fileInfo.mimeType || 'application/octet-stream' });
          const url = URL.createObjectURL(blob);

          const link = document.createElement('a');
          link.href = url;
          link.download = fileInfo.filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }
      }
    } else {
      const content = JSON.stringify(report.reportContent, null, 2);
      const blob = new Blob([content], { type: 'application/json' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${report.type}_report_${report.id}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  } catch (error) {
    console.error('Failed to download report:', error);
    alert('Failed to download report. Please try again.');
  }
};
    
    
    const clearHistory = async () => {
  const result = await Swal.fire({
    title: 'Are you sure?',
    text: 'This will clear all report history (soft delete).',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, clear it!',
    cancelButtonText: 'Cancel',
  });

  if (result.isConfirmed) {
    try {
      await adminAPI.clearReportHistory();
      recentReports.value = [];
      await Swal.fire({
        title: '✅ Cleared!',
        text: 'Report history has been cleared successfully.',
        icon: 'success',
        confirmButtonText: 'OK'
      });
    } catch (error) {
      console.error('Failed to clear report history:', error);
      await Swal.fire({
        title: '❌ Error',
        text: 'Failed to clear report history. Please try again.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    }
  }
};

    
    const refreshStats = async () => {
      try {
        refreshing.value = true
        await loadQuickStats()
        lastUpdated.value = new Date().toLocaleString()
        alert('Statistics refreshed successfully!')
      } catch (error) {
        console.error('Failed to refresh stats:', error)
        alert('Failed to refresh statistics. Please try again.')
      } finally {
        refreshing.value = false
      }
    }
    
    const resetForm = () => {
      reportForm.value = {
        type: '',
        period: '',
        start_date: '2022-01-01', // Default start date
        end_date: new Date().toISOString().split('T')[0], // Current date
        export_formats: ['pdf'],
        include_charts: true,
        include_details: false,
        include_summary: true,
        include_comparison: false
      }
    }
    
    const getReportTitle = (type) => {
      const titles = {
        total_revenue: 'Total Revenue',
        all_violators: 'All Violators',
        common_violations: 'Common Violations',
        enforcer_performance: 'Enforcer Performance'
      }
      return titles[type] || 'System Report'
    }
    
    const getReportTypeLabel = (type) => {
      const labels = {
        total_revenue: 'Total Revenue',
        all_violators: 'All Violators',
        common_violations: 'Common Violations',
        enforcer_performance: 'Enforcer Performance'
      }
      return labels[type] || type
    }
    
    const getReportTypeClass = (type) => {
  const classes = {
    total_revenue: 'badge-success',          
    all_violators: 'badge-danger',          
    common_violations: 'badge-warning',      
    enforcer_performance: 'badge-info'      
  }
  return classes[type] || 'badge-secondary'
}
    const loadReportHistory = async () => {
  try {
    const response = await adminAPI.getReportHistory()
    recentReports.value = response.data?.data || []
  } catch (error) {
    console.error('Failed to load report history:', error)
  }
}
    const formatNumber = (num) => {
      return new Intl.NumberFormat('en-PH').format(num)
    }
    
    const formatCurrency = (amount) => {
      return new Intl.NumberFormat('en-PH').format(amount)
    }
    
    const formatDate = (dateString) => {
      if (!dateString) return ''
      return new Date(dateString).toLocaleDateString('en-PH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
    const formatDateTime = (dateString) => {
      if (!dateString) return ''
      return new Date(dateString).toLocaleString('en-PH', {
        year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
      })
    }
    const getPeriodLabel = (period) => {
      const map = {
        today: 'Today',
        yesterday: 'Yesterday',
        last_7_days: 'Last 7 Days',
        last_30_days: 'Last 30 Days',
        last_3_months: 'Last 3 Months',
        last_6_months: 'Last 6 Months',
        last_year: 'Last Year',
        year_to_date: 'Year to Date',
        custom: 'Custom Range'
      }
      return map[period] || period
    }
    
    const formatLabel = (key) => {
      return key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    }
    
    const formatValue = (value, key) => {
      if (key.includes('amount') || key.includes('revenue') || key.includes('collected') || key.includes('fines')) {
        return `₱${formatCurrency(value)}`
      }
      if (key.includes('rate') || key.includes('percentage')) {
        return `${value}%`
      }
      if (typeof value === 'number' && value > 1000) {
        return formatNumber(value)
      }
      return value
    }
    
    const loadQuickStats = async () => {
      try {
        const response = await adminAPI.getQuickStats()
        const stats = response.data?.data || {}
        quickStats.value = {
          total_violations: Number(stats.total_violations) || 0,
          total_revenue: Number(stats.total_revenue) || 0,
          pending_amount: Number(stats.pending_amount) || 0,
          pending_count: Number(stats.pending_count) || 0,
          collection_rate: Number(stats.collection_rate) || 0,
          violations_change: Number(stats.violations_change) || 0,
          revenue_change: Number(stats.revenue_change) || 0
        }
        lastUpdated.value = new Date().toLocaleString()
      } catch (error) {
        console.error('Failed to load quick stats:', error)
        quickStats.value = {
          total_violations: 0,
          total_revenue: 0,
          pending_amount: 0,
          pending_count: 0,
          collection_rate: 0,
          violations_change: 0,
          revenue_change: 0
        }
      }
    }
    const getFileLabel = (filename) => {
  const ext = filename.split('.').pop().toLowerCase()
  switch (ext) {
    case 'pdf': return 'PDF'
    case 'xlsx': return 'EXCEL'
    case 'xls': return 'EXCEL'
    case 'docx': return 'WORD'
    case 'doc': return 'WORD'
    default: return ext.toUpperCase()
  }
    }

    const getFileClass = (filename) => {
  const ext = filename.split('.').pop().toLowerCase()
  switch (ext) {
    case 'pdf': return 'pdf'
    case 'xlsx':
    case 'xls': return 'xlsx'
    case 'docx':
    case 'doc': return 'docx'
    default: return ''
  }
}
    onMounted(() => {
      loadQuickStats()
      loadReportHistory()
    })

    // Watch for changes in report form to auto-fetch preview
    watch(
      () => [reportForm.value.type, reportForm.value.period, reportForm.value.start_date, reportForm.value.end_date],
      async () => {
        if (canGenerate.value) {
          try {
            previewing.value = true;
            const payload = {
              type: reportForm.value.type,
              period: reportForm.value.period,
              start_date: reportForm.value.period === 'custom' ? reportForm.value.start_date : undefined,
              end_date: reportForm.value.period === 'custom' ? reportForm.value.end_date : undefined,
              limit: 100, // Request more records for preview
              per_page: 100, // Alternative parameter name
              page_size: 100, // Another alternative
            };

            console.log('🔍 DEBUG: Preview payload being sent:', payload); // Debug log
            const response = await adminAPI.previewReport(payload);
            const data = response.data?.data || {};
            console.log('🔍 DEBUG: Preview response data received:', data); // Debug log to see what backend returns
            console.log('🔍 DEBUG: Total records in response:', data.total_records);
            console.log('🔍 DEBUG: Preview data array length:', data.preview_data?.length);
            console.log('🔍 DEBUG: Full preview data:', data.preview_data);

            previewData.value = {
              type: data.type,
              period: data.period,
              date_range: data.date_range,
              preview_data: data.preview_data,
              total_records: data.total_records,
            };
            currentPage.value = 1; // Reset to first page when new data loads
          } catch (error) {
            console.error('Failed to auto-preview report:', error);
            previewData.value = null;
          } finally {
            previewing.value = false;
          }
        } else {
          previewData.value = null;
        }
      },
      { deep: true }
    );

    // Watch for changes in itemsPerPage to reset current page
    watch(itemsPerPage, () => {
      currentPage.value = 1;
    });
    
    return {
      generating,
      refreshing,
      previewing,
      quickStats,
      recentReports,
      historyFilter,
      searchQuery,
      lastUpdated,
      reportForm,
      canGenerate,
      filteredReports,
      previewReport,
      generateReport,
      viewReport,
      downloadReport,
      clearHistory,
      refreshStats,
      getReportTitle,
      getReportTypeLabel,
      getReportTypeClass,
      formatNumber,
      formatCurrency,
      previewData,
      showPreview,
      currentPage,
      itemsPerPage,
      totalPages,
      paginatedData,
      formatDate,
      formatLabel,
      formatValue,
      formatDateTime,
      getPeriodLabel,
      generateSummaryFromData,
      loadReportHistory,
      getFileLabel,
      getFileClass,
    }
  }
}
</script>

<style scoped>
/* Header Styles */
.admin-reports {
  background-color: #f9fafb;
  padding: 32px;
  min-height: 100vh;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  background: linear-gradient(135deg, #1e3a8a, #3b82f6);
  padding: 40px;
  border-radius: 24px;
  color: white;
  box-shadow: 0 20px 40px rgba(102, 126, 234, 0.3);
}

.header-content h1 {
  color: white;
  margin-bottom: 4px;
  letter-spacing: -0.025em;
}

.header-content p {
  color: rgba(255, 255, 255, 0.9);
}

.refresh-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  padding: 12px 20px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  transition: all 0.3s ease;
  cursor: pointer;
  backdrop-filter: blur(10px);
}

.refresh-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

/* Card Styles */
.report-card, .stats-dashboard, .report-history {
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  margin-bottom: 32px;
  overflow: hidden;
  border: 1px solid rgba(229, 231, 235, 0.8);
}

.card-header {
  padding: 24px;
  border-bottom: 1px solid #f3f4f6;
  background: linear-gradient(135deg, #fafbff 0%, #f8fafc 100%);
}

.card-header h3 {
  font-size: 20px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 4px 0;
}

.card-subtitle {
  color: #6b7280;
  font-size: 14px;
}

.card-body {
  padding: 32px;
}

/* Form Styles */
.form-section {
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid #f3f4f6;
}

.form-section:last-child {
  border-bottom: none;
}

.form-section h4 {
  font-size: 16px;
  font-weight: 600;
  color: #374151;
  margin: 0 0 20px 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-label {
  font-weight: 500;
  color: #374151;
  margin-bottom: 8px;
  font-size: 14px;
}

.required {
  color: #ef4444;
}

.form-select, .form-input {
  padding: 12px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s;
  background: white;
}

.form-select:focus, .form-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-select-sm, .form-input-sm {
  padding: 8px 12px;
  font-size: 14px;
}

/* Export Options */
.export-options {
  margin-top: 16px;
}

.export-group {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
}

.export-item {
  position: relative;
}

.export-item input[type="checkbox"] {
  position: absolute;
  opacity: 0;
}

.export-label {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  border: 1.5px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: #fafbfc;
}

.export-label:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
}

/* PDF Export - Red/Orange */
.export-item:nth-child(1) input:checked + .export-label {
  background: #fed7d7;
  border-color: #f87171; 
}

.export-item:nth-child(1) input:checked + .export-label .export-icon {
  color: #dc2626; 
}

.export-item:nth-child(1) input:checked + .export-label .export-title {
  color: #b91c1c; 
}

/* Excel Export - Green */
.export-item:nth-child(2) input:checked + .export-label {
  background: #d1fae5;
  border-color: #10b981;
}

.export-item:nth-child(2) input:checked + .export-label .export-icon {
  color: #059669;
}

.export-item:nth-child(2) input:checked + .export-label .export-title {
  color: #047857;
}

/* Word Export - Blue */
.export-item:nth-child(3) input:checked + .export-label {
  background: #dbeafe; 
  border-color: #3b82f6; 
}

.export-item:nth-child(3) input:checked + .export-label .export-icon {
  color: #2563eb;
}

.export-item:nth-child(3) input:checked + .export-label .export-title {
  color: #1e40af; 
}

.export-icon {
  width: 20px;
  height: 20px;
  color: #6b7280;
  transition: color 0.2s ease;
}

.export-info {
  flex: 1;
}

.export-title {
  font-weight: 500;
  color: #374151;
  font-size: 14px;
  transition: color 0.2s ease;
  line-height: 1.2;
}

.export-desc {
  font-size: 12px;
  color: #6b7280;
  margin-top: 2px;
  line-height: 1.3;
}

/* Consistent styling for both export options and report options */
.options-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 12px;
}

.option-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border: 1.5px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: #fafbfc;
}

.option-item:hover {
  border-color: #cbd5e1;
  background: #f1f5f9;
}

.option-item input:checked {
  accent-color: #3b82f6;
}

/* Light color variants for checked options */
.option-item:has(input:checked) {
  background: #eff6ff;
  border-color: #3b82f6;
}

.option-item:has(input:checked) .option-icon {
  color: #2563eb;
}

.option-item:has(input:checked) .option-title {
  color: #1e40af;
}

.option-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.option-icon {
  width: 18px;
  height: 18px;
  color: #6b7280;
  transition: color 0.2s ease;
}

.option-title {
  font-weight: 500;
  color: #374151;
  font-size: 14px;
  transition: color 0.2s ease;
  line-height: 1.2;
}

.option-desc {
  font-size: 12px;
  color: #6b7280;
  margin-top: 2px;
  line-height: 1.3;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .export-group {
    grid-template-columns: 1fr;
  }
  
  .options-grid {
    grid-template-columns: 1fr;
  }
  
  .export-label, .option-item {
    padding: 12px 14px;
  }
}

/* Add some subtle shadows for depth */
.export-label, .option-item {
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
}

.export-item input:checked + .export-label,
.option-item:has(input:checked) {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
}

/* Form Actions */
.form-actions {
  display: flex;
  gap: 16px;
  justify-content: flex-end;
  padding-top: 24px;
  border-top: 1px solid #f3f4f6;
}

/* Button Styles */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 500;
  font-size: 14px;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  transform: translateY(-1px);
  box-shadow: 0 10px 15px -3px rgba(37, 99, 235, 0.3);
}

.btn-secondary {
  background: #f8fafc;
  color: #475569;
  border: 1px solid #e2e8f0;
}

.btn-secondary:hover:not(:disabled) {
  background: #f1f5f9;
  border-color: #cbd5e1;
}

.btn-ghost {
  background: transparent;
  color: #6b7280;
}

.btn-ghost:hover {
  background: #f9fafb;
  color: #374151;
}

.btn-sm {
  padding: 8px 16px;
  font-size: 12px;
}

/* Stats Dashboard */
.dashboard-statistics-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #eef2f7;
  background: #ffffff;
}

.dashboard-statistics-header h3 {
  font-size: 20px;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.last-updated {
  font-size: 12px;
  color: #6b7280;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
  padding: 20px;
}

.stat-card {
  padding: 20px;
  border-radius: 12px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  transition: background 0.2s ease;
}

.stat-card.primary { border-left: 4px solid #bfdbfe; }
.stat-card.success { border-left: 4px solid #bbf7d0; }
.stat-card.warning { border-left: 4px solid #fde68a; }
.stat-card.info { border-left: 4px solid #bae6fd; }

.stat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.stat-title {
  font-weight: 500;
  color: #6b7280;
  font-size: 13px;
}

.stat-icon {
  width: 20px;
  height: 20px;
  opacity: 0.7;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #0f172a;
  line-height: 1;
  margin-bottom: 6px;
}

.stat-change {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 500;
}

.stat-change.positive { color: #059669; }
.stat-change.negative { color: #dc2626; }
.stat-change.neutral { color: #6b7280; }

.stat-subtitle {
  font-size: 12px;
  color: #94a3b8;
  margin-top: 4px;
}

.progress-bar {
  width: 100%;
  height: 6px;
  background: #eef2f7;
  border-radius: 3px;
  overflow: hidden;
  margin-top: 8px;
}

.progress-fill {
  height: 100%;
  background: #93c5fd;
  transition: width 0.3s ease;
}

/* Report History */
.history-filters {
  padding: 16px 24px;
  border-bottom: 1px solid #f3f4f6;
  background: #fafbfc;
}

.filter-group {
  display: flex;
  gap: 16px;
  align-items: center;
}

.reports-list {
  padding: 24px;
}

.report-grid {
  display: grid;
  gap: 16px;
}

.report-card-item {
  padding: 20px;
  border: 2px solid #f3f4f6;
  border-radius: 12px;
  transition: all 0.2s;
  background: white;
}

.report-card-item:hover {
  border-color: #e5e7eb;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.report-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.report-type-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.badge-primary { background: #dbeafe; color: #1d4ed8; }
.badge-success { background: #d1fae5; color: #059669; }
.badge-danger { background: #fee2e2; color: #dc2626; }
.badge-warning { background: #fef3c7; color: #d97706; }
.badge-info { background: #e0f2fe; color: #0284c7; }
.badge-secondary { background: #f1f5f9; color: #475569; }
.badge-purple { background: #f3e8ff; color: #7c3aed; }
.badge-orange { background: #fed7aa; color: #ea580c; }

.report-date {
  font-size: 12px;
  color: #6b7280;
}

.report-title {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 8px 0;
}

.report-meta {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #6b7280;
}
.meta-item svg {
  width: 36px;
  height: 26px;
  display: inline-block;
  vertical-align: middle;
}

.report-actions {
  display: flex;
  justify-content: flex-end;
}

.action-group {
  display: flex;
  gap: 8px;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.empty-icon {
  width: 64px;
  height: 64px;
  color: #d1d5db;
  margin: 0 auto 16px;
}

.empty-state h4 {
  font-size: 18px;
  font-weight: 600;
  color: #374151;
  margin: 0 0 8px 0;
}

.empty-state p {
  color: #6b7280;
  margin: 0;
}

.file-badge {
  display: inline-block;
  background-color: #f3f3f3;
  color: #333;
  font-size: 0.7rem;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 4px;
  margin-right: 4px;
}
.file-badge::after {
  content: '';
  margin-right: 4px;
}
.file-badge.pdf { background-color: #e53e3e; color: white; }
.file-badge.xlsx { background-color: #38a169; color: white; }
.file-badge.docx { background-color: #3182ce; color: white; }

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  max-width: 90vw;
  max-height: 90vh;
  width: 800px;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #6b7280;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  color: #374151;
}

.modal-body {
  padding: 20px;
  overflow-y: auto;
  flex: 1;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px;
  border-top: 1px solid #e5e7eb;
}

.preview-info {
  margin-bottom: 20px;
}

.preview-meta {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
  margin-bottom: 20px;
  padding: 16px;
  background-color: #f9fafb;
  border-radius: 6px;
}

.preview-meta .meta-item {
  font-size: 0.875rem;
  color: #374151;
}

.preview-actions {
  display: flex;
  justify-content: center;
  margin: 20px 0;
  padding: 16px;
  background-color: #f9fafb;
  border-radius: 6px;
}

.preview-table {
  overflow-x: auto;
}

.preview-table table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

.preview-table th,
.preview-table td {
  padding: 8px 12px;
  text-align: left;
  border-bottom: 1px solid #e5e7eb;
}

.preview-table th {
  background-color: #f9fafb;
  font-weight: 600;
  color: #374151;
}

.preview-table tbody tr:hover {
  background-color: #f9fafb;
}

/* Report Preview Section Styles */
.report-preview-section {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  margin: 24px 0;
  overflow: hidden;
}

.preview-header {
  padding: 24px;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
}

.preview-header h3 {
  margin: 0 0 16px 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
}

.preview-header .preview-meta {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
}

.preview-header .meta-item {
  font-size: 0.875rem;
  color: #374151;
}

.report-preview-section .preview-table {
  padding: 24px;
  overflow-x: auto;
}

.report-preview-section .preview-table table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

.report-preview-section .preview-table th,
.report-preview-section .preview-table td {
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid #e5e7eb;
}

.report-preview-section .preview-table th {
  background-color: #f9fafb;
  font-weight: 600;
  color: #374151;
}

.report-preview-section .preview-table tbody tr:hover {
  background-color: #f9fafb;
}

/* Table Header and Controls */
.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 12px 0;
  border-bottom: 1px solid #e5e7eb;
}

.table-info {
  font-size: 0.875rem;
  color: #6b7280;
}

.table-controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.page-size-select {
  padding: 6px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  background: white;
  color: #374151;
}

.page-size-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Pagination Styles */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 20px;
  padding: 16px 0;
}

.pagination-btn {
  padding: 8px 16px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
  color: #374151;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.pagination-btn:hover:not(:disabled) {
  background: #f9fafb;
  border-color: #9ca3af;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-info {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
}

</style>