import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { getSessionUser } from '@/lib/jwt'

export async function GET(request: NextRequest) {
  try {
    const auth = await getSessionUser(request)
    if (!auth || auth.role !== 'ADMIN') return NextResponse.json({ success: false, error: { message: 'Forbidden' } }, { status: 403 })

    const totalUsers = await prisma.user.count()
    const totalCompanies = await prisma.company.count()
    const totalJobs = await prisma.job.count()
    const totalApplications = await prisma.application.count()
    const totalAssessments = await prisma.assessment.count()

    // Example of a report: daily application volume for the last 7 days (mocked as simple total for hackathon)
    const platformReport = {
      summary: {
        totalUsers,
        totalCompanies,
        totalJobs,
        totalApplications,
        totalAssessments
      },
      // You could generate a CSV here or more detailed JSON depending on query params
    }

    return NextResponse.json({ success: true, data: platformReport }, { status: 200 })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { message: 'Server Error' } }, { status: 500 })
  }
}
