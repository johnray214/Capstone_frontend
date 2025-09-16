<template>
  <SidebarLayout pageTitle="Audit Logs">
    <div class="card">
      <div class="card-header">
        <div class="left">
          <input v-model="search" @keyup.enter="fetchLogs" type="text" placeholder="Search action, actor, target..." />
          <button @click="fetchLogs">Search</button>
        </div>
        <div class="right">
          <span class="muted">Showing {{ logs.data?.length || 0 }} of {{ logs.total || 0 }}</span>
        </div>
      </div>

      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Action</th>
              <th>Actor</th>
              <th>Target</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="log in logs.data" :key="log.id">
              <td>{{ formatDate(log.created_at) }}</td>
              <td>{{ log.action }}</td>
              <td>
                <div class="stack">
                  <span class="bold">{{ log.actor_name || '—' }}</span>
                  <small class="muted">{{ log.actor_type }}</small>
                </div>
              </td>
              <td>
                <div class="stack">
                  <span class="bold">{{ log.target_name || '—' }}</span>
                  <small class="muted">{{ log.target_type || '—' }}</small>
                </div>
              </td>
              <td class="metadata">
                <pre>{{ log.description || '—' }}</pre>
              </td>
            </tr>
            <tr v-if="!logs.data || logs.data.length===0">
              <td :colspan="5" class="empty">No logs found</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="pagination" v-if="logs.total && logs.last_page > 1">
        <button :disabled="page<=1" @click="go(page-1)">Prev</button>
        <span>Page {{ page }} / {{ logs.last_page }}</span>
        <button :disabled="page>=logs.last_page" @click="go(page+1)">Next</button>
      </div>
    </div>
  </SidebarLayout>
  </template>

<script>
import SidebarLayout from '@/components/SidebarLayout.vue'
import { ref, onMounted, watch } from 'vue'
import { adminAPI } from '@/services/api'

export default {
  name: 'AdminAuditLogs',
  components: { SidebarLayout },
  setup() {
    const logs = ref({ data: [], total: 0, last_page: 1 })
    const page = ref(1)
    const perPage = ref(15)
    const search = ref('')
    const loading = ref(false)

    const fetchLogs = async () => {
      loading.value = true
      try {
        const { data } = await adminAPI.getAuditLogs({ page: page.value, per_page: perPage.value, search: search.value })
        logs.value = data.data
      } catch (e) {
        console.error('Failed to fetch logs', e)
      } finally {
        loading.value = false
      }
    }

    const go = (p) => {
      page.value = p
      fetchLogs()
    }

    const confirmDelete = () => {}

    const formatDate = (iso) => new Date(iso).toLocaleString()

    onMounted(fetchLogs)
    watch([perPage], fetchLogs)

    return { logs, page, perPage, search, loading, fetchLogs, go, confirmDelete, formatDate }
  }
}
</script>

<style scoped>
.card { background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; }
.card-header { display:flex; justify-content:space-between; align-items:center; padding:16px; border-bottom:1px solid #e5e7eb; }
.card-header .left { display:flex; gap:8px; }
.card-header input { padding:8px 12px; border:1px solid #d1d5db; border-radius:8px; width:280px; }
.card-header button { padding:8px 12px; border:none; background:#1e40af; color:#fff; border-radius:8px; cursor:pointer; }
.muted { color:#6b7280; }
.bold { font-weight:600; }
.table-wrapper { width:100%; overflow:auto; }
table { width:100%; border-collapse:collapse; }
thead th { text-align:left; font-size:12px; text-transform:uppercase; color:#6b7280; padding:12px 16px; border-bottom:1px solid #e5e7eb; }
tbody td { padding:12px 16px; border-bottom:1px solid #f3f4f6; vertical-align:top; }
.stack { display:flex; flex-direction:column; gap:2px; }
.metadata pre { white-space:pre-wrap; background:#f9fafb; padding:8px; border-radius:8px; border:1px solid #e5e7eb; max-width:420px; }
.empty { text-align:center; color:#6b7280; padding:24px; }
.pagination { display:flex; gap:8px; align-items:center; justify-content:flex-end; padding:12px 16px; }
.pagination button { padding:8px 12px; border:1px solid #d1d5db; background:#fff; border-radius:8px; cursor:pointer; }
.danger { background:#dc2626; color:#fff; border:none; padding:6px 10px; border-radius:6px; cursor:pointer; }
code { background:#eef2ff; color:#1e3a8a; padding:2px 6px; border-radius:4px; font-size:12px; }
</style>


