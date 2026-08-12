# TalentFlow ATS

<div align="center">

![TalentFlow Banner](https://img.shields.io/badge/TalentFlow-AI%20Powered%20ATS-7c3aed?style=for-the-badge&logo=sparkles&logoColor=white)

**An AI-Powered, Full-Stack Applicant Tracking System**

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-3ecf8e?style=flat-square&logo=supabase)](https://supabase.com/)
[![Prisma](https://img.shields.io/badge/Prisma-7.9-2D3748?style=flat-square&logo=prisma)](https://www.prisma.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Google AI](https://img.shields.io/badge/Google-Gemini%20AI-4285F4?style=flat-square&logo=google)](https://ai.google.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](./LICENSE)


</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Architecture](#-architecture)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Demo Accounts](#-demo-accounts)
- [Project Structure](#-project-structure)
- [API Reference](#-api-reference)
- [Deployment](#-deployment)
- [Security](#-security)
- [License](#-license)

---

## 🌟 Overview

TalentFlow is a comprehensive, enterprise-grade Applicant Tracking System built for the modern recruiter. It handles the full recruitment lifecycle — from job posting and candidate application, through structured interviews and coding assessments, all the way to generating and sending digitally-signed PDF offer letters.

The platform is AI-first: every resume uploaded is automatically parsed by Google Gemini AI, skills and experience are extracted, and candidates are scored against job requirements to give recruiters an objective, bias-reduced view of the talent pool.

### The Problem It Solves

Traditional ATS platforms are slow, siloed, and built for administrators — not for recruiters who live in pipelines. TalentFlow provides:

- **A unified workspace** where every stakeholder (Recruiter, Hiring Manager, Interviewer, Candidate, Admin) has a dedicated, role-appropriate interface.
- **AI automation** for the most time-consuming tasks: resume screening and candidate ranking.
- **A fair assessment environment** with Monaco-powered code challenges, server-authoritative timers, and anti-cheat tab detection.
- **End-to-end auditability** with a complete activity log for every action taken on the platform.

---

## 🏗 Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENT BROWSER                              │
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐  │
│  │  Landing Page│  │  Auth Pages  │  │  Role-Based Dashboards   │  │
│  │  (Next.js)   │  │  (Login/Reg) │  │  (Recruiter/HM/Candidate)│  │
│  └──────┬───────┘  └──────┬───────┘  └──────────┬───────────────┘  │
│         │                 │                       │                  │
└─────────┼─────────────────┼───────────────────────┼──────────────────┘
          │                 │                       │
          ▼                 ▼                       ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      NEXT.JS 15 APP ROUTER                          │
│                                                                     │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │                    MIDDLEWARE (JWT Guard)                       │ │
│  │  Verifies Bearer token on every /api/v1/* request              │ │
│  │  Injects x-user-id + x-user-role headers into route handlers   │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                     │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐  │
│  │  /api/v1/   │ │  /api/v1/   │ │  /api/v1/   │ │  /api/v1/   │  │
│  │    auth     │ │    jobs     │ │ applications│ │  analytics  │  │
│  └──────┬──────┘ └──────┬──────┘ └──────┬──────┘ └──────┬──────┘  │
│         │               │               │               │          │
└─────────┼───────────────┼───────────────┼───────────────┼──────────┘
          │               │               │               │
          ▼               ▼               ▼               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    PRISMA ORM (v7.9.1)                              │
│              @prisma/adapter-pg + pg connection pool                 │
└────────────────────────────────┬────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                   POSTGRESQL DATABASE                               │
│              (Supabase cloud / Docker local)                        │
│                                                                     │
│  Users  Companies  Jobs  Applications  Interviews  Assessments      │
│  Resumes  OfferLetters  Notifications  AuditLogs  Sessions          │
└─────────────────────────────────────────────────────────────────────┘
```

### Hiring Pipeline State Machine

```
APPLIED ──► RESUME_SCREENING ──► SHORTLISTED ──► TECHNICAL_INTERVIEW
                                                         │
                                                         ▼
                                 REJECTED ◄──── HR_INTERVIEW ──► OFFER ──► HIRED
```

### Authentication Flow

```
 Browser                   Next.js API              Database
    │                           │                       │
    │── POST /auth/login ───────►│                       │
    │                           │── findUnique(email) ──►│
    │                           │◄── User record ────────│
    │                           │                       │
    │                           │  bcrypt.compare()      │
    │                           │  generateAccessToken() │
    │                           │  generateRefreshToken()│
    │                           │── create(UserSession)─►│
    │◄── accessToken (body) ────│                       │
    │◄── refreshToken (cookie) ─│                       │
    │                           │                       │
    │── GET /api/v1/jobs ───────►│                       │
    │   Authorization: Bearer   │                       │
    │                           │  verifyAccessToken()   │
    │                           │  x-user-id header      │
    │◄── Jobs data ─────────────│                       │
```

---

## ✨ Features

### 🔐 Authentication & Security
- JWT-based authentication with **short-lived access tokens** (15 min) and **long-lived refresh tokens** (7 days stored in HTTP-only cookies)
- **Password hashing** with bcrypt (10 rounds)
- **Role-Based Access Control (RBAC)** enforced server-side at every API route
- Session management with full device/IP tracking
- Complete audit logging for all significant actions

### 👥 Multi-Role Workspaces

| Role | Capabilities |
|------|-------------|
| **Admin** | Company settings, user management, platform audit logs, system reports |
| **Recruiter** | Job posting, Kanban pipeline, candidate advancement, offer generation |
| **Hiring Manager** | Pipeline visibility, interview feedback, analytics dashboard |
| **Interviewer** | Assigned interviews, structured scorecard submission |
| **Candidate** | Job browsing, application tracking, resume upload, code assessments |

### 🤖 AI-Powered Features
- **Resume Parsing**: Extracts structured data (skills, experience, education, contact info) from uploaded PDF/DOCX files using Google Gemini AI
- **Match Score**: Compares extracted candidate profile against job requirements and produces a numerical match score with reasoning
- **AI Resume Generation**: Generates a polished professional resume for candidates based on their profile data

### 📋 Recruitment Pipeline
- 7-stage Kanban board (Applied → Resume Screening → Shortlisted → Technical Interview → HR Interview → Offer → Hired/Rejected)
- Click-to-advance with server-side stage transition validation
- Per-stage candidate count metrics
- Full candidate card with skills, score, and experience display

### 💻 Coding Assessment Module
- **Monaco Editor** (the same editor powering VS Code) embedded in-browser
- Support for **CODING**, **SQL**, and **MCQ** question types
- **Server-authoritative timer**: deadline stored in the database, not the browser
- **Anti-cheat detection**: tab-switch events are recorded and sent to the server
- **Auto-submit**: assessment is automatically submitted at deadline expiry
- PDF scorecard generation upon completion

### 📊 Analytics & Reporting
- Time-to-hire tracking across all active roles
- Hiring funnel conversion rates by pipeline stage
- Offer acceptance rate metrics
- Per-recruiter performance breakdown
- Exportable reports for Admin

### 📁 Document Management
- Resume upload with duplicate detection (SHA-256 file hash)
- PDF Offer Letter generation using `pdf-lib`
- AWS S3 adapter for production-grade file storage
- Local filesystem fallback for development

---

## 🛠 Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Framework | Next.js 15 (App Router) | Full-stack React framework |
| Language | TypeScript 5.7 | End-to-end type safety |
| Styling | TailwindCSS v4 + Vanilla CSS | UI design system |
| UI Components | Lucide React, Monaco Editor | Icons, Code Editor |
| ORM | Prisma 7.9 | Database access layer |
| Database | PostgreSQL (Supabase) | Primary data store |
| Authentication | `jose` (JWT), `bcrypt` | Auth & password hashing |
| AI | Google Gemini API | Resume parsing, scoring |
| File Storage | AWS S3 / Local | Resume and PDF storage |
| PDF Generation | `pdf-lib` | Offer letter generation |
| Resume Parsing | `mammoth`, `pdf-parse` | DOCX/PDF text extraction |
| Containerization | Docker + Docker Compose | Self-hosted deployment |
| Deployment | Vercel | Serverless production hosting |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 20+ and **npm**
- **Docker Desktop** (for the local PostgreSQL database)
- A **Google AI Studio** account for the Gemini API key

### 1. Clone & Install

```bash
git clone https://github.com/Tvaibhav06/ATS_platform.git
cd ATS_platform
npm install
```

### 2. Configure Environment

Copy the example environment file and fill in your values:

```bash
cp .env.example .env
```

Edit `.env`:

```env
# Database (use localhost:5433 when running postgres via docker-compose)
DATABASE_URL="postgresql://postgres:password@localhost:5433/ats?schema=public"

# JWT Secrets — use any long random strings in production
JWT_ACCESS_SECRET="dev_access_secret_123"
JWT_REFRESH_SECRET="dev_refresh_secret_456"

# Google Gemini AI Key — get from https://aistudio.google.com/
GEMINI_API_KEY="your_actual_gemini_api_key"

# AWS S3 (optional — for production file storage)
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="..."
AWS_SECRET_ACCESS_KEY="..."
AWS_S3_BUCKET="talentflow-resumes"
```

### 3. Start the Database

```bash
docker-compose up -d postgres
```

This starts a PostgreSQL container on port `5433`.

### 4. Set Up the Database Schema & Seed Data

```bash
npx prisma generate
npx prisma db push
npx prisma db seed
```

This creates all database tables and populates them with the five demo user accounts.

### 5. Start the Development Server

```bash
npm run dev
```

Navigate to **http://localhost:3000** and log in with any of the [demo accounts](#-demo-accounts).

---

## 🧪 Demo Accounts

All demo accounts share the same password: **`Demo@1234`**

| Email | Role | Access |
|-------|------|--------|
| `admin@demo.ats` | Admin | Company settings, audit logs, user management |
| `recruiter@demo.ats` | Recruiter | Job posting, Kanban pipeline, offer letters |
| `hm@demo.ats` | Hiring Manager | Pipeline view, interview management |
| `interviewer@demo.ats` | Interviewer | Interview scorecards, feedback |
| `candidate@demo.ats` | Candidate | Job search, applications, assessments |

---

## 📁 Project Structure

```
DevFusion/
├── app/
│   ├── api/v1/                    # All REST API route handlers
│   │   ├── auth/                  # Login, register, refresh, sessions
│   │   ├── jobs/                  # Job CRUD, duplicate, close
│   │   ├── applications/          # Apply, stage updates, pipeline
│   │   ├── interviews/            # Schedule, scorecard submission
│   │   ├── assessments/           # Create, attempt, submit, grade
│   │   ├── candidates/            # Profile, resume upload
│   │   ├── offers/                # Generate, send, track offers
│   │   ├── analytics/             # Time-to-hire, funnel, metrics
│   │   ├── notifications/         # In-app notification system
│   │   ├── search/                # Global search across entities
│   │   └── admin/                 # Reports, audit logs, company
│   ├── (auth)/                    # Login & registration pages
│   ├── assessments/               # Candidate assessment UI
│   └── layout.tsx                 # Root layout with AuthProvider
│
├── components/
│   ├── auth-provider.tsx          # Global JWT auth context (React)
│   └── talentflow-app.tsx         # Main role-based app shell
│
├── lib/
│   ├── db.ts                      # Prisma client singleton
│   ├── auth.ts                    # hashPassword, verifyPassword
│   ├── jwt.ts                     # generateAccessToken, verifyJWT
│   ├── storage.ts                 # S3 / Local storage adapter
│   ├── notifications.ts           # Notification event system
│   └── domain.ts                  # Shared types, stage constants
│
├── prisma/
│   ├── schema.prisma              # Full database schema (25+ models)
│   ├── seed.ts                    # Demo data seeder
│   └── migrations/                # Database migration history
│
├── prisma.config.ts               # Prisma 7 CLI configuration
├── next.config.ts                 # Next.js configuration
├── Dockerfile                     # Production Docker image
├── docker-compose.yml             # Local development stack
├── openapi.yaml                   # Full OpenAPI 3.0 spec
└── README.md                      # This file
```

---

## 📡 API Reference

The full API is documented in [`openapi.yaml`](./openapi.yaml). A summary of the core endpoints:

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/auth/login` | Login and receive JWT tokens |
| `POST` | `/api/v1/auth/register` | Register a new user account |
| `POST` | `/api/v1/auth/refresh` | Refresh access token via cookie |
| `DELETE` | `/api/v1/auth/sessions/[id]` | Revoke a specific session |

### Jobs
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/jobs` | List jobs (filtered by role) |
| `POST` | `/api/v1/jobs` | Create a new job posting |
| `PATCH` | `/api/v1/jobs/[id]` | Update a job |
| `POST` | `/api/v1/jobs/[id]/close` | Close a job to new applicants |
| `POST` | `/api/v1/jobs/[id]/duplicate` | Duplicate a job posting |

### Applications & Pipeline
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/applications` | List applications (role-filtered) |
| `POST` | `/api/v1/applications` | Submit a new application |
| `PATCH` | `/api/v1/applications/[id]` | Advance pipeline stage |

### Assessments
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/assessments` | List available assessments |
| `POST` | `/api/v1/assessments` | Create an assessment |
| `POST` | `/api/v1/assessments/attempts` | Start an attempt |
| `PATCH` | `/api/v1/assessments/attempts/[id]` | Submit answers |

---

## 🌐 Deployment

### Option A: Vercel + Supabase (Recommended)

1. Push your code to GitHub
2. Create a free PostgreSQL database at [Supabase](https://supabase.com/) and copy the **Transaction Pooler** connection string (port `6543`)
3. Import your repository at [Vercel](https://vercel.com/) and set these environment variables:

   | Key | Value |
   |-----|-------|
   | `DATABASE_URL` | Your Supabase Transaction Pooler URL |
   | `JWT_ACCESS_SECRET` | Any random secure string |
   | `JWT_REFRESH_SECRET` | Any random secure string |
   | `GEMINI_API_KEY` | Your Google AI Studio key |
   | `NODE_ENV` | `production` |

4. Seed the production database from your local machine:
   ```bash
   # Temporarily set DATABASE_URL to the Supabase URL in your .env
   npx prisma db push
   npx prisma db seed
   # Revert .env back to localhost
   ```

### Option B: Docker (Self-Hosted)

```bash
# Clone the repository
git clone https://github.com/Tvaibhav06/ATS_platform.git
cd ATS_platform

# Start all services
docker-compose up --build -d

# Seed the database
docker-compose exec web npx prisma db seed
```

The application will be available at `http://localhost:3000`.

---

## 🔒 Security

TalentFlow implements multiple layers of security:

- **JWT Authentication**: Short-lived access tokens (15 min) are passed in the `Authorization` header. Long-lived refresh tokens (7 days) are stored in `HttpOnly`, `Secure`, `SameSite=Lax` cookies, preventing XSS access.
- **Password Security**: All passwords are hashed with `bcrypt` at 10 cost factor before storage. Raw passwords are never logged or stored.
- **Server-side RBAC**: Every API route independently verifies the user's role from the verified JWT payload. Roles are never trusted from the client.
- **Audit Logging**: Every significant action (application stage change, login, offer sent) creates an immutable `ActivityLog` record with timestamp, actor, and metadata.
- **File Security**: Uploaded resumes are hash-verified (SHA-256) to prevent duplicate uploads. File access is gated behind signed URLs.
- **Input Validation**: All API request bodies are validated with **Zod** schemas before processing.

---

## 📄 License

```
MIT License

Copyright (c) 2026 Vaibhav Tandon

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

<div align="center">
[MIT License](./LICENSE)

</div>
