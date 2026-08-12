# AI-Powered Recruitment & Applicant Tracking System (ATS)
### Comprehensive PRD + TRD — Hackathon Implementation Blueprint

---

## Document Conventions

- **P0** = Mandatory for hackathon MVP (must demo)
- **P1** = High-value enhancement (build if time permits)
- **P2** = Optional / bonus (stretch, only if P0+P1 done early)
- **[MANDATORY]** = Direct requirement from Problem Statement 2 (source of truth)
- **[MVP DECISION]** = Recommended implementation choice made by this document, not mandated by the problem statement
- **[ASSUMPTION]** = Technical assumption made to keep the build feasible in 24–48 hours

---

# PART A — PRODUCT REQUIREMENTS DOCUMENT

## A1. Executive Summary

The ATS centralizes recruitment into one platform: recruiters post jobs, candidates apply with resumes, an AI pipeline extracts structured candidate data and scores candidates against the job description, and recruiters drive candidates through a Kanban hiring pipeline to interview, feedback, and offer. AI is not a bolt-on chatbot — it is the mechanism that turns an unstructured resume + JD pair into a structured, explainable match score with strengths, gaps, and a recommendation, which is the primary judged differentiator **[MANDATORY]**.

## A2. Problem Statement

Recruiters manually re-read resumes to figure out fit, losing hours per hiring pipeline; candidates get no visibility into their application status; interview feedback is scattered and hard to compare; offer generation is manual. The problem statement **[MANDATORY]** requires a single platform covering Job Management, Candidate Management, Resume Upload & Parsing, AI Resume Analysis, Interview Scheduling, Coding Assessments, Email Notifications, Analytics Dashboard, Offer Letter Generation, and a Candidate Portal.

## A3. Product Vision

A recruiter opens one dashboard, posts a job, and within minutes of a candidate applying, sees an AI-generated match score with explainable strengths/gaps — turning resume screening from an hours-long manual task into a seconds-long AI-assisted decision, while keeping the recruiter as the final decision-maker **[MANDATORY: AI is decision-support, not automatic hiring authority]**.

## A4. Goals

1. Ship a working end-to-end pipeline: job → apply → parse → match → shortlist → interview → feedback → offer → accept, fully demoable in 3–5 minutes.
2. Make AI matching structured, explainable, and traceable to the candidate/job it was generated from.
3. Enforce RBAC across 5 roles so no data leaks across unauthorized roles.
4. Deliver a visually polished, responsive UI (dark/light mode, skeleton loaders, empty/error states).
5. Deploy the system live (Vercel + Railway/Render) with seeded demo accounts.

## A5. Non-Goals (for the hackathon MVP)

- No production-grade competitive-programming judge / sandboxed code execution cluster.
- No microservices, Kubernetes, or service mesh.
- No multi-tenant billing, no payments.
- No native mobile app (responsive web only).
- No calendar-provider integration (Google Calendar/Outlook sync) — P2.
- No fully automated hiring decisions — AI never auto-rejects or auto-hires.

## A6. Target Users

| Role | Summary |
|---|---|
| Candidate | Applies to jobs, tracks status, takes assessments, receives/accepts offers |
| Recruiter | Owns jobs, screens applicants, drives pipeline, schedules interviews, generates offers |
| Hiring Manager | Reviews shortlists + AI insights, makes hiring decisions, views analytics |
| Interviewer | Views assigned interviews, submits structured feedback |
| Admin | Manages users, companies, platform config, permissions, audit |

## A7. Personas

- **Priya, Recruiter** — manages 8 open reqs, drowning in resumes, wants an instant "who's actually worth a look" signal without losing control of the decision.
- **Amit, Candidate** — applies to many jobs, wants to know where his application stands instead of silence.
- **Dr. Rao, Hiring Manager** — trusts data over gut feel, wants side-by-side interviewer scorecards before deciding.
- **Sana, Interviewer** — interviews between other work, wants a fast structured form, not a blank text box.
- **Admin/IT** — needs visibility into who did what (audit) and the ability to lock down a compromised account fast.

## A8. User Pain Points

| Pain Point | Addressed By |
|---|---|
| Manual resume reading is slow and inconsistent | AI resume parsing + match scoring |
| Candidates get no status visibility | Candidate dashboard with real-time status |
| Interview feedback is unstructured / hard to compare | Structured scorecards (5 dimensions) |
| Offer creation is manual, error-prone | Templated offer generator with PDF export |
| No single source of truth on hiring funnel | Recruiter/HM analytics dashboard |

## A9. User Journeys

**Recruiter journey:** Login → Create Job → Publish → View incoming applications → Open AI analysis per candidate → Shortlist top matches → Schedule interviews → Review interviewer feedback → Generate offer → Track acceptance.

**Candidate journey:** Sign up → Complete profile → Upload resume (parsed automatically) → Search/filter jobs → Apply → Track status on dashboard → Receive interview invite (email + in-app) → Take assessment if required → Receive offer → Accept/reject.

**Interviewer journey:** Login → See assigned interviews on dashboard → Open candidate summary + resume + AI insights → Conduct interview → Submit structured scorecard.

**Hiring Manager journey:** Login → View shortlisted candidates with AI insight summary → Compare interviewer scorecards side by side → Approve/reject hire decision → View hiring funnel analytics.

## A10. User Stories (representative sample, P0 unless marked)

- As a **Recruiter**, I can create a job posting with title, department, skills, salary range, and deadline, so candidates can discover and apply to it.
- As a **Candidate**, I can upload a resume (PDF/DOCX, ≤10MB) and have my profile auto-populated from it, so I don't re-type my history.
- As a **Recruiter**, I can view an AI-generated match score with strengths/missing skills/recommendation for every applicant, so I can prioritize screening.
- As a **Recruiter**, I can drag a candidate card across Kanban stages (Applied → Screening → Shortlisted → Tech Interview → HR Interview → Offer → Hired / Rejected), so the pipeline state is always current.
- As a **Recruiter**, I can schedule an interview with a chosen interviewer, date/time, and meeting link, and the candidate + interviewer are notified.
- As an **Interviewer**, I can submit a structured scorecard (technical/communication/problem-solving/teamwork/leadership/overall + comments) for my assigned interview.
- As a **Hiring Manager**, I can view all interviewer scorecards for a candidate side-by-side before making a hire decision.
- As a **Recruiter**, I can generate an offer letter (auto-filled from candidate + job data) and the candidate can accept/reject it from their portal.
- As a **Candidate**, I receive email + in-app notifications at every meaningful status change.
- As an **Admin**, I can view an audit log of sensitive actions (role changes, data access, offer generation).
- *(P1)* As a **Recruiter**, I can auto-generate interview questions tailored to a specific candidate + job.
- *(P1)* As a **Candidate**, I can take an MCQ/simple-coding assessment with a countdown timer and auto-submit.
- *(P2)* As a **Candidate**, I can ask an AI FAQ chatbot about my application status.

