import React , { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { WalletProvider } from './context/WalletContext';
import { LanguageProvider } from './context/LanguageContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import AssignedProjects from './pages/AssignedProjects';
import RequestAdvance from './pages/RequestAdvance';
import DailyExpenses from './pages/DailyExpensesNew';
import BalanceSettlement from './pages/BalanceSettlement';
import PublicExpenseForm from './pages/PublicExpenseForm';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  useEffect(() => {
    if (!loading && (!user || user.role !== 'site_supervisor')) {
      window.location.href = import.meta.env.BASE_URL;
    }
  }, [user, loading]);

  if (loading || !user || user.role !== 'site_supervisor') {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <WalletProvider>
          <Router basename={`${import.meta.env.BASE_URL.replace(/\/$/, '')}/supervisor`}>
            <Routes>
          {/* Public Routes */}
          <Route path="/expense-form" element={<PublicExpenseForm />} />
          
          {/* Protected Layout Routes */}
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            {/* Redirect / to /dashboard */}
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="assigned-projects" element={<AssignedProjects />} />
            <Route path="request-advance" element={<RequestAdvance />} />
            <Route path="daily-expenses" element={<DailyExpenses />} />
            <Route path="balance-settlement" element={<BalanceSettlement />} />
          </Route>
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
      </WalletProvider>
    </LanguageProvider>
  </AuthProvider>
  );
}

export default App;
