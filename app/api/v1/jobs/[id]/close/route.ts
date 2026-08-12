import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

async function checkJobOwnership(jobId: string, userId: string, userRole: string) {
  const job = await prisma.job.findUnique({ where: { id: jobId } })
  if (!job || job.deletedAt) return { error: 'Job not found', status: 404 }
  
  if (userRole === 'ADMIN') return { job }
  
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (job.companyId !== user?.companyId) {
    return { error: 'Forbidden: You do not have permission to modify this company\'s job', status: 403 }
  }
  
  return { job }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = req.headers.get('x-user-id')
    const userRole = req.headers.get('x-user-role')
    const { id } = await params

    if (!userId || !['RECRUITER', 'ADMIN'].includes(userRole || '')) {
      return NextResponse.json({ success: false, error: { message: 'Unauthorized or insufficient permissions' } }, { status: 403 })
    }

    const ownership = await checkJobOwnership(id, userId, userRole)
    if (ownership.error) {
      return NextResponse.json({ success: false, error: { message: ownership.error } }, { status: ownership.status })
    }

    const updatedJob = await prisma.job.update({
      where: { id },
      data: { status: 'CLOSED' }
    })

    return NextResponse.json({ success: true, data: updatedJob })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ success: false, error: { message: 'Internal Server Error' } }, { status: 500 })
  }
}
