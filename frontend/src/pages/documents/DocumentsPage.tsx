import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store'
import { Document, documentApi } from '@/api/documents'
import { Employee, employeesApi } from '@/api/employees'
import {
  FileText, Download, Eye, Upload, Search, Trash2, Shield, Folder
} from 'lucide-react'
import { format } from 'date-fns'
// import toast from 'react-hot-toast' - removed as we don't have it, using alert or a custom toast if available
// Actually, let's just remove react-hot-toast and use window.alert or console for now, or check if it exists in package.json.
// Wait, the error is 'Cannot find module react-hot-toast'. I will use window.alert or console.error.

export default function DocumentsPage() {
  const { user } = useAuthStore()
  const isAdmin = user?.role === 'ADMIN' || (user?.role as any) === 'SUPER_ADMIN' || (user?.role as any) === 'HR_DIRECTOR'
  
  const [documents, setDocuments] = useState<Document[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  
  // Upload modal state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploadTitle, setUploadTitle] = useState('')
  const [uploadCategory, setUploadCategory] = useState('General')
  const [uploadOwnerId, setUploadOwnerId] = useState('')
  const [uploading, setUploading] = useState(false)

  const categories = ['All', 'General', 'Policies', 'Contracts', 'Performance', 'Identification']

  useEffect(() => {
    fetchData()
  }, [user])

  const fetchData = async () => {
    setLoading(true)
    try {
      if (isAdmin) {
        const [docsData, empsData] = await Promise.all([
          documentApi.getAll(),
          employeesApi.getAll({ size: 1000 }).then(res => res.content)
        ])
        setDocuments(docsData)
        setEmployees(empsData)
      } else {
        // Find the employee record for current user
        const empsData = await employeesApi.getAll({ size: 1000 }).then(res => res.content)
        const currentEmp = empsData.find((e: Employee) => e.email === user?.email)
        if (currentEmp) {
          const docsData = await documentApi.getByEmployeeId(currentEmp.id)
          setDocuments(docsData)
        }
      }
    } catch (error) {
      alert('Failed to load documents')
    } finally {
      setLoading(false)
    }
  }

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!uploadFile) return alert('Please select a file')
    if (!uploadTitle) return alert('Please enter a title')

    setUploading(true)
    try {
      await documentApi.upload(uploadFile, uploadTitle, uploadCategory, isAdmin ? uploadOwnerId : undefined)
      alert('Document uploaded successfully')
      setIsUploadModalOpen(false)
      setUploadFile(null)
      setUploadTitle('')
      setUploadCategory('General')
      fetchData()
    } catch (error) {
      alert('Failed to upload document')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return
    
    try {
      await documentApi.delete(id)
      alert('Document deleted')
      fetchData()
    } catch (error) {
      alert('Failed to delete document')
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const filteredDocs = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'All' || doc.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-nexus-800 dark:text-white flex items-center gap-2">
            <Folder className="h-6 w-6 text-accent-indigo" />
            Document Management
          </h1>
          <p className="text-sm text-nexus-500 mt-1">Securely manage and store organization files.</p>
        </div>
        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="btn-primary"
        >
          <Upload className="h-4 w-4 mr-2" />
          Upload Document
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-nexus-400" />
          <input
            type="text"
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field pl-9 w-full"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 hide-scrollbar">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat 
                  ? 'bg-accent-indigo text-white shadow-md' 
                  : 'bg-nexus-100 text-nexus-600 hover:bg-nexus-200 dark:bg-nexus-800 dark:text-nexus-300 dark:hover:bg-nexus-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Document Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-indigo"></div>
        </div>
      ) : filteredDocs.length === 0 ? (
        <div className="text-center py-20 bg-surface border border-border rounded-[var(--radius-xl)] shadow-sm">
          <FileText className="h-12 w-12 text-nexus-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-nexus-800 dark:text-white">No documents found</h3>
          <p className="text-nexus-500 mt-1">Upload a document or change your search filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredDocs.map(doc => (
            <div key={doc.id} className="bg-surface border border-border rounded-[var(--radius-xl)] p-4 shadow-sm hover:shadow-md transition-shadow group">
              <div className="flex justify-between items-start mb-3">
                <div className="p-2.5 bg-accent-indigo/10 text-accent-indigo rounded-lg">
                  <FileText className="h-6 w-6" />
                </div>
                {isAdmin && (
                  <button onClick={() => handleDelete(doc.id)} className="text-nexus-400 hover:text-danger opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
              <h3 className="font-semibold text-nexus-800 dark:text-white truncate" title={doc.title}>{doc.title}</h3>
              <div className="flex items-center gap-2 mt-1 text-xs text-nexus-500">
                <span className="px-2 py-0.5 bg-nexus-100 dark:bg-nexus-800 rounded-md truncate max-w-[120px]">
                  {doc.category}
                </span>
                <span>•</span>
                <span>{formatFileSize(doc.fileSize)}</span>
              </div>
              
              <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                <div className="text-[10px] text-nexus-400">
                  {format(new Date(doc.createdAt), 'MMM d, yyyy')}
                </div>
                <div className="flex gap-2">
                  <a href={documentApi.getPreviewUrl(doc.id)} target="_blank" rel="noopener noreferrer" className="p-1.5 text-nexus-500 hover:text-accent-indigo hover:bg-accent-indigo/10 rounded-md transition-colors" title="Preview">
                    <Eye className="h-4 w-4" />
                  </a>
                  <a href={documentApi.getDownloadUrl(doc.id)} download className="p-1.5 text-nexus-500 hover:text-accent-indigo hover:bg-accent-indigo/10 rounded-md transition-colors" title="Download">
                    <Download className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-surface w-full max-w-md rounded-[var(--radius-xl)] shadow-2xl overflow-hidden border border-border">
            <div className="px-6 py-4 border-b border-border">
              <h2 className="text-lg font-semibold text-nexus-800 dark:text-white flex items-center gap-2">
                <Upload className="h-5 w-5 text-accent-indigo" />
                Upload Document
              </h2>
            </div>
            <form onSubmit={handleUpload} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-nexus-700 dark:text-nexus-300 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={uploadTitle}
                  onChange={e => setUploadTitle(e.target.value)}
                  className="input-field w-full"
                  placeholder="e.g. Q3 Performance Review"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-nexus-700 dark:text-nexus-300 mb-1">Category</label>
                <select
                  value={uploadCategory}
                  onChange={e => setUploadCategory(e.target.value)}
                  className="input-field w-full"
                >
                  {categories.filter(c => c !== 'All').map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {isAdmin && (
                <div>
                  <label className="block text-sm font-medium text-nexus-700 dark:text-nexus-300 mb-1 flex items-center gap-1">
                    Assign Owner
                    <Shield className="h-3 w-3 text-warning" />
                  </label>
                  <select
                    value={uploadOwnerId}
                    onChange={e => setUploadOwnerId(e.target.value)}
                    className="input-field w-full"
                  >
                    <option value="">No specific owner (Organization level)</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-nexus-700 dark:text-nexus-300 mb-1">File</label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-border border-dashed rounded-[var(--radius-lg)] bg-nexus-50 dark:bg-nexus-900/20 hover:bg-nexus-100 dark:hover:bg-nexus-800/50 transition-colors">
                  <div className="space-y-1 text-center">
                    <FileText className="mx-auto h-8 w-8 text-nexus-400" />
                    <div className="flex text-sm text-nexus-600 dark:text-nexus-400">
                      <label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-medium text-accent-indigo hover:text-accent-indigo/80 focus-within:outline-none">
                        <span>Upload a file</span>
                        <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={e => setUploadFile(e.target.files?.[0] || null)} />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-nexus-500">
                      {uploadFile ? uploadFile.name : 'PDF, DOCX, JPG up to 10MB'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-border mt-6">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="btn-secondary"
                  disabled={uploading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={uploading || !uploadFile}
                >
                  {uploading ? 'Uploading...' : 'Upload'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
