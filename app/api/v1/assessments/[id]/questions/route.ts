import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { getSessionUser } from '@/lib/jwt'

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await getSessionUser(request)
    if (!auth) return NextResponse.json({ success: false, error: { message: 'Unauthorized' } }, { status: 401 })

    if (auth.role !== 'RECRUITER' && auth.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: { message: 'Forbidden' } }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const { type, prompt, difficulty, points, orderIndex, options } = body

    if (!type || !prompt || points === undefined) {
      return NextResponse.json({ success: false, error: { message: 'Missing required question fields' } }, { status: 400 })
    }

    if (!['MCQ', 'CODING', 'SQL', 'DEBUGGING'].includes(type)) {
      return NextResponse.json({ success: false, error: { message: 'Invalid question type' } }, { status: 400 })
    }

    const assessment = await prisma.assessment.findUnique({
      where: { id },
      include: { job: true }
    })

    if (!assessment) {
      return NextResponse.json({ success: false, error: { message: 'Assessment not found' } }, { status: 404 })
    }

    const actingUser = await prisma.user.findUnique({ where: { id: auth.userId } })
    if (auth.role === 'RECRUITER' && assessment.job && actingUser?.companyId !== assessment.job.companyId) {
      return NextResponse.json({ success: false, error: { message: 'Forbidden' } }, { status: 403 })
    }

    // Prepare create payload
    const questionData: any = {
      assessmentId: id,
      type,
      prompt,
      difficulty,
      points,
      orderIndex: orderIndex || 0
    }

    if (type === 'MCQ' && options && Array.isArray(options)) {
      questionData.options = {
        create: options.map((opt: any) => ({
          text: opt.text,
          isCorrect: opt.isCorrect || false
        }))
      }
    }

    const question = await prisma.assessmentQuestion.create({
      data: questionData,
      include: { options: true }
    })

    return NextResponse.json({ success: true, data: question }, { status: 201 })
  } catch (error: any) {
    console.error('Create assessment question error:', error)
    return NextResponse.json({ success: false, error: { message: error.message || 'Internal Server Error' } }, { status: 500 })
  }
}
