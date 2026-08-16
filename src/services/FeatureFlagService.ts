export interface OrganizationFeatureFlags {
  campusNavigation: boolean;
  aiOCR: boolean;
  aiStaffing: boolean;
  betaModules: boolean;
  emergencyControl: boolean;
  customBranding: boolean;
}

const DEFAULT_FLAGS: OrganizationFeatureFlags = {
  campusNavigation: true,
  aiOCR: true,
  aiStaffing: true,
  betaModules: true,
  emergencyControl: true,
  customBranding: true,
};

export class FeatureFlagService {
  private static flags: Record<string, OrganizationFeatureFlags> = {
    'org-central-high': DEFAULT_FLAGS,
  };

  public static getFlagsForOrg(orgId: string): OrganizationFeatureFlags {
    return this.flags[orgId] || DEFAULT_FLAGS;
  }

  public static isFeatureEnabled(orgId: string, feature: keyof OrganizationFeatureFlags): boolean {
    const flags = this.getFlagsForOrg(orgId);
    return flags[feature] ?? true;
  }
}
