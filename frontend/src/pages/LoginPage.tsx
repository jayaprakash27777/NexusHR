import { useState, Suspense, lazy, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion'
import { useAuthStore } from '@/store'
import { authApi } from '@/api/auth'
import { Eye, EyeOff, ArrowRight, Sparkles, AlertCircle, Shield, Zap, Users, ChevronRight, Lock, Mail, Check } from 'lucide-react'

const NexusOrb = lazy(() => import('@/components/3d/NexusOrb'))

// Floating particles background
function FloatingParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(30)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: Math.random() * 3 + 1,
            height: Math.random() * 3 + 1,
            background: `rgba(${Math.random() > 0.5 ? '99,102,241' : '139,92,246'}, ${Math.random() * 0.3 + 0.1})`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, Math.random() * 20 - 10, 0],
            opacity: [0.2, 0.6, 0.2],
          }}
          transition={{
            duration: Math.random() * 5 + 4,
            repeat: Infinity,
            delay: Math.random() * 3,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}

// Animated statistics ticker
function StatsTicker() {
  const stats = [
    { label: 'Companies', value: '2,400+' },
    { label: 'Employees Managed', value: '1.2M' },
    { label: 'Uptime', value: '99.99%' },
    { label: 'Countries', value: '45+' },
  ]

  return (
    <div className="flex gap-8">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 + i * 0.1 }}
          className="text-center"
        >
          <p className="text-lg font-bold text-white">{stat.value}</p>
          <p className="text-[10px] text-white/40 uppercase tracking-wider">{stat.label}</p>
        </motion.div>
      ))}
    </div>
  )
}

