# AI-Powered Recruitment & Applicant Tracking System (ATS)
### Comprehensive PRD + TRD — Hackathon Implementation Blueprint

---

## Document Conventions

- **P0** = Mandatory for hackathon MVP and required to preserve PS-2 compliance.
- **P1** = High-value implementation enhancement only when the PS-2 item itself is already covered.
- **P2** = Optional / bonus feature explicitly identified as bonus by PS-2.
- **[PS-MANDATORY]** = Direct requirement from Problem Statement 2; cannot be removed, downgraded, or contradicted.
- **[PS-OPTIONAL]** = Requirement explicitly described as optional inside PS-2.
- **[PS-BONUS]** = Feature explicitly listed under PS-2 Bonus Features.
- **[IMPLEMENTATION DECISION]** = Technical/product implementation choice made by this document.
- **[IMPLEMENTATION SHORTCUT]** = Hackathon-feasible implementation that preserves the PS-2 requirement without claiming a broader integration than is actually implemented.
- **[ASSUMPTION]** = Technical assumption where PS-2 is silent.

### Strict Source-of-Truth Rule

Problem Statement 2 is the authoritative product requirement. This PRD/TRD may simplify **how** a mandatory requirement is implemented for a 24–48 hour hackathon, but it must not simplify, remove, downgrade, or reinterpret **what** PS-2 requires. Every mandatory PS-2 requirement must be traceable to a PRD requirement, technical component, API/data model where applicable, UI surface where applicable, and acceptance criterion.

A production-grade implementation may be out of scope; a mandatory product capability is not. For example, coding assessments remain mandatory even when arbitrary-code execution is implemented through a bounded hackathon-safe mechanism rather than a production-scale sandbox.

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

- No production-grade competitive-programming infrastructure, multi-region execution fleet, or Kubernetes-based sandbox platform.
- No microservices, service mesh, or other distributed architecture unless later justified by measured need.
- No multi-tenant billing or payments.
- No native mobile application; the product is a responsive web application.
- No Google/Microsoft calendar-provider synchronization in the base build; provider synchronization remains **[PS-BONUS]**.
- No fully automated hiring decisions; AI is advisory and must never auto-reject, auto-hire, or auto-advance a candidate without human action.

### A5.1 PS-Mandatory Capability Preservation

The following are mandatory even if their implementation is intentionally lightweight for the hackathon: coding assessments, global search, required analytics, company profile, admin controls, device session management, required landing-page sections, candidate assessment flow, notification events, and the full PS-2 role permissions.

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

## A10. User Stories (PS-Strict Baseline)

### Authentication / Sessions
- As a new user, I can register with email and password or Google so I can enter the platform.
- As a new user, I must verify my email before accessing recruiter-sensitive functionality.
- As a user, I can reset my password using the supported reset mechanism.
- As a user, I can view active device sessions and revoke an individual session or all other sessions.

### Recruiter
- As a Recruiter, I can create, edit, close, duplicate, and delete jobs.
- As a Recruiter, I can view applications and shortlist candidates.
- As a Recruiter, I can schedule interviews, send emails, and generate offer letters.
- As a Recruiter, I cannot change company settings.

### Candidate
- As a Candidate, I can create my profile, upload a resume, apply for jobs, and track applications.
- As a Candidate, I can schedule interviews through the supported interview workflow, take coding assessments, and receive/accept/reject offers.
- As a Candidate, I can see resume score and AI suggestions in my dashboard.

### Hiring Manager
- As a Hiring Manager, I can review shortlisted candidates, approve hiring decisions, provide feedback, and view analytics.

### Interviewer
- As an Interviewer, I can view assigned interviews, submit interview feedback, and score candidates.
- As an Interviewer, I cannot view salary information.

### Admin
- As an Admin, I can manage users, roles, companies, jobs, assessments, analytics, platform settings, permissions, audit logs, reports, and recruiter administration.

### Core Recruitment Workflow
- As a Recruiter, I can create a job with the PS-2 job fields so candidates can discover and apply.
- As a Candidate, I can upload a PDF/DOCX resume up to 10 MB and have my profile auto-populated.
- As a Recruiter, I can view an AI-generated match percentage, missing skills, strengths, weak areas, and recommendations for an applicant.
- As a Recruiter, I can drag candidates through Applied → Resume Screening → Shortlisted → Technical Interview → HR Interview → Offer → Hired / Rejected.
- As a Recruiter, I can schedule an interview with interviewer, date/time, and a meeting link, and the system provides email, dashboard notification, and calendar reminder behavior.
- As an Interviewer, I can submit the PS-2 scorecard: technical skills, communication, problem solving, teamwork, leadership, overall rating, and comments.
- As a Hiring Manager, I can compare interviewer feedback before making the hiring decision.
- As a Recruiter, I can generate an offer letter using the required fields, and the Candidate can download and accept/reject it.

### Mandatory Coding Assessment
- As a Recruiter, I can create assessments containing MCQs, coding problems, SQL queries, and debugging tasks.
- As a Candidate, I can start an assessment with a countdown timer, work in the supported code editor where applicable, submit answers, and be auto-submitted at the server-side deadline.
- As the system, I record tab-switch events and expose assessment analytics to authorized users.

### Search / Analytics / Notifications
- As a user with access, I can globally search candidates, jobs, companies, recruiters, and interviews.
- As a Recruiter/Hiring Manager, I can see applications per job, hiring funnel, time-to-hire, offer acceptance rate, candidate source analysis, recruiter performance, and interview success rate; diversity metrics are optional as specified by PS-2.
- As a user, I receive the required email/in-app notification events for application confirmation, shortlisting, interview invitation, assessment link, offer letter, rejection, joining instructions, and the required real-time notification categories.

### PS Bonus User Stories
- **[PS-BONUS]** AI candidate FAQ chatbot.
- **[PS-BONUS]** AI-generated interview questions based on job descriptions.
- **[PS-BONUS]** AI cover-letter generation.
- **[PS-BONUS]** AI interview feedback summarization.
- Additional bonus stories map 1:1 to the Bonus Features section in Part E.

## A11. Functional Requirements (PS-Strict)

Each feature below answers: what/who/why/how/data/API/DB/permissions/failure/acceptance. Every PS-mandatory capability is P0 because P0 denotes product compliance, not merely what is easiest to build first.

