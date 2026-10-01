import React from 'react';
import { useAuth } from '../../context/AuthContext';

/**
 * Conditionally render children only if current user has one of the allowed roles
 */
export default function RoleGate({ allowedRoles = [], children, fallback = null }) {
  const { user } = useAuth();

  if (!user || (allowedRoles.length > 0 && !allowedRoles.includes(user.role))) {
    return fallback;
  }

  return children;
}
