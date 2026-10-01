import React, { Component } from 'react';
import DashboardShell from './components/layout/DashboardShell';
import DashboardPage from './pages/DashboardPage';
import { TelemetryProvider } from './context/TelemetryContext';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Unhandled error in Supervisor Dashboard:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-dark-900 text-white p-6">
          <div className="max-w-md w-full glass-panel border border-red-500/30 rounded-2xl p-6 text-center shadow-xl">
            <div className="w-12 h-12 bg-red-500/20 text-red-400 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">!</div>
            <h2 className="text-xl font-semibold mb-2">Telemetry Link Interrupted</h2>
            <p className="text-sm text-slate-400 mb-6 font-mono">{this.state.error?.message || 'An unexpected rendering error occurred.'}</p>
            <button
              onClick={() => {
                window.location.reload();
              }}
              className="px-5 py-2.5 rounded-xl bg-pqc/20 border border-pqc text-pqc hover:bg-pqc hover:text-black font-medium transition-all"
            >
              Reconnect & Reload Dashboard
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  return (
    <ErrorBoundary>
      <TelemetryProvider>
        <DashboardShell>
          <DashboardPage />
        </DashboardShell>
      </TelemetryProvider>
    </ErrorBoundary>
  );
}

export default App;
