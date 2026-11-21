import axios from 'axios';

const rawApiUrl = (import.meta.env.VITE_API_URL || '').trim().replace(/\/+$/, '');

// Prevent accidental calls to dummy placeholder URLs (e.g. your-hrms-api.onrender.com)
const isPlaceholder = !rawApiUrl || 
  rawApiUrl.includes('your-hrms-api') || 
  rawApiUrl.includes('your-backend-api') || 
  rawApiUrl.includes('example.com') ||
  rawApiUrl.includes('<');

const API_BASE = isPlaceholder
  ? (import.meta.env.DEV ? 'http://localhost:5000/api' : '/api')
  : (rawApiUrl.endsWith('/api') ? rawApiUrl : `${rawApiUrl}/api`);

const api = axios.create({
  baseURL: API_BASE,
  timeout: 60000, // 60s timeout to allow Render free tier cold-starts
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Health check to test frontend-to-backend connectivity
export const checkHealth = async () => {
  const res = await api.get('/health');
  return res.data;
};

// Request interceptor to attach JWT access token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('taskorbit_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor with silent automatic refresh on TOKEN_EXPIRED
let refreshing = null;
api.interceptors.response.use(
  (r) => r,
  async (error) => {
    const original = error.config;
    const expired = error.response?.status === 401 && error.response?.data?.message === 'TOKEN_EXPIRED';

    if (expired && !original._retry) {
      original._retry = true;
      refreshing ??= axios
        .post(`${API_BASE}/auth/refresh`, {}, { withCredentials: true })
        .then((r) => r.data.data.accessToken)
        .finally(() => {
          refreshing = null;
        });

      try {
        const newToken = await refreshing;
        localStorage.setItem('taskorbit_token', newToken);
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      } catch (refreshErr) {
        localStorage.removeItem('taskorbit_token');
        localStorage.removeItem('taskorbit_user');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshErr);
      }
    }

    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      return Promise.reject(
        new Error('Server is waking up (Render free tier spin-up takes ~30-50s). Please wait a moment and try again!')
      );
    }

    const errorMsg = error.response?.data?.message || error.message || 'Unknown network error';
    return Promise.reject(new Error(errorMsg));
  }
);

// Auth APIs
export const loginApi = async (credentials) => {
  const res = await api.post('/auth/login', credentials);
  return res.data.data;
};

export const setPasswordApi = async (data) => {
  const res = await api.post('/auth/set-password', data);
  return res.data;
};

export const fetchMeApi = async () => {
  const res = await api.get('/auth/me');
  return res.data.data;
};

export const logoutApi = async () => {
  const res = await api.post('/auth/logout');
  return res.data;
};

// User Management (Admin / HR)
export const createUserApi = async (userData) => {
  const res = await api.post('/users', userData);
  return res.data.data;
};

export const fetchUsersApi = async () => {
  const res = await api.get('/users');
  return res.data.data;
};

// Bulk Import & Employee Management (Phase 2)
export const downloadEmployeeTemplate = () => {
  const base = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  window.open(`${base}/employees/import/template`, '_blank');
};

export const previewEmployeeImport = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const res = await api.post('/employees/import/preview', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return res.data.data;
};

export const commitEmployeeImport = async (importId) => {
  const res = await api.post('/employees/import/commit', { importId });
  return res.data.data;
};

export const uploadEmployeeDocument = async (employeeId, file, type = 'General') => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', type);
  const res = await api.post(`/employees/${employeeId}/documents`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return res.data.data;
};

// Stats & Dashboard
export const fetchStats = async () => {
  const res = await api.get('/stats');
  return res.data.data;
};

export const fetchSchedule = async () => {
  const res = await api.get('/schedule');
  return res.data.data;
};

export const fetchLeads = async () => {
  const res = await api.get('/leads');
  return res.data.data;
};

export const createLead = async (data) => {
  const res = await api.post('/leads', data);
  return res.data.data;
};

export const updateLead = async (id, data) => {
  const res = await api.patch(`/leads/${id}`, data);
  return res.data.data;
};

export const deleteLead = async (id) => {
  const res = await api.delete(`/leads/${id}`);
  return res.data;
};

