import React, { useState } from 'react';
import {
  ShieldCheck,
  Building2,
  Lock,
  Smartphone,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Key,
  Globe,
  Monitor,
  RefreshCw,
  Zap,
  ArrowRight,
  UserCheck,
} from 'lucide-react';
import { useAuth } from '../auth/AuthProvider';
import { usePermissions, UserRole } from '../auth/PermissionContext';
import { UserIdentity } from '../identity/UserIdentity';

import { DeviceManager } from '../auth/DeviceManager';
import { MFAService, MFAMethod } from '../security/MFAService';
import { PasswordPolicy } from '../security/PasswordPolicy';

interface EnterpriseLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EnterpriseLoginModal: React.FC<EnterpriseLoginModalProps> = ({ isOpen, onClose }) => {
  const { stage, identity, login, logout, switchIdentityType } = useAuth();

  const [email, setEmail] = useState('admin@centralhigh.edu');
  const [password, setPassword] = useState('CampusOS#2026Secure');
  const [selectedRole, setSelectedRole] = useState<UserIdentity['userType']>('PRINCIPAL');
  const [selectedMFA, setSelectedMFA] = useState<MFAMethod>('AUTHENTICATOR_APP');
  const [mfaCode, setMfaCode] = useState('');
  const [showMFA, setShowMFA] = useState(false);
  const [mfaError, setMfaError] = useState('');

  if (!isOpen) return null;

