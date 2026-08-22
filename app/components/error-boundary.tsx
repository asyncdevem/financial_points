"use client";

import { Component, ReactNode } from "react";
import { Icon } from "./icons";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: any;
}

/**
 * Error Boundary Component
 * 
 * Catches JavaScript errors anywhere in the child component tree,
 * logs the errors, and displays a fallback UI instead of crashing.
 * 
 * Usage:
 * <ErrorBoundary>
 *   <MyComponent />
 * </ErrorBoundary>
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    // Log error to console (in production, send to error tracking service)
    console.error("Error Boundary caught an error:", error, errorInfo);
    
    // TODO: Send to error tracking service (Sentry, Datadog, etc.)
    // Example:
    // Sentry.captureException(error, { extra: errorInfo });
    
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div className="flex min-h-screen items-center justify-center bg-[#0a0f1e] px-4">
          <div className="w-full max-w-md space-y-6 rounded-lg border border-[#1e2633] bg-[#131a29] p-8 text-center">
            <div className="flex justify-center">
              <div className="rounded-full bg-red-500/10 p-4">
                <div className="h-12 w-12 text-red-500">
                  <Icon name="x" size={48} />
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-[#f0f2f5]">
                Something went wrong
              </h1>
              <p className="text-[#94a3b8]">
                An unexpected error occurred. We apologize for the inconvenience.
              </p>
            </div>

            {process.env.NODE_ENV === "development" && this.state.error && (
              <div className="mt-4 rounded-lg bg-[#0a0f1e] p-4 text-left">
                <p className="mb-2 text-sm font-semibold text-red-400">
                  Error Details (Development Only):
                </p>
                <pre className="overflow-auto text-xs text-[#94a3b8]">
                  {this.state.error.toString()}
                  {this.state.errorInfo && (
                    <>
                      {"\n\n"}
                      {this.state.errorInfo.componentStack}
                    </>
                  )}
                </pre>
              </div>
            )}

            <div className="flex flex-col gap-3 pt-4">
              <button
                onClick={this.handleReset}
                className="rounded-lg bg-emerald-600 px-6 py-3 font-semibold text-white transition hover:bg-emerald-700"
              >
                Try Again
              </button>
              
              <button
                onClick={() => window.location.href = "/dashboard"}
                className="rounded-lg border border-[#1e2633] bg-transparent px-6 py-3 font-semibold text-[#f0f2f5] transition hover:border-emerald-600 hover:text-emerald-600"
              >
                Go to Dashboard
              </button>
              
              <button
                onClick={() => window.location.reload()}
                className="text-sm text-[#94a3b8] transition hover:text-emerald-600"
              >
                Reload Page
              </button>
            </div>

            <p className="text-xs text-[#64748b]">
              If this problem persists, please contact support.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Async Error Boundary Wrapper
 * 
 * For wrapping async operations that might throw errors
 */
export function AsyncErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      fallback={
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="h-16 w-16 text-red-500">
                <Icon name="x" size={64} />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-[#f0f2f5]">
              Failed to load content
            </h3>
            <p className="text-[#94a3b8]">
              Please try refreshing the page
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 rounded-lg bg-emerald-600 px-6 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
            >
              Refresh
            </button>
          </div>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );
}

/**
 * Page Error Boundary
 * 
 * Specialized error boundary for full pages
 */
export function PageErrorBoundary({ children }: { children: ReactNode }) {
  return <ErrorBoundary>{children}</ErrorBoundary>;
}
