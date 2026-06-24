import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { employeesApi } from '@/api/employees'
import PageTransition from '@/components/animation/PageTransition'
import GlassCard from '@/components/ui/GlassCard'
import { toast } from '@/store/toast'
import AddHistoryModal from '@/components/employee/AddHistoryModal'
import AddContactModal from '@/components/employee/AddContactModal'
import {
  ChevronLeft, User, Briefcase, FileText, Phone, Mail, 
  MapPin, Calendar, Building, CreditCard, Download, Upload, Plus,
  Clock, Activity, Shield
} from 'lucide-react'
import {
  BasicInfoTab, EmploymentTab, AttendanceTab, LeavesTab,
  PayrollTab, AddressTab, PerformanceTab, SecurityTab
} from '@/components/employee/ProfileTabs'

const TABS = [
  { id: 'details', label: 'Basic Info', icon: User },
  { id: 'employment', label: 'Employment', icon: Briefcase },
  { id: 'attendance', label: 'Attendance', icon: Clock },
  { id: 'leaves', label: 'Leaves', icon: Calendar },
  { id: 'payroll', label: 'Payroll', icon: CreditCard },
  { id: 'documents', label: 'Documents', icon: FileText },
  { id: 'contacts', label: 'Contacts', icon: Phone },
  { id: 'address', label: 'Address', icon: MapPin },
  { id: 'performance', label: 'Performance', icon: Activity },
  { id: 'security', label: 'Security', icon: Shield },
]

