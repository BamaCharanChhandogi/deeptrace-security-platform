import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../ui/LoadingSpinner';

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#090d16] flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return (
      <div className="p-8 text-center">
        <div className="max-w-md mx-auto p-6 rounded-xl bg-slate-900 border border-rose-500/30 text-slate-300">
          <h2 className="text-xl font-semibold text-rose-400 mb-2">Access Denied</h2>
          <p className="text-sm text-slate-400 mb-4">
            Your role (<span className="text-amber-400 font-mono">{user.role}</span>) does not have permission to view this section.
          </p>
          <a
            href="/"
            className="inline-block px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm rounded-lg transition"
          >
            Return to Dashboard
          </a>
        </div>
      </div>
    );
  }

  return children;
}
