import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { generateMatchAnalysis } from '@/lib/ai/matcher'

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = req.headers.get('x-user-id')
    const userRole = req.headers.get('x-user-role')
    const { id } = await params

    if (!userId || !userRole) {
      return NextResponse.json({ success: false, error: { message: 'Unauthorized' } }, { status: 401 })
    }

    // 1. Fetch Application
    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        job: true,
        candidate: {
          include: {
            profile: {
              include: {
                resumes: {
                  orderBy: { uploadedAt: 'desc' },
                  take: 1,
                  include: { analysis: true }
                }
              }
            }
          }
        }
      }
    })

    if (!application) {
      return NextResponse.json({ success: false, error: { message: 'Application not found' } }, { status: 404 })
    }

    // 2. Authorization (Recruiter owning the job, or Admin)
    if (userRole === 'RECRUITER') {
      if (application.job.recruiterId !== userId) {
        return NextResponse.json({ success: false, error: { message: 'Forbidden: You do not own this job' } }, { status: 403 })
      }
    } else if (userRole !== 'ADMIN') {
      return NextResponse.json({ success: false, error: { message: 'Forbidden' } }, { status: 403 })
    }

    // 3. Validate Candidate Data
    const latestResume = application.candidate.profile?.resumes[0];
    if (!latestResume || !latestResume.analysis) {
      return NextResponse.json({ success: false, error: { message: 'Candidate has no parsed resume analysis to match against' } }, { status: 400 })
    }

    // 4. Update Status to PENDING
    await prisma.matchAnalysis.upsert({
      where: { applicationId: application.id },
      update: { status: 'PENDING' },
      create: { applicationId: application.id, status: 'PENDING' }
    })

    // 5. Execute Matcher
    const success = await generateMatchAnalysis(application.id, application.jobId, latestResume.id);

    // 6. Return Result
    const finalMatch = await prisma.matchAnalysis.findUnique({ where: { applicationId: application.id } })

    return NextResponse.json({ 
      success: true, 
      data: finalMatch 
    })

  } catch (error) {
    console.error('Error retrying match analysis:', error)
    return NextResponse.json({ success: false, error: { message: 'Internal Server Error' } }, { status: 500 })
  }
}
