export type ThemeMode = 'enterprise' | 'voxel';

export interface ThemeTokens {
  mode: ThemeMode;
  background: string;
  cardBackground: string;
  heroBackground: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  accentPrimary: string;
  accentSecondary: string;
  accentSuccess: string;
  accentWarning: string;
  accentDanger: string;
  fontFamily: string;
}

export const EnterpriseTokens: ThemeTokens = {
  mode: 'enterprise',
  background: 'bg-[#F8F9FE]',
  cardBackground: 'bg-white border border-slate-200/80 shadow-sm hover:shadow-md',
  heroBackground: 'bg-gradient-to-br from-[#6D28D9] via-[#7C3AED] to-[#4F46E5]',
  textPrimary: 'text-[#0F172A]',
  textSecondary: 'text-[#334155]',
  textMuted: 'text-[#64748B]',
  border: 'border-slate-200',
  accentPrimary: '#7C3AED',
  accentSecondary: '#6366F1',
  accentSuccess: '#10B981',
  accentWarning: '#F59E0B',
  accentDanger: '#EF4444',
  fontFamily: 'font-sans',
};

export const VoxelTokens: ThemeTokens = {
  ...EnterpriseTokens,
  mode: 'voxel',
};

export const themeTokens: Record<ThemeMode, ThemeTokens> = {
  enterprise: EnterpriseTokens,
  voxel: VoxelTokens,
};

export const themeTokensMap: Record<ThemeMode, ThemeTokens> = themeTokens;
