import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCcw } from 'lucide-react';
import { Button } from './ui/button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-gray-800 border border-gray-700 rounded-2xl p-8 text-center space-y-6 shadow-2xl">
            <div className="h-20 w-20 rounded-full bg-red-950/30 flex items-center justify-center mx-auto">
              <AlertCircle className="h-10 w-10 text-red-500" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-gray-100">Algo deu errado</h1>
              <p className="text-gray-400 text-sm">
                Ocorreu um erro inesperado na aplicação. Tente recarregar a página.
              </p>
              {this.state.error && (
                <div className="mt-4 p-3 bg-gray-900 rounded-lg text-left overflow-auto max-h-32">
                  <code className="text-xs text-red-400">{this.state.error.message}</code>
                </div>
              )}
            </div>
            <Button 
              onClick={this.handleReset} 
              className="w-full gap-2 bg-blue-500 hover:bg-blue-600"
            >
              <RefreshCcw className="h-4 w-4" />
              Recarregar Aplicação
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
