import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { resumeStorage } from '@/lib/storage'

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = req.headers.get('x-user-id')
    const userRole = req.headers.get('x-user-role')
    const { id } = await params

    if (!userId || !userRole) {
      return NextResponse.json({ success: false, error: { message: 'Unauthorized' } }, { status: 401 })
    }

    const resume = await prisma.resume.findUnique({
      where: { id },
      include: {
        candidateProfile: {
          include: {
            user: true
          }
        }
      }
    })

    if (!resume) {
      return NextResponse.json({ success: false, error: { message: 'Resume not found' } }, { status: 404 })
    }

    // Resource Authorization Logic
    let isAuthorized = false;

    if (userRole === 'ADMIN') {
      isAuthorized = true;
    } else if (userRole === 'CANDIDATE') {
      // Candidate can only access their own resume
      if (resume.candidateProfile.userId === userId) {
        isAuthorized = true;
      }
    } else if (['RECRUITER', 'HIRING_MANAGER', 'INTERVIEWER'].includes(userRole)) {
      // For ATS internal roles, check if the candidate has applied to a job in their company
      const actingUser = await prisma.user.findUnique({ where: { id: userId } })
      
      if (actingUser?.companyId) {
        const applications = await prisma.application.findMany({
          where: {
            candidateId: resume.candidateProfile.userId,
            job: {
              companyId: actingUser.companyId
            }
          },
          take: 1
        })
        
        if (applications.length > 0) {
          isAuthorized = true;
        }
      }
    }

    if (!isAuthorized) {
      return NextResponse.json({ success: false, error: { message: 'Forbidden: You do not have access to this resume' } }, { status: 403 })
    }

    // Fetch the file from abstract storage
    const fileBuffer = await resumeStorage.get(resume.fileUrl)

    if (!fileBuffer) {
      return NextResponse.json({ success: false, error: { message: 'File is missing or corrupted on storage backend' } }, { status: 500 })
    }

    // Determine content type based on extension
    const contentType = resume.fileUrl.endsWith('.pdf') 
      ? 'application/pdf' 
      : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

    // Stream the file back
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `inline; filename="${resume.fileName}"`,
        'Cache-Control': 'private, max-age=3600'
      }
    })

  } catch (error) {
    console.error('Error fetching resume:', error)
    return NextResponse.json({ success: false, error: { message: 'Internal Server Error' } }, { status: 500 })
  }
}
