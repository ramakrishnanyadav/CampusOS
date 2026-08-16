import React, { ReactNode } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { usePermissions } from '../auth/PermissionContext';
import { Capability } from '../auth/Capability';
import { ErrorBoundary } from '../components/ErrorBoundary';

import { ProductLandingHome } from '../components/ProductLandingHome';
import { StudentPortalView } from '../components/StudentPortalView';
import { DocumentOCR } from '../components/DocumentOCR';
import { TimetableSolver } from '../components/TimetableSolver';
import { SpatialAttendance } from '../components/SpatialAttendance';
import { CampusWayfindingMap } from '../components/CampusWayfindingMap';
import { StaffingAnalytics } from '../components/StaffingAnalytics';
import { AdminDirectory } from '../components/AdminDirectory';
import { CampusSetupPortal } from '../components/CampusSetupPortal';

export type AppTab =
  | 'incidents'
  | 'ocr'
  | 'solver'
  | 'attendance'
  | 'map'
  | 'analytics'
  | 'directory'
  | 'setup';

export const TAB_PATH_MAP: Record<AppTab, string> = {
  incidents: '/',
  ocr: '/ocr',
  solver: '/solver',
  attendance: '/attendance',
  map: '/map',
  analytics: '/analytics',
  directory: '/directory',
  setup: '/setup',
};

export const PATH_TAB_MAP: Record<string, AppTab> = {
  '/': 'incidents',
  '/ocr': 'ocr',
  '/solver': 'solver',
  '/attendance': 'attendance',
  '/map': 'map',
  '/analytics': 'analytics',
  '/directory': 'directory',
  '/setup': 'setup',
};

interface RequireAuthProps {
  children: ReactNode;
}

export const RequireAuth: React.FC<RequireAuthProps> = ({ children }) => {
  const { authStatus } = usePermissions();

  if (authStatus === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-semibold text-slate-500">Verifying session credentials...</span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

interface RequireCapabilityProps {
  capability: Capability | string;
  children: ReactNode;
}

export const RequireCapability: React.FC<RequireCapabilityProps> = ({ capability, children }) => {
  const { hasCapability, authStatus } = usePermissions();

  if (authStatus === 'loading') {
    return null;
  }

  if (!hasCapability(capability)) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center space-y-4 shadow-sm">
        <h3 className="font-extrabold text-xl text-slate-900 dark:text-white">Access Denied</h3>
        <p className="text-xs text-slate-500">
          Required capability: <span className="font-mono text-purple-600 font-bold">{String(capability)}</span>
        </p>
      </div>
    );
  }

  return <>{children}</>;
};

interface AppRoutesProps {
  unresolvedAlertCount: number;
  alerts: any[];
  slots: any[];
  students: any[];
  onResolveAlert: (id: string) => void;
  onUpdateSlots: (slots: any[]) => void;
  onUpdateStudentStatus: (id: string, status?: any) => void;
  triggerAIActivity: (msg: string) => void;
  emitEvent: (title: string, domain: any, detail: string) => void;
  openExplainability: (item: any) => void;
  onNavigateTab: (tab: string) => void;
}

export const AppRoutes: React.FC<AppRoutesProps> = ({
  unresolvedAlertCount,
  alerts,
  slots,
  students,
  onResolveAlert,
  onUpdateSlots,
  onUpdateStudentStatus,
  triggerAIActivity,
  emitEvent,
  openExplainability,
  onNavigateTab,
}) => {
  const { session } = usePermissions();

  return (
    <Routes>
      <Route
        path="/"
        element={
          session.role === 'PARENT_STUDENT' ? (
            <StudentPortalView onNavigateTab={onNavigateTab} />
          ) : (
            <ProductLandingHome
              unresolvedAlertCount={unresolvedAlertCount}
              alerts={alerts}
              onResolveAlert={onResolveAlert}
              onResetAlerts={() => {}}
              onNavigateTab={onNavigateTab}
            />
          )
        }
      />
      <Route
        path="/ocr"
        element={
          <ErrorBoundary moduleName="Document Vision OCR Module">
            <DocumentOCR
              onFormExtracted={() => {
                triggerAIActivity('Document read complete');
                emitEvent('Document Read', 'ocr', 'Extracted Hindi Admission Form details');
              }}
              onOpenExplainability={openExplainability}
            />
          </ErrorBoundary>
        }
      />
      <Route
        path="/solver"
        element={
          <ErrorBoundary moduleName="Backtracking CSP Timetable Solver Module">
            <TimetableSolver
              slots={slots}
              onUpdateSlots={onUpdateSlots}
              onOpenExplainability={openExplainability}
            />
          </ErrorBoundary>
        }
      />
      <Route
        path="/attendance"
        element={
          <ErrorBoundary moduleName="Spatial Attendance RFID Module">
            <SpatialAttendance
              students={students}
              onCheckInStudent={(id, status) => onUpdateStudentStatus(id, status || 'PRESENT')}
              onSimulateBatchCheckIn={() => students.forEach((s) => onUpdateStudentStatus(s.id, 'PRESENT'))}
              onOpenExplainability={openExplainability}
            />
          </ErrorBoundary>
        }
      />
      <Route
        path="/map"
        element={
          <ErrorBoundary moduleName="Campus Spatial Wayfinding Map">
            <CampusWayfindingMap />
          </ErrorBoundary>
        }
      />
      <Route
        path="/analytics"
        element={
          <ErrorBoundary moduleName="ML Staffing & Predictive Analytics Module">
            <StaffingAnalytics students={students} onOpenExplainability={openExplainability} />
          </ErrorBoundary>
        }
      />
      <Route
        path="/directory"
        element={
          <ErrorBoundary moduleName="Master Admin Directory & Ingestion">
            <AdminDirectory />
          </ErrorBoundary>
        }
      />
      <Route
        path="/setup"
        element={
          <ErrorBoundary moduleName="Campus Master Setup Portal">
            <CampusSetupPortal />
          </ErrorBoundary>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
