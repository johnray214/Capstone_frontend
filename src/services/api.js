// src/services/api.js
import axios from "axios";

// Create axios instance
const api = axios.create({
   baseURL: 'https://capstonebackend-production-e930.up.railway.app/api',
   timeout: 60000,
   headers: {
      Accept: 'application/json',
   },
});

// Request interceptor → attach token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("auth_token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor → auto logout on 401
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const url = error.config?.url || ''
        const isAuthFlow = url.includes('/login') || url.includes('/register') || url.includes('/forgot-password') || url.includes('/reset-password')
        if (error.response?.status === 401 && !isAuthFlow) {
            // Determine proper redirect before clearing storage
            let redirect = '/'
            try {
                const rawUser = localStorage.getItem('user_data')
                if (rawUser) {
                    const user = JSON.parse(rawUser)
                    const role = user?.role || user?.user_type
                    if (role === 'Admin' || role === 'Deputy' || role === 'Head') {
                        redirect = '/officials-login'
                    }
                }
            } catch (_) { void 0 }

            localStorage.removeItem('auth_token')
            localStorage.removeItem('user_data')
            localStorage.removeItem('user_image_url')
            window.location.href = redirect
        }
        return Promise.reject(error);
    }
);

/* ============================
   AUTH API
============================ */
export const authAPI = {
    login: (credentials) => api.post("/login", credentials),
    loginOfficials: (credentials) => api.post("/admin/login", credentials),
    loginViolator: (credentials) => api.post("/login", credentials),
    register: (data) => api.post("/register", data),
    logout: () => api.post("/logout"),
    profile: () => api.get("/profile"),
    getRoles: () => api.get("/roles"),
    forgotPassword: (identifier, isOfficials = false) => {
      const endpoint = isOfficials ? "/forgot-password-officials" : "/forgot-password-violator";
      return api.post(endpoint, identifier);
    },
    resetPassword: (data) => api.post("/reset-password", data),
};

/* ============================
   ADMIN API
============================ */
export const adminAPI = {
    // Dashboard
    dashboard: (params) => api.get("/admin/dashboard", { params }),
    
    //profile
    profile: () => api.get("/admin/profile"),
    changePassword: (data) => api.post("/admin/change-password", data),

    // Officials Management
    getUsers: (params = {}) => api.get("/admin/users", { params }),
    createUser: (data) => api.post("/admin/users", data),
    updateUser: (userType, id, data) =>
        api.post(`/admin/users/${userType}/${id}?_method=PUT`, data),
    changeUserStatus: (payload) => api.post(`/admin/toggle-status`, payload),

    // Archive
    archiveUser: (userType, id) => api.delete(`/admin/users/${userType}/${id}`),
    getArchivedUsers: (params) => api.get("/admin/users/archived", { params }),
    restoreUser: (userType, id) =>
        api.post(`/admin/users/${userType}/${id}/restore`),

    //Transactions
    getTransactions: (params) => api.get("/admin/transactions", { params }),
    updateTransaction: (id, payload) =>
        api.put(`/admin/transactions/${id}/update`, payload),

    // Violation Management
    getViolations: (status = "") =>
        api.get(`/admin/violations${status ? `?status=${status}` : ""}`),
    createViolation: (data) => api.post("/admin/violations", data),
    updateViolation: (id, data) => api.put(`/admin/violations/${id}`, data),
    getViolation: (id) => api.get(`/admin/violation/${id}`),

    // Vehicles Management
    getVehicles: (params = {}) => api.get("/admin/vehicles", { params }),
    getVehiclesDetails: (id) => api.get(`/admin/vehicles/${id}`),
    updateVehicle: (id, data) => api.put(`/admin/vehicles/${id}`, data),

    // Violator Management
    getViolators: (params = {}) => api.get("/admin/violators", { params }),
    getViolatorDetails: (id) => api.get(`/admin/violators/${id}`),
    updateViolator: (data) => api.put("/admin/update-violator", data),
    archiveViolator: (id) => api.delete(`/admin/violators/${id}`),
    getArchivedViolators: () => api.get("/admin/violators/archived"),
    restoreViolator: (id) => api.post(`/admin/violators/${id}/restore`),
    forceDeleteViolator: (id) =>
        api.delete(`/admin/violators/${id}/force-delete`),

    // Reports & Analytics
    previewReport: (payload) => api.post("/admin/preview-report", payload),
    generateReport: (payload) => api.post("/admin/generate-report", payload),
    getReportHistory: (params) => api.get("/admin/history", { params }),
    clearReportHistory: () => api.delete("/admin/history/clear"),
    downloadReportFile: (filename) =>
        api.get(`/admin/download-report/${filename}`, {
            responseType: "blob",
        }),

    // Notifications
    getNotifications: () => api.get("/admin/notifications"),
    getAllNotifications: () => api.get("/admin/notifications/all"),
    getSentNotifications: () => api.get("/admin/notifications/sent"),
    markNotificationAsRead: (id) => api.post(`/admin/notifications/${id}/read`),
    markNotificationAsUnread: (id) =>
        api.post(`/admin/notifications/${id}/unread`),
    markAllNotificationsAsRead: () =>
        api.post("/admin/notifications/mark-all-read"),
    sendNotification: (data) => api.post("/admin/send-notifications", data),
    
    getAllUsers: () => api.get("/admin/get-users"),

    // Audit Logs
    getAuditLogs: (params = {}) => api.get('/admin/logs', { params }),
};