  const passwordVal = PasswordPolicy.validate(password);
  const loginHistory = DeviceManager.getLoginHistory();
  const fp = DeviceManager.getDeviceFingerprint();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showMFA) {
      setShowMFA(true);
      return;
    }

    if (mfaCode.length < 6) {
      setMfaError('Please enter a 6-digit MFA verification code (e.g. 123456).');
      return;
    }

    setMfaError('');
    const targetRole: UserRole =
      selectedRole === 'PARENT' || selectedRole === 'STUDENT'
        ? 'PARENT_STUDENT'
        : selectedRole === 'HOD' || selectedRole === 'TEACHER'
        ? 'STAFF'
        : 'ADMIN';
    switchWorkspaceRole(targetRole);
    await login(email, password, selectedRole);
    setShowMFA(false);
    onClose();
  };

  const { switchWorkspaceRole } = usePermissions();

  const handleRoleQuickSwitch = async (type: UserIdentity['userType']) => {
    setSelectedRole(type);
    const targetRole: UserRole =
      type === 'PARENT' || type === 'STUDENT'
        ? 'PARENT_STUDENT'
        : type === 'HOD' || type === 'TEACHER'
        ? 'STAFF'
        : 'ADMIN';

    switchWorkspaceRole(targetRole);
    await switchIdentityType(type);
    onClose();
  };


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-md animate-in fade-in duration-200 select-none overflow-y-auto min-h-screen">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl space-y-0 relative my-auto flex flex-col">
        {/* Stage Loading Banner (Smooth Transition) */}
        {stage !== 'AUTHENTICATED' && stage !== 'SIGN_IN' && (
          <div className="bg-gradient-to-r from-purple-700 via-indigo-600 to-slate-900 text-white p-8 text-center space-y-4">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mx-auto backdrop-blur-md animate-spin">
              <RefreshCw className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-xl tracking-tight">Enterprise Authentication Pipeline</h3>
              <p className="text-xs text-purple-200 mt-1 font-mono uppercase tracking-wider font-bold">
                Stage: {stage.replace(/_/g, ' ')}
              </p>
            </div>
            <div className="w-full bg-white/20 h-1.5 rounded-full overflow-hidden max-w-xs mx-auto">
              <div
                className="bg-white h-full transition-all duration-300"
                style={{
                  width:
                    stage === 'AUTHENTICATING'
                      ? '25%'
                      : stage === 'LOADING_ORGANIZATION'
                      ? '50%'
                      : stage === 'LOADING_PERMISSIONS'
                      ? '75%'
                      : stage === 'PREPARING_WORKSPACE'
                      ? '90%'
                      : '100%',
                }}
              />
            </div>
          </div>
        )}

        {/* Modal Header & Content */}
        {(stage === 'SIGN_IN' || stage === 'AUTHENTICATED') && (

          <>
            <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 text-white p-6 relative flex items-center justify-between border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-purple-600/30 border border-purple-500/40 rounded-2xl backdrop-blur-md">
                  <ShieldCheck className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-white">CampusOS Enterprise Identity Portal</h3>
                  <p className="text-xs text-purple-200 font-medium">
                    Google Workspace & Microsoft 365 Architecture Standard
                  </p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 text-white/70 hover:text-white bg-white/10 rounded-full">
                ✕
              </button>
            </div>

            {/* Content Body */}
            <div className="p-6 space-y-5 overflow-y-auto max-h-[75vh]">
              {/* Quick Persona Switcher for Evaluation */}
              <div className="p-3 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 rounded-2xl space-y-2">
                <span className="text-[11px] font-extrabold uppercase text-purple-900 dark:text-purple-300 block tracking-wider">
                  Switch Enterprise Persona (Identity Resolution Test):
                </span>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                  {(['SUPER_ADMIN', 'PRINCIPAL', 'HOD', 'TEACHER', 'PARENT', 'STUDENT'] as UserIdentity['userType'][]).map(
                    (type) => (
                      <button
                        key={type}
                        onClick={() => handleRoleQuickSwitch(type)}
                        className={`px-2 py-1.5 text-[10px] font-extrabold rounded-xl transition-all ${
                          identity?.userType === type
                            ? 'bg-purple-600 text-white shadow-md'
                            : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        {type.replace('_', ' ')}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {!showMFA ? (
                  <>
                    <div>
                      <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase block mb-1">
                        Enterprise Email Identifier
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase block mb-1">
                        Account Password
                      </label>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
                      />
                      <div className="mt-1 flex items-center justify-between text-[10px] text-slate-500 font-medium">
                        <span>Password Strength: <strong className="text-purple-600">{passwordVal.strengthScore}%</strong></span>
                        <span>{passwordVal.isValid ? '✅ Passes Policy' : '⚠️ Password Complexity Required'}</span>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                      <span>Proceed to MFA Challenge</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <div className="space-y-4 animate-in fade-in">
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 font-medium">
                      <strong>Multi-Factor Authentication (MFA) Required</strong>
                      <p className="mt-0.5 text-[11px]">Enter verification code sent to your registered authenticator or email.</p>
                    </div>

                    <div>
                      <label className="text-xs font-extrabold text-slate-700 uppercase block mb-1">
                        6-Digit MFA Verification Code
                      </label>
                      <input
                        type="text"
                        maxLength={6}
                        placeholder="123456"
                        value={mfaCode}
                        onChange={(e) => setMfaCode(e.target.value)}
                        required
                        className="w-full text-center tracking-[0.5em] font-mono text-lg font-black py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-purple-500"
                      />
                      {mfaError && <span className="text-[11px] font-bold text-rose-600 mt-1 block">{mfaError}</span>}
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setShowMFA(false)}
                        className="w-1/3 py-2.5 bg-slate-200 text-slate-800 font-extrabold text-xs rounded-xl"
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        className="w-2/3 py-2.5 bg-purple-600 text-white font-extrabold text-xs rounded-xl shadow-md"
                      >
                        Verify Identity & Launch Workspace
                      </button>
                    </div>
                  </div>
                )}
              </form>

              {/* Device Fingerprint & Recent Login History */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                  <span className="flex items-center gap-1.5">
                    <Monitor className="w-3.5 h-3.5 text-purple-600" />
                    Trusted Device Fingerprint:
                  </span>
                  <span className="font-mono text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md font-bold text-slate-700 dark:text-slate-300">
                    {fp}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] font-extrabold uppercase text-slate-400 block">Recent Audit Login History</span>
                  <div className="space-y-1 max-h-24 overflow-y-auto">
                    {loginHistory.slice(0, 3).map((rec) => (
                      <div key={rec.id} className="p-2 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-[11px] flex items-center justify-between">
                        <div>
                          <strong className="text-slate-800 dark:text-slate-200 block">{rec.browser}</strong>
                          <span className="text-[10px] text-slate-400">{rec.location} • {rec.ip}</span>
                        </div>
                        <span className="text-[10px] font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                          {rec.result}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
