import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { verifyAuth } from '@/lib/auth'
import { sendNotification } from '@/lib/notifications'

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await verifyAuth(request)
    if (!auth) return NextResponse.json({ success: false, error: { message: 'Unauthorized' } }, { status: 401 })

    // Only candidates can accept/reject their own offers
    if (auth.role !== 'CANDIDATE') {
      return NextResponse.json({ success: false, error: { message: 'Forbidden' } }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const { status } = body

    if (!['ACCEPTED', 'REJECTED'].includes(status)) {
      return NextResponse.json({ success: false, error: { message: 'Invalid status. Must be ACCEPTED or REJECTED.' } }, { status: 400 })
    }

    const offer = await prisma.offerLetter.findUnique({
      where: { id },
      include: { application: { include: { job: { include: { company: true } }, candidate: true } } }
    })

    if (!offer) {
      return NextResponse.json({ success: false, error: { message: 'Offer not found' } }, { status: 404 })
    }

    if (offer.application.candidateId !== auth.userId) {
      return NextResponse.json({ success: false, error: { message: 'Forbidden: You cannot modify this offer' } }, { status: 403 })
    }

    if (offer.status !== 'SENT' && offer.status !== 'DRAFT') {
      return NextResponse.json({ success: false, error: { message: 'Offer has already been responded to' } }, { status: 400 })
    }

    const updated = await prisma.offerLetter.update({
      where: { id },
      data: { status, respondedAt: new Date() }
    })

    const appStage = status === 'ACCEPTED' ? 'HIRED' : 'REJECTED'
    
    // Advance application state machine
    await prisma.application.update({
      where: { id: offer.applicationId },
      data: { stage: appStage, hiredAt: status === 'ACCEPTED' ? new Date() : null }
    })

    if (status === 'ACCEPTED') {
      // Notify Recruiter
      await sendNotification(
        offer.application.job.recruiterId,
        'APPLICATION_STATUS_CHANGE',
        `Offer Accepted: ${offer.candidateName}`,
        `${offer.candidateName} has accepted the offer for ${offer.role}.`,
        true
      )
      
      // Notify Candidate with joining instructions
      await sendNotification(
        auth.userId,
        'JOINING_INSTRUCTIONS',
        `Welcome to ${offer.application.job.company.name}!`,
        `We are excited to have you join us on ${new Date(offer.joiningDate).toLocaleDateString()}. HR will reach out with onboarding details soon.`,
        true
      )
    }

    return NextResponse.json({ success: true, data: updated }, { status: 200 })
  } catch (error: any) {
    console.error('Update offer error:', error)
    return NextResponse.json({ success: false, error: { message: error.message || 'Internal Server Error' } }, { status: 500 })
  }
}
