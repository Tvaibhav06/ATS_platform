import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { getSessionUser } from '@/lib/jwt'

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await getSessionUser(request)
    if (!auth) return NextResponse.json({ success: false, error: { message: 'Unauthorized' } }, { status: 401 })

    if (auth.role !== 'CANDIDATE') {
      return NextResponse.json({ success: false, error: { message: 'Forbidden' } }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const { questionId, answerText, language, isTabSwitch } = body

    const attempt = await prisma.assessmentAttempt.findUnique({
      where: { id }
    })

    if (!attempt || attempt.candidateId !== auth.userId) {
      return NextResponse.json({ success: false, error: { message: 'Attempt not found or forbidden' } }, { status: 404 })
    }

    if (attempt.status !== 'IN_PROGRESS') {
      return NextResponse.json({ success: false, error: { message: 'Assessment is no longer in progress' } }, { status: 400 })
    }

    const now = new Date()
    if (now > attempt.deadlineAt) {
      // Auto-submit if past deadline
      await prisma.assessmentAttempt.update({
        where: { id },
        data: { status: 'AUTO_SUBMITTED', submittedAt: attempt.deadlineAt, autoSubmitted: true }
      })
      return NextResponse.json({ success: false, error: { message: 'Deadline passed. Assessment auto-submitted.' } }, { status: 403 })
    }

    if (isTabSwitch) {
      // Just record tab switch
      await prisma.assessmentAttempt.update({
        where: { id },
        data: { tabSwitchCount: { increment: 1 } }
      })
      return NextResponse.json({ success: true, data: { message: 'Tab switch recorded' } })
    }

    if (!questionId || !answerText) {
      return NextResponse.json({ success: false, error: { message: 'Missing questionId or answerText' } }, { status: 400 })
    }

    // Upsert answer
    const answer = await prisma.assessmentAnswer.findFirst({
      where: { attemptId: id, questionId }
    })

    if (answer) {
      await prisma.assessmentAnswer.update({
        where: { id: answer.id },
        data: { answerText, language, submittedAt: new Date() }
      })
    } else {
      await prisma.assessmentAnswer.create({
        data: {
          attemptId: id,
          questionId,
          answerText,
          language
        }
      })
    }

    return NextResponse.json({ success: true, data: { message: 'Answer saved' } }, { status: 200 })
  } catch (error: any) {
    console.error('Answer assessment error:', error)
    return NextResponse.json({ success: false, error: { message: error.message || 'Internal Server Error' } }, { status: 500 })
  }
}
