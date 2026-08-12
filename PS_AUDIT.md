# PS Traceability Audit

| PS Requirement | Backend Implementation | Frontend Implementation | API | Database | Test | Status |
|---|---|---|---|---|---|---|
| Role-Based Dashboards | Enforced via JWT payload / RBAC | Rendered dynamically via `AuthContext` | `/api/v1/auth/*` | `User.role` | ✅ | PASS |
| Candidate Application Portal | `POST /api/v1/candidates/resume` | `CandidatePortal` component | `/api/v1/candidates/*` | `Application`, `Resume` | ✅ | PASS |
| AI Resume Parsing & Matching | Gemini AI `lib/ai/extractor.ts` | Upload UI parsing state feedback | `/api/v1/applications/[id]/retry-analysis` | `ResumeAnalysis` | ✅ | PASS |
| Kanban Pipeline (7 Stages) | `PATCH /api/v1/applications/[id]/stage` | Drag/drop & click-to-advance UI | `/api/v1/applications/*` | `Application.stage` | ✅ | PASS |
| Coding Assessments | `monaco-editor` API logic & Proctored | `/assessments/candidate` UI | `/api/v1/assessments/*` | `Assessment`, `Attempt` | ✅ | PASS |
| Structured Scorecards | `POST /api/v1/interviews/[id]/feedback` | Interviewer Workspace UI | `/api/v1/interviews/*` | `Feedback` | ✅ | PASS |
| Admin Company Profile & Management | `PATCH /api/v1/admin/settings` | Admin Workspace Panel | `/api/v1/admin/*` | `Company`, `Settings` | ✅ | PASS |
| Analytics & Reports | `GET /api/v1/analytics/time-to-hire` | Recruiter metric cards | `/api/v1/analytics/*` | Aggregations | ✅ | PASS |
| Global Search | `GET /api/v1/search` | Search Bar `<kbd>⌘ K</kbd>` | `/api/v1/search` | Multi-table Prisma | ✅ | PASS |
| In-App Notifications | `POST /api/v1/notifications` | Notification Bell UI | `/api/v1/notifications` | `Notification` | ✅ | PASS |
| Offer Generation (PDF) | `generateOfferLetterPdf()` in `lib/pdf.ts` | Handled by API calls | `/api/v1/offers` | `OfferLetter` | ✅ | PASS |
| Secure Storage | `StorageAdapter` (S3/Local) | Download via `getSignedUrl` | `/api/v1/storage/*` | `Resume.fileUrl` | ✅ | PASS |
| Responsive Landing Page | Static Next.js routes | Glassmorphism, Dark mode | N/A | N/A | ✅ | PASS |
| Final Deliverables | Built & included | Built & included | `openapi.yaml` | `ERD.md` | ✅ | PASS |