/* ============================
   ENFORCER API
============================ */
export const enforcerAPI = {
    // Dashboard
    dashboard: () => api.get("/enforcer/dashboard"),
    
    // Violations
    getViolations: (status = '') => api.get(`/enforcer/violations${status ? `?status=${status}` : ''}`),
    recordViolation: (data) => api.post("/enforcer/violations", data),
    getViolationDetails: (id) => api.get(`/enforcer/violations/${id}`),
    updateViolationStatus: (id, status) => api.patch(`/enforcer/violations/${id}/status`, { status }),
    getViolationTypes: () => api.get("/enforcer/violation-types"),
    
    // Violators
    searchViolators: (query) => api.get(`/enforcer/violators/search?q=${encodeURIComponent(query)}`),
    getViolatorDetails: (id) => api.get(`/enforcer/violators/${id}`),
    
    // Transactions
    getTransactions: (params = {}) => api.get("/enforcer/transactions", { params }),
    getTransaction: (id) => api.get(`/enforcer/transactions/${id}`),
    updateTransaction: (id, data) => api.put(`/enforcer/transactions/${id}`, data),
    
    // Profile
    getProfile: () => api.get("/enforcer/profile"),
    updateProfile: (data) => api.put("/enforcer/profile", data),
    changePassword: (data) => api.post("/enforcer/change-password", data),
    
    // Performance
    getPerformanceStats: () => api.get("/enforcer/performance"),
};
/* ============================
   VIOLATOR API
============================ */
export const violatorAPI = {
    dashboard: () => api.get("/violator/dashboard"),
    getHistory: () => api.get("/violator/history"),
    getViolationDetails: (id) => api.get(`/violator/violations/${id}`),
    updateProfile: (data) => api.post("/violator/profile", data),
    changePassword: (data) => api.post("/violator/change-password", data),
    uploadReceipt: (data) => api.post("/violator/upload-receipt", data),
    getNotifications: () => api.get("/violator/notifications"),
    markNotificationAsRead: (id) =>
        api.post(`/violator/notifications/${id}/read`),
    markNotificationAsUnread: (id) =>
        api.post(`/violator/notifications/${id}/unread`),
    markAllNotificationsAsRead: () =>
        api.post(`/violator/notifications/mark-all-read`),
    getStatistics: () => api.get("/violator/statistics"),
    getProfile: () => api.get("/violator/profile"),
};

export default api;
