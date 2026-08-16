# Master Architecture & Product Engineering Standards for CampusOS

This codebase adheres to senior principal engineer standards for multi-tenant SaaS platforms.

## Core Directives

1. **Single Source of Truth**: Exactly one authoritative state owner (Firebase Custom Claims / Firestore Security Rules).
2. **Zero Trust Client**: UI state is hostile. Server-side token validation is mandatory on all mutation paths.
3. **No Security Theater**: No magic strings, local role switcher hacks, or fake auth tokens.
4. **Mandatory 6-Step Response Format**:
   - 1. Root cause / current state (with file links)
   - 2. Why it's a problem (concrete failure scenario)
   - 3. Correct architecture (source of truth & trust boundary)
   - 4. Implementation (production-ready TS code)
   - 5. Remaining open risks / gaps
   - 6. Test plan (denial & regression cases)