export const fetchTasks = async () => {
  const res = await api.get('/tasks');
  return res.data.data;
};

export const createTask = async (data) => {
  const res = await api.post('/tasks', data);
  return res.data.data;
};

export const updateTask = async (id, data) => {
  const res = await api.patch(`/tasks/${id}`, data);
  return res.data.data;
};

export const deleteTask = async (id) => {
  const res = await api.delete(`/tasks/${id}`);
  return res.data;
};

export const fetchEmployees = async () => {
  const res = await api.get('/employees');
  return res.data.data;
};

export const fetchEmployeeById = async (id) => {
  const res = await api.get(`/employees/${id}`);
  return res.data.data;
};

export const createEmployee = async (data) => {
  const res = await api.post('/employees', data);
  return res.data.data;
};

export const updateEmployee = async (id, data) => {
  const res = await api.patch(`/employees/${id}`, data);
  return res.data.data;
};

export const deleteEmployee = async (id) => {
  const res = await api.delete(`/employees/${id}`);
  return res.data;
};

export const fetchAttendance = async (params = {}) => {
  const res = await api.get('/attendance', { params });
  return res.data.data;
};

export const fetchAttendanceMonthlyReport = async (params = {}) => {
  const res = await api.get('/attendance/report', { params });
  return res.data.data;
};

export const fetchNearestOffice = async (lat, lng) => {
  const res = await api.get('/attendance/nearest-office', { params: { lat, lng } });
  return res.data.data;
};

export const punchAttendance = async (payload = 'in') => {
  const body = typeof payload === 'string' ? { type: payload } : payload;
  const res = await api.post('/attendance/punch', body);
  return res.data;
};

export const reviewPunchApi = async (id, data) => {
  const res = await api.patch(`/attendance/${id}/review`, data);
  return res.data;
};

// --- OFFICE LOCATIONS ---
export const fetchLocations = async () => {
  const res = await api.get('/locations');
  return res.data.data;
};

export const createLocationApi = async (data) => {
  const res = await api.post('/locations', data);
  return res.data.data;
};

export const updateLocationApi = async (id, data) => {
  const res = await api.patch(`/locations/${id}`, data);
  return res.data.data;
};

export const deleteLocationApi = async (id) => {
  const res = await api.delete(`/locations/${id}`);
  return res.data;
};

// --- MEETINGS & SCHEDULING (PHASE 4) ---
export const fetchMeetings = async (params = {}) => {
  const res = await api.get('/meetings', { params });
  return res.data.data;
};

export const fetchMeetingById = async (id) => {
  const res = await api.get(`/meetings/${id}`);
  return res.data.data;
};

export const createMeetingApi = async (data) => {
  const res = await api.post('/meetings', data);
  return res.data;
};

export const updateMeetingApi = async (id, data) => {
  const res = await api.patch(`/meetings/${id}`, data);
  return res.data;
};

export const cancelMeetingApi = async (id) => {
  const res = await api.delete(`/meetings/${id}`);
  return res.data;
};

export const respondToMeetingApi = async (id, response) => {
  const res = await api.post(`/meetings/${id}/respond`, { response });
  return res.data;
};

export const checkMeetingAvailability = async (params) => {
  const res = await api.get('/meetings/availability', { params });
  return res.data.data;
};

export const getMeetingIcsUrl = (id) => {
  const base = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  return `${base}/meetings/${id}/ics`;
};

export const fetchLeaves = async (params = {}) => {
  const res = await api.get('/leaves', { params });
  return res.data.data;
};

export const fetchLeaveBalance = async (employeeId) => {
  const res = await api.get('/leaves/balance', { params: { employeeId } });
  return res.data.data;
};

export const createLeave = async (data) => {
  const res = await api.post('/leaves', data);
  return res.data.data;
};

export const updateLeaveStatus = async (id, status) => {
  const res = await api.patch(`/leaves/${id}/status`, { status });
  return res.data.data;
};

export const fetchPayroll = async (params = {}) => {
  const res = await api.get('/payroll', { params });
  return res.data.data;
};
export const fetchPayrolls = fetchPayroll;

export const generatePayrollRun = async (month) => {
  const res = await api.post('/payroll/generate', { month });
  return res.data;
};

