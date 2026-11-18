import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './components/AppLayout';

import LoginPage from './pages/LoginPage';
import SetPasswordPage from './pages/SetPasswordPage';
import DashboardPage from './pages/DashboardPage';
import EmployeesPage from './pages/EmployeesPage';
import AttendancePage from './pages/AttendancePage';
import LeavesPage from './pages/LeavesPage';
import PayrollPage from './pages/PayrollPage';
import RecruitmentPage from './pages/RecruitmentPage';
import PerformancePage from './pages/PerformancePage';
import MyPayslipsPage from './pages/MyPayslipsPage';
import MyProfilePage from './pages/MyProfilePage';
import HolidaysPage from './pages/HolidaysPage';
import AuditLogsPage from './pages/AuditLogsPage';
import SystemSettingsPage from './pages/SystemSettingsPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/set-password" element={<SetPasswordPage />} />

          {/* Protected Enterprise Workspace Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="attendance" element={<AttendancePage />} />
            <Route path="leaves" element={<LeavesPage />} />
            <Route path="holidays" element={<HolidaysPage />} />
            <Route path="recruitment" element={<RecruitmentPage />} />
            <Route
              path="my-payslips"
              element={
                <ProtectedRoute allowedRoles={['Employee']}>
                  <MyPayslipsPage />
                </ProtectedRoute>
              }
            />
            <Route path="profile" element={<MyProfilePage />} />

            {/* Admin Restricted System Modules */}
            <Route
              path="settings"
              element={
                <ProtectedRoute allowedRoles={['Admin']}>
                  <SystemSettingsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="employees"
              element={
                <ProtectedRoute allowedRoles={['Admin', 'HR', 'Manager']}>
                  <EmployeesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="payroll"
              element={
                <ProtectedRoute allowedRoles={['Admin', 'HR']}>
                  <PayrollPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="audit-logs"
              element={
                <ProtectedRoute allowedRoles={['Admin']}>
                  <AuditLogsPage />
                </ProtectedRoute>
              }
            />

            <Route path="performance" element={<PerformancePage />} />
          </Route>

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
