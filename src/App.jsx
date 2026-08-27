import React from 'react';
import AdminApp from './modules/Admin/App';
import AccountantApp from './modules/Accountant/App';
import SupervisorApp from './modules/SiteSupervisor/App';
import OperationsApp from './modules/Operations/App';

function App() {
  const path = window.location.pathname;

  if (path.startsWith('/admin')) {
    return <AdminApp />;
  }
  if (path.startsWith('/accountant')) {
    return <AccountantApp />;
  }
  if (path.startsWith('/supervisor')) {
    return <SupervisorApp />;
  }
  if (path.startsWith('/operations')) {
    return <OperationsApp />;
  }

  // Aarya Site Expense Management System (ASEMS) Landing Page
  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1>Aarya Site Expense Management System (ASEMS)</h1>
        <p>Select a module to continue:</p>
      </header>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
        <a href="/admin" style={cardStyle}>
          <h2>Admin Dashboard</h2>
          <p>System configuration, user management, and overall view.</p>
        </a>
        
        <a href="/operations" style={cardStyle}>
          <h2>Operations Dashboard</h2>
          <p>Project creation, tracking, and operational approvals.</p>
        </a>
        
        <a href="/accountant" style={cardStyle}>
          <h2>Accountant Dashboard</h2>
          <p>Budget allocation, expense verification, and settlements.</p>
        </a>
        
        <a href="/supervisor" style={cardStyle}>
          <h2>Site Supervisor</h2>
          <p>Daily expenses, advance requests, and bill uploads.</p>
        </a>
        
        <a href="/supervisor/expense-form" style={{...cardStyle, backgroundColor: '#f0fdf4', borderColor: '#bbf7d0'}}>
          <h2>Public Expense Form</h2>
          <p>Submit expenses without logging in.</p>
        </a>
      </div>
    </div>
  );
}

const cardStyle = {
  border: '1px solid #e5e7eb',
  borderRadius: '0.5rem',
  padding: '1.5rem',
  textDecoration: 'none',
  color: '#333',
  display: 'block',
  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
};

export default App;
