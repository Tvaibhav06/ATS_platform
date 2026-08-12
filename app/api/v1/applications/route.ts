import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { generateMatchAnalysis } from '@/lib/ai/matcher'

export async function POST(req: Request) {
  try {
    const userId = req.headers.get('x-user-id')
    const userRole = req.headers.get('x-user-role')

    if (!userId || userRole !== 'CANDIDATE') {
      return NextResponse.json({ success: false, error: { message: 'Unauthorized. Only candidates can apply.' } }, { status: 403 })
    }

    const body = await req.json()
    const { jobId } = body

    if (!jobId) {
      return NextResponse.json({ success: false, error: { message: 'Missing jobId' } }, { status: 400 })
    }

    // 1. Verify Job exists and is open
    const job = await prisma.job.findUnique({ where: { id: jobId } })
    if (!job) {
      return NextResponse.json({ success: false, error: { message: 'Job not found' } }, { status: 404 })
    }
    if (job.status !== 'OPEN') {
      return NextResponse.json({ success: false, error: { message: 'Job is not open for applications' } }, { status: 400 })
    }

    // 2. Ensure Candidate Profile exists (Application creation is not blocked by missing AI parsing)
    const profile = await prisma.candidateProfile.findUnique({
      where: { userId },
      include: { resumes: { orderBy: { uploadedAt: 'desc' }, take: 1, include: { analysis: true } } }
    })

    if (!profile) {
      return NextResponse.json({ success: false, error: { message: 'Candidate profile not found' } }, { status: 400 })
    }

    // 3. Prevent Duplicate Applications
    const existingApplication = await prisma.application.findUnique({
      where: {
        candidateId_jobId: { candidateId: userId, jobId }
      }
    })

    if (existingApplication) {
      return NextResponse.json({ success: false, error: { message: 'You have already applied for this job' } }, { status: 409 })
    }

    // 4. Create Application (Always succeeds regardless of AI status)
    const application = await prisma.application.create({
      data: {
        candidateId: userId,
        jobId: jobId,
        stage: 'APPLIED',
        source: 'DIRECT'
      }
    })

    // 5. Initialize Match Analysis
    await prisma.matchAnalysis.create({
      data: {
        applicationId: application.id,
        status: 'PENDING'
      }
    })

    // 6. Execute AI Matcher Synchronously (as approved for Checkpoint 4)
    // In production, this would be pushed to an async queue like SQS/Redis
    let aiTriggered = false;
    const latestResume = profile.resumes[0];

    if (latestResume && latestResume.analysis) {
      // Fire and await the matching logic
      aiTriggered = true;
      // We do not await this heavily or we risk the client timing out if we want true async, 
      // but PS-Strict Checkpoint 4 allows synchronous processing for demo.
      // So we will await it here so the response contains the result.
      await generateMatchAnalysis(application.id, jobId, latestResume.id);
    } else {
      // Mark as failed if no resume analysis exists to match against
      await prisma.matchAnalysis.update({
        where: { applicationId: application.id },
        data: { status: 'FAILED' }
      })
    }

    // Refetch the application to return the final state
    const finalApplication = await prisma.application.findUnique({
      where: { id: application.id },
      include: { matchAnalysis: true }
    });

    return NextResponse.json({ 
      success: true, 
      data: finalApplication 
    })

  } catch (error) {
    console.error('Error applying for job:', error)
    return NextResponse.json({ success: false, error: { message: 'Internal Server Error' } }, { status: 500 })
  }
}
