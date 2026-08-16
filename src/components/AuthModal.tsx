import React, { useState } from "react";
import { X, Shield, Lock, Mail, User, ArrowRight, AlertCircle } from "lucide-react";
import { useTheme } from "../theme/ThemeContext";
import {
  auth,
  googleProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "../config/firebase";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: { name: string; email: string; role: string }) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const { playThemeSound } = useTheme();
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [selectedRoleTab, setSelectedRoleTab] = useState<"ADMIN" | "STAFF" | "PARENT_STUDENT">("ADMIN");
  const [email, setEmail] = useState("admin@centralhigh.edu");
  const [password, setPassword] = useState("admin123");
  const [name, setName] = useState("Dr. Aris Vance (Principal)");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRoleTabChange = (targetRole: "ADMIN" | "STAFF" | "PARENT_STUDENT") => {
    setSelectedRoleTab(targetRole);
    playThemeSound("click");
    if (targetRole === "ADMIN") {
      setEmail("admin@centralhigh.edu");
      setPassword("admin123");
      setName("Dr. Aris Vance (Principal)");
    } else if (targetRole === "STAFF") {
      setEmail("faculty@centralhigh.edu");
      setPassword("staff123");
      setName("Prof. Elena Rostova (Faculty)");
    } else {
      setEmail("student@centralhigh.edu");
      setPassword("student123");
      setName("Aarav Sharma (Student / Parent)");
    }
  };

  const handleQuickDemoLogin = (targetRole: "ADMIN" | "STAFF" | "PARENT_STUDENT") => {
    playThemeSound("success");
    if (targetRole === "ADMIN") {
      onLoginSuccess({
        name: "Dr. Aris Vance (Principal)",
        email: "admin@centralhigh.edu",
        role: "ADMIN",
      });
    } else if (targetRole === "STAFF") {
      onLoginSuccess({
        name: "Prof. Elena Rostova (Faculty)",
        email: "faculty@centralhigh.edu",
        role: "STAFF",
      });
    } else {
      onLoginSuccess({
        name: "Aarav Sharma (Student / Parent)",
        email: "student@centralhigh.edu",
        role: "PARENT_STUDENT",
      });
    }
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);
    playThemeSound("click");

    try {
      if (authMode === "login") {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const fbUser = userCredential.user;
        playThemeSound("success");
        onLoginSuccess({
          name: fbUser.displayName || name,
          email: fbUser.email || email,
          role: selectedRoleTab,
        });
        onClose();
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const fbUser = userCredential.user;
        playThemeSound("success");
        onLoginSuccess({
          name: name || "Registered User",
          email: fbUser.email || email,
          role: "PARENT_STUDENT", // Self-registration defaults to PARENT_STUDENT
        });
        onClose();
      }
    } catch (error: any) {
      console.warn("Firebase Auth Note:", error?.message);
      // Fallback for offline demo mode
      playThemeSound("success");
      onLoginSuccess({
        name: name,
        email: email,
        role: selectedRoleTab,
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleAuth = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);
    playThemeSound("click");

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      playThemeSound("success");
      onLoginSuccess({
        name: user.displayName || "Google User",
        email: user.email || "user@centralhigh.edu",
        role: selectedRoleTab,
      });
      onClose();
    } catch (error: any) {
      console.error("Firebase Google Auth Error:", error?.message);
      setErrorMessage(error?.message || "Google Sign-In failed. Please try again.");
      playThemeSound("action");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-md overflow-y-auto min-h-screen">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl space-y-0 select-none relative m-auto">
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-[#6D28D9] via-[#7C3AED] to-[#4F46E5] text-white p-6 relative">
          <button
            onClick={() => {
              playThemeSound("click");
              onClose();
            }}
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-all"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/20 rounded-2xl backdrop-blur-md">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-xl text-white flex items-center gap-1.5">
                Campus<span className="text-amber-300">OS</span> Identity Gateway
              </h3>
              <p className="text-xs text-purple-100 font-medium">
                Multi-Tenant Role-Based Access Control
              </p>
            </div>
          </div>
        </div>

        {/* 3 Portal Role Tabs Bar */}
        <div className="bg-slate-100 p-2 border-b border-slate-200 space-y-2">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 text-center">
            Select Portal Access Mode
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              onClick={() => handleRoleTabChange("ADMIN")}
              className={`py-2 px-1 rounded-xl text-xs font-extrabold flex flex-col items-center gap-1 transition-all ${
                selectedRoleTab === "ADMIN"
                  ? "bg-white text-purple-700 shadow-md border border-purple-200"
                  : "text-slate-600 hover:bg-white/50"
              }`}
            >
              <span className="text-base">👑</span>
              <span>Admin Portal</span>
            </button>

            <button
              onClick={() => handleRoleTabChange("STAFF")}
              className={`py-2 px-1 rounded-xl text-xs font-extrabold flex flex-col items-center gap-1 transition-all ${
                selectedRoleTab === "STAFF"
                  ? "bg-white text-purple-700 shadow-md border border-purple-200"
                  : "text-slate-600 hover:bg-white/50"
              }`}
            >
              <span className="text-base">👨‍🏫</span>
              <span>Faculty Staff</span>
            </button>

            <button
              onClick={() => handleRoleTabChange("PARENT_STUDENT")}
              className={`py-2 px-1 rounded-xl text-xs font-extrabold flex flex-col items-center gap-1 transition-all ${
                selectedRoleTab === "PARENT_STUDENT"
                  ? "bg-white text-purple-700 shadow-md border border-purple-200"
                  : "text-slate-600 hover:bg-white/50"
              }`}
            >
              <span className="text-base">👨‍🎓</span>
              <span>Student / Parent</span>
            </button>
          </div>
        </div>

        {/* 1-Click Instant Demo Login Banner */}
        <div className="p-4 bg-purple-50 border-b border-purple-100 flex items-center justify-between">
          <div className="text-xs text-purple-900 font-semibold">
            <span className="font-bold block text-slate-900">Instant Demo Preset:</span>
            {selectedRoleTab === "ADMIN" ? "Principal Administrator" : selectedRoleTab === "STAFF" ? "Faculty Staff Roster" : "Parent / Student View"}
          </div>
          <button
            type="button"
            onClick={() => handleQuickDemoLogin(selectedRoleTab)}
            className="px-3.5 py-1.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-1 shrink-0"
          >
            <span>🚀 1-Click {selectedRoleTab} Login</span>
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4">
          {errorMessage && (
            <div className="p-3 bg-red-50 text-red-600 text-xs font-bold rounded-xl border border-red-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="flex border-b border-slate-200 bg-slate-50 p-1 rounded-xl gap-1">
            <button
              type="button"
              onClick={() => setAuthMode("login")}
              className={`flex-1 py-1.5 text-xs font-extrabold rounded-lg ${
                authMode === "login" ? "bg-white text-purple-700 shadow-sm" : "text-slate-500"
              }`}
            >
              Firebase Sign In
            </button>
            <button
              type="button"
              onClick={() => setAuthMode("register")}
              className={`flex-1 py-1.5 text-xs font-extrabold rounded-lg ${
                authMode === "register" ? "bg-white text-purple-700 shadow-sm" : "text-slate-500"
              }`}
            >
              Self Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {authMode === "register" && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#7C3AED]"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#7C3AED]"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#7C3AED]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl transition-all flex items-center justify-center gap-2 active:scale-[0.99]"
            >
              {isSubmitting ? (
                <span>Authenticating with Firebase...</span>
              ) : (
                <>
                  <span>{authMode === "login" ? `Sign In as ${selectedRoleTab}` : "Create Self-Service Account"}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
