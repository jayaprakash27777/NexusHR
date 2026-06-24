import { motion } from 'framer-motion'
import PageTransition from '@/components/animation/PageTransition'
import AnnouncementsWidget from '@/components/ui/AnnouncementsWidget'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts'
import { Download, Filter, Calendar, Loader2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import { dashboardApi } from '@/api/dashboard'

export default function AnalyticsDashboard() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
         const res = await dashboardApi.getAnalytics()
         if (res) {
           setData(res)
         }
      } catch (error) {
        console.error("Failed to fetch Analytics dashboard", error)
      } finally {
        setLoading(false)
      }
    }
    fetchDashboard()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
      </div>
    )
  }

  const headcountData = data?.headcountTrend || []
  const deptData = data?.departmentSpend || []

  return (
    <PageTransition className="space-y-6 h-full flex flex-col">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
            Advanced Analytics
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-1">
            Deep dive into workforce trends and forecasting.
          </p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-lg font-medium transition-colors shadow-sm active:scale-95 flex items-center">
            <Calendar className="w-4 h-4 mr-2" />
            Year to Date
          </button>
          <button className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-medium transition-colors shadow-sm active:scale-95 flex items-center">
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Headcount Growth Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm p-6"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Headcount Growth</h2>
            <button className="p-2 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg">
              <Filter className="w-4 h-4" />
            </button>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              {headcountData.length > 0 ? (
                <LineChart data={headcountData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} vertical={false} />
                  <XAxis dataKey="month" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: '#F9FAFB', borderRadius: '8px' }}
                    itemStyle={{ color: '#60A5FA' }}
                  />
                  <Line type="monotone" dataKey="count" stroke="#3B82F6" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                </LineChart>
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-neutral-500">No headcount data available</div>
              )}
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Department Budget vs Actual */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm p-6"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Department Spend ($K)</h2>
            <button className="p-2 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg">
              <Filter className="w-4 h-4" />
            </button>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              {deptData.length > 0 ? (
                <BarChart data={deptData} layout="vertical" margin={{ top: 0, right: 0, left: 30, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} horizontal={false} />
                  <XAxis type="number" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis dataKey="name" type="category" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: '#F9FAFB', borderRadius: '8px' }}
                  />
                  <Legend iconType="circle" />
                  <Bar dataKey="budget" name="Budget" fill="#9CA3AF" radius={[0, 4, 4, 0]} barSize={12} />
                  <Bar dataKey="actual" name="Actual Spend" fill="#8B5CF6" radius={[0, 4, 4, 0]} barSize={12} />
                </BarChart>
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-neutral-500">No spend data available</div>
              )}
            </ResponsiveContainer>
          </div>
        </motion.div>

      </div>
    
      {/* Announcements Section */}
      <div className="h-[400px] mt-6">
        <AnnouncementsWidget />
      </div>
    </PageTransition>
  )
}
