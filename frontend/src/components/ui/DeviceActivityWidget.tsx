import { Monitor, Smartphone, Globe, ShieldCheck } from 'lucide-react'
import GlassCard from '@/components/ui/GlassCard'
import { formatDistanceToNow } from '@/lib/dateUtils'

const activeDevices = [
  {
    id: 'dev1',
    device: 'MacBook Pro 16"',
    browser: 'Chrome 124.0',
    location: 'San Francisco, CA',
    ip: '192.168.1.42',
    lastActive: new Date(),
    isCurrent: true,
    type: 'desktop'
  },
  {
    id: 'dev2',
    device: 'iPhone 15 Pro',
    browser: 'Safari Mobile',
    location: 'San Francisco, CA',
    ip: '10.0.0.15',
    lastActive: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    isCurrent: false,
    type: 'mobile'
  }
]

export default function DeviceActivityWidget() {
  return (
    <GlassCard glow="indigo" className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-nexus-100 flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-accent-indigo" /> Security & Devices
          </h3>
          <p className="text-sm text-nexus-400 mt-1">Manage active sessions and security alerts</p>
        </div>
        <button className="text-xs font-semibold text-accent-indigo hover:text-indigo-400 transition-colors">
          Sign out all other sessions
        </button>
      </div>

      <div className="space-y-4">
        {activeDevices.map(dev => (
          <div key={dev.id} className="flex items-start gap-4 rounded-xl border border-white/5 bg-white/5 p-4 transition-colors hover:bg-white/10">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-nexus-900 shadow-inner">
              {dev.type === 'desktop' ? (
                <Monitor className="h-5 w-5 text-nexus-300" />
              ) : (
                <Smartphone className="h-5 w-5 text-nexus-300" />
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-nexus-50">{dev.device}</p>
                {dev.isCurrent && (
                  <span className="rounded-full bg-success/20 px-2 py-0.5 text-[10px] font-bold text-success border border-success/30">
                    Current Session
                  </span>
                )}
              </div>
              <p className="text-xs text-nexus-400 mt-1">
                {dev.browser} • {dev.location}
              </p>
              <div className="mt-2 flex items-center gap-4 text-[10px] text-nexus-500">
                <span className="flex items-center gap-1">
                  <Globe className="h-3 w-3" /> {dev.ip}
                </span>
                <span>
                  Last active {formatDistanceToNow(dev.lastActive, { addSuffix: true })}
                </span>
              </div>
            </div>
            
            {!dev.isCurrent && (
              <button className="rounded border border-white/10 px-3 py-1.5 text-xs font-medium text-nexus-300 hover:bg-white/10 hover:text-danger transition-colors">
                Revoke
              </button>
            )}
          </div>
        ))}
      </div>
    </GlassCard>
  )
}
