# CampusOS Enterprise Security & RBAC Enforcement Review

## 1. Authentication Flow & Custom Claims Architecture
- **Firebase Auth & Custom Claims**:
  - `admin.auth().setCustomUserClaims(uid, { role, orgId })` is enforced server-side via `POST /api/admin/users/:uid/role`.
  - Endpoint requires a valid, verified `ADMIN` signed JWT bearer token. Client-side sessions cannot mutate custom claims.
- **Signed HMAC-SHA256 JWTs**:
  - Auth elevation on `/api/auth/elevate` signs real JWT tokens with 1-hour expiration.
  - Hardcoded fallback passwords (`admin123`) removed; requires `ADMIN_ELEVATION_PASSWORD` from environment.
- **Client-Side Role Switch Fencing**:
  - `switchWorkspaceRole` in `PermissionContext.tsx` is hard-fenced behind `ENABLE_DEMO_ROLE_SWITCH` preview flag and server elevation token verification.

---

## 2. Server-Side Firestore Security Rules (`firestore.rules`)
```rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /rooms/{roomId} {
      allow read: if request.auth != null;
      allow write: if request.auth.token.role == 'ADMIN';
    }
    match /faculty/{facultyId} {
      allow read: if request.auth != null;
      allow write: if request.auth.token.role == 'ADMIN';
    }
    match /timetableSlots/{slotId} {
      allow read: if request.auth != null;
      allow write: if request.auth.token.role == 'ADMIN';
    }
    match /students/{studentId} {
      allow read: if request.auth.token.role in ['ADMIN', 'STAFF'];
      allow write: if request.auth.token.role in ['ADMIN', 'STAFF'];
    }
    match /documents/{docId} {
      allow read: if request.auth != null;
      allow write: if request.auth.token.role in ['ADMIN', 'STAFF'];
    }
  }
}
```

---

## 3. Rate-Limiting & Lockout Behavior (`/api/auth/elevate`)
- **Failed Attempt Threshold**: Maximum 5 failed attempts allowed within a window.
- **15-Minute Lockout**: Triggers 15-minute exponential lockout (`lockoutTime = Date.now() + 15 * 60 * 1000`) on 5 consecutive failures.
- **Timing-Safe Comparison**: `crypto.timingSafeEqual` prevents timing attacks on password verification.

---

## 4. Known Gaps & Production Recommendations
1. **IP-Based Rate Limiting**: Production deployment should put Express behind Nginx or Cloudflare WAF rate-limiting.
2. **KMS Key Rotation**: Rotate `JWT_SECRET` key every 90 days via environment secrets manager.
