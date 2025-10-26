<template>
  <SidebarLayout page-title="Admin Dashboard">
    <div class="admin-dashboard">
      <!-- Stats Filter Section -->
      <section class="stats-filter">
        <div class="filter-controls">
          <h3>Statistics Overview</h3>
          <div class="filter-buttons">
            <button 
              v-for="period in filterPeriods" 
              :key="period.value"
              @click="selectedPeriod = period.value"
              :class="['filter-btn', { active: selectedPeriod === period.value }]"
            >
              {{ period.label }}
            </button>
          </div>
        </div>
      </section>

      <!-- Stats Grid -->
      <section class="stats-grid">
        <article 
          class="stat-card" 
          v-for="(stat, index) in statsConfig" 
          :key="index" 
          :aria-label="stat.label"
          :class="stat.colorClass"
        >
          <div class="stat-border"></div>
          <div class="stat-icon" v-html="stat.iconSvg" aria-hidden="true"></div>
          
          <div class="stat-content">
            <p class="stat-title">{{ stat.label }}</p>
            <p class="stat-value" :class="stat.valueColorClass">{{ stat.value }}</p>
            <p class="stat-trend" :class="stat.trend?.type">
				<!-- Up Arrow -->
				<svg v-if="stat.trend?.type === 'up'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<polyline points="7 17 17 7"></polyline>
					<line x1="7" y1="7" x2="17" y2="7"></line>
					<line x1="17" y1="7" x2="17" y2="17"></line>
				</svg>

				<!-- Down Arrow -->
				<svg v-else-if="stat.trend?.type === 'down'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<polyline points="17 7 7 17"></polyline>
					<line x1="7" y1="17" x2="17" y2="17"></line>
					<line x1="7" y1="7" x2="7" y2="17"></line>
				</svg>

				<!-- Neutral Arrow -->
				<svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<line x1="6" y1="12" x2="18" y2="12"></line>
					<polyline points="12 6 18 12 12 18"></polyline>
				</svg>

				<span>{{ stat.trend?.value }}</span>
				</p>
          </div>

          <div class="stat-arrow" aria-hidden="true">
            <svg width="20" height="20" fill="none" stroke="#94a3b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </div>
        </article>
      </section>

      <!-- Main Content Grid -->
      <section class="content-grid">
        <!-- Trends Chart -->
        <section class="chart-card" aria-label="Violation Trends">
          <!-- Update your chart header section -->
          <header class="card-header">
            <h3>Violation Trends</h3>
            <div class="chart-controls">
              <!-- Chart period buttons -->
              <div class="control-group">
                <button 
                  v-for="period in chartPeriods" 
                  :key="period.value"
                  @click="selectedChartPeriod = period.value"
                  :class="['control-btn', { active: selectedChartPeriod === period.value }]"
                >
                  {{ period.label }}
                </button>
              </div>
              
              <!-- Year picker (only show when monthly is selected) -->
              <div v-if="selectedChartPeriod === 'monthly'" class="year-picker">
                <select 
                  v-model="selectedYear" 
                  class="year-select"
                  aria-label="Select Year"
                >
                  <option v-for="year in availableYears" :key="year" :value="year">
                    {{ year }}
                  </option>
                </select>
              </div>
            </div>
          </header>
          <div class="chart-container">
            <div v-if="chartData.length" class="chart-wrapper">
              <!-- Chart Content -->
              <div class="chart-bars">
                <div 
                  v-for="(data, index) in chartData" 
                  :key="index"
                  class="chart-bar"
                  @mouseenter="showTooltip($event, data)"
                  @mouseleave="hideTooltip"
                >
                  <div 
                    class="bar-fill"
                    :class="getBarColorClass(data.count)"
                    :style="{ 
                      height: `${(data.count / maxChartCount) * 100}%`,
                      minHeight: data.count > 0 ? '4px' : '0px'
                    }"
                  ></div>
                  <div class="bar-label">{{ formatChartLabel(data, selectedChartPeriod) }}</div>
                </div>
              </div>
              
              <!-- Y-Axis -->
              <div class="chart-axis">
                <span v-for="tick in yAxisTicks" :key="tick">{{ tick }}</span>
              </div>
              
              <!-- Tooltip -->
              <div 
                v-if="tooltip.visible" 
                class="chart-tooltip"
                :style="{ left: tooltip.x + 'px', top: tooltip.y + 'px' }"
              >
                {{ tooltip.content }}
              </div>
            </div>
            <div v-else class="empty-state">
              <svg width="48" height="48" fill="none" stroke="#94a3b8" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M3 3v18h18"></path>
                <path d="m19 9-5 5-4-4-3 3"></path>
              </svg>
              <p>No data available for the selected period</p>
            </div>
          </div>
        </section>

        <!-- Common Violations -->
        <section class="violations-card" aria-label="Top Violations">
          <header class="card-header">
            <h3>Top 5 Violations</h3>
          </header>
          <div class="violations-list">
            <article 
              v-for="(violation, index) in commonViolations.slice(0, 5)" 
              :key="violation.id"
              class="violation-item"
              tabindex="0"
              :aria-label="`${violation.name}, ${violation.transactions_count} cases, ₱${formatCurrency(violation.fine_amount)} fine`"
            >
              <div class="violation-rank">{{ index + 1 }}</div>
              <div class="violation-info">
                <p class="violation-name">{{ violation.name }}</p>
                <p class="violation-stats">
                  <span class="cases">{{ violation.transactions_count }} cases</span>
                  <span class="amount">₱{{ formatCurrency(violation.fine_amount) }}</span>
                </p>
              </div>
              <div class="violation-progress" aria-hidden="true">
                <div 
                  class="progress-fill"
                  :style="{ width: `${(violation.transactions_count / maxViolationCount) * 100}%` }"
                ></div>
              </div>
            </article>
            <div v-if="commonViolations.length === 0" class="empty-state">
              <svg width="40" height="40" fill="none" stroke="#94a3b8" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <path d="M12 17h.01"></path>
              </svg>
              <p>No violations data</p>
            </div>
          </div>
        </section>
      </section>

      <!-- Enforcer Performance -->
      <section class="performance-card" aria-label="Enforcer Performance">
        <header class="card-header">
          <div>
            <h3>Enforcer Performance</h3>
            <p class="subtitle">Track team productivity and activity</p>
          </div>
          <div class="performance-controls">
            <button 
              @click="showEditTargetModal = true"
              class="edit-target-btn"
              aria-label="Edit Target"
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 20h9"></path>
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
              </svg>
              Target: {{ performanceTarget }}
            </button>
          </div>
        </header>
        <div class="table-wrapper">
          <table class="modern-table" role="table">
            <thead>
              <tr>
                <th scope="col">Enforcer</th>
                <th scope="col">Total Cases</th>
                <th scope="col">This {{ getPeriodLabel(selectedChartPeriod) }}</th>
                <th scope="col">Status</th>
                <th scope="col">Last Active</th>
                <th scope="col">Performance</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="enforcer in paginatedEnforcers" :key="enforcer.id" class="table-row" tabindex="0">
                <td>
                  <div class="enforcer-cell">
                    <div class="avatar" aria-hidden="true">
                      <img 
                        v-if="enforcer.image" 
                        :src="`http://127.0.0.1:8000/storage/${enforcer.image}`" 
                        :alt="`${enforcer.first_name} ${enforcer.last_name}`"
                      />
                      <span v-else class="avatar-initials">
                        {{ getInitials(enforcer.first_name, enforcer.last_name) }}
                      </span>
                    </div>
                    <div class="enforcer-details">
                      <p class="enforcer-name">{{ enforcer.first_name }} {{ enforcer.last_name }}</p>
                      <p class="enforcer-email">{{ enforcer.email }}</p>
                    </div>
                  </div>
                </td>
                <td><span class="metric-number">{{ enforcer.transactions?.length || 0 }}</span></td>
                <td>
                  <div class="metric-bar" aria-label="Apprehensions progress">
                    <div 
                      class="metric-fill"
                      :style="{ width: `${Math.min((getPeriodApprehensions(enforcer.transactions) / performanceTarget) * 100, 100)}%` }"
                    ></div>
                  </div>
                  <span class="metric-number">{{ getPeriodApprehensions(enforcer.transactions) || 0 }}</span>
                </td>
                <td>
                  <span class="status-pill" :class="`status-${enforcer.status?.toLowerCase()}`" :aria-label="enforcer.status">
                    <span class="status-dot"></span>
                    {{ enforcer.status }}
                  </span>
                </td>
                <td><time :datetime="enforcer.updated_at">{{ formatDate(enforcer.updated_at) }}</time></td>
                <td>
                  <div class="performance-score" :class="getPerformanceClass(enforcer.transactions?.length || 0)">
                    {{ getPerformanceScore(enforcer.transactions?.length || 0) }}%
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
          <div v-if="enforcerPerformance.length === 0" class="empty-state">
            <svg width="48" height="48" fill="none" stroke="#94a3b8" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="8.5" cy="7" r="4"></circle>
            </svg>
            <p>No enforcer data available</p>
          </div>
          
          <!-- Pagination Controls -->
          <div v-if="enforcerPerformance.length > 6" class="pagination-controls">
            <div class="pagination-info">
              Showing {{ (currentPage - 1) * 6 + 1 }} to {{ Math.min(currentPage * 6, enforcerPerformance.length) }} of {{ enforcerPerformance.length }} enforcers
            </div>
            <div class="pagination-buttons">
              <button 
                @click="previousPage" 
                :disabled="currentPage === 1"
                class="pagination-btn"
                :class="{ disabled: currentPage === 1 }"
              >
                <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
                Previous
              </button>
              <span class="page-info">{{ currentPage }} of {{ totalPages }}</span>
              <button 
                @click="nextPage" 
                :disabled="currentPage === totalPages"
                class="pagination-btn"
                :class="{ disabled: currentPage === totalPages }"
              >
                Next
                <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </section><br>

      <!-- Unsettled Payments Section -->
      <section class="dashboard-grid">
        <!-- Unsettled Violators Card -->
        <section class="unsettled-card" aria-label="Unsettled Payments">
          <header class="card-header">
            <div class="header-content">
              <svg class="header-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <path d="M12 17h.01"></path>
              </svg>
              <div class="header-text">
                <h3>Unsettled Payments</h3>
                <p class="header-subtitle">Total {{ unsettledViolators ? unsettledViolators.length : 0 }} Violators (3-5 Days Pending)</p>
              </div>
            </div>
            <div class="header-badges">
              <span class="badge badge-warning">Total {{ unsettledViolators ? unsettledViolators.length : 0 }} Violators</span>
              <span class="badge badge-date">{{ getCurrentDate() }}</span>
            </div>
          </header>
          
          <!-- Debug info -->
          <div v-if="!unsettledViolators" style="padding: 10px; background: #f0f0f0; margin: 10px 0; border-radius: 4px;">
            <p>Debug: unsettledViolators is {{ unsettledViolators }}</p>
            <p v-if="debugInfo">Pending transactions in DB: {{ debugInfo.pending_transactions_count }}</p>
            <p v-if="debugInfo">Unsettled violators found: {{ debugInfo.unsettled_violators_count }}</p>
          </div>
          
      
          <div v-else-if="unsettledViolators.length === 0" class="empty-state">
            <svg width="40" height="40" fill="none" stroke="#94a3b8" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M9 12l2 2 4-4"></path>
              <circle cx="12" cy="12" r="10"></circle>
            </svg>
            <p>No unsettled payments found - all violators have paid their fines!</p>
          </div>
          
          <div v-else class="violators-list">
            <article 
              v-for="(violator, index) in unsettledViolators.slice(0, 10)" 
              :key="violator.id"
              class="violator-item"
              :class="`urgency-${violator.urgency_level}`"
              tabindex="0"
              :aria-label="`${violator.name}, ${violator.pending_count} pending payments, ₱${violator.total_amount.toLocaleString()} total`"
            >
              <div class="violator-rank">{{ index + 1 }}</div>
              <div class="violator-info">
                <p class="violator-name">{{ violator.name }}</p>
                <p class="violator-stats">
                  <span class="cases">{{ violator.pending_count }} pending</span>
                  <span class="amount">₱{{ violator.total_amount.toLocaleString() }}</span>
                </p>
                <p class="violator-date">
                  <span class="apprehension-date" :class="getDelayClass(violator.days_pending)">
                    {{ getDelayText(violator.days_pending, violator.apprehension_date) }}
                  </span>
                </p>
              </div>
              <div class="violator-progress" aria-hidden="true">
                <div 
                  class="progress-fill"
                  :class="`urgency-${violator.urgency_level}`"
                  :style="{ width: `${Math.min((violator.total_amount / 10000) * 100, 100)}%` }"
                ></div>
              </div>
            </article>
          </div>
        </section>

        <!-- Violation Heatmap Card -->
        <section class="heatmap-card" aria-label="Violation Heatmap">
          <header class="card-header">
            <div class="header-content">
              <div class="header-text">
              <h3>Violation Heatmap</h3>
              </div>
            </div>
            <div class="header-actions">
              <div class="view-toggle">
                <button 
                  @click="visualizationMode = 'markers'" 
                  :class="['view-btn', { active: visualizationMode === 'markers' }]"
                  title="Marker View"
                >
                  <span>Markers</span>
                </button>
                <button 
                  @click="visualizationMode = 'clusters'" 
                  :class="['view-btn', { active: visualizationMode === 'clusters' }]"
                  title="Cluster View"
                >
                  <span>Clusters</span>
                </button>
              </div>
              <div class="stats-badges">
                <div class="stat-badge">
                  <span class="stat-number">{{ locationHeatmap ? locationHeatmap.length : 0 }}</span>
                  <span class="stat-label">Locations</span>
                </div>
                <div class="stat-badge">
                  <span class="stat-number">{{ totalViolationsCount }}</span>
                  <span class="stat-label">Violations</span>
                </div>
              </div>
            </div>
          </header>
          
          <div v-if="!locationHeatmap || locationHeatmap.length === 0" class="empty-state">
            <div class="empty-icon">
              <svg width="48" height="48" fill="none" stroke="#94a3b8" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
            </div>
            <h4>No Location Data</h4>
            <p>No violation location data is currently available. Check back later for updates.</p>
          </div>
          
          <div v-else class="heatmap-container">
            <div class="map-wrapper">
              <div id="violation-map" class="violation-map"></div>
            </div>
            
            <!-- Modern Legend -->
            <div class="legend-panel">
              <div class="legend-header">
                <h4>Legend</h4>
                <div class="legend-mode">{{ visualizationMode.charAt(0).toUpperCase() + visualizationMode.slice(1) }} View</div>
              </div>
              
              <div class="legend-content">
              <!-- Heatmap Mode Legend -->
              <div v-if="visualizationMode === 'heatmap'" class="legend-section">
                <div class="legend-title">Violation Intensity</div>
                  <div class="intensity-scale">
                    <div class="scale-bar">
                      <div class="scale-gradient"></div>
                    </div>
                    <div class="scale-labels">
                      <span>Low</span>
                      <span>Medium</span>
                      <span>High</span>
                      <span>Critical</span>
                    </div>
                    <div class="scale-values">
                      <span>1-20</span>
                      <span>21-50</span>
                      <span>51-100</span>
                      <span>100+</span>
                  </div>
                </div>
              </div>
              
              <!-- Marker Mode Legend -->
              <div v-else-if="visualizationMode === 'markers'" class="legend-section">
                  <div class="legend-title">Violation Intensity</div>
                  <div class="marker-legend">
                    <div class="legend-row">
                      <div class="marker-sample intensity-low"></div>
                    <span>Low (1-20)</span>
                  </div>
                    <div class="legend-row">
                      <div class="marker-sample intensity-medium"></div>
                    <span>Medium (21-50)</span>
                  </div>
                    <div class="legend-row">
                      <div class="marker-sample intensity-high"></div>
                    <span>High (51-100)</span>
                  </div>
                    <div class="legend-row">
                      <div class="marker-sample intensity-critical"></div>
                    <span>Critical (100+)</span>
                  </div>
                </div>
              </div>
              
              <!-- Cluster Mode Legend -->
              <div v-else class="legend-section">
                  <div class="legend-title">Cluster Sizes</div>
                  <div class="cluster-legend">
                    <div class="legend-row">
                      <div class="cluster-sample cluster-small">5</div>
                      <span>Small (2-10)</span>
                  </div>
                    <div class="legend-row">
                      <div class="cluster-sample cluster-medium">25</div>
                      <span>Medium (11-50)</span>
                  </div>
                    <div class="legend-row">
                      <div class="cluster-sample cluster-large">75</div>
                      <span>Large (50+)</span>
                  </div>
                </div>
                  <p class="legend-note">Click clusters to zoom and explore</p>
              </div>
            </div>
          </div>
          
            <!-- Fullscreen Button at Bottom -->
          <div class="heatmap-footer">
            <button 
              @click="openFullscreenMap" 
              class="fullscreen-btn"
              title="Open Fullscreen Map"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
              </svg>
                <span>Fullscreen</span>
            </button>
            </div>
          </div>
        </section>
      </section>

      <!-- Quick Actions -->
      <section class="actions-section" aria-label="Quick Actions">
        <h3 class="section-title">Quick Actions</h3>
        <div class="actions-grid">
          <router-link to="/admin/users" class="action-card" aria-label="Manage Users">
            <div class="action-icon users" aria-hidden="true">
              <svg width="24" height="24" fill="none" stroke="#2563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="8.5" cy="7" r="4"></circle>
                <line x1="20" y1="8" x2="20" y2="14"></line>
                <line x1="23" y1="11" x2="17" y2="11"></line>
              </svg>
            </div>
            <div class="action-content">
              <p class="action-title">Manage Users</p>
              <p class="action-desc">Add, edit, or remove system users</p>
            </div>
            <div class="action-arrow" aria-hidden="true">
              <svg width="20" height="20" fill="none" stroke="#94a3b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </div>
          </router-link>

          <router-link to="/admin/violations" class="action-card" aria-label="Violation Types">
            <div class="action-icon violations" aria-hidden="true">
              <svg width="24" height="24" fill="none" stroke="#2563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <path d="M12 17h.01"></path>
              </svg>
            </div>
            <div class="action-content">
              <p class="action-title">Violation Types</p>
              <p class="action-desc">Manage categories and fine amounts</p>
            </div>
            <div class="action-arrow" aria-hidden="true">
              <svg width="20" height="20" fill="none" stroke="#94a3b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </div>
          </router-link>

          <router-link to="/admin/reports" class="action-card" aria-label="Reports">
            <div class="action-icon reports" aria-hidden="true">
              <svg width="24" height="24" fill="none" stroke="#2563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
            </div>
            <div class="action-content">
              <p class="action-title">Reports</p>
              <p class="action-desc">Generate detailed system reports</p>
            </div>
            <div class="action-arrow" aria-hidden="true">
              <svg width="20" height="20" fill="none" stroke="#94a3b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </div>
          </router-link>

          <router-link to="/admin/transactions" class="action-card" aria-label="Transactions">
            <div class="action-icon transactions" aria-hidden="true">
              <svg width="24" height="24" fill="none" stroke="#2563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="12 2 15 9 22 9 16 14 18 21 12 17 6 21 8 14 2 9 9 9" />
            </svg>
            </div>
            <div class="action-content">
              <p class="action-title">Transactions</p>
              <p class="action-desc">View and manage all transactions</p>
            </div>
            <div class="action-arrow" aria-hidden="true">
              <svg width="20" height="20" fill="none" stroke="#94a3b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </div>
          </router-link>

          <router-link to="/admin/notifications" class="action-card" aria-label="Notifications">
            <div class="action-icon notifications" aria-hidden="true">
              <svg width="24" height="24" fill="none" stroke="#2563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
              </svg>
            </div>
            <div class="action-content">
              <p class="action-title">Notifications</p>
              <p class="action-desc">Send alerts and updates</p>
            </div>
            <div class="action-arrow" aria-hidden="true">
              <svg width="20" height="20" fill="none" stroke="#94a3b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </div>
          </router-link>

          <router-link to="/admin/archives" class="action-card" aria-label="Archives">
            <div class="action-icon archives" aria-hidden="true">
              <svg width="24" height="24" fill="none" stroke="#2563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="21 8 21 21 3 21 3 8"></polyline>
                <rect x="1" y="3" width="22" height="5"></rect>
                <line x1="10" y1="12" x2="14" y2="12"></line>
              </svg>
            </div>
            <div class="action-content">
              <p class="action-title">Archives</p>
              <p class="action-desc">View archived records and data</p>
            </div>
            <div class="action-arrow" aria-hidden="true">
              <svg width="20" height="20" fill="none" stroke="#94a3b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </div>
          </router-link>
        </div>
      </section>

      <!-- Edit Target Modal -->
      <div v-if="showEditTargetModal" class="modal-overlay" @click="closeModal">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h3>Edit Performance Target</h3>
            <button @click="closeModal" class="close-btn">
              <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          <div class="modal-body">
            <label for="target-input">Target Cases per {{ getPeriodLabel(selectedChartPeriod) }}</label>
            <input 
              id="target-input"
              type="number" 
              v-model="newTarget" 
              min="1" 
              max="1000"
              class="target-input"
            >
          </div>
          <div class="modal-footer">
            <button @click="closeModal" class="cancel-btn">Cancel</button>
            <button @click="updateTarget" class="save-btn">Save Changes</button>
          </div>
        </div>
      </div>
    </div>
  </SidebarLayout>

  <!-- Fullscreen Map Modal -->
  <div v-if="showFullscreenMap" class="fullscreen-modal" @click="closeFullscreenMap">
    <div class="fullscreen-modal-content" @click.stop>
      <div class="fullscreen-header">
        <h3>Violation Heatmap - Fullscreen View</h3>
        <div class="fullscreen-controls">
          <div class="visualization-toggle">
            <button 
              @click="fullscreenVisualizationMode = 'markers'" 
              :class="['viz-btn', { active: fullscreenVisualizationMode === 'markers' }]"
              title="Marker View"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              Markers
            </button>
            <button 
              @click="fullscreenVisualizationMode = 'clusters'" 
              :class="['viz-btn', { active: fullscreenVisualizationMode === 'clusters' }]"
              title="Cluster View"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="3"></circle>
                <circle cx="6" cy="6" r="2"></circle>
                <circle cx="18" cy="6" r="2"></circle>
                <circle cx="6" cy="18" r="2"></circle>
                <circle cx="18" cy="18" r="2"></circle>
              </svg>
              Clusters
            </button>
          </div>
          <button @click="closeFullscreenMap" class="close-btn" title="Close Fullscreen">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>
      <div id="fullscreen-violation-map" class="fullscreen-map-container"></div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import SidebarLayout from '@/components/SidebarLayout.vue'
