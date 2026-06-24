import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    setIsLoading(false)
    setIsSubmitted(true)
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden transition-colors duration-300">
      
      {/* Background Orbs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-brand-500/20 rounded-full blur-3xl opacity-50 dark:opacity-30"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[30rem] h-[30rem] bg-indigo-500/20 rounded-full blur-3xl opacity-50 dark:opacity-30"></div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-12 h-12 bg-gradient-to-br from-brand-600 to-indigo-600 rounded-xl shadow-lg flex items-center justify-center transform rotate-3 hover:rotate-6 transition-transform">
            <span className="text-white font-bold text-xl tracking-tighter">NX</span>
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
          Reset Password
        </h2>
        <p className="mt-2 text-center text-sm text-neutral-600 dark:text-neutral-400">
          Enter your email and we'll send you a recovery link
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/70 dark:bg-neutral-900/70 backdrop-blur-xl py-8 px-4 shadow-2xl sm:rounded-2xl sm:px-10 border border-neutral-200/50 dark:border-neutral-800/50"
        >
          {isSubmitted ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
                <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-2">Check your inbox</h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6">
                We've sent a password reset link to <span className="font-semibold">{email}</span>.
              </p>
              <Link 
                to="/login"
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transition-colors"
              >
                Return to Login
              </Link>
            </motion.div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Email address
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-neutral-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:ring-brand-500 focus:border-brand-500 sm:text-sm bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white placeholder-neutral-400 transition-colors"
                    placeholder="you@company.com"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Sending link...</span>
                    </div>
                  ) : (
                    'Send Reset Link'
                  )}
                </button>
              </div>

              <div className="text-sm text-center">
                <Link to="/login" className="font-medium text-brand-600 hover:text-brand-500 dark:text-brand-400 dark:hover:text-brand-300 inline-flex items-center space-x-1 transition-colors">
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to login</span>
                </Link>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  )
}
