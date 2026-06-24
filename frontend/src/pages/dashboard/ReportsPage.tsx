import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileDown, 
  Search, 
  Filter, 
  CalendarClock, 
  History, 
  FilePlus2, 
  Loader2, 
  FileSpreadsheet, 
  FileText, 
  Trash2,
  AlertCircle
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  generateReport, 
  getReportHistory, 
  getReportSchedules, 
  createReportSchedule, 
  deleteReportSchedule,
  ReportRequest,
  ReportScheduleDto
} from '@/api/reports';
import { format } from 'date-fns';

type TabType = 'GENERATE' | 'SCHEDULES' | 'HISTORY';

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('GENERATE');
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: history, isLoading: isLoadingHistory } = useQuery({
    queryKey: ['reportHistory'],
    queryFn: () => getReportHistory(0, 50),
    enabled: activeTab === 'HISTORY' || activeTab === 'GENERATE' // Generate tab needs history to show recent
  });

  const { data: schedules, isLoading: isLoadingSchedules } = useQuery({
    queryKey: ['reportSchedules'],
    queryFn: () => getReportSchedules(),
    enabled: activeTab === 'SCHEDULES'
  });

  const generateMutation = useMutation({
    mutationFn: generateReport,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reportHistory'] });
      setIsGenerateModalOpen(false);
    }
  });

  const scheduleMutation = useMutation({
    mutationFn: createReportSchedule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reportSchedules'] });
      setIsScheduleModalOpen(false);
    }
  });

  const deleteScheduleMutation = useMutation({
    mutationFn: deleteReportSchedule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reportSchedules'] });
    }
  });

  const handleDownload = (fileUrl: string) => {
    // Determine the base URL (VITE_API_URL handles http vs https, etc.)
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
    // Remove '/api' from baseUrl to get the static root
    const rootUrl = baseUrl.replace('/api', '');
    window.open(`${rootUrl}${fileUrl}`, '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
            Reports & Analytics
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-1">
            Generate, schedule, and download system reports.
          </p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setIsScheduleModalOpen(true)}
            className="px-4 py-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded-lg font-medium transition-colors shadow-sm active:scale-95 flex items-center"
          >
            <CalendarClock className="w-4 h-4 mr-2" />
            Schedule Report
          </button>
          <button 
            onClick={() => setIsGenerateModalOpen(true)}
            className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-medium transition-colors shadow-sm active:scale-95 flex items-center"
          >
            <FilePlus2 className="w-4 h-4 mr-2" />
            Generate Report
          </button>
        </div>
      </div>

      <div className="flex border-b border-neutral-200 dark:border-neutral-800">
        <button
          onClick={() => setActiveTab('GENERATE')}
          className={`pb-3 px-4 font-medium transition-colors relative ${activeTab === 'GENERATE' ? 'text-brand-600 dark:text-brand-400' : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'}`}
        >
          Recent & Available
          {activeTab === 'GENERATE' && (
            <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-600 dark:bg-brand-400" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('SCHEDULES')}
          className={`pb-3 px-4 font-medium transition-colors relative ${activeTab === 'SCHEDULES' ? 'text-brand-600 dark:text-brand-400' : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'}`}
        >
          Scheduled
          {activeTab === 'SCHEDULES' && (
            <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-600 dark:bg-brand-400" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('HISTORY')}
          className={`pb-3 px-4 font-medium transition-colors relative ${activeTab === 'HISTORY' ? 'text-brand-600 dark:text-brand-400' : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'}`}
        >
          Download History
          {activeTab === 'HISTORY' && (
            <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-600 dark:bg-brand-400" />
          )}
        </button>
      </div>

      <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row gap-4 justify-between items-center bg-neutral-50/50 dark:bg-neutral-900/50">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input 
              type="text" 
              placeholder="Search..." 
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-shadow text-neutral-900 dark:text-white"
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <button className="flex-1 sm:flex-none px-4 py-2 bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-lg text-sm font-medium hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors flex items-center justify-center">
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </button>
          </div>
        </div>

        {/* Dynamic Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-neutral-500 dark:text-neutral-400 uppercase bg-neutral-50 dark:bg-neutral-900/50 border-b border-neutral-200 dark:border-neutral-800">
              {activeTab === 'SCHEDULES' ? (
                <tr>
                  <th className="px-6 py-4 font-medium">Report Type</th>
                  <th className="px-6 py-4 font-medium">Format</th>
                  <th className="px-6 py-4 font-medium">Schedule (Cron)</th>
                  <th className="px-6 py-4 font-medium">Next Run</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 text-right font-medium">Actions</th>
                </tr>
              ) : (
                <tr>
                  <th className="px-6 py-4 font-medium">Report Type</th>
                  <th className="px-6 py-4 font-medium">Format</th>
                  <th className="px-6 py-4 font-medium">Generated By</th>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 text-right font-medium">Actions</th>
                </tr>
              )}
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
              {activeTab === 'SCHEDULES' && isLoadingSchedules && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-brand-600 mx-auto" />
                  </td>
                </tr>
              )}
              {activeTab !== 'SCHEDULES' && isLoadingHistory && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-brand-600 mx-auto" />
                  </td>
                </tr>
              )}
              
              {activeTab === 'SCHEDULES' && schedules?.map((schedule) => (
                <tr key={schedule.id} className="bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors group">
                  <td className="px-6 py-4 font-medium">{schedule.reportType}</td>
                  <td className="px-6 py-4">{schedule.format}</td>
                  <td className="px-6 py-4 font-mono">{schedule.cronExpression}</td>
                  <td className="px-6 py-4">{schedule.nextRun ? format(new Date(schedule.nextRun), 'PPp') : '-'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      schedule.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-neutral-100 text-neutral-700'
                    }`}>
                      {schedule.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => deleteScheduleMutation.mutate(schedule.id)}
                      className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete Schedule"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}

              {activeTab !== 'SCHEDULES' && history?.map((item) => (
                <tr key={item.id} className="bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      {item.format === 'EXCEL' || item.format === 'CSV' ? (
                        <FileSpreadsheet className="w-5 h-5 text-emerald-500 mr-3" />
                      ) : (
                        <FileText className="w-5 h-5 text-rose-500 mr-3" />
                      )}
                      <span className="font-medium">{item.reportType}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">{item.format}</td>
                  <td className="px-6 py-4">{item.generatedByName}</td>
                  <td className="px-6 py-4">{format(new Date(item.createdAt), 'PPp')}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      item.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' : 
                      item.status === 'FAILED' ? 'bg-rose-100 text-rose-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {item.status === 'COMPLETED' && (
                      <button 
                        onClick={() => handleDownload(item.fileUrl)}
                        className="p-2 text-neutral-400 hover:text-brand-600 dark:hover:text-brand-400 bg-neutral-50 hover:bg-brand-50 dark:bg-neutral-800 dark:hover:bg-brand-900/30 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 ml-auto flex items-center"
                      >
                        <FileDown className="w-4 h-4" />
                        <span className="ml-2 font-medium">Download</span>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <GenerateModal 
        isOpen={isGenerateModalOpen} 
        onClose={() => setIsGenerateModalOpen(false)}
        onSubmit={(req: ReportRequest) => generateMutation.mutate(req)}
        isLoading={generateMutation.isPending}
      />

      <ScheduleModal 
        isOpen={isScheduleModalOpen} 
        onClose={() => setIsScheduleModalOpen(false)}
        onSubmit={(req: Partial<ReportScheduleDto>) => scheduleMutation.mutate(req)}
        isLoading={scheduleMutation.isPending}
      />
    </div>
  );
}

// Subcomponents for Modals
function GenerateModal({ isOpen, onClose, onSubmit, isLoading }: any) {
  const [reportType, setReportType] = useState('EMPLOYEE');
  const [format, setFormat] = useState('CSV');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-neutral-900 rounded-xl shadow-xl w-full max-w-md overflow-hidden border border-neutral-200 dark:border-neutral-800"
      >
        <div className="p-6">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Generate Report</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Report Type</label>
              <select 
                value={reportType}
                onChange={e => setReportType(e.target.value)}
                className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 px-3 py-2 text-sm focus:border-brand-500 focus:ring-brand-500"
              >
                <option value="EMPLOYEE">Employee Directory</option>
                <option value="ATTENDANCE">Attendance Logs</option>
                <option value="LEAVE">Leave Requests</option>
                <option value="PAYROLL">Payroll Periods</option>
                <option value="RECRUITMENT">Recruitment Pipeline</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Format</label>
              <select 
                value={format}
                onChange={e => setFormat(e.target.value)}
                className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 px-3 py-2 text-sm focus:border-brand-500 focus:ring-brand-500"
              >
                <option value="CSV">CSV</option>
                <option value="EXCEL">Excel (.xlsx)</option>
                <option value="PDF">PDF Document</option>
              </select>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg flex items-start">
              <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5 mr-2 shrink-0" />
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Generating large reports may take a few moments. Once generated, it will be available in your download history.
              </p>
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg">
              Cancel
            </button>
            <button 
              onClick={() => onSubmit({ reportType, format, filters: {} })}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 rounded-lg flex items-center"
            >
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Generate Now
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function ScheduleModal({ isOpen, onClose, onSubmit, isLoading }: any) {
  const [reportType, setReportType] = useState('EMPLOYEE');
  const [format, setFormat] = useState('CSV');
  const [cronExpression, setCronExpression] = useState('0 0 1 * * ?'); // Daily at 1 AM

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-neutral-900 rounded-xl shadow-xl w-full max-w-md overflow-hidden border border-neutral-200 dark:border-neutral-800"
      >
        <div className="p-6">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Schedule Report</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Report Type</label>
              <select 
                value={reportType}
                onChange={e => setReportType(e.target.value)}
                className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 px-3 py-2 text-sm focus:border-brand-500 focus:ring-brand-500"
              >
                <option value="EMPLOYEE">Employee Directory</option>
                <option value="ATTENDANCE">Attendance Logs</option>
                <option value="LEAVE">Leave Requests</option>
                <option value="PAYROLL">Payroll Periods</option>
                <option value="RECRUITMENT">Recruitment Pipeline</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Format</label>
              <select 
                value={format}
                onChange={e => setFormat(e.target.value)}
                className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 px-3 py-2 text-sm focus:border-brand-500 focus:ring-brand-500"
              >
                <option value="CSV">CSV</option>
                <option value="EXCEL">Excel (.xlsx)</option>
                <option value="PDF">PDF Document</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Schedule (Cron Expression)</label>
              <input 
                type="text" 
                value={cronExpression}
                onChange={e => setCronExpression(e.target.value)}
                placeholder="0 0 1 * * ?"
                className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 px-3 py-2 text-sm focus:border-brand-500 focus:ring-brand-500 font-mono"
              />
              <p className="text-xs text-neutral-500 mt-1">Default: Daily at 1:00 AM. Format: Second Minute Hour Day Month DayOfWeek</p>
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg">
              Cancel
            </button>
            <button 
              onClick={() => onSubmit({ reportType, format, cronExpression, filters: {} })}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 rounded-lg flex items-center"
            >
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Schedule
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
