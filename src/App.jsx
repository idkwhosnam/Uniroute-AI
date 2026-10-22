import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
import ErrorBoundary from '@/components/ErrorBoundary';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Navigate } from 'react-router-dom';
import { AppStoreProvider } from '@/state/store';
import JourneyGate from '@/components/journey/JourneyGate';
import AppLayout from '@/components/uniroute/AppLayout';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import Landing from '@/pages/Landing';
import Dashboard from '@/pages/Dashboard';
import Assessment from '@/pages/Assessment';
import SubjectAdjustment from '@/pages/SubjectAdjustment';
import Subjects from '@/pages/Subjects';
import Academic from '@/pages/Academic';
import Majors from '@/pages/Majors';
import Universities from '@/pages/Universities';
import Admission from '@/pages/Admission';
import Target from '@/pages/Target';
import Gap from '@/pages/Gap';
import Roadmap from '@/pages/Roadmap';
import Progress from '@/pages/Progress';
import Profile from '@/pages/Profile';
import AdmissionPlan from '@/pages/AdmissionPlan';
// Add page imports here

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <ErrorBoundary>
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Landing />} />
          <Route element={<JourneyGate />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/assessment" element={<Assessment />} />
            <Route path="/holland-result" element={<Navigate to="/assessment" replace />} />
            <Route path="/subjects" element={<Subjects />} />
            <Route path="/subject-adjustment" element={<SubjectAdjustment />} />
            <Route path="/academic" element={<Academic />} />
            <Route path="/majors" element={<Majors />} />
            <Route path="/universities" element={<Universities />} />
            <Route path="/admission" element={<Admission />} />
            <Route path="/target" element={<Target />} />
            <Route path="/gap" element={<Gap />} />
            <Route path="/roadmap" element={<Roadmap />} />
            <Route path="/progress" element={<Progress />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/admission-plan/:uniCode" element={<AdmissionPlan />} />
          </Route>
        </Route>
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
    </ErrorBoundary>
  );
};

function App() {

  return (
    <AuthProvider>
      <AppStoreProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
      </AppStoreProvider>
    </AuthProvider>
  )
}

export default App