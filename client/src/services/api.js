import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
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


// Request interceptor to attach JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('taskorbit_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for consistent error extraction
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const errorMsg = error.response?.data?.message || error.message || 'Unknown network error';
    console.error(`[API Error] ${error.config?.method?.toUpperCase()} ${error.config?.url}:`, errorMsg);
    return Promise.reject(new Error(errorMsg));
  }
);

// Auth APIs
export const loginApi = async (credentials) => {
  const res = await api.post('/auth/login', credentials);
  return res.data.data;
};

export const registerApi = async (userData) => {
  const res = await api.post('/auth/register', userData);
  return res.data.data;
};

export const fetchMeApi = async () => {
  const res = await api.get('/auth/me');
  return res.data.data;
};

export const logoutApi = async () => {
  const res = await api.post('/auth/logout');
  return res.data;
};

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

export const fetchEmployees = async () => {
  const res = await api.get('/employees');
  return res.data.data;
};

export const createEmployee = async (data) => {
  const res = await api.post('/employees', data);
  return res.data.data;
};

export const fetchAttendance = async () => {
  const res = await api.get('/attendance');
  return res.data.data;
};

export const fetchAttendanceMonthlyReport = async (params = {}) => {
  const res = await api.get('/attendance/monthly-report', { params });
  return res.data.data;
};

export const punchAttendance = async (type = 'in') => {
  const res = await api.post('/attendance/punch', { type });
  return res.data;
};

export const fetchLeaves = async () => {
  const res = await api.get('/leaves');
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
  const res = await api.patch(`/leaves/${id}`, { status });
  return res.data.data;
};

export const fetchPayroll = async () => {
  const res = await api.get('/payroll');
  return res.data.data;
};

export const generatePayrollRun = async (month) => {
  const res = await api.post('/payroll/generate', { month });
  return res.data;
};

export const fetchPayslip = async (id) => {
  const res = await api.get(`/payroll/${id}/payslip`);
  return res.data.data;
};

export const processPayroll = async () => {
  const res = await api.post('/payroll/pay-all');
  return res.data;
};

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

export default api;

