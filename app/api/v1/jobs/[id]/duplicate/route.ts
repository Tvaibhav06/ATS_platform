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
    if (ownership.error || !ownership.job) {
      return NextResponse.json({ success: false, error: { message: ownership.error } }, { status: ownership.status || 404 })
    }

    const { job } = ownership

    // Duplicate the job but as a DRAFT
    const duplicatedJob = await prisma.job.create({
      data: {
        title: `${job.title} (Copy)`,
        department: job.department,
        location: job.location,
        salaryMin: job.salaryMin,
        salaryMax: job.salaryMax,
        experienceRequired: job.experienceRequired,
        skillsRequired: job.skillsRequired,
        skillsPreferred: job.skillsPreferred,
        employmentType: job.employmentType,
        workMode: job.workMode,
        description: job.description,
        status: 'DRAFT',
        companyId: job.companyId,
        recruiterId: userId, // Current user becomes the recruiter of the duplicate
      }
    })

    return NextResponse.json({ success: true, data: duplicatedJob }, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ success: false, error: { message: 'Internal Server Error' } }, { status: 500 })
  }
}
