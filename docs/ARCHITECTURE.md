# CampusOS — System Architecture & Engineering Documentation

CampusOS follows a **Layered, Event-Driven Platform Architecture** with service, repository, capability-based authorization, and real-time audit logging patterns.

---

## 1. System Architecture Diagram

```
React Presentation Layer (UI & Command Palette ⌘K)
        │
        ▼
Application (Use Case) Layer (src/usecases/)
        ├── GenerateTimetableUseCase
        ├── ExtractDocumentOCRUseCase
        └── ScanGateAttendanceUseCase
        │
        ▼
Domain Services & Policy Engine (src/services/ & PolicyEngine.ts)
        │
        ▼
Repository & Decoupled Event Bus Layer (src/repositories/ & EventBus.ts)
        │
        ▼
Infrastructure Layer & Express API (/api/v1/)
```

---

## 2. RBAC Capability Matrix

| Capability | Administrator (`ADMIN`) | Staff (`STAFF`) | Parent / Student (`PARENT_STUDENT`) |
| :--- | :---: | :---: | :---: |
| `INCIDENT_MANAGE` | ✅ | ❌ | ❌ |
| `OCR_WRITE` | ✅ | ✅ | ❌ |
| `TIMETABLE_SOLVE` | ✅ | View Only | View Only |
| `TIMETABLE_READ` | ✅ | ✅ | ✅ |
| `ATTENDANCE_WRITE` | ✅ | ✅ | View Only |
| `ATTENDANCE_READ` | ✅ | ✅ | View Only |
| `STAFFING_WRITE` | ✅ | ❌ | ❌ |
| `INFRASTRUCTURE_WRITE` | ✅ | ❌ | ❌ |

---

## 3. End-to-End Enterprise Workflows

### Workflow 1: Multilingual Student Admission Journey
```
Upload Form → Vision OCR → Validation → Manual Review → Student Created → Notification → Audit Logged
```

### Workflow 2: Teacher Absence & Dynamic Re-Allocation Journey
```
Teacher Absence → AI Gap Detection → Recommendation → Principal Approves → Substitute Assigned → Timetable Matrix Updated → Students Notified
```

---

## 4. API Specification & Health Endpoint

- **Health Check (`GET /api/v1/health`):** Reports Gemini API, Database, and Firebase connection status.
- **Document OCR (`POST /api/v1/extract-form`):** Multi-language paper form extraction.
- **Timetable Solver (`POST /api/v1/scheduler`):** Dynamic mathematical constraint satisfaction solver.
