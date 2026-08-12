import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = req.headers.get('x-user-id')
    const userRole = req.headers.get('x-user-role')
    const { id: jobId } = await params

    if (!userId || !userRole) {
      return NextResponse.json({ success: false, error: { message: 'Unauthorized' } }, { status: 401 })
    }

    // Candidate should not access this
    if (userRole === 'CANDIDATE') {
      return NextResponse.json({ success: false, error: { message: 'Forbidden' } }, { status: 403 })
    }

    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: { company: true }
    })

    if (!job) {
      return NextResponse.json({ success: false, error: { message: 'Job not found' } }, { status: 404 })
    }

    // Authorization: RECRUITER or HIRING_MANAGER must belong to the same company
    if (userRole === 'RECRUITER' || userRole === 'HIRING_MANAGER') {
      const actingUser = await prisma.user.findUnique({ where: { id: userId } })
      if (!actingUser || actingUser.companyId !== job.companyId) {
        return NextResponse.json({ success: false, error: { message: 'Forbidden: You do not have access to this job\'s applications' } }, { status: 403 })
      }
    } else if (userRole !== 'ADMIN') {
      return NextResponse.json({ success: false, error: { message: 'Forbidden' } }, { status: 403 })
    }

    // Fetch applications with MatchAnalysis and Candidate basic details
    const applications = await prisma.application.findMany({
      where: { jobId },
      include: {
        matchAnalysis: true,
        candidate: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
            profile: {
              select: {
                location: true
              }
            }
          }
        }
      },
      orderBy: { appliedAt: 'desc' }
    })

    return NextResponse.json({ success: true, data: applications })

  } catch (error) {
    console.error('Error fetching applications for job:', error)
    return NextResponse.json({ success: false, error: { message: 'Internal Server Error' } }, { status: 500 })
  }
}
