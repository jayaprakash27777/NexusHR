import React, { useEffect, useState } from 'react'
import { authApi, Session, LoginHistoryEntry } from '../../api/auth'
import { Laptop, Smartphone, Monitor, Trash2, Key, Shield, ShieldAlert, History } from 'lucide-react'
import PageTransition from '../../components/animation/PageTransition'
import GlassCard from '../../components/ui/GlassCard'

export default function SecurityCenter() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [history, setHistory] = useState<LoginHistoryEntry[]>([])
  const [loadingSessions, setLoadingSessions] = useState(true)
  const [loadingHistory, setLoadingHistory] = useState(true)
  
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [changingPassword, setChangingPassword] = useState(false)
  const [activeTab, setActiveTab] = useState<'devices' | 'history' | 'password'>('devices')

  useEffect(() => {
    fetchSessions()
    fetchHistory()
  }, [])

  const fetchSessions = async () => {
    try {
      setLoadingSessions(true)
      const data = await authApi.getSessions()
      setSessions(data)
    } catch (error) {
      console.error('Failed to load active sessions', error)
    } finally {
      setLoadingSessions(false)
    }
  }

  const fetchHistory = async () => {
    try {
      setLoadingHistory(true)
      const data = await authApi.getLoginHistory(0, 20)
      setHistory(data.content)
    } catch (error) {
      console.error('Failed to load login history', error)
    } finally {
      setLoadingHistory(false)
    }
  }

  const handleRevoke = async (id: number) => {
    if (!window.confirm('Are you sure you want to sign out this device?')) return
    try {
      await authApi.revokeSession(id)
      fetchSessions()
    } catch (error) {
      console.error('Failed to revoke session', error)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      alert('The two passwords do not match!')
      return
    }
    try {
      setChangingPassword(true)
      await authApi.changePassword({
        currentPassword,
        newPassword
      })
      alert('Password changed successfully')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to change password')
    } finally {
      setChangingPassword(false)
    }
  }

  const getDeviceIcon = (deviceType?: string) => {
    if (!deviceType) return <Monitor className="w-8 h-8 text-indigo-400" />
    const dt = deviceType.toLowerCase()
    if (dt.includes('mobile') || dt.includes('phone')) return <Smartphone className="w-8 h-8 text-indigo-400" />
    if (dt.includes('mac') || dt.includes('windows')) return <Laptop className="w-8 h-8 text-indigo-400" />
    return <Monitor className="w-8 h-8 text-indigo-400" />
  }

  return (
    <PageTransition>
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Security Center</h1>
          <p className="text-slate-400">Manage your password, active devices, and view recent login activity.</p>
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 border-b border-white/10 pb-2">
          <button 
            onClick={() => setActiveTab('devices')}
            className={`flex items-center px-4 py-2 font-medium rounded-lg transition-colors ${activeTab === 'devices' ? 'bg-indigo-500/20 text-indigo-400' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
          >
            <Shield className="w-4 h-4 mr-2" /> Active Devices
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`flex items-center px-4 py-2 font-medium rounded-lg transition-colors ${activeTab === 'history' ? 'bg-indigo-500/20 text-indigo-400' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
          >
            <History className="w-4 h-4 mr-2" /> Login History
          </button>
          <button 
            onClick={() => setActiveTab('password')}
            className={`flex items-center px-4 py-2 font-medium rounded-lg transition-colors ${activeTab === 'password' ? 'bg-indigo-500/20 text-indigo-400' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
          >
            <Key className="w-4 h-4 mr-2" /> Password & Authentication
          </button>
        </div>

        {/* Tab Contents */}
        {activeTab === 'devices' && (
          <GlassCard className="p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Active Devices</h2>
            <p className="text-slate-400 mb-6">These are the devices that are currently logged in to your account. Revoke any unrecognized sessions.</p>
            
            {loadingSessions ? (
              <div className="text-slate-400">Loading sessions...</div>
            ) : (
              <div className="space-y-4">
                {sessions.map(session => (
                  <div key={session.id} className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl">
                    <div className="flex items-center space-x-4">
                      {getDeviceIcon(session.deviceType)}
                      <div>
                        <div className="font-semibold text-white">{session.deviceType || 'Unknown Device'}</div>
                        <div className="text-sm text-slate-400">{session.userAgent || 'Unknown Browser'}</div>
                        <div className="text-xs text-slate-500 mt-1">IP: {session.ipAddress} • Started: {new Date(session.createdAt).toLocaleString()}</div>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleRevoke(session.id)}
                      className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors flex items-center"
                    >
                      <Trash2 className="w-4 h-4 mr-2" /> Revoke
                    </button>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        )}

        {activeTab === 'history' && (
          <GlassCard className="p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Recent Login Activity</h2>
            
            {loadingHistory ? (
              <div className="text-slate-400">Loading history...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-white/10 text-slate-400">
                      <th className="pb-3 font-medium">Date & Time</th>
                      <th className="pb-3 font-medium">IP Address</th>
                      <th className="pb-3 font-medium">Browser / Device</th>
                      <th className="pb-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map(item => (
                      <tr key={item.id} className="border-b border-white/5 text-slate-300">
                        <td className="py-4">{new Date(item.createdAt).toLocaleString()}</td>
                        <td className="py-4">{item.ipAddress}</td>
                        <td className="py-4 max-w-xs truncate" title={item.userAgent}>{item.userAgent}</td>
                        <td className="py-4">
                          {item.status === 'SUCCESS' ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              Success
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
                              {item.failureReason || 'Failed'}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </GlassCard>
        )}

        {activeTab === 'password' && (
          <div className="max-w-xl">
            <GlassCard className="p-6">
              <h2 className="text-xl font-semibold text-white mb-6">Change Password</h2>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Current Password</label>
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">New Password</label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={changingPassword}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {changingPassword ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </form>
            </GlassCard>
          </div>
        )}

      </div>
    </PageTransition>
  )
}