export default function EmployeeProfilePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState('details')
  const [isAddHistoryOpen, setIsAddHistoryOpen] = useState(false)
  const [isAddContactOpen, setIsAddContactOpen] = useState(false)

  const { data: employee, isLoading } = useQuery({
    queryKey: ['employee', id],
    queryFn: () => employeesApi.getById(id!),
    enabled: !!id,
  })

  const { data: history } = useQuery({
    queryKey: ['employeeHistory', id],
    queryFn: () => employeesApi.getHistory(id!),
    enabled: !!id && activeTab === 'history',
  })

  const { data: contacts } = useQuery({
    queryKey: ['employeeContacts', id],
    queryFn: () => employeesApi.getContacts(id!),
    enabled: !!id && activeTab === 'contacts',
  })

  const { data: documents } = useQuery({
    queryKey: ['employeeDocuments', id],
    queryFn: () => employeesApi.getDocuments(id!),
    enabled: !!id && activeTab === 'documents',
  })

  const uploadMutation = useMutation({
    mutationFn: ({ type, file }: { type: string, file: File }) => employeesApi.uploadDocument(id!, type, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employeeDocuments', id] })
      toast.success('Document Uploaded', 'The file has been successfully uploaded.')
    },
    onError: () => toast.error('Upload Failed', 'There was an error uploading the document.')
  })

  const avatarUploadMutation = useMutation({
    mutationFn: (file: File) => employeesApi.uploadAvatar(id!, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee', id] })
      toast.success('Avatar Uploaded', 'Profile picture updated successfully.')
    },
    onError: () => toast.error('Upload Failed', 'There was an error uploading the profile picture.')
  })

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    avatarUploadMutation.mutate(file)
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    // In a real scenario, you might want to prompt for document type
    uploadMutation.mutate({ type: 'General', file })
  }

  const handleDownload = async (docId: number, fileName: string) => {
    try {
      const blob = await employeesApi.downloadDocument(id!, docId)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      toast.error('Download Failed', 'Could not download the document.')
    }
  }

  if (isLoading || !employee) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent-indigo border-t-transparent" />
      </div>
    )
  }

  const initials = employee.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

  return (
    <PageTransition className="space-y-6 h-full flex flex-col">
      {/* Header Profile Card */}
      <div className="flex items-center gap-4 mb-2">
        <button 
          onClick={() => navigate('/employees')}
          className="p-2 rounded-lg text-nexus-400 hover:text-white hover:bg-white/5 transition-colors"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h1 className="text-2xl font-bold tracking-tight text-nexus-50">Employee Profile</h1>
      </div>

      <GlassCard className="p-6 md:p-8 relative overflow-hidden">
        {/* Decorative background blob */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-accent-indigo/10 blur-3xl rounded-full pointer-events-none" />
        
        <div className="flex flex-col md:flex-row gap-8 items-start relative z-10">
          <div className="flex-shrink-0">
            <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-accent-indigo to-accent-violet p-0.5 shadow-lg shadow-accent-indigo/20">
              <div className="h-full w-full rounded-2xl bg-nexus-900 flex items-center justify-center text-2xl font-bold text-white relative overflow-hidden group">
                {employee.avatarUrl ? (
                  <img src={employee.avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                ) : (
                  initials
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                  <label htmlFor="avatar-upload" className="cursor-pointer p-8">
                    <Upload className="h-6 w-6 text-white" />
                  </label>
                  <input type="file" id="avatar-upload" className="hidden" accept="image/*" onChange={handleAvatarUpload} disabled={avatarUploadMutation.isPending} />
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex-1 space-y-4">
            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
              <div>
                <h2 className="text-3xl font-bold text-white">{employee.fullName}</h2>
                <p className="text-lg text-accent-indigo font-medium">{employee.designation}</p>
              </div>
              <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                employee.status === 'ACTIVE' ? 'bg-success/10 text-success border border-success/20' : 'bg-nexus-800 text-nexus-400'
              }`}>
                {employee.status.replace('_', ' ')}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-white/5">
              <div className="flex items-center gap-2 text-sm text-nexus-300">
                <Briefcase className="h-4 w-4 text-nexus-500" />
                <span>{employee.employeeId}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-nexus-300">
                <Building className="h-4 w-4 text-nexus-500" />
                <span>{employee.departmentName}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-nexus-300">
                <Mail className="h-4 w-4 text-nexus-500" />
                <span>{employee.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-nexus-300">
                <Calendar className="h-4 w-4 text-nexus-500" />
                <span>Joined {new Date(employee.dateOfJoining).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 rounded-xl bg-black/20 p-1">
        {TABS.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                isActive
                  ? 'bg-nexus-800 text-white shadow-sm ring-1 ring-white/10'
                  : 'text-nexus-400 hover:bg-white/5 hover:text-nexus-200'
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? 'text-accent-indigo' : ''}`} />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'details' && <BasicInfoTab employee={employee} />}
          {activeTab === 'employment' && <EmploymentTab employee={employee} />}
          {activeTab === 'attendance' && <AttendanceTab employeeId={id!} />}
          {activeTab === 'leaves' && <LeavesTab employeeId={id!} />}
          {activeTab === 'payroll' && <PayrollTab employee={employee} />}
          {activeTab === 'address' && <AddressTab employee={employee} />}
          {activeTab === 'performance' && <PerformanceTab employeeId={id!} />}
          {activeTab === 'security' && <SecurityTab employee={employee} />}

          {activeTab === 'contacts' && (
            <GlassCard className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-white">Emergency Contacts</h3>
                <button 
                  onClick={() => setIsAddContactOpen(true)}
                  className="text-sm flex items-center gap-1 text-accent-indigo hover:text-indigo-400"
                >
                  <Plus className="h-4 w-4" /> Add Contact
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {contacts?.map((c) => (
                  <div key={c.id} className="bg-white/5 border border-white/10 rounded-xl p-4 flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-nexus-50 font-medium">{c.name}</h4>
                        {c.isPrimary && (
                          <span className="text-[10px] bg-accent-indigo/20 text-accent-indigo px-2 py-0.5 rounded-full">Primary</span>
                        )}
                      </div>
                      <p className="text-xs text-nexus-400 mb-3">{c.relationship}</p>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-nexus-300">
                          <Phone className="h-3.5 w-3.5 text-nexus-500" /> {c.phoneNumber}
                        </div>
                        {c.email && (
                          <div className="flex items-center gap-2 text-sm text-nexus-300">
                            <Mail className="h-3.5 w-3.5 text-nexus-500" /> {c.email}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                {(!contacts || contacts.length === 0) && (
                  <div className="col-span-full py-8 text-center text-nexus-400 text-sm border border-dashed border-white/10 rounded-xl">
                    No emergency contacts added yet.
                  </div>
                )}
              </div>
            </GlassCard>
          )}

          {activeTab === 'documents' && (
            <GlassCard className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-white">Documents</h3>
                <div>
                  <input 
                    type="file" 
                    id="doc-upload" 
                    className="hidden" 
                    onChange={handleFileUpload} 
                  />
                  <label 
                    htmlFor="doc-upload" 
                    className="text-sm flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 rounded-lg text-nexus-100 cursor-pointer transition-colors"
                  >
                    {uploadMutation.isPending ? (
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4" />
                    )}
                    Upload File
                  </label>
                </div>
              </div>

              <div className="border border-white/5 rounded-xl overflow-hidden bg-black/20">
                <table className="w-full text-left text-sm text-nexus-300">
                  <thead className="bg-white/5 text-nexus-400">
                    <tr>
                      <th className="px-4 py-3 font-medium">Document Name</th>
                      <th className="px-4 py-3 font-medium">Type</th>
                      <th className="px-4 py-3 font-medium">Size</th>
                      <th className="px-4 py-3 font-medium">Uploaded Date</th>
                      <th className="px-4 py-3 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {documents?.map((doc) => (
                      <tr key={doc.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-4 py-3 flex items-center gap-2">
                          <FileText className="h-4 w-4 text-accent-indigo" />
                          <span className="text-nexus-100">{doc.fileName}</span>
                        </td>
                        <td className="px-4 py-3">{doc.documentType}</td>
                        <td className="px-4 py-3">{(doc.fileSize! / 1024).toFixed(1)} KB</td>
                        <td className="px-4 py-3">{new Date(doc.uploadDate).toLocaleDateString()}</td>
                        <td className="px-4 py-3 text-right">
                          <button 
                            onClick={() => handleDownload(doc.id, doc.fileName)}
                            className="p-1.5 text-nexus-400 hover:text-white hover:bg-white/10 rounded transition-colors"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    
                    {(!documents || documents.length === 0) && (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-nexus-500">
                          No documents uploaded.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </GlassCard>
          )}
        </motion.div>
      </AnimatePresence>

      <AddHistoryModal 
        isOpen={isAddHistoryOpen} 
        onClose={() => setIsAddHistoryOpen(false)} 
        employeeId={id!} 
      />
      <AddContactModal 
        isOpen={isAddContactOpen} 
        onClose={() => setIsAddContactOpen(false)} 
        employeeId={id!} 
      />
    </PageTransition>
  )
}
