import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Error Boundary para capturar errores en el árbol de componentes de React
 * Previene que toda la aplicación se rompa por un error en un componente
 */
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });

    // Aquí puedes enviar el error a un servicio de logging como Sentry
    // logErrorToService(error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-gray-800 rounded-lg shadow-2xl border border-red-500 p-8">
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold text-red-400 mb-2">
                Algo salió mal
              </h1>
              <p className="text-gray-300 mb-4">
                Lo sentimos, ocurrió un error inesperado en la aplicación.
              </p>
            </div>

            {this.state.error && (
              <div className="bg-gray-900 rounded-lg p-4 mb-6">
                <h2 className="text-lg font-semibold text-red-400 mb-2">
                  Error:
                </h2>
                <pre className="text-sm text-gray-300 overflow-x-auto">
                  {this.state.error.toString()}
                </pre>

                {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
                  <>
                    <h3 className="text-md font-semibold text-red-400 mt-4 mb-2">
                      Stack trace:
                    </h3>
                    <pre className="text-xs text-gray-400 overflow-x-auto">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </>
                )}
              </div>
            )}

            <div className="flex gap-4 justify-center">
              <button
                onClick={this.handleReset}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors"
              >
                Intentar de nuevo
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
              >
                Recargar página
              </button>
            </div>

            <div className="mt-6 text-center text-sm text-gray-400">
              <p>
                Si el problema persiste, intenta limpiar el caché del navegador o{' '}
                <a
                  href="https://github.com/anthropics/claude-code/issues"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-400 hover:text-purple-300 underline"
                >
                  reporta el problema
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
