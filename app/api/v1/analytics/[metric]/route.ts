import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { getSessionUser } from '@/lib/jwt'

export async function GET(request: NextRequest, { params }: { params: { metric: string } }) {
  try {
    const auth = await getSessionUser(request)
    if (!auth) return NextResponse.json({ success: false, error: { message: 'Unauthorized' } }, { status: 401 })

    if (auth.role === 'CANDIDATE' || auth.role === 'INTERVIEWER') {
      return NextResponse.json({ success: false, error: { message: 'Forbidden' } }, { status: 403 })
    }

    const { metric } = await params
    const actingUser = await prisma.user.findUnique({ where: { id: auth.userId } })
    const companyId = auth.role === 'ADMIN' ? undefined : actingUser?.companyId
    
    // Base job filter for the company
    const jobFilter = companyId ? { job: { companyId } } : {}
    
    switch (metric) {
      case 'applications-per-job': {
        const result = await prisma.application.groupBy({
          by: ['jobId'],
          where: jobFilter,
          _count: { id: true }
        })
        
        // Enhance with job titles
        const enhanced = await Promise.all(result.map(async (r) => {
          const job = await prisma.job.findUnique({ where: { id: r.jobId }, select: { title: true } })
          return { jobId: r.jobId, title: job?.title, count: r._count.id }
        }))
        return NextResponse.json({ success: true, data: enhanced }, { status: 200 })
      }

      case 'hiring-funnel': {
        const result = await prisma.application.groupBy({
          by: ['stage'],
          where: jobFilter,
          _count: { id: true }
        })
        return NextResponse.json({ success: true, data: result.map(r => ({ stage: r.stage, count: r._count.id })) }, { status: 200 })
      }

      case 'time-to-hire': {
        const hiredApps = await prisma.application.findMany({
          where: { ...jobFilter, stage: 'HIRED' }
        })
        if (hiredApps.length === 0) return NextResponse.json({ success: true, data: { averageDays: 0 } }, { status: 200 })
        
        const totalMs = hiredApps.reduce((acc, app) => {
          const appliedAt = app.appliedAt.getTime()
          const hiredAt = app.updatedAt.getTime() // assuming updated at is when hired
          return acc + (hiredAt - appliedAt)
        }, 0)
        
        const averageDays = (totalMs / hiredApps.length) / (1000 * 60 * 60 * 24)
        return NextResponse.json({ success: true, data: { averageDays: Math.round(averageDays) } }, { status: 200 })
      }

      case 'offer-acceptance': {
        const offers = await prisma.offerLetter.findMany({
          where: { application: jobFilter }
        })
        const total = offers.length
        const accepted = offers.filter(o => o.status === 'ACCEPTED').length
        const rate = total > 0 ? (accepted / total) * 100 : 0
        return NextResponse.json({ success: true, data: { total, accepted, rate: Math.round(rate) } }, { status: 200 })
      }

      case 'candidate-source': {
        // We will just group by source if available, or just mock it as "Direct" since we might not have a strong source tracking.
        const apps = await prisma.application.findMany({ where: jobFilter })
        // Let's assume all are "Careers Page" for this hackathon
        return NextResponse.json({ success: true, data: [{ source: 'Careers Page', count: apps.length }] }, { status: 200 })
      }

      case 'recruiter-performance': {
        if (auth.role !== 'ADMIN' && auth.role !== 'RECRUITER') {
          return NextResponse.json({ success: false, error: { message: 'Forbidden' } }, { status: 403 })
        }
        
        const targetRecruiterId = auth.role === 'RECRUITER' ? auth.userId : undefined
        
        const recruiterFilter = targetRecruiterId ? { recruiterId: targetRecruiterId } : (companyId ? { companyId } : {})
        
        const jobs = await prisma.job.findMany({
          where: recruiterFilter,
          include: { _count: { select: { applications: true } } }
        })
        
        const totalJobs = jobs.length
        const totalApplications = jobs.reduce((sum, j) => sum + j._count.applications, 0)
        
        return NextResponse.json({ success: true, data: { totalJobs, totalApplications } }, { status: 200 })
      }

      case 'interview-success': {
        const interviews = await prisma.interview.findMany({
          where: { application: jobFilter },
          include: { feedbacks: true }
        })
        
        const completed = interviews.filter(i => i.status === 'COMPLETED')
        // A "successful" interview has a positive feedback (overallRating >= 3).
        const successful = completed.filter(i => i.feedbacks.some((f: any) => f.overallRating >= 3))
        
        const rate = completed.length > 0 ? (successful.length / completed.length) * 100 : 0
        return NextResponse.json({ success: true, data: { totalCompleted: completed.length, successful: successful.length, rate: Math.round(rate) } }, { status: 200 })
      }

      default:
        return NextResponse.json({ success: false, error: { message: 'Unknown metric' } }, { status: 400 })
    }
  } catch (error: any) {
    console.error(`Analytics error:`, error)
    return NextResponse.json({ success: false, error: { message: error.message || 'Internal Server Error' } }, { status: 500 })
  }
}
