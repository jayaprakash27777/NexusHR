import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Lock, ArrowLeft, CheckCircle2, ShieldCheck, ShieldAlert } from 'lucide-react'

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token')

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  
  // Basic strength calculation
  const strength = password.length === 0 ? 0 :
                   password.length < 6 ? 1 :
                   password.length < 10 ? 2 :
                   /[A-Z]/.test(password) && /[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password) ? 4 : 3

  useEffect(() => {
    // In a real app, we'd validate the token immediately
    if (!token) {
      // simulate invalid token redirect
      // navigate('/login')
    }
  }, [token, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) return

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
          Create New Password
        </h2>
        <p className="mt-2 text-center text-sm text-neutral-600 dark:text-neutral-400">
          Your new password must be different from previous used passwords.
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
              <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-2">Password Reset Successfully</h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6">
                You can now use your new password to log in to your account.
              </p>
              <Link 
                to="/login"
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transition-colors"
              >
                Continue to Login
              </Link>
            </motion.div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              
              {!token && (
                <div className="rounded-md bg-yellow-50 dark:bg-yellow-900/30 p-4 border border-yellow-200 dark:border-yellow-800/50">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <ShieldAlert className="h-5 w-5 text-yellow-400" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-300">Invalid Token</h3>
                      <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-400">
                        <p>The password reset link is invalid or has expired.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  New Password
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-neutral-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:ring-brand-500 focus:border-brand-500 sm:text-sm bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white placeholder-neutral-400 transition-colors"
                  />
                </div>
                {/* Password Strength Indicator */}
                {password.length > 0 && (
                  <div className="mt-2 flex space-x-1">
                    {[1, 2, 3, 4].map((level) => (
                      <div 
                        key={level} 
                        className={`h-1.5 w-full rounded-full transition-colors duration-300 ${
                          strength >= level 
                            ? strength === 1 ? 'bg-red-500' 
                            : strength === 2 ? 'bg-yellow-500' 
                            : strength === 3 ? 'bg-green-400' 
                            : 'bg-green-600'
                            : 'bg-neutral-200 dark:bg-neutral-800'
                        }`} 
                      />
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Confirm Password
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <ShieldCheck className="h-5 w-5 text-neutral-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`block w-full pl-10 pr-3 py-2.5 border rounded-lg focus:ring-brand-500 focus:border-brand-500 sm:text-sm bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white placeholder-neutral-400 transition-colors ${
                      confirmPassword && password !== confirmPassword 
                        ? 'border-red-300 dark:border-red-700 focus:border-red-500 focus:ring-red-500' 
                        : 'border-neutral-300 dark:border-neutral-700'
                    }`}
                  />
                </div>
                {confirmPassword && password !== confirmPassword && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">Passwords do not match.</p>
                )}
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading || !password || password !== confirmPassword || strength < 2}
                  className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Resetting...</span>
                    </div>
                  ) : (
                    'Reset Password'
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
