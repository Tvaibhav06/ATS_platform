import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { candidateProfileSchema } from '@/lib/schemas/resume'
import { z } from 'zod'

// GET: Retrieve the authenticated candidate's profile
export async function GET(req: Request) {
  try {
    const userId = req.headers.get('x-user-id')
    const userRole = req.headers.get('x-user-role')

    if (!userId) {
      return NextResponse.json({ success: false, error: { message: 'Unauthorized' } }, { status: 401 })
    }

    // Recruiters and Hiring Managers might access a specific candidate profile via a different route (e.g. /api/v1/candidates/[id]), 
    // but this route is specifically for the authenticated user's own profile.
    
    let profile = await prisma.candidateProfile.findUnique({
      where: { userId },
      include: {
        resumes: {
          include: { analysis: true },
          orderBy: { uploadedAt: 'desc' }
        },
        user: { select: { email: true, name: true, avatarUrl: true } }
      }
    })

    if (!profile) {
      // Auto-provision if missing
      profile = await prisma.candidateProfile.create({
        data: { userId },
        include: {
          resumes: { include: { analysis: true } },
          user: { select: { email: true, name: true, avatarUrl: true } }
        }
      })
    }

    // Parse JSON strings back to arrays
    const parsedProfile = {
      ...profile,
      education: profile.education ? JSON.parse(profile.education) : [],
      experience: profile.experience ? JSON.parse(profile.experience) : [],
      skills: profile.skills ? JSON.parse(profile.skills) : [],
      certifications: profile.certifications ? JSON.parse(profile.certifications) : [],
    }

    return NextResponse.json({ success: true, data: parsedProfile })
  } catch (error) {
    console.error('Error fetching profile:', error)
    return NextResponse.json({ success: false, error: { message: 'Internal Server Error' } }, { status: 500 })
  }
}

// PATCH: Update the authenticated candidate's profile
export async function PATCH(req: Request) {
  try {
    const userId = req.headers.get('x-user-id')

    if (!userId) {
      return NextResponse.json({ success: false, error: { message: 'Unauthorized' } }, { status: 401 })
    }

    const body = await req.json()
    const parsed = candidateProfileSchema.parse(body)

    // Convert arrays to JSON strings
    const updateData: any = { ...parsed }
    if (parsed.education !== undefined) updateData.education = JSON.stringify(parsed.education)
    if (parsed.experience !== undefined) updateData.experience = JSON.stringify(parsed.experience)
    if (parsed.skills !== undefined) updateData.skills = JSON.stringify(parsed.skills)
    if (parsed.certifications !== undefined) updateData.certifications = JSON.stringify(parsed.certifications)

    // Ensure profile exists first
    let profile = await prisma.candidateProfile.findUnique({ where: { userId } })
    if (!profile) {
      profile = await prisma.candidateProfile.create({ data: { userId } })
    }

    const updatedProfile = await prisma.candidateProfile.update({
      where: { userId },
      data: updateData
    })

    // Calculate generic profile completion percentage (mocked logic based on filled fields)
    let filledFields = 0
    const fieldsToCheck = ['phone', 'location', 'education', 'experience', 'skills', 'portfolioUrl', 'githubUrl']
    fieldsToCheck.forEach(field => {
      if ((updatedProfile as any)[field] && (updatedProfile as any)[field] !== '[]') filledFields++
    })
    const completion = Math.round((filledFields / fieldsToCheck.length) * 100)

    if (updatedProfile.profileCompletion !== completion) {
      await prisma.candidateProfile.update({
        where: { userId },
        data: { profileCompletion: completion }
      })
      updatedProfile.profileCompletion = completion
    }

    return NextResponse.json({ success: true, data: updatedProfile })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: { message: 'Validation failed', details: error.errors } }, { status: 400 })
    }
    console.error('Error updating profile:', error)
    return NextResponse.json({ success: false, error: { message: 'Internal Server Error' } }, { status: 500 })
  }
}
