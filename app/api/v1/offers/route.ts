import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { verifyAuth } from '@/lib/auth'
import { generateOfferLetterPdf } from '@/lib/pdf'
import { sendNotification } from '@/lib/notifications'

export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAuth(request)
    if (!auth) return NextResponse.json({ success: false, error: { message: 'Unauthorized' } }, { status: 401 })

    if (auth.role !== 'RECRUITER' && auth.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: { message: 'Forbidden' } }, { status: 403 })
    }

    const body = await request.json()
    const { applicationId, candidateName, role, salary, joiningDate, location, benefits } = body

    if (!applicationId || !candidateName || !role || !salary || !joiningDate || !location) {
      return NextResponse.json({ success: false, error: { message: 'Missing required offer fields' } }, { status: 400 })
    }

    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: { job: { include: { company: true } }, candidate: true }
    })

    if (!application) {
      return NextResponse.json({ success: false, error: { message: 'Application not found' } }, { status: 404 })
    }

    const actingUser = await prisma.user.findUnique({ where: { id: auth.userId } })
    if (auth.role === 'RECRUITER' && actingUser?.companyId !== application.job.companyId) {
      return NextResponse.json({ success: false, error: { message: 'Forbidden' } }, { status: 403 })
    }

    // Generate PDF base64
    const pdfBase64 = await generateOfferLetterPdf({
      candidateName,
      role,
      salary,
      joiningDate: new Date(joiningDate),
      location,
      benefits,
      companyName: application.job.company.name
    })

    const pdfBuffer = Buffer.from(pdfBase64.replace(/^data:application\/pdf;base64,/, ''), 'base64')
    const { resumeStorage } = await import('@/lib/storage')
    const pdfUrl = await resumeStorage.save(pdfBuffer, `Offer_${candidateName.replace(/\s+/g, '_')}.pdf`)

    const offer = await prisma.offerLetter.create({
      data: {
        applicationId,
        candidateName,
        role,
        salary,
        joiningDate: new Date(joiningDate),
        location,
        benefits,
        status: 'SENT',
        pdfUrl: pdfUrl,
        sentAt: new Date()
      }
    })

    // Advance application stage
    await prisma.application.update({
      where: { id: applicationId },
      data: { stage: 'OFFER' }
    })

    // Notify Candidate
    await sendNotification(
      application.candidateId,
      'OFFER_ISSUED',
      `Congratulations! You have received an offer for ${role}`,
      `An offer letter has been generated for you by ${application.job.company.name}. Please log in to your portal to review and accept/reject it.`,
      true,
      { offerPdf: true }
    )

    return NextResponse.json({ success: true, data: offer }, { status: 201 })
  } catch (error: any) {
    console.error('Create offer error:', error)
    if (error.code === 'P2002') {
      return NextResponse.json({ success: false, error: { message: 'An offer letter already exists for this application' } }, { status: 409 })
    }
    return NextResponse.json({ success: false, error: { message: error.message || 'Internal Server Error' } }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuth(request)
    if (!auth) return NextResponse.json({ success: false, error: { message: 'Unauthorized' } }, { status: 401 })

    const actingUser = await prisma.user.findUnique({ where: { id: auth.userId } })
    if (!actingUser) return NextResponse.json({ success: false, error: { message: 'User not found' } }, { status: 404 })

    let offers = []

    if (auth.role === 'CANDIDATE') {
      offers = await prisma.offerLetter.findMany({
        where: { application: { candidateId: auth.userId } },
        include: { application: { include: { job: { include: { company: true } } } } }
      })
    } else if (auth.role === 'RECRUITER' || auth.role === 'HIRING_MANAGER') {
      offers = await prisma.offerLetter.findMany({
        where: { application: { job: { companyId: actingUser.companyId } } },
        include: { application: { include: { job: { include: { company: true } }, candidate: { select: { id: true, name: true, email: true } } } } }
      })
    } else if (auth.role === 'ADMIN') {
      offers = await prisma.offerLetter.findMany({
        include: { application: { include: { job: true, candidate: true } } }
      })
    }

    return NextResponse.json({ success: true, data: offers }, { status: 200 })
  } catch (error: any) {
    console.error('Get offers error:', error)
    return NextResponse.json({ success: false, error: { message: error.message || 'Internal Server Error' } }, { status: 500 })
  }
}
