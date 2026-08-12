import { z } from 'zod'

export const aiMatchAnalysisSchema = z.object({
  match_score: z.number().min(0).max(100).describe('A score from 0 to 100 representing how well the candidate matches the job requirements.'),
  strengths: z.array(z.string()).describe('Key areas where the candidate excels relative to the job description.'),
  matched_skills: z.array(z.string()).describe('Specific skills from the job description that the candidate possesses.'),
  missing_skills: z.array(z.string()).describe('Specific skills required or preferred by the job that are missing from the resume.'),
  weak_areas: z.array(z.string()).describe('Areas of concern or gaps in experience relative to the job requirements.'),
  experience_alignment: z.string().describe('A brief explanation of how the candidate\'s past experience aligns with the role\'s expected responsibilities.'),
  recommendation: z.enum(['GOOD_FIT', 'POTENTIAL_FIT', 'WEAK_FIT']).describe('Advisory recommendation for the recruiter. GOOD_FIT for strong matches, POTENTIAL_FIT for borderline cases, WEAK_FIT for poor matches.')
})

export type AiMatchAnalysis = z.infer<typeof aiMatchAnalysisSchema>