## A11. Functional Requirements (by module)

Each feature below answers: what/who/why/how/data/API/DB/permissions/failure/acceptance, condensed into a table for density; full detail per critical feature is expanded in Part C.

| Module | Key Requirements | Priority |
|---|---|---|
| Auth | Email/password + Google OAuth, email verification, password reset, JWT + refresh tokens, RBAC | P0 |
| Job Management | CRUD + close/duplicate, search/filter, deadline enforcement | P0 |
| Candidate Profile | Structured profile, resume upload, auto-parse population | P0 |
| Resume Parsing | Extract name/email/phone/skills/education/experience/projects/certs/languages/total exp | P0 |
| AI Matching | Score + strengths + missing skills + weak areas + recommendation, structured JSON | P0 |
| Application Pipeline | Kanban stages, recruiter-only stage transitions, state machine enforced server-side | P0 |
| Interview Scheduling | Assign interviewer, date/time, meeting link (generated), notify | P0 |
| Interview Feedback | 5-dimension scorecard + comments, one per interviewer per interview | P0 |
| Offer Generation | Templated offer, PDF export, accept/reject by candidate | P0 |
| Notifications | Email (transactional) + in-app, event-driven | P0 |
| Dashboards | Role-specific (Recruiter/Candidate/HM/Interviewer/Admin) | P0 |
| RBAC | 5 roles, protected routes + API middleware | P0 |
| Audit Logging | Sensitive action log, admin-viewable | P0 |
| AI Interview Questions | Generated from JD + resume + skill gaps | P1 |
| AI Feedback Summarization | Summarize interviewer comments across scorecards | P1 |
| Assessments | MCQ + simple coding submission, timer, auto-submit | P1 |
| Advanced Analytics | Funnel conversion, time-to-hire, offer acceptance rate trends | P1 |
| AI Chatbot | Candidate FAQ | P2 |
| Calendar Integration | Google Calendar sync | P2 |

## A12. Role & Permission Matrix

| Action | Candidate | Recruiter | Hiring Manager | Interviewer | Admin |
|---|:---:|:---:|:---:|:---:|:---:|
| Create/Edit Job | ✕ | ✓ (own company) | ✕ | ✕ | ✓ |
| View own applications | ✓ | — | — | — | — |
| View all applications for a job | ✕ | ✓ (own jobs) | ✓ (own company) | ✕ | ✓ |
| View AI match analysis | ✕ | ✓ | ✓ | Partial (own interview only) | ✓ |
| Move candidate pipeline stage | ✕ | ✓ | ✕ (approve hire decision only) | ✕ | ✓ |
| Schedule interview | ✕ | ✓ | ✕ | ✕ | ✓ |
| Submit interview feedback | ✕ | ✕ | ✕ | ✓ (own assigned interview) | ✕ |
| Compare feedback / make hire decision | ✕ | View only | ✓ | ✕ | ✓ |
| Generate offer | ✕ | ✓ | ✕ | ✕ | ✓ |
| Accept/reject offer | ✓ (own) | ✕ | ✕ | ✕ | ✕ |
| Manage users/roles | ✕ | ✕ | ✕ | ✕ | ✓ |
| View audit log | ✕ | ✕ | ✕ | ✕ | ✓ |

Enforcement is **server-side only** — UI hiding of controls is a UX convenience, never a security boundary; every API route checks role + resource ownership.

## A13. Feature Prioritization

See §A11 priority column and Part D's P0/P1/P2 matrix (final consolidated version at the end of this document).

## A14. AI Product Requirements

1. **Resume Parsing** — unstructured resume text → structured JSON (name, email, phone, skills[], education[], experience[], projects[], certifications[], languages[], total_experience_years). Must degrade gracefully (partial extraction ok; never silently drop the candidate).
2. **Resume-to-Job Matching** — given structured resume + job requirements → `{match_score, strengths[], matched_skills[], missing_skills[], weak_areas[], experience_alignment, recommendation}`. Every field must be traceable to specific resume/JD content (no unexplained numbers).
3. **Interview Question Generation (P1)** — JD + required skills + candidate resume + experience level → 8–12 tailored questions, mixing technical + behavioral.
4. **Feedback Summarization (P1)** — aggregate multiple interviewer scorecards into one recruiter-facing summary.
5. AI output is always **decision-support**: recruiters/HMs make the final call; nothing auto-rejects or auto-advances a candidate **[MANDATORY]**.

## A15. Notification Requirements

Events: application confirmation, shortlisted, interview invitation, assessment link, offer issued, rejection, joining instructions, profile completion nudge, application status change. Each event fires an **email** (transactional, templated) and an **in-app notification** row, generated from one shared event payload (see Part C, Notification Events).

## A16. Analytics Requirements

Recruiter/HM dashboards need: total jobs, active candidates, today's interviews, pending reviews, offer acceptance rate, hiring funnel (stage counts), candidate conversion rate, monthly hiring trend, recent activity feed. All computable via aggregate SQL queries against the core tables — no separate analytics/OLAP store needed for hackathon scale.

## A17. UX Requirements

Dark/light mode, skeleton loaders on all async views, defined empty states (no jobs yet, no applications yet, no notifications), defined error states (network failure, AI failure, upload failure), toast notifications for actions, fully responsive layout, Kanban board for the application pipeline, a clean single-page candidate profile, and a dedicated, visually strong AI-results panel (score gauge + strengths/gaps chips) since this is the primary judged surface.

## A18. Accessibility Requirements

Semantic HTML, keyboard-navigable forms and Kanban (drag AND explicit "move to stage" fallback control for non-drag users), sufficient color contrast in both themes, alt text on all icons/avatars, ARIA labels on icon-only buttons, focus-visible states.

## A19. Security / Product Trust Requirements

- AI output is clearly labeled as AI-generated and advisory.
- Resumes and candidate PII are never publicly accessible — signed/expiring URLs only, resource-owner or authorized-role checks on every fetch **[MANDATORY: never expose resumes/candidate info publicly by default]**.
- Full RBAC + input validation + rate limiting + secure file upload validation + audit logging **[MANDATORY]**.
- No "medical-grade" security theater — this is an HR platform; standard web-app hardening is sufficient **[MANDATORY: explicitly de-scoped by problem statement]**.

## A20. MVP Scope

The full P0 list in §A11 constitutes the MVP: Auth, Job Management, Candidate Profile + Resume Upload/Parsing, AI Matching, Kanban Pipeline, Interview Scheduling + Feedback, Offer Generation, Notifications, all 5 Dashboards, RBAC, Audit Logging, Deployment, API docs.

## A21. Future Scope