import { adminAPI } from '@/services/api'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
// Import marker cluster plugin
import 'leaflet.markercluster'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'

export default {
  name: 'AdminDashboard',
  components: {
    SidebarLayout
  },
  setup() {
    const loading = ref(true)
    const stats = ref({})
    const commonViolations = ref([])
    const enforcerPerformance = ref([])
    const weeklyData = ref([])
    const monthlyData = ref([])
    const yearlyData = ref([])
    const trendsData = ref({})
    const unsettledViolators = ref([])
    const locationHeatmap = ref([])
    const debugInfo = ref(null)
    const isLocationPickerActive = ref(false)
    const tempLocationMarker = ref(null)
    
    // Visualization mode state
    const visualizationMode = ref('markers') // 'markers', 'clusters'
    let markerLayer = null
    let clusterLayer = null
    
    // Fullscreen modal state
    const showFullscreenMap = ref(false)
    const fullscreenVisualizationMode = ref('markers')
    let fullscreenMap = null
    let fullscreenMarkerLayer = null
    let fullscreenClusterLayer = null
    
    // Map style tracking
    const currentMapStyle = ref('streets')
    let mapStyles = null
    let fullscreenMapStyles = null
    
    // Filter states
    const selectedPeriod = ref('month')
    const selectedChartPeriod = ref('monthly')
    const performanceTarget = ref(parseInt(localStorage.getItem('admin_performance_target')) || 30)
    const newTarget = ref(5)
    const showEditTargetModal = ref(false)
    const selectedYear = ref(new Date().getFullYear())
    
    // Pagination for enforcer performance
    const currentPage = ref(1)
    const itemsPerPage = 6
    
    // Filter options
    const filterPeriods = [
      { label: 'All Time', value: 'all' },
      { label: 'This Year', value: 'year' },
      { label: 'This Month', value: 'month' },
      { label: 'This Week', value: 'week' },
      { label: 'Today', value: 'today' }
    ]
    
    const chartPeriods = [
      { label: 'Monthly', value: 'monthly' },
      { label: 'Yearly', value: 'yearly' }
    ]
    
    const statsConfig = computed(() => {
    const percentage = trendsData.value.transactions?.percentage || 0
		const direction = trendsData.value.transactions?.direction || '0'
		const trendDisplay = `${percentage > 0 ? '+' : ''}${percentage}%`
      
      return [
        {
          iconSvg: `
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="7" r="4"></circle>
              <path d="M5.5 21a6.5 6.5 0 0 1 13 0"></path>
            </svg>`,
          value: stats.value.total_violators || 0,
          label: 'Total Violators',
          trend: direction !== '0' 
        ? { type: direction, value: trendDisplay } 
        : { type: null, value: '0%' },
          colorClass: 'stat-blue',
          
        },
        {
          iconSvg: `
             <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14,2 14,8 20,8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10,9 9,9 8,9"></polyline>
            </svg>`,
          value: stats.value.total_transactions || 0,
          label: 'Total Transactions',
          trend: direction !== '0' 
        ? { type: direction, value: trendDisplay } 
        : { type: null, value: '0%' },
          colorClass: 'stat-blue'
        },
        {
          iconSvg: `
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12" y2="16"></line>
            </svg>`,
          value: stats.value.pending_transactions || 0,
          label: 'Pending Payments',
			trend: direction !== '0' 
        ? { type: direction, value: trendDisplay } 
        : { type: null, value: '0%' },
          colorClass: 'stat-yellow'
        },
        {
          iconSvg: `
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M9 12l2 2 4-4"></path>
            </svg>`,
          value: stats.value.paid_transactions || 0,
          label: 'Paid Transactions',
				trend: direction !== '0' 
        ? { type: direction, value: trendDisplay } 
        : { type: null, value: '0%' },
          colorClass: 'stat-green'
        },
        {
          iconSvg: `
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M6 3v18"></path>
              <path d="M6 3h7a4 4 0 0 1 0 8H6"></path>
              <line x1="3" y1="6" x2="18" y2="6"></line>
              <line x1="3" y1="9" x2="18" y2="9"></line>
            </svg>`,
          value: `₱${formatCurrency(stats.value.total_revenue || 0)}`,
          label: 'Total Revenue',
			trend: direction !== '0' 
        ? { type: direction, value: trendDisplay } 
        : { type: null, value: '0%' },
          colorClass: 'stat-green',
          valueColorClass: 'text-green-600'
        },
        {
          iconSvg: `
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M6 3v18"></path>
              <path d="M6 3h7a4 4 0 0 1 0 8H6"></path>
              <line x1="3" y1="6" x2="18" y2="6"></line>
              <line x1="3" y1="9" x2="18" y2="9"></line>
            </svg>`,
          value: `₱${formatCurrency(stats.value.pending_revenue || 0)}`,
          label: 'Pending Revenue',
			trend: direction !== '0' 
        ? { type: direction, value: trendDisplay } 
        : { type: null, value: '0%' },
          colorClass: 'stat-purple',
          valueColorClass: 'text-green-600'
        },
        {
           iconSvg: `
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <path d="M12 17h.01"></path>
          </svg>`,
          value: stats.value.repeat_offenders || 0,
          label: 'Repeat Offenders',
			trend: direction !== '0' 
        ? { type: direction, value: trendDisplay } 
        : { type: null, value: '0%' },
          colorClass: 'stat-red'
        },
        {
          iconSvg: `
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>`,
          value: stats.value.active_enforcers || 0,
          label: 'Active Enforcers',
			trend: direction !== '0' 
        ? { type: direction, value: trendDisplay } 
        : { type: null, value: '0%' },
          colorClass: 'stat-cyan'
        }
      ]
    })

    const availableYears = computed(() => {
      if (!monthlyData.value.length) return [new Date().getFullYear()]
      return [...new Set(monthlyData.value.map(item => item.year))].sort((a, b) => b - a)
    })
    
    // Pagination computed properties
    const totalPages = computed(() => {
      return Math.ceil(enforcerPerformance.value.length / itemsPerPage)
    })
    
    const paginatedEnforcers = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage
      const end = start + itemsPerPage
      return enforcerPerformance.value.slice(start, end)
    })
    
    const chartData = computed(() => {
  switch (selectedChartPeriod.value) {
    case 'monthly':
      return monthlyData.value
        .filter(item => item.year === selectedYear.value)
        .map(item => ({
          ...item,
          date: `${item.year}-${String(item.month).padStart(2, '0')}-01`,
          period: item.month
        }))
    case 'yearly':
      return yearlyData.value.map(item => ({
        ...item,
        date: `${item.year}-01-01`,
        period: item.year
      }))
    default:
      return weeklyData.value
  }
})
    
    const maxChartCount = computed(() => {
      return Math.max(...chartData.value.map(d => d.count), 1)
    })

    // Heatmap statistics
    const totalViolationsCount = computed(() => {
      if (!locationHeatmap.value || locationHeatmap.value.length === 0) return 0
      return locationHeatmap.value.reduce((sum, location) => sum + location.count, 0)
    })

    const totalFinesAmount = computed(() => {
      if (!locationHeatmap.value || locationHeatmap.value.length === 0) return 0
      return locationHeatmap.value.reduce((sum, location) => sum + parseFloat(location.total_amount || 0), 0)
    })

    const hottestLocation = computed(() => {
      if (!locationHeatmap.value || locationHeatmap.value.length === 0) return null
      return locationHeatmap.value.reduce((max, location) => 
        location.count > (max?.count || 0) ? location : max
      , null)
    })
    
    const maxViolationCount = computed(() => {
      return Math.max(...commonViolations.value.map(v => v.transactions_count), 1)
    })
    
    const yAxisTicks = computed(() => {
      const max = maxChartCount.value
      return [max, Math.floor(max * 0.75), Math.floor(max * 0.5), Math.floor(max * 0.25), 0]
    })
    
    const loadDashboardData = async () => {
      try {
        loading.value = true

        const requestParams = {
      period: selectedPeriod.value,
      chart_period: selectedChartPeriod.value
    }

    
    const response = await adminAPI.dashboard(requestParams)
    
        if (response.data.status === 'success') {
          const data = response.data.data
          console.log('Dashboard data received:', data)
          console.log('Unsettled violators:', data.unsettled_violators)
          stats.value = data.stats || {}
          commonViolations.value = data.common_violations || []
          enforcerPerformance.value = data.enforcer_performance || []
          weeklyData.value = data.weekly_trends || []
          monthlyData.value = data.monthly_trends || []
          yearlyData.value = data.yearly_trends || []
          trendsData.value = data.trends || {}
          unsettledViolators.value = data.unsettled_violators || []
          locationHeatmap.value = data.location_heatmap || []
          debugInfo.value = data.debug_info || null
          console.log('Unsettled violators set to:', unsettledViolators.value)
          console.log('🔍 DEBUG: First violator data:', unsettledViolators.value[0])
          console.log('Location heatmap:', locationHeatmap.value)
          console.log('Debug info:', debugInfo.value)
          
          // Debug: Log each location item
          if (locationHeatmap.value && locationHeatmap.value.length > 0) {
            console.log('🔍 Location heatmap details:')
            locationHeatmap.value.forEach((location, index) => {
              console.log(`Location ${index + 1}:`, {
                name: location.location,
                coordinates: `${location.gps_latitude}, ${location.gps_longitude}`,
                count: location.count
              })
            })
          }
        }
      } catch (error) {
        console.error('Failed to load dashboard data:', error)
      } finally {
        loading.value = false
      }
    }

    const getPeriodApprehensions = (transactions) => {
      if (!transactions || !Array.isArray(transactions)) return 0
      
      const now = new Date()
      
      return transactions.filter(t => {
        const date = new Date(t.date_time)
        
        if (selectedChartPeriod.value === 'monthly') {
          return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
        } else if (selectedChartPeriod.value === 'yearly') {
          return date.getFullYear() === now.getFullYear()
        } else {
          // Weekly - last 7 days
          const weekAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000))
          return date >= weekAgo && date <= now
        }
      }).length
    }

    const formatCurrency = (amount) => {
      return new Intl.NumberFormat('en-PH').format(amount || 0)
    }

    const getDelayText = (daysPending, apprehensionDate) => {
      console.log('🔍 DEBUG: getDelayText called with:', { daysPending, apprehensionDate })
      
      if (daysPending === null || daysPending === undefined) {
        console.log('🔍 DEBUG: daysPending is null/undefined, returning apprehension date')
        return `Apprehended: ${apprehensionDate || 'N/A'}`
      }
      
      if (daysPending >= 5) {
        return `${daysPending} days delay`
      } else if (daysPending >= 3) {
        return `${daysPending} days delay`
      } else if (daysPending > 0) {
        return `${daysPending} day${daysPending > 1 ? 's' : ''} delay`
      } else if (daysPending === 0) {
        return 'Today'
      } else {
        return `Apprehended: ${apprehensionDate || 'N/A'}`
      }
    }

    const getDelayClass = (daysPending) => {
      if (daysPending >= 5) {
        return 'delay-critical'
      } else if (daysPending >= 3) {
        return 'delay-warning'
      } else if (daysPending > 0) {
        return 'delay-info'
      } else {
        return 'delay-normal'
      }
    }
    
    const formatDate = (dateString) => {
      if (!dateString) return 'Never'
      return new Date(dateString).toLocaleDateString('en-PH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    }

    const getCurrentDate = () => {
      const now = new Date()
      return now.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    }

    const getHeatmapIntensity = (count) => {
      if (count >= 1 && count <= 20) return { label: 'Low', color: '#22c55e' } // Green
      if (count >= 21 && count <= 50) return { label: 'Medium', color: '#f97316' } // Orange  
      if (count >= 51 && count <= 100) return { label: 'High', color: '#ef4444' } // Red
      if (count > 100) return { label: 'Critical', color: '#a855f7' } // Purple
      return { label: 'None', color: '#6b7280' } // Gray
    }

    const getBarColorClass = (count) => {
      if (count === 0) return 'bar-color-none'
      if (count >= 1 && count <= 10) return 'bar-color-low' // Green
      if (count >= 11 && count <= 20) return 'bar-color-medium' // Orange
      if (count >= 21 && count <= 30) return 'bar-color-high' // Violet
      if (count >= 31) return 'bar-color-very-high' // Red
      return 'bar-color-default'
    }

    let map = null

    const initializeMap = () => {
      // Wait for DOM to be ready
      nextTick(() => {
        const mapElement = document.getElementById('violation-map')
        if (!mapElement || map) return

        // Initialize map centered on Echague, Isabela with smooth zoom
        map = L.map('violation-map', {
          center: [16.7058, 121.6670],
          zoom: 14,
          zoomControl: true,
          scrollWheelZoom: true,
          doubleClickZoom: true,
          dragging: true,
          animate: true,
          zoomAnimation: true,
          markerZoomAnimation: true,
          fadeAnimation: true
        })

        // Add multiple map style options - Dark theme with satellite hybrid
        mapStyles = {
          streets: L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/streets-v12/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoieXVqb2hucmF5IiwiYSI6ImNtaDczcG94MDBubGgybHNieml0ZmJ6bmwifQ.KRR3neB3mYayV6L8sN71uA', {
            attribution: '© Mapbox © OpenStreetMap',
            maxZoom: 20,
            tileSize: 512,
            zoomOffset: -1
          }),
          satellite: L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v12/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoieXVqb2hucmF5IiwiYSI6ImNtaDczcG94MDBubGgybHNieml0ZmJ6bmwifQ.KRR3neB3mYayV6L8sN71uA', {
            attribution: '© Mapbox',
            maxZoom: 20,
            tileSize: 512,
            zoomOffset: -1
          }),
          dark: L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/dark-v11/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoieXVqb2hucmF5IiwiYSI6ImNtaDczcG94MDBubGgybHNieml0ZmJ6bmwifQ.KRR3neB3mYayV6L8sN71uA', {
            attribution: '© Mapbox',
            maxZoom: 20,
            tileSize: 512,
            zoomOffset: -1
          }),
          outdoors: L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/outdoors-v12/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoieXVqb2hucmF5IiwiYSI6ImNtaDczcG94MDBubGgybHNieml0ZmJ6bmwifQ.KRR3neB3mYayV6L8sN71uA', {
            attribution: '© Mapbox',
            maxZoom: 20,
            tileSize: 512,
            zoomOffset: -1
          })
        }

        // Add default layer (streets for better marker visibility)
        mapStyles.streets.addTo(map)

        // Add layer control for switching between styles
        L.control.layers({
          'Satellite': mapStyles.satellite,
          'Streets': mapStyles.streets,
          'Dark Mode': mapStyles.dark,
          'Outdoors': mapStyles.outdoors
        }, {}, {
          position: 'topright',
          collapsed: false
        }).addTo(map)
        
        // Track map style changes
        map.on('baselayerchange', (e) => {
          const styleName = Object.keys(mapStyles).find(key => mapStyles[key] === e.layer)
          if (styleName) {
            currentMapStyle.value = styleName
            syncFullscreenMapStyle()
          }
        })

        // Add scale control
        L.control.scale({
          position: 'bottomleft',
          imperial: false,
          metric: true
        }).addTo(map)

        // Add custom zoom controls with better styling
        map.zoomControl.setPosition('topright')

        // Initialize all visualization layers
        if (locationHeatmap.value && locationHeatmap.value.length > 0) {
          console.log('Initializing layers after map is ready')
          initializeAllLayers()
          updateVisualization()
          
          // Auto-fit bounds to show all markers
          if (locationHeatmap.value.length > 1) {
            const bounds = L.latLngBounds(
              locationHeatmap.value
                .filter(loc => loc.gps_latitude && loc.gps_longitude)
                .map(loc => [parseFloat(loc.gps_latitude), parseFloat(loc.gps_longitude)])
            )
            map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 })
          }
        } else {
          console.log('No heatmap data available for initialization')
        }

        // Add current location marker (optional)
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition((position) => {
            const userLocation = [position.coords.latitude, position.coords.longitude]
            L.marker(userLocation, {
              icon: L.divIcon({
                className: 'user-location-marker',
                html: `
                  <div class="user-location-pulse">
                    <div class="user-location-dot"></div>
                  </div>
                `,
                iconSize: [30, 30],
                iconAnchor: [15, 15]
              })
            }).addTo(map)
              .bindPopup('<strong>Your Location</strong>')
          })
        }
      })
    }

    // Initialize all visualization layers (markers, clusters)
    const initializeAllLayers = () => {
      if (!map || !locationHeatmap.value) {
        console.log('Cannot initialize layers:', { hasMap: !!map, hasData: !!locationHeatmap.value })
        return
      }

      console.log('Initializing layers with data:', locationHeatmap.value)

      // Prepare data for all visualizations
      const validLocations = locationHeatmap.value.filter(
        loc => loc.gps_latitude && loc.gps_longitude
      )

      console.log('Valid locations:', validLocations)

      if (validLocations.length === 0) {
        console.log('No valid locations found')
        return
      }

      // 1. Initialize Marker Layer (regular markers)
      markerLayer = L.layerGroup()
      
      validLocations.forEach(location => {
        const coords = [
          parseFloat(location.gps_latitude),
          parseFloat(location.gps_longitude)
        ]
        
        const intensity = getHeatmapIntensity(location.count)
        
        // Dynamic circle size based on violation count - redesigned scale
        let radius = 6
        if (location.count >= 2 && location.count <= 5) radius = 10
        else if (location.count >= 6 && location.count <= 10) radius = 14
        else if (location.count >= 11 && location.count <= 20) radius = 18
        else if (location.count >= 21 && location.count <= 50) radius = 24
        else if (location.count >= 51 && location.count <= 100) radius = 30
        else if (location.count > 100) radius = 36
        
        // Dynamic color based on intensity
        const color = intensity.color

        // Create circle marker
        const marker = L.circleMarker(coords, {
          radius: radius,
          fillColor: color,
          color: '#ffffff',
          weight: 3,
          opacity: 1,
          fillOpacity: 0.8,
          className: 'pulsing-marker'
        })

        // Create popup (location name only shown when clicked)
        marker.bindPopup(`
          <div class="map-popup">
            <div class="popup-header">
              <h4>${location.location}</h4>
              <span class="intensity-badge intensity-${intensity.label.toLowerCase()}">${intensity.label}</span>
            </div>
            <div class="popup-stats">
              <div class="stat-row">
                <span class="stat-label">Violations:</span>
                <span class="stat-value">${location.count}</span>
              </div>
              <div class="stat-row">
                <span class="stat-label">Total Amount:</span>
                <span class="stat-value">₱${location.total_amount.toLocaleString()}</span>
              </div>
            </div>
            <div class="popup-location">
              <span class="stat-label">📍 Location:</span>
              <span class="stat-value">${location.location || 'Unknown Location'}</span>
            </div>
            ${location.gps_latitude && location.gps_longitude ? 
              `<div class="popup-gps">
                <span class="stat-label">🗺️ Coordinates:</span>
                <span class="stat-value">${parseFloat(location.gps_latitude).toFixed(6)}, ${parseFloat(location.gps_longitude).toFixed(6)}</span>
              </div>` : 
              '<div class="popup-gps"><span class="stat-label">🗺️ GPS:</span><span class="stat-value">Not available</span></div>'
            }
          </div>
        `)

        markerLayer.addLayer(marker)
      })

      // 2. Initialize Cluster Layer
      clusterLayer = L.markerClusterGroup({
        maxClusterRadius: 80,  // Increased radius for better clustering
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: true,  // Enable coverage on hover
        zoomToBoundsOnClick: true,
        disableClusteringAtZoom: 16,  // Disable clustering at high zoom levels
        spiderfyDistanceMultiplier: 1.5
      })

      validLocations.forEach(location => {
        const coords = [
          parseFloat(location.gps_latitude),
          parseFloat(location.gps_longitude)
        ]
        
        const intensity = getHeatmapIntensity(location.count)
        const color = intensity.color

        const marker = L.circleMarker(coords, {
          radius: 10,
          fillColor: color,
          color: '#ffffff',
          weight: 2,
          opacity: 1,
          fillOpacity: 0.9
        })

        marker.bindPopup(`
          <div class="map-popup">
            <div class="popup-header">
              <h4>${location.location}</h4>
              <span class="intensity-badge intensity-${intensity.label.toLowerCase()}">${intensity.label}</span>
            </div>
            <div class="popup-stats">
              <div class="stat-row">
                <span class="stat-label">Violations:</span>
                <span class="stat-value">${location.count}</span>
              </div>
              <div class="stat-row">
                <span class="stat-label">Total Amount:</span>
                <span class="stat-value">₱${location.total_amount.toLocaleString()}</span>
              </div>
            </div>
          </div>
        `)

        clusterLayer.addLayer(marker)
      })
    }

    // Update visualization based on selected mode
    const updateVisualization = () => {
      if (!map) {
        console.log('No map available for visualization update')
        return
      }

      console.log('Updating visualization, mode:', visualizationMode.value)
      console.log('Available layers:', {
        markerLayer: !!markerLayer,
        clusterLayer: !!clusterLayer
      })

      // Remove all layers
      if (markerLayer) map.removeLayer(markerLayer)
      if (clusterLayer) map.removeLayer(clusterLayer)

      // Add the selected layer
      if (visualizationMode.value === 'markers' && markerLayer) {
        console.log('Adding marker layer to map')
        map.addLayer(markerLayer)
      } else if (visualizationMode.value === 'clusters' && clusterLayer) {
        console.log('Adding cluster layer to map')
        map.addLayer(clusterLayer)
      } else {
        console.log('No layer to add for mode:', visualizationMode.value)
      }
    }

    // Watch for visualization mode changes
    watch(visualizationMode, () => {
      updateVisualization()
    })

    const updateMap = () => {
      if (map) {
        map.remove()
        map = null
      }
      initializeMap()
    }

    // Fullscreen map functions
    const openFullscreenMap = () => {
      console.log('Opening fullscreen map...')
      console.log('Current locationHeatmap data:', locationHeatmap.value)
      console.log('Data length:', locationHeatmap.value?.length)
      
      if (!locationHeatmap.value || locationHeatmap.value.length === 0) {
        console.log('No heatmap data available, cannot open fullscreen')
        return
      }
      
      showFullscreenMap.value = true
      fullscreenVisualizationMode.value = visualizationMode.value
      nextTick(() => {
        console.log('NextTick - initializing fullscreen map')
        // Add a small delay to ensure DOM is fully rendered
        setTimeout(() => {
        initializeFullscreenMap()
        }, 100)
      })
    }

    const closeFullscreenMap = () => {
      showFullscreenMap.value = false
      if (fullscreenMap) {
        fullscreenMap.remove()
        fullscreenMap = null
        fullscreenMarkerLayer = null
        fullscreenClusterLayer = null
      }
    }

    const initializeFullscreenMap = () => {
      const mapElement = document.getElementById('fullscreen-violation-map')
      console.log('Fullscreen map element:', mapElement)
      if (!mapElement || fullscreenMap) {
        console.log('Map element not found or map already exists')
        return
      }

      console.log('Initializing fullscreen map...')
      console.log('Location heatmap data:', locationHeatmap.value)
      console.log('Data length:', locationHeatmap.value?.length)
      // Initialize fullscreen map
      fullscreenMap = L.map('fullscreen-violation-map', {
        center: [16.7058, 121.6670],
        zoom: 14,
        zoomControl: true,
        scrollWheelZoom: true,
        doubleClickZoom: true,
        dragging: true,
        animate: true,
        zoomAnimation: true,
        markerZoomAnimation: true,
        fadeAnimation: true
      })
      
      console.log('Fullscreen map created:', fullscreenMap)

      // Add map styles
      fullscreenMapStyles = {
        streets: L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/streets-v12/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoieXVqb2hucmF5IiwiYSI6ImNtaDczcG94MDBubGgybHNieml0ZmJ6bmwifQ.KRR3neB3mYayV6L8sN71uA', {
          attribution: '© Mapbox © OpenStreetMap',
          maxZoom: 20,
          tileSize: 512,
          zoomOffset: -1
        }),
        satellite: L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v12/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoieXVqb2hucmF5IiwiYSI6ImNtaDczcG94MDBubGgybHNieml0ZmJ6bmwifQ.KRR3neB3mYayV6L8sN71uA', {
          attribution: '© Mapbox',
          maxZoom: 20,
          tileSize: 512,
          zoomOffset: -1
        }),
        dark: L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/dark-v11/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoieXVqb2hucmF5IiwiYSI6ImNtaDczcG94MDBubGgybHNieml0ZmJ6bmwifQ.KRR3neB3mYayV6L8sN71uA', {
          attribution: '© Mapbox',
          maxZoom: 20,
          tileSize: 512,
          zoomOffset: -1
        }),
        outdoors: L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/outdoors-v12/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoieXVqb2hucmF5IiwiYSI6ImNtaDczcG94MDBubGgybHNieml0ZmJ6bmwifQ.KRR3neB3mYayV6L8sN71uA', {
          attribution: '© Mapbox',
          maxZoom: 20,
          tileSize: 512,
          zoomOffset: -1
        })
      }

      // Add default layer using current style
      fullscreenMapStyles[currentMapStyle.value].addTo(fullscreenMap)

      // Add layer control
      L.control.layers({
        'Satellite': fullscreenMapStyles.satellite,
        'Streets': fullscreenMapStyles.streets,
        'Dark Mode': fullscreenMapStyles.dark,
        'Outdoors': fullscreenMapStyles.outdoors
      }, {}, {
        position: 'topright',
        collapsed: false
      }).addTo(fullscreenMap)

      // Add scale control
      L.control.scale({
        position: 'bottomleft',
        imperial: false,
        metric: true
      }).addTo(fullscreenMap)

      // Initialize fullscreen visualization layers
      if (locationHeatmap.value && locationHeatmap.value.length > 0) {
        console.log('Initializing fullscreen layers with data:', locationHeatmap.value.length, 'locations')
        initializeFullscreenLayers()
        updateFullscreenVisualization()
        
        // Auto-fit bounds
        if (locationHeatmap.value.length > 1) {
          const bounds = L.latLngBounds(
            locationHeatmap.value
              .filter(loc => loc.gps_latitude && loc.gps_longitude)
              .map(loc => [parseFloat(loc.gps_latitude), parseFloat(loc.gps_longitude)])
          )
          fullscreenMap.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 })
        }
      }
    }

    const initializeFullscreenLayers = () => {
      if (!fullscreenMap || !locationHeatmap.value || locationHeatmap.value.length === 0) {
        console.log('Cannot initialize fullscreen layers:', {
          hasMap: !!fullscreenMap,
          hasData: !!locationHeatmap.value,
          dataLength: locationHeatmap.value?.length
        })
        return
      }

      console.log('Initializing fullscreen layers with', locationHeatmap.value.length, 'locations')

      // Clear existing layers
      if (fullscreenMarkerLayer) fullscreenMap.removeLayer(fullscreenMarkerLayer)
      if (fullscreenClusterLayer) fullscreenMap.removeLayer(fullscreenClusterLayer)

      const validLocations = locationHeatmap.value.filter(loc => loc.gps_latitude && loc.gps_longitude)

      // Create marker layer
      const markers = validLocations.map(loc => {
          const intensity = getHeatmapIntensity(loc.count)
          // Dynamic circle size based on violation count - redesigned scale
          let radius = 6
          if (loc.count >= 2 && loc.count <= 5) radius = 10
          else if (loc.count >= 6 && loc.count <= 10) radius = 14
          else if (loc.count >= 11 && loc.count <= 20) radius = 18
          else if (loc.count >= 21 && loc.count <= 50) radius = 24
          else if (loc.count >= 51 && loc.count <= 100) radius = 30
          else if (loc.count > 100) radius = 36
          
          const marker = L.circleMarker([parseFloat(loc.gps_latitude), parseFloat(loc.gps_longitude)], {
            radius: radius,
            fillColor: intensity.color,
            color: '#ffffff',
            weight: 2,
            opacity: 0.8,
            fillOpacity: 0.7
          })

          marker.bindPopup(`
            <div class="marker-popup">
              <h4>${loc.location || 'Unknown Location'}</h4>
              <p><strong>Violations:</strong> ${loc.count || 0}</p>
              <p><strong>Fines:</strong> ₱${(loc.total_amount || 0).toLocaleString()}</p>
              <p><strong>Intensity:</strong> ${intensity.label}</p>
            </div>
          `)

          return marker
        })

      fullscreenMarkerLayer = L.layerGroup(markers)
      console.log('Created fullscreen marker layer with', markers.length, 'markers')

      // Create cluster layer using the same markers
      fullscreenClusterLayer = L.markerClusterGroup({
        chunkedLoading: true,
        maxClusterRadius: 80,  // Increased radius for better clustering
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: true,  // Enable coverage on hover
        zoomToBoundsOnClick: true,
        disableClusteringAtZoom: 16,  // Disable clustering at high zoom levels
        spiderfyDistanceMultiplier: 1.5
      })
      console.log('Created fullscreen cluster layer:', fullscreenClusterLayer)
      console.log('Adding', markers.length, 'markers to cluster layer')

      // Add the same markers to cluster layer
      markers.forEach((marker, index) => {
        fullscreenClusterLayer.addLayer(marker)
        console.log(`Added marker ${index + 1} to cluster layer`)
      })
      
      console.log('Cluster layer marker count:', fullscreenClusterLayer.getLayers().length)
      
      // Force cluster layer to refresh
      setTimeout(() => {
        console.log('Refreshing cluster layer...')
        fullscreenClusterLayer.refreshClusters()
        console.log('Cluster layer refreshed')
      }, 100)
    }

    const updateFullscreenVisualization = () => {
      if (!fullscreenMap) {
        console.log('No fullscreen map available')
        return
      }

      console.log('Updating fullscreen visualization, mode:', fullscreenVisualizationMode.value)
      console.log('Available layers:', {
        markerLayer: !!fullscreenMarkerLayer,
        clusterLayer: !!fullscreenClusterLayer
      })

      // Remove all layers
      if (fullscreenMarkerLayer) fullscreenMap.removeLayer(fullscreenMarkerLayer)
      if (fullscreenClusterLayer) fullscreenMap.removeLayer(fullscreenClusterLayer)

      // Add the selected layer
      if (fullscreenVisualizationMode.value === 'markers' && fullscreenMarkerLayer) {
        console.log('Adding marker layer to fullscreen map')
        fullscreenMap.addLayer(fullscreenMarkerLayer)
      } else if (fullscreenVisualizationMode.value === 'clusters' && fullscreenClusterLayer) {
        console.log('Adding cluster layer to fullscreen map')
        fullscreenMap.addLayer(fullscreenClusterLayer)
      } else {
        console.log('No layer to add for mode:', fullscreenVisualizationMode.value)
      }
    }

    // Watch for fullscreen visualization mode changes
    watch(fullscreenVisualizationMode, () => {
      updateFullscreenVisualization()
    })

    // Sync fullscreen map style with main map
    const syncFullscreenMapStyle = () => {
      if (fullscreenMap && fullscreenMapStyles) {
        // Remove current layer
        fullscreenMap.eachLayer((layer) => {
          if (layer instanceof L.TileLayer) {
            fullscreenMap.removeLayer(layer)
          }
        })
        
        // Add new layer
        fullscreenMapStyles[currentMapStyle.value].addTo(fullscreenMap)
      }
    }

    
    const formatChartLabel = (dataPoint, period) => {
      if (period === 'yearly') {
        return dataPoint.period || dataPoint.year
      } else if (period === 'monthly') {
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        const monthIndex = (dataPoint.period || dataPoint.month) - 1
        return monthNames[monthIndex] || 'Unknown'
      } else {
        // Weekly - format as date
        if (dataPoint.date) {
          const date = new Date(dataPoint.date)
          return date.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })
        }
        return 'Unknown'
      }
    }
    
    const getPeriodLabel = (period) => {
      switch (period) {
        case 'monthly': return 'Month'
        default: return 'Month'
      }
    }
    
    const getInitials = (firstName, lastName) => {
      return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase()
    }
    
    const getPerformanceScore = (count) => {
      if (!count) return 0
      return Math.min(Math.round((count / performanceTarget.value) * 100), 100)
    }
    
    const getPerformanceClass = (count) => {
      const score = getPerformanceScore(count)
      if (score >= 80) return 'excellent'
      if (score >= 60) return 'good'
      if (score >= 40) return 'average'
      return 'poor'
    }
    
    const tooltip = ref({
      visible: false,
      x: 0,
      y: 0,
      content: ''
    })

    const showTooltip = (event, data) => {
      const barRect = event.currentTarget.getBoundingClientRect()
      const containerRect = event.currentTarget.parentElement.getBoundingClientRect()

      tooltip.value = {
        visible: true,
        x: barRect.left - containerRect.left + barRect.width / 2,
        y: barRect.top - containerRect.top, 
        content: `${formatChartLabel(data, selectedChartPeriod.value)}: ${data.count} violations`
      }
    }

    const hideTooltip = () => {
      tooltip.value.visible = false
    }
    
    const updateTarget = () => {
      performanceTarget.value = parseInt(newTarget.value) || 5
      localStorage.setItem('admin_performance_target', performanceTarget.value.toString())
      showEditTargetModal.value = false
    }
    
    const closeModal = () => {
      showEditTargetModal.value = false
      newTarget.value = performanceTarget.value
    }
    
    // Pagination methods
    const nextPage = () => {
      if (currentPage.value < totalPages.value) {
        currentPage.value++
      }
    }
    
    const previousPage = () => {
      if (currentPage.value > 1) {
        currentPage.value--
      }
    }
    
    // Location picker methods
    const toggleLocationPicker = () => {
      isLocationPickerActive.value = !isLocationPickerActive.value
      
      if (isLocationPickerActive.value) {
        // Enable map click events for location picking
        if (map) {
          map.on('click', handleMapClick)
          map.getContainer().style.cursor = 'crosshair'
        }
      } else {
        // Disable map click events
        if (map) {
          map.off('click', handleMapClick)
          map.getContainer().style.cursor = ''
          // Remove temporary marker if exists
          if (tempLocationMarker.value) {
            map.removeLayer(tempLocationMarker.value)
            tempLocationMarker.value = null
          }
        }
      }
    }
    
    const handleMapClick = (e) => {
      if (!isLocationPickerActive.value) return
      
      const lat = e.latlng.lat
      const lng = e.latlng.lng
      
      // Remove existing temporary marker
      if (tempLocationMarker.value) {
        map.removeLayer(tempLocationMarker.value)
      }
      
      // Add new temporary marker with circle
      const marker = L.circleMarker([lat, lng], {
        radius: 8,
        fillColor: '#3b82f6',
        color: '#ffffff',
        weight: 3,
        opacity: 1,
        fillOpacity: 0.9
      }).addTo(map)
      
      const circle = L.circle([lat, lng], {
        radius: 100,
        color: '#3b82f6',
        weight: 2,
        opacity: 0.6,
        fillColor: '#3b82f6',
        fillOpacity: 0.1
      }).addTo(map)
      
      tempLocationMarker.value = L.layerGroup([marker, circle])
      
      // Show confirmation dialog
      if (confirm('Add this location to the heatmap?')) {
        addLocationToHeatmap(lat, lng)
        toggleLocationPicker()
      }
    }
    
    const addLocationToHeatmap = (lat, lng) => {
      // This would typically make an API call to add the location
      // For now, we'll just add it to the local array
      const newLocation = {
        location: `Custom Location ${Date.now()}`,
        count: 1,
        total_amount: 0,
        lat: lat,
        lng: lng
      }
      
      locationHeatmap.value.push(newLocation)
      
      // Update the map with the new location
      updateMap()
    }
    const handlePeriodChange = (period) => {
    selectedPeriod.value = period
      }

      watch([selectedPeriod, selectedChartPeriod], () => {
      loadDashboardData()
    })
    
    onMounted(() => {
      loadDashboardData()
      // Initialize map after a short delay to ensure DOM is ready
      setTimeout(() => {
        initializeMap()
      }, 1000)
    })

    // Watch for changes in location heatmap data
    watch(locationHeatmap, () => {
      if (locationHeatmap.value && locationHeatmap.value.length > 0) {
        updateMap()
      }
    }, { deep: true })
    
    return {
      loading,
      stats,
      commonViolations,
      enforcerPerformance,
      statsConfig,
      chartData,
      maxChartCount,
      maxViolationCount,
      yAxisTicks,
      selectedPeriod,
      selectedChartPeriod,
      filterPeriods,
      chartPeriods,
      performanceTarget,
      newTarget,
      showEditTargetModal,
      loadDashboardData,
      formatCurrency,
      formatDate,
      getCurrentDate,
      getHeatmapIntensity,
      getBarColorClass,
      initializeMap,
      updateMap,
      formatChartLabel,
      getPeriodLabel,
      getInitials,
      getPerformanceScore,
      getPerformanceClass,
      tooltip,
      showTooltip,
      hideTooltip,
      getPeriodApprehensions,
      updateTarget,
      closeModal,
      handlePeriodChange,
      selectedYear,
      availableYears,
      unsettledViolators,
      locationHeatmap,
      totalViolationsCount,
      totalFinesAmount,
      hottestLocation,
      debugInfo,
      visualizationMode,
      showFullscreenMap,
      fullscreenVisualizationMode,
      openFullscreenMap,
      closeFullscreenMap,
      syncFullscreenMapStyle,
      getDelayText,
      getDelayClass,
      currentPage,
      totalPages,
      paginatedEnforcers,
      nextPage,
      previousPage,
      isLocationPickerActive,
      toggleLocationPicker
    }
  }
}
</script>

