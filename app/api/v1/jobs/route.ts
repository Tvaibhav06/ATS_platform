import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { jobSchema } from '@/lib/schemas/jobs'
import { z } from 'zod'

// GET: List jobs (Public or specific to recruiter based on query)
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const companyId = searchParams.get('companyId')
    const status = searchParams.get('status')
    
    // Support filtering
    const where: any = { deletedAt: null }
    if (companyId) where.companyId = companyId
    if (status) where.status = status

    const jobs = await prisma.job.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        company: { select: { name: true, logoUrl: true } }
      }
    })

    // Deserialize JSON fields (stored as strings in SQLite/PostgreSQL for simple schema)
    const parsedJobs = jobs.map(job => ({
      ...job,
      skillsRequired: JSON.parse(job.skillsRequired),
      skillsPreferred: JSON.parse(job.skillsPreferred),
    }))

    return NextResponse.json({ success: true, data: parsedJobs })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ success: false, error: { message: 'Internal Server Error' } }, { status: 500 })
  }
}

// POST: Create a new Job (Recruiter / Hiring Manager / Admin only)
export async function POST(req: Request) {
  try {
    // Role/User extraction from headers (set by middleware)
    const userId = req.headers.get('x-user-id')
    const userRole = req.headers.get('x-user-role')

    if (!userId || !['RECRUITER', 'ADMIN'].includes(userRole || '')) {
      return NextResponse.json({ success: false, error: { message: 'Forbidden: Insufficient permissions' } }, { status: 403 })
    }

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user?.companyId) {
      return NextResponse.json({ success: false, error: { message: 'User is not associated with a company' } }, { status: 400 })
    }

    const body = await req.json()
    const parsed = jobSchema.parse(body)

    const job = await prisma.job.create({
      data: {
        title: parsed.title,
        department: parsed.department,
        location: parsed.location,
        salaryMin: parsed.salaryMin,
        salaryMax: parsed.salaryMax,
        experienceRequired: parsed.experienceRequired,
        skillsRequired: JSON.stringify(parsed.skillsRequired),
        skillsPreferred: JSON.stringify(parsed.skillsPreferred),
        employmentType: parsed.employmentType,
        workMode: parsed.workMode,
        deadline: parsed.deadline ? new Date(parsed.deadline) : null,
        description: parsed.description,
        status: parsed.status,
        companyId: user.companyId,
        recruiterId: user.id,
      }
    })

    return NextResponse.json({ success: true, data: job }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: { message: 'Validation failed', details: error.errors } }, { status: 400 })
    }
    console.error(error)
    return NextResponse.json({ success: false, error: { message: 'Internal Server Error' } }, { status: 500 })
  }
}
