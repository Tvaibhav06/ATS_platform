import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

const VALID_STAGES = [
  'APPLIED',
  'RESUME_SCREENING',
  'SHORTLISTED',
  'TECHNICAL_INTERVIEW',
  'HR_INTERVIEW',
  'OFFER',
  'HIRED',
  'REJECTED'
]

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = req.headers.get('x-user-id')
    const userRole = req.headers.get('x-user-role')
    const { id } = await params

    if (!userId || !userRole) {
      return NextResponse.json({ success: false, error: { message: 'Unauthorized' } }, { status: 401 })
    }

    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        job: true,
        matchAnalysis: true,
        candidate: {
          select: {
            id: true,
            name: true,
            email: true,
            profile: {
              include: {
                resumes: {
                  orderBy: { uploadedAt: 'desc' },
                  take: 1
                }
              }
            }
          }
        }
      }
    })

    if (!application) {
      return NextResponse.json({ success: false, error: { message: 'Application not found' } }, { status: 404 })
    }

    // Authorization
    if (userRole === 'CANDIDATE') {
      if (application.candidateId !== userId) {
        return NextResponse.json({ success: false, error: { message: 'Forbidden' } }, { status: 403 })
      }
    } else if (userRole === 'RECRUITER' || userRole === 'HIRING_MANAGER') {
      const actingUser = await prisma.user.findUnique({ where: { id: userId } })
      if (!actingUser || actingUser.companyId !== application.job.companyId) {
        return NextResponse.json({ success: false, error: { message: 'Forbidden' } }, { status: 403 })
      }
    } else if (userRole !== 'ADMIN') {
      // Interviewer logic would go here if needed later (more restricted fields)
      return NextResponse.json({ success: false, error: { message: 'Forbidden' } }, { status: 403 })
    }

    return NextResponse.json({ success: true, data: application })
  } catch (error) {
    console.error('Error fetching application:', error)
    return NextResponse.json({ success: false, error: { message: 'Internal Server Error' } }, { status: 500 })
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = req.headers.get('x-user-id')
    const userRole = req.headers.get('x-user-role')
    const { id } = await params

    if (!userId || !userRole) {
      return NextResponse.json({ success: false, error: { message: 'Unauthorized' } }, { status: 401 })
    }

    const body = await req.json()
    const { stage } = body

    if (!stage || !VALID_STAGES.includes(stage)) {
      return NextResponse.json({ success: false, error: { message: 'Invalid or missing stage' } }, { status: 400 })
    }

    const application = await prisma.application.findUnique({
      where: { id },
      include: { job: true }
    })

    if (!application) {
      return NextResponse.json({ success: false, error: { message: 'Application not found' } }, { status: 404 })
    }

    // Authorization: Only Recruiter or Admin can change stage
    if (userRole === 'RECRUITER') {
      if (application.job.recruiterId !== userId) {
        return NextResponse.json({ success: false, error: { message: 'Forbidden: You do not own this job' } }, { status: 403 })
      }
    } else if (userRole !== 'ADMIN') {
      return NextResponse.json({ success: false, error: { message: 'Forbidden: Only Recruiters or Admins can change application stages' } }, { status: 403 })
    }

    const updatedApplication = await prisma.application.update({
      where: { id },
      data: { stage }
    })

    return NextResponse.json({ success: true, data: updatedApplication })

  } catch (error) {
    console.error('Error updating application stage:', error)
    return NextResponse.json({ success: false, error: { message: 'Internal Server Error' } }, { status: 500 })
  }
}
