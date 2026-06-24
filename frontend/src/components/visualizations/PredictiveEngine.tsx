import { useMemo } from 'react'
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip } from 'recharts'
import GlassCard from '@/components/ui/GlassCard'

interface PredictiveEngineProps {
  metrics: { subject: string; departmentScores: Record<string, number>; fullMark: number }[]
}

export default function PredictiveEngine({ metrics }: PredictiveEngineProps) {
  // Extract dynamic data structure for recharts
  const { data, departments } = useMemo(() => {
    if (!metrics || metrics.length === 0) return { data: [], departments: [] }

    // Reformat data so recharts can understand: { subject: 'Eng', DeptA: 80, DeptB: 90 }
    const formattedData = metrics.map(m => {
      const row: any = { subject: m.subject, fullMark: m.fullMark }
      Object.entries(m.departmentScores).forEach(([dept, score]) => {
        row[dept] = score
      })
      return row
    })

    // Get unique departments to render Radars
    const deptSet = new Set<string>()
    metrics.forEach(m => Object.keys(m.departmentScores).forEach(d => deptSet.add(d)))
    
    // Sort departments to pick top 2 or 3 to avoid cluttering the radar
    // If there are many departments, maybe we only show Engineering and Sales for contrast
    const depts = Array.from(deptSet).slice(0, 3) 
    
    return { data: formattedData, departments: depts }
  }, [metrics])

  const colors = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b']

  return (
    <GlassCard className="p-6 h-full flex flex-col" glow="violet">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-nexus-100">Predictive Workforce Health</h3>
        <p className="text-xs text-nexus-500 mt-0.5">
          {departments.map((d, i) => (
            <span key={d} className="mr-2 inline-flex items-center gap-1">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: colors[i % colors.length] }} />
              {d}
            </span>
          ))}
        </p>
      </div>
      
      <div className="flex-1 min-h-[250px]">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
              <PolarGrid stroke="rgba(255,255,255,0.1)" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
              
              {departments.map((dept, i) => (
                <Radar
                  key={dept}
                  name={dept}
                  dataKey={dept}
                  stroke={colors[i % colors.length]}
                  fill={colors[i % colors.length]}
                  fillOpacity={0.3}
                  animationDuration={1500}
                />
              ))}
              
              <Tooltip 
                contentStyle={{ backgroundColor: 'rgba(15,23,42,0.9)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                itemStyle={{ fontSize: '12px' }}
              />
            </RadarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full w-full flex items-center justify-center text-nexus-500 text-sm">
            Insufficient data for predictive modeling
          </div>
        )}
      </div>
    </GlassCard>
  )
}