<style scoped>
.admin-dashboard {
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

/* Stats Filter Section */
.stats-filter {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  padding: 24px 32px;
  margin-bottom: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.filter-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.filter-controls h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #0f172a;
  margin: 0;
}

.filter-buttons {
  display: flex;
  gap: 4px;
  background: rgba(0, 0, 0, 0.05);
  padding: 4px;
  border-radius: 12px;
}

.filter-btn {
  padding: 8px 16px;
  border: none;
  background: transparent;
  color: #64748b;
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-btn.active, .filter-btn:hover {
  background: white;
  color: #1e40af;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  margin: 32px 0;
}

.stat-card {
  background: white;
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: 16px;
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.stat-card:hover {
  background: #f9fafb;
  transform: translateY(-2px);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.08);
}

/* Colored left borders for stat cards */
.stat-border {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  transition: width 0.3s ease;
}

.stat-card.stat-blue .stat-border {
  background: linear-gradient(180deg, #3b82f6, #1e40af);
}

.stat-card.stat-green .stat-border {
  background: linear-gradient(180deg, #10b981, #059669);
}

.stat-card.stat-yellow .stat-border {
  background: linear-gradient(180deg, #f59e0b, #d97706);
}

.stat-card.stat-purple .stat-border {
  background: linear-gradient(180deg, #8b5cf6, #7c3aed);
}

.stat-card.stat-orange .stat-border {
  background: linear-gradient(180deg, #f59e0b, #d97706);
}

.stat-card.stat-red .stat-border {
  background: linear-gradient(180deg, #ef4444, #dc2626);
}

.stat-card.stat-cyan .stat-border {
  background: linear-gradient(180deg, #06b6d4, #0891b2);
}

.stat-card.stat-red .stat-border {
  background: linear-gradient(180deg, #ef4444, #dc2626);
}

.stat-card:hover .stat-border {
  width: 6px;
}

.stat-icon {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(37, 99, 235, 0.05);
  border-radius: 12px;
  transition: all 0.3s ease;
}

.stat-card.stat-blue .stat-icon {
  background: rgba(59, 130, 246, 0.1);
}

.stat-card.stat-green .stat-icon {
  background: rgba(16, 185, 129, 0.1);
}

.stat-card.stat-yellow .stat-icon {
  background: rgba(245, 158, 11, 0.1);
}

.stat-card.stat-purple .stat-icon {
  background: rgba(139, 92, 246, 0.1);
}

.stat-card.stat-orange .stat-icon {
  background: rgba(245, 158, 11, 0.1);
}

.stat-card.stat-red .stat-icon {
  background: rgba(239, 68, 68, 0.1);
}

.stat-card.stat-cyan .stat-icon {
  background: rgba(6, 182, 212, 0.1);
}

.stat-card.stat-red .stat-icon {
  background: rgba(239, 68, 68, 0.1);
}

.stat-card:hover .stat-icon {
  transform: scale(1.1);
}

.stat-content {
  flex: 1;
}

.stat-title {
  font-size: 0.875rem;
  font-weight: 500;
  color: #64748b;
  margin-bottom: 6px;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #0f172a;
}

.stat-trend {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.75rem;
  font-weight: 600;
}

.stat-trend.up {
  color: #059669;
}

.stat-trend.down {
  color: #dc2626;
}

.stat-arrow {
  flex-shrink: 0;
  color: #94a3b8;
  display: flex;
  align-items: center;
  transition: all 0.3s ease;
}

.stat-card:hover .stat-arrow {
  color: #64748b;
  transform: translateX(2px);
}

.content-grid {
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 24px;
  margin-bottom: 40px;
}

.chart-card, .violations-card, .performance-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.performance-card {
  grid-column: 1 / -1;
}

.card-header {
  padding: 32px 32px 24px 32px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(248, 250, 252, 0.5);
}

.card-header h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #0f172a;
  margin-bottom: 4px;
}

.subtitle {
  font-size: 0.875rem;
  color: #64748b;
}

/* Add this to your CSS */
.chart-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.control-group {
  display: flex;
  gap: 0.5rem;
}

.year-picker {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.year-select {
  padding: 0.5rem 0.75rem;
  border: 2px solid #e2e8f0;
  border-radius: 0.5rem;
  background-color: white;
  color: #1f2937;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  outline: none;
  min-width: 80px;
}

.year-select:hover {
  border-color: #3b82f6;
}

.year-select:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .chart-controls {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
  
  .control-group {
    order: 1;
  }
  
  .year-picker {
    order: 2;
  }
}

.control-btn {
  padding: 8px 16px;
  border: none;
  background: transparent;
  color: #64748b;
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.control-btn.active, .control-btn:hover {
  background: white;
  color: #1e40af;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.performance-controls {
  display: flex;
  gap: 12px;
  align-items: center;
}

.edit-target-btn {
  background: rgba(59, 130, 246, 0.1);
  color: #1e40af;
  border: 1px solid rgba(59, 130, 246, 0.2);
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;
}

.edit-target-btn:hover {
  background: rgba(59, 130, 246, 0.2);
}

.view-all-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 9999px; 
  background: #f1f5f9; 
  color: #2563eb;      
  font-size: 0.875rem;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.3s ease;
  line-height: 1;
}

.view-all-btn:hover {
  background: #2563eb;
  color: white;
}

.view-all-btn svg {
  display: flex;          
  align-items: center;
  justify-content: center;
  position: relative;
  bottom: 3px;
  width: 16px;
  height: 16px;
  stroke: currentColor;
  flex-shrink: 0;
  transition: transform 0.2s ease;
}

.view-all-btn:hover svg {
  transform: translateX(3px);
}

.primary-btn {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
  padding: 12px 20px;
  border-radius: 12px;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  font-size: 0.875rem;
  transition: all 0.3s ease;
  border: none;
  cursor: pointer;
}

.primary-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(59, 130, 246, 0.3);
}

/* Enhanced Chart Styles */
.chart-container {
  padding: 32px;
  height: 320px;
  position: relative;
}

.chart-wrapper {
  height: 100%;
  display: flex;
  position: relative;
}

.chart-bars {
  flex: 1;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  height: 240px;
  margin-right: 60px;
  gap: 12px;
  padding-bottom: 40px;
}

.chart-bar {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  max-width: 50px;
  height: 100%;
  justify-content: flex-end;
}

.bar-fill {
  width: 100%;
  border-radius: 8px 8px 0 0;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  min-height: 4px;
}

/* Dynamic bar colors based on values */
.bar-color-none {
  background: linear-gradient(180deg, #e5e7eb, #d1d5db);
  box-shadow: 0 4px 12px rgba(209, 213, 219, 0.3);
}

.bar-color-low {
  background: linear-gradient(180deg, #22c55e, #16a34a);
  box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
}

.bar-color-medium {
  background: linear-gradient(180deg, #f97316, #ea580c);
  box-shadow: 0 4px 12px rgba(249, 115, 22, 0.3);
}

.bar-color-high {
  background: linear-gradient(180deg, #a855f7, #9333ea);
  box-shadow: 0 4px 12px rgba(168, 85, 247, 0.3);
}

.bar-color-very-high {
  background: linear-gradient(180deg, #8b5cf6, #7c3aed);
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
}

.bar-color-default {
  background: linear-gradient(180deg, #06b6d4, #0891b2);
  box-shadow: 0 4px 12px rgba(6, 182, 212, 0.3);
}

.bar-fill::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 100%;
  background: linear-gradient(180deg, rgba(255,255,255,0.3) 0%, transparent 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.chart-bar:hover .bar-fill {
  transform: scaleX(1.1);
}

.chart-bar:hover .bar-color-none {
  box-shadow: 0 6px 20px rgba(209, 213, 219, 0.4);
}

.chart-bar:hover .bar-color-low {
  box-shadow: 0 6px 20px rgba(34, 197, 94, 0.4);
}

.chart-bar:hover .bar-color-medium {
  box-shadow: 0 6px 20px rgba(245, 158, 11, 0.4);
}

.chart-bar:hover .bar-color-high {
  box-shadow: 0 6px 20px rgba(239, 68, 68, 0.4);
}

.chart-bar:hover .bar-color-very-high {
  box-shadow: 0 6px 20px rgba(139, 92, 246, 0.4);
}

.chart-bar:hover .bar-color-default {
  box-shadow: 0 6px 20px rgba(6, 182, 212, 0.4);
}

.chart-bar:hover .bar-fill::before {
  opacity: 1;
}

.bar-label {
  margin-top: 12px;
  font-size: 0.75rem;
  color: #64748b;
  font-weight: 500;
  text-align: center;
}

.chart-axis {
  position: absolute;
  right: 0;
  top: 0;
  height: 240px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-end;
  width: 40px;
}

.chart-axis span {
  font-size: 0.75rem;
  color: #94a3b8;
  font-weight: 500;
}

/* Chart Tooltip */
.chart-tooltip {
  position: fixed;
  background: rgba(0, 0, 0, 0.9);
  color: white;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 500;
  pointer-events: none;
  z-index: 100;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.violations-list {
  padding: 24px 32px 32px 32px;
  max-height: 320px;
  overflow-y: auto;
}

.violation-item {
  display: flex;
  align-items: center;
  padding: 20px 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  gap: 20px;
  transition: all 0.2s ease;
}

.violation-item:last-child {
  border-bottom: none;
}

.violation-item:hover {
  background: rgba(59, 130, 246, 0.02);
  margin: 0 -16px;
  padding: 20px 16px;
  border-radius: 12px;
}

.violation-rank {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #f1f5f9, #e2e8f0);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
  color: #475569;
  flex-shrink: 0;
}

.violation-info {
  flex: 1;
  min-width: 0;
}

.violation-name {
  font-weight: 600;
  color: #0f172a;
  margin-bottom: 6px;
  font-size: 0.875rem;
}

.violation-stats {
  display: flex;
  gap: 16px;
  align-items: center;
}

.cases {
  font-size: 0.75rem;
  color: #64748b;
  font-weight: 500;
}

.amount {
  font-weight: 700;
  color: #059669;
  font-size: 0.8rem;
}

.violation-progress {
  width: 80px;
  height: 4px;
  background: rgba(0, 0, 0, 0.08);
  border-radius: 2px;
  overflow: hidden;
  flex-shrink: 0;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #1d4ed8);
  border-radius: 2px;
  transition: width 0.5s ease;
}

/* Top 5 Violations progress bars should use gradient blue */
.violation-progress .progress-fill {
  background: linear-gradient(90deg, #3b82f6, #1d4ed8) !important;
}

.table-wrapper {
  overflow-x: auto;
}

.modern-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

.modern-table thead {
  background: rgba(248, 250, 252, 0.5);
}

.modern-table th {
  padding: 20px 24px;
  text-align: left;
  font-weight: 600;
  color: #475569;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.table-row {
  transition: all 0.2s ease;
  border-bottom: 1px solid rgba(0, 0, 0, 0.04);
}

.table-row:hover {
  background: rgba(59, 130, 246, 0.02);
}

.modern-table td {
  padding: 20px 24px;
  vertical-align: middle;
}

.enforcer-cell {
  display: flex;
  align-items: center;
  gap: 16px;
}

.avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1e3a8a, #3b82f6);
  flex-shrink: 0;
  position: relative;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-initials {
  color: white;
  font-weight: 600;
  font-size: 0.875rem;
}

.enforcer-details {
  min-width: 0;
}

.enforcer-name {
  font-weight: 600;
  color: #0f172a;
  font-size: 0.875rem;
  margin-bottom: 2px;
}

.enforcer-email {
  font-size: 0.75rem;
  color: #64748b;
}

.metric-number {
  font-weight: 700;
  color: #0f172a;
  font-size: 1.1rem;
}

.metric-bar {
  width: 60px;
  height: 4px;
  background: rgba(0, 0, 0, 0.08);
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 4px;
}

.metric-fill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #1d4ed8);
  border-radius: 2px;
  transition: width 0.5s ease;
}

.status-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: capitalize;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.status-activated {
  background: rgba(34, 197, 94, 0.1);
  color: #166534;
}

.status-activated .status-dot {
  background: #22c55e;
}

.status-inactive {
  background: rgba(245, 158, 11, 0.1);
  color: #92400e;
}

.status-inactive .status-dot {
  background: #f59e0b;
}

.status-deactivated {
  background: rgba(239, 68, 68, 0.1);
  color: #991b1b;
}

.status-deactivated .status-dot {
  background: #ef4444;
}

.performance-score {
  font-weight: 700;
  font-size: 0.875rem;
  padding: 6px 12px;
  border-radius: 12px;
  text-align: center;
}

.performance-score.excellent {
  background: rgba(34, 197, 94, 0.1);
  color: #166534;
}

.performance-score.good {
  background: rgba(59, 130, 246, 0.1);
  color: #1e40af;
}

.performance-score.average {
  background: rgba(245, 158, 11, 0.1);
  color: #92400e;
}

.performance-score.poor {
  background: rgba(239, 68, 68, 0.1);
  color: #991b1b;
}

.actions-section {
  margin-top: 40px;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #0f172a;
  margin-bottom: 24px;
  text-align: center;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 24px;
}

.action-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  padding: 32px;
  text-decoration: none;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  gap: 20px;
}

.action-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #3b82f6, #8b5cf6);
  transform: scaleX(0);
  transition: transform 0.3s ease;
}

.action-card:hover::before {
  transform: scaleX(1);
}

.action-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  background: rgba(255, 255, 255, 1);
}

.action-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #475569;
}

.action-content {
  flex: 1;
  min-width: 0;
}

.action-title {
  font-size: 1rem;
  font-weight: 600;
  color: #0f172a;
  margin-bottom: 4px;
}

.action-desc {
  font-size: 0.875rem;
  color: #64748b;
  line-height: 1.4;
}

.action-arrow {
  color: #94a3b8;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.action-card:hover .action-arrow {
  color: #3b82f6;
  transform: translateX(4px);
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  animation: fadeIn 0.3s ease;
}

.modal-content {
  background: white;
  border-radius: 20px;
  width: 100%;
  max-width: 400px;
  margin: 20px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  animation: slideUp 0.3s ease;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 24px 0 24px;
}

.modal-header h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #0f172a;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  color: #64748b;
  cursor: pointer;
  padding: 4px;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: rgba(0, 0, 0, 0.05);
  color: #374151;
}

.modal-body {
  padding: 24px;
}

.modal-body label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 8px;
}

.target-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #d1d5db;
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.2s ease;
  background: white;
}

.target-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.modal-footer {
  display: flex;
  gap: 12px;
  padding: 0 24px 24px 24px;
}

.cancel-btn, .save-btn {
  flex: 1;
  padding: 12px 20px;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.cancel-btn {
  background: #f8fafc;
  color: #64748b;
  border: 1px solid #e2e8f0;
}

.cancel-btn:hover {
  background: #f1f5f9;
  color: #475569;
}

.save-btn {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
}

.save-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #94a3b8;
  gap: 16px;
}

.empty-state p {
  font-size: 0.875rem;
  font-weight: 500;
}

/* Loading States */
.loading {
  opacity: 0.6;
  pointer-events: none;
}

/* Animation Keyframes */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.stat-card {
  animation: fadeInUp 0.6s ease forwards;
}

.stat-card:nth-child(1) { animation-delay: 0.1s; }
.stat-card:nth-child(2) { animation-delay: 0.2s; }
.stat-card:nth-child(3) { animation-delay: 0.3s; }
.stat-card:nth-child(4) { animation-delay: 0.4s; }
.stat-card:nth-child(5) { animation-delay: 0.5s; }
.stat-card:nth-child(6) { animation-delay: 0.6s; }

.chart-card, .violations-card {
  animation: fadeInUp 0.6s ease 0.3s forwards;
  opacity: 0;
}

.performance-card {
  animation: fadeInUp 0.6s ease 0.4s forwards;
  opacity: 0;
}

.action-card {
  animation: fadeInUp 0.6s ease forwards;
  opacity: 0;
}

.action-card:nth-child(1) { animation-delay: 0.5s; }
.action-card:nth-child(2) { animation-delay: 0.6s; }
.action-card:nth-child(3) { animation-delay: 0.7s; }
.action-card:nth-child(4) { animation-delay: 0.8s; }
.action-card:nth-child(5) { animation-delay: 0.9s; }
.action-card:nth-child(6) { animation-delay: 1.0s; }

/* Responsive Design */
@media (max-width: 1200px) {
  .content-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .admin-dashboard {
    padding: 20px;
  }
  
  .dashboard-header {
    flex-direction: column;
    gap: 20px;
    text-align: center;
    padding: 24px;
  }
  
  .header-content h1 {
    font-size: 1.875rem;
  }
  
  .filter-controls {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .filter-buttons {
    justify-content: center;
  }
  
  .stat-value {
    font-size: 1.25rem;
  }
  
  .card-header {
    padding: 24px 20px 20px 20px;
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }
  
  .performance-controls {
    flex-direction: column;
    width: 100%;
    gap: 8px;
  }
  
  .chart-container {
    padding: 20px;
    height: 280px;
  }
  
  .violations-list {
    padding: 20px;
  }
  
  .action-card {
    padding: 24px;
  }
  
  .actions-grid {
    grid-template-columns: 1fr;
  }
  
  .chart-controls {
    width: 100%;
    justify-content: center;
  }
  
  .modern-table {
    font-size: 0.8rem;
  }
  
  .modern-table th,
  .modern-table td {
    padding: 16px 12px;
  }
}

@media (max-width: 1024px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .violation-stats,
  .violator-stats,
  .location-stats {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
  
  .action-card {
    flex-direction: column;
    text-align: center;
  }
  
  .action-arrow {
    transform: rotate(90deg);
  }
  
  .action-card:hover .action-arrow {
    transform: rotate(90deg) translateY(-4px);
  }
  
  .modal-content {
    margin: 10px;
  }
  
  .violators-list,
  .locations-list {
    padding: 16px 20px 20px 20px;
  }
  
  .violator-item,
  .location-item {
    padding: 16px 0;
    gap: 16px;
  }
}

/* Scroll Styles */
.violations-list::-webkit-scrollbar,
.violators-list::-webkit-scrollbar,
.locations-list::-webkit-scrollbar,
.heatmap-container::-webkit-scrollbar,
.table-wrapper::-webkit-scrollbar {
  width: 6px;
}

.violations-list::-webkit-scrollbar-track,
.violators-list::-webkit-scrollbar-track,
.locations-list::-webkit-scrollbar-track,
.heatmap-container::-webkit-scrollbar-track,
.table-wrapper::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 3px;
}

.violations-list::-webkit-scrollbar-thumb,
.violators-list::-webkit-scrollbar-thumb,
.locations-list::-webkit-scrollbar-thumb,
.heatmap-container::-webkit-scrollbar-thumb,
.table-wrapper::-webkit-scrollbar-thumb {
  background: rgba(59, 130, 246, 0.3);
  border-radius: 3px;
}

.violations-list::-webkit-scrollbar-thumb:hover,
.violators-list::-webkit-scrollbar-thumb:hover,
.locations-list::-webkit-scrollbar-thumb:hover,
.heatmap-container::-webkit-scrollbar-thumb:hover,
.table-wrapper::-webkit-scrollbar-thumb:hover {
  background: rgba(59, 130, 246, 0.5);
}

/* Dashboard Grid Layout */
.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 24px;
}

/* Card Styles */
.unsettled-card,
.heatmap-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  min-height: 800px;
  display: flex;
  flex-direction: column;
}

/* Removed border-left colors from unsettled-card and heatmap-card */

.card-header {
  background: linear-gradient(135deg, #f8fafc, #f1f5f9);
  padding: 20px 24px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-icon {
  color: #64748b;
  flex-shrink: 0;
}

.header-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.card-header h3 {
  margin: 0;
  color: #0f172a;
  font-size: 1.125rem;
  font-weight: 600;
}

.header-subtitle {
  margin: 0;
  color: #64748b;
  font-size: 0.875rem;
  font-weight: 500;
}

.header-badges {
  display: flex;
  gap: 8px;
  align-items: center;
}

.badge-date {
  background-color: #f1f5f9;
  color: #475569;
  font-size: 0.75rem;
  padding: 4px 8px;
  border-radius: 12px;
  font-weight: 500;
}

.badge-info {
  background-color: #dbeafe;
  color: #1e40af;
}

/* Violator and Location Lists */
.violators-list {
  padding: 24px 32px 32px 32px;
  max-height: 700px;
  overflow-y: auto;
}

.locations-list {
  padding: 24px 32px 32px 32px;
  max-height: 320px;
  overflow-y: auto;
}

.violator-item,
.location-item {
  display: flex;
  align-items: center;
  padding: 20px 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  gap: 20px;
  transition: all 0.2s ease;
}

.violator-item:last-child,
.location-item:last-child {
  border-bottom: none;
}

.violator-item:hover,
.location-item:hover {
  background: rgba(59, 130, 246, 0.02);
  margin: 0 -16px;
  padding: 20px 16px;
  border-radius: 12px;
}

.violator-rank,
.location-rank {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #f1f5f9, #e2e8f0);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
  color: #475569;
  flex-shrink: 0;
}

.violator-info,
.location-info {
  flex: 1;
  min-width: 0;
}

.violator-name,
.location-name {
  font-weight: 600;
  color: #0f172a;
  margin-bottom: 6px;
  font-size: 0.875rem;
  white-space: nowrap;
  overflow: visible;
  text-overflow: unset;
}

.violator-stats,
.location-stats {
  display: flex;
  gap: 16px;
  align-items: center;
}

.violator-date {
  margin: 4px 0 0 0;
  font-size: 0.75rem;
  color: #6b7280;
}

.apprehension-date {
  font-weight: 500;
}

/* Delay status styling */
.delay-critical {
  color: #dc2626;
  font-weight: 600;
}

.delay-warning {
  color: #f59e0b;
  font-weight: 600;
}

.delay-info {
  color: #3b82f6;
  font-weight: 500;
}

.delay-normal {
  color: #6b7280;
  font-weight: 500;
}

.violator-progress,
.location-progress {
  width: 80px;
  height: 4px;
  background: rgba(0, 0, 0, 0.08);
  border-radius: 2px;
  overflow: hidden;
  flex-shrink: 0;
}

.progress-fill.urgency-warning {
  background: linear-gradient(90deg, #f59e0b, #fbbf24);
}

.progress-fill.urgency-alert {
  background: linear-gradient(90deg, #ef4444, #f87171);
}

.progress-fill.urgency-info {
  background: linear-gradient(90deg, #3b82f6, #60a5fa);
}

.progress-fill:not(.urgency-warning):not(.urgency-alert):not(.urgency-info) {
  background: linear-gradient(90deg, #6b7280, #9ca3af);
}

/* Modern Heatmap Styles */
.heatmap-container {
  padding: 0;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.map-wrapper {
  position: relative;
  height: 400px;
  border-radius: 12px;
  overflow: hidden;
  margin: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.violation-map {
  height: 100%;
  width: 100%;
  border-radius: 12px;
}


.map-popup {
  font-family: inherit;
}

.map-popup h4 {
  margin: 0 0 8px 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: #1f2937;
}

.map-popup p {
  margin: 0 0 4px 0;
  font-size: 0.75rem;
  color: #6b7280;
}

.header-subtitle {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 4px 0 0 0;
}

/* View Toggle */
.view-toggle {
  display: flex;
  gap: 0;
  background: transparent;
  padding: 0;
  border-radius: 0;
  border: none;
}

.view-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 16px;
  border: 1px solid #e2e8f0;
  background: white;
  color: #374151;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  margin-right: -1px;
}

.view-btn:first-child {
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}

.view-btn:last-child {
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
  margin-right: 0;
}

.view-btn:not(:first-child):not(:last-child) {
  border-radius: 0;
}

.view-btn:hover {
  background: #f9fafb;
  color: #1f2937;
}

.view-btn.active {
  background: #dbeafe;
  color: #1d4ed8;
  border-color: #93c5fd;
  z-index: 1;
  position: relative;
}

/* Stats Badges */
.stats-badges {
  display: flex;
  gap: 16px;
}

.stat-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 16px;
  background: white;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.stat-number {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  line-height: 1;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 0.75rem;
  color: #6b7280;
  font-weight: 500;
  text-align: center;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 24px;
  text-align: center;
}

.empty-icon {
  margin-bottom: 16px;
  opacity: 0.6;
}

.empty-state h4 {
  margin: 0 0 8px 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #374151;
}

.empty-state p {
  margin: 0;
  font-size: 0.875rem;
  color: #6b7280;
  max-width: 300px;
}

/* Legend Panel */
.legend-panel {
  background: linear-gradient(135deg, #f8fafc, #f1f5f9);
  border-top: 1px solid #e2e8f0;
  padding: 20px 24px;
}

.legend-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.legend-header h4 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
}

.legend-mode {
  font-size: 0.75rem;
  color: #64748b;
  background: #e2e8f0;
  padding: 4px 8px;
  border-radius: 6px;
  font-weight: 500;
}

.legend-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.legend-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.legend-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  margin: 0;
}

/* Intensity Scale */
.intensity-scale {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.scale-bar {
  height: 24px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.scale-gradient {
  height: 100%;
  background: linear-gradient(to right, #22c55e 0%, #f59e0b 33%, #ef4444 66%, #a855f7 100%);
}

.scale-labels {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  font-weight: 500;
  color: #64748b;
}

.scale-values {
  display: flex;
  justify-content: space-between;
  font-size: 0.7rem;
  color: #94a3b8;
  margin-top: -4px;
}

/* Marker Legend */
.marker-legend {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.legend-row {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 0.875rem;
  color: #374151;
}

.marker-sample {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.marker-sample.intensity-low {
  background: #22c55e;
}

.marker-sample.intensity-medium {
  background: #f59e0b;
}

.marker-sample.intensity-high {
  background: #ef4444;
}

.marker-sample.intensity-critical {
  background: #a855f7;
}

/* Cluster Legend */
.cluster-legend {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.cluster-sample {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  font-size: 0.75rem;
  font-weight: 700;
  color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.cluster-sample.cluster-small {
  background: linear-gradient(135deg, #22c55e, #16a34a);
}

.cluster-sample.cluster-medium {
  background: linear-gradient(135deg, #f59e0b, #d97706);
}

.cluster-sample.cluster-large {
  background: linear-gradient(135deg, #ef4444, #dc2626);
}

.legend-note {
  margin: 8px 0 0 0;
  font-size: 0.75rem;
  color: #64748b;
  font-style: italic;
}

/* Heatmap Footer */
.heatmap-footer {
  padding: 20px 24px;
  background: linear-gradient(135deg, #f8fafc, #f1f5f9);
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* Fullscreen Button */
.fullscreen-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3);
}

.fullscreen-btn:hover {
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(59, 130, 246, 0.4);
}

.fullscreen-btn svg {
  width: 16px;
  height: 16px;
}

/* Custom Cluster Markers */
.marker-cluster-custom {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  color: white;
  font-weight: 700;
  font-size: 14px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  border: 3px solid white;
  transition: transform 0.2s ease;
}

.marker-cluster-custom:hover {
  transform: scale(1.15);
}

.marker-cluster-custom.cluster-small {
  background: linear-gradient(135deg, #22c55e, #16a34a);
}

.marker-cluster-custom.cluster-medium {
  background: linear-gradient(135deg, #f59e0b, #d97706);
}

.marker-cluster-custom.cluster-large {
  background: linear-gradient(135deg, #ef4444, #dc2626);
}

.marker-cluster-custom-wrapper {
  background: transparent !important;
  border: none !important;
}

/* Location Pins */
.location-pin {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}



/* Enhanced Map Popup Styles */
.map-popup {
  min-width: 250px;
  font-family: 'Inter', sans-serif;
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e5e7eb;
}

.popup-header h4 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #1f2937;
}

.intensity-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.intensity-badge.intensity-low {
  background: #dcfce7;
  color: #166534;
}

.intensity-badge.intensity-medium {
  background: #fed7aa;
  color: #9a3412;
}

.intensity-badge.intensity-high {
  background: #fecaca;
  color: #991b1b;
}

.intensity-badge.intensity-very-high {
  background: #f3e8ff;
  color: #6b21a8;
}

.popup-stats {
  margin-bottom: 12px;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.stat-label {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
}

.stat-value {
  font-size: 0.875rem;
  color: #1f2937;
  font-weight: 600;
}

.popup-location {
  padding: 8px 0;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f8fafc;
  margin: 8px -12px 0 -12px;
  padding: 8px 12px;
  border-radius: 6px;
}

.popup-gps {
  padding-top: 8px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.popup-gps .stat-label {
  font-size: 0.8rem;
  color: #6b7280;
}

.popup-gps .stat-value {
  font-size: 0.8rem;
  color: #374151;
  font-family: 'Monaco', 'Menlo', monospace;
}


/* Pulsing Animation for Map Markers */
@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.7);
  }
  50% {
    box-shadow: 0 0 0 10px rgba(255, 255, 255, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(255, 255, 255, 0);
  }
}

.pulsing-marker {
  animation: pulse 2s infinite;
}

/* Leaflet Circle Marker Hover Effects */
.leaflet-interactive:hover {
  stroke-width: 5 !important;
  cursor: pointer;
  filter: brightness(1.1);
  transition: all 0.3s ease;
}

/* Map Controls Enhancement */
.leaflet-control-zoom {
  border: 2px solid #e5e7eb !important;
  border-radius: 8px !important;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1) !important;
}

.leaflet-control-zoom a {
  border: none !important;
  color: #374151 !important;
  font-size: 18px !important;
  font-weight: 600 !important;
  transition: all 0.2s ease !important;
}

.leaflet-control-zoom a:hover {
  background: #3b82f6 !important;
  color: white !important;
}

/* Size Legend Circles */
.size-legend {
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: flex-start;
}

.size-circle {
  border-radius: 50%;
  background: #3b82f6;
  border: 2px solid #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.size-small {
  width: 16px;
  height: 16px;
}

.size-medium-small {
  width: 24px;
  height: 24px;
}

.size-medium {
  width: 32px;
  height: 32px;
}

.size-medium-large {
  width: 44px;
  height: 44px;
}

.size-large {
  width: 56px;
  height: 56px;
}

.size-extra-large {
  width: 70px;
  height: 70px;
}

.size-legend .legend-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* Heatmap Statistics Summary */
.heatmap-stats-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  padding: 20px;
  background: linear-gradient(135deg, #f8fafc 0%, #e7f0ff 100%);
  border-radius: 12px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.stat-box {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  border-left: 4px solid #3b82f6;
}

.stat-box:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

.stat-icon {
  font-size: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.stat-info {
  flex: 1;
}

.stat-box .stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 4px;
  line-height: 1.2;
}

.stat-box .stat-label {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Responsive for stats summary */
@media (max-width: 768px) {
  .heatmap-stats-summary {
    grid-template-columns: 1fr;
  }
}

.legend-item span {
  font-size: 0.75rem;
  color: #6b7280;
  font-weight: 500;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h3 {
  margin: 0;
  color: #1f2937;
  font-size: 1.25rem;
  font-weight: 600;
}

.badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.badge-warning {
  background-color: #fef3c7;
  color: #92400e;
}

.violators-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

.violator-card {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.2s ease;
}

.violator-card:hover {
  border-color: #f59e0b;
  box-shadow: 0 2px 8px rgba(245, 158, 11, 0.1);
}

.violator-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.violator-avatar {
  width: 40px;
  height: 40px;
  background: #fef3c7;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #92400e;
}

.violator-details h4 {
  margin: 0 0 4px 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: #1f2937;
}

.violator-details p {
  margin: 0;
  font-size: 0.75rem;
  color: #6b7280;
}

.violation-count {
  color: #f59e0b !important;
  font-weight: 500;
}

.total-amount {
  color: #dc2626 !important;
  font-weight: 600;
}

.violator-status {
  display: flex;
  align-items: center;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.625rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.status-pending {
  background-color: #fef3c7;
  color: #92400e;
}

/* Small Violator Boxes */
.violators-grid-small {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
  margin-bottom: 20px;
}

.violator-box {
  background: #f9fafb;
  border: 2px solid transparent;
  border-radius: 8px;
  padding: 12px;
  transition: all 0.2s ease;
  position: relative;
}

.violator-box.urgency-warning {
  border-color: #f59e0b;
  background: linear-gradient(135deg, #fef3c7, #fde68a);
}

.violator-box.urgency-alert {
  border-color: #ef4444;
  background: linear-gradient(135deg, #fee2e2, #fecaca);
}

.violator-box:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.violator-box h5 {
  margin: 0 0 8px 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: #1f2937;
  line-height: 1.2;
}

.violator-box .amount {
  margin: 0 0 8px 0;
  font-size: 0.875rem;
  font-weight: 700;
  color: #dc2626;
}

.violator-meta {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.days-badge {
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.625rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.days-badge.urgency-warning {
  background: #f59e0b;
  color: white;
}

.days-badge.urgency-alert {
  background: #ef4444;
  color: white;
}

.count-badge {
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.625rem;
  font-weight: 600;
  background: #6b7280;
  color: white;
}

/* Heatmap Section */
.heatmap-section {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
}

.heatmap-section h4 {
  margin: 0 0 16px 0;
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
}

.heatmap-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 12px;
}

.heatmap-item {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 12px;
  transition: all 0.2s ease;
}

.heatmap-item:hover {
  border-color: #3b82f6;
  background: #eff6ff;
}

.location-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 8px;
  line-height: 1.2;
}

.location-stats {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.location-stats .count {
  font-size: 0.75rem;
  color: #6b7280;
}

.location-stats .amount {
  font-size: 0.75rem;
  font-weight: 600;
  color: #dc2626;
}

.view-more {
  text-align: center;
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
}

.btn-outline-primary {
  background: transparent;
  border: 1px solid #3b82f6;
  color: #3b82f6;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-outline-primary:hover {
  background: #3b82f6;
  color: white;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 0.75rem;
}

/* Pagination Styles */
.pagination-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  background: rgba(248, 250, 252, 0.5);
  border-top: 1px solid rgba(0, 0, 0, 0.06);
  margin-top: 0;
}

.pagination-info {
  font-size: 0.875rem;
  color: #64748b;
  font-weight: 500;
}

.pagination-buttons {
  display: flex;
  align-items: center;
  gap: 12px;
}

.pagination-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  color: #64748b;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.pagination-btn:hover:not(.disabled) {
  background: #f8fafc;
  border-color: #3b82f6;
  color: #3b82f6;
}

.pagination-btn.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: #f8fafc;
}

.page-info {
  font-size: 0.875rem;
  color: #64748b;
  font-weight: 500;
  padding: 0 8px;
}

@media (max-width: 768px) {
  .pagination-controls {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
  
  .pagination-buttons {
    justify-content: center;
  }
}

/* Location Picker Styles */
.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.add-location-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  color: #64748b;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.add-location-btn:hover {
  background: #f1f5f9;
  border-color: #3b82f6;
  color: #3b82f6;
}

.add-location-btn.active {
  background: #3b82f6;
  border-color: #3b82f6;
  color: white;
}

.add-location-btn svg {
  width: 16px;
  height: 16px;
}


/* Fullscreen Modal Styles */
.fullscreen-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(4px);
}

.fullscreen-modal-content {
  width: 95vw;
  height: 95vh;
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.fullscreen-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  background: linear-gradient(135deg, #f8fafc 0%, #e7f0ff 100%);
  border-bottom: 1px solid #e5e7eb;
}

.fullscreen-header h3 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
}

.fullscreen-controls {
  display: flex;
  align-items: center;
  gap: 16px;
}

.fullscreen-controls .visualization-toggle {
  display: flex;
  gap: 8px;
}

.fullscreen-controls .viz-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s ease;
}

.fullscreen-controls .viz-btn:hover {
  background: #f3f4f6;
  border-color: #9ca3af;
  color: #374151;
}

.fullscreen-controls .viz-btn.active {
  background: #3b82f6;
  border-color: #3b82f6;
  color: white;
}

.fullscreen-controls .viz-btn svg {
  width: 16px;
  height: 16px;
}

.close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: #dc2626;
  transform: scale(1.05);
}

.close-btn svg {
  width: 20px;
  height: 20px;
}

.fullscreen-map-container {
  flex: 1;
  width: 100%;
  height: calc(100% - 80px);
  position: relative;
  min-height: 400px;
}

/* Responsive adjustments for fullscreen modal */
@media (max-width: 768px) {
  .fullscreen-modal-content {
    width: 100vw;
    height: 100vh;
    border-radius: 0;
  }
  
  .fullscreen-header {
    padding: 16px 20px;
  }
  
  .fullscreen-header h3 {
    font-size: 1.25rem;
  }
  
  .fullscreen-controls {
    gap: 12px;
  }
  
  .fullscreen-controls .viz-btn {
    padding: 6px 10px;
    font-size: 0.8rem;
  }
  
  .fullscreen-controls .viz-btn svg {
    width: 14px;
    height: 14px;
  }
  
  .close-btn {
    width: 36px;
    height: 36px;
  }
  
  .close-btn svg {
    width: 18px;
    height: 18px;
  }
}
</style>