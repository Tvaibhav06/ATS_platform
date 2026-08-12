import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({
    openapi: "3.0.3",
    info: { title: "TalentFlow ATS API", version: "1.0.0" },
    paths: {
      "/api/v1/auth/login": { post: { summary: "Email/password login" } },
      "/api/v1/jobs": { get: { summary: "Search jobs" }, post: { summary: "Create job (Recruiter/Admin)" } },
      "/api/v1/applications": { post: { summary: "Apply to a job (Candidate)" } },
      "/api/v1/assessments/{id}/start": { post: { summary: "Start assessment (Candidate)" } },
      "/api/v1/offers": { post: { summary: "Create offer (Recruiter/Admin)" } },
    },
  });
}
