# TalentFlow ATS

An AI-powered Applicant Tracking System (ATS) that streamlines the hiring process from sourcing to offer. Built as a full-stack Next.js 15 application with a PostgreSQL database, this platform features AI-driven resume parsing, objective candidate matching, structured scorecards, and a full coding assessment module.

## Core Features
- **Role-Based Workspaces**: Dedicated dashboards for Candidates, Recruiters, Hiring Managers, Interviewers, and Admins.
- **AI Resume Parsing & Matching**: Automatically extracts structured data (skills, experience, education) from PDFs/DOCXs using LLMs and provides a Match Score against job descriptions.
- **Kanban Pipeline**: Drag-and-drop / click-to-advance recruitment pipeline supporting 7 PS-Strict stages (Applied, Resume Screening, Shortlisted, Technical Interview, HR Interview, Offer, Hired/Rejected).
- **Assessment Module**: In-browser Monaco editor for Coding/SQL challenges with server-authoritative timers, auto-submit logic, and browser tab-switch detection.
- **Security**: Robust authentication using secure HTTP-only cookies for refresh tokens, with short-lived JWT access tokens managed in-memory/client-side. RBAC is enforced strictly at the API route level. Secure file storage includes a local development fallback and an AWS S3 adapter for production.

## Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Frontend**: React 19, TailwindCSS v4, Monaco Editor, Vanilla CSS Glassmorphism 
- **Backend/API**: Next.js Route Handlers
- **Database**: PostgreSQL (via Prisma ORM)
- **Authentication**: JWT, bcrypt, jose
- **Storage**: AWS S3 Adapter (Production) / Local Disk (Development)
- **AI**: Google GenAI

## Getting Started

1. **Clone & Install**
   ```bash
   npm install
   ```

2. **Environment Configuration**
   Copy `.env.example` to `.env` and fill in your variables:
   ```env
   DATABASE_URL="postgresql://user:pass@localhost:5432/talentflow"
   JWT_ACCESS_SECRET="your-secret"
   JWT_REFRESH_SECRET="your-secret"
   GEMINI_API_KEY="your-gemini-key"
   # AWS Config (for production storage)
   AWS_REGION="us-east-1"
   AWS_ACCESS_KEY_ID="..."
   AWS_SECRET_ACCESS_KEY="..."
   AWS_S3_BUCKET="talentflow-resumes"
   ```

3. **Database Setup**
   ```bash
   npx prisma generate
   npx prisma db push
   npx prisma db seed
   ```

4. **Run Development Server**
   ```bash
   npm run dev
   ```

## Demo Accounts (Password: Demo@1234)
- admin@demo.ats
- recruiter@demo.ats
- hm@demo.ats
- interviewer@demo.ats
- candidate@demo.ats

## Documentation
- [API Documentation (OpenAPI format pending / Postman Collection available)]
- [ERD Diagram](./ERD.md)
