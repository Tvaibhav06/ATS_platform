import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { verifyAuth } from '@/lib/auth'

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await verifyAuth(request)
    if (!auth) return NextResponse.json({ success: false, error: { message: 'Unauthorized' } }, { status: 401 })

    const { id } = await params
    const interview = await prisma.interview.findUnique({
      where: { id },
      include: { application: { include: { job: true } } }
    })

    if (!interview) {
      return NextResponse.json({ success: false, error: { message: 'Interview not found' } }, { status: 404 })
    }

    // Only assigned INTERVIEWER or an ADMIN can submit feedback for it. (Usually just the assigned interviewer).
    if (auth.role !== 'ADMIN' && (auth.role !== 'INTERVIEWER' || interview.interviewerId !== auth.userId)) {
      return NextResponse.json({ success: false, error: { message: 'Forbidden: You are not authorized to submit feedback for this interview' } }, { status: 403 })
    }

    const body = await request.json()
    const { technicalScore, communicationScore, problemSolvingScore, teamworkScore, leadershipScore, overallRating, comments } = body

    // Validation (PS requires these exact fields)
    if (technicalScore === undefined || communicationScore === undefined || problemSolvingScore === undefined || teamworkScore === undefined || leadershipScore === undefined || overallRating === undefined) {
      return NextResponse.json({ success: false, error: { message: 'Missing required scorecard dimensions' } }, { status: 400 })
    }

    const feedback = await prisma.feedback.create({
      data: {
        interviewId: id,
        interviewerId: auth.userId,
        technicalScore,
        communicationScore,
        problemSolvingScore,
        teamworkScore,
        leadershipScore,
        overallRating,
        comments
      }
    })

    // Implicitly mark interview as COMPLETED if feedback is submitted
    await prisma.interview.update({
      where: { id },
      data: { status: 'COMPLETED' }
    })

    return NextResponse.json({ success: true, data: feedback }, { status: 201 })
  } catch (error: any) {
    console.error('Submit feedback error:', error)
    if (error.code === 'P2002') {
      return NextResponse.json({ success: false, error: { message: 'Feedback already submitted for this interview by this interviewer' } }, { status: 409 })
    }
    return NextResponse.json({ success: false, error: { message: error.message || 'Internal Server Error' } }, { status: 500 })
  }
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await verifyAuth(request)
    if (!auth) return NextResponse.json({ success: false, error: { message: 'Unauthorized' } }, { status: 401 })

    const { id } = await params
    const interview = await prisma.interview.findUnique({
      where: { id },
      include: { application: { include: { job: true } } }
    })

    if (!interview) {
      return NextResponse.json({ success: false, error: { message: 'Interview not found' } }, { status: 404 })
    }

    const actingUser = await prisma.user.findUnique({ where: { id: auth.userId } })
    if (actingUser?.companyId !== interview.application.job.companyId && auth.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: { message: 'Forbidden' } }, { status: 403 })
    }

    // Candidate cannot see feedbacks.
    if (auth.role === 'CANDIDATE') {
      return NextResponse.json({ success: false, error: { message: 'Forbidden' } }, { status: 403 })
    }

    const feedbacks = await prisma.feedback.findMany({
      where: { interviewId: id }
    })

    return NextResponse.json({ success: true, data: feedbacks }, { status: 200 })
  } catch (error: any) {
    console.error('Get feedback error:', error)
    return NextResponse.json({ success: false, error: { message: error.message || 'Internal Server Error' } }, { status: 500 })
  }
}