Full sandboxed code-execution judge, calendar-provider sync, AI chatbot, WebSocket live-updates, collaborative recruiter notes, public careers page, resume version history, plagiarism detection, PWA, multi-language support, bulk resume import/ranking.

## A22. Success Metrics

- End-to-end demo path (job → apply → AI match → shortlist → interview → feedback → offer → accept) completes without manual DB edits.
- AI match response returns in <10s for a typical resume/JD pair, with graceful fallback UI if it fails.
- Zero cross-role data leaks in manual RBAC test pass (see Part C, Security Tests).
- Deployed, publicly reachable URL with working seed accounts for all 5 roles.

## A23. Acceptance Criteria

- A Recruiter can create a job and see it appear in candidate job search within seconds.
- A Candidate can upload a resume and see auto-populated profile fields without manual retyping.
- Every application shows a non-null AI match result (or an explicit "AI analysis failed — retry" state, never a silent blank).
- A candidate cannot view another candidate's application or resume; a recruiter cannot view another company's jobs/candidates.
- An offer generated by a recruiter is downloadable as PDF and its accept/reject state is visible on both recruiter and candidate dashboards.

---

# PART B — TECHNICAL REQUIREMENTS DOCUMENT

## B1. Technical Overview

A **modular monolith**: one Next.js app (or Next.js frontend + one Express API service if the team splits work) backed by one PostgreSQL database, one file-storage provider, and one AI-provider abstraction. No microservices, no Kubernetes, no message queue — justified by hackathon scope and the explicit "avoid premature microservices" directive **[MANDATORY]**.

## B2. Architecture

```
┌─────────────────┐        ┌──────────────────────┐        ┌───────────────┐
│  Next.js Client  │◄──────►│  Next.js API Routes /  │◄──────►│  PostgreSQL   │
│  (React + TS +   │  REST  │  Express REST API      │  SQL   │  (Railway/    │
│   Tailwind)       │  JSON  │  (modular monolith)     │        │   Render)     │
└─────────────────┘        └───────────┬──────────┘        └───────────────┘
                                        │
                     ┌──────────────────┼───────────────────┐
                     ▼                  ▼                    ▼
             ┌───────────────┐  ┌───────────────┐   ┌────────────────┐
             │ AI Provider    │  │ File Storage   │   │ Email Provider │
             │ Abstraction    │  │ (S3-compatible │   │ (Resend/       │
             │ (LLM API)      │  │  / Cloudinary) │   │  SendGrid)     │
             └───────────────┘  └───────────────┘   └────────────────┘
```

## B3. Architecture Decision Rationale

| Decision | Rationale |
|---|---|
| Modular monolith over microservices | Single team, 24–48h build, one deploy target, no cross-service network complexity |
| PostgreSQL over NoSQL | Relational data (users/jobs/applications/interviews) is inherently relational; needs joins + constraints |
| Next.js API routes (or thin Express) over separate backend framework | Fewer moving parts, single Vercel deploy for frontend+API if desired, or simple split if team prefers |
| AI provider abstraction layer | Swap providers without touching business logic; isolates prompt/schema logic in one module |
| JWT + refresh tokens | Stateless auth scales fine at hackathon scope, no session-store infra needed |
| Managed Postgres + managed file storage | Zero ops burden, fast setup, reliable for a live demo |

## B4. Technology Stack

**Frontend:** Next.js (App Router), React, TypeScript, Tailwind CSS, shadcn/ui components (optional), Zustand or React Context for client state, TanStack Query for server-state/caching.
**Backend:** Node.js + Next.js API routes (co-located) **or** a separate Express REST service — [MVP DECISION: co-locate in Next.js API routes for single-deploy simplicity, since the team is not mandated to split].
**Database:** PostgreSQL, Prisma ORM (migrations + type-safe queries).
**Auth:** NextAuth.js (Google OAuth provider) + custom email/password with bcrypt, JWT access token (15 min) + refresh token (7 days, httpOnly cookie).
**File Storage:** Cloudinary (simplest for resume PDFs + generated offer PDFs; free tier fits hackathon).
**AI:** Anthropic Claude API (or OpenAI, behind the same abstraction) for parsing/matching/question-gen; structured output enforced via JSON schema prompting + server-side validation (Zod).
**Email:** Resend (simple API, generous free tier) with React Email templates.
**Deployment:** Vercel (frontend+API), Railway or Render (Postgres) — or Railway for everything if team prefers one provider.
**Testing:** Vitest/Jest for unit, Supertest for API integration, Playwright for E2E.

## B5. Frontend Architecture

Route-grouped by role under `app/(candidate)`, `app/(recruiter)`, `app/(hiring-manager)`, `app/(interviewer)`, `app/(admin)`, each behind a role-aware layout that checks the session and redirects unauthorized users. Shared UI in `components/`, shared hooks in `hooks/`, API client in `lib/api/` (typed fetch wrappers per resource), Zod schemas shared between client validation and (via a shared `packages/schemas` or `lib/schemas`) server validation to avoid drift.

## B6. Backend Architecture

Layered per resource: `route handler → controller/service → Prisma repository`. Business logic (state machine transitions, AI orchestration, notification firing) lives in service functions, not in route handlers, so it's independently testable. Cross-cutting middleware: `withAuth` (JWT verify), `withRole([...allowed])`, `withRateLimit`, `withValidation(zodSchema)`, `withAudit(eventType)`.

## B7. API Architecture

REST, JSON, versioned under `/api/v1/...`. Standard envelope:
```json
// success
{ "success": true, "data": { ... } }
// error
{ "success": false, "error": { "code": "VALIDATION_ERROR", "message": "...", "details": [...] } }
```
Pagination via `?page=&limit=` with `{ "data": [...], "meta": { "page", "limit", "total" } }`.

## B8. Authentication Architecture

- **Email/password:** bcrypt-hashed password, email verification token (24h expiry) sent via email, login blocked until verified [MVP DECISION: allow login but show a verify-your-email banner, to avoid demo friction].
- **Google OAuth:** NextAuth Google provider; on first login, auto-create user with role `candidate` by default (role upgrade only by Admin).
- **Tokens:** short-lived JWT access token in memory/httpOnly cookie, longer-lived refresh token httpOnly+secure+sameSite=lax cookie; `/api/v1/auth/refresh` rotates both.
- **Password reset:** emailed one-time token (1h expiry), single use.

## B9. RBAC Architecture

`Role` enum: `CANDIDATE | RECRUITER | HIRING_MANAGER | INTERVIEWER | ADMIN`. Every protected API route wrapped in `withRole([...])`; resource-level ownership additionally checked in the service layer (e.g., a Recruiter can only mutate jobs where `job.recruiterId === session.userId` or same `companyId` per company-wide policy — [MVP DECISION: company-scoped, not just self-scoped, so a recruiter team can share jobs]).

## B10. Database Architecture

