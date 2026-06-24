import { Suspense, lazy, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { useAuthStore } from './store'
import DashboardLayout from './layouts/DashboardLayout'
import LoadingScreen from './components/ui/LoadingScreen'
import ErrorBoundary from './components/ui/ErrorBoundary'
import GlobalLoading from './components/ui/GlobalLoading'
import RoleBasedRedirect from './components/auth/RoleBasedRedirect'
import ToastContainer from './components/ui/ToastContainer'
import CommandMenu from './components/ui/CommandMenu'
import KeyboardShortcutsModal from './components/ui/KeyboardShortcutsModal'
import OfflineIndicator from './components/ui/OfflineIndicator'
import SessionTimeoutProtection from './components/ui/SessionTimeoutProtection'
import { useTenantStore } from './store/tenant'
import { usePermissionStore } from './store/permissions'
import RequirePermission from './components/auth/RequirePermission'

const LoginPage = lazy(() => import('./pages/LoginPage'))
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'))
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'))
const ExecutiveCommandCenter = lazy(() => import('./pages/executive/ExecutiveCommandCenter'))
const AdminDashboard = lazy(() => import('./pages/dashboard/AdminDashboard'))
const EmployeeDashboard = lazy(() => import('./pages/dashboard/EmployeeDashboard'))
const ManagerDashboard = lazy(() => import('./pages/dashboard/ManagerDashboard'))
const HRDashboard = lazy(() => import('./pages/dashboard/HRDashboard'))
const FinanceDashboard = lazy(() => import('./pages/dashboard/FinanceDashboard'))
const TeamLeadDashboard = lazy(() => import('./pages/dashboard/TeamLeadDashboard'))
const DeptManagerDashboard = lazy(() => import('./pages/dashboard/DeptManagerDashboard'))
const HRExecutiveDashboard = lazy(() => import('./pages/dashboard/HRExecutiveDashboard'))
const AuditorDashboard = lazy(() => import('./pages/dashboard/AuditorDashboard'))
const AnalyticsDashboard = lazy(() => import('./pages/dashboard/AnalyticsDashboard'))
const ReportsPage = lazy(() => import('./pages/dashboard/ReportsPage'))
const DocumentsPage = lazy(() => import('./pages/documents/DocumentsPage'))
const EmployeesPage = lazy(() => import('./pages/employees/EmployeesPage'))
const EmployeeProfilePage = lazy(() => import('./pages/employees/EmployeeProfilePage'))
const AttendancePage = lazy(() => import('./pages/attendance/AttendancePage'))
const LeavesPage = lazy(() => import('./pages/leaves/LeavesPage'))
const PayrollPage = lazy(() => import('./pages/payroll/PayrollPage'))
const PerformancePage = lazy(() => import('./pages/performance/PerformancePage'))
const RecruitmentDashboard = lazy(() => import('./pages/recruitment/RecruitmentDashboard'))
const CandidatePipeline = lazy(() => import('./pages/recruitment/CandidatePipeline'))
const JobManagement = lazy(() => import('./pages/recruitment/JobManagement'))
const InterviewCalendar = lazy(() => import('./pages/recruitment/InterviewCalendar'))
const OfferManagement = lazy(() => import('./pages/recruitment/OfferManagement'))
const AiInsightsPage = lazy(() => import('./pages/ai/AiInsightsPage'))
const NotificationsPage = lazy(() => import('./pages/notifications/NotificationsPage'))
const FeatureFlagCenter = lazy(() => import('./pages/enterprise/features/FeatureFlagCenter'))
const EnterpriseHub = lazy(() => import('./pages/enterprise/EnterpriseHub'))
const TenantSettings = lazy(() => import('./pages/enterprise/admin/TenantSettings'))
const SecurityCenter = lazy(() => import('./pages/settings/SecurityCenter'))
const RBACDashboard = lazy(() => import('./pages/enterprise/security/RBACDashboard'))
const PermissionsManager = lazy(() => import('./pages/enterprise/security/PermissionsManager'))
const AuditLogViewer = lazy(() => import('./pages/enterprise/security/AuditLogViewer'))
const PlatformConfigCenter = lazy(() => import('./pages/enterprise/admin/PlatformConfigCenter'))
const FormBuilder = lazy(() => import('./pages/enterprise/automation/FormBuilder'))
const WorkflowBuilder = lazy(() => import('./pages/enterprise/automation/WorkflowBuilder'))
const ApprovalEngine = lazy(() => import('./pages/enterprise/automation/ApprovalEngine'))
const DelegationManager = lazy(() => import('./pages/enterprise/automation/DelegationManager'))
const ReleaseManager = lazy(() => import('./pages/enterprise/knowledge/ReleaseManager'))
const OnboardingManager = lazy(() => import('./pages/enterprise/knowledge/OnboardingManager'))
const KnowledgeBase = lazy(() => import('./pages/enterprise/knowledge/KnowledgeBase'))
const LearningCenter = lazy(() => import('./pages/enterprise/knowledge/LearningCenter'))
const ForecastingEngine = lazy(() => import('./pages/enterprise/planning/ForecastingEngine'))
const ScenarioPlanner = lazy(() => import('./pages/enterprise/planning/ScenarioPlanner'))
const CompensationPlanner = lazy(() => import('./pages/enterprise/planning/CompensationPlanner'))
const SuccessionPlanner = lazy(() => import('./pages/enterprise/planning/SuccessionPlanner'))
const CareerPathing = lazy(() => import('./pages/enterprise/planning/CareerPathing'))

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const isInitialized = useAuthStore((s) => s.isInitialized)

  // Still validating token with server
  if (!isInitialized) return <LoadingScreen />
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <>{children}</>
}

