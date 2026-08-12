import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { updateJobSchema } from '@/lib/schemas/jobs'
import { z } from 'zod'

// Helper to check resource ownership
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

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const job = await prisma.job.findUnique({
      where: { id, deletedAt: null },
      include: { company: true }
    })

    if (!job) return NextResponse.json({ success: false, error: { message: 'Job not found' } }, { status: 404 })

    const parsedJob = {
      ...job,
      skillsRequired: JSON.parse(job.skillsRequired),
      skillsPreferred: JSON.parse(job.skillsPreferred),
    }

    return NextResponse.json({ success: true, data: parsedJob })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ success: false, error: { message: 'Internal Server Error' } }, { status: 500 })
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
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

    const body = await req.json()
    const parsed = updateJobSchema.parse(body)
    
    const updateData: any = { ...parsed }
    if (parsed.skillsRequired) updateData.skillsRequired = JSON.stringify(parsed.skillsRequired)
    if (parsed.skillsPreferred) updateData.skillsPreferred = JSON.stringify(parsed.skillsPreferred)
    if (parsed.deadline) updateData.deadline = new Date(parsed.deadline)

    const updatedJob = await prisma.job.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json({ success: true, data: updatedJob })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: { message: 'Validation failed', details: error.errors } }, { status: 400 })
    }
    console.error(error)
    return NextResponse.json({ success: false, error: { message: 'Internal Server Error' } }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
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

    // Soft delete
    await prisma.job.update({
      where: { id },
      data: { deletedAt: new Date(), status: 'CLOSED' }
    })

    return NextResponse.json({ success: true, message: 'Job deleted successfully' })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ success: false, error: { message: 'Internal Server Error' } }, { status: 500 })
  }
}