export const updateDraftPayroll = async (id, data) => {
  const res = await api.patch(`/payroll/${id}`, data);
  return res.data.data;
};

export const approvePayrollRun = async (month) => {
  const res = await api.post('/payroll/approve', { month });
  return res.data;
};

export const executeSalaryPayouts = async (month, provider = 'MockProvider') => {
  const res = await api.post('/payroll/payout', { month, provider });
  return res.data;
};

export const fetchPayslip = async (id) => {
  const res = await api.get(`/payroll/${id}/payslip`);
  return res.data.data;
};

// --- HOLIDAYS ---
export const fetchHolidays = async (year) => {
  const res = await api.get('/holidays', { params: { year } });
  return res.data.data;
};

export const createHoliday = async (data) => {
  const res = await api.post('/holidays', data);
  return res.data.data;
};
export const createHolidayApi = createHoliday;

export const updateHoliday = async (id, data) => {
  const res = await api.patch(`/holidays/${id}`, data);
  return res.data.data;
};
export const updateHolidayApi = updateHoliday;

export const deleteHoliday = async (id) => {
  const res = await api.delete(`/holidays/${id}`);
  return res.data;
};
export const deleteHolidayApi = deleteHoliday;

export const fetchSummary = async () => {
  const res = await api.get('/summary');
  return res.data.data;
};

export const updateGoal = async (description) => {
  const res = await api.patch('/summary/goal', { description });
  return res.data.data;
};

// --- RECRUITMENT ---
export const fetchJobs = async () => {
  const res = await api.get('/recruitment/jobs');
  return res.data.data;
};

export const createJob = async (data) => {
  const res = await api.post('/recruitment/jobs', data);
  return res.data.data;
};

export const fetchCandidates = async (params = {}) => {
  const res = await api.get('/recruitment/candidates', { params });
  return res.data.data;
};

export const createCandidate = async (data) => {
  const res = await api.post('/recruitment/candidates', data);
  return res.data.data;
};

export const updateCandidateStage = async (id, stage) => {
  const res = await api.patch(`/recruitment/candidates/${id}/stage`, { stage });
  return res.data.data;
};

// --- GOALS / OKRs ---
export const fetchGoals = async () => {
  const res = await api.get('/goals');
  return res.data.data;
};

export const createGoal = async (data) => {
  const res = await api.post('/goals', data);
  return res.data.data;
};

export const updateGoalProgress = async (id, data) => {
  const res = await api.patch(`/goals/${id}`, data);
  return res.data.data;
};

// --- HR ANALYTICS & EXPORTS ---
export const fetchAnalytics = async () => {
  const res = await api.get('/analytics');
  return res.data.data;
};

export const getExportUrl = (type) => {
  const base = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  return `${base}/export/${type}`;
};

// --- SELF-SERVICE PROFILE & PASSWORD ---
export const fetchOwnProfile = async () => {
  const res = await api.get('/employees/profile');
  return res.data.data;
};

export const updateOwnProfile = async (data) => {
  const res = await api.patch('/employees/profile', data);
  return res.data.data;
};

export const updateUserProfile = async (data) => {
  const res = await api.patch('/auth/profile', data);
  return res.data;
};

export const changePassword = async (data) => {
  const res = await api.post('/auth/change-password', data);
  return res.data;
};

// --- NOTIFICATIONS ---
export const fetchNotifications = async (limit = 20) => {
  const res = await api.get('/notifications', { params: { limit } });
  return res.data.data;
};

export const markNotificationRead = async (id) => {
  const res = await api.patch(`/notifications/${id}/read`);
  return res.data.data;
};

export const markAllNotificationsRead = async () => {
  const res = await api.patch('/notifications/read-all');
  return res.data;
};

// --- AUDIT LOGS (Admin & HR) ---
export const fetchAuditLogs = async (params = {}) => {
  const res = await api.get('/audit-logs', { params });
  return res.data.data;
};

// --- SYSTEM SETTINGS & WORK SHIFT PUNCH TIMINGS ---
export const fetchSystemSettings = async () => {
  const res = await api.get('/settings');
  return res.data.data;
};

export const updateSystemSettings = async (data) => {
  const res = await api.patch('/settings', data);
  return res.data.data;
};

export default api;
