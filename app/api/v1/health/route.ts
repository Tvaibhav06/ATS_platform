import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({
    success: true,
    data: { service: "talentflow-ats", status: "ok", mode: "demo", version: "v1" },
  });
}
