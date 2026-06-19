import { useState } from 'react'
import { Settings, Palette, Globe, Layers, Save, Building2 } from 'lucide-react'
import PageTransition from '@/components/animation/PageTransition'
import GlassCard from '@/components/ui/GlassCard'
import { useTenantStore } from '@/store/tenant'
import { toast } from '@/store/toast'

export default function TenantSettings() {
  const { tenant, setTenant } = useTenantStore()
  const [formData, setFormData] = useState(tenant)

  const handleSave = () => {
    setTenant(formData)
    toast.success('Tenant Settings Saved', 'White label configuration updated globally.')
  }

  return (
    <PageTransition className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-nexus-50 flex items-center gap-2">
            <Building2 className="h-6 w-6 text-accent-indigo" />
            Tenant Configuration
          </h1>
          <p className="text-sm text-nexus-400 mt-1">Manage global white-labeling, custom domains, and platform branding.</p>
        </div>
        <button 
          onClick={handleSave}
          className="flex items-center gap-2 rounded-lg bg-accent-indigo px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-indigo-500 shadow-lg shadow-indigo-500/20"
        >
          <Save className="h-4 w-4" /> Save Configuration
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* General Info */}
        <div className="lg:col-span-2 space-y-6">
          <GlassCard className="p-6">
            <h2 className="text-lg font-semibold text-nexus-100 flex items-center gap-2 mb-6">
              <Globe className="h-5 w-5 text-accent-cyan" /> General Identity
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-nexus-300">Company Name</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-lg border border-white/10 bg-nexus-900/50 px-4 py-2 text-sm text-white focus:border-accent-indigo focus:outline-none focus:ring-1 focus:ring-accent-indigo"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-nexus-300">Custom Domain</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-nexus-500 text-sm">https://</span>
                  <input 
                    type="text" 
                    value={formData.domain}
                    onChange={e => setFormData({ ...formData, domain: e.target.value })}
                    className="w-full rounded-lg border border-white/10 bg-nexus-900/50 pl-16 pr-4 py-2 text-sm text-white focus:border-accent-indigo focus:outline-none focus:ring-1 focus:ring-accent-indigo"
                  />
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Theme & Branding */}
          <GlassCard className="p-6">
            <h2 className="text-lg font-semibold text-nexus-100 flex items-center gap-2 mb-6">
              <Palette className="h-5 w-5 text-accent-violet" /> Theme & Branding
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-nexus-300">Primary Color</label>
                  <div className="flex items-center gap-3">
                    <input 
                      type="color" 
                      value={formData.theme.primaryColor}
                      onChange={e => setFormData({ ...formData, theme: { ...formData.theme, primaryColor: e.target.value } })}
                      className="h-10 w-10 cursor-pointer rounded bg-transparent border-none p-0"
                    />
                    <span className="text-sm text-nexus-400 font-mono">{formData.theme.primaryColor}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-nexus-300">Gradient Colors</label>
                  <div className="flex items-center gap-4">
                    <input 
                      type="color" 
                      value={formData.theme.primaryGradientStart}
                      onChange={e => setFormData({ ...formData, theme: { ...formData.theme, primaryGradientStart: e.target.value } })}
                      className="h-8 w-8 cursor-pointer rounded bg-transparent border-none p-0"
                    />
                    <span className="text-nexus-500 text-xs">to</span>
                    <input 
                      type="color" 
                      value={formData.theme.primaryGradientEnd}
                      onChange={e => setFormData({ ...formData, theme: { ...formData.theme, primaryGradientEnd: e.target.value } })}
                      className="h-8 w-8 cursor-pointer rounded bg-transparent border-none p-0"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-nexus-300">Global Border Radius</label>
                <div className="grid grid-cols-5 gap-2">
                  {['sm', 'md', 'lg', 'xl', '2xl'].map(radius => (
                    <button
                      key={radius}
                      onClick={() => setFormData({ ...formData, theme: { ...formData.theme, radius: radius as any } })}
                      className={`py-2 text-xs font-medium rounded-md border transition-colors ${
                        formData.theme.radius === radius 
                          ? 'border-accent-indigo bg-accent-indigo/20 text-accent-indigo' 
                          : 'border-white/10 bg-white/5 text-nexus-400 hover:bg-white/10'
                      }`}
                    >
                      {radius}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Sidebar Preview */}
        <div className="space-y-6">
          <GlassCard className="p-6">
            <h2 className="text-lg font-semibold text-nexus-100 flex items-center gap-2 mb-6">
              <Layers className="h-5 w-5 text-accent-blue" /> Live Preview
            </h2>
            
            <div className="rounded-xl border border-white/5 bg-nexus-900/30 p-4">
              {/* Preview Nav Item */}
              <div 
                className="flex items-center gap-3 rounded-[var(--radius-master)] px-3 py-2 text-white"
                style={{ backgroundColor: formData.theme.primaryColor }}
              >
                <Settings className="h-5 w-5" />
                <span className="text-sm font-medium">Active Menu Item</span>
              </div>
              
              <div className="mt-4 p-4 rounded-[var(--radius-master)] bg-white/5 border border-white/5 text-sm text-nexus-300">
                Border Radius: <span className="font-mono text-white">{formData.theme.radius}</span>
              </div>

              <button 
                className="mt-4 w-full py-2 rounded-[var(--radius-master)] text-sm font-semibold text-white transition-opacity hover:opacity-90"
                style={{ 
                  background: `linear-gradient(135deg, ${formData.theme.primaryGradientStart}, ${formData.theme.primaryGradientEnd})`
                }}
              >
                Gradient Button
              </button>
            </div>
          </GlassCard>
        </div>

      </div>
    </PageTransition>
  )
}
