import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { verifyAuth } from '@/lib/auth'

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await verifyAuth(request)
    if (!auth) return NextResponse.json({ success: false, error: { message: 'Unauthorized' } }, { status: 401 })

    if (auth.role !== 'RECRUITER' && auth.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: { message: 'Forbidden' } }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const { status } = body

    if (!['SCHEDULED', 'COMPLETED', 'CANCELLED'].includes(status)) {
      return NextResponse.json({ success: false, error: { message: 'Invalid status' } }, { status: 400 })
    }

    const interview = await prisma.interview.findUnique({
      where: { id },
      include: { application: { include: { job: true } } }
    })

    if (!interview) {
      return NextResponse.json({ success: false, error: { message: 'Interview not found' } }, { status: 404 })
    }

    const actingUser = await prisma.user.findUnique({ where: { id: auth.userId } })
    if (auth.role === 'RECRUITER' && actingUser?.companyId !== interview.application.job.companyId) {
      return NextResponse.json({ success: false, error: { message: 'Forbidden' } }, { status: 403 })
    }

    const updated = await prisma.interview.update({
      where: { id },
      data: { status }
    })

    return NextResponse.json({ success: true, data: updated }, { status: 200 })
  } catch (error: any) {
    console.error('Update interview error:', error)
    return NextResponse.json({ success: false, error: { message: error.message || 'Internal Server Error' } }, { status: 500 })
  }
}
