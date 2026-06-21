import { useState, Suspense, lazy } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuthStore } from '@/store'
import { authApi } from '@/api/auth'
import { Eye, EyeOff, ArrowRight, Sparkles, AlertCircle } from 'lucide-react'

const NexusOrb = lazy(() => import('@/components/3d/NexusOrb'))

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()
  const login = useAuthStore((s) => s.login)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await authApi.login({ email, password })
      login(response.user, response.accessToken, response.refreshToken)
      navigate('/dashboard')
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Invalid credentials. Please try again.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-nexus-950">
      {/* 3D Particle Globe Background */}
      <Suspense fallback={null}>
        <NexusOrb color="#6366f1" particleCount={150} />
      </Suspense>

      {/* Animated background */}
      <div className="pointer-events-none absolute inset-0">
        {/* Large gradient orbs */}
        <motion.div
          className="absolute top-1/4 left-1/4 h-[500px] w-[500px] rounded-full bg-accent-indigo/[0.07] blur-[150px]"
          animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 h-[400px] w-[400px] rounded-full bg-accent-violet/[0.05] blur-[130px]"
          animate={{ x: [0, -20, 0], y: [0, 30, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      {/* Login card */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Branding */}
        <motion.div
          className="mb-10 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-accent-indigo to-accent-violet shadow-xl shadow-accent-indigo/25">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-nexus-50">
            Welcome back
          </h1>
          <p className="mt-2 text-sm text-nexus-400">
            Sign in to NexusHR Workforce Intelligence
          </p>
        </motion.div>

        {/* Form card */}
        <motion.div
          className="rounded-[var(--radius-2xl)] border border-white/[0.06] bg-white/[0.03] p-8 backdrop-blur-xl shadow-2xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label htmlFor="email" className="mb-2 block text-xs font-medium uppercase tracking-wider text-nexus-400">
                Work Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@nexushr.com"
                className="w-full rounded-[var(--radius-lg)] border border-white/[0.06] bg-white/[0.03] px-4 py-3 text-sm text-nexus-100 placeholder-nexus-600 outline-none transition-all duration-200 focus:border-accent-indigo/50 focus:bg-white/[0.05] focus:ring-2 focus:ring-accent-indigo/20"
                autoComplete="email"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="mb-2 block text-xs font-medium uppercase tracking-wider text-nexus-400">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-[var(--radius-lg)] border border-white/[0.06] bg-white/[0.03] px-4 py-3 pr-12 text-sm text-nexus-100 placeholder-nexus-600 outline-none transition-all duration-200 focus:border-accent-indigo/50 focus:bg-white/[0.05] focus:ring-2 focus:ring-accent-indigo/20"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-nexus-500 hover:text-nexus-300 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Remember + Forgot */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-white/10 bg-white/5 text-accent-indigo focus:ring-accent-indigo/30"
                />
                <span className="text-xs text-nexus-400">Remember me</span>
              </label>
              <button type="button" className="text-xs text-accent-indigo hover:text-accent-indigo/80 transition-colors">
                Forgot password?
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 rounded-lg border border-danger/30 bg-danger/10 px-4 py-3">
                <AlertCircle className="h-4 w-4 text-danger flex-shrink-0" />
                <p className="text-xs text-danger">{error}</p>
              </div>
            )}

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={loading || !email || !password}
              className="group relative flex w-full items-center justify-center gap-2 rounded-[var(--radius-lg)] bg-gradient-to-r from-accent-indigo to-accent-violet px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-accent-indigo/25 transition-all duration-300 hover:shadow-xl hover:shadow-accent-indigo/30 disabled:opacity-70"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              {loading ? (
                <motion.div
                  className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                />
              ) : (
                <>
                  Sign in
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </>
              )}
            </motion.button>
          </form>

          {/* Demo accounts */}
          <div className="mt-6 rounded-[var(--radius-lg)] border border-white/[0.04] bg-white/[0.02] p-4">
            <p className="mb-2 text-[10px] font-medium uppercase tracking-widest text-nexus-500">Demo Accounts</p>
            <div className="space-y-1.5 text-xs text-nexus-400">
              <p><span className="text-nexus-300">Admin:</span> admin@nexushr.com / Admin@123</p>
              <p><span className="text-nexus-300">Manager:</span> manager@nexushr.com / Manager@123</p>
              <p><span className="text-nexus-300">Employee:</span> employee@nexushr.com / Employee@123</p>
            </div>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.p
          className="mt-8 text-center text-xs text-nexus-600"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          NexusHR v1.0 · Enterprise HR Intelligence Platform
        </motion.p>
      </motion.div>
    </div>
  )
}
