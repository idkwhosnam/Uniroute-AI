import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useStudentProfile } from '@/lib/useStudentData';

// Cho phép vào /assessment khi hồ sơ chưa hoàn tất
const PRE_ONBOARDING_ALLOWED = ['/assessment'];

export default function JourneyGate() {
  const { data: profile, isLoading } = useStudentProfile();
  const { pathname } = useLocation();

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  const onboarded = !!profile?.onboarded;
  if (!onboarded && pathname !== '/profile' && !PRE_ONBOARDING_ALLOWED.includes(pathname)) {
    return <Navigate to="/profile" replace />;
  }
  return <Outlet />;
}