| Module | PS-Strict Key Requirements | Priority | Source Class |
|---|---|---|---|
| Landing Page | Hero, product features, testimonials, pricing, FAQ, contact, footer, responsive navigation, dark mode, SEO | P0 | [PS-MANDATORY] |
| Auth | Google OAuth, email/password, email verification, password reset/OTP, JWT refresh, secure cookies, device session management | P0 | [PS-MANDATORY] |
| 2FA | OTP-based 2FA for Recruiters/Admins | P2 | [PS-BONUS] |
| Role Management | Candidate, Recruiter, Hiring Manager, Interviewer, Admin permissions | P0 | [PS-MANDATORY] |
| Job Management | Create, edit, close, duplicate, delete; all required job fields | P0 | [PS-MANDATORY] |
| Candidate Management | Full PS profile including cover letter, links, resume | P0 | [PS-MANDATORY] |
| Resume Upload | PDF/DOCX, ≤10 MB, file validation, duplicate upload detection | P0 | [PS-MANDATORY] |
| Virus Check | Resume malware scanning | P2 | [PS-BONUS] |
| AI Resume Parsing | Extract name/email/phone/skills/education/experience/projects/certifications/languages/total experience | P0 | [PS-MANDATORY] |
| AI Resume Matching | Match percentage, missing skills, strengths, weak areas, recommendations | P0 | [PS-MANDATORY] |
| Job Search | Location, salary, skills, company, experience, remote, hybrid, full time, internship | P0 | [PS-MANDATORY] |
| Application Pipeline | Applied → Resume Screening → Shortlisted → Technical Interview → HR Interview → Offer → Hired/Rejected + drag/drop | P0 | [PS-MANDATORY] |
| Interview Scheduling | Interviewer, date/time, meeting link, invitations, dashboard notification, calendar reminder | P0 | [PS-MANDATORY] |
| Coding Assessments | MCQ, coding, SQL, debugging, timer, auto-submit, tab-switch detection, code editor, analytics | P0 | [PS-MANDATORY] |
| Assessment Execution | Bounded hackathon-safe execution/evaluation path; production-grade sandbox remains out of scope | P0 | [IMPLEMENTATION SHORTCUT] |
| Plagiarism Detection | Assessment plagiarism detection | P2 | [PS-BONUS] |
| Interview Feedback | Technical, communication, problem solving, teamwork, leadership, overall, comments | P0 | [PS-MANDATORY] |
| Offer Generation | Template, candidate/role/salary/joining date/location/benefits, PDF, accept/reject | P0 | [PS-MANDATORY] |
| Email System | Application confirmation, shortlisting, interview invitation, assessment link, offer, rejection, joining instructions | P0 | [PS-MANDATORY] |
| Real-Time Notifications | New applications, interview updates, assessment results, offer status, profile completion | P0 | [PS-MANDATORY] |
| Global Search | Candidates, jobs, companies, recruiters, interviews | P0 | [PS-MANDATORY] |
| Recruiter/HM Analytics | Applications/job, hiring funnel, time-to-hire, offer acceptance, candidate source, recruiter performance, interview success | P0 | [PS-MANDATORY] |
| Diversity Metrics | Diversity analytics | P1 | [PS-OPTIONAL] |
| Company Profile | Logo, name, website, industry, company size, description, social links, office locations | P0 | [PS-MANDATORY] |
| Admin Panel | Users, roles, companies, jobs, assessments, analytics, platform settings, audit logs, recruiters, permissions, reports | P0 | [PS-MANDATORY] |
| Role Dashboards | Recruiter, Candidate, Hiring Manager, Interviewer, Admin dashboards | P0 | [PS-MANDATORY] |
| API Documentation | Swagger/OpenAPI and/or Postman export | P0 | [PS-MANDATORY] |
| CI/CD | CI/CD configuration | P2 | [PS-BONUS] |
| Docker | Docker setup | P2 | [PS-BONUS] |

## A12. Role & Permission Matrix

| Action | Candidate | Recruiter | Hiring Manager | Interviewer | Admin |
|---|:---:|:---:|:---:|:---:|:---:|
| Create Profile | ✓ | — | — | — | ✓ |
| Upload Resume | ✓ | — | — | — | ✓ |
| Apply for Jobs | ✓ | — | — | — | ✓ |
| Track Own Applications | ✓ | — | — | — | ✓ |
| Schedule Interview | ✓ | ✓ | — | — | ✓ |
| Take Coding Tests | ✓ | — | — | — | ✓ |
| Receive / Accept / Reject Offer | ✓ | — | — | — | ✓ |
| Post / Create Jobs | ✕ | ✓ | ✕ | ✕ | ✓ |
| View Job Applications | ✕ | ✓ | ✓ | ✕ | ✓ |
| Shortlist Candidates | ✕ | ✓ | ✕ | ✕ | ✓ |
| Send Emails | ✕ | ✓ | ✕ | ✕ | ✓ |
| Generate Offer Letters | ✕ | ✓ | ✕ | ✕ | ✓ |
| Change Company Settings | ✕ | ✕ | ✕ | ✕ | ✓ |
| Review Shortlisted Candidates | ✕ | View | ✓ | ✕ | ✓ |
| Approve Hiring Decisions | ✕ | ✕ | ✓ | ✕ | ✓ |
| Give Hiring Feedback | ✕ | ✕ | ✓ | ✕ | ✓ |
| View Analytics | Own/allowed | ✓ | ✓ | Limited | ✓ |
| View Assigned Interviews | ✕ | View relevant | ✕ | ✓ | ✓ |
| Submit Interview Feedback | ✕ | ✕ | Optional/admin workflow | ✓ | ✓ |
| Score Candidates | ✕ | ✕ | ✓ | ✓ | ✓ |
| View Salary Information | Own offer only | ✓ | ✓ | **✕** | ✓ |
| Create/Manage Assessments | ✕ | ✓ | ✕ | ✕ | ✓ |
| Manage Users/Roles | ✕ | ✕ | ✕ | ✕ | ✓ |
| Manage Companies | ✕ | ✕ | ✕ | ✕ | ✓ |
| Manage Recruiters | ✕ | ✕ | ✕ | ✕ | ✓ |
| Manage Permissions | ✕ | ✕ | ✕ | ✕ | ✓ |
| Manage Platform Settings | ✕ | ✕ | ✕ | ✕ | ✓ |
| View Audit Logs | ✕ | ✕ | ✕ | ✕ | ✓ |
| View Reports | ✕ | Allowed reports | Allowed reports | Limited | ✓ |

Enforcement is **server-side only**. UI hiding is never a security boundary. Every protected API route checks authentication, role, resource ownership/company scope, and any PS-specific restriction such as the Interviewer salary prohibition.

### A12.1 Device Session Management

Users can view active sessions, revoke one session, and revoke all other sessions. Recruiter/Admin 2FA remains **[PS-BONUS]**.

## A13. Feature Prioritization

### P0 — PS-Mandatory Product Baseline

Authentication, session management, all five roles, landing page, job management, candidate management, resume upload/parsing, AI resume analysis, job search filters, application workflow/Kanban, interview scheduling, coding assessments, email notifications, in-app/real-time notifications, required analytics, company profile, admin panel, offer generation, candidate portal, dashboards, security controls, audit logging, API documentation, live deployment, README, ER/database schema, test credentials, `.env.example`, demo video, and Postman/API export.

### P1 — PS-Optional Enhancement

Diversity metrics (explicitly optional in the PS) and implementation-level quality enhancements that improve the P0 features without introducing new product requirements.

### P2 — PS-Bonus Features

AI candidate FAQ chatbot, AI-generated interview questions, AI-powered cover-letter generation, AI interview feedback summarization, live collaborative interview notes, resume version history, candidate referral system, bulk resume import, public careers page, Google/Microsoft calendar integration, WebSocket live application updates, PWA support, multi-language support, Dockerized deployment, and CI/CD pipeline.

**API documentation note:** PS-2 mentions API documentation/OpenAPI in the Bonus Features list, but it also includes API documentation in Expected Deliverables. Because Expected Deliverables are submission requirements, this PRD treats API documentation/Postman export as **P0 for submission**. This resolves the internal wording overlap without removing either source statement.