const DEMO_ACCOUNTS = [
  { role: 'Super Admin', email: 'superadmin@nexushr.com', password: '123456', color: 'accent-violet', icon: Shield },
  { role: 'Admin', email: 'admin@nexushr.com', password: '123456', color: 'accent-violet', icon: Shield },
  { role: 'HR Director', email: 'hrdirector@nexushr.com', password: '123456', color: 'accent-indigo', icon: Users },
  { role: 'HR Executive', email: 'hrexecutive@nexushr.com', password: '123456', color: 'accent-indigo', icon: Users },
  { role: 'Finance Manager', email: 'financemanager@nexushr.com', password: '123456', color: 'accent-emerald', icon: Zap },
  { role: 'Department Manager', email: 'deptmanager@nexushr.com', password: '123456', color: 'accent-blue', icon: Users },
  { role: 'Team Lead', email: 'teamlead@nexushr.com', password: '123456', color: 'accent-blue', icon: Users },
  { role: 'Auditor', email: 'auditor@nexushr.com', password: '123456', color: 'accent-orange', icon: Eye },
  { role: 'Employee 1', email: 'employee1@nexushr.com', password: '123456', color: 'accent-teal', icon: Zap },
  { role: 'Employee 2', email: 'employee2@nexushr.com', password: '123456', color: 'accent-teal', icon: Zap },
]

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [focusedField, setFocusedField] = useState<string | null>(null)
  const [selectedDemo, setSelectedDemo] = useState<number | null>(null)
  const navigate = useNavigate()
  const login = useAuthStore((s) => s.login)

  // 3D card tilt
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const springX = useSpring(mouseX, { stiffness: 300, damping: 30 })
  const springY = useSpring(mouseY, { stiffness: 300, damping: 30 })
  const rotateX = useTransform(springY, [-0.5, 0.5], ['3deg', '-3deg'])
  const rotateY = useTransform(springX, [-0.5, 0.5], ['-3deg', '3deg'])

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5)
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5)
  }, [mouseX, mouseY])

  const handleMouseLeave = useCallback(() => {
    mouseX.set(0)
    mouseY.set(0)
  }, [mouseX, mouseY])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await authApi.login({ email, password })
      login(response.user, response.accessToken, response.refreshToken)
      navigate('/')
    } catch (err: any) {
      if (err?.code === 'ERR_NETWORK' || err?.message === 'Network Error') {
        setError('Unable to reach the server. Please check your internet connection or try again later.')
      } else if (err?.response?.status === 401) {
        setError('Invalid email or password. Please check your credentials.')
      } else if (err?.response?.status === 403) {
        setError('Your account has been locked. Please contact an administrator.')
      } else if (err?.response?.status >= 500) {
        setError('Server error. The backend may be starting up — please try again in a moment.')
      } else {
        const message = err?.response?.data?.message || err?.response?.data?.error || 'Login failed. Please try again.'
        setError(message)
      }
    } finally {
      setLoading(false)
    }
  }

  const fillDemoAccount = (index: number) => {
    const account = DEMO_ACCOUNTS[index]
    setEmail(account.email)
    setPassword(account.password)
    setSelectedDemo(index)
    setError(null)
  }

  return (
    <div className="relative flex min-h-screen overflow-hidden bg-[#06060e]">
      {/* Animated background */}
      <div className="pointer-events-none absolute inset-0 z-0">
        {/* Grid pattern */}
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(rgba(99,102,241,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.03) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }} />
        {/* Radial glows */}
        <div className="absolute top-0 left-1/4 h-[600px] w-[600px] rounded-full bg-accent-indigo/[0.07] blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 h-[500px] w-[500px] rounded-full bg-accent-violet/[0.05] blur-[150px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[400px] rounded-full bg-accent-blue/[0.03] blur-[120px]" />
        <FloatingParticles />
      </div>

      {/* Left Panel — Brand & 3D */}
      <div className="hidden lg:flex lg:flex-1 relative items-center justify-center">
        {/* 3D Orb */}
        <Suspense fallback={null}>
          <div className="absolute inset-0 opacity-60">
            <NexusOrb color="#6366f1" particleCount={80} />
          </div>
        </Suspense>

        <motion.div
          className="relative z-10 max-w-lg px-12"
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Logo mark */}
          <motion.div
            className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-accent-indigo to-accent-violet shadow-2xl shadow-accent-indigo/30"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 200, damping: 20 }}
          >
            <Sparkles className="h-7 w-7 text-white" />
          </motion.div>

          <motion.h2
            className="text-5xl font-bold text-white leading-tight tracking-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            Workforce
            <br />
            <span className="bg-gradient-to-r from-accent-indigo via-accent-violet to-accent-blue bg-clip-text text-transparent">
              Intelligence
            </span>
            <br />
            Platform
          </motion.h2>

          <motion.p
            className="mt-6 text-base text-white/50 leading-relaxed max-w-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            AI-powered HR management for modern enterprises. Streamline hiring, performance, payroll, and employee experience — all in one platform.
          </motion.p>

          {/* Feature pills */}
          <motion.div
            className="mt-8 flex flex-wrap gap-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            {['AI Analytics', 'RBAC Security', 'Real-time Insights', 'Multi-tenant'].map((feature, i) => (
              <motion.span
                key={feature}
                className="px-3 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm text-xs text-white/60 font-medium"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7 + i * 0.08 }}
              >
                {feature}
              </motion.span>
            ))}
          </motion.div>

          {/* Stats */}
          <motion.div
            className="mt-12 pt-8 border-t border-white/[0.06]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            <StatsTicker />
          </motion.div>
        </motion.div>
      </div>

      {/* Right Panel — Login Form */}
      <div className="flex flex-1 items-center justify-center px-6 py-12 lg:px-12">
        <motion.div
          className="w-full max-w-[420px]"
          initial={{ opacity: 0, y: 40, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Mobile branding */}
          <motion.div
            className="mb-8 text-center lg:hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-accent-indigo to-accent-violet shadow-xl shadow-accent-indigo/25">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">NexusHR</h1>
          </motion.div>

          {/* Welcome text */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h1 className="text-3xl font-bold tracking-tight text-white">
              Welcome back
            </h1>
            <p className="mt-2 text-sm text-white/40">
              Enter your credentials to access the dashboard
            </p>
          </motion.div>

          {/* Main card with 3D tilt */}
          <motion.div
            className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-8 backdrop-blur-2xl shadow-2xl shadow-black/40"
            style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Field */}
              <div>
                <label htmlFor="login-email" className="mb-2 block text-xs font-medium uppercase tracking-wider text-white/40">
                  Work Email
                </label>
                <div className={`relative rounded-xl border transition-all duration-300 ${focusedField === 'email'
                    ? 'border-accent-indigo/50 bg-accent-indigo/5 shadow-lg shadow-accent-indigo/10'
                    : 'border-white/[0.08] bg-white/[0.03] hover:border-white/[0.15]'
                  }`}>
                  <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors ${focusedField === 'email' ? 'text-accent-indigo' : 'text-white/20'
                    }`} />
                  <input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setSelectedDemo(null) }}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="admin@nexushr.com"
                    className="w-full bg-transparent pl-11 pr-4 py-3.5 text-sm text-white placeholder-white/20 outline-none"
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="login-password" className="mb-2 block text-xs font-medium uppercase tracking-wider text-white/40">
                  Password
                </label>
                <div className={`relative rounded-xl border transition-all duration-300 ${focusedField === 'password'
                    ? 'border-accent-indigo/50 bg-accent-indigo/5 shadow-lg shadow-accent-indigo/10'
                    : 'border-white/[0.08] bg-white/[0.03] hover:border-white/[0.15]'
                  }`}>
                  <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors ${focusedField === 'password' ? 'text-accent-indigo' : 'text-white/20'
                    }`} />
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setSelectedDemo(null) }}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="••••••••"
                    className="w-full bg-transparent pl-11 pr-12 py-3.5 text-sm text-white placeholder-white/20 outline-none"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/5 transition-all"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Remember + Forgot */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div className="h-4 w-4 rounded border border-white/[0.15] bg-white/[0.03] flex items-center justify-center group-hover:border-accent-indigo/50 transition-colors">
                    <input type="checkbox" className="sr-only peer" />
                  </div>
                  <span className="text-xs text-white/40 group-hover:text-white/60 transition-colors">Remember me</span>
                </label>
                <button type="button" className="text-xs text-accent-indigo/70 hover:text-accent-indigo transition-colors">
                  Forgot password?
                </button>
              </div>

              {/* Error Message */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                    exit={{ opacity: 0, y: -10, height: 0 }}
                    className="flex items-center gap-2.5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3"
                  >
                    <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0" />
                    <p className="text-xs text-red-300">{error}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={loading || !email || !password}
                className="group relative flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-accent-indigo to-accent-violet px-6 py-4 text-sm font-semibold text-white shadow-xl shadow-accent-indigo/25 transition-all duration-300 hover:shadow-2xl hover:shadow-accent-indigo/35 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
                whileHover={{ scale: loading ? 1 : 1.01 }}
                whileTap={{ scale: loading ? 1 : 0.99 }}
              >
                {/* Shimmer effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

                {loading ? (
                  <div className="flex items-center gap-3">
                    <motion.div
                      className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                    />
                    <span>Authenticating...</span>
                  </div>
                ) : (
                  <>
                    Sign in to Dashboard
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </>
                )}
              </motion.button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/[0.06]" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-[#0d0d1a] px-3 text-white/30 uppercase tracking-widest text-[10px]">Quick access</span>
              </div>
            </div>

            {/* Demo Account Buttons */}
            <div className="space-y-2 max-h-52 overflow-y-auto custom-scrollbar pr-2">
              {DEMO_ACCOUNTS.map((account, i) => {
                const Icon = account.icon
                const isSelected = selectedDemo === i
                return (
                  <motion.button
                    key={account.role}
                    type="button"
                    onClick={() => fillDemoAccount(i)}
                    className={`group relative flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all duration-300 ${isSelected
                        ? `border-${account.color}/30 bg-${account.color}/10`
                        : 'border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12] hover:bg-white/[0.04]'
                      }`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + i * 0.08 }}
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className={`flex h-9 w-9 items-center justify-center rounded-lg bg-${account.color}/10 border border-${account.color}/20`}>
                      <Icon className={`h-4 w-4 text-${account.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-white">{account.role}</p>
                      <p className="text-[10px] text-white/30 truncate">{account.email}</p>
                    </div>
                    {isSelected ? (
                      <div className={`flex h-6 w-6 items-center justify-center rounded-full bg-${account.color}/20`}>
                        <Check className={`h-3.5 w-3.5 text-${account.color}`} />
                      </div>
                    ) : (
                      <ChevronRight className="h-4 w-4 text-white/20 group-hover:text-white/40 transition-colors" />
                    )}
                  </motion.button>
                )
              })}
            </div>
          </motion.div>

          {/* Security badge */}
          <motion.div
            className="mt-6 flex items-center justify-center gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <div className="flex items-center gap-1.5">
              <Shield className="h-3 w-3 text-accent-emerald/50" />
              <span className="text-[10px] text-white/25">256-bit SSL</span>
            </div>
            <div className="h-3 w-px bg-white/10" />
            <div className="flex items-center gap-1.5">
              <Lock className="h-3 w-3 text-accent-emerald/50" />
              <span className="text-[10px] text-white/25">SOC 2 Compliant</span>
            </div>
            <div className="h-3 w-px bg-white/10" />
            <span className="text-[10px] text-white/25">NexusHR v2.0</span>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