PostgreSQL via Prisma. Soft-delete via `deletedAt` timestamp on core entities (Jobs, Candidates, Applications) so records remain in audit history; hard-delete not used for MVP. All tables carry `createdAt`/`updatedAt`. UUID primary keys (`cuid()` via Prisma) to avoid ID-enumeration leaking record counts.

## B11. Complete ER / Data Model

**Entities and key relationships** (full field list in Part C):

```
User 1─* Application (as Candidate)
User 1─* Job (as Recruiter, via companyId)
Company 1─* Job
Company 1─* User
Job 1─* Application
User(Candidate) 1─1 CandidateProfile
CandidateProfile 1─* Resume
Resume 1─1 ResumeAnalysis (parsed structured data)
Application 1─1 MatchAnalysis (resume-vs-job AI result)
Application 1─* Interview
Interview *─1 User(Interviewer)
Interview 1─* Feedback
Application 1─* AssessmentAttempt
AssessmentAttempt *─1 Assessment
Application 1─0..1 OfferLetter
User 1─* Notification
* ActivityLog (polymorphic: actorId, entityType, entityId, action)
```

Cardinality notes: one Application always belongs to exactly one Candidate + one Job; one Interview belongs to one Application and one Interviewer, but an Application can have many Interviews (technical round, HR round); Feedback is 1:1 per (Interview, Interviewer) pair.

## B12. File Storage Architecture

Cloudinary, resource_type `raw` for PDFs/DOCX, folder-namespaced by entity: `resumes/{candidateId}/{resumeId}.{ext}`, `offers/{applicationId}/{offerId}.pdf`. Uploads go through a signed-upload flow (server generates a signed Cloudinary upload signature so the file never transits the app server for large files, but for hackathon simplicity **[MVP DECISION]** the resume upload can go server-side through the API route since files are ≤10MB — simpler auth-checked path, no direct-to-client signing complexity). Access to stored resumes/offers is always mediated by an API route that checks role+ownership before returning a signed, time-limited Cloudinary URL (never the raw public URL).

## B13. AI Architecture

Single `lib/ai/` abstraction with one interface: `parseResume(text): ParsedResume`, `matchCandidate(resume, job): MatchResult`, `generateQuestions(resume, job): Question[]`, `summarizeFeedback(feedbackList): Summary`. Internally these call the LLM provider (Anthropic Claude API) with a system prompt that mandates JSON-only output; response is parsed and validated against a Zod schema before persistence. Provider is swappable by changing one adapter module.

## B14. AI Prompt / Schema Strategy

- Prompts are versioned in `lib/ai/prompts/*.ts` with a `PROMPT_VERSION` constant stored alongside each `ResumeAnalysis`/`MatchAnalysis` record, so results are traceable to the prompt that produced them.
- Every AI call requests **strict JSON matching a documented schema** (see Part C AI schemas) — no free-form prose is persisted as structured data.
- **Explainability:** matching output must cite which resume fields drove `matched_skills`/`missing_skills`, so the UI can highlight the exact resume line/skill token behind each chip.

## B15. Resume Processing Pipeline

`Upload → MIME/size validation → text extraction (pdf-parse for PDF, mammoth for DOCX) → normalize whitespace/encoding → LLM structured extraction call → Zod validation → persist ResumeAnalysis → trigger MatchAnalysis if an active application exists`. On extraction failure, the Resume row is kept with `status: FAILED` and the candidate profile still allows manual field entry — the pipeline never blocks the candidate from applying.

## B16. Candidate Matching Pipeline

`On Application create → fetch ResumeAnalysis (structured) + Job requirements → build matching prompt with both structured payloads → LLM call → Zod-validate MatchResult → persist MatchAnalysis linked to Application → fire "AI analysis ready" notification to the owning Recruiter`. Retried up to 2 times on schema-validation failure before falling back to a `status: FAILED` state with a manual "Recruiter can retry" button.

## B17. Interview Architecture

`Interview` created by Recruiter with `applicationId, interviewerId, scheduledAt, meetingLink (generated placeholder or manual paste), type (TECHNICAL|HR|OTHER)`. State machine: `SCHEDULED → COMPLETED → (Feedback submitted) → CLOSED`. Notifications fire to both candidate and interviewer on creation and on a 24h-prior reminder job [MVP DECISION: reminder can be a simple cron-style scheduled function via Vercel Cron / Railway Cron, not a full job queue].

## B18. Assessment Architecture

MVP: MCQ-only or MCQ + one simple free-text/code-paste submission (evaluated by a human reviewer or a lightweight LLM-graded rubric, **not** a sandboxed execution judge). `Assessment` defines questions (MCQ options + correct answer, or a coding prompt with a rubric); `AssessmentAttempt` stores answers, a server-computed timer deadline, and `autoSubmittedAt` if the client-reported submit is late. Extension point: a `runner` field on coding questions reserved for a future sandboxed-execution service — not implemented in MVP.

## B19. Notification Architecture

Single `notifyEvent(eventType, payload)` service function: writes one `Notification` row (in-app) and enqueues one email via the email provider's API (synchronous call is fine at hackathon volume — no queue needed). All event types enumerated in Part C.

## B20. Audit Logging

`ActivityLog` row written by a `withAudit` middleware wrapper on every state-changing endpoint (job create/edit, application stage change, offer generate, role change, resume access). Fields: `actorId, actorRole, action, entityType, entityId, metadata(json), createdAt`. Admin-only read endpoint with filters by actor/entity/date range.

## B21. Caching Strategy

Not required for hackathon scale. If added: TanStack Query client-side caching only (no Redis) — [MVP DECISION: skip server caching entirely].

## B22. Error Handling

Standard error envelope (see B7). Error codes enumerated in Part C. Every AI call and file operation wrapped in try/catch with typed error codes (`AI_TIMEOUT`, `AI_INVALID_SCHEMA`, `UPLOAD_TOO_LARGE`, `UPLOAD_INVALID_TYPE`, `DB_CONSTRAINT_VIOLATION`) surfaced to the frontend as actionable toast messages, never raw stack traces.

## B23. Validation

Zod schemas shared client/server for every mutation endpoint (job create, application create, feedback submit, offer create, etc.). File upload validated by MIME type + magic-byte sniff (not just extension) + 10MB cap **[MANDATORY]**.

## B24. Security Architecture

JWT verification middleware on every protected route; RBAC middleware; input validation (Zod) on every mutating route; parameterized queries via Prisma (no raw SQL string concatenation); rate limiting (see B25); secure httpOnly+secure+sameSite cookies for refresh tokens; CSRF protection via sameSite cookies + custom header check on state-changing requests; XSS mitigation via React's default escaping + sanitizing any rendered HTML (offer templates) with a sanitizer; secrets only in environment variables, never committed; signed/expiring URLs for all file access **[MANDATORY throughout]**.