**Important:** A mandatory PS feature cannot be moved to P1/P2 simply because its implementation is difficult. Only the implementation mechanism can be simplified.

## A14. AI Product Requirements

1. **Resume Parsing** — unstructured resume text → structured JSON (name, email, phone, skills[], education[], experience[], projects[], certifications[], languages[], total_experience_years). Must degrade gracefully (partial extraction ok; never silently drop the candidate).
2. **Resume-to-Job Matching** — given structured resume + job requirements → `{match_score, strengths[], matched_skills[], missing_skills[], weak_areas[], experience_alignment, recommendation}`. Every field must be traceable to specific resume/JD content (no unexplained numbers).
3. **Interview Question Generation [PS-BONUS]** — JD + required skills + candidate resume + experience level → 8–12 tailored questions, mixing technical + behavioral.
4. **Feedback Summarization [PS-BONUS]** — aggregate multiple interviewer scorecards into one recruiter-facing summary.
5. AI output is always **decision-support**: recruiters/HMs make the final call; nothing auto-rejects or auto-advances a candidate **[MANDATORY]**.

## A15. Notification Requirements

Events: application confirmation, shortlisted, interview invitation, assessment link, offer issued, rejection, joining instructions, profile completion nudge, application status change. Each event fires an **email** (transactional, templated) and an **in-app notification** row, generated from one shared event payload (see Part C, Notification Events).

## A16. Analytics Requirements

### Recruiter/Hiring Manager required analytics

The platform must expose the PS-2 metrics:
- Applications per Job
- Hiring Funnel
- Time-to-Hire
- Offer Acceptance Rate
- Candidate Source Analysis
- Recruiter Performance
- Interview Success Rate

**[PS-OPTIONAL]** Diversity Metrics.

Additional widgets from the PS-2 dashboards remain supported: total jobs, active candidates, today's interviews, pending reviews, candidate conversion rate, monthly hiring chart, and recent activity.

Required definitions:
- **Time-to-Hire:** hire timestamp minus application timestamp.
- **Candidate Source:** stored on Application and used for source aggregation.
- **Interview Success Rate:** successful/completed interview outcomes divided by completed interviews, with the exact outcome rule documented in the analytics implementation.
- **Recruiter Performance:** recruiter-level workload and funnel outcomes such as applications handled, shortlist count, interviews progressed, offers issued, and time-to-hire.

All are computed from the transactional PostgreSQL data for hackathon scale.

## A16.1 Global Search Requirements

A global authenticated search interface must search across:
- Candidates
- Jobs
- Companies
- Recruiters
- Interviews

Search results must be filtered by user role and company/resource authorization.

## A16.2 Company Profile Requirements

Company profile must support the PS-2 fields:
- Logo
- Name
- Website
- Industry
- Company Size
- Description
- Social Links
- Office Locations

## A16.3 Dashboard Requirements

### Recruiter Dashboard
Total Jobs, Active Candidates, Today's Interviews, Pending Reviews, Offer Acceptance Rate, Hiring Funnel, Candidate Conversion Rate, Monthly Hiring Chart, Recent Activity.

### Candidate Dashboard
Profile Completion, Applied Jobs, Interview Schedule, Coding Assessments, Offer Letters, Notifications, Resume Score, AI Suggestions.

### Hiring Manager Dashboard
Shortlisted Candidates, Hiring Decision/Feedback views, Analytics, interview-feedback comparison.

### Interviewer Dashboard
Assigned Interviews, Upcoming/Completed Interviews, feedback tasks, score access without salary visibility.

### Admin Dashboard
Users, Companies, Jobs, Assessments, Recruiters, Analytics, Permissions, Platform Settings, Audit Logs, Reports.

## A17. UX Requirements

The application must include the PS-2 UI/UX baseline:
- Responsive layout
- Dark and light mode
- Modern dashboards
- Kanban board for applications
- Skeleton loaders
- Empty states
- Toast notifications
- Smooth animations
- Keyboard accessibility
- Mobile-friendly design

Additional quality requirements: defined error states, loading states, actionable AI failure states, accessible form controls, and a visually strong AI-results panel.

### Landing Page
Hero, Product Features, Customer Testimonials, Pricing, FAQ, Contact, Footer, responsive navigation, dark mode, SEO optimization.

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

- End-to-end demo path (job → apply → parse → AI match → shortlist → assessment/interview → feedback → offer → accept) completes without manual DB edits.
- Every mandatory PS-2 module is reachable in the deployed application.
- AI match response returns in <10s for a typical resume/JD pair, with graceful fallback UI if it fails.
- Zero cross-role data leaks in RBAC tests, including the Interviewer salary restriction and candidate privacy.
- Global search returns only authorized candidates/jobs/companies/recruiters/interviews.
- Assessment timing and auto-submit are enforced server-side.
- Required analytics are visible and computed from application/interview/offer data.
- Deployed, publicly reachable URL with working seed accounts for all five roles.

## A23. Acceptance Criteria

### Core Product
- A Recruiter can create, edit, close, duplicate, and delete a job and see it appear in candidate job search.
- A Candidate can upload a PDF/DOCX resume ≤10MB, duplicate uploads are detected, and extracted fields auto-populate the profile.
- Every application has an AI match result or an explicit retry/failure state.
- Candidate job search supports all required PS filters.
- Candidate and recruiter application states follow the PS-2 workflow and are enforced server-side.
- Candidate and Recruiter interview workflows expose the required scheduling/invitation/reminder behavior.
- Candidate can complete the mandatory assessment flow: MCQ/coding/SQL/debugging, timer, auto-submit, tab-switch logging, code editor where applicable, and result analytics.
- Interviewers can submit the full PS scorecard and cannot view salary information.
- Offers are generated as PDFs and candidates can accept/reject them.

### Search / Analytics / Admin
- Global search covers candidates, jobs, companies, recruiters, and interviews with authorization filtering.
- Company profiles expose all required fields.
- Admin can manage the PS-required resources and view audit logs/reports.
- Analytics include applications per job, hiring funnel, time-to-hire, offer acceptance, candidate source analysis, recruiter performance, and interview success rate; diversity metrics remain optional.

### Auth / Security
- Email/Google authentication works.
- Email verification and password reset work.
- Refresh tokens and device sessions work; a session can be individually revoked or globally revoked.
- Protected APIs enforce RBAC/resource authorization server-side.

### Deliverables
- GitHub repository, live deployment, README, API documentation, ER/database schema, recruiter/candidate credentials, `.env.example`, demo video, and Postman/API export are present.

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
**Testing:** Vitest/Jest for unit, Supertest for API integration, Playwright for E2E. **Assessment UI:** Monaco Editor or equivalent code editor for coding questions. **Search:** PostgreSQL indexed search for hackathon scale. **Session management:** PostgreSQL-backed user session records.

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

