import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { getSessionUser } from '@/lib/jwt'

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await getSessionUser(request)
    if (!auth) return NextResponse.json({ success: false, error: { message: 'Unauthorized' } }, { status: 401 })

    const { id } = await params
    
    const attempt = await prisma.assessmentAttempt.findUnique({
      where: { id },
      include: {
        assessment: { include: { questions: { include: { options: true } } } },
        answers: true
      }
    })

    if (!attempt || attempt.candidateId !== auth.userId) {
      return NextResponse.json({ success: false, error: { message: 'Attempt not found or forbidden' } }, { status: 404 })
    }

    if (attempt.status !== 'IN_PROGRESS') {
      return NextResponse.json({ success: false, error: { message: 'Assessment already submitted' } }, { status: 400 })
    }

    // Evaluate answers
    let totalScore = 0
    let evaluatedAnswers = 0

    for (const answer of attempt.answers) {
      const question = attempt.assessment.questions.find(q => q.id === answer.questionId)
      if (!question) continue

      let score = 0
      let executionResult = null

      if (question.type === 'MCQ') {
        const selectedOption = question.options.find(o => o.id === answer.answerText || o.text === answer.answerText)
        if (selectedOption?.isCorrect) {
          score = question.points
        }
      } else {
        // Lightweight mock evaluation for CODING/SQL/DEBUGGING
        // In a real app, this would queue a job to a sandbox worker
        score = question.points * 0.8 // Dummy 80% score for non-MCQ for hackathon
        executionResult = JSON.stringify({ output: 'Mock execution successful', status: 'pass' })
      }

      await prisma.assessmentAnswer.update({
        where: { id: answer.id },
        data: { score, executionResult }
      })
      
      totalScore += score
      evaluatedAnswers++
    }

    const now = new Date()
    const autoSubmitted = now > attempt.deadlineAt

    const finalAttempt = await prisma.assessmentAttempt.update({
      where: { id },
      data: {
        status: autoSubmitted ? 'AUTO_SUBMITTED' : 'COMPLETED',
        submittedAt: autoSubmitted ? attempt.deadlineAt : now,
        autoSubmitted,
        score: totalScore
      }
    })

    return NextResponse.json({ success: true, data: finalAttempt }, { status: 200 })
  } catch (error: any) {
    console.error('Submit assessment error:', error)
    return NextResponse.json({ success: false, error: { message: error.message || 'Internal Server Error' } }, { status: 500 })
  }
}
