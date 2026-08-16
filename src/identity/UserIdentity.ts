export interface Organization {
  id: string;
  name: string;
  code: string;
  tier: 'ENTERPRISE' | 'STANDARD' | 'TRIAL';
  logoUrl?: string;
  activeLicenses: number;
  maxLicenses: number;
}

export interface Campus {
  id: string;
  organizationId: string;
  name: string;
  code: string;
  location: string;
  centerLat: number;
  centerLng: number;
  isMainCampus: boolean;
}

export interface Department {
  id: string;
  campusId: string;
  name: string;
  code: string;
  headOfDepartmentId?: string;
}

export interface Profile {
  uid: string;
  displayName: string;
  email: string;
  phoneNumber?: string;
  photoURL?: string;
  employeeId?: string;
  studentId?: string;
  title?: string;
  bio?: string;
}

export interface UserIdentity {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  organizationId: string;
  campusId: string;
  departmentId?: string;
  employeeId?: string;
  studentId?: string;
  accountStatus: 'ACTIVE' | 'SUSPENDED' | 'PENDING_VERIFICATION';
  emailVerified: boolean;
  lastLogin: string;
  userType: 'SUPER_ADMIN' | 'PRINCIPAL' | 'HOD' | 'TEACHER' | 'PARENT' | 'STUDENT';
}
