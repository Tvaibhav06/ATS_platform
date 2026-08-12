import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { verifyAuth } from '@/lib/auth'
import { sendNotification } from '@/lib/notifications'

export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAuth(request)
    if (!auth) return NextResponse.json({ success: false, error: { message: 'Unauthorized' } }, { status: 401 })

    if (auth.role !== 'RECRUITER' && auth.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: { message: 'Forbidden' } }, { status: 403 })
    }

    const body = await request.json()
    const { applicationId, interviewerId, type, scheduledAt, meetingLink } = body

    if (!applicationId || !interviewerId || !type || !scheduledAt) {
      return NextResponse.json({ success: false, error: { message: 'Missing required fields' } }, { status: 400 })
    }

    // Verify application and job authorization
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: { job: true, candidate: true }
    })

    if (!application) {
      return NextResponse.json({ success: false, error: { message: 'Application not found' } }, { status: 404 })
    }

    const actingUser = await prisma.user.findUnique({ where: { id: auth.userId } })
    if (auth.role === 'RECRUITER' && actingUser?.companyId !== application.job.companyId) {
      return NextResponse.json({ success: false, error: { message: 'Forbidden: You do not have access to this application' } }, { status: 403 })
    }

    // Verify interviewer belongs to same company
    const interviewer = await prisma.user.findUnique({ where: { id: interviewerId } })
    if (!interviewer || interviewer.companyId !== application.job.companyId || (interviewer.role !== 'INTERVIEWER' && interviewer.role !== 'HIRING_MANAGER')) {
      return NextResponse.json({ success: false, error: { message: 'Invalid interviewer' } }, { status: 400 })
    }

    const interview = await prisma.interview.create({
      data: {
        applicationId,
        interviewerId,
        type,
        scheduledAt: new Date(scheduledAt),
        meetingLink,
        status: 'SCHEDULED'
      }
    })

    // Create Notification and trigger mock email/calendar invite
    await sendNotification(
      application.candidateId,
      'INTERVIEW_INVITATION',
      `Interview Scheduled: ${application.job.title}`,
      `Your ${type} interview is scheduled for ${new Date(scheduledAt).toLocaleString()}.`,
      true, // send email
      { meetingLink } // attach calendar context
    )
    
    // Notify Interviewer
    await sendNotification(
      interviewerId,
      'INTERVIEW_INVITATION',
      `You have been assigned to interview ${application.candidate.name || 'a candidate'}`,
      `Interview type: ${type} at ${new Date(scheduledAt).toLocaleString()}.`,
      true,
      { meetingLink }
    )

    return NextResponse.json({ success: true, data: interview }, { status: 201 })
  } catch (error: any) {
    console.error('Create interview error:', error)
    return NextResponse.json({ success: false, error: { message: error.message || 'Internal Server Error' } }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuth(request)
    if (!auth) return NextResponse.json({ success: false, error: { message: 'Unauthorized' } }, { status: 401 })

    const actingUser = await prisma.user.findUnique({ where: { id: auth.userId } })
    if (!actingUser) return NextResponse.json({ success: false, error: { message: 'User not found' } }, { status: 404 })

    let interviews = []

    if (auth.role === 'INTERVIEWER') {
      // Interviewer can ONLY see interviews assigned to them
      interviews = await prisma.interview.findMany({
        where: { interviewerId: auth.userId },
        include: { application: { include: { job: true, candidate: { select: { id: true, name: true, email: true } } } } },
        orderBy: { scheduledAt: 'desc' }
      })
    } else if (auth.role === 'RECRUITER' || auth.role === 'HIRING_MANAGER') {
      // Recruiter/HM sees all interviews in their company
      interviews = await prisma.interview.findMany({
        where: { application: { job: { companyId: actingUser.companyId } } },
        include: { application: { include: { job: true, candidate: { select: { id: true, name: true, email: true } } } }, interviewer: { select: { id: true, name: true, email: true } } },
        orderBy: { scheduledAt: 'desc' }
      })
    } else if (auth.role === 'ADMIN') {
      interviews = await prisma.interview.findMany({
        include: { application: true },
        orderBy: { scheduledAt: 'desc' }
      })
    } else if (auth.role === 'CANDIDATE') {
       interviews = await prisma.interview.findMany({
        where: { application: { candidateId: auth.userId } },
        include: { application: { include: { job: true } } },
        orderBy: { scheduledAt: 'desc' }
      })
    }

    return NextResponse.json({ success: true, data: interviews }, { status: 200 })
  } catch (error: any) {
    console.error('Get interviews error:', error)
    return NextResponse.json({ success: false, error: { message: error.message || 'Internal Server Error' } }, { status: 500 })
  }
}
