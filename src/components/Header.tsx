import React, { useState } from "react";
import {
  ShieldAlert,
  FileText,
  Calendar,
  Users,
  BarChart3,
  Search,
  Bell,
  ChevronDown,
  User,
  Shield,
  Activity,
  LogOut,
  Moon,
  Sun,
  Key,
  Building2,
  Check,
  Compass,
  Menu,
  X,
  Sparkles,
} from "lucide-react";

import { useTheme } from "../theme/ThemeContext";
import { usePermissions } from "../auth/PermissionContext";
import { Capability } from "../auth/Capability";
import { AuditDrawer } from "./AuditDrawer";
import { useAuth } from "../auth/AuthProvider";
import { EnterpriseLoginModal } from "./EnterpriseLoginModal";

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  unresolvedAlertCount: number;
  onMuteToggle: () => void;
  soundMuted: boolean;
  onOpenCommandPalette?: () => void;
  onRunQuickAction?: (actionId: string) => void;
  onLoginSuccess?: (user: { name: string; email: string; role: string }) => void;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  unresolvedAlertCount,
  onMuteToggle,
  soundMuted,
  onOpenCommandPalette,
  onRunQuickAction,
  onLoginSuccess,
  onLogout,
}) => {
  const { playThemeSound, themeMode, setThemeMode } = useTheme();
  const { session, hasCapability } = usePermissions();
  const { identity, logout: authLogout } = useAuth();

  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isEnterpriseLoginOpen, setIsEnterpriseLoginOpen] = useState(false);
  const [isAuditDrawerOpen, setIsAuditDrawerOpen] = useState(false);

  const navItems = [
    {
      id: "incidents",
      label: "Overview",
      icon: ShieldAlert,
      badge: unresolvedAlertCount,
      capabilityNeeded: Capability.INCIDENT_MANAGE,
    },
    {
      id: "ocr",
      label: "OCR Documents",
      icon: FileText,
      capabilityNeeded: Capability.OCR_WRITE,
    },
    {
      id: "solver",
      label: "Timetable",
      icon: Calendar,
      capabilityNeeded: Capability.TIMETABLE_READ,
    },
    {
      id: "attendance",
      label: "Attendance",
      icon: Users,
      capabilityNeeded: Capability.ATTENDANCE_READ,
    },
    {
      id: "map",
      label: "Campus Map",
      icon: Compass,
      capabilityNeeded: Capability.CAMPUS_MAP_VIEW,
    },
    {
      id: "analytics",
      label: "Staffing",
      icon: BarChart3,
      capabilityNeeded: Capability.STAFFING_WRITE,
    },
    {
      id: "directory",
      label: "Admin Directory",
      icon: Building2,
      capabilityNeeded: Capability.CONFIG_WRITE,
    },
    {
      id: "setup",
      label: "Campus Setup",
      icon: Building2,
      capabilityNeeded: Capability.CONFIG_WRITE,
    },
  ];

  const allowedNavItems = navItems.filter((item) => hasCapability(item.capabilityNeeded));

  return (
    <header className="w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl sticky top-0 z-40 border-b border-slate-200/80 dark:border-slate-800/80 py-2.5 px-3 sm:px-6 lg:px-8 transition-all select-none shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
        {/* 1. Left: Brand Logo */}
        <button
          onClick={() => {
            setActiveTab("incidents");
            playThemeSound("click");
          }}
          className="flex items-center gap-2.5 group text-left shrink-0"
        >
          <div className="w-9 h-9 bg-gradient-to-tr from-[#6D28D9] via-[#7C3AED] to-[#4F46E5] rounded-xl flex items-center justify-center shadow-md shadow-purple-500/20 group-hover:scale-105 transition-all">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <div className="hidden sm:block">
            <span className="font-black text-base text-slate-900 dark:text-white tracking-tight block leading-none">
              CampusOS
            </span>
            <span className="text-[9px] font-extrabold text-purple-600 dark:text-purple-400 uppercase tracking-widest block mt-0.5">
              OPERATIONAL INTELLIGENCE
            </span>
          </div>
        </button>

        {/* 2. Middle: Flexible Non-Colliding Responsive Navigation Bar */}
        <nav className="flex-1 min-w-0 mx-1 sm:mx-3 flex items-center gap-1 bg-slate-100/90 dark:bg-slate-800/80 p-1.5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 overflow-x-auto scrollbar-none">
          {allowedNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  playThemeSound("click");
                  setActiveTab(item.id);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 shrink-0 whitespace-nowrap ${
                  isActive
                    ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                    : "text-slate-700 dark:text-slate-200 hover:bg-slate-200/70 dark:hover:bg-slate-700 hover:text-purple-700 dark:hover:text-purple-300"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="w-4 h-4 bg-rose-500 text-white font-black text-[10px] rounded-full flex items-center justify-center shadow-sm ml-0.5">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* 3. Right: Search, Theme Toggle, Notifications, Profile, Mobile Menu */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Universal Search / Command Palette Button */}
          <button
            onClick={() => {
              playThemeSound("click");
              if (onOpenCommandPalette) onOpenCommandPalette();
            }}
            className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-slate-500 dark:text-slate-400 text-xs font-semibold transition-all flex items-center gap-2 border border-slate-200/60 dark:border-slate-700/60"
          >
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Search...</span>
            <kbd className="hidden sm:inline px-1.5 py-0.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-[10px] font-mono text-slate-400">
              Ctrl+K
            </kbd>
          </button>

          {/* Theme Toggle Button */}
          <button
            onClick={() => {
              playThemeSound("click");
              setThemeMode(themeMode === "enterprise" ? "voxel" : "enterprise");
            }}
            className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-slate-600 dark:text-slate-300 transition-all border border-slate-200/60 dark:border-slate-700/60"
            title="Toggle Enterprise/Voxel Theme"
          >
            {themeMode === "enterprise" ? <Sun className="w-4 h-4 text-amber-500" /> : <Sparkles className="w-4 h-4 text-purple-400" />}
          </button>


          {/* Notifications Bell */}
          <button
            onClick={() => {
              playThemeSound("click");
              setActiveTab("incidents");
            }}
            className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-slate-600 dark:text-slate-300 transition-all relative border border-slate-200/60 dark:border-slate-700/60"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unresolvedAlertCount > 0 && (
              <span className="w-2 h-2 bg-rose-500 rounded-full absolute top-1.5 right-1.5 animate-ping" />
            )}
          </button>


          {/* Profile Dropdown Menu Trigger */}
          <div className="relative">
            <button
              onClick={() => {
                playThemeSound("click");
                setIsProfileMenuOpen(!isProfileMenuOpen);
              }}
              className="flex items-center gap-2.5 p-1.5 pl-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-2xl transition-all"
            >
              <div className="w-7 h-7 bg-[#7C3AED] text-white rounded-xl font-extrabold text-xs flex items-center justify-center">
                {(identity?.displayName || session.name).charAt(0)}
              </div>
              <div className="hidden lg:block text-left pr-1">
                <span className="text-xs font-extrabold text-slate-900 dark:text-white block leading-none">
                  {(identity?.displayName || session.name).split(" ")[0]}
                </span>
                <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 block mt-0.5 uppercase tracking-wider">
                  {identity?.userType || session.role}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Profile Dropdown Panel */}
            {isProfileMenuOpen && (
              <div className="absolute right-0 mt-3 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-3 space-y-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl space-y-1">
                  <span className="text-xs font-extrabold text-slate-900 dark:text-white block">
                    {identity?.displayName || session.name}
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium block font-mono">
                    {identity?.email || session.email}
                  </span>
                  <span className="text-[10px] font-extrabold text-purple-700 dark:text-purple-300 block uppercase tracking-wider">
                    {identity?.userType || session.role} • {identity?.organizationId || 'org-central-high'}
                  </span>
                  <span className="inline-block px-2 py-0.5 bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-300 font-extrabold text-[10px] rounded-lg mt-1">
                    {session.role} WORKSPACE
                  </span>
                </div>

                {/* Clean Authenticated User Actions */}

                <div className="space-y-1 pt-1 border-t border-slate-100 dark:border-slate-800">
                  {hasCapability(Capability.INFRASTRUCTURE_WRITE) && (
                    <button
                      onClick={() => {
                        setIsAuditDrawerOpen(true);
                        setIsProfileMenuOpen(false);
                        playThemeSound("click");
                      }}
                      className="w-full px-3 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center gap-2"
                    >
                      <Activity className="w-4 h-4 text-purple-600" />
                      <span>Enterprise Audit Logs</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setIsEnterpriseLoginOpen(true);
                      setIsProfileMenuOpen(false);
                      playThemeSound("click");
                    }}
                    className="w-full px-3 py-2 rounded-xl text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/40 dark:text-purple-300 transition-all flex items-center gap-2"
                  >
                    <Key className="w-4 h-4 text-[#7C3AED]" />
                    <span>Enterprise Identity Portal</span>
                  </button>

                  {onLogout && (
                    <button
                      onClick={() => {
                        authLogout();
                        if (onLogout) onLogout();
                        setIsProfileMenuOpen(false);
                        playThemeSound("action");
                      }}
                      className="w-full px-3 py-2 rounded-xl text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-all flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Auth & Audit Modals */}
      <EnterpriseLoginModal
        isOpen={isEnterpriseLoginOpen}
        onClose={() => setIsEnterpriseLoginOpen(false)}
      />

      {isAuditDrawerOpen && (
        <AuditDrawer
          isOpen={isAuditDrawerOpen}
          onClose={() => setIsAuditDrawerOpen(false)}
        />
      )}
    </header>

  );
};
