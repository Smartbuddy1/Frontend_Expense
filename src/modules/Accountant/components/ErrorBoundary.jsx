import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("React ErrorBoundary caught an error:", error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          textAlign: 'center',
          backgroundColor: 'var(--bg-color, #f8fafc)',
          color: 'var(--text-primary, #0f172a)'
        }}>
          <div style={{
            backgroundColor: 'var(--surface-bg, #ffffff)',
            borderRadius: '20px',
            padding: '2.5rem',
            maxWidth: '520px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
            border: '1px solid var(--border-color, #e2e8f0)'
          }}>
            <AlertTriangle size={48} color="#ef4444" style={{ margin: '0 auto 1rem' }} />
            <h2 style={{ fontSize: '1.4rem', fontWeight: '800', margin: '0 0 0.5rem' }}>
              Page Refresh Required
            </h2>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary, #64748b)', lineHeight: '1.5', margin: '0 0 1.5rem' }}>
              The application state was updated. Please refresh the page to load the latest dashboard components.
            </p>
            {this.state.error && (
              <div style={{
                textAlign: 'left',
                backgroundColor: 'rgba(239, 68, 68, 0.06)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                borderRadius: '10px',
                padding: '0.75rem 1rem',
                margin: '0 0 1.25rem',
                fontSize: '0.78rem',
                color: '#dc2626',
                fontFamily: 'monospace',
                maxHeight: '120px',
                overflowY: 'auto'
              }}>
                {this.state.error.toString()}
              </div>
            )}
            <button
              onClick={this.handleReload}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: '#2563eb',
                color: '#ffffff',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '12px',
                fontWeight: '700',
                fontSize: '0.9rem',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
              }}
            >
              <RefreshCw size={16} />
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
