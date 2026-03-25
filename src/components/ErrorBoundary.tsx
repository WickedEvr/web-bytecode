// ✅ ErrorBoundary.tsx — Fix 7: Error Boundary global como class component
import React, { ErrorInfo } from 'react';

interface State {
  hasError: boolean;
}

class ErrorBoundary extends React.Component<React.PropsWithChildren, State> {
  constructor(props: React.PropsWithChildren) {
    super(props);
    this.state = { hasError: false };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary atrapó un error:', error, info);
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: '1rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Algo salió mal</h1>
          <button
            onClick={() => window.location.reload()}
            style={{ padding: '0.75rem 2rem', borderRadius: '9999px', background: '#00f0ff', color: '#000', fontWeight: 'bold', cursor: 'pointer', border: 'none' }}
          >
            Recargar página
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
