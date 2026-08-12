import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { getSessionUser } from '@/lib/jwt'

export async function POST(request: NextRequest) {
  try {
    const auth = await getSessionUser(request)
    if (!auth) return NextResponse.json({ success: false, error: { message: 'Unauthorized' } }, { status: 401 })

    if (auth.role !== 'RECRUITER' && auth.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: { message: 'Forbidden' } }, { status: 403 })
    }

    const body = await request.json()
    const { title, instructions, type, durationMinutes, jobId } = body

    if (!title || !type || durationMinutes === undefined || !jobId) {
      return NextResponse.json({ success: false, error: { message: 'Missing required assessment fields' } }, { status: 400 })
    }

    const actingUser = await prisma.user.findUnique({ where: { id: auth.userId } })
    
    // Verify job authorization if jobId provided
    if (jobId) {
      const job = await prisma.job.findUnique({ where: { id: jobId } })
      if (!job || (actingUser?.companyId !== job.companyId && auth.role !== 'ADMIN')) {
        return NextResponse.json({ success: false, error: { message: 'Forbidden: You do not have access to this job' } }, { status: 403 })
      }
    }

    const assessment = await prisma.assessment.create({
      data: {
        title,
        instructions,
        type,
        durationMinutes,
        jobId,
        status: 'DRAFT',
        createdBy: auth.userId
      }
    })

    return NextResponse.json({ success: true, data: assessment }, { status: 201 })
  } catch (error: any) {
    console.error('Create assessment error:', error)
    return NextResponse.json({ success: false, error: { message: error.message || 'Internal Server Error' } }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const auth = await getSessionUser(request)
    if (!auth) return NextResponse.json({ success: false, error: { message: 'Unauthorized' } }, { status: 401 })

    let assessments = []
    
    if (auth.role === 'ADMIN') {
      assessments = await prisma.assessment.findMany({ include: { questions: true } })
    } else if (auth.role === 'RECRUITER') {
      const actingUser = await prisma.user.findUnique({ where: { id: auth.userId } })
      assessments = await prisma.assessment.findMany({
        where: { job: { companyId: actingUser?.companyId } },
        include: { questions: true }
      })
    } else if (auth.role === 'CANDIDATE') {
      // Candidates only see published assessments attached to jobs they applied for?
      // Actually candidates usually see it via their attempts.
      assessments = await prisma.assessment.findMany({
        where: { attempts: { some: { candidateId: auth.userId } } }
      })
    } else {
      return NextResponse.json({ success: false, error: { message: 'Forbidden' } }, { status: 403 })
    }

    return NextResponse.json({ success: true, data: assessments }, { status: 200 })
  } catch (error: any) {
    console.error('Get assessments error:', error)
    return NextResponse.json({ success: false, error: { message: error.message || 'Internal Server Error' } }, { status: 500 })
  }
}
