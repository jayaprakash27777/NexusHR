import { useMemo } from 'react'
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip } from 'recharts'
import GlassCard from '@/components/ui/GlassCard'

const data = [
  { subject: 'Engagement', A: 85, B: 60, fullMark: 100 },
  { subject: 'Productivity', A: 92, B: 75, fullMark: 100 },
  { subject: 'Retention', A: 68, B: 88, fullMark: 100 },
  { subject: 'Skills Gap', A: 75, B: 50, fullMark: 100 },
  { subject: 'Wellbeing', A: 80, B: 70, fullMark: 100 },
  { subject: 'Leadership', A: 88, B: 65, fullMark: 100 },
]

export default function PredictiveEngine() {
  return (
    <GlassCard className="p-6 h-full flex flex-col" glow="violet">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-nexus-100">Predictive Workforce Health</h3>
        <p className="text-xs text-nexus-500 mt-0.5">Engineering (Blue) vs Finance (Purple)</p>
      </div>
      
      <div className="flex-1 min-h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
            <PolarGrid stroke="rgba(255,255,255,0.1)" />
            <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
            <Radar
              name="Engineering"
              dataKey="A"
              stroke="#3b82f6"
              fill="#3b82f6"
              fillOpacity={0.3}
              animationDuration={1500}
            />
            <Radar
              name="Finance"
              dataKey="B"
              stroke="#8b5cf6"
              fill="#8b5cf6"
              fillOpacity={0.3}
              animationDuration={1500}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: 'rgba(15,23,42,0.9)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
              itemStyle={{ fontSize: '12px' }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 flex gap-4 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full bg-accent-blue" />
          <span className="text-nexus-300">Engineering</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full bg-accent-violet" />
          <span className="text-nexus-300">Finance</span>
        </div>
      </div>
    </GlassCard>
  )
}
