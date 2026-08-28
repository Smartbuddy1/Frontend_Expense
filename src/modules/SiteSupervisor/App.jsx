import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { WalletProvider } from './context/WalletContext';
import { LanguageProvider } from './context/LanguageContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import AssignedProjects from './pages/AssignedProjects';
import RequestAdvance from './pages/RequestAdvance';
import DailyExpenses from './pages/DailyExpensesNew';
import UploadBills from './pages/UploadBills';
import BalanceSettlement from './pages/BalanceSettlement';
import PublicExpenseForm from './pages/PublicExpenseForm';

// Optional: Protected Route Wrapper if you want to keep authentication logic
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;
  if (!user) {
    window.location.href = '/';
    return null;
  }
  
  return children;
};

function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <WalletProvider>
          <Router basename="/supervisor">
            <Routes>
          {/* Public Routes */}
          <Route path="/expense-form" element={<PublicExpenseForm />} />
          
          {/* Protected Layout Routes */}
          <Route path="/" element={<Layout />}>
            {/* Redirect / to /dashboard */}
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="assigned-projects" element={<AssignedProjects />} />
            <Route path="request-advance" element={<RequestAdvance />} />
            <Route path="daily-expenses" element={<DailyExpenses />} />
            <Route path="upload-bills" element={<UploadBills />} />
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
