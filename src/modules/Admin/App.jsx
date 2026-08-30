import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import Layout from './components/Layout';
import OperationsDashboard from './pages/OperationsDashboard';

// Optional: Protected Route Wrapper if you want to keep authentication logic
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;
  if (!user || user.role !== 'admin') {
    window.location.href = '/';
    return null;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <Router basename="/admin">
          <Routes>
            {/* Protected Layout Routes */}
            <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              {/* Redirect / to /dashboard */}
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<OperationsDashboard />} />
              <Route path="operations" element={<OperationsDashboard />} />
            </Route>
            
            {/* Fallback */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Router>
      </LanguageProvider>
    </AuthProvider>
  );
}

export default App;
