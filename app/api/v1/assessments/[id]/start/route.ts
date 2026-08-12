import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { getSessionUser } from '@/lib/jwt'

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await getSessionUser(request)
    if (!auth) return NextResponse.json({ success: false, error: { message: 'Unauthorized' } }, { status: 401 })

    if (auth.role !== 'CANDIDATE') {
      return NextResponse.json({ success: false, error: { message: 'Forbidden: Only candidates can start assessments' } }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const { applicationId } = body

    if (!applicationId) {
      return NextResponse.json({ success: false, error: { message: 'Missing applicationId' } }, { status: 400 })
    }

    const assessment = await prisma.assessment.findUnique({
      where: { id }
    })

    if (!assessment) {
      return NextResponse.json({ success: false, error: { message: 'Assessment not found' } }, { status: 404 })
    }

    const application = await prisma.application.findUnique({
      where: { id: applicationId }
    })

    if (!application || application.candidateId !== auth.userId) {
      return NextResponse.json({ success: false, error: { message: 'Forbidden' } }, { status: 403 })
    }

    // Check if attempt already exists
    const existingAttempt = await prisma.assessmentAttempt.findFirst({
      where: { assessmentId: id, applicationId }
    })

    if (existingAttempt) {
      return NextResponse.json({ success: false, error: { message: 'Assessment attempt already exists' } }, { status: 409 })
    }

    const now = new Date()
    const deadlineAt = new Date(now.getTime() + assessment.durationMinutes * 60000)

    const attempt = await prisma.assessmentAttempt.create({
      data: {
        assessmentId: id,
        applicationId,
        candidateId: auth.userId,
        startedAt: now,
        deadlineAt: deadlineAt,
        status: 'IN_PROGRESS'
      }
    })

    return NextResponse.json({ success: true, data: attempt }, { status: 201 })
  } catch (error: any) {
    console.error('Start assessment error:', error)
    return NextResponse.json({ success: false, error: { message: error.message || 'Internal Server Error' } }, { status: 500 })
  }
}