- **Email/password:** bcrypt-hashed password, email verification token (24h expiry), password reset token (1h expiry).
- **Google OAuth:** NextAuth Google provider; first-time OAuth users default to Candidate; elevated roles are assigned only by Admin or seed data.
- **Session security:** short-lived access JWT + rotated refresh token in secure httpOnly cookie.
- **Device Session Management [PS-MANDATORY]:** each authenticated login creates a server-side `UserSession` record storing a refresh-token hash, device/user-agent metadata, timestamps, expiry, and revocation status. Users can list sessions, revoke one session, or revoke all other sessions.
- **Email verification:** recruiter-sensitive functionality remains restricted until verification is complete, matching PS-2.
- **2FA [PS-BONUS]:** optional OTP-based 2FA for Recruiter/Admin accounts.

## B9. RBAC Architecture

`Role` enum: `CANDIDATE | RECRUITER | HIRING_MANAGER | INTERVIEWER | ADMIN`. Every protected API route uses role middleware plus resource/company authorization.

PS-specific rules:
- Recruiter cannot change company settings.
- Interviewer cannot view salary information.
- Candidate cannot access recruiter data.
- Admin has full platform control.
- Candidate retains the PS-defined ability to schedule interviews and take coding tests.

The UI may hide controls, but server-side checks are authoritative.

## B10. Database Architecture

PostgreSQL via Prisma. Soft-delete via `deletedAt` timestamp on core entities (Jobs, Candidates, Applications) so records remain in audit history. All tables carry `createdAt`/`updatedAt`. The schema explicitly maps PS-2 conceptual entities even when implementation uses relational consolidation (for example Roles as a User role enum and Interviewers as Users with the INTERVIEWER role).

## B11. Complete ER / Data Model

**Entities and key relationships:**

```
User 1─* UserSession
User 1─1 CandidateProfile (when role=CANDIDATE)
User 1─* Job (as Recruiter)
Company 1─* User
Company 1─* Job
Company 1─* Settings
Job 1─* Application
CandidateProfile 1─* Resume
Resume 1─1 ResumeAnalysis
Application 1─1 MatchAnalysis
Application 1─* Interview
Interview *─1 User (Interviewer role)
Interview 1─* Feedback
Job 1─* Assessment
Assessment 1─* AssessmentQuestion
AssessmentQuestion 1─* AssessmentOption (MCQ)
Assessment 1─* AssessmentAttempt
AssessmentAttempt 1─* AssessmentAnswer
Application 1─* AssessmentAttempt
Application 1─0..1 OfferLetter
User 1─* Notification
User 1─* ActivityLog
```

### PS Entity Mapping

| PS-2 Concept | Technical Representation |
|---|---|
| Users | `User` |
| Roles | `User.role` enum plus authorization matrix |
| Companies | `Company` |
| Jobs | `Job` |
| Candidates | `User` + `CandidateProfile` |
| Applications | `Application` |
| Resumes | `Resume` |
| Resume Analyses | `ResumeAnalysis` |
| Interviews | `Interview` |
| Interviewers | `User(role=INTERVIEWER)` |
| Feedback | `Feedback` |
| Coding Assessments | `Assessment` + question types |
| Assessment Attempts | `AssessmentAttempt` |
| Offer Letters | `OfferLetter` |
| Notifications | `Notification` |
| Activity Logs | `ActivityLog` |
| Settings | `Settings` |

### Assessment Relationships

An Assessment contains MCQ, CODING, SQL, and DEBUGGING questions. An attempt belongs to a Candidate/Application and records answers, timing, tab-switch events, auto-submission state, and scoring data.

## B12. File Storage Architecture

Cloudinary, resource_type `raw` for PDFs/DOCX, folder-namespaced by entity: `resumes/{candidateId}/{resumeId}.{ext}`, `offers/{applicationId}/{offerId}.pdf`. Uploads go through a signed-upload flow (server generates a signed Cloudinary upload signature so the file never transits the app server for large files, but for hackathon simplicity **[MVP DECISION]** the resume upload can go server-side through the API route since files are ≤10MB — simpler auth-checked path, no direct-to-client signing complexity). Access to stored resumes/offers is always mediated by an API route that checks role+ownership before returning a signed, time-limited Cloudinary URL (never the raw public URL).

## B13. AI Architecture

Single `lib/ai/` abstraction with mandatory interfaces `parseResume(text): ParsedResume` and `matchCandidate(resume, job): MatchResult`. Optional **[PS-BONUS]** adapters may provide `generateQuestions(resume, job): Question[]` and `summarizeFeedback(feedbackList): Summary`. Internally these call the LLM provider with structured output validation; the provider is swappable by changing one adapter module.

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

Coding Assessments are **[PS-MANDATORY]**. The system supports the required question types:
- MCQ
- Coding Problems
- SQL Queries
- Debugging Tasks

Required assessment behavior:
- Countdown timer
- Server-computed deadline
- Auto submission at deadline
- Tab-switch detection/logging
- Code editor for coding problems
- Assessment/test analytics
- Candidate attempt tracking

### Hackathon-safe implementation

The product requirement remains full PS-2 assessment coverage. The implementation may avoid a production-scale arbitrary-code execution sandbox. A bounded execution/evaluation adapter may support only approved languages/test cases or may route coding/SQL/debugging responses through a controlled evaluation path. The PRD must never claim Kubernetes-grade isolation or general-purpose untrusted execution if it is not implemented.

### Data flow

`Recruiter creates Assessment → adds typed Questions → assigns Assessment to Job/Application → Candidate starts Attempt → server records deadline → Candidate answers/edits → tab-switch events logged → Candidate submits or deadline auto-submits → scoring/evaluation → result stored → authorized analytics displayed`.

## B19. Notification Architecture

Single `notifyEvent(eventType, payload)` service function: writes one `Notification` row, sends the required transactional email where applicable, and publishes an in-app update so the authenticated UI reflects new notifications without a manual page refresh. **[IMPLEMENTATION DECISION]** Use Server-Sent Events (SSE) or short-interval authenticated polling for in-app updates; WebSocket-based live application updates remain **[PS-BONUS]**. All required PS notification events are enumerated in Part C.

## B20. Audit Logging

`ActivityLog` rows are written on every state-changing sensitive action and on sensitive data access such as resume views. Fields: `actorId, actorRole, action, entityType, entityId, metadata(json), createdAt`. Admin-only read endpoint with filters by actor/entity/date range.

## B20.1 Global Search Architecture

Search is implemented as a role-filtered PostgreSQL query layer across Candidates, Jobs, Companies, Recruiters, and Interviews. Search responses never bypass resource/company authorization. Add indexes on common searchable fields. For hackathon scale, no dedicated search engine is required.

## B20.2 Analytics Architecture

Analytics use aggregate PostgreSQL queries/views over Applications, Interviews, Feedback, Offers, Jobs, Companies, and recruiter/user activity. Metrics must be reproducible from transactional data without an external OLAP system.

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
/login, /register, /verify-email, /reset-password, /sessions

# Candidate
/candidate/dashboard
/candidate/jobs                    (search/filter)
/candidate/jobs/[jobId]
/candidate/profile
/candidate/applications
/candidate/applications/[appId]
/candidate/assessments/[attemptId]
/candidate/assessment/[assessmentId]/start
/candidate/offers/[offerId]

