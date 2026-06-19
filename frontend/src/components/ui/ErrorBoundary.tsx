import { Component, ErrorInfo, ReactNode } from 'react'
import { AlertOctagon, RefreshCw } from 'lucide-react'
import { motion } from 'framer-motion'

interface Props {
  children?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo)
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null })
    window.location.reload()
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-nexus-950 p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md overflow-hidden rounded-[var(--radius-xl)] border border-danger/20 bg-danger/5 shadow-2xl backdrop-blur-xl"
          >
            <div className="flex flex-col items-center p-8 text-center">
              <div className="mb-4 rounded-full bg-danger/10 p-4">
                <AlertOctagon className="h-10 w-10 text-danger" />
              </div>
              <h1 className="mb-2 text-2xl font-bold tracking-tight text-nexus-50">
                Application Error
              </h1>
              <p className="mb-6 text-sm text-nexus-400">
                A critical error occurred while rendering this view. Our engineering team has been notified.
              </p>
              
              {this.state.error && (
                <div className="mb-6 w-full rounded-md bg-black/40 p-3 text-left">
                  <p className="font-mono text-[10px] text-danger/80 break-all">
                    {this.state.error.message}
                  </p>
                </div>
              )}

              <button
                onClick={this.handleReset}
                className="group flex w-full items-center justify-center gap-2 rounded-[var(--radius-lg)] bg-white/10 px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-white/20 active:scale-[0.98]"
              >
                <RefreshCw className="h-4 w-4 transition-transform group-hover:rotate-180" />
                Reload Application
              </button>
            </div>
          </motion.div>
        </div>
      )
    }

    return this.props.children
  }
}
