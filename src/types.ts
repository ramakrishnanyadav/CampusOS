export type AlertCategory = 'schedule' | 'paperwork' | 'staffing' | 'attendance';
export type Severity = 'critical' | 'warning' | 'info';

export interface CommandAlert {
  id: string;
  title: string;
  description: string;
  category: AlertCategory;
  severity: Severity;
  location: string;
  xpReward: number;
  resolved: boolean;
  resolvedAt?: string;
  actionPrompt: string;
  targetHitCount?: number;
}

export interface TimetableSlot {
  id: string;
  day: 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri';
  period: number; // 1 to 6
  timeLabel: string;
  grade: string;
  subject: string;
  teacher: string;
  room: string;
  isConflict: boolean;
  conflictReason?: string;
  signalStrength: number;
}

export interface ProcessedDocumentData {
  document_metadata: {
    detected_type: 'ADMISSION_FORM' | 'REPORT_CARD' | 'FEE_RECEIPT' | 'LEAVE_LETTER' | 'UNKNOWN';
    detected_language: string;
    confidence_score: number;
    theme_status: 'DIRECT_HIT' | 'NEEDS_REPAIR' | 'WARNING' | 'NEEDS_REVIEW';
    /** True when the AI path fully failed and mock data was returned. UI must warn the user. */
    is_demo_fallback?: boolean;
    /** Which AI provider produced this result, e.g. "OmniRoute/auto" or "Groq Vision (qwen...)". */
    ai_provider?: string;
  };
  extracted_data: {
    student_name: {
      raw: string;
      english: string;
    };
    student_id?: string | null;
    document_date?: string | null;
    key_attributes: Record<string, unknown>;
  };
  review_and_validation: {
    flagged_fields: Array<{
      field_name: string;
      reason: string;
    }>;
    is_ready_for_database: boolean;
  };
  voice_confirmation_script: string;
}

export type CraftedDocumentData = ProcessedDocumentData;

export interface FormItem {
  id: string;
  title: string;
  type: string;
  language?: string;
  previewUrl?: string;
  rawSampleText?: string;
  status: 'unprocessed' | 'processing' | 'processed';
  extractedData?: ProcessedDocumentData;
}

// ─── Student ────────────────────────────────────────────────────────────────

export interface AttendanceStudent {
  id: string;
  name: string;
  avatar: string;
  /** e.g. "Grade 10-A" — kept for legacy display compatibility */
  grade: string;
  /** Standard/year number, e.g. 10 */
  std: number;
  /** Division letter, e.g. "A" */
  division: string;
  /** Roll number within the class */
  rollNo: number;
  status: 'PRESENT' | 'LATE' | 'ABSENT';
  checkInTime?: string;
  gateZone: string;
  healthBar: number;
  expLevel: number;
  /** Last 4 digits of Aadhaar — never store full number client-side */
  aadhaarLast4?: string;
}

// ─── Faculty ─────────────────────────────────────────────────────────────────

export interface FacultyMember {
  id: string;
  /** Employee/payroll code, e.g. "EMP-2041" */
  employeeCode: string;
  name: string;
  department: string;
  subjectsQualified: string[];
  employmentStatus: 'FULL_TIME' | 'PART_TIME' | 'ADJUNCT' | 'ON_LEAVE';
  maxDailyLimit: number;
  avatar?: string;
  /** Highest qualification, e.g. "M.Sc. Physics", "B.Ed." */
  qualification: string;
  /** Languages the teacher can instruct in, e.g. ["English", "Hindi", "Marathi"] */
  languagesSpoken: string[];
  /** Class-section codes this teacher is currently assigned to, e.g. ["10-A", "10-B"] */
  assignedClasses: string[];
}

export interface AttendanceStaff {
  id: string;
  name: string;
  department: string;
  status: 'PRESENT' | 'LATE' | 'ABSENT';
  checkInTime?: string;
  gateZone: string;
}

// ─── Infrastructure ──────────────────────────────────────────────────────────

export type RoomCategoryType =
  | 'General Classroom'
  | 'Science Lab'
  | 'CS Lab'
  | 'Central Library'
  | 'Auditorium'
  | 'Gymnasium'
  | 'Sports Ground'
  | 'Staff Room'
  | 'Swimming Pool'
  | 'Canteen / Cafeteria'
  | 'Medical Bay'
  | 'Examination Hall'
  | 'Music & Art Studio'
  | 'ICT / Server Room'
  | 'Security / CCTV Room'
  | 'Parking Zone'
  | 'Generator Room'
  | 'Other';

export interface RoomItem {
  id: string;
  name: string;
  type: RoomCategoryType | string;
  capacity: number;
  building: string;
  floor?: number;
  isAccessible?: boolean;
  isAvailable?: boolean;
  notes?: string;
}

export type InfrastructureRoom = RoomItem;

export interface BusRoute {
  id: string;
  busNumber: string;
  route: string;
  capacity: number;
  driverName: string;
  driverContact: string;
  isOperational: boolean;
  assignedStudentIds?: string[];
}

export type InfrastructureBus = BusRoute;

/** Aggregate summary derived from live room & bus registries */
export interface InfrastructureSummary {
  classrooms: RoomItem[];
  labs: RoomItem[];
  libraries: RoomItem[];
  auditoriums: RoomItem[];
  gymAndSports: RoomItem[];
  specialized: RoomItem[];
  buses: BusRoute[];
  totalCapacity: number;
  totalRooms: number;
  lastUpdated: string;
}


// ─── CSV Bulk Import ─────────────────────────────────────────────────────────

/** Generic result from a CSV import operation */
export interface CSVImportResult<T> {
  valid: T[];
  invalid: Array<{
    rowNumber: number;
    rawRow: Record<string, string>;
    errors: string[];
  }>;
  totalRows: number;
  successCount: number;
  errorCount: number;
}

/** Expected columns in a student bulk-import CSV */
export interface StudentCSVRow {
  name: string;
  rollNo: string;
  std: string;
  division: string;
  grade?: string;
  aadhaarLast4?: string;
  gateZone?: string;
}

/** Expected columns in a faculty bulk-import CSV */
export interface FacultyCSVRow {
  employeeCode: string;
  name: string;
  department: string;
  qualification: string;
  subjectsQualified: string; // comma-separated
  languagesSpoken: string;   // comma-separated
  assignedClasses: string;   // comma-separated
  employmentStatus: string;
  maxDailyLimit: string;
}

// ─── Remaining types ─────────────────────────────────────────────────────────

export interface DepartmentStaffing {
  department: string;
  iconName: string;
  activeTeachers: number;
  requiredTeachers: number;
  shortageProbability: number;
  peakDays: string[];
  suggestedSubs: string[];
}

export interface TimelineEvent {
  id: string;
  timestamp: string;
  title: string;
  domain: 'ai' | 'ocr' | 'scheduling' | 'attendance' | 'staffing' | 'incidents';
  description: string;
}

export interface AIExplainabilityItem {
  title: string;
  confidenceScore: number;
  domain: 'ai' | 'staffing' | 'scheduling' | 'attendance' | 'ocr' | 'incidents';
  reasoningBullets: string[];
  recommendedAction: string;
  actionPayload?: unknown;
}
