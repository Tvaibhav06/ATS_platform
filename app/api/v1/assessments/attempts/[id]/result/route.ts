import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { getSessionUser } from '@/lib/jwt'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await getSessionUser(request)
    if (!auth) return NextResponse.json({ success: false, error: { message: 'Unauthorized' } }, { status: 401 })

    const { id } = await params
    
    const attempt = await prisma.assessmentAttempt.findUnique({
      where: { id },
      include: {
        assessment: { include: { job: true } },
        answers: { include: { question: true } } // wait, question relation might not be defined explicitly like that. Let's rely on raw fields
      }
    })

    if (!attempt) {
      return NextResponse.json({ success: false, error: { message: 'Attempt not found' } }, { status: 404 })
    }

    // Auth check
    const actingUser = await prisma.user.findUnique({ where: { id: auth.userId } })
    const isCandidate = attempt.candidateId === auth.userId
    const isAdmin = auth.role === 'ADMIN'
    const isRecruiter = auth.role === 'RECRUITER' && attempt.assessment.job?.companyId === actingUser?.companyId
    const isHM = auth.role === 'HIRING_MANAGER' && attempt.assessment.job?.companyId === actingUser?.companyId

    if (!isCandidate && !isAdmin && !isRecruiter && !isHM) {
      return NextResponse.json({ success: false, error: { message: 'Forbidden' } }, { status: 403 })
    }

    return NextResponse.json({ success: true, data: attempt }, { status: 200 })
  } catch (error: any) {
    console.error('Get result error:', error)
    return NextResponse.json({ success: false, error: { message: error.message || 'Internal Server Error' } }, { status: 500 })
  }
}
