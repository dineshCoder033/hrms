import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="w-screen h-screen bg-[#F4F6F8] flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-3 border-black border-t-[#C7F436] rounded-full animate-spin" />
        <span className="text-xs font-semibold text-gray-500">Checking credentials...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center">
        <div className="bg-rose-50 border border-rose-200 text-rose-700 p-6 rounded-3xl max-w-md">
          <h3 className="font-extrabold text-base mb-1">Access Restricted</h3>
          <p className="text-xs text-rose-600 mb-4">
            You do not have permission to view this section ({allowedRoles.join(', ')} required).
          </p>
        </div>
      </div>
    );
  }

  return children;
}
