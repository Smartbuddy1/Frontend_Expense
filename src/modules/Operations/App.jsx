import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import OperationsDashboard from './pages/OperationsDashboard';

// Optional: Protected Route Wrapper if you want to keep authentication logic
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  
  return children;
};

function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <Router basename="/operations">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            
            {/* Protected Layout Routes */}
            <Route path="/" element={<Layout />}>
              {/* Redirect / to /operations */}
              <Route index element={<Navigate to="/operations" replace />} />
              <Route path="operations" element={<OperationsDashboard />} />
              <Route path="dashboard" element={<OperationsDashboard />} />
            </Route>
            
            {/* Fallback */}
            <Route path="*" element={<Navigate to="/operations" replace />} />
          </Routes>
        </Router>
      </LanguageProvider>
    </AuthProvider>
  );
}

export default App;