# Recruiter
/recruiter/dashboard
/recruiter/jobs
/recruiter/jobs/new, /recruiter/jobs/[jobId]/edit
/recruiter/jobs/[jobId]/pipeline    (Kanban)
/recruiter/applications/[appId]     (AI analysis panel)
/recruiter/interviews
/recruiter/interviews/new
/recruiter/assessments
/recruiter/assessments/new
/recruiter/assessments/[assessmentId]
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
/admin/companies
/admin/jobs
/admin/assessments
/admin/recruiters
/admin/permissions
/admin/settings
/admin/reports
```

## C2. Backend Route Map / API Endpoint Specification

```
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/refresh
POST   /api/v1/auth/logout
GET    /api/v1/auth/sessions
DELETE /api/v1/auth/sessions/:id
DELETE /api/v1/auth/sessions/all
GET    /api/v1/auth/google/callback
POST   /api/v1/auth/verify-email
POST   /api/v1/auth/request-password-reset
POST   /api/v1/auth/reset-password

GET    /api/v1/jobs?query=&location=&salary=&skills=&company=&experience=&workMode=&employmentType=&page=
POST   /api/v1/jobs                         [RECRUITER, ADMIN]
GET    /api/v1/jobs/:id
PATCH  /api/v1/jobs/:id                     [RECRUITER(owner), ADMIN]
POST   /api/v1/jobs/:id/duplicate           [RECRUITER, ADMIN]
POST   /api/v1/jobs/:id/close               [RECRUITER, ADMIN]
DELETE /api/v1/jobs/:id                     [RECRUITER(owner), ADMIN]

GET    /api/v1/candidates/me/profile        [CANDIDATE]
PATCH  /api/v1/candidates/me/profile        [CANDIDATE]
POST   /api/v1/candidates/me/resume         [CANDIDATE]
GET    /api/v1/candidates/:id/resume        [owner, RECRUITER, HM, ADMIN]

POST   /api/v1/applications                 [CANDIDATE]
GET    /api/v1/applications/me              [CANDIDATE]
GET    /api/v1/applications/:id             [owner, RECRUITER, HM, ADMIN]
PATCH  /api/v1/applications/:id/stage       [RECRUITER, ADMIN]
POST   /api/v1/applications/:id/interview-request [CANDIDATE]
GET    /api/v1/applications/:id/match-analysis [RECRUITER, HM, ADMIN]
POST   /api/v1/applications/:id/retry-analysis [RECRUITER, ADMIN]

POST   /api/v1/interviews                   [RECRUITER, ADMIN]
GET    /api/v1/interviews?role=interviewer  [INTERVIEWER]
GET    /api/v1/interviews/:id
PATCH  /api/v1/interviews/:id
POST   /api/v1/interviews/:id/feedback      [INTERVIEWER(assigned), HM workflow]
GET    /api/v1/interviews/:id/feedback      [RECRUITER, HM, ADMIN]

POST   /api/v1/assessments                  [RECRUITER, ADMIN]
GET    /api/v1/assessments/:id              [authorized users]
PATCH  /api/v1/assessments/:id              [RECRUITER, ADMIN]
POST   /api/v1/assessments/:id/questions    [RECRUITER, ADMIN]
PATCH  /api/v1/assessments/:id/questions/:questionId
DELETE /api/v1/assessments/:id/questions/:questionId
POST   /api/v1/assessments/:id/start        [CANDIDATE]
POST   /api/v1/assessments/attempts/:id/answer [CANDIDATE(owner)]
POST   /api/v1/assessments/attempts/:id/submit [CANDIDATE(owner)]
POST   /api/v1/assessments/attempts/:id/tab-switch [CANDIDATE(owner)]
GET    /api/v1/assessments/attempts/:id/result [CANDIDATE(owner), RECRUITER, HM, ADMIN]
GET    /api/v1/assessments/:id/analytics   [RECRUITER, HM, ADMIN]

POST   /api/v1/offers                       [RECRUITER, ADMIN]
GET    /api/v1/offers/:id
PATCH  /api/v1/offers/:id/respond           [CANDIDATE(owner)]
GET    /api/v1/offers/:id/pdf

GET    /api/v1/notifications/me
PATCH  /api/v1/notifications/:id/read

GET    /api/v1/search?q=&type=             [role-filtered global search]

GET    /api/v1/company/profile              [authorized company users]
PATCH  /api/v1/company/profile              [ADMIN]

GET    /api/v1/dashboard/recruiter          [RECRUITER]
GET    /api/v1/dashboard/candidate          [CANDIDATE]
GET    /api/v1/dashboard/hiring-manager     [HIRING_MANAGER]
GET    /api/v1/dashboard/interviewer        [INTERVIEWER]
GET    /api/v1/dashboard/admin              [ADMIN]

GET    /api/v1/analytics/recruiter          [RECRUITER, HM, ADMIN]
GET    /api/v1/analytics/hiring-funnel
GET    /api/v1/analytics/applications-per-job
GET    /api/v1/analytics/time-to-hire
GET    /api/v1/analytics/offer-acceptance
GET    /api/v1/analytics/candidate-source
GET    /api/v1/analytics/recruiter-performance
GET    /api/v1/analytics/interview-success
GET    /api/v1/analytics/diversity              [PS-OPTIONAL]

