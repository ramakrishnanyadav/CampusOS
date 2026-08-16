import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';

interface Props {
  children: ReactNode;
  moduleName?: string;
  onRetry?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * ErrorBoundary implemented as a class component (React requirement for error boundaries).
 *
 * NOTE: explicit `declare` for `props`/`state`/`setState` is required because this project
 * has `useDefineForClassFields: false` + `experimentalDecorators: true` in tsconfig.json,
 * which causes TypeScript 5 not to inherit those members automatically from Component<P,S>.
 */
export class ErrorBoundary extends Component<Props, State> {
  // Explicit declarations required by useDefineForClassFields: false + experimentalDecorators
  declare props: Props;
  declare state: State;
  declare setState: Component<Props, State>['setState'];

  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
    this.handleRetry = this.handleRetry.bind(this);
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error(
      `CampusOS ErrorBoundary caught an exception in [${this.props.moduleName ?? 'App Root'}]:`,
      error,
      errorInfo
    );
    this.setState({ errorInfo });
  }

  handleRetry(): void {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onRetry) {
      this.props.onRetry();
    }
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <Card variant="glass" className="p-8 border-2 border-rose-200 bg-rose-50/40 text-center space-y-4 my-4 shadow-xl">
          <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6" />
          </div>

          <div className="space-y-1">
            <h3 className="text-lg font-extrabold text-slate-900">
              {this.props.moduleName
                ? `${this.props.moduleName} Experienced an Error`
                : 'Module Render Interrupted'}
            </h3>
            <p className="text-xs text-slate-600 max-w-md mx-auto font-medium">
              An uncaught component error occurred. CampusOS recovered safely without crashing the main application runtime.
            </p>
          </div>

          {this.state.error !== null && (
            <div className="p-3 bg-slate-900 text-rose-300 font-mono text-[11px] rounded-xl text-left max-w-xl mx-auto overflow-x-auto border border-slate-800">
              <strong>Error:</strong> {this.state.error.toString()}
            </div>
          )}

          <div className="pt-2 flex justify-center gap-3">
            <Button
              variant="primary"
              size="sm"
              leftIcon={<RefreshCw className="w-4 h-4" />}
              onClick={this.handleRetry}
            >
              Retry &amp; Reload Module
            </Button>
          </div>
        </Card>
      );
    }

    return this.props.children;
  }
}
