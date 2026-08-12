import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import {
  validateMagicBytes,
  calculateFileHash,
  extractTextFromResume
} from '@/lib/resume-parser'
import { resumeStorage } from '@/lib/storage'
import { extractStructuredResumeData } from '@/lib/ai/extractor'
import { aiResumeAnalysisSchema } from '@/lib/schemas/resume'

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED_TYPES = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

export async function POST(req: Request) {
  try {
    const userId = req.headers.get('x-user-id')
    const userRole = req.headers.get('x-user-role')

    if (!userId || userRole !== 'CANDIDATE') {
      return NextResponse.json({ success: false, error: { message: 'Unauthorized. Only candidates can upload resumes.' } }, { status: 403 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ success: false, error: { message: 'No file provided' } }, { status: 400 })
    }

    // 1. Basic Validation (Size & MIME)
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ success: false, error: { message: 'File exceeds 10MB limit' } }, { status: 400 })
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ success: false, error: { message: 'Invalid file type. Only PDF and DOCX are allowed.' } }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())

    // 2. Magic-Byte Validation
    if (!validateMagicBytes(buffer, file.type)) {
      return NextResponse.json({ success: false, error: { message: 'File content does not match its extension' } }, { status: 400 })
    }

    // 3. Ensure Candidate Profile exists
    let profile = await prisma.candidateProfile.findUnique({ where: { userId } })
    if (!profile) {
      profile = await prisma.candidateProfile.create({ data: { userId } })
    }

    // 4. Duplicate Check via Hash
    const fileHash = calculateFileHash(buffer)
    const existingResume = await prisma.resume.findUnique({
      where: { candidateProfileId_fileHash: { candidateProfileId: profile.id, fileHash } }
    })

    if (existingResume) {
      return NextResponse.json({ success: false, error: { message: 'This resume has already been uploaded' } }, { status: 409 })
    }

    // 5. Secure Storage via Abstraction
    const fileUrl = await resumeStorage.save(buffer, file.name)

    // 6. Persist initial Resume record (PARSING state)
    const resume = await prisma.resume.create({
      data: {
        candidateProfileId: profile.id,
        fileUrl,
        fileHash,
        fileName: file.name,
        fileSizeBytes: file.size,
        fileType: file.type === 'application/pdf' ? 'PDF' : 'DOCX',
        status: 'PARSING'
      }
    })

    // 7. Resume Processing Pipeline (Text Extraction -> AI Structuring)
    // Normally, this might be handled via an async queue (e.g. BullMQ) or Webhook so the HTTP request isn't blocked.
    // For this checkpoint, we'll process it synchronously.
    
    try {
      const extractedText = await extractTextFromResume(buffer, file.type)
      
      const aiDataRaw = await extractStructuredResumeData(extractedText)
      const parsedAiData = aiResumeAnalysisSchema.parse(aiDataRaw)

      // 8. Persist ResumeAnalysis
      await prisma.resumeAnalysis.create({
        data: {
          resumeId: resume.id,
          extractedName: parsedAiData.extractedName,
          extractedEmail: parsedAiData.extractedEmail,
          extractedPhone: parsedAiData.extractedPhone,
          skills: parsedAiData.skills ? JSON.stringify(parsedAiData.skills) : null,
          education: parsedAiData.education ? JSON.stringify(parsedAiData.education) : null,
          experience: parsedAiData.experience ? JSON.stringify(parsedAiData.experience) : null,
          projects: parsedAiData.projects ? JSON.stringify(parsedAiData.projects) : null,
          certifications: parsedAiData.certifications ? JSON.stringify(parsedAiData.certifications) : null,
          languages: parsedAiData.languages ? JSON.stringify(parsedAiData.languages) : null,
          totalExperienceYears: parsedAiData.totalExperienceYears,
          rawModelResponse: JSON.stringify(aiDataRaw)
        }
      })

      // Update Resume status to PARSED
      await prisma.resume.update({
        where: { id: resume.id },
        data: { status: 'PARSED' }
      })

      // 9. Auto-fill Candidate Profile (Only overwrite empty fields)
      const profileUpdate: any = {}
      if (!profile.phone && parsedAiData.extractedPhone) profileUpdate.phone = parsedAiData.extractedPhone
      if (!profile.skills && parsedAiData.skills) profileUpdate.skills = JSON.stringify(parsedAiData.skills)
      if (!profile.education && parsedAiData.education) profileUpdate.education = JSON.stringify(parsedAiData.education)
      if (!profile.experience && parsedAiData.experience) profileUpdate.experience = JSON.stringify(parsedAiData.experience)
      if (!profile.certifications && parsedAiData.certifications) profileUpdate.certifications = JSON.stringify(parsedAiData.certifications)

      if (Object.keys(profileUpdate).length > 0) {
        await prisma.candidateProfile.update({
          where: { id: profile.id },
          data: profileUpdate
        })
      }

      return NextResponse.json({ success: true, message: 'Resume uploaded and parsed successfully', data: { resumeId: resume.id } })

    } catch (parseError) {
      console.error('Resume processing pipeline failed:', parseError)
      
      // Update Resume status to FAILED
      await prisma.resume.update({
        where: { id: resume.id },
        data: { status: 'FAILED' }
      })

      // We still return 201 because the upload succeeded, but parsing failed.
      return NextResponse.json({ 
        success: true, 
        message: 'Resume uploaded but parsing failed',
        data: { resumeId: resume.id, error: 'Extraction pipeline failed' }
      }, { status: 201 })
    }

  } catch (error) {
    console.error('Upload Error:', error)
    return NextResponse.json({ success: false, error: { message: 'Internal Server Error' } }, { status: 500 })
  }
}