## B25. Rate Limiting

Simple in-memory or Postgres-backed token-bucket per IP+route for auth endpoints (login, register, password reset) — [MVP DECISION: use a lightweight middleware like `express-rate-limit`/Next.js middleware equivalent; no Redis needed at this scale]. AI endpoints rate-limited per user to prevent runaway cost.

## B26. Logging / Observability

Structured JSON server logs (`pino` or similar): `{ timestamp, level, requestId, userId, route, statusCode, durationMs }`. AI calls additionally log `{ promptVersion, tokensUsed, latencyMs, validationPassed }` for cost/quality tracking.

## B27. Testing Architecture

See Part C Testing Checklist; Vitest for unit (matching-logic helpers, validators, auth helpers), Supertest-style route tests for integration, Playwright for the golden-path E2E.

## B28. Deployment Architecture

Frontend+API on Vercel (single Next.js deploy); Postgres on Railway or Render; environment variables set per-environment in the hosting dashboard; Prisma migrations run via `prisma migrate deploy` in the build/release step.

## B29. CI/CD

GitHub Actions: on PR — lint + typecheck + unit tests; on merge to `main` — same checks + Vercel auto-deploy (Vercel's native Git integration) + `prisma migrate deploy` against the production database as a release step.

## B30. Environment Configuration

`.env` (local) / hosting-provider env vars (deployed): `DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, JWT_ACCESS_SECRET, JWT_REFRESH_SECRET, CLOUDINARY_URL, RESEND_API_KEY, ANTHROPIC_API_KEY, APP_BASE_URL`. Single environment for hackathon (production only) is acceptable — [MVP DECISION], staging is P2.

## B31. API Versioning

All routes under `/api/v1/`; breaking changes would bump to `/api/v2/` — not exercised during the hackathon but the prefix is present from day one to avoid a painful later migration.

## B32. Scalability Considerations

Out of scope for hackathon judging but documented: Postgres read replicas, background job queue (BullMQ) for AI calls at volume, CDN for static assets (Vercel handles this by default), horizontal scaling of the Next.js deployment (stateless, so trivially scalable behind Vercel's platform).

## B33. Performance Considerations

TanStack Query caching to avoid redundant fetches, Next.js image optimization for avatars, database indexes on all foreign keys + frequently filtered columns (see Part C indexes), AI calls run asynchronously with a loading state rather than blocking the application-submit request (application is created immediately with `matchStatus: PENDING`; AI result attaches moments later).

## B34. Disaster / Fallback Considerations

If the AI provider is down: applications still save, `MatchAnalysis.status = FAILED`, recruiter sees a "retry AI analysis" button, and can still manually screen/advance candidates without AI — the pipeline is never blocked by AI unavailability **[MANDATORY: AI as decision-support, not a gate]**.

## B35. Cost Considerations

LLM calls are the dominant variable cost — mitigated by: prompt-token minimization (send only structured/normalized text, not full raw resume dumps where avoidable), caching identical resume-text hashes to avoid re-parsing on duplicate upload, and per-user rate limiting on AI-triggering actions.

---

# PART C — IMPLEMENTATION SPECIFICATION

## C1. Frontend Route Map

```
/                                  → landing/marketing
/login, /register, /verify-email, /reset-password

# Candidate
/candidate/dashboard
/candidate/jobs                    (search/filter)
/candidate/jobs/[jobId]
/candidate/profile
/candidate/applications
/candidate/applications/[appId]
/candidate/assessments/[attemptId]
/candidate/offers/[offerId]

# Recruiter
/recruiter/dashboard
/recruiter/jobs
/recruiter/jobs/new, /recruiter/jobs/[jobId]/edit
/recruiter/jobs/[jobId]/pipeline    (Kanban)
/recruiter/applications/[appId]     (AI analysis panel)
/recruiter/interviews
/recruiter/interviews/new
/recruiter/offers/new

# Hiring Manager
/hm/dashboard
/hm/candidates/[appId]              (feedback comparison)

# Interviewer
/interviewer/dashboard
/interviewer/interviews/[interviewId]/feedback

# Admin
/admin/dashboard
/admin/users
/admin/companies
/admin/audit-log
```

## C2. Backend Route Map / API Endpoint Specification

```
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/refresh
POST   /api/v1/auth/logout
GET    /api/v1/auth/google/callback
POST   /api/v1/auth/verify-email
POST   /api/v1/auth/request-password-reset
POST   /api/v1/auth/reset-password

GET    /api/v1/jobs?query=&location=&skills=&page=
POST   /api/v1/jobs                         [RECRUITER, ADMIN]
GET    /api/v1/jobs/:id
PATCH  /api/v1/jobs/:id                     [RECRUITER(owner), ADMIN]
POST   /api/v1/jobs/:id/duplicate           [RECRUITER, ADMIN]
POST   /api/v1/jobs/:id/close               [RECRUITER, ADMIN]
DELETE /api/v1/jobs/:id                     [RECRUITER(owner), ADMIN]

GET    /api/v1/candidates/me/profile        [CANDIDATE]
PATCH  /api/v1/candidates/me/profile        [CANDIDATE]
POST   /api/v1/candidates/me/resume         [CANDIDATE]  (multipart upload)
GET    /api/v1/candidates/:id/resume        [owner, RECRUITER, HM, ADMIN]

POST   /api/v1/applications                 [CANDIDATE]
GET    /api/v1/applications/me              [CANDIDATE]
GET    /api/v1/applications/:id             [owner, RECRUITER, HM, ADMIN]
PATCH  /api/v1/applications/:id/stage        [RECRUITER, ADMIN]
GET    /api/v1/applications/:id/match-analysis [RECRUITER, HM, ADMIN]
POST   /api/v1/applications/:id/retry-analysis [RECRUITER, ADMIN]

POST   /api/v1/interviews                   [RECRUITER, ADMIN]
GET    /api/v1/interviews?role=interviewer  [INTERVIEWER]
GET    /api/v1/interviews/:id
POST   /api/v1/interviews/:id/feedback      [INTERVIEWER(assigned)]
GET    /api/v1/interviews/:id/feedback      [RECRUITER, HM, ADMIN]

POST   /api/v1/assessments                  [RECRUITER, ADMIN]
POST   /api/v1/assessments/:id/attempts     [CANDIDATE]
PATCH  /api/v1/assessments/attempts/:id/submit [CANDIDATE]

POST   /api/v1/offers                       [RECRUITER, ADMIN]
GET    /api/v1/offers/:id
PATCH  /api/v1/offers/:id/respond           [CANDIDATE(owner)]
GET    /api/v1/offers/:id/pdf

GET    /api/v1/notifications/me
PATCH  /api/v1/notifications/:id/read

GET    /api/v1/dashboard/recruiter          [RECRUITER]
GET    /api/v1/dashboard/candidate          [CANDIDATE]
GET    /api/v1/dashboard/hiring-manager     [HIRING_MANAGER]
GET    /api/v1/dashboard/interviewer        [INTERVIEWER]
GET    /api/v1/dashboard/admin              [ADMIN]

GET    /api/v1/admin/users
PATCH  /api/v1/admin/users/:id/role         [ADMIN]
GET    /api/v1/admin/audit-log              [ADMIN]
```

## C3. Database Table Specification (field-level)

**User**: `id (uuid pk), email (unique, not null), passwordHash (nullable — null for OAuth-only), name, role (enum), companyId (fk, nullable), avatarUrl, emailVerifiedAt (nullable), createdAt, updatedAt, deletedAt (nullable)`. Index: `email` unique, `companyId`, `role`.

**Company**: `id (pk), name, description, website, createdAt, updatedAt`.

**Job**: `id (pk), companyId (fk), recruiterId (fk→User), title, department, location, salaryMin, salaryMax, experienceRequired, skillsRequired (string[]), skillsPreferred (string[]), employmentType (enum: FULL_TIME|PART_TIME|CONTRACT|INTERN), workMode (enum: REMOTE|HYBRID|ONSITE), deadline (date), description (text), status (enum: DRAFT|OPEN|CLOSED), createdAt, updatedAt, deletedAt`. Index: `companyId`, `status`, `deadline`, full-text index on `title, description`.

**CandidateProfile**: `id (pk), userId (fk unique), phone, location, education (jsonb[]), experience (jsonb[]), skills (string[]), certifications (string[]), portfolioUrl, githubUrl, linkedinUrl, profileCompletion (int 0-100), createdAt, updatedAt`.

**Resume**: `id (pk), candidateProfileId (fk), fileUrl, fileName, fileSizeBytes, fileType (enum PDF|DOCX), status (enum: UPLOADED|PARSING|PARSED|FAILED), uploadedAt`. Index: `candidateProfileId`.

**ResumeAnalysis**: `id (pk), resumeId (fk unique), extractedName, extractedEmail, extractedPhone, skills (string[]), education (jsonb[]), experience (jsonb[]), projects (jsonb[]), certifications (string[]), languages (string[]), totalExperienceYears (float), promptVersion, rawModelResponse (jsonb), createdAt`.

**Application**: `id (pk), candidateId (fk→User), jobId (fk), stage (enum: APPLIED|SCREENING|SHORTLISTED|TECH_INTERVIEW|HR_INTERVIEW|OFFER|HIRED|REJECTED), appliedAt, updatedAt, deletedAt`. Unique constraint: `(candidateId, jobId)`. Index: `jobId, stage`, `candidateId`.

**MatchAnalysis**: `id (pk), applicationId (fk unique), matchScore (int 0-100), strengths (string[]), matchedSkills (string[]), missingSkills (string[]), weakAreas (string[]), experienceAlignment (text), recommendation (text), status (enum: PENDING|COMPLETED|FAILED), promptVersion, createdAt`.

**Interview**: `id (pk), applicationId (fk), interviewerId (fk→User), type (enum: TECHNICAL|HR|OTHER), scheduledAt, meetingLink, status (enum: SCHEDULED|COMPLETED|CANCELLED), createdAt`. Index: `applicationId`, `interviewerId`, `scheduledAt`.

**Feedback**: `id (pk), interviewId (fk), interviewerId (fk), technicalScore (1-5), communicationScore (1-5), problemSolvingScore (1-5), teamworkScore (1-5), leadershipScore (1-5), overallRating (1-5), comments (text), submittedAt`. Unique constraint: `(interviewId, interviewerId)`.

**Assessment**: `id (pk), jobId (fk, nullable), title, type (enum: MCQ|CODING), durationMinutes, questions (jsonb[]), createdBy (fk→User), createdAt`.

**AssessmentAttempt**: `id (pk), assessmentId (fk), applicationId (fk), answers (jsonb), startedAt, deadlineAt, submittedAt (nullable), autoSubmitted (bool), score (float, nullable)`.

**OfferLetter**: `id (pk), applicationId (fk unique), candidateName, role, salary, joiningDate, location, benefits (text), status (enum: DRAFT|SENT|ACCEPTED|REJECTED), pdfUrl, sentAt, respondedAt`.

**Notification**: `id (pk), userId (fk), type (enum, see C6), title, body, readAt (nullable), createdAt`. Index: `userId, readAt`.

**ActivityLog**: `id (pk), actorId (fk→User), actorRole, action (string), entityType (string), entityId (uuid), metadata (jsonb), createdAt`. Index: `actorId`, `entityType, entityId`, `createdAt`.

**Settings**: `id (pk), companyId (fk, nullable — null = platform-wide), key, value (jsonb)`. Unique: `(companyId, key)`.

## C4. Authentication Flows

**Email/password register:** `POST /auth/register {email, password, name, role: CANDIDATE}` → hash password → create User(emailVerifiedAt: null) → send verification email → `201`. **Login:** verify bcrypt → issue access(15m)+refresh(7d) tokens → refresh set as httpOnly cookie, access returned in body for client memory storage. **Google OAuth:** NextAuth handles the OAuth dance; on callback, find-or-create User by email, default role `CANDIDATE`. **Refresh:** validate refresh cookie → rotate both tokens.

## C5. AI Request/Response Schemas

**Resume Parsing request:** `{ resumeText: string, resumeId: string }`
**Resume Parsing response (validated via Zod):**
```json
{
  "name": "string|null", "email": "string|null", "phone": "string|null",
  "skills": ["string"], "education": [{"degree":"","institution":"","year":""}],
  "experience": [{"title":"","company":"","durationMonths":0,"description":""}],
  "projects": [{"name":"","description":"","technologies":["string"]}],
  "certifications": ["string"], "languages": ["string"],
  "totalExperienceYears": 0.0
}
```
**Matching request:** `{ resumeAnalysis: <above>, job: {title, description, skillsRequired, skillsPreferred, experienceRequired} }`
**Matching response:**
```json
{
  "matchScore": 87,
  "strengths": ["React", "Node.js", "PostgreSQL"],
  "matchedSkills": ["React","Node.js","PostgreSQL"],
  "missingSkills": ["AWS","Docker"],
  "weakAreas": ["Limited leadership experience"],
  "experienceAlignment": "3.5 years vs 3-5 years required — meets requirement",
  "recommendation": "Good fit for technical interview"
}
```
On schema-validation failure: retry once with a stricter "return ONLY valid JSON" reinforcement prompt; on second failure, persist `status: FAILED` and surface a retry action to the recruiter.

## C6. Notification Events (enum)

`APPLICATION_SUBMITTED, APPLICATION_SHORTLISTED, APPLICATION_REJECTED, AI_ANALYSIS_READY, INTERVIEW_SCHEDULED, INTERVIEW_REMINDER, ASSESSMENT_ASSIGNED, ASSESSMENT_DEADLINE_REMINDER, OFFER_ISSUED, OFFER_ACCEPTED, OFFER_REJECTED, PROFILE_INCOMPLETE_NUDGE, STAGE_CHANGED`

## C7. Audit Events

`JOB_CREATED, JOB_EDITED, JOB_CLOSED, JOB_DELETED, APPLICATION_STAGE_CHANGED, RESUME_ACCESSED, OFFER_GENERATED, OFFER_STATUS_CHANGED, USER_ROLE_CHANGED, USER_DEACTIVATED, LOGIN_FAILED`

## C8. State Machines

**Application:** `APPLIED → SCREENING → SHORTLISTED → TECH_INTERVIEW → HR_INTERVIEW → OFFER → HIRED`, with `REJECTED` reachable from any non-terminal state. Transitions only via Recruiter/Admin API, validated server-side against an allowed-transitions map (no skipping stages arbitrarily, except direct-to-REJECTED which is always allowed).

**Interview:** `SCHEDULED → COMPLETED → CANCELLED` (CANCELLED only from SCHEDULED).

**Offer:** `DRAFT → SENT → ACCEPTED | REJECTED` (terminal once responded).

## C9. Error Codes

`VALIDATION_ERROR (400), UNAUTHENTICATED (401), UNAUTHORIZED (403), NOT_FOUND (404), CONFLICT (409), UPLOAD_TOO_LARGE (413), UPLOAD_INVALID_TYPE (415), AI_TIMEOUT (504), AI_INVALID_SCHEMA (502), RATE_LIMITED (429), INTERNAL_ERROR (500)`

## C10. Validation Rules (highlights)

- Job: `title` required ≤150 chars, `salaryMin ≤ salaryMax`, `deadline` must be future date on create.
- Resume upload: MIME ∈ {application/pdf, application/vnd.openxmlformats-officedocument.wordprocessingml.document}, size ≤10MB, magic-byte check, duplicate detection via file hash per candidate (warn, don't block).
- Feedback: all five scores integers 1–5, `comments` optional but recommended (soft warning in UI).
- Offer: `salary > 0`, `joiningDate` future date.

## C11. File Upload Rules

10MB max, PDF/DOCX only, stored under candidate-namespaced Cloudinary folder, access only via signed short-lived URL generated per-request after an ownership/role check.

---

# PART D — PROJECT EXECUTION

## D1. 24-Hour Implementation Plan

| Hours | Focus |
|---|---|
| 0–2 | Repo scaffold, Prisma schema, DB migration, seed script, auth (email/password) |
| 2–5 | Job CRUD + candidate job search/filter UI |
| 5–8 | Candidate profile + resume upload + text extraction |
| 8–12 | AI parsing + AI matching pipeline end-to-end (this is the critical path) |
| 12–15 | Application creation + Kanban pipeline UI + stage transitions |
| 15–18 | Interview scheduling + feedback scorecards |
| 18–20 | Offer generation (PDF) + accept/reject flow |
| 20–22 | Notifications (email+in-app) + dashboards (recruiter, candidate at minimum) |
| 22–24 | Deploy, seed demo accounts, smoke-test golden path, fix breakages |

## D2. 48-Hour Implementation Plan

Hours 0–24 as above, reaching a working P0 golden path. Then:

| Hours | Focus |
|---|---|
| 24–28 | Remaining dashboards (HM, Interviewer, Admin) + audit log UI |
| 28–32 | AI interview question generation (P1) |
| 32–36 | AI feedback summarization (P1) + assessment module MCQ flow (P1) |
| 36–40 | UI polish: dark/light mode, skeletons, empty/error states, toasts |
| 40–43 | Security pass: RBAC test sweep, rate limiting, input validation audit |
| 43–46 | E2E tests (Playwright golden path), fix regressions |
| 46–48 | Final deploy, README, demo video, presentation deck, rehearsal |

## D3. Dependency Order

Auth → Company/User seed → Job CRUD → Candidate Profile → Resume Upload → Resume Parsing (AI) → Application Create → Match Analysis (AI) → Kanban Pipeline → Interview Scheduling → Feedback → Offer → Notifications wired throughout → Dashboards (read-only aggregates, can build in parallel once core tables exist).

## D4. Development Milestones

M1: Auth + RBAC working. M2: Job + Application core CRUD working. M3: AI resume parsing produces structured data reliably. M4: AI matching produces a demo-quality score+explanation. M5: Full golden path clickable end-to-end (even with rough UI). M6: Polished UI + all 5 dashboards. M7: Deployed + tested + demo-ready.

## D5. Frontend/Backend Parallelization Strategy

Once Prisma schema + Zod schemas are locked (end of hour 2), frontend can build against a mocked API client (MSW or static fixtures) while backend implements real routes — merge points at each milestone. AI pipeline work can proceed independently behind the `lib/ai/` interface with a stub implementation the rest of the app can call from hour 2 onward.

## D6. Critical Path

Auth → DB schema → Resume upload/parsing → AI matching. If AI matching risks slipping, everything downstream (Kanban, interviews, offers) can still be built and demoed against seeded/mocked match data while AI work continues in parallel.

## D7. Risky Features

1. AI structured-output reliability (schema drift, hallucinated fields) — mitigate with strict Zod validation + retry + fallback UI.
2. PDF/DOCX text extraction edge cases (scanned/image-only resumes) — mitigate by scoping to text-based PDFs/DOCX and showing a clear "couldn't extract, please fill manually" state.
3. Interview meeting-link "generation" — no real video-conferencing API integration in scope; mitigate by allowing recruiter to paste any link (Zoom/Meet) manually — [MVP DECISION].
4. Assessment auto-submit timing — mitigate with server-computed deadline, not just client timer trust.

## D8. Fallback Features

If time runs short, cut in this order: Assessments (P1) → AI Interview Questions (P1) → AI Feedback Summarization (P1) → Admin dashboard polish → Interviewer/HM dashboards (keep functional, skip visual polish) — never cut Auth, Job/Application core, AI Matching, or Offer generation, since those anchor the demo storyline.

## D9. Demo Preparation Checklist

- [ ] Seed data: 1 company, 2 recruiters, 5+ candidates with varied resumes, 3+ open jobs, at least one fully-progressed application (through to offer)
- [ ] One "fresh" candidate ready to run the live apply→AI-match flow on stage
- [ ] All 5 role logins pre-created and password-noted
- [ ] AI call latency tested under demo network conditions; have a pre-generated fallback result cached just in case
- [ ] Dark/light toggle tested
- [ ] Mobile responsive check on at least one real device

## D10. Deployment Checklist

- [ ] Env vars set in Vercel + Railway/Render dashboards
- [ ] `prisma migrate deploy` run against production DB
- [ ] Seed script run against production DB
- [ ] CORS configured for the deployed frontend origin only
- [ ] HTTPS enforced end-to-end
- [ ] Error monitoring (even just console/log aggregation) confirmed working

## D11. Testing Checklist

- [ ] Unit: matching-score helper, Zod schemas, auth password hashing/verification
- [ ] Integration: auth register/login/refresh, job CRUD, application create, resume upload, AI analysis trigger, interview create, offer create
- [ ] E2E golden path (Playwright): recruiter creates job → candidate applies → AI match appears → recruiter shortlists → interview scheduled → feedback submitted → offer generated → candidate accepts
- [ ] Security: cross-role access attempts return 403 for every protected route; unauthenticated requests return 401; file upload rejects oversized/wrong-type files; SQL injection attempts on search fields fail safely (Prisma parameterization)

---

# PART E — HACKATHON DELIVERABLES

## E1. GitHub Structure

```
/app                    (Next.js App Router: routes per §C1)
/app/api/v1              (API routes per §C2)
/components
/lib
  /ai                    (provider abstraction, prompts, schemas)
  /schemas               (shared Zod schemas)
  /api                   (typed client fetchers)
  /email                 (React Email templates + send helpers)
/prisma
  schema.prisma
  /migrations
  seed.ts
/tests
  /unit /integration /e2e
.env.example
README.md
```

## E2. README Structure

Project overview + problem statement link → demo link + video → screenshots (AI match panel front and center) → tech stack → local setup steps → seed/test credentials table → architecture diagram → known limitations → team.

## E3. Architecture Diagram Contents

Client (Next.js) ↔ API layer ↔ Postgres, with AI provider / File storage / Email provider as peripheral services — matches §B2 diagram; include role-based route grouping as an annotation.

## E4. ER Diagram Contents

All entities from §B11/§C3 with PK/FK relationships and cardinalities as listed.

## E5. API Documentation

Generate from the route map in §C2 (e.g., a simple Postman collection or OpenAPI/Swagger doc auto-generated from Zod schemas via `zod-to-openapi` — P1 nice-to-have; a well-organized markdown table is sufficient for P0 judging).

## E6. Test Credentials (seed accounts)

```
admin@demo.ats / Demo@1234        (ADMIN)
recruiter@demo.ats / Demo@1234    (RECRUITER)
hm@demo.ats / Demo@1234           (HIRING_MANAGER)
interviewer@demo.ats / Demo@1234  (INTERVIEWER)
candidate@demo.ats / Demo@1234    (CANDIDATE)
```

## E7. .env.example

```
DATABASE_URL=
NEXTAUTH_SECRET=
NEXTAUTH_URL=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
CLOUDINARY_URL=
RESEND_API_KEY=
ANTHROPIC_API_KEY=
APP_BASE_URL=
```

## E8. Demo Video Flow (3–5 min)

0:00 recruiter login + create job → 0:45 candidate applies with resume → 1:15 AI parsing + match score reveal (hero moment — linger here) → 2:00 recruiter shortlists + views strengths/gaps → 2:30 schedule interview → 2:50 interviewer submits feedback → 3:15 hiring manager compares scorecards → 3:35 recruiter generates offer → 3:55 candidate accepts offer → 4:15 quick dashboard/analytics sweep → 4:40 architecture slide + close.

## E9. Presentation / Demo Talking Points

- Lead with the pain: recruiters manually reading hundreds of resumes.
- Show, don't tell: let the AI match score + explainable gaps speak for themselves.
- Emphasize "AI augments, never replaces" — the recruiter/HM keeps the decision.
- Call out the modular monolith / AI-abstraction-layer choice as intentional simplicity, not a limitation.
- Close on the full funnel: job → apply → AI → interview → offer, all in one platform, all role-secured.

---

# FINAL SUMMARY

## 1. Final Recommended Tech Stack

Next.js + TypeScript + Tailwind (frontend + API routes) · PostgreSQL + Prisma · NextAuth (Google OAuth) + JWT/bcrypt (email-password) · Cloudinary (files) · Anthropic Claude API behind a provider-abstraction layer · Resend (email) · Vercel (app) + Railway/Render (DB).

## 2. Final Architecture Summary

Modular monolith, one relational database, one file-storage provider, one AI abstraction layer, REST JSON API under `/api/v1`, RBAC enforced server-side on every route, event-driven notifications, no queues/microservices/Kubernetes.

## 3. Final Database Entity List

User, Company, Job, CandidateProfile, Resume, ResumeAnalysis, Application, MatchAnalysis, Interview, Feedback, Assessment, AssessmentAttempt, OfferLetter, Notification, ActivityLog, Settings.

## 4. Final API Module List

Auth · Jobs · Candidates/Profile · Applications · Interviews · Assessments · Offers · Notifications · Dashboards · Admin.

## 5. Final P0/P1/P2 Feature Matrix

| Priority | Features |
|---|---|
| **P0** | Auth+RBAC, Job Mgmt, Candidate Profile+Resume Upload, AI Resume Parsing, AI Matching, Kanban Application Pipeline, Interview Scheduling+Feedback, Offer Generation, Notifications, 5 Dashboards, Audit Logging, Deployment |
| **P1** | AI Interview Question Gen, AI Feedback Summarization, MCQ/simple coding Assessments, advanced analytics, candidate ranking, bulk resume import |
| **P2** | AI FAQ chatbot, calendar integration, WebSockets, collaborative notes, public careers page, resume version history, plagiarism detection, PWA, multi-language |

## 6. Final 24–48 Hour Execution Plan

See Part D1/D2 in full; critical path is Auth → Schema → Resume Upload/Parsing → AI Matching → Kanban/Interviews/Offers, with polish and P1 features layered in hours 24–48.

## 7. Top Technical Risks

1. AI structured-output reliability under time pressure.
2. Resume text-extraction edge cases (scanned PDFs).
3. Underestimating RBAC test surface across 5 roles.
4. Demo-day AI latency/availability.

## 8. Recommended Shortcuts / Tradeoffs

Skip real video-conferencing integration (manual link paste); skip sandboxed code execution (MCQ + simple submission only); skip staging environment (production-only for hackathon); skip Redis/queue infra (synchronous email + in-memory rate limiting suffice at this scale); skip direct-to-client signed uploads (server-mediated upload is simpler and fine at ≤10MB).

## 9. Final Demo Storyline

Recruiter logs in → creates a job → candidate applies with resume → AI automatically parses resume → AI generates match score → recruiter sees strengths/missing skills → recruiter shortlists candidate → interview is scheduled → interviewer submits feedback → hiring manager compares scorecards → recruiter generates offer → candidate accepts offer.
