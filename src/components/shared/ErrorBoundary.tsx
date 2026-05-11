import React, { Suspense, lazy, type ErrorInfo } from 'react';

const ErrorFallback = lazy(() => import('./ErrorFallback'));

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<React.PropsWithChildren, State> {
  constructor(props: React.PropsWithChildren) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary atrapo un error:', error, info);
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <Suspense fallback={<div className="min-h-screen bg-black" />}>
        <ErrorFallback />
      </Suspense>
    );
  }
}

export default ErrorBoundary;
