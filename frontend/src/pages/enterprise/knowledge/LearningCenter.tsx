import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  GraduationCap, PlayCircle, Award, CheckCircle2, Clock, 
  BarChart, FileText, ChevronRight, Play, Check,
  Search
} from 'lucide-react'
import PageTransition from '@/components/animation/PageTransition'
import GlassCard from '@/components/ui/GlassCard'
import { toast } from '@/store/toast'

interface Course {
  id: string
  title: string
  category: string
  duration: string
  modules: number
  status: 'not_started' | 'in_progress' | 'completed'
  progress: number
  dueDate?: string
  thumbnail: string
}

const mockCourses: Course[] = [
  {
    id: '1',
    title: 'Information Security Fundamentals',
    category: 'Mandatory Compliance',
    duration: '45 mins',
    modules: 5,
    status: 'in_progress',
    progress: 60,
    dueDate: 'Oct 30, 2026',
    thumbnail: 'bg-gradient-to-br from-blue-900 to-indigo-900'
  },
  {
    id: '2',
    title: 'Anti-Harassment Training 2026',
    category: 'Mandatory Compliance',
    duration: '60 mins',
    modules: 4,
    status: 'completed',
    progress: 100,
    thumbnail: 'bg-gradient-to-br from-emerald-900 to-teal-900'
  },
  {
    id: '3',
    title: 'Advanced Leadership Principles',
    category: 'Professional Development',
    duration: '3 hours',
    modules: 12,
    status: 'not_started',
    progress: 0,
    thumbnail: 'bg-gradient-to-br from-purple-900 to-fuchsia-900'
  }
]

export default function LearningCenter() {
  const [activeTab, setActiveTab] = useState<'my_learning' | 'catalog' | 'certificates'>('my_learning')
  const [courses, setCourses] = useState<Course[]>(mockCourses)

  const handleStartCourse = (id: string) => {
    toast.success('Course Launched', 'Loading training modules...')
  }

  return (
    <PageTransition className="space-y-6 h-full flex flex-col">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-nexus-50 flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-accent-indigo" />
            Learning & Certification
          </h1>
          <p className="text-sm text-nexus-400 mt-1">Complete compliance training and explore professional development paths.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-white/10 pb-px">
        {[
          { id: 'my_learning', label: 'My Learning' },
          { id: 'catalog', label: 'Course Catalog' },
          { id: 'certificates', label: 'My Certificates' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 text-sm font-medium transition-all border-b-2 ${
              activeTab === tab.id 
                ? 'text-accent-indigo border-accent-indigo' 
                : 'text-nexus-400 border-transparent hover:text-nexus-200 hover:border-white/10'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pb-12">
        {activeTab === 'my_learning' && (
          <div className="space-y-8">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <GlassCard className="p-5 flex items-center gap-4">
                <div className="p-3 rounded-full bg-warning/20 text-warning">
                  <Clock className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">2</div>
                  <div className="text-xs font-medium text-nexus-400 uppercase tracking-wider">Pending Courses</div>
                </div>
              </GlassCard>
              <GlassCard className="p-5 flex items-center gap-4">
                <div className="p-3 rounded-full bg-accent-indigo/20 text-accent-indigo">
                  <PlayCircle className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">4.5h</div>
                  <div className="text-xs font-medium text-nexus-400 uppercase tracking-wider">Learning Time</div>
                </div>
              </GlassCard>
              <GlassCard className="p-5 flex items-center gap-4">
                <div className="p-3 rounded-full bg-success/20 text-success">
                  <Award className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">1</div>
                  <div className="text-xs font-medium text-nexus-400 uppercase tracking-wider">Certificates Earned</div>
                </div>
              </GlassCard>
            </div>

            {/* In Progress & Assigned */}
            <div>
              <h2 className="text-lg font-bold text-nexus-100 mb-4">Assigned to You</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.filter(c => c.status !== 'completed').map(course => (
                  <GlassCard key={course.id} className="flex flex-col overflow-hidden group hover:border-accent-indigo/50 transition-all">
                    <div className={`h-32 ${course.thumbnail} relative flex items-center justify-center`}>
                      <PlayCircle className="h-12 w-12 text-white/50 group-hover:text-white group-hover:scale-110 transition-all cursor-pointer" onClick={() => handleStartCourse(course.id)} />
                      {course.dueDate && (
                        <div className="absolute top-3 right-3 px-2 py-1 rounded bg-black/50 backdrop-blur-md text-xs font-medium text-warning border border-white/10 flex items-center gap-1.5">
                          <Clock className="h-3 w-3" /> Due {course.dueDate}
                        </div>
                      )}
                    </div>
                    <div className="p-5 flex flex-col flex-1">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-accent-indigo mb-2">{course.category}</div>
                      <h3 className="font-bold text-nexus-50 mb-4 line-clamp-2">{course.title}</h3>
                      
                      <div className="flex items-center justify-between text-xs text-nexus-400 mb-4 mt-auto">
                        <div className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> {course.duration}</div>
                        <div className="flex items-center gap-1.5"><FileText className="h-3.5 w-3.5" /> {course.modules} Modules</div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-xs font-medium">
                          <span className={course.progress > 0 ? 'text-nexus-200' : 'text-nexus-500'}>
                            {course.progress > 0 ? `${course.progress}% Complete` : 'Not Started'}
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-nexus-900 rounded-full overflow-hidden border border-white/5">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${course.progress}%` }}
                            transition={{ duration: 1, ease: 'easeOut' }}
                            className="h-full bg-accent-indigo"
                          />
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'catalog' && (
          <div className="h-64 flex flex-col items-center justify-center text-nexus-500 border-2 border-dashed border-white/10 rounded-xl bg-white/[0.01]">
            <Search className="h-8 w-8 mb-3 opacity-50" />
            <p>Course catalog integration loading...</p>
          </div>
        )}

        {activeTab === 'certificates' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.filter(c => c.status === 'completed').map(course => (
              <GlassCard key={course.id} className="p-6 flex flex-col items-center text-center relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-success/10 blur-3xl rounded-full" />
                <Award className="h-16 w-16 text-success mb-4" />
                <h3 className="font-bold text-nexus-50 mb-2">{course.title}</h3>
                <p className="text-sm text-nexus-400 mb-6">Completed on Oct 1, 2026</p>
                <button className="px-6 py-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-nexus-200 hover:text-white transition-colors text-sm font-medium w-full">
                  Download PDF
                </button>
              </GlassCard>
            ))}
          </div>
        )}
      </div>
    </PageTransition>
  )
}