export default function App() {
  const applyTheme = useTenantStore((s) => s.applyTheme)
  const initializeAuth = useAuthStore((s) => s.initializeAuth)
  const fetchMyPermissions = usePermissionStore((s) => s.fetchMyPermissions)

  useEffect(() => {
    applyTheme()
    initializeAuth().then(() => {
      // Once authenticated, fetch granular permissions
      const userId = useAuthStore.getState().user?.id
      if (userId) {
        fetchMyPermissions(userId)
      }
    })
  }, [applyTheme, initializeAuth, fetchMyPermissions])

  return (
    <ErrorBoundary>
      <GlobalLoading />
      <OfflineIndicator />
      <SessionTimeoutProtection />
      <ToastContainer />
      <CommandMenu />
      <KeyboardShortcutsModal />
      <AnimatePresence mode="wait">
        <Suspense fallback={<LoadingScreen />}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<RoleBasedRedirect />} />
              <Route path="executive" element={<ExecutiveCommandCenter />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="dashboard/employee" element={<EmployeeDashboard />} />
              <Route path="dashboard/manager" element={<RequirePermission category="PERFORMANCE" action="READ"><ManagerDashboard /></RequirePermission>} />
              <Route path="dashboard/hr" element={<RequirePermission category="EMPLOYEE" action="READ"><HRDashboard /></RequirePermission>} />
              <Route path="dashboard/finance" element={<RequirePermission category="PAYROLL" action="READ"><FinanceDashboard /></RequirePermission>} />
              <Route path="dashboard/team-lead" element={<TeamLeadDashboard />} />
              <Route path="dashboard/dept-manager" element={<DeptManagerDashboard />} />
              <Route path="dashboard/hr-exec" element={<HRExecutiveDashboard />} />
              <Route path="dashboard/auditor" element={<AuditorDashboard />} />
              <Route path="analytics" element={<RequirePermission category="AI_INSIGHTS" action="READ"><AnalyticsDashboard /></RequirePermission>} />
              <Route path="reports" element={<RequirePermission category="SETTINGS" action="READ"><ReportsPage /></RequirePermission>} />
              <Route path="employees" element={<EmployeesPage />} />
              <Route path="employees/:id" element={<EmployeeProfilePage />} />
              <Route path="documents" element={<DocumentsPage />} />
              <Route path="attendance" element={<AttendancePage />} />
              <Route path="leaves" element={<LeavesPage />} />
              <Route path="payroll" element={<RequirePermission category="PAYROLL" action="READ"><PayrollPage /></RequirePermission>} />
              <Route path="performance" element={<RequirePermission category="PERFORMANCE" action="READ"><PerformancePage /></RequirePermission>} />
              <Route path="recruitment" element={<RequirePermission category="RECRUITMENT" action="READ"><RecruitmentDashboard /></RequirePermission>} />
              <Route path="recruitment/jobs" element={<RequirePermission category="RECRUITMENT" action="READ"><JobManagement /></RequirePermission>} />
              <Route path="recruitment/jobs/:jobId" element={<RequirePermission category="RECRUITMENT" action="READ"><CandidatePipeline /></RequirePermission>} />
              <Route path="recruitment/interviews" element={<RequirePermission category="RECRUITMENT" action="READ"><InterviewCalendar /></RequirePermission>} />
              <Route path="recruitment/offers" element={<RequirePermission category="RECRUITMENT" action="READ"><OfferManagement /></RequirePermission>} />
              <Route path="ai-insights" element={<RequirePermission category="AI_INSIGHTS" action="READ"><AiInsightsPage /></RequirePermission>} />
              <Route path="notifications" element={<NotificationsPage />} />
              {/* Enterprise Routes */}
              <Route path="enterprise" element={<EnterpriseHub />} />
              <Route path="features" element={<FeatureFlagCenter />} />
              <Route path="settings/tenant" element={<RequirePermission category="SETTINGS" action="UPDATE"><TenantSettings /></RequirePermission>} />
              <Route path="settings/security" element={<RequirePermission category="SECURITY" action="READ"><SecurityCenter /></RequirePermission>} />
              <Route path="security/rbac" element={<RequirePermission category="ROLES" action="READ"><RBACDashboard /></RequirePermission>} />
              <Route path="settings/permissions" element={<RequirePermission category="ROLES" action="UPDATE"><PermissionsManager /></RequirePermission>} />
              <Route path="settings/audit-logs" element={<RequirePermission category="AUDIT" action="READ"><AuditLogViewer /></RequirePermission>} />
              <Route path="settings/platform" element={<RequirePermission category="SETTINGS" action="UPDATE"><PlatformConfigCenter /></RequirePermission>} />
              <Route path="automation/forms" element={<FormBuilder />} />
              <Route path="automation/workflows" element={<WorkflowBuilder />} />
              <Route path="automation/approvals" element={<ApprovalEngine />} />
              <Route path="automation/delegation" element={<DelegationManager />} />
              <Route path="knowledge/releases" element={<ReleaseManager />} />
              <Route path="knowledge/onboarding" element={<OnboardingManager />} />
              <Route path="knowledge/wiki" element={<KnowledgeBase />} />
              <Route path="knowledge/learning" element={<LearningCenter />} />
              <Route path="planning/forecast" element={<ForecastingEngine />} />
              <Route path="planning/scenarios" element={<ScenarioPlanner />} />
              <Route path="planning/compensation" element={<CompensationPlanner />} />
              <Route path="planning/succession" element={<SuccessionPlanner />} />
              <Route path="planning/careers" element={<CareerPathing />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </AnimatePresence>
    </ErrorBoundary>
  )
}
