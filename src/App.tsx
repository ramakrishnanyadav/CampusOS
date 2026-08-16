import React, { useState, useEffect } from "react";
import { BrowserRouter, useLocation, useNavigate } from "react-router-dom";
import { AuthProvider } from "./auth/AuthProvider";
import { SessionProvider } from "./session/SessionProvider";
import { ThemeProvider, useTheme } from "./theme/ThemeContext";

import { AIRuntimeProvider, useAIRuntime } from "./ai/runtime/AIRuntimeContext";
import { PermissionProvider, usePermissions } from "./auth/PermissionContext";
import { CampusStoreProvider, useCampusStore } from "./context/CampusStoreContext";
import { Header } from "./components/Header";
import { AIActivityEngine } from "./components/AIActivityEngine";
import { AIExplainabilityModal } from "./components/AIExplainabilityModal";
import { ElevatedAccessModal } from "./components/ElevatedAccessModal";
import { CommandPalette } from "./components/CommandPalette";
import { AmbientBackground } from "./components/AmbientBackground";
import { ToastContainer } from "./components/ui/ToastContainer";
import { OnboardingChecklist } from "./components/OnboardingChecklist";

import { AppRoutes, PATH_TAB_MAP, TAB_PATH_MAP, AppTab } from "./routes/AppRoutes";
import { isSoundMuted, toggleMuteSound } from "./utils/audio";

function MainAppContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const { tokens, playThemeSound } = useTheme();
  const {
    emitEvent,
    triggerAIActivity,
    triggerNarratedAction,
    isAIActive,
    activeDomainMessage,
    explainabilityItem,
    openExplainability,
    closeExplainability,
  } = useAIRuntime();

  const { session } = usePermissions();
  const {
    slots,
    students,
    alerts,
    toasts,
    removeToast,
    updateSlots,
    updateStudentStatus,
    resolveAlert,
  } = useCampusStore();

  const activeTab: AppTab = PATH_TAB_MAP[location.pathname] || "incidents";
  const [soundMuted, setSoundMuted] = useState(isSoundMuted());
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  const unresolvedAlerts = alerts.filter((a) => !a.resolved);

  const handleNavigateTab = (tabStr: string) => {
    const targetPath = TAB_PATH_MAP[tabStr as AppTab] || "/";
    navigate(targetPath);
  };

  const handleMuteToggle = () => {
    const isMuted = toggleMuteSound();
    setSoundMuted(isMuted);
  };

  const handleRunQuickAction = (actionId: string) => {
    if (actionId === "solve-timetable") {
      triggerAIActivity("Executing Timetable Auto-Solver...");
      emitEvent("Timetable Quick Fix", "scheduling", "Re-assigned Dr. Sarah Jenkins to Room 302");
    } else if (actionId === "ocr-hindi") {
      triggerAIActivity("Running Vision OCR Engine...");
      emitEvent("OCR Quick Scan", "ocr", "Extracted Hindi Admission Form");
    } else if (actionId === "checkin-students") {
      triggerNarratedAction(
        ["Scanning Gate Sensors...", "Verifying Roster...", "Check-In Complete"],
        () => {
          students.forEach((s) => updateStudentStatus(s.id, "PRESENT"));
        }
      );
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 relative ${tokens.background} ${tokens.fontFamily}`}>
      <AmbientBackground />
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      {/* Top Header — Full-width sticky navigation bar */}
      <Header
        activeTab={activeTab}
        setActiveTab={(tab: string) => {
          handleNavigateTab(tab);
          triggerAIActivity(`Showing ${tab}...`);
        }}
        unresolvedAlertCount={unresolvedAlerts.length}
        onMuteToggle={handleMuteToggle}
        soundMuted={soundMuted}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onRunQuickAction={handleRunQuickAction}
      />

      {/* Main Container — Centered with optimal responsive spacing */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 relative z-10">
        <OnboardingChecklist onNavigateTab={handleNavigateTab} />

        <main className="transition-all duration-300">
          <AppRoutes
            unresolvedAlertCount={unresolvedAlerts.length}
            alerts={alerts}
            slots={slots}
            students={students}
            onResolveAlert={resolveAlert}
            onUpdateSlots={updateSlots}
            onUpdateStudentStatus={updateStudentStatus}
            triggerAIActivity={triggerAIActivity}
            emitEvent={emitEvent}
            openExplainability={openExplainability}
            onNavigateTab={handleNavigateTab}
          />
        </main>

        <AIActivityEngine statusText={activeDomainMessage} isProcessing={isAIActive} />

        <AIExplainabilityModal
          item={explainabilityItem}
          onClose={closeExplainability}
          onExecuteAction={() => {
            emitEvent("Recommendation Executed", "ai", `Applied fix for ${explainabilityItem?.title}`);
            closeExplainability();
          }}
        />

        <ElevatedAccessModal />

        <CommandPalette
          isOpen={isCommandPaletteOpen}
          onClose={() => setIsCommandPaletteOpen(false)}
          onNavigateTab={(tab) => {
            handleNavigateTab(tab);
            triggerAIActivity(`Opening ${tab}...`);
          }}
          onRunOCR={() => {
            handleNavigateTab("ocr");
            triggerAIActivity("Reading document...");
          }}
          onResolveConflicts={() => {
            handleNavigateTab("solver");
            triggerAIActivity("Fixing timetable...");
          }}
        />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SessionProvider>
          <ThemeProvider>
            <AIRuntimeProvider>
              <PermissionProvider>
                <CampusStoreProvider>
                  <MainAppContent />
                </CampusStoreProvider>
              </PermissionProvider>
            </AIRuntimeProvider>
          </ThemeProvider>
        </SessionProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

