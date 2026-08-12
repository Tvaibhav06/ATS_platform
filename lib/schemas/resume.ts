import { z } from 'zod'

export const candidateProfileSchema = z.object({
  phone: z.string().optional(),
  location: z.string().optional(),
  education: z.array(z.string()).optional(),
  experience: z.array(z.string()).optional(),
  skills: z.array(z.string()).optional(),
  certifications: z.array(z.string()).optional(),
  portfolioUrl: z.string().url().optional().or(z.literal('')),
  githubUrl: z.string().url().optional().or(z.literal('')),
  linkedinUrl: z.string().url().optional().or(z.literal('')),
  coverLetterText: z.string().optional(),
})

export const aiResumeAnalysisSchema = z.object({
  extractedName: z.string().optional(),
  extractedEmail: z.string().email().optional(),
  extractedPhone: z.string().optional(),
  skills: z.array(z.string()).optional(),
  education: z.array(z.string()).optional(),
  experience: z.array(z.string()).optional(),
  projects: z.array(z.string()).optional(),
  certifications: z.array(z.string()).optional(),
  languages: z.array(z.string()).optional(),
  totalExperienceYears: z.number().optional(),
})