GET    /api/v1/admin/users                  [ADMIN]
PATCH  /api/v1/admin/users/:id/role         [ADMIN]
GET    /api/v1/admin/companies              [ADMIN]
GET    /api/v1/admin/jobs                   [ADMIN]
GET    /api/v1/admin/assessments            [ADMIN]
GET    /api/v1/admin/recruiters             [ADMIN]
GET    /api/v1/admin/permissions            [ADMIN]
PATCH  /api/v1/admin/permissions/:id        [ADMIN]
GET    /api/v1/admin/settings               [ADMIN]
PATCH  /api/v1/admin/settings               [ADMIN]
GET    /api/v1/admin/reports                [ADMIN]
GET    /api/v1/admin/audit-log
/admin/companies
/admin/jobs
/admin/assessments
/admin/recruiters
/admin/permissions
/admin/settings
/admin/reports              [ADMIN]
```

## C3. Database Table Specification (field-level)

**User**: `id (uuid pk), email (unique, not null), passwordHash (nullable — null for OAuth-only), name, role (enum), companyId (fk, nullable), avatarUrl, emailVerifiedAt (nullable), createdAt, updatedAt, deletedAt (nullable)`. Index: `email` unique, `companyId`, `role`.

**UserSession**: `id (pk), userId (fk), refreshTokenHash, deviceName, deviceType, userAgent, ipAddress, createdAt, lastUsedAt, expiresAt, revokedAt (nullable)`.

**Company**: `id (pk), logoUrl, name, website, industry, companySize, description, socialLinks (jsonb), officeLocations (jsonb[]), createdAt, updatedAt`.

**Job**: `id (pk), companyId (fk), recruiterId (fk→User), title, department, location, salaryMin, salaryMax, experienceRequired, skillsRequired (string[]), skillsPreferred (string[]), employmentType (enum: FULL_TIME|PART_TIME|CONTRACT|INTERN), workMode (enum: REMOTE|HYBRID|ONSITE), deadline (date), description (text), status (enum: DRAFT|OPEN|CLOSED), createdAt, updatedAt, deletedAt`. Index: `companyId`, `status`, `deadline`, full-text index on `title, description`.

**CandidateProfile**: `id (pk), userId (fk unique), profilePictureUrl, phone, location, education (jsonb[]), experience (jsonb[]), skills (string[]), certifications (string[]), portfolioUrl, githubUrl, linkedinUrl, coverLetterText, profileCompletion (int 0-100), createdAt, updatedAt`.

**Resume**: `id (pk), candidateProfileId (fk), fileUrl, fileHash, fileName, fileSizeBytes, fileType (enum PDF|DOCX), status (enum: UPLOADED|PARSING|PARSED|FAILED), uploadedAt`. Unique/index on `(candidateProfileId, fileHash)` for duplicate detection. Virus scan metadata is optional/bonus.

**ResumeAnalysis**: `id (pk), resumeId (fk unique), extractedName, extractedEmail, extractedPhone, skills (string[]), education (jsonb[]), experience (jsonb[]), projects (jsonb[]), certifications (string[]), languages (string[]), totalExperienceYears (float), promptVersion, rawModelResponse (jsonb), createdAt`.

**Application**: `id (pk), candidateId (fk→User), jobId (fk), source (enum/string: DIRECT|REFERRAL|JOB_BOARD|CAREERS_PAGE|OTHER), stage (enum: APPLIED|RESUME_SCREENING|SHORTLISTED|TECHNICAL_INTERVIEW|HR_INTERVIEW|OFFER|HIRED|REJECTED), appliedAt, hiredAt (nullable), updatedAt, deletedAt`. Unique constraint: `(candidateId, jobId)`. Index: `jobId, stage`, `candidateId`, `source`.

**MatchAnalysis**: `id (pk), applicationId (fk unique), matchScore (int 0-100), strengths (string[]), matchedSkills (string[]), missingSkills (string[]), weakAreas (string[]), experienceAlignment (text), recommendation (text), status (enum: PENDING|COMPLETED|FAILED), promptVersion, createdAt`.

**Interview**: `id (pk), applicationId (fk), interviewerId (fk→User), type (enum: TECHNICAL|HR|OTHER), scheduledAt, meetingLink, status (enum: SCHEDULED|COMPLETED|CANCELLED), createdAt`. Index: `applicationId`, `interviewerId`, `scheduledAt`.

**Feedback**: `id (pk), interviewId (fk), interviewerId (fk), technicalScore (1-5), communicationScore (1-5), problemSolvingScore (1-5), teamworkScore (1-5), leadershipScore (1-5), overallRating (1-5), comments (text), submittedAt`. Unique constraint: `(interviewId, interviewerId)`.

**Assessment**: `id (pk), jobId (fk, nullable), title, instructions, type (enum: MIXED), durationMinutes, status (enum: DRAFT|PUBLISHED|CLOSED), createdBy (fk→User), createdAt, updatedAt`.

**AssessmentQuestion**: `id (pk), assessmentId (fk), type (enum: MCQ|CODING|SQL|DEBUGGING), prompt, difficulty, points, orderIndex, metadata (jsonb), createdAt`.

**AssessmentOption**: `id (pk), questionId (fk), text, isCorrect`, used for MCQ questions. Candidate-facing reads never return `isCorrect`.

**AssessmentAttempt**: `id (pk), assessmentId (fk), applicationId (fk), candidateId (fk→User), startedAt, deadlineAt, submittedAt (nullable), autoSubmitted (bool), tabSwitchCount, score (float, nullable), status (enum: IN_PROGRESS|SUBMITTED|AUTO_SUBMITTED|EVALUATION_PENDING|EVALUATED)`.

**AssessmentAnswer**: `id (pk), attemptId (fk), questionId (fk), answerText, language (nullable), executionResult (jsonb, nullable), score (float, nullable), submittedAt`.

**OfferLetter**: `id (pk), applicationId (fk unique), candidateName, role, salary, joiningDate, location, benefits (text), status (enum: DRAFT|SENT|ACCEPTED|REJECTED), pdfUrl, sentAt, respondedAt`.

**Notification**: `id (pk), userId (fk), type (enum, see C6), title, body, readAt (nullable), createdAt`. Index: `userId, readAt`.

**ActivityLog**: `id (pk), actorId (fk→User), actorRole, action (string), entityType (string), entityId (uuid), metadata (jsonb), createdAt`. Index: `actorId`, `entityType, entityId`, `createdAt`.

**Settings**: `id (pk), companyId (fk, nullable — null = platform-wide), key, value (jsonb)`. Unique: `(companyId, key)`.

## C4. Authentication Flows

**Email/password register:** `POST /auth/register {email, password, name, role: CANDIDATE}` → hash password → create User(emailVerifiedAt: null) → send verification email → `201`. **Login:** verify bcrypt → issue access(15m)+refresh(7d) tokens → refresh set as httpOnly cookie, access returned in body for client memory storage. **Google OAuth:** NextAuth handles the OAuth dance; on callback, find-or-create User by email, default role `CANDIDATE`. **Refresh:** validate refresh cookie → rotate both tokens.

## C4.1 Device Session Management

- On successful email/password or OAuth login, create a `UserSession` record.
- Store only a hash of the refresh token.
- `GET /api/v1/auth/sessions` lists the current user's active sessions without exposing raw tokens.
- `DELETE /api/v1/auth/sessions/:id` revokes one session.
- `DELETE /api/v1/auth/sessions/all` revokes all sessions.
- Refresh requests must reject revoked/expired sessions.

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

## C5.1 Assessment Request / Response Schemas

**Create Assessment**
```json
{
  "jobId": "uuid",
  "title": "Backend Assessment",
  "instructions": "Complete all questions within the allotted time",
  "durationMinutes": 45,
  "questions": [
    {
      "type": "MCQ|CODING|SQL|DEBUGGING",
      "prompt": "...",
      "points": 10,
      "metadata": {}
    }
  ]
}
```

**Assessment attempt response** must include `attemptId`, `startedAt`, `deadlineAt`, question content, and remaining-time information without exposing MCQ answer keys. Candidate answers and tab-switch events are stored server-side.

**Assessment result** includes `status`, `score`, per-question result where authorized, `tabSwitchCount`, `submittedAt`, and `autoSubmitted`.

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

- Job: `title` required ≤150 chars, `salaryMin ≤ salaryMax`, `deadline` future on create.
- Resume upload: MIME ∈ {PDF,DOCX}, size ≤10MB, magic-byte check, duplicate detection via file hash per candidate.
- Interview: scheduled time must be valid; candidate/interviewer access checked.
- Assessment: duration > 0; deadline server-controlled; no answer changes after submission; tab-switch events recorded.
- Feedback: technical/communication/problem-solving/teamwork/leadership/overall scores integers 1–5, comments optional.
- Offer: `salary > 0`, `joiningDate` future date.
- Company: required PS profile fields validated by role.

## C11. File Upload Rules

10MB max, PDF/DOCX only, stored under candidate-namespaced Cloudinary folder, access only via signed short-lived URL generated per-request after an ownership/role check.

---

# PART D — PROJECT EXECUTION

## D1. 24-Hour Implementation Plan

The first 24 hours target a PS-compliant vertical slice rather than deferring mandatory modules.

| Hours | Focus |
|---|---|
| 0–2 | Repo scaffold, Prisma schema, seed data, email/password auth, session model |
| 2–5 | Google OAuth + RBAC + job CRUD + landing page shell |
| 5–8 | Candidate profile + resume upload + duplicate detection + text extraction |
| 8–11 | AI parsing + AI matching pipeline end-to-end |
| 11–14 | Application workflow + exact PS Kanban stages + global search skeleton |
| 14–17 | Coding assessment module: MCQ/CODING/SQL/DEBUGGING, timer, tab logging, auto-submit |
| 17–19 | Interview scheduling + reminders + feedback |
| 19–21 | Offer PDF + accept/reject + email notifications |
| 21–24 | Candidate/Recruiter dashboards + required analytics + deploy smoke test |

## D2. 48-Hour Implementation Plan

| Hours | Focus |
|---|---|
| 24–28 | Hiring Manager, Interviewer, Admin dashboards + admin management surfaces |
| 28–31 | Assessment analytics + search refinement + company profile |
| 31–34 | Security hardening: RBAC, device sessions, salary isolation, validation |
| 34–37 | Required analytics: applications/job, funnel, time-to-hire, offer acceptance, source, recruiter performance, interview success |
| 37–40 | UI polish: dark/light, skeletons, empty/error states, animations, accessibility, mobile |
| 40–43 | E2E tests for all mandatory golden paths + assessment flow |
| 43–46 | API docs, ER diagram, README, `.env.example`, Postman export |
| 46–48 | Final deployment, demo rehearsal, backup/demo fallback validation |

### Optional bonus window

Only after all PS-mandatory requirements pass: AI interview questions, AI feedback summarization, AI chatbot, cover-letter generation, collaborative notes, calendar integration, WebSockets, PWA, multilingual, Docker, CI/CD.

## D3. Dependency Order

Auth → Company/User seed → Job CRUD → Candidate Profile → Resume Upload → Resume Parsing (AI) → Application Create → Match Analysis (AI) → Kanban Pipeline → Interview Scheduling → Feedback → Offer → Notifications wired throughout → Dashboards (read-only aggregates, can build in parallel once core tables exist).

## D4. Development Milestones

M1: Auth + RBAC working. M2: Job + Application core CRUD working. M3: AI resume parsing produces structured data reliably. M4: AI matching produces a demo-quality score+explanation. M5: Full golden path clickable end-to-end (even with rough UI). M6: Polished UI + all 5 dashboards. M7: Deployed + tested + demo-ready.

## D5. Frontend/Backend Parallelization Strategy

Once Prisma schema + Zod schemas are locked (end of hour 2), frontend can build against a mocked API client (MSW or static fixtures) while backend implements real routes — merge points at each milestone. AI pipeline work can proceed independently behind the `lib/ai/` interface with a stub implementation the rest of the app can call from hour 2 onward.

## D6. Critical Path

Auth/session security → DB schema → Job/Candidate core → Resume upload/parsing → AI matching → Application pipeline → Mandatory assessment → Interviews/feedback → Offer → Notifications → Required analytics/search/admin → deployment.

If AI matching is temporarily unavailable, downstream workflows may use seeded/mock analysis only as an internal development fallback; the final deployed submission must expose the real AI flow because AI Resume Analysis is PS-mandatory.

## D7. Risky Features

1. AI structured-output reliability (schema drift, hallucinated fields) — mitigate with strict Zod validation + retry + fallback UI.
2. PDF/DOCX text extraction edge cases (scanned/image-only resumes) — mitigate by scoping to text-based PDFs/DOCX and showing a clear "couldn't extract, please fill manually" state.
3. Interview meeting-link integration — the PS requires a Zoom/Google Meet meeting link. Implement a provider abstraction. If live provider credentials are unavailable, a seeded/provider-compatible demo link may be used only as an explicitly documented **[IMPLEMENTATION SHORTCUT]**; do not claim a live Zoom/Google Meet integration unless it is actually configured and tested.
4. Assessment auto-submit timing — mitigate with server-computed deadline, not just client timer trust.

## D8. Fallback Features

If time runs short, cut in this order:
1. PS-BONUS features
2. Visual polish beyond the required UI baseline
3. Optional diversity metrics
4. Non-essential analytics convenience widgets

Never cut or classify as optional: authentication/security baseline, Job Management, Candidate Management, Resume Upload/Parsing, AI Resume Analysis, Job Search filters, Application Pipeline, Coding Assessments, Interview Scheduling, Interview Feedback, Email Notifications, Required real-time notifications, Required analytics, Company Profile, Admin Panel, Offer Generation, Candidate Portal, required dashboards, deployment, or required documentation/deliverables.

## D9. Demo Preparation Checklist

- [ ] Seed data: 1 company, 2 recruiters, 5+ candidates with varied resumes, 3+ open jobs, at least one fully-progressed application (through to offer)
- [ ] One "fresh" candidate ready to run the live apply→AI-match flow on stage
- [ ] One seeded assessment covering MCQ + coding + SQL + debugging, ready to demonstrate timer/auto-submit/tab-switch logging
- [ ] Global search seeded across candidates, jobs, companies, recruiters, interviews
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
- [ ] Security: cross-role access attempts return 403 for every protected route; unauthenticated requests return 401; Interviewer cannot access salary fields; Candidate cannot access recruiter data; Recruiter cannot modify company settings; file upload rejects oversized/wrong-type files; duplicate resume detection works; SQL injection attempts on search fields fail safely; revoked device sessions cannot refresh tokens; assessment answer keys are never returned to candidates

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

API documentation is a **P0 deliverable** because PS-2 explicitly lists Swagger/OpenAPI/API documentation in the Expected Deliverables, even though it also appears in the Bonus Features list. The authoritative treatment for submission is the Expected Deliverables section. Provide:
- Swagger/OpenAPI documentation, or
- a complete Postman collection/API export, preferably both.

The documentation must cover every implemented endpoint in §C2, request/response examples, authentication requirements, RBAC, error codes, and assessment/search/admin endpoints.

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

0:00 recruiter login + create job → 0:40 candidate uploads resume and applies → 1:10 AI parsing + match score reveal (hero moment) → 1:50 recruiter reviews strengths/gaps → 2:15 candidate completes representative assessment → 2:40 assessment analytics → 2:55 interview scheduling + notification/reminder → 3:20 interviewer submits feedback → 3:40 hiring manager compares scorecards → 4:00 recruiter generates offer → 4:15 candidate accepts/rejects → 4:30 global search/analytics/admin sweep → 4:50 architecture + close.

## E9. Presentation / Demo Talking Points

- Lead with the pain: recruiters manually reading hundreds of resumes.
- Show, don't tell: let the AI match score + explainable gaps speak for themselves.
- Emphasize "AI augments, never replaces" — the recruiter/HM keeps the decision.
- Call out the modular monolith / AI-abstraction-layer choice as intentional simplicity, not a limitation.
- Close on the full funnel: job → apply → AI → interview → offer, all in one platform, all role-secured.

---

# PART F — PS-2 TRACEABILITY MATRIX

Every PS-mandatory requirement must map to a PRD section, TRD component, and acceptance criterion. This matrix is the compliance gate for the final document.

| PS-2 Requirement | PRD/TRD Coverage | Key Technical Component | Acceptance Gate |
|---|---|---|---|
| Job Management | A11 / C3 | Job model + Jobs API + recruiter UI | Create/edit/close/duplicate/delete verified |
| Candidate Management | A10/A11 / C3 | CandidateProfile + User | Candidate profile flow verified |
| Resume Upload & Parsing | A11/A14 / B15 / C3 | Resume + ResumeAnalysis | PDF/DOCX ≤10MB, duplicate check, extraction verified |
| AI Resume Analysis | A14 / B13-B16 | AI abstraction + MatchAnalysis | Match percentage/gaps/strengths/weakness/recommendation verified |
| Interview Scheduling | A11 / B17 / C2 | Interview + reminder flow | Interview creation/notification/reminder verified |
| Coding Assessments | A11 / B18 / C3 | Assessment/Question/Attempt/Answer | MCQ/CODING/SQL/DEBUGGING + timer/auto-submit/tab logging verified |
| Email Notifications | A15 / B19 | Email service | Required email events verified |
| Analytics Dashboard | A16 / C2 | Aggregate analytics queries | Required analytics all visible |
| Offer Letter Generation | A11 / C3 | OfferLetter + PDF | Generate/download/accept/reject verified |
| Candidate Portal | A16 / C1 | Candidate routes/dashboard | Candidate workflow verified |
| Google OAuth | A11 / B8 | NextAuth Google provider | OAuth login verified |
| Device Session Management | B8 / C2/C3 | UserSession | List/revoke sessions verified |
| Role Permissions | A12 / B9 | RBAC middleware | All PS role restrictions verified |
| Landing Page | A17 / C1 | Public routes/components | Required sections present |
| Global Search | A16.1 / B20.1 / C2 | Search API/indexes/UI | All five PS search domains verified |
| Required Analytics | A16 | Analytics service | Applications/job, funnel, time-to-hire, offer acceptance, source, recruiter performance, interview success verified |
| Company Profile | A16.2 / C3 | Company model/API/UI | All PS company fields verified |
| Admin Panel | A16.3 / C2 | Admin APIs/UI | Users, companies, jobs, assessments, recruiters, permissions, settings, logs, reports verified |
| UI/UX Baseline | A17 | Next.js/Tailwind UI | Responsive/dark/light/modern dashboard/kanban/skeleton/empty/toast/animation/keyboard/mobile verified |
| Security | A19 / B24-B25 | Auth/RBAC/validation/rate limiting/audit | Security test suite passes |
| Database Entities | B11 / C3 | Prisma schema | PS conceptual entities mapped |
| Expected Deliverables | Part E | Repo/deploy/docs | Submission checklist passes |

## PS-2 Compliance Gate

The implementation is considered **PS-STRICT COMPLIANT** only when every row above has a passing acceptance test. A feature may be technically simplified, but it may not be removed, downgraded, or silently omitted.

# FINAL SUMMARY

## 1. Final Recommended Tech Stack

Next.js + TypeScript + Tailwind (frontend + API routes) · PostgreSQL + Prisma · NextAuth (Google OAuth) + JWT/bcrypt (email-password) · Cloudinary (files) · Anthropic Claude API behind a provider-abstraction layer · Resend (email) · Vercel (app) + Railway/Render (DB).

## 2. Final Architecture Summary

Modular monolith, one relational database, one file-storage provider, one AI abstraction layer, REST JSON API under `/api/v1`, server-enforced RBAC, device-session management, global search over PostgreSQL, mandatory assessment engine, event-driven notifications, required analytics, company/admin management, and no microservices/Kubernetes unless explicitly justified later.

## 3. Final Database Entity List

User, UserSession, Company, Job, CandidateProfile, Resume, ResumeAnalysis, Application, MatchAnalysis, Interview, Feedback, Assessment, AssessmentQuestion, AssessmentOption, AssessmentAttempt, AssessmentAnswer, OfferLetter, Notification, ActivityLog, Settings.

## 4. Final API Module List

Auth · Jobs · Candidates/Profile · Applications · Interviews · Assessments · Offers · Notifications · Dashboards · Admin.

## 5. Final P0/P1/P2 Feature Matrix

| Priority | Features |
|---|---|
| **P0** | All PS-mandatory features: Auth, device sessions, all roles/permissions, landing page, Job Management, Candidate Management, Resume Upload/Parsing, AI Resume Analysis, job search filters, application pipeline/Kanban, Interview Scheduling, Coding Assessments (MCQ/Coding/SQL/Debugging + timer/auto-submit/tab logging/code editor/analytics), Email Notifications, required real-time notifications, required Analytics, Company Profile, Admin Panel, Offer Generation, Candidate Portal, all required dashboards, security, audit logging, deployment and required deliverables |
| **P1** | PS-optional Diversity Metrics plus implementation-quality enhancements that do not replace P0 functionality |
| **P2** | All PS-BONUS features: AI FAQ chatbot, AI interview questions, AI cover-letter generation, AI feedback summarization, collaborative notes, resume version history, referral system, bulk resume import, public careers page, calendar integration, WebSockets, PWA, multilingual, Docker, CI/CD |

## 6. Final 24–48 Hour Execution Plan

See Part D1/D2 in full; critical path is Auth → Schema → Resume Upload/Parsing → AI Matching → Kanban/Interviews/Offers, with polish and P1 features layered in hours 24–48.

## 7. Top Technical Risks

1. AI structured-output reliability under time pressure.
2. Resume text-extraction edge cases (scanned PDFs).
3. Underestimating RBAC test surface across 5 roles.
4. Demo-day AI latency/availability.

## 8. Recommended Shortcuts / Tradeoffs

Preserve all PS-mandatory capabilities while simplifying infrastructure:
- Use a provider abstraction for Zoom/Google Meet links; a seeded/provider-compatible link may be used only as a documented implementation shortcut when live credentials are unavailable.
- Avoid a production-scale arbitrary-code sandbox; implement the mandatory MCQ/coding/SQL/debugging assessment workflow with a bounded evaluation mechanism suitable for the hackathon.
- Skip a staging environment unless needed; production deployment is sufficient for the hackathon.
- Skip Redis/queue infrastructure unless measured load requires it; synchronous email plus lightweight rate limiting is sufficient at hackathon scale.
- Server-mediated resume upload is acceptable at the PS 10 MB file limit.
- Do not remove global search, required analytics, company/admin management, device sessions, or any other PS-mandatory feature merely to reduce infrastructure.

## 9. Final Demo Storyline

Recruiter logs in → creates a job/company view → candidate uploads resume → AI parses + matches candidate → candidate applies → Recruiter sees AI analysis → Candidate completes a mandatory assessment containing representative MCQ/coding/SQL/debugging content → recruiter views assessment analytics → interview is scheduled → candidate/interviewer receive notifications/reminder → interviewer submits feedback → hiring manager compares feedback → recruiter generates offer → candidate accepts/rejects → quick global search + analytics/admin sweep.

## 10. Final Compliance Status

This V1.1 document is intended to be **PS-STRICT**: it preserves all mandatory Problem Statement 2 capabilities, explicitly marks PS-optional/PS-bonus scope, and provides a traceability matrix so every mandatory requirement can be verified before submission.
